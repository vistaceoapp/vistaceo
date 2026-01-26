import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MockupDashboard, MockupCheckin, MockupActionCard, MockupMission } from "./mockups";

const steps = [
  {
    number: "01",
    title: "Configurás en 3 minutos",
    description: "Elegí tu tipo de negocio y país. VistaCEO se adapta automáticamente a tu realidad.",
    details: [
      "Sin tarjeta de crédito",
      "+180 tipos de negocio",
      "Restaurantes, clínicas, tiendas, servicios...",
    ],
    mockup: "dashboard",
  },
  {
    number: "02",
    title: "Respondés check-ins de 10 segundos",
    description: "Sin complicaciones. Tocás cómo te fue hoy, y VistaCEO conecta los puntos por vos.",
    details: [
      "Un toque: excelente, normal o flojo",
      "Notas opcionales rápidas",
      "Funciona sin ninguna integración",
    ],
    mockup: "checkin",
  },
  {
    number: "03",
    title: "Recibís tu acción del día",
    description: "Cada mañana, una acción concreta con impacto real. Personalizada para tu negocio.",
    details: [
      "Priorizada por impacto económico",
      "Con pasos claros y tiempo estimado",
      "Basada en TUS datos, no genérica",
    ],
    mockup: "action",
  },
  {
    number: "04",
    title: "Ejecutás, aprendés, crecés",
    description: "Marcás como hecho, VistaCEO aprende qué funciona. Misiones estratégicas para crecer.",
    details: [
      "Memoria de lo que funciona",
      "Misiones con objetivos claros",
      "Resultados medibles semana a semana",
    ],
    mockup: "mission",
  },
];

const renderMockup = (type: string) => {
  switch (type) {
    case "dashboard":
      return <MockupDashboard />;
    case "checkin":
      return <MockupCheckin />;
    case "action":
      return <MockupActionCard />;
    case "mission":
      return <MockupMission />;
    default:
      return null;
  }
};

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            De cero a{" "}
            <span className="text-gradient-primary">resultados reales</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            4 pasos simples. Sin curvas de aprendizaje. El valor aparece desde el primer día.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-6xl mx-auto space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 lg:gap-16 items-center`}
            >
              {/* Mockup */}
              <div className="flex-1 w-full flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="relative"
                >
                  {/* Glow */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl opacity-50" />
                  
                  {/* Step number badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg text-white shadow-lg z-10">
                    {step.number}
                  </div>
                  
                  {/* Mockup component */}
                  <div className="relative">
                    {renderMockup(step.mockup)}
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <div className="max-w-lg">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-4">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground font-medium">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <Button 
            variant="hero" 
            size="xl" 
            className="group"
            onClick={() => navigate("/auth")}
          >
            Empezar gratis ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Sin tarjeta • Configuración en 3 minutos • Valor desde el día 1
          </p>
        </motion.div>
      </div>
    </section>
  );
};
