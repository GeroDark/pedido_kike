"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PosterFallback from "@/components/ui/PosterFallback";
import { copy } from "@/content/copy.es";
import { useNarrative, useSimple } from "@/lib/narrative";
import { registerGsap } from "@/lib/scroll";
import { stage } from "@/lib/session";

function Letters({ text }: { text: string }) {
  return (
    <span className="bb-mask" aria-hidden="true">
      {Array.from(text).map((char, i) => (
        <span key={i} className="bb-letter">
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

function Headline() {
  const { a, b, c } = copy.s1.headline;
  return (
    <h1 id="h-1" tabIndex={-1} aria-label={copy.s1.headlineLabel} className="display bb-headline text-paper outline-none">
      <span className="bb-line block">
        <Letters text={a} /> <span className="block md:inline"><Letters text={b} /></span>
      </span>
      <span className="bb-line block">
        <span className="bb-band">
          <Letters text={c} />
        </span>
      </span>
    </h1>
  );
}

function Counter() {
  return (
    <>
      <p className="display text-[clamp(1.5rem,4vw,3.4rem)] text-paper">
        {copy.s1.counterLabel} <span className="text-phosphor">{copy.s1.counterValue}</span>
      </p>
      <p className="kicker max-w-[32ch] text-fog">{copy.s1.caption}</p>
    </>
  );
}

/**
 * 01 · El Hermano Mayor. El cartel mira, y al avanzar se deshace: cada punto
 * de la trama cae hasta convertirse en una ventana de la ciudad.
 */
export default function BigBrother() {
  const root = useRef<HTMLElement>(null);
  const powered = useNarrative((s) => s.powered);
  const scene = useNarrative((s) => s.scene);
  const webgl = useNarrative((s) => s.webgl);
  const you = useNarrative((s) => s.you);
  const complete = useNarrative((s) => s.complete);
  const setZone = useNarrative((s) => s.setZone);
  const simple = useSimple();

  // Encendido: el titular se compone letra a letra.
  useEffect(() => {
    if (!powered) return;
    const heading = root.current?.querySelector<HTMLElement>("#h-1");
    heading?.focus({ preventScroll: true });
    const ctx = gsap.context(() => {
      if (simple) {
        gsap.from("[data-intro], .bb-line", { opacity: 0, duration: 0.6, stagger: 0.08 });
        return;
      }
      gsap.from(".bb-letter", { yPercent: 118, duration: 0.9, ease: "expo.out", stagger: 0.026, delay: 0.3 });
      gsap.from("[data-intro]", { opacity: 0, duration: 0.8, ease: "power2.out", stagger: 0.18, delay: 1.3 });
      gsap.fromTo(stage, { alpha: 0 }, { alpha: 1, duration: 1.1, ease: "power2.out" });
    }, root);
    return () => ctx.revert();
  }, [powered, simple]);

  // El scroll es la línea de tiempo: cartel → partículas → ciudad.
  useEffect(() => {
    registerGsap();
    if (simple || !powered) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setZone("intro", self.isActive),
      });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.5 },
        })
        .to(".bb-fade", { opacity: 0, duration: 0.07 }, 0.01)
        .to(".bb-line", { opacity: 0, xPercent: -3, duration: 0.12, stagger: 0.05 }, 0.05)
        .to(stage, { morph: 1, duration: 0.8 }, 0.08)
        .fromTo(".bb-mid", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.1 }, 0.3)
        .to(".bb-mid", { opacity: 0, y: -30, duration: 0.1 }, 0.58)
        .fromTo(".bb-late", { opacity: 0 }, { opacity: 1, duration: 0.09, stagger: 0.03 }, 0.86)
        .to({}, { duration: 0.02 }, 0.98);
    }, root);
    return () => {
      ctx.revert();
      stage.morph = 0;
    };
  }, [simple, powered, setZone]);

  useEffect(() => {
    if (scene >= 2) complete(1);
  }, [scene, complete]);

  if (simple) {
    return (
      <section ref={root} id="escena-1" data-scene="1" aria-labelledby="h-1" className="relative">
        <div className="surface-screen relative flex min-h-svh flex-col justify-between overflow-hidden px-5 py-6 md:px-8 md:py-8">
          {webgl !== null && <PosterFallback />}
          <p className="kicker text-fog" data-intro>
            {copy.s1.kicker}
          </p>
          <div>
            <Headline />
            <p className="mt-5 max-w-[36ch] text-[13px] leading-relaxed text-paper" data-intro>
              {copy.s1.welcome}
            </p>
          </div>
        </div>
        <div className="surface-screen flex flex-col gap-[12svh] px-5 py-[20svh] md:px-8">
          <p className="max-w-[18ch] font-serif text-[clamp(1.75rem,4.2vw,4rem)] leading-[1.08] text-paper">{copy.s1.mid}</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <Counter />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={root} id="escena-1" data-scene="1" aria-labelledby="h-1" className="relative h-[250svh]">
      <div className="surface-screen sticky top-0 h-svh overflow-hidden">
        <p className="kicker absolute left-5 top-5 pr-28 text-fog md:left-8 md:top-7">
          <span data-intro>{copy.s1.kicker}</span>
        </p>

        <div className="absolute inset-x-5 bottom-6 md:inset-x-8 md:bottom-8">
          <Headline />
          <div className="bb-fade mt-4 flex flex-col gap-2 md:mt-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[38ch] text-[13px] leading-relaxed text-paper" data-intro>
              {copy.s1.welcome}
            </p>
            <p className="kicker text-fog" data-intro>
              {copy.s1.hint}
            </p>
          </div>
        </div>

        <p className="bb-mid absolute bottom-[9%] left-5 right-5 max-w-[17ch] font-serif text-[clamp(1.75rem,4.2vw,4rem)] leading-[1.14] text-paper opacity-0 md:left-8">
          <span className="box-decoration-clone bg-ink px-[0.14em] py-[0.02em]">{copy.s1.mid}</span>
        </p>

        <div className="bb-late absolute inset-x-5 bottom-6 flex flex-col gap-2 opacity-0 md:inset-x-8 md:bottom-8 md:flex-row md:items-end md:justify-between">
          <Counter />
        </div>

        <span
          className="bb-late you-mark kicker text-phosphor opacity-0"
          style={you ? { left: you.x, top: you.y } : { display: "none" }}
          aria-hidden="true"
        >
          {copy.s1.you}
        </span>
      </div>
    </section>
  );
}
