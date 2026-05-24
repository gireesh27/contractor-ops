import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2),
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  clientEmail: z.string().email().optional().or(z.literal("")),
  type: z.string().min(2),
  location: z.string().min(2),
  startDate: z.string().min(8),
  expectedEndDate: z.string().min(8),
  status: z.string().default("Planning"),
  contractValue: z.coerce.number().nonnegative(),
  estimatedCost: z.coerce.number().nonnegative(),
  description: z.string().optional().default(""),
  assignedEngineer: z.string().optional().default(""),
  progress: z.coerce.number().min(0).max(100).default(0)
});

export const dailyProgressSchema = z.object({
  projectId: z.string().min(1),
  date: z.string().min(8),
  workCompleted: z.string().min(3),
  category: z.string().min(2),
  quantityCompleted: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
  area: z.string().min(1),
  workersPresent: z.coerce.number().int().nonnegative(),
  materialsUsed: z.string().optional().default(""),
  issuesFaced: z.string().optional(),
  delayReason: z.string().optional(),
  weather: z.string().optional().default("Clear"),
  remarks: z.string().optional().default(""),
  photosCount: z.coerce.number().int().nonnegative().default(0),
  clientVisible: z.coerce.boolean().default(false),
  boqItemId: z.string().optional()
});

export const paymentSchema = z.object({
  projectId: z.string(),
  billId: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  paymentDate: z.string(),
  amountReceived: z.coerce.number().positive(),
  mode: z.string(),
  transactionReference: z.string().optional(),
  notes: z.string().optional()
});

export const aiReportSchema = z.object({
  projectName: z.string().min(2),
  clientName: z.string().min(2),
  workCompleted: z.string().min(2),
  labourCount: z.coerce.number().int().nonnegative(),
  materialsUsed: z.string().min(2),
  issuesOrDelays: z.string().optional(),
  photosSummary: z.string().optional(),
  pendingPayments: z.string().optional(),
  notes: z.string().optional(),
  mode: z.string().optional()
});
