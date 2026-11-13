export interface DeviationInput {
  diary: string | null;
  diarySkipped: boolean;
  fear: string | null;
  fearDeclined: boolean;
  flips: number;
  erased: number;
  tabLeaves: number;
  idles: number;
}

export interface Deviation {
  score: number;
  label: string;
}

/**
 * El «nivel de desviación» del expediente. Es deliberadamente arbitrario:
 * todo lo que el visitante hace —y lo que no hace— cuenta en su contra.
 */
export function deviation(input: DeviationInput): Deviation {
  let score = 9;
  if (input.diary) score += 28 + Math.min(12, Math.floor(input.diary.length / 10));
  if (input.diarySkipped) score += 6;
  if (input.fear) score += 18;
  else if (input.fearDeclined) score += 8;
  score += Math.min(input.flips, 3) * 4;
  score += Math.min(input.erased, 3) * 5;
  score += Math.min(input.tabLeaves, 3) * 6;
  score += Math.min(input.idles, 2) * 2;
  score = Math.max(3, Math.min(99, score));

  let label = "Crimen de pensamiento";
  if (score < 20) label = "Ortodoxia aparente";
  else if (score < 45) label = "Bajo observación";
  else if (score < 70) label = "Desviación notable";

  return { score, label };
}

export function formatStay(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`;
}
