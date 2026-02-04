import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, Loader2, Shield, Check, Sparkles, ArrowLeft, Zap, 
  Lock, CreditCard, BadgeCheck, ShieldCheck, X, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCountryDetection } from "@/hooks/use-country-detection";
import type { CountryCode } from "@/lib/countryPacks";
import mercadopagoLogo from "@/assets/payment/mercadopago-logo.png";
import paypalLogo from "@/assets/payment/paypal-logo.png";
import { cn } from "@/lib/utils";
import { PayPalPaymentInfo } from "@/components/checkout/PayPalPaymentInfo";
import { PayPalSmartButtons } from "@/components/checkout/PayPalSmartButtons";
import { StickyPaymentButton } from "@/components/checkout/StickyPaymentButton";
import { StickyPayPalButton } from "@/components/checkout/StickyPayPalButton";

// Pro features list - exact match with landing + infinity symbols
const proFeatures = [
  { name: "Dashboard de Salud", detail: "Completo", hasInfinity: false },
  { name: "Misiones", detail: "Ilimitadas", hasInfinity: true },
  { name: "Chat IA", detail: "Ilimitado", hasInfinity: true },
  { name: "Radar de Oportunidades", detail: "Ilimitado", hasInfinity: true },
  { name: "Check-ins de Pulso", detail: "Diarios", hasInfinity: false },
  { name: "Analytics avanzadas", detail: "Completas", hasInfinity: false },
  { name: "Predicciones IA", detail: "Ilimitadas", hasInfinity: true },
  { name: "Integraciones premium", detail: "Completas", hasInfinity: false },
  { name: "Soporte prioritario", detail: "Ilimitado", hasInfinity: true },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // Get country override from URL (from setup) or localStorage
  const urlCountry = searchParams.get("country") as CountryCode | null;
  
  const { 
    country, 
    isDetecting, 
    isArgentina, 
    formatCurrencyShort, 
    monthlyPrice, 
    yearlyPrice,
    yearlySavings,
    setCountryOverride,
  } = useCountryDetection(urlCountry);
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failure" | "pending">("idle");
  const [isYearly, setIsYearly] = useState(true);
  
  // Ref for observing when main payment button leaves viewport
  const mainPaymentRef = useRef<HTMLDivElement>(null);

  // If URL has country param, save it to localStorage for consistency
  useEffect(() => {
    if (urlCountry && urlCountry !== country.code) {
      setCountryOverride(urlCountry);
    }
  }, [urlCountry, country.code, setCountryOverride]);

  // Get plan from URL or localStorage
  const urlPlan = searchParams.get("plan");
  const storedPlan = localStorage.getItem("pendingPlan");
  const planId = urlPlan || storedPlan || "pro_yearly";

  // Sync isYearly with planId
  useEffect(() => {
    setIsYearly(planId === "pro_yearly");
  }, [planId]);

  // Check payment status from URL
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus === "success") {
      setStatus("success");
      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("pendingPlanTimestamp");
      setTimeout(() => navigate("/setup", { replace: true }), 2500);
    } else if (urlStatus === "failure") {
      setStatus("failure");
    } else if (urlStatus === "pending") {
      setStatus("pending");
    }
  }, [searchParams, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      if (planId) {
        localStorage.setItem("pendingPlan", planId);
        localStorage.setItem("pendingPlanTimestamp", Date.now().toString());
      }
      navigate(`/auth?plan=${planId}`, { replace: true });
    }
  }, [user, authLoading, navigate, planId]);

  const monthlyEquivalent = Math.round(yearlyPrice / 12);
  const savings = yearlySavings();

  const handleCheckout = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const currentPlanId = isYearly ? "pro_yearly" : "pro_monthly";
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          userId: user.id,
          planId: currentPlanId,
          country: country?.code || "AR",
          email: user.email,
          // Pass local pricing info for tracking
          localAmount: isYearly ? yearlyPrice : monthlyPrice,
          localCurrency: country.currency,
        },
      });

      if (error) {
        // Make errors visible while keeping a friendly message.
        console.error("Checkout invoke error:", error);
        const details = (error as any)?.context?.response ? await (error as any).context.response.text().catch(() => "") : "";
        throw new Error(details || (error as any)?.message || "Error desconocido");
      }

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // If we got a JSON payload but no redirect URL, surface backend error.
      const backendMsg = data?.error || data?.message;
      throw new Error(backendMsg || "No se recibió URL de pago.");
    } catch (error) {
      console.error("Checkout error:", error);
      const msg = error instanceof Error ? error.message : "";
      toast.error(msg ? `No se pudo iniciar el pago: ${msg}` : "No se pudo iniciar el pago. Intentá de nuevo.");
      setLoading(false);
    }
  };

  if (authLoading || isDetecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Preparando checkout seguro...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-success/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center max-w-md"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-success/20 to-success/40 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-success/20"
          >
            <Sparkles className="w-14 h-14 text-success" />
          </motion.div>
          <h1 className="text-4xl font-bold text-foreground mb-3">¡Bienvenido a Pro!</h1>
          <p className="text-lg text-muted-foreground mb-6">Tu pago fue procesado correctamente.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirigiendo al setup...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Failure state
  if (status === "failure") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-md w-full border-destructive/20">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pago no completado</h2>
              <p className="text-muted-foreground mb-6">
                Hubo un problema con tu pago. Podés intentar nuevamente.
              </p>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => setStatus("idle")}>
                  Intentar de nuevo
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate("/setup")}>
                  Continuar sin Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-warning/10 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="max-w-md w-full border-warning/20">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-warning animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pago pendiente</h2>
              <p className="text-muted-foreground mb-6">
                Tu pago está siendo procesado. Te notificaremos cuando se complete.
              </p>
              <Button className="w-full" size="lg" onClick={() => navigate("/setup")}>
                Continuar al setup
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/setup')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <VistaceoLogo size={36} variant="full" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Checkout seguro</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-8 lg:py-12">
        {/* Security Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span>Encriptación SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-success" />
            <span>Datos 100% protegidos</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-success" />
            <span>Proveedor certificado</span>
          </div>
        </motion.div>

        {/* Main Card - Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-20 blur-lg" />
          
          <Card className="relative border-2 border-primary/30 rounded-3xl overflow-visible">
            {/* Header with badge */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 lg:p-8 pt-10 lg:pt-12 border-b border-border/50 rounded-t-3xl">
              {/* Floating badge - positioned above the card */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold shadow-lg whitespace-nowrap">
                  <Crown className="w-4 h-4" />
                  Todo el poder del sistema
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">VistaCEO Pro</h1>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center gap-4 p-2 bg-secondary/50 border border-border rounded-2xl">
                    <button
                      onClick={() => setIsYearly(false)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
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
                        "px-5 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                        isYearly 
                          ? "bg-card text-foreground shadow-md" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Anual
                      {!isYearly && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-success text-white text-xs font-semibold rounded-full">
                          -{savings.percentage}%
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Price display */}
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl lg:text-6xl font-bold text-foreground">
                    {formatCurrencyShort(isYearly ? monthlyEquivalent : monthlyPrice)}
                  </span>
                  <span className="text-lg text-muted-foreground">{country.currency}/mes</span>
                </div>

                {isYearly && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Anual: {formatCurrencyShort(yearlyPrice)} {country.currency}/año
                    </p>
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/30">
                      2 meses gratis • {savings.percentage}% ahorro
                    </Badge>
                  </div>
                )}

                {/* USD conversion notice for non-Argentina countries */}
                {!isArgentina && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground text-center">
                      💵 El pago se procesará en <strong>USD ${isYearly ? 290 : 29}</strong> vía PayPal.
                      <br />
                      <span className="text-muted-foreground/80">
                        Podés pagar con tarjeta de débito/crédito o con tu cuenta PayPal.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-6 lg:p-8 space-y-6">
              {/* Features Grid */}
              <div className="grid gap-2">
                {proFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-success" />
                      </div>
                      <span className="text-foreground">{feature.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium whitespace-nowrap">
                      {feature.hasInfinity && <span className="text-base leading-none">∞</span>}
                      {feature.detail}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Payment Provider */}
              {isArgentina ? (
                <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Procesado de forma segura por
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background">
                      <img 
                        src={mercadopagoLogo} 
                        alt="MercadoPago"
                        className="h-6 w-6 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="text-sm font-medium text-foreground">Pagás con MercadoPago</span>
                    </div>
                  </div>
                </div>
              ) : (
                <PayPalPaymentInfo 
                  usdAmount={isYearly ? 290 : 29}
                  planId={isYearly ? "pro_yearly" : "pro_monthly"}
                />
              )}

              {/* CTA Button - wrapped in ref for sticky observation */}
              <div ref={mainPaymentRef}>
                {isArgentina ? (
                  <Button 
                    size="xl" 
                    className="w-full h-14 text-lg font-semibold gradient-primary shadow-lg group"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {isYearly ? "Comenzar con 2 meses gratis" : "Comenzar con Pro"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                ) : (
                  <PayPalSmartButtons
                    userId={user?.id || ""}
                    userEmail={user?.email}
                    planId={isYearly ? "pro_yearly" : "pro_monthly"}
                    country={country.code}
                    localAmount={isYearly ? yearlyPrice : monthlyPrice}
                    localCurrency={country.currency}
                    onSuccessRedirectUrl={`${window.location.origin}/checkout?status=success&provider=paypal`}
                  />
                )}
              </div>

              {/* Guarantee Card */}
              <Card className="border-success/30 bg-success/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Garantía de 7 días</h4>
                    <p className="text-sm text-muted-foreground">
                      Si no ves valor, te devolvemos el 100%. Sin preguntas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-success" />
                  <span>7 días de garantía</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>{isArgentina ? "MercadoPago" : "PayPal"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-accent" />
                  <span>Cancelás cuando quieras</span>
                </div>
              </div>

              {/* Country indicator */}
              <p className="text-center text-xs text-muted-foreground">
                Precios en {country.flag} {country.currency}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skip to free */}
        <div className="text-center mt-8 pb-24">
          <Button variant="ghost" onClick={() => navigate("/setup")} className="text-muted-foreground">
            Continuar con plan Free →
          </Button>
        </div>
      </main>

      {/* Sticky Payment Button - appears when main button scrolls out of view */}
      {status === "idle" && isArgentina && (
        <StickyPaymentButton
          mainButtonRef={mainPaymentRef}
          isLoading={loading}
          onClick={handleCheckout}
          buttonText={isYearly ? "Comenzar con 2 meses gratis" : "Comenzar con Pro"}
          priceText={formatCurrencyShort(isYearly ? monthlyEquivalent : monthlyPrice)}
          currency={country.currency}
          isYearly={isYearly}
          provider="mercadopago"
        />
      )}

      {/* Sticky PayPal Button - for non-Argentina countries */}
      {status === "idle" && !isArgentina && (
        <StickyPayPalButton
          mainButtonRef={mainPaymentRef}
          priceText={isYearly ? "290" : "29"}
          currency="USD"
          isYearly={isYearly}
          onScrollToPayment={() => {
            mainPaymentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
