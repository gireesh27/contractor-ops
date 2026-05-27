import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.documents;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Documents can be tagged by project and type, attached to reports, previewed, and downloaded securely." />;
}
