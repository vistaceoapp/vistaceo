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
    description: "No más parálisis de análisis. UCEO te dice exactamente qué hacer hoy.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Brain,
    title: "IA que Aprende",
    description: "Cada decisión alimenta el sistema. UCEO se vuelve más inteligente contigo.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Calendar,
    title: "Plan Semanal",
    description: "3 prioridades por semana con checklist claro y objetivos medibles.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageSquare,
    title: "Modo Conversación",
    description: "Habla con UCEO como con un socio. Por voz, foto o texto.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Radar de Oportunidades",
    description: "Detecta patrones ocultos en reseñas, ventas y redes sociales.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Funciona Sin Datos",
    description: "Check-ins de 10 segundos y análisis de fotos. Sin integraciones complejas.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Diseñado para usar con una mano mientras manejas tu negocio.",
    color: "from-teal-500 to-green-500",
  },
  {
    icon: Globe2,
    title: "Multi-país",
    description: "Argentina, México, Chile, Brasil y más. Vocabulario e integraciones locales.",
    color: "from-orange-500 to-amber-500",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute top-1/2 left-0 w-[40%] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[40%] h-[600px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            Características
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Todo lo que necesitas,{" "}
            <span className="text-gradient-primary">nada más</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            UCEO combina inteligencia artificial con simplicidad extrema. 
            Sin dashboards complicados, sin curvas de aprendizaje.
          </p>
        </div>

        {/* Features grid with bento-style layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <GlowingCard
              key={feature.title}
              className={`p-6 lg:p-8 group cursor-default ${
                index === 0 || index === 5 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {/* Icon with gradient background */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Learn more link (visible on hover) */}
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
