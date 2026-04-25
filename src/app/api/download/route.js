import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const base64Data = formData.get("base64");
    const fileName = formData.get("fileName") || "Guardian_Audit_Report.pdf";

    if (!base64Data) {
      return NextResponse.json({ detail: "Missing PDF data." }, { status: 400 });
    }

    // Decode base64
    const buffer = Buffer.from(base64Data, 'base64');

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download API Error:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
