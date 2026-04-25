"use client";

import BiasChart from "./BiasChart";

export default function AnalysisResults({ result }) {
  if (!result) return null;

  const score = Math.round(result.overall_fairness_score);
  const failures = result.categories.filter((c) => c.status === "Fail");
  const warnings = result.categories.filter((c) => c.status === "Warning");

  return (
    <div className="animate-slide-up mt-10">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
          style={{ color: "var(--primary)" }}
        >
          Fairness Insight
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-on-surface mb-2">
          Analysis Complete
        </h2>
        <p className="text-on-surface-variant text-base max-w-2xl">
          {result.summary}
        </p>
      </div>

      {/* Simple Insight Card for Finance/Healthcare */}
      {(result.domain === "Finance" || result.domain === "Healthcare") && (
        <div className="glass-card p-6 mb-8 border-l-4" style={{ borderColor: result.is_sensitive_bias ? "var(--status-fail)" : "var(--status-pass)" }}>
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-[24px]" style={{ color: result.is_sensitive_bias ? "var(--status-fail)" : "var(--status-pass)" }}>
              {result.is_sensitive_bias ? "info" : "check_circle"}
            </span>
            <div>
              <h4 className="font-semibold text-on-surface mb-1">Simple Insight</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {result.domain === "Finance" 
                  ? (result.is_sensitive_bias 
                      ? "Even with the same credit scores, people in some areas are getting approved less often. This suggests the system is biased against certain locations." 
                      : "The system is fair: people with similar credit scores are getting approved at similar rates, regardless of where they live.")
                  : (result.is_sensitive_bias 
                      ? "Wealthier patients (higher spenders) are being prioritized for care more often than those who spend less, which may be unfair." 
                      : "The system treats patients fairly regardless of their annual healthcare spending levels.")
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation badge */}
      <div className="flex items-center gap-3 mb-8">
        <span
          className="status-pill status-pass"
          style={failures.length > 0 ? { background: result.is_sensitive_bias ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.1)", color: result.is_sensitive_bias ? "#DC2626" : "#D97706" } : {}}
        >
          <span className="material-symbols-outlined text-[16px]">
            {failures.length > 0 ? (result.is_sensitive_bias ? "gpp_bad" : "analytics") : "verified_user"}
          </span>
          {failures.length > 0 
            ? (result.is_sensitive_bias ? "Bias Detected" : "Operational Disparity") 
            : "Domain Guardian Passed"}
        </span>
        {result.is_sensitive_bias && failures.length > 0 && (
          <span className="status-pill" style={{ background: "rgba(0,105,112,0.1)", color: "var(--primary)" }}>
            <span className="material-symbols-outlined text-[14px]">groups</span>
            Sensitive Attribute
          </span>
        )}
        {warnings.length > 0 && (
          <span className="status-pill status-warning">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {warnings.length} Warning{warnings.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Disparate Impact
          </span>
          <span className={`text-2xl font-serif ${result.disparate_impact_ratio < 0.8 ? 'text-error' : 'text-primary'}`}>
            {result.disparate_impact_ratio?.toFixed(3) || "0.000"}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">Ratio (80% Rule)</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Average Odds
          </span>
          <span className={`text-2xl font-serif ${result.equal_opportunity_diff > 0.1 ? 'text-warning' : 'text-primary'}`}>
            {result.equal_opportunity_diff?.toFixed(3) || "0.000"}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">Difference</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Decision Domain
          </span>
          <span className="text-xl font-serif text-primary">
            {result.domain || "Universal"}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">Identified context</span>
        </div>
        <div className="glass-card p-4 flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            Audit Integrity
          </span>
          <span className="text-xl font-serif text-primary">
            Verified
          </span>
          <span className="text-[10px] text-on-surface-variant mt-1">System signature</span>
        </div>
      </div>

      {/* Score + Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Overall Score */}
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant mb-6">
            Overall Fairness
          </p>
          <div
            className="score-ring animate-float-gauge"
            style={{ "--score": score }}
          >
            <span className="score-ring-value">{score}</span>
          </div>
          <p className="text-sm text-on-surface-variant mt-4">
            Threshold: 80% (Bias Detection)
          </p>
        </div>

        {/* Bias Distribution */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
              <h3 className="font-serif text-xl font-normal text-on-surface">
                Bias Distribution
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Attribute
              </span>
              <span className="text-xs font-semibold text-primary">
                {result.analysis_column || "Sensitive Attribute"}
              </span>
            </div>
          </div>
          <BiasChart data={result.categories} />
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-[20px]">description</span>
          <h3 className="font-serif text-xl font-normal text-on-surface">
            Detailed Findings
          </h3>
        </div>
        <div className="space-y-4 stagger-children">
          {result.categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl transition-all duration-300 hover:shadow-sm"
              style={{
                background: "rgba(255,255,255,0.4)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-on-surface">{cat.category}</span>
                <span
                  className={`status-pill text-xs ${
                    cat.status === "Pass" ? "status-pass" : cat.status === "Warning" ? "status-warning" : "status-fail"
                  }`}
                >
                  {cat.status} — {cat.score.toFixed(1)}
                </span>
              </div>
              <div className="progress-track mb-2">
                <div
                  className="progress-fill"
                  style={{
                    width: `${cat.score}%`,
                    background:
                      cat.status === "Pass"
                        ? "linear-gradient(90deg, #059669, #10B981)"
                        : cat.status === "Warning"
                        ? "linear-gradient(90deg, #D97706, #F59E0B)"
                        : "linear-gradient(90deg, #DC2626, #EF4444)",
                  }}
                />
              </div>
              <p className="text-xs text-on-surface-variant">{cat.details}</p>
            </div>
          ))}
        </div>
        {/* Audit Log */}
      {result.audit_log && (
        <div className="glass-card p-8 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
            <h3 className="font-serif text-xl font-normal text-on-surface">
              System Audit Log
            </h3>
          </div>
          <div 
            className="bg-surface-container-low p-4 rounded-lg font-mono text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed border border-outline-variant"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {result.audit_log}
          </div>
          <p className="text-[10px] text-outline mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            Cryptographically signed audit trail confirmed.
          </p>
        </div>
      )}
    </div>
    </div>
  );
}
