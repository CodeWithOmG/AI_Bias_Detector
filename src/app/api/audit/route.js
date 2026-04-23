import { NextResponse } from "next/server";
import Papa from "papaparse";

/**
 * POST /api/audit
 * Accepts a CSV file upload + domain string via FormData.
 * Performs domain validation ("Domain Guardian") and bias analysis.
 * Mirrors the FastAPI POST /audit endpoint from the original backend.
 *
 * FormData fields:
 *   - file: CSV file
 *   - domain: "Universal" | "Healthcare" | "Finance" | "Hiring"
 *
 * Returns: { overall_fairness_score, categories, summary }
 */
export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { detail: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  const domain = formData.get("domain") || "Universal";

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { detail: "No file uploaded." },
      { status: 400 }
    );
  }

  // Validate file type
  if (!file.name.endsWith(".csv")) {
    return NextResponse.json(
      { detail: "Only CSV files are supported." },
      { status: 400 }
    );
  }

  // Read and parse CSV
  const text = await file.text();
  let parsed;
  try {
    parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  } catch {
    return NextResponse.json(
      { detail: "Invalid CSV file format." },
      { status: 400 }
    );
  }

  if (!parsed.data || parsed.data.length === 0) {
    return NextResponse.json(
      { detail: "CSV file is empty or invalid." },
      { status: 400 }
    );
  }

  const columns = parsed.meta.fields || [];
  const columnsLower = columns.map((col) => col.toLowerCase());

  // Domain Guardian validation
  const domainKeywords = {
    Healthcare: ["diagnosis", "patient", "treatment", "age"],
    Finance: ["credit", "loan", "income", "amount"],
    Hiring: ["candidate", "resume", "role", "interview", "salary", "ethnicity"],
  };

  if (domain !== "Universal" && domainKeywords[domain]) {
    const keywords = domainKeywords[domain];
    const hasMatch = keywords.some((kw) =>
      columnsLower.some((col) => col.includes(kw))
    );
    if (!hasMatch) {
      return NextResponse.json(
        {
          detail: `Domain Mismatch: Non-${domain} dataset detected in ${domain} context`,
        },
        { status: 400 }
      );
    }
  }

  // Identify numeric target column
  const rows = parsed.data;
  let targetCol = null;

  if (columns.includes("Actual Amount")) {
    targetCol = "Actual Amount";
  } else {
    // Find first column where all non-empty values are numeric
    for (const col of columns) {
      const numericValues = rows
        .map((row) => row[col])
        .filter((v) => v !== "" && v !== null && v !== undefined);
      const allNumeric = numericValues.every((v) => !isNaN(Number(v)));
      if (allNumeric && numericValues.length > 0) {
        targetCol = col;
        break;
      }
    }
  }

  if (!targetCol) {
    return NextResponse.json(
      { detail: "Please specify the target column and bias-sensitive columns." },
      { status: 400 }
    );
  }

  // Identify categorical columns
  const catCols = columns.filter((col) => {
    const values = rows
      .map((row) => row[col])
      .filter((v) => v !== "" && v !== null && v !== undefined);
    const hasNonNumeric = values.some((v) => isNaN(Number(v)));
    return hasNonNumeric && values.length > 0;
  });

  if (catCols.length === 0) {
    return NextResponse.json(
      { detail: "Please specify the target column and bias-sensitive columns." },
      { status: 400 }
    );
  }

  // Find the best bias-sensitive column
  const biasColumns = ["Department", "Gender", "Race", "Ethnicity"];
  let analysisCol = null;
  for (const col of biasColumns) {
    if (catCols.includes(col)) {
      analysisCol = col;
      break;
    }
  }
  if (!analysisCol) {
    analysisCol = catCols[0];
  }

  // Group by analysis column and compute mean of target
  const groups = {};
  for (const row of rows) {
    const key = row[analysisCol];
    const val = Number(row[targetCol]);
    if (key && !isNaN(val)) {
      if (!groups[key]) {
        groups[key] = { sum: 0, count: 0 };
      }
      groups[key].sum += val;
      groups[key].count += 1;
    }
  }

  const groupMeans = {};
  for (const [key, { sum, count }] of Object.entries(groups)) {
    groupMeans[key] = sum / count;
  }

  const maxVal = Math.max(...Object.values(groupMeans));

  if (maxVal === 0 || isNaN(maxVal)) {
    return NextResponse.json(
      { detail: "Target metric values are zero or null." },
      { status: 400 }
    );
  }

  // Build category scores
  const categories = [];
  let totalScore = 0;
  let count = 0;

  for (const [cat, mean] of Object.entries(groupMeans)) {
    const ratio = mean / maxVal;
    const score = ratio * 100;

    let status = "Pass";
    if (score < 80) {
      status = "Fail";
    } else if (score < 90) {
      status = "Warning";
    }

    const details = `Mean ${targetCol}: ${mean.toFixed(2)} (${score.toFixed(1)}% of highest group)`;

    categories.push({
      category: cat,
      score,
      status,
      details,
    });

    totalScore += score;
    count += 1;
  }

  const overallScore = count > 0 ? totalScore / count : 0;

  // Build summary
  const failures = categories
    .filter((c) => c.status === "Fail")
    .map((c) => c.category);

  let summary = `Analyzed ${analysisCol} against ${targetCol}. `;
  if (failures.length > 0) {
    summary += `Significant disparate impact detected in: ${failures.join(", ")}.`;
  } else {
    summary += "No critical biases found across groups.";
  }

  return NextResponse.json({
    overall_fairness_score: overallScore,
    categories,
    summary,
  });
}
