// @ts-nocheck
import { unstable_noStore as noStore } from "next/cache";
import { Types, type FilterQuery } from "mongoose";
import { cacheGet, cacheSet } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db/connect";
import {
  ActivityLog,
  Bill,
  BOQItem,
  Client,
  collectionModels,
  DailyProgress,
  Expense,
  LabourAttendance,
  Material,
  MaterialTransaction,
  Measurement,
  Notification,
  Organization,
  OrganizationMember,
  Payment,
  Project,
  ProjectTask,
  Report,
  ScheduleTask,
  SitePhoto,
  Subscription,
  SubscriptionPlan,
  User,
  Vendor,
  VendorTransaction,
  type CollectionName
} from "@/lib/db/models";

export const planCatalog = [
  {
    name: "Trial",
    price: 0,
    interval: "trial",
    projectLimit: 1,
    userLimit: 1,
    features: ["Limited time trial", "1 organization", "1 project", "Basic reports", "Watermarked exports"]
  },
  {
    name: "Starter",
    price: 999,
    interval: "monthly",
    projectLimit: 5,
    userLimit: 5,
    features: ["BOQ", "Daily progress", "Labour", "Materials", "Billing", "PDF export"]
  },
  {
    name: "Pro",
    price: 2999,
    interval: "monthly",
    projectLimit: "Unlimited",
    userLimit: 15,
    popular: true,
    features: ["AI reports", "Advanced exports", "Vendor management", "Site photo tracking", "Scheduling", "Notifications"]
  },
  {
    name: "Business",
    price: 9999,
    interval: "monthly",
    projectLimit: "Unlimited",
    userLimit: "Unlimited",
    features: ["Multi-team", "Advanced permissions", "Custom report templates", "Priority support", "Payment gateway support", "Advanced analytics"]
  }
];

export function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function isObjectId(value?: string | null) {
  return Boolean(value && Types.ObjectId.isValid(value));
}

export function objectId(value: string) {
  return new Types.ObjectId(value);
}

async function sum(Model: any, organizationId: string, field: string, extra: FilterQuery<any> = {}) {
  const result = await Model.aggregate([
    { $match: { organizationId: objectId(organizationId), deletedAt: null, ...extra } },
    { $group: { _id: null, total: { $sum: `$${field}` } } }
  ]);
  return result[0]?.total || 0;
}

export async function listRecords(collection: CollectionName, organizationId: string, query: Record<string, string | undefined> = {}) {
  noStore();
  const db = await connectToDatabase();
  if (!db) return [];
  const Model = collectionModels[collection];
  const filter: FilterQuery<any> = { organizationId: objectId(organizationId), deletedAt: null };
  if (query.projectId && isObjectId(query.projectId)) filter.projectId = objectId(query.projectId);
  if (query.status) filter.status = query.status;
  const records = await Model.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return toPlain(records);
}

export async function createRecord(collection: CollectionName, organizationId: string, userId: string, payload: Record<string, any>) {
  const db = await connectToDatabase();
  if (!db) throw new Error("MONGODB_URI is not configured.");
  const Model = collectionModels[collection];
  const cleanPayload = { ...payload };

  for (const key of ["projectId", "clientId", "billId", "vendorId", "materialId", "workerId", "boqItemId", "assignedProjectId"]) {
    if (cleanPayload[key] && isObjectId(cleanPayload[key])) cleanPayload[key] = objectId(cleanPayload[key]);
    if (cleanPayload[key] === "") delete cleanPayload[key];
  }

  for (const key of ["date", "billDate", "dueDate", "startDate", "endDate", "expectedEndDate", "dateTime", "joiningDate", "paidAt"]) {
    if (cleanPayload[key]) cleanPayload[key] = new Date(cleanPayload[key]);
  }

  for (const [key, value] of Object.entries(cleanPayload)) {
    if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value)) && ["amount", "contractValue", "budget", "estimatedCost", "quantity", "unitRate", "rate", "progress", "workersPresent", "dailyWage", "overtimeRate", "openingStock", "currentStock", "lowStockThreshold", "duration", "usageHours", "rentalRate", "length", "breadth", "height", "count", "calculatedQuantity", "netPayable", "subtotal", "gstAmount", "retention", "discount", "previousPayment", "wageCalculated", "overtimeHours", "overtimeAmount", "totalCost"].includes(key)) {
      cleanPayload[key] = Number(value);
    }
  }

  if (collection === "material-transactions") {
    cleanPayload.totalCost = Number(cleanPayload.quantity || 0) * Number(cleanPayload.unitRate || 0);
  }

  if (collection === "boq") {
    cleanPayload.amount = Number(cleanPayload.quantity || 0) * Number(cleanPayload.rate || 0);
  }

  const record = await Model.create({
    ...cleanPayload,
    organizationId: objectId(organizationId),
    createdBy: objectId(userId),
    updatedBy: objectId(userId)
  });

  await ActivityLog.create({
    organizationId: objectId(organizationId),
    actorId: objectId(userId),
    action: `${collection} record created`,
    entityType: collection,
    entityId: record._id,
    metadata: { title: cleanPayload.name || cleanPayload.title || cleanPayload.taskName || cleanPayload.billNumber }
  });

  return toPlain(record);
}

