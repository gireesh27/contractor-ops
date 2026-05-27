import { AppShell } from "@/components/AppShell";
import { AiAssistantClient } from "@/components/ai/AiAssistantClient";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { getProjects } from "@/lib/data-access";
import { generateAiReport } from "@/lib/ai";
import { getTenantContext } from "@/lib/tenant";

export default async function AiAssistantPage() {
  const tenant = await getTenantContext({ required: true });
  const projects = tenant ? await getProjects(tenant.organizationId) : [];
  const result = await generateAiReport({}, "AI Assistant");

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="AI Assistant" title="Structured construction intelligence" />
        <AiAssistantClient initialResult={result} projects={projects.map((project: any) => ({ id: String(project._id), name: project.name, clientName: project.clientName, status: project.status }))} />
      </MotionPage>
    </AppShell>
  );
}
