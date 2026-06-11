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
import { useSanitizedContent, useSanitizedList } from "@/hooks/use-sanitized-content";
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
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Sanitización de TODOS los campos visibles generados por IA
  const safeActiveText = useSanitizedContent(activeStep?.text, 'structured') || activeStep?.text || '';
  const safeHowTo = useSanitizedList(stepData?.howTo);
  const safeTips = useSanitizedList(stepData?.tips);
  const safeChecklist = useSanitizedList(stepData?.checklist);
  const safeWhy = useSanitizedContent(stepData?.why, 'prose');
  const safeExample = useSanitizedContent(stepData?.example, 'prose');
  const safeDoD = useSanitizedContent(stepData?.definitionOfDone, 'prose');

  return (
    <div className="space-y-5">
      {/* Active step detail (expandido) */}
      {activeStep && stepData && (
        <section className="bg-card border border-primary/20 rounded-2xl p-5 md:p-10 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-primary-foreground">{(expandedStep ?? 0) + 1}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Paso {(expandedStep ?? 0) + 1} de {steps.length}</span>
                <p className="text-base md:text-lg font-bold text-foreground">Qué vas a hacer</p>
              </div>
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

          {/* Qué vas a hacer */}
          <p className={cn("text-xl md:text-2xl font-semibold text-foreground leading-snug tracking-tight", activeStep.done && "line-through text-muted-foreground")}>
            {safeActiveText}
          </p>

          {/* Cómo hacerlo (subpasos) */}
          {stepData.howTo && stepData.howTo.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-5 md:p-6">
              <h5 className="text-sm font-bold text-primary uppercase mb-4 flex items-center gap-2 tracking-wide">
                <Target className="w-4 h-4" />
                Cómo hacerlo
              </h5>
              <ol className="space-y-5">
                {stepData.howTo.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-base md:text-lg text-foreground leading-relaxed">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary mt-0.5">
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
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
              <h5 className="text-xs font-bold text-accent uppercase mb-2.5 flex items-center gap-1.5 tracking-wide">
                <Lightbulb className="w-4 h-4" />
                Ejemplo para tu negocio
              </h5>
              <p className="text-base md:text-lg text-foreground italic leading-relaxed">"{stepData.example}"</p>
            </div>
          )}

          {/* Por qué este paso */}
          {stepData.why && (
            <div className="bg-secondary/30 rounded-xl p-5">
              <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-wide">¿Por qué?</h5>
              <p className="text-base md:text-lg text-foreground leading-relaxed">{stepData.why}</p>
            </div>
          )}

          {/* Tips */}
          {stepData.tips && stepData.tips.length > 0 && (
            <div className="bg-warning/5 rounded-xl p-5 border border-warning/20">
              <h5 className="text-xs font-bold text-warning uppercase mb-3 flex items-center gap-1.5 tracking-wide">
                <Star className="w-4 h-4" />
                Tips
              </h5>
              <ul className="space-y-3">
                {stepData.tips.map((tip, i) => (
                  <li key={i} className="text-base md:text-lg text-foreground flex items-start gap-2.5 leading-relaxed">
                    <Star className="w-3.5 h-3.5 text-warning mt-1.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist micro */}
          {stepData.checklist && stepData.checklist.length > 0 && (
            <div className="border border-border rounded-xl p-4">
              <h5 className="text-xs font-semibold text-foreground uppercase mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Checklist
              </h5>
              <ul className="space-y-2.5">
                {stepData.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                    <div className="w-4 h-4 rounded border border-muted-foreground/30 flex items-center justify-center flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Time estimate + metric */}
          <div className="flex flex-wrap gap-2 pt-1">
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
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 md:p-5">
              <span className="text-xs font-bold text-success uppercase tracking-wide">Hecho cuando:</span>
              <p className="text-base md:text-lg text-foreground mt-1.5 leading-relaxed">{stepData.definitionOfDone}</p>
            </div>
          )}

          {/* CTA: Mark done / Undo */}
          <div className="pt-1">
            {!activeStep.done ? (
              <Button onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-11 text-sm font-semibold" size="lg">
                <Check className="w-5 h-5 mr-2" />
                Listo, ya lo hice
              </Button>
            ) : (
              <Button variant="outline" onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-11 text-sm" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer paso
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Steps timeline */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Todos los pasos</h4>
        {steps.map((step, idx) => {
          const isCurrentStep = idx === currentStepIndex;
          const isExpanded = expandedStep === idx;

          return (
            <div key={idx} className="group">
              <button
                onClick={() => setExpandedStep(idx)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
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
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all",
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
                    <p className={cn("text-sm font-medium line-clamp-2 leading-snug", step.done && "line-through text-muted-foreground")}>
                      {step.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isCurrentStep && !step.done && <span className="text-[11px] text-primary font-semibold">Siguiente</span>}
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
