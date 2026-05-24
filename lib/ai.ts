import { hasAiProvider } from "@/lib/env";

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

export async function generateAiReport(input: AiReportInput, mode = "Daily progress report"): Promise<StructuredAiResult> {
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

  // Production hook: call OpenAI/Gemini here with tenant-scoped project context.
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
