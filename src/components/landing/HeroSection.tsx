import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Play, Zap, Building2, Store, Briefcase, Users } from "lucide-react";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { TypewriterText } from "./TypewriterText";
import { AnimatedCounter } from "./AnimatedCounter";
import { LiveCounter } from "./LiveCounter";
import { useNavigate } from "react-router-dom";

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
    { value: 12, suffix: "min", label: "Tiempo promedio/día" },
    { value: 32, suffix: "%", label: "Crecimiento promedio" },
  ];

  const businessTypes = [
    { icon: Store, label: "Comercio" },
    { icon: Building2, label: "Servicios" },
    { icon: Briefcase, label: "Profesionales" },
    { icon: Users, label: "Equipos" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/30" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px] animate-pulse-slow" 
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.08) 0%, transparent 70%)' }} 
      />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[150px] animate-pulse-slow" 
        style={{ background: 'radial-gradient(circle, hsl(254, 61%, 67%, 0.06) 0%, transparent 70%)', animationDelay: '1.5s' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Tu CEO digital con IA</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 animate-fade-up leading-[1.1] tracking-tight">
            Un CEO que piensa en tu{" "}
            <br className="hidden sm:block" />
            negocio{" "}
            <span className="text-gradient-primary">24/7</span>
          </h1>

          {/* Subheadline with typewriter */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Te dice{" "}
            <TypewriterText 
              texts={typewriterTexts} 
              className="text-foreground font-medium"
            />
          </p>

          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.15s' }}>
            Cada vez más inteligente. Resultados reales. 
            <span className="text-foreground font-medium"> A una fracción del costo.</span>
          </p>

          {/* Business types */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {businessTypes.map((type, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground hover:border-primary/40 transition-all duration-200 cursor-default"
              >
                <type.icon className="w-4 h-4 text-primary" />
                <span>{type.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-medium">
              <span>+50 industrias</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto group"
              onClick={() => navigate("/auth")}
            >
              Comenzar gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto group">
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Ver cómo funciona
            </Button>
          </div>

          {/* Live Counter */}
          <div className="flex justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <LiveCounter targetNumber={37000} label="Usuarios activos en las últimas 24h" />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-foreground tabular-nums">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Preview Card */}
        <div className="mt-20 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="relative group">
            {/* Card */}
            <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <VistaceoLogo size={36} variant="icon" />
                  <div>
                    <div className="text-xs text-muted-foreground">vistaceo dice:</div>
                    <div className="text-sm font-medium text-primary">Tu acción de hoy</div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/10 px-3 py-1.5 rounded-full border border-warning/20">
                  <Zap className="w-3 h-3" />
                  Alta prioridad
                </span>
              </div>

              {/* Action content */}
              <div className="bg-secondary/50 rounded-xl p-5 border border-border mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 text-xl">
                    🎯
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Revisar propuesta de cliente clave
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      El cliente <span className="text-foreground font-medium">Grupo XYZ</span> está esperando respuesta. 
                      Cerrar esto puede representar <span className="text-success font-medium">+$15,000</span> en ventas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist preview */}
              <div className="space-y-2 mb-6">
                {["Revisar números del presupuesto", "Confirmar disponibilidad", "Enviar propuesta final"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary/50" />
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
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center mt-16 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <span className="text-xs text-muted-foreground mb-2">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full gradient-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
