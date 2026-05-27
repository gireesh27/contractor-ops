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
  Equipment,
  EquipmentUsage,
  LabourAttendance,
  LabourWorker,
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

  for (const key of ["projectId", "clientId", "billId", "vendorId", "materialId", "workerId", "boqItemId", "taskId", "parentTaskId", "dependencyTaskId", "assignedProjectId"]) {
    if (cleanPayload[key] && isObjectId(cleanPayload[key])) cleanPayload[key] = objectId(cleanPayload[key]);
    if (cleanPayload[key] === "") delete cleanPayload[key];
  }

  for (const key of ["date", "billDate", "dueDate", "startDate", "endDate", "expectedEndDate", "dateTime", "joiningDate", "paidAt"]) {
    if (cleanPayload[key]) cleanPayload[key] = new Date(cleanPayload[key]);
  }

  for (const [key, value] of Object.entries(cleanPayload)) {
    if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value)) && ["amount", "contractValue", "budget", "estimatedCost", "quantity", "unitRate", "expectedRate", "rate", "progress", "completionPercentage", "workersPresent", "dailyWage", "overtimeRate", "openingStock", "currentStock", "lowStockThreshold", "duration", "usageHours", "rentalRate", "length", "breadth", "height", "count", "calculatedQuantity", "netPayable", "subtotal", "gstAmount", "retention", "discount", "previousPayment", "wageCalculated", "overtimeHours", "overtimeAmount", "totalCost"].includes(key)) {
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

  await maybeCreateMeaningfulNotification(collection, organizationId, userId, record, cleanPayload);

  return toPlain(record);
}

async function maybeCreateMeaningfulNotification(collection: CollectionName, organizationId: string, userId: string, record: any, payload: Record<string, any>) {
  const projectId = payload.projectId && isObjectId(String(payload.projectId)) ? payload.projectId : undefined;
  const base = {
    organizationId: objectId(organizationId),
    userId: objectId(userId),
    projectId,
    relatedRecordId: record._id,
    link: projectId ? `/projects/${String(projectId)}` : undefined
  };
  const createOnce = (dedupeKey: string, input: { type: string; title: string; body: string; severity: string; link?: string }) =>
    Notification.findOneAndUpdate(
      { organizationId: objectId(organizationId), dedupeKey },
      { $setOnInsert: { ...base, ...input, dedupeKey } },
      { upsert: true, new: true }
    );

  if (collection === "tasks" && payload.dueDate && new Date(payload.dueDate) < new Date() && !["Completed", "Cancelled"].includes(payload.status)) {
    await createOnce(`task-overdue:${record._id}`, {
      type: "task_overdue",
      title: "Task overdue",
      body: `${payload.title || "Task"} is past due and not completed.`,
      severity: "warning",
      link: projectId ? `/projects/${String(projectId)}/tasks` : "/tasks"
    });
  }

  if (collection === "material-transactions" && Number(payload.expectedRate || 0) > 0 && Number(payload.unitRate || 0) > Number(payload.expectedRate || 0)) {
    await createOnce(`material-price:${record._id}`, {
      type: "material_price_exceeded",
      title: "Material price exceeded",
      body: `${payload.materialName || "Material"} rate is above expected rate.`,
      severity: "warning",
      link: projectId ? `/projects/${String(projectId)}/materials` : "/materials"
    });
  }

  if (collection === "bills" && payload.dueDate && new Date(payload.dueDate) < new Date() && !["Paid", "Cancelled"].includes(payload.status)) {
    await createOnce(`bill-overdue:${record._id}`, {
      type: "bill_pending",
      title: "Bill pending",
      body: `${payload.billNumber || "Bill"} is overdue or pending payment.`,
      severity: "warning",
      link: projectId ? `/projects/${String(projectId)}/bills` : "/bills"
    });
  }

  if (collection === "measurements" && payload.approvalStatus === "Pending") {
    await createOnce(`measurement-pending:${record._id}`, {
      type: "measurement_pending",
      title: "Measurement verification pending",
      body: `${payload.workCategory || "Measurement"} needs verification.`,
      severity: "info",
      link: projectId ? `/projects/${String(projectId)}/measurements` : "/measurements"
    });
  }
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
  const [boqItems, schedule, tasks, progress, labour, workers, materialTransactions, materialMaster, equipment, equipmentUsage, measurements, bills, payments, expenses, vendorTransactions, vendors, photos, documents, reports, notifications] =
    await Promise.all([
      listRecords("boq", organizationId, query),
      listRecords("schedule", organizationId, query),
      listRecords("tasks", organizationId, query),
      listRecords("daily-progress", organizationId, query),
      listRecords("labour", organizationId, query),
      LabourWorker.find({
        organizationId: objectId(organizationId),
        deletedAt: null,
        $or: [{ assignedProjectId: objectId(projectId) }, { projectId: objectId(projectId) }]
      }).sort({ createdAt: -1 }).limit(200).lean().then(toPlain),
      listRecords("material-transactions", organizationId, query),
      Material.find({ organizationId: objectId(organizationId), deletedAt: null, $or: [{ projectId: objectId(projectId) }, { projectId: { $exists: false } }] }).sort({ name: 1 }).limit(200).lean().then(toPlain),
      Equipment.find({ organizationId: objectId(organizationId), deletedAt: null, $or: [{ assignedProjectId: objectId(projectId) }, { projectId: objectId(projectId) }] }).sort({ createdAt: -1 }).limit(200).lean().then(toPlain),
      listRecords("equipment-usage", organizationId, query),
      listRecords("measurements", organizationId, query),
      listRecords("bills", organizationId, query),
      listRecords("payments", organizationId, query),
      listRecords("expenses", organizationId, query),
      listRecords("vendor-transactions", organizationId, query),
      Vendor.find({ organizationId: objectId(organizationId), deletedAt: null }).sort({ name: 1 }).limit(200).lean().then(toPlain),
      listRecords("photos", organizationId, query),
      listRecords("documents", organizationId, query),
      listRecords("reports", organizationId, query),
      Notification.find({ organizationId: objectId(organizationId), deletedAt: null, $or: [{ projectId: objectId(projectId) }, { link: { $regex: projectId } }] }).sort({ createdAt: -1 }).limit(50).lean().then(toPlain)
    ]);

  const analytics = buildProjectAnalytics({
    project,
    boqItems,
    schedule,
    tasks,
    progress,
    labour,
    workers,
    materialTransactions,
    materialMaster,
    equipment,
    equipmentUsage,
    measurements,
    bills,
    payments,
    expenses,
    vendorTransactions,
    vendors,
    photos,
    documents,
    reports,
    notifications
  });

  return { project, boqItems, schedule, tasks, progress, labour, workers, materialTransactions, materialMaster, equipment, equipmentUsage, measurements, bills, payments, expenses, vendorTransactions, vendors, photos, documents, reports, notifications, analytics };
}

