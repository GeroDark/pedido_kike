import Heatmap from "@/components/ui/Heatmap";
import { copy } from "@/content/copy.es";
import type { Report } from "@/lib/report";

/** Tacha dos de cada tres palabras: el Ministerio también corrige al sujeto. */
function Censored({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 ? " " : ""}
          {i % 3 === 0 ? word : <span className="censor">{word}</span>}
        </span>
      ))}
    </>
  );
}

/**
 * El expediente en papel. Solo existe en la hoja de impresión: lo que el
 * visitante escribió sale censurado.
 */
export default function PrintFile({ report }: { report: Report }) {
  const rows = copy.s5.rows;

  return (
    <article className="print-file" aria-hidden="true">
      <p style={{ fontSize: "8pt", letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {copy.s5.ministry} · Copia para el sujeto
      </p>
      <h1>{copy.s5.title}</h1>
      <p style={{ textAlign: "right", margin: "-16mm 6mm 8mm 0" }}>
        <span className="stamp">{copy.print.classification}</span>
      </p>

      <dl>
        <div className="print-row">
          <dt>{rows.entered}</dt>
          <dd>{report.entered}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.stay}</dt>
          <dd>{report.stay}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.scenes}</dt>
          <dd>{report.scenes} de 6</dd>
        </div>
        <div className="print-row">
          <dt>{rows.diary}</dt>
          <dd>{report.diary ? <Censored text={report.diary} /> : copy.s5.diaryNone}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.fear}</dt>
          <dd>{report.fear ? <span className="censor">{report.fear}</span> : copy.s5.fearNone}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.corrections}</dt>
          <dd>{report.corrections}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.leaves}</dt>
          <dd>{report.leaves}</dd>
        </div>
        <div className="print-row">
          <dt>{rows.map}</dt>
          <dd>
            <Heatmap trail={report.trail} label="" className="" />
          </dd>
        </div>
        <div className="print-row">
          <dt>{rows.deviation}</dt>
          <dd>
            {report.deviation.score} % · {report.deviation.label}
          </dd>
        </div>
        <div className="print-row">
          <dt>{rows.bytes}</dt>
          <dd>{copy.s5.bytesValue}</dd>
        </div>
      </dl>

      <p style={{ marginTop: "8mm", fontSize: "8.5pt" }}>{copy.print.redactedNote}</p>
      <p style={{ fontSize: "8.5pt" }}>{copy.print.footer}</p>
    </article>
  );
}
