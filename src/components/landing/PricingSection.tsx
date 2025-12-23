import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    description: "Prueba el poder de un CEO digital",
    price: "0",
    currency: "USD",
    period: "/mes",
    features: [
      "1 acción diaria básica",
      "3 check-ins por semana",
      "1 misión por mes",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    description: "Para negocios que quieren crecer",
    price: "29",
    currency: "USD",
    period: "/mes",
    features: [
      "Acciones diarias inteligentes",
      "Plan semanal con 3 prioridades",
      "Misiones ilimitadas",
      "Radar de oportunidades",
      "Integraciones (POS, Google, IG)",
      "Análisis de fotos con IA",
      "Soporte prioritario",
    ],
    cta: "Comenzar con Pro",
    variant: "hero" as const,
    popular: true,
  },
  {
    name: "Premium",
    description: "Multi-local y equipos",
    price: "79",
    currency: "USD",
    period: "/mes",
    features: [
      "Todo de Pro",
      "Hasta 5 locales",
      "Roles y permisos de equipo",
      "Playbooks replicables",
      "Comparativos entre locales",
      "API y webhooks",
      "Soporte dedicado",
    ],
    cta: "Contactar ventas",
    variant: "outline" as const,
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4 block">
            Precios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Un plan para cada{" "}
            <span className="text-gradient-primary">etapa</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Empieza gratis y escala cuando lo necesites. 
            Sin contratos, cancela cuando quieras.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg glow-primary"
                  : "border-border"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Más popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">{plan.currency}</span>
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.variant}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          Todos los precios en USD. Aceptamos Mercado Pago y tarjetas internacionales.
        </p>
      </div>
    </section>
  );
};
