import { useState, useEffect, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Brain, Target, TrendingUp, Zap, BarChart3, Shield, Sparkles, MessageSquare, Lightbulb, Radar, Menu, X } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

/* ── Scroll Reveal ── */
const Reveal = memo(({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} className={cn("transition-all duration-700 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)}>{children}</div>;
});
Reveal.displayName = "Reveal";

/* ═══════════════════════════════════════════════
   Header — Kinso exact: logo | separator | nav center | login + CTA right
   ═══════════════════════════════════════════════ */
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)]" : "bg-white/60 backdrop-blur-sm"
    )}>
      <div className="max-w-[1240px] mx-auto px-6 h-[64px] flex items-center justify-between">
        {/* Logo + separator */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" width={28} height={28} />
            <span className="text-[15px] font-semibold tracking-[0.08em] text-[#111]">VISTACEO</span>
          </div>
          <div className="hidden md:block w-px h-5 bg-[#e5e5e5]" />
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "About", href: "#about" },
            { label: "Features", href: "#features" },
            { label: "FAQs", href: "#faq" },
          ].map(link => (
            <a key={link.href} href={link.href} className="text-[14px] text-[#666] hover:text-[#111] transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 min-w-[160px] justify-end">
          <button onClick={() => navigate("/auth")} className="text-[14px] text-[#666] hover:text-[#111] transition-colors font-medium px-4 py-2 rounded-lg border border-transparent hover:border-[#e5e5e5]">
            Login
          </button>
          <button onClick={() => navigate("/auth?mode=signup")} className="text-[14px] bg-[#111] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#222] transition-colors flex items-center gap-1.5">
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#f0f0f0] px-6 py-4 space-y-1">
          <a href="#about" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#features" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#faq" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>FAQs</a>
          <div className="pt-3 flex flex-col gap-2">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[15px] text-[#666] py-2.5 text-left">Login</button>
            <button onClick={() => { navigate("/auth?mode=signup"); setMobileOpen(false); }} className="text-[15px] bg-[#111] text-white px-5 py-3 rounded-lg font-medium w-full">Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
});
Header.displayName = "Header";

/* ═══════════════════════════════════════════════
   Floating notification card — Kinso exact style
   ═══════════════════════════════════════════════ */
const NotifCard = ({ icon, iconBg, name, text, time, className, delay = 0 }: {
  icon: React.ReactNode; iconBg: string; name: string; text: string; time: string; className?: string; delay?: number;
}) => (
  <Reveal delay={delay}>
    <div className={cn(
      "bg-white rounded-xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-3.5 w-[260px] flex gap-3 items-start",
      className
    )}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0", iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-[#111] truncate">{name}</p>
          <span className="text-[10px] text-[#bbb] flex-shrink-0">{time}</span>
        </div>
        <p className="text-[12px] text-[#888] leading-[1.4] mt-0.5 line-clamp-2">{text}</p>
      </div>
    </div>
  </Reveal>
);

/* ═══════════════════════════════════════════════
   Hero — Kinso exact: split layout, text left, app mockup right
   ═══════════════════════════════════════════════ */
const HeroSection = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 overflow-hidden">
      {/* Kinso warm subtle radial gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 65% 30%, rgba(232,113,74,0.04), transparent 60%)"
      }} />

      <div className="relative z-10 max-w-[1240px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: Text */}
        <div className="flex-1 max-w-xl lg:max-w-[520px]">
          <Reveal>
            <h1 className="text-[clamp(2.4rem,5.5vw,3.8rem)] font-semibold text-[#111] leading-[1.08] tracking-[-0.03em]">
              Inteligencia artificial{" "}
              <span className="bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
                para tu negocio.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-[17px] text-[#888] mt-6 leading-[1.65] max-w-[440px]">
              VISTACEO analiza tu empresa, detecta oportunidades y entrega acciones concretas cada día. Como tener un CEO estratégico disponible 24/7.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="group bg-[#111] text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-[#222] transition-all flex items-center gap-2"
              >
                Empezar gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a href="#how" className="text-[14px] text-[#999] hover:text-[#111] transition-colors flex items-center gap-1.5 py-3.5 px-2">
                Ver cómo funciona
                <ChevronDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </Reveal>

          {/* Social proof — Kinso style avatar dots + counter */}
          <Reveal delay={260}>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "bg-gradient-to-br from-[#2692DC] to-[#746CE6]",
                  "bg-gradient-to-br from-[#E8714A] to-[#F5A623]",
                  "bg-gradient-to-br from-[#28c840] to-[#2692DC]",
                  "bg-gradient-to-br from-[#746CE6] to-[#E8714A]",
                ].map((bg, i) => (
                  <div key={i} className={cn("w-7 h-7 rounded-full border-2 border-white", bg)} />
                ))}
              </div>
              <p className="text-[14px] text-[#888]">
                <span className="text-[#111] font-semibold">{counter}</span> negocios activos
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right: App mockup with floating cards — Kinso exact */}
        <div className="flex-1 relative max-w-[600px] w-full">
          <Reveal delay={200}>
            <div className="relative">
              {/* Main app window */}
              <div className="rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                {/* Browser chrome — Kinso dots */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-4">
                    <div className="h-5 rounded-md bg-[#f0f0f0] max-w-[200px] mx-auto flex items-center justify-center">
                      <span className="text-[10px] text-[#bbb]">vistaceo.com/app</span>
                    </div>
                  </div>
                </div>

                {/* App content: sidebar + main */}
                <div className="flex h-[340px] sm:h-[380px]">
                  {/* Sidebar — Kinso icon bar */}
                  <div className="w-14 bg-[#fafafa] border-r border-[#f0f0f0] flex flex-col items-center py-4 gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    {[Brain, Target, BarChart3, MessageSquare, Shield].map((Icon, i) => (
                      <div key={i} className="w-7 h-7 rounded-lg bg-white border border-[#eee] flex items-center justify-center hover:bg-[#f5f5f5] transition-colors">
                        <Icon className="w-3.5 h-3.5 text-[#bbb]" />
                      </div>
                    ))}
                  </div>

                  {/* Main area */}
                  <div className="flex-1 p-4 sm:p-5 bg-[#fafafa]">
                    <div className="mb-4">
                      <p className="text-[14px] text-[#111] font-semibold">Buenos días, Martín.</p>
                      <p className="text-[12px] text-[#999] mt-0.5">Tenés 3 misiones activas y 2 alertas.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mb-4">
                      {[
                        { label: "Salud", value: "87", suffix: "/100", color: "#28c840" },
                        { label: "Revenue", value: "+23%", suffix: " MoM", color: "#2692DC" },
                        { label: "Misiones", value: "4", suffix: " activas", color: "#746CE6" },
                        { label: "Alertas", value: "2", suffix: " nuevas", color: "#febc2e" },
                      ].map(c => (
                        <div key={c.label} className="rounded-lg bg-white border border-[#eee] p-3">
                          <p className="text-[10px] text-[#bbb] uppercase tracking-wider font-medium">{c.label}</p>
                          <p className="text-[18px] font-semibold text-[#111] mt-1">
                            {c.value}<span className="text-[11px] text-[#ccc] font-normal">{c.suffix}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-white border border-[#eee] px-3 py-2.5 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2692DC] to-[#746CE6] flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-[12px] text-[#ccc]">Preguntale a VISTACEO...</span>
                      <ArrowRight className="w-3 h-3 text-[#ddd] ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification cards — Kinso style stacked right */}
              <div className="absolute -top-3 -right-4 sm:-right-8 z-10">
                <NotifCard
                  icon={<BarChart3 className="w-3.5 h-3.5" />}
                  iconBg="bg-gradient-to-br from-[#2692DC] to-[#746CE6]"
                  name="Oportunidad detectada"
                  text="Tu competencia subió precios 15%. Evaluá ajustar tu carta."
                  time="24m"
                  delay={400}
                />
              </div>
              <div className="absolute top-20 -right-2 sm:-right-6 z-10">
                <NotifCard
                  icon={<Target className="w-3.5 h-3.5" />}
                  iconBg="bg-gradient-to-br from-[#28c840] to-[#2692DC]"
                  name="Misión completada"
                  text="Campaña de fidelización: +12% retención."
                  time="1h"
                  delay={550}
                />
              </div>
              <div className="absolute bottom-16 -right-3 sm:-right-7 z-10">
                <NotifCard
                  icon={<Brain className="w-3.5 h-3.5" />}
                  iconBg="bg-gradient-to-br from-[#746CE6] to-[#E8714A]"
                  name="Insight del día"
                  text="Los martes son tu mejor día. Considerá promociones."
                  time="3h"
                  delay={700}
                />
              </div>
            </div>
          </Reveal>

          {/* Integration icons below mockup — Kinso exact: real brand-style icons */}
          <Reveal delay={500}>
            <div className="flex items-center justify-center gap-4 mt-6">
              {[
                { letter: "M", colors: "text-[#EA4335]", title: "Gmail" },
                { letter: "S", colors: "text-[#4A154B]", title: "Slack" },
                { letter: "IG", colors: "text-[#E1306C]", title: "Instagram" },
                { letter: "W", colors: "text-[#25D366]", title: "WhatsApp" },
                { letter: "in", colors: "text-[#0A66C2]", title: "LinkedIn" },
                { letter: "▶", colors: "text-[#FF6B35]", title: "Pipedrive" },
              ].map((app, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white border border-[#eee] flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow" title={app.title}>
                  <span className={cn("text-[13px] font-bold", app.colors)}>{app.letter}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   CTA band — Kinso: "Join X others on the waitlist" + button
   ═══════════════════════════════════════════════ */
const CTABand = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="py-16 px-6">
      <Reveal>
        <div className="text-center">
          <p className="text-[18px] text-[#666]">
            Unite a <span className="text-[#E8714A] font-bold text-[22px]">{counter}</span> negocios que ya crecen con VISTACEO.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-5 bg-[#111] text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-[#222] transition-all inline-flex items-center gap-2"
          >
            Empezar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   Integrations scrolling strip — Kinso exact
   ═══════════════════════════════════════════════ */
const IntegrationStrip = () => (
  <section className="py-12 border-y border-[#f0f0f0] overflow-hidden">
    <Reveal>
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#bbb] font-medium mb-8">
        INTEGRATIONS
      </p>
    </Reveal>
    <div className="relative">
      <div className="flex animate-scroll-x gap-12 items-center">
        {[...Array(3)].map((_, set) => (
          <div key={set} className="flex gap-12 items-center flex-shrink-0">
            {["Restaurantes", "Clínicas", "Agencias", "Comercios", "Estudios", "Startups", "Freelancers", "Hoteles", "Consultorios", "Gimnasios"].map(t => (
              <span key={`${set}-${t}`} className="text-[14px] text-[#ccc] font-medium whitespace-nowrap">{t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════
   Feature block — Kinso alternating: label + heading + desc, visual opposite
   ═══════════════════════════════════════════════ */
const FeatureBlock = ({ label, title, desc, children, reverse = false, id }: {
  label: string; title: string; desc: string; children: React.ReactNode; reverse?: boolean; id?: string;
}) => (
  <section id={id} className="py-20 md:py-28 px-6">
    <div className={cn(
      "max-w-[1100px] mx-auto flex flex-col gap-10",
      reverse ? "md:flex-row-reverse" : "md:flex-row",
      "md:items-center md:gap-16"
    )}>
      <div className="flex-1 max-w-md">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">{label}</p>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-semibold text-[#111] leading-[1.15] tracking-[-0.02em] mb-4">{title}</h2>
          <p className="text-[16px] text-[#888] leading-[1.7]">{desc}</p>
        </Reveal>
      </div>
      <div className="flex-1">
        <Reveal delay={150}>
          {children}
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── Feature visual cards ── */
const FeatureVisualMissions = () => (
  <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
    <div className="space-y-3">
      {[
        { status: "active", title: "Optimizar carta de precios", impact: "+8% margen", icon: "🎯" },
        { status: "active", title: "Campaña retención clientes", impact: "+12% retención", icon: "📣" },
        { status: "pending", title: "Analizar horarios pico", impact: "+15% eficiencia", icon: "⏰" },
      ].map((m, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#f0f0f0] bg-[#fafafa]">
          <span className="text-lg">{m.icon}</span>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-[#111]">{m.title}</p>
            <p className="text-[12px] text-[#999]">{m.impact}</p>
          </div>
          <div className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            m.status === "active" ? "bg-[#e8f5e9] text-[#28c840]" : "bg-[#fff8e1] text-[#febc2e]"
          )}>
            {m.status === "active" ? "Activa" : "Pendiente"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FeatureVisualSearch = () => (
  <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
    <div className="rounded-lg bg-[#fafafa] border border-[#eee] px-4 py-3 flex items-center gap-3 mb-4">
      <svg className="w-4 h-4 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth="2"/></svg>
      <span className="text-[13px] text-[#999]">¿Cuánto facturé en febrero?</span>
    </div>
    <div className="space-y-2.5">
      <div className="p-3 rounded-lg bg-gradient-to-r from-[#f0f7ff] to-[#faf5ff] border border-[#e8e8e8]">
        <p className="text-[13px] text-[#444] leading-relaxed">Tu facturación de febrero fue <strong className="text-[#111]">$2.340.000</strong>, un <strong className="text-[#28c840]">+18%</strong> vs enero. El mayor crecimiento vino del canal delivery.</p>
      </div>
      <div className="flex gap-2">
        <div className="text-[11px] text-[#999] bg-[#f5f5f5] px-2.5 py-1 rounded-md">📊 Ver gráfico</div>
        <div className="text-[11px] text-[#999] bg-[#f5f5f5] px-2.5 py-1 rounded-md">📋 Desglose</div>
      </div>
    </div>
  </div>
);

const FeatureVisualInsights = () => (
  <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
    <div className="space-y-3">
      {[
        { emoji: "📈", text: "Los martes generan 34% más revenue que el promedio.", tag: "Oportunidad" },
        { emoji: "⚠️", text: "Tu food cost subió 2.3pp este mes. Revisá proveedores.", tag: "Alerta" },
        { emoji: "💡", text: "3 competidores lanzaron delivery propio. Considerá tu estrategia.", tag: "Tendencia" },
      ].map((insight, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#f0f0f0]">
          <span className="text-lg mt-0.5">{insight.emoji}</span>
          <div className="flex-1">
            <p className="text-[13px] text-[#444] leading-relaxed">{insight.text}</p>
            <span className="inline-block mt-1.5 text-[10px] text-[#E8714A] bg-[#FFF5F0] px-2 py-0.5 rounded-full font-medium">{insight.tag}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   About — Kinso full-width centered text block
   ═══════════════════════════════════════════════ */
const AboutBlock = () => (
  <section id="about" className="py-20 px-6 bg-[#fafafa]">
    <div className="max-w-[800px] mx-auto text-center">
      <Reveal>
        <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-semibold text-[#111] leading-[1.4] tracking-[-0.01em]">
          VISTACEO reúne toda la inteligencia de tu negocio en un solo lugar, usa IA para entender tus objetivos y te permite enfocarte en las decisiones que realmente importan.
        </h2>
      </Reveal>
      <Reveal delay={100}>
        <p className="text-[15px] text-[#999] mt-6 leading-[1.7] max-w-[600px] mx-auto">
          Ya sea que estés analizando métricas de rendimiento, buscando oportunidades de crecimiento o gestionando tu operación diaria, la gestión de un negocio requiere demasiadas herramientas. VISTACEO lo simplifica todo.
        </p>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════
   Features grid — Kinso "FEATURES" section with cards
   ═══════════════════════════════════════════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: Brain, title: "Briefing matutino", desc: "Cada mañana, un resumen con las métricas clave, alertas urgentes y acciones prioritarias del día." },
    { icon: Target, title: "Misiones accionables", desc: "Pasos concretos con definición de éxito y deadline. No solo te dice qué hacer, te dice cómo." },
    { icon: Radar, title: "Radar de oportunidades", desc: "Detecta automáticamente tendencias, riesgos y oportunidades para tu industria." },
    { icon: BarChart3, title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu tipo de negocio. Métricas que realmente importan." },
    { icon: Lightbulb, title: "Predicciones", desc: "Anticipa escenarios futuros basados en patrones reales de tu negocio." },
    { icon: Shield, title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Tus datos nunca se comparten con terceros." },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">FEATURES</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[#111] tracking-[-0.02em]">
              Empezá cada día sabiendo qué importa.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <p className="text-center text-[15px] text-[#888] mt-3 mb-14 max-w-lg mx-auto leading-relaxed">
            VISTACEO te sirve un briefing matutino con mensajes cruciales y acciones prioritarias. Siempre sabés qué necesita tu atención primero.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="rounded-2xl border border-[#eee] bg-white p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#ddd] transition-all duration-300 h-full group">
                <div className="w-11 h-11 rounded-xl bg-[#f5f5f5] group-hover:bg-gradient-to-br group-hover:from-[#E8714A]/10 group-hover:to-[#F5A623]/10 flex items-center justify-center mb-4 transition-colors">
                  <f.icon className="w-5 h-5 text-[#888] group-hover:text-[#E8714A] transition-colors" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#111] mb-2">{f.title}</h3>
                <p className="text-[14px] text-[#888] leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   How it works — Kinso steps
   ═══════════════════════════════════════════════ */
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Conectá tu negocio", desc: "Respondé preguntas inteligentes sobre tu empresa. VISTACEO aprende de tu contexto, industria y objetivos.", icon: MessageSquare },
    { n: "02", title: "Recibí análisis diario", desc: "Cada día, el sistema analiza oportunidades, riesgos y tendencias usando los datos de tu negocio.", icon: Brain },
    { n: "03", title: "Ejecutá misiones", desc: "Acciones concretas con pasos claros. Cada misión está diseñada para generar impacto medible.", icon: Target },
    { n: "04", title: "Medí el crecimiento", desc: "Dashboards que muestran tu evolución. Predicciones y alertas para decisiones proactivas.", icon: TrendingUp },
  ];

  return (
    <section id="how" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-[900px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">HOW IT WORKS</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-semibold text-[#111] tracking-[-0.02em]">
              De la información a la acción.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <div className="group rounded-2xl border border-[#eee] bg-white p-6 hover:border-[#ddd] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f5f5f5] group-hover:bg-gradient-to-br group-hover:from-[#E8714A]/10 group-hover:to-[#F5A623]/10 flex items-center justify-center transition-colors">
                    <step.icon className="w-5 h-5 text-[#888] group-hover:text-[#E8714A] transition-colors" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#ccc] font-mono">{step.n}</span>
                    <h3 className="text-[16px] font-semibold text-[#111] mt-0.5 mb-2">{step.title}</h3>
                    <p className="text-[14px] text-[#888] leading-relaxed">{step.desc}</p>
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

/* ═══════════════════════════════════════════════
   FAQ — Kinso accordion style
   ═══════════════════════════════════════════════ */
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Para qué tipo de negocios sirve VISTACEO?", a: "Para cualquier negocio, empresa o servicio profesional. Restaurantes, clínicas, estudios, agencias, comercios, freelancers, startups y más. El sistema se adapta a tu industria automáticamente." },
    { q: "¿Cómo aprende de mi negocio?", a: "Mediante preguntas inteligentes sobre tu operación, clientes, finanzas y objetivos. Cuanto más interactuás, más preciso se vuelve. No necesitás conectar sistemas externos." },
    { q: "¿Qué son las misiones?", a: "Son acciones concretas y accionables que el sistema genera cada día basándose en el análisis de tu negocio. Cada misión tiene pasos claros, definición de éxito y deadline." },
    { q: "¿Mis datos están seguros?", a: "Sí. Usamos encriptación de nivel empresarial. Tus datos nunca se comparten con terceros y solo se usan para mejorar tus recomendaciones." },
    { q: "¿Puedo probarlo gratis?", a: "Sí. Podés empezar gratis sin tarjeta de crédito. Accedés al diagnóstico de salud, preguntas inteligentes y funciones básicas del sistema." },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-[640px] mx-auto">
        <Reveal>
          <div className="text-center mb-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">FAQs</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-semibold text-[#111] tracking-[-0.02em]">
              Frequently Asked Questions
            </h2>
            <p className="text-[14px] text-[#999] mt-3 max-w-sm mx-auto">
              Todo lo que necesitás saber sobre VISTACEO. ¿Tenés más preguntas? Escribinos.
            </p>
          </div>
        </Reveal>

        <div className="space-y-2 mt-10">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 40}>
              <div className="rounded-xl border border-[#eee] bg-white overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <span className="text-[15px] font-medium text-[#333] pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300 ease-out",
                  open === i ? "max-h-48 pb-4" : "max-h-0"
                )}>
                  <p className="px-5 text-[14px] text-[#888] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   Final CTA — Kinso style
   ═══════════════════════════════════════════════ */
const FinalCTA = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="py-28 px-6">
      <Reveal>
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[18px] text-[#666] mb-2">
            Unite a <span className="text-[#E8714A] font-bold text-[22px]">{counter}</span> negocios en la plataforma.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-4 bg-[#111] text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-[#222] transition-all inline-flex items-center gap-2"
          >
            Empezar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

/* ═══════════════════════════════════════════════
   Footer — Kinso minimal
   ═══════════════════════════════════════════════ */
const Footer = memo(() => (
  <footer className="border-t border-[#f0f0f0] py-10 px-6">
    <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.png" alt="" className="w-5 h-5 object-contain" width={20} height={20} />
        <span className="text-[13px] text-[#bbb]">© 2025 VISTACEO. Todos los derechos reservados.</span>
      </div>
      <div className="flex items-center gap-6 text-[13px] text-[#bbb]">
        <a href="https://www.vistaceo.com/condiciones" className="hover:text-[#666] transition-colors">Condiciones</a>
        <a href="https://www.vistaceo.com/politicas" className="hover:text-[#666] transition-colors">Privacidad</a>
        <a href="mailto:info@vistaceo.com" className="hover:text-[#666] transition-colors">Contacto</a>
      </div>
    </div>
  </footer>
));
Footer.displayName = "Footer";

/* ── CSS for scrolling animation ── */
const ScrollStyle = () => (
  <style>{`
    @keyframes scroll-x {
      0% { transform: translateX(0); }
      100% { transform: translateX(-33.333%); }
    }
    .animate-scroll-x {
      animation: scroll-x 30s linear infinite;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════ */
const LandingMinimalista = () => (
  <>
    <SiteHead
      path="/minimalista"
      title="VISTACEO — IA que hace crecer tu negocio"
      description="Inteligencia artificial que analiza tu negocio, detecta oportunidades y te entrega acciones concretas cada día."
    />
    <ScrollStyle />
    <div className="min-h-screen bg-white text-[#111] overflow-x-hidden">
      <Header />
      <main>
        <HeroSection />
        <CTABand />
        <IntegrationStrip />

        {/* Kinso-style alternating feature sections */}
        <FeatureBlock
          label="DRAFT RESPONSE"
          title="Respondé más rápido con acciones prediseñadas."
          desc="VISTACEO genera misiones diarias basadas en el análisis de tu negocio. Cada misión tiene pasos claros, impacto estimado y deadline. Solo ejecutá."
        >
          <FeatureVisualMissions />
        </FeatureBlock>

        <FeatureBlock
          reverse
          label="UNIVERSAL SEARCH"
          title="Buscá en toda la historia de tu negocio."
          desc="Encontrá cualquier métrica, decisión o dato sin recordar los números exactos. Preguntale a VISTACEO en lenguaje natural."
        >
          <FeatureVisualSearch />
        </FeatureBlock>

        <FeatureBlock
          label="CONTEXTUAL ASSISTANT"
          title="Insights que se conectan solos."
          desc="VISTACEO conecta lo que pertenece junto. ¿Alerta de costos en un área? El sistema ya encontró la oportunidad de optimización relacionada."
        >
          <FeatureVisualInsights />
        </FeatureBlock>

        <AboutBlock />
        <FeaturesGrid />
        <HowItWorks />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  </>
);

export default LandingMinimalista;
