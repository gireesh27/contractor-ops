import Link from "next/link";
import { SignupForm } from "@/components/auth/AuthForms";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,.16),transparent_32%),linear-gradient(180deg,#f8fafc,#eef2f7)] px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <Link className="inline-flex items-center gap-3 text-xl font-black" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm text-safety-yellow">CO</span>
          ContractorOps
        </Link>
        <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/88 p-6 shadow-glass backdrop-blur-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blueprint">Production workspace</p>
          <h1 className="mt-3 text-4xl font-black tracking-normal">Create your contractor operating system</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">This creates a real MongoDB-backed organization, owner account, and role membership. No demo data is inserted.</p>
          <div className="mt-7">
            <SignupForm />
          </div>
        </section>
      </div>
    </main>
  );
}
