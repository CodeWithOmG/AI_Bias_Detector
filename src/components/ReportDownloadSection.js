"use client";

import { useState } from "react";

// ── Domain-specific bias explanations ──
function getBiasRootCause(domain, summary, categories) {
  const failedGroups = categories.filter(c => c.status === "Fail").map(c => c.category).join(", ");

  if (domain === "Finance") {
    return {
      title: "Geographic & Socioeconomic Redlining",
      cause: `The audit detected that applicants within the same credit-score tier receive significantly different approval rates depending on their Zip Code. This pattern — historically known as "redlining" — means the model has learned to use location as a hidden proxy for race or income level. Affected groups: ${failedGroups || "multiple zip-code regions"}.`,
      impact: "Qualified applicants in certain areas are systematically denied credit despite having comparable financial profiles to approved applicants elsewhere. This violates the Equal Credit Opportunity Act (ECOA) and Fair Housing Act principles.",
      evidence: summary || "Conditional fairness analysis revealed statistically significant disparities across geographic segments within identical credit tiers."
    };
  }
  if (domain === "Healthcare") {
    return {
      title: "Wealth-Based Care Prioritization",
      cause: `The system disproportionately prioritizes patients with higher annual healthcare spending for priority care assignments. This creates a feedback loop where wealthier patients receive faster and better care, while lower-spending patients — who may have equal or greater medical need — are deprioritized. Affected groups: ${failedGroups || "lower-spending patient cohorts"}.`,
      impact: "Patients with fewer financial resources face delayed treatment and reduced access to priority care, potentially worsening health outcomes and deepening healthcare inequity.",
      evidence: summary || "Spending-bin analysis showed a significant disparate impact ratio between high-spending and low-spending patient groups."
    };
  }
  // Hiring / Universal
  return {
    title: "Demographic Selection Rate Disparity",
    cause: `The model exhibits unequal selection (hiring/approval) rates across demographic groups defined by the protected attribute. Certain groups are selected at rates well below the 80% threshold relative to the most-favored group. Affected groups: ${failedGroups || "one or more demographic segments"}.`,
    impact: "Under-represented groups face systemic disadvantage in the decision pipeline, which may constitute disparate impact discrimination under Title VII of the Civil Rights Act and EEOC guidelines.",
    evidence: summary || "Standard disparate impact analysis identified selection-rate gaps exceeding the four-fifths rule threshold."
  };
}

function getMitigationSolutions(domain, recommendedName) {
  const solutions = [
    {
      title: "Immediate: Apply " + recommendedName,
      description: `Deploy the "${recommendedName}" strategy identified as the optimal balance between fairness improvement and accuracy retention. This addresses the most critical disparities while maintaining model performance.`,
      timeline: "1-2 weeks"
    },
    {
      title: "Short-Term: Feature Audit & Removal",
      description: domain === "Finance"
        ? "Remove or mask Zip Code and geographic proxy features from the model. Replace with credit-behavior-only features that do not correlate with protected characteristics."
        : domain === "Healthcare"
        ? "Decouple spending-level features from care prioritization logic. Introduce medical-need severity scores as the primary ranking factor instead of financial indicators."
        : "Remove name, address, and other identity-correlated features. Use skill-based and qualification-based features exclusively for candidate evaluation.",
      timeline: "2-4 weeks"
    },
    {
      title: "Medium-Term: Retraining with Balanced Data",
      description: "Collect or synthesize a balanced training dataset that equally represents all demographic groups. Apply data reweighting during training to prevent the model from learning historical biases.",
      timeline: "1-3 months"
    },
    {
      title: "Long-Term: Continuous Monitoring Pipeline",
      description: "Establish an automated fairness monitoring pipeline that runs bias audits on every model update. Set alert thresholds at 85% fairness score and block deployments that fall below 80%.",
      timeline: "Ongoing"
    }
  ];
  return solutions;
}

