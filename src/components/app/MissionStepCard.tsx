import { useState } from "react";
import { Check, HelpCircle, ChevronDown, ChevronUp, Clock, TrendingUp, Sparkles, Zap, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Step {
  text: string;
  done: boolean;
  howTo?: string[];
  why?: string;
  timeEstimate?: string;
  metric?: string;
  confidence?: "high" | "medium" | "low";
}

interface MissionStepCardProps {
  step: Step;
  stepIndex: number;
  missionId: string;
  isCurrentStep: boolean;
  onToggle: (missionId: string, stepIndex: number) => void;
  onRequestHelp?: (stepIndex: number, helpType: "easier" | "alternative" | "skip") => void;
}

export const MissionStepCard = ({
  step,
  stepIndex,
  missionId,
  isCurrentStep,
  onToggle,
  onRequestHelp
}: MissionStepCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  const handleToggle = () => {
    onToggle(missionId, stepIndex);
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHelpDialogOpen(true);
  };

  const handleHelpOption = (type: "easier" | "alternative" | "skip") => {
    onRequestHelp?.(stepIndex, type);
    setHelpDialogOpen(false);
  };

  // Default values for demo - in production these would come from AI
  const howTo = step.howTo || [
    "Revisa el estado actual de este aspecto en tu negocio",
    "Implementa el cambio de forma gradual"
  ];
  const why = step.why || "Este paso está basado en patrones observados en negocios similares al tuyo.";
  const timeEstimate = step.timeEstimate || "15-30 min";
  const metric = step.metric || "Mejora en satisfacción del cliente";
  const confidence = step.confidence || "medium";

  const confidenceLabels = {
    high: { label: "Alta", color: "text-success", bg: "bg-success/10" },
    medium: { label: "Media", color: "text-warning", bg: "bg-warning/10" },
    low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted" }
  };

  return (
    <>
      <div 
        className={cn(
          "group rounded-xl border transition-all",
          step.done 
            ? "bg-success/5 border-success/20" 
            : isCurrentStep 
              ? "bg-primary/5 border-primary/30 shadow-sm" 
              : "bg-card border-border hover:border-primary/20"
        )}
      >
        {/* Main Row */}
        <div className="flex items-center gap-3 p-4">
          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0",
              step.done
                ? "bg-success text-white"
                : isCurrentStep
                  ? "bg-primary/20 text-primary hover:bg-primary hover:text-white"
                  : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
            )}
          >
            {step.done ? (
              <Check className="w-4 h-4" />
            ) : (
              <span className="text-sm font-medium">{stepIndex + 1}</span>
            )}
          </button>

          {/* Step Text */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 text-left min-w-0"
          >
            <p className={cn(
              "font-medium transition-colors",
              step.done ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {step.text}
            </p>
            {isCurrentStep && !step.done && (
              <p className="text-xs text-primary mt-1">
                ← Tu siguiente paso
              </p>
            )}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!step.done && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpClick}
                className="text-muted-foreground hover:text-primary"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Ayuda</span>
              </Button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-0">
            <div className="pt-4 space-y-4">
              {/* How To */}
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Cómo hacerlo
                </h5>
                <ul className="space-y-1.5">
                  {howTo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why */}
              <div>
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Por qué
                </h5>
                <p className="text-sm text-foreground">{why}</p>
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  {timeEstimate}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {metric}
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full",
                  confidenceLabels[confidence].bg,
                  confidenceLabels[confidence].color
                )}>
                  Confianza: {confidenceLabels[confidence].label}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              ¿Cómo te ayudo?
            </DialogTitle>
            <DialogDescription>
              Elegí una opción para adaptar este paso a tu situación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <button
              onClick={() => handleHelpOption("easier")}
              className="w-full p-4 rounded-xl border-2 border-success/30 bg-success/5 hover:bg-success/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Hacelo más fácil</p>
                  <p className="text-sm text-muted-foreground">Versión de 15 min, 1-2 acciones</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleHelpOption("alternative")}
              className="w-full p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Dame otra forma</p>
                  <p className="text-sm text-muted-foreground">2 alternativas: rápida vs completa</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleHelpOption("skip")}
              className="w-full p-4 rounded-xl border-2 border-muted/50 bg-muted/5 hover:bg-muted/10 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No aplica para mi negocio</p>
                  <p className="text-sm text-muted-foreground">Se remueve sin penalizar progreso</p>
                </div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
