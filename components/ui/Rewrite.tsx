"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface RewriteProps {
  value: string;
  /** Para frases largas que ocupan varias líneas. */
  wrap?: boolean;
}

/**
 * Texto que se corrige a sí mismo: la versión anterior se tacha en rojo y la
 * nueva se teclea encima. Los lectores de pantalla solo oyen la versión vigente.
 */
export default function Rewrite({ value, wrap = false }: RewriteProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const [struck, setStruck] = useState(false);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    if (reduced) {
      setShown(value);
      setStruck(false);
      return;
    }
    setStruck(true);
    let typer = 0;
    let i = 0;
    const start = window.setTimeout(() => {
      setStruck(false);
      setShown("");
      typer = window.setInterval(
        () => {
          i += 1;
          setShown(value.slice(0, i));
          if (i >= value.length) window.clearInterval(typer);
        },
        wrap ? 20 : 46,
      );
    }, 430);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(typer);
      setShown(value);
      setStruck(false);
    };
  }, [value, reduced, wrap]);

  const className = wrap
    ? struck
      ? "line-through decoration-file decoration-2"
      : ""
    : `rewrite ${struck ? "is-struck" : ""}`;

  return (
    <span className={className}>
      <span aria-hidden="true">{shown || " "}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
