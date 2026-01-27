import { motion } from "framer-motion";
import { Building2, MapPin, Users, Clock, DollarSign, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MockupSetupProps {
  business?: "argentina" | "mexico";
}

const setupData = {
  argentina: {
    name: "Tu Negocio",
    step: 2,
    totalSteps: 5,
    currentQuestion: "¿Cuántos empleados tenés?",
    options: [
      { label: "Solo yo", selected: false },
      { label: "2-5 personas", selected: true },
      { label: "6-15 personas", selected: false },
      { label: "16+ personas", selected: false },
    ],
    progress: 40,
    completedQuestions: [
      { icon: Building2, label: "Tipo de negocio", value: "Restaurante" },
      { icon: MapPin, label: "Ubicación", value: "Buenos Aires" },
    ]
  },
  mexico: {
    name: "Tu Negocio",
    step: 3,
    totalSteps: 5,
    currentQuestion: "¿Cuál es tu ticket promedio?",
    options: [
      { label: "$100-300 MXN", selected: false },
      { label: "$300-600 MXN", selected: true },
      { label: "$600-1000 MXN", selected: false },
      { label: "$1000+ MXN", selected: false },
    ],
    progress: 60,
    completedQuestions: [
      { icon: Building2, label: "Tipo de negocio", value: "Boutique" },
      { icon: MapPin, label: "Ubicación", value: "CDMX" },
      { icon: Users, label: "Empleados", value: "3 personas" },
    ]
  }
};

export const MockupSetup = forwardRef<HTMLDivElement, MockupSetupProps>(({ business = "argentina" }, ref) => {
  const data = setupData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header with progress */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Configuración</span>
              <div className="text-[10px] text-muted-foreground">Paso {data.step} de {data.totalSteps}</div>
            </div>
          </div>
          <span className="text-xs text-primary font-medium">{data.progress}% completo</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.progress}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Completed questions summary */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <div className="flex flex-wrap gap-2">
          {data.completedQuestions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20"
            >
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span className="text-[10px] text-foreground font-medium">{q.value}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current question */}
      <div className="p-5">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-foreground mb-4"
        >
          {data.currentQuestion}
        </motion.h3>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {data.options.map((option, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                option.selected
                  ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20"
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                option.selected ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {option.selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-primary-foreground"
                  />
                )}
              </div>
              <span className={cn(
                "text-sm",
                option.selected ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* Estimated time */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>~3 minutos restantes</span>
        </div>
      </div>
    </div>
  );
});

MockupSetup.displayName = "MockupSetup";
