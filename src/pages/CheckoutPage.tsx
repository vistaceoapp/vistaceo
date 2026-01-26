import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Loader2, Shield, Check, Sparkles, ArrowLeft, Zap, Lock, CreditCard, BadgeCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VistaceoLogo } from "@/components/ui/VistaceoLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useCountryDetection } from "@/hooks/use-country-detection";
import mercadopagoLogo from "@/assets/payment/mercadopago-logo.png";
import paypalLogo from "@/assets/payment/paypal-logo.png";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { country, isDetecting, isArgentina } = useCountryDetection();
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

  // Pricing based on country
  const monthlyPrice = isArgentina ? 29999 : 29;
  const yearlyPrice = isArgentina ? 299999 : 299;
  const currencyCode = isArgentina ? "ARS" : "USD";

  const formatDisplayPrice = (amount: number) => {
    if (isArgentina) {
      return `$${amount.toLocaleString("es-AR")}`;
    }
    return `$${amount.toLocaleString()}`;
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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

  const proFeatures = [
    { icon: Sparkles, text: "Chat IA ultra-inteligente con análisis de fotos y documentos" },
    { icon: Zap, text: "Misiones estratégicas ilimitadas" },
    { icon: BadgeCheck, text: "Radar I+D completo sin límites" },
    { icon: Check, text: "Integración Google Reviews" },
    { icon: Check, text: "Analíticas avanzadas y predicciones IA" },
    { icon: Check, text: "Soporte prioritario 24/7" },
    ...(isYearly ? [
      { icon: Crown, text: "2 meses gratis incluidos" },
      { icon: Crown, text: "Onboarding personalizado 1:1" },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
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

      <main className="container max-w-6xl mx-auto px-4 py-8 lg:py-12">
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

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: Plan details (3 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30 px-3 py-1">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Plan Pro
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                {isYearly ? "VistaCEO Pro Anual" : "VistaCEO Pro Mensual"}
              </h1>
              <p className="text-lg text-muted-foreground">
                Desbloquea todo el poder de tu CEO digital para hacer crecer tu negocio.
              </p>
            </div>

            {/* Features Grid */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Todo lo que incluye Pro
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {proFeatures.map((feature, idx) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <feature.icon className="w-3.5 h-3.5 text-success" />
                      </div>
                      <span className="text-sm text-foreground/90">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guarantee Card */}
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Garantía de satisfacción de 7 días</h4>
                  <p className="text-sm text-muted-foreground">
                    Si no ves valor en VistaCEO Pro, te devolvemos el 100% de tu dinero. Sin preguntas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Payment card (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Price Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-foreground">
                    {formatDisplayPrice(isYearly ? yearlyPrice : monthlyPrice)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-muted-foreground text-lg">{currencyCode}</span>
                    <span className="text-muted-foreground">/ {isYearly ? "año" : "mes"}</span>
                  </div>
                  {isYearly && (
                    <Badge variant="secondary" className="mt-3 bg-success/10 text-success border-success/30">
                      🎉 Ahorrás 2 meses
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Payment Provider */}
                <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Procesado de forma segura por
                  </p>
                  <div className="flex items-center justify-center">
                    {isArgentina ? (
                      <img 
                        src={mercadopagoLogo} 
                        alt="Mercado Pago"
                        className="h-10 object-contain"
                      />
                    ) : (
                      <img 
                        src={paypalLogo} 
                        alt="PayPal"
                        className="h-8 object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  size="xl" 
                  className="w-full h-14 text-lg font-semibold gradient-primary shadow-lg"
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
                      Pagar ahora
                    </>
                  )}
                </Button>

                {/* Security indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SSL Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Datos protegidos</span>
                  </div>
                </div>

                {/* Plan toggle */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate(`/checkout?plan=${isYearly ? "pro_monthly" : "pro_yearly"}`)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    {isYearly ? "Prefiero pagar mensual →" : "Ver plan anual (2 meses gratis) →"}
                  </button>
                </div>

                {/* Trust badges */}
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Check className="w-4 h-4 text-success" />
                      <span>Cancelá cuando quieras</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skip option */}
            <div className="text-center mt-5">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
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

        {/* Bottom trust section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-border/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span>Transacción encriptada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span>Garantía de 7 días</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <span>Pagos seguros</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            © {new Date().getFullYear()} VistaCEO. Todos los derechos reservados. 
            Tus datos están protegidos bajo nuestra política de privacidad.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default CheckoutPage;
