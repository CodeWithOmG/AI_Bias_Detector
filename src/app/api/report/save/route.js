import { NextResponse } from "next/server";
import { saveReport } from "@/lib/reportStore";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { base64, fileName } = await request.json();
    if (!base64) return NextResponse.json({ detail: "Missing data" }, { status: 400 });

    const id = uuidv4();
    saveReport(id, base64, fileName);

    return NextResponse.json({ id });
  } catch (error) {
    return NextResponse.json({ detail: "Error saving report" }, { status: 500 });
  }
}
