import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Crown, 
  Check, 
  Sparkles, 
  Star, 
  Zap, 
  Brain, 
  TrendingUp,
  Shield,
  Loader2,
  PartyPopper,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const UpgradePage = () => {
  const { currentBusiness } = useBusiness();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failure" | "pending" | null>(null);

  // Check payment status from URL
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success" || status === "failure" || status === "pending") {
      setPaymentStatus(status);
    }
  }, [searchParams]);

  const isArgentina = currentBusiness?.country === "AR";

  const plans = [
    {
      id: "pro_monthly",
      name: "Pro Mensual",
      price: isArgentina ? "$29.500 ARS" : "$29 USD",
      period: "/mes",
      popular: false,
      features: [
        "Chat IA con voz y análisis de fotos/docs",
        "Integración Google Reviews completa",
        "Misiones ilimitadas",
        "Radar I+D sin límites",
        "Analíticas avanzadas",
        "Soporte prioritario",
      ],
    },
    {
      id: "pro_yearly",
      name: "Pro Anual",
      price: isArgentina ? "$295.000 ARS" : "$290 USD",
      period: "/año",
      popular: true,
      savings: isArgentina ? "Ahorrás $59.000 (2 meses gratis)" : "Save $58 (2 months free)",
      features: [
        "Todo lo del plan mensual",
        "2 meses gratis incluidos",
        "Acceso anticipado a nuevas funciones",
        "Onboarding personalizado 1:1",
        "Análisis competitivo avanzado",
        "Exportación de reportes PDF",
      ],
    },
  ];

  const handleUpgrade = async (planId: string) => {
    if (!currentBusiness) {
      toast({
        title: "Error",
        description: "No se encontró el negocio",
        variant: "destructive",
      });
      return;
    }

    setLoading(planId);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          businessId: currentBusiness.id,
          userId: user?.id || currentBusiness.owner_id,
          planId,
          country: currentBusiness.country || "AR",
        },
      });

      if (error) throw error;

      if (data?.checkoutUrl) {
        // Open checkout in new tab for security
        window.open(data.checkoutUrl, "_blank");
        toast({
          title: "Checkout iniciado",
          description: `Se abrió la página de pago de ${data.provider === "mercadopago" ? "MercadoPago" : "PayPal"}`,
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Check if business is already Pro
  const businessSettings = currentBusiness?.settings as Record<string, any> | null;
  const isPro = businessSettings?.plan === "pro";
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
            <p className="text-muted-foreground mb-6">
              Tu pago fue procesado correctamente. Ya tenés acceso a todas las funciones premium.
            </p>
            <Button 
              className="w-full gradient-primary"
              onClick={() => window.location.href = "/app"}
            >
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
            <p className="text-muted-foreground mb-6">
              Hubo un problema con tu pago. Podés intentar nuevamente.
            </p>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setPaymentStatus(null)}
            >
              Volver a intentar
            </Button>
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
            <p className="text-muted-foreground">Tenés acceso a todas las funciones premium</p>
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
                  <Sparkles className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
                <p className="text-foreground font-medium">
                  Tu suscripción está activa
                </p>
                {planExpiresAt && (
                  <p className="text-sm text-muted-foreground">
                    Válido hasta: {new Date(planExpiresAt).toLocaleDateString("es-AR")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Beneficios activos</CardTitle>
          </CardHeader>
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
          {isArgentina ? (
            <>
              <img 
                src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.21.22/mercadopago/logo__large@2x.png" 
                alt="MercadoPago"
                className="h-4 mr-2"
              />
              Pagás con MercadoPago
            </>
          ) : (
            <>
              <img 
                src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                alt="PayPal"
                className="h-4 mr-2"
              />
              Pay with PayPal
            </>
          )}
        </Badge>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
              plan.popular && "border-primary shadow-lg shadow-primary/20"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                <Star className="w-3 h-3 inline mr-1" />
                Más popular
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2 bg-success/10 text-success border-success/30">
                    {plan.savings}
                  </Badge>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={cn(
                  "w-full",
                  plan.popular ? "gradient-primary" : ""
                )}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Elegir {plan.name}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          Pago seguro
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-4 h-4" />
          Cancelá cuando quieras
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
