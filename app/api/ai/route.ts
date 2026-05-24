import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/cache";
import { generateAiReport } from "@/lib/ai";
import { AIRequestLog } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = await rateLimit(`ai:${tenant.organizationId}:${tenant.userId}`, 20, 60 * 60);
  if (!limited.allowed) return NextResponse.json({ error: "AI rate limit reached" }, { status: 429 });

  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await request.json() : Object.fromEntries((await request.formData()).entries());
  const { mode, ...input } = body;
  const result = await generateAiReport(input, mode);

  await AIRequestLog.create({
    organizationId: objectId(tenant.organizationId),
    userId: objectId(tenant.userId),
    projectId: input.projectId ? objectId(input.projectId) : undefined,
    feature: mode || "AI report",
    provider: result.configured ? "configured-provider" : "none",
    status: result.configured ? "generated" : "missing-api-key",
    input,
    output: result
  });

  return NextResponse.json({ data: result });
}
