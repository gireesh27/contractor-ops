import Link from "next/link";
import { AlertTriangle, BadgeIndianRupee, Bell, Building2, CalendarDays, CheckCircle2, Clock3, FileText, HardHat, MapPin, Package, ReceiptText, Ruler, Truck, UsersRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DonutChart, SimpleBarChart } from "@/components/charts/BusinessCharts";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { PremiumMetricCard } from "@/components/premium/PremiumMetricCard";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getProjectBundle } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tenant = await getTenantContext({ required: true });
  const bundle = tenant ? await getProjectBundle(tenant.organizationId, id) : null;

  if (!bundle) {
    return (
      <AppShell>
        <SectionHeader eyebrow="Project" title="Project not found" />
      </AppShell>
    );
  }

  const { project, bills, payments, materialTransactions, labour, workers, tasks, schedule, progress, measurements, boqItems, reports, notifications, vendorTransactions, expenses, photos, analytics } = bundle;
  const metrics = analytics.metrics;

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Project overview" title={project.name}>
          <StatusBadge status={project.status || "Draft"} />
        </SectionHeader>
        <ProjectTabs projectId={String(project._id)} />
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">{project.clientName || "Client not linked"} - {project.location || "Site location pending"}</p>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">{project.description || "Add project description, drawings, milestones, and site details."}</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-slate-600 md:grid-cols-3">
                <InfoTile label="Client" value={project.clientName || "Not linked"} />
                <InfoTile label="Contractor / engineer" value={project.assignedEngineer || project.contractorName || "Not assigned"} />
                <InfoTile label="Site" value={project.siteAddress || project.location || "Location pending"} />
                <InfoTile label="Start date" value={project.startDate ? formatDate(project.startDate) : "Not set"} />
                <InfoTile label="End date" value={project.expectedEndDate ? formatDate(project.expectedEndDate) : "Not set"} />
                <InfoTile label="Health" value={project.riskStatus || "Healthy"} />
              </div>
            </div>
            <div className="min-w-64 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-safety-yellow">Progress</p>
              <p className="mt-2 text-5xl font-black">{Number(project.progress || 0)}%</p>
              <div className="mt-4 h-3 rounded-full bg-white/15">
                <div className="h-3 rounded-full bg-safety-yellow" style={{ width: `${Math.min(100, Number(project.progress || 0))}%` }} />
              </div>
            </div>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PremiumMetricCard currency icon={BadgeIndianRupee} title="Contract value" value={Number(project.contractValue || 0)} />
          <PremiumMetricCard currency icon={ReceiptText} title="Billed" tone="green" value={metrics.billed} />
          <PremiumMetricCard currency icon={AlertTriangle} title="Outstanding" tone="red" value={metrics.outstanding} />
          <PremiumMetricCard currency icon={Package} title="Material cost" tone="yellow" value={metrics.materialCost} />
          <PremiumMetricCard currency icon={HardHat} title="Labour cost" tone="slate" value={metrics.labourCost} />
          <PremiumMetricCard icon={Clock3} title="Upcoming tasks" value={tasks.length} />
          <PremiumMetricCard icon={Package} title="Site photos" value={photos.length} />
          <PremiumMetricCard currency icon={BadgeIndianRupee} title="Estimated profit/loss" tone={metrics.profitLoss >= 0 ? "green" : "red"} value={metrics.profitLoss} />
        </div>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Project hierarchy</h2>
            <div className="mt-5 grid gap-3">
              <HierarchyRow icon={Building2} label="Organization" value={tenant?.organizationName || "Organization"} />
              <HierarchyRow icon={MapPin} label="Project details" value={`${project.name} - ${project.status || "Draft"}`} />
              <HierarchyRow icon={CalendarDays} label="Tasks / Activities" value={`${tasks.length} task(s), ${schedule.length} schedule item(s)`} href={`/projects/${project._id}/tasks`} />
              <HierarchyRow icon={UsersRound} label="Workers / Attendance" value={`${workers.length} assigned worker(s), ${metrics.workersOnline} present today`} href={`/projects/${project._id}/labour`} />
              <HierarchyRow icon={Package} label="Materials" value={`${materialTransactions.length} transaction(s), ${metrics.materialShortageCount} shortage alert(s)`} href={`/projects/${project._id}/materials`} />
              <HierarchyRow icon={Ruler} label="Measurements / BOQ" value={`${measurements.length} measurement(s), ${boqItems.length} BOQ item(s)`} href={`/projects/${project._id}/measurements`} />
              <HierarchyRow icon={ReceiptText} label="Bills / Payments" value={`${bills.length} bill(s), outstanding ${formatCurrency(metrics.outstanding)}`} href={`/projects/${project._id}/bills`} />
              <HierarchyRow icon={Bell} label="Records / Notifications" value={`${reports.length} report(s), ${notifications.length} notification(s)`} href={`/projects/${project._id}/reports`} />
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Risk alerts</h2>
            <div className="mt-5 grid gap-3">
              {analytics.risks.length ? analytics.risks.map((risk: string) => (
                <div key={risk} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                  {risk}
                </div>
              )) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                  No project risk alerts from current records.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Budget vs actual</h2>
            <SimpleBarChart data={analytics.charts.budgetVsActual} />
          </section>
          <section className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
            <h2 className="text-xl font-black">Cost breakdown</h2>
            <DonutChart data={analytics.charts.costBreakdown} />
          </section>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Tasks / activities</h2>
              <Link className="text-sm font-black text-blueprint" href={`/projects/${project._id}/tasks`}>Open tasks</Link>
            </div>
            <RecordGrid emptyTitle="No project tasks" hrefForRecord={() => `/projects/${project._id}/tasks`} primary="title" records={tasks.slice(0, 6)} secondary="status" />
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Material requirements</h2>
              <Link className="text-sm font-black text-blueprint" href={`/projects/${project._id}/materials`}>Open materials</Link>
            </div>
            <RecordGrid amount="totalCost" emptyTitle="No project materials" primary="materialName" records={materialTransactions.slice(0, 6)} secondary="transactionType" />
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Measurements and BOQ</h2>
              <Link className="text-sm font-black text-blueprint" href={`/projects/${project._id}/measurements`}>Open measurements</Link>
            </div>
            <RecordGrid amount="amount" emptyTitle="No project measurements" primary="workCategory" records={measurements.slice(0, 6)} secondary="approvalStatus" />
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Records / reports / notifications</h2>
              <Link className="text-sm font-black text-blueprint" href={`/projects/${project._id}/reports`}>Open records</Link>
            </div>
            <RecordGrid emptyTitle="No project notifications" hrefForRecord={(row) => row.link || `/projects/${project._id}`} primary="title" records={notifications.slice(0, 6)} secondary="severity" />
          </section>
        </div>
      </MotionPage>
    </AppShell>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 truncate font-bold text-slate-700 dark:text-slate-100">{value}</p>
    </div>
  );
}

function HierarchyRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm dark:bg-white/5">
      <div className="rounded-xl bg-blueprint p-2 text-white">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-950 dark:text-white">{label}</p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
