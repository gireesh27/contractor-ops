import Link from "next/link";
import { LoginForm } from "@/components/auth/AuthForms";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-hero-radial text-white lg:grid-cols-[1fr_460px]">
      <section className="hidden flex-col justify-between p-10 lg:flex">
        <Link className="text-xl font-black" href="/">ContractorOps</Link>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Secure SaaS login</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-black tracking-normal">Organization-scoped access for every contractor team.</h1>
          <p className="mt-5 max-w-xl leading-8 text-white/65">Google login plus email/password fallback, protected routes, roles, and tenant-isolated MongoDB records.</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white p-6 text-slate-950 shadow-glass">
          <Link className="text-xl font-black lg:hidden" href="/">ContractorOps</Link>
          <h1 className="mt-5 text-3xl font-black tracking-normal">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use Google or your production email/password account.</p>
          <div className="mt-6">
            <LoginForm />
          </div>
          <p className="mt-6 text-sm text-slate-600">
            New workspace? <Link className="font-black text-blueprint" href="/signup">Start Free Trial</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
