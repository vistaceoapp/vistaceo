import Link from "next/link";
import Image from "next/image";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: "hsl(240 3.7% 15.9% / 0.5)", backgroundColor: "hsl(240 3.7% 15.9% / 0.3)" }}>
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <Image
                src="/icon-vistaceo.webp"
                alt="VISTACEO"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <Image
                src="/logo-full-text.png"
                alt="VISTACEO"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(240 5% 64.9%)" }}>
              Inteligencia de negocios práctica para emprendedores y profesionales de Latinoamérica.
            </p>
          </div>

          {/* Clusters */}
          <div>
            <h4 className="font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              {Object.values(CLUSTERS).map((cluster) => (
                <li key={cluster.slug}>
                  <Link
                    href={`/tema/${cluster.slug}`}
                    className="text-sm transition-colors hover:text-[hsl(0,0%,98%)]"
                    style={{ color: "hsl(240 5% 64.9%)" }}
                  >
                    {cluster.emoji} {cluster.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={MAIN_SITE}
                  className="text-sm transition-colors hover:text-[hsl(0,0%,98%)]"
                  style={{ color: "hsl(240 5% 64.9%)" }}
                >
                  Probar VISTACEO
                </Link>
              </li>
              <li>
                <Link
                  href={`${MAIN_SITE}/politicas`}
                  className="text-sm transition-colors hover:text-[hsl(0,0%,98%)]"
                  style={{ color: "hsl(240 5% 64.9%)" }}
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href={`${MAIN_SITE}/condiciones`}
                  className="text-sm transition-colors hover:text-[hsl(0,0%,98%)]"
                  style={{ color: "hsl(240 5% 64.9%)" }}
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/rss.xml"
                  className="text-sm transition-colors hover:text-[hsl(0,0%,98%)]"
                  style={{ color: "hsl(240 5% 64.9%)" }}
                >
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: "hsl(240 3.7% 15.9% / 0.5)", color: "hsl(240 5% 64.9%)" }}>
          © {new Date().getFullYear()} VISTACEO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
