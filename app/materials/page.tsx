import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.materials;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Material transactions calculate stock movement, purchase cost, usage, wastage, transfer, due items, vendor-wise spend, and low-stock alerts for the selected project." />;
}