export async function getProjects(organizationId: string) {
  return listRecords("projects", organizationId);
}

export async function getProject(organizationId: string, projectId: string) {
  const db = await connectToDatabase();
  if (!db || !isObjectId(projectId)) return null;
  const project = await Project.findOne({ _id: projectId, organizationId: objectId(organizationId), deletedAt: null }).lean();
  return project ? toPlain(project) : null;
}

export async function getProjectBundle(organizationId: string, projectId: string) {
  const project = await getProject(organizationId, projectId);
  if (!project) return null;
  const query = { projectId };
  const [boqItems, schedule, tasks, progress, labour, materialTransactions, measurements, bills, payments, expenses, photos, documents, reports] =
    await Promise.all([
      listRecords("boq", organizationId, query),
      listRecords("schedule", organizationId, query),
      listRecords("tasks", organizationId, query),
      listRecords("daily-progress", organizationId, query),
      listRecords("labour", organizationId, query),
      listRecords("material-transactions", organizationId, query),
      listRecords("measurements", organizationId, query),
      listRecords("bills", organizationId, query),
      listRecords("payments", organizationId, query),
      listRecords("expenses", organizationId, query),
      listRecords("photos", organizationId, query),
      listRecords("documents", organizationId, query),
      listRecords("reports", organizationId, query)
    ]);

  return { project, boqItems, schedule, tasks, progress, labour, materialTransactions, measurements, bills, payments, expenses, photos, documents, reports };
}

