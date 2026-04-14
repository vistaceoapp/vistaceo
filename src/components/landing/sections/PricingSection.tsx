import { useState, useEffect, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Crown, Shield, CheckCircle2, LockKeyhole,
  Sparkles, X, Infinity, MapPin, ChevronDown, Brain, Target,
  BarChart3, MessageSquare, Zap, TrendingUp, Eye, Users, Clock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCountryDetection, COUNTRY_CONFIG } from "@/hooks/use-country-detection";
import type { CountryCode } from "@/lib/countryPacks";

const FREE_FEATURES = [
  { name: "Dashboard de Salud", value: "Básico", icon: BarChart3 },
  { name: "Misiones", value: "3/mes", icon: Target },
  { name: "Chat IA", value: "3/mes", icon: MessageSquare },
  { name: "Radar de Oportunidades", value: "3/mes", icon: Eye },
  { name: "Check-ins de Pulso", value: "Diarios", icon: Clock },
];

const FREE_BLOCKED = [
  "Gemelo Digital predictivo",
  "Análisis de Competencia",
  "Predicciones IA",
  "Insights avanzados",
  "Métricas y Evolución",
  "Integraciones premium",
  "Soporte prioritario 24/7",
];

const PRO_FEATURES = [
  { name: "Dashboard de Salud", value: "Completo", icon: BarChart3 },
  { name: "Misiones ilimitadas", value: "∞", icon: Target },
  { name: "Chat IA ilimitado", value: "∞", icon: MessageSquare },
  { name: "Radar ilimitado", value: "∞", icon: Eye },
  { name: "Check-ins de Pulso", value: "Diarios", icon: Clock },
  { name: "Gemelo Digital predictivo", value: "✓", icon: Brain },
  { name: "Análisis de Competencia", value: "✓", icon: Users },
  { name: "Predicciones IA", value: "✓", icon: TrendingUp },
  { name: "Insights avanzados", value: "✓", icon: Sparkles },
  { name: "Métricas y Evolución", value: "✓", icon: BarChart3 },
  { name: "Integraciones premium", value: "✓", icon: Zap },
  { name: "Soporte prioritario 24/7", value: "✓", icon: Star },
];

// Country selector dropdown
const CountrySelector = memo(({
  currentCode,
  currentFlag,
  currentName,
  onSelect,
}: {
  currentCode: string;
  currentFlag: string;
  currentName: string;
  onSelect: (code: CountryCode) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const countries = Object.entries(COUNTRY_CONFIG)
    .filter(([k]) => k !== "DEFAULT")
    .sort(([, a], [, b]) => a.name.localeCompare(b.name));

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>{currentFlag} {currentName}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 w-56 max-h-64 overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
          {countries.map(([code, info]) => (
            <button
              key={code}
              onClick={() => { onSelect(code as CountryCode); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50 transition-colors",
                code === currentCode && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span>{info.flag}</span>
              <span>{info.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{info.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
CountrySelector.displayName = "CountrySelector";

export const PricingSection = memo(() => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const {
    country,
    formatPrice,
    monthlyPrice,
    yearlyPrice,
    yearlySavings,
    isArgentina,
    setCountryOverride,
    detectedCountryCode,
  } = useCountryDetection();

  const savings = yearlySavings();
  const monthlyEquivalent = Math.round(yearlyPrice / 12);
  const displayPrice = billingPeriod === "yearly" ? monthlyEquivalent : monthlyPrice;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="precios" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-8 md:mb-12 animate-on-scroll">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
            <Crown className="w-4 h-4 mr-2" aria-hidden="true" />
            Precios
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple y <span className="text-gradient-primary">transparente</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Empieza gratis, crece cuando quieras. Sin sorpresas ni costos ocultos.
          </p>

          {/* Country detection */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">Precios en</span>
            <CountrySelector
              currentCode={detectedCountryCode || "AR"}
              currentFlag={country.flag}
              currentName={country.name}
              onSelect={setCountryOverride}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* ── Free Plan ── */}
          <div className="relative rounded-2xl p-6 md:p-8 bg-card border border-border flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-1">Gratis</h3>
              <p className="text-sm text-muted-foreground mb-4">Probá sin compromiso</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl font-bold text-foreground">$0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">para siempre</p>
            </div>

            {/* Included */}
            <ul className="space-y-2.5 mb-4">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <f.icon className="w-4 h-4 text-primary shrink-0" />
                    {f.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{f.value}</span>
                </li>
              ))}
            </ul>

            {/* Blocked */}
            <ul className="space-y-2 mb-6 pt-3 border-t border-border">
              {FREE_BLOCKED.map((name, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground/50">
                  <X className="w-4 h-4 shrink-0" />
                  <span className="line-through">{name}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Button
                variant="outline"
                className="w-full rounded-full h-12"
                onClick={() => navigate("/auth")}
              >
                Empezar gratis
              </Button>
            </div>
          </div>

          {/* ── Pro Plan ── */}
          <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/30 flex flex-col">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground px-4">
              <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
              Más popular
            </Badge>

            <div className="text-center mb-6 pt-2">
              <h3 className="text-xl font-bold text-foreground mb-3">Pro</h3>

              {/* Billing toggle */}
              <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5 mb-4">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                    billingPeriod === "monthly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all relative",
                    billingPeriod === "yearly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Anual
                  <span className="absolute -top-2.5 -right-3 text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full leading-none">
                    -{savings.percentage}%
                  </span>
                </button>
              </div>

              {/* Price display */}
              <div className="flex items-baseline justify-center gap-1">
                {billingPeriod === "yearly" && (
                  <span className="text-lg line-through text-muted-foreground/60 mr-1">
                    {country.symbol}{formatPrice(monthlyPrice)}
                  </span>
                )}
                <span className="text-4xl md:text-5xl font-bold text-primary">
                  {country.symbol}{formatPrice(displayPrice)}
                </span>
                <span className="text-lg text-muted-foreground ml-1">{country.currency}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">/mes</p>

              {billingPeriod === "yearly" && (
                <div className="mt-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">
                    Facturado {country.symbol}{formatPrice(yearlyPrice)} {country.currency}/año
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ahorrás {country.symbol}{formatPrice(monthlyPrice * 12 - yearlyPrice)} {country.currency} al año
                  </p>
                </div>
              )}

              {!isArgentina && (
                <p className="text-xs text-muted-foreground mt-2">
                  * Pago procesado en USD
                </p>
              )}
            </div>

            {/* Pro features */}
            <ul className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f, i) => {
                const isUnlimited = f.value === "∞";
                return (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <f.icon className="w-4 h-4 text-primary shrink-0" />
                      {f.name}
                    </span>
                    {isUnlimited ? (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 py-0.5 px-2">
                        <Infinity className="w-3 h-3 mr-1" />
                        Ilimitado
                      </Badge>
                    ) : (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto">
              <Button
                className="w-full rounded-full h-12 gradient-primary text-primary-foreground shadow-lg shadow-primary/25"
                onClick={() => navigate(`/checkout?plan=${billingPeriod === "yearly" ? "pro_yearly" : "pro_monthly"}`)}
              >
                Activar Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
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
