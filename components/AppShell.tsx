import { AppNav } from "@/components/premium/AppNav";
import { ToastProvider } from "@/components/premium/ToastProvider";
import { getTenantContext } from "@/lib/tenant";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const tenant = await getTenantContext({ required: true });

  return (
    <AppNav
      databaseReady={tenant?.databaseReady ?? false}
      organizationName={tenant?.organizationName || "ContractorOps"}
      role={tenant?.role || "Viewer"}
      userName={tenant?.userName}
    >
      {children}
      <ToastProvider />
    </AppNav>
  );
}
