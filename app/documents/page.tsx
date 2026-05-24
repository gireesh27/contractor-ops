import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function DocumentsPage() {
  const config = moduleRegistry.documents;
  return <ModulePage {...config} description="Documents can be tagged by project and type, attached to reports, previewed, and downloaded securely." />;
}
