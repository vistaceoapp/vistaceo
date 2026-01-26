import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles, Shield, CreditCard, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Pricing configuration
const PRICING = {
  AR: {
    currency: "ARS",
    symbol: "$",
    monthly: 29500,
    yearly: 295000,
    flag: "🇦🇷",
  },
  DEFAULT: {
    currency: "USD",
    symbol: "$",
    monthly: 29,
    yearly: 290,
    flag: "🌎",
  },
};

const proFeatures = [
  "Todo del plan Free incluido",
  "Misiones ilimitadas",
  "Analytics y predicciones IA",
  "Hablar con VistaCEO (voz)",
  "Análisis de fotos y documentos",
  "Radar I+D completo",
  "Integraciones premium",
  "Soporte prioritario 24/7",
];

export const PricingSection = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [country, setCountry] = useState<"AR" | "DEFAULT">("DEFAULT");
  const [isDetecting, setIsDetecting] = useState(true);

  // Detect country from browser language
  useEffect(() => {
    const detectCountry = () => {
      const lang = navigator.language || "en";
      if (lang.includes("AR") || lang === "es-AR") {
        setCountry("AR");
      }
      setIsDetecting(false);
    };
    detectCountry();
  }, []);

  const pricing = PRICING[country];
  const currentPrice = isYearly ? pricing.yearly : pricing.monthly;
  const monthlyEquivalent = isYearly ? Math.round(pricing.yearly / 12) : pricing.monthly;
  const savings = isYearly ? pricing.monthly * 2 : 0; // 2 months free

  const formatPrice = (price: number) => {
    if (country === "AR") {
      return new Intl.NumberFormat('es-AR').format(price);
    }
    return price.toString();
  };

  const handleSelectPlan = (plan: "free" | "pro_monthly" | "pro_yearly") => {
    if (plan === "free") {
      navigate("/auth");
    } else {
      navigate(`/auth?plan=${plan}`);
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[200px] opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(204, 79%, 50%, 0.15), transparent 70%)' }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Precios transparentes</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
            Elegí tu plan,{" "}
            <span className="text-gradient-primary">empezá a crecer</span>
          </h2>
          
          <p className="text-lg text-muted-foreground">
            Sin sorpresas. Sin contratos. Cancelás cuando quieras.
          </p>

          {/* Country indicator */}
          <div className="mt-6 text-sm text-muted-foreground">
            Precios en {pricing.flag} {pricing.currency}
          </div>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-4 p-2 bg-secondary/50 border border-border rounded-2xl">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-medium transition-all",
                !isYearly 
                  ? "bg-card text-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-3 rounded-xl text-sm font-medium transition-all relative",
                isYearly 
                  ? "bg-card text-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual
              {!isYearly && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-success text-white text-xs font-semibold rounded-full">
                  -17%
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Savings badge */}
        <AnimatePresence>
          {isYearly && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-success/10 border border-success/20 text-success">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Ahorrás {pricing.symbol}{formatPrice(savings)} — 2 meses gratis
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative bg-card border border-border rounded-3xl p-8 lg:p-10"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Free</h3>
                  <p className="text-sm text-muted-foreground">Para empezar a ver resultados</p>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-foreground">{pricing.symbol}0</span>
                <span className="text-muted-foreground">/siempre</span>
              </div>

              <Button 
                variant="outline" 
                size="xl" 
                className="w-full"
                onClick={() => handleSelectPlan("free")}
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="space-y-3">
              {["Dashboard completo", "Diagnóstico de negocio", "1 Acción diaria", "3 Misiones/mes", "Chat con VistaCEO (texto)", "Radar básico"].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-20 blur-lg animate-pulse-slow" />
            
            <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-8 lg:p-10">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg">
                  <Crown className="w-4 h-4" />
                  Más popular
                </div>
              </div>

              <div className="mb-8 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground">Pro</h3>
                    <p className="text-sm text-muted-foreground">El cerebro completo</p>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-bold text-foreground">
                    {pricing.symbol}{formatPrice(monthlyEquivalent)}
                  </span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
                
                {isYearly && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Facturado anualmente ({pricing.symbol}{formatPrice(pricing.yearly)})
                  </p>
                )}

                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full group"
                  onClick={() => handleSelectPlan(isYearly ? "pro_yearly" : "pro_monthly")}
                >
                  {isYearly ? "Comenzar con 2 meses gratis" : "Comenzar con Pro"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="space-y-3">
                {proFeatures.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success" />
            <span>7 días de garantía</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>{country === "AR" ? "MercadoPago" : "PayPal"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span>Cancelás cuando quieras</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
