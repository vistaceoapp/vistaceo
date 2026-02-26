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
          <p className={cn("text-sm font-medium line-clamp-1", isSelected && "text-primary")}>
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

// Cache
const CACHE_PREFIX = "mission_plan_v4_";
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
  const { currentBusiness } = useBusiness();
  const [enhancedPlan, setEnhancedPlan] = useState<EnhancedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<string>("guide");
  
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
    setEnhancedPlan(null);
    setError(null);
    setMobileTab("guide");
    setViewMode("summary");
    
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
        <header className="sticky top-0 z-20 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2.5">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 flex-shrink-0 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-lg">{areaIcon}</span>
                <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px] h-5">
                  {mission.status === "active" ? "Activa" : "Pausada"}
                </Badge>
              </div>
              <h1 className="text-sm font-bold text-foreground line-clamp-1">
                {mission.title}
              </h1>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <Progress value={progress} className="flex-1 h-1.5" />
            <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              {completedSteps}/{steps.length} pasos
            </span>
          </div>
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
                    onRegenerate={() => fetchEnhancedPlan(true)}
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
                      onClick={() => {
                        fetchEnhancedPlan(true);
                      }}
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
                    onRegenerate={() => fetchEnhancedPlan(true)}
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
      {/* Left: Missions List + Filters */}
      <aside className="w-80 border-r border-border flex flex-col min-h-0 bg-background">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Misiones
          </Button>
          <h2 className="font-semibold text-foreground">Misiones</h2>
        </div>
        
        {/* Filters */}
        <MissionFilters
          areaFilter={localFilters.areaFilter}
          statusFilter={localFilters.statusFilter}
          sortBy={localFilters.sortBy}
          showStarredOnly={localFilters.showStarredOnly}
          starredCount={starredMissions.size}
          onAreaFilterChange={(v) => setLocalFilters(p => ({ ...p, areaFilter: v }))}
          onStatusFilterChange={(v) => setLocalFilters(p => ({ ...p, statusFilter: v }))}
          onSortByChange={(v) => setLocalFilters(p => ({ ...p, sortBy: v }))}
          onShowStarredOnlyChange={(v) => setLocalFilters(p => ({ ...p, showStarredOnly: v }))}
          compact
          className="border-b border-border"
        />

        {/* Missions list */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            // Group missions by area
            const grouped = filteredMissions.reduce<Record<string, typeof filteredMissions>>((acc, m) => {
              const area = m.area || "General";
              if (!acc[area]) acc[area] = [];
              acc[area].push(m);
              return acc;
            }, {});
            const areaKeys = Object.keys(grouped);

            // If only 1 group or filter active, show flat list
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
      <main ref={containerRef} className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-20 px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{areaIcon}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-lg font-bold text-foreground line-clamp-1">
                    {mission.title}
                  </h1>
                  <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                    {mission.status === "active" ? "Activa" : "Pausada"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(estimatedTimeRemaining)} restante
                  </span>
                  <span className="text-xs">{completedSteps}/{steps.length} pasos</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        fetchEnhancedPlan(true);
                        if (currentBusiness) {
                          supabase.functions.invoke("brain-record-signal", {
                            body: {
                              businessId: currentBusiness.id,
                              signalType: "mission_steps_regenerated",
                              content: {
                                missionId: mission.id,
                                missionTitle: mission.title,
                              },
                              source: "ui",
                            }
                          }).catch(console.error);
                        }
                      }}
                      disabled={regenerating}
                    >
                      <RefreshCw className={cn("w-4 h-4", regenerating && "animate-spin")} />
                      <span className="ml-1.5 hidden lg:inline text-xs">Regenerar guía</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Generaremos una nueva Guía de Pasos con un enfoque alternativo.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => onToggleStatus(mission)}
                    >
                      {mission.status === "active" ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span className="ml-1.5 hidden lg:inline text-xs">Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span className="ml-1.5 hidden lg:inline text-xs">Reanudar</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      {mission.status === "active" 
                        ? "Ocultar temporalmente. Podés reanudarla cuando quieras." 
                        : "Reactivar esta misión."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <Progress value={progress} className="h-1.5" />
          </div>
        </header>

        {/* Loading State */}
        {loading && !enhancedPlan ? (
          <MissionLoadingState 
            businessName={currentBusiness?.name}
            missionTitle={mission.title}
          />
        ) : (
          <div className="p-6">
            {/* Toggle between Summary and Steps */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant={viewMode === "summary" ? "default" : "outline"}
                onClick={() => setViewMode("summary")}
                size="sm"
                className="gap-2 h-9"
              >
                <Sparkles className="w-4 h-4" />
                Ver resumen de misión
              </Button>
              <Button
                variant={viewMode === "steps" ? "default" : "outline"}
                onClick={() => setViewMode("steps")}
                size="sm"
                className="gap-2 h-9"
              >
                <List className="w-4 h-4" />
                Ver guía por pasos
              </Button>
            </div>

            {/* Content */}
            {viewMode === "summary" ? (
              <MissionSummaryView
                mission={mission}
                enhancedPlan={enhancedPlan}
                loading={loading}
                regenerating={regenerating}
                estimatedTimeRemaining={estimatedTimeRemaining}
                onRegenerate={() => fetchEnhancedPlan(true)}
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

      {/* Right: Steps Timeline */}
      {viewMode === "steps" && !loading && (
        <aside className="w-72 border-l border-border bg-background overflow-y-auto hidden xl:block">
          <div className="px-4 py-3.5 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Timeline de pasos
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Haz clic en un paso para ver detalles
            </p>
          </div>
          <div className="p-3 space-y-1.5">
            {steps.map((step, idx) => {
              const isCurrentStep = steps.findIndex(s => !s.done) === idx;
              const isSelected = selectedStepIdx === idx;
              
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStepIdx(idx);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl border transition-all group",
                    isSelected && "ring-2 ring-primary shadow-sm",
                    step.done
                      ? "bg-success/5 border-success/20"
                      : isCurrentStep
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card border-border hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStep(mission.id, idx);
                      }}
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors",
                        step.done
                          ? "bg-success text-success-foreground hover:bg-success/80"
                          : isCurrentStep
                            ? "bg-primary text-primary-foreground hover:bg-primary/80"
                            : "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </button>
                    <p className={cn(
                      "text-[11px] line-clamp-2 flex-1 leading-snug",
                      step.done && "line-through text-muted-foreground"
                    )}>
                      {step.text}
                    </p>
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
