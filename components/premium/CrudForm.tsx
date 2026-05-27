"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { DragDropImageUpload } from "@/components/uploads/DragDropImageUpload";

export interface CrudField {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "datetime-local"
    | "time"
    | "textarea"
    | "select"
    | "checkbox";
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export function CrudForm({
  collection,
  fields,
  hidden,
  compact = false,
}: {
  collection: string;
  fields: CrudField[];
  hidden?: Record<string, string>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/records/${collection}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setMessage(payload.error || "Unable to save record.");
        return;
      }

      form.reset();
      setMessage("Saved. The list has been refreshed.");
      router.refresh();
    } catch {
      setMessage("Something went wrong while saving the record.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl"
      onSubmit={onSubmit}
    >
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} name={key} type="hidden" value={value} />
          ))
        : null}

      <div className={`grid gap-4 ${compact ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        {fields.map((field) => {
          const inputClass =
            "h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10";

          if (["url", "image", "proof", "receipt"].includes(field.name)) {
            return (
              <label key={field.name} className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2">
                {field.label}
                <UploadField folder={collection} name={field.name} />
              </label>
            );
          }

          if (field.type === "textarea") {
            return (
              <label
                key={field.name}
                className="grid gap-1.5 text-sm font-bold text-slate-700 md:col-span-2"
              >
                {field.label}
                <textarea
                  className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </label>
            );
          }

          if (field.type === "select") {
            return (
              <label
                key={field.name}
                className="grid gap-1.5 text-sm font-bold text-slate-700"
              >
                {field.label}
                <select
                  className={inputClass}
                  name={field.name}
                  required={field.required}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className="flex items-center gap-3 self-end rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              >
                <input type="hidden" name={field.name} value="false" />
                <input
                  className="h-4 w-4 rounded border-slate-300 text-blueprint"
                  name={field.name}
                  type="checkbox"
                  value="true"
                />
                {field.label}
              </label>
            );
          }

          return (
            <label
              key={field.name}
              className="grid gap-1.5 text-sm font-bold text-slate-700"
            >
              {field.label}
              <input
                className={inputClass}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type || "text"}
              />
            </label>
          );
        })}
      </div>

      {message ? (
        <p
          className={`mt-4 rounded-2xl p-3 text-sm font-bold ${
            message.startsWith("Saved")
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      ) : null}

      <button
        className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        type="submit"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        {loading ? "Saving..." : "Save record"}
      </button>
    </form>
  );
}

function UploadField({ folder, name }: { folder: string; name: string }) {
  const [url, setUrl] = useState("");
  return (
    <>
      <DragDropImageUpload folder={folder} onUploaded={(file) => setUrl(file.url)} />
      <input name={name} type="hidden" value={url} />
    </>
  );
}
