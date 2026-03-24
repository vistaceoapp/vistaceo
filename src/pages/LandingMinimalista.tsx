import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Check, TrendingUp, Target, Zap, BarChart3, Shield, Brain, Sparkles, Heart, MessageCircle, Eye, Radar, Lock, Clock, Users, CheckCircle2, ArrowUpRight, Globe, Mail } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";
import { motion, AnimatePresence } from "framer-motion";

// Import REAL mockup components
import { MockupProDashboard } from "@/components/landing/mockups/MockupProDashboard";
import { MockupProMissions } from "@/components/landing/mockups/MockupProMissions";
import { MockupProRadar } from "@/components/landing/mockups/MockupProRadar";
import { MockupProChat } from "@/components/landing/mockups/MockupProChat";
import { MockupProAnalytics } from "@/components/landing/mockups/MockupProAnalytics";
import { MockupProPredictions } from "@/components/landing/mockups/MockupProPredictions";

import type { BusinessKey } from "@/components/landing/mockups/MockupProDashboard";

import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=400&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=400&format=webp";
import marketingImg from "@/assets/business-types/marketing-digital.jpg?w=400&format=webp";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg?w=400&format=webp";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Minimalist Landing — Ultra-Premium v3
   ═══════════════════════════════════════════════════════════════ */

const ACCENT_GRADIENT = "linear-gradient(135deg, #2692DC, #746CE6)";
const ACCENT_GRADIENT_SUBTLE = "linear-gradient(135deg, rgba(38,146,220,0.08), rgba(116,108,230,0.08))";

