import { copy } from "@/content/copy.es";

/**
 * Sello del Ministerio de la Verdad. Tipografía y círculos: ningún icono.
 * El anillo de texto gira como elemento HTML (solo compositor); rotar un <g>
 * con textPath obligaría a recalcular el texto en cada fotograma.
 */
export default function Seal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" focusable="false">
        <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="64" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="62" y1="80" x2="138" y2="80" stroke="currentColor" strokeWidth="1" />
        <text x="100" y="114" textAnchor="middle" fill="currentColor" fontSize="38" style={{ fontFamily: "var(--font-display)" }}>
          6079
        </text>
        <line x1="62" y1="124" x2="138" y2="124" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg viewBox="0 0 200 200" className="seal-ring absolute inset-0 h-full w-full" focusable="false">
        <defs>
          <path id="seal-ring" d="M100,100 m-79,0 a79,79 0 1,1 158,0 a79,79 0 1,1 -158,0" />
        </defs>
        <text fill="currentColor" fontSize="10.5" style={{ fontFamily: "var(--font-mono)" }} textLength="490" lengthAdjust="spacing">
          <textPath href="#seal-ring">{copy.s0.seal}</textPath>
        </text>
      </svg>
    </div>
  );
}
