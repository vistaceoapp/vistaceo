import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Target, ArrowUp, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";

// Empresa ficticia: "Café Aurora" - Una cafetería premium en Buenos Aires
const createMockData = (currency: string, symbol: string) => ({
  businessName: "Café Aurora",
  businessType: "Cafetería Premium",
  location: "Buenos Aires",
  healthScore: 78,
  healthChange: +12,
  certaintyPct: 72,
  metrics: currency === "ARS" ? {
    revenue: { value: "$ 2.4M", change: "+12%", trend: "up" as const },
    customers: { value: "847", change: "+8%", trend: "up" as const },
    avgTicket: { value: "$ 2,850", change: "+3%", trend: "up" as const },
    efficiency: { value: "92%", change: "-2%", trend: "down" as const },
  } : {
    revenue: { value: "$24K", change: "+12%", trend: "up" as const },
    customers: { value: "847", change: "+8%", trend: "up" as const },
    avgTicket: { value: "$28", change: "+3%", trend: "up" as const },
    efficiency: { value: "92%", change: "-2%", trend: "down" as const },
  },
  dimensions: [
    { name: "Crecimiento", score: 82, icon: "📈" },
    { name: "Reputación", score: 91, icon: "⭐" },
    { name: "Eficiencia", score: 74, icon: "⚡" },
    { name: "Finanzas", score: 68, icon: "💰" },
    { name: "Equipo", score: 85, icon: "👥" },
    { name: "Tráfico", score: 79, icon: "🚶" },
  ],
});

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

export const MockupDashboard = () => {
  const { country } = useCountryDetection();
  const MOCK_DATA = createMockData(country.currency, country.symbol);
  
  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full max-w-md">
      {/* Color stripe based on health score */}
      <div className="h-1.5 bg-success" />
      
      <div className="p-5">
        {/* Header - exactly like HealthScoreWidget */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">Salud de Negocio</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/30">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              {MOCK_DATA.certaintyPct}% certeza
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Main score + dimensions */}
        <div className="flex items-center gap-4">
          {/* Score box - exactly like real widget */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl transition-all cursor-pointer",
              "ring-2 ring-offset-2 ring-offset-background",
              getScoreBg(MOCK_DATA.healthScore),
              "ring-success/30"
            )}
          >
            <div className="flex items-baseline gap-1">
              <span className={cn("text-4xl font-bold", getScoreColor(MOCK_DATA.healthScore))}>
                {MOCK_DATA.healthScore}
              </span>
              <span className="flex items-center ml-1">
                <TrendingUp className="w-4 h-4 text-success" />
              </span>
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full border text-xs text-success border-success/30 bg-success/10">
              Bueno
            </span>
          </motion.div>

          {/* Mini sub-scores preview */}
          <div className="flex-1 space-y-2">
            {MOCK_DATA.dimensions.slice(0, 4).map((dim, i) => (
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

        {/* Certainty progress bar */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Nivel de certeza del análisis
            </span>
            <span className="font-medium text-success">{MOCK_DATA.certaintyPct}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-y-0 bg-amber-500/10" style={{ left: '40%', width: '30%' }} />
            <div className="absolute inset-y-0 right-0 bg-success/10" style={{ left: '70%' }} />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${MOCK_DATA.certaintyPct}%` }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute inset-y-0 left-0 rounded-full bg-success"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic mt-2">
            ¡Excelente! Análisis altamente confiable
          </p>
        </div>
      </div>
    </div>
  );
};
