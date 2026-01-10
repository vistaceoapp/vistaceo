import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Json } from "@/integrations/supabase/types";

interface BrainMemory {
  factual_memory: Record<string, unknown>;
  preferences_memory: Record<string, unknown>;
  decisions_memory: Record<string, unknown>;
  dynamic_memory: Record<string, unknown>;
}

interface DataGap {
  id: string;
  field_name: string;
  category: string;
  reason: string;
  unlocks: string;
  priority: number;
  status: string;
}

interface BrainState {
  id: string;
  business_id: string;
  primary_business_type: string;
  secondary_business_type: string | null;
  current_focus: string;
  focus_priority: number;
  mvc_completion_pct: number;
  mvc_gaps: DataGap[];
  confidence_score: number;
  total_signals: number;
  last_learning_at: string | null;
  version: number;
  memory: BrainMemory;
}

interface FocusConfig {
  current_focus: string;
  secondary_focus: string | null;
  focus_weights: Record<string, number>;
  auto_adjust_focus: boolean;
  proactive_suggestions: boolean;
  daily_checkin_enabled: boolean;
  weekly_action_limit: number;
}

interface UseBrainResult {
  brain: BrainState | null;
  focusConfig: FocusConfig | null;
  dataGaps: DataGap[];
  loading: boolean;
  error: string | null;
  
  // Computed
  canGenerateSpecific: boolean;
  confidenceLevel: "low" | "medium" | "high";
  focusLabel: string;
  
  // Actions
  refreshBrain: () => Promise<void>;
  updateFocus: (focus: string, secondaryFocus?: string) => Promise<void>;
  recordSignal: (signalType: string, content: Record<string, unknown>, source: string) => Promise<void>;
}

const FOCUS_LABELS: Record<string, string> = {
  ventas: "💰 Ventas",
  marketing: "📱 Marketing", 
  reputacion: "⭐ Reputación",
  eficiencia: "⚡ Eficiencia",
  equipo: "👥 Equipo",
  producto: "📦 Producto",
  costos: "📊 Costos",
  expansion: "🚀 Expansión",
};

