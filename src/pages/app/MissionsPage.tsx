import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Check, Zap, TrendingUp, Clock, Play, Pause, Sparkles, Plus, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/app/GlassCard";
import { ProgressRing } from "@/components/app/ProgressRing";
import { useIsMobile } from "@/hooks/use-mobile";
import { InboxCard } from "@/components/app/InboxCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

const SUGGESTED_MISSIONS = [
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
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-start a mission if none exist
  const autoStartMission = async () => {
    if (!currentBusiness || actionLoading) return;
    setActionLoading(true);

    try {
      // Pick the first available suggestion
      const availableSuggestion = SUGGESTED_MISSIONS.find(s => 
        !missions.some(m => m.title === s.title)
      );

      if (availableSuggestion) {
        const steps = availableSuggestion.steps.map(text => ({ text, done: false }));
        
        await supabase
          .from("missions")
          .insert({
            business_id: currentBusiness.id,
            title: availableSuggestion.title,
            description: availableSuggestion.description,
            area: availableSuggestion.area,
            steps,
            current_step: 0,
            impact_score: availableSuggestion.impact,
            effort_score: availableSuggestion.effort,
            status: "active",
          });

        fetchMissions();
      }
    } catch (error) {
      console.error("Error auto-starting mission:", error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (currentBusiness) {
      fetchMissions();
    } else {
      setLoading(false);
    }
  }, [currentBusiness]);

  // Proactively start a mission if none exist
  useEffect(() => {
    if (!loading && currentBusiness && missions.length === 0 && !actionLoading) {
      autoStartMission();
    }
  }, [loading, currentBusiness, missions.length]);

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

  const startMission = async (suggestion: typeof SUGGESTED_MISSIONS[0]) => {
    if (!currentBusiness) return;
    setActionLoading(true);

    try {
      const steps = suggestion.steps.map(text => ({ text, done: false }));
      
      const { error } = await supabase
        .from("missions")
        .insert({
          business_id: currentBusiness.id,
          title: suggestion.title,
          description: suggestion.description,
          area: suggestion.area,
          steps,
          current_step: 0,
          impact_score: suggestion.impact,
          effort_score: suggestion.effort,
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "🚀 ¡Misión iniciada!",
        description: `"${suggestion.title}" añadida a tus misiones activas.`,
      });

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
        setSelectedMission(null);
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

  // Calculate stats
  const activeMissions = missions.filter(m => m.status === "active");
  const pausedMissions = missions.filter(m => m.status === "paused");
  
  // Calculate total steps and completed
  const allSteps = missions.flatMap(m => (m.steps || []) as Step[]);
  const completedStepsCount = allSteps.filter(s => s.done).length;
  
  // Get next best step
  const getNextBestStep = () => {
    const activeMission = activeMissions.find(m => {
      const steps = (m.steps || []) as Step[];
      return steps.some(s => !s.done);
    });
    if (!activeMission) return null;
    
    const steps = (activeMission.steps || []) as Step[];
    const nextStepIndex = steps.findIndex(s => !s.done);
    if (nextStepIndex === -1) return null;
    
    return {
      mission: activeMission,
      step: steps[nextStepIndex],
      stepIndex: nextStepIndex
    };
  };
  
  const nextBestStep = getNextBestStep();

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Misiones
            </h1>
            <p className="text-muted-foreground">Proyectos de mejora guiados paso a paso</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {activeMissions.length} activas
            </span>
          </div>
        </div>

        {/* Stats Row - Cómo venís */}
        <div className="grid grid-cols-4 gap-4">
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
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{completedStepsCount}</div>
            <div className="text-sm text-muted-foreground">Pasos completados</div>
          </div>
          <div className="dashboard-stat">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-foreground">{allSteps.length}</div>
            <div className="text-sm text-muted-foreground">Pasos totales</div>
          </div>
        </div>

        {/* Next Best Step - Highlighted */}
        {nextBestStep && (
          <div className="dashboard-card p-5 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tu siguiente mejor paso hoy</p>
                  <h3 className="font-semibold text-foreground">{nextBestStep.step.text}</h3>
                  <p className="text-xs text-primary mt-1">{nextBestStep.mission.title}</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  toggleStep(nextBestStep.mission.id, nextBestStep.stepIndex);
                  toast({ title: "✅ ¡Paso completado!" });
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar como hecho
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Active Missions - 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Active Missions Table */}
            {missions.length > 0 ? (
              <div className="dashboard-card overflow-hidden">
                <div className="p-4 border-b border-border bg-secondary/30">
                  <h3 className="font-semibold text-foreground">Misiones en progreso</h3>
                </div>
                <div className="divide-y divide-border">
                  {missions.map((mission) => {
                    const steps = (mission.steps || []) as Step[];
                    const completedSteps = steps.filter(s => s.done).length;
                    const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

                    return (
                      <div
                        key={mission.id}
                        className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer group"
                        onClick={() => setSelectedMission(mission)}
                      >
                        <div className="flex items-center gap-4">
                          <ProgressRing 
                            progress={progress} 
                            size={48} 
                            strokeWidth={4}
                            showGlow={mission.status === "active"}
                          >
                            <span className="text-xs font-bold text-primary">
                              {Math.round(progress)}%
                            </span>
                          </ProgressRing>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground truncate">
                                {mission.title}
                              </h4>
                              <span className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                mission.status === "active" 
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {mission.status === "active" ? "Activa" : "Pausada"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {mission.area && (
                                <span className="text-primary">{mission.area}</span>
                              )}
                              <span>{completedSteps}/{steps.length} pasos</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-success" />
                                {mission.impact_score}/10
                              </span>
                            </div>
                          </div>

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
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="dashboard-card p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Sparkles className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Preparando tu primera misión...
                </h2>
                <p className="text-muted-foreground">
                  El sistema está seleccionando la mejor misión para tu negocio
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Suggestions + Learning */}
          <div className="space-y-4">
            {/* Micro-question */}
            <InboxCard variant="compact" />
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Sugeridas</h3>
            </div>
            
            {SUGGESTED_MISSIONS.filter(s => 
              !missions.some(m => m.title === s.title)
            ).map((suggestion, idx) => (
              <div
                key={idx}
                className="dashboard-card p-4 border-dashed hover:border-solid"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
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
                    <span className="text-success">↑{suggestion.impact}</span>
                    <span>{suggestion.steps.length} pasos</span>
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

        {/* Mission Detail Dialog */}
        <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
          <DialogContent className="max-w-lg bg-card border-border">
            {selectedMission && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedMission.area && (
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {selectedMission.area}
                      </span>
                    )}
                  </div>
                  <DialogTitle className="text-xl">{selectedMission.title}</DialogTitle>
                  <DialogDescription>
                    {selectedMission.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                  <div className="text-sm font-medium text-muted-foreground">Pasos</div>
                  {((selectedMission.steps || []) as Step[]).map((step, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleStep(selectedMission.id, idx)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all",
                        step.done 
                          ? "bg-success/10 border border-success/20" 
                          : "bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        step.done 
                          ? "bg-success border-success" 
                          : "border-muted-foreground/30 hover:border-primary"
                      )}>
                        {step.done && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className={cn(
                        "text-sm",
                        step.done ? "line-through text-muted-foreground" : "text-foreground"
                      )}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => toggleMissionStatus(selectedMission)}
                  >
                    {selectedMission.status === "active" ? (
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
                  </Button>
                  <Button 
                    className="flex-1 gradient-primary"
                    onClick={() => setSelectedMission(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Mobile Layout (keep existing)
  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          Misiones
        </h1>
        <p className="text-muted-foreground">Mejoras guiadas paso a paso</p>
      </div>

      {missions.length > 0 && (
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Activas ({missions.length})
          </h2>
          
          {missions.map((mission, idx) => {
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
                onClick={() => setSelectedMission(mission)}
              >
                <div className="flex items-start gap-4">
                  <ProgressRing 
                    progress={progress} 
                    size={56} 
                    strokeWidth={4}
                    showGlow={mission.status === "active"}
                  >
                    <Target className={cn(
                      "w-5 h-5",
                      mission.status === "active" ? "text-primary" : "text-muted-foreground"
                    )} />
                  </ProgressRing>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {mission.area && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          {mission.area}
                        </span>
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

      {missions.length === 0 && (
        <GlassCard className="p-8 text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Preparando tu primera misión...
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            El sistema está seleccionando la mejor misión para tu negocio
          </p>
        </GlassCard>
      )}

      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Sugeridas para ti
        </h2>
        
        <div className="space-y-4">
          {SUGGESTED_MISSIONS.filter(s => 
            !missions.some(m => m.title === s.title)
          ).map((suggestion, idx) => (
            <GlassCard
              key={idx}
              className="p-5 border-dashed animate-fade-in"
              style={{ animationDelay: `${(idx + 3) * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mt-1">{suggestion.title}</h3>
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
                  className="flex-shrink-0"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Iniciar
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-border/50">
          {selectedMission && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMission.title}</DialogTitle>
                <DialogDescription>
                  {selectedMission.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {((selectedMission.steps || []) as Step[]).map((step, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleStep(selectedMission.id, idx)}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all",
                      step.done 
                        ? "bg-success/10 border border-success/20" 
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      step.done ? "bg-success border-success" : "border-muted-foreground/30"
                    )}>
                      {step.done && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className={cn(
                      "text-sm",
                      step.done ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => toggleMissionStatus(selectedMission)}>
                  {selectedMission.status === "active" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {selectedMission.status === "active" ? "Pausar" : "Reactivar"}
                </Button>
                <Button className="flex-1 gradient-primary" onClick={() => setSelectedMission(null)}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionsPage;
