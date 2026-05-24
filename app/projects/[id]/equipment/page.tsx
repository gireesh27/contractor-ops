import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectEquipmentPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry.equipment} projectId={id} title="Project equipment" />;
}
