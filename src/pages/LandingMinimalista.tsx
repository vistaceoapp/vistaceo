import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

/* ═══════════════════════════════════════════════════════════════
   VISTACEO Minimalist Landing — Kinso.ai Style Clone
   ═══════════════════════════════════════════════════════════════ */

/* ── Scroll Reveal ── */
const Reveal = memo(({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return <div ref={ref} className={cn("transition-all duration-700 ease-out", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6", className)}>{children}</div>;
});
Reveal.displayName = "Reveal";

/* ═══════════════════════════════════════════════════════════════
   Header — Kinso exact: logo | separator | nav | login + CTA
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
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]" : "bg-transparent"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center">
        {/* Logo + separator */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
            <span className="text-[15px] font-semibold tracking-[0.12em] text-[#1a1a1a]">VISTACEO</span>
          </div>
          <div className="hidden md:block w-px h-5 bg-[#e0e0e0]" />
        </div>

        {/* Center nav — Kinso exact spacing */}
        <nav className="hidden md:flex items-center gap-10 ml-10">
          <a href="#about" className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors">About</a>
          <a href="#features" className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors">Features</a>
          <a href="#faq" className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors">FAQs</a>
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <button onClick={() => navigate("/auth")} className="text-[14px] text-[#666] hover:text-[#1a1a1a] transition-colors px-4 py-2 rounded-lg hover:bg-[#f5f5f5]">
            Login
          </button>
          <button onClick={() => navigate("/auth?mode=signup")} className="text-[14px] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#333] transition-colors flex items-center gap-1.5">
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="md:hidden ml-auto p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#1a1a1a]" /> : <Menu className="w-5 h-5 text-[#1a1a1a]" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#f0f0f0] px-6 py-4 space-y-1">
          <a href="#about" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>About</a>
          <a href="#features" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#faq" className="block text-[15px] text-[#444] py-2.5" onClick={() => setMobileOpen(false)}>FAQs</a>
          <div className="pt-3 flex flex-col gap-2">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[15px] text-[#666] py-2.5 text-left">Login</button>
            <button onClick={() => { navigate("/auth?mode=signup"); setMobileOpen(false); }} className="text-[15px] bg-[#1a1a1a] text-white px-5 py-3 rounded-lg font-medium w-full">Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
});
Header.displayName = "Header";

/* ═══════════════════════════════════════════════════════════════
   Floating Notification Card — Kinso exact style
   ═══════════════════════════════════════════════════════════════ */
const NotifCard = ({ icon, iconBg, name, text, time, className }: {
  icon: React.ReactNode; iconBg: string; name: string; text: string; time: string; className?: string;
}) => (
  <div className={cn(
    "bg-white rounded-xl border border-[#e8e8e8] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-3.5 w-[240px] flex gap-3 items-start",
    className
  )}>
    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0", iconBg)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{name}</p>
        <span className="text-[10px] text-[#bbb] flex-shrink-0">{time}</span>
      </div>
      <p className="text-[11px] text-[#888] leading-[1.4] mt-0.5 line-clamp-2">{text}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Hero Section — Kinso exact layout
   ═══════════════════════════════════════════════════════════════ */
const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-20 lg:pt-32 lg:pb-28 px-6 overflow-hidden min-h-[90vh]">
      {/* Background gradients — Kinso exact warm tones */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(180deg, rgba(255,248,245,0.7) 0%, rgba(255,255,255,1) 100%)"
      }} />
      <div className="absolute top-0 right-0 w-[70%] h-[70%] pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(232,113,74,0.05), transparent 70%)"
      }} />

      <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-8">
        {/* Left: Text — Kinso exact */}
        <div className="flex-shrink-0 w-full lg:w-[420px] lg:pt-8">
          <Reveal>
            <h1 className="text-[clamp(2.2rem,5.5vw,3.2rem)] font-semibold text-[#1a1a1a] leading-[1.08] tracking-[-0.02em]">
              Un cerebro,
            </h1>
            <h1 className="text-[clamp(2.2rem,5.5vw,3.2rem)] font-semibold text-[#1a1a1a] leading-[1.08] tracking-[-0.02em] mt-1">
              cada decisión.
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-[15px] text-[#666] mt-7 leading-[1.75] max-w-[380px]">
              VISTACEO reúne toda la inteligencia de tu negocio. Aprende tus objetivos, entiende qué importa más, y genera acciones que suenan como vos.
            </p>
          </Reveal>
        </div>

        {/* Right: App mockup with floating cards — Kinso style */}
        <div className="flex-1 relative w-full max-w-[720px]">
          <Reveal delay={100}>
            <div className="relative h-[420px] lg:h-[480px]">
              {/* Back window — inbox/messages list (RIGHT, larger) */}
              <div className="absolute top-0 right-0 w-[75%] rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                
                {/* Content — sidebar + inbox list */}
                <div className="flex h-[340px]">
                  {/* Icon sidebar */}
                  <div className="w-11 bg-[#fafafa] border-r border-[#f0f0f0] flex flex-col items-center py-3 gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-[#1a1a1a] flex items-center justify-center mb-1">
                      <span className="text-[10px]">💬</span>
                    </div>
                    {["M", "✦", "📷", "📱", "in", "📊"].map((icon, i) => (
                      <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] text-[#bbb] hover:bg-[#f0f0f0]">
                        {icon}
                      </div>
                    ))}
                  </div>

                  {/* Inbox list */}
                  <div className="flex-1 p-3 overflow-hidden bg-white">
                    <div className="flex items-center gap-2 px-2.5 py-2 mb-3 rounded-lg bg-[#f8f8f8] border border-[#eee]">
                      <span className="text-[10px] text-[#bbb]">🔍</span>
                      <span className="text-[11px] text-[#aaa]">Buscar o preguntar...</span>
                    </div>
                    <p className="text-[9px] text-[#bbb] uppercase tracking-wider font-medium px-1 mb-2">Inbox</p>
                    
                    {[
                      { name: "Natasha Corwin", msg: "Quiere compartir un contrato de venta...", time: "3m", icon: "M", color: "#EA4335" },
                      { name: "Luke Rankin", msg: "Compartió actualización del proyecto...", time: "12m", icon: "✦", color: "#611f69" },
                      { name: "Ana Rodríguez", msg: "Envió el reporte mensual con datos...", time: "1h", icon: "📱", color: "#25D366" },
                      { name: "Jack Callaghan", msg: "Actualizó agenda de la reunión...", time: "2h", icon: "📷", color: "#E1306C" },
                      { name: "Diego López", msg: "Preguntó sobre el presupuesto Q3...", time: "4h", icon: "M", color: "#EA4335" },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#fafafa] cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e8e8e8] to-[#d0d0d0] flex items-center justify-center text-[9px] font-medium text-[#888]">
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-medium text-[#1a1a1a]">{c.name}</p>
                            <span className="text-[9px] text-[#ccc]">{c.time}</span>
                          </div>
                          <p className="text-[10px] text-[#999] truncate">{c.msg}</p>
                        </div>
                        <span className="text-[10px]" style={{ color: c.color }}>{c.icon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Front window — Chat/greeting (LEFT, smaller, overlapping) */}
              <div className="absolute left-0 top-12 w-[50%] rounded-2xl border border-[#e8e8e8] bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden z-10">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#f0f0f0] bg-[#fafafa]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>

                <div className="p-5 h-[180px]">
                  <p className="text-[14px] font-medium text-[#1a1a1a]">Buenos días, Martín.</p>
                  <p className="text-[11px] text-[#888] mt-1">Tenés 4 nuevas y 9 conversaciones activas.</p>
                  
                  <div className="mt-8 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#f8f8f8] border border-[#eee]">
                    <span className="text-[11px] text-[#aaa]">Preguntá a VISTACEO</span>
                    <ArrowRight className="w-3 h-3 text-[#ccc] ml-auto" />
                  </div>
                </div>
              </div>

              {/* Floating notification cards — positioned to the right of back window */}
              <div className="absolute -top-2 -right-3 lg:-right-6 z-20">
                <NotifCard
                  icon={<span className="text-[9px]">M</span>}
                  iconBg="bg-[#EA4335]"
                  name="Natasha Corwin"
                  text="Solicitó un contrato de venta. Encontré un email relacionado."
                  time="24m"
                />
              </div>
              <div className="absolute top-[90px] -right-4 lg:-right-8 z-20">
                <NotifCard
                  icon={<span className="text-[9px]">✦</span>}
                  iconBg="bg-[#28c840]"
                  name="Luke Rankin"
                  text="Revisar actualización del proyecto ITWA"
                  time="1h"
                />
              </div>
              <div className="absolute top-[175px] -right-2 lg:-right-5 z-20">
                <NotifCard
                  icon={<span className="text-[9px]">in</span>}
                  iconBg="bg-[#0A66C2]"
                  name="Ben Monroe"
                  text="Enviar presupuesto para Q3"
                  time="2h"
                />
              </div>
            </div>
          </Reveal>

          {/* Integration icons — Kinso circular style below mockup */}
          <Reveal delay={300}>
            <div className="flex items-center justify-center gap-3 mt-4">
              {[
                { letter: "M", color: "#EA4335" },
                { letter: "✦", color: "#611f69" },
                { letter: "📷", color: "#E1306C" },
                { letter: "📱", color: "#25D366" },
                { letter: "in", color: "#0A66C2" },
                { letter: "▶", color: "#FF6B35" },
              ].map((app, i) => (
                <div key={i} className="w-11 h-11 rounded-full bg-white border border-[#eee] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
                  <span className="text-[13px] font-semibold" style={{ color: app.color }}>{app.letter}</span>
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
   CTA Band — Kinso exact: "Join X others" + button centered
   ═══════════════════════════════════════════════════════════════ */
const CTABand = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="py-16 px-6 bg-white">
      <Reveal>
        <div className="text-center">
          <p className="text-[17px] text-[#666]">
            Unite a <span className="text-[#E8714A] font-bold text-[26px] mx-1">{counter}</span> negocios en la plataforma.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-5 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-lg text-[14px] font-medium hover:bg-[#333] transition-all inline-flex items-center gap-2"
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
   Integrations Strip — Kinso exact: label with lines, scrolling
   ═══════════════════════════════════════════════════════════════ */
const IntegrationStrip = () => (
  <section className="py-12 overflow-hidden bg-white">
    <Reveal>
      {/* Label with lines — Kinso exact */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#e0e0e0]" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#999] font-medium">INTEGRATIONS</p>
        <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#e0e0e0]" />
      </div>
    </Reveal>
    <div className="relative overflow-hidden">
      <div className="flex animate-scroll-x gap-16 items-center">
        {[...Array(3)].map((_, set) => (
          <div key={set} className="flex gap-16 items-center flex-shrink-0">
            {["Restaurantes", "Clínicas", "Agencias", "Comercios", "Estudios", "Startups", "Freelancers", "Hoteles", "Consultorios", "Gimnasios"].map(t => (
              <span key={`${set}-${t}`} className="text-[14px] text-[#ccc] font-medium whitespace-nowrap">{t}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   About Block — Kinso exact: centered statement
   ═══════════════════════════════════════════════════════════════ */
const AboutBlock = () => (
  <section id="about" className="py-24 px-6 bg-[#fafafa]">
    <div className="max-w-[760px] mx-auto text-center">
      <Reveal>
        <h2 className="text-[clamp(1.3rem,2.8vw,1.7rem)] font-medium text-[#1a1a1a] leading-[1.5]">
          VISTACEO reúne toda la inteligencia de tu negocio en un solo lugar, usa IA para entender tus objetivos y te permite enfocarte en las decisiones que realmente importan.
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p className="text-[15px] text-[#888] mt-6 leading-[1.8] max-w-[580px] mx-auto">
          Ya sea que estés analizando métricas de rendimiento, buscando oportunidades de crecimiento o gestionando tu operación diaria — la gestión de un negocio requiere demasiadas herramientas. VISTACEO lo simplifica todo.
        </p>
      </Reveal>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   Feature Sections — Kinso alternating layout
   ═══════════════════════════════════════════════════════════════ */
const FeatureSection = ({ label, title, desc, children, reverse = false, id }: {
  label: string; title: string; desc: string; children: React.ReactNode; reverse?: boolean; id?: string;
}) => (
  <section id={id} className="py-20 px-6 bg-white">
    <div className={cn(
      "max-w-[1000px] mx-auto flex flex-col gap-10",
      reverse ? "md:flex-row-reverse" : "md:flex-row",
      "md:items-center md:gap-20"
    )}>
      <div className="flex-1 max-w-[400px]">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">{label}</p>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#1a1a1a] leading-[1.2] tracking-[-0.02em] mb-4">{title}</h2>
          <p className="text-[15px] text-[#888] leading-[1.75]">{desc}</p>
        </Reveal>
      </div>
      <div className="flex-1">
        <Reveal delay={100}>{children}</Reveal>
      </div>
    </div>
  </section>
);

/* Feature visuals */
const FeatureMissions = () => (
  <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="space-y-2.5">
      {[
        { status: "active", title: "Optimizar carta de precios", impact: "+8% margen", icon: "🎯" },
        { status: "active", title: "Campaña retención clientes", impact: "+12% retención", icon: "📣" },
        { status: "pending", title: "Analizar horarios pico", impact: "+15% eficiencia", icon: "⏰" },
      ].map((m, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa]">
          <span className="text-base">{m.icon}</span>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[#1a1a1a]">{m.title}</p>
            <p className="text-[11px] text-[#999]">{m.impact}</p>
          </div>
          <div className={cn(
            "text-[10px] px-2.5 py-1 rounded-full font-medium",
            m.status === "active" ? "bg-[#e8f5e9] text-[#28c840]" : "bg-[#fff8e1] text-[#f5a623]"
          )}>
            {m.status === "active" ? "Activa" : "Pendiente"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FeatureSearch = () => (
  <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="rounded-xl bg-[#f8f8f8] border border-[#eee] px-4 py-3 flex items-center gap-3 mb-4">
      <span className="text-[#ccc]">🔍</span>
      <span className="text-[13px] text-[#999]">¿Cuánto facturé en febrero?</span>
    </div>
    <div className="p-4 rounded-xl bg-gradient-to-r from-[#f0f7ff] to-[#faf5ff] border border-[#e8e8e8]">
      <p className="text-[13px] text-[#444] leading-relaxed">
        Tu facturación de febrero fue <strong className="text-[#1a1a1a]">$2.340.000</strong>, un <strong className="text-[#28c840]">+18%</strong> vs enero. El mayor crecimiento vino del canal delivery.
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Features Grid — Kinso style
   ═══════════════════════════════════════════════════════════════ */
const FeaturesGrid = () => {
  const features = [
    { icon: "☀️", title: "Briefing matutino", desc: "Cada mañana, un resumen con métricas clave, alertas y acciones prioritarias." },
    { icon: "🎯", title: "Misiones accionables", desc: "Pasos concretos con definición de éxito. No solo qué hacer, sino cómo." },
    { icon: "📡", title: "Radar de oportunidades", desc: "Detecta tendencias, riesgos y oportunidades para tu industria." },
    { icon: "📊", title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu negocio. Métricas que importan." },
    { icon: "💡", title: "Predicciones", desc: "Anticipa escenarios basados en patrones reales de tu negocio." },
    { icon: "🔒", title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Datos nunca compartidos." },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">FEATURES</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.2rem)] font-semibold text-[#1a1a1a] tracking-[-0.02em]">
              Empezá cada día sabiendo qué importa.
            </h2>
          </div>
        </Reveal>
        <Reveal delay={50}>
          <p className="text-center text-[15px] text-[#888] mt-3 mb-14 max-w-md mx-auto">
            VISTACEO te sirve un briefing matutino con mensajes cruciales y acciones prioritarias.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div className="rounded-2xl border border-[#eee] bg-white p-6 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:border-[#ddd] transition-all h-full">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="text-[14px] font-semibold text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[#888] leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FAQ — Kinso accordion
   ═══════════════════════════════════════════════════════════════ */
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Para qué tipo de negocios sirve VISTACEO?", a: "Para cualquier negocio, empresa o servicio profesional. Restaurantes, clínicas, estudios, agencias, comercios, freelancers, startups y más." },
    { q: "¿Cómo aprende de mi negocio?", a: "Mediante preguntas inteligentes sobre tu operación, clientes, finanzas y objetivos. Cuanto más interactuás, más preciso se vuelve." },
    { q: "¿Qué son las misiones?", a: "Son acciones concretas que el sistema genera basándose en el análisis de tu negocio. Cada misión tiene pasos claros y deadline." },
    { q: "¿Mis datos están seguros?", a: "Sí. Usamos encriptación de nivel empresarial. Tus datos nunca se comparten con terceros." },
    { q: "¿Puedo probarlo gratis?", a: "Sí. Podés empezar gratis sin tarjeta de crédito y acceder a las funciones básicas del sistema." },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-[600px] mx-auto">
        <Reveal>
          <div className="text-center mb-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E8714A] font-semibold mb-4">FAQs</p>
            <h2 className="text-[clamp(1.4rem,3vw,1.8rem)] font-semibold text-[#1a1a1a] tracking-[-0.02em]">
              Frequently Asked Questions
            </h2>
            <p className="text-[14px] text-[#888] mt-3">
              Todo lo que necesitás saber sobre VISTACEO.
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
                  <span className="text-[14px] font-medium text-[#333] pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform", open === i && "rotate-180")} />
                </button>
                <div className={cn("overflow-hidden transition-all duration-300", open === i ? "max-h-40 pb-4" : "max-h-0")}>
                  <p className="px-5 text-[13px] text-[#888] leading-relaxed">{faq.a}</p>
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
    <section className="py-24 px-6 bg-white">
      <Reveal>
        <div className="text-center">
          <p className="text-[17px] text-[#666]">
            Unite a <span className="text-[#E8714A] font-bold text-[26px] mx-1">{counter}</span> negocios en la plataforma.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="mt-5 bg-[#1a1a1a] text-white px-8 py-3.5 rounded-lg text-[14px] font-medium hover:bg-[#333] transition-all inline-flex items-center gap-2"
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
   Footer — Kinso minimal
   ═══════════════════════════════════════════════════════════════ */
const Footer = memo(() => (
  <footer className="border-t border-[#f0f0f0] py-10 px-6 bg-white">
    <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <img src="/favicon.png" alt="" className="w-5 h-5 object-contain" />
        <span className="text-[12px] text-[#bbb]">© 2025 VISTACEO. Todos los derechos reservados.</span>
      </div>
      <div className="flex items-center gap-6 text-[12px] text-[#bbb]">
        <a href="/condiciones" className="hover:text-[#666] transition-colors">Condiciones</a>
        <a href="/politicas" className="hover:text-[#666] transition-colors">Privacidad</a>
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

      <div className="min-h-screen bg-white text-[#1a1a1a] font-sans antialiased">
        <Header />
        <HeroSection />
        <CTABand />
        <IntegrationStrip />
        <AboutBlock />
        <FeatureSection
          id="missions"
          label="DAILY MISSIONS"
          title="Acciones concretas, resultados medibles."
          desc="Cada día, VISTACEO genera misiones específicas basadas en el análisis continuo de tu negocio. Pasos claros con definición de éxito."
        >
          <FeatureMissions />
        </FeatureSection>
        <FeatureSection
          reverse
          label="UNIVERSAL SEARCH"
          title="Preguntá lo que quieras."
          desc="Preguntá en lenguaje natural sobre tu negocio. VISTACEO busca en tus datos y responde con contexto real."
        >
          <FeatureSearch />
        </FeatureSection>
        <FeaturesGrid />
        <FAQSection />
        <FinalCTA />
        <Footer />
      </div>

      <style>{`
        @keyframes scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .animate-scroll-x {
          animation: scroll-x 30s linear infinite;
        }
      `}</style>
    </>
  );
}
