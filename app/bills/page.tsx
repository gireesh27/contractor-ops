import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function BillsPage() {
  const config = moduleRegistry.bills;
  return <ModulePage {...config} description="Bills support BOQ percentage, measurement-book, manual billing, payment links, reminders, and PDF/Word/Excel export." />;
}
