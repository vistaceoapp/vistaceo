import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Target, TrendingUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

// Business photos - import only what's needed for hero carousel
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";
import dentalImg from "@/assets/testimonials/clinica-dental.jpg";
import hotelBoutiqueImg from "@/assets/business-types/hotel-boutique.jpg";
import cafeImg from "@/assets/testimonials/cafeteria.jpg";
import bodegaVinosImg from "@/assets/business-types/bodega-vinos.jpg";
import marketingDigitalImg from "@/assets/business-types/marketing-digital.jpg";
import pizzeriaImg from "@/assets/business-types/pizzeria.jpg";
import gimnasioImg from "@/assets/business-types/gimnasio.jpg";
import peluqueriaImg from "@/assets/business-types/peluqueria.jpg";
import hamburgueseriaImg from "@/assets/business-types/hamburgueseria.jpg";
import spaImg from "@/assets/business-types/spa.jpg";

// Shimmer button - CSS only
const ShimmerButton = memo(({ children, className, onClick, ariaLabel }: { children: React.ReactNode; className?: string; onClick?: () => void; ariaLabel?: string }) => (
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

// Typewriter - optimized with less re-renders
const TypewriterText = memo(({ texts }: { texts: string[] }) => {
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentText];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < text.length) {
          setDisplayText(text.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(text.slice(0, displayText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentText((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentText, texts]);

  return (
    <span
      className="text-gradient-primary relative inline-block whitespace-pre align-baseline"
      style={{ lineHeight: 1.15, paddingBottom: "0.14em", minHeight: "1.15em", overflow: "visible" }}
    >
      <span className="inline-block overflow-visible pr-[0.6ch]">{displayText}</span>
      <span className="absolute right-0 bottom-[0.14em] w-0.5 h-[0.9em] bg-primary animate-pulse" />
    </span>
  );
});
TypewriterText.displayName = "TypewriterText";

// Animated counter - optimized
const AnimatedCounter = memo(({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
});
AnimatedCounter.displayName = "AnimatedCounter";

// Business types for carousel - reduced to 12 for performance
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

const stats = [
  { icon: Users, value: 500, suffix: "+", label: "negocios" },
  { icon: Target, value: 12000, suffix: "+", label: "misiones" },
  { icon: TrendingUp, value: 35, suffix: "%", label: "crecimiento" },
];

export const HeroSection = memo(() => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center pt-20 pb-6 overflow-hidden">
      {/* Static background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[70%] h-[60%] bg-primary/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* Main Hero Content - CSS animations instead of Framer Motion */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-5 animate-fade-in-up">
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 border-primary/40 bg-primary/10 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-medium">+500 negocios creciendo</span>
            </Badge>
          </div>
          
          {/* Main Headline */}
          <div className="mb-5 animate-fade-in-up-delay-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-normal tracking-tight">
              Tu negocio merece un
            </h1>
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-normal tracking-tight pb-2">
              <TypewriterText texts={["CEO digital", "mentor 24/7", "radar inteligente", "estratega IA"]} />
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-3">
            Inteligencia artificial que <span className="text-foreground font-semibold">analiza tu negocio</span>, <span className="text-foreground font-semibold">detecta oportunidades</span> y te guía con <span className="text-foreground font-semibold">acciones concretas</span> cada día.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-8 animate-fade-in-up-delay-4">
            <ShimmerButton
              className="px-10 py-4 text-base md:text-lg"
              onClick={() => navigate("/auth")}
              ariaLabel="Empezar gratis con VistaCEO"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </ShimmerButton>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10 animate-fade-in-up-delay-5">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-primary/70" aria-hidden="true" />
                <span className="text-xl md:text-2xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
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
            
            {/* CSS-only scrolling */}
            <div className="flex gap-2.5 animate-scroll-left" style={{ width: 'max-content' }}>
              {[...businessTypes, ...businessTypes].map((b, i) => (
                <div
                  key={`${b.type}-${i}`}
                  className="relative flex-shrink-0 w-[100px] md:w-[115px] rounded-xl overflow-hidden shadow-lg border border-border/30"
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={b.image} 
                      alt={b.type}
                      width={115}
                      height={153}
                      loading="lazy"
                      decoding="async"
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
              ))}
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
