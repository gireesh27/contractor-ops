"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type Toast = {
  title: string;
  body?: string;
  type?: "success" | "error" | "warning" | "info";
};

export function ToastProvider() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<Toast>).detail;
      setToast(detail);
      window.setTimeout(() => setToast(null), 5200);
    };
    window.addEventListener("contractorops:toast", onToast);
    const timer = window.setTimeout(() => setToast({
      title: "ContractorOps ready",
      body: "Browser notifications can be enabled from the notification center.",
      type: "info"
    }), 900);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("contractorops:toast", onToast);
    };
  }, []);

  if (!toast) return null;

  const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? XCircle : toast.type === "warning" ? AlertTriangle : Info;
  const tone = toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : toast.type === "warning" ? "bg-amber-500" : "bg-blue-600";

  return (
    <div className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl border border-white/70 bg-white/90 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92">
      <div className="flex gap-3">
        <div className={`rounded-xl p-2 text-white ${tone}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950 dark:text-white">{toast.title}</p>
          {toast.body ? <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{toast.body}</p> : null}
        </div>
        <button className="ml-2 text-xs font-bold text-slate-400" onClick={() => setToast(null)} type="button">
          Close
        </button>
      </div>
    </div>
  );
}
