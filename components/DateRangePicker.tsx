export function DateRangePicker() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        aria-label="From date"
        className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-river focus:ring-2 focus:ring-river/15"
        type="date"
      />
      <input
        aria-label="To date"
        className="h-11 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-river focus:ring-2 focus:ring-river/15"
        type="date"
      />
    </div>
  );
}
