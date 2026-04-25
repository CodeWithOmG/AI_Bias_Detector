"use client";

import { useState } from "react";

function getBarColor(score) {
  if (score >= 90) return "linear-gradient(90deg, #059669, #10B981)";
  if (score >= 80) return "linear-gradient(90deg, #D97706, #F59E0B)";
  return "linear-gradient(90deg, #DC2626, #EF4444)";
}

function getStatusColor(status) {
  if (status === "Pass") return "var(--status-pass)";
  if (status === "Warning") return "var(--status-warning)";
  return "var(--status-fail)";
}

function ScoreDial({ score, label, color }) {
  const clamp = Math.max(0, Math.min(100, score));
  // SVG arc: radius 44, circumference = 2πr ≈ 276.5, we use half-circle arc style
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - clamp / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--surface-container-high)"
            strokeWidth="8"
          />
          {/* Fill */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-2xl font-normal leading-none" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function BeforeAfterComparison({
  analysisResult,
  categoryProjections,
  recommendedName,
  beforeFairness,
  afterFairness,
  beforeAccuracy,
  afterAccuracy,
}) {
  const [activeView, setActiveView] = useState("categories"); // "categories" | "overview"

  if (!analysisResult || !categoryProjections || categoryProjections.length === 0) return null;

  const overallDelta = afterFairness - beforeFairness;
  const resolvedCount = categoryProjections.filter(
    (c) => c.beforeStatus !== "Pass" && c.afterStatus === "Pass"
  ).length;
  const improvedCount = categoryProjections.filter((c) => c.delta > 0).length;

  return (
    <div className="glass-card overflow-hidden mb-8 animate-slide-up">
      {/* Panel header */}
      <div
        className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ borderBottom: "1px solid var(--outline-variant)" }}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-primary">compare_arrows</span>
          <div>
            <h3 className="font-serif text-xl font-normal text-on-surface leading-tight">
              Before vs. After Mitigation
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Applied strategy:{" "}
              <span className="font-semibold text-primary">{recommendedName}</span>
            </p>
          </div>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center gap-1 p-1 rounded-full self-start sm:self-auto"
          style={{
            background: "var(--surface-container)",
            border: "1px solid var(--outline-variant)",
          }}
        >
          {[
            { id: "categories", label: "By Category" },
            { id: "overview", label: "Overview" },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                background: activeView === v.id ? "white" : "transparent",
                color: activeView === v.id ? "var(--primary)" : "var(--on-surface-variant)",
                boxShadow: activeView === v.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview tab */}
      {activeView === "overview" && (
        <div className="p-8 animate-fade-in">
          {/* Summary stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatBadge
              label="Fairness Gain"
              value={`+${overallDelta.toFixed(1)}`}
              sub="percentage points"
              color="var(--status-pass)"
              icon="trending_up"
            />
            <StatBadge
              label="Categories Resolved"
              value={`${resolvedCount}/${categoryProjections.length}`}
              sub="bias issues fixed"
              color="var(--primary)"
              icon="verified_user"
            />
            <StatBadge
              label="Improved Groups"
              value={`${improvedCount}`}
              sub="demographic groups"
              color="var(--secondary)"
              icon="groups"
            />
            <StatBadge
              label="Accuracy Delta"
              value={`${(afterAccuracy - beforeAccuracy).toFixed(1)}`}
              sub="trade-off cost"
              color={afterAccuracy >= beforeAccuracy ? "var(--status-pass)" : "var(--status-warning)"}
              icon="speed"
            />
          </div>

          {/* Score dials */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {/* Before */}
            <div className="flex flex-col items-center gap-6">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: "rgba(239,68,68,0.1)", color: "var(--status-fail)" }}
              >
                Before
              </span>
              <div className="flex gap-8">
                <ScoreDial score={beforeFairness} label="Fairness" color="var(--status-fail)" />
                <ScoreDial score={beforeAccuracy} label="Accuracy" color="var(--on-surface-variant)" />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-primary">arrow_forward</span>
              <span className="text-xs text-on-surface-variant font-medium">{recommendedName}</span>
            </div>

            {/* After */}
            <div className="flex flex-col items-center gap-6">
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: "rgba(16,185,129,0.1)", color: "var(--status-pass)" }}
              >
                After
              </span>
              <div className="flex gap-8">
                <ScoreDial score={afterFairness} label="Fairness" color="var(--status-pass)" />
                <ScoreDial score={afterAccuracy} label="Accuracy" color="var(--on-surface-variant)" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories tab */}
      {activeView === "categories" && (
        <div className="p-8 animate-fade-in">
          <div className="space-y-6 stagger-children">
            {categoryProjections.map((proj, i) => (
              <CategoryRow key={i} proj={proj} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({ proj }) {
  const improved = proj.delta > 0;
  const statusChanged = proj.beforeStatus !== proj.afterStatus;

  return (
    <div>
      {/* Category label + delta */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">{proj.category}</span>
          {statusChanged && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-fade-in"
              style={{ background: "rgba(16,185,129,0.12)", color: "var(--status-pass)" }}
            >
              ↑ Resolved
            </span>
          )}
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: improved ? "var(--status-pass)" : "var(--on-surface-variant)" }}
        >
          {improved ? `+${proj.delta}` : proj.delta}
        </span>
      </div>

      {/* Before bar */}
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider w-12 text-right shrink-0"
          style={{ color: "var(--status-fail)" }}>
          Before
        </span>
        <div className="flex-1">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${proj.before}%`,
                background: getBarColor(proj.before),
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 w-24 shrink-0">
          <span className="text-xs font-semibold" style={{ color: getStatusColor(proj.beforeStatus) }}>
            {proj.before}%
          </span>
          <span
            className={`status-pill text-[10px] ${
              proj.beforeStatus === "Pass" ? "status-pass" :
              proj.beforeStatus === "Warning" ? "status-warning" : "status-fail"
            }`}
          >
            {proj.beforeStatus}
          </span>
        </div>
      </div>

      {/* After bar */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider w-12 text-right shrink-0"
          style={{ color: "var(--status-pass)" }}>
          After
        </span>
        <div className="flex-1">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${proj.after}%`,
                background: getBarColor(proj.after),
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 w-24 shrink-0">
          <span className="text-xs font-semibold" style={{ color: getStatusColor(proj.afterStatus) }}>
            {proj.after}%
          </span>
          <span
            className={`status-pill text-[10px] ${
              proj.afterStatus === "Pass" ? "status-pass" :
              proj.afterStatus === "Warning" ? "status-warning" : "status-fail"
            }`}
          >
            {proj.afterStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, sub, color, icon }) {
  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.5)", border: "1px solid var(--outline-variant)" }}
    >
      <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
      <span className="font-serif text-2xl font-normal" style={{ color }}>{value}</span>
      <div>
        <span className="text-xs font-semibold text-on-surface">{label}</span>
        <p className="text-[10px] text-on-surface-variant">{sub}</p>
      </div>
    </div>
  );
}
