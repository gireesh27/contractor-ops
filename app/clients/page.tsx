import { ModulePage } from "@/components/premium/ModulePage";
import { clientFields } from "@/lib/module-config";

export default function ClientsPage() {
  return <ModulePage collection="clients" eyebrow="Clients" fields={clientFields} primary="name" secondary="phone" title="Clients and outstanding control" />;
}
