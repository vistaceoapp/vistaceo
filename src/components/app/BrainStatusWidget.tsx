import { Brain, TrendingUp, Target, Sparkles, AlertCircle, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrain } from "@/hooks/use-brain";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BrainStatusWidgetProps {
  variant?: "compact" | "full" | "minimal";
  showFocus?: boolean;
  showConfidence?: boolean;
  showMVC?: boolean;
  onOpenSettings?: () => void;
  className?: string;
}

const CONFIDENCE_CONFIG = {
  low: { label: "Aprendiendo", color: "text-muted-foreground", bg: "bg-muted", icon: "🌱" },
  medium: { label: "Conociendo", color: "text-warning", bg: "bg-warning/10", icon: "📊" },
  high: { label: "Experto", color: "text-success", bg: "bg-success/10", icon: "🧠" },
};

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
  showConfidence = true,
  showMVC = true,
  onOpenSettings,
  className 
}: BrainStatusWidgetProps) => {
  const { brain, loading, confidenceLevel, focusLabel, canGenerateSpecific, dataGaps } = useBrain();

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
    return (
      <div className={cn(
        "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">BusinessBrain inactivo</p>
            <p className="text-xs text-muted-foreground">Responde preguntas para activarlo</p>
          </div>
        </div>
      </div>
    );
  }

  const confidence = CONFIDENCE_CONFIG[confidenceLevel];
  const focusIcon = brain.current_focus ? FOCUS_ICONS[brain.current_focus] || "🎯" : "🎯";
  const mvcPct = brain.mvc_completion_pct;
  const gapsCount = dataGaps.length;

  // Minimal variant - just icon + badge
  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
              "bg-card border border-border hover:border-primary/30",
              className
            )}>
              <Brain className={cn("w-4 h-4", confidence.color)} />
              <span className="text-xs font-medium">{mvcPct}%</span>
              {gapsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-warning text-[10px] flex items-center justify-center text-warning-foreground font-bold">
                  {gapsCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">BusinessBrain: {confidence.label}</p>
              <p className="text-xs text-muted-foreground">MVC: {mvcPct}% completo</p>
              <p className="text-xs text-muted-foreground">Foco: {focusLabel}</p>
              {gapsCount > 0 && (
                <p className="text-xs text-warning">{gapsCount} datos pendientes</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn(
        "rounded-xl border border-border bg-card p-3",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            confidence.bg
          )}>
            <span className="text-lg">{confidence.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium", confidence.color)}>
                {confidence.label}
              </span>
              {showFocus && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {focusIcon} {brain.current_focus}
                </Badge>
              )}
            </div>
            
            {showMVC && (
              <div className="flex items-center gap-2 mt-1">
                <Progress value={mvcPct} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground">{mvcPct}%</span>
              </div>
            )}
          </div>
          
          {gapsCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {gapsCount} gaps
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn(
      "rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full animate-pulse" />
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center relative shadow-lg shadow-primary/20">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              BusinessBrain
              <Badge variant="outline" className={cn("text-[10px]", confidence.color, confidence.bg)}>
                {confidence.icon} {confidence.label}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {brain.total_signals} señales procesadas
            </p>
          </div>
        </div>
        
        {onOpenSettings && (
          <Button variant="ghost" size="sm" onClick={onOpenSettings}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* MVC Completion */}
        {showMVC && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">MVC</span>
            </div>
            <div className="text-xl font-bold text-foreground">{mvcPct}%</div>
            <Progress value={mvcPct} className="h-1 mt-1" />
          </div>
        )}
        
        {/* Current Focus */}
        {showFocus && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Foco</span>
            </div>
            <div className="text-lg font-bold text-foreground flex items-center gap-1">
              <span>{focusIcon}</span>
              <span className="capitalize text-sm">{brain.current_focus}</span>
            </div>
          </div>
        )}
        
        {/* Confidence */}
        {showConfidence && (
          <div className="bg-card rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Confianza</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {Math.round((brain.confidence_score || 0) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Data Gaps Warning */}
      {gapsCount > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {gapsCount} datos pendientes
            </p>
            <p className="text-xs text-muted-foreground">
              Completa tu perfil para mejores recomendaciones
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-warning/30 text-warning hover:bg-warning/10">
            Completar
          </Button>
        </div>
      )}

      {/* Personalization indicator */}
      {canGenerateSpecific && (
        <div className="mt-3 flex items-center gap-2 text-xs text-success">
          <Sparkles className="w-4 h-4" />
          <span>Recomendaciones personalizadas activas</span>
        </div>
      )}
    </div>
  );
};

export default BrainStatusWidget;
