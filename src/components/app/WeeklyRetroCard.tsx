import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Minus, Check, Calendar, Target, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";

interface WeeklyRetroCardProps {
  onComplete?: () => void;
}

const OUTCOME_OPTIONS = [
  { value: "better", label: "Mejor semana", emoji: "🚀", icon: TrendingUp, color: "text-success" },
  { value: "same", label: "Similar", emoji: "➡️", icon: Minus, color: "text-muted-foreground" },
  { value: "worse", label: "Más difícil", emoji: "📉", icon: TrendingDown, color: "text-destructive" },
];

const LESSON_PROMPTS = [
  "¿Qué funcionó esta semana?",
  "¿Qué harías diferente?",
  "¿Qué aprendiste?",
];

export const WeeklyRetroCard = ({ onComplete }: WeeklyRetroCardProps) => {
  const { currentBusiness } = useBusiness();
  const [outcome, setOutcome] = useState<string | null>(null);
  const [lesson, setLesson] = useState("");
  const [currentPrompt] = useState(() => 
    LESSON_PROMPTS[Math.floor(Math.random() * LESSON_PROMPTS.length)]
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!currentBusiness || !outcome) return;
    
    setSaving(true);
    try {
      // Save outcome as a chat message for context
      await supabase.from("chat_messages").insert({
        business_id: currentBusiness.id,
        role: "user",
        content: `[Retro semanal] Resultado: ${outcome}${lesson ? `. ${lesson}` : ""}`,
        metadata: {
          type: "weekly_retro",
          outcome,
          week: new Date().toISOString().split("T")[0],
        },
      });

      // If there's a lesson, save it to the lessons table for AI memory
      if (lesson.trim()) {
        await supabase.from("lessons").insert({
          business_id: currentBusiness.id,
          content: lesson.trim(),
          category: outcome === "better" ? "ventas" : outcome === "worse" ? "operaciones" : "general",
          source: "retro",
          importance: outcome === "better" ? 8 : outcome === "worse" ? 7 : 5,
        });
      }

      toast({
        title: "🎯 Retro guardada",
        description: "El sistema aprenderá de esta reflexión.",
      });

      onComplete?.();
    } catch (error) {
      console.error("Error saving retro:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la retrospectiva",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-card p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Retro de la semana</h3>
          <p className="text-sm text-muted-foreground">2 minutos para mejorar</p>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-lg font-medium text-foreground">
            ¿Cómo fue esta semana para tu negocio?
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {OUTCOME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setOutcome(option.value);
                  setTimeout(() => setStep(2), 300);
                }}
                className={cn(
                  "group p-4 rounded-xl text-center transition-all duration-200",
                  "border hover:border-primary/30 hover:shadow-md",
                  outcome === option.value
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                    : "bg-card border-border"
                )}
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                  {option.emoji}
                </span>
                <span className={cn(
                  "text-sm font-medium block",
                  outcome === option.value ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-lg font-medium text-foreground">
            {currentPrompt}
          </p>
          
          <textarea
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="Tu respuesta ayuda al sistema a darte mejores consejos..."
            className="w-full p-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 gradient-primary"
            >
              {saving ? "Guardando..." : "Completar"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-6">
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          step === 1 ? "bg-primary" : "bg-muted"
        )} />
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          step === 2 ? "bg-primary" : "bg-muted"
        )} />
      </div>
    </div>
  );
};

export default WeeklyRetroCard;
