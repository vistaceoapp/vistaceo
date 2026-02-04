import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Zap, Calendar, ArrowRight, Eye, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";
import marketingImg from "@/assets/business-types/marketing-digital.jpg";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia";

interface MockupProPredictionsProps {
  business?: BusinessKey;
}

const predictionsData: Record<BusinessKey, {
  name: string;
  image: string;
  predictions: Array<{
    horizon: string;
    title: string;
    impact: string;
    confidence: "A" | "B" | "C";
    type: "opportunity" | "risk" | "trend";
  }>;
  timeline: Array<{ day: string; score: number; event?: string }>;
  nextAction: string;
}> = {
  argentina: {
    name: "Parrilla Don Martín",
    image: parrillaImg,
    predictions: [
      { 
        horizon: "7 días", 
        title: "Pico de demanda por fin de semana largo", 
        impact: "+35% reservas",
        confidence: "A",
        type: "opportunity"
      },
      { 
        horizon: "14 días", 
        title: "Baja estacional en almuerzos laborales", 
        impact: "-18% tráfico",
        confidence: "B",
        type: "risk"
      },
      { 
        horizon: "30 días", 
        title: "Tendencia: menú degustación en auge", 
        impact: "+$$$",
        confidence: "B",
        type: "trend"
      },
    ],
    timeline: [
      { day: "Hoy", score: 72 },
      { day: "+7d", score: 85, event: "🎉" },
      { day: "+14d", score: 68 },
      { day: "+21d", score: 74 },
      { day: "+30d", score: 78 },
    ],
    nextAction: "Activar promo asado para 4 este finde",
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    image: clinicaDentalImg,
    predictions: [
      { 
        horizon: "7 días", 
        title: "Alta demanda blanqueamientos pre-verano", 
        impact: "+42% turnos",
        confidence: "A",
        type: "opportunity"
      },
      { 
        horizon: "14 días", 
        title: "Vacaciones: caída en turnos regulares", 
        impact: "-25% ocupación",
        confidence: "A",
        type: "risk"
      },
      { 
        horizon: "30 días", 
        title: "Oportunidad: convenio empresas zona", 
        impact: "+15 pacientes/mes",
        confidence: "C",
        type: "trend"
      },
    ],
    timeline: [
      { day: "Hoy", score: 78 },
      { day: "+7d", score: 88, event: "✨" },
      { day: "+14d", score: 62 },
      { day: "+21d", score: 70 },
      { day: "+30d", score: 82 },
    ],
    nextAction: "Lanzar campaña blanqueamiento express",
  },
  mexico: {
    name: "Boutique Carmela",
    image: boutiqueImg,
    predictions: [
      { 
        horizon: "7 días", 
        title: "Spike de tráfico por rebajas competencia", 
        impact: "+28% visitas",
        confidence: "B",
        type: "opportunity"
      },
      { 
        horizon: "14 días", 
        title: "Stock bajo en tallas más vendidas", 
        impact: "Riesgo ruptura",
        confidence: "A",
        type: "risk"
      },
      { 
        horizon: "30 días", 
        title: "Tendencia: colores pastel para primavera", 
        impact: "+$$",
        confidence: "B",
        type: "trend"
      },
    ],
    timeline: [
      { day: "Hoy", score: 74 },
      { day: "+7d", score: 82 },
      { day: "+14d", score: 65, event: "⚠️" },
      { day: "+21d", score: 76 },
      { day: "+30d", score: 80 },
    ],
    nextAction: "Reabastecer tallas S y M esta semana",
  },
  marketing: {
    name: "Rocket Digital",
    image: marketingImg,
    predictions: [
      { 
        horizon: "7 días", 
        title: "Cliente key renueva contrato Q2", 
        impact: "+$2.1M MRR",
        confidence: "A",
        type: "opportunity"
      },
      { 
        horizon: "14 días", 
        title: "Capacidad del equipo al límite", 
        impact: "Riesgo burnout",
        confidence: "B",
        type: "risk"
      },
      { 
        horizon: "30 días", 
        title: "Demanda creciente en IA marketing", 
        impact: "Nuevo servicio",
        confidence: "B",
        type: "trend"
      },
    ],
    timeline: [
      { day: "Hoy", score: 68 },
      { day: "+7d", score: 78, event: "💰" },
      { day: "+14d", score: 64 },
      { day: "+21d", score: 72 },
      { day: "+30d", score: 76 },
    ],
    nextAction: "Preparar propuesta renovación cliente",
  },
};

const confidenceColors = {
  A: "bg-success/20 text-success border-success/30",
  B: "bg-warning/20 text-warning border-warning/30",
  C: "bg-muted text-muted-foreground border-border",
};

const typeIcons = {
  opportunity: Sparkles,
  risk: AlertTriangle,
  trend: TrendingUp,
};

const typeColors = {
  opportunity: "text-success",
  risk: "text-warning",
  trend: "text-primary",
};

export const MockupProPredictions = forwardRef<HTMLDivElement, MockupProPredictionsProps>(({ business = "argentina" }, ref) => {
  const data = predictionsData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-gradient-to-r from-accent/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg border-2 border-accent/30">
              <img 
                src={data.image} 
                alt={data.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
                <span className="text-xs sm:text-sm font-bold text-foreground">Predicciones IA</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/10 border border-accent/20">
            <Zap className="w-3 h-3 text-accent" />
            <span className="text-[9px] sm:text-[10px] font-medium text-accent">Motor Activo</span>
          </div>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">Proyección 30 días</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-1 h-10 sm:h-12">
          {data.timeline.map((point, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(point.score / 100) * 100}%` }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className={cn(
                  "w-full rounded-t-sm relative",
                  i === 0 ? "bg-primary" : "bg-primary/40"
                )}
              >
                {point.event && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">
                    {point.event}
                  </span>
                )}
              </motion.div>
              <span className="text-[7px] sm:text-[8px] text-muted-foreground">{point.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions List */}
      <div className="p-2.5 sm:p-3 space-y-2">
        {data.predictions.map((pred, i) => {
          const Icon = typeIcons[pred.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.2 }}
              className="p-2.5 sm:p-3 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-start gap-2 sm:gap-2.5">
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  pred.type === "opportunity" && "bg-success/10",
                  pred.type === "risk" && "bg-warning/10",
                  pred.type === "trend" && "bg-primary/10"
                )}>
                  <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", typeColors[pred.type])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">{pred.horizon}</span>
                    <span className={cn(
                      "text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded border",
                      confidenceColors[pred.confidence]
                    )}>
                      {pred.confidence}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-foreground leading-tight">
                    {pred.title}
                  </p>
                  <p className={cn(
                    "text-[9px] sm:text-[10px] font-semibold mt-0.5",
                    typeColors[pred.type]
                  )}>
                    {pred.impact}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Next Action CTA */}
      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.2 }}
          className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Siguiente paso recomendado</span>
              <p className="text-[10px] sm:text-xs font-medium text-foreground truncate">{data.nextAction}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          </div>
        </motion.div>
      </div>
    </div>
  );
});

MockupProPredictions.displayName = "MockupProPredictions";
