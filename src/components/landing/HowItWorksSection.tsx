import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Configurás en 3 minutos",
    description: "Elegí tu tipo de negocio y país. VistaCEO se adapta automáticamente.",
    details: [
      "Sin tarjeta de crédito",
      "+180 tipos de negocio",
      "Soporte multi-país",
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  },
  {
    number: "02",
    title: "VistaCEO aprende tu negocio",
    description: "Respondés check-ins rápidos de 10 segundos. La IA conecta los puntos.",
    details: [
      "Check-ins de 10 segundos",
      "Funciona sin integraciones",
      "Análisis inteligente automático",
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  },
  {
    number: "03",
    title: "Recibís tu acción del día",
    description: "Cada mañana, una acción concreta con impacto real. Sin ruido.",
    details: [
      "Priorizada por impacto",
      "Con pasos claros",
      "Tiempo estimado incluido",
    ],
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
  },
  {
    number: "04",
    title: "Ejecutás y crecés",
    description: "Marcás como hecho, VistaCEO aprende. Cada día más inteligente.",
    details: [
      "Memoria de lo que funciona",
      "Mejora continua",
      "Resultados medibles",
    ],
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&h=400&fit=crop",
  },
];

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
        <div className="max-w-6xl mx-auto space-y-24">
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
              {/* Image */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  {/* Glow */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-64 sm:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Overlay with step number */}
                    <div className="absolute top-4 right-4 w-14 h-14 rounded-xl gradient-primary flex items-center justify-center font-bold text-lg text-white shadow-lg">
                      {step.number}
                    </div>
                  </div>
                </div>
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
        </motion.div>
      </div>
    </section>
  );
};
