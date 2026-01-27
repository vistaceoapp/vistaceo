import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, TrendingUp, Sparkles, ChevronRight, Zap, Play, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";

interface MockupProMissionsProps {
  business?: "argentina" | "mexico";
}

// Ultra-personalized missions with specific business context
const missionsData = {
  argentina: {
    name: "Parrilla Don Martín",
    avatar: "DM",
    image: parrillaImg,
    totalCompleted: 12,
    missions: [
      {
        title: "Lanzar menú ejecutivo almuerzo $8.500",
        progress: 75,
        steps: 4,
        completedSteps: 3,
        impact: "+$185.000/mes",
        status: "active",
        area: "Ventas",
        priority: "alta",
        detail: "Detectamos que el 62% de tu tráfico de mediodía no consume porque no hay opción rápida"
      },
      {
        title: "Responder 8 reseñas pendientes en Google",
        progress: 100,
        steps: 5,
        completedSteps: 5,
        impact: "+0.3 estrellas",
        status: "completed",
        area: "Reputación",
        priority: "media",
        detail: "Tu rating actual es 4.2, con respuestas podés llegar a 4.5"
      },
      {
        title: "Implementar sistema de reservas sábados noche",
        progress: 40,
        steps: 6,
        completedSteps: 2,
        impact: "-45% rechazos",
        status: "active",
        area: "Operaciones",
        priority: "alta",
        detail: "Perdés 12 mesas promedio cada sábado por no gestionar reservas"
      },
    ],
    gradient: "from-orange-500 to-red-500"
  },
  mexico: {
    name: "Boutique Carmela",
    avatar: "BC",
    image: boutiqueImg,
    totalCompleted: 18,
    missions: [
      {
        title: "Campaña Instagram: Accesorios de temporada con influencer local",
        progress: 60,
        steps: 5,
        completedSteps: 3,
        impact: "+18% conversión",
        status: "active",
        area: "Marketing",
        priority: "alta",
        detail: "Tu engagement está 40% arriba del promedio, ideal para colaboración"
      },
      {
        title: "Liquidar 23 prendas de colección anterior",
        progress: 100,
        steps: 4,
        completedSteps: 4,
        impact: "+$42.000 MXN",
        status: "completed",
        area: "Inventario",
        priority: "media",
        detail: "Recuperaste capital inmovilizado en stock de más de 90 días"
      },
      {
        title: "Lanzar colección cápsulas exclusivas edición limitada",
        progress: 25,
        steps: 8,
        completedSteps: 2,
        impact: "+$85.000 MXN/mes",
        status: "active",
        area: "Ventas",
        priority: "alta",
        detail: "Tus clientas VIP (15%) generan 52% de tus ventas - ideal para exclusividad"
      },
    ],
    gradient: "from-pink-500 to-purple-500"
  }
};

export const MockupProMissions = forwardRef<HTMLDivElement, MockupProMissionsProps>(({ business = "argentina" }, ref) => {
  const data = missionsData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30">
              <img 
                src={data.image} 
                alt={data.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Misiones Estratégicas</span>
              <div className="text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[10px] font-semibold border border-success/30">
              {data.totalCompleted} completadas
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
              "p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md",
              mission.status === "completed"
                ? "bg-success/5 border-success/30"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {mission.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0 bg-primary/10">
                    <Play className="w-2.5 h-2.5 text-primary fill-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground line-clamp-2">{mission.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground">{mission.area}</span>
                    {mission.priority === "alta" && mission.status !== "completed" && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-destructive/10 text-destructive">
                        Prioridad alta
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
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
                "font-bold flex items-center gap-1",
                "text-success"
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
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors border border-primary/20">
          <Sparkles className="w-4 h-4" />
          Ver todas las misiones
        </button>
      </div>
    </div>
  );
});

MockupProMissions.displayName = "MockupProMissions";
