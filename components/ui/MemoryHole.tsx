"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { copy, holeSentences, type HoleId } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative } from "@/lib/narrative";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface Drag {
  id: HoleId;
  el: HTMLElement;
  startX: number;
  startY: number;
  moved: boolean;
}

/**
 * El agujero de la memoria. Se arrastra una palabra subrayada al cuadrado
 * negro; arde y la frase se reescribe como si nunca hubiera estado. Con
 * teclado o con un toque, la palabra va sola.
 */
export default function MemoryHole() {
  const [removed, setRemoved] = useState<HoleId[]>([]);
  const [armed, setArmed] = useState(false);
  const hole = useRef<HTMLDivElement>(null);
  const flame = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const burning = useRef(false);
  const erase = useNarrative((s) => s.erase);
  const reduced = useReducedMotion();

  const key = [...removed].sort().join("");
  const tokens = holeSentences[key] ?? holeSentences[""];
  const plain = tokens.map((token) => token.t).join(" ").replace(/ \./g, ".");

  const isOverHole = (x: number, y: number) => {
    const box = hole.current?.getBoundingClientRect();
    if (!box) return false;
    const pad = 28;
    return x > box.left - pad && x < box.right + pad && y > box.top - pad && y < box.bottom + pad;
  };

  const burn = (id: HoleId, el: HTMLElement) => {
    if (burning.current) return;
    burning.current = true;
    audio.burn();

    const finish = () => {
      burning.current = false;
      setArmed(false);
      setRemoved((list) => (list.includes(id) ? list : [...list, id]));
      erase();
    };

    const target = hole.current?.getBoundingClientRect();
    if (reduced || !target || !flame.current) {
      finish();
      return;
    }

    const box = el.getBoundingClientRect();
    const x = Number(gsap.getProperty(el, "x")) + target.left + target.width / 2 - (box.left + box.width / 2);
    const y = Number(gsap.getProperty(el, "y")) + target.top + target.height / 2 - (box.top + box.height / 2);

    gsap
      .timeline({ onComplete: finish })
      .set(el, { position: "relative", zIndex: 30 })
      .to(el, { x, y, scale: 0.4, color: "#b31217", duration: 0.42, ease: "power3.in" })
      .set(flame.current, { transformOrigin: "50% 100%" })
      .to(flame.current, { scaleY: 1, duration: 0.16, ease: "power2.out" })
      .to(el, { opacity: 0, duration: 0.12 }, "<")
      .set(flame.current, { transformOrigin: "50% 0%" })
      .to(flame.current, { scaleY: 0, duration: 0.42, ease: "power2.in" });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>, id: HoleId) => {
    if (burning.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id, el: event.currentTarget, startX: event.clientX, startY: event.clientY, moved: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || burning.current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < 6) return;
    current.moved = true;
    gsap.set(current.el, { x: dx, y: dy, position: "relative", zIndex: 30 });
    setArmed(isOverHole(event.clientX, event.clientY));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (!current.moved || isOverHole(event.clientX, event.clientY)) {
      burn(current.id, current.el);
      return;
    }
    setArmed(false);
    gsap.to(current.el, { x: 0, y: 0, duration: 0.5, ease: "expo.out", clearProps: "zIndex" });
  };

  const onPointerCancel = () => {
    const current = drag.current;
    drag.current = null;
    setArmed(false);
    if (current) gsap.to(current.el, { x: 0, y: 0, duration: 0.4, ease: "expo.out" });
  };

  return (
    <div className="mt-[16svh] grid items-end gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-8">
        <h3 className="kicker">{copy.s3.holeTitle}</h3>
        <p key={key} className="sentence-in mt-6 font-serif text-[clamp(1.6rem,3.6vw,3.4rem)] leading-[1.3]">
          {tokens.map((token, i) => {
            const space = i > 0 && !/^[.,;]/.test(token.t) ? " " : "";
            if (!token.id) return <span key={`${key}-${i}`}>{space + token.t}</span>;
            const id = token.id;
            return (
              <span key={`${key}-${i}`}>
                {space}
                <button
                  type="button"
                  className="hole-word"
                  aria-label={`${copy.s3.holeAria} «${token.t}»`}
                  onPointerDown={(event) => onPointerDown(event, id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerCancel}
                  onClick={(event) => {
                    // Teclado y tecnologías de apoyo: clic sin puntero.
                    if (event.detail === 0) burn(id, event.currentTarget);
                  }}
                >
                  {token.t}
                </button>
              </span>
            );
          })}
        </p>
        <p className="mt-6 max-w-[44ch] text-[13px] leading-relaxed">{copy.s3.holeHint}</p>
      </div>

      <div className="flex md:col-span-4 md:justify-end">
        <div
          ref={hole}
          className={`memory-hole aspect-square w-[clamp(7rem,17vw,12.5rem)] ${armed ? "is-armed" : ""}`}
          aria-hidden="true"
        >
          <div ref={flame} className="flame" />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {removed.length > 0 ? `${copy.s3.srCorrected} ${plain}` : ""}
      </p>
    </div>
  );
}
