"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { acts } from "@/content/acts";
import { copy } from "@/content/copy.es";
import { audio } from "@/lib/audio";
import { useNarrative, useSimple, type SceneId } from "@/lib/narrative";
import { initScroll, lockScroll, registerGsap } from "@/lib/scroll";
import { recordPointer } from "@/lib/session";

const IDLE_MS = 20000;

/**
 * El motor narrativo: detecta el entorno, sabe qué escena está activa y se
 * ocupa de los detalles de autor (título, inactividad, cambio de pestaña).
 * No pinta nada salvo el anuncio para lectores de pantalla.
 */
export default function SceneManager() {
  const powered = useNarrative((s) => s.powered);
  const scene = useNarrative((s) => s.scene);
  const reduced = useNarrative((s) => s.reduced);
  const simple = useSimple();
  const setEnv = useNarrative((s) => s.setEnv);

  // Entorno: movimiento reducido y WebGL. `?calma` y `?sin-webgl` fuerzan cada modo.
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setEnv({ reduced: query.matches || params.has("calma") });
    applyMotion();
    query.addEventListener("change", applyMotion);

    let webgl = false;
    if (!params.has("sin-webgl")) {
      try {
        const probe = document.createElement("canvas");
        const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
        webgl = !!gl;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        webgl = false;
      }
    }
    setEnv({ webgl });

    return () => query.removeEventListener("change", applyMotion);
  }, [setEnv]);

  // Scroll suave solo con puntero fino y sin movimiento reducido.
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    return initScroll(fine && !reduced);
  }, [reduced]);

  // El scroll está bloqueado hasta que se enciende el aparato.
  useEffect(() => {
    lockScroll(!powered);
    if (!powered) return;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [powered]);

  // Qué escena está en pantalla. Los disparadores nacen al encender: antes el
  // scroll está bloqueado y medir el documento solo costaría tiempo de carga.
  useEffect(() => {
    registerGsap();
    if (!powered) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          const state = useNarrative.getState();
          if (self.isActive && state.powered) state.setScene(Number(el.dataset.scene) as SceneId);
        },
      }),
    );

    // Las escenas cambian de altura (texto escrito, expediente): recalcular.
    let timer = 0;
    const main = document.getElementById("experiencia");
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    if (main) observer.observe(main);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [simple, powered]);

  // Título del documento y mezcla de sonido por escena.
  useEffect(() => {
    document.title = powered ? acts[scene].docTitle : copy.meta.title;
    audio.setScene(powered ? scene : 0);
  }, [scene, powered]);

  // Cambio de pestaña: el audio se detiene y la ausencia se anota.
  useEffect(() => {
    const onVisibility = () => {
      const state = useNarrative.getState();
      if (document.hidden) {
        audio.suspend();
        if (state.powered) {
          state.leftTab();
          document.title = copy.ui.hiddenTitle;
        }
        return;
      }
      audio.resume();
      if (state.powered) {
        document.title = acts[state.scene].docTitle;
        state.say(copy.ui.tabReturn);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Inactividad y rastro del puntero.
  useEffect(() => {
    if (!powered) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (document.hidden) return;
        const state = useNarrative.getState();
        state.wentIdle();
        state.say(copy.ui.idle);
      }, IDLE_MS);
    };
    const onPointer = (event: PointerEvent) => {
      recordPointer(event.clientX, event.clientY, event.timeStamp);
      arm();
    };
    arm();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("keydown", arm);
    window.addEventListener("scroll", arm, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", arm);
      window.removeEventListener("scroll", arm);
    };
  }, [powered]);

  return (
    <p className="sr-only" aria-live="polite">
      {powered ? `Escena ${acts[scene].index}. ${acts[scene].name}.` : ""}
    </p>
  );
}
