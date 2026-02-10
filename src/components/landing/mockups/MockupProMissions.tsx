import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, TrendingUp, Sparkles, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos - optimized WebP
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=200&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=200&format=webp";
import marketingImg from "@/assets/business-types/marketing-digital.jpg?w=200&format=webp";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg?w=200&format=webp";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia";

interface MockupProMissionsProps {
  business?: BusinessKey;
}

// Ultra-personalized missions with specific business context
const missionsData: Record<BusinessKey, {
  name: string;
  avatar: string;
  image: string;
  totalCompleted: number;
  missions: Array<{
    title: string;
    progress: number;
    steps: number;
    completedSteps: number;
    impact: string;
    status: string;
    area: string;
    priority: string;
    detail: string;
  }>;
}> = {
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
        detail: "El 62% de tu tráfico de mediodía no consume porque no hay opción rápida"
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
        title: "Implementar reservas sábados noche",
        progress: 40,
        steps: 6,
        completedSteps: 2,
        impact: "-45% rechazos",
        status: "active",
        area: "Operaciones",
        priority: "alta",
        detail: "Perdés 12 mesas promedio cada sábado"
      },
    ],
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    avatar: "CS",
    image: clinicaDentalImg,
    totalCompleted: 31,
    missions: [
      {
        title: "Activar recordatorios controles semestrales",
        progress: 70,
        steps: 4,
        completedSteps: 3,
        impact: "+15 citas/mes",
        status: "active",
        area: "Retención",
        priority: "alta",
        detail: "El 60% de pacientes no vuelve a control preventivo"
      },
      {
        title: "Lanzar campaña blanqueamiento verano",
        progress: 100,
        steps: 5,
        completedSteps: 5,
        impact: "+$1.2M CLP",
        status: "completed",
        area: "Ventas",
        priority: "alta",
        detail: "Temporada alta para tratamientos estéticos"
      },
      {
        title: "Optimizar agenda para reducir tiempos muertos",
        progress: 55,
        steps: 6,
        completedSteps: 3,
        impact: "+4 pacientes/día",
        status: "active",
        area: "Eficiencia",
        priority: "media",
        detail: "Detectamos 45 min promedio de gaps entre citas"
      },
    ],
  },
  mexico: {
    name: "Boutique Carmela",
    avatar: "BC",
    image: boutiqueImg,
    totalCompleted: 18,
    missions: [
      {
        title: "Campaña Instagram con influencer local",
        progress: 60,
        steps: 5,
        completedSteps: 3,
        impact: "+18% conversión",
        status: "active",
        area: "Marketing",
        priority: "alta",
        detail: "Tu engagement está 40% arriba del promedio"
      },
      {
        title: "Liquidar 23 prendas colección anterior",
        progress: 100,
        steps: 4,
        completedSteps: 4,
        impact: "+$42.000 MXN",
        status: "completed",
        area: "Inventario",
        priority: "media",
        detail: "Recuperaste capital inmovilizado"
      },
      {
        title: "Lanzar colección cápsulas exclusivas",
        progress: 25,
        steps: 8,
        completedSteps: 2,
        impact: "+$85.000 MXN/mes",
        status: "active",
        area: "Ventas",
        priority: "alta",
        detail: "Tus clientas VIP generan 52% de ventas"
      },
    ],
  },
  marketing: {
    name: "Rocket Digital",
    avatar: "RD",
    image: marketingImg,
    totalCompleted: 23,
    missions: [
      {
        title: "Automatizar reportes mensuales de clientes",
        progress: 80,
        steps: 5,
        completedSteps: 4,
        impact: "-12 hrs/mes",
        status: "active",
        area: "Eficiencia",
        priority: "alta",
        detail: "Actualmente dedicás 3 horas por cliente en reportes manuales"
      },
      {
        title: "Implementar upselling en 5 cuentas top",
        progress: 100,
        steps: 6,
        completedSteps: 6,
        impact: "+$850.000 CLP/mes",
        status: "completed",
        area: "Ventas",
        priority: "alta",
        detail: "Clientes con alto engagement listos para servicios adicionales"
      },
      {
        title: "Crear caso de estudio e-commerce moda",
        progress: 45,
        steps: 7,
        completedSteps: 3,
        impact: "+3 leads/mes",
        status: "active",
        area: "Marketing",
        priority: "media",
        detail: "Tu cliente 'Moda Urbana' tuvo +180% ROI"
      },
    ],
  }
};

export const MockupProMissions = forwardRef<HTMLDivElement, MockupProMissionsProps>(({ business = "argentina" }, ref) => {
  const data = missionsData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30">
              <img 
                src={data.image} 
                alt={data.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-foreground">Misiones Estratégicas</span>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 sm:py-1 rounded-full bg-success/10 text-success text-[9px] sm:text-[10px] font-semibold border border-success/30">
              {data.totalCompleted} completadas
            </span>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="p-2.5 sm:p-3 space-y-2">
        {data.missions.map((mission, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
            className={cn(
              "p-2.5 sm:p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md",
              mission.status === "completed"
                ? "bg-success/5 border-success/30"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                {mission.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0 bg-primary/10">
                    <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary fill-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-sm font-semibold text-foreground line-clamp-2">{mission.title}</span>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">{mission.area}</span>
                    {mission.priority === "alta" && mission.status !== "completed" && (
                      <span className="px-1 sm:px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-medium bg-destructive/10 text-destructive">
                        Prioridad alta
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden mb-1.5 sm:mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                className={cn(
                  "h-full rounded-full",
                  mission.status === "completed" ? "bg-success" : "bg-primary"
                )}
              />
            </div>
            
            <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {mission.completedSteps}/{mission.steps} pasos
              </span>
              <span className="font-bold flex items-center gap-1 text-success">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {mission.impact}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-primary/10 text-primary text-xs sm:text-sm font-semibold hover:bg-primary/20 transition-colors border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Ver todas las misiones
        </button>
      </div>
    </div>
  );
});

MockupProMissions.displayName = "MockupProMissions";
