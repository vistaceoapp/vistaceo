import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle, TrendingUp, Calendar, Rocket } from "lucide-react";

const MOCK_MISSION = {
  title: "Aumentar ticket promedio en un 15%",
  description: "Basado en tus datos, hay una oportunidad clara de upselling en el turno de la mañana.",
  impact: "Alto impacto",
  duration: "2 semanas",
  progress: 60,
  steps: [
    { title: "Capacitar equipo en técnicas de upselling", completed: true },
    { title: "Crear combos desayuno premium", completed: true },
    { title: "Implementar sugerencias en caja", completed: false },
    { title: "Medir resultados primera semana", completed: false },
  ],
  expectedResult: "+$180,000/mes",
};

export const MockupMission = () => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-5 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target className="w-4 h-4 text-accent" />
          </div>
          <span className="text-xs font-medium text-accent uppercase tracking-wide">Misión activa</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
          {MOCK_MISSION.progress}% completado
        </span>
      </div>

      {/* Mission title */}
      <h3 className="text-lg font-bold text-foreground mb-2">{MOCK_MISSION.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{MOCK_MISSION.description}</p>

      {/* Meta badges */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          <span>{MOCK_MISSION.impact}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{MOCK_MISSION.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-success">
          <Rocket className="w-3.5 h-3.5" />
          <span>{MOCK_MISSION.expectedResult}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${MOCK_MISSION.progress}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full gradient-primary rounded-full"
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {MOCK_MISSION.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              step.completed ? 'bg-success/5' : 'bg-secondary/30'
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className={`text-sm ${
              step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
            }`}>
              {step.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
