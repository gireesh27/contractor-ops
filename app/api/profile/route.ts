import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Organization, User } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  organizationName: z.string().min(2).optional(),
  gstNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal(""))
});

export async function PATCH(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = Object.fromEntries((await request.formData()).entries());
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const user = await User.findOne({ _id: objectId(tenant.userId), deletedAt: null });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updates = parsed.data;
  if (updates.name) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.image !== undefined) user.image = updates.image || undefined;

  if (updates.newPassword) {
    if (!user.passwordHash) return NextResponse.json({ error: "Password update is only available for email/password accounts." }, { status: 400 });
    if (!updates.currentPassword) return NextResponse.json({ error: "Current password is required." }, { status: 422 });
    const valid = await bcrypt.compare(updates.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    user.passwordHash = await bcrypt.hash(updates.newPassword, 12);
  }
  await user.save();

  if (["Super Admin", "Organization Owner", "Owner"].includes(tenant.role)) {
    await Organization.updateOne(
      { _id: objectId(tenant.organizationId), deletedAt: null },
      {
        $set: {
          ...(updates.organizationName ? { name: updates.organizationName } : {}),
          ...(updates.gstNumber !== undefined ? { gstNumber: updates.gstNumber } : {}),
          ...(updates.city !== undefined ? { city: updates.city } : {}),
          ...(updates.state !== undefined ? { state: updates.state } : {})
        }
      }
    );
  }

  return NextResponse.json({ data: { ok: true } });
}
