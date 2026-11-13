import type { Metadata } from "next";
import { copy } from "@/content/copy.es";

export const metadata: Metadata = {
  title: copy.reading.title,
  description: copy.reading.intro,
  alternates: { canonical: "/lectura/" },
};

/**
 * Modo lectura: la misma historia en sesenta segundos de texto. Sin WebGL,
 * sin audio, sin animación y sin JavaScript necesario.
 */
export default function ReadingMode() {
  const { reading } = copy;

  return (
    <main className="surface-paper on-paper min-h-svh px-5 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-[40rem]">
        <p className="kicker">{reading.kicker}</p>
        <h1 className="display mt-5 text-[clamp(3rem,11vw,6.5rem)]">TELESCREEN</h1>
        <p className="mt-6 font-serif text-xl italic leading-snug">{copy.meta.tagline}</p>
        <p className="mt-6 text-[14px] leading-relaxed">{reading.intro}</p>

        <div className="mt-12 flex flex-col gap-8 border-t border-ink pt-10">
          {reading.paragraphs.map((paragraph) => (
            <section key={paragraph.head}>
              <h2 className="kicker text-file">{paragraph.head}</h2>
              <p className="mt-3 font-serif text-[1.25rem] leading-[1.55]">{paragraph.body}</p>
            </section>
          ))}
        </div>

        <figure className="mt-14 border-t border-ink pt-10">
          <blockquote className="font-serif text-[clamp(1.6rem,4vw,2.4rem)] italic leading-tight">{reading.quote}</blockquote>
          <figcaption className="kicker mt-4">{reading.quoteSource}</figcaption>
        </figure>

        <p className="mt-14 text-[13px] leading-relaxed">{copy.s0.privacy}</p>
        <p className="kicker mt-6">
          <a href="/" className="link">
            {reading.back}
          </a>
        </p>
      </div>
    </main>
  );
}
