import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Target, Sparkles, ChevronDown, Brain, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos - optimized WebP at 200px for small mockup thumbnails
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=200&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=200&format=webp";
import marketingImg from "@/assets/business-types/marketing-digital.jpg?w=200&format=webp";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg?w=200&format=webp";

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
    healthScore: 64,
    healthChange: +8,
    certaintyPct: 82,
    dimensions: [
      { name: "Tráfico", score: 68, icon: "🚶" },
      { name: "Rentabilidad", score: 62, icon: "📈" },
      { name: "Equipo", score: 55, icon: "👥" },
      { name: "Finanzas", score: 58, icon: "💰" },
      { name: "Eficiencia", score: 60, icon: "⚡" },
      { name: "Crecimiento", score: 52, icon: "🚀" },
      { name: "Reputación", score: 72, icon: "⭐" },
    ],
    activeMissions: 3,
    completedMissions: 12,
    radarAlerts: 5,
    lastAction: "Lanzar menú ejecutivo almuerzo $8.500 para captar oficinistas",
    currency: "ARS",
    weeklyImprovement: "+4 pts esta semana",
    lastSync: "Hace 5 min",
    brainKnowledge: 127,
    pulseToday: "Almuerzo fuerte"
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    type: "Odontología",
    location: "Las Condes, Santiago",
    avatar: "CS",
    image: clinicaDentalImg,
    healthScore: 76,
    healthChange: +6,
    certaintyPct: 88,
    dimensions: [
      { name: "Tráfico", score: 82, icon: "🚶" },
      { name: "Rentabilidad", score: 78, icon: "📈" },
      { name: "Equipo", score: 70, icon: "👥" },
      { name: "Finanzas", score: 71, icon: "💰" },
      { name: "Eficiencia", score: 68, icon: "⚡" },
      { name: "Crecimiento", score: 75, icon: "🚀" },
      { name: "Reputación", score: 85, icon: "⭐" },
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
  },
  mexico: {
    name: "Boutique Carmela",
    type: "Retail / Moda",
    location: "Polanco, CDMX",
    avatar: "BC",
    image: boutiqueImg,
    healthScore: 71,
    healthChange: +12,
    certaintyPct: 85,
    dimensions: [
      { name: "Ventas", score: 74, icon: "📈" },
      { name: "Reputación", score: 82, icon: "⭐" },
      { name: "Eficiencia", score: 65, icon: "⚡" },
      { name: "Finanzas", score: 62, icon: "💰" },
    ],
    activeMissions: 2,
    completedMissions: 18,
    radarAlerts: 3,
    lastAction: "Campaña Instagram con influencer local @modaurbana",
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
    healthScore: 58,
    healthChange: +5,
    certaintyPct: 79,
    dimensions: [
      { name: "Ventas", score: 62, icon: "📈" },
      { name: "Clientes", score: 55, icon: "👥" },
      { name: "Eficiencia", score: 68, icon: "⚡" },
      { name: "Finanzas", score: 48, icon: "💰" },
    ],
    activeMissions: 4,
    completedMissions: 23,
    radarAlerts: 6,
    lastAction: "Automatizar reportes mensuales para liberar 12 hrs/mes",
    currency: "CLP",
    weeklyImprovement: "+5 pts esta semana",
    lastSync: "Hace 3 min",
    brainKnowledge: 156,
    pulseToday: "3 proyectos activos"
  }
};

// Color logic matching real product exactly
const getScoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 45) return "text-success"; // "Regular" range - green like product
  if (score >= 30) return "text-warning";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 70) return "bg-success/10 border-success/30";
  if (score >= 45) return "bg-success/10 border-success/30";
  if (score >= 30) return "bg-warning/10 border-warning/30";
  return "bg-destructive/10 border-destructive/30";
};

const getScoreLabel = (score: number) => {
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bueno";
  if (score >= 45) return "Regular";
  if (score >= 30) return "Crítico";
  return "Crítico";
};

// Dimension bar colors matching real product: blue >= 65, orange 45-64, red < 45
const getDimensionBarColor = (score: number) => {
  if (score >= 65) return "bg-primary"; // blue
  if (score >= 45) return "bg-warning"; // orange/amber
  return "bg-destructive"; // red
};

const getDimensionTextColor = (score: number) => {
  if (score >= 65) return "text-primary";
  if (score >= 45) return "text-warning";
  return "text-destructive";
};

export const MockupProDashboard = forwardRef<HTMLDivElement, MockupProDashboardProps>(({ business = "argentina" }, ref) => {
  const data = businessData[business];
  
  // Determine top bar color based on health score
  const topBarColor = data.healthScore >= 45 ? "bg-success" : data.healthScore >= 30 ? "bg-warning" : "bg-destructive";

  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Color stripe based on health score - matches real product */}
      <div className={cn("h-1.5", topBarColor)} />
      
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

        {/* Health Score Section - matching real product header */}
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

        {/* Main score + dimensions - layout matching real product */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Score circle - matching real product */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all cursor-pointer min-w-[80px] sm:min-w-[100px] aspect-square",
              "border",
              getScoreBg(data.healthScore)
            )}
          >
            <div className="flex items-baseline gap-0.5">
              <span className={cn("text-3xl sm:text-4xl font-bold", getScoreColor(data.healthScore))}>
                {data.healthScore}
              </span>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success ml-0.5" />
            </div>
            <span className={cn("mt-1 px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-medium",
              getScoreBg(data.healthScore), getScoreColor(data.healthScore)
            )}>
              {getScoreLabel(data.healthScore)}
            </span>
          </motion.div>

          {/* Dimension bars - matching real product exactly */}
          <div className="flex-1 space-y-2 sm:space-y-2.5 pt-1">
            {data.dimensions.map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.15 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-xs sm:text-sm">{dim.icon}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground w-16 sm:w-20 truncate">{dim.name}</span>
                {/* Thicker progress bar like real product */}
                <div className="flex-1 h-2.5 sm:h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                    className={cn("h-full rounded-full", getDimensionBarColor(dim.score))}
                  />
                </div>
                <span className={cn("text-[10px] sm:text-xs font-bold w-6 sm:w-7 text-right", getDimensionTextColor(dim.score))}>
                  {dim.score}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Priority dimension callout */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <div className="p-2.5 sm:p-3 rounded-xl bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
              <span className="text-[10px] sm:text-xs font-semibold text-warning">Prioridad: {data.dimensions.reduce((min, d) => d.score < min.score ? d : min).name}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Esta dimensión necesita atención inmediata para mejorar tu puntaje general.
            </p>
          </div>
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
