import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Flag,
  Gift,
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
  Eye,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
  // Navigation between missions
  allMissions?: Mission[];
  onNavigate?: (mission: Mission) => void;
}

const AREA_ICONS: Record<string, string> = {
  Reputación: "⭐",
  Marketing: "📱",
  Operaciones: "⚙️",
  Ventas: "💰",
  Equipo: "👥",
  Producto: "📦",
  Finanzas: "📊",
};

const confidenceConfig = {
  high: { label: "Alta", color: "text-success", bg: "bg-success/10", icon: Shield },
  medium: { label: "Media", color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle },
  low: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted", icon: HelpCircle },
};

// Cache key prefix
const CACHE_PREFIX = "mission_plan_";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedPlan {
  plan: EnhancedPlan;
  cachedAt: number;
  businessId: string;
}

// Get from localStorage with TTL check
const getCachedPlan = (missionId: string, businessId: string): EnhancedPlan | null => {
  try {
    const key = `${CACHE_PREFIX}${missionId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    
    const cached: CachedPlan = JSON.parse(raw);
    const isValid = 
      cached.businessId === businessId &&
      Date.now() - cached.cachedAt < CACHE_TTL_MS;
    
    return isValid ? cached.plan : null;
  } catch {
    return null;
  }
};

// Save to localStorage
const setCachedPlan = (missionId: string, businessId: string, plan: EnhancedPlan) => {
  try {
    const key = `${CACHE_PREFIX}${missionId}`;
    const cached: CachedPlan = { plan, cachedAt: Date.now(), businessId };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {
    // localStorage might be full, ignore
  }
};

export const MissionDetailEnhanced = ({
  mission,
  businessId,
  onToggleStep,
  onToggleStatus,
  onClose,
  allMissions = [],
  onNavigate,
}: MissionDetailEnhancedProps) => {
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  
  // AbortController ref for fetch cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  // Container ref for scroll reset
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => (mission.steps || []) as Step[], [mission.steps]);
  const completedSteps = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progress = useMemo(
    () => (steps.length > 0 ? (completedSteps / steps.length) * 100 : 0),
    [completedSteps, steps.length]
  );
  const currentStepIndex = useMemo(() => steps.findIndex((s) => !s.done), [steps]);

  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const areaIcon = AREA_ICONS[mission.area || ""] || "🎯";

  // Navigation helpers
  const currentMissionIndex = allMissions.findIndex(m => m.id === mission.id);
  const canGoPrevMission = currentMissionIndex > 0;
  const canGoNextMission = currentMissionIndex < allMissions.length - 1 && currentMissionIndex !== -1;

  const navigateToPrevMission = useCallback(() => {
    if (canGoPrevMission && onNavigate) {
      onNavigate(allMissions[currentMissionIndex - 1]);
    }
  }, [canGoPrevMission, onNavigate, allMissions, currentMissionIndex]);

  const navigateToNextMission = useCallback(() => {
    if (canGoNextMission && onNavigate) {
      onNavigate(allMissions[currentMissionIndex + 1]);
    }
  }, [canGoNextMission, onNavigate, allMissions, currentMissionIndex]);

  const scrollToStep = useCallback((idx: number) => {
    requestAnimationFrame(() => {
      const el = stepRefs.current[idx];
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const openStep = useCallback((idx: number) => {
    setExpandedStep(idx);
    scrollToStep(idx);
  }, [scrollToStep]);

  const fetchEnhancedPlan = useCallback(async (regenerate = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (regenerate) {
      setRegenerating(true);
    } else {
      // Check cache first (stale-while-revalidate)
      const cached = getCachedPlan(mission.id, businessId);
      if (cached) {
        setEnhancedPlan(cached);
        setLoading(false);
        // Revalidate in background if not regenerating
        if (!regenerate) {
          // Still fetch but don't show loading
        }
      } else {
        setLoading(true);
      }
    }
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-mission-plan",
        {
          body: {
            businessId,
            missionTitle: mission.title,
            missionDescription: mission.description,
            missionArea: mission.area,
            existingSteps: steps,
            enhanceExisting: true,
            regenerate,
          },
        }
      );

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) return;

      if (fnError) throw fnError;

      if (data?.plan) {
        setEnhancedPlan(data.plan);
        setCachedPlan(mission.id, businessId, data.plan);
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err?.name === "AbortError") return;
      console.error("Error fetching enhanced plan:", err);
      setError("No se pudo cargar información adicional");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [mission.id, mission.title, mission.description, mission.area, businessId, steps]);

  // Reset state when mission changes
  useEffect(() => {
    setExpandedStep(null);
    setEnhancedPlan(null);
    setError(null);
    
    // Reset scroll to top
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    
    fetchEnhancedPlan(false);
    
    // Open current step after a brief delay
    const timer = setTimeout(() => {
      if (currentStepIndex >= 0) {
        setExpandedStep(currentStepIndex);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup: abort fetch on unmount or mission change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mission.id, currentStepIndex, fetchEnhancedPlan]);

  const estimatedTimeRemaining = useMemo(() => {
    const remainingSteps = steps.filter((s) => !s.done);
    return remainingSteps.reduce((acc, step) => {
      const time = step.timeEstimate || "30 min";
      const minutes = parseInt(time) || 30;
      return acc + minutes;
    }, 0);
  }, [steps]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const canGoPrevStep = expandedStep !== null && expandedStep > 0;
  const canGoNextStep = expandedStep !== null && expandedStep < steps.length - 1;

  const goPrevStep = () => {
    if (!canGoPrevStep || expandedStep === null) return;
    openStep(expandedStep - 1);
  };

  const goNextStep = () => {
    if (!canGoNextStep || expandedStep === null) return;
    openStep(expandedStep + 1);
  };

  const markExpandedDone = () => {
    if (expandedStep === null) return;
    if (steps[expandedStep]?.done) return;
    onToggleStep(mission.id, expandedStep);
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto overscroll-contain"
    >
      {/* Header sticky */}
      <header className="sticky top-0 z-20 p-4 md:p-5 pb-3 border-b border-border/50 bg-card">
        {/* Row 1: Title + Close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center text-xl md:text-2xl shadow-lg shadow-primary/20 flex-shrink-0">
              {areaIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base md:text-lg font-bold text-foreground line-clamp-2 leading-tight">
                {mission.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                  {mission.area || "General"}
                </Badge>
                <Badge
                  variant={mission.status === "active" ? "default" : "secondary"}
                  className="text-[10px] px-1.5 h-5"
                >
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
                {enhancedPlan?.confidence && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] gap-0.5 px-1.5 h-5",
                      confidenceConfig[enhancedPlan.confidence].color
                    )}
                  >
                    {(() => {
                      const IconComp = confidenceConfig[enhancedPlan.confidence].icon;
                      return <IconComp className="w-2.5 h-2.5" />;
                    })()}
                    {confidenceConfig[enhancedPlan.confidence].label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Row 2: Progress bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedSteps}/{steps.length} pasos
            </span>
            <span className="font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Row 3: Action buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mission navigation */}
          <div className="flex items-center gap-1">
            {allMissions.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToPrevMission}
                  disabled={!canGoPrevMission}
                  className="h-9 w-9"
                  title="Misión anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {currentMissionIndex + 1}/{allMissions.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigateToNextMission}
                  disabled={!canGoNextMission}
                  className="h-9 w-9"
                  title="Siguiente misión"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchEnhancedPlan(true)}
              disabled={regenerating}
              className="h-9 w-9"
              aria-label="Regenerar plan"
            >
              <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
            </Button>
            <Button
              variant={mission.status === "active" ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleStatus(mission)}
              className="h-9 text-xs px-3"
            >
              {mission.status === "active" ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1.5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Reactivar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Row 4: Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center text-primary mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-bold text-foreground">{mission.impact_score}/10</p>
            <p className="text-[10px] text-muted-foreground">Impacto</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center text-warning mb-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-bold text-foreground">{mission.effort_score}/10</p>
            <p className="text-[10px] text-muted-foreground">Esfuerzo</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center text-success mb-0.5">
              <Timer className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-bold text-foreground">{formatTime(estimatedTimeRemaining)}</p>
            <p className="text-[10px] text-muted-foreground">Restante</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center text-info mb-0.5">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-bold text-foreground">{enhancedPlan?.estimatedDuration || "~1 sem"}</p>
            <p className="text-[10px] text-muted-foreground">Duración</p>
          </div>
        </div>
      </header>

      {/* Main content - single scrollable area */}
      <main className="flex-1 p-4 md:p-5 space-y-5">
        {/* Loading state */}
        {loading && !enhancedPlan ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando plan personalizado...</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ) : enhancedPlan ? (
          <>
            {/* AI Enhanced Description */}
            <section className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                    {enhancedPlan.planTitle || mission.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {enhancedPlan.planDescription || mission.description}
                  </p>
                </div>
              </div>
            </section>

            {enhancedPlan.estimatedImpact && (
              <section className="bg-success/5 border border-success/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-success" />
                  <h4 className="font-semibold text-foreground text-sm">Resultado esperado</h4>
                </div>
                <p className="text-sm text-foreground">{enhancedPlan.estimatedImpact}</p>
                {enhancedPlan.estimatedROI && (
                  <p className="text-xs text-success mt-2 font-medium">
                    ROI estimado: {enhancedPlan.estimatedROI}
                  </p>
                )}
              </section>
            )}

            {enhancedPlan.basedOn && enhancedPlan.basedOn.length > 0 && (
              <section className="bg-muted/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Basado en datos de tu negocio
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {enhancedPlan.basedOn.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">
                      {item}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {enhancedPlan.quickWins && enhancedPlan.quickWins.length > 0 && (
              <section className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-warning" />
                  <h4 className="font-semibold text-foreground text-sm">Quick wins</h4>
                </div>
                <ul className="space-y-2">
                  {enhancedPlan.quickWins.map((win, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <Gift className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                      {win}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchEnhancedPlan(false)}
            >
              Reintentar
            </Button>
          </div>
        ) : null}

        <Separator />

        {/* Steps section with step navigation */}
        <section aria-label="Pasos de la misión">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
              <Flag className="w-4 h-4 text-primary" />
              Pasos
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {expandedStep !== null ? `Paso ${expandedStep + 1}/${steps.length}` : "Seleccioná un paso"}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goPrevStep}
                  disabled={!canGoPrevStep}
                  className="h-8 w-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goNextStep}
                  disabled={!canGoNextStep}
                  className="h-8 w-8"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* CTA: Mark step done */}
          {expandedStep !== null && !steps[expandedStep]?.done && (
            <Button
              onClick={markExpandedDone}
              className="w-full mb-4 h-11"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Marcar paso {expandedStep + 1} como hecho
            </Button>
          )}

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isCurrentStep = idx === currentStepIndex;
              const isExpanded = expandedStep === idx;
              const stepData = enhancedPlan?.steps?.[idx] || step;
              const confidence = stepData.confidence || "medium";

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className={cn(
                    "rounded-xl border transition-all",
                    step.done
                      ? "bg-success/5 border-success/20"
                      : isCurrentStep
                        ? "bg-primary/5 border-primary/30 shadow-md ring-2 ring-primary/20"
                        : "bg-card border-border hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3 p-3 md:p-4">
                    {/* Checkbox/Number - min 44px touch target */}
                    <button
                      onClick={() => {
                        onToggleStep(mission.id, idx);
                        setExpandedStep(idx);
                      }}
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
                        step.done
                          ? "bg-success text-success-foreground"
                          : isCurrentStep
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
                      )}
                      aria-label={step.done ? "Marcar como no hecho" : "Marcar como hecho"}
                    >
                      {step.done ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </button>

                    {/* Step text - clickable to expand */}
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : idx)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p
                        className={cn(
                          "font-medium transition-colors text-sm md:text-base",
                          step.done
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {step.text}
                      </p>

                      {isCurrentStep && !step.done && (
                        <div className="flex items-center gap-1.5 mt-1">
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

                    {/* Expand toggle - min 44px touch target */}
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : idx)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label={isExpanded ? "Contraer" : "Expandir"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 md:px-4 pb-4 border-t border-border/50 space-y-4 pt-4">
                      {stepData.howTo && stepData.howTo.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-primary uppercase mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3" />
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

                      {stepData.why && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                            ¿Por qué?
                          </h5>
                          <p className="text-sm text-foreground">{stepData.why}</p>
                        </div>
                      )}

                      {stepData.tips && stepData.tips.length > 0 && (
                        <div className="bg-warning/5 rounded-lg p-3 border border-warning/20">
                          <h5 className="text-xs font-semibold text-warning uppercase mb-2 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Tips
                          </h5>
                          <ul className="space-y-1.5">
                            {stepData.tips.map((tip: string, i: number) => (
                              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                <Star className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {stepData.resources && stepData.resources.length > 0 && (
                        <div>
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Recursos
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {stepData.resources.map((res: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {res}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        {stepData.timeEstimate && (
                          <div className="flex items-center gap-1.5 text-xs bg-background rounded-full px-3 py-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {stepData.timeEstimate}
                          </div>
                        )}
                        {stepData.metric && (
                          <div className="flex items-center gap-1.5 text-xs bg-background rounded-full px-3 py-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                            {stepData.metric}
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5",
                            confidenceConfig[confidence].bg,
                            confidenceConfig[confidence].color
                          )}
                        >
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
        </section>

        {/* Additional sections in accordion */}
        {enhancedPlan && !loading && (
          <>
            <Separator />

            <Accordion type="multiple" className="space-y-2">
              {enhancedPlan.weeklyMilestones && enhancedPlan.weeklyMilestones.length > 0 && (
                <AccordionItem value="milestones" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Hitos semanales</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-3">
                      {enhancedPlan.weeklyMilestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{milestone.week}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{milestone.milestone}</p>
                            {milestone.metric && (
                              <p className="text-xs text-muted-foreground mt-1">📊 {milestone.metric}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {enhancedPlan.successMetrics && enhancedPlan.successMetrics.length > 0 && (
                <AccordionItem value="metrics" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-success" />
                      <span className="font-semibold text-sm">Métricas de éxito</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
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

              {enhancedPlan.businessSpecificTips && enhancedPlan.businessSpecificTips.length > 0 && (
                <AccordionItem value="tips" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-warning" />
                      <span className="font-semibold text-sm">Tips personalizados</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
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

              {enhancedPlan.potentialChallenges && enhancedPlan.potentialChallenges.length > 0 && (
                <AccordionItem value="challenges" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="font-semibold text-sm">Posibles desafíos</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
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

              {enhancedPlan.teamInvolvement && enhancedPlan.teamInvolvement.length > 0 && (
                <AccordionItem value="team" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-info" />
                      <span className="font-semibold text-sm">Equipo</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
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

              {enhancedPlan.dependencies && enhancedPlan.dependencies.length > 0 && (
                <AccordionItem value="dependencies" className="border rounded-xl px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="font-semibold text-sm">Dependencias</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
                      {enhancedPlan.dependencies.map((dep, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <ArrowRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          {dep}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}

              {enhancedPlan.dataGapsIdentified && enhancedPlan.dataGapsIdentified.length > 0 && (
                <AccordionItem value="gaps" className="border rounded-xl px-4 border-warning/30 bg-warning/5">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-warning" />
                      <span className="font-semibold text-sm">Datos que mejorarían el plan</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pb-3">
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
        
        {/* Spacer for safe area */}
        <div className="h-4" />
      </main>
    </div>
  );
};
