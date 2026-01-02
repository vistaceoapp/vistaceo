import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  Gift,
  HelpCircle,
  Lightbulb,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Rocket,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
  Eye,
  FileText,
  List,
  BookOpen,
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface MissionLLMModeProps {
  mission: Mission;
  businessId: string;
  onToggleStep: (missionId: string, stepIndex: number) => void;
  onToggleStatus: (mission: Mission) => void;
  onBack: () => void;
  allMissions: Mission[];
  onSelectMission: (mission: Mission) => void;
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

// Cache
const CACHE_PREFIX = "mission_plan_v2_";
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
}: MissionLLMModeProps) => {
  const isMobile = useIsMobile();
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("guide");

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => (mission.steps || []) as Step[], [mission.steps]);
  const completedSteps = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progress = useMemo(
    () => (steps.length > 0 ? (completedSteps / steps.length) * 100 : 0),
    [completedSteps, steps.length]
  );
  const currentStepIndex = useMemo(() => steps.findIndex((s) => !s.done), [steps]);
  const areaIcon = AREA_ICONS[mission.area || ""] || "🎯";

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
        return; // Use cache, don't refetch
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

  useEffect(() => {
    setExpandedStep(null);
    setEnhancedPlan(null);
    setError(null);
    setMobileTab("guide");

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

  const markCurrentDone = () => {
    if (currentStepIndex === -1) return;
    onToggleStep(mission.id, currentStepIndex);
  };

  // ========== RENDER: STEPS TIMELINE (sidebar in desktop, tab in mobile) ==========
  const renderStepsTimeline = () => (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const isCurrentStep = idx === currentStepIndex;
        const isExpanded = expandedStep === idx;

        return (
          <button
            key={idx}
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
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold",
                  step.done
                    ? "bg-success text-success-foreground"
                    : isCurrentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {step.done ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium line-clamp-2", step.done && "line-through text-muted-foreground")}>
                  {step.text}
                </p>
                {isCurrentStep && !step.done && (
                  <span className="text-xs text-primary">Siguiente</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  // ========== RENDER: GUIDE CONTENT (main LLM panel) ==========
  const renderGuideContent = () => {
    const activeStep = expandedStep !== null ? steps[expandedStep] : null;
    const stepData = expandedStep !== null && enhancedPlan?.steps?.[expandedStep]
      ? enhancedPlan.steps[expandedStep]
      : activeStep;

    return (
      <div className="space-y-4">
        {/* Loading state */}
        {loading && !enhancedPlan ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Cargando plan personalizado...</span>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : enhancedPlan ? (
          <>
            {/* AI Description */}
            <section className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {enhancedPlan.planTitle || mission.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {enhancedPlan.planDescription || mission.description}
                  </p>
                </div>
              </div>
            </section>

            {/* Active step detail */}
            {activeStep && stepData && (
              <section className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Flag className="w-4 h-4 text-primary" />
                    Paso {(expandedStep ?? 0) + 1}: {activeStep.text}
                  </h4>
                  <div className="flex items-center gap-1">
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

                {/* CTA: Mark done */}
                {!activeStep.done && (
                  <Button onClick={() => onToggleStep(mission.id, expandedStep ?? 0)} className="w-full h-11">
                    <Check className="w-5 h-5 mr-2" />
                    Marcar paso como hecho
                  </Button>
                )}
              </section>
            )}

            {/* Quick wins */}
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
            <Button variant="outline" size="sm" onClick={() => fetchEnhancedPlan(false)}>
              Reintentar
            </Button>
          </div>
        ) : null}
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
            <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{areaIcon}</span>
                <Badge variant="outline" className="text-[10px]">{mission.area || "General"}</Badge>
              </div>
              <h1 className="text-base font-bold text-foreground line-clamp-1">{mission.title}</h1>
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
                <BookOpen className="w-3.5 h-3.5 mr-1" />
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
        {currentStepIndex !== -1 && !steps[currentStepIndex]?.done && (
          <div className="sticky bottom-0 p-4 bg-background border-t border-border">
            <Button onClick={markCurrentDone} className="w-full h-12">
              <Check className="w-5 h-5 mr-2" />
              Marcar paso {currentStepIndex + 1} como hecho
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ========== DESKTOP LAYOUT: Split View ==========
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-20 p-4 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-9">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Misiones
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{areaIcon}</span>
              <h1 className="text-lg font-bold text-foreground">{mission.title}</h1>
              <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-xs">
                {mission.status === "active" ? "Activa" : "Pausada"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => fetchEnhancedPlan(true)} disabled={regenerating} className="h-9 w-9">
              <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
            </Button>
            <Button variant={mission.status === "active" ? "outline" : "default"} size="sm" onClick={() => onToggleStatus(mission)} className="h-9">
              {mission.status === "active" ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Reactivar
                </>
              )}
            </Button>
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
        {/* Left: Mission list (scrollable) */}
        <aside className="w-64 border-r border-border bg-muted/30 hidden lg:block">
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
        <main ref={containerRef} className="flex-1 overflow-y-auto p-6">
          {renderGuideContent()}
        </main>

        {/* Right: Steps timeline */}
        <aside className="w-72 border-l border-border bg-card hidden md:block">
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
  );
};
