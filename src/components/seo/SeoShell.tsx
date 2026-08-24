import { Link } from "react-router-dom";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { landingLabel } from "@/data/seo-landings";
import { ChevronRight } from "lucide-react";

const GRADIENT = "linear-gradient(135deg, #2692DC 0%, #746CE6 100%)";

interface SeoShellProps {
  breadcrumb: string;
  related?: string[];
  children: React.ReactNode;
}

/**
 * Marco compartido de las páginas de captación orgánica: cabecera con marca,
 * migas de pan, enlazado interno hacia páginas hermanas y pie con acceso al
 * blog y a las páginas legales.
 */
export function SeoShell({ breadcrumb, related = [], children }: SeoShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2" aria-label="Ir al inicio de VISTACEO">
            <VistaceoLogo size={34} variant="compact" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://blog.vistaceo.com"
              className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Notas
            </a>
            <Link
              to="/auth?mode=signup"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ background: GRADIENT }}
            >
              Crear cuenta gratis
            </Link>
          </nav>
        </div>
      </header>

      <nav aria-label="Ruta de navegación" className="mx-auto max-w-5xl px-5 pt-6">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3 w-3" />
          </li>
          <li className="text-foreground">{breadcrumb}</li>
        </ol>
      </nav>

      <main className="mx-auto max-w-3xl px-5 pb-16 pt-6">{children}</main>

      {related.length > 0 && (
        <section className="border-t border-border/60 bg-muted/30">
          <div className="mx-auto max-w-3xl px-5 py-10">
            <h2 className="mb-4 text-base font-semibold">Seguir explorando</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {related.map((path) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="block rounded-xl border border-border/60 bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40"
                  >
                    {landingLabel(path)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground">
          <span>VISTACEO — inteligencia de negocio con IA.</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="https://blog.vistaceo.com" className="hover:text-foreground">
              Notas
            </a>
            <Link to="/politicas" className="hover:text-foreground">
              Privacidad
            </Link>
            <Link to="/condiciones" className="hover:text-foreground">
              Condiciones
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const SEO_GRADIENT = GRADIENT;
