import { ModulePage } from "@/components/premium/ModulePage";
import { moduleRegistry } from "@/lib/module-config";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const { projectId } = await searchParams;
  const config = moduleRegistry.payments;
  return <ModulePage {...config} projectId={projectId} showProjectFilter description="Razorpay is primary, Cashfree Payments is fallback, and manual UPI/bank/cash/cheque entries are supported project-wise." />;
}
