import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Crown, Check, Sparkles, Star, Zap, Brain, TrendingUp,
  Shield, Loader2, PartyPopper, AlertCircle, Infinity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCountryDetection } from "@/hooks/use-country-detection";
import type { CountryCode } from "@/lib/countryPacks";

const UpgradePage = () => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failure" | "pending" | null>(null);
  const [autoCheckoutTriggered, setAutoCheckoutTriggered] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"yearly" | "monthly">("yearly");

  const countryCode = (currentBusiness?.country || "AR") as CountryCode;
  
  const {
    country,
    isArgentina,
    formatPrice,
    formatCurrencyShort,
    monthlyPrice,
    yearlyPrice,
    yearlySavings,
  } = useCountryDetection(countryCode);

  const savings = yearlySavings();
  const monthlyEquivalent = Math.floor(yearlyPrice / 12);

  const handleUpgrade = async (planId: string) => {
    if (!currentBusiness) {
      toast({ title: "Error", description: "No se encontró el negocio", variant: "destructive" });
      return;
    }
    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          businessId: currentBusiness.id,
          userId: user?.id || currentBusiness.owner_id,
          planId,
          country: countryCode,
          localAmount: planId === "pro_yearly" ? yearlyPrice : monthlyPrice,
          localCurrency: country.currency,
        },
      });
      if (error) throw error;
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Error", description: "No se pudo iniciar el proceso de pago", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success" || status === "failure" || status === "pending") {
      setPaymentStatus(status);
      if (status === "success") {
        localStorage.removeItem("pendingPlan");
        localStorage.removeItem("pendingPlanTimestamp");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (autoCheckoutTriggered || !currentBusiness || paymentStatus || loading) return;
    const pendingPlan = localStorage.getItem("pendingPlan");
    const pendingPlanTimestamp = localStorage.getItem("pendingPlanTimestamp");
    const isValidPlan = pendingPlan && pendingPlanTimestamp && 
      (Date.now() - parseInt(pendingPlanTimestamp)) < 24 * 60 * 60 * 1000;
    if (isValidPlan && (pendingPlan === "pro_monthly" || pendingPlan === "pro_yearly")) {
      setAutoCheckoutTriggered(true);
      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("pendingPlanTimestamp");
      setTimeout(() => handleUpgrade(pendingPlan), 500);
    }
  }, [currentBusiness, autoCheckoutTriggered, paymentStatus, loading]);

  const { isPro } = useSubscription();
  const businessSettings = currentBusiness?.settings as Record<string, any> | null;
  const planExpiresAt = businessSettings?.plan_expires_at;

  if (paymentStatus === "success") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">¡Bienvenido a Pro!</h2>
            <p className="text-muted-foreground mb-6">Tu pago fue procesado correctamente. Ya tienes acceso a todas las funciones premium.</p>
            <Button className="w-full gradient-primary" onClick={() => navigate("/app")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "failure") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pago no completado</h2>
            <p className="text-muted-foreground mb-6">Hubo un problema con tu pago. Puedes intentar nuevamente.</p>
            <Button variant="outline" className="w-full" onClick={() => setPaymentStatus(null)}>Volver a intentar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Crown className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plan Pro Activo</h1>
            <p className="text-muted-foreground">Tienes acceso a todas las funciones premium</p>
          </div>
        </div>
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge className="bg-primary text-primary-foreground mb-2">
                  <Sparkles className="w-3 h-3 mr-1" />Pro
                </Badge>
                <p className="text-foreground font-medium">Tu suscripción está activa</p>
                {planExpiresAt && (
                  <p className="text-sm text-muted-foreground">Válido hasta: {new Date(planExpiresAt).toLocaleDateString("es-AR")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Beneficios activos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Brain, label: "IA Ilimitada" },
                { icon: TrendingUp, label: "Análisis Premium" },
                { icon: Zap, label: "Sync Tiempo Real" },
                { icon: Shield, label: "Soporte Prioritario" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <benefit.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{benefit.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayPrice = billingPeriod === "yearly" ? monthlyEquivalent : monthlyPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade a Pro</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Desbloquea todo el poder de la inteligencia artificial para tu negocio
        </p>
      </div>

      {/* Payment method indicator */}
      <div className="flex justify-center">
        <Badge variant="outline" className="text-sm py-1.5 px-4">
          {isArgentina ? "Pagás con MercadoPago" : "Pagás con PayPal (USD)"}
        </Badge>
      </div>

      {/* Single Pro Card */}
      <div className="max-w-lg mx-auto">
        <Card className="relative border-2 border-primary/30 shadow-lg shadow-primary/10 overflow-visible">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground px-4">
            <Sparkles className="w-3 h-3 mr-1" />Más popular
          </Badge>

          <CardContent className="p-6 pt-8">
            <h3 className="text-xl font-bold text-foreground text-center mb-4">VISTACEO Pro</h3>

            {/* Billing toggle */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                    billingPeriod === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all relative",
                    billingPeriod === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Anual
                  <span className="absolute -top-2.5 -right-3 text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full leading-none">
                    -{savings.percentage}%
                  </span>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-center mb-5">
              <div className="flex items-baseline justify-center gap-1">
                {billingPeriod === "yearly" && (
                  <span className="text-lg line-through text-muted-foreground/60 mr-1">
                    {country.symbol}{formatPrice(monthlyPrice)}
                  </span>
                )}
                <span className="text-4xl font-bold text-primary">
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
                  * Pago procesado en USD ${billingPeriod === "yearly" ? "290" : "49"}
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2.5 mb-6">
              {[
                { name: "Chat IA", highCapacity: true },
                { name: "Misiones", highCapacity: true },
                { name: "Radar de Oportunidades", highCapacity: true },
                { name: "Predicciones IA", highCapacity: true },
                { name: "Gemelo Digital predictivo", highCapacity: false },
                { name: "Análisis de Competencia", highCapacity: false },
                { name: "Insights avanzados", highCapacity: false },
                { name: "Métricas y Evolución", highCapacity: false },
                { name: "Integraciones premium", highCapacity: false },
                { name: "Soporte prioritario 24/7", highCapacity: false },
              ].map((f, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f.name}
                  </span>
                  {f.highCapacity && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 py-0.5 px-2">
                      <Sparkles className="w-3 h-3 mr-1" />Alta capacidad
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

            <Button 
              className="w-full h-12 gradient-primary text-primary-foreground shadow-lg"
              onClick={() => handleUpgrade(billingPeriod === "yearly" ? "pro_yearly" : "pro_monthly")}
              disabled={loading !== null}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Activar Pro {billingPeriod === "yearly" ? "Anual" : "Mensual"}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trust badges */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Shield className="w-4 h-4" />Garantía 7 días</div>
        <div className="flex items-center gap-1"><Check className="w-4 h-4" />Cancelá cuando quieras</div>
      </div>
    </div>
  );
};

export default UpgradePage;
