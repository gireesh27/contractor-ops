import { env } from "@/lib/env";

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

export interface ContractorOpsDashboardSnapshot {
  activeProjects?: number;
  projectsCompleted?: number;
  delayedProjects?: number;
  contractValue?: number;
  boqValue?: number;
  billedAmount?: number;
  receivedAmount?: number;
  outstanding?: number;
  materialThisMonth?: number;
  labourThisMonth?: number;
  vendorPayable?: number;
  netProfitLoss?: number;
  todaysUpdates?: number;
  pendingApprovals?: number;
  overdueBills?: number;
  upcomingTasks?: number;
  [key: string]: unknown;
}

export interface ContractorOpsDatabaseContext {
  project?: unknown;
  projects?: unknown[];
  boq?: unknown[];
  estimates?: unknown[];
  schedule?: unknown[];
  tasks?: unknown[];
  dailyProgress?: unknown[];
  labour?: unknown[];
  materials?: unknown[];
  equipment?: unknown[];
  measurements?: unknown[];
  bills?: unknown[];
  payments?: unknown[];
  vendors?: unknown[];
  expenses?: unknown[];
  sitePhotos?: unknown[];
  documents?: unknown[];
  reports?: unknown[];
  [key: string]: unknown;
}

export interface ProjectAiQuestionInput {
  projectId?: string;
  projectName?: string;
  question: string;
  dashboard?: ContractorOpsDashboardSnapshot;
  data?: ContractorOpsDatabaseContext;
  rawData?: unknown;
}

export interface StructuredAiResult {
  configured: boolean;
  title: string;
  summary: string;
  answer: string;
  keyPoints: string[];
  insights: string[];
  risks: string[];
  suggestedActions: string[];
  dataUsed: string[];
  followUpQuestions: string[];
  suggestedMessage: string;
  professionalReport: string;
  whatsappVersion: string;
  emailVersion: string;
}

type AiProvider = "openrouter" | "openai" | "gemini" | "auto";

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
const MAX_CONTEXT_CHARS = Number(process.env.AI_CONTEXT_MAX_CHARS || 60_000);

export async function generateProjectAiAnswer(
  input: ProjectAiQuestionInput,
  provider: AiProvider = "auto"
): Promise<StructuredAiResult> {
  if (!env.openRouterApiKey) {
    return notConfiguredResult();
  }

  const question = input.question?.trim();

  if (!question) {
    return {
      configured: true,
      title: "Ask a project question",
      summary: "No question was provided.",
      answer: "Please ask a clear question about a project, BOQ, billing, labour, material, vendors, or site progress.",
      keyPoints: ["Select a project", "Ask one clear question", "The assistant will use database context only"],
      insights: [],
      risks: [],
      suggestedActions: [],
      dataUsed: [],
      followUpQuestions: ["Which project do you want to check?", "What do you want to know about it?"],
      suggestedMessage: "Please select a project and ask your question.",
      professionalReport: "No AI answer was generated because the question was empty.",
      whatsappVersion: "Please select a project and ask your question.",
      emailVersion: "No AI answer was generated because the question was empty."
    };
  }

  // Keep old caller compatibility. OpenAI/Gemini values are accepted, but this file now uses OpenRouter only.
  void provider;

  try {
    const prompt = buildProjectAssistantPrompt(input);
    const generated = await callOpenRouter(prompt);
    return normalizeAiResult(generated, question);
  } catch (error) {
    return providerFailureResult(error);
  }
}

// Backward-compatible wrapper for older routes/components that still call generateAiReport().
// New assistant UI should call generateProjectAiAnswer() with { projectName, question, dashboard, data }.
export async function generateAiReport(
  input: AiReportInput,
  mode = "Project insight",
  provider: AiProvider = "auto"
): Promise<StructuredAiResult> {
  const question = input.notes || input.module || mode;

  return generateProjectAiAnswer(
    {
      projectName: input.projectName,
      question,
      data: {
        project: {
          projectName: input.projectName,
          clientName: input.clientName
        },
        dailyProgress: [
          {
            workCompleted: input.workCompleted,
            labourCount: input.labourCount,
            materialsUsed: input.materialsUsed,
            issuesOrDelays: input.issuesOrDelays,
            photosSummary: input.photosSummary,
            pendingPayments: input.pendingPayments,
            notes: input.notes,
            module: input.module
          }
        ],
        rawData: input.rawData
      }
    },
    provider
  );
}

function buildProjectAssistantPrompt(input: ProjectAiQuestionInput) {
  const safeContext = limitText(
    JSON.stringify(removeSensitiveFields(input), jsonReplacer, 2),
    MAX_CONTEXT_CHARS
  );

  return `You are ContractorOps AI, a construction command-center assistant for Indian contractors.

Your job:
Answer the user's question using only the provided database context from ContractorOps.
The database may include Projects, BOQ & Estimates, Schedule, Tasks, Daily Progress, Labour, Materials, Equipment, Measurements, Bills, Payments, Vendors, Expenses, Site Photos, Documents, and Reports.

Rules:
- Do not invent amounts, quantities, project names, dates, vendors, rates, or progress.
- If data is missing, say exactly what is missing.
- Give direct business insights, not generic advice.
- Use Indian currency formatting when discussing money.
- Compare BOQ value, contract value, billed amount, received amount, outstanding, labour, material, vendor payable, and profit/loss when relevant.
- Flag risks like overbilling, underbilling, missing measurements, delayed work, unpaid bills, missing BOQ items, high labour cost, or negative margin.
- If the user asks about "all BOQ", summarize BOQ totals, major cost heads, missing/zero items, billed vs BOQ gaps, and action points.
- Keep the answer short enough for a dashboard assistant, but include numbers when available.

Return strict JSON only with this shape:
{
  "title": "short title",
  "summary": "one short summary",
  "answer": "direct answer to the user's question",
  "keyPoints": ["short point"],
  "insights": ["business insight"],
  "risks": ["risk or issue"],
  "suggestedActions": ["clear next action"],
  "dataUsed": ["BOQ", "Bills", "Payments"],
  "followUpQuestions": ["useful follow-up question"],
  "suggestedMessage": "short message user can send to client/vendor/team if useful",
  "professionalReport": "clean professional explanation",
  "whatsappVersion": "short WhatsApp-style version",
  "emailVersion": "short email-style version"
}

User question:
${input.question}

Selected project:
${input.projectName || input.projectId || "Not specified"}

Database context:
${safeContext}`;
}

