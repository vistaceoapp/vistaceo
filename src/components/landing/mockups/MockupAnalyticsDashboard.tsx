import { motion } from "framer-motion";
import { 
  Home, MessageSquare, Target, Sparkles, BarChart3, 
  Settings, HelpCircle, Moon, ChevronDown, RefreshCw,
  TrendingDown, Users, DollarSign, Gauge, TrendingUp,
  Zap
} from "lucide-react";

export const MockupAnalyticsDashboard = () => {
  const dimensions = [
    { name: "Tráfico", score: 50, status: "En riesgo", icon: "👥", color: "text-warning" },
    { name: "Rentabilidad", score: 45, status: "En riesgo", icon: "💰", color: "text-warning" },
    { name: "Equipo", score: 40, status: "En riesgo", icon: "🤝", color: "text-warning" },
    { name: "Finanzas", score: 40, status: "En riesgo", icon: "📊", color: "text-warning" },
    { name: "Eficiencia", score: 35, status: "Crítico", icon: "⚡", color: "text-destructive" },
    { name: "Crecimiento", score: 30, status: "Crítico", icon: "📈", color: "text-destructive" },
  ];

  return (
    <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Browser header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-full bg-secondary/60 text-[10px] text-muted-foreground">
            app.vistaceo.com/analytics
          </div>
        </div>
      </div>

      <div className="flex min-h-[450px]">
        {/* Sidebar */}
        <div className="w-48 bg-secondary/20 border-r border-border p-3 hidden md:flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-lg font-bold text-primary">vistaceo</div>
          </div>
          
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Principal</div>
          
          <div className="space-y-1">
            {[
              { icon: Home, label: "Inicio", sub: "Dashboard principal" },
              { icon: MessageSquare, label: "Chat", sub: "Asistente IA", badge: "IA" },
              { icon: Target, label: "Misiones", sub: "Proyectos activos" },
              { icon: Sparkles, label: "Radar", sub: "Oportunidades", badge: "3" },
              { icon: BarChart3, label: "Analytics", sub: "Métricas y tendencias", active: true },
            ].map((item, i) => (
              <div 
                key={i}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-[9px] ${item.active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.sub}
                  </div>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                    item.active ? 'bg-primary-foreground/20' : 'bg-primary/20 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Plan Free</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4">
          {/* Alert bar */}
          <div className="h-1 bg-destructive/80 rounded-t-lg -mx-4 -mt-4 mb-4" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Salud General del Negocio</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-secondary text-[10px] text-muted-foreground flex items-center gap-1">
                <span>⏱</span> Hoy
              </span>
              <button className="px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-1 hover:bg-secondary">
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Health Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-32 h-32 rounded-2xl border-4 border-destructive/30 flex flex-col items-center justify-center bg-destructive/5">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-4xl font-bold text-destructive"
                >
                  38
                </motion.div>
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-xs font-medium text-destructive mt-1">Crítico</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Requiere atención urgente</p>
              <span className="text-xs text-destructive mt-1">-3 pts vs anterior</span>
            </motion.div>

            {/* Radar Chart Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-40 h-40">
                {/* Radar background */}
                <div className="absolute inset-0 border border-border/30 rounded-full" />
                <div className="absolute inset-4 border border-border/30 rounded-full" />
                <div className="absolute inset-8 border border-border/30 rounded-full" />
                
                {/* Radar shape */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <polygon
                    points="50,25 75,35 70,65 50,80 30,65 25,35"
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                  />
                </svg>
                
                {/* Labels */}
                {["Tráfico", "Rentabilidad", "Equipo", "Finanzas", "Eficiencia", "Crecimiento", "Reputación"].map((label, i) => {
                  const angle = (i * 360 / 7 - 90) * (Math.PI / 180);
                  const x = 50 + 45 * Math.cos(angle);
                  const y = 50 + 45 * Math.sin(angle);
                  return (
                    <span
                      key={label}
                      className="absolute text-[8px] text-muted-foreground"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Dimension Cards */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {dimensions.map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-2 rounded-lg border-l-2 ${
                  dim.status === "Crítico" ? "border-l-destructive bg-destructive/5" : "border-l-warning bg-warning/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{dim.icon}</span>
                    <div>
                      <div className="text-xs font-medium text-foreground flex items-center gap-1">
                        {dim.name}
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      </div>
                      <div className="text-[9px] text-muted-foreground">Descripción breve</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${dim.color}`}>{dim.score}</div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                      dim.status === "Crítico" 
                        ? "bg-destructive/20 text-destructive" 
                        : "bg-warning/20 text-warning"
                    }`}>
                      {dim.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
