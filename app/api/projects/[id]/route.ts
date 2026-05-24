import { NextRequest, NextResponse } from "next/server";
import { cacheDel } from "@/lib/cache";
import { objectId } from "@/lib/data-access";
import { Project } from "@/lib/db/models";
import { getTenantContext } from "@/lib/tenant";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await Project.findOne({ _id: id, organizationId: objectId(tenant.organizationId), deletedAt: null }).lean();
  return project ? NextResponse.json({ data: JSON.parse(JSON.stringify(project)) }) : NextResponse.json({ error: "Project not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const project = await Project.findOneAndUpdate(
    { _id: id, organizationId: objectId(tenant.organizationId), deletedAt: null },
    { ...body, updatedBy: objectId(tenant.userId) },
    { new: true }
  ).lean();
  await cacheDel(`dashboard:${tenant.organizationId}*`);
  return project ? NextResponse.json({ data: JSON.parse(JSON.stringify(project)) }) : NextResponse.json({ error: "Project not found" }, { status: 404 });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await Project.findOneAndUpdate(
    { _id: id, organizationId: objectId(tenant.organizationId), deletedAt: null },
    { deletedAt: new Date(), updatedBy: objectId(tenant.userId) }
  );
  await cacheDel(`dashboard:${tenant.organizationId}*`);
  return NextResponse.json({ data: { id, deletedAt: new Date().toISOString() } });
}
