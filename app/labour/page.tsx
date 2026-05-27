import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function LabourPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.labour;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Attendance supports time in/out, geolocation, overtime, photo proof, and wage exports for the selected project." />;
}
