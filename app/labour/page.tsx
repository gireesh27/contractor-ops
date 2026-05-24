import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function LabourPage() {
  const config = moduleRegistry.labour;
  return <ModulePage {...config} description="Attendance supports time in/out, geolocation, overtime, photo proof, and wage exports." />;
}
