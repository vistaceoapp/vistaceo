import { memo, useRef, useEffect } from "react";
import { Check, ArrowRight, Brain, Radar, Target, Zap, TrendingUp, BarChart3, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

// Import ALL mockup images - best ones
import dashboardMainImg from "@/assets/mockups/dashboard-main.png";
import analyticsSaludImg from "@/assets/mockups/analytics-salud.png";
import misionesImg from "@/assets/mockups/misiones.png";
import radarInternoImg from "@/assets/mockups/radar-interno.png";
import ceoChatImg from "@/assets/mockups/ceo-chat.png";
import radarExternoImg from "@/assets/mockups/radar-externo.png";

const steps = [
  {
    number: "01",
    icon: Brain,
    title: "Conectás tu negocio",
    description: "Elegí tu tipo de negocio y país. VistaCEO crea tu perfil inteligente en minutos.",
    details: [
      "+180 tipos de negocio soportados",
      "Restaurantes, clínicas, tiendas, servicios...",
      "Sin tarjeta de crédito",
    ],
  },
  {
    number: "02",
    icon: Radar,
    title: "El Radar detecta oportunidades",
    description: "Dos motores de inteligencia trabajan 24/7 para encontrar lo que vos no ves.",
    details: [
      "Radar Interno: analiza TUS datos",
      "Radar I+D: tendencias del mercado",
      "Oportunidades priorizadas por impacto",
    ],
  },
  {
    number: "03",
    icon: Zap,
    title: "Recibís acciones cada día",
    description: "Cada mañana, acciones concretas con contexto, pasos claros y impacto estimado.",
    details: [
      "Basadas en diagnóstico real",
      "Tiempo estimado incluido",
      "Impacto económico calculado",
    ],
  },
  {
    number: "04",
    icon: Target,
    title: "Transformás en misiones",
    description: "Convertí oportunidades en misiones con guía paso a paso.",
    details: [
      "Guía detallada para cada objetivo",
      "Ventas, reputación, eficiencia...",
      "El sistema aprende de vos",
    ],
  },
];

const improvementAreas = [
  { icon: TrendingUp, label: "Ventas" },
  { icon: BarChart3, label: "Finanzas" },
  { icon: Lightbulb, label: "Marketing" },
  { icon: Search, label: "Reputación" },
  { icon: Zap, label: "Eficiencia" },
];

const StepCard = memo(({ step, index }: { step: typeof steps[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="animate-on-scroll relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 transition-colors"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute -top-3 -left-3 w-9 h-9 md:w-10 md:h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-xs md:text-sm text-white shadow-lg">
        {step.number}
      </div>
      
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 mt-2">
        <step.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{step.title}</h3>
      <p className="text-muted-foreground text-sm mb-3 md:mb-4">{step.description}</p>

      <ul className="space-y-1.5 md:space-y-2">
        {step.details.map((detail) => (
          <li key={detail} className="flex items-start gap-2 text-xs md:text-sm">
            <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-foreground/80">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
StepCard.displayName = "StepCard";

export const HowItWorksSection = memo(() => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-16 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12 md:mb-16 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
            Cómo funciona
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            Inteligencia que <span className="text-gradient-primary">trabaja para vos</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Un sistema que diagnostica, detecta oportunidades y te guía paso a paso.
          </p>
        </div>

        {/* HERO MOCKUP - Dashboard principal */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16 animate-on-scroll">
          <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <img 
              src={dashboardMainImg} 
              alt="VistaCEO - Dashboard Principal" 
              width={1200}
              height={675}
              loading="eager"
              decoding="async"
              className="w-full h-auto"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground text-center">
            <span className="font-semibold text-foreground">Dashboard Principal</span> — Tu centro de comando diario
          </p>
        </div>

        {/* Mockups Grid - 2x2 layout with best mockups */}
        <div className="max-w-6xl mx-auto mb-16 md:mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Analytics Salud */}
            <div className="animate-on-scroll">
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
                <img 
                  src={analyticsSaludImg} 
                  alt="VistaCEO - Salud del Negocio" 
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">Salud del Negocio</span> — Diagnóstico integral
              </p>
            </div>

            {/* Misiones */}
            <div className="animate-on-scroll" style={{ transitionDelay: '100ms' }}>
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
                <img 
                  src={misionesImg} 
                  alt="VistaCEO - Misiones" 
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">Misiones</span> — Guía paso a paso
              </p>
            </div>

            {/* Radar Interno */}
            <div className="animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
                <img 
                  src={radarInternoImg} 
                  alt="VistaCEO - Radar Interno" 
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">Radar Interno</span> — Oportunidades de tu negocio
              </p>
            </div>

            {/* CEO Chat */}
            <div className="animate-on-scroll" style={{ transitionDelay: '300ms' }}>
              <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-border bg-card">
                <img 
                  src={ceoChatImg} 
                  alt="VistaCEO - CEO Chat" 
                  width={600}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">CEO Chat</span> — Mentor estratégico 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>

        {/* Improvement areas */}
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12 animate-on-scroll">
          <p className="text-sm text-muted-foreground mb-4">Áreas que podés mejorar</p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {improvementAreas.map((area) => (
              <div
                key={area.label}
                className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-secondary/80 border border-border"
              >
                <area.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" aria-hidden="true" />
                <span className="text-xs md:text-sm font-medium text-foreground">{area.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center animate-on-scroll">
          <Button 
            size="lg" 
            className="gradient-primary text-primary-foreground rounded-full px-8 py-6 text-base md:text-lg font-semibold shadow-xl shadow-primary/25"
            onClick={() => navigate("/auth")}
          >
            Empezar gratis ahora
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Sin tarjeta • 3 min de setup • Valor desde el día 1
          </p>
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = "HowItWorksSection";
export default HowItWorksSection;
