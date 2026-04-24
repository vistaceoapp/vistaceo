import { useState, useEffect, useRef, memo, useCallback, useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Check, TrendingUp, Target, Zap, BarChart3, Shield, Brain, Sparkles, Heart, MessageCircle, Eye, Radar, Lock, Clock, Users, CheckCircle2, ArrowUpRight, Globe, Mail, Search, Lightbulb } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";
import { useCountryDetection, COUNTRY_CONFIG } from "@/hooks/use-country-detection";
import { motion, AnimatePresence } from "framer-motion";
import type { CountryCode } from "@/lib/countryPacks";

// Import REAL mockup components
import { MockupProDashboard } from "@/components/landing/mockups/MockupProDashboard";
import { MockupProMissions } from "@/components/landing/mockups/MockupProMissions";
import { MockupProRadar } from "@/components/landing/mockups/MockupProRadar";
import { MockupProChat } from "@/components/landing/mockups/MockupProChat";
import { MockupProAnalytics } from "@/components/landing/mockups/MockupProAnalytics";
import { MockupProPredictions } from "@/components/landing/mockups/MockupProPredictions";
import { MockupProInsights } from "@/components/landing/mockups/MockupProInsights";
import { MockupProCompetitors } from "@/components/landing/mockups/MockupProCompetitors";
import { CapabilitiesShowcase } from "@/components/landing/CapabilitiesShowcase";
import HeroOrb from "@/components/landing/HeroOrb";
import ceoOfficeImg from "@/assets/hero/ceo-office-led.avif";

import type { BusinessKey } from "@/components/landing/mockups/MockupProDashboard";

import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=400&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=400&format=webp";
import marketingImg from "@/assets/business-types/marketing-digital.jpg?w=400&format=webp";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg?w=400&format=webp";
import juridicoImg from "@/assets/business-types/estudio-juridico.jpg?w=400&format=webp";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Minimalist Landing — Ultra-Premium v3
   ═══════════════════════════════════════════════════════════════ */

const ACCENT_GRADIENT = "linear-gradient(135deg, #2692DC, #746CE6)";
const ACCENT_GRADIENT_SUBTLE = "linear-gradient(135deg, rgba(38,146,220,0.08), rgba(116,108,230,0.08))";

/* ── Scroll Reveal ── */
type RevealProps = { children: React.ReactNode; className?: string; delay?: number; distance?: number };
const Reveal = memo(forwardRef<HTMLDivElement, RevealProps>(({ children, className, delay = 0, distance = 40 }, _externalRef) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Detect mobile + reduced motion once for cheaper, snappier animations on phones
  const isMobile = typeof window !== "undefined" && window.matchMedia?.("(max-width: 768px)").matches;
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const effectiveDistance = reduced ? 0 : isMobile ? Math.min(distance, 16) : distance;
  const effectiveDuration = reduced ? 0 : isMobile ? 460 : 800;
  const effectiveDelay = isMobile ? Math.min(delay, 120) : delay;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fire earlier on mobile so content is already settled when user scrolls to it
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (effectiveDelay > 0) setTimeout(() => setVisible(true), effectiveDelay);
        else setVisible(true);
        obs.disconnect();
      }
    }, { threshold: 0.05, rootMargin: isMobile ? "0px 0px 120px 0px" : "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [effectiveDelay, isMobile]);

  return (
    <div ref={ref} className={cn("transition-[opacity,transform] ease-out", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${effectiveDistance}px,0)`,
        transitionDuration: `${effectiveDuration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >{children}</div>
  );
}));
Reveal.displayName = "Reveal";

/* ── Accent text with gradient ── */
const AccentLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10.5px] uppercase tracking-[0.22em] font-semibold"
    style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════════
   1. Header
   ═══════════════════════════════════════════════════════════════ */
const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#capacidades" },
  { label: "Precios", href: "#precios" },
  { label: "Blog", href: "https://blog.vistaceo.com", external: true },
  { label: "Preguntas frecuentes", href: "#faq" },
];

