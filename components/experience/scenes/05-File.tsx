"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import Heatmap from "@/components/ui/Heatmap";
import PrintFile from "@/components/ui/PrintFile";
import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative, useSimple } from "@/lib/narrative";
import { buildReport, type Report } from "@/lib/report";
import { registerGsap } from "@/lib/scroll";
import { stage } from "@/lib/session";
import { useReducedMotion } from "@/lib/useReducedMotion";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="report-row">
      <dt>{label}</dt>
      <dd className="min-w-0 text-[15px] leading-relaxed">{children}</dd>
    </div>
  );
}

function Twist() {
  const { a, b, c } = copy.s5.twist;
  return (
    <>
      <p className="tw-a max-w-[22ch] font-serif text-[clamp(1.6rem,3.4vw,3.4rem)] leading-[1.2] text-paper">
        <span className="box-decoration-clone bg-ink px-[0.14em] py-[0.02em]">{a}</span>
      </p>
      <p className="tw-b mt-3 max-w-[22ch] font-serif text-[clamp(1.6rem,3.4vw,3.4rem)] leading-[1.2] text-paper">
        <span className="box-decoration-clone bg-ink px-[0.14em] py-[0.02em]">{b}</span>
      </p>
      <p className="tw-c display bb-headline mt-6 text-paper">
        <span className="bb-band">{c}</span>
      </p>
    </>
  );
}

/**
 * 05 · El archivo. El Ministerio del Amor entrega el expediente y, justo
 * debajo, la pieza se quita la máscara: no había servidor, no había ojos.
 */
