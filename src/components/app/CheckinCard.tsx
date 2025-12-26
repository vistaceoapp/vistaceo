import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Clock, Users, Check, Sparkles, ThumbsUp, AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";
import { Badge } from "@/components/ui/badge";

interface CheckinCardProps {
  onComplete?: () => void;
  variant?: "compact" | "full";
}

const TRAFFIC_LEVELS = [
  { value: 1, label: "Vacío", emoji: "🥶", description: "Muy poco tráfico" },
  { value: 2, label: "Bajo", emoji: "😐", description: "Menos de lo normal" },
  { value: 3, label: "Normal", emoji: "👍", description: "Día típico" },
  { value: 4, label: "Alto", emoji: "🔥", description: "Más de lo normal" },
  { value: 5, label: "Lleno", emoji: "🚀", description: "Capacidad máxima" },
];

const ALERT_CATEGORIES = [
  { value: "servicio", label: "Servicio", emoji: "🍽️" },
  { value: "equipo", label: "Equipo", emoji: "👥" },
  { value: "producto", label: "Producto", emoji: "📦" },
  { value: "cliente", label: "Cliente", emoji: "💬" },
  { value: "operacion", label: "Operación", emoji: "⚙️" },
  { value: "otro", label: "Otro", emoji: "📝" },
];

const CURRENT_SLOTS = () => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 12) return "desayuno";
  if (hour >= 12 && hour < 16) return "almuerzo";
  if (hour >= 16 && hour < 19) return "merienda";
  if (hour >= 19 || hour < 4) return "cena";
  return "otro";
};

const SLOT_LABELS: Record<string, { label: string; emoji: string }> = {
  desayuno: { label: "Desayuno", emoji: "☀️" },
  almuerzo: { label: "Almuerzo", emoji: "🍽️" },
  merienda: { label: "Merienda", emoji: "☕" },
  cena: { label: "Cena", emoji: "🌙" },
  otro: { label: "Turno", emoji: "⏰" },
};

