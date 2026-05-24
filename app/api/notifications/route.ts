import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export async function GET() {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await Notification.find({ organizationId: objectId(tenant.organizationId), deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return NextResponse.json({ data: JSON.parse(JSON.stringify(notifications)) });
}

export async function PATCH(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await Notification.updateMany(
    { organizationId: objectId(tenant.organizationId), _id: { $in: body.ids || [] } },
    { readAt: new Date() }
  );
  return NextResponse.json({ data: { ok: true } });
}
