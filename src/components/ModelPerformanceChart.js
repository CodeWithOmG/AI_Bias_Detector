"use client";

const FALLBACK_DATA = [
  { subject: "Baseline", Accuracy: 94, Fairness: 62 },
  { subject: "Threshold Adjust", Accuracy: 92, Fairness: 74 },
  { subject: "Data Reweighting", Accuracy: 89, Fairness: 85 },
  { subject: "Adversarial Debiasing", Accuracy: 87, Fairness: 92 },
  { subject: "Fairness Constraint", Accuracy: 84, Fairness: 96 },
];

export default function ModelPerformanceChart({ strategies }) {
  const chartData = strategies
    ? strategies.map((s) => ({
        subject: s.name,
        Accuracy: s.accuracy,
        Fairness: s.fairness,
      }))
    : FALLBACK_DATA;

  const maxVal = 100;
  const centerX = 150;
  const centerY = 150;
  const radius = 110;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / chartData.length;

  const buildPolygon = (key) =>
    chartData
      .map((d, i) => {
        const val = d[key] / maxVal;
        const x = centerX + radius * val * Math.cos(angleSlice * i - Math.PI / 2);
        const y = centerY + radius * val * Math.sin(angleSlice * i - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");

  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1);
    return (
      <circle key={i} cx={centerX} cy={centerY} r={r}
        fill="none" stroke="var(--outline-variant)" strokeWidth="0.5" opacity="0.5" />
    );
  });

  const axes = chartData.map((d, i) => {
    const x = centerX + radius * Math.cos(angleSlice * i - Math.PI / 2);
    const y = centerY + radius * Math.sin(angleSlice * i - Math.PI / 2);
    const labelX = centerX + (radius + 22) * Math.cos(angleSlice * i - Math.PI / 2);
    const labelY = centerY + (radius + 22) * Math.sin(angleSlice * i - Math.PI / 2);
    return (
      <g key={i}>
        <line x1={centerX} y1={centerY} x2={x} y2={y}
          stroke="var(--outline-variant)" strokeWidth="0.5" opacity="0.5" />
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central"
          fill="var(--on-surface-variant)" fontSize="10" fontFamily="var(--font-body)">
          {d.subject.length > 14 ? d.subject.slice(0, 14) + "…" : d.subject}
        </text>
      </g>
    );
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px]">
        {gridCircles}
        {axes}
        <polygon points={buildPolygon("Accuracy")}
          fill="rgba(130, 29, 218, 0.15)" stroke="var(--secondary)" strokeWidth="2" />
        <polygon points={buildPolygon("Fairness")}
          fill="rgba(0, 240, 255, 0.12)" stroke="var(--primary-container)" strokeWidth="2" />
        {chartData.map((d, i) => {
          const accVal = d.Accuracy / maxVal;
          const fairVal = d.Fairness / maxVal;
          const ax = centerX + radius * accVal * Math.cos(angleSlice * i - Math.PI / 2);
          const ay = centerY + radius * accVal * Math.sin(angleSlice * i - Math.PI / 2);
          const fx = centerX + radius * fairVal * Math.cos(angleSlice * i - Math.PI / 2);
          const fy = centerY + radius * fairVal * Math.sin(angleSlice * i - Math.PI / 2);
          return (
            <g key={i}>
              <circle cx={ax} cy={ay} r="4" fill="var(--secondary)" opacity="0.8" />
              <circle cx={ax} cy={ay} r="2" fill="white" />
              <circle cx={fx} cy={fy} r="4" fill="var(--primary-container)" opacity="0.8" />
              <circle cx={fx} cy={fy} r="2" fill="white" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-6 text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--secondary)" }} />
          <span className="text-on-surface-variant">Accuracy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: "var(--primary-container)" }} />
          <span className="text-on-surface-variant">Fairness</span>
        </div>
      </div>
    </div>
  );
}
