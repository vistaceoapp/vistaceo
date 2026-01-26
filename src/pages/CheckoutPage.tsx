import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Loader2, Shield, Check, Sparkles, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCountryDetection } from "@/hooks/use-country-detection";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { country, isDetecting, formatPrice: formatCountryPrice, isArgentina } = useCountryDetection();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failure" | "pending">("idle");

  // Get plan from URL or localStorage
  const urlPlan = searchParams.get("plan");
  const storedPlan = localStorage.getItem("pendingPlan");
  const planId = urlPlan || storedPlan || "pro_yearly";
  const isYearly = planId === "pro_yearly";

  // Check payment status from URL
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus === "success") {
      setStatus("success");
      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("pendingPlanTimestamp");
      // Redirect to setup after short celebration
      setTimeout(() => navigate("/setup", { replace: true }), 2000);
    } else if (urlStatus === "failure") {
      setStatus("failure");
    } else if (urlStatus === "pending") {
      setStatus("pending");
    }
  }, [searchParams, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      // Save plan intent and redirect to auth
      if (planId) {
        localStorage.setItem("pendingPlan", planId);
        localStorage.setItem("pendingPlanTimestamp", Date.now().toString());
      }
      navigate(`/auth?plan=${planId}`, { replace: true });
    }
  }, [user, authLoading, navigate, planId]);

  const prices = country?.prices || { monthly: 29, yearly: 299 };
  const currency = country?.currency || "USD";
  const symbol = country?.symbol || "$";

  const formatDisplayPrice = (amount: number) => {
    if (currency === "ARS") {
      return `${symbol}${amount.toLocaleString("es-AR")}`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  };

  const handleCheckout = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          userId: user.id,
          planId,
          country: country?.code || "US",
          email: user.email,
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Redirect to payment provider
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("No se pudo iniciar el pago. Intentá de nuevo.");
      setLoading(false);
    }
  };

  if (authLoading || isDetecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">¡Bienvenido a Pro!</h1>
          <p className="text-muted-foreground mb-4">Tu pago fue procesado correctamente.</p>
          <p className="text-sm text-muted-foreground">Redirigiendo al setup...</p>
        </motion.div>
      </div>
    );
  }

  // Failure state
  if (status === "failure") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pago no completado</h2>
            <p className="text-muted-foreground mb-6">
              Hubo un problema con tu pago. Podés intentar nuevamente.
            </p>
            <div className="space-y-3">
              <Button className="w-full" onClick={() => setStatus("idle")}>
                Intentar de nuevo
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate("/setup")}>
                Continuar sin Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <VistaceoLogo size={36} variant="full" />
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Plan details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30">
                <Crown className="w-3 h-3 mr-1" />
                Plan Pro
              </Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isYearly ? "Pro Anual" : "Pro Mensual"}
              </h1>
              <p className="text-muted-foreground">
                Desbloquea todo el poder de tu CEO digital
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Chat IA ultra-inteligente con análisis de fotos/docs",
                "Misiones estratégicas ilimitadas",
                "Radar I+D completo sin límites",
                "Integración Google Reviews",
                "Analíticas avanzadas y predicciones",
                "Soporte prioritario 24/7",
                ...(isYearly ? ["2 meses gratis incluidos", "Onboarding personalizado 1:1"] : []),
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Pago 100% seguro
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4" />
                Cancelá cuando quieras
              </div>
            </div>
          </motion.div>

          {/* Right: Payment card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-primary/30 shadow-xl shadow-primary/10">
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div className="text-center pb-4 border-b border-border/50">
                  <div className="text-4xl font-bold text-foreground">
                    {formatDisplayPrice(isYearly ? prices.yearly : prices.monthly)}
                    <span className="text-lg font-normal text-muted-foreground ml-1">
                      {currency}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {isYearly ? "por año" : "por mes"}
                  </p>
                  {isYearly && (
                    <Badge variant="secondary" className="mt-2 bg-success/10 text-success border-success/30">
                      Ahorrás 2 meses
                    </Badge>
                  )}
                </div>

                {/* Payment method */}
                <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-secondary/50">
                  {isArgentina ? (
                    <>
                      <img 
                        src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large@2x.png" 
                        alt="MercadoPago"
                        className="h-5"
                      />
                      <span className="text-sm text-muted-foreground">Pagás con MercadoPago</span>
                    </>
                  ) : (
                    <>
                      <img 
                        src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                        alt="PayPal"
                        className="h-5"
                      />
                      <span className="text-sm text-muted-foreground">Pay with PayPal</span>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
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
                      <Zap className="w-5 h-5 mr-2" />
                      Activar Pro ahora
                    </>
                  )}
                </Button>

                {/* Plan toggle */}
                <div className="text-center">
                  <button
                    onClick={() => navigate(`/checkout?plan=${isYearly ? "pro_monthly" : "pro_yearly"}`)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isYearly ? "Prefiero pagar mensual →" : "Ver plan anual (2 meses gratis) →"}
                  </button>
                </div>

                {/* Guarantee */}
                <div className="text-center pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    🛡️ Garantía de satisfacción de 7 días. 
                    <br />Si no ves valor, te devolvemos el 100%.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Skip option */}
            <div className="text-center mt-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground"
                onClick={() => {
                  localStorage.removeItem("pendingPlan");
                  localStorage.removeItem("pendingPlanTimestamp");
                  navigate("/setup");
                }}
              >
                Continuar con plan Free →
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
