import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Zap, CheckCircle2, Clock, ArrowUp, BarChart3 } from "lucide-react";

// Empresa ficticia: "Café Aurora" - Una cafetería premium en Buenos Aires
const MOCK_DATA = {
  businessName: "Café Aurora",
  businessType: "Cafetería Premium",
  location: "Buenos Aires, AR",
  healthScore: 78,
  healthChange: +5,
  metrics: {
    revenue: { value: "$ 2.4M", change: "+12%", trend: "up" },
    customers: { value: "847", change: "+8%", trend: "up" },
    avgTicket: { value: "$ 2,850", change: "+3%", trend: "up" },
    efficiency: { value: "92%", change: "-2%", trend: "down" },
  },
  dimensions: [
    { name: "Crecimiento", score: 82, color: "hsl(var(--success))" },
    { name: "Reputación", score: 91, color: "hsl(var(--primary))" },
    { name: "Eficiencia", score: 74, color: "hsl(var(--warning))" },
    { name: "Finanzas", score: 68, color: "hsl(var(--accent))" },
    { name: "Equipo", score: 85, color: "hsl(var(--success))" },
    { name: "Tráfico", score: 79, color: "hsl(var(--primary))" },
  ],
};

export const MockupDashboard = () => {
  return (
    <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl p-4 sm:p-6 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">{MOCK_DATA.businessName}</h3>
          <p className="text-xs text-muted-foreground">{MOCK_DATA.businessType} • {MOCK_DATA.location}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{MOCK_DATA.healthScore}</div>
          <div className="flex items-center gap-1 text-success text-xs">
            <ArrowUp className="w-3 h-3" />
            +{MOCK_DATA.healthChange} pts
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: DollarSign, label: "Ingresos", ...MOCK_DATA.metrics.revenue },
          { icon: Users, label: "Clientes", ...MOCK_DATA.metrics.customers },
          { icon: Target, label: "Ticket prom.", ...MOCK_DATA.metrics.avgTicket },
          { icon: BarChart3, label: "Eficiencia", ...MOCK_DATA.metrics.efficiency },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-secondary/50 rounded-lg p-3"
          >
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <metric.icon className="w-3 h-3" />
              {metric.label}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{metric.value}</span>
              <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                {metric.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dimensions */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">Salud por dimensión</div>
        {MOCK_DATA.dimensions.slice(0, 4).map((dim, i) => (
          <motion.div
            key={dim.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="text-xs text-muted-foreground w-20">{dim.name}</span>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dim.score}%` }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                className="h-full rounded-full"
                style={{ backgroundColor: dim.color }}
              />
            </div>
            <span className="text-xs font-medium text-foreground w-8 text-right">{dim.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
