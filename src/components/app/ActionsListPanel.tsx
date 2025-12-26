import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Eye, ChevronRight, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  actions: Action[];
  onViewAction: (action: Action) => void;
  onCompleteAction: (action: Action) => void;
  onSnoozeAction: (action: Action) => void;
  loading?: boolean;
  className?: string;
}

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", emoji: "🔥", color: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alta", emoji: "⚡", color: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Media", emoji: "📌", color: "bg-primary/10 text-primary border-primary/20" },
  low: { label: "Normal", emoji: "📋", color: "bg-muted text-muted-foreground border-muted" },
};

export const ActionsListPanel = ({ 
  actions, 
  onViewAction,
  onCompleteAction,
  onSnoozeAction,
  loading = false,
  className 
}: ActionsListPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const pendingActions = actions.filter(a => a.status === "pending");
  const pendingCount = pendingActions.length;

  const handleViewAction = (action: Action) => {
    setSelectedAction(action);
  };

  const handleComplete = (action: Action) => {
    onCompleteAction(action);
    setSelectedAction(null);
  };

  const handleSnooze = (action: Action) => {
    onSnoozeAction(action);
    setSelectedAction(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <GlassCard 
          interactive 
          className={cn("p-4 cursor-pointer", className)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Acciones disponibles</p>
              <p className="text-xs text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} accion${pendingCount > 1 ? 'es' : ''} pendiente${pendingCount > 1 ? 's' : ''}` : 'Sin acciones pendientes'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </GlassCard>
      </SheetTrigger>

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
                      onClick={() => handleViewAction(action)}
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