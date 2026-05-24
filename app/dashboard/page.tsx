import Link from "next/link";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BellRing,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  HardHat,
  Package,
  ReceiptText,
  Sparkles,
  Truck,
  WalletCards
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { BillingChart, DonutChart, SimpleBarChart } from "@/components/charts/BusinessCharts";
import { DatabaseEmptyState } from "@/components/premium/DatabaseEmptyState";
import { MotionPage } from "@/components/premium/MotionPage";
import { PremiumMetricCard } from "@/components/premium/PremiumMetricCard";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getDashboardSummary } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

const quickActions = [
  { href: "/projects/new", label: "Add Project", icon: Building2 },
  { href: "/daily-progress", label: "Add Progress", icon: ClipboardCheck },
  { href: "/labour", label: "Mark Attendance", icon: HardHat },
  { href: "/materials", label: "Add Material", icon: Package },
  { href: "/bills", label: "Create Bill", icon: ReceiptText },
  { href: "/site-photos", label: "Upload Photo", icon: FilePlus2 }
];

export default async function DashboardPage() {
  const tenant = await getTenantContext({ required: true });
  const summary = tenant ? await getDashboardSummary(tenant.organizationId) : null;
  const metrics = summary?.metrics;

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Professional Dashboard" title="Construction cash-flow command center">
          <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-glow" href="/projects/new">
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Quick action
          </Link>
        </SectionHeader>
        {!summary?.databaseReady ? <DatabaseEmptyState title="MongoDB connection required" /> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          <PremiumMetricCard icon={Building2} title="Active projects" value={metrics?.activeProjects || 0} />
          <PremiumMetricCard icon={CheckCircle2} title="Projects completed" tone="green" value={metrics?.completedProjects || 0} />
          <PremiumMetricCard icon={AlertTriangle} title="Delayed projects" tone="red" value={metrics?.delayedProjects || 0} />
          <PremiumMetricCard currency icon={BadgeIndianRupee} title="Contract value" value={metrics?.totalContractValue || 0} />
          <PremiumMetricCard currency icon={ReceiptText} title="BOQ value" value={metrics?.totalBoqValue || 0} />
          <PremiumMetricCard currency icon={ReceiptText} title="Billed amount" tone="green" value={metrics?.totalBilled || 0} />
          <PremiumMetricCard currency icon={WalletCards} title="Received amount" tone="green" value={metrics?.totalReceived || 0} />
          <PremiumMetricCard currency icon={BellRing} title="Outstanding" tone="red" value={metrics?.outstanding || 0} />
          <PremiumMetricCard currency icon={Package} title="Material this month" tone="yellow" value={metrics?.materialCostThisMonth || 0} />
          <PremiumMetricCard currency icon={HardHat} title="Labour this month" tone="slate" value={metrics?.labourCostThisMonth || 0} />
          <PremiumMetricCard currency icon={Truck} title="Vendor payable" tone="red" value={metrics?.vendorPayable || 0} />
          <PremiumMetricCard currency icon={BadgeIndianRupee} title="Net profit/loss" tone={(metrics?.netEstimatedProfit || 0) >= 0 ? "green" : "red"} value={metrics?.netEstimatedProfit || 0} />
          <PremiumMetricCard icon={ClipboardCheck} title="Today's updates" value={metrics?.todayUpdates || 0} />
          <PremiumMetricCard icon={Clock3} title="Pending approvals" tone="yellow" value={metrics?.pendingApprovals || 0} />
          <PremiumMetricCard icon={AlertTriangle} title="Overdue bills" tone="red" value={metrics?.overdueBills || 0} />
          <PremiumMetricCard icon={Clock3} title="Upcoming tasks" value={metrics?.upcomingTasks || 0} />
        </div>

        <section className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-glass">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-safety-yellow p-3 text-slate-950">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-safety-yellow">AI business summary</p>
              <p className="mt-3 max-w-4xl text-lg font-semibold leading-8 text-white/78">{summary?.aiInsight}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Billing vs received</h2>
            <BillingChart data={summary?.charts.billing || []} />
          </section>
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Expense category chart</h2>
            <DonutChart data={summary?.charts.expenses || []} />
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Labour cost trend</h2>
            <SimpleBarChart data={summary?.charts.labour || []} />
          </section>
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Material usage trend</h2>
            <SimpleBarChart data={summary?.charts.materials || []} />
          </section>
        </div>

        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
          <h2 className="text-xl font-black">Field quick actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => (
              <Link key={action.href} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-1 hover:border-blueprint hover:bg-white hover:shadow-glow" href={action.href}>
                <action.icon className="h-6 w-6 text-blueprint" aria-hidden="true" />
                <p className="mt-5 text-sm font-black text-slate-950">{action.label}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-black">Recent project updates</h2>
            <RecordGrid emptyTitle="No recent project activity" primary="action" records={summary?.activity || []} secondary="entityType" />
          </section>
          <section>
            <h2 className="mb-4 text-xl font-black">Project timeline progress</h2>
            <RecordGrid amount="progress" emptyTitle="No project progress records" primary="name" records={summary?.projects || []} secondary="status" />
          </section>
        </div>
      </MotionPage>
    </AppShell>
  );
}
