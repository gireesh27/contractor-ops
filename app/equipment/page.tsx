import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function EquipmentPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.equipment;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Equipment tracking handles owned/rented assets, usage hours, maintenance state, allocation, and rental cost." />;
}
