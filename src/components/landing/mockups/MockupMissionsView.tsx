import { motion } from "framer-motion";
import { 
  ArrowLeft, Target, Star, Clock, TrendingUp, 
  ChevronRight, RefreshCw, Pause, CheckCircle2,
  Sparkles, AlertTriangle
} from "lucide-react";

export const MockupMissionsView = () => {
  const missions = [
    { title: "[I+D] Paladar 2026: los...", active: true, progress: "0/3" },
    { title: "Automatizar reservas onlin...", progress: "0/4" },
    { title: "[I+D] Aprovechar el auge d...", progress: "0/3" },
    { title: "Implementación de un...", progress: "0/4" },
    { title: "Estrategia de 'Menú del Día...", progress: "0/4" },
  ];

  const metrics = [
    { label: "Probabilidad", value: "70%", sub: "Alta", color: "text-success" },
    { label: "Impacto", value: "7/10", color: "text-primary" },
    { label: "Esfuerzo", value: "5/10", color: "text-warning" },
    { label: "Tiempo restante", value: "1h 30min", color: "text-muted-foreground" },
    { label: "Beneficio esperado", value: "+10-15% ticket", color: "text-success" },
  ];

  const achievements = [
    "Aumento del 15% en las ventas de pastelería con fruta y sabores ácidos en los primeros 30 días (ej: pasar de 10 unidades/día a 11.5 unidades/día).",
    "Incremento del 7% en el ticket promedio general de Café la Tratoría en el primer mes (ej: pasar de $X a $X*1.07).",
    "Reducción del 10% en el desperdicio de pastelería ultra-dulce tradicional en los primeros 30 días, indicando una mejor rotación de la nueva oferta.",
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
            app.vistaceo.com/missions
          </div>
        </div>
      </div>

      <div className="flex min-h-[450px]">
        {/* Mini Sidebar */}
        <div className="w-12 bg-secondary/30 border-r border-border p-2 flex flex-col gap-2 hidden sm:flex">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mx-auto">
            <Target className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Missions List */}
        <div className="w-48 border-r border-border p-3 hidden md:block">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <ArrowLeft className="w-3 h-3" />
            <span>Volver a Misiones</span>
          </div>
          
          <h3 className="text-sm font-bold text-foreground mb-3">Misiones</h3>
          
          <div className="space-y-2">
            {missions.map((mission, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  mission.active 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-secondary/30 border-border hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    mission.active ? 'bg-destructive/20' : 'bg-primary/20'
                  }`}>
                    <Target className={`w-3 h-3 ${mission.active ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground truncate">{mission.title}</p>
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.5 rounded text-[8px] bg-success text-white">Activa</span>
                      <span className="text-[8px] text-muted-foreground">{mission.progress}</span>
                    </div>
                  </div>
                  <Star className="w-3 h-3 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mission Detail */}
        <div className="flex-1 p-4 overflow-auto">
          {/* Mission Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  [I+D] Paladar 2026: los dulces con fruta y sabores ácidos...
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>1h 30min restante</span>
                  <span>0/3 pasos</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-[10px] bg-success text-white">Activa</span>
              <button className="px-2 py-1 rounded border border-border text-[10px] flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Regenerar
              </button>
              <button className="px-2 py-1 rounded border border-border text-[10px] flex items-center gap-1">
                <Pause className="w-3 h-3" />
                Pausar
              </button>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 mb-4">
            <button className="px-3 py-2 rounded-lg gradient-primary text-white text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Ver resumen de misión
            </button>
            <button className="px-3 py-2 rounded-lg border border-border text-xs flex items-center gap-1">
              <Target className="w-3 h-3" />
              Ver guía por pasos
            </button>
          </div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/30 rounded-xl p-4 border border-border mb-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Transformación Dulce-Ácida para Café la Tratoría: Vitrina 2026 con Frutas Frescas
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                    Renovar la oferta de pastelería de Café la Tratoría con opciones de frutas y sabores ácidos para captar el 60% de consumidores argentinos que prefieren estas tendencias...
                  </p>
                </div>
              </div>
              <button className="text-[10px] text-primary flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Regenerar
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 rounded text-[9px] bg-warning/20 text-warning flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Riesgo Bajo
              </span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Origen: Radar Externo (I+D)
              </span>
              <span className="px-2 py-1 rounded text-[9px] bg-success text-white">Activa</span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-background/50 rounded-lg p-2 text-center"
                >
                  <div className="text-[9px] text-muted-foreground mb-1">{metric.label}</div>
                  <div className={`text-sm font-bold ${metric.color}`}>{metric.value}</div>
                  {metric.sub && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-success/20 text-success">{metric.sub}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Achievements */}
            <div className="bg-success/5 rounded-lg p-3 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🏆</span>
                <span className="text-xs font-medium text-foreground">Qué vas a lograr</span>
              </div>
              <div className="space-y-2">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground">{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
