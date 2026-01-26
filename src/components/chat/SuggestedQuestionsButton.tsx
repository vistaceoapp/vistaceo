import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  Lightbulb,
  AlertTriangle,
  Target,
  BarChart3,
  HelpCircle,
  Star,
  DollarSign,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestedQuestion {
  id: string;
  text: string;
  category: "problema" | "oportunidad" | "mejora" | "analisis";
  icon: typeof AlertTriangle;
  priority: number;
}

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
    label: "Problema detectado"
  },
  oportunidad: { 
    icon: Lightbulb, 
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Oportunidad"
  },
  mejora: { 
    icon: Target, 
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Área de mejora"
  },
  analisis: { 
    icon: BarChart3, 
    color: "text-muted-foreground",
    bg: "bg-secondary",
    label: "Análisis"
  },
};

export const SuggestedQuestionsButton = ({
  businessId,
  onSelectQuestion,
  disabled = false,
}: SuggestedQuestionsButtonProps) => {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId && open) {
      generatePersonalizedQuestions();
    }
  }, [businessId, open]);

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
        const gapQuestion =
          Array.isArray(topGap.questions) && topGap.questions[0]
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
      if (personalizedQuestions.length < 4) {
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

      // Sort by priority and take top 6
      const sortedQuestions = personalizedQuestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 6);

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
        {
          id: "error-3",
          text: "Dame un análisis rápido de mi negocio",
          category: "analisis",
          icon: BarChart3,
          priority: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

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
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Preguntas sugeridas para vos</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generatePersonalizedQuestions}
              disabled={loading}
              className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Actualizar
            </Button>
          </SheetTitle>
          <p className="text-sm text-muted-foreground text-left">
            Basadas en el análisis de tu negocio en tiempo real
          </p>
        </SheetHeader>

        <div className="space-y-2 pb-6">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </>
          ) : (
            questions.map((q) => {
              const config = categoryConfig[q.category];
              const Icon = q.icon || config.icon;

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
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {q.text}
                    </p>
                    <span className={cn("text-[10px] uppercase tracking-wider mt-1 block", config.color)}>
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
