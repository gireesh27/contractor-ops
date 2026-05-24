import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/payments";
import { Bill, Payment, PaymentGatewayLog } from "@/lib/db/models";
import { objectId, isObjectId } from "@/lib/data-access";
import { can } from "@/lib/permissions";
import { getTenantContext } from "@/lib/tenant";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(tenant.role as any, "manage:payments")) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const body = await request.json();
  const amount = Number(body.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Payment amount must be greater than zero." }, { status: 422 });
  }

  const bill = body.billId && isObjectId(body.billId)
    ? await Bill.findOne({ _id: objectId(body.billId), organizationId: objectId(tenant.organizationId), deletedAt: null }).lean()
    : null;

  const receipt = body.receipt || `co-${Date.now()}`;
  const payment = await Payment.create({
    organizationId: objectId(tenant.organizationId),
    projectId: body.projectId && isObjectId(body.projectId) ? objectId(body.projectId) : bill?.projectId,
    billId: bill?._id,
    clientId: bill?.clientId,
    amount,
    method: body.gateway === "cashfree" ? "Cashfree Payments" : "Razorpay Checkout",
    gateway: body.gateway || undefined,
    status: "Pending",
    transactionId: receipt,
    notes: body.notes?.description || body.notes
  });

  const result = await createPaymentOrder({
    amount,
    receipt,
    notes: {
      ...(typeof body.notes === "object" ? body.notes : {}),
      paymentId: String(payment._id),
      billId: bill?._id ? String(bill._id) : ""
    },
    customer: {
      name: bill?.clientName || body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone
    },
    gateway: body.gateway
  });

  payment.gateway = result.gateway;
  payment.gatewayOrderId = result.order?.id || result.order?.order_id || receipt;
  await payment.save();

  await PaymentGatewayLog.create({
    organizationId: objectId(tenant.organizationId),
    gateway: result.gateway,
    direction: "outbound",
    event: "create-order",
    status: "created",
    request: body,
    response: result.order
  });

  await createNotification({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    type: "payment_order_created",
    title: "Payment order created",
    body: `Payment request for ₹${amount.toLocaleString("en-IN")} is ready.`,
    severity: "info",
    link: "/payments"
  });

  return NextResponse.json({ data: { ...result, paymentId: String(payment._id) } });
}
