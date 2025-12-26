import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KnowledgeByAreaCardProps {
  className?: string;
}

const AREAS = [
  { id: "identidad", label: "Identidad", icon: "🏪", questions: [
    "¿Cómo describirías tu negocio en una oración?",
    "¿Qué te diferencia de la competencia?",
  ]},
  { id: "oferta", label: "Oferta", icon: "📦", questions: [
    "¿Cuál es tu producto o servicio estrella?",
    "¿Tenés precios definidos o varían?",
  ]},
  { id: "operacion", label: "Operación", icon: "⚙️", questions: [
    "¿Cuántas personas trabajan contigo?",
    "¿Cuál es tu mayor cuello de botella operativo?",
  ]},
  { id: "ventas", label: "Ventas", icon: "💰", questions: [
    "¿Cuál es tu ticket promedio?",
    "¿Cuál es tu día más fuerte de ventas?",
  ]},
  { id: "marketing", label: "Marketing", icon: "📱", questions: [
    "¿Tenés redes sociales activas?",
    "¿Qué canal te trae más clientes?",
  ]},
  { id: "reputacion", label: "Reputación", icon: "⭐", questions: [
    "¿Tenés reseñas en Google?",
    "¿Qué dicen tus clientes que les gusta de tu negocio?",
  ]},
  { id: "finanzas", label: "Finanzas", icon: "📊", questions: [
    "¿Conocés tu margen de ganancia?",
    "¿Cuál es tu mayor costo fijo?",
  ]},
  { id: "equipo", label: "Equipo", icon: "👥", questions: [
    "¿Tenés problemas para retener empleados?",
    "¿Cómo está la motivación del equipo?",
  ]},
  { id: "clientes", label: "Clientes", icon: "❤️", questions: [
    "¿Quién es tu cliente ideal?",
    "¿Tenés clientes recurrentes?",
  ]},
];

export const KnowledgeByAreaCard = ({ className }: KnowledgeByAreaCardProps) => {
  const { currentBusiness } = useBusiness();
  const [selectedArea, setSelectedArea] = useState<typeof AREAS[0] | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [areaProgress, setAreaProgress] = useState<Record<string, number>>({});

  const handleOpenArea = (area: typeof AREAS[0]) => {
    setSelectedArea(area);
    setCurrentQuestionIdx(0);
    setInputValue("");
    setAnswers({});
  };

  const handleAnswer = async () => {
    if (!inputValue.trim() || !selectedArea || !currentBusiness) return;

    const question = selectedArea.questions[currentQuestionIdx];
    const newAnswers = { ...answers, [question]: inputValue.trim() };
    setAnswers(newAnswers);

    // Save to business_insights
    try {
      await supabase.from("business_insights").insert({
        business_id: currentBusiness.id,
        category: selectedArea.id,
        question: question,
        answer: inputValue.trim(),
      });

      // Record as signal
      await supabase.from("signals").insert({
        business_id: currentBusiness.id,
        signal_type: "insight_answer",
        source: "knowledge_by_area",
        content: { category: selectedArea.id, question, answer: inputValue.trim() },
        raw_text: `${question}: ${inputValue.trim()}`,
        confidence: "high",
        importance: 6
      });
    } catch (error) {
      console.error("Error saving insight:", error);
    }

    setInputValue("");

    // Move to next question or close
    if (currentQuestionIdx < selectedArea.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // All questions answered
      setAreaProgress(prev => ({ ...prev, [selectedArea.id]: 100 }));
      toast({
        title: `¡${selectedArea.label} completado!`,
        description: "Gracias por la info. La uso para mejores recomendaciones.",
      });
      setSelectedArea(null);
    }
  };

  const getAreaProgress = (areaId: string) => {
    return areaProgress[areaId] || 0;
  };

  return (
    <>
      <GlassCard className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-foreground text-sm">Qué tanto te conozco por área</p>
          <span className="text-xs text-muted-foreground">Tocá para responder</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {AREAS.map((area) => {
            const progress = getAreaProgress(area.id);
            return (
              <button
                key={area.id}
                onClick={() => handleOpenArea(area)}
                className={cn(
                  "p-3 rounded-xl border transition-all text-center",
                  progress === 100
                    ? "bg-success/10 border-success/30"
                    : "bg-card border-border hover:border-primary/30"
                )}
              >
                <span className="text-xl block mb-1">{area.icon}</span>
                <span className="text-[10px] font-medium text-foreground block">{area.label}</span>
                {progress > 0 && progress < 100 && (
                  <Progress value={progress} className="h-1 mt-1" />
                )}
                {progress === 100 && (
                  <Check className="w-3 h-3 text-success mx-auto mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Area Questions Dialog */}
      <Dialog open={!!selectedArea} onOpenChange={() => setSelectedArea(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedArea?.icon}</span>
              {selectedArea?.label}
            </DialogTitle>
          </DialogHeader>

          {selectedArea && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Pregunta {currentQuestionIdx + 1} de {selectedArea.questions.length}</span>
                <Progress 
                  value={((currentQuestionIdx + 1) / selectedArea.questions.length) * 100} 
                  className="h-1 flex-1" 
                />
              </div>

              <p className="text-lg font-medium text-foreground">
                {selectedArea.questions[currentQuestionIdx]}
              </p>

              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnswer()}
                placeholder="Tu respuesta..."
                className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedArea(null)} className="flex-1">
                  Después
                </Button>
                <Button 
                  onClick={handleAnswer}
                  disabled={!inputValue.trim() || saving}
                  className="flex-1 gradient-primary"
                >
                  <ChevronRight className="w-4 h-4 mr-1" />
                  {currentQuestionIdx < selectedArea.questions.length - 1 ? "Siguiente" : "Terminar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KnowledgeByAreaCard;