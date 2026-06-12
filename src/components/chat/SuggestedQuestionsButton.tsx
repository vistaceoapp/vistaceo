import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Lightbulb,
  AlertTriangle,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatSuggestedQuestions } from "@/hooks/use-chat-suggested-questions";

interface SuggestedQuestionsButtonProps {
  businessId: string;
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

const categoryConfig = {
  problema: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Problema detectado",
  },
  oportunidad: {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Oportunidad",
  },
  mejora: {
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Área de mejora",
  },
  analisis: {
    icon: BarChart3,
    color: "text-muted-foreground",
    bg: "bg-secondary",
    label: "Análisis",
  },
} as const;

export const SuggestedQuestionsButton = ({
  businessId,
  onSelectQuestion,
  disabled = false,
}: SuggestedQuestionsButtonProps) => {
  const [open, setOpen] = useState(false);
  const { suggestions, loading, refresh } = useChatSuggestedQuestions(businessId, { auto: open });

  const handleSelectQuestion = (question: string) => {
    setOpen(false);
    onSelectQuestion(question);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs">Preguntas sugeridas</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[75vh] rounded-t-2xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Preguntas sugeridas para vos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Actualizar
            </Button>
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-left">
            Generadas por la IA con el contexto real de tu negocio
          </p>
        </SheetHeader>

        <div className="space-y-2 pb-6">
          {loading && suggestions.length === 0 ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </>
          ) : (
            suggestions.map((q) => {
              const config = categoryConfig[q.category];
              const Icon = config.icon;

              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q.text)}
                  disabled={disabled}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-xl text-left",
                    "bg-card border border-border/50",
                    "hover:border-primary/30 hover:bg-secondary/30",
                    "transition-all duration-200 active:scale-[0.98]",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">{q.text}</p>
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider mt-1 block",
                        config.color,
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
