import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSuggestedQuestions } from "@/hooks/use-chat-suggested-questions";

interface ChatSuggestedQuestionsProps {
  businessId: string;
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const categoryConfig = {
  problema: { icon: AlertTriangle, color: "text-destructive" },
  oportunidad: { icon: Lightbulb, color: "text-amber-500" },
  mejora: { icon: Target, color: "text-primary" },
  analisis: { icon: BarChart3, color: "text-muted-foreground" },
} as const;

export const ChatSuggestedQuestions = ({
  businessId,
  onSelectQuestion,
  disabled = false,
  compact = false,
}: ChatSuggestedQuestionsProps) => {
  const { suggestions, loading, refresh } = useChatSuggestedQuestions(businessId);
  const questions = suggestions.slice(0, 4);

  if (loading && questions.length === 0) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-7 w-32 flex-shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
            Preguntas sugeridas
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={disabled || loading}
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
            title="Regenerar"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {questions.map((q) => {
            const config = categoryConfig[q.category];
            const Icon = config.icon;
            return (
              <Button
                key={q.id}
                variant="ghost"
                size="sm"
                onClick={() => onSelectQuestion(q.text)}
                disabled={disabled}
                className="flex-shrink-0 h-auto py-1.5 px-2.5 gap-1.5 text-xs bg-muted/30 hover:bg-muted/50 max-w-[240px]"
              >
                <Icon className={cn("w-3 h-3 flex-shrink-0", config.color)} />
                <span className="truncate">{q.text}</span>
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">Preguntas sugeridas para vos</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={disabled || loading}
          className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {questions.map((q) => {
          const config = categoryConfig[q.category];
          const Icon = config.icon;
          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.text)}
              disabled={disabled}
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl text-left",
                "bg-card/50 border border-border/40 hover:border-primary/30",
                "transition-all duration-200 hover:scale-[1.01]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)} />
              <span className="text-xs text-foreground/80 line-clamp-2">{q.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
