import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Target, TrendingUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

// Business photos - REDUCED for mobile performance (only 6 on mobile)
import parrillaImg from "@/assets/testimonials/parrilla-argentina.jpg";
import boutiqueImg from "@/assets/testimonials/boutique-moda.jpg";
import dentalImg from "@/assets/testimonials/clinica-dental.jpg";
import hotelBoutiqueImg from "@/assets/business-types/hotel-boutique.jpg";
import cafeImg from "@/assets/testimonials/cafeteria.jpg";
import bodegaVinosImg from "@/assets/business-types/bodega-vinos.jpg";

// Shimmer button - pure CSS
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

// Typewriter - minimal re-renders
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
    <span className="text-gradient-primary relative inline-block whitespace-pre align-baseline min-h-[1.15em]">
      <span className="inline-block overflow-visible pr-[0.6ch]">{displayText}</span>
      <span className="absolute right-0 bottom-[0.14em] w-0.5 h-[0.9em] bg-primary animate-pulse" />
    </span>
  );
});
TypewriterText.displayName = "TypewriterText";

// Static counter - no animation on mobile for performance
const StaticCounter = memo(({ value, suffix = "" }: { value: number; suffix?: string }) => (
  <span>{value.toLocaleString()}{suffix}</span>
));
StaticCounter.displayName = "StaticCounter";

// Mobile-optimized business types (only 6 items)
const mobileBusinessTypes = [
  { type: "Parrilla", growth: "+28%", months: 3, image: parrillaImg },
  { type: "Boutique", growth: "+45%", months: 4, image: boutiqueImg },
  { type: "Clínica", growth: "+52%", months: 5, image: dentalImg },
  { type: "Hotel", growth: "+38%", months: 6, image: hotelBoutiqueImg },
  { type: "Café", growth: "+150%", months: 4, image: cafeImg },
  { type: "Bodega", growth: "+58%", months: 4, image: bodegaVinosImg },
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
      {/* Static background - no blur on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-1/4 w-[70%] h-[60%] bg-primary/10 rounded-full md:blur-[150px] blur-[80px]" />
        <div className="absolute bottom-0 -right-1/4 w-[60%] h-[50%] bg-accent/8 rounded-full md:blur-[150px] blur-[80px]" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-5 animate-fade-in-up">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/40 bg-primary/10 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-medium">+500 negocios creciendo</span>
            </Badge>
          </div>
          
          {/* Main Headline - optimized for mobile */}
          <div className="mb-5 animate-fade-in-up-delay-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-normal tracking-tight whitespace-nowrap">
              Tu negocio merece un
            </h1>
            <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-normal tracking-tight pb-2">
              <TypewriterText texts={["CEO digital", "mentor 24/7", "radar IA", "estratega"]} />
            </div>
          </div>
          
          {/* Subtitle - shorter on mobile */}
          <p className="text-base md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-3">
            IA que <span className="text-foreground font-semibold">analiza</span>, <span className="text-foreground font-semibold">detecta oportunidades</span> y te guía con <span className="text-foreground font-semibold">acciones concretas</span>.
          </p>
          
          {/* CTA Button */}
          <div className="flex justify-center mb-8 animate-fade-in-up-delay-4">
            <ShimmerButton
              className="px-8 py-3.5 md:px-10 md:py-4 text-base md:text-lg"
              onClick={() => navigate("/auth")}
              ariaLabel="Empezar gratis con VistaCEO"
            >
              Empezar gratis
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </ShimmerButton>
          </div>

          {/* Stats Row - static on mobile */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 mb-8 animate-fade-in-up-delay-5">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1.5 md:gap-2">
                <stat.icon className="w-4 h-4 text-primary/70" aria-hidden="true" />
                <span className="text-lg md:text-2xl font-bold text-foreground">
                  <StaticCounter value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-xs md:text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Carousel - Reduced for mobile */}
        <div className="max-w-6xl mx-auto animate-fade-in-up-delay-6">
          <div className="text-center mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              +180 tipos de negocio
            </span>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            {/* CSS-only carousel with fewer items */}
            <div className="flex gap-2 animate-scroll-left" style={{ width: 'max-content' }}>
              {[...mobileBusinessTypes, ...mobileBusinessTypes].map((b, i) => (
                <div
                  key={`${b.type}-${i}`}
                  className="relative flex-shrink-0 w-[85px] md:w-[115px] rounded-xl overflow-hidden shadow-md border border-border/30"
                >
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={b.image} 
                      alt={b.type}
                      width={85}
                      height={113}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 p-1.5 md:p-2 flex flex-col justify-between">
                      <div className="inline-flex self-start items-center px-1 py-0.5 rounded bg-background/90 text-[7px] md:text-[8px] font-bold text-foreground">
                        {b.type}
                      </div>
                      <div>
                        <div className="text-base md:text-xl font-black text-white drop-shadow-lg">{b.growth}</div>
                        <div className="text-[7px] md:text-[8px] text-white/70">{b.months} meses</div>
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
