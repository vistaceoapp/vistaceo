import { motion } from "framer-motion";
import { Crown, Zap, Target, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useFreeLimits, FREE_LIMITS } from "@/hooks/use-free-limits";
import { cn } from "@/lib/utils";

interface FreeLimitsIndicatorProps {
  type: "missions" | "radar" | "research";
  variant?: "compact" | "detailed" | "inline";
  showUpgrade?: boolean;
  className?: string;
}

const typeConfig = {
  missions: {
    label: "Misiones",
    limitKey: "missions" as const,
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  radar: {
    label: "Radar Interno",
    limitKey: "radarOpportunities" as const,
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  research: {
    label: "I+D Externo",
    limitKey: "radarResearch" as const,
    icon: Lightbulb,
    color: "text-success",
    bgColor: "bg-success/10",
  },
};

export const FreeLimitsIndicator = ({
  type,
  variant = "compact",
  showUpgrade = true,
  className,
}: FreeLimitsIndicatorProps) => {
  const navigate = useNavigate();
  const { usage, limits, remaining, percentUsed, isPro, isLoading } = useFreeLimits();
  
  const config = typeConfig[type];
  const used = usage[config.limitKey];
  const limit = limits[config.limitKey];
  const left = remaining[config.limitKey];
  const percent = percentUsed[config.limitKey];
  
  // Pro users don't see limits
  if (isPro) {
    return (
      <Badge variant="secondary" className={cn("bg-primary/10 text-primary border-primary/20", className)}>
        <Crown className="w-3 h-3 mr-1" />
        Ilimitado
      </Badge>
    );
  }

  const isNearLimit = left <= 1 && left > 0;
  const isAtLimit = left === 0;

  if (variant === "inline") {
    return (
      <span className={cn(
        "text-xs font-medium",
        isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-muted-foreground",
        className
      )}>
        {used}/{limit} usados
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "gap-1.5",
          isAtLimit 
            ? "bg-destructive/10 text-destructive border-destructive/20" 
            : isNearLimit
            ? "bg-warning/10 text-warning border-warning/20"
            : "bg-secondary text-muted-foreground",
          className
        )}
      >
        <config.icon className="w-3 h-3" />
        {used}/{limit}
        {isAtLimit && " (límite)"}
      </Badge>
    );
  }

  // Detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border",
        isAtLimit 
          ? "bg-destructive/5 border-destructive/20" 
          : "bg-secondary/30 border-border",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
            <config.icon className={cn("w-4 h-4", config.color)} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {isAtLimit 
                ? "Límite alcanzado este mes" 
                : `${left} restantes este mes`
              }
            </p>
          </div>
        </div>
        <span className={cn(
          "text-lg font-bold",
          isAtLimit ? "text-destructive" : "text-foreground"
        )}>
          {used}/{limit}
        </span>
      </div>

      <Progress 
        value={percent} 
        className={cn(
          "h-2",
          isAtLimit && "[&>div]:bg-destructive"
        )} 
      />

      {isAtLimit && showUpgrade && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground"
            onClick={() => navigate("/checkout")}
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear ilimitado con Pro
          </Button>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Banner shown when user hits a limit
 */
interface LimitReachedBannerProps {
  type: "missions" | "radar" | "research";
  onUpgrade?: () => void;
}

export const LimitReachedBanner = ({ type, onUpgrade }: LimitReachedBannerProps) => {
  const navigate = useNavigate();
  const config = typeConfig[type];
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate("/checkout");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Límite de {config.label} alcanzado
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Este mes ya usaste tus {FREE_LIMITS[config.limitKey]} {config.label.toLowerCase()} del plan Free. 
            Desbloqueá ilimitado con Pro.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="bg-primary text-primary-foreground"
            onClick={handleUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear con Pro
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => navigate("/app")}
          >
            Volver al inicio
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Los límites se reinician el 1 de cada mes
        </p>
      </div>
    </motion.div>
  );
};
