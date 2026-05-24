import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectBOQPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.boq} projectId={id} title="Project BOQ and estimate" />;
}
