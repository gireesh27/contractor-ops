import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function DailyProgressPage() {
  const config = moduleRegistry["daily-progress"];
  return <ModulePage {...config} description="Daily progress records include date, time, location, site notes, client visibility, and photo linkage." />;
}
