import { env, hasAiProvider } from "@/lib/env";

export interface AiReportInput {
  projectName?: string;
  clientName?: string;
  workCompleted?: string;
  labourCount?: number;
  materialsUsed?: string;
  issuesOrDelays?: string;
  photosSummary?: string;
  pendingPayments?: string;
  notes?: string;
  module?: string;
  rawData?: unknown;
}

export interface StructuredAiResult {
  configured: boolean;
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedMessage: string;
  professionalReport: string;
  whatsappVersion: string;
  emailVersion: string;
}

export async function generateAiReport(input: AiReportInput, mode = "Daily progress report", provider: "openai" | "gemini" | "auto" = "auto"): Promise<StructuredAiResult> {
  if (!hasAiProvider()) {
    return {
      configured: false,
      title: "AI API key not configured",
      summary: "AI API key not configured. Add OPENAI_API_KEY or GEMINI_API_KEY to enable AI-generated reports.",
      keyPoints: ["Connect an AI provider", "Use project, BOQ, labour, material, billing, and payment data", "Generate professional client-ready reports"],
      suggestedMessage: "Add OPENAI_API_KEY or GEMINI_API_KEY to enable AI-generated reports.",
      professionalReport: "AI report generation is disabled until an AI provider is configured.",
      whatsappVersion: "AI is not configured yet.",
      emailVersion: "AI report generation is disabled until an AI provider is configured."
    };
  }

  const selectedProvider = provider === "auto" ? (env.openAiApiKey ? "openai" : "gemini") : provider;
  try {
    const prompt = buildAiPrompt(input, mode);
    const generated = selectedProvider === "openai" ? await callOpenAi(prompt) : await callGemini(prompt);
    return normalizeAiResult(generated, mode);
  } catch (error) {
    return {
      configured: true,
      title: `${mode} unavailable`,
      summary: error instanceof Error ? error.message : "AI provider request failed.",
      keyPoints: ["The AI provider request failed", "Check API key, quota, model availability, and network access", "Retry after fixing provider configuration"],
      suggestedMessage: "AI generation failed. Please try again later.",
      professionalReport: "AI generation failed before a professional report could be created.",
      whatsappVersion: "AI generation failed.",
      emailVersion: "AI generation failed. Please retry after provider configuration is verified."
    };
  }
}

function fallbackReport(input: AiReportInput, mode: string): StructuredAiResult {
  const project = input.projectName || "selected project";
  const client = input.clientName || "client";
  const completed = input.workCompleted || "site progress has been recorded";
  const materials = input.materialsUsed || "recorded materials";
  const delay = input.issuesOrDelays ? `A delay/risk note was recorded: ${input.issuesOrDelays}.` : "No major delay has been recorded.";

  return {
    configured: true,
    title: mode,
    summary: `${project}: ${completed}. Labour count: ${input.labourCount ?? 0}. ${delay}`,
    keyPoints: [
      `Project: ${project}`,
      `Client: ${client}`,
      `Work update: ${completed}`,
      `Materials: ${materials}`,
      input.pendingPayments ? `Payment follow-up: ${input.pendingPayments}` : "No payment escalation added"
    ],
    suggestedMessage: `Hello ${client}, ${completed} for ${project}. ${delay}`,
    professionalReport: `For ${project}, ${completed}. A total of ${input.labourCount ?? 0} workers were recorded. Materials used: ${materials}. ${delay} ${input.notes || ""}`.trim(),
    whatsappVersion: `Update for ${project}: ${completed}. Labour: ${input.labourCount ?? 0}. ${delay}`,
    emailVersion: `Dear ${client},\n\nPlease find the latest update for ${project}.\n\n${completed}\nMaterials used: ${materials}\n${delay}\n\nRegards,\nContractorOps`
  };
}

function buildAiPrompt(input: AiReportInput, mode: string) {
  return `You are ContractorOps, a professional construction operations assistant for Indian contractors.
Generate a structured ${mode}.
Use only the supplied tenant-scoped data. Do not invent names, amounts, testimonials, or facts.
Return strict JSON with these string fields: title, summary, suggestedMessage, professionalReport, whatsappVersion, emailVersion; and keyPoints as an array of short strings.

Input:
${JSON.stringify(input, null, 2)}`;
}

async function callOpenAi(prompt: string) {
  if (!env.openAiApiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
      text: { format: { type: "json_object" } }
    }),
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "OpenAI request failed.");
  return payload.output_text || payload.output?.flatMap((item: any) => item.content || []).find((part: any) => part.type === "output_text")?.text || "";
}

async function callGemini(prompt: string) {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.geminiApiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    }),
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message || "Gemini request failed.");
  return payload.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join("\n") || "";
}

function normalizeAiResult(value: string, mode: string): StructuredAiResult {
  try {
    const parsed = JSON.parse(value);
    return {
      configured: true,
      title: String(parsed.title || mode),
      summary: String(parsed.summary || ""),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String).slice(0, 8) : [],
      suggestedMessage: String(parsed.suggestedMessage || ""),
      professionalReport: String(parsed.professionalReport || ""),
      whatsappVersion: String(parsed.whatsappVersion || ""),
      emailVersion: String(parsed.emailVersion || "")
    };
  } catch {
    const base = fallbackReport({ workCompleted: value }, mode);
    return { ...base, configured: true, professionalReport: value || base.professionalReport };
  }
}
