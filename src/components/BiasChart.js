"use client";

export default function BiasChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxScore = 100;

  const getBarColor = (score) => {
    if (score >= 90) return "var(--status-pass)";
    if (score >= 80) return "var(--status-warning)";
    return "var(--status-fail)";
  };

  const getBarGradient = (score) => {
    if (score >= 90) return "linear-gradient(90deg, #059669, #10B981)";
    if (score >= 80) return "linear-gradient(90deg, #D97706, #F59E0B)";
    return "linear-gradient(90deg, #DC2626, #EF4444)";
  };

  return (
    <div className="space-y-4 stagger-children">
      {data.map((item, i) => (
        <div key={i} className="group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-on-surface">{item.category}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: getBarColor(item.score) }}>
                {item.score.toFixed(1)}%
              </span>
              <span
                className={`status-pill text-xs ${
                  item.status === "Pass" ? "status-pass" : item.status === "Warning" ? "status-warning" : "status-fail"
                }`}
              >
                {item.status}
              </span>
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${(item.score / maxScore) * 100}%`,
                background: getBarGradient(item.score),
                boxShadow: `0 0 8px ${getBarColor(item.score)}40`,
              }}
            />
          </div>
          <p className="text-xs text-on-surface-variant mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.details}
          </p>
        </div>
      ))}
    </div>
  );
}
