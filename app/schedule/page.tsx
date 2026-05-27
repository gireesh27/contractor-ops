import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.schedule;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Calendar, timeline, task board, and basic Gantt-style views are scoped to the selected project." />;
}
