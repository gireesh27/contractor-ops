import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.expenses;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Expenses are stored by project, category, mode, receipt, and remarks for project-wise profit/loss control." />;
}
