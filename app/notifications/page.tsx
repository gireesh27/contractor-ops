import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.notifications;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Notifications are created only for meaningful project events like overdue tasks, material price overruns, pending bills, and measurement approvals." />;
}
