import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Sparkles, ThumbsUp, AlertTriangle, 
  ChevronDown, ChevronUp, DollarSign, Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { usePulseBlueprint } from "@/hooks/use-pulse-blueprint";
import { 
  getAutoShiftTag, 
  SHIFT_LABELS, 
  getPulseScoreEmoji,
} from "@/lib/pulseBlueprints";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PulseCheckinCardProps {
  onComplete?: () => void;
  variant?: "compact" | "full" | "widget";
  showHeader?: boolean;
}

const PULSE_OPTIONS = [
  { score: 1, emoji: "😫", label: "Muy flojo", color: "border-destructive/40 bg-destructive/5 text-destructive" },
  { score: 2, emoji: "😕", label: "Flojo", color: "border-warning/40 bg-warning/5 text-warning" },
  { score: 3, emoji: "😐", label: "Normal", color: "border-border bg-muted/30 text-muted-foreground" },
  { score: 4, emoji: "😊", label: "Bien", color: "border-primary/40 bg-primary/5 text-primary" },
  { score: 5, emoji: "🔥", label: "Excelente", color: "border-success/40 bg-success/5 text-success" },
];

export const PulseCheckinCard = ({ 
  onComplete, 
  variant = "full",
  showHeader = true 
}: PulseCheckinCardProps) => {
  const { currentBusiness } = useBusiness();
  const { blueprint, loading: blueprintLoading, hasSpecificBlueprint } = usePulseBlueprint();
  
  const [pulseScore, setPulseScore] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(getAutoShiftTag());
  const [revenueInput, setRevenueInput] = useState("");
  const [proxyValue, setProxyValue] = useState("");
  const [noteGood, setNoteGood] = useState("");
  const [noteBad, setNoteBad] = useState("");
  const [appliesTo] = useState<Date>(new Date());
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedShift(getAutoShiftTag());
  }, []);

  const labels: Record<string, string> = blueprint?.labels_1_5 || {
    "1": "muy flojo", "2": "flojo", "3": "normal", "4": "bien", "5": "excelente"
  };

  const handleSubmit = async (directScore?: number) => {
    const finalScore = directScore ?? pulseScore;
    if (!currentBusiness || finalScore === null) return;
    
    setSaving(true);
    try {
      const checkinData = {
        business_id: currentBusiness.id,
        applies_to_date: format(appliesTo, "yyyy-MM-dd"),
        granularity: directScore ? "daily" : (blueprint?.shift_mode_base === "required" ? "shift" : "daily"),
        shift_tag: selectedShift,
        source: revenueInput ? "mixed" : "manual_qualitative",
        pulse_score_1_5: finalScore,
        pulse_label: labels[String(finalScore)] || "",
        revenue_local: revenueInput ? parseFloat(revenueInput) : null,
        currency_local: currentBusiness.currency || "ARS",
        volume_proxy_type: blueprint?.proxy_base || null,
        volume_proxy_value: proxyValue ? parseFloat(proxyValue) : null,
        notes_good: noteGood.trim() || null,
        notes_bad: noteBad.trim() || null,
        metadata: {
          blueprint_type: blueprint?.business_type,
          has_specific_blueprint: hasSpecificBlueprint,
          quick_submit: !!directScore,
        },
      };

      const { error } = await supabase.from("pulse_checkins").insert(checkinData);
      if (error) throw error;

      // Record signal to Brain
      try {
        await supabase.functions.invoke("brain-record-signal", {
          body: {
            businessId: currentBusiness.id,
            signalType: "pulse_checkin",
            source: directScore ? "pulse_widget_quick" : "pulse_widget",
            content: {
              applies_to_date: format(appliesTo, "yyyy-MM-dd"),
              shift_tag: selectedShift,
              pulse_score: finalScore,
              pulse_label: labels[String(finalScore)] || "",
              revenue_local: revenueInput ? parseFloat(revenueInput) : null,
              proxy_type: blueprint?.proxy_base || null,
              proxy_value: proxyValue ? parseFloat(proxyValue) : null,
              notes_good: noteGood.trim() || null,
              notes_bad: noteBad.trim() || null,
              business_type: blueprint?.business_type,
            },
            importance: finalScore <= 2 || finalScore >= 4 ? 8 : 5,
            confidence: revenueInput ? "high" : "medium",
          },
        });
      } catch (signalError) {
        console.error("Error recording pulse signal:", signalError);
      }

      toast({
        title: "Registrado ✓",
        description: `${getPulseScoreEmoji(finalScore)} ${labels[String(finalScore)]}`,
      });

      // Reset
      setPulseScore(null);
      setRevenueInput("");
      setProxyValue("");
      setNoteGood("");
      setNoteBad("");
      setShowMore(false);
      onComplete?.();
    } catch (error) {
      console.error("Error saving pulse checkin:", error);
      toast({ title: "Error", description: "No se pudo guardar. Intentá de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (blueprintLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4" />
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className="flex-1 h-14 bg-muted rounded-xl" />)}
        </div>
      </div>
    );
  }

  // Compact / Widget variant — one-tap
  if (variant === "compact" || variant === "widget") {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-4 transition-all hover:shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            ¿Cómo va hoy?
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {format(appliesTo, "EEE d MMM", { locale: es })}
          </span>
        </div>
        
        <div className="flex gap-1.5">
          {PULSE_OPTIONS.map((opt) => (
            <button
              key={opt.score}
              disabled={saving}
              onClick={() => handleSubmit(opt.score)}
              className={cn(
                "flex-1 py-2.5 px-1 rounded-xl text-center transition-all duration-200",
                "border hover:scale-[1.03] active:scale-95",
                saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                opt.color
              )}
            >
              <span className="text-lg block">{opt.emoji}</span>
              <span className="text-[9px] font-medium block mt-0.5">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-[var(--shadow-md)]">
      {/* Header */}
      {showHeader && (
        <div className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-foreground">
              ¿Cómo va el negocio hoy?
            </h3>
            {hasSpecificBlueprint && (
              <Badge variant="secondary" className="text-[9px] h-5 px-1.5 gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                Personalizado
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">
            {format(appliesTo, "EEEE d 'de' MMMM", { locale: es })} · Respondé en 5 segundos
          </p>
        </div>
      )}

      <div className="px-5 pb-5 space-y-4">
        {/* Score selector */}
        <div className="grid grid-cols-5 gap-2">
          {PULSE_OPTIONS.map((opt) => (
            <button
              key={opt.score}
              onClick={() => setPulseScore(opt.score)}
              className={cn(
                "group py-3.5 px-1 rounded-xl text-center transition-all duration-200",
                "border hover:scale-[1.02] active:scale-95",
                pulseScore === opt.score
                  ? cn(opt.color, "ring-1 ring-current/20 shadow-sm")
                  : "border-border bg-card text-muted-foreground hover:border-border/80"
              )}
            >
              <span className="text-xl block group-hover:scale-110 transition-transform">{opt.emoji}</span>
              <span className="text-[10px] font-medium block mt-0.5">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* After selecting a score */}
        {pulseScore !== null && (
          <div className="space-y-3 animate-fade-in">
            {/* Optional details toggle */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "w-full py-2.5 px-3 rounded-xl text-xs flex items-center justify-between",
                "border border-dashed transition-all",
                showMore 
                  ? "border-primary/30 bg-primary/5 text-foreground" 
                  : "border-border text-muted-foreground hover:border-primary/20"
              )}
            >
              <span>Agregar más detalle (opcional)</span>
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMore && (
              <div className="space-y-3 animate-fade-in rounded-xl bg-muted/20 p-4 border border-border/30">
                {/* Shift */}
                {blueprint?.shift_mode_base !== "none" && (
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(SHIFT_LABELS).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedShift(key)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                          selectedShift === key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {val.emoji} {val.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Revenue */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {blueprint?.numeric_prompt_base || "Ingresos del día"}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    className="h-9 text-sm bg-card"
                  />
                </div>

                {/* Proxy */}
                {blueprint?.proxy_base && (
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {blueprint.proxy_base}
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={proxyValue}
                      onChange={(e) => setProxyValue(e.target.value)}
                      className="h-9 text-sm bg-card"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-success" /> Lo mejor
                    </label>
                    <Textarea
                      placeholder="Algo bueno..."
                      value={noteGood}
                      onChange={(e) => setNoteGood(e.target.value)}
                      className="bg-card resize-none h-16 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-destructive" /> A mejorar
                    </label>
                    <Textarea
                      placeholder="Algo a mejorar..."
                      value={noteBad}
                      onChange={(e) => setNoteBad(e.target.value)}
                      className="bg-card resize-none h-16 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={() => handleSubmit()}
              disabled={pulseScore === null || saving}
              size="sm"
              className="w-full h-9 text-xs gap-1.5 gradient-primary"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseCheckinCard;
