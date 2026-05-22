import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  CreditCard, 
  Brain, 
  Shield, 
  Zap, 
  Radar as RadarIcon, 
  Target, 
  Heart, 
  TrendingUp,
  Sparkles 
} from "lucide-react";
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
    answer: `**VISTACEO es tu CEO digital con inteligencia artificial.** Es una plataforma que actúa como un director ejecutivo virtual para tu negocio, analizando datos, detectando oportunidades y diciéndote exactamente qué hacer cada día para crecer.

**¿Cómo funciona?**
1. Configuras tu negocio en 3-5 minutos
2. VISTACEO analiza tu situación y crea un diagnóstico completo
3. Cada día recibes misiones personalizadas: acciones concretas para mejorar ventas, reducir costos, atraer más clientes
4. El sistema aprende de tus resultados y se vuelve más inteligente con el tiempo

**¿Para quién es?**
Para dueños de negocios, emprendedores y profesionales independientes que quieren tomar mejores decisiones sin necesitar un equipo de consultores. Funciona para cualquier tipo de negocio o servicio, en cualquier sector.

**Lo que te da VISTACEO:**
• Un cerebro estratégico que piensa en tu negocio 24/7
• Misiones diarias con pasos concretos para ejecutar
• Diagnóstico de salud de tu negocio en tiempo real
• Detección de oportunidades que no estás viendo
• Todo 100% personalizado a tu realidad y tu mercado`,
  },
  {
    icon: Building2,
    question: "¿Qué tipo de negocios pueden usar VistaCEO?",
    answer: `VistaCEO está diseñado para potenciar **cualquier negocio** con operaciones en LATAM, sin importar su tamaño o sector. El sistema se adapta a **más de 180 tipos de negocio** organizados en **10 sectores principales**:

• **Gastronomía**: Restaurantes, cafeterías, bares, heladerías, panaderías, dark kitchens, food trucks, pizzerías, hamburgueserías, sushi bars, cervecerías artesanales...
• **Retail & Comercio**: Tiendas de ropa, calzado, electrónica, joyerías, ferreterías, farmacias, librerías, jugueterías, perfumerías, tiendas gourmet, pet shops...
• **Salud & Bienestar**: Clínicas dentales, consultorios médicos, spas, gimnasios, centros estéticos, ópticas, laboratorios, kinesiólogos, nutricionistas, psicólogos...
• **Turismo & Hotelería**: Hoteles boutique, hostels, cabañas, agencias de viaje, tours operadores, apart-hoteles, bodegas con visitas...
• **Servicios Profesionales**: Agencias de marketing, consultorías, estudios contables, estudios jurídicos, arquitectura, desarrolladores de software, productoras audiovisuales...
• **Educación**: Academias de idiomas, institutos, tutorías, escuelas de música, centros de capacitación corporativa, plataformas de e-learning...
• **Hogar & Construcción**: Mueblerías, decoración de interiores, inmobiliarias, constructoras, arquitectos, paisajismo...
• **Transporte & Logística**: Flotas de transporte, mensajería, mudanzas, parking, rent-a-car...
• **Agro & Industria**: Productores, distribuidores, procesadoras, bodegas, exportadores...
• **Tecnología & Digital**: Agencias digitales, SaaS, e-commerce D2C, marketplaces, startups tecnológicas...

El sistema adapta automáticamente las preguntas, métricas, misiones y recomendaciones según tu sector, tipo de negocio específico y ubicación geográfica.`,
  },
  {
    icon: CreditCard,
    question: "¿Cómo funciona el plan gratuito?",
    answer: `¡El plan gratuito de VistaCEO **funciona perfectamente desde el primer día** y es **totalmente gratuito para siempre**! No es una prueba limitada en el tiempo.

**Lo que incluye el plan gratuito:**
• ✅ **Cerebro Personal**: Un asistente IA que aprende continuamente sobre tu negocio
• ✅ **Dashboard de Salud**: Visión completa de las 7 dimensiones de tu negocio
• ✅ **3 Oportunidades del Radar nuevas por mes**: Detección de áreas de mejora internas y externas
• ✅ **3 Misiones activas por mes**: Tareas guiadas para impulsar tu crecimiento
• ✅ **3 Preguntas al Chat IA por mes**: Análisis profundos y personalizados
• ✅ **Check-ins de Pulso Diarios**: Registro rápido de cómo te fue cada día

**Funcionalidades que NO incluye el plan gratuito:**
• ❌ **Analytics y Métricas Avanzadas**: Dashboards detallados con evolución histórica, comparativas de períodos, exportación de reportes y métricas por dimensión
• ❌ **Predicciones IA**: Motor predictivo que anticipa tendencias de ventas, detecta riesgos antes de que ocurran y sugiere acciones preventivas basadas en patrones históricos
• ❌ **Misiones Ilimitadas**: Sin límite en la cantidad de misiones activas simultáneas
• ❌ **Radar de Oportunidades Ilimitado**: Análisis continuo sin restricciones de oportunidades internas y de mercado
• ❌ **Chat IA Ilimitado**: Conversaciones sin límite incluyendo análisis de fotos, documentos y reportes

VistaCEO está diseñado para crecer contigo. Empieza gratis, y cuando estés listo para escalar, activa Pro.`,
  },
  {
    icon: RadarIcon,
    question: "¿Qué es el Radar de Oportunidades?",
    answer: `El **Radar de Oportunidades** es una de las herramientas más poderosas de VistaCEO. Analiza continuamente múltiples fuentes para detectar **oportunidades de crecimiento personalizadas** para tu negocio.

**Radar Interno** — Analiza tu operación:
• Detecta patrones en tus ventas y operaciones
• Identifica días/horarios de bajo rendimiento
• Sugiere optimizaciones basadas en tu historial
• Encuentra oportunidades de mejora en tu servicio

**Radar I+D (Externo)** — Analiza tu mercado:
• Monitorea tendencias emergentes en tu sector
• Detecta movimientos de la competencia
• Identifica oportunidades de innovación
• Sugiere nuevos productos o servicios basados en demanda real

Cada oportunidad viene con un **plan de acción detallado** que puedes convertir en una Misión ejecutable.`,
  },
  {
    icon: Target,
    question: "¿Qué son las Misiones?",
    answer: `Las **Misiones** son tareas guiadas y accionables diseñadas específicamente para tu negocio. Cada misión te lleva paso a paso hacia un objetivo concreto.

**Características de las Misiones:**
• **Personalizadas**: Basadas en los datos de tu negocio, no genéricas
• **Paso a paso**: Cada misión tiene etapas claras y ejecutables
• **Con impacto medible**: Sabes exactamente qué resultado esperar
• **Adaptadas a tu tiempo**: Indicamos el esfuerzo estimado de cada una

**Ejemplos de Misiones:**
• "Recuperar el 15% de clientes inactivos del último trimestre"
• "Optimizar tu carta eliminando 3 platos de bajo margen"
• "Implementar sistema de reseñas para subir tu rating"
• "Lanzar promoción estratégica para el horario de las 15-17h"

Las misiones se generan desde el Radar, desde el Chat con el Mentor IA, o desde insights del sistema.`,
  },
  {
    icon: Heart,
    question: "¿Cómo funciona la Salud del Negocio?",
    answer: `La **Salud del Negocio** es un indicador integral que te muestra el estado real de tu empresa en un vistazo. VistaCEO evalúa **7 dimensiones críticas**:

• **📈 Ventas**: Volumen, tendencia, ticket promedio
• **💰 Finanzas**: Márgenes, costos, flujo de caja
• **📣 Marketing**: Visibilidad, alcance, conversión
• **🚀 Crecimiento**: Tendencias, captación, expansión
• **⚙️ Operaciones**: Eficiencia, tiempos, procesos
• **👥 Equipo**: Productividad, rotación, clima laboral
• **🚀 Innovación**: Nuevos productos, mejoras, adaptación

Cada dimensión tiene un **puntaje de 0-100** y una **tendencia** (mejorando, estable o bajando). El sistema te muestra qué áreas requieren atención inmediata y cuáles están funcionando bien.

Mientras más interactuás con VistaCEO, más preciso se vuelve el diagnóstico de salud.`,
  },
  {
    icon: Brain,
    question: "¿Cómo aprende VistaCEO sobre mi negocio?",
    answer: `VistaCEO utiliza un **Cerebro de Negocio** que aprende continuamente de múltiples fuentes:

**1. Setup inicial** (3-5 minutos)
Respondes un cuestionario adaptado a tu sector específico

**2. Check-ins diarios** (10 segundos)
Indicas cómo te fue hoy: excelente, normal o flojo

**3. Preguntas de aprendizaje**
El sistema te hace preguntas personalizadas para entender mejor tu operación

**4. Tus decisiones**
Cada misión que completas, pausas o rechazas enseña al sistema qué funciona para ti

**5. Integraciones** (opcional)
Tus decisiones y acciones diarias alimentan el sistema continuamente

**El resultado:**
• Empiezas con ~70% de certeza
• Con uso regular, llegas a 90-95%+ de precisión
• Las recomendaciones se vuelven cada vez más acertadas
• El sistema anticipa tus necesidades antes de que las menciones`,
  },
  {
    icon: TrendingUp,
    question: "¿Puedo tener diferentes objetivos para mi negocio?",
    answer: `¡Absolutamente! Cada negocio es único y VistaCEO se adapta a **tus objetivos específicos**. Puedes enfocarte en:

**Objetivos de Crecimiento:**
• Aumentar ventas mensuales
• Expandir a nuevas ubicaciones
• Lanzar nuevos productos o servicios
• Captar más clientes nuevos

**Objetivos de Rentabilidad:**
• Mejorar márgenes de ganancia
• Reducir costos operativos
• Optimizar inventario
• Negociar mejor con proveedores

**Objetivos de Posicionamiento:**
• Mejorar experiencia del cliente
• Aumentar recomendaciones
• Construir marca reconocida
• Diferenciarse de la competencia

**Objetivos de Eficiencia:**
• Automatizar procesos repetitivos
• Reducir tiempos de espera
• Optimizar turnos y personal
• Digitalizar operaciones

VistaCEO prioriza las misiones y recomendaciones según el objetivo que elijas como foco principal.`,
  },
  {
    icon: Zap,
    question: "¿Cuánto tiempo necesito dedicarle?",
    answer: `VistaCEO está diseñado para dueños de negocio **ocupados**:

• **Setup inicial**: 3-5 minutos (respondés preguntas simples)
• **Check-in diario**: 10 segundos (un toque: excelente, normal o flojo)
• **Revisar misiones**: 2-3 minutos por día

**El sistema hace el trabajo pesado por vos:**
• Analiza datos automáticamente
• Detecta patrones y oportunidades
• Investiga tendencias del mercado
• Te presenta todo en acciones concretas

**No tienes que ser experto en nada.** VistaCEO traduce análisis complejos a pasos simples que puedes ejecutar sin conocimientos técnicos.`,
  },
  {
    icon: Shield,
    question: "¿Mis datos están seguros?",
    answer: `Absolutamente. Tu información está protegida con los más altos estándares:

• **Encriptación de extremo a extremo** en tránsito y en reposo
• **Infraestructura cloud** de clase empresarial
• **Sin acceso de terceros**: Nunca vendemos ni compartimos tu información
• **Control total**: Puedes exportar o eliminar tus datos cuando quieras

**Importante:**
VistaCEO **no requiere acceso a tu cuenta bancaria ni sistema de punto de venta**. Trabajamos con rangos y estimaciones que vos proporcionás, nunca datos financieros exactos.

Cumplimos con regulaciones de protección de datos de Argentina, Chile, México y toda Latinoamérica.`,
  },
];

export const FAQSection = memo(() => {
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
            Respuestas claras a las dudas más comunes sobre VistaCEO
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
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card/80 backdrop-blur-sm border border-border rounded-xl px-4 sm:px-5 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5 transition-all duration-200"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <faq.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <span className="text-sm sm:text-base font-medium text-foreground pr-2">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-0">
                    <div className="pl-12 sm:pl-13 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            ¿Tienes más preguntas?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Contactanos
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
});

FAQSection.displayName = "FAQSection";
export default FAQSection;
