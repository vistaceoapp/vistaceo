import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp, CheckCircle2, Star, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";

// Acciones reales que VistaCEO genera
const createMockAction = (currency: string) => ({
  priority: "alta" as const,
  title: "Optimizar horario de apertura los sábados",
  description: currency === "ARS" 
    ? "Los datos muestran un 40% más de tráfico entre 8-9am. Abrir 1 hora antes podría generar +$45,000/mes."
    : "Data shows 40% more traffic between 8-9am. Opening 1 hour earlier could generate +$450/month.",
  impact: currency === "ARS" ? "+$45,000/mes" : "+$450/mo",
  time: "15 min",
  steps: [
    { title: "Revisar personal disponible", completed: true },
    { title: "Ajustar horario en Google", completed: false },
    { title: "Comunicar al equipo", completed: false },
  ],
  category: "Crecimiento",
});

interface MockupActionCardProps {
  variant?: "full" | "compact";
}

export const MockupActionCard = ({ variant = "full" }: MockupActionCardProps) => {
  const { country } = useCountryDetection();
  const action = createMockAction(country.currency);
  
  if (variant === "compact") {
    return (
      <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border shadow-xl p-4 w-full max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive uppercase">
                Alta prioridad
              </span>
            </div>
            <h4 className="font-semibold text-foreground text-sm leading-tight mb-1">
              {action.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-success font-medium">{action.impact}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {action.time}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Gradient top accent */}
      <div className="h-1 gradient-primary" />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">Tu acción de hoy</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-destructive/10 text-destructive uppercase tracking-wide">
            Alta prioridad
          </span>
        </div>

        {/* Action content */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground mb-2">{action.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-secondary/50 rounded-xl border border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-success">{action.impact}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{action.time}</span>
          </div>
        </div>

        {/* Steps - exactly like real checklist */}
        <div className="space-y-2 mb-4">
          {action.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                step.completed ? "bg-success/5" : "bg-secondary/30"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm",
                step.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {step.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-3 px-4 rounded-xl gradient-primary text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          Completar acción
        </button>
      </div>
    </div>
  );
};
