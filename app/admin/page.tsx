import { Activity, Building2, CreditCard, Database, UsersRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { PremiumMetricCard } from "@/components/premium/PremiumMetricCard";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getAdminData } from "@/lib/data-access";

export default async function AdminPage() {
  const data = await getAdminData();
  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="SaaS owner admin" title="Platform control center" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <PremiumMetricCard icon={Building2} title="Organizations" value={data.metrics.organizations} />
          <PremiumMetricCard icon={UsersRound} title="Users" value={data.metrics.users} />
          <PremiumMetricCard icon={CreditCard} title="Active subscriptions" value={data.metrics.activeSubscriptions} />
          <PremiumMetricCard icon={Activity} title="Trial users" tone="yellow" value={data.metrics.trials} />
          <PremiumMetricCard currency icon={Database} title="MRR" tone="green" value={data.metrics.mrr} />
        </div>
        <RecordGrid emptyTitle="No organizations found" primary="name" records={data.organizations} secondary="subscriptionStatus" />
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
          <h2 className="text-xl font-black">Admin actions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {["Block/unblock organization", "Verify manual transfer", "View payment logs", "Manage feature limits"].map((action) => (
              <div key={action} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-700">{action}</div>
            ))}
          </div>
        </section>
      </MotionPage>
    </AppShell>
  );
}
