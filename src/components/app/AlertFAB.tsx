import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  PartyPopper,
  AlertCircle,
  HelpCircle,
  X,
  Mic,
  MicOff,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

  if (isDismissed) {
    return null;
  }

  return (
    <>
      {/* FAB Button - Clean, minimal design */}
      <div className="fixed z-[9999] bottom-24 right-4 md:bottom-8 md:right-8">
        <div className="relative group">
          {/* Main FAB */}
          <Button
            onClick={() => setOpen(true)}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90",
              "transition-all duration-200 hover:scale-105"
            )}
            size="icon"
            aria-label="Contale algo al sistema"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>

          {/* Dismiss on long press or swipe - show on hover */}
          <button
            onClick={handleDismiss}
            className={cn(
              "absolute -top-2 -right-2",
              "w-6 h-6 rounded-full",
              "bg-muted border border-border",
              "flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-secondary"
            )}
            aria-label="Ocultar"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Sheet instead of Dialog for better mobile UX */}
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          {step === "type" && (
            <div className="pb-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  ¿Qué te pasó?
                </SheetTitle>
                <SheetDescription className="text-base">
                  Contale al sistema algo importante que ocurrió
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-3">
                {ALERT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleSelectType(type.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all text-left",
                        "hover:shadow-md active:scale-[0.98]",
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
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.sublabel}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                <p className="text-xs text-muted-foreground text-center pt-4">
                  💡 Esta información mejora las recomendaciones del sistema
                </p>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="pb-6">
              <SheetHeader className="mb-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setStep("type")}
                    className="p-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <SheetTitle className="flex items-center gap-2">
                    {isPositiveType ? (
                      <PartyPopper className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    {isPositiveType ? "Contanos lo bueno" : "¿Qué pasó?"}
                  </SheetTitle>
                </div>
                <SheetDescription>
                  {isPositiveType 
                    ? "Describe el evento positivo" 
                    : "Describe la situación brevemente"}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5">
                {/* Category */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Área</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "px-3 py-2 rounded-full border text-sm transition-all",
                          category === cat.value
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Descripción</Label>
                  <div className="relative">
                    <Textarea
                      placeholder={isPositiveType 
                        ? "Ej: Un cliente dejó una reseña increíble..."
                        : "Ej: Un cliente se fue enojado porque..."
                      }
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[100px] pr-12 resize-none"
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
                  disabled={loading || !textContent.trim() || !category}
                  className={cn("w-full", isPositiveType && "bg-success hover:bg-success/90")}
                  size="lg"
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
          )}

          {step === "result" && (
            <div className="pb-6">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  {isPositiveType ? "¡Registrado!" : "Alerta guardada"}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                {/* Summary */}
                <div className={cn(
                  "p-4 rounded-xl",
                  isPositiveType ? "bg-success/10 border border-success/20" : "bg-secondary"
                )}>
                  <p className="text-sm text-foreground">{resultData?.summary}</p>
                </div>

                {/* Plan */}
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    {isPositiveType ? "Próximos pasos" : "Plan de acción"}
                  </h4>
                  <div className="space-y-2">
                    {resultData?.plan.map((planStep, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5",
                          isPositiveType 
                            ? "bg-success/20 text-success" 
                            : "bg-primary/20 text-primary"
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
                    ? "bg-success/5 border-success/20" 
                    : "bg-warning/5 border-warning/20"
                )}>
                  <p className="text-sm text-foreground">💡 {resultData?.lesson}</p>
                </div>

                <Button onClick={handleClose} className="w-full" variant="outline" size="lg">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
