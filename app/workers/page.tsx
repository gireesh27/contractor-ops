import { ModulePage } from "@/components/premium/ModulePage";
import { workerFields } from "@/lib/module-config";

export default function WorkersPage() {
  return <ModulePage amount="dailyWage" collection="workers" eyebrow="Workers" fields={workerFields} primary="name" secondary="skillType" title="Labour master and wage setup" />;
}
