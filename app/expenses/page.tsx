import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function ExpensesPage() {
  const config = moduleRegistry.expenses;
  return <ModulePage {...config} description="Expenses are stored by project, category, mode, receipt, and remarks for project-wise profit/loss control." />;
}
