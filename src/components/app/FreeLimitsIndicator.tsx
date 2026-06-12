import { motion } from "framer-motion";
import { Crown, Zap, Target, Lightbulb, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useFreeLimits, FREE_LIMITS } from "@/hooks/use-free-limits";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface FreeLimitsIndicatorProps {
  type: "missions" | "chat" | "radar" | "research";
  variant?: "compact" | "detailed" | "inline";
  showUpgrade?: boolean;
  className?: string;
}

const typeConfig = {
  missions: {
    label: "Misión",
    limitKey: "missions" as const,
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  chat: {
    label: "Chat IA",
    limitKey: "chatMessages" as const,
    icon: MessageCircle,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  radar: {
    label: "Oportunidades",
    limitKey: "radarOpportunities" as const,
    icon: Zap,
    color: "text-warning",
    bgColor: "bg-warning/10",
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
  const { usage, limits, remaining, percentUsed, isPro } = useFreeLimits();

  const config = typeConfig[type];
  const used = usage[config.limitKey];
  const limit = limits[config.limitKey];
  const left = remaining[config.limitKey];
  const percent = percentUsed[config.limitKey];

  if (isPro) {
    return (
      <Badge variant="secondary" className={cn("bg-primary/10 text-primary border-primary/20", className)}>
        <Crown className="w-3 h-3 mr-1" />
        Alta capacidad
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
        {used}/{limit}
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
        {isAtLimit && " · agotado"}
      </Badge>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl border",
        isAtLimit ? "bg-destructive/5 border-destructive/20" : "bg-secondary/30 border-border",
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
              {isAtLimit ? "Cupo agotado" : `${left} disponibles`}
            </p>
          </div>
        </div>
        <span className={cn("text-lg font-bold", isAtLimit ? "text-destructive" : "text-foreground")}>
          {used}/{limit}
        </span>
      </div>

      <Progress value={percent} className={cn("h-2", isAtLimit && "[&>div]:bg-destructive")} />

      {isAtLimit && showUpgrade && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground"
            onClick={() => navigate("/checkout")}
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear todo con Pro
          </Button>
        </div>
      )}
    </motion.div>
  );
};

interface LimitReachedBannerProps {
  type: "missions" | "chat" | "radar" | "research";
  onUpgrade?: () => void;
}

export const LimitReachedBanner = ({ type, onUpgrade }: LimitReachedBannerProps) => {
  const navigate = useNavigate();
  const config = typeConfig[type];

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    else navigate("/checkout");
  };

  const copy = (() => {
    switch (type) {
      case "chat":
        return "Usaste tus 3 mensajes del chat. En Free el chat queda bloqueado hasta que pases a Pro.";
      case "missions":
        return "El plan Gratis incluye 1 misión inicial perfecta. Pasá a Pro para crear misiones sin límite.";
      case "radar":
      case "research":
        return "Ya consumiste tus oportunidades disponibles. Cada 30 días podés recargar +1, o pasar a Pro para alta capacidad.";
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
    >
      <div className="text-center space-y-5 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Crown className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground mb-1.5">
            Cupo Gratis de {config.label} agotado
          </h3>
          <p className="text-sm text-muted-foreground">{copy}</p>
        </div>

        {/* Jerarquía única: CTA principal grande, recarga sutil debajo, volver como link */}
        <div className="flex flex-col items-center gap-3 pt-1">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20 px-8"
            onClick={handleUpgrade}
          >
            <Crown className="w-4 h-4 mr-2" />
            Desbloquear con Pro
          </Button>

          {(type === "radar" || type === "research") && (
            <MonthlyRefillButton />
          )}

          <button
            onClick={() => navigate("/app")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Botón mensual: agrega +1 oportunidad y +1 I+D cada 30 días al usuario Free.
 */
export const MonthlyRefillButton = ({ className }: { className?: string }) => {
  const { isPro, bonus, requestRefill, refresh } = useFreeLimits();
  const [loading, setLoading] = useState(false);

  if (isPro) return null;

  const handleClick = async () => {
    setLoading(true);
    const r = await requestRefill();
    setLoading(false);
    if (r.success) {
      toast.success(r.message, { description: "Tus nuevos cupos están listos en Radar." });
      await refresh();
    } else {
      toast.info(r.message);
    }
  };

  const next = bonus.nextRefillAt ? new Date(bonus.nextRefillAt) : null;
  const canRefill = bonus.canRefillNow;

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <Button
        variant={canRefill ? "default" : "outline"}
        size="sm"
        disabled={!canRefill || loading}
        onClick={handleClick}
        className={cn(canRefill && "bg-gradient-to-r from-primary to-accent text-white")}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : canRefill ? (
          <Sparkles className="w-4 h-4 mr-2" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-2" />
        )}
        {canRefill ? "Recargar +1 oportunidad y +1 I+D" : "Recarga ya usada este mes"}
      </Button>
      {!canRefill && next && (
        <span className="text-[11px] text-muted-foreground">
          Próxima recarga: {next.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        </span>
      )}
      {canRefill && bonus.bonusOpportunities + bonus.bonusResearch > 0 && (
        <span className="text-[11px] text-muted-foreground">
          Recargas acumuladas: +{bonus.bonusOpportunities} opp · +{bonus.bonusResearch} I+D
        </span>
      )}
    </div>
  );
};

// Keep export for unused imports compatibility
export { FREE_LIMITS };
