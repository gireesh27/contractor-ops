import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

function tone(status: string) {
  const normalized = status.toLowerCase();
  if (["active", "approved", "paid", "present", "on track", "completed"].some((word) => normalized.includes(word))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["hold", "pending", "partial", "needs", "draft", "sent", "trial"].some((word) => normalized.includes(word))) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (["overdue", "delayed", "cancelled", "absent", "rejected"].some((word) => normalized.includes(word))) {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold leading-none", tone(status))}>
      {status}
    </span>
  );
}
