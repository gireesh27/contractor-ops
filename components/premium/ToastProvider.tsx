"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";

export function ToastProvider() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 max-w-sm rounded-2xl border border-white/70 bg-white/90 p-4 shadow-glass backdrop-blur-xl">
      <div className="flex gap-3">
        <div className="rounded-xl bg-blue-600 p-2 text-white">
          <BellRing className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-950">ContractorOps ready</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">Browser notifications can be enabled from the notification center.</p>
        </div>
        <button className="ml-2 text-xs font-bold text-slate-400" onClick={() => setShow(false)} type="button">
          Close
        </button>
      </div>
    </div>
  );
}
