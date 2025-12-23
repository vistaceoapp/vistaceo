import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { cn } from "@/lib/utils";

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

const MissionsPage = () => {
  const { currentBusiness } = useBusiness();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Button variant="hero" onClick={() => window.location.href = "/onboarding"}>
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
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No tienes misiones activas
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Las misiones son mejoras guiadas que te ayudan a alcanzar objetivos específicos. 
            UCEO te sugerirá misiones basadas en tu negocio.
          </p>
          <Button variant="hero">
            Explorar misiones recomendadas
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const steps = (mission.steps || []) as { text: string; done: boolean }[];
            const completedSteps = steps.filter(s => s.done).length;
            const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

            return (
              <div
                key={mission.id}
                className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {mission.area && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {mission.area}
                        </span>
                      )}
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        mission.status === "active" 
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {mission.status === "active" ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground truncate">
                      {mission.title}
                    </h3>
                    {mission.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {mission.description}
                      </p>
                    )}
                    
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Paso {mission.current_step + 1} de {steps.length}
                        </span>
                        <span className="text-foreground font-medium">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Impact/Effort */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>Impacto: {mission.impact_score}/10</span>
                      <span>Esfuerzo: {mission.effort_score}/10</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Missions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Sugeridas para ti</h2>
        <div className="grid gap-4">
          {[
            { title: "Mejora tus reseñas en Google", area: "Reputación", impact: 8, effort: 4 },
            { title: "Optimiza tu menú digital", area: "Marketing", impact: 7, effort: 5 },
            { title: "Reduce tiempos de espera", area: "Operación", impact: 9, effort: 6 },
          ].map((suggestion, idx) => (
            <div
              key={idx}
              className="bg-card/50 border border-dashed border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-primary mb-1 block">{suggestion.area}</span>
                  <h3 className="font-medium text-foreground">{suggestion.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Impacto: {suggestion.impact}/10</span>
                    <span>Esfuerzo: {suggestion.effort}/10</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Iniciar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionsPage;
