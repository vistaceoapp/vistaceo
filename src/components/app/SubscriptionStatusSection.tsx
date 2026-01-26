import { motion } from "framer-motion";
import { 
  Crown, 
  Zap, 
  Check, 
  X, 
  ArrowRight, 
  Shield, 
  Calendar,
  CreditCard,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { useCountryDetection } from "@/hooks/use-country-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Features comparison
const FREE_FEATURES = [
  { name: "Dashboard completo", included: true },
  { name: "Acciones diarias personalizadas", included: true },
  { name: "3 misiones estratégicas/mes", included: true },
  { name: "5 oportunidades Radar/mes", included: true },
  { name: "5 investigaciones I+D/mes", included: true },
];

const PRO_FEATURES = [
  { name: "Chat IA ultra-inteligente", included: true },
  { name: "Análisis de fotos y documentos", included: true },
  { name: "Misiones ilimitadas", included: true },
  { name: "Radar I+D completo sin límites", included: true },
  { name: "Google Reviews integrado", included: true },
  { name: "Analytics avanzado + predicciones", included: true },
  { name: "Soporte prioritario 24/7", included: true },
];

export const SubscriptionStatusSection = () => {
  const navigate = useNavigate();
  const { 
    isPro, 
    planId, 
    daysRemaining, 
    isExpiringSoon,
    expiresAt,
    paymentProvider,
    lastPaymentAt
  } = useSubscription();
  
  const { formatCurrencyShort, monthlyPrice, yearlyPrice } = useCountryDetection();

  const planLabel = planId === "pro_yearly" ? "Pro Anual" : planId === "pro_monthly" ? "Pro Mensual" : "Free";
  const monthlyEquivalent = planId === "pro_yearly" ? Math.round(yearlyPrice / 12) : monthlyPrice;

  // Pro user view
  if (isPro) {
    return (
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {planLabel}
                  <Badge className="bg-success/20 text-success border-0">Activo</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatCurrencyShort(monthlyEquivalent)}/mes
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subscription info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Próxima renovación</span>
              </div>
              <p className="font-semibold text-foreground">
                {expiresAt ? expiresAt.toLocaleDateString('es-AR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                }) : "—"}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Método de pago</span>
              </div>
              <p className="font-semibold text-foreground capitalize">
                {paymentProvider === "mercadopago" ? "MercadoPago" : paymentProvider === "paypal" ? "PayPal" : "—"}
              </p>
            </div>
          </div>

          {/* Days remaining progress */}
          {daysRemaining !== null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Días restantes</span>
                <span className={cn(
                  "font-semibold",
                  isExpiringSoon ? "text-warning" : "text-foreground"
                )}>
                  {daysRemaining} días
                </span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, (daysRemaining / (planId === "pro_yearly" ? 365 : 30)) * 100))} 
                className="h-2"
              />
            </div>
          )}

          <Separator />

          {/* Pro features */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Tu plan incluye:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring soon warning */}
          {isExpiringSoon && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-warning/10 border border-warning/30"
            >
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning">Tu suscripción vence pronto</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Renová antes del {expiresAt?.toLocaleDateString('es-AR')} para no perder acceso a las funciones Pro.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/app/upgrade")}>
              Gestionar suscripción
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free user view
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <Zap className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Plan Free</CardTitle>
              <p className="text-sm text-muted-foreground">Funcionalidades básicas</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current features */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Tu plan incluye:</h4>
          <div className="space-y-2">
            {FREE_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-foreground">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* What you're missing */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Desbloqueá con Pro:
          </h4>
          <div className="space-y-2">
            {PRO_FEATURES.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                <span className="text-muted-foreground">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Upgrade a Pro</p>
              <p className="text-xs text-muted-foreground">
                Desde {formatCurrencyShort(monthlyEquivalent)}/mes
              </p>
            </div>
            <Button 
              className="gradient-primary text-white"
              onClick={() => navigate("/app/upgrade")}
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver planes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>7 días de garantía</span>
          </div>
          <div className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cancelá cuando quieras</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
