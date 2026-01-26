import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, CheckCircle2, Zap, Building2, Store, Briefcase, Users, TrendingUp, Brain } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { TypewriterText } from "./TypewriterText";
import { AnimatedCounter } from "./AnimatedCounter";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Import hero image
import heroBg from "@/assets/hero-bg-violet.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const typewriterTexts = [
    "qué acción tomar hoy",
    "cómo aumentar ventas",
    "qué oportunidad aprovechar",
    "cómo optimizar costos",
    "qué decisión tomar",
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos" },
    { value: 32, suffix: "%", label: "Crecimiento promedio" },
    { value: 9, suffix: "", label: "Países" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10 dark:opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
      </div>
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Animated gradient orbs */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px]" 
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.12) 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]" 
        style={{ background: 'radial-gradient(circle, hsl(254, 61%, 67%, 0.1) 0%, transparent 70%)' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/80 border border-border backdrop-blur-sm text-foreground mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium">El CEO más inteligente que tu negocio puede tener</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-8 leading-[1.1] tracking-tight"
          >
            VistaCEO{" "}
            <span className="text-gradient-primary">analiza</span>,{" "}
            <span className="text-gradient-primary">piensa</span>{" "}
            y te dice{" "}
            <span className="text-gradient-primary">qué hacer</span>
          </motion.h1>

          {/* Subheadline with typewriter */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Cada día, te dice exactamente{" "}
            <TypewriterText 
              texts={typewriterTexts} 
              className="text-foreground font-semibold"
            />
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Inteligencia artificial que entiende tu negocio, prioriza lo importante 
            y genera resultados reales.{" "}
            <span className="text-foreground font-medium">A una fracción del costo de un consultor.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto group text-base px-8"
              onClick={() => navigate("/auth")}
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="heroOutline" 
              size="xl" 
              className="w-full sm:w-auto group"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Ver cómo funciona
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-20"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Interactive Preview Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Card */}
              <div className="relative bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-2xl">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <VistaceoLogo size={40} variant="icon" className="animate-float" />
                    <div>
                      <div className="text-xs text-muted-foreground">VistaCEO dice:</div>
                      <div className="text-sm font-semibold text-primary">Tu acción de hoy</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full">
                    <Zap className="w-3 h-3" />
                    Alta prioridad
                  </span>
                </div>

                {/* Action content */}
                <div className="bg-secondary/50 rounded-xl p-5 border border-border mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <Brain className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Revisar propuesta de cliente clave
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        El cliente <span className="text-foreground font-medium">Grupo XYZ</span> está esperando respuesta. 
                        Cerrar esto puede representar <span className="text-success font-semibold">+$15,000</span> en ventas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist preview */}
                <div className="space-y-2 mb-6">
                  {["Revisar números del presupuesto", "Confirmar disponibilidad", "Enviar propuesta final"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary/60" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button size="lg" className="flex-1 group">
                    Hacerlo ahora
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    Programar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center mt-16"
          >
            <span className="text-xs text-muted-foreground mb-2">Descubrí más</span>
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
