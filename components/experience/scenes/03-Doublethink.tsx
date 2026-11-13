"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import MemoryHole from "@/components/ui/MemoryHole";
import Rewrite from "@/components/ui/Rewrite";
import Ticker from "@/components/ui/Ticker";
import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative } from "@/lib/narrative";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useReveal } from "@/lib/useReveal";

const SELF_CORRECT_MS = 3600;

/**
 * 03 · Doblepiensa. Un interruptor con la misma palabra a los dos lados.
 * Accionarlo invierte la página y cambia los hechos; nadie lo explica.
 */
export default function Doublethink() {
  const root = useRef<HTMLElement>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const selfRef = useRef<HTMLParagraphElement>(null);
  const busy = useRef(false);
  const [truth, setTruth] = useState<0 | 1>(0);
  const [selfCorrected, setSelfCorrected] = useState(false);
  const corrections = useNarrative((s) => s.corrections);
  const flip = useNarrative((s) => s.flip);
  const correct = useNarrative((s) => s.correct);
  const reduced = useReducedMotion();

  useReveal(root);

  // El párrafo que se corrige solo mientras lo lees.
  useEffect(() => {
    const el = selfRef.current;
    if (!el || selfCorrected) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (!entry?.isIntersecting) return;
        timer = window.setTimeout(() => {
          setSelfCorrected(true);
          correct();
        }, SELF_CORRECT_MS);
      },
      { threshold: 0.9 },
    );
    observer.observe(el);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [selfCorrected, correct]);

  const toggle = () => {
    if (busy.current) return;
    audio.relay();
    const swap = () => {
      setTruth((value) => (value === 0 ? 1 : 0));
      flip();
    };
    if (reduced || !wipe.current) {
      swap();
      return;
    }
    busy.current = true;
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false;
        },
      })
      .set(wipe.current, { transformOrigin: "0% 50%" })
      .to(wipe.current, { scaleX: 1, duration: 0.24, ease: "power3.in" })
      .add(swap)
      .set(wipe.current, { transformOrigin: "100% 50%" })
      .to(wipe.current, { scaleX: 0, duration: 0.36, ease: "expo.out" }, "+=0.05");
  };

  const { war, ration, equation } = copy.s3;

  return (
    <section
      ref={root}
      id="escena-3"
      data-scene="3"
      data-truth={truth === 0 ? "a" : "b"}
      aria-labelledby="h-3"
      className={`doublethink surface-paper ${truth === 0 ? "on-paper" : "on-ink"} overflow-hidden px-5 pt-[18svh] md:px-8`}
    >
      <div ref={wipe} className="truth-wipe" aria-hidden="true" />

      <header className="flex flex-wrap items-start justify-between gap-8 md:pr-20">
        <div>
          <p className="kicker" data-reveal>
            {copy.s3.kicker}
          </p>
          <p className="mt-4 max-w-[30ch] font-serif text-xl italic leading-snug" data-reveal>
            {copy.s3.intro}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={truth === 1}
          aria-label={copy.s3.switchLabel}
          className="truth-switch py-2"
          onClick={toggle}
          data-reveal
        >
          <span aria-hidden="true">{copy.s3.truth}</span>
          <span className="truth-track" aria-hidden="true">
            <span className="truth-knob" />
          </span>
          <span aria-hidden="true">{copy.s3.truth}</span>
        </button>
      </header>

      <div className="mt-[10svh] grid gap-12 md:grid-cols-12 md:gap-8 md:pr-20">
        <div className={`md:col-span-8 ${truth === 1 ? "md:order-2 md:text-right" : ""}`}>
          <h2 id="h-3" tabIndex={-1} className="display text-[clamp(2.5rem,7.6vw,8.25rem)] outline-none" data-reveal>
            {war.lead}{" "}
            <span className="whitespace-nowrap">
              <Rewrite value={war.enemy[truth]} />.
            </span>
          </h2>
          <p className={`mt-8 font-serif text-[clamp(1.2rem,2.1vw,1.9rem)] leading-snug ${truth === 1 ? "md:ml-auto" : ""}`} data-reveal>
            {war.always}{" "}
            <span className="whitespace-nowrap">
              <Rewrite value={war.enemy[truth]} />.
            </span>
            <br />
            {ration.lead} <Rewrite value={ration.verb[truth]} /> {ration.tail}
          </p>
        </div>

        <div className={`md:col-span-4 ${truth === 1 ? "md:order-1" : "md:text-right"}`}>
          <p className="display whitespace-nowrap text-[clamp(3.4rem,6.4vw,7rem)]" data-reveal>
            {equation.lead} <span className={truth === 1 ? "bg-file px-[0.08em] text-paper" : "text-file"}>
              <Rewrite value={equation.result[truth]} />
            </span>
          </p>
          <p className={`mt-5 max-w-[32ch] text-[13px] leading-relaxed ${truth === 1 ? "" : "md:ml-auto"}`} data-reveal>
            {copy.s3.equationNote}
          </p>
        </div>
      </div>

      <p ref={selfRef} className="mt-[14svh] max-w-[30ch] font-serif text-[clamp(1.2rem,2.1vw,1.9rem)] italic leading-snug">
        <Rewrite value={copy.s3.selfCorrect[selfCorrected ? 1 : 0]} wrap />
      </p>

      <MemoryHole />

      <div className="-mx-5 mt-[16svh] md:-mx-8">
        <Ticker count={corrections} />
      </div>

      <p className="sr-only" aria-live="polite">
        {corrections > 0 ? `${copy.s3.srCorrected} ${war.lead} ${war.enemy[truth]}. ${equation.lead} ${equation.result[truth]}.` : ""}
      </p>
    </section>
  );
}
