import type { TrailSnapshot } from "@/lib/session";

interface HeatmapProps {
  trail: TrailSnapshot;
  label: string;
  className?: string;
}

/**
 * El mapa de atención del expediente, en la misma trama de puntos que el
 * cartel: el visitante acaba dibujado con la tinta que le vigilaba.
 */
export default function Heatmap({ trail, label, className = "" }: HeatmapProps) {
  const { cols, rows, values, max } = trail;

  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} className={className} role="img" aria-label={label}>
      {values.map((value, i) => {
        const r = max > 0 && value > 0 ? 0.12 + 0.4 * Math.sqrt(value / max) : 0.05;
        return <circle key={i} cx={(i % cols) + 0.5} cy={Math.floor(i / cols) + 0.5} r={r} fill="currentColor" />;
      })}
    </svg>
  );
}
