import { useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Crown, Shield, CheckCircle2, LockKeyhole, Sparkles, X, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";

export const PricingSection = memo(() => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { formatCurrencyShort, monthlyPrice, yearlyPrice, yearlySavings } = useCountryDetection();

  const savings = yearlySavings();

  // Feature comparison - what differs between plans
  const comparisonFeatures = [
    { name: "Dashboard de Salud", free: "Completo", pro: "Completo" },
    { name: "Misiones", free: "3 por mes", pro: "Ilimitadas" },
    { name: "Chat IA", free: "3 por mes", pro: "Ilimitado" },
    { name: "Radar de Oportunidades", free: "3 por mes", pro: "Ilimitado" },
    { name: "Check-ins de Pulso", free: "Diarios", pro: "Diarios" },
    { name: "Analytics avanzadas", free: false, pro: true },
    { name: "Predicciones IA", free: false, pro: true },
    { name: "Integraciones premium", free: false, pro: true },
    { name: "Soporte prioritario", free: false, pro: true },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    cardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const renderValue = (value: string | boolean, isProColumn: boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-primary" />
      ) : (
        <X className="w-5 h-5 text-muted-foreground/40" />
      );
    }
    
    if (value === "Ilimitadas" || value === "Ilimitado") {
      return (
        <span className="flex items-center gap-1.5 text-primary font-medium">
          <Infinity className="w-4 h-4" />
          {value}
        </span>
      );
    }
    
    return <span className={isProColumn ? "text-foreground" : "text-muted-foreground"}>{value}</span>;
  };

  return (
    <section id="precios" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div ref={headerRef} className="text-center mb-12 md:mb-16 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <Crown className="w-4 h-4 mr-2" aria-hidden="true" />
            Precios
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple y <span className="text-gradient-primary">transparente</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empezá gratis, crecé cuando quieras. Sin sorpresas ni costos ocultos.
          </p>
        </div>

        {/* Comparison Table */}
        <div 
          ref={el => cardsRef.current[0] = el}
          className="max-w-4xl mx-auto animate-on-scroll"
        >
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            {/* Header Row */}
            <div className="grid grid-cols-3 border-b border-border">
              <div className="p-4 md:p-6 bg-muted/30">
                <span className="text-sm font-medium text-muted-foreground">Funcionalidad</span>
              </div>
              <div className="p-4 md:p-6 text-center border-l border-border">
                <h3 className="text-lg font-bold text-foreground">Gratis</h3>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">$0</p>
                <p className="text-xs text-muted-foreground">/siempre</p>
              </div>
              <div className="p-4 md:p-6 text-center border-l border-border bg-primary/5 relative">
                <Badge className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 gradient-primary text-primary-foreground text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
                <h3 className="text-lg font-bold text-foreground">Pro</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary mt-1">{formatCurrencyShort(monthlyPrice)}</p>
                <p className="text-xs text-muted-foreground">/mes</p>
                <p className="text-xs text-primary mt-1 font-medium">
                  Anual: {formatCurrencyShort(yearlyPrice)}/año
                </p>
                <p className="text-xs text-muted-foreground">
                  2 meses gratis • {savings.percentage}% ahorro
                </p>
              </div>
            </div>

            {/* Feature Rows */}
            {comparisonFeatures.map((feature, i) => (
              <div 
                key={i} 
                className={cn(
                  "grid grid-cols-3 border-b border-border last:border-b-0",
                  i % 2 === 0 ? "bg-background" : "bg-muted/20"
                )}
              >
                <div className="p-3 md:p-4 flex items-center">
                  <span className="text-sm text-foreground">{feature.name}</span>
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-border text-sm">
                  {renderValue(feature.free, false)}
                </div>
                <div className="p-3 md:p-4 flex items-center justify-center border-l border-border bg-primary/5 text-sm">
                  {renderValue(feature.pro, true)}
                </div>
              </div>
            ))}

            {/* CTA Row */}
            <div className="grid grid-cols-3 bg-muted/30">
              <div className="p-4 md:p-6" />
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-border">
                <Button 
                  variant="outline"
                  className="rounded-full w-full max-w-[160px]"
                  onClick={() => navigate("/auth")}
                >
                  Empezar gratis
                </Button>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-border bg-primary/5">
                <Button 
                  className="rounded-full gradient-primary text-primary-foreground shadow-lg shadow-primary/25 w-full max-w-[160px]"
                  onClick={() => navigate("/auth")}
                >
                  Activar Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
            Garantía 7 días
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden="true" />
            Cancela cuando quieras
          </div>
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-4 h-4 text-primary" aria-hidden="true" />
            Pago 100% seguro
          </div>
        </div>
      </div>
    </section>
  );
});

PricingSection.displayName = "PricingSection";
export default PricingSection;
