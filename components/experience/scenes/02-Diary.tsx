"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative } from "@/lib/narrative";
import { registerGsap } from "@/lib/scroll";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useReveal } from "@/lib/useReveal";

type Phase = "writing" | "sealed" | "skipped";

const SEAL_DELAY_MS = 3000;

/**
 * 02 · El diario. Una hoja y un teclado de verdad. Tres segundos después de
 * la última tecla cae el sello. La frase se guarda en memoria para el final.
 */
export default function Diary() {
  const root = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const stamp = useRef<HTMLSpanElement>(null);
  const timer = useRef(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("writing");
  const setDiary = useNarrative((s) => s.setDiary);
  const skipDiary = useNarrative((s) => s.skipDiary);
  const powered = useNarrative((s) => s.powered);
  const reduced = useReducedMotion();

  useReveal(root);

  // El papel se desliza sobre la mesa al entrar.
  useEffect(() => {
    registerGsap();
    if (reduced || !powered) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sheet.current,
        { yPercent: 32, rotate: 2.4 },
        {
          yPercent: 0,
          rotate: -0.6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 96%", end: "top 22%", scrub: 0.4 },
        },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced, powered]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const seal = (value: string) => {
    window.clearTimeout(timer.current);
    const phrase = value.trim();
    if (!phrase) return;
    setDiary(phrase);
    setPhase("sealed");
  };

  // El sello cae.
  useEffect(() => {
    if (phase !== "sealed" || !stamp.current) return;
    if (reduced) {
      audio.stamp();
      gsap.fromTo(stamp.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      return;
    }
    const tl = gsap
      .timeline()
      .fromTo(
        stamp.current,
        { opacity: 0, scale: 2.8, rotate: -2 },
        { opacity: 1, scale: 1, rotate: -9, duration: 0.2, ease: "power4.in" },
      )
      .add(() => audio.stamp())
      .fromTo(sheet.current, { y: 6 }, { y: 0, duration: 0.55, ease: "elastic.out(1.1, 0.35)" });
    return () => {
      tl.kill();
    };
  }, [phase, reduced]);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (phase !== "writing") return;
    const value = event.target.value.replace(/\n/g, " ");
    setText(value);
    audio.key();
    window.clearTimeout(timer.current);
    if (value.trim()) timer.current = window.setTimeout(() => seal(value), SEAL_DELAY_MS);
  };

  const skip = () => {
    window.clearTimeout(timer.current);
    setText("");
    skipDiary();
    setPhase("skipped");
  };

  return (
    <section
      ref={root}
      id="escena-2"
      data-scene="2"
      aria-labelledby="h-2"
      className="surface-dark on-ink relative overflow-hidden bg-ink px-5 pb-[20svh] pt-[24svh] md:px-8"
    >
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4 md:pt-[6svh]">
          <p className="kicker text-fog" data-reveal>
            {copy.s2.kicker}
          </p>
          <h2
            id="h-2"
            tabIndex={-1}
            className="mt-5 font-serif text-[clamp(1.9rem,3.3vw,3.1rem)] leading-[1.08] tracking-[-0.01em] outline-none"
            data-reveal
          >
            {copy.s2.prompt}
          </h2>
          <p className="mt-6 max-w-[34ch] text-[13px] leading-relaxed text-fog" data-reveal>
            {copy.s2.sub}
          </p>
        </div>

        <div className="md:col-span-8">
          <div
            ref={sheet}
            className="sheet on-paper min-h-[56svh] pb-10 pl-[clamp(2.6rem,6vw,5rem)] pr-5 pt-8 md:-mr-8 md:pb-16 md:pr-14 md:pt-12"
          >
            <div className="sheet-holes" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>

            <div className="kicker flex justify-between gap-4">
              <span>{copy.s2.sheetHeader}</span>
              <span>6079</span>
            </div>
            <p className="mt-8 font-serif text-xl italic">{copy.s2.date}</p>

            <label htmlFor="diary" className="sr-only">
              {copy.s2.prompt}
            </label>
            <textarea
              id="diary"
              className="diary-input mt-3"
              rows={4}
              maxLength={160}
              value={text}
              placeholder={phase === "skipped" ? "" : copy.s2.placeholder}
              readOnly={phase !== "writing"}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={onChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  seal(text);
                }
              }}
            />

            {phase === "sealed" && (
              <span
                ref={stamp}
                className="stamp absolute right-[5%] top-[44%] text-[clamp(1.4rem,4vw,3.4rem)] opacity-0 md:right-[11%]"
                style={{ transform: "rotate(-9deg)" }}
                aria-hidden="true"
              >
                {copy.s2.stamp}
              </span>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {phase === "writing" && (
                <>
                  <button type="button" className="plain-btn" disabled={!text.trim()} onClick={() => seal(text)}>
                    {copy.s2.sealNow}
                  </button>
                  <button type="button" className="link kicker py-2" onClick={skip}>
                    {copy.s2.skip}
                  </button>
                </>
              )}
              <p className="text-[12px] leading-relaxed">
                {phase === "sealed" && <strong className="font-medium text-file">{copy.s2.archived} </strong>}
                {phase === "skipped" && <strong className="font-medium text-file">{copy.s2.skipped} </strong>}
                {copy.s2.privacy}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {phase === "sealed" ? `${copy.s2.srSealed} ${copy.s2.archived}` : ""}
        {phase === "skipped" ? copy.s2.skipped : ""}
      </p>
    </section>
  );
}
