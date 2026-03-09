import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Target, TrendingUp, Zap, BarChart3, Shield, Sparkles, ChevronDown, Star, MessageSquare, Lightbulb, Radar, Menu, X } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

// --- Scroll-reveal ---
const Reveal = memo(({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setVisible(true), delay);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className
      )}
    >
      {children}
    </div>
  );
});
Reveal.displayName = "Reveal";

// --- Header (kinso-style: clean, minimal, sticky with blur) ---
const Header = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        : "bg-transparent"
    )}>
      <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" width={28} height={28} />
          <span className="text-[15px] font-semibold tracking-[0.02em] text-[#111]">VISTACEO</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Funciones", href: "#features" },
            { label: "Cómo funciona", href: "#how" },
            { label: "FAQs", href: "#faq" },
          ].map(link => (
            <a key={link.href} href={link.href} className="text-[13px] text-[#666] hover:text-[#111] transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] text-[#666] hover:text-[#111] transition-colors font-medium"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] bg-[#111] text-white px-5 py-2 rounded-full font-medium hover:bg-[#333] transition-colors flex items-center gap-1.5"
          >
            Empezar gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5 text-[#111]" /> : <Menu className="w-5 h-5 text-[#111]" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-black/[0.06] px-6 py-4 space-y-3 animate-fade-in-up">
          <a href="#features" className="block text-[14px] text-[#444] py-2" onClick={() => setMobileOpen(false)}>Funciones</a>
          <a href="#how" className="block text-[14px] text-[#444] py-2" onClick={() => setMobileOpen(false)}>Cómo funciona</a>
          <a href="#faq" className="block text-[14px] text-[#444] py-2" onClick={() => setMobileOpen(false)}>FAQs</a>
          <div className="pt-2 flex flex-col gap-2">
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[14px] text-[#666] py-2 text-left">Iniciar sesión</button>
            <button onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="text-[14px] bg-[#111] text-white px-5 py-2.5 rounded-full font-medium w-full">Empezar gratis</button>
          </div>
        </div>
      )}
    </header>
  );
});
Header.displayName = "Header";

// --- Hero ---
const HeroSection = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter();

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 pt-28 pb-20">
      {/* Very subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(38,146,220,0.04), transparent 70%)"
      }} />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Social proof */}
        <Reveal>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-black/[0.08] bg-white mb-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex -space-x-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2692DC] to-[#746CE6] border-2 border-white" />
              ))}
            </div>
            <span className="text-[13px] text-[#888]">
              <span className="text-[#111] font-semibold">{counter}</span> negocios activos
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={80}>
          <h1 className="text-[clamp(2.2rem,6vw,4.2rem)] font-semibold text-[#111] leading-[1.1] tracking-[-0.03em] mb-6">
            Inteligencia artificial
            <br />
            <span className="bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
              que hace crecer
            </span>
            {" "}tu negocio.
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={160}>
          <p className="text-[17px] text-[#888] max-w-xl mx-auto mb-10 leading-[1.6]">
            VISTACEO analiza tu negocio, detecta oportunidades y entrega acciones concretas cada día. Como tener un CEO estratégico disponible 24/7.
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={240}>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="group bg-[#111] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#333] transition-all flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            >
              Empezar gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#how"
              className="text-[14px] text-[#999] hover:text-[#111] transition-colors flex items-center gap-1.5"
            >
              Ver cómo funciona
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </Reveal>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-[#ccc]" />
      </div>
    </section>
  );
};

