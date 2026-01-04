import { useEffect, useState } from "react";
import { Brain, Sparkles, Target, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MissionLoadingStateProps {
  businessName?: string;
  city?: string;
  currentFocus?: string;
  missionTitle?: string;
  className?: string;
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
}: MissionLoadingStateProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Build personalized suffix
  const getPersonalizedSuffix = () => {
    if (businessName && city) return ` en ${businessName}, ${city}`;
    if (businessName) return ` para ${businessName}`;
    if (city) return ` en ${city}`;
    if (currentFocus) return ` para tu foco: ${currentFocus}`;
    return "...";
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {/* Animated brain pulse */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-2xl bg-primary/40 rounded-full animate-pulse" />
        <div className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Brain className="w-10 h-10 text-primary-foreground animate-pulse" />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-primary" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
      </div>

      {/* Mission title if available */}
      {missionTitle && (
        <h3 className="text-lg font-semibold text-foreground mb-2 text-center line-clamp-2 max-w-md">
          {missionTitle}
        </h3>
      )}

      {/* Rotating message */}
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

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-loading-bar" />
      </div>

      {/* Skeleton preview */}
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

// Add CSS animation for loading bar
const style = document.createElement("style");
style.textContent = `
  @keyframes loading-bar {
    0% { transform: translateX(-100%); width: 30%; }
    50% { transform: translateX(100%); width: 60%; }
    100% { transform: translateX(300%); width: 30%; }
  }
  .animate-loading-bar {
    animation: loading-bar 1.5s ease-in-out infinite;
  }
`;
if (typeof document !== "undefined" && !document.getElementById("mission-loading-style")) {
  style.id = "mission-loading-style";
  document.head.appendChild(style);
}
