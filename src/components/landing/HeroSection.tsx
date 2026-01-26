import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Brain, Target, Zap } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { AnimatedCounter } from "./AnimatedCounter";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos" },
    { value: 32, suffix: "%", label: "Crecimiento promedio" },
    { value: 9, suffix: "", label: "Países" },
  ];

  const benefits = [
    { icon: Brain, text: "Analiza tu negocio 24/7" },
    { icon: Target, text: "Te dice qué hacer cada día" },
    { icon: TrendingUp, text: "Aprende y mejora contigo" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Background with premium gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px]" 
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.15) 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" 
        style={{ background: 'radial-gradient(circle, hsl(254, 61%, 67%, 0.12) 0%, transparent 70%)' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo + Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <VistaceoLogo size={64} variant="icon" className="animate-float" />
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
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
          >
            Tu{" "}
            <span className="text-gradient-primary">CEO digital</span>{" "}
            que piensa por vos
          </motion.h1>

          {/* Subheadline - CLARÍSIMO */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed"
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
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary/80 border border-border text-foreground"
              >
                <benefit.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Single powerful CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center gap-4 mb-12"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="group text-lg px-10 py-6 h-auto"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Sin tarjeta de crédito • Configuración en 3 minutos
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-16"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Visual preview - Dashboard mockup with real business context */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
              
              {/* Dashboard preview card */}
              <div className="relative bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <VistaceoLogo size={32} variant="icon" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Dashboard VistaCEO</div>
                      <div className="text-xs text-muted-foreground">Última actualización: hace 2 min</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Analizando
                  </div>
                </div>
                
                {/* Dashboard grid preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Health Score */}
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-2">Salud del Negocio</div>
                    <div className="text-3xl font-bold text-foreground mb-1">78<span className="text-lg text-primary">/100</span></div>
                    <div className="flex items-center gap-1 text-success text-xs">
                      <TrendingUp className="w-3 h-3" />
                      +12 esta semana
                    </div>
                  </div>
                  
                  {/* Today's Action */}
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-2">Acción de Hoy</div>
                    <div className="text-sm font-semibold text-foreground mb-1">Optimizar horario de cierre</div>
                    <div className="flex items-center gap-1 text-primary text-xs">
                      <Zap className="w-3 h-3" />
                      Alto impacto
                    </div>
                  </div>
                  
                  {/* Opportunities */}
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-2">Oportunidades</div>
                    <div className="text-3xl font-bold text-foreground mb-1">5</div>
                    <div className="flex items-center gap-1 text-accent text-xs">
                      <Target className="w-3 h-3" />
                      3 nuevas hoy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center mt-12"
          >
            <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 rounded-full gradient-primary" 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
