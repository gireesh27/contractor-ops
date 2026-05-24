import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectPaymentsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.payments} projectId={id} title="Project payment collection" />;
}
