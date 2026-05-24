import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectMaterialsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.materials} projectId={id} title="Project material tracking" />;
}
