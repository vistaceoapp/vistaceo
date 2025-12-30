import { useState, useEffect } from "react";
import { Brain, ChevronRight, Clock, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "./GlassCard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface MicroQuestion {
  id: string;
  question: string;
  field_name: string;
  category: string;
  options?: string[];
}

interface BrainKnowledgeWidgetProps {
  className?: string;
}

export const BrainKnowledgeWidget = ({ className }: BrainKnowledgeWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const { brain, dataGaps } = useBrain();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<MicroQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answering, setAnswering] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMicroQuestions();
  }, [currentBusiness, dataGaps]);

  const fetchMicroQuestions = async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    try {
      // Use data gaps as micro-questions
      if (dataGaps && dataGaps.length > 0) {
        const microQuestions = dataGaps
          .filter(gap => gap.status === "pending")
          .slice(0, 3)
          .map(gap => {
            const gapQuestions = gap as { questions?: { text?: string }[] };
            const questionsArray = gapQuestions.questions;
            return {
              id: gap.id,
              question: questionsArray?.[0]?.text || gap.reason || `¿Cuál es tu ${gap.field_name}?`,
              field_name: gap.field_name,
              category: gap.category,
            };
          });
        setQuestions(microQuestions);
      } else {
        // Fallback questions
        setQuestions([
          {
            id: "1",
            question: "¿Cuántos empleados tenés actualmente?",
            field_name: "employee_count",
            category: "operations",
          },
          {
            id: "2", 
            question: "¿Cuál es tu día más fuerte de la semana?",
            field_name: "strongest_day",
            category: "sales",
          },
          {
            id: "3",
            question: "¿Qué porcentaje de ventas viene de delivery?",
            field_name: "delivery_percentage",
            category: "channels",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentBusiness || !questions[currentQuestionIndex]) return;
    setAnswering(true);

    try {
      const question = questions[currentQuestionIndex];
      
      // Record the answer as a signal
      await supabase.from("signals").insert({
        business_id: currentBusiness.id,
        signal_type: "micro_question_answer",
        source: "brain_knowledge_widget",
        content: { 
          question: question.question,
          answer,
          field_name: question.field_name,
          category: question.category
        },
        raw_text: `${question.question}: ${answer}`,
        confidence: "high",
        importance: 8
      });

      // Mark data gap as answered if it exists
      if (dataGaps?.find(g => g.id === question.id)) {
        await supabase
          .from("data_gaps")
          .update({ 
            status: "answered",
            answer: { value: answer },
            answered_at: new Date().toISOString(),
            answered_via: "micro_question"
          })
          .eq("id", question.id);
      }

      toast({
        title: "¡Gracias!",
        description: "Tu respuesta mejora las recomendaciones",
      });

      // Move to next question or close
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowQuestions(false);
        setCurrentQuestionIndex(0);
        fetchMicroQuestions();
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la respuesta",
        variant: "destructive",
      });
    } finally {
      setAnswering(false);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowQuestions(false);
      setCurrentQuestionIndex(0);
    }
  };

  const knowledgeProgress = brain?.mvc_completion_pct || 35;

  if (loading) {
    return (
      <GlassCard className={cn("p-5 animate-pulse", className)}>
        <div className="h-6 bg-muted rounded w-2/3 mb-4" />
        <div className="h-24 bg-muted rounded" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-5 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Conocimiento del negocio</h3>
            <p className="text-xs text-muted-foreground">Aprendizaje continuo</p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            knowledgeProgress >= 70 
              ? "bg-success/10 text-success border-success/30"
              : knowledgeProgress >= 40
              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
              : "bg-primary/10 text-primary border-primary/30"
          )}
        >
          {knowledgeProgress}%
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Personalización</span>
          <span className="text-foreground font-medium">{knowledgeProgress}%</span>
        </div>
        <Progress value={knowledgeProgress} className="h-2" />
      </div>

      {/* Questions section */}
      {showQuestions && questions.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs"
              onClick={() => setShowQuestions(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-3">
              {questions[currentQuestionIndex]?.question}
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tu respuesta..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                    handleAnswer((e.target as HTMLInputElement).value);
                  }
                }}
                disabled={answering}
              />
              <Button 
                size="sm" 
                className="gradient-primary"
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                  if (input?.value) handleAnswer(input.value);
                }}
                disabled={answering}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={handleSkip}
            >
              <Clock className="w-3 h-3 mr-1" />
              Más tarde
            </Button>
            <span className="text-[10px] text-muted-foreground">~30 segundos</span>
          </div>
        </div>
      ) : (
        <>
          {/* Micro questions CTA */}
          {questions.length > 0 && (
            <Button
              variant="outline"
              className="w-full justify-between h-auto py-3 px-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40"
              onClick={() => setShowQuestions(true)}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm">
                    {questions.length} preguntas rápidas
                  </p>
                  <p className="text-xs text-muted-foreground">~30 seg • Mejora recomendaciones</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-0">
                Responder ahora
              </Badge>
            </Button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-foreground">{brain?.total_signals || 0}</p>
              <p className="text-[10px] text-muted-foreground">Señales</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-foreground">{dataGaps?.filter(g => g.status === "answered").length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Respuestas</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-foreground">{brain?.confidence_score ? Math.round(Number(brain.confidence_score) * 100) : 0}%</p>
              <p className="text-[10px] text-muted-foreground">Confianza</p>
            </div>
          </div>

          {/* View more */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-xs"
            onClick={() => navigate("/app/diagnostic")}
          >
            Ver qué tanto te conozco
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </>
      )}
    </GlassCard>
  );
};

export default BrainKnowledgeWidget;
