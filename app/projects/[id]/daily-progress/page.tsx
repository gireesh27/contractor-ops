import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectDailyProgressPage({ params }: PageProps) {
  const { id } = await params;
  return <ModulePage {...moduleRegistry["daily-progress"]} projectId={id} title="Project daily site progress" />;
}
