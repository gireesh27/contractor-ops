import Link from "next/link";
import { CheckCircle2, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { planCatalog } from "@/lib/data-access";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-hero-radial px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link className="text-xl font-black" href="/">ContractorOps</Link>
          <Link className="rounded-2xl bg-safety-yellow px-4 py-2 text-sm font-black text-graphite" href="/signup">Start Free Trial</Link>
        </header>
        <section className="py-16">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Subscription plans</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-normal">Premium construction operations, priced for contractor teams.</h1>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {planCatalog.map((plan) => (
              <article key={plan.name} className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-glass backdrop-blur-xl ${plan.popular ? "border-safety-yellow bg-safety-yellow text-graphite" : "border-white/10 bg-white/[0.07]"}`}>
                {plan.popular ? <span className="rounded-full bg-graphite px-3 py-1 text-xs font-black text-white">Most Popular</span> : null}
                <h2 className="mt-5 text-2xl font-black">{plan.name}</h2>
                <p className="mt-3 text-5xl font-black">₹{plan.price.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-sm opacity-70">{plan.interval}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm font-semibold">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid gap-2">
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white" type="button">
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    Razorpay checkout
                  </button>
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 px-4 text-sm font-black" type="button">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Cashfree fallback
                  </button>
                  <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 px-4 text-sm font-black" type="button">
                    <Landmark className="h-4 w-4" aria-hidden="true" />
                    Manual bank transfer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
