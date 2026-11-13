import { deviation, formatStay, type Deviation } from "@/lib/deviation";
import { useNarrative } from "@/lib/narrative";
import { snapshotTrail, type TrailSnapshot } from "@/lib/session";

export interface Report {
  id: number;
  entered: string;
  stay: string;
  scenes: number;
  diary: string | null;
  fear: string | null;
  corrections: number;
  leaves: number;
  trail: TrailSnapshot;
  deviation: Deviation;
  incomplete: boolean;
}

/**
 * El expediente se compila aquí, en el navegador, con lo que hay en memoria.
 * No hay ninguna llamada de red en toda la pieza.
 */
export function buildReport(): Report {
  const state = useNarrative.getState();
  const now = Date.now();
  const enteredAt = state.enteredAt ?? now;

  return {
    id: now,
    entered: new Date(enteredAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    stay: formatStay(now - enteredAt),
    scenes: state.completed.filter(Boolean).length,
    diary: state.diary,
    fear: state.fear,
    corrections: state.corrections,
    leaves: state.tabLeaves,
    trail: snapshotTrail(),
    deviation: deviation(state),
    incomplete: !state.diary || !state.fear,
  };
}
