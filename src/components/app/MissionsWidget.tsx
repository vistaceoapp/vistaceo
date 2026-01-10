import { useState, useEffect } from "react";
import { Target, ChevronRight, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "./GlassCard";
import { useNavigate } from "react-router-dom";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  status: string;
  area: string | null;
  current_step: number | null;
  steps: unknown;
  impact_score: number | null;
}

interface MissionsWidgetProps {
  className?: string;
}

export const MissionsWidget = ({ className }: MissionsWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, [currentBusiness]);

  const fetchMissions = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setMissions((data || []) as Mission[]);
    } catch (error) {
      console.error("Error fetching missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMissionProgress = (mission: Mission) => {
    const steps = mission.steps as { done?: boolean; completed?: boolean }[] | null;
    if (!steps || steps.length === 0) return 0;
    // Support both 'done' (new schema) and 'completed' (legacy) field names
    const completed = steps.filter(s => s.done || s.completed).length;
    return Math.round((completed / steps.length) * 100);
  };

  const getAreaIcon = (area: string | null) => {
    const icons: Record<string, string> = {
      ventas: "💰",
      marketing: "📱",
      reputacion: "⭐",
      eficiencia: "⚙️",
      equipo: "👥",
      costos: "📊",
    };
    return icons[area || ""] || "🎯";
  };

  if (loading) {
    return (
      <GlassCard className={cn("p-4 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </GlassCard>
    );
  }

  if (missions.length === 0) {
    return (
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground text-sm">Misiones activas</h4>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            No tenés misiones activas
          </p>
          <Button 
            size="sm" 
            className="gradient-primary"
            onClick={() => navigate("/app/missions")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear misión
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Misiones activas</h4>
            <p className="text-xs text-muted-foreground">{missions.length} en progreso</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => navigate("/app/missions")}
        >
          Ver todo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Horizontal scrolling missions */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {missions.slice(0, 4).map((mission) => {
          const progress = getMissionProgress(mission);
          const steps = mission.steps as unknown[] | null;
          const totalSteps = steps?.length || 0;
          const currentStep = mission.current_step || 0;

          return (
            <button
              key={mission.id}
              className="flex-shrink-0 w-64 p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all text-left group"
              onClick={() => navigate(`/app/missions`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{getAreaIcon(mission.area)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {mission.title}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Paso {currentStep + 1} de {totalSteps}</span>
                  {mission.impact_score && (
                    <span className="text-success font-medium">
                      Impacto: {mission.impact_score}/10
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        
        {/* Add new mission card */}
        <button
          className="flex-shrink-0 w-48 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          onClick={() => navigate("/app/missions")}
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-medium">Nueva misión</span>
        </button>
      </div>
    </GlassCard>
  );
};

export default MissionsWidget;
