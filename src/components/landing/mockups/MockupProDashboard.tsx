import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Target, Sparkles, ChevronDown, Brain, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";
import marketingImg from "@/assets/business-types/marketing-digital.jpg";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia";

interface MockupProDashboardProps {
  business?: BusinessKey;
}

// Four real Pro user profiles with images
const businessData: Record<BusinessKey, {
  name: string;
  type: string;
  location: string;
  avatar: string;
  image: string;
  healthScore: number;
  healthChange: number;
  certaintyPct: number;
  dimensions: Array<{ name: string; score: number; icon: string }>;
  activeMissions: number;
  completedMissions: number;
  radarAlerts: number;
  lastAction: string;
  currency: string;
  weeklyImprovement: string;
  lastSync: string;
  brainKnowledge: number;
  pulseToday: string;
}> = {
  argentina: {
    name: "Parrilla Don Martín",
    type: "Restaurante / Parrilla",
    location: "Palermo, Buenos Aires",
    avatar: "DM",
    image: parrillaImg,
    healthScore: 78,
    healthChange: +12,
    certaintyPct: 85,
    dimensions: [
      { name: "Ventas", score: 82, icon: "📈" },
      { name: "Reputación", score: 91, icon: "⭐" },
      { name: "Eficiencia", score: 74, icon: "⚡" },
      { name: "Finanzas", score: 68, icon: "💰" },
    ],
    activeMissions: 3,
    completedMissions: 12,
    radarAlerts: 5,
    lastAction: "Implementar menú ejecutivo para aumentar ticket almuerzo",
    currency: "ARS",
    weeklyImprovement: "+4 pts esta semana",
    lastSync: "Hace 5 min",
    brainKnowledge: 127,
    pulseToday: "Almuerzo fuerte"
  },
  mexico: {
    name: "Boutique Carmela",
    type: "Retail / Moda",
    location: "Polanco, CDMX",
    avatar: "BC",
    image: boutiqueImg,
    healthScore: 85,
    healthChange: +18,
    certaintyPct: 92,
    dimensions: [
      { name: "Ventas", score: 88, icon: "📈" },
      { name: "Reputación", score: 94, icon: "⭐" },
      { name: "Eficiencia", score: 82, icon: "⚡" },
      { name: "Finanzas", score: 78, icon: "💰" },
    ],
    activeMissions: 2,
    completedMissions: 18,
    radarAlerts: 3,
    lastAction: "Lanzar campaña de rebajas de temporada en Instagram",
    currency: "MXN",
    weeklyImprovement: "+6 pts esta semana",
    lastSync: "Hace 2 min",
    brainKnowledge: 184,
    pulseToday: "Tráfico alto"
  },
  marketing: {
    name: "Rocket Digital",
    type: "Agencia de Marketing",
    location: "Providencia, Santiago",
    avatar: "RD",
    image: marketingImg,
    healthScore: 82,
    healthChange: +15,
    certaintyPct: 88,
    dimensions: [
      { name: "Ventas", score: 85, icon: "📈" },
      { name: "Clientes", score: 79, icon: "👥" },
      { name: "Eficiencia", score: 88, icon: "⚡" },
      { name: "Finanzas", score: 76, icon: "💰" },
    ],
    activeMissions: 4,
    completedMissions: 23,
    radarAlerts: 6,
    lastAction: "Implementar sistema de reportes automatizados para clientes",
    currency: "CLP",
    weeklyImprovement: "+5 pts esta semana",
    lastSync: "Hace 3 min",
    brainKnowledge: 156,
    pulseToday: "3 proyectos activos"
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    type: "Odontología",
    location: "Las Condes, Santiago",
    avatar: "CS",
    image: clinicaDentalImg,
    healthScore: 88,
    healthChange: +10,
    certaintyPct: 91,
    dimensions: [
      { name: "Pacientes", score: 92, icon: "👥" },
      { name: "Reputación", score: 96, icon: "⭐" },
      { name: "Eficiencia", score: 84, icon: "⚡" },
      { name: "Finanzas", score: 81, icon: "💰" },
    ],
    activeMissions: 2,
    completedMissions: 31,
    radarAlerts: 4,
    lastAction: "Activar recordatorios automáticos de controles semestrales",
    currency: "CLP",
    weeklyImprovement: "+3 pts esta semana",
    lastSync: "Hace 1 min",
    brainKnowledge: 203,
    pulseToday: "8 pacientes hoy"
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

const getScoreLabel = (score: number) => {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bueno";
  if (score >= 50) return "Regular";
  return "Crítico";
};

export const MockupProDashboard = forwardRef<HTMLDivElement, MockupProDashboardProps>(({ business = "argentina" }, ref) => {
  const data = businessData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Color stripe based on health score */}
      <div className="h-1.5 bg-success" />
      
      <div className="p-3 sm:p-4 md:p-5">
        {/* Business Header with REAL photo */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-border">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30">
            <img 
              src={data.image} 
              alt={data.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground truncate text-sm sm:text-base">{data.name}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{data.location}</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-semibold border border-primary/30">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Pro
          </div>
        </div>

        {/* Health Score Section */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground text-xs sm:text-sm">Salud de Negocio</h3>
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-success/10 text-success border border-success/30">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {data.certaintyPct}% certeza
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Main score + dimensions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Score box */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all cursor-pointer min-w-[80px] sm:min-w-[100px]",
              "ring-2 ring-offset-2 ring-offset-background",
              getScoreBg(data.healthScore),
              "ring-success/30"
            )}
          >
            <div className="flex items-baseline gap-1">
              <span className={cn("text-3xl sm:text-4xl font-bold", getScoreColor(data.healthScore))}>
                {data.healthScore}
              </span>
              <span className="flex items-center ml-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs text-success border-success/30 bg-success/10">
              {getScoreLabel(data.healthScore)}
            </span>
          </motion.div>

          {/* Mini sub-scores preview */}
          <div className="flex-1 space-y-1.5 sm:space-y-2">
            {data.dimensions.map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.15 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-xs sm:text-sm">{dim.icon}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground w-14 sm:w-16 truncate">{dim.name}</span>
                <div className="flex-1 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                    className={cn("h-full rounded-full", 
                      dim.score >= 80 ? "bg-success" : 
                      dim.score >= 60 ? "bg-primary" : 
                      "bg-warning"
                    )}
                  />
                </div>
                <span className={cn("text-[10px] sm:text-xs font-bold w-5 sm:w-6 text-right", getScoreColor(dim.score))}>
                  {dim.score}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <div className="text-center p-2 sm:p-2.5 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">{data.activeMissions}</div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground">Misiones activas</div>
          </div>
          <div className="text-center p-2 sm:p-2.5 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">{data.completedMissions}</div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground">Completadas</div>
          </div>
          <div className="text-center p-2 sm:p-2.5 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-foreground">{data.radarAlerts}</div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground">Oportunidades</div>
          </div>
        </div>

        {/* Brain Knowledge Widget */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
          <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Conocimiento</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground">{data.brainKnowledge} datos</div>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-secondary/30 border border-border">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">Pulso hoy</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-foreground">{data.pulseToday}</div>
          </div>
        </div>

        {/* Current Action */}
        <div className="mt-2.5 sm:mt-3 p-2.5 sm:p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[10px] sm:text-xs font-semibold text-primary">Acción sugerida hoy</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-2">{data.lastAction}</p>
        </div>

        {/* Footer with sync info */}
        <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-border/50 text-[9px] sm:text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{data.lastSync}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-success" />
            <span className="text-success font-medium">{data.weeklyImprovement}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

MockupProDashboard.displayName = "MockupProDashboard";
