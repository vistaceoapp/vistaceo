import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const missions = [
  {
    title: "Optimizar horarios de apertura",
    progress: 67,
    steps: 4,
    completedSteps: 3,
    impact: "+$45,000/mes",
    status: "active",
  },
  {
    title: "Lanzar programa de fidelización",
    progress: 25,
    steps: 6,
    completedSteps: 2,
    impact: "+18% retención",
    status: "active",
  },
  {
    title: "Mejorar tiempo de servicio",
    progress: 100,
    steps: 5,
    completedSteps: 5,
    impact: "Completada ✓",
    status: "completed",
  },
];

export const MockupMissions = () => {
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Misiones Activas</span>
              <div className="text-[10px] text-muted-foreground">3 en progreso</div>
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-medium">
            67% total
          </span>
        </div>
      </div>

      {/* Missions List */}
      <div className="p-3 space-y-2">
        {missions.map((mission, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={`p-3 rounded-lg border ${
              mission.status === "completed"
                ? "bg-success/5 border-success/20"
                : "bg-secondary/50 border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {mission.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <Target className="w-4 h-4 text-primary shrink-0" />
                )}
                <span className="text-xs font-medium text-foreground">{mission.title}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
                className={`h-full rounded-full ${
                  mission.status === "completed" ? "bg-success" : "bg-primary"
                }`}
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {mission.completedSteps}/{mission.steps} pasos
              </span>
              <span className={`font-medium flex items-center gap-1 ${
                mission.status === "completed" ? "text-success" : "text-accent"
              }`}>
                <TrendingUp className="w-3 h-3" />
                {mission.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
