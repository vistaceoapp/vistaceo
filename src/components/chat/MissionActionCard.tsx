import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Rocket, 
  Clock, 
  Zap, 
  ChevronRight,
  Loader2,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MissionSuggestion {
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2";
  kpi?: string;
  definition_of_done?: string[];
  due_hint?: string;
}

interface MissionActionCardProps {
  businessId: string;
  suggestions: MissionSuggestion[];
  onClose?: () => void;
}

const priorityConfig = {
  P0: { label: "Urgente", color: "text-destructive", bg: "bg-destructive/10" },
  P1: { label: "Alta", color: "text-amber-500", bg: "bg-amber-500/10" },
  P2: { label: "Normal", color: "text-primary", bg: "bg-primary/10" },
};

export const MissionActionCard = ({
  businessId,
  suggestions,
  onClose,
}: MissionActionCardProps) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<number | null>(null);
  const [created, setCreated] = useState<number[]>([]);

  const handleCreateMission = async (suggestion: MissionSuggestion, index: number) => {
    setCreating(index);

    try {
      const { data, error } = await supabase.from("missions").insert({
        business_id: businessId,
        title: suggestion.title,
        description: suggestion.description,
        status: "active",
        impact_score: suggestion.priority === "P0" ? 9 : suggestion.priority === "P1" ? 7 : 5,
        effort_score: 5,
        area: "custom",
        steps: suggestion.definition_of_done?.map((step, i) => ({
          id: i + 1,
          title: step,
          completed: false,
        })) || [],
      }).select().single();

      if (error) throw error;

      setCreated(prev => [...prev, index]);
      
      toast({
        title: "✅ Misión creada",
        description: `"${suggestion.title}" fue agregada a tus misiones activas.`,
      });

      // Optional: navigate to mission
      if (data) {
        setTimeout(() => {
          navigate(`/app/missions?mission=${data.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la misión",
        variant: "destructive",
      });
    } finally {
      setCreating(null);
    }
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="my-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Target className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            ¿Querés crear una misión?
          </h4>
          <p className="text-xs text-muted-foreground">
            Basado en tu solicitud, preparé estas opciones
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => {
          const priority = priorityConfig[suggestion.priority];
          const isCreating = creating === index;
          const isCreated = created.includes(index);

          return (
            <div
              key={index}
              className={cn(
                "rounded-xl border border-border/50 bg-card/50 p-3",
                "transition-all duration-200",
                isCreated && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium", priority.bg, priority.color)}>
                      {priority.label}
                    </span>
                    {suggestion.due_hint && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {suggestion.due_hint}
                      </span>
                    )}
                  </div>
                  <h5 className="text-sm font-medium text-foreground line-clamp-1">
                    {suggestion.title}
                  </h5>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {suggestion.description}
                  </p>
                  {suggestion.kpi && (
                    <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      KPI: {suggestion.kpi}
                    </p>
                  )}
                </div>

                <Button
                  variant={isCreated ? "ghost" : "default"}
                  size="sm"
                  onClick={() => handleCreateMission(suggestion, index)}
                  disabled={isCreating || isCreated}
                  className={cn(
                    "flex-shrink-0 h-8 px-3 gap-1",
                    isCreated && "text-green-600"
                  )}
                >
                  {isCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCreated ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Creada
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      Crear
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground">
          Podés personalizarlas después en Misiones
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/missions")}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          Ver todas
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
