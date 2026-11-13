"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Seal from "@/components/ui/Seal";
import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative } from "@/lib/narrative";

/**
 * 00 · Calibración. El loader es el aparato calentándose. La secuencia es CSS
 * puro (no espera a JavaScript) y cualquier tecla o toque la salta.
 */
export default function Calibration() {
  const powered = useNarrative((s) => s.powered);
  const power = useNarrative((s) => s.power);
  const reduced = useNarrative((s) => s.reduced);
  const inner = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (powered) return;
    const skip = () => setSkipped(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [powered]);

  if (powered) return null;

  const turnOn = (withSound: boolean) => {
    if (leaving.current) return;
    leaving.current = true;

    // El audio solo nace aquí, dentro del gesto del visitante.
    const soundOn = withSound ? audio.start() : false;
    if (soundOn) audio.powerOn();

    if (reduced || !inner.current) {
      power(soundOn);
      return;
    }

    // Cambio de canal: la imagen colapsa en una línea y la línea en un punto.
    gsap
      .timeline({ onComplete: () => power(soundOn) })
      .set(inner.current, { animation: "none" })
      .set(flash.current, { animation: "none", opacity: 0 })
      .to(flash.current, { opacity: 1, duration: 0.2, ease: "power2.in" }, 0)
      .to(inner.current, { scaleY: 0.003, duration: 0.24, ease: "power3.in" }, 0)
      .to(inner.current, { scaleX: 0, duration: 0.2, ease: "power2.in" });
  };

  return (
    <div className={`calibration ${skipped ? "is-skipped" : ""}`} role="region" aria-label="Calibración del telescreen">
      <div ref={inner} className="cal-inner surface-screen">
        <div ref={flash} className="cal-flash" aria-hidden="true" />

        <header className="kicker flex justify-between gap-4 px-5 pt-5 text-fog md:px-8 md:pt-7">
          <span>{copy.s0.station}</span>
          <span>{copy.s0.unit}</span>
        </header>

        <div className="flex flex-1 flex-col justify-end px-5 pb-6 md:px-8 md:pb-8">
          <Seal className="cal-step mb-[5svh] h-[clamp(5.5rem,16svh,10rem)] w-[clamp(5.5rem,16svh,10rem)] text-paper" />
          <p className="display text-[min(19vw,26svh)] text-paper">{copy.s0.title}</p>
          <p className="cal-step mt-3 font-serif text-[clamp(1.1rem,2.1vw,1.75rem)] italic text-paper" style={{ "--d": "500ms" } as React.CSSProperties}>
            {copy.meta.tagline}
          </p>
        </div>

        <div className="grid gap-6 border-t border-paper/30 px-5 py-5 md:grid-cols-2 md:gap-12 md:px-8 md:py-7">
          <ol className="flex flex-col gap-1.5 text-[13px] uppercase tracking-[0.08em] text-phosphor">
            {copy.s0.boot.map((line, i) => (
              <li key={line.label} className="boot-line cal-step" style={{ "--d": `${800 + i * 420}ms` } as React.CSSProperties}>
                <span>{line.label}</span>
                <span className="leader" aria-hidden="true" />
                <span className="cal-step" style={{ "--d": `${1040 + i * 420}ms` } as React.CSSProperties}>
                  {line.status}
                </span>
              </li>
            ))}
          </ol>

          <div className="cal-step" style={{ "--d": "2150ms" } as React.CSSProperties}>
            <button type="button" className="power-btn" onClick={() => turnOn(true)}>
              {copy.s0.power}
            </button>
            <div className="kicker mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-paper">
              <button type="button" className="link kicker py-1" onClick={() => turnOn(false)}>
                {copy.s0.powerSilent}
              </button>
              <a href="/lectura/" className="link py-1">
                {copy.ui.readingMode}
              </a>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-fog">
              {copy.s0.soundNote} {copy.s0.privacy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
