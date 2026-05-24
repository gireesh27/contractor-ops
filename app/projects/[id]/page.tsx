import { AlertTriangle, BadgeIndianRupee, Clock3, HardHat, Package, ReceiptText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { PremiumMetricCard } from "@/components/premium/PremiumMetricCard";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getProjectBundle } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

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

  const { project, bills, payments, materialTransactions, labour, tasks, photos } = bundle;
  const billed = bills.reduce((sum: number, row: any) => sum + Number(row.netPayable || 0), 0);
  const received = payments.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
  const materials = materialTransactions.reduce((sum: number, row: any) => sum + Number(row.totalCost || 0), 0);
  const wages = labour.reduce((sum: number, row: any) => sum + Number(row.wageCalculated || 0), 0);

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
          <PremiumMetricCard currency icon={ReceiptText} title="Billed" tone="green" value={billed} />
          <PremiumMetricCard currency icon={AlertTriangle} title="Outstanding" tone="red" value={billed - received} />
          <PremiumMetricCard currency icon={Package} title="Material cost" tone="yellow" value={materials} />
          <PremiumMetricCard currency icon={HardHat} title="Labour cost" tone="slate" value={wages} />
          <PremiumMetricCard icon={Clock3} title="Upcoming tasks" value={tasks.length} />
          <PremiumMetricCard icon={Package} title="Site photos" value={photos.length} />
          <PremiumMetricCard currency icon={BadgeIndianRupee} title="Estimated profit/loss" tone={billed - materials - wages >= 0 ? "green" : "red"} value={billed - materials - wages} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <RecordGrid emptyTitle="No recent tasks" primary="title" records={tasks.slice(0, 4)} secondary="status" />
          <RecordGrid emptyTitle="No recent site photos" primary="description" records={photos.slice(0, 4)} secondary="workCategory" />
        </div>
      </MotionPage>
    </AppShell>
  );
}
