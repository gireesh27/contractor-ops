import { Bot, Copy, Download, RefreshCcw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { CrudForm } from "@/components/premium/CrudForm";
import { MotionPage } from "@/components/premium/MotionPage";
import { generateAiReport } from "@/lib/ai";

const fields = [
  { name: "mode", label: "AI capability", type: "select" as const, options: ["Daily progress report", "Weekly client report", "Monthly progress summary", "Delay explanation", "Payment reminder", "Professional email to client", "WhatsApp message", "BOQ description", "Tender/proposal draft", "Risk summary", "Material wastage insight", "Project profit/loss explanation", "Client meeting summary", "Site inspection checklist", "Safety checklist", "Work method statement"] },
  { name: "projectName", label: "Project name" },
  { name: "clientName", label: "Client name" },
  { name: "workCompleted", label: "Work completed", type: "textarea" as const },
  { name: "labourCount", label: "Labour count", type: "number" as const },
  { name: "materialsUsed", label: "Materials used", type: "textarea" as const },
  { name: "issuesOrDelays", label: "Issues / delays", type: "textarea" as const },
  { name: "pendingPayments", label: "Pending payments", type: "textarea" as const },
  { name: "notes", label: "Notes", type: "textarea" as const }
];

export default async function AiAssistantPage() {
  const result = await generateAiReport({}, "AI Assistant");

  return (
    <AppShell>
      <MotionPage>
        <SectionHeader eyebrow="AI Assistant" title="Structured construction intelligence" />
        <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
          <div>
            <CrudForm collection="reports" fields={fields} compact />
            <p className="mt-4 rounded-3xl bg-blue-50 p-5 text-sm font-semibold leading-6 text-blue-900">
              The API endpoint uses actual tenant project data when a project is selected. Add OPENAI_API_KEY or GEMINI_API_KEY to enable live AI generation.
            </p>
          </div>
          <div className="grid gap-4">
            <article className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-glass">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-safety-yellow">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    {result.title}
                  </div>
                  <h2 className="mt-5 text-3xl font-black">Professional output</h2>
                  <p className="mt-3 leading-7 text-white/72">{result.summary}</p>
                </div>
                <Sparkles className="h-7 w-7 text-safety-yellow" aria-hidden="true" />
              </div>
            </article>
            <div className="grid gap-4 lg:grid-cols-2">
              <AiCard title="Key points" body={result.keyPoints.join("\n")} />
              <AiCard title="Suggested message" body={result.suggestedMessage} />
              <AiCard title="Professional report version" body={result.professionalReport} />
              <AiCard title="WhatsApp short version" body={result.whatsappVersion} />
              <AiCard title="Email version" body={result.emailVersion} />
            </div>
          </div>
        </section>
      </MotionPage>
    </AppShell>
  );
}

function AiCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[1.75rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" type="button"><Copy className="h-4 w-4" /> Copy</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" type="button"><Download className="h-4 w-4" /> PDF</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" type="button"><RefreshCcw className="h-4 w-4" /> Regenerate</button>
      </div>
    </article>
  );
}
