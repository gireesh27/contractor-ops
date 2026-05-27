import { FileText } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

function printable(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return value > 999 ? formatCurrency(value) : value.toLocaleString("en-IN");
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return "Linked record";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
  if (typeof value === "object") return "Attached";
  return String(value);
}

function labelize(key: string) {
  return key.replace(/Id$/, "").replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function userFacingField(key: string) {
  return !["_id", "id", "__v", "organizationId", "createdBy", "updatedBy", "deletedAt"].includes(key) && !key.endsWith("Id");
}

export function RecordGrid({
  records,
  primary = "name",
  secondary = "status",
  amount = "amount",
  emptyTitle = "No records saved yet",
  hrefForRecord
}: {
  records: Array<Record<string, any>>;
  primary?: string;
  secondary?: string;
  amount?: string;
  emptyTitle?: string;
  hrefForRecord?: (record: Record<string, any>) => string | undefined;
}) {
  if (!records.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
        <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
        <p className="mt-4 text-lg font-black text-slate-950">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">Create the first record. It will be stored in MongoDB with your organizationId.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {records.map((record) => {
        const title = record[primary] || record.title || record.taskName || record.billNumber || record.description || record.metadata?.title || "Record";
        const subtitle = record[secondary] || record.category || record.workCategory || record.type || record.status;
        const amountValue = record[amount] || record.netPayable || record.contractValue || record.totalCost || record.wageCalculated;
        const href = hrefForRecord?.(record);
        const content = (
          <article className="rounded-[1.75rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">{printable(title)}</h3>
                <p className="mt-1 text-sm text-slate-500">{record.location || record.locationLabel || record.clientName || record.phone || record.email || "Tenant-scoped record"}</p>
              </div>
              {subtitle ? <StatusBadge status={String(subtitle)} /> : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {Object.entries(record)
                .filter(([key]) => userFacingField(key))
                .slice(0, 6)
                .map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{labelize(key)}</p>
                    <p className="mt-1 truncate font-bold text-slate-700">{printable(value)}</p>
                  </div>
                ))}
            </div>
            {amountValue ? <p className="mt-4 text-2xl font-black text-blueprint">{printable(amountValue)}</p> : null}
          </article>
        );
        return href ? (
          <Link key={record._id || record.id} href={href} className="block focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-[1.75rem]">
            {content}
          </Link>
        ) : (
          <div key={record._id || record.id}>{content}</div>
        );
      })}
    </div>
  );
}
