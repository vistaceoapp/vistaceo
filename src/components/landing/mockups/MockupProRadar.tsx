import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, ExternalLink, Sparkles, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MockupProRadarProps {
  business?: "argentina" | "mexico";
}

const radarData = {
  argentina: {
    name: "Parrilla Don Martín",
    opportunities: [
      {
        type: "internal",
        title: "Tu horario de sábados tiene 23% menos tráfico que la competencia",
        impact: "+$45.000/mes",
        source: "Análisis interno",
        priority: "high"
      },
      {
        type: "external",
        title: "Tendencia: Cortes premium con vino maridaje +35% en Palermo",
        impact: "Oportunidad I+D",
        source: "Google Trends",
        priority: "medium"
      },
      {
        type: "internal",
        title: "3 reseñas mencionan 'espera larga' - tu tiempo promedio es 18min",
        impact: "Prioridad alta",
        source: "Google Reviews",
        priority: "high"
      },
    ],
    gradient: "from-orange-500 to-red-500"
  },
  mexico: {
    name: "Boutique Carmela",
    opportunities: [
      {
        type: "internal",
        title: "Tus accesorios tienen 40% más margen pero solo 15% de ventas",
        impact: "+$28.000 MXN/mes",
        source: "Análisis interno",
        priority: "high"
      },
      {
        type: "external",
        title: "Tendencia: Moda sostenible +45% interés en CDMX",
        impact: "Oportunidad I+D",
        source: "Instagram Insights",
        priority: "medium"
      },
      {
        type: "internal",
        title: "El 60% de tus ventas vienen de solo 3 productos estrella",
        impact: "Diversificar",
        source: "Análisis ventas",
        priority: "medium"
      },
    ],
    gradient: "from-pink-500 to-purple-500"
  }
};

export const MockupProRadar = ({ business = "argentina" }: MockupProRadarProps) => {
  const data = radarData[business];
  
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Radar de Oportunidades</span>
              <div className="text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
              {data.opportunities.length} nuevas
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/30">
        {[
          { label: "Internas", icon: Lightbulb, active: true },
          { label: "I+D", icon: Globe, active: false },
        ].map((tab, i) => (
          <button
            key={i}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors border-b-2",
              tab.active 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="p-3 space-y-2">
        {data.opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className={cn(
              "p-3 rounded-xl border",
              opp.type === "internal" 
                ? "bg-warning/5 border-warning/20" 
                : "bg-accent/5 border-accent/20"
            )}
          >
            <div className="flex items-start gap-2">
              {opp.type === "internal" ? (
                <div className="w-6 h-6 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-3.5 h-3.5 text-warning" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium line-clamp-2 mb-1.5">{opp.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    opp.type === "internal" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                  )}>
                    {opp.impact}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {opp.source}
                  </span>
                  {opp.priority === "high" && (
                    <span className="text-[10px] text-destructive flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" />
                      Urgente
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          <Sparkles className="w-4 h-4" />
          Explorar todas las oportunidades
        </button>
      </div>
    </div>
  );
};
