import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { DatabaseEmptyState } from "@/components/premium/DatabaseEmptyState";
import { MotionPage } from "@/components/premium/MotionPage";
import { CrudForm, type CrudField } from "@/components/premium/CrudForm";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { listRecords } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";
import type { CollectionName } from "@/lib/db/models";

export async function ModulePage({
  title,
  eyebrow,
  collection,
  fields,
  projectId,
  primary,
  secondary,
  amount,
  description
}: {
  title: string;
  eyebrow: string;
  collection: CollectionName;
  fields: CrudField[];
  projectId?: string;
  primary?: string;
  secondary?: string;
  amount?: string;
  description?: string;
}) {
  const tenant = await getTenantContext({ required: true });
  const records = tenant ? await listRecords(collection, tenant.organizationId, { projectId }) : [];

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow={eyebrow} title={title} />
        {!tenant?.databaseReady ? (
          <DatabaseEmptyState body="Configure MONGODB_URI to enable real CRUD operations. This app does not fall back to fake demo data." title="MongoDB connection required" />
        ) : null}
        <CrudForm collection={collection} fields={fields} hidden={projectId ? { projectId } : undefined} />
        <RecordGrid amount={amount} emptyTitle={`No ${eyebrow.toLowerCase()} records yet`} primary={primary} records={records} secondary={secondary} />
        {description ? <p className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-900">{description}</p> : null}
      </MotionPage>
    </AppShell>
  );
}
