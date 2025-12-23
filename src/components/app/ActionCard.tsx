import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, Zap, ChevronDown, ChevronUp, Lightbulb, TrendingUp, TrendingDown, Minus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionSignal {
  type: string;
  message: string;
  source?: string;
}

interface ChecklistItem {
  text: string;
  done: boolean;
}

interface Action {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string | null;
  signals?: ActionSignal[];
  checklist?: ChecklistItem[];
  status: string;
}

interface ActionCardProps {
  action: Action;
  onComplete: () => void;
  onSnooze: () => void;
  onSkip?: () => void;
  loading?: boolean;
  variant?: "default" | "compact";
}

const PRIORITY_CONFIG = {
  urgent: { label: "Urgente", emoji: "🔥", color: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "Alta", emoji: "⚡", color: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Media", emoji: "📌", color: "bg-primary/10 text-primary border-primary/20" },
  low: { label: "Normal", emoji: "📋", color: "bg-muted text-muted-foreground border-muted" },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  marketing: "📣",
  operaciones: "⚙️",
  finanzas: "💰",
  servicio: "⭐",
  equipo: "👥",
  default: "📌",
};

const OUTCOME_OPTIONS = [
  { value: "better", label: "Funcionó", emoji: "👍", icon: TrendingUp },
  { value: "same", label: "Normal", emoji: "➡️", icon: Minus },
  { value: "worse", label: "No funcionó", emoji: "👎", icon: TrendingDown },
];

export const ActionCard = ({ 
  action, 
  onComplete, 
  onSnooze, 
  onSkip,
  loading = false,
  variant = "default"
}: ActionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(
    (action.checklist || []) as ChecklistItem[]
  );

  const priorityConfig = PRIORITY_CONFIG[action.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
  const categoryEmoji = CATEGORY_EMOJIS[action.category || "default"] || CATEGORY_EMOJIS.default;

  const handleChecklistToggle = async (index: number) => {
    const newChecklist = [...localChecklist];
    newChecklist[index] = { ...newChecklist[index], done: !newChecklist[index].done };
    setLocalChecklist(newChecklist);

    try {
      await supabase
        .from("daily_actions")
        .update({ checklist: JSON.parse(JSON.stringify(newChecklist)) })
        .eq("id", action.id);
    } catch (error) {
      console.error("Error updating checklist:", error);
    }
  };

  const handleComplete = () => {
    setShowOutcome(true);
  };

  const handleOutcome = async (outcome: string) => {
    try {
      await supabase
        .from("daily_actions")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString(),
          outcome_rating: outcome === "better" ? 5 : outcome === "same" ? 3 : 1,
          outcome,
        })
        .eq("id", action.id);

      toast({
        title: "🎉 ¡Acción completada!",
        description: "Tu feedback mejora las futuras recomendaciones.",
      });

      onComplete();
    } catch (error) {
      console.error("Error completing action:", error);
    }
  };

  const completedCount = localChecklist.filter(item => item.done).length;
  const hasChecklist = localChecklist.length > 0;
  const signals = (action.signals || []) as ActionSignal[];

  if (variant === "compact") {
    return (
      <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{action.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn("px-2 py-0.5 rounded-full border", priorityConfig.color)}>
                {priorityConfig.emoji} {priorityConfig.label}
              </span>
              {action.category && <span>{categoryEmoji} {action.category}</span>}
            </div>
          </div>
          <Button size="sm" onClick={handleComplete} disabled={loading}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Outcome selection overlay
  if (showOutcome) {
    return (
      <div className="dashboard-card p-6 animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">¿Cómo fue el resultado?</h3>
          <p className="text-muted-foreground text-sm">Tu feedback mejora las recomendaciones futuras</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOutcome(option.value)}
              className={cn(
                "group p-4 rounded-xl text-center transition-all duration-200",
                "border border-border hover:border-primary/30 hover:shadow-md hover:bg-secondary/50"
              )}
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                {option.emoji}
              </span>
              <span className="text-sm font-medium text-foreground">{option.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowOutcome(false)}
          className="w-full mt-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
          <Zap className="w-7 h-7 text-primary-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Priority & Category badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={cn(
              "text-xs font-semibold px-3 py-1.5 rounded-full border",
              priorityConfig.color
            )}>
              {priorityConfig.emoji} {priorityConfig.label}
            </span>
            {action.category && (
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                {categoryEmoji} {action.category}
              </span>
            )}
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-foreground mb-2">
            {action.title}
          </h2>
          
          {/* Description */}
          {action.description && (
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {action.description}
            </p>
          )}

          {/* Signals - Why this action */}
          {signals.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-sm text-primary mb-1">
                <Lightbulb className="w-4 h-4" />
                <span className="font-medium">¿Por qué esta acción?</span>
              </div>
              {signals.slice(0, 2).map((signal, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  • {signal.message}
                </p>
              ))}
            </div>
          )}

          {/* Checklist */}
          {hasChecklist && (
            <div className="mb-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <span className="font-medium">
                  Checklist ({completedCount}/{localChecklist.length})
                </span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expanded && (
                <div className="bg-secondary/50 rounded-xl p-4 space-y-2 animate-fade-in">
                  {localChecklist.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChecklistToggle(idx)}
                      className="flex items-center gap-3 w-full text-left group"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                        item.done 
                          ? "bg-success border-success" 
                          : "border-muted-foreground/30 group-hover:border-primary"
                      )}>
                        {item.done && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        item.done 
                          ? "line-through text-muted-foreground" 
                          : "text-foreground"
                      )}>
                        {item.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleComplete} 
              size="lg"
              className="gradient-primary shadow-lg shadow-primary/20 hover:shadow-primary/40"
              disabled={loading}
            >
              <Check className="w-5 h-5 mr-2" />
              Completar
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={onSnooze}
              disabled={loading}
            >
              <Clock className="w-5 h-5 mr-2" />
              Después
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={onSkip}>
                  No aplica / Saltar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
