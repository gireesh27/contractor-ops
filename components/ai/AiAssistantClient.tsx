"use client";

import { useState } from "react";
import { Bot, Copy, Download, Loader2, RefreshCcw, Search, Sparkles } from "lucide-react";
import { DonutChart, SimpleBarChart } from "@/components/charts/BusinessCharts";
import { formatCurrency } from "@/lib/utils";

type AiResult = {
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedMessage: string;
  professionalReport: string;
  whatsappVersion: string;
  emailVersion: string;
  kpis?: Array<{ label: string; value: string | number }>;
  charts?: Array<{ type: "pie" | "bar" | "line" | "area"; title: string; data: Array<{ label: string; value: number }> }>;
  risks?: string[];
  suggestedActions?: string[];
  databaseRisks?: string[];
  databaseRecommendations?: string[];
};

type ProjectOption = {
  id: string;
  name: string;
  clientName?: string | null;
  status?: string | null;
};

const emptyResult: AiResult = {
  title: "ContractorOps AI Assistant",
  summary: "Ask a project question and the assistant will use your database records to generate an answer.",
  keyPoints: [
    "Ask about BOQ, billing, payments, labour, materials, expenses, profit/loss, delays, measurements, vendors, or reports.",
    "The answer should be based on database records, not manual form input."
  ],
  suggestedMessage: "Example: What is the current BOQ vs billed status for Project A?",
  professionalReport: "No report generated yet.",
  whatsappVersion: "No WhatsApp summary generated yet.",
  emailVersion: "No email generated yet."
};

function toast(title: string, type: "success" | "error" | "info" = "info") {
  window.dispatchEvent(new CustomEvent("contractorops:toast", { detail: { title, type } }));
}

export function AiAssistantClient({
  initialResult = emptyResult,
  projects = []
}: {
  initialResult?: AiResult;
  projects?: ProjectOption[];
}) {
  const [result, setResult] = useState<AiResult>(initialResult);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  async function askAssistant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const body = {
      projectId: String(form.get("projectId") || ""),
      projectName: String(form.get("projectName") || ""),
      question: String(form.get("question") || "")
    };

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) throw new Error(payload.error || "AI assistant failed.");

      setResult(payload.data);
      toast("AI answer generated from project database.", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "AI assistant failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <form className="rounded-[2rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl" onSubmit={askAssistant}>
        <div className="grid gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-safety-yellow">
              <Bot className="h-4 w-4" aria-hidden="true" />
              Database AI Assistant
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-950">Ask about a project</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose a project and ask anything about BOQ, billing, payments, labour, materials, expenses, delays, vendors, profit/loss, or reports.
            </p>
          </div>

          {projects.length > 0 ? (
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Project
              <select className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name="projectId" required>
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}{project.clientName ? ` — ${project.clientName}` : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Project name
              <input className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10" name="projectName" placeholder="Enter project name" required />
            </label>
          )}

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Question
            <textarea
              className="min-h-36 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blueprint focus:ring-4 focus:ring-blue-500/10"
              name="question"
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: What is the BOQ value, billed amount, outstanding amount, and profit/loss for this project?"
              required
              value={question}
            />
          </label>

          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            <button className="text-left font-bold hover:text-blueprint" type="button" onClick={() => setQuestion("Give me full project health: BOQ value, contract value, billed amount, received amount, outstanding, labour cost, material cost, vendor payable, and profit/loss.")}>Full project health</button>
            <button className="text-left font-bold hover:text-blueprint" type="button" onClick={() => setQuestion("Compare BOQ, measurements, bills, and payments. Tell me what is missing or risky.")}>BOQ vs billing check</button>
            <button className="text-left font-bold hover:text-blueprint" type="button" onClick={() => setQuestion("Find delays, cost overruns, pending approvals, and upcoming risks from the project database.")}>Risk and delay insight</button>
          </div>

          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950" disabled={loading} type="submit">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Searching database..." : "Ask AI"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        <article className="rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-glass">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-safety-yellow">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {result.title}
          </div>
          <h2 className="mt-5 text-3xl font-black">Database insight</h2>
          <p className="mt-3 leading-7 text-white/72">{result.summary}</p>
        </article>

        {result.kpis?.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {result.kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-[1.5rem] border border-white/80 bg-white/86 p-4 shadow-glass backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{kpi.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{typeof kpi.value === "number" ? formatCurrency(kpi.value) : kpi.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {result.charts?.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {result.charts.map((chart) => (
              <article key={chart.title} className="rounded-[1.75rem] border border-white/80 bg-white/86 p-5 shadow-glass backdrop-blur-xl">
                <h3 className="text-lg font-black">{chart.title}</h3>
                {chart.type === "pie" ? <DonutChart data={chart.data || []} /> : <SimpleBarChart data={chart.data || []} />}
              </article>
            ))}
          </div>
        ) : null}

        {(result.databaseRisks?.length || result.databaseRecommendations?.length) ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <AiCard title="Database risks" body={(result.databaseRisks || []).join("\n") || "No database risks found."} />
            <AiCard title="Database recommendations" body={(result.databaseRecommendations || []).join("\n") || "No database recommendations found."} />
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <AiCard title="Key points" body={result.keyPoints.join("\n")} />
          <AiCard title="Suggested action/message" body={result.suggestedMessage} />
          <AiCard title="Professional report" body={result.professionalReport} />
          <AiCard title="WhatsApp summary" body={result.whatsappVersion} />
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
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" onClick={() => toast("PDF export needs to be connected to your report/PDF service.", "info")} type="button"><Download className="h-4 w-4" /> PDF</button>
        <button className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 px-3 text-xs font-black text-slate-600" onClick={() => toast("Ask a sharper project question and run again.", "info")} type="button"><RefreshCcw className="h-4 w-4" /> Regenerate</button>
      </div>
    </article>
  );
}