async function callOpenRouter(prompt: string) {
  if (!env.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
      "X-OpenRouter-Title": process.env.APP_NAME || "ContractorOps"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You answer as ContractorOps AI. Use only provided database context. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_object"
      },
      temperature: 0.2,
      max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS || 2200)
    }),
    signal: controller.signal
  }).finally(() => clearTimeout(timeout));

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.choices?.[0]?.error?.message ||
        `OpenRouter request failed with status ${response.status}.`
    );
  }

  return payload?.choices?.[0]?.message?.content || "";
}

function normalizeAiResult(value: string, fallbackQuestion: string): StructuredAiResult {
  const parsed = parseJsonObject(value);

  if (!parsed) {
    return {
      configured: true,
      title: "Project answer",
      summary: "The AI returned plain text instead of JSON.",
      answer: value || "No answer was generated.",
      keyPoints: value ? [limitText(value, 180)] : [],
      insights: [],
      risks: [],
      suggestedActions: [],
      dataUsed: [],
      followUpQuestions: [],
      suggestedMessage: value || "No message generated.",
      professionalReport: value || "No professional report generated.",
      whatsappVersion: value || "No WhatsApp version generated.",
      emailVersion: value || "No email version generated."
    };
  }

  const answer = toStringValue(parsed.answer) || toStringValue(parsed.summary) || "No answer was generated.";

  return {
    configured: true,
    title: toStringValue(parsed.title) || fallbackQuestion,
    summary: toStringValue(parsed.summary) || answer,
    answer,
    keyPoints: toStringArray(parsed.keyPoints).slice(0, 8),
    insights: toStringArray(parsed.insights).slice(0, 8),
    risks: toStringArray(parsed.risks).slice(0, 8),
    suggestedActions: toStringArray(parsed.suggestedActions).slice(0, 8),
    dataUsed: toStringArray(parsed.dataUsed).slice(0, 12),
    followUpQuestions: toStringArray(parsed.followUpQuestions).slice(0, 5),
    suggestedMessage: toStringValue(parsed.suggestedMessage) || answer,
    professionalReport: toStringValue(parsed.professionalReport) || answer,
    whatsappVersion: toStringValue(parsed.whatsappVersion) || answer,
    emailVersion: toStringValue(parsed.emailVersion) || answer
  };
}

function notConfiguredResult(): StructuredAiResult {
  return {
    configured: false,
    title: "AI API key not configured",
    summary: "Add OPENROUTER_API_KEY to enable the ContractorOps AI assistant.",
    answer: "OPENROUTER_API_KEY is missing. The assistant cannot search project context or generate insights until it is configured.",
    keyPoints: [
      "Add OPENROUTER_API_KEY",
      "Use OPENROUTER_MODEL=openai/gpt-oss-120b:free",
      "Pass selected project database context from the server route"
    ],
    insights: [],
    risks: [],
    suggestedActions: ["Add the OpenRouter API key in your environment variables."],
    dataUsed: [],
    followUpQuestions: [],
    suggestedMessage: "AI is not configured yet.",
    professionalReport: "AI assistant is disabled until OPENROUTER_API_KEY is configured.",
    whatsappVersion: "AI is not configured yet.",
    emailVersion: "AI assistant is disabled until OPENROUTER_API_KEY is configured."
  };
}

function providerFailureResult(error: unknown): StructuredAiResult {
  const message = error instanceof Error ? error.message : "OpenRouter request failed.";

  return {
    configured: true,
    title: "AI assistant unavailable",
    summary: message,
    answer: `AI request failed: ${message}`,
    keyPoints: [
      "The OpenRouter request failed",
      "Check API key, model name, quota/rate limits, and network access",
      "Make sure the server route is passing project database context"
    ],
    insights: [],
    risks: [],
    suggestedActions: ["Verify OPENROUTER_API_KEY and OPENROUTER_MODEL."],
    dataUsed: [],
    followUpQuestions: [],
    suggestedMessage: "AI generation failed. Please try again after configuration is fixed.",
    professionalReport: "AI generation failed before a project insight could be created.",
    whatsappVersion: "AI generation failed.",
    emailVersion: "AI generation failed. Please retry after OpenRouter configuration is verified."
  };
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      const parsed = JSON.parse(match[0]);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return JSON.stringify(value, jsonReplacer);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(toStringValue).filter(Boolean);
}

function limitText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n...[truncated to fit AI context limit]`;
}

function jsonReplacer(_key: string, value: unknown) {
  if (typeof value === "bigint") return value.toString();
  return value;
}

function removeSensitiveFields(value: unknown): unknown {
  const blockedKeys = ["password", "token", "secret", "apikey", "api_key", "authorization", "cookie", "session", "otp"];

  if (Array.isArray(value)) {
    return value.map(removeSensitiveFields);
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, childValue] of Object.entries(value as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const shouldBlock = blockedKeys.some((blockedKey) => normalizedKey.includes(blockedKey));
      output[key] = shouldBlock ? "[redacted]" : removeSensitiveFields(childValue);
    }

    return output;
  }

  return value;
}
