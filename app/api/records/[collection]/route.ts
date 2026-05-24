import { NextRequest, NextResponse } from "next/server";
import { cacheDel } from "@/lib/cache";
import { collectionModels, type CollectionName } from "@/lib/db/models";
import { createRecord, listRecords } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

interface Params {
  params: Promise<{ collection: string }>;
}

function isCollection(value: string): value is CollectionName {
  return value in collectionModels;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { collection } = await params;
  if (!isCollection(collection)) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await listRecords(collection, tenant.organizationId, {
    projectId: request.nextUrl.searchParams.get("projectId") || undefined,
    status: request.nextUrl.searchParams.get("status") || undefined
  });

  return NextResponse.json({ data: records, databaseReady: tenant.databaseReady });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { collection } = await params;
  if (!isCollection(collection)) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";
  const payload =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

  try {
    const record = await createRecord(collection, tenant.organizationId, tenant.userId, payload);
    await cacheDel(`dashboard:${tenant.organizationId}*`);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save record" }, { status: 400 });
  }
}
