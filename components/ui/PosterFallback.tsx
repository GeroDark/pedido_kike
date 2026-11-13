"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/content/copy.es";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EYE = "M -0.31 0 Q 0 -0.25 0.31 0 Q 0 0.17 -0.31 0 Z";
const LID = "M -0.31 0 Q 0 -0.25 0.31 0";
const BROW =
  "M -0.42 -0.06 C -0.44 -0.2 -0.3 -0.3 0 -0.335 C 0.2 -0.345 0.4 -0.3 0.5 -0.235 C 0.35 -0.25 0.15 -0.235 0 -0.2 C -0.15 -0.17 -0.3 -0.1 -0.42 -0.06 Z";

function Dots({ id, r }: { id: string; r: number }) {
  return (
    <pattern id={id} width="0.022" height="0.0381" patternUnits="userSpaceOnUse">
      <circle cx="0.0055" cy="0.0095" r={r} fill="#e7e1d3" />
      <circle cx="0.0165" cy="0.0286" r={r} fill="#e7e1d3" />
    </pattern>
  );
}

/**
 * El cartel sin WebGL: el mismo rostro dibujado en SVG con tramas de puntos.
 * Con movimiento reducido los ojos se quedan quietos, mirando de frente.
 */
export default function PosterFallback() {
  const gaze = useRef<SVGGElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const group = gaze.current;
    const root = svg.current;
    if (!group || !root || reduced) return;
    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const dx = (event.clientX - (box.left + box.width / 2)) / (box.width / 2);
      const dy = (event.clientY - (box.top + box.height * 0.42)) / (box.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const k = Math.min(len, 1) / len;
      group.style.transform = `translate(${(dx * k * 0.1).toFixed(4)}px, ${(dy * k * 0.04).toFixed(4)}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <svg
      ref={svg}
      className="absolute inset-0 h-full w-full"
      viewBox="-1 -0.5 2 1.3"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={copy.s1.posterAlt}
    >
      <defs>
        <Dots id="ht-skin" r={0.0046} />
        <Dots id="ht-white" r={0.0105} />
        <Dots id="ht-iris" r={0.0058} />
        <linearGradient id="ht-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.06" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="0.9" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ht-mask" maskUnits="userSpaceOnUse" x="-1" y="-0.5" width="2" height="1.3">
          <rect x="-1" y="-0.5" width="2" height="1.3" fill="url(#ht-fade)" />
        </mask>
        <clipPath id="ht-eye-r">
          <path d={EYE} transform="translate(0.47 0)" />
        </clipPath>
        <clipPath id="ht-eye-l">
          <path d={EYE} transform="translate(-0.47 0)" />
        </clipPath>
      </defs>

      <rect x="-1" y="-0.5" width="2" height="1.3" fill="url(#ht-skin)" mask="url(#ht-mask)" />

      {[1, -1].map((side) => (
        <g key={side} transform={`translate(${side * 0.47} 0) scale(${side} 1)`}>
          <ellipse cx="0" cy="-0.03" rx="0.44" ry="0.25" fill="#111110" opacity="0.55" />
          <path d={EYE} fill="#111110" />
          <path d={EYE} fill="url(#ht-white)" />
          <path d={BROW} fill="#111110" />
        </g>
      ))}

      <g ref={gaze} style={{ transition: reduced ? undefined : "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {[1, -1].map((side) => (
          <g key={side} clipPath={`url(#ht-eye-${side === 1 ? "r" : "l"})`}>
            <g transform={`translate(${side * 0.47} -0.012)`}>
              <circle r="0.112" fill="#111110" />
              <circle r="0.112" fill="url(#ht-iris)" />
              <circle r="0.052" fill="#111110" />
              <circle cx="-0.036" cy="-0.038" r="0.02" fill="#e7e1d3" />
            </g>
          </g>
        ))}
      </g>

      {[1, -1].map((side) => (
        <path
          key={side}
          d={LID}
          transform={`translate(${side * 0.47} 0)`}
          fill="none"
          stroke="#111110"
          strokeWidth="0.032"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
