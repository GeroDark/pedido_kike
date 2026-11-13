"use client";

import { acts } from "@/content/acts";
import { copy } from "@/content/copy.es";
import { useNarrative } from "@/lib/narrative";
import { scrollToTarget } from "@/lib/scroll";

/** Índice lateral: orientación y navegación por teclado. Oculto en móvil. */
export default function SceneIndex() {
  const scene = useNarrative((s) => s.scene);

  return (
    <nav className="hud right-3 top-1/2 hidden -translate-y-1/2 md:right-6 md:block" aria-label={copy.ui.indexLabel}>
      <ol className="kicker flex flex-col items-end gap-1">
        {acts.slice(1).map((act) => {
          const current = act.id === scene;
          return (
            <li key={act.id}>
              <a
                href={`#escena-${act.id}`}
                aria-current={current ? "step" : undefined}
                aria-label={`${act.index} · ${act.name}`}
                className="flex items-center gap-2 px-2 py-1"
                style={{ opacity: current ? 1 : 0.5 }}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToTarget(`#escena-${act.id}`);
                  document.querySelector<HTMLElement>(`#h-${act.id}`)?.focus({ preventScroll: true });
                }}
              >
                <span
                  aria-hidden="true"
                  className="block h-px bg-current transition-[width] duration-[400ms] ease-expo"
                  style={{ width: current ? "1.75rem" : "0.5rem" }}
                />
                <span aria-hidden="true">{act.index}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
