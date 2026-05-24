"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

const colors = ["#1d4ed8", "#facc15", "#10b981", "#ef4444", "#64748b", "#06b6d4"];

export function BillingChart({ data }: { data: Array<{ label: string; billed?: number; received?: number }> }) {
  if (!data.length) return <ChartEmptyState />;
  return (
    <div className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="billed" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="received" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,.35)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} />
          <YAxis tick={{ fontSize: 12, fill: "currentColor" }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,.28)" }} formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Area dataKey="billed" fill="url(#billed)" stroke="#1d4ed8" strokeWidth={3} type="monotone" />
          <Area dataKey="received" fill="url(#received)" stroke="#10b981" strokeWidth={3} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (!data.length) return <ChartEmptyState />;
  return (
    <div className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,.35)" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "currentColor" }} />
          <YAxis tick={{ fontSize: 12, fill: "currentColor" }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,.28)" }} formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data }: { data: Array<{ label: string; value: number }> }) {
  if (!data.length) return <ChartEmptyState />;
  return (
    <div className="h-72">
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={64} nameKey="label" outerRadius={104} paddingAngle={4}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(148,163,184,.28)" }} formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartEmptyState() {
  return (
    <div className="grid h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-white/10 dark:bg-white/5">
      <div>
        <p className="text-sm font-black text-slate-700 dark:text-slate-100">No chart data yet</p>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Charts appear when real records are saved.</p>
      </div>
    </div>
  );
}
