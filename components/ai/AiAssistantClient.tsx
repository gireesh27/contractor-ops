"use client";

import { useState } from "react";
import { Bot, Copy, Download, Loader2, RefreshCcw, Sparkles } from "lucide-react";

const modes = ["Daily progress report", "Weekly client report", "Monthly progress summary", "Delay explanation", "Payment reminder", "Professional email to client", "WhatsApp message", "BOQ description", "Tender/proposal draft", "Risk summary", "Material wastage insight", "Project profit/loss explanation", "Client meeting summary", "Site inspection checklist", "Safety checklist", "Work method statement"];

type AiResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedMessage: string;
  professionalReport: string;
  whatsappVersion: string;
  emailVersion: string;
};

function toast(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

export function AiAssistantClient({ initialResult }: { initialResult: AiResult }) {
  const [result, setResult] = useState<AiResult>(initialResult);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"auto" | "openai" | "gemini">("auto");

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, provider })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI generation failed.");
      setResult(payload.data);
      toast("AI insight generated.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "AI generation failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <form className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl" onSubmit={generate}>
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            AI provider
            <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" onChange={(event) => setProvider(event.target.value as any)} value={provider}>
              <option value="auto">Auto</option>
              <option value="openai">ChatGPT / OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            AI capability
            <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name="mode" defaultValue="Daily progress report">
              {modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </label>
          {["projectName", "clientName", "pendingPayments"].map((name) => (
            <input key={name} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name={name} placeholder={name.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} />
          ))}
          <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" min={0} name="labourCount" placeholder="Labour count" type="number" />
          {["workCompleted", "materialsUsed", "issuesOrDelays", "notes"].map((name) => (
            <textarea key={name} className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name={name} placeholder={name.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} />
          ))}
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950" disabled={loading} type="submit">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate insight"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-glass">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-safety-yellow">
            <Bot className="h-4 w-4" aria-hidden="true" />
            {result.title}
          </div>
          <h2 className="mt-5 text-3xl font-black">Professional output</h2>
          <p className="mt-3 leading-7 text-white/72">{result.summary}</p>
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
  );
}

function AiCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[1.75rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" onClick={() => navigator.clipboard.writeText(body).then(() => toast("Copied to clipboard.", "success"))} type="button"><Copy className="h-4 w-4" /> Copy</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" type="button"><Download className="h-4 w-4" /> PDF</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" onClick={() => toast("Adjust the prompt and generate again.", "info")} type="button"><RefreshCcw className="h-4 w-4" /> Regenerate</button>
      </div>
    </article>
  );
}
