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
  const { 
    country, 
    formatPrice, 
    monthlyPrice, 
    yearlyPrice, 
    yearlySavings,
    isArgentina 
  } = useCountryDetection();

  const savings = yearlySavings();

  // Format price with currency code
  const formatWithCurrency = (price: number) => {
    const formatted = formatPrice(price);
    return `${country.symbol}${formatted} ${country.currency}`;
  };

  // Feature comparison - what differs between plans
  const comparisonFeatures = [
    { name: "Dashboard de Salud", free: "Completo", pro: "Completo" },
    { name: "Misiones", free: "3/mes", pro: "Ilimitadas" },
    { name: "Chat IA", free: "3/mes", pro: "Ilimitado" },
    { name: "Radar de Oportunidades", free: "3/mes", pro: "Ilimitado" },
    { name: "Check-ins de Pulso", free: "Diarios", pro: "Diarios" },
    { name: "Analytics avanzadas", free: false, pro: "Completas" },
    { name: "Predicciones IA", free: false, pro: "Ilimitadas" },
    { name: "Integraciones premium", free: false, pro: "Completas" },
    { name: "Soporte prioritario", free: false, pro: "Ilimitado" },
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
        <span className="flex items-center gap-1 text-primary font-medium text-xs md:text-sm">
          <Infinity className="w-4 h-4" />
          <span className="hidden sm:inline">{value}</span>
        </span>
      );
    }
    
    return (
      <span className={cn(
        "text-xs md:text-sm",
        isProColumn ? "text-foreground" : "text-muted-foreground"
      )}>
        {value}
      </span>
    );
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

        {/* Two Cards Side by Side */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan Card */}
          <div
            ref={el => cardsRef.current[0] = el}
            className="relative rounded-2xl p-6 md:p-8 animate-on-scroll bg-card border border-border"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">Gratis</h3>
              <p className="text-sm text-muted-foreground mb-4">Probá sin compromiso</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl font-bold text-foreground">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">/siempre</p>
            </div>

            <ul className="space-y-3 mb-6">
              {comparisonFeatures.map((feature, i) => {
                const value = feature.free;
                const isIncluded = value !== false;
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className={cn(
                      "flex items-center gap-2",
                      !isIncluded && "text-muted-foreground/60"
                    )}>
                      {isIncluded ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                      )}
                      {feature.name}
                    </span>
                    {typeof value === "string" && (
                      <span className="text-muted-foreground text-xs">{value}</span>
                    )}
                  </li>
                );
              })}
            </ul>

            <Button 
              variant="outline"
              className="w-full rounded-full h-12"
              onClick={() => navigate("/auth")}
            >
              Empezar gratis
            </Button>
          </div>

          {/* Pro Plan Card */}
          <div
            ref={el => cardsRef.current[1] = el}
            className="relative rounded-2xl p-6 md:p-8 animate-on-scroll bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30"
            style={{ transitionDelay: "150ms" }}
          >
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground px-4">
              <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              Más popular
            </Badge>

            <div className="text-center mb-6 pt-2">
              <h3 className="text-xl font-bold text-foreground mb-1">Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">Todo el poder del sistema</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl font-bold text-primary">
                  {country.symbol}{formatPrice(monthlyPrice)}
                </span>
                <span className="text-lg text-muted-foreground ml-1">{country.currency}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">/mes</p>
              
              <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  Anual: {country.symbol}{formatPrice(yearlyPrice)} {country.currency}/año
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  2 meses gratis • {savings.percentage}% ahorro
                </p>
              </div>
              
              {!isArgentina && (
                <p className="text-xs text-muted-foreground mt-2">
                  * Pago procesado en USD
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {comparisonFeatures.map((feature, i) => {
                const value = feature.pro;
                const isUnlimited = typeof value === "string" && (value === "Ilimitadas" || value === "Ilimitado");
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {feature.name}
                    </span>
                    {typeof value === "string" && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs font-medium py-0.5 px-2",
                          isUnlimited 
                            ? "bg-primary/10 text-primary border-primary/20" 
                            : "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {isUnlimited && <Infinity className="w-3 h-3 mr-1" />}
                        {value}
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>

            <Button 
              className="w-full rounded-full h-12 gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
              onClick={() => navigate("/auth")}
            >
              Activar Pro
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
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
