import { motion } from "framer-motion";
import { 
  Brain, Target, Sparkles, TrendingUp, Star, 
  Zap, DollarSign, Users, Clock, ChevronRight,
  MessageSquare, BarChart3, Settings
} from "lucide-react";

export const MockupFullDashboard = () => {
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
            app.vistaceo.com/dashboard
          </div>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex min-h-[400px]">
        {/* Sidebar */}
        <div className="w-14 bg-secondary/30 border-r border-border p-2 flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-1 pt-2">
            {[Target, Sparkles, BarChart3, MessageSquare, Settings].map((Icon, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                  i === 0 ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Café Aurora</h2>
              <p className="text-[10px] text-muted-foreground">Buenos días, Martín</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-medium flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                En vivo
              </motion.div>
            </div>
          </div>

          {/* Widgets grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Health Score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-1 bg-secondary/50 rounded-xl p-3 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground">Salud</span>
                <span className="text-[10px] text-success">+12</span>
              </div>
              <div className="text-2xl font-bold text-success">78</div>
              <div className="text-[10px] text-muted-foreground">72% certeza</div>
            </motion.div>

            {/* Missions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-1 bg-secondary/50 rounded-xl p-3 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground">Misiones</span>
                <Target className="w-3 h-3 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-[10px] text-muted-foreground">67% avance</div>
            </motion.div>

            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="col-span-1 bg-secondary/50 rounded-xl p-3 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground">Radar</span>
                <Sparkles className="w-3 h-3 text-accent" />
              </div>
              <div className="text-2xl font-bold text-accent">5</div>
              <div className="text-[10px] text-muted-foreground">Oportunidades</div>
            </motion.div>
          </div>

          {/* Today's Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3 border border-primary/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-primary">Tu acción de hoy</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-warning/20 text-warning">Alta</span>
                </div>
                <p className="text-xs font-medium text-foreground mb-1">
                  Optimizar horario de sábados
                </p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    +$45,000/mes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    15 min
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.div>

          {/* Dimensions preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-4 gap-2"
          >
            {[
              { icon: "📈", name: "Crecimiento", score: 82 },
              { icon: "⭐", name: "Reputación", score: 91 },
              { icon: "⚡", name: "Eficiencia", score: 74 },
              { icon: "💰", name: "Finanzas", score: 68 },
            ].map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-secondary/30 rounded-lg p-2 text-center"
              >
                <div className="text-sm mb-1">{dim.icon}</div>
                <div className={`text-xs font-bold ${dim.score >= 80 ? 'text-success' : dim.score >= 60 ? 'text-primary' : 'text-warning'}`}>
                  {dim.score}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
