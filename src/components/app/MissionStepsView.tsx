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
  steps: rawSteps,
  enhancedPlan,
  onToggleStep,
  selectedStepIdx,
  onSelectStep,
}: MissionStepsViewProps) => {
  // Blindaje: pasos generados por IA pueden venir con `title`/`how` en lugar
  // de `text`/`howTo`. Normalizamos para que nunca se rendericen vacíos ni rompan.
  const steps: Step[] = (Array.isArray(rawSteps) ? rawSteps : []).map((s) => {
    const anyStep = s as Step & { title?: unknown; how?: unknown; description?: unknown };
    const text =
      typeof anyStep.text === "string" && anyStep.text.trim()
        ? anyStep.text
        : typeof anyStep.title === "string" && anyStep.title.trim()
          ? anyStep.title
          : typeof anyStep.description === "string" && anyStep.description.trim()
            ? (anyStep.description as string)
            : "Paso de la misión";
    const howTo = Array.isArray(anyStep.howTo)
      ? anyStep.howTo
      : typeof anyStep.how === "string" && anyStep.how.trim()
        ? (anyStep.how as string).split(/\n+/).map((t) => t.trim()).filter(Boolean)
        : undefined;
    return { ...anyStep, text, howTo, done: !!anyStep.done };
  });

  // Use controlled step index if provided, otherwise internal state
  const [internalExpandedStep, setInternalExpandedStep] = useState<number | null>(() => {
    const firstIncomplete = (Array.isArray(rawSteps) ? rawSteps : []).findIndex((s) => !s?.done);
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
        description: `"${(step?.text ?? "").slice(0, 40)}${(step?.text ?? "").length > 40 ? "..." : ""}"`,
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

  const [showMore, setShowMore] = useState(false);
  const hasMoreContext = !!safeWhy || safeTips.length > 0 || safeChecklist.length > 0;

  return (
    <div className="space-y-6">
      {/* Active step detail — simplificado y directo */}
      {activeStep && stepData && (
        <section className="bg-card border border-border rounded-2xl p-5 md:p-8 space-y-6">
          {/* Header minimal: número + navegación */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-primary-foreground">{(expandedStep ?? 0) + 1}</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Paso {(expandedStep ?? 0) + 1} de {steps.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goPrevStep} disabled={!canGoPrevStep} className="h-8 w-8">
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={goNextStep} disabled={!canGoNextStep} className="h-8 w-8">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Acción principal — grande, directa */}
          <p className={cn("text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight", activeStep.done && "line-through text-muted-foreground")}>
            {safeActiveText}
          </p>

          {/* Meta strip: tiempo + métrica + DoD */}
          {(stepData.timeEstimate || stepData.metric || safeDoD) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground border-y border-border/50 py-3">
              {stepData.timeEstimate && (
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{stepData.timeEstimate}</span>
              )}
              {stepData.metric && (
                <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" />{stepData.metric}</span>
              )}
              {safeDoD && (
                <span className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /><span className="text-foreground/80">Listo cuando: {safeDoD}</span></span>
              )}
            </div>
          )}

          {/* Cómo hacerlo — el corazón, siempre visible */}
          {safeHowTo.length > 0 && (
            <ol className="space-y-4">
              {safeHowTo.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-base md:text-lg text-foreground leading-relaxed">
                  <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary mt-0.5">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{item}</span>
                </li>
              ))}
            </ol>
          )}

          {/* Ejemplo copy/paste — resaltado como script */}
          {safeExample && (
            <div className="bg-muted/40 border-l-4 border-primary rounded-r-lg p-4 md:p-5">
              <div className="text-[11px] font-bold text-primary uppercase mb-2 tracking-wide">Copiá y usá esto</div>
              <p className="text-base md:text-lg text-foreground leading-relaxed whitespace-pre-wrap">{safeExample}</p>
            </div>
          )}

          {/* CTA principal */}
          <div>
            {!activeStep.done ? (
              <Button onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-12 text-base font-semibold" size="lg">
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

          {/* Contexto extra — colapsable para no saturar */}
          {hasMoreContext && (
            <div className="pt-2 border-t border-border/50">
              <button
                onClick={() => setShowMore((v) => !v)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showMore ? "Ocultar contexto" : "Ver por qué, tips y checklist"}
              </button>
              {showMore && (
                <div className="mt-4 space-y-4">
                  {safeWhy && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase mb-1.5 tracking-wide">Por qué</div>
                      <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{safeWhy}</p>
                    </div>
                  )}
                  {safeTips.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase mb-1.5 tracking-wide flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> Tips
                      </div>
                      <ul className="space-y-1.5">
                        {safeTips.map((tip, i) => (
                          <li key={i} className="text-sm md:text-base text-foreground/90 leading-relaxed flex gap-2">
                            <span className="text-muted-foreground">•</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {safeChecklist.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase mb-1.5 tracking-wide">Checklist</div>
                      <ul className="space-y-1.5">
                        {safeChecklist.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                            <div className="w-3.5 h-3.5 rounded border border-muted-foreground/40 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
