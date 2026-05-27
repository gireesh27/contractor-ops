import { NextRequest } from "next/server";
import { buildExcel, buildProfessionalPdf, buildWord } from "@/lib/exports";
import { getProjectReportRows, listRecords } from "@/lib/data-access";
import { collectionModels, type CollectionName } from "@/lib/db/models";
import { getTenantContext } from "@/lib/tenant";

function isCollection(value: string): value is CollectionName {
  return value in collectionModels;
}

export async function GET(request: NextRequest) {
  const tenant = await getTenantContext({ required: true });
  const title = request.nextUrl.searchParams.get("title") || "ContractorOps Report";
  const type = request.nextUrl.searchParams.get("type") || "reports";
  const format = request.nextUrl.searchParams.get("format") || "pdf";
  const projectId = request.nextUrl.searchParams.get("projectId") || undefined;
  const collection = isCollection(type) ? type : "reports";
  const rows = tenant
    ? type === "project-complete" && projectId
      ? await getProjectReportRows(tenant.organizationId, projectId)
      : await listRecords(collection, tenant.organizationId, { projectId })
    : [];
  const exportInput = { title, subtitle: projectId ? "Generated from selected project records only" : "Generated from tenant-scoped ContractorOps records", rows, preparedBy: tenant?.userName || "ContractorOps" };

  if (format === "xlsx") {
    return new Response(new Uint8Array(await buildExcel(exportInput)), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.xlsx"`
      }
    });
  }

  if (format === "docx") {
    return new Response(new Uint8Array(await buildWord(exportInput)), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.docx"`
      }
    });
  }

  if (format === "csv") {
    const headers = Array.from(new Set(rows.flatMap((row: any) => Object.keys(row || {}))));
    const csv = [
      headers.join(","),
      ...rows.map((row: any) => headers.map((header) => `"${String(row?.[header] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv"`
      }
    });
  }

  return new Response(new Uint8Array(await buildProfessionalPdf(exportInput)), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf"`
    }
  });
}
