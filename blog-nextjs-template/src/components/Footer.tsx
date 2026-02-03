import Link from "next/link";
import { CLUSTERS } from "@/lib/types";

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.vistaceo.com";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/30 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-semibold">VistaCEO Blog</span>
            </div>
            <p className="text-sm text-muted-foreground">
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
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href={MAIN_SITE}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Probar VistaCEO
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
          © {new Date().getFullYear()} VistaCEO. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
