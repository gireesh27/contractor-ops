import { FileText } from "lucide-react";
import { PDFExportButton } from "@/components/PDFExportButton";
import { WhatsAppShareButton } from "@/components/WhatsAppShareButton";

interface ReportPreviewProps {
  title: string;
  body: string;
  project?: string;
  whatsappMessage?: string;
}

export function ReportPreview({ title, body, project, whatsappMessage }: ReportPreviewProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-field p-2 text-river">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">{title}</h3>
            <p className="mt-1 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PDFExportButton title={title} type="Report" project={project} />
          {whatsappMessage ? <WhatsAppShareButton message={whatsappMessage} label="Share" /> : null}
        </div>
      </div>
    </section>
  );
}
