import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle, TrendingUp, Calendar, Rocket, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";

const createMockMission = (currency: string) => ({
  title: "Aumentar ticket promedio en un 15%",
  description: "Basado en tus datos, hay una oportunidad clara de upselling en el turno de la mañana.",
  impact: "Alto impacto",
  duration: "2 semanas",
  progress: 60,
  steps: [
    { title: "Capacitar equipo en técnicas de upselling", completed: true },
    { title: "Crear combos desayuno premium", completed: true },
    { title: "Implementar sugerencias en caja", completed: false, current: true },
    { title: "Medir resultados primera semana", completed: false },
  ],
  expectedResult: currency === "ARS" ? "+$180,000/mes" : "+$1,800/mo",
  area: "Crecimiento",
});

export const MockupMission = () => {
  const { country } = useCountryDetection();
  const MOCK_MISSION = createMockMission(country.currency);

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header with gradient accent */}
      <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      
      <div className="p-5">
        {/* Status badge row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="text-xs font-medium text-accent uppercase tracking-wide">Misión activa</span>
              <span className="text-[10px] text-muted-foreground block">{MOCK_MISSION.area}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {MOCK_MISSION.progress}%
            </span>
          </div>
        </div>

        {/* Mission title */}
        <h3 className="text-base font-bold text-foreground mb-2">{MOCK_MISSION.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{MOCK_MISSION.description}</p>

        {/* Meta badges */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span>{MOCK_MISSION.impact}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>{MOCK_MISSION.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
            <Rocket className="w-3.5 h-3.5" />
            <span>{MOCK_MISSION.expectedResult}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-secondary rounded-full mb-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${MOCK_MISSION.progress}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full gradient-primary rounded-full relative"
          >
            {/* Shine effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {MOCK_MISSION.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                step.completed ? "bg-success/5" : step.current ? "bg-primary/5 border border-primary/20" : "bg-secondary/30"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : step.current ? (
                <div className="relative">
                  <Circle className="w-5 h-5 text-primary flex-shrink-0" />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                  />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              )}
              <span className={cn(
                "text-sm flex-1",
                step.completed ? "text-muted-foreground line-through" : 
                step.current ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
              {step.current && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
