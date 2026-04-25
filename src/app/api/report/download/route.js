import { NextResponse } from "next/server";
import { getReport } from "@/lib/reportStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return new Response("Missing ID", { status: 400 });

  const report = getReport(id);
  if (!report) return new Response("Report expired or not found", { status: 404 });

  const buffer = Buffer.from(report.data, 'base64');
  const fileName = report.fileName || "Guardian_Audit_Report.pdf";

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "no-cache",
    },
  });
}
