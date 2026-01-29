import { useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Crown, Shield, CheckCircle2, LockKeyhole, Sparkles, X } from "lucide-react";
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

  // Core features that exist in both plans (limited vs unlimited)
  const coreFeatures = [
    { free: "Dashboard de Salud básico", pro: "Dashboard completo 7 dimensiones" },
    { free: "3 misiones activas por mes", pro: "Misiones ilimitadas" },
    { free: "3 preguntas al Chat IA por mes", pro: "Chat IA sin límites" },
    { free: "3 oportunidades del Radar por mes", pro: "Radar interno + externo ilimitado" },
    { free: "Check-ins de Pulso diarios", pro: "Check-ins de Pulso diarios" },
  ];

  // Pro-only features
  const proExclusiveFeatures = [
    "Analytics y métricas avanzadas",
    "Predicciones IA",
    "Integraciones premium",
    "Soporte prioritario",
  ];

  const pricingPlans = [
    {
      name: "Gratis",
      description: "Probá el sistema sin compromiso",
      price: "$0",
      period: "/siempre",
      features: coreFeatures.map(f => f.free),
      notIncluded: proExclusiveFeatures.slice(0, 2), // Analytics y Predicciones
      cta: "Empezar gratis",
      highlighted: false,
    },
    {
      name: "Pro",
      description: "Todo el poder del sistema para tu negocio",
      price: formatCurrencyShort(monthlyPrice),
      period: "/mes",
      annual: {
        price: formatCurrencyShort(yearlyPrice),
        savings: `${savings.percentage}% ahorro`,
        monthsSaved: "2 meses gratis",
      },
      features: [
        ...coreFeatures.map(f => f.pro),
        ...proExclusiveFeatures,
      ],
      cta: "Activar Pro",
      highlighted: true,
    },
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

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <div
              key={i}
              ref={el => cardsRef.current[i] = el}
              className={cn(
                "relative rounded-2xl p-6 md:p-8 animate-on-scroll transition-transform duration-300 hover:-translate-y-2",
                plan.highlighted
                  ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30"
                  : "bg-card border border-border"
              )}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                  Más popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.annual && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-primary font-medium">
                      Anual: {plan.annual.price}/año
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.annual.monthsSaved} • {plan.annual.savings}
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-foreground text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    {typeof feature === 'string' ? feature : feature}
                  </li>
                ))}
              </ul>

              {plan.notIncluded && plan.notIncluded.length > 0 && (
                <ul className="space-y-2 mb-6 pt-4 border-t border-border/50">
                  {plan.notIncluded.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-muted-foreground text-sm">
                      <X className="w-4 h-4 shrink-0 mt-0.5 opacity-50" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              <Button 
                className={cn(
                  "w-full rounded-full h-12",
                  plan.highlighted
                    ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : ""
                )}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </div>
          ))}
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
