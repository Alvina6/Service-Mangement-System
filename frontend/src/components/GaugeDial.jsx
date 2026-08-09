"use client";

/**
 * Circular gauge — the site's signature motif, echoing the thermostats and
 * pressure gauges that are literally part of an HVAC technician's toolkit.
 * value/max determine the sweep; used for hero stats, dashboard KPIs, and
 * contract/job progress indicators.
 */
export default function GaugeDial({
  value = 72,
  max = 100,
  size = 160,
  stroke = 10,
  label,
  sublabel,
  accent = "#2E6E9E",
  trackColor = "#26313F",
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  // Gauges sweep 270deg (like an analog dial), starting at -225deg
  const sweep = 0.75;
  const dashArray = `${circumference * sweep} ${circumference}`;
  const progressDashArray = `${circumference * sweep * pct} ${circumference}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label || "Gauge"}: ${value} of ${max}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeDasharray={progressDashArray}
          strokeLinecap="round"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center px-2">
        <span className="font-mono text-2xl font-medium text-ice">{value}</span>
        {label && <span className="text-[11px] uppercase tracking-wider text-slate-light mt-0.5">{label}</span>}
        {sublabel && <span className="text-[10px] text-slate-light/70">{sublabel}</span>}
      </div>
    </div>
  );
}
