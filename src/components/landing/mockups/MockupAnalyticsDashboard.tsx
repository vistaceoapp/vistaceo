import { motion } from "framer-motion";
import { 
  Home, MessageSquare, Target, Sparkles, BarChart3, 
  TrendingDown, RefreshCw
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
    <div className="bg-background rounded-2xl border border-border shadow-2xl overflow-hidden w-full">
      {/* Browser header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-warning/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-full bg-muted text-[10px] text-muted-foreground">
            app.vistaceo.com/analytics
          </div>
        </div>
      </div>

      <div className="flex min-h-[450px]">
        {/* Sidebar - Exact match to real platform */}
        <div className="w-52 bg-card border-r border-border p-4 hidden md:flex flex-col">
          {/* Logo */}
          <div className="text-xl font-bold text-primary mb-6">vistaceo</div>
          
          {/* Navigation label */}
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Principal</div>
          
          {/* Navigation items */}
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-[10px] ${item.active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {item.sub}
                  </div>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    item.active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 bg-background">
          {/* Alert bar */}
          <div className="h-1 bg-destructive rounded-t-lg -mx-6 -mt-6 mb-6" />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">Salud General del Negocio</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground flex items-center gap-2">
                <span>⏱</span> Hoy
              </span>
              <button className="px-4 py-2 rounded-lg border border-border text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Health Score - Exact match */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-36 h-36 rounded-2xl border-4 border-destructive/40 flex flex-col items-center justify-center bg-destructive/5">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-5xl font-bold text-destructive"
                >
                  38
                </motion.div>
                <TrendingDown className="w-5 h-5 text-destructive mt-1" />
                <span className="text-sm font-medium text-destructive mt-2">Crítico</span>
              </div>
              <p className="text-base text-muted-foreground mt-4">Requiere atención urgente</p>
              <span className="text-sm text-destructive mt-1">-3 pts vs anterior</span>
            </motion.div>

            {/* Radar Chart - 7 dimensions matching real platform */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-48 h-48">
                {/* Radar background circles */}
                <div className="absolute inset-0 border border-border/40 rounded-full" />
                <div className="absolute inset-6 border border-border/40 rounded-full" />
                <div className="absolute inset-12 border border-border/40 rounded-full" />
                
                {/* Radar shape */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <polygon
                    points="50,30 70,38 68,62 50,75 32,62 30,38"
                    fill="hsl(var(--primary) / 0.25)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Labels - 7 dimensions */}
                {["Tráfico", "Rentabilidad", "Equipo", "Finanzas", "Eficiencia", "Crecimiento", "Reputación"].map((label, i) => {
                  const angle = (i * 360 / 7 - 90) * (Math.PI / 180);
                  const x = 50 + 48 * Math.cos(angle);
                  const y = 50 + 48 * Math.sin(angle);
                  return (
                    <span
                      key={label}
                      className="absolute text-[10px] text-muted-foreground font-medium"
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

          {/* Dimension Cards - Exact match to real platform */}
          <div className="grid grid-cols-2 gap-3">
            {dimensions.map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`p-4 rounded-xl border-l-4 bg-card ${
                  dim.status === "Crítico" ? "border-l-destructive" : "border-l-warning"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{dim.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-foreground flex items-center gap-2">
                        {dim.name}
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="text-xs text-muted-foreground">Descripción breve</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${dim.color}`}>{dim.score}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                      dim.status === "Crítico" 
                        ? "bg-destructive/15 text-destructive" 
                        : "bg-warning/15 text-warning"
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