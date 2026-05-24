import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/payments";
import { PaymentGatewayLog } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const result = await createPaymentOrder({
    amount: Number(body.amount || 0),
    receipt: body.receipt || `co-${Date.now()}`,
    notes: body.notes
  });

  await PaymentGatewayLog.create({
    organizationId: objectId(tenant.organizationId),
    gateway: result.gateway,
    direction: "outbound",
    event: "create-order",
    status: "created",
    request: body,
    response: result.order
  });

  return NextResponse.json({ data: result });
}
