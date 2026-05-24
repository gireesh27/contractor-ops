import { AppShell } from "@/components/AppShell";
import { AiAssistantClient } from "@/components/ai/AiAssistantClient";
import { SectionHeader } from "@/components/SectionHeader";
import { MotionPage } from "@/components/premium/MotionPage";
import { generateAiReport } from "@/lib/ai";

export default async function AiAssistantPage() {
  const result = await generateAiReport({}, "AI Assistant");

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="AI Assistant" title="Structured construction intelligence" />
        <AiAssistantClient initialResult={result} />
      </MotionPage>
    </AppShell>
  );
}
