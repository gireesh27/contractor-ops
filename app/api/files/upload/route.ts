import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || tenant.organizationId);
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  try {
    const uploaded = await uploadFile(file, folder);
    return NextResponse.json({ data: uploaded }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 422 });
  }
}
