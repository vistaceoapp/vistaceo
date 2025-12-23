import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta en segundos",
    description: "Sin tarjeta, sin configuración. Solo elige tu tipo de negocio y país.",
    details: [
      "Detección automática de idioma",
      "Pack de gastronomía preconfigurado",
      "Listo para usar en 3 minutos",
    ],
    image: "🚀",
  },
  {
    number: "02",
    title: "UCEO analiza tu negocio",
    description: "Conecta integraciones o simplemente responde check-ins rápidos.",
    details: [
      "Funciona incluso sin conectar nada",
      "Check-ins de 10 segundos",
      "Análisis de fotos con IA",
    ],
    image: "🔍",
  },
  {
    number: "03",
    title: "Recibe tu acción del día",
    description: "Cada mañana, una acción prioritaria con contexto y pasos claros.",
    details: [
      "Basada en datos reales",
      "Personalizada a tu negocio",
      "Ejecutable en minutos",
    ],
    image: "🎯",
  },
  {
    number: "04",
    title: "Ejecuta y aprende",
    description: "Marca como hecho, registra el resultado. UCEO aprende y mejora.",
    details: [
      "Memoria de lo que funciona",
      "Ajuste automático",
      "Retroalimentación continua",
    ],
    image: "📈",
  },
];

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            De cero a tu primera mejora{" "}
            <span className="text-gradient-primary">en minutos</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Sin curvas de aprendizaje, sin configuración compleja. 
            El valor aparece desde el primer día.
          </p>
        </div>

        {/* Steps - Alternating layout */}
        <div className="max-w-6xl mx-auto space-y-24">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 lg:gap-20 items-center`}
            >
              {/* Visual */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                  
                  {/* Card */}
                  <div className="relative bg-card border border-primary/20 rounded-3xl p-8 lg:p-12 backdrop-blur-sm group-hover:border-primary/40 transition-all duration-500">
                    <div className="flex items-center justify-center">
                      <div className="text-8xl lg:text-9xl">{step.image}</div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center font-bold text-2xl text-primary-foreground shadow-lg glow-primary">
                      {step.number}
                    </div>
                    
                    {/* Decorative sparkles */}
                    <Sparkles className="absolute top-6 left-6 w-6 h-6 text-primary/40 animate-pulse" />
                    <Sparkles className="absolute bottom-6 right-6 w-4 h-4 text-accent/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <div className="max-w-lg">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <div className="inline-flex flex-col items-center">
            <OwlLogo size={48} className="mb-4 animate-float" />
            <p className="text-lg text-muted-foreground mb-6">
              ¿Listo para tu primera acción de mejora?
            </p>
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => navigate("/auth")}
            >
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
