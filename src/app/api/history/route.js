import { NextResponse } from "next/server";

/**
 * GET /api/history
 * Returns mock mitigation history entries.
 * Mirrors the FastAPI GET /history endpoint from the original backend.
 */
export async function GET() {
  const history = [
    {
      id: 1,
      datasetName: "Patient Admissions 2023",
      domain: "Healthcare",
      originalScore: 62.5,
      mitigation: "Threshold Adjustment",
      newScore: 88.2,
      date: "2024-03-15",
    },
    {
      id: 2,
      datasetName: "Loan Applications Q1",
      domain: "Finance",
      originalScore: 58.0,
      mitigation: "Data Reweighting",
      newScore: 91.5,
      date: "2024-04-02",
    },
    {
      id: 3,
      datasetName: "Tech Resume Screening",
      domain: "Hiring",
      originalScore: 45.3,
      mitigation: "Adversarial Debiasing",
      newScore: 85.7,
      date: "2024-04-18",
    },
    {
      id: 4,
      datasetName: "Credit Scoring Model v2",
      domain: "Finance",
      originalScore: 72.1,
      mitigation: "Fairness Constraint",
      newScore: 94.0,
      date: "2024-04-20",
    },
  ];

  return NextResponse.json(history);
}
