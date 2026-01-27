import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, ArrowUpRight, PieChart, LineChart, Target, Star, Users, DollarSign, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface MockupProAnalyticsProps {
  business?: "argentina" | "mexico";
}

const analyticsData = {
  argentina: {
    name: "Parrilla Don Martín",
    avatar: "DM",
    gradient: "from-orange-500 to-red-500",
    period: "Últimos 30 días",
    metrics: [
      { label: "Ingresos", value: "$2.4M", change: "+18%", positive: true, icon: DollarSign },
      { label: "Clientes", value: "1,284", change: "+24%", positive: true, icon: Users },
      { label: "Ticket promedio", value: "$18.500", change: "+8%", positive: true, icon: Target },
      { label: "Satisfacción", value: "4.7", change: "+0.3", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Ventas", current: 82, previous: 68, change: "+14" },
      { name: "Reputación", current: 91, previous: 85, change: "+6" },
      { name: "Eficiencia", current: 74, previous: 62, change: "+12" },
      { name: "Finanzas", current: 68, previous: 55, change: "+13" },
    ],
    weeklyData: [65, 72, 68, 78, 82, 75, 88],
  },
  mexico: {
    name: "Boutique Carmela",
    avatar: "BC",
    gradient: "from-pink-500 to-purple-500",
    period: "Últimos 30 días",
    metrics: [
      { label: "Ingresos", value: "$485K", change: "+32%", positive: true, icon: DollarSign },
      { label: "Clientes", value: "892", change: "+45%", positive: true, icon: Users },
      { label: "Ticket promedio", value: "$5,200", change: "+12%", positive: true, icon: Target },
      { label: "Satisfacción", value: "4.9", change: "+0.2", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Ventas", current: 88, previous: 72, change: "+16" },
      { name: "Reputación", current: 94, previous: 88, change: "+6" },
      { name: "Eficiencia", current: 82, previous: 70, change: "+12" },
      { name: "Finanzas", current: 78, previous: 65, change: "+13" },
    ],
    weeklyData: [70, 75, 82, 78, 85, 90, 92],
  }
};

export const MockupProAnalytics = forwardRef<HTMLDivElement, MockupProAnalyticsProps>(({ business = "argentina" }, ref) => {
  const data = analyticsData[business];
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", data.gradient)}>
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Analíticas Avanzadas</span>
              <div className="text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
              {data.period}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
        {data.metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="p-2.5 rounded-xl bg-secondary/30 border border-border"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <metric.icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">{metric.value}</span>
              <span className={cn(
                "text-[10px] font-medium flex items-center",
                metric.positive ? "text-success" : "text-destructive"
              )}>
                {metric.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {metric.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Evolution Chart */}
      <div className="px-3 pb-3">
        <div className="p-3 rounded-xl bg-secondary/20 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Evolución de Salud</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Últimos 7 días</span>
          </div>
          
          {/* Mini chart visualization */}
          <div className="flex items-end gap-1 h-16">
            {data.weeklyData.map((value, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(value / 100) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className={cn(
                  "flex-1 rounded-t-sm",
                  i === data.weeklyData.length - 1 ? "bg-primary" : "bg-primary/40"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[8px] text-muted-foreground">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>
      </div>

      {/* Dimension Comparison */}
      <div className="px-3 pb-3">
        <div className="p-3 rounded-xl bg-secondary/20 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-foreground">Mejora por Dimensión</span>
          </div>
          <div className="space-y-2">
            {data.dimensions.map((dim, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="text-[10px] text-muted-foreground w-16 truncate">{dim.name}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden relative">
                  {/* Previous */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                    style={{ width: `${dim.previous}%` }}
                  />
                  {/* Current */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.current}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                    className="absolute inset-y-0 left-0 bg-success rounded-full"
                  />
                </div>
                <span className="text-[10px] font-bold text-success">{dim.change}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

MockupProAnalytics.displayName = "MockupProAnalytics";
