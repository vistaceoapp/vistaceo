import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/hooks/use-subscription";

/**
 * Free plan = LIFETIME caps (not monthly).
 * - 1 misión total
 * - 3 mensajes de chat total (al agotar: bloqueo hasta Pro)
 * - 2 oportunidades de radar (base) + bonus por recargas mensuales
 * - 2 ítems de I+D (base) + bonus por recargas mensuales
 *
 * Cada 30 días el usuario Free puede tocar "Recargar" y suma +1 oportunidad y +1 I+D.
 * No suma misiones ni chats.
 */
export const FREE_LIMITS = {
  missions: 1,
  chatMessages: 3,
  radarOpportunities: 2,
  radarResearch: 2,
} as const;

// Pro plan caps (alta capacidad, no ilimitado)
export const PRO_LIMITS = {
  missions: 500,
  chatMessages: 1000,
  radarOpportunities: 200,
  radarResearch: 200,
} as const;

interface UsageData {
  missions: number;
  chatMessages: number;
  radarOpportunities: number;
  radarResearch: number;
}

interface FreeTierBonus {
  bonusOpportunities: number;
  bonusResearch: number;
  lastRefillAt: string | null;
  nextRefillAt: string | null;
  canRefillNow: boolean;
}

interface FreeLimitsState {
  usage: UsageData;
  limits: typeof FREE_LIMITS;
  remaining: UsageData;
  canCreate: {
    mission: boolean;
    chat: boolean;
    opportunity: boolean;
    research: boolean;
  };
  percentUsed: UsageData;
  isLoading: boolean;
  isPro: boolean;
  bonus: FreeTierBonus;
  refresh: () => Promise<void>;
  requestRefill: () => Promise<{ success: boolean; message: string }>;
}

const REFILL_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

