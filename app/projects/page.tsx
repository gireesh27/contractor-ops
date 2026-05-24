import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { DatabaseEmptyState } from "@/components/premium/DatabaseEmptyState";
import { MotionPage } from "@/components/premium/MotionPage";
import { RecordGrid } from "@/components/premium/RecordGrid";
import { getProjects } from "@/lib/data-access";
import { projectFields } from "@/lib/module-config";
import { getTenantContext } from "@/lib/tenant";

export default async function ProjectsPage() {
  const tenant = await getTenantContext({ required: true });
  const projects = tenant ? await getProjects(tenant.organizationId) : [];

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="Projects" title="Construction project control">
          <Link className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-glow" href="/projects/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Project
          </Link>
        </SectionHeader>
        {!tenant?.databaseReady ? <DatabaseEmptyState title="MongoDB connection required" /> : null}
        <CrudForm collection="projects" fields={projectFields} />
        <RecordGrid amount="contractValue" emptyTitle="No projects saved yet" primary="name" records={projects} secondary="status" />
      </MotionPage>
    </AppShell>
  );
}
