import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2, Play, Zap } from "lucide-react";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { TypewriterText } from "./TypewriterText";
import { AnimatedCounter } from "./AnimatedCounter";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const typewriterTexts = [
    "qué promoción lanzar hoy",
    "cómo mejorar tus reseñas",
    "qué hacer con el inventario",
    "cómo aumentar las ventas",
  ];

  const stats = [
    { value: 500, suffix: "+", label: "Negocios activos" },
    { value: 12, suffix: "min", label: "Tiempo promedio/día" },
    { value: 32, suffix: "%", label: "Aumento en ventas" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), 
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] animate-pulse-slow" 
        style={{ background: 'radial-gradient(circle, hsl(271, 91%, 65%, 0.15) 0%, transparent 70%)' }} 
      />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] animate-pulse-slow" 
        style={{ background: 'radial-gradient(circle, hsl(217, 91%, 60%, 0.1) 0%, transparent 70%)', animationDelay: '1s' }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] animate-pulse-slow" 
        style={{ background: 'radial-gradient(circle, hsl(280, 87%, 58%, 0.08) 0%, transparent 70%)', animationDelay: '2s' }} 
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary mb-10 animate-fade-up backdrop-blur-sm">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Tu CEO digital con IA</span>
            <span className="flex items-center gap-1 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Nuevo
            </span>
          </div>

          {/* Main headline with 3D effect */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-8 animate-fade-up leading-[1.1] tracking-tight">
            Te digo{" "}
            <span className="relative">
              <span className="text-gradient-primary">exactamente</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path d="M2 10C50 2 150 2 198 10" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="hsl(271, 91%, 65%)" />
                    <stop offset="100%" stopColor="hsl(280, 87%, 58%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <br />
            <TypewriterText 
              texts={typewriterTexts} 
              className="text-muted-foreground"
            />
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            UCEO analiza tu restaurante y te da{" "}
            <strong className="text-foreground font-semibold">1 acción prioritaria</strong> cada día.
            <br className="hidden sm:block" />
            Sin dashboards complicados. Sin cargar datos manualmente.
          </p>

          {/* Feature pills with icons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: "⚡", text: "Sin configuración" },
              { icon: "🧠", text: "Funciona sin datos" },
              { icon: "🎯", text: "1 acción diaria" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 border border-primary/20 text-sm text-foreground backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:scale-105 cursor-default"
              >
                <span>{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs with enhanced styling */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto group relative overflow-hidden"
              onClick={() => navigate("/auth")}
            >
              <span className="relative z-10 flex items-center gap-2">
                Comenzar gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto group">
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Ver demo en 2 min
            </Button>
          </div>

          {/* Stats section */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-gradient-primary">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Preview Card */}
        <div className="mt-20 max-w-2xl mx-auto animate-fade-up perspective-1000" style={{ animationDelay: '0.5s' }}>
          <div className="relative group">
            {/* Multi-layer glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-all duration-500 animate-pulse-slow" />
            <div className="absolute -inset-2 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            
            {/* Card */}
            <div className="relative bg-card/95 border border-primary/30 rounded-2xl p-8 shadow-2xl backdrop-blur-sm transform group-hover:scale-[1.02] transition-all duration-500">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <OwlLogo size={40} className="animate-float" />
                  <div>
                    <div className="text-xs text-muted-foreground">UCEO dice:</div>
                    <div className="text-sm font-medium text-primary">Tu acción de hoy</div>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-medium text-warning bg-warning/20 px-3 py-1.5 rounded-full border border-warning/30">
                  <Zap className="w-3 h-3" />
                  Alta prioridad
                </span>
              </div>

              {/* Action content */}
              <div className="bg-background/50 rounded-xl p-5 border border-border/50 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg glow-primary text-2xl">
                    🎯
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Activar promo de almuerzo en Instagram
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Tus ventas de almuerzo bajaron <span className="text-destructive font-medium">12%</span> esta semana. 
                      Una promo flash puede revertirlo rápidamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist preview */}
              <div className="space-y-2 mb-6">
                {["Crear imagen para story", "Escribir copy de promoción", "Programar publicación"].map((item, i) => (
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
                  Más tarde
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center mt-16 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <span className="text-xs text-muted-foreground mb-2">Descubre más</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