export default function FileScene() {
  const root = useRef<HTMLElement>(null);
  const twist = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDListElement>(null);
  const scene = useNarrative((s) => s.scene);
  const powered = useNarrative((s) => s.powered);
  const complete = useNarrative((s) => s.complete);
  const setZone = useNarrative((s) => s.setZone);
  const simple = useSimple();
  const reduced = useReducedMotion();
  const [report, setReport] = useState<Report | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // El expediente se compila cada vez que el sujeto llega al archivo.
  useEffect(() => {
    if (scene !== 5) return;
    complete(5);
    setReport(buildReport());
  }, [scene, complete]);

  // Las líneas del informe se imprimen una a una.
  useEffect(() => {
    if (!report || !list.current) return;
    const rows = list.current.querySelectorAll(".report-row");
    if (reduced) {
      gsap.fromTo(rows, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      return;
    }
    const tween = gsap.fromTo(
      rows,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: { each: 0.11, onStart: () => audio.tick() } },
    );
    return () => {
      tween.kill();
    };
  }, [report, reduced]);

  // El giro: el cartel vuelve con los ojos cerrados y después no queda nada.
  useEffect(() => {
    registerGsap();
    if (simple || !powered) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: twist.current,
            start: "top 70%",
            end: "bottom bottom",
            scrub: 0.5,
            onToggle: (self) => {
              stage.finale = self.isActive;
              setZone("finale", self.isActive);
              if (!self.isActive) audio.setSilence(false);
            },
            onUpdate: (self) => audio.setSilence(self.progress > 0.74),
          },
        })
        .fromTo(stage, { finaleAlpha: 0 }, { finaleAlpha: 0.85, duration: 0.24 }, 0.1)
        .fromTo(".tw-a", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.08 }, 0.4)
        .fromTo(".tw-b", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.08 }, 0.54)
        .fromTo(".tw-c", { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.74)
        .to(stage, { finaleAlpha: 0, duration: 0.12 }, 0.78)
        .to({}, { duration: 0.08 }, 0.92);
    }, root);
    return () => {
      ctx.revert();
      stage.finale = false;
    };
  }, [simple, powered, setZone]);

  const restart = () => {
    audio.collapse();
    audio.mute();
    window.scrollTo(0, 0);
    window.setTimeout(() => window.location.reload(), 180);
  };

  const rows = copy.s5.rows;
  const filled = report ? Math.round(report.deviation.score / 5) : 0;

  return (
    <section ref={root} id="escena-5" data-scene="5" aria-labelledby="h-5" className="relative">
      <div className="surface-screen bg-ink px-5 pb-[18svh] pt-[20svh] text-phosphor md:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <header className="md:col-span-4">
            <p className="kicker text-fog">{copy.s5.kicker}</p>
            <p className="kicker mt-10">{copy.s5.ministry}</p>
            <h2 id="h-5" tabIndex={-1} className="display mt-3 text-[clamp(2.4rem,5vw,5rem)] outline-none">
              {copy.s5.title}
            </h2>
            {report?.incomplete && <p className="mt-6 max-w-[32ch] text-[13px] leading-relaxed">{copy.s5.incomplete}</p>}
          </header>

          <div className="md:col-span-8 md:pr-16">
            {!report && <p className="kicker">{copy.s5.compiling}</p>}
            {report && (
              <dl ref={list} key={report.id} className="border-b border-phosphor/30">
                <Row label={rows.entered}>{report.entered}</Row>
                <Row label={rows.stay}>{report.stay}</Row>
                <Row label={rows.scenes}>{report.scenes} de 6</Row>
                <Row label={rows.diary}>
                  {report.diary ? (
                    <>
                      <span className="break-words">«{report.diary}»</span>
                      <span className="kicker mt-2 block w-fit bg-file px-2 py-1 text-paper">{copy.s2.stamp}</span>
                    </>
                  ) : (
                    copy.s5.diaryNone
                  )}
                </Row>
                <Row label={rows.fear}>{report.fear ? <span className="break-words">«{report.fear}»</span> : copy.s5.fearNone}</Row>
                <Row label={rows.corrections}>{report.corrections}</Row>
                <Row label={rows.leaves}>{report.leaves}</Row>
                <Row label={rows.map}>
                  <Heatmap
                    trail={report.trail}
                    label={`${rows.map}. ${report.trail.samples} muestras del puntero.`}
                    className="w-full max-w-[26rem]"
                  />
                  <span className="mt-2 block text-[12px] text-fog">
                    {report.trail.samples > 0 ? copy.s5.mapCaption : copy.s5.mapEmpty}
                  </span>
                </Row>
                <Row label={rows.deviation}>
                  <span className="deviation-bar" aria-hidden="true">
                    {Array.from({ length: 20 }, (_, i) => (
                      <i key={i} className={i < filled ? "on" : ""} />
                    ))}
                  </span>
                  <span className="mt-2 block">
                    {report.deviation.score} % · {report.deviation.label}
                  </span>
                </Row>
                <Row label={rows.recipient}>{copy.s5.recipientValue}</Row>
                <Row label={rows.bytes}>{copy.s5.bytesValue}</Row>
              </dl>
            )}
          </div>
        </div>
      </div>

      {simple ? (
        <div className="flex min-h-svh flex-col justify-end bg-ink px-5 py-10 md:px-8">
          <Twist />
        </div>
      ) : (
        <div ref={twist} className="relative h-[230svh]">
          <div className="sticky top-0 h-svh overflow-hidden">
            <div className="absolute inset-x-5 bottom-6 md:inset-x-8 md:bottom-8">
              <Twist />
            </div>
          </div>
        </div>
      )}

      <div className="surface-dark relative bg-ink px-5 pb-10 pt-[12svh] text-paper md:px-8">
        <p className="max-w-[36ch] font-serif text-[clamp(1.2rem,2.1vw,1.9rem)] leading-snug">{copy.s5.after}</p>

        <figure className="mt-[16svh] max-w-[26ch]">
          <blockquote className="font-serif text-[clamp(1.7rem,3.6vw,3.2rem)] italic leading-[1.12]">{copy.s5.quote}</blockquote>
          <figcaption className="kicker mt-5 text-fog">{copy.s5.quoteSource}</figcaption>
        </figure>

        <nav aria-label="Cierre" className="kicker mt-[16svh] flex flex-wrap gap-x-10 gap-y-3 border-t border-paper/30 pt-6">
          <a className="link py-1" href={copy.s5.cta.bookHref} target="_blank" rel="noopener noreferrer">
            {copy.s5.cta.book}
          </a>
          <button type="button" className="link kicker py-1" onClick={() => window.print()}>
            {copy.s5.cta.print}
          </button>
          <button type="button" className="link kicker py-1" onClick={restart}>
            {copy.s5.cta.restart}
          </button>
        </nav>

        <details className="mt-6">
          <summary className="kicker link w-fit cursor-pointer py-1">{copy.s5.cta.credits}</summary>
          <div className="mt-5 flex max-w-[62ch] flex-col gap-3 text-[13px] leading-relaxed text-paper">
            {copy.s5.credits.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </details>

        <p className="mt-12 text-[12px] leading-relaxed text-fog">{copy.s0.privacy}</p>
      </div>

      {mounted && report && createPortal(<PrintFile report={report} />, document.body)}
    </section>
  );
}
