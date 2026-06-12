import { useEffect, useState } from "react";
import { Brain, Sparkles, Target, TrendingUp, Zap, BarChart3, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useStuckLoadingDetector } from "@/hooks/use-stuck-loading-detector";

interface MissionLoadingStateProps {
  businessName?: string;
  city?: string;
  currentFocus?: string;
  missionTitle?: string;
  className?: string;
  missionId?: string;
  businessId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

const LOADING_MESSAGES = [
  { text: "Analizando señales reales de tu operación", icon: TrendingUp },
  { text: "Priorizando pasos con mejor impacto", icon: Target },
  { text: "Generando ejemplos listos para usar", icon: Sparkles },
  { text: "Calculando probabilidad de éxito", icon: BarChart3 },
  { text: "Evaluando esfuerzo y tiempo estimado", icon: Zap },
  { text: "Preparando plan personalizado", icon: Brain },
];

export const MissionLoadingState = ({
  businessName,
  city,
  currentFocus,
  missionTitle,
  className,
  missionId,
  businessId,
  onRetry,
  onBack,
}: MissionLoadingStateProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sensor: si el plan tarda > 25s, reportamos incidente a /admin/salud
  // y mostramos una salida al usuario en lugar de skeletons eternos.
  const { isStuck } = useStuckLoadingDetector({
    loading: true,
    scope: "mission_plan",
    wherePath: typeof window !== "undefined" ? window.location.pathname : undefined,
    context: { missionId, businessId, missionTitle },
    stuckAfterSeconds: 25,
    severity: "high",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setIsTransitioning(false);
      }, 200);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];
  const CurrentIcon = currentMessage.icon;

  const getPersonalizedSuffix = () => {
    if (businessName && city) return ` en ${businessName}, ${city}`;
    if (businessName) return ` para ${businessName}`;
    if (city) return ` en ${city}`;
    if (currentFocus) return ` para tu foco: ${currentFocus}`;
    return "...";
  };

  // Si está tildado, mostrar recuperación clara (no skeleton eterno)
  if (isStuck) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
        <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-5">
          <AlertCircle className="w-8 h-8 text-warning" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2 max-w-sm">
          Está tardando más de lo normal en preparar tu plan
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-5">
          Ya avisé al equipo. Mientras tanto podés reintentar o volver a misiones —
          nada se perdió y el plan queda guardado apenas termine.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
          {onBack && (
            <Button onClick={onBack} variant="outline" className="flex-1" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {/* Animated brain pulse */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-2xl bg-primary/40 rounded-full animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Brain className="w-10 h-10 text-primary-foreground animate-pulse" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-primary" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </div>

      {missionTitle && (
        <h3 className="text-lg font-semibold text-foreground mb-2 text-center line-clamp-2 max-w-md">
          {missionTitle}
        </h3>
      )}

      <div className="h-8 flex items-center justify-center mb-6">
        <div
          className={cn(
            "flex items-center gap-2 text-muted-foreground transition-all duration-200",
            isTransitioning ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0"
          )}
        >
          <CurrentIcon className="w-4 h-4 text-primary" />
          <span className="text-sm">
            {currentMessage.text}
            <span className="text-primary font-medium">{getPersonalizedSuffix()}</span>
          </span>
        </div>
      </div>

      <div className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-loading-bar" />
      </div>

      <div className="mt-8 w-full max-w-md space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};
