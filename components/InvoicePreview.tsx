import { AmountDisplay } from "@/components/AmountDisplay";
import { PDFExportButton } from "@/components/PDFExportButton";
import { StatusBadge } from "@/components/StatusBadge";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";
import { billNetPayable } from "@/lib/calculations";
import type { Bill, BillItem } from "@/lib/types";

interface InvoicePreviewProps {
  bill: Bill;
  items: BillItem[];
  projectName: string;
  phone?: string;
}

export function InvoicePreview({ bill, items, projectName, phone }: InvoicePreviewProps) {
  const netPayable = billNetPayable(bill, items);
  const message = `Hello ${bill.clientName}, payment of ${new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(netPayable)} is pending for ${projectName}, Bill No. ${bill.billNumber}. Kindly make the payment by ${bill.dueDate}. Thank you.`;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-ink">{bill.billNumber}</h3>
            <StatusBadge status={bill.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{bill.billingType} for {projectName}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Net payable</p>
          <AmountDisplay value={netPayable} tone={bill.status === "Overdue" ? "danger" : "default"} />
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <table className="min-w-full text-sm">
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 text-slate-700">{item.description}</td>
                <td className="px-3 py-2 text-right text-slate-500">{item.quantity} {item.unit}</td>
                <td className="px-3 py-2 text-right font-semibold text-slate-700">
                  <AmountDisplay value={item.quantity * item.rate} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <PDFExportButton title={bill.billNumber} type="Client bill" project={projectName} />
        <WhatsAppShareButton message={message} phone={phone} label="Reminder" />
      </div>
    </article>
  );
}
