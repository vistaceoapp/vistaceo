import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.vistaceo.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VistaCEO Blog | Inteligencia de Negocios para Latinoamérica",
    template: "%s | VistaCEO Blog",
  },
  description:
    "Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales de Latinoamérica.",
  keywords: [
    "inteligencia artificial",
    "negocios",
    "latinoamérica",
    "emprendimiento",
    "liderazgo",
    "productividad",
  ],
  authors: [{ name: "Equipo VistaCEO" }],
  creator: "VistaCEO",
  publisher: "VistaCEO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: SITE_URL,
    siteName: "VistaCEO Blog",
    title: "VistaCEO Blog | Inteligencia de Negocios para Latinoamérica",
    description:
      "Guías prácticas de IA, liderazgo, empleo y estrategia para emprendedores y profesionales de Latinoamérica.",
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "VistaCEO Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vistaceo",
    creator: "@vistaceo",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="alternate" type="application/rss+xml" title="VistaCEO Blog RSS" href="/rss.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebSiteSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
