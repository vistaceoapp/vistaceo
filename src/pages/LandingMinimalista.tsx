import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Check, TrendingUp, Target, Zap, BarChart3, Shield, Brain, Sparkles, Heart, MessageCircle, Eye, Radar } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";
import { motion, AnimatePresence } from "framer-motion";

// Import REAL mockup components from main landing
import { MockupProDashboard } from "@/components/landing/mockups/MockupProDashboard";
import { MockupProMissions } from "@/components/landing/mockups/MockupProMissions";
import { MockupProRadar } from "@/components/landing/mockups/MockupProRadar";
import { MockupProChat } from "@/components/landing/mockups/MockupProChat";
import { MockupProAnalytics } from "@/components/landing/mockups/MockupProAnalytics";
import { MockupProPredictions } from "@/components/landing/mockups/MockupProPredictions";

import type { BusinessKey } from "@/components/landing/mockups/MockupProDashboard";

// Import business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=400&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=400&format=webp";
import marketingImg from "@/assets/business-types/marketing-digital.jpg?w=400&format=webp";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg?w=400&format=webp";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Minimalist Landing — Ultra-Premium Kinso-Grade v2
   Real mockups · Interactive tabs · Kinso layout fidelity
   ═══════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════
   Header — Floating Kinso-style pill
   ═══════════════════════════════════════════════════════════════ */
