import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Clock, Sparkles, ChevronRight, MessageSquare, Lightbulb, TrendingUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";

interface MicroQuestion {
  id: string;
  question: string;
  options: string[];
  category: "operations" | "marketing" | "finance" | "service" | "general";
  impact: string; // Why this question matters
}

// Sample questions - In production, these would come from the AI engine
const SAMPLE_QUESTIONS: MicroQuestion[] = [
  {
    id: "q1",
    question: "¿Cuál es tu horario con más clientes?",
    options: ["Desayuno", "Almuerzo", "Merienda", "Cena", "Parejo todo el día"],
    category: "operations",
    impact: "Optimizar staff y promociones",
  },
  {
    id: "q2", 
    question: "¿Cuántos empleados tienes normalmente por turno?",
    options: ["1-2", "3-5", "6-10", "Más de 10"],
    category: "operations",
    impact: "Calcular eficiencia operativa",
  },
  {
    id: "q3",
    question: "¿Qué plataforma de delivery usas más?",
    options: ["PedidosYa", "Rappi", "Uber Eats", "Propio", "No hago delivery"],
    category: "marketing",
    impact: "Recomendaciones de canal",
  },
  {
    id: "q4",
    question: "¿Cuál es tu producto estrella?",
    options: ["Café/Bebidas", "Plato principal", "Postres", "Combos", "Otro"],
    category: "marketing",
    impact: "Estrategia de promoción",
  },
  {
    id: "q5",
    question: "¿Qué problema te quita más tiempo?",
    options: ["Inventario", "Personal", "Marketing", "Clientes difíciles", "Finanzas"],
    category: "general",
    impact: "Priorizar recomendaciones",
  },
];

const CATEGORY_ICONS = {
  operations: TrendingUp,
  marketing: Lightbulb,
  finance: TrendingUp,
  service: MessageSquare,
  general: HelpCircle,
};

const CATEGORY_COLORS = {
  operations: "text-success",
  marketing: "text-primary",
  finance: "text-warning",
  service: "text-accent",
  general: "text-muted-foreground",
};

interface InboxCardProps {
  variant?: "compact" | "full";
  onAnswer?: () => void;
}

export const InboxCard = ({ variant = "full", onAnswer }: InboxCardProps) => {
  const { currentBusiness } = useBusiness();
  const [currentQuestion, setCurrentQuestion] = useState<MicroQuestion | null>(null);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get a random unanswered question
    const unanswered = SAMPLE_QUESTIONS.filter(q => !answeredIds.includes(q.id));
    if (unanswered.length > 0) {
      setCurrentQuestion(unanswered[Math.floor(Math.random() * unanswered.length)]);
    } else {
      setCurrentQuestion(null);
    }
  }, [answeredIds]);

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion || !currentBusiness) return;
    
    setSaving(true);
    try {
      // In production, this would save to a proper table and feed the AI engine
      // For now, we'll save as a chat message with metadata
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: `[Micro-pregunta] ${currentQuestion.question}: ${answer}`,
        metadata: {
          type: "micro_question",
          question_id: currentQuestion.id,
          category: currentQuestion.category,
          answer,
        },
      });

      setAnsweredIds(prev => [...prev, currentQuestion.id]);
      
      toast({
        title: "✨ ¡Gracias!",
        description: "Esta info mejorará las recomendaciones.",
      });

      onAnswer?.();
    } catch (error) {
      console.error("Error saving answer:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSnooze = () => {
    if (currentQuestion) {
      // Move to next question without answering
      setAnsweredIds(prev => [...prev, currentQuestion.id]);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const CategoryIcon = CATEGORY_ICONS[currentQuestion.category];

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
            onClick={handleSnooze}
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
            <h3 className="font-semibold text-foreground">Micro-pregunta</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CategoryIcon className={cn("w-3 h-3", CATEGORY_COLORS[currentQuestion.category])} />
              {currentQuestion.impact}
            </p>
          </div>
        </div>
        <button
          onClick={handleSnooze}
          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <Clock className="w-4 h-4" />
        </button>
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
              "hover:shadow-md hover:shadow-primary/10"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">
          {SAMPLE_QUESTIONS.length - answeredIds.length} preguntas restantes
        </span>
        <button
          onClick={handleSnooze}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          Saltar
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default InboxCard;
