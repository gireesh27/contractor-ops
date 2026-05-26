import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { rateLimit } from "@/lib/cache";
import { generateProjectAiAnswer } from "@/lib/ai";
import { AIRequestLog } from "@/lib/db/models";
import { objectId } from "@/lib/data-access";
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
    const db = mongooseConnection?.connection?.db;

    if (!db) {
      return NextResponse.json(
        { error: "Database connection is not ready." },
        { status: 500 }
      );
    }

    const organizationObjectId = objectId(tenant.organizationId);

    const organizationMatch = {
      $in: [organizationObjectId, tenant.organizationId],
    };

    const collections = await db
      .listCollections({}, { nameOnly: true })
      .toArray();

    const existingCollections = new Set(
      collections.map((collection: any) => collection.name)
    );

    async function readCollection(
      collectionName: string,
      query: any,
      limit = 100
    ) {
      if (!existingCollections.has(collectionName)) return [];

      return db
        .collection(collectionName)
        .find(query)
        .sort({ createdAt: -1, updatedAt: -1, _id: -1 })
        .limit(limit)
        .toArray();
    }

    async function readOne(collectionName: string, query: any) {
      if (!existingCollections.has(collectionName)) return null;

      return db.collection(collectionName).findOne(query);
    }

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

    const project = await readOne("projects", projectQuery);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const projectObjectId = project._id;
    const projectIdValues = [
      projectObjectId,
      String(projectObjectId),
      projectId,
      project?.id,
    ].filter(Boolean);

    const projectDataQuery = {
      organizationId: organizationMatch,
      $or: [
        { projectId: { $in: projectIdValues } },
        { project: { $in: projectIdValues } },
        { project_id: { $in: projectIdValues } },
      ],
    };

    const [
      boq,
      estimates,
      dailyProgress,
      labour,
      materials,
      equipment,
      measurements,
      bills,
      payments,
      vendors,
      expenses,
      sitePhotos,
      documents,
      reports,
      tasks,
      schedule,
    ] = await Promise.all([
      readCollection("boqs", projectDataQuery, 300),
      readCollection("estimates", projectDataQuery, 200),
      readCollection("dailyprogresses", projectDataQuery, 200),
      readCollection("labours", projectDataQuery, 200),
      readCollection("materials", projectDataQuery, 200),
      readCollection("equipment", projectDataQuery, 200),
      readCollection("measurements", projectDataQuery, 300),
      readCollection("bills", projectDataQuery, 200),
      readCollection("payments", projectDataQuery, 200),
      readCollection("vendors", projectDataQuery, 200),
      readCollection("expenses", projectDataQuery, 200),
      readCollection("sitephotos", projectDataQuery, 100),
      readCollection("documents", projectDataQuery, 100),
      readCollection("reports", projectDataQuery, 100),
      readCollection("tasks", projectDataQuery, 200),
      readCollection("schedules", projectDataQuery, 100),
    ]);

    const billedAmount = sumAmount(bills);
    const receivedAmount = sumAmount(payments);
    const materialTotal = sumAmount(materials);
    const labourTotal = sumAmount(labour);
    const equipmentTotal = sumAmount(equipment);
    const expensesTotal = sumAmount(expenses);

    const dashboard = {
      projectName:
        project.name ||
        project.projectName ||
        project.title ||
        projectName ||
        "Selected project",

      contractValue:
        numberValue(project.contractValue) ||
        numberValue(project.value) ||
        numberValue(project.amount),

      boqValue: sumAmount(boq),
      billedAmount,
      receivedAmount,
      outstanding: billedAmount - receivedAmount,

      materialThisMonth: sumAmount(materials.filter(isCurrentMonth)),
      labourThisMonth: sumAmount(labour.filter(isCurrentMonth)),
      expenseThisMonth: sumAmount(expenses.filter(isCurrentMonth)),

      totalMaterialCost: materialTotal,
      totalLabourCost: labourTotal,
      totalEquipmentCost: equipmentTotal,
      totalExpenses: expensesTotal,

      estimatedProfitLoss:
        billedAmount - materialTotal - labourTotal - equipmentTotal - expensesTotal,

      totalBoqItems: boq.length,
      totalBills: bills.length,
      totalPayments: payments.length,
      totalMeasurements: measurements.length,
      totalDailyProgressEntries: dailyProgress.length,
      totalTasks: tasks.length,
    };

    const aiInput = {
      projectId: String(projectObjectId),
      projectName: dashboard.projectName,
      question,
      dashboard,
      data: cleanForAi({
        project,
        boq,
        estimates,
        dailyProgress,
        labour,
        materials,
        equipment,
        measurements,
        bills,
        payments,
        vendors,
        expenses,
        sitePhotos,
        documents,
        reports,
        tasks,
        schedule,
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
      data: result,
    });
  } catch (error) {
    console.error("AI assistant route failed", error);

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
