import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Brain, Target, TrendingUp, Zap, BarChart3, Shield, Sparkles, ChevronDown, CheckCircle2, Star, MessageSquare, Lightbulb, Radar, Clock } from "lucide-react";
import { SiteHead } from "@/components/seo/SiteHead";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

// --- Animated counter ---
const AnimatedNumber = memo(({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
});
AnimatedNumber.displayName = "AnimatedNumber";

// --- Scroll-reveal wrapper ---
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
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      {children}
    </div>
  );
});
Reveal.displayName = "Reveal";

// --- Header ---
const Header = memo(() => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#ffffff08]" : "bg-transparent"
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" width={28} height={28} />
          <span className="text-[15px] font-semibold tracking-wide text-[#fafafa]">VISTACEO</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[13px] text-[#888]">
          <a href="#features" className="hover:text-[#fafafa] transition-colors">Funciones</a>
          <a href="#how" className="hover:text-[#fafafa] transition-colors">Cómo funciona</a>
          <a href="#faq" className="hover:text-[#fafafa] transition-colors">FAQs</a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] text-[#888] hover:text-[#fafafa] transition-colors hidden sm:block"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="text-[13px] bg-[#fafafa] text-[#0a0a0a] px-5 py-2 rounded-full font-medium hover:bg-[#e0e0e0] transition-colors flex items-center gap-1.5"
          >
            Empezar gratis
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
});
Header.displayName = "Header";

