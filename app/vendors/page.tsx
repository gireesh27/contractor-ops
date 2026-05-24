import { ModulePage } from "@/components/premium/ModulePage";
import { vendorFields } from "@/lib/module-config";

export default function VendorsPage() {
  return <ModulePage amount="openingBalance" collection="vendors" eyebrow="Vendors" fields={vendorFields} primary="name" secondary="type" title="Vendor and subcontractor ledger" />;
}
