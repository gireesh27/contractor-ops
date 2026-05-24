import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "@/components/premium/AnimatedCounter";
import { cn } from "@/lib/utils";

interface PremiumMetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  currency?: boolean;
  trend?: string;
  tone?: "blue" | "yellow" | "green" | "red" | "slate";
}

const toneMap = {
  blue: "from-blue-500/20 to-cyan-400/10 text-blue-600",
  yellow: "from-yellow-400/25 to-orange-400/10 text-yellow-700",
  green: "from-emerald-400/20 to-teal-400/10 text-emerald-700",
  red: "from-red-400/20 to-rose-400/10 text-red-700",
  slate: "from-slate-400/20 to-slate-200/20 text-slate-700"
};

export function PremiumMetricCard({ title, value, icon: Icon, currency, trend, tone = "blue" }: PremiumMetricCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/82 p-5 shadow-glass backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", toneMap[tone])} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-black tracking-normal text-slate-950">
            <AnimatedCounter value={value || 0} currency={currency} />
          </p>
        </div>
        <div className={cn("rounded-2xl bg-gradient-to-br p-3", toneMap[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4 h-8 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full bg-gradient-to-r opacity-80", toneMap[tone])} style={{ width: `${Math.max(16, Math.min(100, Math.abs(value || 0) % 100))}%` }} />
      </div>
      {trend ? <p className="mt-3 text-xs font-semibold text-slate-500">{trend}</p> : null}
    </article>
  );
}