const Header = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("http")) { window.open(href, "_blank"); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/70",
      scrolled
        ? "bg-white/85 md:bg-white/92 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] border-b border-black/[0.06]"
        : "bg-white/60 md:bg-white/75 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-[0.14em] text-[#111]">VISTACEO</span>
          </div>
          <div className="hidden md:block w-px h-5 bg-[#e5e5e5]" />
        </div>

        <nav className="hidden md:flex items-center gap-10 ml-10">
          {NAV_LINKS.map(link => (
            <button key={link.label} onClick={() => scrollTo(link.href)}
              className="text-[13.5px] text-[#888] hover:text-[#111] transition-colors duration-300 relative group bg-transparent border-none cursor-pointer">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#111] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <button onClick={() => navigate("/auth")}
            className="text-[13.5px] text-[#666] hover:text-[#111] transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-[#f8f8f8]">
            Ingresar
          </button>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="text-[13.5px] text-white px-5 py-2.5 rounded-[10px] font-medium transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_4px_12px_rgba(38,146,220,0.25)] active:scale-[0.98]"
            style={{ background: ACCENT_GRADIENT }}>
            Empezar gratis <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden ml-auto p-2 hover:bg-[#f8f8f8] rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>
      </div>

      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-500 bg-white/80 backdrop-blur-2xl border-t border-[#f0f0f0] shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
        mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-5 space-y-1">
          {NAV_LINKS.map(item => (
            <button key={item.label} onClick={() => scrollTo(item.href)} className="block w-full text-left text-[15px] text-[#444] py-3 border-b border-[#f5f5f5] last:border-0 bg-transparent">
              {item.label}
            </button>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[15px] text-[#666] py-2.5 text-left bg-transparent">Ingresar</button>
            <button onClick={() => { navigate("/auth?mode=signup"); setMobileOpen(false); }} 
              className="text-[15px] text-white px-5 py-3.5 rounded-xl font-medium w-full"
              style={{ background: ACCENT_GRADIENT }}>
              Empezar gratis
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

/* ═══════════════════════════════════════════════════════════════
   Notification Cards
   ═══════════════════════════════════════════════════════════════ */
const NotifCard = ({ icon, iconBg, name, text, time, className, delay = 0 }: {
  icon: React.ReactNode; iconBg: string; name: string; text: string; time: string; className?: string; delay?: number;
}) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setTimeout(() => setShow(true), delay); obs.disconnect(); } 
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref}
      className={cn("bg-white rounded-[14px] border border-[#ebebeb] shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-3.5 w-[250px] flex gap-3 items-start transition-all", className)}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateX(0) translateY(0)" : "translateX(20px) translateY(10px)",
        transitionDuration: "700ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 shadow-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{name}</p>
          <span className="text-[10px] text-[#ccc] flex-shrink-0">{time}</span>
        </div>
        <p className="text-[11px] text-[#888] leading-[1.45] mt-0.5 line-clamp-2">{text}</p>
      </div>
    </div>
  );
};

/* ── Hero Signal Card ── */
const HeroSignalCard = ({ icon, label, title, detail, accentColor, delay = 0 }: {
  icon: React.ReactNode; label: string; title: string; detail: string; accentColor: string; delay?: number;
}) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setShow(true), delay); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref}
      className="p-3 rounded-xl border border-[#ebebeb] bg-white/90 transition-all duration-700"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(12px)",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
      <div className="flex items-start gap-2.5">
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background: accentColor }} />
        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}12` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-semibold uppercase tracking-[0.1em]" style={{ color: accentColor }}>{label}</span>
          <p className="text-[11.5px] font-medium text-[#1a1a1a] leading-snug mt-0.5">{title}</p>
          <p className="text-[10px] text-[#999] leading-[1.45] mt-0.5">{detail}</p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   2. Hero
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 px-6 overflow-hidden min-h-[92svh]">
      {/* Background image — CEO office, full bleed */}
      <div className="absolute inset-0 z-0">
        <img
          src={ceoOfficeImg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          style={{ filter: "saturate(0.92) brightness(1.06)" }}
          loading="eager"
          decoding="async"
          // @ts-ignore — valid HTML attr
          fetchpriority="high"
        />
        {/* White → soft celeste veil for legibility (desktop) */}
        <div
          className="hidden lg:block absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.84) 38%, rgba(232,243,253,0.55) 64%, rgba(214,232,250,0.22) 100%)",
          }}
        />
        {/* Mobile veil — heavier so copy reads */}
        <div
          className="lg:hidden absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.82) 45%, rgba(232,243,253,0.55) 100%)",
          }}
        />
        {/* Subtle celeste glow accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 78% 40%, rgba(38,146,220,0.12) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: copy — wider, more breathing room */}
          <div className="lg:col-span-12">
            <Reveal distance={20}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-white/80 shadow-[0_4px_14px_rgba(38,146,220,0.10)] mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28c840] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#28c840]" />
                </span>
                <span className="text-[12.5px] sm:text-[13px] font-medium tracking-wide text-[#444]">Inteligencia ejecutiva en vivo</span>
              </div>
            </Reveal>

            <Reveal delay={80} distance={28}>
              <h1
                className="font-semibold text-[#0a0a0a] tracking-[-0.036em] hyphens-none"
                style={{
                  fontSize: "clamp(2.05rem, 5.4vw, 4.85rem)",
                  lineHeight: 1.04,
                }}
              >
                <span className="block">Tu empresa,</span>
                <span className="block mt-1">impulsada por un</span>
                <span
                  className="block mt-1 hero-ceo-grad"
                  style={{
                    paddingBottom: "0.08em",
                  }}
                >
                  CEO digital con IA.
                </span>
              </h1>
              <style>{`
                .hero-ceo-grad {
                  background-image: linear-gradient(118deg, #4FB3F0 0%, #2692DC 28%, #4A7FE8 58%, #746CE6 82%, #8A6CE6 100%);
                  background-size: 200% 100%;
                  background-position: 0% 50%;
                  -webkit-background-clip: text;
                  background-clip: text;
                  -webkit-text-fill-color: transparent;
                  color: transparent;
                }
                @media (min-width: 768px) {
                  .hero-ceo-grad {
                    filter: drop-shadow(0 6px 22px rgba(38,146,220,0.22));
                    animation: heroCeoShimmer 9s ease-in-out infinite;
                  }
                }
                @keyframes heroCeoShimmer {
                  0%, 100% { background-position: 0% 50%; }
                  50%      { background-position: 100% 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                  .hero-ceo-grad { animation: none; }
                }
              `}</style>
            </Reveal>

            <div className="mt-8 lg:mt-10 max-w-[640px]">
              <Reveal delay={300} distance={18}>
                <p className="text-[18px] lg:text-[21px] text-[#1a1a1a] leading-[1.55] font-normal tracking-[-0.01em]">
                  Entiende tu servicio o negocio, detecta <span className="font-semibold text-[#0a0a0a]">prioridades</span> y te dice <span className="font-semibold text-[#0a0a0a]">qué hacer hoy</span> para crecer con más claridad y velocidad.
                </p>
              </Reveal>

              <Reveal delay={380} distance={18}>
                <div className="flex flex-wrap items-center gap-3 mt-9">
                  <button
                    onClick={() => navigate("/auth?mode=signup")}
                    className="group relative flex items-center gap-2 pl-6 pr-2 py-2 rounded-full bg-[#0a0a0a] text-white hover:bg-[#1a1a1a] transition-all duration-300 active:scale-[0.98] shadow-[0_14px_36px_-10px_rgba(0,0,0,0.55)] hover:shadow-[0_18px_44px_-10px_rgba(38,146,220,0.45)]"
                  >
                    <span className="text-[14.5px] font-medium tracking-[-0.005em]">Empezar gratis</span>
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5"
                      style={{ background: ACCENT_GRADIENT }}
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.querySelector("#producto");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group flex items-center gap-1.5 text-[14px] text-[#444] hover:text-[#0a0a0a] px-5 py-3 rounded-full transition-all duration-300 border border-black/[0.08] bg-white/70 hover:bg-white hover:border-black/[0.14] backdrop-blur-md hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]"
                  >
                    <span className="font-medium">Ver cómo funciona</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </button>
                </div>

                <div
                  className="mt-7 relative overflow-hidden hero-marquee-mask"
                  aria-hidden="true"
                >
                  <div className="flex gap-3 hero-marquee-track whitespace-nowrap py-1">
                    {[
                      "Restaurantes", "Cafeterías", "Hoteles", "Estudios jurídicos",
                      "Clínicas", "Consultorios", "Gimnasios", "Spas",
                      "Tiendas online", "Retail", "Inmobiliarias", "Constructoras",
                      "Agencias", "Consultoras", "Estudios contables", "Coaches",
                      "Diseñadores", "Desarrolladores", "Fotógrafos", "Productoras",
                      "Talleres", "Distribuidoras", "Fábricas", "Importadoras",
                      "Escuelas", "Academias", "ONGs", "Marcas D2C",
                      "Peluquerías", "Veterinarias", "Farmacias", "Floristerías",
                    ].concat([
                      "Restaurantes", "Cafeterías", "Hoteles", "Estudios jurídicos",
                      "Clínicas", "Consultorios", "Gimnasios", "Spas",
                      "Tiendas online", "Retail", "Inmobiliarias", "Constructoras",
                      "Agencias", "Consultoras", "Estudios contables", "Coaches",
                      "Diseñadores", "Desarrolladores", "Fotógrafos", "Productoras",
                      "Talleres", "Distribuidoras", "Fábricas", "Importadoras",
                      "Escuelas", "Academias", "ONGs", "Marcas D2C",
                      "Peluquerías", "Veterinarias", "Farmacias", "Floristerías",
                    ]).map((label, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/[0.06] bg-white/70 text-[12px] text-[#555] font-medium tracking-[-0.005em]"
                      >
                        <span className="w-1 h-1 rounded-full bg-gradient-to-br from-[#4FB3F0] to-[#746CE6]" />
                        {label}
                      </span>
                    ))}
                  </div>
                  <style>{`
                    .hero-marquee-mask {
                      -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
                              mask-image: linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%);
                    }
                    .hero-marquee-track {
                      width: max-content;
                      animation: heroMarquee 55s linear infinite;
                      will-change: transform;
                    }
                    .hero-marquee-mask:hover .hero-marquee-track {
                      animation-play-state: paused;
                    }
                    @keyframes heroMarquee {
                      0%   { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .hero-marquee-track { animation: none; }
                    }
                  `}</style>
                </div>
              </Reveal>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   3. Franja de confianza
   ═══════════════════════════════════════════════════════════════ */
const TrustStrip = () => {
  const counter = useRealtimeCounter();
  
  return (
    <section className="py-8 px-6 bg-white border-y border-[#f5f5f5]">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center">
            <span className="flex items-center gap-1.5 text-[12px] text-[#888]">
              <Users className="w-3.5 h-3.5 text-[#2692DC]/70" />
              <span>
                <span className="font-semibold text-[#444] tabular-nums">+5.000</span> negocios o servicios ya la utilizan
              </span>
            </span>
            <span className="hidden sm:inline-block w-px h-3 bg-[#eee]" />
            <span className="flex items-center gap-1.5 text-[12px] text-[#999]">
              <Globe className="w-3.5 h-3.5 text-[#746CE6]/70" />
              Disponible en LATAM y España
            </span>
            <span className="hidden sm:inline-block w-px h-3 bg-[#eee]" />
            <span className="flex items-center gap-1.5 text-[12px] text-[#999]">
              <Shield className="w-3.5 h-3.5 text-[#2692DC]/70" />
              Datos encriptados
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};


/* ═══════════════════════════════════════════════════════════════
   5. Producto — Interactive Showcase
   ═══════════════════════════════════════════════════════════════ */
const mockupTabs = [
  { key: "salud", label: "Salud", icon: Heart, desc: "Índice multidimensional que evalúa tu negocio en tiempo real.", benefit: "Visualizá la salud integral de tu operación de un vistazo." },
  { key: "misiones", label: "Misiones", icon: Target, desc: "Acciones concretas con pasos claros y definición de éxito.", benefit: "Sabé exactamente qué hacer, cómo y cuándo." },
  { key: "radar", label: "Radar", icon: Radar, desc: "Oportunidades, riesgos y tendencias detectadas por IA.", benefit: "Anticipate a lo que viene antes que tu competencia." },
  { key: "chat", label: "Chat ejecutivo", icon: MessageCircle, desc: "Preguntá lo que quieras sobre tu negocio en lenguaje natural.", benefit: "Tu consultor estratégico disponible las 24 horas." },
  { key: "analytics", label: "Métricas", icon: BarChart3, desc: "Dashboards que se adaptan a tu industria.", benefit: "Las métricas que importan, sin ruido." },
  { key: "predictions", label: "Futuro", icon: Eye, desc: "Predicciones a 7, 14 y 30 días con niveles de certeza.", benefit: "Tomá decisiones hoy con la información de mañana." },
  { key: "insights", label: "Insights", icon: Lightbulb, desc: "Oportunidades, alertas y tendencias detectadas por IA.", benefit: "Decisiones informadas con inteligencia accionable." },
  { key: "competencia", label: "Competencia", icon: Users, desc: "Análisis en tiempo real de tu entorno competitivo.", benefit: "Sabé quién compite con vos y dónde tenés ventaja." },
] as const;
type TabKey = typeof mockupTabs[number]["key"];

const businesses: { key: BusinessKey; name: string; type: string; image: string }[] = [
  { key: "argentina", name: "Parrilla Don Martín", type: "Restaurante", image: parrillaImg },
  { key: "odontologia", name: "Clínica Dental Sonrisa", type: "Clínica", image: clinicaDentalImg },
  { key: "mexico", name: "Boutique Carmela", type: "Retail", image: boutiqueImg },
  { key: "marketing", name: "Rocket Digital", type: "Agencia", image: marketingImg },
  { key: "juridico", name: "Vega & Asociados", type: "Estudio Jurídico", image: juridicoImg },
];

const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("salud");
  const [activeBusiness, setActiveBusiness] = useState<BusinessKey>("argentina");

  const renderMockup = () => {
    const props = { business: activeBusiness };
    switch (activeTab) {
      case "salud": return <MockupProDashboard {...props} />;
      case "misiones": return <MockupProMissions {...props} />;
      case "radar": return <MockupProRadar {...props} />;
      case "chat": return <MockupProChat {...props} />;
      case "analytics": return <MockupProAnalytics {...props} />;
      case "predictions": return <MockupProPredictions {...props} />;
      case "insights": return <MockupProInsights {...props} />;
      case "competencia": return <MockupProCompetitors {...props} />;
    }
  };

  const currentTabData = mockupTabs.find(t => t.key === activeTab);

  return (
    <section id="producto" className="py-24 lg:py-32 px-6 bg-white">
      <div className="max-w-[1100px] mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <AccentLabel>PRODUCTO</AccentLabel>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Inteligencia que trabaja para vos
            </h2>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <p className="text-center text-[15px] text-[#999] mt-4 mb-12 max-w-[480px] mx-auto leading-[1.7]">
            Explorá cada módulo del sistema. Cambiá de negocio para ver cómo VISTACEO se adapta a cada industria.
          </p>
        </Reveal>

        {/* Business selector */}
        <Reveal delay={100}>
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {businesses.map(b => (
              <button key={b.key} onClick={() => setActiveBusiness(b.key)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12.5px] font-medium transition-all duration-300 border",
                  activeBusiness === b.key
                    ? "text-white border-transparent shadow-[0_4px_12px_rgba(38,146,220,0.2)]"
                    : "bg-white text-[#777] border-[#eee] hover:border-[#ddd] hover:text-[#444]"
                )}
                style={activeBusiness === b.key ? { background: ACCENT_GRADIENT } : undefined}>
                <img src={b.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="hidden sm:inline">{b.name}</span>
                <span className="sm:hidden">{b.type}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Tab bar */}
        <Reveal delay={140}>
          <div className="flex items-center justify-center gap-1.5 mb-3 flex-wrap">
            {mockupTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-300",
                    activeTab === tab.key
                      ? "bg-[#f0f0f0] text-[#111]"
                      : "text-[#aaa] hover:text-[#666] hover:bg-[#f8f8f8]"
                  )}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Tab description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-8"
          >
            <p className="text-[13px] text-[#bbb]">{currentTabData?.desc}</p>
            <p className="text-[12px] mt-1.5 font-medium"
              style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {currentTabData?.benefit}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Mockup */}
        <Reveal delay={180}>
          <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f2f2f2] bg-[#fafafa]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
              <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
              <div className="flex-1 mx-8">
                <div className="h-5 rounded-md bg-[#f0f0f0] max-w-[220px] mx-auto flex items-center justify-center">
                  <span className="text-[9px] text-[#bbb]">app.vistaceo.com/{activeTab}</span>
                </div>
              </div>
            </div>
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div key={`${activeTab}-${activeBusiness}`}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  {renderMockup()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   6. Buscador inteligente con IA — Insight personalizado
   ═══════════════════════════════════════════════════════════════ */

const SUPPORTED_COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "DO", name: "Rep. Dominicana", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
];

const QUICK_CHIPS = ["Restaurante", "Clínica", "Agencia", "Freelancer", "E-commerce", "Consultorio", "Gimnasio", "Startup"];

const SmartFinder = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("AR");
  const [countryOpen, setCountryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    businessType: string;
    suggestions: string[];
    insight: string;
    metric: string;
    metricLabel: string;
  } | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-detect country on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          const cc = data.country_code;
          if (cc && SUPPORTED_COUNTRIES.some(c => c.code === cc)) {
            setCountry(cc);
          }
        }
      } catch { /* fallback AR */ }
    })();
  }, []);

  const fetchInsight = useCallback(async (q: string, cc: string) => {
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landing-insight`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: q.trim(), country: cc }),
        }
      );

      if (res.status === 429) { setError("Demasiadas consultas. Intentá en unos segundos."); return; }
      if (!res.ok) throw new Error();

      const data = await res.json();
      setResult(data);
    } catch {
      setError("No pudimos procesar tu consulta. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (q?: string) => {
    const input = q || query;
    if (input.trim().length >= 2) fetchInsight(input, country);
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => fetchInsight(val, country), 800);
    }
  };

  const handleSuggestionClick = (s: string) => {
    setQuery(s);
    fetchInsight(s, country);
  };

  const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === country)!;

  return (
    <section id="finder" className="py-20 lg:py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #fafafa 0%, #fff 100%)" }}>
      <div className="max-w-[680px] mx-auto relative z-10">
        <Reveal>
          <div className="text-center mb-10">
            <AccentLabel>PROBALO AHORA</AccentLabel>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-[#0a0a0a] tracking-[-0.03em] mt-5">
              ¿Qué tipo de negocio tenés?
            </h2>
            <p className="text-[14px] text-[#aaa] mt-3">
              Escribí tu rubro y recibí un insight estratégico personalizado al instante.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          {/* Country + Search */}
          <div className="flex gap-2 mb-5">
            {/* Country selector */}
            <div className="relative">
              <button onClick={() => setCountryOpen(!countryOpen)}
                className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl border border-[#e5e5e5] bg-white text-[13px] hover:border-[#ddd] transition-all min-w-[80px] justify-center"
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <ChevronDown className={cn("w-3 h-3 text-[#ccc] transition-transform", countryOpen && "rotate-180")} />
              </button>
              {countryOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-[#eee] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] z-50 max-h-[280px] overflow-y-auto w-[200px]">
                  {SUPPORTED_COUNTRIES.map(c => (
                    <button key={c.code} onClick={() => { setCountry(c.code); setCountryOpen(false); if (result) fetchInsight(query, c.code); }}
                      className={cn(
                        "flex items-center gap-2.5 w-full px-3 py-2.5 text-[12.5px] text-left hover:bg-[#f8f8f8] transition-colors",
                        country === c.code ? "bg-[#f5f5f5] font-medium text-[#111]" : "text-[#666]"
                      )}>
                      <span>{c.flag}</span> {c.name}
                      {country === c.code && <Check className="w-3 h-3 ml-auto" style={{ color: "#2692DC" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Ej: panadería, estudio contable, barbería..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#e5e5e5] bg-white text-[14px] text-[#222] placeholder:text-[#ccc] focus:outline-none focus:border-[#2692DC] focus:shadow-[0_0_0_3px_rgba(38,146,220,0.08)] transition-all duration-300"
              />
            </div>

            <button onClick={() => handleSubmit()}
              disabled={loading || query.trim().length < 2}
              className="px-5 py-3.5 rounded-xl text-white text-[13px] font-medium transition-all disabled:opacity-40 hover:shadow-[0_4px_12px_rgba(38,146,220,0.2)] active:scale-[0.97] flex-shrink-0"
              style={{ background: ACCENT_GRADIENT }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </Reveal>

        {/* Quick chips */}
        <Reveal delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {QUICK_CHIPS.map(p => (
              <button key={p} onClick={() => { setQuery(p); handleSubmit(p); }}
                className="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-300 border bg-white text-[#888] border-[#eee] hover:border-[#ddd] hover:text-[#555]">
                {p}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[13px] text-red-400 mb-4">
            {error}
          </motion.div>
        )}

        {/* Loading state */}
        {loading && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#eee] bg-white p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#eee] border-t-[#2692DC] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[13px] text-[#aaa]">VISTACEO está analizando tu sector...</p>
          </motion.div>
        )}

        {/* AI Suggestions (disambiguation) */}
        <AnimatePresence mode="wait">
          {result && result.suggestions && result.suggestions.length > 0 && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[#eee] bg-white p-6 mb-4"
            >
              <p className="text-[13px] text-[#999] mb-3">¿Te referís a alguno de estos?</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((s: string) => (
                  <button key={s} onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-2 rounded-lg border border-[#eee] text-[13px] text-[#555] hover:border-[#2692DC] hover:text-[#2692DC] transition-all bg-[#fafafa] hover:bg-[#f0f8ff]">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result panel */}
        <AnimatePresence mode="wait">
          {result && result.insight && (
            <motion.div
              key={result.businessType}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Header with business type */}
                <div className="px-6 py-5 border-b border-[#f2f2f2]" style={{ background: ACCENT_GRADIENT_SUBTLE }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: ACCENT_GRADIENT }}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-semibold text-[#111]">
                        VISTACEO para {result.businessType}
                      </p>
                      <p className="text-[11.5px] text-[#aaa] mt-0.5">{selectedCountry.flag} {selectedCountry.name}</p>
                    </div>
                  </div>
                </div>

                {/* Insight + Metric */}
                <div className="px-6 py-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Metric */}
                    <div className="flex-shrink-0 md:w-[140px] text-center md:text-left">
                      <p className="text-[32px] font-bold tracking-tight"
                        style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {result.metric}
                      </p>
                      <p className="text-[11.5px] text-[#bbb] mt-1 leading-snug">{result.metricLabel}</p>
                    </div>
                    
                    {/* Insight text */}
                    <div className="flex-1">
                      <p className="text-[14.5px] text-[#444] leading-[1.75]">{result.insight}</p>
                      <button onClick={() => navigate("/auth?mode=signup")}
                        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-[13px] font-medium transition-all hover:shadow-[0_4px_12px_rgba(38,146,220,0.2)] active:scale-[0.98]"
                        style={{ background: ACCENT_GRADIENT }}>
                        Empezar gratis con tu {result.businessType} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   7. Beneficios / Funcionalidades
   ═══════════════════════════════════════════════════════════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: Sparkles, title: "Briefing diario", desc: "Resumen con métricas, alertas y prioridades cada mañana.", color: "#2692DC" },
    { icon: Target, title: "Misiones accionables", desc: "Pasos concretos con definición de éxito y deadline.", color: "#746CE6" },
    { icon: TrendingUp, title: "Radar de oportunidades", desc: "Tendencias, riesgos y oportunidades de tu industria.", color: "#2692DC" },
    { icon: BarChart3, title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu negocio.", color: "#746CE6" },
    { icon: Brain, title: "Predicciones", desc: "Escenarios a 7, 14 y 30 días basados en tus datos.", color: "#2692DC" },
    { icon: Shield, title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Datos aislados.", color: "#746CE6" },
  ];

  return (
    <section className="py-28 lg:py-32 px-6 bg-white">
      <div className="max-w-[1040px] mx-auto">
        <Reveal>
          <div className="text-center mb-3">
            <AccentLabel>FUNCIONALIDADES</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Empezá cada día sabiendo qué importa
            </h2>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <p className="text-center text-[15px] text-[#999] mt-4 mb-16 max-w-[440px] mx-auto leading-[1.7]">
            Un sistema completo que trabaja para vos las 24 horas, los 7 días.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="rounded-2xl border border-[#eeeeee] bg-[#fafafa] p-7 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-[#e0e0e0] hover:-translate-y-1 transition-all duration-400 h-full group cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}10` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[14.5px] font-semibold text-[#111] mb-2.5">{f.title}</h3>
                <p className="text-[13px] text-[#999] leading-[1.7]">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   8. Diferenciación
   ═══════════════════════════════════════════════════════════════ */
const Differentiation = () => {
  const comparisons = [
    { vs: "IA genérica", problem: "Respuestas generales sin contexto de tu negocio", solution: "VISTACEO aprende tu operación, tus números y tus objetivos específicos." },
    { vs: "Herramientas dispersas", problem: "Información fragmentada en múltiples apps", solution: "Todo centralizado en un sistema que conecta métricas, acciones y resultados." },
    { vs: "Intuición pura", problem: "Decisiones basadas en sensación, no en datos", solution: "Análisis continuo con recomendaciones respaldadas por tus propios datos." },
  ];

  return (
    <section className="py-24 lg:py-28 px-6 bg-[#fafafa]">
      <div className="max-w-[860px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>POR QUÉ VISTACEO</AccentLabel>
            <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mt-5">
              No es un chatbot. No es un dashboard genérico.
            </h2>
            <p className="text-[14.5px] text-[#999] mt-4 max-w-[460px] mx-auto leading-[1.7]">
              VISTACEO es un sistema de inteligencia ejecutiva que piensa con la lógica de tu negocio.
            </p>
          </div>
        </Reveal>

        <div className="space-y-4">
          {comparisons.map((c, i) => (
            <Reveal key={c.vs} delay={i * 80}>
              <div className="rounded-xl border border-[#eee] bg-white p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-8">
                  <div className="lg:w-[240px] flex-shrink-0">
                    <p className="text-[12px] font-semibold text-[#ccc] uppercase tracking-[0.1em] mb-1.5">vs. {c.vs}</p>
                    <p className="text-[13px] text-[#999] leading-[1.6]">{c.problem}</p>
                  </div>
                  <div className="hidden lg:block w-px bg-[#f0f0f0] self-stretch" />
                  <div className="flex-1 flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2692DC" }} />
                    <p className="text-[14px] text-[#333] leading-[1.65] font-medium">{c.solution}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   8b. Competencia — Análisis competitivo
   ═══════════════════════════════════════════════════════════════ */
const CompetitorSection = () => {
  const rows = [
    { feature: "Análisis personalizado por industria", vistaceo: true, generic: false, sheets: false, consultant: "partial" },
    { feature: "Misiones accionables diarias", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Radar de oportunidades y riesgos", vistaceo: true, generic: false, sheets: false, consultant: "partial" },
    { feature: "Predicciones a 7, 14 y 30 días", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Briefing ejecutivo automático", vistaceo: true, generic: false, sheets: false, consultant: false },
    { feature: "Aprende de tu negocio en tiempo real", vistaceo: true, generic: false, sheets: false, consultant: "partial" },
    { feature: "Costo mensual accesible", vistaceo: true, generic: true, sheets: true, consultant: false },
    { feature: "Disponible 24/7 sin esperas", vistaceo: true, generic: true, sheets: true, consultant: false },
  ];

  const renderCell = (val: boolean | string) => {
    if (val === true) return <Check className="w-4 h-4 mx-auto" style={{ color: "#2692DC" }} />;
    if (val === "partial") return <span className="text-[11px] text-[#bbb] block text-center">Parcial</span>;
    return <X className="w-3.5 h-3.5 mx-auto text-[#ddd]" />;
  };

  return (
    <section id="comparativa" className="hidden lg:block py-24 lg:py-28 px-6 bg-white">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>COMPARATIVA</AccentLabel>
            <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mt-5">
              VISTACEO vs. las alternativas
            </h2>
            <p className="text-[14.5px] text-[#999] mt-4 max-w-[460px] mx-auto leading-[1.7]">
              Descubrí por qué un sistema de inteligencia ejecutiva supera a las herramientas genéricas.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          {/* === Mobile (cards apiladas) === */}
          <div className="sm:hidden space-y-4">
            {rows.map((row, i) => (
              <div key={i} className="rounded-2xl border border-[#eee] bg-white p-5">
                <p className="text-[14px] font-medium text-[#0a0a0a] mb-4 leading-snug">
                  {row.feature}
                </p>
                <div className="grid grid-cols-2 gap-2.5 auto-rows-fr">
                  {[
                    { label: "VISTACEO", val: row.vistaceo, brand: true },
                    { label: "IA genérica", val: row.generic },
                    { label: "Planillas", val: row.sheets },
                    { label: "Consultor", val: row.consultant },
                  ].map((c, j) => (
                    <div
                      key={j}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 border min-h-[44px]",
                        c.brand
                          ? "border-[#2692DC]/25 bg-[#2692DC]/[0.04]"
                          : "border-[#f0f0f0] bg-[#fafafa]"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-medium leading-tight whitespace-nowrap",
                          c.brand ? "text-[#2692DC]" : "text-[#888]"
                        )}
                      >
                        {c.label}
                      </span>
                      <span className="flex items-center justify-center min-w-[20px] shrink-0">
                        {renderCell(c.val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* === Desktop / Tablet (tabla) === */}
          <div className="hidden sm:block rounded-2xl border border-[#eee] overflow-hidden bg-[#fafafa]">
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 border-b border-[#eee] bg-white">
              <div className="col-span-1 p-4" />
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <img src="/favicon.png" alt="VISTACEO" className="w-6 h-6 mx-auto mb-1.5 object-contain" />
                <p className="text-[11px] font-bold tracking-[0.05em]" style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VISTACEO</p>
              </div>
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <p className="text-[11px] font-semibold text-[#bbb] mt-1">IA genérica</p>
                <p className="text-[9px] text-[#ddd]">ChatGPT, etc.</p>
              </div>
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <p className="text-[11px] font-semibold text-[#bbb] mt-1">Planillas</p>
                <p className="text-[9px] text-[#ddd]">Excel, Sheets</p>
              </div>
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <p className="text-[11px] font-semibold text-[#bbb] mt-1">Consultor</p>
                <p className="text-[9px] text-[#ddd]">Tradicional</p>
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div key={i} className={cn("grid grid-cols-5 gap-0 border-b border-[#f0f0f0] last:border-0", i % 2 === 0 ? "bg-white" : "bg-[#fafafa]")}>
                <div className="p-4 flex items-center">
                  <p className="text-[12.5px] text-[#555]">{row.feature}</p>
                </div>
                <div className="p-4 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.vistaceo)}</div>
                <div className="p-4 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.generic)}</div>
                <div className="p-4 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.sheets)}</div>
                <div className="p-4 flex items-center justify-center border-l border-[#f0f0f0]">{renderCell(row.consultant)}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   9. Testimonios — minimalistas, hiper-realistas
   ═══════════════════════════════════════════════════════════════ */
const TestimonialsSection = () => {
  const items = [
    {
      quote:
        "Lo abro a la mañana con el café. Me dice qué mover hoy y por qué. Bajé el descarte y los sábados rinden bastante mejor.",
      initials: "MR",
      name: "Martín R.",
      role: "Dueño de parrilla",
      location: "Córdoba, Argentina",
      rating: 5.0,
    },
    {
      quote:
        "Antes decidía a ojo. Ahora veo qué prendas dejan margen real y cuáles solo hacen ruido. Me ordenó la cabeza.",
      initials: "CM",
      name: "Carolina M.",
      role: "Boutique de ropa",
      location: "Ciudad de México, México",
      rating: 4.9,
    },
    {
      quote:
        "Me marcó que estaba perdiendo pacientes en el seguimiento. Cambiamos dos cosas chicas y se notó al mes.",
      initials: "DF",
      name: "Diego F.",
      role: "Consultorio odontológico",
      location: "Santiago, Chile",
      rating: 5.0,
    },
    {
      quote:
        "No es magia, hay que hacer el trabajo. Pero te ahorra horas de mirar planillas sin saber por dónde empezar.",
      initials: "LF",
      name: "Lucía F.",
      role: "Hostal boutique",
      location: "Montevideo, Uruguay",
      rating: 4.8,
    },
    {
      quote:
        "Me ayudó a entender por qué la tarde se caía. Subí el ticket promedio sin tocar precios, solo cambiando el menú visible.",
      initials: "RG",
      name: "Roberto G.",
      role: "Cafetería de especialidad",
      location: "Bogotá, Colombia",
      rating: 4.9,
    },
    {
      quote:
        "Lo más útil fue darme cuenta de dónde venían mis mejores clientes. Dejé de gastar en lo que no funcionaba.",
      initials: "PM",
      name: "Patricia M.",
      role: "Estudio jurídico",
      location: "Lima, Perú",
      rating: 5.0,
    },
  ];

  // Carrusel: 1 card en mobile, 2 en sm, 3 en lg
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const maxIndex = Math.max(0, items.length - perView);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [maxIndex, paused]);

  useEffect(() => {
    if (index > maxIndex) setIndex(0);
  }, [maxIndex, index]);

  const StarRow = ({ rating }: { rating: number }) => {
    const clamped = Math.max(0, Math.min(5, rating));
    return (
      <div className="flex items-center gap-2 mb-4" aria-label={`${rating.toFixed(1)} de 5`}>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => {
            const fill = Math.max(0, Math.min(1, clamped - i)) * 100;
            const gid = `star-grad-${i}-${Math.round(fill)}`;
            return (
              <svg key={i} viewBox="0 0 20 20" className="w-3.5 h-3.5">
                <defs>
                  <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
                    <stop offset={`${fill}%`} stopColor="#f59e0b" />
                    <stop offset={`${fill}%`} stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z"
                  fill={`url(#${gid})`}
                />
              </svg>
            );
          })}
        </div>
        <span className="text-[12px] font-semibold text-[#444] tabular-nums">
          {rating.toFixed(1)}
        </span>
        <span className="text-[11px] text-[#999]">/ 5</span>
      </div>
    );
  };

  const slideWidth = 100 / perView;
  const translatePct = -(index * slideWidth);
  const totalSlides = items.length;

  return (
    <section className="relative bg-white py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#2692DC]/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-[#746CE6]/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="text-center max-w-2xl md:max-w-4xl mx-auto mb-14 sm:mb-16">
            <span className="inline-block text-[12px] font-medium text-[#2692DC] mb-4 px-3 py-1 rounded-full bg-[#2692DC]/10 border border-[#2692DC]/15 tracking-wide uppercase">
              Lo que dicen quienes lo usan
            </span>
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-semibold tracking-[-0.025em] text-[#0a0a0a] leading-[1.1]">
              Dueños reales,{" "}
              <span className="bg-clip-text text-transparent bg-[linear-gradient(135deg,#2692DC,#746CE6)]">
                decisiones más claras
              </span>
            </h2>
            <p className="mt-4 text-[15px] sm:text-[16px] text-[#666] leading-relaxed md:whitespace-nowrap">
              Sin filtros ni promesas mágicas. Comentarios cortos de personas que abren la app antes de empezar el día.
            </p>
          </div>
        </Reveal>

        {/* Carrusel */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(${translatePct}%)` }}
          >
            {items.map((t, i) => (
              <div
                key={i}
                className="shrink-0 px-2.5 sm:px-3"
                style={{ width: `${slideWidth}%` }}
              >
                <figure className="h-full bg-white border border-[#ececec] rounded-2xl p-6 sm:p-7 hover:border-[#2692DC]/30 hover:shadow-[0_8px_30px_rgba(38,146,220,0.06)] transition-all duration-300 flex flex-col">
                  <StarRow rating={t.rating} />
                  <blockquote className="text-[15px] leading-relaxed text-[#222] flex-1">
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-[#f0f0f0]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12.5px] font-semibold shrink-0 bg-[linear-gradient(135deg,#2692DC,#746CE6)]">
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[#0a0a0a] text-[14px] truncate">{t.name}</div>
                      <div className="text-[12.5px] text-[#777] truncate">
                        {t.role} · {t.location}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-6 bg-[#2692DC]" : "w-1.5 bg-[#d4d4d4] hover:bg-[#999]"
              )}
            />
          ))}
        </div>

        <p className="text-center text-[12px] text-[#999] mt-10 max-w-xl mx-auto">
          {totalSlides}+ testimonios reales en Latinoamérica. Editados levemente por extensión y privacidad — los nombres de los negocios no se publican.
        </p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   10. Precios
   ═══════════════════════════════════════════════════════════════ */
const PricingSection = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);
  const { country, monthlyPrice, yearlyPrice, yearlySavings, formatCurrencyShort, isDetecting, setCountryOverride, detectedCountryCode } = useCountryDetection();
  const [userChangedCountry, setUserChangedCountry] = useState(false);

  const savings = yearlySavings();
  const monthlyEquivalent = yearlyPrice % 12 === 0 ? yearlyPrice / 12 : Math.floor(yearlyPrice / 12);

  const handleCountryChange = (code: CountryCode) => {
    setUserChangedCountry(true);
    setCountryOverride(code);
  };

  // Sólo mostramos mensaje "Detectamos X país" si NO ha cambiado manualmente
  // Una vez tocado, asumimos que el usuario sabe lo que eligió
  const showDetectionMessage = !userChangedCountry && !localStorage.getItem('selectedCountryCode');

  const freeFeatures = [
    "Dashboard de salud del negocio",
    "Briefing diario con prioridades",
    "3 misiones estratégicas por mes",
    "5 señales Radar por mes",
    "Análisis base de tu industria",
    "Sin chat IA ilimitado",
    "Sin predicciones avanzadas",
  ];

  const proFeatures = [
    "Todo del plan Gratis",
    "Chat ejecutivo con IA ilimitado",
    "Misiones avanzadas ilimitadas",
    "Predicciones a 7, 14 y 30 días",
    "Analíticas profundas",
    "Análisis de fotos y documentos",
    "Gemelo Digital predictivo",
    "Análisis de Competencia",
    "Insights avanzados",
    "Métricas y evolución",
    "Integraciones premium",
    "Soporte prioritario 24/7",
  ];

  return (
    <section id="precios" className="py-20 md:py-28 lg:py-32 px-4 sm:px-6 bg-white">
      <div className="max-w-[840px] mx-auto">
        <Reveal>
          <div className="text-center mb-10 md:mb-14">
            <AccentLabel>PRECIOS</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Empezá gratis. Crecé cuando lo necesites.
            </h2>
            <p className="text-[14.5px] text-[#999] mt-4 max-w-[400px] mx-auto leading-[1.7]">
              Sin compromisos. Sin tarjeta de crédito. Cancelá cuando quieras.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Free */}
          <Reveal delay={0}>
            <div className="rounded-2xl border border-[#eee] bg-[#fafafa] p-6 md:p-8 h-full flex flex-col">
              <p className="text-[12px] font-semibold text-[#999] uppercase tracking-[0.12em]">Gratis</p>
              <div className="mt-3 mb-6">
                <span className="text-[32px] md:text-[36px] font-bold text-[#111]">$0</span>
                <span className="text-[14px] text-[#999] ml-1">/ siempre</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#666]">
                    <Check className="w-4 h-4 text-[#28c840] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/auth?mode=signup")}
                className="w-full py-3.5 rounded-xl text-[14px] font-medium border border-[#ddd] text-[#333] hover:bg-[#f5f5f5] hover:border-[#ccc] transition-all duration-300">
                Empezar gratis
              </button>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={100}>
            <div className="rounded-2xl border-2 p-6 md:p-8 h-full flex flex-col relative overflow-hidden"
              style={{ borderImage: `${ACCENT_GRADIENT} 1` }}>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold text-white tracking-wider"
                style={{ background: ACCENT_GRADIENT }}>
                RECOMENDADO
              </div>

              {/* Header con label + selector de país compacto */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] pt-1"
                  style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Pro
                </p>
                <div className="flex items-center gap-1.5 rounded-full border border-[#e8edf3] bg-[#f8fbfe] px-2.5 py-1.5">
                  <span className="text-[14px] leading-none">{country.flag}</span>
                  <select
                    aria-label="Cambiar país"
                    value={country.code === "DEFAULT" ? "AR" : country.code}
                    onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                    className="bg-transparent text-[11.5px] font-medium text-[#333] outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
                  >
                    {Object.entries(COUNTRY_CONFIG)
                      .filter(([c]) => c !== "DEFAULT")
                      .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                      .map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Toggle Mensual/Anual */}
              <div className="mb-5 inline-flex rounded-xl border border-[#e8edf3] bg-[#f8fbfe] p-1 self-start">
                <button onClick={() => setIsYearly(true)} className={cn("px-3 py-2 rounded-lg text-[12px] font-semibold transition-all", isYearly ? "bg-white text-[#111] shadow-sm" : "text-[#888]")}>Anual</button>
                <button onClick={() => setIsYearly(false)} className={cn("px-3 py-2 rounded-lg text-[12px] font-semibold transition-all", !isYearly ? "bg-white text-[#111] shadow-sm" : "text-[#888]")}>Mensual</button>
              </div>

              {/* Precio */}
              <div className="mb-6">
                <div className="flex items-end gap-2 flex-wrap">
                  <span className="text-[34px] md:text-[40px] font-bold text-[#111] leading-none">{formatCurrencyShort(isYearly ? monthlyEquivalent : monthlyPrice)}</span>
                  <span className="text-[13.5px] text-[#999] mb-1">{country.currency} / mes</span>
                </div>
                {isYearly && (
                  <p className="text-[12.5px] text-[#777] mt-2">
                    Pago anual: <span className="font-medium text-[#444]">{formatCurrencyShort(yearlyPrice)} {country.currency}</span>
                  </p>
                )}
                <p className="text-[12px] text-[#2692DC] mt-1.5 font-semibold">
                  {isYearly ? `${savings.percentage}% de ahorro frente al plan mensual` : "Plan mensual flexible · sin permanencia"}
                </p>

                {/* Mensaje de detección — sólo si auto-detectado y no fue cambiado manualmente */}
                {showDetectionMessage && !isDetecting && (
                  <p className="text-[11.5px] text-[#999] mt-3 leading-[1.55]">
                    Detectamos {country.flag} <span className="font-medium text-[#666]">{country.name}</span>. El checkout usará esta moneda y el medio de pago correcto. Podés cambiarlo arriba.
                  </p>
                )}
                {isDetecting && (
                  <p className="text-[11.5px] text-[#bbb] mt-3">Detectando tu país...</p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#666]">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2692DC" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(`/checkout?plan=${isYearly ? "pro_yearly" : "pro_monthly"}&country=${country.code}`)}
                className="w-full py-3.5 rounded-xl text-[14px] font-medium text-white transition-all duration-300 hover:shadow-[0_8px_24px_rgba(38,146,220,0.25)] active:scale-[0.98]"
                style={{ background: ACCENT_GRADIENT }}>
                Activar Pro
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <p className="text-center text-[12.5px] text-[#bbb] mt-8 px-4">
            El plan anual está preseleccionado porque maximiza el ahorro real. Si ya tenés cuenta, seguís directo; si no, la creás en el checkout y el Pro queda asociado.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   11. Seguridad y privacidad
   ═══════════════════════════════════════════════════════════════ */
const SecuritySection = () => (
  <section className="py-20 lg:py-24 px-6 bg-[#fafafa]">
    <div className="max-w-[800px] mx-auto">
      <Reveal>
        <div className="rounded-2xl border border-[#eee] bg-white p-8 lg:p-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: ACCENT_GRADIENT_SUBTLE }}>
              <Lock className="w-6 h-6" style={{ color: "#2692DC" }} />
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#111] mb-3">Seguridad y privacidad empresarial</h3>
              <p className="text-[14px] text-[#888] leading-[1.75] mb-5">
                VISTACEO implementa encriptación de nivel empresarial en tránsito y en reposo. Tus datos nunca se comparten con terceros ni se utilizan para entrenar modelos de inteligencia artificial externos. Cada negocio opera en un entorno aislado con controles de acceso estrictos.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Encriptación AES-256", "Datos aislados", "Sin venta a terceros", "Cumplimiento RGPD"].map(tag => (
                  <span key={tag} className="text-[11.5px] text-[#999] bg-[#f5f5f5] px-3 py-1.5 rounded-lg border border-[#eee]">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   12. Preguntas frecuentes
   ═══════════════════════════════════════════════════════════════ */
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Para qué tipo de negocios sirve VISTACEO?", a: "Para cualquier negocio, empresa o servicio profesional. Restaurantes, clínicas, estudios, agencias, comercios, freelancers, startups y más. VISTACEO se adapta a las particularidades de cada industria." },
    { q: "¿Cómo aprende de mi negocio?", a: "Mediante preguntas inteligentes sobre tu operación, clientes, finanzas y objetivos. Cuanto más interactuás, más preciso se vuelve. Es un sistema que evoluciona con vos." },
    { q: "¿Qué son las misiones?", a: "Son acciones concretas que el sistema genera basándose en el análisis de tu negocio. Cada misión tiene pasos claros, definición de éxito y deadline." },
    { q: "¿Mis datos están seguros?", a: "Sí. Usamos encriptación de nivel empresarial. Tus datos nunca se comparten con terceros ni se usan para entrenar modelos externos. Cada cuenta opera en un entorno aislado." },
    { q: "¿Puedo empezar gratis?", a: "Sí. Podés empezar gratis sin tarjeta de crédito y acceder a las funciones básicas del sistema durante el tiempo que necesites. Sin vencimiento." },
    { q: "¿Cómo funciona el pago?", a: "El plan Pro se cobra mensualmente en USD. Podés pagar con tarjeta de crédito o débito. La facturación es automática y podés cancelar en cualquier momento." },
    { q: "¿Puedo cancelar cuando quiera?", a: "Sí. No hay contratos ni permanencia mínima. Podés cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta." },
    { q: "¿Qué diferencia a VISTACEO de otras herramientas?", a: "VISTACEO no es un chatbot genérico ni un dashboard estático. Es un sistema de inteligencia ejecutiva que aprende tu negocio, detecta prioridades y genera acciones concretas adaptadas a tu contexto real." },
  ];

  return (
    <section id="faq" className="py-28 lg:py-32 px-6 bg-white">
      <div className="max-w-[620px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <AccentLabel>PREGUNTAS FRECUENTES</AccentLabel>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mt-5">
              Todo lo que necesitás saber
            </h2>
            <p className="text-[14px] text-[#999] mt-4 leading-[1.7]">
              ¿Algo más? Escribinos a <a href="mailto:info@vistaceo.com" className="underline hover:text-[#666] transition-colors">info@vistaceo.com</a>
            </p>
          </div>
        </Reveal>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="rounded-xl border border-[#eee] bg-[#fafafa] overflow-hidden hover:border-[#e0e0e0] transition-colors">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f5f5f5] transition-colors bg-transparent">
                  <span className="text-[14px] font-medium text-[#222] pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform duration-400", open === i && "rotate-180 text-[#999]")} />
                </button>
                <div className="overflow-hidden transition-all duration-500 ease-out"
                  style={{ maxHeight: open === i ? "200px" : "0px" }}>
                  <p className="px-6 pb-5 text-[13.5px] text-[#888] leading-[1.75]">{faq.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   13. CTA final
   ═══════════════════════════════════════════════════════════════ */
const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 lg:py-32 px-6 bg-[#fafafa] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(38,146,220,0.08), transparent 70%)" }}
      />
      <Reveal>
        <div className="text-center relative z-10 max-w-[560px] mx-auto">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mb-4">
            Tu negocio merece decisiones con más claridad
          </h2>
          <p className="text-[15px] text-[#999] mb-8 leading-[1.7]">
            Empezá gratis y descubrí cómo VISTACEO puede transformar la forma en que tomás decisiones.
          </p>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="text-white px-10 py-4 rounded-xl text-[14.5px] font-medium transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-[0_12px_32px_rgba(38,146,220,0.2)] active:scale-[0.98] hover:-translate-y-0.5"
            style={{ background: ACCENT_GRADIENT }}>
            Empezar gratis <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[12px] text-[#ccc] mt-5 flex items-center justify-center gap-4">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sin tarjeta de crédito</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Activo en minutos</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   14. Footer premium
   ═══════════════════════════════════════════════════════════════ */
const PremiumFooter = memo(() => {
  const scrollTo = (href: string) => {
    if (href.startsWith("http")) { window.open(href, "_blank"); return; }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-[#f0f0f0] py-16 px-6 bg-white">
      <div className="max-w-[1040px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/favicon.png" alt="" className="w-6 h-6 object-contain" />
              <span className="text-[14px] font-semibold tracking-[0.12em] text-[#111]">VISTACEO</span>
            </div>
            <p className="text-[12.5px] text-[#999] leading-[1.7] max-w-[220px]">
              Inteligencia ejecutiva que centraliza información, detecta prioridades y genera acciones concretas para tu negocio.
            </p>
          </div>

          {/* Producto */}
          <div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.12em] mb-4">Producto</p>
            <ul className="space-y-2.5">
              {[
                { label: "Cómo funciona", href: "#como-funciona" },
                { label: "Precios", href: "#precios" },
                { label: "Comparativa", href: "#comparativa" },
              ].map(l => (
                <li key={l.label}>
                  <button onClick={() => scrollTo(l.href)} className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors bg-transparent">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.12em] mb-4">Recursos</p>
            <ul className="space-y-2.5">
              <li><a href="https://blog.vistaceo.com" target="_blank" rel="noopener noreferrer" className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors">Blog</a></li>
              <li><button onClick={() => scrollTo("#faq")} className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors bg-transparent">Preguntas frecuentes</button></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.12em] mb-4">Soporte</p>
            <ul className="space-y-2.5">
              <li><a href="mailto:info@vistaceo.com" className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors">Contacto</a></li>
              <li><a href="mailto:soporte@vistaceo.com" className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors">Soporte técnico</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.12em] mb-4">Legal</p>
            <ul className="space-y-2.5">
              <li><a href="/condiciones" className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors">Términos y condiciones</a></li>
              <li><a href="/politicas" className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors">Política de privacidad</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#f5f5f5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11.5px] text-[#ddd]">© 2026 VISTACEO. Todos los derechos reservados.</span>
          <a href="mailto:info@vistaceo.com" className="text-[11.5px] text-[#ddd] hover:text-[#999] transition-colors flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> info@vistaceo.com
          </a>
        </div>
      </div>
    </footer>
  );
});
PremiumFooter.displayName = "PremiumFooter";

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function LandingMinimalista() {
  return (
    <>
      <SiteHead
        title="VISTACEO — Inteligencia ejecutiva para tu negocio"
        description="Centralizá la información de tu negocio, detectá prioridades y recibí acciones concretas cada día. Empezá gratis."
        path="/"
      />

      <div className="landing-mobile-perf min-h-screen bg-white text-[#1a1a1a] antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        <Header />
        <HeroSection />
        <div className="lp-section"><TrustStrip /></div>

        <div className="lp-section"><CapabilitiesShowcase /></div>
        <div className="lp-section"><ProductShowcase /></div>
        <div className="lp-section"><CompetitorSection /></div>
        <div className="lp-section"><TestimonialsSection /></div>
        <div className="lp-section"><PricingSection /></div>
        <div className="lp-section"><SecuritySection /></div>
        <div className="lp-section"><FAQSection /></div>
        <div className="lp-section"><FinalCTA /></div>
        <PremiumFooter />
      </div>

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .animate-scroll-x {
          animation: scroll-x 35s linear infinite;
        }
      `}</style>
    </>
  );
}
