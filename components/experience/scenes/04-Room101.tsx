"use client";

import { useRef, useState } from "react";
import { copy } from "@/content/copy.es";
import { useNarrative } from "@/lib/narrative";
import { scrollToTarget } from "@/lib/scroll";
import { useReveal } from "@/lib/useReveal";

type Status = "asking" | "noted" | "declined" | "erased";

/**
 * 04 · Habitación 101. Oscuridad, una luz y una pregunta. Sin sustos y sin
 * imágenes: contestar es opcional, borrar es posible y la salida está a la vista.
 */
export default function Room101() {
  const root = useRef<HTMLElement>(null);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("asking");
  const fear = useNarrative((s) => s.fear);
  const setFear = useNarrative((s) => s.setFear);
  const declineFear = useNarrative((s) => s.declineFear);
  const eraseFear = useNarrative((s) => s.eraseFear);

  useReveal(root);

  const note = (text: string) => {
    const clean = text.trim().slice(0, 80);
    if (!clean) return;
    setFear(clean);
    setValue("");
    setStatus("noted");
  };

  const asking = status === "asking" || status === "erased";

  return (
    <section
      ref={root}
      id="escena-4"
      data-scene="4"
      aria-labelledby="h-4"
      className="room surface-dark on-ink relative overflow-hidden px-5 py-[36svh] md:px-8"
    >
      <div className="room-light" aria-hidden="true" />

      <div className="relative mx-auto max-w-[35rem]">
        <div className="kicker flex items-baseline justify-between gap-6">
          <p className="text-fog">{copy.s4.kicker}</p>
          <a
            href="#escena-5"
            className="link py-1"
            onClick={(event) => {
              event.preventDefault();
              scrollToTarget("#escena-5");
              document.querySelector<HTMLElement>("#h-5")?.focus({ preventScroll: true });
            }}
          >
            {copy.s4.exit}
          </a>
        </div>

        <h2
          id="h-4"
          tabIndex={-1}
          className="mt-8 font-serif text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.1] tracking-[-0.01em] outline-none"
          data-reveal
        >
          {copy.s4.prompt}
        </h2>
        <p className="mt-4 text-[13px] leading-relaxed text-fog" data-reveal>
          {copy.s4.sub}
        </p>

        {asking && (
          <div data-reveal>
            <form
              className="mt-10 flex items-end gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                note(value);
              }}
            >
              <label htmlFor="fear" className="sr-only">
                {copy.s4.inputLabel}
              </label>
              <input
                id="fear"
                type="text"
                className="room-input"
                maxLength={80}
                autoComplete="off"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <button type="submit" className="plain-btn shrink-0" disabled={!value.trim()}>
                {copy.s4.note}
              </button>
            </form>

            <p className="kicker mt-10 text-fog">{copy.s4.or}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {copy.s4.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className="plain-btn font-serif !text-[1.05rem] !normal-case italic !tracking-normal"
                  onClick={() => note(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="link mt-10 py-1 text-[13px]"
              onClick={() => {
                declineFear();
                setStatus("declined");
              }}
            >
              {copy.s4.decline}
            </button>
            {status === "erased" && <p className="mt-6 text-[13px] text-fog">{copy.s4.erased}</p>}
          </div>
        )}

        {status === "noted" && (
          <div className="mt-10">
            <p className="font-serif text-[clamp(1.4rem,2.6vw,2rem)] italic leading-snug">«{fear}»</p>
            <p className="mt-6 text-[13px] leading-relaxed">{copy.s4.noted}</p>
            <button
              type="button"
              className="link mt-8 py-1 text-[13px]"
              onClick={() => {
                eraseFear();
                setStatus("erased");
              }}
            >
              {copy.s4.erase}
            </button>
          </div>
        )}

        {status === "declined" && <p className="mt-10 text-[13px] leading-relaxed">{copy.s4.declined}</p>}
      </div>

      <p className="sr-only" aria-live="polite">
        {status === "noted" ? copy.s4.noted : ""}
        {status === "declined" ? copy.s4.declined : ""}
        {status === "erased" ? copy.s4.erased : ""}
      </p>
    </section>
  );
}
