import { 
  Zap, 
  Brain, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Shield,
  Smartphone,
  Globe2
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "1 Acción Diaria",
    description: "No más parálisis de análisis. UCEO te dice exactamente qué hacer hoy para mejorar tu negocio.",
  },
  {
    icon: Brain,
    title: "IA que Aprende",
    description: "Cada decisión, cada resultado alimenta el sistema. UCEO se vuelve más inteligente con tu negocio.",
  },
  {
    icon: Calendar,
    title: "Plan Semanal",
    description: "3 prioridades por semana con checklist claro. Convierte objetivos en acciones realizables.",
  },
  {
    icon: MessageSquare,
    title: "Modo Conversación",
    description: "Habla con UCEO como con un socio. Responde por voz, foto o simplemente tocando chips.",
  },
  {
    icon: BarChart3,
    title: "Radar de Oportunidades",
    description: "Detecta patrones ocultos en reseñas, ventas y redes. Encuentra oportunidades antes que la competencia.",
  },
  {
    icon: Shield,
    title: "Funciona Sin Datos",
    description: "Incluso sin integraciones, UCEO te da valor con check-ins de 10 segundos y análisis de fotos.",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Diseñado para usar con una mano mientras manejas tu negocio. Respuestas en segundos, no minutos.",
  },
  {
    icon: Globe2,
    title: "Multi-país",
    description: "Argentina, México, Chile, Brasil, Colombia y más. Vocabulario, moneda e integraciones locales.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Todo lo que tu negocio necesita,{" "}
            <span className="text-gradient-primary">nada más</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            UCEO combina inteligencia artificial con simplicidad extrema. 
            Sin dashboards complicados, sin curvas de aprendizaje.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-lg neon-border-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/30">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