/* ── Scroll Reveal ── */
const Reveal = memo(({ children, className, delay = 0, distance = 40 }: { 
  children: React.ReactNode; className?: string; delay?: number; distance?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { 
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } 
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={cn("transition-all ease-out", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >{children}</div>
  );
});
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
  { label: "Cómo funciona", href: "#como-funciona" },
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "bg-white/92 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]" : "bg-transparent"
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
        "md:hidden overflow-hidden transition-all duration-500 bg-white/98 backdrop-blur-2xl border-t border-[#f5f5f5]",
        mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
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

/* ═══════════════════════════════════════════════════════════════
   2. Hero
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-10 lg:pt-36 lg:pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(165deg, rgba(38,146,220,0.04) 0%, rgba(255,255,255,1) 45%, rgba(116,108,230,0.03) 100%)"
      }} />

      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* Left: Text */}
        <div className="flex-shrink-0 w-full lg:w-[440px] lg:pr-8">
          <Reveal distance={30}>
            <AccentLabel>INTELIGENCIA EJECUTIVA PARA TU NEGOCIO</AccentLabel>
          </Reveal>

          <Reveal delay={80} distance={30}>
            <h1 className="text-[clamp(2.2rem,5vw,3.2rem)] font-semibold text-[#0a0a0a] leading-[1.08] tracking-[-0.03em] mt-5">
              Centralizá la información, detectá prioridades,{" "}
              <span style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                decidí mejor cada día.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={150} distance={25}>
            <p className="text-[15.5px] text-[#777] mt-7 leading-[1.85] max-w-[380px]">
              VISTACEO reúne toda la inteligencia de tu negocio, aprende tus objetivos y genera acciones concretas que mueven la aguja. Para restaurantes, clínicas, agencias, comercios y más.
            </p>
          </Reveal>

          <Reveal delay={220} distance={20}>
            <div className="flex items-center gap-3 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")}
                className="text-white px-7 py-3.5 rounded-[12px] text-[14px] font-medium transition-all duration-300 flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(38,146,220,0.2)] active:scale-[0.98] hover:-translate-y-0.5"
                style={{ background: ACCENT_GRADIENT }}>
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => {
                const el = document.querySelector("#producto");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
                className="text-[14px] text-[#888] hover:text-[#111] px-5 py-3.5 rounded-[12px] transition-colors border border-[#eee] hover:border-[#ddd]">
                Conocer la plataforma
              </button>
            </div>
            <p className="text-[12px] text-[#bbb] mt-4 flex items-center gap-3">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Activo en minutos</span>
            </p>
          </Reveal>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="flex-1 relative w-full max-w-[740px]">
          <Reveal delay={250} distance={50}>
            <div className="relative">
              <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f2f2f2] bg-[#fafafa]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-8">
                    <div className="h-5 rounded-md bg-[#f0f0f0] max-w-[200px] mx-auto flex items-center justify-center">
                      <span className="text-[9px] text-[#bbb]">app.vistaceo.com</span>
                    </div>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-hidden">
                  <MockupProDashboard business="argentina" />
                </div>
              </div>

              <NotifCard icon={<TrendingUp className="w-3 h-3" />} iconBg="bg-[#28c840]"
                name="Oportunidad detectada" text="Tus ventas de mediodía subieron 23%. Considerá extender el horario." time="Ahora"
                className="absolute -top-2 -right-4 lg:-right-8 z-20 hidden sm:flex" delay={600} />
              <NotifCard icon={<Target className="w-3 h-3" />} iconBg="bg-[#746CE6]"
                name="Misión completada" text="Campaña de retención: +12% clientes recurrentes este mes" time="1h"
                className="absolute top-[110px] -right-6 lg:-right-10 z-20 hidden sm:flex" delay={900} />
              <NotifCard icon={<Zap className="w-3 h-3" />} iconBg="bg-[#2692DC]"
                name="Alerta competitiva" text="Un competidor ajustó precios. Te preparamos una recomendación." time="2h"
                className="absolute top-[220px] -right-3 lg:-right-6 z-20 hidden sm:flex" delay={1200} />
            </div>
          </Reveal>
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
    <section className="py-14 px-6 bg-white border-y border-[#f5f5f5]">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Users className="w-4 h-4" style={{ color: "#2692DC" }} />
              <span><span className="font-bold text-[#111] text-[15px] tabular-nums">{counter}</span> negocios activos</span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#eee]" />
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Globe className="w-4 h-4" style={{ color: "#746CE6" }} />
              <span>Disponible en <span className="font-semibold text-[#555]">LATAM y España</span></span>
            </div>
            <div className="hidden sm:block w-px h-5 bg-[#eee]" />
            <div className="flex items-center gap-2 text-[13px] text-[#999]">
              <Shield className="w-4 h-4" style={{ color: "#2692DC" }} />
              <span>Datos <span className="font-semibold text-[#555]">encriptados</span></span>
            </div>
          </div>
        </Reveal>

        {/* Business types strip */}
        <Reveal delay={100}>
          <div className="mt-10 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex animate-scroll-x gap-14 items-center">
              {[...Array(3)].map((_, set) => (
                <div key={set} className="flex gap-14 items-center flex-shrink-0">
                  {["Restaurantes", "Clínicas", "Agencias", "Comercios", "Estudios", "Startups", "Freelancers", "Hoteles", "Consultorios", "Gimnasios", "Cafeterías", "Salones"].map(t => (
                    <span key={`${set}-${t}`} className="text-[13px] text-[#ddd] font-medium whitespace-nowrap">{t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   4. Cómo funciona
   ═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    { num: "01", title: "Centralizás el contexto", desc: "Respondés preguntas sobre tu negocio: objetivos, métricas, clientes, operación. VISTACEO construye un perfil inteligente.", icon: Brain },
    { num: "02", title: "VISTACEO detecta qué importa", desc: "El sistema analiza tu situación en tiempo real, identifica prioridades, oportunidades y riesgos específicos de tu industria.", icon: Radar },
    { num: "03", title: "Recibís acciones concretas", desc: "Cada día, misiones accionables con pasos claros, métricas de éxito y recomendaciones que podés ejecutar de inmediato.", icon: Target },
  ];

  return (
    <section id="como-funciona" className="py-28 lg:py-32 px-6 bg-[#fafafa]">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <AccentLabel>CÓMO FUNCIONA</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              De la información a la acción en tres pasos
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 100}>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl mx-auto md:mx-0 flex items-center justify-center mb-5"
                  style={{ background: ACCENT_GRADIENT_SUBTLE }}>
                  <s.icon className="w-5 h-5" style={{ color: "#2692DC" }} />
                </div>
                <p className="text-[11px] font-bold tracking-[0.15em] mb-2"
                  style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.num}
                </p>
                <h3 className="text-[16px] font-semibold text-[#111] mb-2.5">{s.title}</h3>
                <p className="text-[13.5px] text-[#999] leading-[1.7]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
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
] as const;
type TabKey = typeof mockupTabs[number]["key"];

const businesses: { key: BusinessKey; name: string; type: string; image: string }[] = [
  { key: "argentina", name: "Parrilla Don Martín", type: "Restaurante", image: parrillaImg },
  { key: "odontologia", name: "Clínica Dental Sonrisa", type: "Clínica", image: clinicaDentalImg },
  { key: "mexico", name: "Boutique Carmela", type: "Retail", image: boutiqueImg },
  { key: "marketing", name: "Rocket Digital", type: "Agencia", image: marketingImg },
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
   6. Casos de uso / Industrias
   ═══════════════════════════════════════════════════════════════ */
const Industries = () => {
  const industries = [
    { name: "Restaurantes", benefit: "Mejorá foco operativo, ticket promedio y recurrencia de clientes." },
    { name: "Clínicas y consultorios", benefit: "Ordená métricas de seguimiento, ocupación y satisfacción." },
    { name: "Agencias", benefit: "Priorizá pipeline, rentabilidad por cliente y ejecución." },
    { name: "Retail y comercios", benefit: "Entendé demanda, eficiencia y rendimiento por canal." },
    { name: "Servicios profesionales", benefit: "Tomá decisiones con más claridad y menos intuición." },
    { name: "Startups y freelancers", benefit: "Enfocate en lo que mueve la aguja con recursos limitados." },
  ];

  return (
    <section className="py-24 lg:py-28 px-6 bg-[#fafafa]">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>CASOS DE USO</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Se adapta a tu industria
            </h2>
            <p className="text-[14.5px] text-[#999] mt-4 max-w-[420px] mx-auto leading-[1.7]">
              VISTACEO entiende las particularidades de cada tipo de negocio y personaliza todo el sistema.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind, i) => (
            <Reveal key={ind.name} delay={i * 60}>
              <div className="rounded-xl border border-[#eee] bg-white p-6 hover:border-[#ddd] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 h-full">
                <h3 className="text-[14.5px] font-semibold text-[#111] mb-2">{ind.name}</h3>
                <p className="text-[13px] text-[#999] leading-[1.7]">{ind.benefit}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   7. Beneficios / Funcionalidades
   ═══════════════════════════════════════════════════════════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: Sparkles, title: "Briefing diario", desc: "Cada mañana, un resumen con métricas clave, alertas y acciones prioritarias ordenadas por impacto.", color: "#2692DC" },
    { icon: Target, title: "Misiones accionables", desc: "Pasos concretos con definición de éxito. No solo qué hacer, sino cómo y cuándo.", color: "#746CE6" },
    { icon: TrendingUp, title: "Radar de oportunidades", desc: "Detecta tendencias, riesgos y oportunidades específicas para tu industria.", color: "#2692DC" },
    { icon: BarChart3, title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu negocio. Las métricas que importan, sin ruido.", color: "#746CE6" },
    { icon: Brain, title: "Predicciones", desc: "Anticipá escenarios basados en patrones reales de tu negocio a 7, 14 y 30 días.", color: "#2692DC" },
    { icon: Shield, title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Tus datos nunca se comparten con terceros.", color: "#746CE6" },
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
    <section className="py-24 lg:py-28 px-6 bg-white">
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
          <div className="rounded-2xl border border-[#eee] overflow-hidden bg-[#fafafa]">
            {/* Header */}
            <div className="grid grid-cols-5 gap-0 border-b border-[#eee] bg-white">
              <div className="col-span-1 p-4" />
              <div className="p-4 text-center border-l border-[#f0f0f0]">
                <div className="w-5 h-5 rounded-md mx-auto mb-1.5 flex items-center justify-center" style={{ background: ACCENT_GRADIENT }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
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
   9. Testimonios (placeholder structure)
   ═══════════════════════════════════════════════════════════════ */
// Testimonials section ready — will be enabled when real testimonials are available

/* ═══════════════════════════════════════════════════════════════
   10. Precios
   ═══════════════════════════════════════════════════════════════ */
const PricingSection = () => {
  const navigate = useNavigate();

  const freeFeatures = [
    "Dashboard de salud del negocio",
    "Briefing diario con prioridades",
    "Misiones básicas",
    "Radar de oportunidades",
    "Análisis de tu industria",
  ];

  const proFeatures = [
    "Todo del plan Gratis",
    "Chat ejecutivo con IA ilimitado",
    "Misiones avanzadas ilimitadas",
    "Predicciones a 7, 14 y 30 días",
    "Analíticas profundas",
    "Análisis de fotos y documentos",
    "Soporte prioritario",
  ];

  return (
    <section id="precios" className="py-28 lg:py-32 px-6 bg-white">
      <div className="max-w-[840px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <AccentLabel>PRECIOS</AccentLabel>
            <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em] mt-5">
              Empezá gratis. Crecé cuando lo necesites.
            </h2>
            <p className="text-[14.5px] text-[#999] mt-4 max-w-[400px] mx-auto leading-[1.7]">
              Sin compromisos. Sin tarjeta de crédito. Cancelá cuando quieras.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free */}
          <Reveal delay={0}>
            <div className="rounded-2xl border border-[#eee] bg-[#fafafa] p-8 h-full flex flex-col">
              <p className="text-[12px] font-semibold text-[#999] uppercase tracking-[0.12em]">Gratis</p>
              <div className="mt-3 mb-6">
                <span className="text-[36px] font-bold text-[#111]">$0</span>
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
            <div className="rounded-2xl border-2 p-8 h-full flex flex-col relative overflow-hidden"
              style={{ borderImage: `${ACCENT_GRADIENT} 1` }}>
              <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-bold text-white tracking-wider"
                style={{ background: ACCENT_GRADIENT }}>
                RECOMENDADO
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em]"
                style={{ backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Pro
              </p>
              <div className="mt-3 mb-6">
                <span className="text-[36px] font-bold text-[#111]">$29</span>
                <span className="text-[14px] text-[#999] ml-1">USD / mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {proFeatures.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#666]">
                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#2692DC" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/auth?mode=signup&plan=pro_monthly")}
                className="w-full py-3.5 rounded-xl text-[14px] font-medium text-white transition-all duration-300 hover:shadow-[0_8px_24px_rgba(38,146,220,0.25)] active:scale-[0.98]"
                style={{ background: ACCENT_GRADIENT }}>
                Iniciar con Pro
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <p className="text-center text-[12.5px] text-[#bbb] mt-8">
            Facturación mensual. Podés cancelar en cualquier momento desde tu cuenta. También disponible plan anual con descuento.
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
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-[#f0f0f0] py-16 px-6 bg-white">
      <div className="max-w-[1040px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
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
                { label: "Funcionalidades", href: "#producto" },
                { label: "Precios", href: "#precios" },
              ].map(l => (
                <li key={l.label}>
                  <button onClick={() => scrollTo(l.href)} className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors bg-transparent">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.12em] mb-4">Soporte</p>
            <ul className="space-y-2.5">
              <li><button onClick={() => scrollTo("#faq")} className="text-[12.5px] text-[#bbb] hover:text-[#666] transition-colors bg-transparent">Preguntas frecuentes</button></li>
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
          <span className="text-[11.5px] text-[#ddd]">© 2025 VISTACEO. Todos los derechos reservados.</span>
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

      <div className="min-h-screen bg-white text-[#1a1a1a] antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        <Header />
        <HeroSection />
        <TrustStrip />
        <HowItWorks />
        <ProductShowcase />
        <Industries />
        <FeaturesGrid />
        <Differentiation />
        <PricingSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTA />
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
