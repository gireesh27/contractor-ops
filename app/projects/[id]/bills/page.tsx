import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectBillsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.bills} projectId={id} title="Project client billing" />;
}
