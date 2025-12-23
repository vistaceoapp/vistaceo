import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta en segundos",
    description: "Sin tarjeta, sin configuración. Solo elige tu tipo de negocio y país.",
    details: [
      "Detección automática de idioma y país",
      "Pack de gastronomía preconfigurado",
      "Listo para usar en 3 minutos",
    ],
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
  },
  {
    number: "04",
    title: "Ejecuta y aprende",
    description: "Marca como hecho, registra el resultado. UCEO aprende y mejora.",
    details: [
      "Memoria de lo que funciona",
      "Ajuste automático de recomendaciones",
      "Retroalimentación continua",
    ],
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-card/50 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            De cero a tu primera mejora{" "}
            <span className="text-gradient-primary">en minutos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sin curvas de aprendizaje, sin configuración compleja. 
            El valor aparece desde el primer día.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative flex gap-6 md:gap-10 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-border" />
              )}

              {/* Step number */}
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg glow-primary z-10">
                {step.number}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {step.description}
                </p>

                {/* Details */}
                <ul className="space-y-2">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button variant="hero" size="xl" className="group">
            Empezar ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
