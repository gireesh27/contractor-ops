import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectDocumentsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.documents} projectId={id} title="Project documents" />;
}
