import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Clock, Sparkles, ChevronRight, MessageSquare, Lightbulb, TrendingUp, HelpCircle, Users, DollarSign, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";

interface MicroQuestion {
  question: string;
  options: string[];
  category: string;
  impact: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  operaciones: TrendingUp,
  equipo: Users,
  clientes: MessageSquare,
  marketing: Lightbulb,
  finanzas: DollarSign,
  producto: Zap,
  tecnologia: Target,
  competencia: Target,
  general: HelpCircle,
};

const CATEGORY_COLORS: Record<string, string> = {
  operaciones: "text-success",
  equipo: "text-primary",
  clientes: "text-accent",
  marketing: "text-warning",
  finanzas: "text-destructive",
  producto: "text-primary",
  tecnologia: "text-muted-foreground",
  competencia: "text-warning",
  general: "text-muted-foreground",
};

interface InboxCardProps {
  variant?: "compact" | "full";
  onAnswer?: () => void;
}

export const InboxCard = ({ variant = "full", onAnswer }: InboxCardProps) => {
  const { currentBusiness } = useBusiness();
  const [currentQuestion, setCurrentQuestion] = useState<MicroQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  // Fetch a new question from AI
  const fetchQuestion = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: { businessId: currentBusiness.id }
      });

      if (error) throw error;

      if (data?.question) {
        setCurrentQuestion(data.question);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      // Fallback question
      setCurrentQuestion({
        question: "¿Cuál es tu mayor desafío hoy?",
        options: ["Ventas", "Personal", "Costos", "Tiempo"],
        category: "general",
        impact: "Priorizar recomendaciones",
      });
    } finally {
      setLoading(false);
    }
  };

  // Count existing insights
  const fetchInsightCount = async () => {
    if (!currentBusiness) return;
    
    try {
      const { count } = await supabase
        .from("business_insights")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id);
      
      setQuestionCount(count || 0);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  useEffect(() => {
    fetchQuestion();
    fetchInsightCount();
  }, [currentBusiness]);

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !currentBusiness) return;
    
    setSaving(true);
    try {
      // Save to business_insights table
      const { error } = await supabase.from("business_insights").insert({
        business_id: currentBusiness.id,
        category: currentQuestion.category,
        question: currentQuestion.question,
        answer,
        metadata: {
          impact: currentQuestion.impact,
          options: currentQuestion.options,
        },
      });

      if (error) throw error;

      toast({
        title: "✨ ¡Aprendido!",
        description: "Esto mejorará las recomendaciones.",
      });

      setQuestionCount(prev => prev + 1);
      onAnswer?.();
      
      // Fetch next question automatically
      fetchQuestion();
    } catch (error) {
      console.error("Error saving answer:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la respuesta",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    // Just fetch a new question without saving
    fetchQuestion();
  };

  if (loading) {
    return (
      <GlassCard className={cn("animate-pulse", variant === "compact" ? "p-4" : "p-6")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const CategoryIcon = CATEGORY_ICONS[currentQuestion.category] || HelpCircle;

  if (variant === "compact") {
    return (
      <GlassCard className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            "bg-primary/10"
          )}>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">
              {currentQuestion.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.slice(0, 3).map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={saving}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    "bg-secondary hover:bg-primary hover:text-primary-foreground",
                    "border border-transparent hover:border-primary/30"
                  )}
                >
                  {option}
                </button>
              ))}
              {currentQuestion.options.length > 3 && (
                <span className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{currentQuestion.options.length - 3}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            "gradient-primary"
          )}>
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Conociendo tu negocio</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CategoryIcon className={cn("w-3 h-3", CATEGORY_COLORS[currentQuestion.category])} />
              {currentQuestion.impact}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {questionCount} aprendidos
          </span>
          <button
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-lg font-medium text-foreground mb-4">
        {currentQuestion.question}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={saving}
            className={cn(
              "p-3 rounded-xl text-sm font-medium transition-all text-left",
              "bg-secondary/50 hover:bg-primary hover:text-primary-foreground",
              "border border-transparent hover:border-primary/30",
              "hover:shadow-md hover:shadow-primary/10",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Cada respuesta personaliza tu asistente
        </span>
        <button
          onClick={handleSkip}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          Otra pregunta
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default InboxCard;
