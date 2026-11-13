import Experience from "@/components/experience/Experience";
import { copy } from "@/content/copy.es";

export default function Page() {
  return (
    <>
      <Experience />
      <noscript>
        <p style={{ position: "fixed", inset: "auto 0 0 0", zIndex: 100, padding: "1rem", background: "#e7e1d3", color: "#111110" }}>
          Este telescreen necesita JavaScript. <a href="/lectura/">{copy.ui.readingMode}</a>
        </p>
      </noscript>
    </>
  );
}
