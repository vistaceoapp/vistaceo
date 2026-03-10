import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X, Check, TrendingUp, Target, Zap, BarChart3, Shield, Brain, Sparkles } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Minimalist Landing — Ultra-Premium Kinso Clone
   ═══════════════════════════════════════════════════════════════ */

/* ── Smooth Scroll Reveal with spring easing ── */
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
    <div 
      ref={ref} 
      className={cn("transition-all ease-out", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transitionDuration: "800ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
});
Reveal.displayName = "Reveal";

/* ── Stagger container ── */
const Stagger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════════
   Header — Floating pill nav like Kinso
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
      scrolled 
        ? "bg-white/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(0,0,0,0.04)]" 
        : "bg-transparent"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-[68px] flex items-center">
        {/* Logo + separator */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/minimalista")}>
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-[0.14em] text-[#111]">VISTACEO</span>
          </div>
          <div className="hidden md:block w-px h-5 bg-[#e5e5e5]" />
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-10 ml-10">
          {[
            { label: "About", href: "#about" },
            { label: "Features", href: "#features" },
            { label: "FAQs", href: "#faq" },
          ].map(link => (
            <a 
              key={link.label}
              href={link.href} 
              className="text-[13.5px] text-[#888] hover:text-[#111] transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#111] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2.5 ml-auto">
          <button 
            onClick={() => navigate("/auth")} 
            className="text-[13.5px] text-[#666] hover:text-[#111] transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-[#f8f8f8]"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/auth?mode=signup")} 
            className="text-[13.5px] bg-[#111] text-white px-5 py-2.5 rounded-[10px] font-medium hover:bg-[#222] transition-all duration-300 flex items-center gap-1.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden ml-auto p-2 hover:bg-[#f8f8f8] rounded-lg transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-500 bg-white/98 backdrop-blur-2xl border-t border-[#f5f5f5]",
        mobileOpen ? "max-h-[320px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-6 py-5 space-y-1">
          {["About", "Features", "FAQs"].map(item => (
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
   Floating Notification Card — Kinso style with entrance anim
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
    <div 
      ref={ref}
      className={cn(
        "bg-white rounded-[14px] border border-[#ebebeb] shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] p-3.5 w-[250px] flex gap-3 items-start transition-all",
        className
      )}
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
   Hero Section — Split layout with overlapping browser mockups
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-10 lg:pt-36 lg:pb-24 px-6 overflow-hidden">
      {/* Background — warm peach to white to blue, very subtle */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(165deg, rgba(255,235,218,0.45) 0%, rgba(255,255,255,1) 50%, rgba(230,242,255,0.3) 100%)"
      }} />
      
      {/* Subtle radial glow */}
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
        </div>

        {/* Right: App mockup with overlapping windows */}
        <div className="flex-1 relative w-full max-w-[740px]">
          <Reveal delay={200} distance={50}>
            <div className="relative h-[380px] sm:h-[420px] lg:h-[500px]">
              {/* Back window — Dashboard/Inbox (RIGHT, larger) */}
              <div className="absolute top-0 right-0 w-[78%] rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_24px_80px_-16px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f2f2f2] bg-[#fafafa]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-8">
                    <div className="h-5 rounded-md bg-[#f0f0f0] max-w-[180px] mx-auto flex items-center justify-center">
                      <span className="text-[9px] text-[#bbb]">vistaceo.com/inicio</span>
                    </div>
                  </div>
                </div>
                
                {/* Content — sidebar + dashboard */}
                <div className="flex h-[320px] lg:h-[380px]">
                  {/* Icon sidebar */}
                  <div className="w-12 bg-[#fafafa] border-r border-[#f2f2f2] flex flex-col items-center py-4 gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E8714A] to-[#e85d30] flex items-center justify-center mb-2 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    {[Brain, Target, BarChart3, Zap, Shield].map((Icon, i) => (
                      <div key={i} className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                        i === 0 ? "bg-[#f0f0f0]" : "hover:bg-[#f5f5f5]"
                      )}>
                        <Icon className="w-3.5 h-3.5 text-[#999]" />
                      </div>
                    ))}
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] text-[#bbb] font-medium">Buenos días, Martín</p>
                        <p className="text-[14px] font-semibold text-[#111] mt-0.5">Dashboard</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8714A] to-[#e85d30] flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">M</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini stat cards */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Salud", value: "87", color: "#28c840", trend: "+5" },
                        { label: "Misiones", value: "4/6", color: "#E8714A", trend: "activas" },
                        { label: "Ingresos", value: "+18%", color: "#2692DC", trend: "vs. mes ant." },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl bg-[#fafafa] border border-[#f0f0f0] p-2.5">
                          <p className="text-[9px] text-[#bbb] font-medium">{s.label}</p>
                          <p className="text-[16px] font-bold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                          <p className="text-[8px] text-[#ccc] mt-0.5">{s.trend}</p>
                        </div>
                      ))}
                    </div>

                    {/* Mission items */}
                    <div className="space-y-1.5">
                      {[
                        { title: "Optimizar carta de precios", status: "En progreso", icon: "🎯" },
                        { title: "Campaña retención clientes", status: "Completada", icon: "📣" },
                        { title: "Analizar horarios pico", status: "Pendiente", icon: "⏰" },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-[#f2f2f2] bg-white hover:bg-[#fafafa] transition-colors">
                          <span className="text-[12px]">{m.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-[#333] truncate">{m.title}</p>
                          </div>
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full font-medium",
                            m.status === "Completada" ? "bg-[#e8f5e9] text-[#28c840]" : 
                            m.status === "En progreso" ? "bg-[#fff3e0] text-[#E8714A]" :
                            "bg-[#f5f5f5] text-[#999]"
                          )}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Front window — AI Chat (LEFT, smaller, overlapping) */}
              <div className="absolute left-0 top-16 w-[48%] rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden z-10">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#f2f2f2] bg-[#fafafa]">
                  <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
                  <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
                </div>

                <div className="p-5 min-h-[200px]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8714A] to-[#e85d30] flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[12px] font-semibold text-[#111]">VISTACEO</span>
                  </div>
                  
                  <p className="text-[14px] font-medium text-[#111]">Buenos días, Martín.</p>
                  <p className="text-[11.5px] text-[#888] mt-1.5 leading-[1.6]">
                    Tenés 4 alertas nuevas y 2 misiones pendientes. Tu salud de negocio subió a 87 puntos.
                  </p>
                  
                  <div className="mt-6 flex items-center gap-2 px-3.5 py-3 rounded-xl bg-[#f8f8f8] border border-[#eee] hover:border-[#ddd] transition-colors cursor-pointer group">
                    <span className="text-[11.5px] text-[#aaa] group-hover:text-[#888] transition-colors">Preguntá a VISTACEO...</span>
                    <ArrowRight className="w-3 h-3 text-[#ddd] ml-auto group-hover:text-[#aaa] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <NotifCard
                icon={<TrendingUp className="w-3 h-3" />}
                iconBg="bg-[#28c840]"
                name="Oportunidad detectada"
                text="Tus ventas de mediodía subieron 23%. Considerá extender el horario."
                time="Ahora"
                className="absolute -top-1 -right-2 lg:-right-6 z-20"
                delay={600}
              />
              <NotifCard
                icon={<Target className="w-3 h-3" />}
                iconBg="bg-[#E8714A]"
                name="Misión completada"
                text="Campaña de retención: +12% clientes recurrentes este mes"
                time="1h"
                className="absolute top-[100px] -right-3 lg:-right-8 z-20"
                delay={900}
              />
              <NotifCard
                icon={<Zap className="w-3 h-3" />}
                iconBg="bg-[#2692DC]"
                name="Alerta competitiva"
                text="Un competidor ajustó precios. Te preparamos una recomendación."
                time="2h"
                className="absolute top-[200px] -right-1 lg:-right-5 z-20"
                delay={1200}
              />
            </div>
          </Reveal>

          {/* Integration icons */}
          <Reveal delay={500} distance={20}>
            <div className="flex items-center justify-center gap-3.5 mt-6">
              {[
                { icon: Brain, color: "#E8714A" },
                { icon: BarChart3, color: "#2692DC" },
                { icon: Target, color: "#28c840" },
                { icon: TrendingUp, color: "#611f69" },
                { icon: Zap, color: "#f5a623" },
                { icon: Shield, color: "#0A66C2" },
              ].map((app, i) => (
                <div key={i} className="w-11 h-11 rounded-full bg-white border border-[#eee] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#ddd] hover:-translate-y-0.5 transition-all duration-300">
                  <app.icon className="w-[18px] h-[18px]" style={{ color: app.color }} />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CTA Band — "Join X others" centered
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
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-6 bg-[#111] text-white px-9 py-4 rounded-xl text-[14px] font-medium hover:bg-[#222] transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-[0.98] hover:-translate-y-0.5"
          >
            Empezar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Integrations Strip — Scrolling business types
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
   Feature Sections — Alternating layout with premium mockups
   ═══════════════════════════════════════════════════════════════ */
const FeatureSection = ({ label, title, desc, children, reverse = false, id }: {
  label: string; title: string; desc: string; children: React.ReactNode; reverse?: boolean; id?: string;
}) => (
  <section id={id} className="py-24 lg:py-28 px-6 bg-white">
    <div className={cn(
      "max-w-[1040px] mx-auto flex flex-col gap-12",
      reverse ? "md:flex-row-reverse" : "md:flex-row",
      "md:items-center md:gap-20"
    )}>
      <div className="flex-1 max-w-[400px]">
        <Reveal>
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#E8714A] font-semibold mb-5">{label}</p>
          <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-[#0a0a0a] leading-[1.18] tracking-[-0.025em] mb-5">{title}</h2>
          <p className="text-[15px] text-[#888] leading-[1.8]">{desc}</p>
        </Reveal>
      </div>
      <div className="flex-1">
        <Reveal delay={150} distance={35}>{children}</Reveal>
      </div>
    </div>
  </section>
);

/* ── Feature: Missions mockup ── */
const FeatureMissions = () => (
  <div className="rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
    <div className="flex items-center justify-between mb-4">
      <p className="text-[13px] font-semibold text-[#111]">Misiones activas</p>
      <span className="text-[10px] bg-[#f5f5f5] text-[#999] px-2.5 py-1 rounded-full">3 de 6</span>
    </div>
    <div className="space-y-2.5">
      {[
        { status: "active", title: "Optimizar carta de precios", impact: "+8% margen", icon: "🎯", progress: 75 },
        { status: "completed", title: "Campaña retención clientes", impact: "+12% retención", icon: "📣", progress: 100 },
        { status: "pending", title: "Analizar horarios pico", impact: "+15% eficiencia", icon: "⏰", progress: 0 },
      ].map((m, i) => (
        <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-[#f0f0f0] bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors group">
          <span className="text-[16px]">{m.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#1a1a1a]">{m.title}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-1 rounded-full bg-[#eee] overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ 
                    width: `${m.progress}%`,
                    background: m.progress === 100 ? "#28c840" : m.progress > 0 ? "#E8714A" : "#ddd"
                  }} 
                />
              </div>
              <p className="text-[10px] text-[#bbb] flex-shrink-0">{m.impact}</p>
            </div>
          </div>
          {m.status === "completed" && (
            <div className="w-6 h-6 rounded-full bg-[#e8f5e9] flex items-center justify-center">
              <Check className="w-3 h-3 text-[#28c840]" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ── Feature: AI Search mockup ── */
const FeatureSearch = () => (
  <div className="rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
    <div className="rounded-xl bg-[#f8f8f8] border border-[#eee] px-4 py-3.5 flex items-center gap-3 mb-5 group hover:border-[#ddd] transition-colors">
      <span className="text-[#ccc] text-sm">🔍</span>
      <span className="text-[13px] text-[#aaa]">¿Cuánto facturé en febrero?</span>
    </div>
    <div className="p-5 rounded-xl bg-gradient-to-br from-[#f5f9ff] to-[#faf5ff] border border-[#e8e8e8]">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E8714A] to-[#e85d30] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <div>
          <p className="text-[13px] text-[#444] leading-[1.7]">
            Tu facturación de febrero fue <strong className="text-[#0a0a0a]">$2.340.000</strong>, un <strong className="text-[#28c840]">+18%</strong> vs enero. El mayor crecimiento vino del canal delivery (<strong className="text-[#0a0a0a]">+31%</strong>).
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] bg-[#e8f5e9] text-[#28c840] px-2 py-0.5 rounded-full font-medium">↑ Tendencia positiva</span>
            <span className="text-[10px] bg-[#f5f5f5] text-[#999] px-2 py-0.5 rounded-full">3 fuentes analizadas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Feature: Contextual insights mockup ── */
const FeatureContextual = () => (
  <div className="rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 rounded-full bg-[#E8714A] flex items-center justify-center">
        <Zap className="w-3 h-3 text-white" />
      </div>
      <p className="text-[13px] font-semibold text-[#111]">Radar de oportunidades</p>
    </div>
    <div className="space-y-2.5">
      {[
        { type: "oportunidad", title: "Horario pico sin explotar: 15-17hs", impact: "+$120k/mes potencial", color: "#28c840", bg: "#e8f5e9" },
        { type: "riesgo", title: "Competidor abrió a 3 cuadras", impact: "Monitorear precios", color: "#f44336", bg: "#fce4ec" },
        { type: "tendencia", title: "Delivery creció 31% este mes", impact: "Optimizar canal", color: "#2692DC", bg: "#e3f2fd" },
      ].map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors">
          <div className="w-1 h-8 rounded-full mt-0.5" style={{ background: item.color }} />
          <div className="flex-1">
            <p className="text-[12px] font-medium text-[#1a1a1a]">{item.title}</p>
            <p className="text-[10.5px] mt-0.5" style={{ color: item.color }}>{item.impact}</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: item.bg, color: item.color }}>
            {item.type}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Features Grid — 6 cards with hover effects
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
    <section id="features" className="py-28 lg:py-32 px-6 bg-white">
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
   FAQ — Smooth accordion
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
    <section id="faq" className="py-28 lg:py-32 px-6 bg-[#fafafa]">
      <div className="max-w-[620px] mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#E8714A] font-semibold mb-5">FAQs</p>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-semibold text-[#0a0a0a] tracking-[-0.02em]">
              Frequently Asked Questions
            </h2>
            <p className="text-[14px] text-[#999] mt-4 leading-[1.7]">
              Todo lo que necesitás saber sobre VISTACEO. ¿Algo más? Escribinos.
            </p>
          </div>
        </Reveal>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="rounded-xl border border-[#eee] bg-white overflow-hidden hover:border-[#e0e0e0] transition-colors">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#fcfcfc] transition-colors"
                >
                  <span className="text-[14px] font-medium text-[#222] pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform duration-400",
                    open === i && "rotate-180 text-[#999]"
                  )} />
                </button>
                <div 
                  className="overflow-hidden transition-all duration-500 ease-out"
                  style={{ maxHeight: open === i ? "200px" : "0px" }}
                >
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
    <section className="py-28 lg:py-32 px-6 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,113,74,0.08), transparent 70%)" }}
      />
      <Reveal>
        <div className="text-center relative z-10">
          <p className="text-[17px] text-[#777]">
            Unite a <span className="text-[#E8714A] font-bold text-[30px] mx-1.5 tabular-nums">{counter}</span> negocios en la plataforma.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-7 bg-[#111] text-white px-10 py-4 rounded-xl text-[14.5px] font-medium hover:bg-[#222] transition-all duration-300 inline-flex items-center gap-2.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] active:scale-[0.98] hover:-translate-y-0.5"
          >
            Empezar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Footer — Ultra minimal
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
        <FeatureSection
          id="missions"
          label="DAILY MISSIONS"
          title="Acciones concretas, resultados medibles."
          desc="Cada día, VISTACEO genera misiones específicas basadas en el análisis continuo de tu negocio. Pasos claros con progreso visible y definición de éxito."
        >
          <FeatureMissions />
        </FeatureSection>
        <FeatureSection
          reverse
          label="UNIVERSAL SEARCH"
          title="Preguntá lo que quieras sobre tu negocio."
          desc="Preguntá en lenguaje natural. VISTACEO busca en tus datos, conecta la información y responde con contexto real e insights accionables."
        >
          <FeatureSearch />
        </FeatureSection>
        <FeatureSection
          label="CONTEXTUAL ASSISTANT"
          title="Oportunidades que se conectan solas."
          desc="VISTACEO conecta lo que importa. Detecta patrones, identifica riesgos y te muestra oportunidades antes de que las pierdas."
        >
          <FeatureContextual />
        </FeatureSection>
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