// ── Helpers ──
function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line, i) => {
    doc.text(line, x, y + i * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function checkPageBreak(doc, currentY, needed) {
  if (currentY + needed > 270) {
    doc.addPage();
    return 25;
  }
  return currentY;
}

function addSectionHeader(doc, sectionNum, title, y) {
  y = checkPageBreak(doc, y, 20);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 105, 112);
  doc.text(`${sectionNum}. ${title}`, 20, y);
  doc.setTextColor(60, 60, 60);
  return y + 10;
}

// ── Main Component ──
export default function ReportDownloadSection({
  analysisResult, strategies, recommendedId, recommendedName,
  categoryProjections, beforeFairness, afterFairness, beforeAccuracy, afterAccuracy
}) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const jspdf = await import("jspdf");
      const jsPDF = jspdf.jsPDF || jspdf.default;
      const autotable = await import("jspdf-autotable");
      const autoTable = autotable.default || autotable;

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      const domain = analysisResult?.domain || "Universal";
      const datasetName = analysisResult?.datasetName || "Uploaded Dataset";
      const protectedAttr = analysisResult?.analysis_column || "Detected Attribute";
      const diRatio = analysisResult?.disparate_impact_ratio ?? (beforeFairness / 100);
      const isBiased = analysisResult?.is_high_bias || analysisResult?.is_sensitive_bias || false;
      const rootCause = getBiasRootCause(domain, analysisResult?.summary, analysisResult?.categories || []);
      const solutions = getMitigationSolutions(domain, recommendedName);

      // ═══════════════════════════════════════
      //  PAGE 1: COVER & EXECUTIVE SUMMARY
      // ═══════════════════════════════════════

      // Header bar
      doc.setFillColor(0, 105, 112);
      doc.rect(0, 0, 210, 8, "F");

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(0, 105, 112);
      doc.text("FairMIND", 20, 28);

      doc.setFontSize(11);
      doc.setTextColor(120, 120, 120);
      doc.text("AI Fairness & Bias Detection Platform", 20, 36);

      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Comprehensive Bias Audit Report", 20, 52);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${timestamp}`, 20, 60);

      // Divider
      doc.setDrawColor(0, 105, 112);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      // Section 1: Executive Summary
      let y = addSectionHeader(doc, 1, "Executive Summary", 78);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const summaryRows = [
        ["Dataset", datasetName],
        ["Domain", domain],
        ["Protected Attribute", protectedAttr],
        ["Disparate Impact Ratio", diRatio.toFixed(3) + (diRatio < 0.8 ? "  (BELOW 80% THRESHOLD)" : "  (Compliant)")],
        ["Original Fairness Score", beforeFairness + "%"],
        ["Bias Detected", isBiased ? "YES — Intervention Required" : "NO — Within Acceptable Range"],
        ["Recommended Strategy", recommendedName],
        ["Projected Fairness Score", afterFairness + "%"]
      ];

      autoTable(doc, {
        startY: y,
        body: summaryRows,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 55, textColor: [0, 105, 112] },
          1: { cellWidth: 120 }
        },
        margin: { left: 22 }
      });

      y = doc.lastAutoTable.finalY + 8;

      // Summary narrative
      y = checkPageBreak(doc, y, 25);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      y = wrapText(doc, analysisResult?.summary || "Audit completed successfully.", 22, y, 165, 5);

      // ═══════════════════════════════════════
      //  SECTION 2: BEFORE vs AFTER COMPARISON
      // ═══════════════════════════════════════
      y += 12;
      y = addSectionHeader(doc, 2, "Before vs. After Mitigation Comparison", y);

      // Overview metrics
      autoTable(doc, {
        startY: y,
        head: [["Metric", "Before (Original)", "After (" + recommendedName + ")", "Change"]],
        body: [
          ["Fairness Score", beforeFairness + "%", afterFairness + "%", "+" + (afterFairness - beforeFairness) + " pts"],
          ["Accuracy", beforeAccuracy + "%", afterAccuracy + "%", (afterAccuracy - beforeAccuracy >= 0 ? "+" : "") + (afterAccuracy - beforeAccuracy) + " pts"],
          ["Compliance (80% Rule)", beforeFairness >= 80 ? "PASS" : "FAIL", afterFairness >= 80 ? "PASS" : "FAIL", afterFairness >= 80 && beforeFairness < 80 ? "RESOLVED" : "—"]
        ],
        theme: "grid",
        headStyles: { fillColor: [0, 105, 112], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: 22 }
      });

      y = doc.lastAutoTable.finalY + 8;

      // Per-category comparison
      if (categoryProjections && categoryProjections.length > 0) {
        y = checkPageBreak(doc, y, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        doc.text("Group-Level Before vs. After Breakdown", 22, y);
        y += 6;

        const catData = categoryProjections.map(c => [
          c.category,
          c.before + "%",
          c.beforeStatus,
          c.after + "%",
          c.afterStatus,
          (c.delta >= 0 ? "+" : "") + c.delta + "%"
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Group", "Before Score", "Before Status", "After Score", "After Status", "Delta"]],
          body: catData,
          theme: "striped",
          headStyles: { fillColor: [50, 55, 65], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 22 },
          didParseCell: (data) => {
            if (data.section === "body") {
              if (data.column.index === 2) {
                const val = data.cell.raw;
                if (val === "Fail") data.cell.styles.textColor = [220, 38, 38];
                else if (val === "Warning") data.cell.styles.textColor = [217, 119, 6];
                else data.cell.styles.textColor = [5, 150, 105];
              }
              if (data.column.index === 4) {
                const val = data.cell.raw;
                if (val === "Pass") data.cell.styles.textColor = [5, 150, 105];
                else if (val === "Warning") data.cell.styles.textColor = [217, 119, 6];
                else data.cell.styles.textColor = [220, 38, 38];
              }
            }
          }
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // ═══════════════════════════════════════
      //  SECTION 3: ROOT CAUSE OF BIAS
      // ═══════════════════════════════════════
      y = checkPageBreak(doc, y, 60);
      y = addSectionHeader(doc, 3, "Root Cause Analysis", y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(rootCause.title, 22, y);
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 105, 112);
      doc.text("Why does this bias exist?", 22, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      y = wrapText(doc, rootCause.cause, 22, y, 165, 5);
      y += 6;

      y = checkPageBreak(doc, y, 30);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 105, 112);
      doc.text("What is the real-world impact?", 22, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      y = wrapText(doc, rootCause.impact, 22, y, 165, 5);
      y += 6;

      y = checkPageBreak(doc, y, 20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 105, 112);
      doc.text("Evidence from audit:", 22, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      y = wrapText(doc, rootCause.evidence, 22, y, 165, 5);
      y += 12;

      // ═══════════════════════════════════════
      //  SECTION 4: MITIGATION SOLUTIONS
      // ═══════════════════════════════════════
      y = checkPageBreak(doc, y, 50);
      y = addSectionHeader(doc, 4, "Recommended Solutions & Action Plan", y);

      const solData = solutions.map(s => [s.title, s.description, s.timeline]);
      autoTable(doc, {
        startY: y,
        head: [["Action", "Description", "Timeline"]],
        body: solData,
        theme: "grid",
        headStyles: { fillColor: [0, 105, 112], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 45 },
          1: { cellWidth: 105 },
          2: { cellWidth: 25, halign: "center" }
        },
        margin: { left: 22 }
      });
      y = doc.lastAutoTable.finalY + 10;

      // ═══════════════════════════════════════
      //  SECTION 5: ALL STRATEGIES COMPARISON
      // ═══════════════════════════════════════
      y = checkPageBreak(doc, y, 40);
      y = addSectionHeader(doc, 5, "Full Strategy Comparison", y);

      const stratData = (strategies || []).map(s => [
        s.name,
        s.accuracy + "%",
        s.fairness + "%",
        s.note || "",
        s.id === recommendedId ? "RECOMMENDED" : ""
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Strategy", "Accuracy", "Fairness", "Assessment", "Status"]],
        body: stratData,
        theme: "striped",
        headStyles: { fillColor: [50, 55, 65], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 22 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 4 && data.cell.raw === "RECOMMENDED") {
            data.cell.styles.textColor = [0, 105, 112];
            data.cell.styles.fontStyle = "bold";
          }
        }
      });
      y = doc.lastAutoTable.finalY + 10;

      // ═══════════════════════════════════════
      //  SECTION 6: COMPLIANCE SUMMARY
      // ═══════════════════════════════════════
      y = checkPageBreak(doc, y, 40);
      y = addSectionHeader(doc, 6, "Regulatory Compliance Summary", y);

      const complianceData = [
        ["EEOC Four-Fifths Rule", diRatio >= 0.8 ? "PASS" : "FAIL", "Disparate Impact Ratio must be >= 0.80"],
        ["EU AI Act (High-Risk)", isBiased ? "REVIEW NEEDED" : "COMPLIANT", "Bias testing required for high-risk AI systems"],
        ["Post-Mitigation Status", afterFairness >= 80 ? "EXPECTED PASS" : "FURTHER ACTION NEEDED", "Projected score after applying " + recommendedName]
      ];

      autoTable(doc, {
        startY: y,
        head: [["Regulation / Standard", "Status", "Notes"]],
        body: complianceData,
        theme: "grid",
        headStyles: { fillColor: [0, 105, 112], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 22 },
        didParseCell: (data) => {
          if (data.section === "body" && data.column.index === 1) {
            const val = data.cell.raw;
            if (val === "PASS" || val === "COMPLIANT" || val === "EXPECTED PASS") {
              data.cell.styles.textColor = [5, 150, 105];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = "bold";
            }
          }
        }
      });

      // ═══════════════════════════════════════
      //  FOOTER ON ALL PAGES
      // ═══════════════════════════════════════
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Bottom bar
        doc.setFillColor(0, 105, 112);
        doc.rect(0, 289, 210, 8, "F");
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`FairMIND Bias Audit Report  |  Confidential  |  Page ${i} of ${pageCount}`, 105, 293.5, { align: "center" });
      }

      // ═══════════════════════════════════════
      //  DOWNLOAD
      // ═══════════════════════════════════════
      const fileName = `FairMIND_Audit_${domain.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF report. Error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="glass-card p-8 mt-10 animate-fade-in-up" style={{ borderLeft: "4px solid var(--primary)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
            <h3 className="font-serif text-2xl font-normal text-on-surface">
              Comprehensive Audit Report
            </h3>
          </div>
          <p className="text-on-surface-variant text-sm max-w-md">
            Download a professional PDF with before/after comparison, root cause
            analysis of detected bias, actionable solutions, and regulatory
            compliance summary.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {["Executive Summary", "Before vs After", "Root Cause", "Solutions", "Compliance"].map(tag => (
              <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ background: "rgba(0,105,112,0.08)", color: "var(--primary)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="pill-btn pill-btn-primary self-start sm:self-center"
        >
          {generating ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Generating…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              Download PDF Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}