// --- Hero ---
const HeroSection = () => {
  const navigate = useNavigate();
  const counter = useRealtimeCounter(500);

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #2692DC 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[180px] opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #746CE6 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Social proof pill */}
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ffffff10] bg-[#ffffff06] mb-10">
            <div className="flex -space-x-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2692DC] to-[#746CE6] border-2 border-[#0a0a0a]" />
              ))}
            </div>
            <span className="text-[13px] text-[#888]">
              <span className="text-[#fafafa] font-medium">{counter}</span> negocios activos
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-[#fafafa] leading-[1.08] tracking-tight mb-6">
            Inteligencia artificial
            <br />
            <span className="bg-gradient-to-r from-[#2692DC] to-[#746CE6] bg-clip-text text-transparent">
              que hace crecer
            </span>
            <br />
            tu negocio.
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={200}>
          <p className="text-[17px] sm:text-lg text-[#666] max-w-xl mx-auto mb-10 leading-relaxed">
            VISTACEO analiza tu negocio, detecta oportunidades y entrega acciones concretas cada día. Como tener un CEO estratégico disponible 24/7.
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={300}>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="group relative overflow-hidden bg-[#fafafa] text-[#0a0a0a] px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#e0e0e0] transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(38,146,220,0.15)]"
            >
              <Sparkles className="w-4 h-4" />
              Empezar gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#how"
              className="text-[14px] text-[#666] hover:text-[#fafafa] transition-colors flex items-center gap-1.5"
            >
              Ver cómo funciona
              <ChevronDown className="w-3.5 h-3.5" />
            </a>
          </div>
        </Reveal>

        {/* Feature pills */}
        <Reveal delay={400}>
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {[
              { icon: Brain, label: "Análisis IA 24/7" },
              { icon: Target, label: "Misiones diarias" },
              { icon: TrendingUp, label: "Crecimiento medible" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#ffffff06] border border-[#ffffff08] text-[13px] text-[#888]">
                <Icon className="w-3.5 h-3.5 text-[#2692DC]" />
                {label}
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-[#333]" />
      </div>
    </section>
  );
};

// --- App preview mockup ---
const AppPreview = () => (
  <section className="relative py-20 px-6">
    <Reveal>
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-2xl border border-[#ffffff08] bg-[#111111] overflow-hidden shadow-2xl shadow-black/50">
          {/* Browser dots */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#ffffff06]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <div className="flex-1 mx-4">
              <div className="h-5 rounded-md bg-[#ffffff06] max-w-xs mx-auto flex items-center justify-center">
                <span className="text-[10px] text-[#444]">vistaceo.com/app</span>
              </div>
            </div>
          </div>
          {/* Mock app content */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dashboard cards */}
            {[
              { label: "Salud del Negocio", value: "87", suffix: "/100", icon: BarChart3, color: "#28c840" },
              { label: "Misiones Activas", value: "4", suffix: " hoy", icon: Target, color: "#2692DC" },
              { label: "Oportunidades", value: "12", suffix: " detectadas", icon: Radar, color: "#746CE6" },
              { label: "Impacto", value: "+23", suffix: "% revenue", icon: TrendingUp, color: "#febc2e" },
            ].map((card) => (
              <div key={card.label} className="rounded-xl bg-[#0a0a0a] border border-[#ffffff08] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  <span className="text-[12px] text-[#666]">{card.label}</span>
                </div>
                <div className="text-2xl font-semibold text-[#fafafa]">
                  {card.value}<span className="text-sm text-[#555] font-normal">{card.suffix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  </section>
);

// --- How it works ---
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Conectá tu negocio",
      description: "Contestá preguntas sobre tu empresa. VISTACEO aprende de tu contexto, industria y objetivos para personalizar todo.",
      icon: MessageSquare,
    },
    {
      number: "02",
      title: "Recibí análisis diario",
      description: "Cada día, el sistema analiza oportunidades, riesgos y tendencias basándose en los datos de tu negocio.",
      icon: Brain,
    },
    {
      number: "03",
      title: "Ejecutá misiones",
      description: "Misiones accionables con pasos concretos. Cada una está diseñada para generar impacto medible en tu negocio.",
      icon: Target,
    },
    {
      number: "04",
      title: "Medí el crecimiento",
      description: "Dashboards inteligentes que muestran tu evolución. Predicciones y alertas para tomar decisiones proactivas.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="how" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#2692DC] font-medium">Cómo funciona</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#fafafa] mt-3 tracking-tight">
              De la información a la acción<br className="hidden sm:block" /> en cuatro pasos.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="group relative rounded-2xl border border-[#ffffff08] bg-[#0d0d0d] p-6 sm:p-8 hover:border-[#ffffff14] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#2692DC]/20 to-[#746CE6]/10 flex items-center justify-center border border-[#ffffff08]">
                    <step.icon className="w-5 h-5 text-[#2692DC]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#444] font-mono">{step.number}</span>
                    <h3 className="text-[17px] font-semibold text-[#fafafa] mt-0.5 mb-2">{step.title}</h3>
                    <p className="text-[14px] text-[#666] leading-relaxed">{step.description}</p>
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

// --- Features ---
const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Cerebro IA adaptativo",
      description: "Aprende de cada interacción. Cuanto más lo usás, más preciso y personalizado se vuelve.",
    },
    {
      icon: Target,
      title: "Misiones accionables",
      description: "No solo te dice qué hacer. Te entrega pasos concretos con definición de éxito y deadline.",
    },
    {
      icon: Radar,
      title: "Radar de oportunidades",
      description: "Detecta automáticamente tendencias, riesgos y oportunidades relevantes para tu industria.",
    },
    {
      icon: BarChart3,
      title: "Analíticas inteligentes",
      description: "Dashboards que se adaptan a tu tipo de negocio. Métricas que importan, no ruido.",
    },
    {
      icon: Lightbulb,
      title: "Predicciones",
      description: "Anticipa escenarios futuros basados en patrones de tu negocio y variables de mercado.",
    },
    {
      icon: Shield,
      title: "Seguridad empresarial",
      description: "Tus datos protegidos con encriptación de nivel empresarial. Privacidad garantizada.",
    },
  ];

  return (
    <section id="features" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#746CE6] font-medium">Funciones</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#fafafa] mt-3 tracking-tight">
              Todo lo que necesitás<br className="hidden sm:block" /> para escalar tu negocio.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <div className="rounded-2xl border border-[#ffffff08] bg-[#0d0d0d] p-6 hover:border-[#ffffff14] transition-all duration-300 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#ffffff06] border border-[#ffffff08] flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#888]" />
                </div>
                <h3 className="text-[16px] font-semibold text-[#fafafa] mb-2">{feature.title}</h3>
                <p className="text-[14px] text-[#555] leading-relaxed">{feature.description}</p>
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
  const testimonials = [
    {
      quote: "VISTACEO cambió completamente cómo gestiono mi restaurante. Las misiones diarias son un game-changer.",
      name: "Martín R.",
      role: "Parrilla Don Martín",
      rating: 5,
    },
    {
      quote: "En 3 semanas aumenté un 18% la facturación siguiendo las recomendaciones del sistema.",
      name: "Carolina S.",
      role: "Studio de Yoga",
      rating: 5,
    },
    {
      quote: "Es como tener un consultor estratégico 24/7 pero a una fracción del costo. Increíble.",
      name: "Diego F.",
      role: "Agencia de Marketing",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#2692DC] font-medium">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#fafafa] mt-3 tracking-tight">
              Lo que dicen nuestros usuarios.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="rounded-2xl border border-[#ffffff08] bg-[#0d0d0d] p-6 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#febc2e] text-[#febc2e]" />
                  ))}
                </div>
                <p className="text-[14px] text-[#999] leading-relaxed flex-1 mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-[14px] font-medium text-[#fafafa]">{t.name}</p>
                  <p className="text-[12px] text-[#555]">{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- FAQ ---
const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: "¿Para qué tipo de negocios sirve VISTACEO?",
      a: "Para cualquier negocio, empresa o servicio profesional. Restaurantes, clínicas, estudios, agencias, comercios, freelancers, startups y más. El sistema se adapta a tu industria automáticamente.",
    },
    {
      q: "¿Cómo aprende de mi negocio?",
      a: "Mediante preguntas inteligentes que hacemos sobre tu operación, clientes, finanzas y objetivos. Cuanto más interactuás, más preciso se vuelve. No necesitás conectar sistemas externos.",
    },
    {
      q: "¿Qué son las misiones?",
      a: "Son acciones concretas y accionables que el sistema genera cada día basándose en el análisis de tu negocio. Cada misión tiene pasos claros, definición de éxito y deadline.",
    },
    {
      q: "¿Mis datos están seguros?",
      a: "Sí. Usamos encriptación de nivel empresarial. Tus datos nunca se comparten con terceros y solo se usan para mejorar tus recomendaciones.",
    },
    {
      q: "¿Puedo probarlo gratis?",
      a: "Sí. Podés empezar gratis sin tarjeta de crédito. Accedés al diagnóstico de salud, preguntas inteligentes y funciones básicas del sistema.",
    },
  ];

  return (
    <section id="faq" className="relative py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#746CE6] font-medium">FAQs</span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#fafafa] mt-3 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
        </Reveal>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="border border-[#ffffff08] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#ffffff04] transition-colors"
                >
                  <span className="text-[15px] font-medium text-[#ccc] pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-[#555] flex-shrink-0 transition-transform duration-200",
                    open === i && "rotate-180"
                  )} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  open === i ? "max-h-40 pb-4" : "max-h-0"
                )}>
                  <p className="px-5 text-[14px] text-[#666] leading-relaxed">{faq.a}</p>
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
    <section className="relative py-28 px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #2692DC 0%, transparent 70%)" }} />
      </div>
      <Reveal>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#fafafa] tracking-tight mb-4">
            Tu negocio merece<br /> crecer más rápido.
          </h2>
          <p className="text-[16px] text-[#666] mb-8 max-w-md mx-auto">
            Unite a cientos de empresarios que ya usan VISTACEO para tomar mejores decisiones cada día.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="group bg-[#fafafa] text-[#0a0a0a] px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-[#e0e0e0] transition-all flex items-center gap-2 mx-auto shadow-[0_0_40px_rgba(38,146,220,0.15)]"
          >
            <Sparkles className="w-4 h-4" />
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
  <footer className="border-t border-[#ffffff08] py-10 px-6">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <img src="/favicon.png" alt="" className="w-5 h-5 object-contain" width={20} height={20} />
        <span className="text-[13px] text-[#555]">© 2025 VISTACEO. Todos los derechos reservados.</span>
      </div>
      <div className="flex items-center gap-6 text-[13px] text-[#444]">
        <a href="https://www.vistaceo.com/condiciones" className="hover:text-[#888] transition-colors">Condiciones</a>
        <a href="https://www.vistaceo.com/politicas" className="hover:text-[#888] transition-colors">Privacidad</a>
        <a href="mailto:info@vistaceo.com" className="hover:text-[#888] transition-colors">Contacto</a>
      </div>
    </div>
  </footer>
));
Footer.displayName = "Footer";

// --- Main page ---
const LandingMinimalista = () => {
  return (
    <>
      <SiteHead
        path="/minimalista"
        title="VISTACEO — IA que hace crecer tu negocio"
        description="Inteligencia artificial que analiza tu negocio, detecta oportunidades y te entrega acciones concretas cada día."
      />
      <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] overflow-x-hidden">
        <Header />
        <main>
          <HeroSection />
          <AppPreview />
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