// --- App Preview (kinso-style floating card) ---
const AppPreview = () => (
  <section className="relative py-10 px-6 -mt-10">
    <Reveal>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-black/[0.05] bg-[#fafafa]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <div className="flex-1 mx-6">
              <div className="h-5 rounded-md bg-black/[0.04] max-w-xs mx-auto flex items-center justify-center">
                <span className="text-[10px] text-[#bbb]">vistaceo.com/app</span>
              </div>
            </div>
          </div>
          {/* Cards */}
          <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#fafafa]">
            {[
              { label: "Salud", value: "87", suffix: "/100", color: "#28c840" },
              { label: "Misiones", value: "4", suffix: " activas", color: "#2692DC" },
              { label: "Oportunidades", value: "12", suffix: " nuevas", color: "#746CE6" },
              { label: "Impacto", value: "+23%", suffix: " revenue", color: "#febc2e" },
            ].map((card) => (
              <div key={card.label} className="rounded-xl bg-white border border-black/[0.06] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <p className="text-[11px] text-[#999] mb-2 font-medium uppercase tracking-wider">{card.label}</p>
                <p className="text-xl font-semibold text-[#111]">
                  {card.value}<span className="text-[12px] text-[#bbb] font-normal">{card.suffix}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

// --- Logos / integrations (kinso-style scrolling strip) ---
const LogoStrip = () => (
  <section className="py-16 overflow-hidden">
    <Reveal>
      <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#bbb] font-medium mb-8">
        Para cualquier tipo de negocio
      </p>
    </Reveal>
    <div className="flex gap-8 items-center justify-center flex-wrap max-w-3xl mx-auto px-6">
      {["Restaurantes", "Clínicas", "Agencias", "Comercios", "Estudios", "Startups", "Freelancers", "Hoteles"].map((type) => (
        <span key={type} className="text-[13px] text-[#bbb] font-medium whitespace-nowrap">{type}</span>
      ))}
    </div>
  </section>
);

// --- How it works ---
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Conectá tu negocio", desc: "Respondé preguntas inteligentes sobre tu empresa. VISTACEO aprende de tu contexto, industria y objetivos.", icon: MessageSquare },
    { n: "02", title: "Recibí análisis diario", desc: "Cada día, el sistema analiza oportunidades, riesgos y tendencias usando los datos de tu negocio.", icon: Brain },
    { n: "03", title: "Ejecutá misiones", desc: "Acciones concretas con pasos claros. Cada misión está diseñada para generar impacto medible.", icon: Target },
    { n: "04", title: "Medí el crecimiento", desc: "Dashboards que muestran tu evolución. Predicciones y alertas para decisiones proactivas.", icon: TrendingUp },
  ];

  return (
    <section id="how" className="py-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#2692DC] font-semibold mb-3">Cómo funciona</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-[#111] tracking-[-0.02em]">
              De la información a la acción
              <br className="hidden sm:block" />
              en cuatro pasos.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 80}>
              <div className="group rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-7 hover:border-black/[0.12] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-[#2692DC]" />
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

// --- Features (kinso-style cards with icons) ---
const Features = () => {
  const features = [
    { icon: Brain, title: "Cerebro IA adaptativo", desc: "Aprende de cada interacción. Cuanto más lo usás, más preciso y personalizado se vuelve." },
    { icon: Target, title: "Misiones accionables", desc: "Pasos concretos con definición de éxito y deadline. No solo te dice qué hacer." },
    { icon: Radar, title: "Radar de oportunidades", desc: "Detecta automáticamente tendencias, riesgos y oportunidades para tu industria." },
    { icon: BarChart3, title: "Analíticas inteligentes", desc: "Dashboards que se adaptan a tu tipo de negocio. Métricas que importan." },
    { icon: Lightbulb, title: "Predicciones", desc: "Anticipa escenarios futuros basados en patrones de tu negocio." },
    { icon: Shield, title: "Seguridad empresarial", desc: "Encriptación de nivel empresarial. Tus datos nunca se comparten." },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-[#fafafa]">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#746CE6] font-semibold mb-3">Funciones</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-[#111] tracking-[-0.02em]">
              Todo lo que necesitás
              <br className="hidden sm:block" />
              para escalar tu negocio.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 60}>
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-black/[0.1] transition-all duration-300 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#888]" />
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

// --- Testimonials ---
const Testimonials = () => {
  const items = [
    { quote: "VISTACEO cambió completamente cómo gestiono mi restaurante. Las misiones diarias son un game-changer.", name: "Martín R.", role: "Parrilla Don Martín" },
    { quote: "En 3 semanas aumenté un 18% la facturación siguiendo las recomendaciones del sistema.", name: "Carolina S.", role: "Studio de Yoga" },
    { quote: "Es como tener un consultor estratégico 24/7 pero a una fracción del costo. Increíble.", name: "Diego F.", role: "Agencia de Marketing" },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-[1000px] mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#2692DC] font-semibold mb-3">Testimonios</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-[#111] tracking-[-0.02em]">
              Lo que dicen nuestros usuarios.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <div className="rounded-2xl border border-black/[0.06] bg-white p-6 h-full flex flex-col hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#febc2e] text-[#febc2e]" />
                  ))}
                </div>
                <p className="text-[14px] text-[#666] leading-relaxed flex-1 mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-[14px] font-semibold text-[#111]">{t.name}</p>
                  <p className="text-[12px] text-[#999]">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ (kinso-style accordion) ---
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
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#746CE6] font-semibold mb-3">FAQs</p>
            <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-[#111] tracking-[-0.02em]">
              Preguntas frecuentes
            </h2>
            <p className="text-[14px] text-[#999] mt-3">Todo lo que necesitás saber sobre VISTACEO.</p>
          </div>
        </Reveal>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/[0.01] transition-colors"
                >
                  <span className="text-[15px] font-medium text-[#333] pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-[#ccc] flex-shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  open === i ? "max-h-40 pb-4" : "max-h-0"
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

// --- Final CTA ---
const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-6">
      <Reveal>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold text-[#111] tracking-[-0.02em] mb-4">
            Tu negocio merece
            <br />
            crecer más rápido.
          </h2>
          <p className="text-[16px] text-[#888] mb-8 max-w-md mx-auto">
            Unite a cientos de empresarios que ya usan VISTACEO para tomar mejores decisiones cada día.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="group bg-[#111] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#333] transition-all flex items-center gap-2 mx-auto shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          >
            Empezar gratis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </Reveal>
    </section>
  );
};

// --- Footer ---
const Footer = memo(() => (
  <footer className="border-t border-black/[0.06] py-10 px-6 bg-[#fafafa]">
    <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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

// --- Main ---
const LandingMinimalista = () => {
  return (
    <>
      <SiteHead
        path="/minimalista"
        title="VISTACEO — IA que hace crecer tu negocio"
        description="Inteligencia artificial que analiza tu negocio, detecta oportunidades y te entrega acciones concretas cada día."
      />
      <div className="min-h-screen bg-white text-[#111] overflow-x-hidden">
        <Header />
        <main>
          <HeroSection />
          <AppPreview />
          <LogoStrip />
          <HowItWorks />
          <Features />
          <Testimonials />
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LandingMinimalista;
