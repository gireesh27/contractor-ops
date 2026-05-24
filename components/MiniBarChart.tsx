interface MiniBarChartProps {
  data: Array<{ label: string; value: number; compare?: number }>;
  max?: number;
}

export function MiniBarChart({ data, max }: MiniBarChartProps) {
  const largest = max ?? Math.max(...data.flatMap((row) => [row.value, row.compare ?? 0]), 1);

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.label} className="grid grid-cols-[72px_1fr] items-center gap-3 text-sm">
          <span className="truncate font-medium text-slate-600">{row.label}</span>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-river" style={{ width: `${Math.max(4, (row.value / largest) * 100)}%` }} />
            </div>
            {typeof row.compare === "number" ? (
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-saffron" style={{ width: `${Math.max(4, (row.compare / largest) * 100)}%` }} />
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
