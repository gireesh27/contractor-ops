import { CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { planCatalog } from "@/lib/data-access";
import { getPaymentMode } from "@/lib/payments";

export default function BillingPage() {
  const gateway = getPaymentMode();
  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Subscription plans" title="Billing, upgrade, and payment verification" />
        <div className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-glass">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">Gateway status</p>
          <h2 className="mt-3 text-3xl font-black">{gateway === "razorpay" ? "Razorpay configured" : gateway === "cashfree" ? "Cashfree fallback configured" : "Manual payments enabled"}</h2>
          <p className="mt-3 text-white/65">Razorpay is primary. Cashfree Payment Gateway is used for collections if Razorpay is missing or fails. Manual bank transfer, UPI, cash, and cheque remain available.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {planCatalog.map((plan) => (
            <article key={plan.name} className={`rounded-[2rem] border p-6 shadow-glass backdrop-blur-xl ${plan.popular ? "border-safety-yellow bg-safety-yellow text-slate-950" : "border-white/80 bg-white/86"}`}>
              {plan.popular ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-white">Most Popular</span> : null}
              <h2 className="mt-4 text-2xl font-black">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black">₹{plan.price.toLocaleString("en-IN")}</p>
              <ul className="mt-5 space-y-2 text-sm font-semibold">
                {plan.features.map((feature) => <li key={feature}>- {feature}</li>)}
              </ul>
              <div className="mt-6 grid gap-2">
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white" type="button"><CreditCard className="h-4 w-4" /> Razorpay</button>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 text-sm font-black" type="button"><ShieldCheck className="h-4 w-4" /> Cashfree</button>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-current/20 text-sm font-black" type="button"><Landmark className="h-4 w-4" /> Bank transfer</button>
              </div>
            </article>
          ))}
        </div>
      </MotionPage>
    </AppShell>
  );
}
