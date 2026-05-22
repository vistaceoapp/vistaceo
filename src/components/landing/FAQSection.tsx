import { motion } from "framer-motion";
import { Sparkles, Building2, Settings, TrendingUp, Radar, Eye, GraduationCap, Rocket, CreditCard, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    icon: Sparkles,
    question: "¿Qué es VISTACEO?",
    answer: `VISTACEO es una plataforma con inteligencia artificial que funciona como un **CEO digital** para tu empresa, negocio o servicio. Aprende de tu negocio hasta convertirse en un experto en tu realidad, trabaja 24/7 y te ayuda con análisis personalizados para detectar oportunidades, anticipar riesgos, encontrar mejoras y decidir con más claridad cómo crecer.`,
  },
  {
    icon: Building2,
    question: "¿Para qué tipo de negocio sirve?",
    answer: `Sirve para **todo tipo de empresa, negocio o servicio**, físico o remoto. Puede adaptarse a comercios, restaurantes, clínicas, agencias, estudios profesionales, marcas personales, emprendimientos, consultoras, academias, negocios digitales, servicios B2B y proyectos en crecimiento.`,
  },
  {
    icon: Settings,
    question: "¿Cómo funciona?",
    answer: `Cargás información sobre tu negocio, objetivos, clientes, procesos y desafíos. A partir de eso, la IA **aprende de tus datos, integraciones y particularidades** hasta volverse cada vez más experta en tu negocio, para generar insights, alertas, misiones, predicciones y recomendaciones personalizadas.`,
  },
  {
    icon: TrendingUp,
    question: "¿Qué puede hacer por mi negocio?",
    answer: `Puede ayudarte a mejorar **ventas, marketing, operaciones, finanzas, atención al cliente, productividad, estrategia y toma de decisiones**. También puede detectar cuellos de botella, oportunidades ocultas, riesgos, tendencias, movimientos de la competencia y próximos pasos para avanzar.`,
  },
  {
    icon: Radar,
    question: "¿Qué son el Radar, las Misiones y los Insights?",
    answer: `El **Radar** muestra señales importantes como oportunidades, riesgos, tendencias, competencia o puntos críticos. Las **Misiones** convierten esas señales en acciones concretas. Los **Insights** te ayudan a entender qué está pasando, por qué pasa y qué conviene hacer.`,
  },
  {
    icon: Eye,
    question: "¿Puede analizar competencia, tendencias y predicciones?",
    answer: `Sí. Puede ayudarte a observar competidores, detectar cambios del mercado, identificar oportunidades de posicionamiento, **proyectar escenarios** y anticipar posibles riesgos o movimientos relevantes para tu rubro.`,
  },
  {
    icon: GraduationCap,
    question: "¿Necesito saber de inteligencia artificial para usarlo?",
    answer: `No. Está pensado para usarse de forma simple. **No necesitás conocimientos técnicos**. Compartís información, haces preguntas y recibís análisis, ideas, alertas, misiones y recomendaciones claras para accionar.`,
  },
  {
    icon: Rocket,
    question: "¿Puedo usarlo si mi negocio recién empieza o si ya está funcionando?",
    answer: `Sí. Si estás **empezando**, te ayuda a ordenar propuesta, prioridades, ventas, comunicación y próximos pasos. Si tu negocio **ya funciona**, puede analizar lo que sucede, detectar mejoras, revisar puntos críticos y ayudarte a decidir mejor cada día.`,
  },
  {
    icon: CreditCard,
    question: "¿Hay versión gratis, planes pagos y posibilidad de cancelar?",
    answer: `Sí. Puedes **empezar gratis** para probar la plataforma y ver cómo puede ayudarte. Los planes pagos permiten usarla con más profundidad, frecuencia y capacidad. Además, **puedes cancelar cuando quieras**, sin permanencias forzadas ni compromisos innecesarios.`,
  },
  {
    icon: Shield,
    question: "¿Es seguro cargar información de mi negocio?",
    answer: `Sí. La plataforma está pensada para trabajar con información importante de empresas, negocios y servicios. Tus datos se usan para **personalizar tu experiencia** y generar mejores análisis para vos, no para exponer ni compartir información sensible de tu empresa.`,
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="inline-block text-xs font-medium text-primary mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            Preguntas frecuentes
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            Todo lo que necesitás <span className="text-gradient-primary">saber</span>
          </h2>
          <p className="text-muted-foreground">
            Respuestas a las dudas más comunes sobre VISTACEO
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-xl px-5 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <faq.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-0">
                    <div className="pl-13 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {faq.answer.split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i} className="text-foreground font-medium">{part}</strong>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
