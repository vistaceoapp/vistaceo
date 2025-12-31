import { useState, useEffect } from "react";
import { 
  Target, Clock, TrendingUp, Sparkles, AlertTriangle, Lightbulb, 
  CheckCircle2, BarChart3, Zap, Trophy, Calendar, Users, ArrowRight,
  RefreshCw, BookOpen, Flag, Star, Shield, Play, Pause, ChevronDown,
  ChevronUp, Check, HelpCircle, Rocket, Gift, Timer, Brain, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Step {
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

interface Mission {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  steps: unknown;
  current_step: number;
  status: string;
  impact_score: number;
  effort_score: number;
  created_at: string;
}

interface EnhancedPlan {
  planTitle: string;
  planDescription: string;
  estimatedDuration: string;
  estimatedImpact: string;
  confidence: "high" | "medium" | "low";
  basedOn: string[];
  steps: Step[];
  businessSpecificTips: string[];
  potentialChallenges: string[];
  successMetrics: string[];
  dataGapsIdentified: string[];
  quickWins?: string[];
  weeklyMilestones?: { week: number; milestone: string; metric?: string }[];
  teamInvolvement?: string[];
  estimatedROI?: string;
  dependencies?: string[];
  riskLevel?: "low" | "medium" | "high";
}

interface MissionDetailEnhancedProps {
  mission: Mission;
  businessId: string;
  onToggleStep: (missionId: string, stepIndex: number) => void;
  onToggleStatus: (mission: Mission) => void;
  onClose: () => void;
}

const AREA_ICONS: Record<string, string> = {
  "Reputación": "⭐",
  "Marketing": "📱",
  "Operaciones": "⚙️",
  "Ventas": "💰",
  "Equipo": "👥",
  "Producto": "📦",
  "Finanzas": "📊",
};

const confidenceConfig = {
  high: { label: "Alta", color: "text-success", bg: "bg-success/10", icon: Shield },
  medium: { label: "Media", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted", icon: HelpCircle },
};

const riskConfig = {
  low: { label: "Bajo", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Moderado", color: "text-warning", bg: "bg-warning/10" },
  high: { label: "Alto", color: "text-destructive", bg: "bg-destructive/10" },
};

export const MissionDetailEnhanced = ({
  mission,
  businessId,
  onToggleStep,
  onToggleStatus,
  onClose,
}: MissionDetailEnhancedProps) => {
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = (mission.steps || []) as Step[];
  const completedSteps = steps.filter(s => s.done).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  const currentStepIndex = steps.findIndex(s => !s.done);

  // Fetch enhanced plan from AI
  const fetchEnhancedPlan = async (regenerate = false) => {
    if (regenerate) {
      setRegenerating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-mission-plan", {
        body: {
          businessId,
          missionTitle: mission.title,
          missionDescription: mission.description,
          missionArea: mission.area,
          existingSteps: steps,
          enhanceExisting: true,
          regenerate,
        }
      });

      if (fnError) throw fnError;

      if (data?.plan) {
        setEnhancedPlan(data.plan);
      }
    } catch (err) {
      console.error("Error fetching enhanced plan:", err);
      setError("No se pudo cargar información adicional");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchEnhancedPlan();
  }, [mission.id]);

  const areaIcon = AREA_ICONS[mission.area || ""] || "🎯";

  // Calculate estimated time remaining
  const remainingSteps = steps.filter(s => !s.done);
  const estimatedTimeRemaining = remainingSteps.reduce((acc, step) => {
    const time = step.timeEstimate || "30 min";
    const minutes = parseInt(time) || 30;
    return acc + minutes;
  }, 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] md:max-h-[85vh]">
      {/* Header Section - More compact on mobile */}
      <div className="p-4 md:p-6 pb-3 md:pb-4 border-b border-border/50 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl gradient-primary flex items-center justify-center text-lg md:text-2xl shadow-lg shadow-primary/20 flex-shrink-0">
              {areaIcon}
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-bold text-foreground line-clamp-2">{mission.title}</h2>
              <div className="flex items-center gap-1.5 md:gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2">
                  {mission.area || "General"}
                </Badge>
                <Badge 
                  variant={mission.status === "active" ? "default" : "secondary"}
                  className="text-[10px] md:text-xs px-1.5 md:px-2"
                >
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
                {enhancedPlan?.confidence && (
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] md:text-xs gap-0.5 px-1.5 md:px-2", confidenceConfig[enhancedPlan.confidence].color)}
                  >
                    {(() => {
                      const IconComp = confidenceConfig[enhancedPlan.confidence].icon;
                      return <IconComp className="w-2.5 h-2.5 md:w-3 md:h-3" />;
                    })()}
                    {confidenceConfig[enhancedPlan.confidence].label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchEnhancedPlan(true)}
              disabled={regenerating}
              className="text-muted-foreground h-8 w-8 md:h-9 md:w-auto p-0 md:px-3"
            >
              <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
            </Button>
            <Button
              variant={mission.status === "active" ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleStatus(mission)}
              className="h-8 md:h-9 text-xs md:text-sm px-2 md:px-3"
            >
              {mission.status === "active" ? (
                <>
                  <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-1" />
                  <span className="hidden md:inline">Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 md:mr-1" />
                  <span className="hidden md:inline">Reactivar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar - Compact */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-muted-foreground">
              {completedSteps}/{steps.length} pasos
            </span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 md:h-2" />
        </div>

        {/* Quick Stats - Grid adapts to screen */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4">
          <div className="bg-background/50 rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center text-primary mb-0.5 md:mb-1">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <p className="text-sm md:text-lg font-bold text-foreground">{mission.impact_score}/10</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Impacto</p>
          </div>
          <div className="bg-background/50 rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center text-warning mb-0.5 md:mb-1">
              <Zap className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <p className="text-sm md:text-lg font-bold text-foreground">{mission.effort_score}/10</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Esfuerzo</p>
          </div>
          <div className="bg-background/50 rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center text-success mb-0.5 md:mb-1">
              <Timer className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <p className="text-sm md:text-lg font-bold text-foreground">{formatTime(estimatedTimeRemaining)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Restante</p>
          </div>
          <div className="bg-background/50 rounded-lg md:rounded-xl p-2 md:p-3 text-center">
            <div className="flex items-center justify-center text-info mb-0.5 md:mb-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            </div>
            <p className="text-sm md:text-lg font-bold text-foreground">
              {enhancedPlan?.estimatedDuration || "~1 sem"}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">Duración</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          
          {/* AI Enhanced Description */}
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : enhancedPlan ? (
            <>
              {/* Plan Summary */}
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {enhancedPlan.planTitle || mission.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {enhancedPlan.planDescription || mission.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expected Impact */}
              {enhancedPlan.estimatedImpact && (
                <div className="bg-success/5 border border-success/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-success" />
                    <h4 className="font-semibold text-foreground">Resultado Esperado</h4>
                  </div>
                  <p className="text-sm text-foreground">{enhancedPlan.estimatedImpact}</p>
                  {enhancedPlan.estimatedROI && (
                    <p className="text-xs text-success mt-2 font-medium">
                      ROI estimado: {enhancedPlan.estimatedROI}
                    </p>
                  )}
                </div>
              )}

              {/* Based On - What data was used */}
              {enhancedPlan.basedOn && enhancedPlan.basedOn.length > 0 && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Basado en datos de tu negocio
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {enhancedPlan.basedOn.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {enhancedPlan.quickWins && enhancedPlan.quickWins.length > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-warning" />
                    <h4 className="font-semibold text-foreground">Quick Wins - Resultados Rápidos</h4>
                  </div>
                  <ul className="space-y-2">
                    {enhancedPlan.quickWins.map((win, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <Gift className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        {win}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : error ? (
            <div className="text-center py-6">
              <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-2" />
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchEnhancedPlan()} 
                className="mt-3"
              >
                Reintentar
              </Button>
            </div>
          ) : null}

          <Separator />

          {/* Steps Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Pasos de la Misión
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedSteps} de {steps.length} completados
              </span>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => {
                const isCurrentStep = idx === currentStepIndex;
                const isExpanded = expandedStep === idx;
                const stepData = enhancedPlan?.steps?.[idx] || step;
                const confidence = stepData.confidence || "medium";

                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-xl border transition-all",
                      step.done
                        ? "bg-success/5 border-success/20"
                        : isCurrentStep
                          ? "bg-primary/5 border-primary/30 shadow-md ring-2 ring-primary/20"
                          : "bg-card border-border hover:border-primary/20"
                    )}
                  >
                    {/* Step Header */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => onToggleStep(mission.id, idx)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                          step.done
                            ? "bg-success text-white"
                            : isCurrentStep
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        )}
                      >
                        {step.done ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{idx + 1}</span>
                        )}
                      </button>

                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : idx)}
                        className="flex-1 text-left min-w-0"
                      >
                        <p className={cn(
                          "font-medium transition-colors",
                          step.done ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {step.text}
                        </p>
                        {isCurrentStep && !step.done && (
                          <div className="flex items-center gap-2 mt-1">
                            <Rocket className="w-3 h-3 text-primary" />
                            <span className="text-xs text-primary font-medium">Tu siguiente paso</span>
                          </div>
                        )}
                        {!isExpanded && stepData.timeEstimate && (
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {stepData.timeEstimate}
                            </span>
                            {stepData.metric && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {stepData.metric}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setExpandedStep(isExpanded ? null : idx)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/50 space-y-4 pt-4">
                        {/* How To */}
                        {stepData.howTo && stepData.howTo.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-primary uppercase mb-2 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Cómo hacerlo
                            </h5>
                            <ul className="space-y-2">
                              {stepData.howTo.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Why */}
                        {stepData.why && (
                          <div className="bg-muted/30 rounded-lg p-3">
                            <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                              ¿Por qué?
                            </h5>
                            <p className="text-sm text-foreground">{stepData.why}</p>
                          </div>
                        )}

                        {/* Tips */}
                        {stepData.tips && stepData.tips.length > 0 && (
                          <div className="bg-warning/5 rounded-lg p-3 border border-warning/20">
                            <h5 className="text-xs font-semibold text-warning uppercase mb-2 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3" />
                              Tips para este paso
                            </h5>
                            <ul className="space-y-1">
                              {stepData.tips.map((tip: string, i: number) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <Star className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Resources */}
                        {stepData.resources && stepData.resources.length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                              Recursos necesarios
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {stepData.resources.map((res: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {res}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Meta Row */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          {stepData.timeEstimate && (
                            <div className="flex items-center gap-1.5 text-xs bg-background rounded-full px-3 py-1">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              {stepData.timeEstimate}
                            </div>
                          )}
                          {stepData.metric && (
                            <div className="flex items-center gap-1.5 text-xs bg-background rounded-full px-3 py-1">
                              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                              {stepData.metric}
                            </div>
                          )}
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs rounded-full px-3 py-1",
                            confidenceConfig[confidence].bg,
                            confidenceConfig[confidence].color
                          )}>
                            {(() => {
                              const ConfIcon = confidenceConfig[confidence].icon;
                              return <ConfIcon className="w-3 h-3" />;
                            })()}
                            Confianza: {confidenceConfig[confidence].label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Sections from Enhanced Plan */}
          {enhancedPlan && !loading && (
            <>
              <Separator />

              <Accordion type="multiple" className="space-y-2">
                {/* Weekly Milestones */}
                {enhancedPlan.weeklyMilestones && enhancedPlan.weeklyMilestones.length > 0 && (
                  <AccordionItem value="milestones" className="border rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Hitos Semanales</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {enhancedPlan.weeklyMilestones.map((milestone, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-primary">{milestone.week}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{milestone.milestone}</p>
                              {milestone.metric && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📊 {milestone.metric}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Success Metrics */}
                {enhancedPlan.successMetrics && enhancedPlan.successMetrics.length > 0 && (
                  <AccordionItem value="metrics" className="border rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-success" />
                        <span className="font-semibold">Métricas de Éxito</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {enhancedPlan.successMetrics.map((metric, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Tips */}
                {enhancedPlan.businessSpecificTips && enhancedPlan.businessSpecificTips.length > 0 && (
                  <AccordionItem value="tips" className="border rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-warning" />
                        <span className="font-semibold">Tips Personalizados</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {enhancedPlan.businessSpecificTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <Sparkles className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Challenges */}
                {enhancedPlan.potentialChallenges && enhancedPlan.potentialChallenges.length > 0 && (
                  <AccordionItem value="challenges" className="border rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <span className="font-semibold">Posibles Desafíos</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {enhancedPlan.potentialChallenges.map((challenge, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <Shield className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                            {challenge}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Team Involvement */}
                {enhancedPlan.teamInvolvement && enhancedPlan.teamInvolvement.length > 0 && (
                  <AccordionItem value="team" className="border rounded-xl px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-info" />
                        <span className="font-semibold">Involucrar al Equipo</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pt-2">
                        {enhancedPlan.teamInvolvement.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <Users className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Data Gaps */}
                {enhancedPlan.dataGapsIdentified && enhancedPlan.dataGapsIdentified.length > 0 && (
                  <AccordionItem value="gaps" className="border rounded-xl px-4 border-warning/30 bg-warning/5">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-warning" />
                        <span className="font-semibold">Datos que Nos Faltan</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        Completar esta información ayudará a personalizar mejor las recomendaciones
                      </p>
                      <ul className="space-y-2 pt-2">
                        {enhancedPlan.dataGapsIdentified.map((gap, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <HelpCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {currentStepIndex !== -1 && (
            <Button onClick={() => onToggleStep(mission.id, currentStepIndex)}>
              <Check className="w-4 h-4 mr-2" />
              Completar Paso {currentStepIndex + 1}
            </Button>
          )}
          {currentStepIndex === -1 && completedSteps === steps.length && steps.length > 0 && (
            <div className="flex items-center gap-2 text-success">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">¡Misión Completada!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