export function buildProjectAnalytics(bundle: Record<string, any>) {
  const total = (rows: any[] = [], field: string) => rows.reduce((sum: number, row: any) => sum + Number(row[field] || 0), 0);
  const billed = total(bundle.bills, "netPayable");
  const received = total((bundle.payments || []).filter((payment: any) => ["Paid", "Verified", "Captured"].includes(payment.status)), "amount");
  const materialCost = total(bundle.materialTransactions, "totalCost");
  const labourCost = total(bundle.labour, "wageCalculated");
  const expenseCost = total(bundle.expenses, "amount");
  const vendorPayable = total((bundle.vendorTransactions || []).filter((row: any) => row.paymentStatus !== "Paid"), "amount");
  const boqValue = total(bundle.boqItems, "amount");
  const measuredValue = total(bundle.measurements, "amount");
  const estimatedBudget = Number(bundle.project?.budget || bundle.project?.estimatedCost || boqValue || 0);
  const actualCost = materialCost + labourCost + expenseCost + vendorPayable;
  const progress = Number(bundle.project?.progress || 0);
  const outstanding = billed - received;
  const now = new Date();

  const overdueTasks = (bundle.tasks || []).filter((task: any) => task.dueDate && new Date(task.dueDate) < now && !["Completed", "Cancelled"].includes(task.status));
  const pendingMeasurements = (bundle.measurements || []).filter((row: any) => row.approvalStatus === "Pending");
  const materialShortages = (bundle.materialMaster || []).filter((row: any) => Number(row.currentStock || 0) <= Number(row.lowStockThreshold || 0) && Number(row.lowStockThreshold || 0) > 0);
  const priceExceeded = (bundle.materialTransactions || []).filter((row: any) => Number(row.unitRate || 0) > Number(row.expectedRate || row.defaultRate || 0) && Number(row.expectedRate || row.defaultRate || 0) > 0);

  return {
    metrics: {
      boqValue,
      billed,
      received,
      outstanding,
      materialCost,
      labourCost,
      expenseCost,
      vendorPayable,
      estimatedBudget,
      actualCost,
      costDifference: estimatedBudget - actualCost,
      profitLoss: billed - actualCost,
      progress,
      workerCount: (bundle.workers || []).length,
      workersOnline: (bundle.labour || []).filter((row: any) => row.date && new Date(row.date).toDateString() === now.toDateString() && ["Present", "Overtime"].includes(row.attendanceType)).length,
      taskCount: (bundle.tasks || []).length,
      overdueTaskCount: overdueTasks.length,
      materialShortageCount: materialShortages.length,
      pendingMeasurementCount: pendingMeasurements.length
    },
    charts: {
      costBreakdown: [
        { label: "Materials", value: materialCost },
        { label: "Labour", value: labourCost },
        { label: "Expenses", value: expenseCost },
        { label: "Vendor Payable", value: vendorPayable }
      ].filter((row) => row.value > 0),
      budgetVsActual: [
        { label: "Estimated", value: estimatedBudget },
        { label: "Actual", value: actualCost },
        { label: "Billed", value: billed },
        { label: "Received", value: received }
      ],
      taskStatus: Object.entries((bundle.tasks || []).reduce((acc: Record<string, number>, task: any) => {
        acc[task.status || "Not Started"] = (acc[task.status || "Not Started"] || 0) + 1;
        return acc;
      }, {})).map(([label, value]) => ({ label, value })),
      materialUsage: Object.entries((bundle.materialTransactions || []).reduce((acc: Record<string, number>, row: any) => {
        acc[row.materialName || "Material"] = (acc[row.materialName || "Material"] || 0) + Number(row.totalCost || 0);
        return acc;
      }, {})).map(([label, value]) => ({ label, value })).slice(0, 8),
      attendance: Object.entries((bundle.labour || []).reduce((acc: Record<string, number>, row: any) => {
        acc[row.attendanceType || "Present"] = (acc[row.attendanceType || "Present"] || 0) + 1;
        return acc;
      }, {})).map(([label, value]) => ({ label, value }))
    },
    risks: [
      actualCost > estimatedBudget && estimatedBudget > 0 ? "Actual cost is above estimated budget." : "",
      outstanding > 0 ? "Client outstanding amount needs follow-up." : "",
      overdueTasks.length ? `${overdueTasks.length} task(s) are overdue.` : "",
      materialShortages.length ? `${materialShortages.length} material(s) are at or below low stock threshold.` : "",
      pendingMeasurements.length ? `${pendingMeasurements.length} measurement(s) are pending verification.` : "",
      priceExceeded.length ? `${priceExceeded.length} material transaction(s) exceed expected price.` : ""
    ].filter(Boolean),
    materialShortages,
    priceExceeded,
    overdueTasks,
    pendingMeasurements
  };
}

