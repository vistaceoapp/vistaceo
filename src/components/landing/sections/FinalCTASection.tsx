import { useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export const FinalCTASection = memo(() => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fallback: if IntersectionObserver isn't available (some mobile browsers), show content immediately
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      if (sectionRef.current) sectionRef.current.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div ref={sectionRef} className="max-w-4xl mx-auto text-center animate-on-scroll">
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-3xl opacity-60" />
            <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl border border-border/80 p-8 md:p-16 shadow-2xl">
              <Badge variant="outline" className="mb-6 border-primary/40 bg-primary/10 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                Empezá hoy
              </Badge>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Tu negocio está a 15 minutos de{" "}
                <span className="text-gradient-primary">crecer diferente</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Más de 500 negocios ya están usando VistaCEO para tomar mejores decisiones. Empezá gratis y sin compromiso.
              </p>
              
              <ShimmerButton
                className="px-10 py-4 text-lg mx-auto"
                onClick={() => navigate("/auth")}
                ariaLabel="Empezar gratis ahora con VistaCEO"
              >
                Empezar gratis ahora
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </ShimmerButton>
              
              <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
                  Sin tarjeta de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
                  Setup en 15 minutos
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FinalCTASection.displayName = "FinalCTASection";
export default FinalCTASection;
