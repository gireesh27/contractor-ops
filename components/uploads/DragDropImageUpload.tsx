"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const maxSize = 5 * 1024 * 1024;

function toast(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

export function DragDropImageUpload({
  label = "Drag image here or click to upload",
  folder = "images",
  value,
  onUploaded
}: {
  label?: string;
  folder?: string;
  value?: string;
  onUploaded?: (file: { url: string; storageKey?: string; mimeType?: string; size?: number }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value || "");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      toast("Unsupported image format. Use JPG, PNG, or WEBP.", "error");
      return;
    }
    if (file.size > maxSize) {
      toast("Image is larger than 5 MB.", "error");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", folder);
      const response = await fetch("/api/files/upload", { method: "POST", body: form });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Upload failed.");
      setPreview(payload.data.url);
      onUploaded?.(payload.data);
      toast("Image uploaded successfully.", "success");
    } catch (error) {
      setPreview(value || "");
      toast(error instanceof Error ? error.message : "Image upload failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed p-4 text-center transition ${
          dragging ? "border-blueprint bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blueprint hover:bg-white"
        } dark:border-white/15 dark:bg-white/5`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
        type="button"
      >
        {preview ? (
          <Image alt="Upload preview" className="object-cover" fill sizes="320px" src={preview} unoptimized />
        ) : (
          <>
            <ImagePlus className="h-8 w-8 text-blueprint" aria-hidden="true" />
            <span className="mt-3 text-sm font-black text-slate-700 dark:text-slate-100">{label}</span>
            <span className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">JPG, PNG, WEBP up to 5 MB</span>
          </>
        )}
        {loading ? (
          <span className="absolute inset-0 grid place-items-center bg-slate-950/55 text-white">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          </span>
        ) : null}
      </button>
      {preview ? (
        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-xs font-black text-slate-600 dark:border-white/10 dark:text-slate-200" onClick={() => { setPreview(""); onUploaded?.({ url: "" }); }} type="button">
          <X className="h-4 w-4" />
          Remove / replace
        </button>
      ) : null}
      <input ref={inputRef} accept="image/jpeg,image/jpg,image/png,image/webp" className="sr-only" onChange={(event) => handleFile(event.target.files?.[0])} type="file" />
    </div>
  );
}
