"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Un ojo que sigue al puntero y tarda en alcanzarlo. No sustituye al cursor
 * nativo: lo acompaña. Solo con puntero fino y sin movimiento reducido.
 */
export default function Cursor() {
  const eye = useRef<HTMLDivElement>(null);
  const pupil = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = eye.current;
    const dot = pupil.current;
    if (!el || !dot || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let running = false;
    let shown = false;

    const loop = () => {
      const dx = tx - x;
      const dy = ty - y;
      x += dx * 0.11;
      y += dy * 0.11;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const len = Math.hypot(dx, dy) || 1;
      const reach = Math.min(len / 14, 1);
      dot.style.transform = `translate(${((dx / len) * reach * 9).toFixed(1)}px, ${((dy / len) * reach * 4).toFixed(1)}px)`;
      if (Math.abs(dx) + Math.abs(dy) > 0.15) {
        raf = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) {
        shown = true;
        x = tx;
        y = ty;
        el.classList.add("is-on");
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    let blinkTimer = 0;
    const blink = () => {
      el.classList.add("is-blinking");
      window.setTimeout(() => el.classList.remove("is-blinking"), 130);
      blinkTimer = window.setTimeout(blink, 2800 + Math.random() * 4200);
    };
    blinkTimer = window.setTimeout(blink, 2400);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.clearTimeout(blinkTimer);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={eye} className="cursor-eye" aria-hidden="true">
      <i ref={pupil} />
    </div>
  );
}
