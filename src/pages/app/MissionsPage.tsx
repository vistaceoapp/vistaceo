import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Plus, Check, Zap, TrendingUp, Clock, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

interface Step {
  text: string;
  done: boolean;
}

const SUGGESTED_MISSIONS = [
  { 
    title: "Mejora tus reseñas en Google", 
    area: "Reputación", 
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
  const { currentBusiness } = useBusiness();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
        title: "¡Misión iniciada!",
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
    
    // Update current_step to the first incomplete step
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
        title: newStatus === "active" ? "Misión reactivada" : "Misión pausada",
      });

      fetchMissions();
    } catch (error) {
      console.error("Error toggling mission:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/2" />
        <div className="h-32 bg-card rounded-2xl" />
        <div className="h-32 bg-card rounded-2xl" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Misiones guiadas
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Configura tu negocio para desbloquear misiones personalizadas.
        </p>
        <Button variant="hero" onClick={() => navigate("/onboarding")}>
          Configurar negocio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Misiones</h1>
          <p className="text-muted-foreground">Mejoras guiadas paso a paso</p>
        </div>
      </div>

      {/* Active Missions */}
      {missions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Misiones activas ({missions.length})
          </h2>
          {missions.map((mission) => {
            const steps = (mission.steps || []) as Step[];
            const completedSteps = steps.filter(s => s.done).length;
            const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

            return (
              <div
                key={mission.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSelectedMission(mission)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                    mission.status === "active" ? "gradient-primary shadow-lg" : "bg-muted"
                  )}>
                    <Target className={cn(
                      "w-7 h-7",
                      mission.status === "active" ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {mission.area && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                          {mission.area}
                        </span>
                      )}
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        mission.status === "active" 
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {mission.status === "active" ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">
                      {mission.title}
                    </h3>
                    
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                          {completedSteps} de {steps.length} pasos
                        </span>
                        <span className="text-foreground font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            mission.status === "active" ? "bg-primary" : "bg-muted-foreground"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Impact/Effort */}
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="flex items-center gap-1 text-success">
                        <TrendingUp className="w-3 h-3" />
                        Impacto {mission.impact_score}/10
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Esfuerzo {mission.effort_score}/10
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Active Missions */}
      {missions.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            No tienes misiones activas
          </h2>
          <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
            Las misiones son mejoras guiadas que te ayudan a alcanzar objetivos específicos.
          </p>
        </div>
      )}

      {/* Suggested Missions */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Sugeridas para ti
        </h2>
        <div className="grid gap-4">
          {SUGGESTED_MISSIONS.filter(s => 
            !missions.some(m => m.title === s.title)
          ).map((suggestion, idx) => (
            <div
              key={idx}
              className="bg-card/50 border border-dashed border-border rounded-xl p-5 hover:border-primary/30 hover:bg-card transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {suggestion.area}
                  </span>
                  <h3 className="font-semibold text-foreground mt-2 text-lg">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-3 h-3" />
                      Impacto {suggestion.impact}/10
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Esfuerzo {suggestion.effort}/10
                    </span>
                    <span className="text-muted-foreground">
                      {suggestion.steps.length} pasos
                    </span>
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
            </div>
          ))}
        </div>
      </div>

      {/* Mission Detail Dialog */}
      <Dialog open={!!selectedMission} onOpenChange={() => setSelectedMission(null)}>
        <DialogContent className="max-w-lg">
          {selectedMission && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedMission.area && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
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
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      step.done ? "bg-success/10" : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
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
                  className="flex-1"
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
};

export default MissionsPage;