export const useBrain = (): UseBrainResult => {
  const { currentBusiness } = useBusiness();
  const [brain, setBrain] = useState<BrainState | null>(null);
  const [focusConfig, setFocusConfig] = useState<FocusConfig | null>(null);
  const [dataGaps, setDataGaps] = useState<DataGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrainData = useCallback(async () => {
    if (!currentBusiness) {
      setBrain(null);
      setFocusConfig(null);
      setDataGaps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch brain, focus config, and data gaps in parallel
      const [brainRes, focusRes, gapsRes] = await Promise.all([
        supabase
          .from("business_brains")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .maybeSingle(),
        supabase
          .from("business_focus_config")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .maybeSingle(),
        supabase
          .from("data_gaps")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .eq("status", "pending")
          .order("priority", { ascending: false })
          .limit(10),
      ]);

      if (brainRes.error) throw brainRes.error;
      if (focusRes.error) throw focusRes.error;
      if (gapsRes.error) throw gapsRes.error;

      // Transform brain data
      if (brainRes.data) {
        const parseJson = (data: Json): Record<string, unknown> => {
          if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return data as Record<string, unknown>;
          }
          return {};
        };

        const parseGaps = (data: Json): DataGap[] => {
          if (Array.isArray(data)) {
            return data as unknown as DataGap[];
          }
          return [];
        };

        setBrain({
          id: brainRes.data.id,
          business_id: brainRes.data.business_id,
          primary_business_type: brainRes.data.primary_business_type,
          secondary_business_type: brainRes.data.secondary_business_type,
          current_focus: brainRes.data.current_focus,
          focus_priority: brainRes.data.focus_priority || 1,
          mvc_completion_pct: brainRes.data.mvc_completion_pct || 0,
          mvc_gaps: parseGaps(brainRes.data.mvc_gaps),
          confidence_score: Number(brainRes.data.confidence_score) || 0,
          total_signals: brainRes.data.total_signals || 0,
          last_learning_at: brainRes.data.last_learning_at,
          version: brainRes.data.version || 1,
          memory: {
            factual_memory: parseJson(brainRes.data.factual_memory),
            preferences_memory: parseJson(brainRes.data.preferences_memory),
            decisions_memory: parseJson(brainRes.data.decisions_memory),
            dynamic_memory: parseJson(brainRes.data.dynamic_memory),
          },
        });
      } else {
        setBrain(null);
      }

      // Transform focus config data
      if (focusRes.data) {
        const parseWeights = (data: Json): Record<string, number> => {
          if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, Number(v) || 0])
            );
          }
          return {};
        };

        setFocusConfig({
          current_focus: focusRes.data.current_focus,
          secondary_focus: focusRes.data.secondary_focus,
          focus_weights: parseWeights(focusRes.data.focus_weights),
          auto_adjust_focus: focusRes.data.auto_adjust_focus ?? false,
          proactive_suggestions: focusRes.data.proactive_suggestions ?? true,
          daily_checkin_enabled: focusRes.data.daily_checkin_enabled ?? true,
          weekly_action_limit: focusRes.data.weekly_action_limit ?? 3,
        });
      } else {
        setFocusConfig(null);
      }

      // Set data gaps
      setDataGaps((gapsRes.data || []).map(gap => ({
        id: gap.id,
        field_name: gap.field_name,
        category: gap.category,
        reason: gap.reason,
        unlocks: gap.unlocks,
        priority: gap.priority || 5,
        status: gap.status || "pending",
      })));

    } catch (err) {
      console.error("Error fetching brain data:", err);
      setError(err instanceof Error ? err.message : "Error loading brain data");
    } finally {
      setLoading(false);
    }
  }, [currentBusiness]);

  // Update focus
  const updateFocus = useCallback(async (focus: string, secondaryFocus?: string) => {
    if (!currentBusiness) return;

    try {
      // Update both brain and focus config
      await supabase
        .from("business_brains")
        .update({ current_focus: focus })
        .eq("business_id", currentBusiness.id);

      await supabase
        .from("business_focus_config")
        .upsert({
          business_id: currentBusiness.id,
          current_focus: focus,
          secondary_focus: secondaryFocus || null,
        }, { onConflict: "business_id" });

      await fetchBrainData();
    } catch (err) {
      console.error("Error updating focus:", err);
      throw err;
    }
  }, [currentBusiness, fetchBrainData]);

  // Record a signal
  const recordSignal = useCallback(async (
    signalType: string, 
    content: Record<string, unknown>, 
    source: string
  ) => {
    if (!currentBusiness) return;

    try {
      await supabase.functions.invoke("brain-record-signal", {
        body: {
          businessId: currentBusiness.id,
          signalType,
          content,
          source,
        }
      });
      
      // Refresh brain data to get updated stats
      await fetchBrainData();
    } catch (err) {
      console.error("Error recording signal:", err);
      throw err;
    }
  }, [currentBusiness, fetchBrainData]);

  // Initial fetch
  useEffect(() => {
    fetchBrainData();
  }, [fetchBrainData]);

  // Computed values
  const canGenerateSpecific = brain ? brain.mvc_completion_pct >= 30 : false;
  
  // confidence_score can be 0-1 OR 0-100 depending on source, normalize it
  const normalizedConfidence = (() => {
    const score = brain?.confidence_score ?? 0;
    // If score > 1, assume it's 0-100 scale, convert to 0-1
    return score > 1 ? score / 100 : score;
  })();
  
  const confidenceLevel: "low" | "medium" | "high" = 
    normalizedConfidence >= 0.7 ? "high" :
    normalizedConfidence >= 0.4 ? "medium" : "low";

  const focusLabel = brain?.current_focus 
    ? FOCUS_LABELS[brain.current_focus] || brain.current_focus 
    : "Sin foco";

  return {
    brain,
    focusConfig,
    dataGaps,
    loading,
    error,
    canGenerateSpecific,
    confidenceLevel,
    focusLabel,
    refreshBrain: fetchBrainData,
    updateFocus,
    recordSignal,
  };
};

export default useBrain;
