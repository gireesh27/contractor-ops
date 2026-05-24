import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function NotificationsPage() {
  const config = moduleRegistry.notifications;
  return <ModulePage {...config} description="Notifications support overdue bills, task due dates, low stock, missing attendance, daily progress reminders, and push permission." />;
}
