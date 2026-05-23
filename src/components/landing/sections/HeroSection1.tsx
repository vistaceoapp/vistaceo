import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronDown, Target, Eye, BarChart3, AlertTriangle, Lightbulb, Zap, Radar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect, memo, useMemo, useCallback, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

// Lazy-load the protagonist scene so it never blocks LCP / FCP
const IntelligenceFlow = lazy(() => import("@/components/landing/IntelligenceFlow"));

// Business photos - optimized WebP at 2x carousel display size (230px)
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg?w=230&format=webp";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg?w=230&format=webp";
import dentalImg from "@/assets/testimonials/clinica-dental.jpg?w=230&format=webp";
import hotelBoutiqueImg from "@/assets/business-types/hotel-boutique.jpg?w=230&format=webp";
import cafeImg from "@/assets/testimonials/cafeteria.jpg?w=230&format=webp";
import bodegaVinosImg from "@/assets/business-types/bodega-vinos.jpg?w=230&format=webp";
import marketingDigitalImg from "@/assets/business-types/marketing-digital.jpg?w=230&format=webp";
import pizzeriaImg from "@/assets/business-types/pizzeria.jpg?w=230&format=webp";
import gimnasioImg from "@/assets/business-types/gimnasio.jpg?w=230&format=webp";
import peluqueriaImg from "@/assets/business-types/peluqueria.jpg?w=230&format=webp";
import hamburgueseriaImg from "@/assets/business-types/hamburgueseria.jpg?w=230&format=webp";
import spaImg from "@/assets/business-types/spa.jpg?w=230&format=webp";

// Reviewer photos - optimized at 2x (64px)
import reviewer1 from "@/assets/reviewers/reviewer-1.jpg?w=64&format=webp";
import reviewer2 from "@/assets/reviewers/reviewer-2.jpg?w=64&format=webp";
import reviewer3 from "@/assets/reviewers/reviewer-3.jpg?w=64&format=webp";

