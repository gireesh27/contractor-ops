import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { rateLimit } from "@/lib/cache";
import { generateProjectAiAnswer } from "@/lib/ai";
import { AIRequestLog, Project } from "@/lib/db/models";
import { getProjectBundle, objectId } from "@/lib/data-access";
import { getTenantContext } from "@/lib/tenant";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function numberValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[₹,\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function amountFrom(row: any) {
  return (
    numberValue(row?.amount) ||
    numberValue(row?.totalAmount) ||
    numberValue(row?.total) ||
    numberValue(row?.value) ||
    numberValue(row?.cost) ||
    numberValue(row?.netAmount) ||
    numberValue(row?.billAmount) ||
    0
  );
}

function sumAmount(rows: any[] = []) {
  return rows.reduce((sum, row) => sum + amountFrom(row), 0);
}

function isCurrentMonth(row: any) {
  const rawDate =
    row?.date ||
    row?.createdAt ||
    row?.updatedAt ||
    row?.entryDate ||
    row?.workDate ||
    row?.billDate ||
    row?.paymentDate;

  if (!rawDate) return false;

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function cleanForAi(value: any) {
  return JSON.parse(
    JSON.stringify(value, (key, val) => {
      const blockedKeys = [
        "password",
        "token",
        "apiKey",
        "secret",
        "fileBuffer",
        "buffer",
        "base64",
        "imageData",
        "rawFile",
      ];

      if (blockedKeys.includes(key)) return undefined;
      return val;
    })
  );
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenantContext({ required: true });

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await rateLimit(
      `ai:${tenant.organizationId}:${tenant.userId}`,
      20,
      60 * 60
    );

    if (!limited.allowed) {
      return NextResponse.json({ error: "AI rate limit reached" }, { status: 429 });
    }

    const contentType = request.headers.get("content-type") || "";

    const body = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());

    const question = String(body.question || "").trim();
    const projectId = body.projectId ? String(body.projectId) : "";
    const projectName = body.projectName ? String(body.projectName).trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (!projectId && !projectName) {
      return NextResponse.json(
        { error: "Please provide projectId or projectName." },
        { status: 400 }
      );
    }

    const mongooseConnection = await connectToDatabase();

    if (!mongooseConnection) {
      return NextResponse.json(
        { error: "Database connection is not ready." },
        { status: 500 }
      );
    }

    const organizationObjectId = objectId(tenant.organizationId);

    const organizationMatch = {
      $in: [organizationObjectId, tenant.organizationId],
    };

    const projectQuery = projectId
      ? {
        _id: objectId(projectId),
        organizationId: organizationMatch,
      }
      : {
        organizationId: organizationMatch,
        $or: [
          { name: { $regex: escapeRegex(projectName), $options: "i" } },
          { title: { $regex: escapeRegex(projectName), $options: "i" } },
          { projectName: { $regex: escapeRegex(projectName), $options: "i" } },
        ],
      };

    const project = await Project.findOne(projectQuery).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const projectObjectId = project._id;
    const bundle = await getProjectBundle(tenant.organizationId, String(projectObjectId));

    if (!bundle) {
      return NextResponse.json(
        { error: "Project data could not be loaded." },
        { status: 404 }
      );
    }

    const dashboard = {
      projectName: bundle.project.name || projectName || "Selected project",
      contractValue: numberValue(bundle.project.contractValue),
      boqValue: bundle.analytics.metrics.boqValue,
      billedAmount: bundle.analytics.metrics.billed,
      receivedAmount: bundle.analytics.metrics.received,
      outstanding: bundle.analytics.metrics.outstanding,
      totalMaterialCost: bundle.analytics.metrics.materialCost,
      totalLabourCost: bundle.analytics.metrics.labourCost,
      totalExpenses: bundle.analytics.metrics.expenseCost,
      vendorPayable: bundle.analytics.metrics.vendorPayable,
      estimatedProfitLoss: bundle.analytics.metrics.profitLoss,
      progress: bundle.analytics.metrics.progress,
      totalBoqItems: bundle.boqItems.length,
      totalBills: bundle.bills.length,
      totalPayments: bundle.payments.length,
      totalMeasurements: bundle.measurements.length,
      totalDailyProgressEntries: bundle.progress.length,
      totalTasks: bundle.tasks.length,
    };

    const aiInput = {
      projectId: String(projectObjectId),
      projectName: dashboard.projectName,
      question,
      dashboard,
      data: cleanForAi({
        project: bundle.project,
        boq: bundle.boqItems,
        estimates: bundle.boqItems,
        dailyProgress: bundle.progress,
        labour: bundle.labour,
        workers: bundle.workers,
        materials: bundle.materialTransactions,
        equipment: bundle.equipment,
        measurements: bundle.measurements,
        bills: bundle.bills,
        payments: bundle.payments,
        vendors: bundle.vendors,
        vendorTransactions: bundle.vendorTransactions,
        expenses: bundle.expenses,
        sitePhotos: bundle.photos,
        documents: bundle.documents,
        reports: bundle.reports,
        tasks: bundle.tasks,
        schedule: bundle.schedule,
        analytics: bundle.analytics
      }),
    };

    const result = await generateProjectAiAnswer(aiInput);

    await AIRequestLog.create({
      organizationId: organizationObjectId,
      userId: objectId(tenant.userId),
      projectId: projectObjectId,
      feature: "Project AI Assistant",
      provider: result.configured ? "openrouter" : "none",
      status: result.configured ? "generated" : "missing-api-key",
      input: {
        projectId: String(projectObjectId),
        projectName: dashboard.projectName,
        question,
      },
      output: result,
    });

    return NextResponse.json({
      data: {
        ...result,
        kpis: [
          { label: "Total Budget", value: dashboard.boqValue || dashboard.contractValue },
          { label: "Actual Cost", value: bundle.analytics.metrics.actualCost },
          { label: "Progress", value: `${dashboard.progress || 0}%` },
          { label: "Outstanding", value: dashboard.outstanding }
        ],
        charts: [
          { type: "bar", title: "Budget vs Actual", data: bundle.analytics.charts.budgetVsActual },
          { type: "pie", title: "Cost Breakdown", data: bundle.analytics.charts.costBreakdown },
          { type: "bar", title: "Material Usage", data: bundle.analytics.charts.materialUsage },
          { type: "bar", title: "Worker Attendance", data: bundle.analytics.charts.attendance },
          { type: "bar", title: "Task Completion", data: bundle.analytics.charts.taskStatus }
        ],
        databaseRisks: bundle.analytics.risks,
        databaseRecommendations: [
          bundle.analytics.metrics.outstanding > 0 ? "Follow up pending client payments." : "",
          bundle.analytics.metrics.actualCost > bundle.analytics.metrics.estimatedBudget ? "Review material, labour, expense, and vendor costs against budget." : "",
          bundle.analytics.metrics.pendingMeasurementCount > 0 ? "Verify pending measurements before billing." : "",
          bundle.analytics.metrics.materialShortageCount > 0 ? "Raise purchase requests for low-stock materials." : ""
        ].filter(Boolean)
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI assistant failed."
      },
      { status: 500 }
    );
  }
}
