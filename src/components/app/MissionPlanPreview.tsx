import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, RefreshCw, X, Plus, Clock, Target, TrendingUp, 
  AlertCircle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp,
  Zap, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanStep {
  text: string;
  done: boolean;
  howTo?: string[];
  why?: string;
  timeEstimate?: string;
  metric?: string;
  confidence?: "high" | "medium" | "low";
  resources?: string[];
  tips?: string[];
}

interface MissionPlan {
  planTitle: string;
  planDescription: string;
  estimatedDuration: string;
  estimatedImpact: string;
  steps: PlanStep[];
  businessSpecificTips?: string[];
  potentialChallenges?: string[];
  successMetrics?: string[];
}

interface MissionPlanPreviewProps {
  plan: MissionPlan;
  missionTitle: string;
  missionArea: string | null;
  isLoading?: boolean;
  onAccept: (steps: PlanStep[]) => void;
  onDismiss: () => void;
  onRegenerate: () => void;
}

export const MissionPlanPreview = ({
  plan,
  missionTitle,
  missionArea,
  isLoading = false,
  onAccept,
  onDismiss,
  onRegenerate,
}: MissionPlanPreviewProps) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  const confidenceLabels = {
    high: { label: "Alta", color: "text-success", bg: "bg-success/10", icon: "✓" },
    medium: { label: "Media", color: "text-warning", bg: "bg-warning/10", icon: "~" },
    low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted", icon: "?" }
  };

  const totalTime = plan.steps?.reduce((acc, step) => {
    const match = step.timeEstimate?.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 15);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Generando plan personalizado...
        </h3>
        <p className="text-sm text-muted-foreground">
          Analizando tu negocio para crear el mejor plan de acción
        </p>
        <div className="mt-4 flex justify-center">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className="mb-2 text-[10px]">
              {missionArea || "General"} • Plan IA
            </Badge>
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {plan.planTitle || missionTitle}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.planDescription}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duración:</span>
            <span className="font-medium text-foreground">{plan.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pasos:</span>
            <span className="font-medium text-foreground">{plan.steps?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="font-medium text-success">{plan.estimatedImpact}</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Plan de Acción Detallado
        </h4>
        
        <ScrollArea className="max-h-[40vh]">
          <div className="space-y-3 pr-2">
            {plan.steps?.map((step, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-xl border transition-all",
                  expandedStep === idx 
                    ? "bg-primary/5 border-primary/30" 
                    : "bg-card border-border hover:border-primary/20"
                )}
              >
                {/* Step header */}
                <button
                  onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-start gap-3"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm",
                    "bg-primary/20 text-primary"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{step.text}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {step.timeEstimate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.timeEstimate}
                        </span>
                      )}
                      {step.confidence && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full",
                          confidenceLabels[step.confidence].bg,
                          confidenceLabels[step.confidence].color
                        )}>
                          Confianza: {confidenceLabels[step.confidence].label}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {expandedStep === idx ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedStep === idx && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4 ml-11">
                    {/* How to */}
                    {step.howTo && step.howTo.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Cómo hacerlo
                        </h5>
                        <ul className="space-y-1.5">
                          {step.howTo.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Why */}
                    {step.why && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          Por qué es importante
                        </h5>
                        <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">
                          {step.why}
                        </p>
                      </div>
                    )}

                    {/* Metric */}
                    {step.metric && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-success" />
                        <span className="text-muted-foreground">Métrica:</span>
                        <span className="text-foreground">{step.metric}</span>
                      </div>
                    )}

                    {/* Tips */}
                    {step.tips && step.tips.length > 0 && (
                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-warning mb-1">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-xs font-semibold">Tip para tu negocio</span>
                        </div>
                        <p className="text-sm text-foreground">{step.tips[0]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Business tips */}
      {plan.businessSpecificTips && plan.businessSpecificTips.length > 0 && (
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Tips personalizados para tu negocio
          </h4>
          <ul className="space-y-1">
            {plan.businessSpecificTips.slice(0, 3).map((tip, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Challenges */}
      {plan.potentialChallenges && plan.potentialChallenges.length > 0 && (
        <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
          <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Posibles desafíos
          </h4>
          <ul className="space-y-1">
            {plan.potentialChallenges.slice(0, 2).map((challenge, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-destructive">•</span>
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={onDismiss}
        >
          <X className="w-4 h-4 mr-2" />
          No me interesa
        </Button>
        
        <Button
          variant="outline"
          className="flex-1"
          onClick={onRegenerate}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Otro plan
        </Button>
        
        <Button
          className="flex-1 gradient-primary"
          onClick={() => onAccept(plan.steps)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar a Misión
        </Button>
      </div>
    </div>
  );
};
