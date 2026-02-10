import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRealtimeCounter } from "@/hooks/use-realtime-counter";

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
const TypewriterText = memo(({ texts }: { texts: string[] }) => {
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
        else { s.deleting = false; s.idx = (s.idx + 1) % texts.length; }
      }
      if (textRef.current) textRef.current.textContent = texts[s.idx].slice(0, s.pos);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [texts]);

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
    const startDate = new Date('2026-02-06');
    const now = new Date();
    const weeksDiff = Math.floor((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return 2961 + Math.max(0, weeksDiff * 3);
  }, []);

  const reviewers = [reviewer1, reviewer2, reviewer3];

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <GoogleStarRating rating={4.91} fillPercentage={91} />
      <span className="text-lg font-bold text-foreground">4.91/5</span>
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

// ALL 12 business types for carousel (original)
const businessTypes = [
  { type: "Parrilla", business: "Don Martín", image: parrillaImg, growth: "+28%", months: 3, health: 78 },
  { type: "Boutique", business: "Carmela", image: boutiqueImg, growth: "+45%", months: 4, health: 85 },
  { type: "Clínica Dental", business: "Sonrisas", image: dentalImg, growth: "+52%", months: 5, health: 92 },
  { type: "Hotel", business: "Casa Serena", image: hotelBoutiqueImg, growth: "+38%", months: 6, health: 88 },
  { type: "Cafetería", business: "Café Origen", image: cafeImg, growth: "+150%", months: 4, health: 94 },
  { type: "Bodega", business: "Viñedos Sol", image: bodegaVinosImg, growth: "+58%", months: 4, health: 88 },
  { type: "Marketing", business: "Growth Lab", image: marketingDigitalImg, growth: "+85%", months: 3, health: 93 },
  { type: "Pizzería", business: "Napolitana", image: pizzeriaImg, growth: "+42%", months: 3, health: 82 },
  { type: "Gimnasio", business: "FitLife", image: gimnasioImg, growth: "+33%", months: 5, health: 76 },
  { type: "Peluquería", business: "Studio Hair", image: peluqueriaImg, growth: "+48%", months: 3, health: 84 },
  { type: "Hamburguesas", business: "Burger Lab", image: hamburgueseriaImg, growth: "+72%", months: 4, health: 87 },
  { type: "Spa", business: "Zen Relax", image: spaImg, growth: "+55%", months: 4, health: 89 },
];

export const HeroSection = memo(() => {
  const navigate = useNavigate();
  const activeUsers = useRealtimeCounter();

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-20 pb-6 overflow-hidden">
      {/* Static background gradients - CSS only, no Framer Motion */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[70%] h-[60%] bg-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Hero Content - CSS animations instead of Framer Motion */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge with realtime counter */}
          <div className="mb-5 animate-fade-in-up">
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 border-primary/40 bg-primary/10 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-medium">
                +5.000 negocios en LATAM · <span className="inline-flex items-center gap-1"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" /></span>{activeUsers} activos ahora</span>
              </span>
            </Badge>
          </div>
          
          {/* Main Headline */}
            <div className="mb-5 animate-fade-in-up-delay-2">
             <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-normal tracking-tight">
              Tu negocio merece un
            </h1>
            <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-normal tracking-tight pb-2">
              <TypewriterText texts={["CEO digital", "mentor 24/7", "radar inteligente", "estratega IA"]} />
            </div>
          </div>
          
          {/* Subtitle - Only 2 lines, removed "Tu CEO digital..." */}
          <div className="mb-6 max-w-2xl mx-auto animate-fade-in-up-delay-3">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
              Inteligencia artificial que <span className="text-foreground font-semibold">acelera el crecimiento</span> de tu negocio.
            </p>
            <p className="hidden sm:block text-lg md:text-xl text-muted-foreground leading-relaxed text-center mt-2">
              Un <span className="text-foreground font-semibold">cerebro estratégico</span> e inteligente en tiempo real.
            </p>
          </div>
          
          {/* CTA Button + Microcopy */}
          <div className="flex flex-col items-center gap-3 mb-6 animate-fade-in-up-delay-4">
            <ShimmerButton
              className="px-10 py-4 text-base md:text-lg"
              onClick={() => navigate("/auth?mode=signup")}
              ariaLabel="Empezar gratis con VistaCEO"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </ShimmerButton>
            <span className="text-xs text-muted-foreground/70">
              Gratis · Sin tarjeta · En 2 minutos
            </span>
          </div>

          {/* Verified Reviews - Google-style stars */}
          <div className="mb-6 animate-fade-in-up-delay-5">
            <VerifiedReviews />
          </div>
        </div>

        {/* Business Types Carousel - CSS animation only */}
        <div className="max-w-6xl mx-auto animate-fade-in-up-delay-6">
          <div className="text-center mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              +180 tipos de negocio • Resultados reales
            </span>
          </div>

          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            {/* CSS-only scrolling - optimized loading */}
            <div className="flex gap-2.5 animate-scroll-left" style={{ width: 'max-content' }}>
              {[...businessTypes, ...businessTypes].map((b, i) => {
                // Only eager load first 6 visible images, lazy load rest
                const isEagerLoad = i < 6;
                
                return (
                  <div
                    key={`${b.type}-${i}`}
                    className="relative flex-shrink-0 w-[100px] md:w-[115px] rounded-xl overflow-hidden shadow-lg border border-border/30"
                  >
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={b.image} 
                        alt={`${b.type} - ${b.business}`}
                        width={115}
                        height={153}
                        loading={isEagerLoad ? "eager" : "lazy"}
                        decoding={isEagerLoad ? "sync" : "async"}
                        fetchPriority={i === 0 ? "high" : undefined}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                      <div className="absolute inset-0 p-2 flex flex-col justify-between">
                        <div className="inline-flex self-start items-center px-1.5 py-0.5 rounded bg-background/95 text-[8px] font-bold text-foreground shadow-sm">
                          {b.type}
                        </div>
                        <div>
                          <div className="text-lg md:text-xl font-black leading-none text-white drop-shadow-lg">{b.growth}</div>
                          <div className="text-[8px] text-white/70 font-medium mt-0.5">{b.months} meses</div>
                          <div className="text-[9px] font-semibold truncate leading-tight mt-0.5 text-white/90">{b.business}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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

HeroSection.displayName = "HeroSection";
export default HeroSection;
