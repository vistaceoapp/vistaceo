import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-bg-violet.jpg";

export const HeroSection = () => {
  const features = [
    "Sin configuración compleja",
    "Funciona sin datos",
    "1 acción diaria",
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />

      {/* Animated glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary mb-8 animate-fade-up neon-border">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Tu CEO digital con IA</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up leading-tight">
            Te digo{" "}
            <span className="text-gradient-primary">qué hacer HOY</span>
            <br />
            en tu restaurante
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up">
            UCEO analiza tu negocio y te da <strong className="text-foreground">1 acción prioritaria</strong> cada día. 
            Sin dashboards complicados, sin cargar datos manualmente.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-up">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/20 text-sm text-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {feature}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up">
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              Comenzar gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
              Ver demo interactiva
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="text-xs text-muted-foreground mt-8 animate-fade-up">
            Más de 500+ negocios gastronómicos ya confían en UCEO
          </p>
        </div>

        {/* Preview Card */}
        <div className="mt-16 max-w-xl mx-auto animate-fade-up">
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl animate-glow-pulse" />
            
            {/* Card */}
            <div className="relative bg-card/90 border border-primary/20 rounded-2xl p-6 shadow-lg neon-border backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg glow-primary">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                      Acción de Hoy
                    </span>
                    <span className="text-xs text-muted-foreground">Alta prioridad</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Activar promo de almuerzo en Instagram
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tus ventas de almuerzo bajaron 12% esta semana. Una promo flash puede revertirlo.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="default">
                      Hacerlo ahora
                    </Button>
                    <Button size="sm" variant="ghost">
                      Más tarde
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
