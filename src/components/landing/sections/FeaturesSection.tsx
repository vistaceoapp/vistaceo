import { useEffect, useRef, memo } from "react";
import { Brain, Target, Radar, MessageSquare, BarChart3, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Brain,
    title: "Cerebro Adaptativo",
    description: "Aprende de tu negocio cada día y se vuelve más inteligente con cada interacción.",
    highlight: "IA que evoluciona",
  },
  {
    icon: Target,
    title: "Misiones Diarias",
    description: "Acciones concretas con impacto medible. Sabés exactamente qué hacer cada día.",
    highlight: "Resultados claros",
  },
  {
    icon: Radar,
    title: "Radar de Oportunidades",
    description: "Detecta tendencias, señales del mercado y oportunidades antes que tu competencia.",
    highlight: "Ventaja competitiva",
  },
  {
    icon: MessageSquare,
    title: "Mentor 24/7",
    description: "Consultá cualquier duda de tu negocio. Como tener un director experimentado disponible siempre.",
    highlight: "Asesoramiento constante",
  },
  {
    icon: BarChart3,
    title: "Analíticas Inteligentes",
    description: "Métricas que importan, no vanidad. Entiende la salud real de tu negocio.",
    highlight: "Decisiones informadas",
  },
  {
    icon: Shield,
    title: "Privacidad Total",
    description: "Tus datos son tuyos. Sin vender información a terceros. Seguridad enterprise.",
    highlight: "100% confidencial",
  },
];

const FeatureCard = memo(({ feature, index }: { feature: typeof features[0]; index: number }) => {
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
      className="animate-on-scroll group"
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="h-full p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
          <feature.icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
        <p className="text-muted-foreground mb-4">{feature.description}</p>
        <Badge variant="secondary" className="text-xs border border-primary/20">{feature.highlight}</Badge>
      </div>
    </div>
  );
});
FeatureCard.displayName = "FeatureCard";

export const FeaturesSection = memo(() => {
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
    <section id="características" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={headerRef} className="text-center mb-12 md:mb-16 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
            Características
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Todo para <span className="text-gradient-primary">crecer</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramientas de IA diseñadas para dueños de negocios que quieren resultados sin complicaciones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";
export default FeaturesSection;
