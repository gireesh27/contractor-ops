import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function BOQPage() {
  const config = moduleRegistry.boq;
  return <ModulePage {...config} description="BOQ records store quantity, GST, wastage, labour/material components, margin, and revision linkage." />;
}
