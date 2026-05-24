import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cacheDel } from "@/lib/cache";
import { Bill, Payment } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
import { createNotification } from "@/lib/notifications";
import { getTenantContext } from "@/lib/tenant";

const verificationSchema = z.object({
  paymentId: z.string().regex(/^[a-f\d]{24}$/i),
  action: z.enum(["verified", "rejected"]),
  notes: z.string().optional()
});

export async function PATCH(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!tenant.isSuperAdmin) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const parsed = verificationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const payment = await Payment.findOne({ _id: objectId(parsed.data.paymentId), deletedAt: null });
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  payment.status = parsed.data.action === "verified" ? "Verified" : "Rejected";
  payment.verifiedBy = objectId(tenant.userId);
  payment.verifiedAt = new Date();
  payment.notes = parsed.data.notes || payment.notes;
  if (parsed.data.action === "verified") payment.paidAt = payment.paidAt || new Date();
  await payment.save();

  if (payment.billId && parsed.data.action === "verified") {
    const billPayments = await Payment.aggregate([
      { $match: { organizationId: payment.organizationId, billId: payment.billId, status: { $in: ["Paid", "Verified", "Captured"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const bill = await Bill.findOne({ _id: payment.billId, organizationId: payment.organizationId, deletedAt: null });
    if (bill) {
      const received = billPayments[0]?.total || 0;
      bill.status = received >= Number(bill.netPayable || 0) ? "Paid" : received > 0 ? "Partially Paid" : bill.status;
      await bill.save();
    }
  }

  await cacheDel(`dashboard:${String(payment.organizationId)}*`);
  await createNotification({
    organizationId: String(payment.organizationId),
    userId: payment.createdBy ? String(payment.createdBy) : undefined,
    type: parsed.data.action === "verified" ? "bank_transfer_verified" : "bank_transfer_rejected",
    title: parsed.data.action === "verified" ? "Bank transfer verified" : "Bank transfer rejected",
    body: parsed.data.action === "verified" ? "Manual bank transfer has been verified." : "Manual bank transfer was rejected. Please review the reference or proof.",
    severity: parsed.data.action === "verified" ? "success" : "danger",
    link: "/payments"
  });

  return NextResponse.json({ data: JSON.parse(JSON.stringify(payment)) });
}