export const useFreeLimits = (): FreeLimitsState => {
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  const [usage, setUsage] = useState<UsageData>({
    missions: 0,
    chatMessages: 0,
    radarOpportunities: 0,
    radarResearch: 0,
  });
  const [bonus, setBonus] = useState<FreeTierBonus>({
    bonusOpportunities: 0,
    bonusResearch: 0,
    lastRefillAt: null,
    nextRefillAt: null,
    canRefillNow: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (!currentBusiness) {
      setIsLoading(false);
      return;
    }
    try {
      const safeCount = async (fn: () => PromiseLike<{ count: number | null }>) => {
        try {
          const r = await fn();
          return r.count || 0;
        } catch {
          return 0;
        }
      };

      const [missionsCount, chatCount, oppCount, researchCount, stateRes] = await Promise.all([
        safeCount(() =>
          supabase.from("missions").select("id", { count: "exact", head: true }).eq("business_id", currentBusiness.id)
        ),
        safeCount(() =>
          supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("business_id", currentBusiness.id)
            .eq("role", "user")
        ),
        safeCount(() =>
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("business_id", currentBusiness.id)
        ),
        safeCount(() =>
          supabase.from("learning_items").select("id", { count: "exact", head: true }).eq("business_id", currentBusiness.id)
        ),
        (supabase as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: string) => { maybeSingle: () => Promise<{ data: { bonus_opportunities?: number; bonus_research?: number; last_refill_at?: string | null } | null }> } } } })
          .from("free_tier_state").select("*").eq("business_id", currentBusiness.id).maybeSingle(),
      ]);

      setUsage({
        missions: missionsCount,
        chatMessages: chatCount,
        radarOpportunities: oppCount,
        radarResearch: researchCount,
      });

      const state = (stateRes as { data: { bonus_opportunities?: number; bonus_research?: number; last_refill_at?: string | null } | null }).data;
      const lastRefill = state?.last_refill_at ?? null;
      const nextRefill = lastRefill ? new Date(new Date(lastRefill).getTime() + REFILL_INTERVAL_MS).toISOString() : null;
      const canRefillNow = !lastRefill || (Date.now() - new Date(lastRefill).getTime() >= REFILL_INTERVAL_MS);

      setBonus({
        bonusOpportunities: state?.bonus_opportunities ?? 0,
        bonusResearch: state?.bonus_research ?? 0,
        lastRefillAt: lastRefill,
        nextRefillAt: nextRefill,
        canRefillNow,
      });
    } catch (error) {
      console.error("Error fetching usage limits:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage, isPro]);

  const requestRefill = useCallback(async () => {
    if (!currentBusiness) return { success: false, message: "Negocio no encontrado" };
    try {
      const { data, error } = await (supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: Array<{ success: boolean; message: string }> | { success: boolean; message: string } | null; error: { message: string } | null }> }).rpc("request_free_tier_refill", { _business_id: currentBusiness.id });
      if (error) return { success: false, message: error.message };
      const row = Array.isArray(data) ? data[0] : data;
      await fetchUsage();
      return { success: !!row?.success, message: row?.message ?? "Recarga procesada" };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : "Error" };
    }
  }, [currentBusiness, fetchUsage]);

  return useMemo(() => {
    if (isPro) {
      const remainingPro = {
        missions: Math.max(0, PRO_LIMITS.missions - usage.missions),
        chatMessages: Math.max(0, PRO_LIMITS.chatMessages - usage.chatMessages),
        radarOpportunities: Math.max(0, PRO_LIMITS.radarOpportunities - usage.radarOpportunities),
        radarResearch: Math.max(0, PRO_LIMITS.radarResearch - usage.radarResearch),
      };
      return {
        usage,
        limits: PRO_LIMITS as unknown as typeof FREE_LIMITS,
        remaining: remainingPro,
        canCreate: {
          mission: remainingPro.missions > 0,
          chat: remainingPro.chatMessages > 0,
          opportunity: remainingPro.radarOpportunities > 0,
          research: remainingPro.radarResearch > 0,
        },
        percentUsed: {
          missions: Math.min(100, (usage.missions / PRO_LIMITS.missions) * 100),
          chatMessages: Math.min(100, (usage.chatMessages / PRO_LIMITS.chatMessages) * 100),
          radarOpportunities: Math.min(100, (usage.radarOpportunities / PRO_LIMITS.radarOpportunities) * 100),
          radarResearch: Math.min(100, (usage.radarResearch / PRO_LIMITS.radarResearch) * 100),
        },
        isLoading,
        isPro: true,
        bonus,
        refresh: fetchUsage,
        requestRefill,
      };
    }

    const effective = {
      missions: FREE_LIMITS.missions,
      chatMessages: FREE_LIMITS.chatMessages,
      radarOpportunities: FREE_LIMITS.radarOpportunities + bonus.bonusOpportunities,
      radarResearch: FREE_LIMITS.radarResearch + bonus.bonusResearch,
    };

    const remaining = {
      missions: Math.max(0, effective.missions - usage.missions),
      chatMessages: Math.max(0, effective.chatMessages - usage.chatMessages),
      radarOpportunities: Math.max(0, effective.radarOpportunities - usage.radarOpportunities),
      radarResearch: Math.max(0, effective.radarResearch - usage.radarResearch),
    };

    return {
      usage,
      limits: effective as typeof FREE_LIMITS,
      remaining,
      canCreate: {
        mission: remaining.missions > 0,
        chat: remaining.chatMessages > 0,
        opportunity: remaining.radarOpportunities > 0,
        research: remaining.radarResearch > 0,
      },
      percentUsed: {
        missions: Math.min(100, (usage.missions / effective.missions) * 100),
        chatMessages: Math.min(100, (usage.chatMessages / effective.chatMessages) * 100),
        radarOpportunities: Math.min(100, (usage.radarOpportunities / effective.radarOpportunities) * 100),
        radarResearch: Math.min(100, (usage.radarResearch / effective.radarResearch) * 100),
      },
      isLoading,
      isPro: false,
      bonus,
      refresh: fetchUsage,
      requestRefill,
    };
  }, [usage, isPro, isLoading, bonus, fetchUsage, requestRefill]);
};

export const formatLimitText = (used: number, limit: number, isPro: boolean): string => {
  if (isPro) return "Alta capacidad";
  return `${used}/${limit}`;
};

export const useRemainingMissions = () => {
  const { usage, limits, remaining } = useFreeLimits();
  return { used: usage.missions, limit: limits.missions, remaining: remaining.missions };
};

export const isFreeLimitError = (error: unknown): boolean => {
  if (!error) return false;
  const msg = (error as { message?: string })?.message ?? String(error);
  return /free plan (lifetime )?limit reached/i.test(msg);
};

export const getFreeLimitMessage = (error: unknown): { title: string; description: string } => {
  const msg = (error as { message?: string })?.message ?? String(error);
  let resource = "este recurso";
  if (/missions/i.test(msg)) resource = "tu misión inicial del plan Gratis";
  else if (/chat_messages/i.test(msg)) resource = "tus 3 mensajes del chat";
  else if (/opportunities/i.test(msg)) resource = "tus oportunidades del radar";
  else if (/learning_items/i.test(msg)) resource = "tus ítems de I+D";
  return {
    title: "Llegaste al límite del plan Gratis",
    description: `Ya usaste ${resource}. Pasate a Pro para tener alta capacidad sin límites mensuales.`,
  };
};
