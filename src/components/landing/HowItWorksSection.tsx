import { Check, ArrowRight, Brain, Radar, Target, TrendingUp, Zap, Lightbulb, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import exact mockup images
import ceoChatImg from "@/assets/mockups/ceo-chat.png";
import radarExternoImg from "@/assets/mockups/radar-externo.png";
import radarInternoImg from "@/assets/mockups/radar-interno.png";

const steps = [
  {
    number: "01",
    icon: Brain,
    title: "Conectás tu negocio",
    description: "Elegí tu tipo de negocio y país. VistaCEO crea tu perfil inteligente en minutos.",
    details: [
      "+180 tipos de negocio soportados",
      "Restaurantes, clínicas, tiendas, agencias, servicios...",
      "Sin tarjeta de crédito",
    ],
  },
  {
    number: "02",
    icon: Radar,
    title: "El Radar detecta oportunidades",
    description: "Dos motores de inteligencia trabajan 24/7 para encontrar lo que vos no ves.",
    details: [
      "Radar Interno: analiza TUS datos y patrones",
      "Radar I+D: tendencias del mercado y competencia",
      "Oportunidades priorizadas por impacto real",
    ],
  },
  {
    number: "03",
    icon: Zap,
    title: "Recibís acciones cada día",
    description: "Cada mañana, acciones concretas con contexto, pasos claros y impacto estimado.",
    details: [
      "Basadas en diagnóstico real, no genéricas",
      "Tiempo estimado incluido",
      "Impacto económico calculado",
    ],
  },
  {
    number: "04",
    icon: Target,
    title: "Transformás en misiones",
    description: "Convertí oportunidades en misiones con guía paso a paso. VistaCEO aprende y mejora.",
    details: [
      "Guía detallada para cada objetivo",
      "Mejoras en: ventas, reputación, eficiencia, marketing...",
      "El sistema aprende qué funciona para vos",
    ],
  },
];

const improvementAreas = [
  { icon: TrendingUp, label: "Ventas" },
  { icon: BarChart3, label: "Finanzas" },
  { icon: Lightbulb, label: "Marketing" },
  { icon: Search, label: "Reputación" },
  { icon: Zap, label: "Eficiencia" },
  { icon: Brain, label: "Equipo" },
];

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block text-sm font-medium text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Inteligencia que <span className="text-gradient-primary">trabaja para vos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Un sistema que diagnostica, detecta oportunidades y te guía paso a paso.
          </p>
        </motion.div>

        {/* Intelligence Mockups - 3 images in a responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CEO Chat Mockup - Larger */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img 
                  src={ceoChatImg} 
                  alt="VistaCEO - CEO Chat" 
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">CEO Chat</span> — Tu mentor estratégico con personalidades ajustables
              </p>
            </motion.div>

            {/* Radar Mockups stacked */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img 
                    src={radarExternoImg} 
                    alt="VistaCEO - Radar Externo I+D" 
                    className="w-full h-auto"
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  <span className="font-medium text-foreground">Radar Externo</span> — Tendencias I+D del mercado
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img 
                    src={radarInternoImg} 
                    alt="VistaCEO - Radar Interno" 
                    className="w-full h-auto"
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  <span className="font-medium text-foreground">Radar Interno</span> — Diagnóstico de TU negocio
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Steps Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
            >
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl gradient-primary flex items-center justify-center font-bold text-sm text-white shadow-lg">
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {step.description}
              </p>

              {/* Details */}
              <ul className="space-y-2">
                {step.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Improvement areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <p className="text-sm text-muted-foreground mb-4">Áreas que podés mejorar con VistaCEO</p>
          <div className="flex flex-wrap justify-center gap-3">
            {improvementAreas.map((area, i) => (
              <motion.div
                key={area.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border"
              >
                <area.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{area.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            variant="hero" 
            size="lg" 
            className="group"
            onClick={() => navigate("/auth")}
          >
            Empezar gratis ahora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Sin tarjeta • 3 min de setup • Valor desde el día 1
          </p>
        </motion.div>
      </div>
    </section>
  );
};
