import { 
  Zap, 
  Brain, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Shield,
  Smartphone,
  Globe2,
  ArrowRight
} from "lucide-react";
import { GlowingCard } from "./GlowingCard";

const features = [
  {
    icon: Zap,
    title: "1 Acción Diaria",
    description: "No más parálisis de análisis. vistaceo te dice exactamente qué hacer hoy.",
  },
  {
    icon: Brain,
    title: "IA que Aprende",
    description: "Cada decisión alimenta el sistema. Se vuelve más inteligente contigo.",
  },
  {
    icon: Calendar,
    title: "Plan Semanal",
    description: "3 prioridades por semana con checklist claro y objetivos medibles.",
  },
  {
    icon: MessageSquare,
    title: "Modo Conversación",
    description: "Habla con vistaceo como con un socio. Por voz, foto o texto.",
  },
  {
    icon: BarChart3,
    title: "Radar de Oportunidades",
    description: "Detecta patrones ocultos en tus datos y el mercado.",
  },
  {
    icon: Shield,
    title: "Sin Configuración",
    description: "Check-ins rápidos y análisis inteligente. Sin integraciones complejas.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Diseñado para usar mientras manejas tu negocio.",
  },
  {
    icon: Globe2,
    title: "Multi-país",
    description: "Argentina, México, Chile, Brasil y más. Vocabulario local.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Características
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
            Todo lo que necesitas,{" "}
            <span className="text-gradient-primary">nada más</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            vistaceo combina inteligencia artificial con simplicidad extrema. 
            Sin dashboards complicados, sin curvas de aprendizaje.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <GlowingCard
              key={feature.title}
              className={`p-6 lg:p-8 group cursor-default ${
                index === 0 || index === 5 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Learn more link */}
              <div className="flex items-center gap-2 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm font-medium">Saber más</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </GlowingCard>
          ))}
        </div>
      </div>
    </section>
  );
};
