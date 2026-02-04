import { motion } from "framer-motion";
import { 
  Crown, 
  Zap, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  Sparkles,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PlanStatusCardProps {
  variant?: "sidebar" | "compact" | "full";
  className?: string;
}

export const PlanStatusCard = ({ 
  variant = "sidebar",
  className 
}: PlanStatusCardProps) => {
  const navigate = useNavigate();
  const { 
    isPro, 
    planId, 
    daysRemaining, 
    isExpiringSoon,
    expiresAt 
  } = useSubscription();

  const handleClick = () => {
    navigate("/checkout");
  };

  // Pro user - show status
  if (isPro) {
    const planLabel = planId === "pro_yearly" ? "Pro Anual" : "Pro Mensual";
    
    if (variant === "compact") {
      return (
        <button
          onClick={handleClick}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
            "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30",
            "text-primary hover:from-primary/30 hover:to-accent/30",
            className
          )}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>{planLabel}</span>
          {daysRemaining !== null && daysRemaining <= 30 && (
            <span className="text-muted-foreground">· {daysRemaining}d</span>
          )}
        </button>
      );
    }

    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "w-full p-3 rounded-xl transition-all duration-200 text-left",
          "bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10",
          "border border-primary/20 hover:border-primary/40",
          "group",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{planLabel}</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-success/20 text-success border-0">
                Activo
              </Badge>
            </div>
            {daysRemaining !== null && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <CalendarDays className="w-3 h-3 text-muted-foreground" />
                <span className={cn(
                  "text-xs",
                  isExpiringSoon ? "text-warning" : "text-muted-foreground"
                )}>
                  {daysRemaining > 0 
                    ? `${daysRemaining} días restantes` 
                    : "Expira hoy"
                  }
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {/* Progress bar for expiration */}
        {daysRemaining !== null && daysRemaining <= 30 && (
          <div className="mt-3">
            <Progress 
              value={Math.max(0, Math.min(100, (daysRemaining / 30) * 100))} 
              className="h-1.5"
            />
          </div>
        )}
      </motion.button>
    );
  }

  // Free user - show upgrade CTA
  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
          "bg-warning/20 border border-warning/30",
          "text-warning hover:bg-warning/30",
          className
        )}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>Upgrade Pro</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full p-3 rounded-xl transition-all duration-200 text-left",
        "bg-card border border-border hover:border-primary/30",
        "group",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">Plan Free</span>
          <p className="text-xs text-muted-foreground">Actualiza a Pro</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </motion.button>
  );
};
