import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
import { OwlLogo } from "@/components/ui/OwlLogo";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Complex background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Main card */}
          <div className="relative group">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-accent rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
            
            {/* Card */}
            <div className="relative bg-card/95 border border-primary/30 rounded-3xl p-8 sm:p-12 lg:p-16 backdrop-blur-xl text-center">
              {/* Floating decorations */}
              <div className="absolute top-6 left-6 flex items-center gap-2 text-primary/60">
                <Star className="w-5 h-5 fill-current animate-pulse" />
                <Star className="w-3 h-3 fill-current animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="absolute top-6 right-6 flex items-center gap-2 text-accent/60">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute bottom-6 left-6">
                <Sparkles className="w-6 h-6 text-primary/40 animate-pulse" />
              </div>
              <div className="absolute bottom-6 right-6">
                <Sparkles className="w-4 h-4 text-accent/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Logo */}
              <div className="inline-flex items-center justify-center mb-8">
                <div className="relative">
                  <OwlLogo size={72} className="animate-float" />
                  <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl animate-pulse-slow" />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Tu negocio merece un{" "}
                <span className="text-gradient-primary">CEO digital</span>
              </h2>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Empieza gratis hoy. Sin tarjeta, sin configuración, sin compromisos. 
                Tu primera acción de mejora te espera.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full sm:w-auto group relative overflow-hidden"
                  onClick={() => navigate("/auth")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Comenzar gratis ahora
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  Agendar demo personalizada
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Activo en 9 países
                </span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  +500 negocios
                </span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Soporte 24/7 en español
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