// Shimmer button - pure CSS, no Framer Motion
const ShimmerButton = memo(({ children, className, onClick, ariaLabel }: { 
  children: React.ReactNode; 
  className?: string; 
  onClick?: () => void; 
  ariaLabel?: string 
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={cn(
      "relative overflow-hidden gradient-primary text-primary-foreground font-semibold rounded-full shadow-xl shadow-primary/30 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
  </button>
));
ShimmerButton.displayName = "ShimmerButton";

// Typewriter - zero re-render: direct DOM manipulation via refs
// Supports onCycleComplete callback to coordinate with other typewriters
const TypewriterText = memo(({ texts, onCycleComplete }: { texts: string[]; onCycleComplete?: () => void }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef({ idx: 0, pos: 0, deleting: false, paused: false });

  useEffect(() => {
    const s = stateRef.current;
    let raf: number;
    let last = 0;

    const step = (ts: number) => {
      const speed = s.paused ? 2000 : s.deleting ? 30 : 80;
      if (ts - last < speed) { raf = requestAnimationFrame(step); return; }
      last = ts;

      const text = texts[s.idx];
      if (s.paused) { s.paused = false; s.deleting = true; }
      else if (!s.deleting) {
        if (s.pos < text.length) { s.pos++; }
        else { s.paused = true; }
      } else {
        if (s.pos > 0) { s.pos--; }
        else {
          s.deleting = false;
          s.idx = (s.idx + 1) % texts.length;
          if (s.idx === 0 && onCycleComplete) onCycleComplete();
        }
      }
      if (textRef.current) textRef.current.textContent = texts[s.idx].slice(0, s.pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [texts, onCycleComplete]);

  return (
    <span
      className="text-gradient-primary relative inline-block whitespace-pre align-baseline"
      style={{ lineHeight: 1.15, paddingBottom: "0.14em", minHeight: "1.15em", overflow: "visible" }}
    >
      <span ref={textRef} className="inline-block overflow-visible pr-[0.6ch]" />
      <span className="absolute right-0 bottom-[0.14em] w-0.5 h-[0.9em] bg-primary animate-pulse" />
    </span>
  );
});
TypewriterText.displayName = "TypewriterText";

// Hook for a text that swaps with a fade after N external triggers
const useRotatingText = (texts: string[], cyclesPerSwap: number) => {
  const ref = useRef<HTMLSpanElement>(null);
  const stateRef = useRef({ idx: 0, cycles: 0 });

  const advance = useCallback(() => {
    const s = stateRef.current;
    s.cycles++;
    if (s.cycles >= cyclesPerSwap && ref.current) {
      s.cycles = 0;
      ref.current.style.transition = "opacity 0.3s, transform 0.3s";
      ref.current.style.opacity = "0";
      ref.current.style.transform = "translateY(8px)";
      setTimeout(() => {
        s.idx = (s.idx + 1) % texts.length;
        if (ref.current) {
          ref.current.textContent = texts[s.idx];
          ref.current.style.opacity = "1";
          ref.current.style.transform = "translateY(0)";
        }
      }, 300);
    }
  }, [texts, cyclesPerSwap]);

  return { ref, advance, initialText: texts[0] };
};

// Google-style star rating component
const GoogleStarRating = memo(({ rating, fillPercentage = 91 }: { rating: number; fillPercentage?: number }) => {
  const fullStars = Math.floor(rating);
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          // Full star
          return (
            <svg key={i} className="w-5 h-5 text-[#FBBC04]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        } else if (i === fullStars) {
          // Partial star (last one ~90% filled)
          return (
            <div key={i} className="relative w-5 h-5">
              <svg className="absolute inset-0 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                <svg className="w-5 h-5 text-[#FBBC04]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </div>
            </div>
          );
        } else {
          // Empty star
          return (
            <svg key={i} className="w-5 h-5 text-muted-foreground/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        }
      })}
    </div>
  );
});
GoogleStarRating.displayName = "GoogleStarRating";

// Verified reviews component
const VerifiedReviews = memo(() => {
  // Calculate reviews: starts at 2961 on 2026-02-06, +3 per week
  const reviewCount = useMemo(() => {
    const startDate = new Date('2026-02-26');
    const now = new Date();
    const periodsDiff = Math.floor((now.getTime() - startDate.getTime()) / (15 * 24 * 60 * 60 * 1000));
    return 1094 + Math.max(0, periodsDiff * 7);
  }, []);

  const reviewers = [reviewer1, reviewer2, reviewer3];

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <GoogleStarRating rating={4.91} fillPercentage={91} />
      <span className="text-lg font-bold text-foreground">4,91/5</span>
      <div className="flex -space-x-2">
        {reviewers.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="Reviewer"
            className="w-8 h-8 rounded-full border-2 border-background object-cover"
            loading="lazy"
          />
        ))}
        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
          +
        </div>
      </div>
      <span className="text-sm text-muted-foreground">
        ({reviewCount.toLocaleString()} Reseñas)
      </span>
    </div>
  );
});
VerifiedReviews.displayName = "VerifiedReviews";

// Executive intelligence signal cards
const SIGNAL_CARDS = [
  { icon: TrendingUp, label: "Oportunidad", title: "Ventas mediodía +23%", detail: "Extendé horario promocional de 12 a 14hs", accentBg: "bg-primary", accentText: "text-primary" },
  { icon: Radar, label: "Radar competitivo", title: "2 competidores ajustaron precios", detail: "Te sugerimos una respuesta estratégica", accentBg: "bg-warning", accentText: "text-warning" },
  { icon: Eye, label: "Predicción", title: "Caída de margen probable en 5 días", detail: "Revisá la estructura de costos actual", accentBg: "bg-accent", accentText: "text-accent" },
  { icon: Target, label: "Misión prioritaria", title: "Activar campaña de recompra", detail: "+11% de clientes recuperables este mes", accentBg: "bg-primary", accentText: "text-primary" },
  { icon: BarChart3, label: "Tendencia emergente", title: "Delivery premium en alza", detail: "+34% de demanda detectada en tu zona", accentBg: "bg-accent", accentText: "text-accent" },
  { icon: AlertTriangle, label: "Riesgo detectado", title: "Tiempo de respuesta alto", detail: "Está afectando tu tasa de recompra en -8%", accentBg: "bg-destructive", accentText: "text-destructive" },
];

export const HeroSection1 = memo(() => {
  const navigate = useNavigate();
  const activeUsers = useRealtimeCounter();

  // Bottom line changes every 5 full cycles of the top typewriter
  const { ref: topLineRef, advance: advanceTopLine, initialText: topInitial } = useRotatingText(
    ["Crece más rápido con un", "Mejora tu empresa con un", "Potencia tu servicio con un", "Aumenta tus ventas con un", "Brinda un mejor servicio con un"],
    5
  );

  // Stable callback for typewriter
  const handleCycleComplete = useCallback(() => {
    advanceTopLine();
  }, [advanceTopLine]);

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-20 pb-6 overflow-hidden">
      {/* Static background gradients - CSS only, no Framer Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[70%] h-[60%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] bg-accent/8 rounded-full blur-[150px]" />
      </div>

      {/* FULL-WIDTH INTELLIGENCE SCENE — cinematic hero canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <IntelligenceFlow />
        </Suspense>
        {/* Veil to keep copy crisp on the left third (desktop only) */}
        <div
          className="hidden lg:block absolute inset-y-0 left-0 w-[55%] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--background) / 0.85) 0%, hsl(var(--background) / 0.6) 45%, hsl(var(--background) / 0) 100%)",
          }}
        />
      </div>

      {/* Main Hero Content — copy left, scene full-bleed behind */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center max-w-7xl mx-auto">
          {/* LEFT: Copy + CTAs — overlays the scene */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Badge with realtime counter */}
            <div className="mb-5 animate-fade-in-up flex lg:justify-start justify-center">
              <Badge
                variant="outline"
                className="px-4 py-1.5 border-primary/40 bg-primary/10 backdrop-blur-sm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium">
                  +5.000 proyectos en LATAM · <span className="inline-flex items-center gap-1"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" /></span>{activeUsers} activos ahora</span>
                </span>
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="mb-5 animate-fade-in-up-delay-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight tracking-tight">
                <span ref={topLineRef} style={{ transition: "opacity 0.3s, transform 0.3s" }}>{topInitial}</span>
              </h1>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight pb-2">
                <TypewriterText texts={["CEO digital", "mentor 24/7", "radar inteligente", "estratega IA"]} onCycleComplete={handleCycleComplete} />
              </div>
            </div>

            {/* Subtitle */}
            <div className="mb-6 max-w-xl mx-auto lg:mx-0 animate-fade-in-up-delay-3">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Inteligencia artificial que <span className="text-foreground font-semibold">acelera el crecimiento</span> de tu empresa, negocio, servicio o emprendimiento.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-3 mb-6 animate-fade-in-up-delay-4">
              <ShimmerButton
                className="px-8 py-3.5 text-base"
                onClick={() => navigate("/auth?mode=signup")}
                ariaLabel="Empezar gratis con VistaCEO"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </ShimmerButton>
              <button
                onClick={() => {
                  const el = document.getElementById("capacidades");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3.5 text-base font-medium text-foreground/80 hover:text-foreground rounded-full border border-foreground/15 hover:border-foreground/30 hover:bg-foreground/[0.03] transition-all"
              >
                Ver cómo funciona
              </button>
            </div>

            <div className="text-xs text-muted-foreground/70 mb-5 text-center lg:text-left">
              Gratis · Sin tarjeta · En 2 minutos
            </div>

            {/* Verified Reviews */}
            <div className="mb-2 animate-fade-in-up-delay-5 flex lg:justify-start justify-center">
              <VerifiedReviews />
            </div>
          </div>

          {/* RIGHT spacer — scene already lives full-bleed behind */}
          <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />
        </div>

        {/* Executive Intelligence Signal Cards - condensed below */}
        <div className="max-w-5xl mx-auto mt-10 animate-fade-in-up-delay-6">
          <div className="text-center mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              +180 tipos de proyecto · Señales activas en tiempo real
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
            {SIGNAL_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="relative p-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-border transition-all duration-300"
                  style={{ animation: `fade-in 0.4s ease-out ${1.0 + i * 0.12}s both` }}
                >
                  <div className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", card.accentBg)} />
                  <div className="pl-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={cn("w-3 h-3", card.accentText)} />
                      <span className={cn("text-[9px] font-semibold uppercase tracking-wider", card.accentText)}>
                        {card.label}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-foreground leading-snug">{card.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{card.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-fade-in-up-delay-6">
        <div className="animate-float">
          <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
});

HeroSection1.displayName = "HeroSection1";
export default HeroSection1;
