import Link from "next/link";
import Image from "next/image";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
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
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground tracking-wide" style={{ fontFamily: "'Codec Pro', 'Inter', system-ui, sans-serif" }}>
                  VISTACEO
                </span>
                <span className="text-muted-foreground text-sm font-normal">Blog</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Inteligencia de negocios práctica para emprendedores y profesionales de Latinoamérica.
            </p>
          </div>

          {/* Clusters */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Categorías</h4>
            <ul className="space-y-2">
              {Object.values(CLUSTERS).map((cluster) => (
                <li key={cluster.slug}>
                  <Link
                    href={`/tema/${cluster.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {cluster.emoji} {cluster.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={MAIN_SITE}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Probar VISTACEO
                </Link>
              </li>
              <li>
                <Link
                  href={`${MAIN_SITE}/politicas`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href={`${MAIN_SITE}/condiciones`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/rss.xml"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VISTACEO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
