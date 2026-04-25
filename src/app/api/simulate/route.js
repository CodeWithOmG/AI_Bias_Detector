import { NextResponse } from "next/server";

/**
 * POST /api/simulate
 * Takes audit results and simulates what each mitigation strategy
 * would do to the fairness and accuracy scores.
 *
 * Body JSON: { overall_fairness_score: number, categories: BiasScore[] }
 * Returns: { strategies: MitigationStrategy[] }
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
    console.log("[Simulation API] Received body:", JSON.stringify(body).slice(0, 200) + "...");
  } catch (err) {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const { overall_fairness_score, categories } = body;

    if (overall_fairness_score === undefined || !categories || categories.length === 0) {
      return NextResponse.json(
        { detail: "Missing audit data. Run an audit first." },
        { status: 400 }
      );
    }

    const baseFairness = Math.max(0, Math.min(100, overall_fairness_score));
    const baseAccuracy = 88.0;

    // Each strategy trades accuracy for fairness at different rates
    const strategies = [
      {
        id: "baseline",
        name: "Baseline",
        icon: "speed",
        accuracy: round(baseAccuracy),
        fairness: round(baseFairness),
        description: "Original model with no fairness intervention applied.",
        note: generateNote("baseline", baseFairness),
      },
      {
        id: "threshold",
        name: "Threshold Adjustment",
        icon: "tune",
        accuracy: round(baseAccuracy - 0.5 - Math.random() * 0.5),
        fairness: round(Math.min(98.5, baseFairness + 12 + Math.random() * 2)),
        description: "Lowers the 'acceptance bar' for the disadvantaged group until selection rates are equalized.",
        note: generateNote("threshold", baseFairness),
      },
      {
        id: "reweighting",
        name: "Data Reweighting",
        icon: "balance",
        accuracy: round(baseAccuracy - 2.5 - Math.random() * 1.5),
        fairness: round(Math.min(99.2, baseFairness + 20 + Math.random() * 4)),
        description: "Increases the statistical weight of 'Unfairly Rejected' rows so the model learns their true value.",
        note: generateNote("reweighting", baseFairness),
      },
      {
        id: "adversarial",
        name: "Adversarial Debiasing",
        icon: "psychology",
        accuracy: round(baseAccuracy - 5.0 - Math.random() * 2.5),
        fairness: round(Math.min(99.8, baseFairness + 28 + Math.random() * 5)),
        description: "Strips 'hidden signals' (like Zip Code or Gender) out of the decision-making process to ensure model blindness.",
        note: generateNote("adversarial", baseFairness),
      },
    ];

    const recommended = strategies.reduce((best, s) => {
      if (s.id === "baseline") return best;
      const score = s.fairness * 0.8 + s.accuracy * 0.2;
      const bestScore = best.fairness * 0.8 + best.accuracy * 0.2;
      return score > bestScore ? s : best;
    }, strategies[1]);

    const improvementRatio = baseFairness < 100 ? (recommended.fairness - baseFairness) / (100 - baseFairness || 1) : 0;

    const categoryProjections = categories.map((cat) => {
      const currentScore = typeof cat.score === 'number' ? cat.score : 0;
      const gap = 100 - currentScore;
      const afterScore = Math.min(100, round(currentScore + gap * improvementRatio * (0.85 + Math.random() * 0.3)));
      const afterStatus = afterScore >= 90 ? "Pass" : afterScore >= 80 ? "Warning" : "Fail";
      return {
        category: cat.category || "Unknown",
        before: round(currentScore),
        beforeStatus: cat.status || "Unknown",
        after: afterScore,
        afterStatus,
        delta: round(afterScore - currentScore),
      };
    });

    return NextResponse.json({
      strategies,
      recommendedId: recommended.id,
      recommendedName: recommended.name,
      baselineAccuracy: round(baseAccuracy),
      baselineFairness: round(baseFairness),
      afterFairness: recommended.fairness,
      afterAccuracy: recommended.accuracy,
      improvementDelta: round(recommended.fairness - baseFairness),
      categoryProjections,
    });
  } catch (error) {
    console.error("[Simulation API] Simulation Error:", error);
    return NextResponse.json({ detail: "Internal simulation error. Please try again." }, { status: 500 });
  }

  return NextResponse.json({
    strategies,
    recommendedId: recommended.id,
    recommendedName: recommended.name,
    baselineAccuracy: round(baseAccuracy),
    baselineFairness: round(baseFairness),
    afterFairness: recommended.fairness,
    afterAccuracy: recommended.accuracy,
    improvementDelta: round(recommended.fairness - baseFairness),
    categoryProjections,
  });
}


function round(n) {
  return Math.round(n * 10) / 10;
}

function generateNote(strategy, baseFairness) {
  if (baseFairness >= 90) {
    switch (strategy) {
      case "baseline":
        return "Model already exhibits strong fairness.";
      case "threshold":
        return "Minor calibration for marginal improvement.";
      case "reweighting":
        return "Balanced trade-off for near-perfect parity.";
      case "adversarial":
        return "Aggressive debiasing; may overcorrect.";
      case "constraint":
        return "Maximum parity at higher accuracy cost.";
    }
  }
  if (baseFairness >= 70) {
    switch (strategy) {
      case "baseline":
        return "Moderate fairness gaps detected.";
      case "threshold":
        return "Quick improvement with minimal accuracy loss.";
      case "reweighting":
        return "Strong balance between accuracy and fairness.";
      case "adversarial":
        return "Significant fairness gain; acceptable accuracy trade.";
      case "constraint":
        return "Near-full parity with constrained accuracy.";
    }
  }
  switch (strategy) {
    case "baseline":
      return "Significant fairness issues require intervention.";
    case "threshold":
      return "Partial improvement; deeper methods recommended.";
    case "reweighting":
      return "Meaningful improvement in demographic parity.";
    case "adversarial":
      return "Substantial debiasing with moderate accuracy cost.";
    case "constraint":
      return "Strongest correction available for severe bias.";
    default:
      return "";
  }
}
