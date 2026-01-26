import { motion } from "framer-motion";
import { MessageCircle, Smile, Meh, Frown, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SHIFT_OPTIONS = [
  { id: 1, icon: Frown, label: "Muy flojo", color: "text-destructive", bgActive: "bg-destructive/10 border-destructive" },
  { id: 2, icon: Frown, label: "Flojo", color: "text-warning", bgActive: "bg-warning/10 border-warning" },
  { id: 3, icon: Meh, label: "Normal", color: "text-muted-foreground", bgActive: "bg-muted border-muted-foreground" },
  { id: 4, icon: Smile, label: "Bien", color: "text-primary", bgActive: "bg-primary/10 border-primary" },
  { id: 5, icon: Smile, label: "Excelente", color: "text-success", bgActive: "bg-success/10 border-success", active: true },
];

const QUICK_NOTES = [
  { label: "Mucha gente nueva", selected: true },
  { label: "Buenas ventas de café", selected: false },
  { label: "Faltó personal", selected: false },
];

export const MockupCheckin = () => {
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Check-in de pulso</h4>
            <p className="text-xs text-muted-foreground">Sábado, 11:30 AM • Turno mañana</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Question */}
        <p className="text-foreground font-medium mb-4 text-center">¿Cómo estuvo el movimiento hoy?</p>
        
        {/* 1-5 Scale - exactly like PulseCheckinCard */}
        <div className="flex justify-center gap-2 mb-5">
          {SHIFT_OPTIONS.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all border-2",
                option.active 
                  ? option.bgActive
                  : "bg-secondary/50 border-transparent hover:border-border"
              )}
            >
              <option.icon className={cn(
                "w-7 h-7",
                option.active ? option.color : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                option.active ? option.color : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Quick notes - tag style */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 font-medium">¿Algo destacable? (opcional)</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_NOTES.map((note, i) => (
              <motion.button
                key={note.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full transition-all border",
                  note.selected 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {note.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full py-3 rounded-xl gradient-primary text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          <Send className="w-4 h-4" />
          Enviar check-in
        </motion.button>

        <div className="flex items-center justify-center gap-2 mt-3">
          <Sparkles className="w-3 h-3 text-primary" />
          <p className="text-center text-[10px] text-muted-foreground">
            Solo toma 10 segundos
          </p>
        </div>
      </div>
    </div>
  );
};
