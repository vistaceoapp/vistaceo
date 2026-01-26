import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, ExternalLink, Sparkles } from "lucide-react";

const opportunities = [
  {
    type: "internal",
    title: "Tu horario de sábados tiene 23% menos tráfico que la competencia",
    impact: "+$45,000/mes",
    source: "Análisis interno",
  },
  {
    type: "external",
    title: "Tendencia: Cafés con espacios pet-friendly aumentan ventas 18%",
    impact: "Oportunidad I+D",
    source: "Google News",
  },
  {
    type: "internal",
    title: "3 reseñas mencionan 'espera larga' - tu tiempo promedio es 12min",
    impact: "Prioridad alta",
    source: "Google Reviews",
  },
];

export const MockupRadar = () => {
  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden w-full max-w-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Radar de Oportunidades</span>
              <div className="text-[10px] text-muted-foreground">5 nuevas esta semana</div>
            </div>
          </div>
          <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-medium">
            +3 I+D
          </span>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="p-3 space-y-2">
        {opportunities.map((opp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={`p-3 rounded-lg border ${
              opp.type === "internal" 
                ? "bg-warning/5 border-warning/20" 
                : "bg-accent/5 border-accent/20"
            }`}
          >
            <div className="flex items-start gap-2">
              {opp.type === "internal" ? (
                <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              ) : (
                <TrendingUp className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground font-medium line-clamp-2">{opp.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold ${
                    opp.type === "internal" ? "text-success" : "text-accent"
                  }`}>
                    {opp.impact}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ExternalLink className="w-2.5 h-2.5" />
                    {opp.source}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
