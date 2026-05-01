import { useEffect, useRef, useState } from "react";
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
import { trackPromoEvent } from "@/lib/promo/tracker";
import { captureFirstTouchIfMissing } from "@/lib/signup-tracking";
import {
  Sparkles,
  Target,
  Radar,
  MessageSquare,
  ChevronRight,
  Check,
  Brain,
  Rocket,
} from "lucide-react";

const GRADIENT = "linear-gradient(135deg, #6C63FF 0%, #00C4B4 100%)";
const HERO_BG =
  "linear-gradient(135deg, #0A0A0F 0%, #0F0B1E 50%, #0D0A20 100%)";

// Renders an H1 with the highlighted word in violet→teal gradient
const HighlightedTitle = ({ title, highlight }: { title: string; highlight: string }) => {
  const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return <>{title}</>;
  const before = title.slice(0, idx);
  const match = title.slice(idx, idx + highlight.length);
  const after = title.slice(idx + highlight.length);
  return (
    <>
      {before}
      <span
        style={{
          background: "linear-gradient(90deg, #6C63FF, #00C4B4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
};

// CountUp number that animates when in viewport
const CountUpNumber = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const numericMatch = value.match(/^(\d+)/);
    if (!numericMatch) return;
    const target = parseInt(numericMatch[1], 10);
    const suffix = value.slice(numericMatch[1].length);
    const prefix = "";
    setDisplay(`${prefix}0${suffix}`);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1200;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              const current = Math.round(target * eased);
              setDisplay(`${prefix}${current}${suffix}`);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return <span ref={ref}>{display}</span>;
};

const PromoLanding = () => {
  const hero = getActiveHero();
  const ctaLabel = getActiveCTA();

  useEffect(() => {
    captureFirstTouchIfMissing();
    markPromoOrigin();
    const utms = getCurrentUTMs();
    trackPromoEvent("promo_landing_view", {
      ...utms,
      landing_path: "/promo",
      device:
        typeof window !== "undefined" && window.innerWidth < 768
          ? "mobile"
          : "desktop",
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleCtaClick = (position: string) => {
    const utms = getCurrentUTMs();
    trackPromoEvent("promo_signup_cta_click", {
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
    <div className="min-h-screen bg-white text-[#0F172A]">
      <SiteHead
        title="Crea tu cuenta gratis · VISTACEO"
        description="VISTACEO analiza tu negocio, detecta prioridades y te entrega misiones para actuar hoy. Gratis, sin tarjeta."
        path="/promo"
        noindex
      />

      <PromoHeader onCtaClick={() => handleCtaClick("header")} />

      {/* ============ HERO ============ */}
      <section
        className="relative overflow-hidden"
        style={{ background: HERO_BG, paddingTop: 120, paddingBottom: 100 }}
      >
        {/* Radial glow behind title */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 400,
            top: -100,
            left: -50,
            background:
              "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 500,
            bottom: -150,
            right: -100,
            background:
              "radial-gradient(circle, rgba(0,196,180,0.12) 0%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden
        />

        <div className="relative z-10 max-w-[1180px] mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
            {/* Copy */}
            <div>
              {/* Badge */}
              <span
                className="promo-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium text-white"
                style={{
                  background: "rgba(108,99,255,0.15)",
                  border: "1px solid rgba(108,99,255,0.35)",
                  animationDelay: "0s",
                }}
              >
                <span className="promo-pulse text-[#00C4B4]">✦</span>
                CEO digital con IA · Gratis para empezar
              </span>

              {/* H1 */}
              <h1
                className="promo-fade-up mt-6 font-extrabold text-white"
                style={{
                  fontSize: "clamp(44px, 5.5vw, 72px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.025em",
                  animationDelay: "0.1s",
                }}
              >
                <HighlightedTitle title={hero.title} highlight={hero.highlight} />
              </h1>

              {/* Subtitle */}
              <p
                className="promo-fade-up mt-6 max-w-[560px]"
                style={{
                  fontSize: 19,
                  lineHeight: 1.6,
                  color: "#CBD5E1",
                  fontWeight: 400,
                  animationDelay: "0.2s",
                }}
              >
                {hero.subtitle}
              </p>

              {/* Primary CTA */}
              <div
                className="promo-fade-up mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                style={{ animationDelay: "0.3s" }}
              >
                <Link
                  to={buildSignupHref()}
                  onClick={() => handleCtaClick("hero")}
                  className="promo-cta inline-flex items-center justify-center gap-2 text-white font-bold transition-all"
                  style={{
                    height: 56,
                    paddingInline: 32,
                    fontSize: 17,
                    borderRadius: 12,
                    background: GRADIENT,
                    boxShadow: "0 8px 32px rgba(108,99,255,0.45)",
                  }}
                >
                  {ctaLabel}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              <p
                className="promo-fade-up mt-3 text-[13px]"
                style={{ color: "#64748B", animationDelay: "0.35s" }}
              >
                Sin tarjeta · En minutos · Para negocios de LATAM
              </p>

              <div
                className="promo-fade-up mt-6"
                style={{ animationDelay: "0.45s" }}
              >
                <a
                  href="#beneficios"
                  className="text-[14px] text-[#94A3B8] hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Ver cómo funciona ↓
                </a>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <PromoIntelligencePanel />
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section style={{ background: "#0F172A" }}>
        <div className="max-w-[1180px] mx-auto px-5 sm:px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13.5px] text-[#94A3B8]">
            {[
              "Gratis para empezar",
              "Sin tarjeta de crédito",
              "Diagnóstico en minutos",
              "Para negocios de LATAM",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00C4B4]" strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ¿QUÉ PASA DESPUÉS? ============ */}
      <section style={{ background: "#FAFAFA" }}>
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6" style={{ paddingBlock: 96 }}>
          <div className="text-center max-w-[640px] mx-auto">
            <h2
              className="font-bold text-[#0F172A]"
              style={{ fontSize: "clamp(28px, 3.5vw, 42px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              ¿Qué recibís al crear tu cuenta?
            </h2>
            <p className="mt-4 text-[17px] text-[#64748B] leading-relaxed">
              No hay que esperar. Tu primer resultado aparece en minutos.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { n: "01", t: "Contás tu negocio", d: "Qué tipo, rubro y objetivo tenés." },
              { n: "02", t: "VISTACEO lo analiza", d: "IA detecta prioridades y oportunidades." },
              { n: "03", t: "Recibís claridad", d: "Diagnóstico, misiones y próximos pasos." },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl bg-white p-7 transition-all hover:-translate-y-1"
                style={{
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="text-[44px] font-extrabold leading-none"
                  style={{
                    background: "linear-gradient(90deg, #6C63FF, #00C4B4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.n}
                </div>
                <h3 className="mt-5 text-[17px] font-bold text-[#0F172A]">{s.t}</h3>
                <p className="mt-2 text-[14.5px] text-[#475569] leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MÉTRICAS ============ */}
      <section className="bg-white">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6" style={{ paddingBlock: 80 }}>
          <div
            className="rounded-3xl"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F0EEFF 100%)",
              padding: "60px 32px",
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { v: "3", l: "misiones iniciales" },
                { v: "2 min", l: "para empezar" },
                { v: "$0", l: "sin tarjeta" },
                { v: "1", l: "plan claro para hoy" },
              ].map((m) => (
                <div key={m.l}>
                  <div
                    className="font-extrabold leading-none"
                    style={{
                      fontSize: "clamp(48px, 6vw, 72px)",
                      background: "linear-gradient(90deg, #6C63FF, #00C4B4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {/^\d/.test(m.v) ? <CountUpNumber value={m.v} /> : m.v}
                  </div>
                  <div className="mt-2 text-[15px] text-[#64748B] font-medium">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PARA QUIÉN ============ */}
      <section className="bg-white">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6" style={{ paddingBlock: 80 }}>
          <div className="text-center max-w-[680px] mx-auto">
            <h2
              className="font-bold text-[#0F172A]"
              style={{ fontSize: "clamp(28px, 3.5vw, 42px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Pensado para negocios reales
            </h2>
            <p className="mt-4 text-[17px] text-[#64748B] leading-relaxed">
              No para empresas gigantes. Para el que ejecuta y decide todos los días.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-2.5 max-w-[860px] mx-auto">
            {[
              "Restaurantes", "Clínicas", "Agencias", "Comercios",
              "Servicios profesionales", "Emprendedores", "PyMEs",
              "Marcas personales", "Consultores", "Estudios",
              "Gimnasios", "Franquicias", "E-commerce", "Academias",
            ].map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-4 py-2 rounded-full text-[14px] font-medium"
                style={{
                  background: "#F1F0FF",
                  color: "#534AB7",
                  border: "1px solid #AFA9EC",
                }}
              >
                {p}
              </span>
            ))}
          </div>

          <p className="mt-10 text-center text-[18px] font-medium text-[#0F172A] max-w-[680px] mx-auto leading-relaxed">
            Si tenés un negocio y necesitás más claridad para crecer, VISTACEO te dice qué hacer hoy.
          </p>
        </div>
      </section>

      {/* ============ BENEFICIOS ============ */}
      <section id="beneficios" style={{ background: "#F8F7FF" }}>
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6" style={{ paddingBlock: 96 }}>
          <div className="text-center max-w-[640px] mx-auto">
            <h2
              className="font-bold text-[#0F172A]"
              style={{ fontSize: "clamp(28px, 3.5vw, 42px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Tu cuenta gratis incluye
            </h2>
            <p className="mt-4 text-[17px] text-[#64748B] leading-relaxed">
              Todo lo que necesitás para empezar a tomar mejores decisiones.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {[
              { icon: Brain, t: "Diagnóstico inicial", d: "Entendé dónde estás parado y qué deberías atacar primero.", badge: "Inmediato" },
              { icon: Rocket, t: "Misiones inteligentes", d: "Acciones concretas para vender más, ordenar procesos o mejorar resultados." },
              { icon: Radar, t: "Radar de oportunidades", d: "Señales de mejoras, riesgos y movimientos que podés aprovechar ahora." },
              { icon: MessageSquare, t: "Chat CEO con IA", d: "Un asistente ejecutivo para tomar mejores decisiones, 24/7." },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.t}
                  className="rounded-2xl bg-white p-8 transition-all hover:-translate-y-1.5"
                  style={{
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#AFA9EC";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(108,99,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                      style={{ background: GRADIENT, boxShadow: "0 6px 20px rgba(108,99,255,0.3)" }}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2.2} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[17px] font-bold text-[#0F172A]">{b.t}</h3>
                        {b.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold text-[#059669] bg-[#D1FAE5] border border-[#6EE7B7]">
                            {b.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[14.5px] text-[#475569] leading-relaxed">{b.d}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="bg-white">
        <div className="max-w-[760px] mx-auto px-5 sm:px-6" style={{ paddingBlock: 80 }}>
          <div className="text-center mb-10">
            <h2
              className="font-bold text-[#0F172A]"
              style={{ fontSize: "clamp(28px, 3.5vw, 42px)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
            >
              Preguntas frecuentes
            </h2>
          </div>
          <PromoFAQ />
        </div>
      </section>

      {/* ============ CTA FINAL OSCURO ============ */}
      <section className="relative overflow-hidden" style={{ background: HERO_BG, paddingBlock: 120 }}>
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 500,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background:
              "radial-gradient(circle, rgba(108,99,255,0.20) 0%, rgba(0,196,180,0.10) 40%, transparent 70%)",
          }}
          aria-hidden
        />
        <div className="relative z-10 max-w-[860px] mx-auto px-5 sm:px-6 text-center">
          <h2
            className="font-extrabold text-white"
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}
          >
            Empezá gratis. Sabé qué hacer hoy para{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6C63FF, #00C4B4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              crecer
            </span>
            .
          </h2>
          <p className="mt-5 text-[16px] text-[#94A3B8]">
            Sin tarjeta · En minutos · Para negocios de LATAM
          </p>
          <div className="mt-9">
            <Link
              to={buildSignupHref()}
              onClick={() => handleCtaClick("footer")}
              className="promo-cta inline-flex items-center justify-center gap-2 text-white font-bold transition-all"
              style={{
                height: 56,
                paddingInline: 36,
                fontSize: 17,
                borderRadius: 12,
                background: GRADIENT,
                boxShadow: "0 8px 32px rgba(108,99,255,0.45)",
              }}
            >
              {ctaLabel}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER MINIMAL ============ */}
      <footer style={{ background: "#0A0A0F" }}>
        <div className="max-w-[1100px] mx-auto px-5 sm:px-6 py-7">
          <p className="text-center text-[12.5px] text-[#64748B]">
            © {new Date().getFullYear()} VISTACEO ·{" "}
            <Link to="/condiciones" className="hover:text-white transition-colors">
              Términos
            </Link>{" "}
            ·{" "}
            <Link to="/politicas" className="hover:text-white transition-colors">
              Privacidad
            </Link>{" "}
            ·{" "}
            <Link to="/auth?mode=login" className="hover:text-white transition-colors">
              ¿Ya tenés cuenta? Ingresá →
            </Link>
          </p>
        </div>
      </footer>

      <PromoStickyCTA onClick={() => handleCtaClick("sticky")} />

      {/* Global page animations */}
      <style>{`
        @keyframes promoFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .promo-fade-up {
          opacity: 0;
          animation: promoFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes promoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.85; }
        }
        .promo-pulse { display: inline-block; animation: promoPulse 2s ease-in-out infinite; }
        .promo-cta:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 14px 40px rgba(108,99,255,0.55) !important; }
        .promo-cta:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default PromoLanding;
