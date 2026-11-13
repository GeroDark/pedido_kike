/**
 * Estado mutable de alta frecuencia. No pasa por React: lo leen el shader y el
 * expediente final. Igual que el resto de la sesión, vive solo en memoria.
 */

/** Lo que el canvas necesita saber en cada fotograma. */
export const stage = {
  /** 0 = cartel, 1 = ciudad. Lo escribe el scroll de la escena 01. */
  morph: 0,
  /** Opacidad del campo de puntos. */
  alpha: 0,
  /** En el final el cartel vuelve con los ojos cerrados. */
  finale: false,
  /** Opacidad del cartel durante el cierre. La escribe el scroll de la escena 05. */
  finaleAlpha: 0,
  /** Puntero en px de viewport. */
  px: 0,
  py: 0,
  hasPointer: false,
};

/** Rejilla donde se acumula el recorrido del puntero: el «mapa de atención». */
export const TRAIL_COLS = 28;
export const TRAIL_ROWS = 16;

export const trail = {
  cells: new Uint16Array(TRAIL_COLS * TRAIL_ROWS),
  samples: 0,
};

let lastSample = 0;

export function recordPointer(x: number, y: number, now: number): void {
  stage.px = x;
  stage.py = y;
  stage.hasPointer = true;
  if (now - lastSample < 60) return;
  lastSample = now;
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  const cx = Math.min(TRAIL_COLS - 1, Math.max(0, Math.floor((x / w) * TRAIL_COLS)));
  const cy = Math.min(TRAIL_ROWS - 1, Math.max(0, Math.floor((y / h) * TRAIL_ROWS)));
  const i = cy * TRAIL_COLS + cx;
  if (trail.cells[i] < 65535) trail.cells[i] += 1;
  trail.samples += 1;
}

export interface TrailSnapshot {
  cols: number;
  rows: number;
  values: number[];
  max: number;
  samples: number;
}

export function snapshotTrail(): TrailSnapshot {
  const values = Array.from(trail.cells);
  return {
    cols: TRAIL_COLS,
    rows: TRAIL_ROWS,
    values,
    max: values.reduce((m, v) => (v > m ? v : m), 0),
    samples: trail.samples,
  };
}
