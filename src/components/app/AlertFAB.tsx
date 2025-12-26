import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Plus, 
  ThumbsUp, 
  ThumbsDown,
  ShieldAlert,
  Mic,
  MicOff,
  Loader2,
  X,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ALERT_TYPES = [
  { value: "positive", label: "Positivo", icon: ThumbsUp, color: "text-success", bg: "bg-success/10" },
  { value: "negative", label: "Negativo", icon: ThumbsDown, color: "text-destructive", bg: "bg-destructive/10" },
  { value: "risk", label: "Riesgo", icon: ShieldAlert, color: "text-warning", bg: "bg-warning/10" },
];

const CATEGORIES = [
  { value: "cliente", label: "Cliente", emoji: "👤" },
  { value: "operacion", label: "Operación", emoji: "⚙️" },
  { value: "equipo", label: "Equipo", emoji: "👥" },
  { value: "finanzas", label: "Finanzas", emoji: "💰" },
  { value: "reputacion", label: "Reputación", emoji: "⭐" },
  { value: "other", label: "Otro", emoji: "📋" },
];

export const AlertFAB = () => {
  const { currentBusiness } = useBusiness();
  const [open, setOpen] = useState(false);
  const [alertType, setAlertType] = useState<string>("negative");
  const [category, setCategory] = useState<string>("cliente");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    summary: string;
    plan: string[];
    lesson: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!currentBusiness || !textContent.trim()) {
      toast({
        title: "Completa el formulario",
        description: "Describe qué pasó",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate AI processing
      const aiSummary = {
        summary: `Alerta de tipo ${alertType} en ${category}: ${textContent.slice(0, 100)}...`,
        plan: [
          "Evaluar el impacto inmediato",
          "Tomar medidas correctivas",
          "Documentar para prevenir repetición",
          "Comunicar al equipo si aplica"
        ],
        lesson: "Cada situación es una oportunidad de mejora. Registrar estos eventos ayuda a prevenir problemas futuros."
      };

      const { error } = await supabase
        .from("alerts")
        .insert({
          business_id: currentBusiness.id,
          alert_type: alertType,
          category,
          text_content: textContent,
          ai_summary_json: aiSummary
        });

      if (error) throw error;

      setResultData(aiSummary);
      setShowResult(true);

      toast({
        title: "✅ Alerta registrada",
        description: "Se generó un plan de respuesta",
      });

    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la alerta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAlertType("negative");
    setCategory("cliente");
    setTextContent("");
    setShowResult(false);
    setResultData(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300);
  };

  const toggleRecording = () => {
    // Placeholder for audio recording
    if (isRecording) {
      setIsRecording(false);
      toast({ title: "Grabación detenida", description: "Funcionalidad de audio próximamente" });
    } else {
      setIsRecording(true);
      toast({ title: "Grabando...", description: "Funcionalidad de audio próximamente" });
      setTimeout(() => setIsRecording(false), 2000);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full shadow-2xl z-[60] bg-warning hover:bg-warning/90 border-2 border-warning-foreground/10"
        size="icon"
        aria-label="Registrar alerta"
      >
        <AlertTriangle className="w-6 h-6 text-warning-foreground" />
      </Button>

      {/* Alert Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {!showResult ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Registrar alerta
                </DialogTitle>
                <DialogDescription>
                  Registra eventos importantes para que el sistema aprenda y te ayude
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Alert Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Tipo de alerta</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ALERT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setAlertType(type.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-center",
                            alertType === type.value
                              ? `border-current ${type.bg} ${type.color}`
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 mx-auto mb-1", type.color)} />
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Categoría</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "p-2 rounded-lg border transition-all text-center text-sm",
                          category === cat.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <span className="text-lg block mb-0.5">{cat.emoji}</span>
                        <span className="text-xs">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">¿Qué pasó?</Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Describe la situación..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[100px] pr-12"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute right-2 bottom-2",
                        isRecording && "text-destructive animate-pulse"
                      )}
                      onClick={toggleRecording}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Submit */}
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !textContent.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Registrar y generar plan
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  Alerta registrada
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Summary */}
                <div className="p-4 rounded-xl bg-secondary/50">
                  <h4 className="font-semibold text-foreground mb-2">Resumen</h4>
                  <p className="text-sm text-muted-foreground">{resultData?.summary}</p>
                </div>

                {/* Plan */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Plan de respuesta</h4>
                  <div className="space-y-2">
                    {resultData?.plan.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson */}
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
                    💡 Lección aprendida
                  </h4>
                  <p className="text-sm text-foreground">{resultData?.lesson}</p>
                </div>

                <Button onClick={handleClose} className="w-full">
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
