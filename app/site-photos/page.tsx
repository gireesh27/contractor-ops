import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function SitePhotosPage() {
  const config = moduleRegistry["site-photos"];
  return <ModulePage {...config} description="Site photos support Cloudinary/local storage, timestamp, GPS coordinates, before/after tags, and report appendices." />;
}
