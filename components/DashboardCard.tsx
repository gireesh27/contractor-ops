import type { LucideIcon } from "lucide-react";
import { AmountDisplay } from "@/components/AmountDisplay";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  helper?: string;
  amount?: boolean;
  tone?: "default" | "good" | "warn" | "danger";
}

export function DashboardCard({ title, value, icon: Icon, helper, amount, tone = "default" }: DashboardCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
          <div className="mt-2 text-2xl font-bold text-ink">
            {amount && typeof value === "number" ? <AmountDisplay value={value} tone={tone} /> : value}
          </div>
        </div>
        <div className="rounded-lg bg-field p-2 text-river">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}
    </article>
  );
}