export async function getDashboardSummary(organizationId: string) {
  noStore();
  const cached = await cacheGet<any>(`dashboard:${organizationId}`);
  if (cached) return cached;

  const db = await connectToDatabase();
  if (!db) {
    return {
      databaseReady: false,
      metrics: emptyMetrics(),
      charts: emptyCharts(),
      activity: [],
      aiInsight: "Connect MongoDB and AI API to enable live ContractorOps insights."
    };
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const org = objectId(organizationId);
  const [
    activeProjects,
    completedProjects,
    delayedProjects,
    projectCount,
    totalContractValue,
    totalBoqValue,
    totalBilled,
    totalReceived,
    materialCostThisMonth,
    labourCostThisMonth,
    vendorPayable,
    expenseTotal,
    todayUpdates,
    overdueBills,
    upcomingTasks,
    pendingApprovals,
    activity,
    projects,
    notifications
  ] = await Promise.all([
    Project.countDocuments({ organizationId: org, status: "Active", deletedAt: null }),
    Project.countDocuments({ organizationId: org, status: "Completed", deletedAt: null }),
    Project.countDocuments({ organizationId: org, status: { $in: ["Delayed", "On Hold"] }, deletedAt: null }),
    Project.countDocuments({ organizationId: org, deletedAt: null }),
    sum(Project, organizationId, "contractValue"),
    sum(BOQItem, organizationId, "amount"),
    sum(Bill, organizationId, "netPayable"),
    sum(Payment, organizationId, "amount", { status: { $in: ["Paid", "Verified", "Captured"] } }),
    sum(MaterialTransaction, organizationId, "totalCost", { dateTime: { $gte: monthStart } }),
    sum(LabourAttendance, organizationId, "wageCalculated", { date: { $gte: monthStart } }),
    sum(VendorTransaction, organizationId, "amount", { paymentStatus: { $ne: "Paid" } }),
    sum(Expense, organizationId, "amount"),
    DailyProgress.countDocuments({ organizationId: org, createdAt: { $gte: new Date(new Date().toDateString()) }, deletedAt: null }),
    Bill.countDocuments({ organizationId: org, dueDate: { $lt: new Date() }, status: { $nin: ["Paid", "Cancelled"] }, deletedAt: null }),
    ProjectTask.countDocuments({ organizationId: org, dueDate: { $gte: new Date() }, status: { $nin: ["Completed", "Cancelled"] }, deletedAt: null }),
    Measurement.countDocuments({ organizationId: org, approvalStatus: "Pending", deletedAt: null }),
    ActivityLog.find({ organizationId: org, deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean(),
    Project.find({ organizationId: org, deletedAt: null }).sort({ updatedAt: -1 }).limit(8).lean(),
    Notification.find({ organizationId: org, readAt: null, deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean()
  ]);

  const outstanding = totalBilled - totalReceived;
  const summary = {
    databaseReady: true,
    metrics: {
      activeProjects,
      completedProjects,
      delayedProjects,
      projectCount,
      totalContractValue,
      totalBoqValue,
      totalBilled,
      totalReceived,
      outstanding,
      materialCostThisMonth,
      labourCostThisMonth,
      vendorPayable,
      netEstimatedProfit: totalBilled - materialCostThisMonth - labourCostThisMonth - vendorPayable - expenseTotal,
      todayUpdates,
      pendingApprovals,
      overdueBills,
      upcomingTasks
    },
    charts: await getDashboardCharts(organizationId),
    activity: toPlain(activity),
    projects: toPlain(projects),
    notifications: toPlain(notifications),
    aiInsight: buildAiInsight({ outstanding, labourCostThisMonth, materialCostThisMonth, delayedProjects, overdueBills })
  };

  await cacheSet(`dashboard:${organizationId}`, summary, 90);
  return summary;
}

async function getDashboardCharts(organizationId: string) {
  const org = objectId(organizationId);
  const [billing, received, labour, materials, progress, expenses] = await Promise.all([
    Bill.aggregate([
      { $match: { organizationId: org, deletedAt: null } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$billDate" } }, billed: { $sum: "$netPayable" } } },
      { $sort: { _id: 1 } }
    ]),
    Payment.aggregate([
      { $match: { organizationId: org, deletedAt: null, status: { $in: ["Paid", "Verified", "Captured"] } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$paidAt", "$createdAt"] } } }, received: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]),
    LabourAttendance.aggregate([
      { $match: { organizationId: org, deletedAt: null } },
      { $group: { _id: { $dateToString: { format: "%d %b", date: "$date" } }, value: { $sum: "$wageCalculated" } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]),
    MaterialTransaction.aggregate([
      { $match: { organizationId: org, deletedAt: null } },
      { $group: { _id: "$materialName", value: { $sum: "$totalCost" } } },
      { $sort: { value: -1 } },
      { $limit: 8 }
    ]),
    Project.find({ organizationId: org, deletedAt: null }).select("name progress status contractValue budget").limit(8).lean(),
    Expense.aggregate([
      { $match: { organizationId: org, deletedAt: null } },
      { $group: { _id: "$category", value: { $sum: "$amount" } } },
      { $sort: { value: -1 } }
    ])
  ]);

  const receivedByMonth = new Map(received.map((row) => [row._id, row.received]));
  const months = Array.from(new Set([...billing.map((row) => row._id), ...received.map((row) => row._id)])).sort();

  return toPlain({
    billing: months.map((month) => {
      const billed = billing.find((row) => row._id === month)?.billed || 0;
      return {
        label: month ? new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }) : "Unscheduled",
        billed,
        received: receivedByMonth.get(month) || 0
      };
    }),
    labour: labour.map((row) => ({ label: row._id, value: row.value })),
    materials: materials.map((row) => ({ label: row._id || "Material", value: row.value })),
    progress: progress.map((row: any) => ({ label: row.name, value: row.progress || 0, status: row.status })),
    expenses: expenses.map((row) => ({ label: row._id || "Other", value: row.value }))
  });
}

function buildAiInsight(input: { outstanding: number; labourCostThisMonth: number; materialCostThisMonth: number; delayedProjects: number; overdueBills: number }) {
  if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    return "AI API key not configured. Add OPENROUTER_API_KEY or GEMINI_API_KEY to enable AI-generated reports.";
  }

  const risks = [];
  if (input.outstanding > 0) risks.push(`Outstanding collections are at Rs ${input.outstanding.toLocaleString("en-IN")}.`);
  if (input.delayedProjects > 0) risks.push(`${input.delayedProjects} project(s) may face delay based on status.`);
  if (input.overdueBills > 0) risks.push(`${input.overdueBills} bill(s) are overdue and need follow-up.`);
  if (!risks.length) return "Projects look financially controlled. Continue tracking labour, material, measurements, and billing daily.";
  return risks.join(" ");
}

function emptyMetrics() {
  return {
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    projectCount: 0,
    totalContractValue: 0,
    totalBoqValue: 0,
    totalBilled: 0,
    totalReceived: 0,
    outstanding: 0,
    materialCostThisMonth: 0,
    labourCostThisMonth: 0,
    vendorPayable: 0,
    netEstimatedProfit: 0,
    todayUpdates: 0,
    pendingApprovals: 0,
    overdueBills: 0,
    upcomingTasks: 0
  };
}

function emptyCharts() {
  return { billing: [], labour: [], materials: [], progress: [], expenses: [] };
}

export async function getAdminData() {
  const db = await connectToDatabase();
  if (!db) return { organizations: [], metrics: { organizations: 0, users: 0, activeSubscriptions: 0, trials: 0, mrr: 0 } };

  const [organizations, users, activeSubscriptions, trials, subscriptions] = await Promise.all([
    Organization.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(100).lean(),
    User.countDocuments({ deletedAt: null }),
    Subscription.countDocuments({ status: "Active", deletedAt: null }),
    Subscription.countDocuments({ status: "Trial", deletedAt: null }),
    Subscription.find({ status: "Active", deletedAt: null }).lean()
  ]);

  const mrr = subscriptions.reduce((total: number, sub: any) => total + (sub.planName === "Business" ? 9999 : sub.planName === "Pro" ? 2999 : sub.planName === "Starter" ? 999 : 0), 0);
  return {
    organizations: toPlain(organizations),
    metrics: { organizations: organizations.length, users, activeSubscriptions, trials, mrr }
  };
}
