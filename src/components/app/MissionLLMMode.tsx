import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  Flag,
  Gift,
  HelpCircle,
  Info,
  Lightbulb,
  List,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Undo2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  confidenceExplanation?: string;
  probabilityScore?: number;
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
  driversImpacted?: string[];
  competitorInsights?: {
    hasData: boolean;
    summary?: string;
    comparison?: string[];
  };
}

interface MissionLLMModeProps {
  mission: Mission;
  businessId: string;
  onToggleStep: (missionId: string, stepIndex: number) => void;
  onToggleStatus: (mission: Mission) => void;
  onBack: () => void;
  allMissions: Mission[];
  onSelectMission: (mission: Mission) => void;
  filters?: {
    areaFilter: string;
    statusFilter: string;
    sortBy: string;
    showStarredOnly: boolean;
  };
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

const riskConfig = {
  low: { label: "Bajo", color: "text-success", bg: "bg-success/10" },
  medium: { label: "Medio", color: "text-warning", bg: "bg-warning/10" },
  high: { label: "Alto", color: "text-destructive", bg: "bg-destructive/10" },
};

// Cache
const CACHE_PREFIX = "mission_plan_v3_";
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

interface CachedPlan {
  plan: EnhancedPlan;
  cachedAt: number;
  businessId: string;
}

const getCachedPlan = (missionId: string, businessId: string): EnhancedPlan | null => {
  try {
    const key = `${CACHE_PREFIX}${missionId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedPlan = JSON.parse(raw);
    const isValid = cached.businessId === businessId && Date.now() - cached.cachedAt < CACHE_TTL_MS;
    return isValid ? cached.plan : null;
  } catch {
    return null;
  }
};

const setCachedPlan = (missionId: string, businessId: string, plan: EnhancedPlan) => {
  try {
    const key = `${CACHE_PREFIX}${missionId}`;
    const cached: CachedPlan = { plan, cachedAt: Date.now(), businessId };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {}
};

export const MissionLLMMode = ({
  mission,
  businessId,
  onToggleStep,
  onToggleStatus,
  onBack,
  allMissions,
  onSelectMission,
  filters,
}: MissionLLMModeProps) => {
  const isMobile = useIsMobile();
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("guide");
  const [undoStepIndex, setUndoStepIndex] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = useMemo(() => (mission.steps || []) as Step[], [mission.steps]);
  const completedSteps = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progress = useMemo(
    () => (steps.length > 0 ? (completedSteps / steps.length) * 100 : 0),
    [completedSteps, steps.length]
  );
  const currentStepIndex = useMemo(() => steps.findIndex((s) => !s.done), [steps]);
  const areaIcon = AREA_ICONS[mission.area || ""] || "🎯";

  // Calculate remaining time from incomplete steps
  const estimatedTimeRemaining = useMemo(() => {
    const remainingSteps = steps.filter((s) => !s.done);
    return remainingSteps.reduce((acc, step) => {
      const minutes = step.estimatedMinutes || parseInt(step.timeEstimate || "30") || 30;
      return acc + minutes;
    }, 0);
  }, [steps]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Fetch enhanced plan with caching
  const fetchEnhancedPlan = useCallback(async (regenerate = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (regenerate) {
      setRegenerating(true);
    } else {
      const cached = getCachedPlan(mission.id, businessId);
      if (cached) {
        setEnhancedPlan(cached);
        setLoading(false);
        return;
      }
      setLoading(true);
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

      if (abortControllerRef.current?.signal.aborted) return;
      if (fnError) throw fnError;

      if (data?.plan) {
        setEnhancedPlan(data.plan);
        setCachedPlan(mission.id, businessId, data.plan);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Error fetching enhanced plan:", err);
      setError("No se pudo cargar información adicional");
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  }, [mission.id, mission.title, mission.description, mission.area, businessId, steps]);

  // Effect for mission change
  useEffect(() => {
    setExpandedStep(null);
    setEnhancedPlan(null);
    setError(null);
    setMobileTab("guide");
    setUndoStepIndex(null);

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    fetchEnhancedPlan(false);

    const timer = setTimeout(() => {
      if (currentStepIndex >= 0) {
        setExpandedStep(currentStepIndex);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, [mission.id, currentStepIndex, fetchEnhancedPlan]);

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

  // Handle marking step as done with undo capability
  const handleToggleStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    onToggleStep(mission.id, stepIndex);
    
    if (!step.done) {
      // Step was marked as done - show undo snackbar
      setUndoStepIndex(stepIndex);
      
      // Clear previous timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
      
      // Auto-dismiss after 5 seconds
      undoTimerRef.current = setTimeout(() => {
        setUndoStepIndex(null);
      }, 5000);
      
      toast({
        title: "✓ Paso completado",
        description: `"${step.text.slice(0, 40)}${step.text.length > 40 ? '...' : ''}"`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleStep(mission.id, stepIndex);
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

  // ========== RENDER: MISSION SUMMARY ==========
  const renderMissionSummary = () => {
    if (loading && !enhancedPlan) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }

    const confidenceLevel = enhancedPlan?.confidence || "medium";
    const ConfidenceIcon = confidenceConfig[confidenceLevel].icon;
    const probabilityScore = enhancedPlan?.probabilityScore ?? 70;
    const riskLevel = enhancedPlan?.riskLevel || "medium";

    return (
      <section className="space-y-4">
        {/* Main summary */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground mb-1">
                {enhancedPlan?.planTitle || mission.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {enhancedPlan?.planDescription || mission.description}
              </p>
            </div>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Probability */}
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Probabilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{probabilityScore}%</span>
              <Badge className={cn("text-[9px]", confidenceConfig[confidenceLevel].bg, confidenceConfig[confidenceLevel].color)}>
                {confidenceConfig[confidenceLevel].label}
              </Badge>
            </div>
          </div>

          {/* Impact */}
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground">Impacto</span>
            </div>
            <div className="text-xl font-bold text-foreground">{mission.impact_score}/10</div>
          </div>

          {/* Effort */}
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">Esfuerzo</span>
            </div>
            <div className="text-xl font-bold text-foreground">{mission.effort_score}/10</div>
          </div>

          {/* Time */}
          <div className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Tiempo restante</span>
            </div>
            <div className="text-xl font-bold text-foreground">{formatTime(estimatedTimeRemaining)}</div>
          </div>
        </div>

        {/* Based on / Signals */}
        {enhancedPlan?.basedOn && enhancedPlan.basedOn.length > 0 && (
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase">Basado en señales de tu negocio</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {enhancedPlan.basedOn.slice(0, 5).map((signal, idx) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">
                  {signal}
                </Badge>
              ))}
              {enhancedPlan.basedOn.length > 5 && (
                <Badge variant="outline" className="text-[10px]">
                  +{enhancedPlan.basedOn.length - 5} más
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Drivers impacted */}
        {enhancedPlan?.driversImpacted && enhancedPlan.driversImpacted.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Drivers impactados:</span>
            {enhancedPlan.driversImpacted.map((driver, idx) => (
              <Badge key={idx} variant="outline" className="text-[10px] border-primary/30 text-primary">
                {driver}
              </Badge>
            ))}
          </div>
        )}

        {/* Risk & Dependencies row */}
        <div className="flex flex-wrap gap-3">
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg", riskConfig[riskLevel].bg)}>
            <AlertTriangle className={cn("w-3.5 h-3.5", riskConfig[riskLevel].color)} />
            <span className={cn("text-xs font-medium", riskConfig[riskLevel].color)}>
              Riesgo {riskConfig[riskLevel].label}
            </span>
          </div>
          
          {enhancedPlan?.dependencies && enhancedPlan.dependencies.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 cursor-help">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-medium text-accent">
                      {enhancedPlan.dependencies.length} dependencias
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <ul className="text-xs space-y-1">
                    {enhancedPlan.dependencies.map((dep, idx) => (
                      <li key={idx}>• {dep}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Competitor insights */}
        {enhancedPlan?.competitorInsights && (
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">Competencia</h4>
              {!enhancedPlan.competitorInsights.hasData && (
                <Badge variant="outline" className="text-[9px] ml-auto">
                  Estimado
                </Badge>
              )}
            </div>
            {enhancedPlan.competitorInsights.hasData ? (
              <>
                {enhancedPlan.competitorInsights.summary && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {enhancedPlan.competitorInsights.summary}
                  </p>
                )}
                {enhancedPlan.competitorInsights.comparison && (
                  <ul className="space-y-1">
                    {enhancedPlan.competitorInsights.comparison.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                        <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Conecta Google Business para datos reales de competencia
                </p>
                <Button variant="outline" size="sm" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Conectar Pro
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  // ========== RENDER: STEPS TIMELINE ==========
  const renderStepsTimeline = () => (
    <div className="space-y-2">
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
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all",
                    "min-w-[44px] min-h-[44px]", // Touch target
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
                    {isCurrentStep && !step.done && (
                      <span className="text-xs text-primary font-medium">Siguiente</span>
                    )}
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
  );

  // ========== RENDER: GUIDE CONTENT ==========
  const renderGuideContent = () => {
    const activeStep = expandedStep !== null ? steps[expandedStep] : null;
    const stepData = expandedStep !== null && enhancedPlan?.steps?.[expandedStep]
      ? enhancedPlan.steps[expandedStep]
      : activeStep;

    return (
      <div className="space-y-6">
        {/* Mission Summary */}
        {renderMissionSummary()}

        {/* Active step detail */}
        {activeStep && stepData && (
          <section className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                <span className="text-sm">Paso {(expandedStep ?? 0) + 1}:</span>
                <span className="line-clamp-1">{activeStep.text}</span>
              </h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={goPrevStep} disabled={!canGoPrevStep} className="h-8 w-8">
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goNextStep} disabled={!canGoNextStep} className="h-8 w-8">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {stepData.howTo && stepData.howTo.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-primary uppercase mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Cómo hacerlo
                </h5>
                <ul className="space-y-2">
                  {stepData.howTo.map((item, i) => (
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
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">¿Por qué?</h5>
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
                  {stepData.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <Star className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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

            {/* CTA: Mark done / Undo */}
            <div className="pt-2">
              {!activeStep.done ? (
                <Button onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-11">
                  <Check className="w-5 h-5 mr-2" />
                  Listo, ya lo hice
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleToggleStep(expandedStep ?? 0)} className="w-full h-11">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Deshacer paso
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Quick wins */}
        {enhancedPlan?.quickWins && enhancedPlan.quickWins.length > 0 && (
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
      </div>
    );
  };

  // ========== RENDER: RESOURCES TAB ==========
  const renderResources = () => (
    <div className="space-y-4">
      {enhancedPlan ? (
        <Accordion type="multiple" className="space-y-2">
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
                  <span className="font-semibold text-sm">Riesgos y mitigación</span>
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

          {enhancedPlan.dependencies && enhancedPlan.dependencies.length > 0 && (
            <AccordionItem value="dependencies" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
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
            <AccordionItem value="gaps" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Alternativas si no puedo</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pb-3">
                  {enhancedPlan.dataGapsIdentified.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      ) : loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : null}
    </div>
  );

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <header className="sticky top-0 z-20 p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 flex-shrink-0 min-w-[44px]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{areaIcon}</span>
                <Badge variant="outline" className="text-[10px]">{mission.area || "General"}</Badge>
                <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px]">
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
              </div>
              <h1 className="text-base font-bold text-foreground line-clamp-1">
                Misión: {mission.title}
              </h1>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{completedSteps}/{steps.length} pasos</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => fetchEnhancedPlan(true)} disabled={regenerating} className="h-9 w-9">
                    <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerar guía con IA</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={mission.status === "active" ? "outline" : "default"} 
                    size="sm" 
                    onClick={() => onToggleStatus(mission)} 
                    className="h-9"
                  >
                    {mission.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Reanudar
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {mission.status === "active" ? "Pausar misión temporalmente" : "Reanudar misión"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Tabs */}
          <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="guide" className="text-xs">
                <FileText className="w-3.5 h-3.5 mr-1" />
                Guía
              </TabsTrigger>
              <TabsTrigger value="steps" className="text-xs">
                <List className="w-3.5 h-3.5 mr-1" />
                Pasos
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                <Info className="w-3.5 h-3.5 mr-1" />
                Recursos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Content */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
          {mobileTab === "guide" && renderGuideContent()}
          {mobileTab === "steps" && renderStepsTimeline()}
          {mobileTab === "resources" && renderResources()}
        </div>

        {/* Sticky CTA */}
        {currentStepIndex !== -1 && (
          <div className="sticky bottom-0 p-4 bg-background border-t border-border">
            {!steps[currentStepIndex]?.done ? (
              <Button onClick={() => handleToggleStep(currentStepIndex)} className="w-full h-12">
                <Check className="w-5 h-5 mr-2" />
                Listo, ya lo hice (Paso {currentStepIndex + 1})
              </Button>
            ) : (
              <Button variant="outline" onClick={() => handleToggleStep(currentStepIndex)} className="w-full h-12">
                <RotateCcw className="w-4 h-4 mr-2" />
                Deshacer paso {currentStepIndex + 1}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ========== DESKTOP LAYOUT: Split View ==========
  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="sticky top-0 z-20 px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={onBack} className="h-9 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Misiones
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{areaIcon}</span>
                <h1 className="text-lg font-bold text-foreground truncate">Misión: {mission.title}</h1>
                <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-xs flex-shrink-0">
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Time remaining */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{formatTime(estimatedTimeRemaining)} restante</span>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => fetchEnhancedPlan(true)} disabled={regenerating} className="h-9 w-9">
                    <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerar guía con IA</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={mission.status === "active" ? "outline" : "default"} 
                    size="sm" 
                    onClick={() => onToggleStatus(mission)} 
                    className="h-9"
                  >
                    {mission.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Reanudar
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {mission.status === "active" ? "Pausar misión temporalmente" : "Reanudar misión pausada"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{completedSteps}/{steps.length} pasos</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </header>

        {/* Split content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left: Mission list */}
          <aside className="w-64 border-r border-border bg-muted/30 hidden lg:block flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Misiones</h3>
                {allMissions.map((m) => {
                  const mSteps = (m.steps || []) as Step[];
                  const mCompleted = mSteps.filter((s) => s.done).length;
                  const mProgress = mSteps.length > 0 ? (mCompleted / mSteps.length) * 100 : 0;
                  const isActive = m.id === mission.id;

                  return (
                    <button
                      key={m.id}
                      onClick={() => onSelectMission(m)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        isActive
                          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                          : "bg-card border-border hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{AREA_ICONS[m.area || ""] || "🎯"}</span>
                        <Badge variant="outline" className="text-[9px]">{m.area}</Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">{m.title}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={mProgress} className="h-1 flex-1" />
                        <span className="text-[10px] text-muted-foreground">{Math.round(mProgress)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* Center: LLM Guide panel */}
          <main ref={containerRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
            {renderGuideContent()}
          </main>

          {/* Right: Steps timeline */}
          <aside className="w-72 border-l border-border bg-card hidden md:block flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Flag className="w-4 h-4 text-primary" />
                  Pasos
                </h3>
                {renderStepsTimeline()}

                {/* Quick stats */}
                <div className="mt-6 space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-bold">{mission.impact_score}/10</p>
                      <p className="text-[10px] text-muted-foreground">Impacto</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Timer className="w-4 h-4 text-success mx-auto mb-1" />
                      <p className="text-sm font-bold">{formatTime(estimatedTimeRemaining)}</p>
                      <p className="text-[10px] text-muted-foreground">Restante</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  );
};
