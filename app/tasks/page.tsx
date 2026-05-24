import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function TasksPage() {
  const config = moduleRegistry.tasks;
  return <ModulePage {...config} description="Task records support Kanban, list, calendar, reminders, comments, attachments, and activity history." />;
}
