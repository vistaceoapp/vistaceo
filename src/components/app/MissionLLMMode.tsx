import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronDown,
  Clock,
  Eye,
  FileText,
  List,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBusiness } from "@/contexts/BusinessContext";
import { MissionFilters, AREA_CATEGORIES, loadFiltersFromStorage } from "@/components/app/MissionFilters";
import { MissionLoadingState } from "@/components/app/MissionLoadingState";
import { MissionSummaryView } from "@/components/app/MissionSummaryView";
import { MissionStepsView } from "@/components/app/MissionStepsView";
import { ProgressRing } from "@/components/app/ProgressRing";

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
  expectedBenefit?: {
    range: string;
    confidence: "high" | "medium" | "low";
    timeframe?: string;
  };
  whatYouWillAchieve?: string[];
  definitionOfDone?: string;
  whyNow?: string[];
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

// Sidebar mission item - extracted for reuse
const SidebarMissionItem = ({ m, mission, starredMissions, onSelectMission, toggleStarred }: {
  m: Mission; mission: Mission; starredMissions: Set<string>;
  onSelectMission: (m: Mission) => void; toggleStarred: (id: string, e: React.MouseEvent) => void;
}) => {
  const mSteps = (m.steps || []) as Step[];
  const mCompleted = mSteps.filter(s => s.done).length;
  const mProgress = mSteps.length > 0 ? (mCompleted / mSteps.length) * 100 : 0;
  const isSelected = m.id === mission.id;

  return (
    <button
      onClick={() => onSelectMission(m)}
      className={cn(
        "w-full text-left p-3 border-b border-border hover:bg-secondary/50 transition-colors",
        isSelected && "bg-primary/10 border-l-2 border-l-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <ProgressRing progress={mProgress} size={40} strokeWidth={3}>
          <span className="text-sm">{AREA_ICONS[m.area || ""] || "🎯"}</span>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium line-clamp-2 leading-snug", isSelected && "text-primary")}>
            {m.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={m.status === "active" ? "default" : "secondary"} className="text-[9px]">
              {m.status === "active" ? "Activa" : "Pausada"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{mCompleted}/{mSteps.length}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={(e) => toggleStarred(m.id, e)}
        >
          <Star className={cn("w-4 h-4", starredMissions.has(m.id) && "fill-warning text-warning")} />
        </Button>
      </div>
    </button>
  );
};

// Collapsible area group for sidebar
const CollapsibleArea = ({ area, missions, selectedMissionId, starredMissions, onSelectMission, toggleStarred }: {
  area: string; missions: Mission[]; selectedMissionId: string; starredMissions: Set<string>;
  onSelectMission: (m: Mission) => void; toggleStarred: (id: string, e: React.MouseEvent) => void;
}) => {
  const hasSelected = missions.some(m => m.id === selectedMissionId);
  const [open, setOpen] = useState<boolean>(true);
  const icon = AREA_ICONS[area] || "🎯";
  const activeCount = missions.filter(m => m.status === "active").length;

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary/50 transition-colors"
      >
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-foreground flex-1 text-left">{area}</span>
        <Badge variant="secondary" className="text-[9px] px-1.5">{activeCount}/{missions.length}</Badge>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div>
          {missions.map((m) => (
            <SidebarMissionItem key={m.id} m={m} mission={{ id: selectedMissionId } as Mission} starredMissions={starredMissions} onSelectMission={onSelectMission} toggleStarred={toggleStarred} />
          ))}
        </div>
      )}
    </div>
  );
};

// Cache — permanent, never expires unless user explicitly regenerates
const CACHE_PREFIX = "mission_plan_v4_";

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
    // Only validate businessId match — no TTL expiration
    return cached.businessId === businessId ? cached.plan : null;
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
  const { currentBusiness } = useBusiness();
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("guide");
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  
  // View mode: "summary" or "steps"
  const [viewMode, setViewMode] = useState<"summary" | "steps">("summary");
  
  // Selected step index for the right sidebar timeline
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(() => {
    const firstIncomplete = ((mission.steps || []) as Step[]).findIndex(s => !s.done);
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  
  // Local filters for the missions list in LLM mode
  const [localFilters, setLocalFilters] = useState(() => loadFiltersFromStorage());
  const [starredMissions, setStarredMissions] = useState<Set<string>>(new Set());

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);



  const steps = useMemo(() => (mission.steps || []) as Step[], [mission.steps]);
  const completedSteps = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progress = useMemo(
    () => (steps.length > 0 ? (completedSteps / steps.length) * 100 : 0),
    [completedSteps, steps.length]
  );
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

  // Fetch enhanced plan with caching — cached plans load instantly, no flash
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
        setError(null);
        return; // Instant load — no network call
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

  const confirmAndRegenerate = useCallback(() => {
    setShowRegenerateDialog(true);
  }, []);

  const executeRegenerate = useCallback(() => {
    setShowRegenerateDialog(false);
    fetchEnhancedPlan(true);
  }, [fetchEnhancedPlan]);

  // Effect for mission change — preserve cached plan to avoid flash
  useEffect(() => {
    setError(null);
    setMobileTab("guide");
    setViewMode("summary");
    
    // Check cache BEFORE resetting state to avoid loading flash
    const cached = getCachedPlan(mission.id, businessId);
    if (cached) {
      setEnhancedPlan(cached);
      setLoading(false);
    } else {
      setEnhancedPlan(null);
      setLoading(true);
    }
    
    // Reset selected step to first incomplete
    const firstIncomplete = steps.findIndex(s => !s.done);
    setSelectedStepIdx(firstIncomplete >= 0 ? firstIncomplete : 0);

    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    fetchEnhancedPlan(false);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mission.id, fetchEnhancedPlan, steps]);

  // Filter missions for the left sidebar
  const filteredMissions = useMemo(() => {
    let result = [...allMissions];
    
    if (localFilters.showStarredOnly) {
      result = result.filter(m => starredMissions.has(m.id));
    }
    if (localFilters.areaFilter !== "all") {
      result = result.filter(m => m.area === localFilters.areaFilter);
    }
    if (localFilters.statusFilter !== "all") {
      result = result.filter(m => m.status === localFilters.statusFilter);
    }
    
    switch (localFilters.sortBy) {
      case "impact":
        result.sort((a, b) => b.impact_score - a.impact_score);
        break;
      case "effort":
        result.sort((a, b) => a.effort_score - b.effort_score);
        break;
      case "progress":
        result.sort((a, b) => {
          const aSteps = (a.steps || []) as Step[];
          const bSteps = (b.steps || []) as Step[];
          const aProgress = aSteps.length > 0 ? aSteps.filter(s => s.done).length / aSteps.length : 0;
          const bProgress = bSteps.length > 0 ? bSteps.filter(s => s.done).length / bSteps.length : 0;
          return bProgress - aProgress;
        });
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    // Starred first
    result.sort((a, b) => {
      const aStarred = starredMissions.has(a.id) ? 1 : 0;
      const bStarred = starredMissions.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
    
    return result;
  }, [allMissions, localFilters, starredMissions]);

  const toggleStarred = (missionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredMissions(prev => {
      const next = new Set(prev);
      if (next.has(missionId)) {
        next.delete(missionId);
      } else {
        next.add(missionId);
      }
      return next;
    });
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <header className="sticky top-0 z-20 px-4 py-3 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 flex-shrink-0 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-foreground line-clamp-1">
                {mission.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px] h-5">
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completedSteps}/{steps.length} pasos
                </span>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </header>

        {/* Loading State */}
        {loading && !enhancedPlan ? (
          <MissionLoadingState 
            businessName={currentBusiness?.name}
            missionTitle={mission.title}
          />
        ) : (
          <>
            {/* Tabs */}
            <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 pt-2.5 pb-1">
                <TabsList className="grid w-full grid-cols-3 p-0.5 h-9 bg-secondary/80">
                  <TabsTrigger value="guide" className="text-[11px] h-8 data-[state=active]:shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Resumen
                  </TabsTrigger>
                  <TabsTrigger value="steps" className="text-[11px] h-8 data-[state=active]:shadow-sm">
                    <List className="w-3.5 h-3.5 mr-1" />
                    Pasos
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="text-[11px] h-8 data-[state=active]:shadow-sm">
                    <Brain className="w-3.5 h-3.5 mr-1" />
                    Más info
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3">
                <TabsContent value="guide" className="m-0">
                  <MissionSummaryView
                    mission={mission}
                    enhancedPlan={enhancedPlan}
                    loading={loading}
                    regenerating={regenerating}
                    estimatedTimeRemaining={estimatedTimeRemaining}
                    onRegenerate={confirmAndRegenerate}
                  />
                </TabsContent>

                <TabsContent value="steps" className="m-0">
                  <MissionStepsView
                    missionId={mission.id}
                    steps={steps}
                    enhancedPlan={enhancedPlan}
                    onToggleStep={onToggleStep}
                  />
                </TabsContent>

                <TabsContent value="resources" className="m-0 space-y-4">
                  {/* Quick actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-9"
                      onClick={confirmAndRegenerate}
                      disabled={regenerating}
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", regenerating && "animate-spin")} />
                      Regenerar guía
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-9"
                      onClick={() => onToggleStatus(mission)}
                    >
                      {mission.status === "active" ? (
                        <><Pause className="w-3.5 h-3.5 mr-1.5" /> Pausar</>
                      ) : (
                        <><Play className="w-3.5 h-3.5 mr-1.5" /> Reanudar</>
                      )}
                    </Button>
                  </div>
                  <MissionSummaryView
                    mission={mission}
                    enhancedPlan={enhancedPlan}
                    loading={loading}
                    regenerating={regenerating}
                    estimatedTimeRemaining={estimatedTimeRemaining}
                    onRegenerate={confirmAndRegenerate}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Sticky CTA */}
            {mobileTab === "steps" && (
              <div className="sticky bottom-0 px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm">
                <Button 
                  className="w-full h-11 text-sm font-semibold" 
                  size="lg"
                  onClick={() => {
                    const nextStep = steps.findIndex(s => !s.done);
                    if (nextStep >= 0) {
                      onToggleStep(mission.id, nextStep);
                    }
                  }}
                  disabled={steps.every(s => s.done)}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {steps.every(s => s.done) ? "✅ Misión completada" : `Completar paso ${steps.findIndex(s => !s.done) + 1}`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="flex h-full min-h-0">
      {/* Left: Missions List — flush against sidebar */}
      <aside className="w-52 flex-shrink-0 border-r border-border flex flex-col min-h-0 bg-background">
        <div className="px-2 py-2 border-b border-border flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-7 w-7 flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold text-foreground truncate">Misiones</span>
        </div>

        {/* Missions list */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const grouped = filteredMissions.reduce<Record<string, typeof filteredMissions>>((acc, m) => {
              const area = m.area || "General";
              if (!acc[area]) acc[area] = [];
              acc[area].push(m);
              return acc;
            }, {});
            const areaKeys = Object.keys(grouped);

            if (areaKeys.length <= 1) {
              return filteredMissions.map((m) => (
                <SidebarMissionItem key={m.id} m={m} mission={mission} starredMissions={starredMissions} onSelectMission={onSelectMission} toggleStarred={toggleStarred} />
              ));
            }

            return areaKeys.map((area) => (
              <CollapsibleArea key={area} area={area} missions={grouped[area]} selectedMissionId={mission.id} starredMissions={starredMissions} onSelectMission={onSelectMission} toggleStarred={toggleStarred} />
            ));
          })()}
        </div>
      </aside>

      {/* Center: Main content */}
      <main ref={containerRef} className="flex-1 overflow-y-auto min-w-0">
        {/* Header — compact */}
        <header className="sticky top-0 z-20 px-5 py-3 border-b border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                {mission.title}
              </h1>
              <div className="flex items-center gap-2.5 mt-1 text-xs text-muted-foreground">
                <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px] h-5">
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(estimatedTimeRemaining)}
                </span>
                <span>{completedSteps}/{steps.length} pasos</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"
                      onClick={() => {
                        if (!window.confirm("¿Regenerar la guía?")) return;
                        fetchEnhancedPlan(true);
                        if (currentBusiness) {
                          supabase.functions.invoke("brain-record-signal", {
                            body: { businessId: currentBusiness.id, signalType: "mission_steps_regenerated", content: { missionId: mission.id, missionTitle: mission.title }, source: "ui" }
                          }).catch(console.error);
                        }
                      }}
                      disabled={regenerating}
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", regenerating && "animate-spin")} />
                      <span className="hidden lg:inline">Regenerar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Genera una nueva guía con enfoque alternativo</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => onToggleStatus(mission)}>
                      {mission.status === "active" ? <><Pause className="w-3.5 h-3.5" /><span className="hidden lg:inline">Pausar</span></> : <><Play className="w-3.5 h-3.5" /><span className="hidden lg:inline">Reanudar</span></>}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{mission.status === "active" ? "Pausar temporalmente" : "Reactivar misión"}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Progress value={progress} className="h-1 mt-2.5" />
        </header>

        {/* Loading State */}
        {loading && !enhancedPlan ? (
          <MissionLoadingState 
            businessName={currentBusiness?.name}
            missionTitle={mission.title}
          />
        ) : (
          <div className="p-5">
            {/* Toggle between Summary and Steps */}
            <div className="flex items-center gap-2 mb-5">
              <Button
                variant={viewMode === "summary" ? "default" : "outline"}
                onClick={() => setViewMode("summary")}
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Resumen
              </Button>
              <Button
                variant={viewMode === "steps" ? "default" : "outline"}
                onClick={() => setViewMode("steps")}
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                <List className="w-3.5 h-3.5" />
                Guía por pasos
              </Button>
            </div>

            {viewMode === "summary" ? (
              <MissionSummaryView
                mission={mission}
                enhancedPlan={enhancedPlan}
                loading={loading}
                regenerating={regenerating}
                estimatedTimeRemaining={estimatedTimeRemaining}
                onRegenerate={confirmAndRegenerate}
              />
            ) : (
              <MissionStepsView
                missionId={mission.id}
                steps={steps}
                enhancedPlan={enhancedPlan}
                onToggleStep={onToggleStep}
                selectedStepIdx={selectedStepIdx}
                onSelectStep={setSelectedStepIdx}
              />
            )}
          </div>
        )}
      </main>

      {/* Right: Steps Timeline — visible from lg */}
      {!loading && (
      <aside className="w-64 border-l border-border bg-background overflow-y-auto hidden lg:block flex-shrink-0">
          <div className="px-3 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-xs flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Pasos de la misión
            </h3>
          </div>
          <div className="p-2 space-y-1">
            {steps.map((step, idx) => {
              const isCurrentStep = steps.findIndex(s => !s.done) === idx;
              const isSelected = selectedStepIdx === idx;
              
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStepIdx(idx);
                    setViewMode("steps");
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all",
                    isSelected && "ring-1.5 ring-primary bg-primary/5",
                    step.done
                      ? "bg-success/5 border-success/20"
                      : isCurrentStep
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border/50 hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStep(mission.id, idx);
                      }}
                      className={cn(
                        "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold transition-colors mt-0.5",
                        step.done
                          ? "bg-success text-success-foreground"
                          : isCurrentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {step.done ? <Check className="w-3 h-3" /> : idx + 1}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-[11px] line-clamp-2 leading-relaxed",
                        step.done && "line-through text-muted-foreground",
                        isCurrentStep && !step.done && "text-primary font-medium"
                      )}>
                        {step.text}
                      </p>
                      {isCurrentStep && !step.done && (
                        <span className="text-[9px] text-primary font-semibold mt-0.5 inline-block">Siguiente →</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
};
