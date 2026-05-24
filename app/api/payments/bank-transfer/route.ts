import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cacheDel } from "@/lib/cache";
import { Bill, Payment } from "@/lib/db/models";
import { isObjectId, objectId } from "@/lib/data-access";
import { createNotification } from "@/lib/notifications";
import { can } from "@/lib/permissions";
import { getTenantContext } from "@/lib/tenant";

const bankTransferSchema = z.object({
  amount: z.coerce.number().positive(),
  projectId: z.string().optional(),
  billId: z.string().optional(),
  transactionId: z.string().min(3),
  notes: z.string().optional(),
  proof: z.any().optional()
});

export async function POST(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  if (!tenant) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(tenant.role as any, "manage:payments")) return NextResponse.json({ error: "Access denied" }, { status: 403 });

  const body = await request.json();
  const parsed = bankTransferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const bill = parsed.data.billId && isObjectId(parsed.data.billId)
    ? await Bill.findOne({ _id: objectId(parsed.data.billId), organizationId: objectId(tenant.organizationId), deletedAt: null }).lean()
    : null;

  const payment = await Payment.create({
    organizationId: objectId(tenant.organizationId),
    projectId: parsed.data.projectId && isObjectId(parsed.data.projectId) ? objectId(parsed.data.projectId) : bill?.projectId,
    billId: bill?._id,
    clientId: bill?.clientId,
    amount: parsed.data.amount,
    method: "Bank transfer",
    gateway: "manual",
    status: "Pending",
    transactionId: parsed.data.transactionId,
    proof: parsed.data.proof,
    notes: parsed.data.notes
  });

  await cacheDel(`dashboard:${tenant.organizationId}*`);
  await createNotification({
    organizationId: tenant.organizationId,
    userId: tenant.userId,
    type: "bank_transfer_pending",
    title: "Bank transfer pending verification",
    body: `Manual transfer ${parsed.data.transactionId} for ₹${parsed.data.amount.toLocaleString("en-IN")} is waiting for admin verification.`,
    severity: "warning",
    link: "/payments"
  });

  return NextResponse.json({ data: JSON.parse(JSON.stringify(payment)) }, { status: 201 });
}
