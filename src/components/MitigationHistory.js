"use client";

import { useState, useEffect } from "react";

export default function MitigationHistory({ selectedDomain }) {
  const [history, setHistory] = useState([]);
  const [serverHistory, setServerHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    const local = JSON.parse(localStorage.getItem("auditHistory") || "[]");
    setHistory(local.slice(0, 10));

    // Load from API
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => setServerHistory(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allHistory = [...history, ...serverHistory];
  const filtered =
    selectedDomain === "Universal"
      ? allHistory
      : allHistory.filter((item) => item.domain === selectedDomain);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs font-semibold uppercase tracking-[0.15em] mb-3"
          style={{ color: "var(--primary)" }}
        >
          Audit Logs
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-on-surface mb-3">
          Mitigation History
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl leading-relaxed">
          A comprehensive log of algorithmic adjustments and bias mitigation strategies applied across your monitored datasets.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 stagger-children">
        <SummaryCard label="Total Audits" value={filtered.length} icon="analytics" />
        <SummaryCard
          label="Avg Improvement"
          value={
            filtered.filter((h) => h.newScore > 0).length > 0
              ? `+${(
                  filtered
                    .filter((h) => h.newScore > 0)
                    .reduce((acc, h) => acc + (h.newScore - h.originalScore), 0) /
                  filtered.filter((h) => h.newScore > 0).length
                ).toFixed(1)}`
              : "—"
          }
          icon="trending_up"
          color="var(--status-pass)"
        />
        <SummaryCard
          label="Bias Detected"
          value={filtered.filter((h) => h.originalScore < 80).length}
          icon="gpp_bad"
          color="var(--status-fail)"
        />
        <SummaryCard
          label="Resolved"
          value={filtered.filter((h) => h.newScore >= 80).length}
          icon="verified_user"
          color="var(--status-pass)"
        />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">progress_activity</span>
            <p className="mt-3 text-sm text-on-surface-variant">Loading history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3">history</span>
            <p className="text-on-surface-variant text-lg">No mitigation history found.</p>
            <p className="text-on-surface-variant text-sm mt-1">Upload a dataset to generate an audit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--outline-variant)" }}>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Dataset</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Domain</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Original</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Strategy</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Result</th>
                </tr>
              </thead>
              <tbody className="stagger-children">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-200"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,240,255,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{item.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">{item.datasetName}</td>
                    <td className="px-6 py-4">
                      <span className="status-pill text-xs" style={{ background: "rgba(0,240,255,0.08)", color: "var(--primary)" }}>
                        {item.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold" style={{ color: item.originalScore < 80 ? "var(--status-fail)" : "var(--status-warning)" }}>
                        {item.originalScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{item.mitigation}</td>
                    <td className="px-6 py-4">
                      {item.newScore > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: "var(--status-pass)" }}>
                            {item.newScore.toFixed(1)}
                          </span>
                          <span className="text-xs font-medium" style={{ color: "var(--status-pass)" }}>
                            ↑ +{(item.newScore - item.originalScore).toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-on-surface-variant">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="glass-card p-5 flex flex-col items-start">
      <span
        className="material-symbols-outlined text-[20px] mb-3"
        style={{ color: color || "var(--primary)" }}
      >
        {icon}
      </span>
      <span className="text-2xl font-serif font-normal text-on-surface">{value}</span>
      <span className="text-xs text-on-surface-variant mt-1">{label}</span>
    </div>
  );
}
