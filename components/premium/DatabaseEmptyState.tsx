import Link from "next/link";
import { Database, PlugZap } from "lucide-react";

export function DatabaseEmptyState({ title = "No records yet", body }: { title?: string; body?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-safety-yellow">
        <Database className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {body || "This screen reads from MongoDB only. Create records using the forms, or configure MONGODB_URI to start saving real tenant data."}
      </p>
      <Link className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white" href="/settings">
        <PlugZap className="h-4 w-4" aria-hidden="true" />
        Check setup
      </Link>
    </div>
  );
}
