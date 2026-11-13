import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis: Lenis | null = null;
let locked = false;
let registered = false;

export function registerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Lenis solo suaviza la rueda en escritorio. En táctil y con movimiento
 * reducido el scroll es el nativo, sin intermediarios.
 */
export function initScroll(smooth: boolean): () => void {
  registerGsap();
  if (!smooth) return () => {};
  const instance = new Lenis({ lerp: 0.16, wheelMultiplier: 1, syncTouch: false });
  lenis = instance;
  instance.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  if (locked) instance.stop();
  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    if (lenis === instance) lenis = null;
  };
}

export function lockScroll(lock: boolean): void {
  locked = lock;
  document.documentElement.classList.toggle("is-locked", lock);
  if (lock) lenis?.stop();
  else lenis?.start();
}

export function scrollToTarget(target: string | HTMLElement, immediate = false): void {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { immediate, duration: 1.1 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: immediate || reduce ? "auto" : "smooth", block: "start" });
}
