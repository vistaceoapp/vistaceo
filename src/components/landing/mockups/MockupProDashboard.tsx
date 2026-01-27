import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Target, Sparkles, ChevronDown, Star, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MockupProDashboardProps {
  business?: "argentina" | "mexico";
}

// Two real Pro user profiles
const businessData = {
  argentina: {
    name: "Parrilla Don Martín",
    type: "Restaurante / Parrilla",
    location: "Palermo, Buenos Aires",
    avatar: "DM",
    healthScore: 78,
    healthChange: +12,
    certaintyPct: 85,
    dimensions: [
      { name: "Ventas", score: 82, icon: "📈" },
      { name: "Reputación", score: 91, icon: "⭐" },
      { name: "Eficiencia", score: 74, icon: "⚡" },
      { name: "Finanzas", score: 68, icon: "💰" },
      { name: "Equipo", score: 85, icon: "👥" },
      { name: "Tráfico", score: 79, icon: "🚶" },
    ],
    activeMissions: 3,
    completedMissions: 12,
    radarAlerts: 5,
    lastAction: "Optimizar horario sábados",
    currency: "ARS"
  },
  mexico: {
    name: "Boutique Carmela",
    type: "Retail / Moda",
    location: "Polanco, CDMX",
    avatar: "BC",
    healthScore: 85,
    healthChange: +18,
    certaintyPct: 92,
    dimensions: [
      { name: "Ventas", score: 88, icon: "📈" },
      { name: "Reputación", score: 94, icon: "⭐" },
      { name: "Eficiencia", score: 82, icon: "⚡" },
      { name: "Finanzas", score: 78, icon: "💰" },
      { name: "Equipo", score: 90, icon: "👥" },
      { name: "Tráfico", score: 85, icon: "🚶" },
    ],
    activeMissions: 2,
    completedMissions: 18,
    radarAlerts: 3,
    lastAction: "Campaña Instagram Stories",
    currency: "MXN"
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-success/10 border-success/30";
  if (score >= 60) return "bg-primary/10 border-primary/30";
  if (score >= 40) return "bg-warning/10 border-warning/30";
  return "bg-destructive/10 border-destructive/30";
};

export const MockupProDashboard = forwardRef<HTMLDivElement, MockupProDashboardProps>(({ business = "argentina" }, ref) => {
  const data = businessData[business];
  
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Color stripe based on health score */}
      <div className="h-1.5 bg-success" />
      
      <div className="p-4 sm:p-5">
        {/* Business Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
            business === "argentina" ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-gradient-to-br from-pink-500 to-purple-500"
          )}>
            {data.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{data.name}</div>
            <div className="text-xs text-muted-foreground">{data.location}</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            Pro
          </div>
        </div>

        {/* Health Score Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Salud de Negocio</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/30">
              <CheckCircle2 className="w-3 h-3" />
              {data.certaintyPct}% certeza
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Main score + dimensions */}
        <div className="flex items-center gap-4">
          {/* Score box */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer",
              "ring-2 ring-offset-2 ring-offset-background",
              getScoreBg(data.healthScore),
              "ring-success/30"
            )}
          >
            <div className="flex items-baseline gap-1">
              <span className={cn("text-4xl font-bold", getScoreColor(data.healthScore))}>
                {data.healthScore}
              </span>
              <span className="flex items-center ml-1">
                <TrendingUp className="w-4 h-4 text-success" />
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full border text-xs text-success border-success/30 bg-success/10">
              {data.healthScore >= 80 ? "Excelente" : "Bueno"}
            </span>
          </motion.div>

          {/* Mini sub-scores preview */}
          <div className="flex-1 space-y-2">
            {data.dimensions.slice(0, 4).map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm">{dim.icon}</span>
                <span className="text-xs text-muted-foreground w-16 truncate">{dim.name}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    className={cn("h-full rounded-full", 
                      dim.score >= 80 ? "bg-success" : 
                      dim.score >= 60 ? "bg-primary" : 
                      "bg-warning"
                    )}
                  />
                </div>
                <span className={cn("text-xs font-medium w-6 text-right", getScoreColor(dim.score))}>
                  {dim.score}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
          <div className="text-center p-2 rounded-lg bg-primary/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{data.activeMissions}</div>
            <div className="text-[10px] text-muted-foreground">Misiones activas</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-success" />
            </div>
            <div className="text-lg font-bold text-foreground">{data.completedMissions}</div>
            <div className="text-[10px] text-muted-foreground">Completadas</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-accent/5">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Sparkles className="w-3 h-3 text-accent" />
            </div>
            <div className="text-lg font-bold text-foreground">{data.radarAlerts}</div>
            <div className="text-[10px] text-muted-foreground">Oportunidades</div>
          </div>
        </div>

        {/* Current Action */}
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Acción sugerida hoy</span>
          </div>
          <p className="text-sm text-foreground">{data.lastAction}</p>
        </div>
      </div>
    </div>
  );
});

MockupProDashboard.displayName = "MockupProDashboard";
