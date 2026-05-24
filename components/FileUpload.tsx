import { Upload } from "lucide-react";

interface FileUploadProps {
  label?: string;
}

export function FileUpload({ label = "Upload files" }: FileUploadProps) {
  return (
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-field px-4 py-5 text-center text-sm font-medium text-slate-600 transition hover:border-river hover:bg-river/5">
      <Upload className="mb-2 h-5 w-5 text-river" aria-hidden="true" />
      <span>{label}</span>
      <input className="sr-only" type="file" multiple />
    </label>
  );
}
