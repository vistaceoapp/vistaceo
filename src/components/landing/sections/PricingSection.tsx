import { useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Crown, Shield, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Gratis",
    description: "Para probar el sistema sin compromiso",
    price: { ars: "$0", usd: "$0" },
    period: "/siempre",
    features: [
      "Dashboard de salud básico",
      "3 misiones por semana",
      "Chat con mentor IA (limitado)",
      "Radar interno básico",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "Todo el poder del sistema para tu negocio",
    price: { ars: "$15.000", usd: "$15" },
    period: "/mes",
    annual: { ars: "$120.000", savings: "33% ahorro" },
    features: [
      "Dashboard completo 7 dimensiones",
      "Misiones ilimitadas",
      "Chat mentor IA sin límites",
      "Radar interno + externo",
      "Analíticas avanzadas",
      "Integraciones premium",
      "Soporte prioritario",
    ],
    cta: "Activar Pro",
    highlighted: true,
  },
];

export const PricingSection = memo(() => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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
                "relative rounded-2xl p-8 animate-on-scroll transition-transform duration-300 hover:-translate-y-2",
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
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price.ars}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.annual && (
                  <p className="text-sm text-primary mt-2">
                    Anual: {plan.annual.ars}/año ({plan.annual.savings})
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

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
