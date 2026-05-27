import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function DailyProgressPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry["daily-progress"];
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Daily progress records include date, time, location, site notes, client visibility, and photo linkage for the selected project." />;
}
