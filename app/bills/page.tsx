import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.bills;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Bills support BOQ percentage, measurement-book, manual billing, payment links, reminders, and PDF/Word/Excel export for the selected project." />;
}
