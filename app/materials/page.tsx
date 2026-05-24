import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function MaterialsPage() {
  const config = moduleRegistry.materials;
  return <ModulePage {...config} description="Material transactions calculate stock movement, purchase cost, usage, wastage, transfer, and low-stock alerts." />;
}
