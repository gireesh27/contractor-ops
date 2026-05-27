import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function MeasurementsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.measurements;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Measurement hierarchy: Project -> Work Category -> BOQ Item -> Task/Activity -> Measurement Entry." />;
}
