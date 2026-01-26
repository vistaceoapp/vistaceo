import { motion } from "framer-motion";
import { 
  Crown, 
  Lock, 
  ArrowRight, 
  Check, 
  Sparkles,
  Shield,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { useCountryDetection } from "@/hooks/use-country-detection";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ProPageGateProps {
  children: ReactNode;
  featureName: string;
  featureDescription: string;
  features?: string[];
  icon?: ReactNode;
}

/**
 * Full-page Pro gate - blocks access to Pro-only pages for Free users
 * Shows a beautiful upgrade CTA instead of the actual content
 */
export const ProPageGate = ({ 
  children,
  featureName,
  featureDescription,
  features = [],
  icon
}: ProPageGateProps) => {
  const navigate = useNavigate();
  const { isPro } = useSubscription();
  const { formatCurrencyShort, monthlyPrice, yearlyPrice } = useCountryDetection();

  // Pro users see the actual content
  if (isPro) {
    return <>{children}</>;
  }

  const monthlyEquivalent = Math.round(yearlyPrice / 12);

  // Free users see the upgrade page
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 bg-primary" />
        </div>

        <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl">
          {/* Lock icon with gradient background */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 flex items-center justify-center mb-6 shadow-lg border border-primary/20"
            >
              {icon || <Lock className="w-10 h-10 text-primary" />}
            </motion.div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              {featureName}
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {featureDescription}
            </p>
          </div>

          {/* Features list */}
          {features.length > 0 && (
            <div className="mb-8 p-4 rounded-xl bg-secondary/30 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Incluido en Pro
              </p>
              <div className="space-y-2.5">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground">
                {formatCurrencyShort(monthlyEquivalent)}
              </span>
              <span className="text-muted-foreground">/mes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              con el plan anual (2 meses gratis)
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full gradient-primary text-white group"
              onClick={() => navigate("/app/upgrade")}
            >
              <Crown className="w-5 h-5 mr-2" />
              Desbloquear con Pro
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/app")}
            >
              Continuar con Free
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-success" />
              <span>7 días de garantía</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>Cancelás cuando quieras</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
