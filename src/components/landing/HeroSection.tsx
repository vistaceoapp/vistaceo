import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Brain, Target, Zap, CheckCircle2, Star, Clock, ChevronDown, Radar } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCountryDetection } from "@/hooks/use-country-detection";
import { MockupRadar } from "./mockups/MockupRadar";
import { MockupMissions } from "./mockups/MockupMissions";

// Mockup data for the live dashboard preview
const MOCK_BUSINESS = {
  name: "Café Aurora",
  type: "Cafetería Premium",
  city: "Buenos Aires",
  healthScore: 78,
  healthChange: +12,
  certaintyPct: 72,
  dimensions: [
    { name: "Crecimiento", score: 82, icon: "📈" },
    { name: "Reputación", score: 91, icon: "⭐" },
    { name: "Eficiencia", score: 74, icon: "⚡" },
    { name: "Finanzas", score: 68, icon: "💰" },
  ],
  todayAction: {
    title: "Optimizar horario de apertura los sábados",
    impact: "+$45,000/mes",
    time: "15 min",
    priority: "alta",
  },
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const { formatCurrencyShort, monthlyPrice, isDetecting } = useCountryDetection();
  
  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos" },
    { value: 32, suffix: "%", label: "Crecimiento promedio" },
    { value: 180, suffix: "+", label: "Tipos de negocio" },
  ];

  const benefits = [
    { icon: Brain, text: "Analiza tu negocio 24/7" },
    { icon: Target, text: "Te dice qué hacer cada día" },
    { icon: TrendingUp, text: "Aprende y mejora contigo" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-20 pb-8">
      {/* Background with premium animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px]" 
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" 
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto text-center flex-1 flex flex-col">
          {/* Live Badge - No logo since it's in header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-sm font-medium">Inteligencia activa 24/7</span>
            </div>
          </motion.div>

          {/* Main headline - ULTRA IMPACTANTE */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-[1.05] tracking-tight"
          >
            Tu{" "}
            <span className="text-gradient-primary relative">
              CEO digital
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-lg -z-10"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
            <br className="hidden sm:block" />
            {" "}que piensa por vos
          </motion.h1>

          {/* Subheadline - CLARÍSIMO */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            VistaCEO analiza tu negocio, detecta oportunidades y te dice{" "}
            <span className="text-foreground font-semibold">exactamente qué hacer</span>{" "}
            para crecer. Cada día.
          </motion.p>

          {/* Benefits pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6"
          >
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary/80 border border-border text-foreground"
              >
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">{benefit.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA + Price hint */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-3 mb-8"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group text-base sm:text-lg px-8 sm:px-10 py-5 sm:py-6 h-auto shadow-2xl"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Sin tarjeta
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                3 min de setup
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-accent" />
                {!isDetecting && `Pro desde ${formatCurrencyShort(monthlyPrice)}/mes`}
              </span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tabular-nums">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ULTRA WOW Triple Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex-1 flex items-start justify-center"
          >
            <div className="w-full max-w-6xl relative">
              {/* Glow effect */}
              <motion.div 
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-8 bg-gradient-to-r from-primary/15 via-accent/15 to-primary/15 rounded-3xl blur-3xl" 
              />
              
              {/* Triple panel layout */}
              <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Left: Radar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="hidden lg:block"
                >
                  <MockupRadar />
                </motion.div>

                {/* Center: Main Dashboard Card */}
                <div className="lg:col-span-1">
                  <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Top navigation bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{MOCK_BUSINESS.name}</div>
                          <div className="text-[10px] text-muted-foreground">{MOCK_BUSINESS.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        En vivo
                      </div>
                    </div>
                    
                    {/* Health Score */}
                    <div className="p-4">
                      <div className="bg-secondary/50 rounded-xl border border-border p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground">Salud del Negocio</span>
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                            {MOCK_BUSINESS.certaintyPct}% certeza
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <motion.div 
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success/20 to-success/10 border-2 border-success/30 flex flex-col items-center justify-center"
                            >
                              <span className="text-3xl font-bold text-success">{MOCK_BUSINESS.healthScore}</span>
                              <span className="text-[10px] text-success font-medium">Bueno</span>
                            </motion.div>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center"
                            >
                              <TrendingUp className="w-3 h-3 text-white" />
                            </motion.div>
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            {MOCK_BUSINESS.dimensions.map((dim, i) => (
                              <motion.div 
                                key={dim.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + i * 0.1 }}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs">{dim.icon}</span>
                                <span className="text-[10px] text-muted-foreground w-16 truncate">{dim.name}</span>
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${dim.score}%` }}
                                    transition={{ delay: 1.1 + i * 0.1, duration: 0.6 }}
                                    className="h-full rounded-full"
                                    style={{ 
                                      backgroundColor: dim.score >= 80 ? 'hsl(var(--success))' : 
                                                       dim.score >= 60 ? 'hsl(var(--primary))' : 
                                                       'hsl(var(--warning))' 
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-medium text-foreground w-6 text-right">{dim.score}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-success text-xs mt-3 pt-3 border-t border-border">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{MOCK_BUSINESS.healthChange} pts esta semana</span>
                        </div>
                      </div>

                      {/* Today's Action */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-xl border border-primary/20 p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-muted-foreground">Tu acción de hoy</span>
                            <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium uppercase">
                              Alta prioridad
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-foreground text-sm mb-2">
                          {MOCK_BUSINESS.todayAction.title}
                        </h4>
                        
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-success font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {MOCK_BUSINESS.todayAction.impact}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {MOCK_BUSINESS.todayAction.time}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Bottom bar */}
                    <div className="px-4 py-3 border-t border-border bg-secondary/20">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-foreground font-medium">VistaCEO</span>
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex items-center gap-0.5"
                            >
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              <span className="w-1 h-1 rounded-full bg-primary" />
                              <span className="w-1 h-1 rounded-full bg-primary" />
                            </motion.div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Analizando datos en tiempo real...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Missions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className="hidden lg:block"
                >
                  <MockupMissions />
                </motion.div>
              </div>

              {/* Mobile: Show Radar and Missions below */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="scale-[0.85] origin-top"
                >
                  <MockupRadar />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="scale-[0.85] origin-top"
                >
                  <MockupMissions />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-col items-center mt-6"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-muted-foreground" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
