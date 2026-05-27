import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function BOQPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.boq;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="BOQ records store quantity, GST, wastage, labour/material components, margin, measurements, estimates, and revision linkage." />;
}
