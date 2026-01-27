import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, TrendingUp, Sparkles, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MockupProMissionsProps {
  business?: "argentina" | "mexico";
}

const missionsData = {
  argentina: {
    name: "Parrilla Don Martín",
    missions: [
      {
        title: "Optimizar horarios de apertura",
        progress: 75,
        steps: 4,
        completedSteps: 3,
        impact: "+$45.000/mes",
        status: "active",
        area: "Ventas"
      },
      {
        title: "Mejorar tiempo de servicio",
        progress: 100,
        steps: 5,
        completedSteps: 5,
        impact: "+15% satisfacción",
        status: "completed",
        area: "Eficiencia"
      },
      {
        title: "Programa fidelización asado lovers",
        progress: 33,
        steps: 6,
        completedSteps: 2,
        impact: "+22% retención",
        status: "active",
        area: "Marketing"
      },
    ],
    gradient: "from-orange-500 to-red-500"
  },
  mexico: {
    name: "Boutique Carmela",
    missions: [
      {
        title: "Campaña Instagram accesorios",
        progress: 60,
        steps: 5,
        completedSteps: 3,
        impact: "+18% conversión",
        status: "active",
        area: "Marketing"
      },
      {
        title: "Optimizar inventario temporada",
        progress: 100,
        steps: 4,
        completedSteps: 4,
        impact: "-30% stock muerto",
        status: "completed",
        area: "Operaciones"
      },
      {
        title: "Lanzar colección exclusiva",
        progress: 20,
        steps: 8,
        completedSteps: 2,
        impact: "+$85.000 MXN/mes",
        status: "active",
        area: "Ventas"
      },
    ],
    gradient: "from-pink-500 to-purple-500"
  }
};

export const MockupProMissions = forwardRef<HTMLDivElement, MockupProMissionsProps>(({ business = "argentina" }, ref) => {
  const data = missionsData[business];
  
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", data.gradient)}>
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Misiones Estratégicas</span>
              <div className="text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-medium">
              {data.missions.filter(m => m.status === "completed").length} completadas
            </span>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="p-3 space-y-2">
        {data.missions.map((mission, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className={cn(
              "p-3 rounded-xl border",
              mission.status === "completed"
                ? "bg-success/5 border-success/20"
                : "bg-card border-border"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {mission.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground line-clamp-1">{mission.title}</span>
                  <span className="text-[10px] text-muted-foreground">{mission.area}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                className={cn(
                  "h-full rounded-full",
                  mission.status === "completed" ? "bg-success" : "bg-primary"
                )}
              />
            </div>
            
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {mission.completedSteps}/{mission.steps} pasos
              </span>
              <span className={cn(
                "font-semibold flex items-center gap-1",
                mission.status === "completed" ? "text-success" : "text-primary"
              )}>
                <TrendingUp className="w-3 h-3" />
                {mission.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          <Sparkles className="w-4 h-4" />
          Ver todas las misiones
        </button>
      </div>
    </div>
  );
});

MockupProMissions.displayName = "MockupProMissions";
