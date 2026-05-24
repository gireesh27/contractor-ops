import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HardHat,
  Layers3,
  Package,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { LandingHeroVisual } from "@/components/premium/LandingHeroVisual";
import { planCatalog } from "@/lib/data-access";

const features = [
  { title: "BOQ to bill automation", icon: ClipboardCheck, text: "Turn BOQ, measurements, and progress into professional client bills." },
  { title: "Site proof with location", icon: Layers3, text: "Capture timestamped photos, GPS-backed updates, and daily reports from site." },
  { title: "Labour and material control", icon: HardHat, text: "Stop leakage with attendance, wages, stock, wastage, and supplier tracking." },
  { title: "Cash-flow follow-up", icon: WalletCards, text: "Track outstanding bills, payment links, reminders, and manual collections." }
];

const workflow = ["Create project", "Prepare BOQ", "Track site work", "Record labour/materials", "Generate bill", "Collect payment"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-hero-radial text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-safety-yellow text-sm font-black text-graphite">CO</span>
          <span className="text-lg font-black tracking-normal">ContractorOps</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="hidden rounded-xl px-3 py-2 text-sm font-bold text-white/75 hover:text-white sm:inline-flex" href="/pricing">
            Pricing
          </Link>
          <Link className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-xl hover:bg-white/15" href="/login">
            Login
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-safety-yellow" aria-hidden="true" />
            Site-to-bill automation for construction teams
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-normal text-white sm:text-6xl lg:text-7xl">
            Run your construction business from site work to client bill.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
            ContractorOps helps contractors manage BOQ, scheduling, site progress, labour, materials, measurements, photos, bills, payments, and reports from one powerful dashboard.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-safety-yellow px-6 py-4 text-sm font-black text-graphite shadow-glow transition hover:-translate-y-0.5 hover:bg-white" href="/signup">
              Start Free Trial
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link className="inline-flex h-13 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/15" href="/login">
              Book Demo
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["No Excel leakage", "BOQ, MB, bills linked"],
              ["Field-ready", "Mobile-first site forms"],
              ["Cash-flow focus", "Outstanding and reminders"]
            ].map(([title, text]) => (
              <div key={title} className="glass-card rounded-2xl p-4">
                <p className="font-black">{title}</p>
                <p className="mt-1 text-sm text-white/62">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <LandingHeroVisual />
          <div className="grid grid-cols-3 gap-3">
            {[
              [BadgeIndianRupee, "Outstanding", "Live"],
              [BellRing, "Alerts", "Push"],
              [BarChart3, "Analytics", "AI-ready"]
            ].map(([Icon, title, value]) => {
              const TypedIcon = Icon as typeof BadgeIndianRupee;
              return (
                <div key={String(title)} className="glass-card rounded-2xl p-4">
                  <TypedIcon className="h-5 w-5 text-safety-yellow" aria-hidden="true" />
                  <p className="mt-3 text-sm font-black">{String(title)}</p>
                  <p className="text-xs text-white/60">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-16 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.1]">
                <feature.icon className="h-7 w-7 text-safety-yellow" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-black">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/62">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Workflow</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal">Built around contractor cash-flow, not generic task lists.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                <span className="text-sm font-black text-safety-yellow">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-lg font-black">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white p-4 text-slate-950 shadow-glass">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Dashboard preview</p>
              <h2 className="mt-3 text-3xl font-black">Business control room</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["Total billed", "MongoDB calculated"],
                  ["Material leakage", "Stock and wastage"],
                  ["Labour trend", "Attendance and wages"],
                  ["Overdue bills", "Client follow-up"]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="font-black">{title}</p>
                    <p className="mt-1 text-sm text-white/55">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Project progress", "Billing vs received", "Outstanding by client", "Expense categories"].map((item) => (
                <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <BarChart3 className="h-5 w-5 text-blueprint" aria-hidden="true" />
                  <p className="mt-4 font-black">{item}</p>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 rounded-full bg-blue-500/25"><div className="h-3 w-2/3 rounded-full bg-blueprint" /></div>
                    <div className="h-3 rounded-full bg-yellow-400/25"><div className="h-3 w-1/2 rounded-full bg-safety-yellow" /></div>
                    <div className="h-3 rounded-full bg-emerald-400/25"><div className="h-3 w-4/5 rounded-full bg-emerald-500" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Pricing</p>
            <h2 className="mt-3 text-4xl font-black tracking-normal">Plans that scale with your sites.</h2>
          </div>
          <Link className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/15 px-5 text-sm font-black hover:bg-white/10" href="/pricing">
            Compare features
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {planCatalog.map((plan) => (
            <article key={plan.name} className={`rounded-3xl border p-6 shadow-glass backdrop-blur-xl ${plan.popular ? "border-safety-yellow bg-safety-yellow text-graphite" : "border-white/10 bg-white/[0.06]"}`}>
              {plan.popular ? <span className="rounded-full bg-graphite px-3 py-1 text-xs font-black text-white">Most Popular</span> : null}
              <h3 className="mt-4 text-2xl font-black">{plan.name}</h3>
              <p className="mt-3 text-4xl font-black">₹{plan.price.toLocaleString("en-IN")}</p>
              <p className="text-sm opacity-70">{plan.interval}</p>
              <ul className="mt-5 space-y-3">
                {plan.features.slice(0, 5).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm font-semibold">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <ShieldCheck className="h-8 w-8 text-safety-yellow" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black">Customer testimonial area</h2>
            <p className="mt-3 text-white/62">Reserved for verified customer stories. No fake names or invented reviews are shown.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
            <FileText className="h-8 w-8 text-safety-yellow" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black">FAQ</h2>
            <div className="mt-5 space-y-4 text-sm text-white/68">
              <p><span className="font-black text-white">Is this Microsoft Project?</span> No. Scheduling exists, but the core is site-to-bill construction operations.</p>
              <p><span className="font-black text-white">Does it support offline payments?</span> Yes. Bank transfer, UPI, cash, cheque, and proof upload are supported.</p>
              <p><span className="font-black text-white">Does data stay tenant-isolated?</span> Yes. Every operational model is scoped by organizationId.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/50">
        ContractorOps - Construction operations, site-to-bill automation, and contractor cash-flow control.
      </footer>
    </main>
  );
}
