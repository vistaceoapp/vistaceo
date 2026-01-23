import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, Check, Sparkles, ThumbsUp, AlertTriangle, 
  ChevronDown, ChevronUp, TrendingUp, DollarSign, Hash,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import { usePulseBlueprint } from "@/hooks/use-pulse-blueprint";
import { GlassCard } from "./GlassCard";
import { 
  getAutoShiftTag, 
  SHIFT_LABELS, 
  getPulseScoreEmoji,
  PulseCheckinData
} from "@/lib/pulseBlueprints";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PulseCheckinCardProps {
  onComplete?: () => void;
  variant?: "compact" | "full" | "widget";
  showHeader?: boolean;
}

export const PulseCheckinCard = ({ 
  onComplete, 
  variant = "full",
  showHeader = true 
}: PulseCheckinCardProps) => {
  const { currentBusiness } = useBusiness();
  const { blueprint, loading: blueprintLoading, hasSpecificBlueprint } = usePulseBlueprint();
  
  // Form state
  const [pulseScore, setPulseScore] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(getAutoShiftTag());
  const [revenueInput, setRevenueInput] = useState("");
  const [proxyValue, setProxyValue] = useState("");
  const [noteGood, setNoteGood] = useState("");
  const [noteBad, setNoteBad] = useState("");
  const [appliesTo, setAppliesTo] = useState<Date>(new Date());
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Auto-detect shift on mount
  useEffect(() => {
    setSelectedShift(getAutoShiftTag());
  }, []);

  // Get labels from blueprint
  const labels = blueprint?.labels_1_5 || {
    "1": "muy flojo",
    "2": "flojo", 
    "3": "normal",
    "4": "bien",
    "5": "excelente"
  };

  const handleSubmit = async () => {
    if (!currentBusiness || pulseScore === null) return;
    
    setSaving(true);
    try {
      const checkinData = {
        business_id: currentBusiness.id,
        applies_to_date: format(appliesTo, "yyyy-MM-dd"),
        granularity: blueprint?.shift_mode_base === "required" ? "shift" : "daily",
        shift_tag: selectedShift,
        source: revenueInput ? "mixed" : "manual_qualitative",
        pulse_score_1_5: pulseScore,
        pulse_label: labels[String(pulseScore)] || "",
        revenue_local: revenueInput ? parseFloat(revenueInput) : null,
        currency_local: currentBusiness.currency || "ARS",
        volume_proxy_type: blueprint?.proxy_base || null,
        volume_proxy_value: proxyValue ? parseFloat(proxyValue) : null,
        notes_good: noteGood.trim() || null,
        notes_bad: noteBad.trim() || null,
        metadata: {
          blueprint_type: blueprint?.business_type,
          has_specific_blueprint: hasSpecificBlueprint,
        },
      };

      const { error } = await supabase
        .from("pulse_checkins")
        .insert(checkinData);

      if (error) throw error;

      // Record signal to Brain for learning
      try {
        await supabase.functions.invoke("brain-record-signal", {
          body: {
            businessId: currentBusiness.id,
            signalType: "pulse_checkin",
            source: "pulse_widget",
            content: {
              applies_to_date: format(appliesTo, "yyyy-MM-dd"),
              shift_tag: selectedShift,
              pulse_score: pulseScore,
              pulse_label: labels[String(pulseScore)] || "",
              revenue_local: revenueInput ? parseFloat(revenueInput) : null,
              proxy_type: blueprint?.proxy_base || null,
              proxy_value: proxyValue ? parseFloat(proxyValue) : null,
              notes_good: noteGood.trim() || null,
              notes_bad: noteBad.trim() || null,
              business_type: blueprint?.business_type,
            },
            importance: pulseScore <= 2 || pulseScore >= 4 ? 8 : 5, // Higher importance for extreme scores
            confidence: revenueInput ? "high" : "medium",
          },
        });
      } catch (signalError) {
        console.error("Error recording pulse signal:", signalError);
        // Don't fail the whole operation if signal recording fails
      }

      toast({
        title: "✅ Pulso registrado",
        description: `${getPulseScoreEmoji(pulseScore)} ${labels[String(pulseScore)]}. ¡El cerebro está aprendiendo!`,
      });

      // Reset form
      setPulseScore(null);
      setRevenueInput("");
      setProxyValue("");
      setNoteGood("");
      setNoteBad("");
      setShowAdvanced(false);
      setShowEvents(false);
      
      onComplete?.();
    } catch (error) {
      console.error("Error saving pulse checkin:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el pulso. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (blueprintLoading) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-8 bg-muted rounded mb-4 w-2/3" />
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </GlassCard>
    );
  }

  // Compact widget variant
  if (variant === "compact" || variant === "widget") {
    const autoShift = getAutoShiftTag();
    const shiftInfo = autoShift ? SHIFT_LABELS[autoShift] : null;
    
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{shiftInfo?.emoji || "📊"}</span>
            <span className="text-sm font-medium text-foreground">
              {blueprint?.pregunta_principal_base || "¿Cómo estuvo el día?"}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            10 seg
          </Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => {
                setPulseScore(score);
                // Auto-submit after small delay for compact mode
                setTimeout(() => {
                  if (!noteGood && !noteBad && !revenueInput) {
                    handleSubmit();
                  }
                }, 300);
              }}
              className={cn(
                "flex-1 min-w-[60px] py-3 px-2 rounded-xl text-center transition-all",
                "border hover:border-primary/30",
                pulseScore === score
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl block">{getPulseScoreEmoji(score)}</span>
              <span className="text-[10px] font-medium capitalize">{labels[String(score)]}</span>
            </button>
          ))}
        </div>
      </GlassCard>
    );
  }

  // Full variant
  const autoShift = getAutoShiftTag();
  const shiftInfo = autoShift ? SHIFT_LABELS[autoShift] : null;

  return (
    <div className="dashboard-card p-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Check-in de Pulso</h3>
                <p className="text-sm text-muted-foreground">
                  {shiftInfo?.emoji} {format(appliesTo, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          </div>
          {hasSpecificBlueprint && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Personalizado
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-5">
        {/* Main question */}
        <div>
          <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            {blueprint?.pregunta_principal_base || "¿Cómo estuvo el día?"}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                onClick={() => setPulseScore(score)}
                className={cn(
                  "group relative py-4 px-2 rounded-xl text-center transition-all duration-200",
                  "border hover:border-primary/30 hover:shadow-md",
                  pulseScore === score
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "bg-card border-border"
                )}
              >
                <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">
                  {getPulseScoreEmoji(score)}
                </span>
                <span className={cn(
                  "text-xs font-medium block capitalize",
                  pulseScore === score ? "text-primary" : "text-muted-foreground"
                )}>
                  {labels[String(score)]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Show more options after selecting score */}
        {pulseScore !== null && (
          <div className="animate-fade-in space-y-4">
            {/* Shift selector (if optional or required) */}
            {blueprint?.shift_mode_base !== "none" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Turno
                </label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(SHIFT_LABELS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedShift(key)}
                      className={cn(
                        "px-3 py-2 rounded-lg border transition-all text-sm flex items-center gap-2",
                        selectedShift === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{val.emoji}</span>
                      <span>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "w-full py-3 px-4 rounded-xl border transition-all text-sm flex items-center justify-between gap-2",
                showAdvanced 
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-dashed border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Agregar datos numéricos (opcional)</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Advanced fields */}
            {showAdvanced && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
                {/* Revenue input */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    {blueprint?.numeric_prompt_base || "Ingresos del día (opcional)"}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={revenueInput}
                    onChange={(e) => setRevenueInput(e.target.value)}
                    className="bg-card"
                  />
                </div>

                {/* Proxy input */}
                {blueprint?.proxy_base && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      {blueprint.proxy_base} (opcional)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={proxyValue}
                      onChange={(e) => setProxyValue(e.target.value)}
                      className="bg-card"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Events toggle */}
            <button
              onClick={() => setShowEvents(!showEvents)}
              className={cn(
                "w-full py-3 px-4 rounded-xl border transition-all text-sm flex items-center justify-between gap-2",
                showEvents 
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-dashed border-border hover:border-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>¿Pasó algo importante?</span>
              </div>
              {showEvents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Events section */}
            {showEvents && (
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4 animate-fade-in">
                {/* Good event */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-success" />
                    Algo MUY BUENO
                  </label>
                  {blueprint?.eventos_good_base && blueprint.eventos_good_base.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {blueprint.eventos_good_base.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => setNoteGood(ev)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-lg border transition-all",
                            noteGood === ev
                              ? "border-success bg-success/10 text-success"
                              : "border-border hover:border-success/50 text-muted-foreground"
                          )}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  )}
                  <Textarea
                    placeholder="Ej: Un cliente nos felicitó..."
                    value={noteGood}
                    onChange={(e) => setNoteGood(e.target.value)}
                    className="bg-card resize-none h-20"
                  />
                </div>

                {/* Bad event */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Algo MUY MALO
                  </label>
                  {blueprint?.eventos_bad_base && blueprint.eventos_bad_base.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-2">
                      {blueprint.eventos_bad_base.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => setNoteBad(ev)}
                          className={cn(
                            "text-xs px-2 py-1 rounded-lg border transition-all",
                            noteBad === ev
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : "border-border hover:border-destructive/50 text-muted-foreground"
                          )}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  )}
                  <Textarea
                    placeholder="Ej: Tuvimos un problema con..."
                    value={noteBad}
                    onChange={(e) => setNoteBad(e.target.value)}
                    className="bg-card resize-none h-20"
                  />
                </div>

                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  El sistema usará esto para darte mejores recomendaciones
                </p>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={pulseScore === null || saving}
              className="w-full gradient-primary shadow-lg shadow-primary/20 h-12"
            >
              <Check className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar pulso"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PulseCheckinCard;