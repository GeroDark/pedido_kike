import { copy } from "@/content/copy.es";

/** El único teletipo de la pieza. Se pone rojo cuando el registro se corrige. */
export default function Ticker({ count }: { count: number }) {
  const text = count === 0 ? copy.s3.tickerIdle : `${copy.s3.ticker} · N.º ${String(count).padStart(4, "0")}`;
  const unit = `${text} · `;

  return (
    <div className={`ticker kicker ${count > 0 ? "is-hot" : ""}`} aria-hidden="true">
      <span className="ticker-track">{unit.repeat(24)}</span>
    </div>
  );
}
