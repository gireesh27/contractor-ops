import { NextRequest, NextResponse } from "next/server";
import { Bill, Payment, PaymentGatewayLog } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { cacheDel } from "@/lib/cache";
import { createNotification } from "@/lib/notifications";
import { can } from "@/lib/permissions";
import { verifyCashfreePayment, verifyRazorpaySignature } from "@/lib/payments";
import { getTenantContext } from "@/lib/tenant";

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(tenant.role as any, "manage:payments")) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const body = await request.json();
  const gateway = body.gateway || "razorpay";
  const gatewayVerification =
    gateway === "razorpay"
      ? verifyRazorpaySignature({ orderId: body.orderId, paymentId: body.paymentId, signature: body.signature })
      : await verifyCashfreePayment(body.orderId);
  const verified = gateway === "razorpay" ? Boolean(gatewayVerification) : ["PAID", "SUCCESS"].includes(String(gatewayVerification?.order_status || gatewayVerification?.payment_status).toUpperCase());

  const paymentLookups = [];
  if (body.paymentRecordId && /^[a-f\d]{24}$/i.test(String(body.paymentRecordId))) paymentLookups.push({ _id: objectId(body.paymentRecordId) });
  if (body.paymentId && /^[a-f\d]{24}$/i.test(String(body.paymentId))) paymentLookups.push({ _id: objectId(body.paymentId) });
  if (body.orderId) paymentLookups.push({ gatewayOrderId: body.orderId }, { transactionId: body.orderId });

  const payment = paymentLookups.length ? await Payment.findOne({
    organizationId: objectId(tenant.organizationId),
    $or: paymentLookups
  }) : null;

  if (payment) {
    payment.status = verified ? "Paid" : "Failed";
    payment.gateway = gateway;
    payment.gatewayOrderId = body.orderId || payment.gatewayOrderId;
    payment.gatewayPaymentId = body.razorpayPaymentId || body.gatewayPaymentId || body.paymentId;
    payment.paidAt = verified ? new Date() : payment.paidAt;
    payment.notes = verified ? payment.notes : `${payment.notes || ""} Payment verification failed.`.trim();
    await payment.save();

    if (payment.billId) {
      const billPayments = await Payment.aggregate([
        { $match: { organizationId: objectId(tenant.organizationId), billId: payment.billId, status: { $in: ["Paid", "Verified", "Captured"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const bill = await Bill.findOne({ _id: payment.billId, organizationId: objectId(tenant.organizationId), deletedAt: null });
      if (bill) {
        const received = billPayments[0]?.total || 0;
        bill.status = received >= Number(bill.netPayable || 0) ? "Paid" : received > 0 ? "Partially Paid" : bill.status;
        await bill.save();
      }
    }
  }

  await PaymentGatewayLog.create({
    organizationId: objectId(tenant.organizationId),
    gateway,
    direction: "inbound",
    event: "verify-payment",
    status: verified ? "verified" : "failed",
    request: body,
    response: gatewayVerification,
    signatureValid: verified
  });

  await cacheDel(`dashboard:${tenant.organizationId}*`);
  await createNotification({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    type: verified ? "payment_success" : "payment_failed",
    title: verified ? "Payment verified" : "Payment failed",
    body: verified ? "Payment was verified and saved." : "Payment verification failed. Please check the gateway response.",
    severity: verified ? "success" : "danger",
    link: "/payments"
  });

  return NextResponse.json({ data: { verified, paymentId: payment?._id ? String(payment._id) : null } }, { status: verified ? 200 : 400 });
}
