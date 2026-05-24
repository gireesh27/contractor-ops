import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function SchedulePage() {
  const config = moduleRegistry.schedule;
  return <ModulePage {...config} description="Calendar, timeline, task board, and basic Gantt-style views can be layered on the same ScheduleTask collection." />;
}
