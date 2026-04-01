import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Sparkles, Star, Brain } from "lucide-react";
import { forwardRef } from "react";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia" | "juridico";

interface MockupProChatProps {
  business?: BusinessKey;
}

const chatData: Record<BusinessKey, {
  name: string;
  greeting: string;
  userMessage: string;
  aiResponse: { intro: string; insight: string; action: string; impact: string };
}> = {
  argentina: {
    name: "Parrilla Don Martín",
    greeting: "Martín",
    userMessage: "¿Cómo puedo aumentar el ticket del almuerzo?",
    aiResponse: {
      intro: "Analicé tus datos y encontré algo interesante:",
      insight: "El 62% de tu tráfico de mediodía no consume porque no hay opción rápida. Tu ticket promedio de almuerzo es $6.200, un 35% menor que la cena.",
      action: "Lanzá un menú ejecutivo de $8.500 con entrada + principal + bebida. Tiempo de servicio: 25 min máximo.",
      impact: "+$185.000/mes estimado"
    },
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    greeting: "Daniela",
    userMessage: "¿Cómo puedo llenar los horarios de la tarde?",
    aiResponse: {
      intro: "Analicé tu agenda y encontré un patrón:",
      insight: "El horario 14-16h tiene 40% menos ocupación. Detecté 45 min promedio de gaps entre citas que podrían optimizarse.",
      action: "Lanzá 'Almuerzo Dental' - atención express 13:30-14:30 para profesionales con descuento 15%.",
      impact: "+4 pacientes/día estimado"
    },
  },
  mexico: {
    name: "Boutique Carmela",
    greeting: "Carolina",
    userMessage: "¿Qué productos debería promocionar este mes?",
    aiResponse: {
      intro: "Basándome en tus ventas y la temporada:",
      insight: "Tu colección de accesorios tiene un margen 40% mayor que la ropa, pero solo representa el 15% de tus ventas. Tus clientas VIP generan 52% de ventas.",
      action: "Creá una campaña de Stories mostrando combinaciones de accesorios con outfits. Usá el hashtag #CarmelaStyle.",
      impact: "+18% conversión estimada"
    },
  },
  marketing: {
    name: "Rocket Digital",
    greeting: "Rodrigo",
    userMessage: "¿Cómo puedo retener a mis clientes principales?",
    aiResponse: {
      intro: "Revisé tu cartera y detecté riesgos:",
      insight: "3 de tus clientes top tienen contratos por renovar en 45 días. Su engagement bajó 20% el último mes. Actualmente dedicás 3 horas por cliente en reportes manuales.",
      action: "Agendá reuniones de revisión de resultados esta semana. Preparé un deck con sus métricas de éxito.",
      impact: "Retención $2.5M CLP en juego"
    },
  },
  juridico: {
    name: "Vega & Asociados",
    greeting: "Ricardo",
    userMessage: "¿Cómo puedo conseguir más clientes corporativos?",
    aiResponse: {
      intro: "Analicé tu cartera y el mercado legal en Quito:",
      insight: "El 85% de tus clientes llegan por referidos. Solo el 3% viene de canales digitales, pero el sector jurídico en Ecuador tiene +45% de búsquedas online este año.",
      action: "Creá un perfil optimizado en Google Business y publicá 2 artículos mensuales sobre cambios regulatorios. Activá LinkedIn con contenido de liderazgo.",
      impact: "+8 consultas/mes estimado"
    },
  },
};

export const MockupProChat = forwardRef<HTMLDivElement, MockupProChatProps>(({ business = "argentina" }, ref) => {
  const data = chatData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-xs sm:text-sm">Chat CEO</div>
            <div className="text-[9px] sm:text-xs text-muted-foreground">{data.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-medium">
            <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Balanceada
          </span>
        </div>
      </div>

      {/* Chat content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background min-h-[240px] sm:min-h-[280px]">
        {/* User message */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-end"
        >
          <div className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-tr-md max-w-[85%]">
            <p className="text-[11px] sm:text-sm">{data.userMessage}</p>
          </div>
        </motion.div>

        {/* AI response */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="flex gap-2 sm:gap-3"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-tl-md p-3 sm:p-4 max-w-[85%]">
            <p className="text-[11px] sm:text-sm text-foreground mb-2 sm:mb-3">{data.aiResponse.intro}</p>
            <p className="text-[11px] sm:text-sm text-foreground mb-2 sm:mb-3 p-2 rounded-lg bg-muted/50 border-l-2 border-primary">
              💡 {data.aiResponse.insight}
            </p>
            <p className="text-[11px] sm:text-sm text-foreground mb-2 sm:mb-3">
              <strong>Acción:</strong> {data.aiResponse.action}
            </p>
            <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-lg bg-success/10 border border-success/20">
              <span className="text-success font-semibold text-[11px] sm:text-sm">{data.aiResponse.impact}</span>
            </div>
          </div>
        </motion.div>

        {/* Suggested questions */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.15 }}
          className="flex justify-center"
        >
          <button className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Ver preguntas sugeridas
          </button>
        </motion.div>
      </div>

      {/* Input area */}
      <div className="p-2.5 sm:p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border bg-card">
          <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Preguntame lo que necesites..." 
            className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground outline-none"
            readOnly
          />
          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-primary flex items-center justify-center">
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
});

MockupProChat.displayName = "MockupProChat";
