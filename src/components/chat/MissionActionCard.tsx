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
  Check,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { validateBeforeStore } from "@/lib/validate-before-store";
import { emitBrainEvent } from "@/lib/brain-event-ledger";

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
  P0: { label: "Urgente", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/20" },
  P1: { label: "Alta", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" },
  P2: { label: "Normal", dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-500/20" },
};

export const MissionActionCard = ({
  businessId,
  suggestions,
}: MissionActionCardProps) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState<number | null>(null);
  const [created, setCreated] = useState<Record<number, string>>({});
  const [expanded, setExpanded] = useState<number | null>(0);

  const handleCreateMission = async (suggestion: MissionSuggestion, index: number) => {
    setCreating(index);

    try {
      // Gate ligero para misiones sugeridas desde el chat: ya vienen de la IA
      // con contexto completo. Solo verificamos Red List + mínimos de forma
      // (título / descripción / pasos) — no aplicamos el audit estricto del
      // pipeline de misiones generadas por el sistema (que pide métricas,
      // sector, novelty vs existentes, etc.) porque acá no aplica.
      const audit = await validateBeforeStore(
        {
          type: 'chat_response',
          businessId,
          title: suggestion.title,
          description: suggestion.description,
        },
        { id: businessId, name: '' },
        []
      );
      const minTitle = (suggestion.title?.trim().length ?? 0) >= 8;
      const minDesc = (suggestion.description?.trim().length ?? 0) >= 20;
      const hasSteps = (suggestion.definition_of_done?.length ?? 0) >= 1;
      const redListBlocked = audit.issues.some(i => i.code === 'RED_LIST_LEAK');

      if (redListBlocked || !minTitle || !minDesc || !hasSteps) {
        await emitBrainEvent({
          eventType: 'quality_gate_failed',
          businessId,
          sourceModule: 'chat',
          rawInput: suggestion,
          quality: { passed: false, score: 0, failedReason: redListBlocked ? 'red_list' : 'too_short' },
        });
        toast({
          title: 'No se pudo activar la misión',
          description: 'El contenido necesita más detalle. Pedile al asistente que la reformule.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.from("missions").insert({
        business_id: businessId,
        title: suggestion.title,
        description: suggestion.description,
        status: "active",
        impact_score: suggestion.priority === "P0" ? 9 : suggestion.priority === "P1" ? 7 : 5,
        effort_score: 5,
        area: "Personalizada",
        steps: suggestion.definition_of_done?.map((step, i) => ({
          id: i + 1,
          title: step,
          completed: false,
        })) || [],
      }).select().single();

      if (error) throw error;

      await emitBrainEvent({
        eventType: 'mission_created',
        businessId,
        sourceModule: 'chat',
        normalizedInput: { missionId: data?.id, title: suggestion.title, priority: suggestion.priority },
        brainFieldsUpdated: ['missions'],
      });

      setCreated(prev => ({ ...prev, [index]: data?.id ?? '' }));

      toast({
        title: "Misión activada",
        description: `Abriendo "${suggestion.title}" en Misiones…`,
      });

      // UX: llevar al usuario directo a la misión recién creada.
      // Damos un microdelay para que se vea el feedback del botón.
      if (data?.id) {
        setTimeout(() => navigate(`/app/missions?mission=${data.id}`), 350);
      }
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "No pudimos activarla",
        description: "Reintentá en un momento.",
        variant: "destructive",
      });
    } finally {
      setCreating(null);
    }
  };

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="my-4 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm animate-fade-in">
      {/* Header con gradient marca */}
      <div
        className="relative px-4 py-3 border-b border-border/40"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(262 70% 65% / 0.08))',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #2692DC, #746CE6)' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              Misión lista para activar
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Generada con tu Brain · {suggestions.length === 1 ? '1 acción' : `${suggestions.length} opciones`}
            </p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="divide-y divide-border/40">
        {suggestions.map((suggestion, index) => {
          const priority = priorityConfig[suggestion.priority] ?? priorityConfig.P1;
          const isCreating = creating === index;
          const createdId = created[index];
          const isCreated = createdId !== undefined;
          const isOpen = expanded === index;
          const dod = suggestion.definition_of_done ?? [];

          return (
            <div
              key={index}
              className={cn(
                "px-4 py-3 transition-all duration-200",
                isCreated && "bg-emerald-500/[0.03]",
                !isCreated && "hover:bg-muted/40"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : index)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-medium", priority.text)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
                        {priority.label}
                      </span>
                      {suggestion.due_hint && (
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {suggestion.due_hint}
                        </span>
                      )}
                      {dod.length > 0 && (
                        <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                          <ListChecks className="w-3 h-3" />
                          {dod.length} pasos
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-medium text-foreground leading-snug">
                      {suggestion.title}
                    </h5>
                    <p className={cn(
                      "text-xs text-muted-foreground mt-1 leading-relaxed",
                      !isOpen && "line-clamp-2"
                    )}>
                      {suggestion.description}
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-1 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )}
                  />
                </div>
              </button>

              {/* Expandido: KPI + pasos */}
              {isOpen && (dod.length > 0 || suggestion.kpi) && (
                <div className="mt-3 pl-0 space-y-2.5 animate-fade-in">
                  {suggestion.kpi && (
                    <div className="flex items-start gap-2 text-xs">
                      <Zap className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">KPI: </span>
                        <span className="text-muted-foreground">{suggestion.kpi}</span>
                      </div>
                    </div>
                  )}
                  {dod.length > 0 && (
                    <ol className="space-y-1.5 text-xs text-muted-foreground">
                      {dod.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* CTA */}
              <div className="mt-3 flex items-center gap-2">
                {isCreated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="flex-1 h-9 gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Activada
                    </Button>
                    {createdId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/app/missions?mission=${createdId}`)}
                        className="h-9 gap-1 text-xs"
                      >
                        Ver misión
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleCreateMission(suggestion, index); }}
                    disabled={isCreating}
                    className="flex-1 h-9 gap-1.5 text-white border-0 shadow-sm hover:shadow-md transition-shadow"
                    style={{ background: 'linear-gradient(135deg, #2692DC, #746CE6)' }}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Activando...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
                        Aplicar a misión
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border/40 flex justify-between items-center">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Target className="w-3 h-3" />
          Personalizables en Misiones
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/missions")}
          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
        >
          Ver todas
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