export const CheckinCard = ({ onComplete, variant = "full" }: CheckinCardProps) => {
  const { currentBusiness } = useBusiness();
  const [trafficLevel, setTrafficLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Alert section
  const [showAlertSection, setShowAlertSection] = useState(false);
  const [alertType, setAlertType] = useState<"good" | "bad" | null>(null);
  const [alertCategory, setAlertCategory] = useState<string | null>(null);
  const [alertText, setAlertText] = useState("");

  const currentSlot = CURRENT_SLOTS();
  const slotInfo = SLOT_LABELS[currentSlot];

  const handleSubmit = async () => {
    if (!currentBusiness || trafficLevel === null) return;
    
    setSaving(true);
    try {
      // Save check-in
      const { error: checkinError } = await supabase.from("checkins").insert({
        business_id: currentBusiness.id,
        slot: currentSlot,
        traffic_level: trafficLevel,
        notes: notes.trim() || null,
      });

      if (checkinError) throw checkinError;

      // If there's an alert, save it too
      if (alertType && alertCategory && alertText.trim()) {
        const { error: alertError } = await supabase.from("alerts").insert({
          business_id: currentBusiness.id,
          alert_type: alertType,
          category: alertCategory,
          text_content: alertText.trim(),
          ai_summary_json: {
            pending_analysis: true,
            slot: currentSlot,
            traffic_level: trafficLevel,
          }
        });

        if (alertError) {
          console.error("Error saving alert:", alertError);
        }
      }

      toast({
        title: "✅ Check-in registrado",
        description: alertType 
          ? "Gracias por la info. El sistema la usará para mejorar recomendaciones."
          : "Los datos ayudarán a mejorar las recomendaciones.",
      });

      // Reset state
      setTrafficLevel(null);
      setNotes("");
      setAlertType(null);
      setAlertCategory(null);
      setAlertText("");
      setShowAlertSection(false);
      
      onComplete?.();
    } catch (error) {
      console.error("Error saving checkin:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el check-in",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (variant === "compact") {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{slotInfo.emoji}</span>
            <span className="text-sm font-medium text-foreground">Check-in {slotInfo.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">10 seg</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {TRAFFIC_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => {
                setTrafficLevel(level.value);
                setTimeout(() => {
                  if (!notes && !alertType) handleSubmit();
                }, 300);
              }}
              className={cn(
                "flex-1 min-w-[60px] py-2 px-3 rounded-xl text-center transition-all",
                "border hover:border-primary/30",
                trafficLevel === level.value
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg block">{level.emoji}</span>
              <span className="text-[10px] font-medium">{level.label}</span>
            </button>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Check-in del turno</h3>
              <p className="text-sm text-muted-foreground">
                {slotInfo.emoji} Turno de {slotInfo.label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          ~30 segundos
        </span>
      </div>

      <div className="space-y-5">
        {/* Traffic Level */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            ¿Cómo está el tráfico ahora?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TRAFFIC_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setTrafficLevel(level.value)}
                className={cn(
                  "group relative py-4 px-2 rounded-xl text-center transition-all duration-200",
                  "border hover:border-primary/30 hover:shadow-md",
                  trafficLevel === level.value
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "bg-card border-border"
                )}
              >
                <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                  {level.emoji}
                </span>
                <span className={cn(
                  "text-xs font-medium block",
                  trafficLevel === level.value ? "text-primary" : "text-muted-foreground"
                )}>
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Alert Section Toggle */}
        {trafficLevel !== null && (
          <div className="animate-fade-in">
            <button
              onClick={() => setShowAlertSection(!showAlertSection)}
              className={cn(
                "w-full py-3 px-4 rounded-xl border transition-all text-sm flex items-center justify-between gap-2",
                showAlertSection 
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-dashed border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>¿Pasó algo importante este turno?</span>
              </div>
              {showAlertSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Alert Content */}
            {showAlertSection && (
              <div className="mt-4 space-y-4 p-4 rounded-xl bg-secondary/30 border border-border animate-fade-in">
                {/* Alert Type Selection */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    ¿Qué tipo de situación fue?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAlertType("good")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        alertType === "good"
                          ? "border-success bg-success/10 text-success"
                          : "border-border hover:border-success/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ThumbsUp className="w-6 h-6" />
                      <span className="text-sm font-medium">Algo bueno</span>
                      <span className="text-[10px] text-muted-foreground">Un logro, feedback positivo...</span>
                    </button>
                    <button
                      onClick={() => setAlertType("bad")}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        alertType === "bad"
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : "border-border hover:border-destructive/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <AlertTriangle className="w-6 h-6" />
                      <span className="text-sm font-medium">Algo malo / SOS</span>
                      <span className="text-[10px] text-muted-foreground">Problema, queja, dificultad...</span>
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                {alertType && (
                  <div className="animate-fade-in">
                    <label className="text-sm font-medium text-foreground mb-3 block">
                      ¿En qué área?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALERT_CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => setAlertCategory(cat.value)}
                          className={cn(
                            "px-3 py-2 rounded-lg border transition-all text-sm flex items-center gap-2",
                            alertCategory === cat.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alert Text */}
                {alertType && alertCategory && (
                  <div className="animate-fade-in">
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Contalo brevemente
                    </label>
                    <textarea
                      value={alertText}
                      onChange={(e) => setAlertText(e.target.value)}
                      placeholder={
                        alertType === "good" 
                          ? "Ej: Un cliente nos felicitó por el servicio rápido..."
                          : "Ej: Tuvimos un problema con un pedido que se demoró mucho..."
                      }
                      className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      El sistema usará esto para darte mejores recomendaciones
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Optional notes (if not showing alert section) */}
            {!showAlertSection && (
              <div className="mt-3">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nota rápida opcional..."
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={trafficLevel === null || saving || (showAlertSection && alertType && alertCategory && !alertText.trim())}
          className="w-full gradient-primary shadow-lg shadow-primary/20 h-12"
        >
          <Check className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : alertType ? "Guardar check-in + alerta" : "Guardar check-in"}
        </Button>
      </div>
    </div>
  );
};

export default CheckinCard;
