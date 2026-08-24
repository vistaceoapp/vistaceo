import { useLocation, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SiteHead } from "@/components/seo/SiteHead";
import { SeoShell, SEO_GRADIENT } from "@/components/seo/SeoShell";
import { findLandingByPath } from "@/data/seo-landings";
import { ArrowRight, Check } from "lucide-react";

const CANONICAL_DOMAIN = "https://www.vistaceo.com";

/** Renderiza cualquier página de captación definida en src/data/seo-landings.ts */
export default function SeoLandingPage() {
  const { pathname } = useLocation();
  const landing = findLandingByPath(pathname.replace(/\/$/, "") || "/");

  if (!landing) return <Navigate to="/" replace />;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${CANONICAL_DOMAIN}/` },
      { "@type": "ListItem", position: 2, name: landing.h1, item: `${CANONICAL_DOMAIN}${landing.path}` },
    ],
  };

  return (
    <>
      <SiteHead title={landing.title} description={landing.description} path={landing.path} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <SeoShell breadcrumb={landing.h1} related={landing.related}>
        <article>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{landing.h1}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{landing.intro}</p>

          <div className="mt-7">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: SEO_GRADIENT }}
            >
              Analizar mi negocio gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {landing.sections.map((section) => (
            <section key={section.h2} className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight">{section.h2}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{section.body}</p>
              {section.bullets && (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px] leading-relaxed">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-tight">Preguntas frecuentes</h2>
            <dl className="mt-4 space-y-5">
              {landing.faqs.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-5">
                  <dt className="text-[15px] font-semibold">{f.q}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12 rounded-2xl border border-border/60 p-6 text-center">
            <h2 className="text-lg font-semibold">Empezá con el análisis de tu negocio</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              El setup toma unos minutos y al terminar ves el primer diagnóstico. Sin tarjeta.
            </p>
            <Link
              to="/auth?mode=signup"
              className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
              style={{ background: SEO_GRADIENT }}
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </article>
      </SeoShell>
    </>
  );
}
