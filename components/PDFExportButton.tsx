import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFExportButtonProps {
  title: string;
  type: string;
  project?: string;
  className?: string;
}

export function PDFExportButton({ title, type, project, className }: PDFExportButtonProps) {
  const params = new URLSearchParams({ title, type });
  if (project) params.set("project", project);

  return (
    <a
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-river hover:text-river",
        className
      )}
      href={`/api/reports/export?${params.toString()}`}
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      PDF
    </a>
  );
}
