import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function EquipmentPage() {
  const config = moduleRegistry.equipment;
  return <ModulePage {...config} description="Equipment tracking handles owned/rented assets, usage hours, maintenance state, allocation, and rental cost." />;
}
