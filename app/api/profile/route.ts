import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { Organization, User } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  designation: z.string().max(80).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(240).optional().or(z.literal("")),
  organizationName: z.string().min(2).optional(),
  gstNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal(""))
});

function isLocalProfileImage(imageUrl: string | undefined) {
  return Boolean(imageUrl && imageUrl.startsWith("/uploads/profiles/"));
}

async function deleteOldLocalProfileImage(imageUrl: string | undefined) {
  if (!isLocalProfileImage(imageUrl)) return;

  try {
    const fileName = path.basename(imageUrl || "");
    const filePath = path.join(process.cwd(), "public", "uploads", "profiles", fileName);
    await unlink(filePath);
  } catch {
    // Ignore cleanup failure. Do not block profile update.
  }
}

async function saveProfileImage(file: File, oldImageUrl?: string) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image size must be below 5 MB.");
  }

  const extension = allowedImageTypes.get(file.type);
  const fileName = `${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
  const filePath = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);
  await deleteOldLocalProfileImage(oldImageUrl);

  return `/uploads/profiles/${fileName}`;
}

export async function PATCH(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const imageFile = formData.get("imageFile");

  const body = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const user = await User.findOne({
    _id: objectId(tenant.userId),
    deletedAt: null
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates = parsed.data;

  if (updates.name) user.name = updates.name;
  if (updates.phone !== undefined) user.phone = updates.phone;
  if (updates.designation !== undefined) user.designation = updates.designation;
  if (updates.location !== undefined) user.location = updates.location;
  if (updates.bio !== undefined) user.bio = updates.bio;

  if (imageFile instanceof File && imageFile.size > 0) {
    user.image = await saveProfileImage(imageFile, user.image);
  } else if (updates.image !== undefined) {
    if (!updates.image) {
      await deleteOldLocalProfileImage(user.image);
      user.image = undefined;
    } else {
      user.image = updates.image;
    }
  }

  if (updates.newPassword) {
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password update is only available for email/password accounts." },
        { status: 400 }
      );
    }

    if (!updates.currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 422 });
    }

    const valid = await bcrypt.compare(updates.currentPassword, user.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
    }

    user.passwordHash = await bcrypt.hash(updates.newPassword, 12);
  }

  await user.save();

  if (["Super Admin", "Organization Owner", "Owner"].includes(tenant.role)) {
    await Organization.updateOne(
      {
        _id: objectId(tenant.organizationId),
        deletedAt: null
      },
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

  return NextResponse.json({
    data: {
      ok: true,
      image: user.image || ""
    }
  });
}