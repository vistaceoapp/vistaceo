import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Clock, Users, TrendingUp, TrendingDown, Minus, Check, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { GlassCard } from "./GlassCard";

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
  const [showNotes, setShowNotes] = useState(false);

  const currentSlot = CURRENT_SLOTS();
  const slotInfo = SLOT_LABELS[currentSlot];

  const handleSubmit = async () => {
    if (!currentBusiness || trafficLevel === null) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.from("checkins").insert({
        business_id: currentBusiness.id,
        slot: currentSlot,
        traffic_level: trafficLevel,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "✅ Check-in registrado",
        description: "Los datos ayudarán a mejorar las recomendaciones.",
      });

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
                  if (!notes) handleSubmit();
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
              <h3 className="font-semibold text-foreground">Check-in rápido</h3>
              <p className="text-sm text-muted-foreground">
                {slotInfo.emoji} Turno de {slotInfo.label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          ~10 segundos
        </span>
      </div>

      <div className="space-y-4">
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

        {trafficLevel !== null && (
          <div className="animate-fade-in">
            {!showNotes ? (
              <button
                onClick={() => setShowNotes(true)}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-border hover:border-primary/30 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Agregar observación (opcional)
              </button>
            ) : (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  ¿Algo relevante hoy?
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Evento cerca, falla en cocina, promoción especial..."
                  className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={trafficLevel === null || saving}
          className="w-full gradient-primary shadow-lg shadow-primary/20 h-12"
        >
          <Check className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar check-in"}
        </Button>
      </div>
    </div>
  );
};

export default CheckinCard;
