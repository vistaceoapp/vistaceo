import { Database, AlertCircle, ArrowRight, Link, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";

interface DataGap {
  id: string;
  field_name: string;
  category: string;
  reason: string;
  unlocks: string;
  questions: Array<{
    question: string;
    type: string;
    options?: string[];
  }>;
  priority: number;
}

interface DataNeededStateProps {
  title?: string;
  description?: string;
  context?: "missions" | "opportunities" | "analytics";
  onAskQuestion?: () => void;
  className?: string;
}

export const DataNeededState = ({ 
  title = "Necesito más datos para darte un plan exacto",
  description,
  context = "missions",
  onAskQuestion,
  className
}: DataNeededStateProps) => {
  const navigate = useNavigate();
  const { currentBusiness } = useBusiness();
  const [gaps, setGaps] = useState<DataGap[]>([]);
  const [mvcCompletion, setMvcCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeGaps = async () => {
      if (!currentBusiness) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("brain-analyze-gaps", {
          body: { businessId: currentBusiness.id }
        });

        if (error) throw error;

        setGaps(data.gaps || []);
        setMvcCompletion(data.mvcCompletion || 0);
      } catch (error) {
        console.error("Error analyzing gaps:", error);
      } finally {
        setLoading(false);
      }
    };

    analyzeGaps();
  }, [currentBusiness]);

  const getContextDescription = () => {
    switch (context) {
      case "missions":
        return "Para crear misiones 100% personalizadas a tu negocio, necesito conocer más sobre tu situación actual.";
      case "opportunities":
        return "Para detectar oportunidades reales, necesito datos específicos de tu negocio.";
      case "analytics":
        return "Para mostrarte métricas útiles, necesito conectar fuentes de datos.";
      default:
        return description;
    }
  };

  const dataNeeds = [
    {
      icon: Link,
      title: "Conectar integraciones",
      description: "Google Reviews, redes sociales, ventas",
      action: () => navigate("/app/more"),
      cta: "Conectar"
    },
    {
      icon: MessageSquare,
      title: "Contarme sobre tu negocio",
      description: "Responde algunas preguntas rápidas",
      action: onAskQuestion || (() => navigate("/app/chat")),
      cta: "Responder"
    },
  ];

  return (
    <div className={cn(
      "rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6",
      className
    )}>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-md leading-relaxed">
          {getContextDescription()}
        </p>
        
        {/* MVC Progress */}
        {!loading && (
          <div className="mt-4 w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Nivel de contexto</span>
              <span>{mvcCompletion}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                style={{ width: `${mvcCompletion}%` }}
              />
            </div>
            {mvcCompletion < 60 && (
              <p className="text-xs text-muted-foreground mt-1">
                Necesito al menos 60% para ser específico
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Gaps from Brain */}
      {gaps.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Lo que más necesito saber:
          </p>
          <div className="space-y-2">
            {gaps.slice(0, 3).map((gap, idx) => (
              <div 
                key={gap.id || idx}
                className="p-3 rounded-lg bg-secondary/50 border border-border/50"
              >
                <p className="text-sm font-medium text-foreground">
                  {gap.questions[0]?.question || gap.reason}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  🔓 Desbloquea: {gap.unlocks}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 mb-6">
        <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground mb-1">¿Por qué no genero misiones genéricas?</p>
          <p className="text-muted-foreground">
            Prefiero esperar a tener datos reales antes de recomendarte algo. 
            Así cada misión está basada en tu situación específica, no en suposiciones.
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground mb-3">Para empezar, puedes:</p>
        {dataNeeds.map((need, idx) => {
          const Icon = need.icon;
          return (
            <button
              key={idx}
              onClick={need.action}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{need.title}</p>
                <p className="text-sm text-muted-foreground">{need.description}</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium">{need.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Reassurance */}
      <p className="text-xs text-muted-foreground text-center mt-6">
        💡 Mientras más me cuentes y más conectes, más preciso y útil voy a ser
      </p>
    </div>
  );
};
