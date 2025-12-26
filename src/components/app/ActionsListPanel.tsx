import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Eye, ChevronRight, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Action {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string | null;
  status: string;
}

interface ActionsListPanelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onRefresh?: () => void;
  className?: string;
}

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", emoji: "🔥", color: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alta", emoji: "⚡", color: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Media", emoji: "📌", color: "bg-primary/10 text-primary border-primary/20" },
  low: { label: "Normal", emoji: "📋", color: "bg-muted text-muted-foreground border-muted" },
};

export const ActionsListPanel = ({ 
  open = false,
  onOpenChange,
  onRefresh,
  className 
}: ActionsListPanelProps) => {
  const { currentBusiness } = useBusiness();
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchActions = async () => {
    if (!currentBusiness) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_actions")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .eq("scheduled_for", today)
        .order("priority", { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error("Error fetching actions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchActions();
    }
  }, [open, currentBusiness]);

  const handleComplete = async (action: Action) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ 
          status: "completed", 
          completed_at: new Date().toISOString() 
        })
        .eq("id", action.id);

      if (error) throw error;
      
      toast({
        title: "🎉 ¡Acción completada!",
        description: "Excelente trabajo. Sigue así.",
      });
      
      setSelectedAction(null);
      fetchActions();
      onRefresh?.();
    } catch (error) {
      console.error("Error completing action:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async (action: Action) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("daily_actions")
        .update({ status: "snoozed" })
        .eq("id", action.id);

      if (error) throw error;
      
      toast({
        title: "Acción pospuesta",
        description: "La verás mañana.",
      });
      
      setSelectedAction(null);
      fetchActions();
      onRefresh?.();
    } catch (error) {
      console.error("Error snoozing action:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingActions = actions.filter(a => a.status === "pending");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Acciones disponibles
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {selectedAction ? (
            // Action Detail View
            <div className="animate-fade-in">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedAction(null)}
                className="mb-4"
              >
                ← Volver a la lista
              </Button>

              <div className="space-y-4">
                <div>
                  <span className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full border inline-flex items-center gap-1",
                    PRIORITY_CONFIG[selectedAction.priority as keyof typeof PRIORITY_CONFIG]?.color || PRIORITY_CONFIG.medium.color
                  )}>
                    {PRIORITY_CONFIG[selectedAction.priority as keyof typeof PRIORITY_CONFIG]?.emoji}
                    {PRIORITY_CONFIG[selectedAction.priority as keyof typeof PRIORITY_CONFIG]?.label}
                  </span>
                  {selectedAction.category && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {selectedAction.category}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground">
                  {selectedAction.title}
                </h3>

                {selectedAction.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedAction.description}
                  </p>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleComplete(selectedAction)}
                    className="flex-1 gradient-primary"
                    disabled={loading}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Completar
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleSnooze(selectedAction)}
                    disabled={loading}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Después
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Actions List View
            <>
              {pendingActions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-foreground font-medium">¡Todo al día!</p>
                  <p className="text-sm text-muted-foreground">No hay acciones pendientes</p>
                </div>
              ) : (
                pendingActions.map((action) => {
                  const priorityConfig = PRIORITY_CONFIG[action.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                  return (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(action)}
                      className="w-full p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-1">{action.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full border",
                              priorityConfig.color
                            )}>
                              {priorityConfig.emoji} {priorityConfig.label}
                            </span>
                            {action.category && (
                              <span className="text-[10px] text-muted-foreground">{action.category}</span>
                            )}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ActionsListPanel;