import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, ChevronRight, MessageSquare, Lightbulb, TrendingUp, HelpCircle, Users, DollarSign, Zap, Target, Brain, Rocket, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { Progress } from "@/components/ui/progress";

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

const MOTIVATIONAL_MESSAGES = [
  { min: 0, max: 5, message: "¡Empecemos! Cuéntame más sobre tu negocio", icon: Rocket },
  { min: 6, max: 15, message: "¡Excelente! Ya estoy entendiendo tu negocio", icon: Lightbulb },
  { min: 16, max: 30, message: "¡Vamos bien! Cada respuesta mejora mis consejos", icon: TrendingUp },
  { min: 31, max: 50, message: "¡Impresionante! Conozco muy bien tu operación", icon: Star },
  { min: 51, max: 100, message: "¡Increíble! Soy casi un experto en tu negocio", icon: Brain },
  { min: 101, max: Infinity, message: "🧠 ¡CEO Mode activado! Máxima personalización", icon: Brain },
];

interface InboxCardProps {
  variant?: "compact" | "full" | "hero";
  onAnswer?: () => void;
}

export const InboxCard = ({ variant = "full", onAnswer }: InboxCardProps) => {
  const { currentBusiness } = useBusiness();
  const [currentQuestion, setCurrentQuestion] = useState<MicroQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const getMotivationalMessage = () => {
    for (const msg of MOTIVATIONAL_MESSAGES) {
      if (questionCount >= msg.min && questionCount <= msg.max) {
        return msg;
      }
    }
    return MOTIVATIONAL_MESSAGES[0];
  };

  const getKnowledgeLevel = () => {
    if (questionCount < 10) return { level: "Conociendo", progress: (questionCount / 10) * 100, color: "bg-muted-foreground" };
    if (questionCount < 25) return { level: "Aprendiendo", progress: ((questionCount - 10) / 15) * 100, color: "bg-warning" };
    if (questionCount < 50) return { level: "Entendiendo", progress: ((questionCount - 25) / 25) * 100, color: "bg-primary" };
    if (questionCount < 100) return { level: "Dominando", progress: ((questionCount - 50) / 50) * 100, color: "bg-success" };
    return { level: "Experto", progress: 100, color: "bg-primary" };
  };

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
        question: "¿Cuál es tu mayor desafío esta semana?",
        options: ["Atraer más clientes", "Mejorar el servicio", "Reducir costos", "Gestionar el equipo"],
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
        description: "Ahora puedo darte mejores recomendaciones.",
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
    fetchQuestion();
  };

  if (loading) {
    return (
      <div className={cn(
        "animate-pulse rounded-2xl",
        variant === "hero" ? "p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20" :
        variant === "compact" ? "p-4 bg-card border border-border" : 
        "p-6 bg-card border border-border"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const CategoryIcon = CATEGORY_ICONS[currentQuestion.category] || HelpCircle;
  const motivation = getMotivationalMessage();
  const MotivationIcon = motivation.icon;
  const knowledge = getKnowledgeLevel();

  // Hero variant - prominent version for main pages
  if (variant === "hero") {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-2 border-primary/30 p-6 shadow-lg shadow-primary/10">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse" />
        
        <div className="relative z-10">
          {/* Header with brain icon and motivation */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-primary/40 rounded-full animate-pulse" />
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 relative">
                  <Brain className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <MotivationIcon className="w-5 h-5 text-primary" />
                  {motivation.message}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {questionCount} respuestas guardadas
                </p>
              </div>
            </div>
          </div>

          {/* Knowledge progress bar */}
          <div className="mb-5 bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Nivel de conocimiento: <span className="text-primary">{knowledge.level}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.min(questionCount, 100)}/100
              </span>
            </div>
            <Progress value={Math.min(questionCount, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Mientras más me cuentes, más inteligentes serán mis recomendaciones
            </p>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full",
              "bg-primary/10 text-primary border border-primary/20"
            )}>
              <CategoryIcon className="w-3.5 h-3.5" />
              {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              → {currentQuestion.impact}
            </span>
          </div>

          {/* Question */}
          <p className="text-xl font-semibold text-foreground mb-5 leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={saving}
                className={cn(
                  "p-4 rounded-xl text-sm font-medium transition-all text-left group",
                  "bg-card hover:bg-primary hover:text-primary-foreground",
                  "border-2 border-border hover:border-primary",
                  "hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]",
                  "flex items-center gap-2",
                  saving && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                {option}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Cada respuesta personaliza tu CEO virtual
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Otra pregunta
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant for sidebars
  if (variant === "compact") {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary">{questionCount} aprendidos</span>
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {currentQuestion.question}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {currentQuestion.options.slice(0, 4).map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={saving}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                "bg-secondary hover:bg-primary hover:text-primary-foreground",
                "border border-transparent hover:border-primary/30"
              )}
            >
              {option}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleSkip}
          className="w-full mt-3 text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 py-1"
        >
          Otra pregunta <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className="dashboard-card p-6 border-2 border-primary/20 shadow-lg shadow-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full animate-pulse" />
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center relative shadow-lg shadow-primary/30">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <MotivationIcon className="w-4 h-4 text-primary" />
              {motivation.message}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <CategoryIcon className={cn("w-3 h-3", CATEGORY_COLORS[currentQuestion.category])} />
              {currentQuestion.impact}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            {questionCount} aprendidos
          </span>
        </div>
      </div>

      {/* Mini progress */}
      <div className="mb-4">
        <Progress value={Math.min(questionCount, 100)} className="h-1.5" />
      </div>

      <p className="text-lg font-semibold text-foreground mb-4">
        {currentQuestion.question}
      </p>

      <div className="grid grid-cols-2 gap-2">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option)}
            disabled={saving}
            className={cn(
              "p-3 rounded-xl text-sm font-medium transition-all text-left group",
              "bg-secondary/50 hover:bg-primary hover:text-primary-foreground",
              "border border-transparent hover:border-primary/30",
              "hover:shadow-md hover:shadow-primary/10",
              "flex items-center gap-2",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            {option}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Cada respuesta mejora tus recomendaciones
        </span>
        <button
          onClick={handleSkip}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
        >
          Otra pregunta
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default InboxCard;