export async function getProjectReportRows(organizationId: string, projectId: string) {
  const bundle = await getProjectBundle(organizationId, projectId);
  if (!bundle) return [];
  const addRows = (section: string, rows: any[], fields: string[]) =>
    rows.map((row) => ({
      section,
      title: row.name || row.title || row.taskName || row.description || row.billNumber || row.materialName || row.workerName || row.type || section,
      status: row.status || row.approvalStatus || row.paymentStatus || row.transactionType || "",
      amount: row.amount || row.netPayable || row.totalCost || row.wageCalculated || row.contractValue || "",
      date: row.date || row.startDate || row.dueDate || row.billDate || row.dateTime || row.createdAt || "",
      details: fields.map((field) => `${field}: ${row[field] ?? "-"}`).join(" | ")
    }));

  return [
    {
      section: "Project overview",
      title: bundle.project.name,
      status: bundle.project.status,
      amount: bundle.project.contractValue,
      date: bundle.project.startDate,
      details: `Client: ${bundle.project.clientName || "-"} | Site: ${bundle.project.location || "-"} | Progress: ${bundle.project.progress || 0}%`
    },
    {
      section: "Cost summary",
      title: "Project financial summary",
      status: bundle.analytics.risks.length ? "Needs attention" : "Healthy",
      amount: bundle.analytics.metrics.actualCost,
      date: new Date().toISOString(),
      details: `BOQ: ${bundle.analytics.metrics.boqValue} | Billed: ${bundle.analytics.metrics.billed} | Received: ${bundle.analytics.metrics.received} | Outstanding: ${bundle.analytics.metrics.outstanding} | Profit/Loss: ${bundle.analytics.metrics.profitLoss}`
    },
    ...addRows("Tasks / Activities", bundle.tasks, ["phase", "milestone", "priority", "completionPercentage", "workCategory"]),
    ...addRows("Workers / Attendance", bundle.labour, ["workerName", "attendanceType", "timeIn", "timeOut", "remarks"]),
    ...addRows("Materials", bundle.materialTransactions, ["materialName", "transactionType", "quantity", "unitRate", "expectedRate", "supplier"]),
    ...addRows("BOQ", bundle.boqItems, ["category", "quantity", "rate", "completedQuantity", "notes"]),
    ...addRows("Measurements", bundle.measurements, ["workCategory", "locationLabel", "calculatedQuantity", "unit", "rate", "approvalStatus"]),
    ...addRows("Bills", bundle.bills, ["billNumber", "clientName", "billType", "netPayable", "dueDate"]),
    ...addRows("Payments", bundle.payments, ["method", "gateway", "transactionId", "paidAt"]),
    ...addRows("Vendor bills", bundle.vendorTransactions, ["description", "direction", "paymentStatus"]),
    ...addRows("Expenses", bundle.expenses, ["category", "paidBy", "paymentMode", "remarks"]),
    ...addRows("Records / Reports", bundle.reports, ["type", "generatedAt"]),
    ...addRows("Notifications", bundle.notifications, ["type", "severity", "body", "link"])
  ];
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
