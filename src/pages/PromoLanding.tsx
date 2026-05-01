import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteHead } from "@/components/seo/SiteHead";
import { PromoHeader } from "@/components/promo/PromoHeader";
import { PromoIntelligencePanel } from "@/components/promo/PromoIntelligencePanel";
import { PromoStickyCTA } from "@/components/promo/PromoStickyCTA";
import { PromoFAQ } from "@/components/promo/PromoFAQ";
import {
  buildSignupHref,
  markPromoOrigin,
  getCurrentUTMs,
} from "@/lib/promo/utm";
import { getActiveHero, getActiveCTA } from "@/lib/promo/variants";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import {
  Sparkles,
  Target,
  Radar,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { captureFirstTouchIfMissing } from "@/lib/signup-tracking";

const GRADIENT = "linear-gradient(135deg, #2692DC 0%, #746CE6 100%)";

const PromoLanding = () => {
  const hero = getActiveHero();
  const ctaLabel = getActiveCTA();
  const { trackFeatureUse } = useActivityTracker();

  // Capture origin + first-touch + landing view event
  useEffect(() => {
    captureFirstTouchIfMissing();
    markPromoOrigin();
    const utms = getCurrentUTMs();
    trackFeatureUse("promo_landing_view", {
      ...utms,
      landing_path: "/promo",
      device:
        typeof window !== "undefined" && window.innerWidth < 768
          ? "mobile"
          : "desktop",
      timestamp: new Date().toISOString(),
    });
  }, [trackFeatureUse]);

  const handleCtaClick = (position: string) => {
    const utms = getCurrentUTMs();
    trackFeatureUse("promo_signup_cta_click", {
      ...utms,
      landing_path: "/promo",
      cta_position: position,
      device:
        typeof window !== "undefined" && window.innerWidth < 768
          ? "mobile"
          : "desktop",
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1d27]">
      <SiteHead
        title="Crea tu cuenta gratis · VISTACEO"
        description="Recibí un plan claro para hacer crecer tu negocio. VISTACEO analiza tu contexto y te entrega prioridades, misiones y un chat CEO con IA. Gratis, sin tarjeta."
        path="/promo"
        noindex
      />

      <PromoHeader onCtaClick={() => handleCtaClick("header")} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Soft background gradient */}
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 0%, rgba(116,108,230,0.10) 0%, transparent 60%), radial-gradient(50% 50% at 0% 20%, rgba(38,146,220,0.10) 0%, transparent 60%)",
          }}
          aria-hidden
        />

        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1f4fa] border border-[#e6eaf2] text-[12px] font-semibold text-[#2c5fb8]">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: GRADIENT }}
                />
                VISTACEO para tu negocio
              </span>

              <h1 className="mt-5 text-[clamp(2.05rem,4.6vw,3.4rem)] font-semibold tracking-[-0.028em] leading-[1.05] text-[#0a0a0a]">
                {hero.title}
              </h1>

              <p className="mt-5 text-[16.5px] sm:text-[17.5px] text-[#4a5160] leading-relaxed max-w-[560px]">
                {hero.subtitle}
              </p>

              {/* CTAs */}
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to={buildSignupHref()}
                  onClick={() => handleCtaClick("hero_primary")}
                  className="inline-flex items-center justify-center gap-2 h-13 px-7 rounded-2xl text-[15.5px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(116,108,230,0.55)] hover:shadow-[0_14px_36px_-10px_rgba(116,108,230,0.65)] transition-all"
                  style={{ background: GRADIENT, height: 52 }}
                >
                  {ctaLabel}
                  <ChevronRight className="w-4.5 h-4.5" />
                </Link>
                <a
                  href="#beneficios"
                  className="inline-flex items-center justify-center h-[52px] px-6 rounded-2xl text-[14.5px] font-medium text-[#3a414f] hover:text-[#0a0a0a] hover:bg-[#f4f6fb] transition-colors"
                >
                  Ver qué recibo gratis
                </a>
              </div>

              <p className="mt-4 text-[13px] text-[#6b7283] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                Gratis · Sin tarjeta · En minutos
              </p>
            </div>

            {/* Visual */}
            <div className="relative">
              <PromoIntelligencePanel />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-[#eef0f4] bg-[#fafbfd]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-[640px] mx-auto">
            <h2 className="text-[clamp(1.7rem,3.2vw,2.25rem)] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              ¿Qué pasa después de crear tu cuenta?
            </h2>
            <p className="mt-3 text-[15.5px] text-[#5b6271]">
              Tres pasos simples para llegar al primer resultado.
            </p>
          </div>

          <ol className="mt-10 grid md:grid-cols-3 gap-5">
            {[
              {
                n: 1,
                t: "Contás qué tipo de negocio o servicio tenés",
                d: "Lo mínimo necesario para entender tu contexto.",
              },
              {
                n: 2,
                t: "VISTACEO analiza tu contexto y tus objetivos",
                d: "Procesamos señales y prioridades reales para tu sector.",
              },
              {
                n: 3,
                t: "Recibís prioridades, misiones y próximos pasos",
                d: "Sabés exactamente qué hacer hoy para avanzar.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-2xl bg-white border border-[#e8ebf2] p-6 shadow-[0_2px_8px_-4px_rgba(38,40,80,0.06)]"
              >
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-[14px] font-bold"
                  style={{ background: GRADIENT }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 text-[16px] font-semibold text-[#1a1d27] leading-snug">
                  {s.t}
                </h3>
                <p className="mt-2 text-[14px] text-[#5b6271] leading-relaxed">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="beneficios" className="border-t border-[#eef0f4]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-[640px] mx-auto">
            <h2 className="text-[clamp(1.7rem,3.2vw,2.25rem)] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              Tu cuenta gratis incluye
            </h2>
            <p className="mt-3 text-[15.5px] text-[#5b6271]">
              Todo lo que necesitás para empezar a decidir mejor desde el primer día.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: Sparkles,
                t: "Diagnóstico inicial",
                d: "Entendé dónde estás parado y qué deberías mirar primero.",
              },
              {
                icon: Target,
                t: "Misiones inteligentes",
                d: "Acciones concretas para vender más, ordenar procesos o mejorar resultados.",
              },
              {
                icon: Radar,
                t: "Radar de oportunidades",
                d: "Señales que pueden ayudarte a detectar mejoras, riesgos y movimientos del mercado.",
              },
              {
                icon: MessageSquare,
                t: "Chat CEO con IA",
                d: "Un asistente ejecutivo para pensar decisiones, campañas, prioridades y próximos pasos.",
              },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.t}
                  className="rounded-2xl bg-white border border-[#e8ebf2] p-6 hover:border-[#d6dbe8] hover:shadow-[0_8px_24px_-12px_rgba(38,40,80,0.12)] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white"
                      style={{ background: GRADIENT }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1a1d27]">
                        {b.t}
                      </h3>
                      <p className="mt-1.5 text-[14px] text-[#5b6271] leading-relaxed">
                        {b.d}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="border-t border-[#eef0f4] bg-[#fafbfd]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-[680px] mx-auto">
            <h2 className="text-[clamp(1.7rem,3.2vw,2.25rem)] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              Pensado para negocios reales, no para empresas gigantes
            </h2>
            <p className="mt-3 text-[15.5px] text-[#5b6271]">
              Si tenés un negocio, servicio o emprendimiento y necesitás más
              claridad para crecer, VISTACEO te ayuda a decidir mejor cada día.
            </p>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-2.5 max-w-[820px] mx-auto">
            {[
              "Restaurantes",
              "Clínicas",
              "Agencias",
              "Comercios",
              "Servicios profesionales",
              "Emprendedores",
              "PyMEs",
              "Marcas personales",
              "Consultores",
            ].map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-[#e8ebf2] text-[13.5px] font-medium text-[#3a414f]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS — conceptual, no fake counts */}
      <section className="border-t border-[#eef0f4]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-14 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 text-center">
            {[
              { v: "3", l: "misiones iniciales" },
              { v: "2 min", l: "para empezar" },
              { v: "0 USD", l: "sin tarjeta" },
              { v: "1", l: "plan claro para hoy" },
            ].map((m) => (
              <div
                key={m.l}
                className="rounded-2xl bg-[#fafbfd] border border-[#eef0f4] py-6 px-3"
              >
                <div
                  className="text-[clamp(1.7rem,3vw,2.1rem)] font-bold tracking-[-0.02em]"
                  style={{
                    background: GRADIENT,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {m.v}
                </div>
                <div className="mt-1 text-[12.5px] sm:text-[13px] text-[#5b6271] font-medium">
                  {m.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#eef0f4] bg-[#fafbfd]">
        <div className="max-w-[760px] mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="text-center mb-8">
            <h2 className="text-[clamp(1.7rem,3.2vw,2.25rem)] font-semibold tracking-[-0.02em] text-[#0a0a0a]">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-[#e8ebf2] px-5 sm:px-7">
            <PromoFAQ />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[#eef0f4]">
        <div className="max-w-[860px] mx-auto px-5 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#0a0a0a]">
            Empezá gratis y descubrí qué debería hacer hoy tu negocio.
          </h2>
          <div className="mt-8">
            <Link
              to={buildSignupHref()}
              onClick={() => handleCtaClick("final")}
              className="inline-flex items-center justify-center gap-2 h-14 px-9 rounded-2xl text-[16px] font-semibold text-white shadow-[0_14px_36px_-10px_rgba(116,108,230,0.55)] hover:shadow-[0_18px_42px_-10px_rgba(116,108,230,0.7)] transition-all"
              style={{ background: GRADIENT }}
            >
              {ctaLabel}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-[#6b7283]">
            Sin tarjeta · En minutos · Pensado para negocios de LATAM
          </p>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-[#eef0f4] bg-white">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12.5px] text-[#7a8194]">
          <span>© {new Date().getFullYear()} VISTACEO</span>
          <div className="flex items-center gap-5">
            <Link to="/politicas" className="hover:text-[#0a0a0a] transition-colors">
              Privacidad
            </Link>
            <Link to="/condiciones" className="hover:text-[#0a0a0a] transition-colors">
              Condiciones
            </Link>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <PromoStickyCTA onClick={() => handleCtaClick("sticky_mobile")} />
    </div>
  );
};

export default PromoLanding;
