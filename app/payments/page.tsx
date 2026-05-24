import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default function PaymentsPage() {
  const config = moduleRegistry.payments;
  return <ModulePage {...config} description="Razorpay is primary, Cashfree Payments is fallback, and manual UPI/bank/cash/cheque entries are supported." />;
}
