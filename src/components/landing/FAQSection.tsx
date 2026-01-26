import { motion } from "framer-motion";
import { ChevronDown, Building2, CreditCard, Brain, Shield, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    icon: Building2,
    question: "¿Qué tipos de negocio soporta VistaCEO?",
    answer: `VistaCEO está diseñado para **más de 180 tipos de negocio** organizados en **10 sectores principales**:

• **Gastronomía**: Restaurantes, cafeterías, bares, heladerías, panaderías, dark kitchens, food trucks...
• **Retail**: Tiendas de ropa, calzado, electrónica, joyerías, ferreterías, farmacias...
• **Salud & Bienestar**: Clínicas, consultorios, spas, gimnasios, estéticas, ópticas...
• **Turismo & Hotelería**: Hoteles, hostels, cabañas, agencias de viaje, tours...
• **Servicios Profesionales**: Agencias, consultorías, estudios contables, legales...
• **Educación**: Academias, institutos, tutorías, escuelas de idiomas...
• **Hogar & Decoración**: Mueblerías, decoración, construcción, inmobiliarias...
• **Transporte & Logística**: Flotas, mensajería, mudanzas, parking...
• **Agro & Industria**: Productores, distribuidores, procesadoras...
• **Tecnología & Digital**: Agencias digitales, SaaS, e-commerce...

El sistema adapta automáticamente las preguntas, métricas y recomendaciones según tu sector y tipo de negocio específico.`,
  },
  {
    icon: CreditCard,
    question: "¿Qué incluye el plan gratuito vs Pro?",
    answer: `**Plan Gratuito** (para siempre):
• Dashboard de salud completo con 7 dimensiones
• 3 misiones activas por mes
• 5 oportunidades del Radar I+D mensual
• Check-ins de pulso diarios
• Análisis básico de tu negocio

**Plan Pro** (desde $29 USD/mes):
• ✅ Misiones ilimitadas
• ✅ Chat con IA Mentor (texto + voz)
• ✅ Análisis de fotos y documentos
• ✅ Radar I+D completo (tendencias + competencia)
• ✅ Integración con Google Reviews
• ✅ Analytics avanzados y predictivos
• ✅ Soporte prioritario

En Argentina, pagás en pesos con MercadoPago. Para el resto del mundo, PayPal en USD.`,
  },
  {
    icon: Brain,
    question: "¿Cómo aprende VistaCEO sobre mi negocio?",
    answer: `VistaCEO utiliza un **Cerebro de Negocio** que aprende continuamente de múltiples fuentes:

1. **Setup inicial**: Respondés un cuestionario adaptado a tu sector (3-5 minutos)
2. **Check-ins diarios**: Tocás cómo te fue hoy en 10 segundos
3. **Preguntas de aprendizaje**: El sistema te hace preguntas personalizadas para entender mejor tu operación
4. **Tus decisiones**: Cada misión que completás, pausás o rechazás enseña al sistema qué funciona para vos
5. **Integraciones**: Si conectás Google Reviews u otras plataformas, el sistema analiza automáticamente

Mientras más usás VistaCEO, más preciso se vuelve. Empezás con ~70% de certeza y podés llegar a 95%+.`,
  },
  {
    icon: Zap,
    question: "¿Cuánto tiempo necesito dedicarle?",
    answer: `VistaCEO está diseñado para dueños de negocio **ocupados**:

• **Setup inicial**: 3-5 minutos (respondés preguntas simples)
• **Check-in diario**: 10 segundos (un toque: excelente, normal o flojo)
• **Revisar acciones**: 2-3 minutos por día

El sistema hace el trabajo pesado por vos: analiza datos, detecta patrones, investiga tendencias del mercado, y te presenta todo en acciones concretas con tiempo estimado e impacto proyectado.

**No tenés que ser experto en nada**. VistaCEO traduce todo a pasos simples que podés ejecutar.`,
  },
  {
    icon: Shield,
    question: "¿Mis datos están seguros?",
    answer: `Absolutamente. Tu información está protegida con:

• **Encriptación de extremo a extremo** en tránsito y en reposo
• **Infraestructura en la nube** de clase empresarial (Supabase/AWS)
• **Sin acceso de terceros**: Nunca vendemos ni compartimos tu información
• **Control total**: Podés exportar o eliminar tus datos cuando quieras

Además, VistaCEO **no requiere acceso a tu cuenta bancaria ni sistema de punto de venta**. Trabajamos con rangos y estimaciones que vos proporcionás, nunca datos financieros exactos.

Cumplimos con regulaciones de protección de datos de Argentina y Latinoamérica.`,
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
            Respuestas a las dudas más comunes sobre VistaCEO
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
