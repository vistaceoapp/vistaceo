import { useState, useRef } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  Lightbulb,
  RotateCcw,
  Star,
  Target,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface Step {
  text: string;
  done: boolean;
  howTo?: string[];
  why?: string;
  timeEstimate?: string;
  estimatedMinutes?: number;
  metric?: string;
  confidence?: "high" | "medium" | "low";
  resources?: string[];
  tips?: string[];
  example?: string;
  checklist?: string[];
  definitionOfDone?: string;
}

interface EnhancedPlan {
  steps: Step[];
}

interface MissionStepsViewProps {
  missionId: string;
  steps: Step[];
  enhancedPlan: EnhancedPlan | null;
  onToggleStep: (missionId: string, stepIndex: number) => void;
  selectedStepIdx?: number | null;
  onSelectStep?: (idx: number | null) => void;
}

export const MissionStepsView = ({
  missionId,
  steps,
  enhancedPlan,
  onToggleStep,
  selectedStepIdx,
  onSelectStep,
}: MissionStepsViewProps) => {
  // Use controlled step index if provided, otherwise internal state
  const [internalExpandedStep, setInternalExpandedStep] = useState<number | null>(() => {
    const firstIncomplete = steps.findIndex((s) => !s.done);
    return firstIncomplete >= 0 ? firstIncomplete : null;
  });
  
  const expandedStep = selectedStepIdx !== undefined ? selectedStepIdx : internalExpandedStep;
  const setExpandedStep = (idx: number | null) => {
    if (onSelectStep && selectedStepIdx !== undefined) {
      onSelectStep(idx);
    } else {
      setInternalExpandedStep(idx);
    }
  };
  
  const [undoStepIndex, setUndoStepIndex] = useState<number | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStepIndex = steps.findIndex((s) => !s.done);
  const canGoPrevStep = expandedStep !== null && expandedStep > 0;
  const canGoNextStep = expandedStep !== null && expandedStep < steps.length - 1;

  const goPrevStep = () => {
    if (!canGoPrevStep || expandedStep === null) return;
    setExpandedStep(expandedStep - 1);
  };

  const goNextStep = () => {
    if (!canGoNextStep || expandedStep === null) return;
    setExpandedStep(expandedStep + 1);
  };

  const handleToggleStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    onToggleStep(missionId, stepIndex);

    if (!step.done) {
      // Step was marked as done - show undo snackbar
      setUndoStepIndex(stepIndex);

      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }

      undoTimerRef.current = setTimeout(() => {
        setUndoStepIndex(null);
      }, 5000);

      toast({
        title: "✓ Paso completado",
        description: `"${step.text.slice(0, 40)}${step.text.length > 40 ? "..." : ""}"`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleStep(missionId, stepIndex);
              setUndoStepIndex(null);
              if (undoTimerRef.current) {
                clearTimeout(undoTimerRef.current);
              }
            }}
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Deshacer
          </Button>
        ),
      });
    }
  };

  const activeStep = expandedStep !== null ? steps[expandedStep] : null;
  const stepData =
    expandedStep !== null && enhancedPlan?.steps?.[expandedStep]
      ? enhancedPlan.steps[expandedStep]
      : activeStep;

  return (
    <div className="space-y-6">
      {/* Active step detail (expandido) */}
      {activeStep && stepData && (
        <section className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{(expandedStep ?? 0) + 1}</span>
              </div>
              <span className="text-base">Qué vas a hacer</span>
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={goPrevStep} disabled={!canGoPrevStep} className="h-9 w-9">
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goNextStep} disabled={!canGoNextStep} className="h-9 w-9">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Qué vas a hacer (1 línea) */}
          <p className={cn("text-base font-medium text-foreground", activeStep.done && "line-through text-muted-foreground")}>
            {activeStep.text}
          </p>

          {/* Cómo hacerlo (subpasos) */}
          {stepData.howTo && stepData.howTo.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-primary uppercase mb-3 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Cómo hacerlo
              </h5>
              <ol className="space-y-2.5">
                {stepData.howTo.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Ejemplo aplicado a TU negocio */}
          {stepData.example && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h5 className="text-xs font-semibold text-accent uppercase mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" />
                Ejemplo para tu negocio
              </h5>
              <p className="text-sm text-foreground italic">"{stepData.example}"</p>
            </div>
          )}

          {/* Por qué este paso */}
          {stepData.why && (
            <div className="bg-secondary/30 rounded-lg p-3">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">¿Por qué?</h5>
              <p className="text-sm text-foreground">{stepData.why}</p>
            </div>
          )}

          {/* Tips */}
          {stepData.tips && stepData.tips.length > 0 && (
            <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
              <h5 className="text-xs font-semibold text-warning uppercase mb-2 flex items-center gap-1">
                <Star className="w-3.5 h-3.5" />
                Tips
              </h5>
              <ul className="space-y-1.5">
                {stepData.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <Star className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist micro */}
          {stepData.checklist && stepData.checklist.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <h5 className="text-xs font-semibold text-foreground uppercase mb-3 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Checklist
              </h5>
              <ul className="space-y-2">
                {stepData.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-4 h-4 rounded border border-muted-foreground/30 flex items-center justify-center">
                      {/* Could be interactive */}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Time estimate + metric */}
          <div className="flex flex-wrap gap-2 pt-2">
            {stepData.timeEstimate && (
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {stepData.timeEstimate}
              </Badge>
            )}
            {stepData.metric && (
              <Badge variant="secondary" className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1" />
                {stepData.metric}
              </Badge>
            )}
          </div>

          {/* Hecho cuando... */}
          {stepData.definitionOfDone && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-3">
              <span className="text-xs font-semibold text-success uppercase">Hecho cuando:</span>
              <p className="text-sm text-foreground mt-1">{stepData.definitionOfDone}</p>
            </div>
          )}

          {/* CTA: Mark done / Undo */}
          <div className="pt-2">
            {!activeStep.done ? (
              <Button onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-12" size="lg">
                <Check className="w-5 h-5 mr-2" />
                Listo, ya lo hice
              </Button>
            ) : (
              <Button variant="outline" onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-12" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer paso
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Steps timeline */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Todos los pasos</h4>
        {steps.map((step, idx) => {
          const isCurrentStep = idx === currentStepIndex;
          const isExpanded = expandedStep === idx;

          return (
            <div key={idx} className="group">
              <button
                onClick={() => setExpandedStep(idx)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all",
                  step.done
                    ? "bg-success/5 border-success/20"
                    : isCurrentStep
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card border-border hover:border-primary/20",
                  isExpanded && "ring-2 ring-primary/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStep(idx);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all",
                      step.done
                        ? "bg-success text-success-foreground hover:bg-success/80"
                        : isCurrentStep
                          ? "bg-primary text-primary-foreground hover:bg-primary/80"
                          : "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium line-clamp-2", step.done && "line-through text-muted-foreground")}>
                      {step.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isCurrentStep && !step.done && <span className="text-xs text-primary font-medium">Siguiente</span>}
                      {step.timeEstimate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.timeEstimate}
                        </span>
                      )}
                    </div>
                  </div>
                  {step.done && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStep(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Deshacer</span>
                    </button>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
