import { motion } from "framer-motion";
import { MessageCircle, Smile, Meh, Frown, ThumbsUp, ThumbsDown, Send } from "lucide-react";

export const MockupCheckin = () => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-5 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm">Check-in diario</h4>
          <p className="text-xs text-muted-foreground">Sábado, 11:30 AM</p>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-foreground font-medium mb-3">¿Cómo estuvo el movimiento hoy?</p>
        
        <div className="flex justify-center gap-3 mb-4">
          {[
            { icon: Frown, label: "Flojo", color: "text-destructive" },
            { icon: Meh, label: "Normal", color: "text-warning" },
            { icon: Smile, label: "Muy bien", color: "text-success", active: true },
          ].map((option, i) => (
            <motion.button
              key={option.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                option.active 
                  ? 'bg-success/10 border-2 border-success' 
                  : 'bg-secondary/50 border-2 border-transparent hover:border-border'
              }`}
            >
              <option.icon className={`w-8 h-8 ${option.active ? 'text-success' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${option.active ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick notes */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">¿Algo destacable?</p>
        <div className="flex flex-wrap gap-2">
          {["Mucha gente nueva", "Buenas ventas de café", "Faltó personal"].map((note, i) => (
            <motion.button
              key={note}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                i === 0 
                  ? 'bg-primary/10 border border-primary/30 text-primary' 
                  : 'bg-secondary/50 border border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {note}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <motion.button 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium text-sm flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        Enviar check-in
      </motion.button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        ⏱️ Menos de 10 segundos
      </p>
    </div>
  );
};
