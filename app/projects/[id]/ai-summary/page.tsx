import { AppShell } from "@/components/AppShell";
import { AiAssistantClient } from "@/components/ai/AiAssistantClient";
import { ProjectTabs } from "@/components/ProjectTabs";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { generateAiReport } from "@/lib/ai";
import { getProjectBundle } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

interface PageProps { params: Promise<{ id: string }> }
export default async function ProjectAiSummaryPage({ params }: PageProps) {
  const { id } = await params;
  const tenant = await getTenantContext({ required: true });
  const bundle = tenant ? await getProjectBundle(tenant.organizationId, id) : null;
  const result = await generateAiReport({
    projectName: bundle?.project?.name,
    clientName: bundle?.project?.clientName,
    rawData: bundle
  }, "Project risk and cash-flow summary");

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="AI Summary" title="Project intelligence" />
        <ProjectTabs projectId={id} />
        <AiAssistantClient
          initialResult={result}
          projects={bundle ? [{ id, name: bundle.project.name, clientName: bundle.project.clientName, status: bundle.project.status }] : []}
        />
      </MotionPage>
    </AppShell>
  );
}
