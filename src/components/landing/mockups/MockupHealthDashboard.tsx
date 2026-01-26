import { motion } from "framer-motion";
import { Star, Stethoscope, TrendingUp, BarChart3, RefreshCw, Clock, Users, DollarSign, Handshake, PieChart, Zap, TrendingDown } from "lucide-react";

export const MockupHealthDashboard = () => {
  const dimensions = [
    { 
      name: "Tráfico", 
      score: 50, 
      status: "En riesgo", 
      icon: Users,
      description: "Flujo de clientes, canales y horarios pico",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-l-warning"
    },
    { 
      name: "Rentabilidad", 
      score: 45, 
      status: "En riesgo", 
      icon: DollarSign,
      description: "Márgenes, food cost y rentabilidad por producto",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-l-warning"
    },
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

      {/* Tabs */}
      <div className="flex border-b border-border bg-card">
        {[
          { icon: Star, label: "Reputación", active: false },
          { icon: Stethoscope, label: "Diagnóstico", active: true },
          { icon: TrendingUp, label: "Evolución", active: false },
          { icon: BarChart3, label: "Métricas", active: false },
        ].map((tab, i) => (
          <div 
            key={i}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab.active 
                ? 'border-primary text-foreground bg-background' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Alert bar */}
      <div className="h-1 bg-destructive" />

      <div className="p-4 sm:p-6 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Salud General del Negocio</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" /> Hoy
            </span>
            <button className="px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-2 hover:bg-muted transition-colors">
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Health Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-4"
          >
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-destructive/40 flex flex-col items-center justify-center bg-destructive/5">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex items-baseline gap-1"
              >
                <span className="text-4xl sm:text-5xl font-bold text-destructive">38</span>
                <TrendingDown className="w-5 h-5 text-destructive" />
              </motion.div>
              <span className="text-sm font-semibold text-destructive mt-2 px-3 py-1 rounded-full bg-destructive/10">
                Crítico
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Requiere atención urgente</p>
            <span className="text-xs text-destructive mt-1">-3 pts vs anterior</span>
          </motion.div>

          {/* Radar Chart - 7 dimensions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center py-4"
          >
            <div className="relative w-44 h-44 sm:w-52 sm:h-52">
              {/* Radar background circles */}
              <div className="absolute inset-0 border border-border/40 rounded-full" />
              <div className="absolute inset-[15%] border border-border/40 rounded-full" />
              <div className="absolute inset-[30%] border border-border/40 rounded-full" />
              <div className="absolute inset-[45%] border border-border/40 rounded-full" />
              
              {/* Radar shape - irregular polygon showing different scores */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <polygon
                  points="50,25 72,32 78,55 65,78 35,78 22,55 28,32"
                  fill="hsl(var(--primary) / 0.2)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Labels - 7 dimensions positioned around */}
              {[
                { label: "Tráfico", angle: -90 },
                { label: "Rentabilidad", angle: -38.57 },
                { label: "Equipo", angle: 12.86 },
                { label: "Finanzas", angle: 64.29 },
                { label: "Eficiencia", angle: 115.71 },
                { label: "Crecimiento", angle: 167.14 },
                { label: "Reputación", angle: 218.57 },
              ].map((dim, i) => {
                const rad = dim.angle * (Math.PI / 180);
                const x = 50 + 46 * Math.cos(rad);
                const y = 50 + 46 * Math.sin(rad);
                return (
                  <span
                    key={dim.label}
                    className="absolute text-[9px] sm:text-[10px] text-muted-foreground font-medium whitespace-nowrap"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {dim.label}
                  </span>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Dimension Cards - Expanded view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim, i) => (
            <motion.div
              key={dim.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`p-4 rounded-xl border bg-card ${dim.borderColor} border-l-4`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${dim.bgColor} flex items-center justify-center`}>
                    <dim.icon className={`w-5 h-5 ${dim.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{dim.name}</span>
                      <TrendingUp className={`w-4 h-4 ${dim.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{dim.description}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${dim.color}`}>{dim.score}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${dim.bgColor} ${dim.color}`}>
                    {dim.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progreso</span>
                  <span>{dim.score}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${dim.name === "Tráfico" ? "bg-primary" : "bg-warning"} rounded-full transition-all`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {dim.name === "Tráfico" 
                  ? "Analiza el volumen y distribución de clientes: qué canales generan más tráfico, cuáles son tus horarios pico."
                  : "Mide qué tan eficiente sos convirtiendo ventas en ganancia. Incluye food cost, márgenes por plato."
                }
              </p>

              {/* Metrics and sources */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                    <PieChart className="w-3 h-3" /> Métricas clave
                  </div>
                  <div className="text-[10px] text-foreground space-y-0.5">
                    {dim.name === "Tráfico" ? (
                      <>
                        <div>• Clientes por día</div>
                        <div>• Mix de canales</div>
                      </>
                    ) : (
                      <>
                        <div>• Food cost %</div>
                        <div>• Margen bruto</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                    ⓘ Fuentes de datos
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(dim.name === "Tráfico" 
                      ? ["POS/Ventas", "Delivery"] 
                      : ["Menú", "Costos"]
                    ).map((source, j) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-background text-[9px] text-foreground border border-border">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick tips */}
              <div className="flex flex-wrap gap-1">
                {(dim.name === "Tráfico" 
                  ? ["Promociones", "Diversificar"] 
                  : ["Food cost", "Optimizar"]
                ).map((tip, j) => (
                  <span key={j} className="px-2 py-1 rounded-lg bg-muted text-[10px] text-muted-foreground">
                    {tip}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
