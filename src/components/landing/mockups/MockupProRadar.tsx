import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ExternalLink, Sparkles, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export type BusinessKey = "argentina" | "mexico" | "marketing" | "odontologia";

interface MockupProRadarProps {
  business?: BusinessKey;
}

const radarData: Record<BusinessKey, {
  name: string;
  internal: Array<{ title: string; impact: string; source: string; priority: string }>;
  external: Array<{ title: string; impact: string; source: string; priority: string }>;
}> = {
  argentina: {
    name: "Parrilla Don Martín",
    internal: [
      { title: "Tu horario de sábados tiene 23% menos tráfico que la competencia", impact: "+$45.000/mes", source: "Análisis interno", priority: "high" },
      { title: "3 reseñas mencionan 'espera larga' - tiempo promedio 18min", impact: "Prioridad alta", source: "Google Reviews", priority: "high" },
      { title: "El 40% de clientes piden postre pero solo tenés 3 opciones", impact: "+$28.000/mes", source: "Análisis ventas", priority: "medium" },
    ],
    external: [
      { title: "Tendencia: Cortes premium con vino maridaje +35% en Palermo", impact: "Oportunidad I+D", source: "Google Trends", priority: "medium" },
      { title: "Competidor 'La Cabrera' lanzó menú degustación con 4.8★", impact: "Monitorear", source: "Google Maps", priority: "medium" },
      { title: "Búsquedas 'parrilla eventos' +60% este mes en CABA", impact: "Nueva línea", source: "Google Trends", priority: "high" },
    ],
  },
  mexico: {
    name: "Boutique Carmela",
    internal: [
      { title: "Tus accesorios tienen 40% más margen pero solo 15% de ventas", impact: "+$28.000 MXN/mes", source: "Análisis interno", priority: "high" },
      { title: "El 60% de ventas vienen de solo 3 productos estrella", impact: "Diversificar", source: "Análisis ventas", priority: "medium" },
      { title: "Clientas VIP (15%) generan 52% de ventas", impact: "+$35.000 MXN/mes", source: "CRM interno", priority: "high" },
    ],
    external: [
      { title: "Tendencia: Moda sostenible +45% interés en CDMX", impact: "Oportunidad I+D", source: "Instagram Insights", priority: "medium" },
      { title: "Competidor 'Zara' lanzó colección local en Polanco", impact: "Monitorear", source: "Google News", priority: "medium" },
      { title: "Búsquedas 'ropa mexicana diseñador' +80% este trimestre", impact: "Posicionamiento", source: "Google Trends", priority: "high" },
    ],
  },
  marketing: {
    name: "Rocket Digital",
    internal: [
      { title: "3 clientes tienen contratos por renovar en 45 días", impact: "Retención crítica", source: "CRM", priority: "high" },
      { title: "Tu tasa de upselling es 12% vs 25% promedio industria", impact: "+$500.000 CLP/mes", source: "Análisis interno", priority: "high" },
      { title: "El 70% de tus leads vienen de solo 2 canales", impact: "Diversificar", source: "Analytics", priority: "medium" },
    ],
    external: [
      { title: "Tendencia: IA para marketing +120% en búsquedas Chile", impact: "Nuevo servicio", source: "Google Trends", priority: "high" },
      { title: "Competidor 'Agencia Sur' ofrece reporting automatizado", impact: "Diferenciación", source: "LinkedIn", priority: "medium" },
      { title: "Demanda de marketing para e-commerce +45% en Santiago", impact: "Oportunidad I+D", source: "SemRush", priority: "medium" },
    ],
  },
  odontologia: {
    name: "Clínica Dental Sonrisa",
    internal: [
      { title: "El 60% de pacientes no vuelve a control semestral", impact: "+15 citas/mes", source: "Sistema citas", priority: "high" },
      { title: "Horario 14-16h tiene 40% menos ocupación que el resto", impact: "Optimizar agenda", source: "Análisis interno", priority: "medium" },
      { title: "Solo 8% de pacientes contrata ortodoncia vs 18% promedio", impact: "+$800.000 CLP/mes", source: "Benchmark", priority: "high" },
    ],
    external: [
      { title: "Búsquedas 'blanqueamiento dental' +55% verano Chile", impact: "Campaña estacional", source: "Google Trends", priority: "high" },
      { title: "Nueva clínica abrió a 3 cuadras con precios agresivos", impact: "Monitorear", source: "Google Maps", priority: "high" },
      { title: "Tendencia: Ortodoncia invisible +80% interés adultos", impact: "Oportunidad I+D", source: "Instagram", priority: "medium" },
    ],
  }
};

export const MockupProRadar = forwardRef<HTMLDivElement, MockupProRadarProps>(({ business = "argentina" }, ref) => {
  const data = radarData[business];
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  
  const opportunities = activeTab === "internal" ? data.internal : data.external;
  
  return (
    <div ref={ref} className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-foreground">Radar de Oportunidades</span>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground">{data.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-accent/10 text-accent text-[9px] sm:text-[10px] font-medium">
              {data.internal.length + data.external.length} nuevas
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-border bg-muted/30">
        <button
          onClick={() => setActiveTab("internal")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-all border-b-2",
            activeTab === "internal"
              ? "border-warning text-foreground bg-warning/5" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Internas</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-warning/20 text-warning text-[8px] sm:text-[9px] font-bold">
            {data.internal.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("external")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-all border-b-2",
            activeTab === "external"
              ? "border-accent text-foreground bg-accent/5" 
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>I+D</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[8px] sm:text-[9px] font-bold">
            {data.external.length}
          </span>
        </button>
      </div>

      {/* Opportunities List */}
      <div className="p-2.5 sm:p-3 space-y-2">
        {opportunities.map((opp, i) => (
          <motion.div
            key={`${activeTab}-${i}`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
            className={cn(
              "p-2.5 sm:p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all",
              activeTab === "internal" 
                ? "bg-warning/5 border-warning/20 hover:border-warning/40" 
                : "bg-accent/5 border-accent/20 hover:border-accent/40"
            )}
          >
            <div className="flex items-start gap-2">
              {activeTab === "internal" ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warning" />
                </div>
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs text-foreground font-medium line-clamp-2 mb-1.5">{opp.title}</p>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className={cn(
                    "text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    activeTab === "internal" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                  )}>
                    {opp.impact}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    {opp.source}
                  </span>
                  {opp.priority === "high" && (
                    <span className="text-[9px] sm:text-[10px] text-destructive flex items-center gap-0.5">
                      <Zap className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
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
      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary/10 text-primary text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Explorar todas
        </button>
      </div>
    </div>
  );
});

MockupProRadar.displayName = "MockupProRadar";
