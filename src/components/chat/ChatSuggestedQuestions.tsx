import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Lightbulb,
  HelpCircle,
  RefreshCw,
  Users,
  DollarSign,
  Star,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestedQuestion {
  id: string;
  text: string;
  category: "problema" | "oportunidad" | "mejora" | "analisis";
  icon: typeof TrendingDown;
  priority: number;
}

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
};

export const ChatSuggestedQuestions = ({
  businessId,
  onSelectQuestion,
  disabled = false,
  compact = false,
}: ChatSuggestedQuestionsProps) => {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      generatePersonalizedQuestions();
    }
  }, [businessId]);

  const generatePersonalizedQuestions = async () => {
    setLoading(true);
    
    try {
      // Fetch Brain data
      const { data: brain } = await supabase
        .from("business_brains")
        .select("*")
        .eq("business_id", businessId)
        .single();

      // Fetch Business data
      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      // Fetch recent opportunities (problems detected)
      const { data: opportunities } = await supabase
        .from("opportunities")
        .select("*")
        .eq("business_id", businessId)
        .is("dismissed_at", null)
        .is("is_converted", false)
        .order("created_at", { ascending: false })
        .limit(5);

      // Fetch active missions
      const { data: missions } = await supabase
        .from("missions")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "active")
        .limit(3);

      // Fetch data gaps
      const { data: gaps } = await supabase
        .from("data_gaps")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "pending")
        .order("priority", { ascending: false })
        .limit(3);

      // Generate ultra-personalized questions
      const personalizedQuestions: SuggestedQuestion[] = [];
      
      // Parse brain memories safely
      const factualMemory = brain?.factual_memory && typeof brain.factual_memory === 'object' 
        ? brain.factual_memory as Record<string, unknown> 
        : {};
      const dynamicMemory = brain?.dynamic_memory && typeof brain.dynamic_memory === 'object'
        ? brain.dynamic_memory as Record<string, unknown>
        : {};

      // 1. Questions based on OPPORTUNITIES (problems detected)
      if (opportunities && opportunities.length > 0) {
        const topOpp = opportunities[0];
        personalizedQuestions.push({
          id: `opp-${topOpp.id}`,
          text: `¿Cómo puedo resolver "${topOpp.title}"?`,
          category: "problema",
          icon: AlertTriangle,
          priority: 10,
        });
      }

      // 2. Questions based on DATA GAPS
      if (gaps && gaps.length > 0) {
        const topGap = gaps[0];
        const gapQuestion = Array.isArray(topGap.questions) && topGap.questions[0]
          ? String(topGap.questions[0])
          : `¿Cómo puedo mejorar ${topGap.field_name}?`;
        personalizedQuestions.push({
          id: `gap-${topGap.id}`,
          text: gapQuestion,
          category: "mejora",
          icon: HelpCircle,
          priority: 9,
        });
      }

      // 3. Questions based on LOW METRICS
      if (business?.avg_rating && business.avg_rating < 4.0) {
        personalizedQuestions.push({
          id: "rating-low",
          text: `Mi rating es ${business.avg_rating}/5. ¿Cómo lo subo a 4.5+?`,
          category: "problema",
          icon: Star,
          priority: 8,
        });
      }

      // 4. Questions based on ACTIVE MISSIONS
      if (missions && missions.length > 0) {
        const activeMission = missions[0];
        personalizedQuestions.push({
          id: `mission-${activeMission.id}`,
          text: `Necesito ayuda con mi misión "${activeMission.title}"`,
          category: "mejora",
          icon: Target,
          priority: 7,
        });
      }

      // 5. Questions based on BRAIN FOCUS
      const currentFocus = brain?.current_focus;
      if (currentFocus) {
        const focusQuestions: Record<string, string> = {
          ventas: "¿Qué acciones rápidas puedo hacer para aumentar ventas esta semana?",
          reputacion: "¿Cómo mejoro mi presencia online y reputación?",
          eficiencia: "¿Dónde estoy perdiendo dinero sin darme cuenta?",
          crecimiento: "¿Cuál es mi mayor oportunidad de crecimiento ahora?",
          trafico: "¿Cómo atraigo más clientes a mi negocio?",
          finanzas: "¿Cómo mejoro mi margen de ganancia?",
          equipo: "¿Cómo optimizo el rendimiento de mi equipo?",
        };
        if (focusQuestions[currentFocus]) {
          personalizedQuestions.push({
            id: `focus-${currentFocus}`,
            text: focusQuestions[currentFocus],
            category: "analisis",
            icon: BarChart3,
            priority: 6,
          });
        }
      }

      // 6. Questions based on TICKET PROMEDIO
      if (business?.avg_ticket) {
        personalizedQuestions.push({
          id: "ticket",
          text: `Mi ticket promedio es $${business.avg_ticket.toLocaleString()}. ¿Cómo lo aumento?`,
          category: "oportunidad",
          icon: DollarSign,
          priority: 5,
        });
      }

      // 7. Generic high-value questions based on category
      const categoryQuestions: Record<string, SuggestedQuestion> = {
        gastro: {
          id: "gastro-generic",
          text: "¿Cuáles son mis platos más rentables y cuáles debería eliminar?",
          category: "analisis",
          icon: BarChart3,
          priority: 4,
        },
        retail: {
          id: "retail-generic",
          text: "¿Qué productos debería promocionar esta semana?",
          category: "oportunidad",
          icon: Lightbulb,
          priority: 4,
        },
        servicios: {
          id: "servicios-generic",
          text: "¿Cómo puedo fidelizar mejor a mis clientes actuales?",
          category: "mejora",
          icon: Users,
          priority: 4,
        },
      };
      
      const bizCategory = business?.category || "servicios";
      if (categoryQuestions[bizCategory]) {
        personalizedQuestions.push(categoryQuestions[bizCategory]);
      }

      // 8. Fallback questions if we have few personalized ones
      if (personalizedQuestions.length < 3) {
        const fallbacks: SuggestedQuestion[] = [
          {
            id: "fallback-1",
            text: "¿Cuál es mi mayor problema ahora mismo?",
            category: "problema",
            icon: AlertTriangle,
            priority: 3,
          },
          {
            id: "fallback-2",
            text: "¿Qué oportunidad estoy dejando pasar?",
            category: "oportunidad",
            icon: Lightbulb,
            priority: 2,
          },
          {
            id: "fallback-3",
            text: "Dame 3 acciones para mejorar esta semana",
            category: "mejora",
            icon: Target,
            priority: 1,
          },
        ];
        personalizedQuestions.push(...fallbacks);
      }

      // Sort by priority and take top 4
      const sortedQuestions = personalizedQuestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 4);

      setQuestions(sortedQuestions);
    } catch (error) {
      console.error("Error generating personalized questions:", error);
      // Fallback questions on error
      setQuestions([
        {
          id: "error-1",
          text: "¿Cuál es mi mayor desafío ahora?",
          category: "problema",
          icon: AlertTriangle,
          priority: 1,
        },
        {
          id: "error-2",
          text: "¿Qué debería priorizar esta semana?",
          category: "mejora",
          icon: Target,
          priority: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            onClick={generatePersonalizedQuestions}
            disabled={disabled || loading}
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {questions.map((q) => {
            const config = categoryConfig[q.category];
            const Icon = q.icon || config.icon;
            return (
              <Button
                key={q.id}
                variant="ghost"
                size="sm"
                onClick={() => onSelectQuestion(q.text)}
                disabled={disabled}
                className="flex-shrink-0 h-auto py-1.5 px-2.5 gap-1.5 text-xs bg-muted/30 hover:bg-muted/50 max-w-[200px]"
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
        <span className="text-xs text-muted-foreground">
          Preguntas sugeridas para vos
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={generatePersonalizedQuestions}
          disabled={disabled || loading}
          className="h-6 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {questions.map((q) => {
          const config = categoryConfig[q.category];
          const Icon = q.icon || config.icon;
          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.text)}
              disabled={disabled}
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl text-left",
                "bg-card/50 border border-border/40 hover:border-primary/30",
                "transition-all duration-200 hover:scale-[1.01]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
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
