import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown,
  ShieldAlert,
  Mic,
  MicOff,
  Loader2,
  CheckCircle2,
  Sparkles,
  PartyPopper,
  AlertCircle,
  HelpCircle,
  X
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

const DISMISS_STORAGE_KEY = "alertfab_dismissed";

const ALERT_TYPES = [
  { 
    value: "positive", 
    label: "Pasó algo bueno", 
    sublabel: "Algo que funcionó o una buena noticia",
    icon: PartyPopper, 
    color: "text-success", 
    bg: "bg-success/10",
    borderColor: "border-success/30"
  },
  { 
    value: "negative", 
    label: "Pasó algo malo / SOS", 
    sublabel: "Problema o situación que no supiste manejar",
    icon: AlertCircle, 
    color: "text-destructive", 
    bg: "bg-destructive/10",
    borderColor: "border-destructive/30"
  },
];

const CATEGORIES = [
  { value: "cliente", label: "Cliente", emoji: "👤" },
  { value: "operacion", label: "Operación", emoji: "⚙️" },
  { value: "equipo", label: "Equipo", emoji: "👥" },
  { value: "finanzas", label: "Finanzas", emoji: "💰" },
  { value: "reputacion", label: "Reputación", emoji: "⭐" },
  { value: "producto", label: "Producto/Servicio", emoji: "🍽️" },
  { value: "other", label: "Otro", emoji: "📋" },
];

export const AlertFAB = () => {
  const { currentBusiness } = useBusiness();
  const [open, setOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if dismissed in this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
    }
    return false;
  });
  const [step, setStep] = useState<"type" | "details" | "result">("type");
  const [alertType, setAlertType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<{
    summary: string;
    plan: string[];
    lesson: string;
  } | null>(null);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    }
  };

  const handleSelectType = (type: string) => {
    setAlertType(type);
    setStep("details");
  };

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
      // Generate contextual AI response based on type
      const isPositive = alertType === "positive";
      const aiSummary = {
        summary: isPositive 
          ? `Evento positivo registrado en ${CATEGORIES.find(c => c.value === category)?.label || category}: ${textContent.slice(0, 100)}...`
          : `Alerta en ${CATEGORIES.find(c => c.value === category)?.label || category}: ${textContent.slice(0, 100)}...`,
        plan: isPositive ? [
          "Analizar qué factores contribuyeron al éxito",
          "Documentar el proceso para replicarlo",
          "Considerar cómo escalar o sistematizar",
          "Compartir el aprendizaje con el equipo"
        ] : [
          "Evaluar el impacto inmediato en el negocio",
          "Identificar la causa raíz del problema",
          "Tomar medidas correctivas específicas",
          "Crear protocolo para prevenir repetición"
        ],
        lesson: isPositive 
          ? "Los éxitos también se documentan. Entender qué funciona es tan importante como detectar problemas."
          : "Cada situación difícil es una oportunidad de mejora. Registrar estos eventos ayuda a prevenir problemas futuros."
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
      setStep("result");

      toast({
        title: isPositive ? "✅ Evento registrado" : "⚠️ Alerta registrada",
        description: "El sistema usará esto para mejorar las recomendaciones",
      });

    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("type");
    setAlertType("");
    setCategory("");
    setTextContent("");
    setResultData(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({ title: "Grabación detenida", description: "Funcionalidad de audio próximamente" });
    } else {
      setIsRecording(true);
      toast({ title: "Grabando...", description: "Funcionalidad de audio próximamente" });
      setTimeout(() => setIsRecording(false), 2000);
    }
  };

  const isPositiveType = alertType === "positive";

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* FAB Button - Highly visible with dismiss option */}
      <div className="fixed z-[9999] bottom-24 right-4 md:bottom-8 md:right-8">
        {/* Close/Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-secondary transition-colors z-10"
          aria-label="Ocultar"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        
        <Button
          onClick={() => setOpen(true)}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl",
            "bg-warning hover:bg-warning/90 border-2 border-warning-foreground/20",
            "animate-pulse hover:animate-none"
          )}
          size="icon"
          aria-label="Contale algo al sistema"
        >
          <AlertTriangle className="w-6 h-6 text-warning-foreground" />
        </Button>
      </div>

      {/* Alert Dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {step === "type" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  ¿Qué te pasó?
                </DialogTitle>
                <DialogDescription className="text-base">
                  Contale al sistema algo importante que ocurrió en tu negocio
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                {ALERT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleSelectType(type.value)}
                      className={cn(
                        "w-full p-5 rounded-xl border-2 transition-all text-left",
                        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                        type.bg,
                        type.borderColor
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          type.value === "positive" ? "bg-success/20" : "bg-destructive/20"
                        )}>
                          <Icon className={cn("w-6 h-6", type.color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-lg">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.sublabel}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <p className="text-xs text-muted-foreground text-center pt-4">
                  💡 Esta información alimenta el sistema para darte mejores recomendaciones
                </p>
              </div>
            </>
          )}

          {step === "details" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {isPositiveType ? (
                    <PartyPopper className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  {isPositiveType ? "Contanos lo bueno" : "¿Qué pasó?"}
                </DialogTitle>
                <DialogDescription>
                  {isPositiveType 
                    ? "Describe el evento positivo para que el sistema aprenda" 
                    : "Describe la situación para generar un plan de respuesta"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Category */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">¿En qué área ocurrió?</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                  <Label className="text-sm font-medium mb-2 block">
                    {isPositiveType ? "¿Qué pasó?" : "Describe la situación"}
                  </Label>
                  <div className="relative">
                    <Textarea
                      placeholder={isPositiveType 
                        ? "Ej: Un cliente dejó una reseña increíble, logramos un récord de ventas..."
                        : "Ej: Un cliente se fue enojado, hubo un problema con un proveedor..."
                      }
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[120px] pr-12"
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

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep("type")}
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading || !textContent.trim() || !category}
                    className={cn("flex-1", isPositiveType ? "bg-success hover:bg-success/90" : "")}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Registrar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === "result" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  {isPositiveType ? "¡Evento registrado!" : "Alerta registrada"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Summary */}
                <div className={cn(
                  "p-4 rounded-xl",
                  isPositiveType ? "bg-success/10 border border-success/20" : "bg-secondary/50"
                )}>
                  <h4 className="font-semibold text-foreground mb-2">Resumen</h4>
                  <p className="text-sm text-muted-foreground">{resultData?.summary}</p>
                </div>

                {/* Plan */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    {isPositiveType ? "Cómo capitalizar esto" : "Plan de respuesta"}
                  </h4>
                  <div className="space-y-2">
                    {resultData?.plan.map((planStep, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        isPositiveType 
                          ? "bg-success/5 border-success/10" 
                          : "bg-primary/5 border-primary/10"
                      )}>
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                          isPositiveType 
                            ? "bg-success/10 text-success" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {idx + 1}
                        </div>
                        <span className="text-sm text-foreground">{planStep}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  isPositiveType 
                    ? "bg-success/10 border-success/20" 
                    : "bg-warning/10 border-warning/20"
                )}>
                  <h4 className={cn(
                    "font-semibold mb-2 flex items-center gap-2",
                    isPositiveType ? "text-success" : "text-warning"
                  )}>
                    💡 {isPositiveType ? "Aprendizaje" : "Lección aprendida"}
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
