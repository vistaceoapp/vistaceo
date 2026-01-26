import { motion } from "framer-motion";
import { Bot, User, Mic, Image, Paperclip, Send, Sparkles } from "lucide-react";

const MOCK_MESSAGES = [
  {
    role: "user",
    content: "¿Cómo puedo aumentar las ventas del turno tarde?",
    time: "10:32",
  },
  {
    role: "assistant",
    content: "Basándome en tus datos de las últimas 4 semanas, el turno de tarde tiene un 35% menos de tráfico que el de mañana. Te sugiero 3 acciones específicas:\n\n1. **Happy hour 17-19hs** - Descuento 20% en cafés especiales\n2. **Combo merienda** - Café + pastelería a precio fijo\n3. **WiFi premium gratis** - Atraer freelancers\n\n¿Quieres que cree una misión con estos pasos?",
    time: "10:32",
  },
];

export const MockupChat = () => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">VistaCEO</h4>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Analizando tu negocio...
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 max-h-[280px] overflow-hidden">
        {MOCK_MESSAGES.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-primary/10' 
                : 'gradient-primary'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-primary" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-tr-sm'
                : 'bg-secondary/70 text-foreground rounded-tl-sm'
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.content}</p>
              <span className={`text-[10px] mt-1 block ${
                msg.role === 'user' ? 'text-white/70 text-right' : 'text-muted-foreground'
              }`}>
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
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3 text-primary" />
          <span>Podés enviar fotos, audios y documentos</span>
        </div>
      </div>
    </div>
  );
};