const Header = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]" : "bg-transparent"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/minimalista")}>
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-[0.14em] text-[#111]">VISTACEO</span>
          </div>
          <div className="hidden md:block w-px h-5 bg-[#e5e5e5]" />
        </div>

        <nav className="hidden md:flex items-center gap-10 ml-10">
          {[
            { label: "Producto", href: "#producto" },
            { label: "Features", href: "#features" },
            { label: "FAQs", href: "#faq" },
          ].map(link => (
            <a key={link.label} href={link.href}
              className="text-[13.5px] text-[#888] hover:text-[#111] transition-colors duration-300 relative group">
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#111] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <button onClick={() => navigate("/auth")}
            className="text-[13.5px] text-[#666] hover:text-[#111] transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-[#f8f8f8]">
            Login
          </button>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="text-[13.5px] bg-[#111] text-white px-5 py-2.5 rounded-[10px] font-medium hover:bg-[#222] transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98]">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden ml-auto p-2 hover:bg-[#f8f8f8] rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>
      </div>

      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-500 bg-white/98 backdrop-blur-2xl border-t border-[#f5f5f5]",
        mobileOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-5 space-y-1">
          {["Producto", "Features", "FAQs"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="block text-[15px] text-[#444] py-3 border-b border-[#f5f5f5] last:border-0" onClick={() => setMobileOpen(false)}>
              {item}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-2.5">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[15px] text-[#666] py-2.5 text-left">Login</button>
            <button onClick={() => { navigate("/auth?mode=signup"); setMobileOpen(false); }} className="text-[15px] bg-[#111] text-white px-5 py-3.5 rounded-xl font-medium w-full">Get Started</button>
          </div>
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

/* ═══════════════════════════════════════════════════════════════
   Notification Cards — Kinso-style floating alerts
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
   Hero — Split layout with REAL Dashboard mockup + floating notifs
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 pb-10 lg:pt-36 lg:pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(165deg, rgba(255,235,218,0.45) 0%, rgba(255,255,255,1) 50%, rgba(230,242,255,0.3) 100%)"
      }} />
      <div className="absolute top-[20%] right-[25%] w-[700px] h-[700px] rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(circle, rgba(232,113,74,0.06), transparent 70%)" }} 
      />

      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-0">
        {/* Left: Text */}
        <div className="flex-shrink-0 w-full lg:w-[420px] lg:pr-8">
          <Reveal distance={30}>
            <h1 className="text-[clamp(2.6rem,5.5vw,3.6rem)] font-semibold text-[#0a0a0a] leading-[1.04] tracking-[-0.03em]">
              Un cerebro,
            </h1>
            <h1 className="text-[clamp(2.6rem,5.5vw,3.6rem)] font-semibold text-[#0a0a0a] leading-[1.04] tracking-[-0.03em]">
              cada decisión.
            </h1>
          </Reveal>

          <Reveal delay={120} distance={25}>
            <p className="text-[15.5px] text-[#777] mt-7 leading-[1.85] max-w-[370px]">
              VISTACEO reúne toda la inteligencia de tu negocio. Aprende tus objetivos, entiende qué importa más, y genera acciones que mueven la aguja cada día.
            </p>
          </Reveal>

          <Reveal delay={200} distance={20}>
            <div className="flex items-center gap-3 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")}
                className="bg-[#111] text-white px-7 py-3.5 rounded-[12px] text-[14px] font-medium hover:bg-[#222] transition-all duration-300 flex items-center gap-2 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98] hover:-translate-y-0.5">
                Empezar gratis <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/auth")}
                className="text-[14px] text-[#888] hover:text-[#111] px-5 py-3.5 rounded-[12px] transition-colors border border-[#eee] hover:border-[#ddd]">
                Login
              </button>
            </div>
          </Reveal>
        </div>

        {/* Right: Real dashboard mockup in browser chrome */}
        <div className="flex-1 relative w-full max-w-[740px]">
          <Reveal delay={250} distance={50}>
            <div className="relative">
              {/* Browser chrome wrapper */}
              <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f2f2f2] bg-[#fafafa]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-8">
                    <div className="h-5 rounded-md bg-[#f0f0f0] max-w-[200px] mx-auto flex items-center justify-center">
                      <span className="text-[9px] text-[#bbb]">app.vistaceo.com/dashboard</span>
                    </div>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-hidden">
                  <MockupProDashboard business="argentina" />
                </div>
              </div>

              {/* Floating notification cards */}
              <NotifCard
                icon={<TrendingUp className="w-3 h-3" />}
                iconBg="bg-[#28c840]"
                name="Oportunidad detectada"
                text="Tus ventas de mediodía subieron 23%. Considerá extender el horario."
                time="Ahora"
                className="absolute -top-2 -right-4 lg:-right-8 z-20 hidden sm:flex"
                delay={600}
              />
              <NotifCard
                icon={<Target className="w-3 h-3" />}
                iconBg="bg-[#E8714A]"
                name="Misión completada"
                text="Campaña de retención: +12% clientes recurrentes este mes"
                time="1h"
                className="absolute top-[110px] -right-6 lg:-right-10 z-20 hidden sm:flex"
                delay={900}
              />
              <NotifCard
                icon={<Zap className="w-3 h-3" />}
                iconBg="bg-[#2692DC]"
                name="Alerta competitiva"
                text="Un competidor ajustó precios. Te preparamos una recomendación."
                time="2h"
                className="absolute top-[220px] -right-3 lg:-right-6 z-20 hidden sm:flex"
                delay={1200}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CTA Band — Join counter
   ═══════════════════════════════════════════════════════════════ */
const CTABand = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="py-20 px-6 bg-white">
      <Reveal>
        <div className="text-center">
          <p className="text-[17px] text-[#777]">
            Unite a <span className="text-[#E8714A] font-bold text-[28px] mx-1.5 tabular-nums">{counter}</span> negocios en la plataforma.
          </p>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="mt-6 bg-[#111] text-white px-9 py-4 rounded-xl text-[14px] font-medium hover:bg-[#222] transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98] hover:-translate-y-0.5">
            Empezar ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Integration Strip — Scrolling business types
   ═══════════════════════════════════════════════════════════════ */
const IntegrationStrip = () => (
  <section className="py-14 overflow-hidden bg-white">
    <Reveal>
      <div className="flex items-center justify-center gap-5 mb-10">
        <div className="h-px w-28 bg-gradient-to-r from-transparent to-[#e5e5e5]" />
        <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#bbb] font-semibold">PARA TODO TIPO DE NEGOCIO</p>
        <div className="h-px w-28 bg-gradient-to-l from-transparent to-[#e5e5e5]" />
      </div>
    </Reveal>
    <div className="relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
      <div className="flex animate-scroll-x gap-16 items-center">
        {[...Array(4)].map((_, set) => (
          <div key={set} className="flex gap-16 items-center flex-shrink-0">
            {["Restaurantes", "Clínicas", "Agencias", "Comercios", "Estudios", "Startups", "Freelancers", "Hoteles", "Consultorios", "Gimnasios", "Cafeterías", "Salones"].map(t => (
              <span key={`${set}-${t}`} className="text-[14px] text-[#d5d5d5] font-medium whitespace-nowrap hover:text-[#999] transition-colors duration-500">{t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   About Block — Large centered statement
   ═══════════════════════════════════════════════════════════════ */
const AboutBlock = () => (
  <section id="about" className="py-28 lg:py-36 px-6 bg-[#fafafa]">
    <div className="max-w-[780px] mx-auto text-center">
      <Reveal>
        <h2 className="text-[clamp(1.3rem,2.6vw,1.65rem)] font-medium text-[#1a1a1a] leading-[1.65] tracking-[-0.01em]">
          VISTACEO reúne toda la inteligencia de tu negocio en un solo lugar, usa IA para entender tus objetivos y te permite enfocarte en las decisiones que realmente mueven la aguja.
        </h2>
      </Reveal>
      <Reveal delay={100}>
        <p className="text-[15px] text-[#999] mt-7 leading-[1.85] max-w-[560px] mx-auto">
          Ya sea que estés analizando métricas, buscando oportunidades o gestionando tu operación — la gestión de un negocio moderno requiere demasiadas herramientas. VISTACEO lo simplifica todo.
        </p>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   Interactive Product Showcase — Tabbed mockups with business selector
   Same mockups as main landing, Kinso-grade layout
   ═══════════════════════════════════════════════════════════════ */
const mockupTabs = [
  { key: "salud", label: "Salud", icon: Heart, desc: "Índice multidimensional que evalúa tu negocio en tiempo real" },
  { key: "misiones", label: "Misiones", icon: Target, desc: "Acciones concretas con pasos claros y definición de éxito" },
  { key: "radar", label: "Radar", icon: Radar, desc: "Oportunidades, riesgos y tendencias detectadas por IA" },
  { key: "chat", label: "Chat CEO", icon: MessageCircle, desc: "Preguntá lo que quieras sobre tu negocio en lenguaje natural" },
  { key: "analytics", label: "Métricas", icon: BarChart3, desc: "Dashboards que se adaptan a tu industria" },
  { key: "predictions", label: "Futuro", icon: Eye, desc: "Predicciones a 7, 14 y 30 días con niveles de certeza" },
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
        {/* Section header */}
        <Reveal>
          <div className="text-center mb-4">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#E8714A] font-semibold mb-5">PRODUCTO</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em]">
              Inteligencia que trabaja para vos
            </h2>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <p className="text-center text-[15px] text-[#999] mt-4 mb-12 max-w-[480px] mx-auto leading-[1.7]">
            Explorá cada módulo del sistema. Cambiá de negocio para ver cómo VISTACEO se adapta a cada industria.
          </p>
        </Reveal>

        {/* Business selector — pill row with photos */}
        <Reveal delay={100}>
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {businesses.map(b => (
              <button key={b.key} onClick={() => setActiveBusiness(b.key)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-full text-[12.5px] font-medium transition-all duration-300 border",
                  activeBusiness === b.key
                    ? "bg-[#111] text-white border-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
                    : "bg-white text-[#777] border-[#eee] hover:border-[#ddd] hover:text-[#444]"
                )}>
                <img src={b.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                <span className="hidden sm:inline">{b.name}</span>
                <span className="sm:hidden">{b.type}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Tab bar — clean pills */}
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
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-center text-[13px] text-[#bbb] mb-8"
          >
            {currentTabData?.desc}
          </motion.p>
        </AnimatePresence>

        {/* Mockup in browser chrome */}
        <Reveal delay={180}>
          <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Browser chrome */}
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

            {/* Mockup content with smooth transitions */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${activeBusiness}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
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
   Features Grid — 6 cards
   ═══════════════════════════════════════════════════════════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: Sparkles, title: "Briefing matutino", desc: "Cada mañana, un resumen con métricas clave, alertas y acciones prioritarias.", color: "#E8714A" },
    { icon: Target, title: "Misiones accionables", desc: "Pasos concretos con definición de éxito. No solo qué hacer, sino cómo.", color: "#28c840" },
    { icon: TrendingUp, title: "Radar de oportunidades", desc: "Detecta tendencias, riesgos y oportunidades para tu industria.", color: "#2692DC" },
    { icon: BarChart3, title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu negocio. Métricas que importan.", color: "#611f69" },
    { icon: Brain, title: "Predicciones", desc: "Anticipa escenarios basados en patrones reales de tu negocio.", color: "#f5a623" },
    { icon: Shield, title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Datos nunca compartidos.", color: "#0A66C2" },
  ];

  return (
    <section id="features" className="py-28 lg:py-32 px-6 bg-[#fafafa]">
      <div className="max-w-[1040px] mx-auto">
        <Reveal>
          <div className="text-center mb-3">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#E8714A] font-semibold mb-5">FEATURES</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.3rem)] font-semibold text-[#0a0a0a] tracking-[-0.025em]">
              Empezá cada día sabiendo qué importa.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <p className="text-center text-[15px] text-[#999] mt-4 mb-16 max-w-[440px] mx-auto leading-[1.7]">
            VISTACEO te sirve un briefing matutino con mensajes cruciales y acciones prioritarias ordenadas por impacto.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="rounded-2xl border border-[#eeeeee] bg-white p-7 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-[#e0e0e0] hover:-translate-y-1 transition-all duration-400 h-full group cursor-default">
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
   FAQ
   ═══════════════════════════════════════════════════════════════ */
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Para qué tipo de negocios sirve VISTACEO?", a: "Para cualquier negocio, empresa o servicio profesional. Restaurantes, clínicas, estudios, agencias, comercios, freelancers, startups y más. VISTACEO se adapta a tu industria." },
    { q: "¿Cómo aprende de mi negocio?", a: "Mediante preguntas inteligentes sobre tu operación, clientes, finanzas y objetivos. Cuanto más interactuás, más preciso se vuelve. Es un cerebro que evoluciona con vos." },
    { q: "¿Qué son las misiones?", a: "Son acciones concretas que el sistema genera basándose en el análisis de tu negocio. Cada misión tiene pasos claros, definición de éxito y deadline." },
    { q: "¿Mis datos están seguros?", a: "Sí. Usamos encriptación de nivel empresarial. Tus datos nunca se comparten con terceros ni se usan para entrenar modelos externos." },
    { q: "¿Puedo probarlo gratis?", a: "Sí. Podés empezar gratis sin tarjeta de crédito y acceder a las funciones básicas del sistema durante el tiempo que necesites." },
  ];

  return (
    <section id="faq" className="py-28 lg:py-32 px-6 bg-white">
      <div className="max-w-[620px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#E8714A] font-semibold mb-5">FAQs</p>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em]">
              Preguntas frecuentes
            </h2>
            <p className="text-[14px] text-[#999] mt-4 leading-[1.7]">
              Todo lo que necesitás saber sobre VISTACEO. ¿Algo más? Escribinos.
            </p>
          </div>
        </Reveal>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="rounded-xl border border-[#eee] bg-[#fafafa] overflow-hidden hover:border-[#e0e0e0] transition-colors">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#f5f5f5] transition-colors">
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
   Final CTA
   ═══════════════════════════════════════════════════════════════ */
const FinalCTA = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="py-28 lg:py-32 px-6 bg-[#fafafa] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,113,74,0.08), transparent 70%)" }}
      />
      <Reveal>
        <div className="text-center relative z-10">
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em] mb-4">
            Tu negocio merece un cerebro que no duerme.
          </h2>
          <p className="text-[17px] text-[#777] mb-8">
            Unite a <span className="text-[#E8714A] font-bold text-[30px] mx-1.5 tabular-nums">{counter}</span> negocios en la plataforma.
          </p>
          <button onClick={() => navigate("/auth?mode=signup")}
            className="bg-[#111] text-white px-10 py-4 rounded-xl text-[14.5px] font-medium hover:bg-[#222] transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] active:scale-[0.98] hover:-translate-y-0.5">
            Empezar ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════════════ */
const Footer = memo(() => (
  <footer className="border-t border-[#f0f0f0] py-12 px-6 bg-white">
    <div className="max-w-[1040px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.png" alt="" className="w-5 h-5 object-contain opacity-60" />
        <span className="text-[12px] text-[#ccc]">© 2025 VISTACEO. Todos los derechos reservados.</span>
      </div>
      <div className="flex items-center gap-8 text-[12px] text-[#ccc]">
        <a href="/condiciones" className="hover:text-[#888] transition-colors duration-300">Condiciones</a>
        <a href="/politicas" className="hover:text-[#888] transition-colors duration-300">Privacidad</a>
      </div>
    </div>
  </footer>
));
Footer.displayName = "Footer";

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function LandingMinimalista() {
  return (
    <>
      <SiteHead
        title="VISTACEO — Inteligencia artificial para tu negocio"
        description="Reúne toda la inteligencia de tu negocio. IA que aprende tus objetivos, entiende qué importa más y genera acciones concretas cada día."
        path="/minimalista"
      />

      <div className="min-h-screen bg-white text-[#1a1a1a] antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>
        <Header />
        <HeroSection />
        <CTABand />
        <IntegrationStrip />
        <AboutBlock />
        <ProductShowcase />
        <FeaturesGrid />
        <FAQSection />
        <FinalCTA />
        <Footer />
      </div>

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-25%); }
        }
        .animate-scroll-x {
          animation: scroll-x 40s linear infinite;
        }
      `}</style>
    </>
  );
}
