import type { SceneId } from "@/lib/narrative";

export interface Act {
  id: SceneId;
  index: string;
  /** Nombre corto para el índice y los anuncios a lectores de pantalla. */
  name: string;
  /** Título del documento mientras la escena está activa. */
  docTitle: string;
  /** Material dominante: columna vertebral del recorrido pantalla → papel → pantalla. */
  material: "screen" | "paper" | "dark";
}

export const acts: Act[] = [
  { id: 0, index: "00", name: "Calibración", docTitle: "TELESCREEN — Calibrando", material: "screen" },
  { id: 1, index: "01", name: "El Hermano Mayor", docTitle: "El Hermano Mayor te vigila — TELESCREEN", material: "screen" },
  { id: 2, index: "02", name: "El diario", docTitle: "Escriba. — TELESCREEN", material: "paper" },
  { id: 3, index: "03", name: "Doblepiensa", docTitle: "2 + 2 = 5 — TELESCREEN", material: "paper" },
  { id: 4, index: "04", name: "Habitación 101", docTitle: "Habitación 101 — TELESCREEN", material: "dark" },
  { id: 5, index: "05", name: "El archivo", docTitle: "Informe del sujeto 6079 — TELESCREEN", material: "screen" },
];
