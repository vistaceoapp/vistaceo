import { motion } from "framer-motion";
import { 
  Home, MessageSquare, Target, Radar, BarChart3, Settings, HelpCircle, 
  Moon, ChevronRight, Bell, TrendingUp, Star, RefreshCw,
  CheckCircle2, Sparkles, Zap, Info, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

// Real business photos
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";

// Owl logo
import owlLogo from "@/assets/brand/icon-light.png";

interface MockupFullDashboardProps {
  business?: "argentina" | "mexico";
}

const businessData = {
  argentina: {
    name: "Parrilla Don Martín",
    type: "Restaurante / Parrilla",
    location: "Palermo, Buenos Aires",
    image: parrillaImg,
    owner: "Martín",
    healthScore: 78,
    healthLabel: "Bueno",
    healthChange: +4,
    certaintyPct: 85,
    dimensions: [
      { name: "Ventas", score: 82, icon: "📈" },
      { name: "Reputación", score: 91, icon: "⭐" },
      { name: "Eficiencia", score: 74, icon: "⚡" },
      { name: "Finanzas", score: 68, icon: "💰" },
    ],
    focus: { area: "Ventas", description: "Aumentar ingresos y ticket promedio" },
    reputation: { platform: "Google Reviews", score: 4.5, reviews: 127, change: "+0.2" },
    pulseDate: "lunes, 27 de enero",
    radarCount: 5,
    greeting: "Buenas tardes",
  },
  mexico: {
    name: "Boutique Carmela",
    type: "Retail / Moda",
    location: "Polanco, CDMX",
    image: boutiqueImg,
    owner: "Carolina",
    healthScore: 85,
    healthLabel: "Excelente",
    healthChange: +6,
    certaintyPct: 92,
    dimensions: [
      { name: "Ventas", score: 88, icon: "📈" },
      { name: "Reputación", score: 94, icon: "⭐" },
      { name: "Eficiencia", score: 82, icon: "⚡" },
      { name: "Finanzas", score: 78, icon: "💰" },
    ],
    focus: { area: "Reputación", description: "Mejorar presencia en redes sociales" },
    reputation: { platform: "Google Reviews", score: 4.8, reviews: 89, change: "+0.3" },
    pulseDate: "lunes, 27 de enero",
    radarCount: 3,
    greeting: "Buenas tardes",
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-warning";
  return "text-destructive";
};

const getBarColor = (score: number) => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
};

const getHealthStripe = (score: number) => {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-primary";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
};

export const MockupFullDashboard = forwardRef<HTMLDivElement, MockupFullDashboardProps>(
  ({ business = "argentina" }, ref) => {
    const data = businessData[business];
    
    const navItems = [
      { icon: Home, label: "Inicio", sublabel: "Dashboard principal", active: true },
      { icon: MessageSquare, label: "Chat", sublabel: "Asistente IA", badge: "IA" },
      { icon: Target, label: "Misiones", sublabel: "Proyectos activos" },
      { icon: Radar, label: "Radar", sublabel: "Oportunidades", count: data.radarCount },
      { icon: BarChart3, label: "Analytics", sublabel: "Métricas y tendenci...", badge: "Nuevo" },
    ];

    const pulseOptions = [
      { emoji: "😰", label: "Muy Flojo" },
      { emoji: "😐", label: "Flojo" },
      { emoji: "👍", label: "Normal" },
      { emoji: "🔥", label: "Bien" },
      { emoji: "🚀", label: "Excelente" },
    ];

    return (
      <div ref={ref} className="bg-background rounded-xl border border-border shadow-2xl overflow-hidden w-full">
        {/* Health stripe */}
        <div className={cn("h-1.5", getHealthStripe(data.healthScore))} />
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-[200px] border-r border-border bg-card flex-shrink-0 hidden md:flex flex-col">
            {/* Logo + Business */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <img src={owlLogo} alt="VistaCEO" className="w-7 h-7" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground truncate">{data.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{data.type}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Nav */}
            <div className="flex-1 p-2 space-y-0.5">
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                Principal
              </div>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors",
                    item.active 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className={cn(
                      "text-[10px] truncate",
                      item.active ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {item.sublabel}
                    </div>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded",
                      item.badge === "IA" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {item.count}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bottom */}
            <div className="p-2 border-t border-border space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer">
                <Zap className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">Plan Free</div>
                  <div className="text-[10px] text-muted-foreground">Actualiza a Pro</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <HelpCircle className="w-4 h-4" />
                <span>Ayuda</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground">
                <Moon className="w-4 h-4" />
                <span>Cambiar tema</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Top Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
              <div>
                <div className="text-xs text-muted-foreground">{data.greeting},</div>
                <div className="text-base font-bold text-foreground">{data.owner}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center font-bold">
                    3
                  </span>
                </div>
                <div className="flex items-center gap-2 pl-3 border-l border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
                    {data.owner[0]}
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-foreground">{data.owner}</div>
                    <div className="text-[10px] text-muted-foreground truncate max-w-[100px]">{data.name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area with greeting */}
            <div className="flex-1 p-4 md:p-5 overflow-auto bg-secondary/5">
              {/* Greeting */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">☀️</span>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">{data.greeting}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground">{data.name} • {data.pulseDate}</p>
                </div>
                <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-4 h-4" />
                  Personalizar
                </button>
              </div>

              <div className="flex gap-5">
                {/* Left Column - Main widgets */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Health Score Widget */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-base text-foreground">Salud de Negocio</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {data.certaintyPct}% certeza
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* Score */}
                      <div className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl min-w-[100px]",
                        "bg-success/5 border border-success/20"
                      )}>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-4xl font-bold", getScoreColor(data.healthScore))}>
                            {data.healthScore}
                          </span>
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 mt-1">
                          {data.healthLabel}
                        </span>
                      </div>

                      {/* Dimensions */}
                      <div className="flex-1 space-y-2">
                        {data.dimensions.map((dim, i) => (
                          <motion.div
                            key={dim.name}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <span className="text-sm">{dim.icon}</span>
                            <span className="text-xs text-muted-foreground w-20 truncate">{dim.name}</span>
                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${dim.score}%` }}
                                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                                className={cn("h-full rounded-full", getBarColor(dim.score))}
                              />
                            </div>
                            <span className={cn("text-xs font-bold w-6 text-right", getScoreColor(dim.score))}>
                              {dim.score}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Certainty bar */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Info className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Nivel de certeza del análisis</span>
                        <span className="text-[10px] font-medium text-foreground ml-auto">{data.certaintyPct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${data.certaintyPct}%` }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                          className="h-full bg-success rounded-full"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center mt-2">
                        Conectá Google o integraciones para más precisión
                      </p>
                    </div>
                  </motion.div>

                  {/* Pulse Check-in Widget */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground">Check-in de Pulso</h3>
                        <p className="text-xs text-muted-foreground">🗓️ {data.pulseDate}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">¿Cómo estuvo el día hoy?</p>

                    <div className="grid grid-cols-5 gap-2">
                      {pulseOptions.map((option, i) => (
                        <motion.button
                          key={option.label}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--muted))" }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer"
                        >
                          <span className="text-xl">{option.emoji}</span>
                          <span className="text-[10px] text-muted-foreground">{option.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Sidebar widgets */}
                <div className="hidden lg:block w-[220px] space-y-4 flex-shrink-0">
                  {/* Focus Widget */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Foco actual</span>
                      </div>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <span className="text-lg">💰</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{data.focus.area}</div>
                        <div className="text-[10px] text-muted-foreground leading-tight">{data.focus.description}</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          <span className="font-medium text-foreground">Recomendado:</span> Mantener el mismo foco 15-30 días para que la planificación sea consistente.
                        </p>
                      </div>
                    </div>

                    <button className="w-full py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors">
                      Solicitar cambio de foco
                    </button>
                    <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                      El sistema propone el foco ideal según tu situación
                    </p>
                  </motion.div>

                  {/* Reputation Widget */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-card rounded-xl border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">Reputación</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30">
                        Conectado
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">{data.reputation.platform}</span>
                        <span className="text-[10px] text-success flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {data.reputation.change}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="text-xl font-bold text-foreground">{data.reputation.score}</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(data.reputation.score / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">{data.reputation.reviews} reseñas</p>
                    </div>

                    <button className="w-full flex items-center justify-center gap-1 py-2 mt-3 text-xs text-primary hover:underline">
                      Ver más detalles
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MockupFullDashboard.displayName = "MockupFullDashboard";
