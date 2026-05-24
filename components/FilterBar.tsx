import { Search } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";

interface FilterBarProps {
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function FilterBar({ searchPlaceholder = "Search records", children }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-river focus:ring-2 focus:ring-river/15"
          placeholder={searchPlaceholder}
          type="search"
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <DateRangePicker />
        {children}
      </div>
    </div>
  );
}
