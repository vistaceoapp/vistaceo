import { motion } from "framer-motion";
import { Bot, User, Mic, Image, Paperclip, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";

const createMockMessages = (currency: string) => [
  {
    role: "user" as const,
    content: "¿Cómo puedo aumentar las ventas del turno tarde?",
    time: "10:32",
  },
  {
    role: "assistant" as const,
    content: `Basándome en tus datos de las últimas 4 semanas, el turno de tarde tiene un 35% menos de tráfico que el de mañana. Te sugiero 3 acciones:

**1. Happy hour 17-19hs** - Descuento 20% en cafés especiales
**2. Combo merienda** - Café + pastelería a precio fijo
**3. WiFi premium gratis** - Atraer freelancers

¿Quieres que cree una misión con estos pasos?`,
    time: "10:32",
    hasAction: true,
  },
];

export const MockupChat = () => {
  const { country } = useCountryDetection();
  const MOCK_MESSAGES = createMockMessages(country.currency);

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">VistaCEO</h4>
            <p className="text-xs text-success flex items-center gap-1">
              Conectado • Analizando Café Aurora
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 max-h-[300px] overflow-hidden">
        {MOCK_MESSAGES.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className={cn("flex gap-3", msg.role === 'user' ? 'flex-row-reverse' : '')}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              msg.role === 'user' 
                ? 'bg-primary/10' 
                : 'gradient-primary'
            )}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div className={cn(
                "p-3 rounded-2xl",
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-sm'
                  : 'bg-secondary/70 text-foreground rounded-tl-sm'
              )}>
                <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
              </div>
              {msg.hasAction && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium self-start"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Crear misión
                </motion.button>
              )}
              <span className={cn(
                "text-[10px]",
                msg.role === 'user' ? 'text-muted-foreground text-right' : 'text-muted-foreground'
              )}>
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-secondary/50 rounded-full px-4 py-2">
            <input 
              type="text" 
              placeholder="Escribí tu consulta..."
              className="bg-transparent text-sm w-full outline-none text-foreground placeholder:text-muted-foreground"
              readOnly
            />
          </div>
          <button className="p-2 rounded-full gradient-primary text-white">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Podés enviar fotos, audios y documentos</span>
        </div>
      </div>
    </div>
  );
};
