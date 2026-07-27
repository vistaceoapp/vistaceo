import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useCountryDetection, COUNTRY_CONFIG } from "@/hooks/use-country-detection";
import type { CountryCode } from "@/lib/countryPacks";
import mercadopagoLogo from "@/assets/payment/mercadopago-logo.png";
import paypalLogo from "@/assets/payment/paypal-logo.png";
import { cn } from "@/lib/utils";
import { PayPalPaymentInfo } from "@/components/checkout/PayPalPaymentInfo";
import { PayPalSmartButtons } from "@/components/checkout/PayPalSmartButtons";
import { StickyPaymentButton } from "@/components/checkout/StickyPaymentButton";
import { StickyPayPalButton } from "@/components/checkout/StickyPayPalButton";
import { safeLocalStorage } from "@/lib/safe-storage";

// Pro features list - exact match with landing + infinity symbols
const proFeatures = [
  { name: "Dashboard de Salud", detail: "Completo", hasInfinity: false },
  { name: "Misiones", detail: "Alta capacidad", hasInfinity: false },
  { name: "Chat IA", detail: "Alta capacidad", hasInfinity: false },
  { name: "Radar de Oportunidades", detail: "Alta capacidad", hasInfinity: false },
  { name: "Check-ins de Pulso", detail: "Diarios", hasInfinity: false },
  { name: "Gemelo Digital predictivo", detail: "Completo", hasInfinity: false },
  { name: "Análisis de Competencia", detail: "Completo", hasInfinity: false },
  { name: "Predicciones IA", detail: "Alta capacidad", hasInfinity: false },
  { name: "Insights avanzados", detail: "Completos", hasInfinity: false },
  { name: "Métricas y Evolución", detail: "Completas", hasInfinity: false },
  { name: "Integraciones premium", detail: "Completas", hasInfinity: false },
  { name: "Soporte prioritario 24/7", detail: "Incluido", hasInfinity: false },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const queryClient = useQueryClient();
  
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
  const [checkoutFallbackUrl, setCheckoutFallbackUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "failure" | "pending">("idle");
  const [isYearly, setIsYearly] = useState(true);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // ---- Promo (24h magic link) ----
  const promoToken = searchParams.get("promo") || null;
  const [promo, setPromo] = useState<{
    valid: boolean;
    localDisplay?: string;
    usdDisplay?: string;
    expiresAt?: string;
    reason?: string;
    country?: CountryCode;
    currency?: string;
    recipientEmail?: string;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState<boolean>(!!promoToken);

  // Keep the complete magic-link destination through Google OAuth and email confirmation.
  useEffect(() => {
    if (promoToken) {
      safeLocalStorage.setItem("pendingCheckoutPath", `/checkout?promo=${encodeURIComponent(promoToken)}`);
    }
  }, [promoToken]);

  // Ref for observing when main payment button leaves viewport
  const mainPaymentRef = useRef<HTMLDivElement>(null);

  // If URL has country param, save it to localStorage for consistency
  useEffect(() => {
    if (urlCountry && urlCountry !== country.code) {
      setCountryOverride(urlCountry);
    }
  }, [urlCountry, country.code, setCountryOverride]);

  // Get plan from URL or localStorage — promo forces pro_monthly
  const urlPlan = searchParams.get("plan");
  const storedPlan = safeLocalStorage.getItem("pendingPlan");
  const planId = promoToken ? "pro_monthly" : (urlPlan || storedPlan || "pro_yearly");

  // Sync isYearly with planId
  useEffect(() => {
    setIsYearly(planId === "pro_yearly");
  }, [planId]);

  // Validate promo token server-side
  useEffect(() => {
    if (!promoToken) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("promo-redeem", {
          body: { token: promoToken },
        });
        if (cancelled) return;
        if (error || !data?.valid) {
          setPromo({ valid: false, reason: data?.reason || "invalid" });
        } else {
          const o = data.offer;
          const usdDisplay = `$${o.usdAmount % 1 === 0 ? o.usdAmount : o.usdAmount.toFixed(2)} USD`;
          const localDisplay = o.currency && o.localAmount
            ? new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(o.localAmount) + " " + o.currency
            : usdDisplay;
          setPromo({
            valid: true,
            localDisplay: o.currency === "USD" ? usdDisplay : `$${localDisplay}`,
            usdDisplay,
            expiresAt: o.expiresAt,
            country: o.country as CountryCode,
            currency: o.currency,
            recipientEmail: o.recipientEmail,
          });
          // Lock country to the offer's country so nothing mixes (e.g. CLP price with ARS "antes").
          if (o.country) {
            setCountryOverride(o.country as CountryCode);
          }
        }
      } catch (e) {
        if (!cancelled) setPromo({ valid: false, reason: "network" });
      } finally {
        if (!cancelled) setPromoLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [promoToken]);

  // Check payment status from URL
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus === "success") {
      setStatus("success");
      safeLocalStorage.removeItem("pendingPlan");
      safeLocalStorage.removeItem("pendingPlanTimestamp");
      safeLocalStorage.removeItem("pendingCheckoutPath");
      // Invalidate subscription cache so Pro status is reflected immediately
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      // Redirect to app if user already has a business, otherwise to setup
      const hasSetup = safeLocalStorage.getItem("setup_completed");
      const redirectPath = hasSetup ? "/app" : "/setup";
      setTimeout(() => navigate(redirectPath, { replace: true }), 2500);
    } else if (urlStatus === "failure") {
      setStatus("failure");
    } else if (urlStatus === "pending") {
      setStatus("pending");
    }
  }, [searchParams, navigate]);

  const monthlyEquivalent = yearlyPrice % 12 === 0 ? yearlyPrice / 12 : Math.floor(yearlyPrice / 12);
  const savings = yearlySavings();
  const countryOptions = Object.entries(COUNTRY_CONFIG)
    .filter(([code]) => code !== "DEFAULT")
    .sort(([, a], [, b]) => a.name.localeCompare(b.name));

  const handleInlineAuth = async () => {
    setAuthSubmitting(true);

    try {
      if (planId) {
        safeLocalStorage.setItem("pendingPlan", planId);
        safeLocalStorage.setItem("pendingPlanTimestamp", Date.now().toString());
      }

      if (authMode === "login") {
        const { error } = await signIn(authEmail, authPassword);
        if (error) throw error;
        toast.success("Sesión iniciada. Ya puedes pagar.");
      } else {
        const { error, requiresEmailConfirmation } = await signUp(authEmail, authPassword, authFullName);
        if (error) throw error;

        if (requiresEmailConfirmation) {
          toast.success("Te enviamos un email para confirmar tu cuenta antes de pagar.");
        } else {
          toast.success("Cuenta creada. Ya puedes pagar.");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo continuar";
      toast.error(message);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleInlineAuth = async () => {
    setGoogleSubmitting(true);
    try {
      if (planId) {
        safeLocalStorage.setItem("pendingPlan", planId);
        safeLocalStorage.setItem("pendingPlanTimestamp", Date.now().toString());
      }

      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo continuar con Google";
      toast.error(message);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      mainPaymentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.info("Ingresá con la cuenta que recibió la oferta para continuar.");
      return;
    }

    if (promoToken && (promoLoading || !promo?.valid)) {
      toast.error(promoLoading ? "Estamos validando la oferta. Intentá nuevamente en un instante." : "Esta oferta ya no está disponible.");
      return;
    }

    const signedInEmail = user.email?.trim().toLowerCase();
    const recipientEmail = promo?.recipientEmail?.trim().toLowerCase();
    if (promo?.valid && recipientEmail && signedInEmail !== recipientEmail) {
      toast.error("Esta oferta está asociada a otro email. Ingresá con la cuenta que recibió el correo.");
      return;
    }
    
    setLoading(true);
    
    try {
      const currentPlanId = promo?.valid ? "pro_monthly" : (isYearly ? "pro_yearly" : "pro_monthly");
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          userId: user.id,
          planId: currentPlanId,
          country: country?.code || "AR",
          email: user.email,
          // Pass local pricing info for tracking
          localAmount: isYearly ? yearlyPrice : monthlyPrice,
          localCurrency: country.currency,
          promoToken: promo?.valid ? promoToken : undefined,
        },
      });

      if (error) {
        // Make errors visible while keeping a friendly message.
        console.error("Checkout invoke error:", error);
        const context = (error as { context?: unknown })?.context;
        let details = "";
        if (context instanceof Response) {
          const payload = await context.clone().json().catch(() => null) as { error?: string; message?: string } | null;
          details = payload?.error || payload?.message || await context.text().catch(() => "");
        }
        throw new Error(details || (error as Error)?.message || "Error desconocido");
      }

      if (data?.checkoutUrl) {
        const url = data.checkoutUrl as string;
        // Redirección robusta: algunos navegadores móviles bloquean
        // window.location.href desde un handler async. Guardamos el URL
        // para mostrar un enlace manual si el navegador no redirige en 6s.
        setCheckoutFallbackUrl(url);
        try {
          window.location.assign(url);
        } catch {
          window.location.href = url;
        }
        // Reset del estado por si el navegador nunca navega (ej. bloqueado).
        setTimeout(() => {
          setLoading(false);
        }, 6000);
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

  const handlePromoAccountSwitch = async () => {
    if (!promoToken) return;
    const checkoutPath = `/checkout?promo=${encodeURIComponent(promoToken)}`;
    safeLocalStorage.setItem("pendingCheckoutPath", checkoutPath);
    await signOut(checkoutPath);
  };

  const promoIdentityMismatch = Boolean(
    user?.email
    && promo?.valid
    && promo.recipientEmail
    && user.email.trim().toLowerCase() !== promo.recipientEmail.trim().toLowerCase()
  );

  const maskedPromoEmail = promo?.recipientEmail
    ? promo.recipientEmail.replace(/^(.{2}).*(@.*)$/, "$1••••$2")
    : "el email que recibió la oferta";

  if (authLoading || isDetecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Preparando pago seguro...</p>
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
          <p className="text-lg text-muted-foreground mb-6">Tu pago fue procesado correctamente. Todas las funciones Pro están activas.</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Preparando tu experiencia Pro...</span>
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
                Hubo un problema con tu pago. Puedes intentar nuevamente.
              </p>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => setStatus("idle")}>
                  Intentar de nuevo
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate("/app")}>
                  Volver al inicio
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
          <Button variant="ghost" size="sm" onClick={() => {
            // Navigate back — if coming from setup, history.back returns there preserving state
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/setup');
            }
          }} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <VistaceoLogo size={36} variant="full" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Pago seguro</span>
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

        {/* Promo Banner (24h magic link) */}
        {promoToken && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            {promoLoading ? (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Validando tu oferta privada...</span>
              </div>
            ) : promo?.valid ? (
              <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-primary">Oferta privada · 24 horas</div>
                      <div className="text-base font-semibold text-foreground">
                        Primer mes Pro por {promo.localDisplay}
                      </div>
                    </div>
                  </div>
                  {promo.expiresAt && (
                    <div className="text-xs text-muted-foreground">
                      Vence: {new Date(promo.expiresAt).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
                Esta oferta ya no está disponible ({promo?.reason || "no válida"}). Podés seguir con el plan estándar.
              </div>
            )}
          </motion.div>
        )}

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
                  <h1 className="text-3xl font-bold text-foreground">VISTACEO Pro</h1>
                </div>

                {/* Billing Toggle - hidden during promo (locked to monthly) */}
                {!promo?.valid && (
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
                )}

                <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-3 py-2.5">
                  <span className="text-sm">{country.flag}</span>
                  <span className="text-sm font-medium text-foreground">
                    {isDetecting ? "Detectando país..." : `País detectado: ${country.name}`}
                  </span>
                  {!promo?.valid && (
                    <select
                      aria-label="Cambiar país de precios"
                      value={country.code === "DEFAULT" ? "AR" : country.code}
                      onChange={(e) => setCountryOverride(e.target.value as CountryCode)}
                      className="h-9 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
                    >
                      {countryOptions.map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.flag} {info.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Price display */}
                {promo?.valid ? (
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl lg:text-6xl font-bold text-foreground">{promo.localDisplay}</span>
                      <span className="text-lg text-muted-foreground">primer mes</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-through">
                      Antes {formatCurrencyShort(monthlyPrice)} {country.currency}/mes
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Después $49 USD/mes · cancelás cuando quieras
                    </p>
                  </div>
                ) : (
                  <>
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
                           {savings.percentage}% de ahorro vs. mensual
                        </Badge>
                      </div>
                    )}

                    {/* USD conversion notice for non-Argentina countries */}
                    {!isArgentina && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground text-center">
                           Te mostramos los precios en <strong>{country.currency}</strong>, pero siempre abonarás en <strong>USD ${isYearly ? 290 : 49}</strong>.
                          <br />
                          <span className="text-muted-foreground/80">
                            Puedes pagar con tarjeta de débito/crédito o con tu cuenta PayPal.
                          </span>
                        </p>
                      </div>
                    )}
                  </>
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
              {promoLoading ? (
                <div className="rounded-xl border border-border/50 bg-secondary/30 p-5 text-center">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Validando tu precio promocional...</p>
                </div>
              ) : isArgentina ? (
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
                    usdAmount={isYearly ? 290 : 49}
                  planId={isYearly ? "pro_yearly" : "pro_monthly"}
                />
              )}

              {/* CTA Button - wrapped in ref for sticky observation */}
              <div ref={mainPaymentRef}>
                {!user ? (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-5 sm:p-6 space-y-4">
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {promo?.valid ? "Creá tu cuenta para activar la oferta" : "Entrá o crea tu cuenta para pagar"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {promo?.valid
                            ? `Es solo un paso: al confirmar, se aplica ${promo.localDisplay} el primer mes.`
                            : "El plan Pro quedará asociado automáticamente a tu perfil y a tu negocio, incluso si completás el setup después."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/50 p-1">
                        <button
                          onClick={() => setAuthMode("signup")}
                          className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-all", authMode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                        >
                          Crear cuenta
                        </button>
                        <button
                          onClick={() => setAuthMode("login")}
                          className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-all", authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}
                        >
                          Ya tengo cuenta
                        </button>
                      </div>

                      <Button variant="outline" className="w-full" onClick={handleGoogleInlineAuth} disabled={googleSubmitting}>
                        {googleSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Continuar con Google
                      </Button>

                      <div className="grid gap-3">
                        {authMode === "signup" ? (
                          <input
                            value={authFullName}
                            onChange={(e) => setAuthFullName(e.target.value)}
                            placeholder="Tu nombre"
                            className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
                          />
                        ) : null}
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="Email"
                          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
                        />
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Contraseña"
                          className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
                        />
                      </div>

                      <Button className="w-full" onClick={handleInlineAuth} disabled={authSubmitting || !authEmail || !authPassword || (authMode === "signup" && !authFullName.trim())}>
                        {authSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {authMode === "signup" ? "Crear cuenta y continuar al pago" : "Entrar y continuar al pago"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : promoLoading ? (
                  <Button size="xl" className="w-full h-14 text-lg" disabled>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Validando oferta...
                  </Button>
                ) : promoIdentityMismatch ? (
                  <Card className="border-warning/40 bg-warning/5">
                    <CardContent className="p-5 space-y-4 text-center">
                      <div>
                        <h3 className="font-semibold text-foreground">Ingresaste con otro email</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Esta oferta está reservada para {maskedPromoEmail}. Cambiá de cuenta para mantener el precio promocional.
                        </p>
                      </div>
                      <Button className="w-full" onClick={handlePromoAccountSwitch}>
                        Ingresar con el email correcto
                      </Button>
                    </CardContent>
                  </Card>
                ) : (isArgentina || promo?.valid) ? (
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
                        {promo?.valid ? `Activar por ${promo.localDisplay}` : (isYearly ? "Ir al pago anual" : "Ir al pago mensual")}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                ) : (
                  <PayPalSmartButtons
                    userId={user.id}
                    userEmail={user.email}
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
      {status === "idle" && !promoLoading && isArgentina && user && (
        <StickyPaymentButton
          mainButtonRef={mainPaymentRef}
          isLoading={loading}
          onClick={handleCheckout}
          buttonText={promo?.valid ? "Activar promo" : (isYearly ? "Pagar Pro anual" : "Pagar Pro mensual")}
          priceText={promo?.valid ? (promo.localDisplay || "").replace(/\s?[A-Z]{3}$/, "").trim() : formatCurrencyShort(isYearly ? monthlyEquivalent : monthlyPrice)}
          currency={promo?.valid ? (promo.currency || country.currency) : country.currency}
          isYearly={isYearly}
          provider="mercadopago"
        />
      )}

      {/* Sticky PayPal Button - for non-Argentina countries */}
      {status === "idle" && !promoLoading && !promoToken && !isArgentina && (
          <StickyPayPalButton
          mainButtonRef={mainPaymentRef}
          priceText={isYearly ? "290" : "49"}
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
