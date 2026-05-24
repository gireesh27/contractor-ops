import { FileText } from "lucide-react";

interface EmptyStateProps {
  title: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
      <FileText className="h-8 w-8 text-slate-400" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
