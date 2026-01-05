import { useState, useEffect, useCallback } from "react";
import { Brain, ChevronRight, Clock, Sparkles, Check, X, RefreshCw, Loader2 } from "lucide-react";
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

interface GeneratedQuestion {
  question: string;
  options: string[];
  category: string;
  impact: string;
}

interface BrainKnowledgeWidgetProps {
  className?: string;
}

export const BrainKnowledgeWidget = ({ className }: BrainKnowledgeWidgetProps) => {
  const { currentBusiness } = useBusiness();
  const { brain, recordSignal, refreshBrain } = useBrain();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
  const [answering, setAnswering] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insightsCount, setInsightsCount] = useState(0);
  const [customAnswer, setCustomAnswer] = useState("");

  // Fetch insights count
  const fetchInsightsCount = useCallback(async () => {
    if (!currentBusiness) return;
    
    try {
      const { count, error } = await supabase
        .from("business_insights")
        .select("*", { count: "exact", head: true })
        .eq("business_id", currentBusiness.id);
      
      if (!error && count !== null) {
        setInsightsCount(count);
      }
    } catch (error) {
      console.error("Error fetching insights count:", error);
    }
  }, [currentBusiness]);

  // Generate a new personalized question
  const generateQuestion = useCallback(async () => {
    if (!currentBusiness) return;
    
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-question", {
        body: { businessId: currentBusiness.id }
      });

      if (error) throw error;
      
      if (data?.question) {
        setCurrentQuestion(data.question);
      }
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback question
      setCurrentQuestion({
        question: "¿Cuál es tu mayor desafío esta semana?",
        options: ["Atraer clientes", "Reducir costos", "Gestionar equipo", "Mejorar servicio"],
        category: "operaciones",
        impact: "Priorizar las recomendaciones diarias"
      });
    } finally {
      setGenerating(false);
    }
  }, [currentBusiness]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      if (!currentBusiness) {
        setLoading(false);
        return;
      }
      
      await fetchInsightsCount();
      await generateQuestion();
      setLoading(false);
    };
    
    init();
  }, [currentBusiness, fetchInsightsCount, generateQuestion]);

  const handleAnswer = async (answer: string) => {
    if (!currentBusiness || !currentQuestion) return;
    setAnswering(true);

    try {
      // 1. Save to business_insights (permanent knowledge)
      await supabase.from("business_insights").insert({
        business_id: currentBusiness.id,
        question: currentQuestion.question,
        answer: answer,
        category: currentQuestion.category,
        metadata: { 
          options: currentQuestion.options,
          impact: currentQuestion.impact,
          source: "brain_knowledge_widget"
        }
      });

      // 2. Record signal to brain (for dynamic learning)
      await recordSignal(
        "learning_answer",
        { 
          question: currentQuestion.question,
          answer,
          category: currentQuestion.category,
          impact: currentQuestion.impact,
          options: currentQuestion.options
        },
        "brain_knowledge_widget"
      );

      // 3. Update brain factual memory
      if (brain?.id) {
        const { data: currentBrainData } = await supabase
          .from("business_brains")
          .select("factual_memory")
          .eq("id", brain.id)
          .single();

        const factualMemory = (currentBrainData?.factual_memory || {}) as Record<string, unknown>;
        const categoryKey = `learning_${currentQuestion.category}`;
        const categoryAnswers = (factualMemory[categoryKey] as { q: string; a: string; t: string }[]) || [];
        
        const updatedMemory = {
          ...factualMemory,
          [categoryKey]: [
            ...categoryAnswers,
            { q: currentQuestion.question, a: answer, t: new Date().toISOString() }
          ].slice(-10) // Keep last 10 per category
        };

        await supabase
          .from("business_brains")
          .update({ 
            factual_memory: updatedMemory as unknown as Record<string, never>,
            last_learning_at: new Date().toISOString()
          })
          .eq("id", brain.id);
      }

      toast({
        title: "¡Aprendido!",
        description: "Tu respuesta mejora todas las recomendaciones",
      });

      // Update count and generate next question
      setInsightsCount(prev => prev + 1);
      setCustomAnswer("");
      await generateQuestion();
      await refreshBrain();
      
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

  const handleSkip = async () => {
    // Record that user skipped this question
    if (currentBusiness && currentQuestion) {
      await recordSignal(
        "learning_skipped",
        { 
          question: currentQuestion.question,
          category: currentQuestion.category
        },
        "brain_knowledge_widget"
      );
    }
    
    setCustomAnswer("");
    await generateQuestion();
  };

  const handleRegenerateQuestion = async () => {
    setCustomAnswer("");
    await generateQuestion();
  };

  // Calculate knowledge progress
  const knowledgeProgress = Math.min(
    Math.round((insightsCount / 50) * 100), // Target: 50 insights for 100%
    100
  );

  const getKnowledgeLevel = () => {
    if (insightsCount < 5) return { label: "Iniciando", color: "text-muted-foreground" };
    if (insightsCount < 15) return { label: "Aprendiendo", color: "text-amber-500" };
    if (insightsCount < 30) return { label: "Conociendo", color: "text-primary" };
    if (insightsCount < 50) return { label: "Experto", color: "text-success" };
    return { label: "Maestro", color: "text-success" };
  };

  const level = getKnowledgeLevel();

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
            <p className="text-xs text-muted-foreground">
              {insightsCount} aprendidos • <span className={level.color}>{level.label}</span>
            </p>
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
      {showQuestions && currentQuestion ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-primary/5">
                {currentQuestion.category}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleRegenerateQuestion}
                disabled={generating}
              >
                <RefreshCw className={cn("w-3 h-3", generating && "animate-spin")} />
              </Button>
            </div>
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
            {generating ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">Generando pregunta...</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-foreground mb-3">
                  {currentQuestion.question}
                </p>
                
                {/* Options as buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 text-xs text-left justify-start whitespace-normal"
                      onClick={() => handleAnswer(option)}
                      disabled={answering}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Custom answer */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="O escribí tu respuesta..."
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customAnswer.trim()) {
                        handleAnswer(customAnswer.trim());
                      }
                    }}
                    disabled={answering}
                  />
                  <Button 
                    size="sm" 
                    className="gradient-primary"
                    onClick={() => {
                      if (customAnswer.trim()) handleAnswer(customAnswer.trim());
                    }}
                    disabled={answering || !customAnswer.trim()}
                  >
                    {answering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Impact hint */}
                {currentQuestion.impact && (
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    💡 {currentQuestion.impact}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={handleSkip}
              disabled={generating || answering}
            >
              <Clock className="w-3 h-3 mr-1" />
              Más tarde
            </Button>
            <span className="text-[10px] text-muted-foreground">~30 segundos</span>
          </div>
        </div>
      ) : (
        <>
          {/* Start learning CTA */}
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-3 px-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40"
            onClick={() => setShowQuestions(true)}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">
                  Responder pregunta rápida
                </p>
                <p className="text-xs text-muted-foreground">~30 seg • Mejora recomendaciones</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-0">
              +1
            </Badge>
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-foreground">{insightsCount}</p>
              <p className="text-[10px] text-muted-foreground">Aprendidos</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/30">
              <p className="text-lg font-bold text-foreground">{brain?.total_signals || 0}</p>
              <p className="text-[10px] text-muted-foreground">Señales</p>
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
