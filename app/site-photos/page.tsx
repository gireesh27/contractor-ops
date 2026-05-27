import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function SitePhotosPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry["site-photos"];
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Site photos support Cloudinary/local storage, timestamp, GPS coordinates, before/after tags, and report appendices." />;
}
