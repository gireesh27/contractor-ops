import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.tasks;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Task records support project, phase, milestone, task, subtask, assigned workers, materials, dependencies, comments, and activity history." />;
}
