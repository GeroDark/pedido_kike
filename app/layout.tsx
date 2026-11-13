import type { Metadata, Viewport } from "next";
import { Anton, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { copy } from "@/content/copy.es";

// Autoalojadas en build por next/font. Solo la display se precarga.
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
  preload: true,
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: copy.meta.title,
  description: copy.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: copy.meta.title,
    description: copy.meta.description,
    siteName: "TELESCREEN",
    images: [{ url: "/og/telescreen.png", width: 1200, height: 630, alt: copy.s1.posterAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: copy.meta.title,
    description: copy.meta.description,
    images: ["/og/telescreen.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#111110",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "TELESCREEN",
  headline: copy.meta.tagline,
  description: copy.meta.description,
  inLanguage: "es-ES",
  genre: "Narrativa interactiva",
  url: siteUrl,
  isBasedOn: {
    "@type": "Book",
    name: "1984",
    author: { "@type": "Person", name: "George Orwell" },
    datePublished: "1949",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
