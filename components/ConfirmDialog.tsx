import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  body: string;
}

export function ConfirmDialog({ title, body }: ConfirmDialogProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1">{body}</p>
        </div>
      </div>
    </div>
  );
}
