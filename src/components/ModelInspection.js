"use client";

import { useState, useEffect } from "react";
import ModelPerformanceChart from "./ModelPerformanceChart";
import BeforeAfterComparison from "./BeforeAfterComparison";
import ReportDownloadSection from "./ReportDownloadSection";

export default function ModelInspection({ analysisResult }) {
  const [strategies, setStrategies] = useState(null);
  const [recommendedId, setRecommendedId] = useState(null);
  const [recommendedName, setRecommendedName] = useState("");
  const [aiInsight, setAiInsight] = useState("");
  const [categoryProjections, setCategoryProjections] = useState(null);
  const [afterFairness, setAfterFairness] = useState(0);
  const [afterAccuracy, setAfterAccuracy] = useState(0);
  const [baselineAccuracy, setBaselineAccuracy] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysisResult) {
      setStrategies(null);
      setCategoryProjections(null);
      return;
    }

    setLoading(true);
    setError("");

    fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overall_fairness_score: analysisResult.overall_fairness_score,
        categories: analysisResult.categories,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.detail) {
          setError(data.detail);
        } else {
          setStrategies(data.strategies);
          setRecommendedId(data.recommendedId);
          setRecommendedName(data.recommendedName || "");
          setAiInsight(data.aiInsight || "");
          setCategoryProjections(data.categoryProjections || null);
          setAfterFairness(data.afterFairness || 0);
          setAfterAccuracy(data.afterAccuracy || 0);
          setBaselineAccuracy(data.baselineAccuracy || 0);
        }
      })
      .catch(() => setError("Failed to simulate mitigations."))
      .finally(() => setLoading(false));
  }, [analysisResult]);

  const hasData = strategies && strategies.length > 0;
  const beforeFairness = analysisResult?.overall_fairness_score ?? 0;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-3"
          style={{ color: "var(--primary)" }}
        >
          Consistency Metrics
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-on-surface mb-3">
          Model Inspection
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          {hasData
            ? "Simulated trade-offs between accuracy and fairness — with per-group before vs. after projections."
            : "Analyze the trade-offs between model accuracy and fairness. Run an audit first to see personalized simulations."}
        </p>
      </div>

      {/* No data prompt */}
      {!analysisResult && (
        <div className="glass-card p-10 text-center mb-8 animate-fade-in">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">monitoring</span>
          <h3 className="font-serif text-xl text-on-surface mb-2">No Audit Data Yet</h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto">
            Upload and audit a dataset on the Dashboard first. The metrics here will
            automatically update to show simulated mitigation strategies tailored to your data.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 text-center mb-8">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin block mx-auto">progress_activity</span>
          <p className="mt-3 text-sm text-on-surface-variant">Simulating mitigation strategies…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-6 mb-8" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm" style={{ color: "var(--status-fail)" }}>{error}</p>
        </div>
      )}

      {/* Trade-off Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Radar chart */}
        <div className="glass-card p-8 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
            <h3 className="font-serif text-xl font-normal text-on-surface">
              Multidimensional Analysis
            </h3>
            {hasData && (
              <span className="status-pill status-pass text-[10px] ml-auto">
                <span className="material-symbols-outlined text-[12px]">bolt</span>
                Live Data
              </span>
            )}
          </div>
          <ModelPerformanceChart strategies={strategies} />
        </div>

        {/* Trade-off Coordinates */}
        <div className="glass-card p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-[20px]">bubble_chart</span>
            <h3 className="font-serif text-xl font-normal text-on-surface">
              Trade-off Plot
            </h3>
          </div>
          
          <div className="flex-1 relative min-h-[250px] border-l border-b border-outline-variant ml-4 mb-4 mt-2">
            {/* Grid labels */}
            <span className="absolute -left-8 top-1/2 -rotate-90 text-[10px] font-bold uppercase text-on-surface-variant">Fairness</span>
            <span className="absolute left-1/2 -bottom-6 text-[10px] font-bold uppercase text-on-surface-variant">Accuracy</span>
            
            {hasData && (
              <>
                {/* Baseline point */}
                <div 
                  className="absolute w-3 h-3 bg-outline rounded-full transform -translate-x-1/2 translate-y-1/2 transition-all duration-700"
                  style={{ left: `${baselineAccuracy}%`, bottom: `${beforeFairness}%` }}
                  title={`Baseline: Acc ${baselineAccuracy}%, Fair ${beforeFairness}%`}
                >
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap text-on-surface-variant">Baseline</span>
                </div>
                
                {/* Mitigated point */}
                <div 
                  className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(0,240,255,0.5)] transform -translate-x-1/2 translate-y-1/2 animate-pulse transition-all duration-700 delay-300"
                  style={{ left: `${afterAccuracy}%`, bottom: `${afterFairness}%` }}
                  title={`${recommendedName}: Acc ${afterAccuracy}%, Fair ${afterFairness}%`}
                >
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap text-primary font-bold">Mitigated</span>
                </div>

                {/* Connection line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1={`${baselineAccuracy}%`} 
                    y1={`${100 - beforeFairness}%`} 
                    x2={`${afterAccuracy}%`} 
                    y2={`${100 - afterFairness}%`} 
                    stroke="var(--primary)" 
                    strokeWidth="1" 
                    strokeDasharray="4 2" 
                    opacity="0.3"
                  />
                </svg>
              </>
            )}
          </div>
          
          <div className="mt-auto space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Fairness Target</span>
              <span className="text-primary font-serif">95.0%+</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Accuracy Floor</span>
              <span className="text-on-surface font-serif">85.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After comparison — shown when live data available */}
      {hasData && categoryProjections && (
        <BeforeAfterComparison
          analysisResult={analysisResult}
          categoryProjections={categoryProjections}
          recommendedName={recommendedName}
          beforeFairness={Math.round(beforeFairness)}
          afterFairness={Math.round(afterFairness)}
          beforeAccuracy={Math.round(baselineAccuracy)}
          afterAccuracy={Math.round(afterAccuracy)}
        />
      )}

      {/* Gemini AI Insight */}
      {hasData && aiInsight && (
        <div className="glass-card p-6 mb-8 border-l-4" style={{ borderLeftColor: "#4285F4" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#4285F4" }}>auto_awesome</span>
            <h3 className="font-serif text-lg text-on-surface">Gemini Insight</h3>
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">{aiInsight}</p>
        </div>
      )}

      {/* Strategy insight cards */}
      {hasData ? (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant mb-4">
            All Strategies Comparison
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {strategies.map((s) => (
              <InsightCard
                key={s.id}
                icon={s.icon}
                title={s.name}
                accuracy={s.accuracy}
                fairness={s.fairness}
                note={s.note}
                description={s.description}
                highlighted={s.id === recommendedId}
              />
            ))}
          </div>
        </div>
      ) : !loading && analysisResult ? null : !loading ? (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant mb-4">
            All Strategies Comparison
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {["Baseline", "Threshold Adjust", "Data Reweighting", "Adversarial Debiasing", "Fairness Constraint"].map(
              (title) => <PlaceholderCard key={title} title={title} />
            )}
          </div>
        </div>
      ) : null}

      {/* Report Section */}
      {hasData && (
        <ReportDownloadSection
          analysisResult={analysisResult}
          strategies={strategies}
          recommendedId={recommendedId}
          recommendedName={recommendedName}
          categoryProjections={categoryProjections}
          beforeFairness={Math.round(beforeFairness)}
          afterFairness={Math.round(afterFairness)}
          beforeAccuracy={Math.round(baselineAccuracy)}
          afterAccuracy={Math.round(afterAccuracy)}
        />
      )}
    </div>
  );
}

function InsightCard({ icon, title, accuracy, fairness, note, description, highlighted }) {
  return (
    <div
      className="glass-card p-6 transition-all duration-300 hover:-translate-y-1"
      style={
        highlighted
          ? { border: "1px solid rgba(0,240,255,0.3)", boxShadow: "0 8px 32px rgba(0,105,112,0.1)" }
          : {}
      }
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
        <h4 className="font-medium text-sm text-on-surface">{title}</h4>
        {highlighted && (
          <span className="status-pill status-pass text-[10px] ml-auto">Recommended</span>
        )}
      </div>
      <div className="flex gap-6 mb-3">
        <div>
          <p className="text-2xl font-serif text-on-surface">{accuracy}%</p>
          <p className="text-xs text-on-surface-variant">Accuracy</p>
        </div>
        <div>
          <p className="text-2xl font-serif" style={{ color: "var(--primary)" }}>{fairness}%</p>
          <p className="text-xs text-on-surface-variant">Fairness</p>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed mb-1">{note}</p>
      {description && (
        <p className="text-[11px] text-outline mt-1 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function PlaceholderCard({ title }) {
  return (
    <div className="glass-card p-6 opacity-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[18px] text-outline-variant">lock</span>
        <h4 className="font-medium text-sm text-on-surface-variant">{title}</h4>
      </div>
      <div className="flex gap-6 mb-3">
        <div>
          <p className="text-2xl font-serif text-outline-variant">—</p>
          <p className="text-xs text-on-surface-variant">Accuracy</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-outline-variant">—</p>
          <p className="text-xs text-on-surface-variant">Fairness</p>
        </div>
      </div>
      <p className="text-xs text-outline-variant">Run an audit to unlock.</p>
    </div>
  );
}
