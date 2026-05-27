import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProjectSelector } from "@/components/premium/ProjectSelector";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getProjects, listRecords } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

const fields = [
  { name: "title", label: "Report title", required: true },
  { name: "type", label: "Report type", type: "select" as const, options: ["Project summary", "Daily site report", "Weekly site report", "Monthly progress report", "BOQ report", "Measurement book report", "Labour attendance report", "Wage report", "Material stock report", "Equipment usage report", "Client billing report", "Payment outstanding report", "Vendor ledger", "Expense report", "Profit/loss estimate", "Photo proof report"] },
  { name: "filters", label: "Filters / notes", type: "textarea" as const }
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const tenant = await getTenantContext({ required: true });
  const [reports, projects] = tenant
    ? await Promise.all([
        listRecords("reports", tenant.organizationId, { projectId }),
        getProjects(tenant.organizationId)
      ])
    : [[], []];
  const selectedProject = projects.find((project: any) => String(project._id) === projectId);
  const title = selectedProject ? `${selectedProject.name} Complete Project Report` : "ContractorOps Report";
  const projectQuery = projectId ? `&projectId=${projectId}` : "";

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Records and exports" title="Project-wise downloadable records">
          <a className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white" href={`/api/reports/export?title=${encodeURIComponent(title)}&type=project-complete&format=pdf${projectQuery}`}>
            <Download className="h-4 w-4" aria-hidden="true" />
            PDF
          </a>
          <a className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700" href={`/api/reports/export?title=${encodeURIComponent(title)}&type=project-complete&format=xlsx${projectQuery}`}>
            Excel
          </a>
          <a className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700" href={`/api/reports/export?title=${encodeURIComponent(title)}&type=project-complete&format=csv${projectQuery}`}>
            CSV
          </a>
        </SectionHeader>
        <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-glass backdrop-blur-xl">
          <ProjectSelector projects={projects} selectedProjectId={projectId} label="Select project for records/export" />
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Exports include overview, client, workers, attendance, tasks, materials, BOQ, measurements, bills, payments, vendor bills, costs, calendar status, notifications, and reports for the selected project.
          </p>
        </div>
        <CrudForm collection="reports" fields={fields} hidden={projectId ? { projectId } : undefined} />
        <RecordGrid emptyTitle="No project report records yet" primary="title" records={reports} secondary="type" />
      </MotionPage>
    </AppShell>
  );
}
