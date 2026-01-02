import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, ChevronRight, Check, Zap, TrendingUp, Clock, Play, Pause, 
  Sparkles, Plus, MoreHorizontal, Info, Filter, LayoutGrid, List,
  ChevronDown, ArrowUpDown, Layers, BarChart3, Calendar, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { ProgressRing } from "@/components/app/ProgressRing";
import { useIsMobile } from "@/hooks/use-mobile";
import { InboxCard } from "@/components/app/InboxCard";
import { DataNeededState } from "@/components/app/DataNeededState";
import { MissionPlanPreview } from "@/components/app/MissionPlanPreview";
import { MissionLLMMode } from "@/components/app/MissionLLMMode";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

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

interface Step {
  text: string;
  done: boolean;
  howTo?: string[];
  why?: string;
  timeEstimate?: string;
  metric?: string;
  confidence?: "high" | "medium" | "low";
}

// Area categories for filtering
const AREA_CATEGORIES = [
  { value: "all", label: "Todas las áreas", icon: "🎯" },
  { value: "Reputación", label: "Reputación", icon: "⭐" },
  { value: "Marketing", label: "Marketing", icon: "📱" },
  { value: "Operaciones", label: "Operaciones", icon: "⚙️" },
  { value: "Ventas", label: "Ventas", icon: "💰" },
  { value: "Equipo", label: "Equipo", icon: "👥" },
  { value: "Producto", label: "Producto", icon: "📦" },
  { value: "Finanzas", label: "Finanzas", icon: "📊" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activas" },
  { value: "paused", label: "Pausadas" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Más recientes" },
  { value: "impact", label: "Mayor impacto" },
  { value: "progress", label: "Más avanzadas" },
  { value: "effort", label: "Menor esfuerzo" },
];

// Check if we have enough data for personalized missions using Brain
const checkHasEnoughData = async (businessId: string): Promise<{ hasData: boolean; mvcCompletion: number }> => {
  try {
    const { data, error } = await supabase.functions.invoke("brain-analyze-gaps", {
      body: { businessId }
    });

    if (error) throw error;

    return {
      hasData: data.canGenerateSpecific || false,
      mvcCompletion: data.mvcCompletion || 0
    };
  } catch (error) {
    console.error("Error checking data:", error);
    const [integrationsRes, insightsRes] = await Promise.all([
      supabase.from("business_integrations").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("status", "connected"),
      supabase.from("business_insights").select("id", { count: "exact", head: true }).eq("business_id", businessId),
    ]);
    
    const integrations = integrationsRes.count || 0;
    const insights = insightsRes.count || 0;
    
    return {
      hasData: integrations >= 1 || insights >= 3,
      mvcCompletion: insights >= 5 ? 60 : insights * 10
    };
  }
};

// Placeholder missions
const PLACEHOLDER_MISSIONS = [
  { 
    title: "Mejora tus reseñas en Google",
    area: "Reputación", 
    icon: "⭐",
    description: "Aumenta tu rating promedio respondiendo a reseñas y pidiendo feedback a clientes satisfechos.",
    impact: 8, 
    effort: 4,
    steps: [
      "Responde a todas las reseñas negativas de los últimos 30 días",
      "Crea un protocolo para pedir reseñas a clientes satisfechos",
      "Entrena al equipo en el protocolo de feedback",
      "Implementa seguimiento semanal de rating",
    ]
  },
  { 
    title: "Optimiza tu menú digital", 
    area: "Marketing", 
    icon: "📱",
    description: "Mejora las fotos, descripciones y estructura de tu menú para aumentar el ticket promedio.",
    impact: 7, 
    effort: 5,
    steps: [
      "Fotografía los 10 platos más rentables",
      "Reescribe las descripciones con técnicas de venta",
      "Reorganiza el menú destacando items de alto margen",
      "Actualiza el menú en todas las plataformas",
    ]
  },
  { 
    title: "Reduce tiempos de espera", 
    area: "Operaciones", 
    icon: "⚡",
    description: "Analiza y mejora el flujo de trabajo para reducir el tiempo desde el pedido hasta la entrega.",
    impact: 9, 
    effort: 6,
    steps: [
      "Mide los tiempos actuales en cada turno",
      "Identifica los cuellos de botella principales",
      "Implementa mejoras en el proceso más lento",
      "Monitorea y ajusta por 2 semanas",
    ]
  },
];

const MissionsPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { currentBusiness } = useBusiness();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState<boolean | null>(null);
  const [starredMissions, setStarredMissions] = useState<Set<string>>(new Set());
  
  // Plan preview state
  const [selectedSuggestion, setSelectedSuggestion] = useState<typeof PLACEHOLDER_MISSIONS[0] | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [planLoading, setPlanLoading] = useState(false);
  
  // Filters
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Scroll position preservation
  const scrollPositionRef = useRef<number>(0);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Derived: get selected mission from ID
  const selectedMission = selectedMissionId 
    ? missions.find(m => m.id === selectedMissionId) || null 
    : null;

  // Check if we have enough data for personalized missions
  useEffect(() => {
    const checkData = async () => {
      if (!currentBusiness) return;
      const result = await checkHasEnoughData(currentBusiness.id);
      setHasEnoughData(result.hasData);
    };
    checkData();
  }, [currentBusiness]);

  useEffect(() => {
    if (currentBusiness) {
      fetchMissions();
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  const fetchMissions = async () => {
    if (!currentBusiness) return;

    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .in("status", ["active", "paused"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (error) {
      console.error("Error fetching missions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI plan for suggestion
  const generatePlanForSuggestion = async (suggestion: typeof PLACEHOLDER_MISSIONS[0], regenerate = false) => {
    if (!currentBusiness) return;
    
    setSelectedSuggestion(suggestion);
    setPlanLoading(true);
    setGeneratedPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-mission-plan", {
        body: {
          businessId: currentBusiness.id,
          missionTitle: suggestion.title,
          missionDescription: suggestion.description,
          missionArea: suggestion.area,
          regenerate,
        }
      });

      if (error) throw error;
      setGeneratedPlan(data.plan);
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el plan. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setPlanLoading(false);
    }
  };

  // Accept AI-generated plan
  const acceptPlan = async (steps: Step[]) => {
    if (!currentBusiness || !selectedSuggestion) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("missions")
        .insert({
          business_id: currentBusiness.id,
          title: generatedPlan?.planTitle || selectedSuggestion.title,
          description: generatedPlan?.planDescription || selectedSuggestion.description,
          area: selectedSuggestion.area,
          steps: steps.map(s => ({ ...s, done: false })),
          current_step: 0,
          impact_score: selectedSuggestion.impact,
          effort_score: selectedSuggestion.effort,
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "🚀 ¡Misión iniciada!",
        description: `"${selectedSuggestion.title}" con plan personalizado añadida.`,
      });

      setSelectedSuggestion(null);
      setGeneratedPlan(null);
      fetchMissions();
    } catch (error) {
      console.error("Error starting mission:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la misión",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const startMission = async (suggestion: typeof PLACEHOLDER_MISSIONS[0]) => {
    generatePlanForSuggestion(suggestion);
  };

  const toggleStep = async (missionId: string, stepIndex: number) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const steps = [...((mission.steps || []) as Step[])];
    steps[stepIndex] = { ...steps[stepIndex], done: !steps[stepIndex].done };
    
    let newCurrentStep = steps.findIndex(s => !s.done);
    if (newCurrentStep === -1) newCurrentStep = steps.length;

    try {
      const { error } = await supabase
        .from("missions")
        .update({ 
          steps: JSON.parse(JSON.stringify(steps)),
          current_step: newCurrentStep,
          status: newCurrentStep >= steps.length ? "completed" : "active",
          completed_at: newCurrentStep >= steps.length ? new Date().toISOString() : null,
        })
        .eq("id", missionId);

      if (error) throw error;

      if (newCurrentStep >= steps.length) {
        toast({
          title: "🎉 ¡Misión completada!",
          description: `Has terminado "${mission.title}"`,
        });
        setSelectedMissionId(null);
      }

      fetchMissions();
    } catch (error) {
      console.error("Error updating step:", error);
    }
  };

  const toggleMissionStatus = async (mission: Mission) => {
    try {
      const newStatus = mission.status === "active" ? "paused" : "active";
      
      const { error } = await supabase
        .from("missions")
        .update({ status: newStatus })
        .eq("id", mission.id);

      if (error) throw error;

      toast({
        title: newStatus === "active" ? "▶️ Misión reactivada" : "⏸️ Misión pausada",
      });

      fetchMissions();
    } catch (error) {
      console.error("Error toggling mission:", error);
    }
  };

  // Toggle starred
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

  // Filter and sort missions
  const getFilteredMissions = useCallback(() => {
    let filtered = [...missions];
    
    // Starred filter
    if (showStarredOnly) {
      filtered = filtered.filter(m => starredMissions.has(m.id));
    }
    
    // Area filter
    if (areaFilter !== "all") {
      filtered = filtered.filter(m => m.area === areaFilter);
    }
    
    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter);
    }
    
    // Sort - starred first, then by selected criteria
    switch (sortBy) {
      case "impact":
        filtered.sort((a, b) => b.impact_score - a.impact_score);
        break;
      case "effort":
        filtered.sort((a, b) => a.effort_score - b.effort_score);
        break;
      case "progress":
        filtered.sort((a, b) => {
          const aSteps = (a.steps || []) as Step[];
          const bSteps = (b.steps || []) as Step[];
          const aProgress = aSteps.length > 0 ? aSteps.filter(s => s.done).length / aSteps.length : 0;
          const bProgress = bSteps.length > 0 ? bSteps.filter(s => s.done).length / bSteps.length : 0;
          return bProgress - aProgress;
        });
        break;
      case "recent":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    
    // Always put starred missions first
    filtered.sort((a, b) => {
      const aStarred = starredMissions.has(a.id) ? 1 : 0;
      const bStarred = starredMissions.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
    
    return filtered;
  }, [missions, showStarredOnly, starredMissions, areaFilter, statusFilter, sortBy]);

  const filteredMissions = getFilteredMissions();
  
  // Calculate stats
  const activeMissions = missions.filter(m => m.status === "active");
  const pausedMissions = missions.filter(m => m.status === "paused");
  const allSteps = missions.flatMap(m => (m.steps || []) as Step[]);
  const completedStepsCount = allSteps.filter(s => s.done).length;
  const totalProgress = allSteps.length > 0 ? (completedStepsCount / allSteps.length) * 100 : 0;

  // Get unique areas from missions
  const uniqueAreas = [...new Set(missions.map(m => m.area).filter(Boolean))];

  // Handle entering LLM Mission Mode
  const handleSelectMission = useCallback((missionId: string) => {
    // Save scroll position
    if (listContainerRef.current) {
      scrollPositionRef.current = listContainerRef.current.scrollTop;
    }
    setSelectedMissionId(missionId);
  }, []);

  // Handle going back to list
  const handleBackToList = useCallback(() => {
    setSelectedMissionId(null);
    // Restore scroll position after render
    requestAnimationFrame(() => {
      if (listContainerRef.current) {
        listContainerRef.current.scrollTop = scrollPositionRef.current;
      }
    });
  }, []);

  // Handle selecting different mission from within LLM Mode
  const handleSelectMissionFromLLM = useCallback((mission: Mission) => {
    setSelectedMissionId(mission.id);
  }, []);

  // Shared Plan Preview Modal
  const renderPlanPreviewModal = () => (
    <Dialog open={!!selectedSuggestion} onOpenChange={() => { setSelectedSuggestion(null); setGeneratedPlan(null); }}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto",
        isMobile 
          ? "max-w-lg bg-card/95 backdrop-blur-xl border-border/50" 
          : "max-w-2xl bg-card border-border"
      )}>
        {selectedSuggestion && (
          <MissionPlanPreview
            plan={generatedPlan || { 
              planTitle: selectedSuggestion.title,
              planDescription: selectedSuggestion.description,
              estimatedDuration: "1-2 semanas",
              estimatedImpact: "Mejora significativa",
              steps: [] 
            }}
            missionTitle={selectedSuggestion.title}
            missionArea={selectedSuggestion.area}
            isLoading={planLoading}
            onAccept={(steps) => acceptPlan(steps)}
            onDismiss={() => { setSelectedSuggestion(null); setGeneratedPlan(null); }}
            onRegenerate={() => generatePlanForSuggestion(selectedSuggestion, true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-card rounded-xl animate-pulse w-1/2" />
        <div className="h-32 bg-card rounded-xl animate-pulse" />
        <div className="h-32 bg-card rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Target className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Misiones guiadas
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Configura tu negocio para desbloquear misiones personalizadas de mejora continua.
        </p>
        <Button variant="hero" size="lg" onClick={() => navigate("/onboarding")}>
          <Sparkles className="w-5 h-5 mr-2" />
          Configurar negocio
        </Button>
      </div>
    );
  }

  // ========== LLM MISSION MODE (inline, no modal) ==========
  if (selectedMission) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <MissionLLMMode
          mission={selectedMission}
          businessId={currentBusiness.id}
          onToggleStep={toggleStep}
          onToggleStatus={toggleMissionStatus}
          onBack={handleBackToList}
          allMissions={filteredMissions}
          onSelectMission={handleSelectMissionFromLLM}
        />
        {renderPlanPreviewModal()}
      </div>
    );
  }

  // ========== DESKTOP LIST VIEW ==========
  if (!isMobile) {
    return (
      <div ref={listContainerRef} className="space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Misiones
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] p-3">
                    <p className="font-semibold text-foreground mb-1 text-sm">¿Qué son las Misiones?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Las misiones son proyectos de mejora guiados paso a paso. 
                      Cada una tiene pasos concretos para que avances de forma estructurada.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h1>
            <p className="text-muted-foreground">Proyectos de mejora guiados paso a paso</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-5 gap-4">
          <div className="dashboard-stat col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Progreso general</span>
              </div>
              <span className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{completedStepsCount} pasos completados</span>
              <span>{allSteps.length} totales</span>
            </div>
          </div>
          
          <div className="dashboard-stat">
            <div className="flex items-center gap-2 mb-2">
              <Play className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-foreground">{activeMissions.length}</div>
            <div className="text-sm text-muted-foreground">Activas</div>
          </div>
          
          <div className="dashboard-stat">
            <div className="flex items-center gap-2 mb-2">
              <Pause className="w-5 h-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-foreground">{pausedMissions.length}</div>
            <div className="text-sm text-muted-foreground">Pausadas</div>
          </div>
          
          <div className="dashboard-stat">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">{uniqueAreas.length}</div>
            <div className="text-sm text-muted-foreground">Áreas activas</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="dashboard-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtros:</span>
            </div>
            
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Área" />
              </SelectTrigger>
              <SelectContent>
                {AREA_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Starred filter */}
            <Button
              variant={showStarredOnly ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setShowStarredOnly(!showStarredOnly)}
            >
              <Star className={cn("w-4 h-4 mr-2", showStarredOnly && "fill-current")} />
              Destacadas ({starredMissions.size})
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Missions List - 2 columns */}
          <div className="col-span-2 space-y-4">
            {filteredMissions.length > 0 ? (
              <div className="dashboard-card overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/30 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Misiones {areaFilter !== "all" ? `de ${areaFilter}` : "en progreso"}
                  </h3>
                  <span className="text-sm text-muted-foreground">{filteredMissions.length} resultados</span>
                </div>
                <div className="divide-y divide-border">
                  {filteredMissions.map((mission) => {
                    const steps = (mission.steps || []) as Step[];
                    const completedSteps = steps.filter(s => s.done).length;
                    const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
                    const nextStep = steps.find(s => !s.done);

                    return (
                      <div
                        key={mission.id}
                        className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer group"
                        onClick={() => handleSelectMission(mission.id)}
                      >
                        <div className="flex items-center gap-4">
                          <ProgressRing 
                            progress={progress} 
                            size={56} 
                            strokeWidth={4}
                            showGlow={mission.status === "active"}
                          >
                            <span className="text-lg">
                              {AREA_CATEGORIES.find(c => c.value === mission.area)?.icon || "🎯"}
                            </span>
                          </ProgressRing>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-foreground truncate">
                                {mission.title}
                              </h4>
                              <Badge variant={mission.status === "active" ? "default" : "secondary"} className="text-[10px]">
                                {mission.status === "active" ? "Activa" : "Pausada"}
                              </Badge>
                            </div>
                            
                            {/* Next step preview */}
                            {nextStep && mission.status === "active" && (
                              <p className="text-sm text-muted-foreground truncate mb-1">
                                Próximo: {nextStep.text}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {mission.area && (
                                <Badge variant="outline" className="text-[10px]">
                                  {mission.area}
                                </Badge>
                              )}
                              <span>{completedSteps}/{steps.length} pasos</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-success" />
                                Impacto {mission.impact_score}/10
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Star button */}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => toggleStarred(mission.id, e)}
                              className={cn(
                                "transition-colors",
                                starredMissions.has(mission.id) && "text-warning"
                              )}
                            >
                              <Star className={cn("w-4 h-4", starredMissions.has(mission.id) && "fill-current")} />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem onClick={() => toggleMissionStatus(mission)}>
                                  {mission.status === "active" ? (
                                    <>
                                      <Pause className="w-4 h-4 mr-2" />
                                      Pausar
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Reactivar
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : hasEnoughData === false ? (
              <DataNeededState 
                context="missions"
                onAskQuestion={() => navigate("/app/chat")}
              />
            ) : areaFilter !== "all" || statusFilter !== "all" ? (
              <div className="dashboard-card p-8 text-center">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  No hay misiones con estos filtros
                </h2>
                <p className="text-muted-foreground mb-4">
                  Prueba cambiando los filtros o inicia una nueva misión
                </p>
                <Button variant="outline" onClick={() => { setAreaFilter("all"); setStatusFilter("all"); }}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="dashboard-card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Analizando tu negocio...
                </h2>
                <p className="text-muted-foreground">
                  Estamos preparando misiones personalizadas para ti
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Suggestions */}
          <div className="space-y-4">
            <InboxCard variant="compact" />
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Sugeridas para ti</h3>
            </div>
            
            {hasEnoughData && PLACEHOLDER_MISSIONS.filter(s => 
              !missions.some(m => m.title === s.title)
            ).map((suggestion, idx) => (
              <div
                key={idx}
                className="dashboard-card p-4 border-dashed hover:border-solid"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] mb-1">
                      {suggestion.area}
                    </Badge>
                    <h4 className="font-medium text-foreground text-sm">
                      {suggestion.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-success flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {suggestion.impact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {suggestion.steps.length} pasos
                    </span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => startMission(suggestion)}
                    disabled={actionLoading}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Iniciar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {renderPlanPreviewModal()}
      </div>
    );
  }

  // ========== MOBILE LIST VIEW ==========
  return (
    <div ref={listContainerRef} className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Misiones
        </h1>
        <p className="text-muted-foreground">Mejoras guiadas paso a paso</p>
      </div>

      {/* Mobile Progress */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Tu progreso</span>
          <span className="text-lg font-bold text-primary">{Math.round(totalProgress)}%</span>
        </div>
        <Progress value={totalProgress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{activeMissions.length} activas</span>
          <span>{completedStepsCount}/{allSteps.length} pasos</span>
        </div>
      </GlassCard>

      {/* Mobile Area Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {AREA_CATEGORIES.slice(0, 5).map((cat) => (
          <button
            key={cat.value}
            onClick={() => setAreaFilter(areaFilter === cat.value ? "all" : cat.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all min-h-[36px]",
              areaFilter === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Mobile Missions List */}
      {filteredMissions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {filteredMissions.map((mission, idx) => {
            const steps = (mission.steps || []) as Step[];
            const completedSteps = steps.filter(s => s.done).length;
            const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

            return (
              <GlassCard
                key={mission.id}
                variant={mission.status === "active" ? "glow" : "default"}
                interactive
                className="p-5 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => handleSelectMission(mission.id)}
              >
                <div className="flex items-start gap-4">
                  <ProgressRing 
                    progress={progress} 
                    size={56} 
                    strokeWidth={4}
                    showGlow={mission.status === "active"}
                  >
                    <span className="text-lg">
                      {AREA_CATEGORIES.find(c => c.value === mission.area)?.icon || "🎯"}
                    </span>
                  </ProgressRing>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {mission.area && (
                        <Badge variant="outline" className="text-[10px]">
                          {mission.area}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-foreground text-lg leading-tight">
                      {mission.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-muted-foreground">
                        {completedSteps} de {steps.length} pasos
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {filteredMissions.length === 0 && (
        <GlassCard className="p-8 text-center animate-fade-in">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {areaFilter !== "all" ? "Sin misiones en esta área" : "Preparando misiones..."}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {areaFilter !== "all" ? "Prueba con otra área o inicia una nueva misión" : "El sistema está seleccionando la mejor misión"}
          </p>
        </GlassCard>
      )}

      {/* Mobile Suggestions */}
      <div className="animate-fade-in">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Sugeridas para ti
        </h2>
        
        <div className="space-y-4">
          {hasEnoughData && PLACEHOLDER_MISSIONS.filter(s => 
            !missions.some(m => m.title === s.title)
          ).map((suggestion, idx) => (
            <GlassCard
              key={idx}
              className="p-5 border-dashed animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-[10px] mb-1">
                      {suggestion.area}
                    </Badge>
                    <h3 className="font-semibold text-foreground">{suggestion.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <TrendingUp className="w-3 h-3" />
                        {suggestion.impact}/10
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {suggestion.steps.length} pasos
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => startMission(suggestion)}
                  disabled={actionLoading}
                  className="flex-shrink-0 h-10"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {renderPlanPreviewModal()}
    </div>
  );
};

export default MissionsPage;
