import { Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { listRecords } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

const fields = [
  { name: "title", label: "Report title", required: true },
  { name: "type", label: "Report type", type: "select" as const, options: ["Project summary", "Daily site report", "Weekly site report", "Monthly progress report", "BOQ report", "Measurement book report", "Labour attendance report", "Wage report", "Material stock report", "Equipment usage report", "Client billing report", "Payment outstanding report", "Vendor ledger", "Expense report", "Profit/loss estimate", "Photo proof report"] },
  { name: "filters", label: "Filters / notes", type: "textarea" as const }
];

export default async function ReportsPage() {
  const tenant = await getTenantContext({ required: true });
  const reports = tenant ? await listRecords("reports", tenant.organizationId) : [];

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Reports and exports" title="Professional downloadable reports">
          <a className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white" href="/api/reports/export?title=ContractorOps%20Report&type=reports&format=pdf">
            <Download className="h-4 w-4" aria-hidden="true" />
            PDF
          </a>
          <a className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700" href="/api/reports/export?title=ContractorOps%20Report&type=reports&format=xlsx">
            Excel
          </a>
          <a className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700" href="/api/reports/export?title=ContractorOps%20Report&type=reports&format=docx">
            Word
          </a>
        </SectionHeader>
        <CrudForm collection="reports" fields={fields} />
        <RecordGrid primary="title" records={reports} secondary="type" />
      </MotionPage>
    </AppShell>
  );
}
