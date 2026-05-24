import type { SelectHTMLAttributes } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export function FormSelect({ label, options, className, ...props }: FormSelectProps) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        className={`h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-river focus:ring-2 focus:ring-river/15 ${className || ""}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
