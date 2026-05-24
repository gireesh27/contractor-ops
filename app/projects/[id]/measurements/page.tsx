import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectMeasurementsPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.measurements} projectId={id} title="Project measurement book" />;
}
