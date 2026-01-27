import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Sparkles, Star, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MockupProChatProps {
  business?: "argentina" | "mexico";
}

const chatData = {
  argentina: {
    name: "Parrilla Don Martín",
    avatar: "DM",
    greeting: "Martín",
    userMessage: "¿Cómo puedo aumentar las reservas para los sábados?",
    aiResponse: {
      intro: "Analicé tus datos y encontré algo interesante:",
      insight: "Tus sábados tienen 23% menos tráfico que la competencia cercana. El horario de apertura (20:00) es más tarde que el promedio de la zona (19:00).",
      action: "Probá abrir a las 19:00 los próximos 3 sábados y promocioná el 'Happy Hour de Parrilla' en Instagram.",
      impact: "+$45.000/mes estimado"
    },
    gradient: "from-orange-500 to-red-500"
  },
  mexico: {
    name: "Boutique Carmela",
    avatar: "BC",
    greeting: "Carolina",
    userMessage: "¿Qué productos debería promocionar este mes?",
    aiResponse: {
      intro: "Basándome en tus ventas y la temporada:",
      insight: "Tu colección de accesorios tiene un margen 40% mayor que la ropa, pero solo representa el 15% de tus ventas. Instagram muestra alto engagement con tus posts de accesorios.",
      action: "Creá una campaña de Stories mostrando combinaciones de accesorios con outfits. Usá el hashtag #CarmelaStyle.",
      impact: "+18% conversión estimada"
    },
    gradient: "from-pink-500 to-purple-500"
  }
};

export const MockupProChat = forwardRef<HTMLDivElement, MockupProChatProps>(({ business = "argentina" }, ref) => {
  const data = chatData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Star className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">Chat CEO</div>
            <div className="text-xs text-muted-foreground">{data.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
            <Brain className="w-3 h-3" />
            Balanceada
          </span>
        </div>
      </div>

      {/* Chat content */}
      <div className="p-4 space-y-4 bg-background min-h-[280px]">
        {/* User message */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end"
        >
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-md max-w-[85%]">
            <p className="text-sm">{data.userMessage}</p>
          </div>
        </motion.div>

        {/* AI response */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-2xl rounded-tl-md p-4 max-w-[85%]">
            <p className="text-sm text-foreground mb-3">{data.aiResponse.intro}</p>
            <p className="text-sm text-foreground mb-3 p-2 rounded-lg bg-muted/50 border-l-2 border-primary">
              💡 {data.aiResponse.insight}
            </p>
            <p className="text-sm text-foreground mb-3">
              <strong>Acción recomendada:</strong> {data.aiResponse.action}
            </p>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
              <span className="text-success font-semibold text-sm">{data.aiResponse.impact}</span>
            </div>
          </div>
        </motion.div>

        {/* Suggested questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-3 h-3" />
            Ver preguntas sugeridas
          </button>
        </motion.div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Preguntame lo que necesites..." 
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            readOnly
          />
          <Mic className="w-4 h-4 text-muted-foreground" />
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <Send className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
});

MockupProChat.displayName = "MockupProChat";
