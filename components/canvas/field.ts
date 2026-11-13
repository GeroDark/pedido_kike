/**
 * Geometría del campo de puntos. Cada punto tiene dos vidas: una posición en
 * la trama del cartel y otra como ventana de la ciudad. La propaganda no
 * desaparece; se convierte en el lugar donde vives.
 */

export interface FaceFrame {
  /** Centro del rostro en px. */
  cx: number;
  cy: number;
  /** Px por unidad de rostro (los ojos están en x = ±0,47). */
  s: number;
}

export interface FieldData {
  count: number;
  position: Float32Array;
  city: Float32Array;
  misc: Float32Array;
  pitch: number;
  face: FaceFrame;
  you: { x: number; y: number };
}

interface Slot {
  x: number;
  y: number;
  size: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const EYE_X = 0.47;

/** La ciudad: un horizonte de bloques y la pirámide escalonada del Ministerio. */
function buildCity(w: number, h: number, pitch: number, rand: () => number): { slots: Slot[]; you: number } {
  const g = pitch * 1.18;
  const portrait = h > w;
  const ground = h * (portrait ? 0.7 : 0.8);
  const slots: Slot[] = [];

  // Ministerio de la Verdad: terrazas de hormigón blanco, más alto que todo lo demás.
  const mx = w * (portrait ? 0.66 : 0.71);
  const mh = h * (portrait ? 0.46 : 0.58);
  const baseHalf = Math.min(w * (portrait ? 0.24 : 0.13), mh * 0.5);
  const mRows = Math.floor(mh / g);
  const terraces = 5;
  for (let r = 0; r < mRows; r++) {
    const t = r / mRows;
    const step = Math.floor(t * terraces) / terraces;
    const half = baseHalf * (1 - 0.82 * step) - (t - step) * baseHalf * 0.12;
    const n = Math.max(1, Math.floor(half / g));
    const terraceEdge = Math.floor(t * terraces) !== Math.floor(((r + 1) / mRows) * terraces);
    for (let k = -n; k <= n; k++) {
      if (!terraceEdge && rand() < 0.12) continue;
      slots.push({ x: mx + k * g, y: ground - r * g, size: terraceEdge ? 0.62 : 0.36 + rand() * 0.14 });
    }
  }

  // Bloques de viviendas: irregulares, bajos, con ventanas apagadas.
  const youTarget = { x: w * (portrait ? 0.24 : 0.3), y: ground - g * (portrait ? 9 : 8) };
  let you = -1;
  let youDist = Infinity;
  let x = g * 0.5;
  while (x < w) {
    const cols = 3 + Math.floor(rand() * 7);
    const tower = rand() < 0.2;
    const rows = tower ? 18 + Math.floor(rand() * 16) : 6 + Math.floor(rand() * 13);
    const center = x + (cols * g) / 2;
    const insideMinistry = Math.abs(center - mx) < baseHalf + g * 2;
    if (!insideMinistry) {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const roll = rand();
          if (roll < 0.14) continue;
          const lit = roll > 0.9;
          const slot = { x: x + c * g, y: ground - r * g, size: lit ? 0.6 : 0.27 + rand() * 0.12 };
          if (slot.x > w - g * 0.5) continue;
          const d = Math.hypot(slot.x - youTarget.x, slot.y - youTarget.y);
          if (d < youDist) {
            youDist = d;
            you = slots.length;
          }
          slots.push(slot);
        }
      }
    }
    x += (cols + 1 + Math.floor(rand() * 2)) * g;
  }

  return { slots, you };
}

export function buildField(width: number, height: number): FieldData {
  const w = Math.max(width, 320);
  const h = Math.max(height, 320);
  const rand = mulberry32(6079);

  const s = Math.max(w / 1.9, h / 3.4);
  const pitch = clamp(s / 84, 5, 12);
  const face: FaceFrame = { cx: w / 2, cy: h * (h > w ? 0.33 : 0.39), s };

  const rowH = pitch * 0.866;
  const cols = Math.ceil(w / pitch) + 2;
  const rows = Math.ceil(h / rowH) + 2;
  const count = cols * rows;

  const position = new Float32Array(count * 3);
  const city = new Float32Array(count * 3);
  const misc = new Float32Array(count * 3);

  const { slots, you: youSlot } = buildCity(w, h, pitch, rand);

  // Cubos por columna para que cada punto caiga más o menos en vertical.
  const bucketW = pitch * 1.18;
  const bucketCount = Math.ceil(w / bucketW) + 3;
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    const y = (r - 0.5) * rowH;
    const offset = r % 2 === 0 ? 0 : pitch / 2;
    for (let c = 0; c < cols; c++) {
      const x = (c - 0.5) * pitch + offset;
      position[i * 3] = x;
      position[i * 3 + 1] = y;
      position[i * 3 + 2] = 0;

      // Los ojos son lo último en deshacerse.
      const fx = Math.abs((x - face.cx) / s) - EYE_X;
      const fy = (face.cy - y) / s;
      const d = Math.hypot(fx, fy * 1.3);
      const near = 1 - clamp(d / 1.25, 0, 1);
      const seed = rand();
      misc[i * 3] = clamp(0.46 * Math.pow(near, 1.4) + rand() * 0.06, 0, 0.52);
      misc[i * 3 + 1] = seed;
      misc[i * 3 + 2] = 0;

      // Destino por defecto: ceniza que cae y se apaga.
      city[i * 3] = x + (rand() - 0.5) * pitch * 10;
      city[i * 3 + 1] = y + h * (0.12 + rand() * 0.3);
      city[i * 3 + 2] = 0;

      const b = clamp(Math.floor(x / bucketW) + 1, 0, bucketCount - 1);
      buckets[b].push(i);
      i++;
    }
  }

  // Emparejar ventanas con puntos de su misma columna.
  let you = { x: w * 0.3, y: h * 0.6 };
  const order = slots.map((_, k) => k);
  for (let k = order.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1));
    [order[k], order[j]] = [order[j], order[k]];
  }
  for (const k of order) {
    const slot = slots[k];
    const b0 = clamp(Math.floor(slot.x / bucketW) + 1, 0, bucketCount - 1);
    let picked = -1;
    for (let spread = 0; spread < bucketCount && picked < 0; spread++) {
      for (const b of spread === 0 ? [b0] : [b0 - spread, b0 + spread]) {
        if (b < 0 || b >= bucketCount) continue;
        const bucket = buckets[b];
        if (bucket.length === 0) continue;
        const at = Math.floor(rand() * bucket.length);
        picked = bucket[at];
        bucket[at] = bucket[bucket.length - 1];
        bucket.pop();
        break;
      }
    }
    if (picked < 0) break;
    city[picked * 3] = slot.x;
    city[picked * 3 + 1] = slot.y;
    city[picked * 3 + 2] = slot.size;
    if (k === youSlot) {
      misc[picked * 3 + 2] = 1;
      city[picked * 3 + 2] = 0.6;
      // Tu ventana se enciende al final, cuando ya no queda cartel.
      misc[picked * 3] = 0.52;
      you = { x: slot.x, y: slot.y };
    }
  }

  return { count, position, city, misc, pitch, face, you };
}
