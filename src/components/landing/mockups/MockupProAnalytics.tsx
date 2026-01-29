import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Star, LineChart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Import real business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";
import marketingImg from "@/assets/business-types/marketing-digital.jpg";
import clinicaDentalImg from "@/assets/testimonials/clinica-dental.jpg";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia";

interface MockupProAnalyticsProps {
  business?: BusinessKey;
}

const analyticsData: Record<BusinessKey, {
  name: string;
  image: string;
  period: string;
  metrics: Array<{ label: string; value: string; change: string; positive: boolean; icon: typeof DollarSign }>;
  dimensions: Array<{ name: string; current: number; previous: number; change: string }>;
  weeklyData: number[];
}> = {
  argentina: {
    name: "Parrilla Don Martín",
    image: parrillaImg,
    period: "Últimos 30 días",
    metrics: [
      { label: "Ingresos", value: "$2.4M", change: "+18%", positive: true, icon: DollarSign },
      { label: "Clientes", value: "1,284", change: "+24%", positive: true, icon: Users },
      { label: "Ticket prom.", value: "$18.5K", change: "+8%", positive: true, icon: Target },
      { label: "Rating", value: "4.2★", change: "+0.3", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Ventas", current: 68, previous: 54, change: "+14" },
      { name: "Reputación", current: 72, previous: 66, change: "+6" },
      { name: "Eficiencia", current: 58, previous: 46, change: "+12" },
      { name: "Finanzas", current: 55, previous: 42, change: "+13" },
    ],
    weeklyData: [52, 58, 55, 62, 64, 60, 68],
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    image: clinicaDentalImg,
    period: "Últimos 30 días",
    metrics: [
      { label: "Ingresos", value: "$12.5M", change: "+15%", positive: true, icon: DollarSign },
      { label: "Pacientes", value: "342", change: "+28", positive: true, icon: Users },
      { label: "Ticket prom.", value: "$185K", change: "+8%", positive: true, icon: Target },
      { label: "Rating", value: "4.6★", change: "+0.1", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Pacientes", current: 82, previous: 68, change: "+14" },
      { name: "Reputación", current: 85, previous: 81, change: "+4" },
      { name: "Eficiencia", current: 68, previous: 54, change: "+14" },
      { name: "Finanzas", current: 71, previous: 62, change: "+9" },
    ],
    weeklyData: [65, 70, 72, 74, 76, 74, 78],
  },
  mexico: {
    name: "Boutique Carmela",
    image: boutiqueImg,
    period: "Últimos 30 días",
    metrics: [
      { label: "Ingresos", value: "$485K", change: "+22%", positive: true, icon: DollarSign },
      { label: "Clientes", value: "892", change: "+35%", positive: true, icon: Users },
      { label: "Ticket prom.", value: "$5.2K", change: "+10%", positive: true, icon: Target },
      { label: "Rating", value: "4.5★", change: "+0.2", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Ventas", current: 74, previous: 58, change: "+16" },
      { name: "Reputación", current: 82, previous: 76, change: "+6" },
      { name: "Eficiencia", current: 65, previous: 53, change: "+12" },
      { name: "Finanzas", current: 62, previous: 49, change: "+13" },
    ],
    weeklyData: [58, 62, 68, 65, 71, 74, 76],
  },
  marketing: {
    name: "Rocket Digital",
    image: marketingImg,
    period: "Últimos 30 días",
    metrics: [
      { label: "Facturación", value: "$8.2M", change: "+12%", positive: true, icon: DollarSign },
      { label: "Clientes", value: "18", change: "+2", positive: true, icon: Users },
      { label: "MRR", value: "$2.8M", change: "+8%", positive: true, icon: Target },
      { label: "NPS", value: "58", change: "+5", positive: true, icon: Star },
    ],
    dimensions: [
      { name: "Ventas", current: 62, previous: 47, change: "+15" },
      { name: "Clientes", current: 55, previous: 48, change: "+7" },
      { name: "Eficiencia", current: 68, previous: 55, change: "+13" },
      { name: "Finanzas", current: 48, previous: 40, change: "+8" },
    ],
    weeklyData: [45, 50, 54, 52, 58, 56, 62],
  }
};

export const MockupProAnalytics = forwardRef<HTMLDivElement, MockupProAnalyticsProps>(({ business = "argentina" }, ref) => {
  const data = analyticsData[business];
  
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
              <span className="text-xs sm:text-sm font-bold text-foreground">Analíticas Avanzadas</span>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-muted text-muted-foreground text-[9px] sm:text-[10px] font-medium">
              {data.period}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-2.5 sm:p-3 grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {data.metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
            className="p-2 sm:p-2.5 rounded-xl bg-secondary/30 border border-border"
          >
            <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
              <metric.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-1 sm:gap-1.5">
              <span className="text-base sm:text-lg font-bold text-foreground">{metric.value}</span>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-medium flex items-center",
                metric.positive ? "text-success" : "text-destructive"
              )}>
                {metric.positive ? <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" /> : <TrendingDown className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
                {metric.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Evolution Chart */}
      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/20 border border-border">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[10px] sm:text-xs font-medium text-foreground">Evolución de Salud</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">Últimos 7 días</span>
          </div>
          
          {/* Mini chart visualization */}
          <div className="flex items-end gap-1 h-12 sm:h-16">
            {data.weeklyData.map((value, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(value / 100) * 100}%` }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                className={cn(
                  "flex-1 rounded-t-sm",
                  i === data.weeklyData.length - 1 ? "bg-primary" : "bg-primary/40"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[7px] sm:text-[8px] text-muted-foreground">
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
      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-secondary/20 border border-border">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">Mejora por Dimensión</span>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {data.dimensions.map((dim, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05, duration: 0.15 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-[9px] sm:text-[10px] text-muted-foreground w-14 sm:w-16 truncate">{dim.name}</span>
                <div className="flex-1 h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden relative">
                  {/* Previous */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-muted-foreground/30 rounded-full"
                    style={{ width: `${dim.previous}%` }}
                  />
                  {/* Current */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.current}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                    className="absolute inset-y-0 left-0 bg-success rounded-full"
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-success">{dim.change}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

MockupProAnalytics.displayName = "MockupProAnalytics";
