import type {
  Bill,
  BillItem,
  BillStatus,
  BOQItem,
  LabourAttendance,
  MaterialTransaction,
  Measurement,
  Payment,
  Project,
  VendorTransaction
} from "@/lib/types";

export function boqAmount(item: BOQItem) {
  return item.quantity * item.rate;
}

export function boqTotal(item: BOQItem) {
  const amount = boqAmount(item);
  return amount + amount * ((item.taxPercentage ?? 0) / 100);
}

export function estimateSubtotal(items: BOQItem[]) {
  return items.reduce((sum, item) => sum + boqAmount(item), 0);
}

export function estimateTax(items: BOQItem[]) {
  return items.reduce((sum, item) => sum + boqAmount(item) * ((item.taxPercentage ?? 0) / 100), 0);
}

export function estimateGrandTotal(items: BOQItem[]) {
  return estimateSubtotal(items) + estimateTax(items);
}

export function billItemAmount(item: BillItem) {
  return item.quantity * item.rate;
}

export function billSubtotal(items: BillItem[]) {
  return items.reduce((sum, item) => sum + billItemAmount(item), 0);
}

export function billNetPayable(bill: Bill, items: BillItem[]) {
  const subtotal = billSubtotal(items);
  const gst = subtotal * (bill.gstPercentage / 100);
  return subtotal + gst - bill.discount - bill.retentionAmount - bill.previousAmountReceived;
}

export function paymentsForBill(payments: Payment[], billId: string) {
  return payments
    .filter((payment) => payment.billId === billId)
    .reduce((sum, payment) => sum + payment.amountReceived, 0);
}

export function deriveBillStatus(bill: Bill, items: BillItem[], payments: Payment[], now = new Date()): BillStatus {
  if (bill.status === "Draft" || bill.status === "Cancelled") return bill.status;

  const received = paymentsForBill(payments, bill.id);
  const payable = billNetPayable(bill, items);
  const overdue = new Date(bill.dueDate) < now && received < payable;

  if (received >= payable) return "Paid";
  if (received > 0) return "Partially Paid";
  if (overdue) return "Overdue";
  return bill.status === "Approved" ? "Approved" : "Sent";
}

export function labourCost(attendance: LabourAttendance[]) {
  return attendance.reduce((sum, row) => sum + row.wageAmount + row.overtimeAmount, 0);
}

export function materialTransactionCost(transaction: MaterialTransaction) {
  return transaction.quantity * transaction.unitRate;
}

export function materialCost(transactions: MaterialTransaction[]) {
  return transactions.reduce((sum, row) => {
    if (row.type === "Purchase/Inward" || row.type === "Usage/Outward" || row.type === "Wastage") {
      return sum + materialTransactionCost(row);
    }
    return sum;
  }, 0);
}

export function materialBalance(transactions: MaterialTransaction[], materialId: string) {
  return transactions
    .filter((row) => row.materialId === materialId)
    .reduce((balance, row) => {
      if (row.type === "Purchase/Inward" || row.type === "Return") return balance + row.quantity;
      if (row.type === "Usage/Outward" || row.type === "Wastage" || row.type === "Transfer") return balance - row.quantity;
      return balance;
    }, 0);
}

export function measurementQuantity(row: Measurement) {
  switch (row.formula) {
    case "Length x Breadth":
      return row.length * row.breadth * row.count;
    case "Length x Breadth x Height":
      return row.length * row.breadth * row.height * row.count;
    case "Number x Length":
      return row.count * row.length;
    case "Manual quantity":
      return row.manualQuantity ?? 0;
  }
}

export function measurementAmount(row: Measurement) {
  return measurementQuantity(row) * row.rate;
}

export function vendorCost(transactions: VendorTransaction[]) {
  return transactions
    .filter((row) => row.direction === "Credit")
    .reduce((sum, row) => sum + row.amount, 0);
}

export function projectFinancials(input: {
  project: Project;
  boqItems: BOQItem[];
  bills: Bill[];
  billItems: BillItem[];
  payments: Payment[];
  labourAttendance: LabourAttendance[];
  materialTransactions: MaterialTransaction[];
  vendorTransactions: VendorTransaction[];
}) {
  const projectBills = input.bills.filter((bill) => bill.projectId === input.project.id);
  const projectBillIds = new Set(projectBills.map((bill) => bill.id));
  const projectBillItems = input.billItems.filter((item) => projectBillIds.has(item.billId));
  const projectPayments = input.payments.filter((payment) => payment.projectId === input.project.id);
  const projectLabour = input.labourAttendance.filter((row) => row.projectId === input.project.id);
  const projectMaterials = input.materialTransactions.filter((row) => row.projectId === input.project.id);
  const projectVendors = input.vendorTransactions.filter((row) => row.projectId === input.project.id);
  const projectBoq = input.boqItems.filter((item) => item.projectId === input.project.id);

  const estimatedProjectValue = estimateGrandTotal(projectBoq);
  const totalBilled = projectBills.reduce((sum, bill) => {
    const rows = projectBillItems.filter((item) => item.billId === bill.id);
    return sum + billNetPayable(bill, rows);
  }, 0);
  const totalReceived = projectPayments.reduce((sum, payment) => sum + payment.amountReceived, 0);
  const actualLabourCost = labourCost(projectLabour);
  const actualMaterialCost = materialCost(projectMaterials);
  const actualVendorCost = vendorCost(projectVendors);

  return {
    estimatedProjectValue,
    totalBilled,
    totalReceived,
    outstanding: totalBilled - totalReceived,
    labourCost: actualLabourCost,
    materialCost: actualMaterialCost,
    vendorCost: actualVendorCost,
    estimatedProfit: totalBilled - actualLabourCost - actualMaterialCost - actualVendorCost
  };
}
