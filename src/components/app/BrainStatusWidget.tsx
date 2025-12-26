import { Brain, Target, Sparkles, Zap, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrain } from "@/hooks/use-brain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BrainStatusWidgetProps {
  variant?: "compact" | "full" | "minimal";
  showFocus?: boolean;
  onOpenSettings?: () => void;
  className?: string;
}

const FOCUS_ICONS: Record<string, string> = {
  ventas: "💰",
  marketing: "📱",
  reputacion: "⭐",
  eficiencia: "⚡",
  equipo: "👥",
  producto: "📦",
  costos: "📊",
  expansion: "🚀",
};

export const BrainStatusWidget = ({ 
  variant = "full", 
  showFocus = true,
  onOpenSettings,
  className 
}: BrainStatusWidgetProps) => {
  const { brain, loading, focusLabel, canGenerateSpecific } = useBrain();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={cn("animate-pulse rounded-xl bg-card border border-border p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!brain) {
    return null; // Don't show anything if no brain
  }

  const focusIcon = brain.current_focus ? FOCUS_ICONS[brain.current_focus] || "🎯" : "🎯";

  // Minimal variant - just focus badge
  if (variant === "minimal") {
    return (
      <button 
        onClick={() => navigate("/app/more")}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
          "bg-card border border-border hover:border-primary/30",
          className
        )}
      >
        <Rocket className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium capitalize">{brain.current_focus}</span>
      </button>
    );
  }

  // Compact variant - focus only
  if (variant === "compact") {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card p-3",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{focusIcon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              Foco actual
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                {focusIcon} {brain.current_focus}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {canGenerateSpecific 
                ? "Recomendaciones personalizadas activas" 
                : "Contame más para personalizar mejor"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn(
      "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              Tu asistente de negocio
            </h3>
            <p className="text-xs text-muted-foreground">
              {canGenerateSpecific 
                ? "Conoce tu negocio y da consejos personalizados" 
                : "Necesita conocerte mejor"}
            </p>
          </div>
        </div>
      </div>

      {/* Current Focus */}
      {showFocus && (
        <div className="bg-card rounded-lg p-4 border border-border mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Quiero potenciar</p>
              <p className="text-lg font-bold text-foreground flex items-center gap-2 capitalize">
                <span>{focusIcon}</span>
                {brain.current_focus}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/more")}>
              Cambiar
            </Button>
          </div>
        </div>
      )}

      {/* Personalization indicator */}
      {canGenerateSpecific && (
        <div className="flex items-center gap-2 text-xs text-success">
          <Sparkles className="w-4 h-4" />
          <span>Recomendaciones personalizadas activas</span>
        </div>
      )}

      {/* Call to action if not specific enough */}
      {!canGenerateSpecific && (
        <Button 
          variant="outline" 
          className="w-full mt-2 border-dashed border-primary/30"
          onClick={() => navigate("/app/chat")}
        >
          <Target className="w-4 h-4 mr-2" />
          Contarme más sobre tu negocio
        </Button>
      )}
    </div>
  );
};

export default BrainStatusWidget;