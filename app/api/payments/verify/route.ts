import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayLog } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { verifyCashfreePayment, verifyRazorpaySignature } from "@/lib/payments";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const gateway = body.gateway || "razorpay";
  const verified =
    gateway === "razorpay"
      ? verifyRazorpaySignature({ orderId: body.orderId, paymentId: body.paymentId, signature: body.signature })
      : await verifyCashfreePayment(body.orderId);

  await PaymentGatewayLog.create({
    organizationId: objectId(tenant.organizationId),
    gateway,
    direction: "inbound",
    event: "verify-payment",
    status: verified ? "verified" : "failed",
    request: body,
    response: verified,
    signatureValid: Boolean(verified)
  });

  return NextResponse.json({ data: { verified } });
}
