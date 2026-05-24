import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function MeasurementsPage() {
  const config = moduleRegistry.measurements;
  return <ModulePage {...config} description="Measurement book records support formulas, approval workflow, BOQ comparison, and billing linkage." />;
}
