import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useSubscription } from "@/hooks/use-subscription";

// Free plan limits (per month)
export const FREE_LIMITS = {
  missions: 3,
  chatMessages: 3,
  radarOpportunities: 3,
  radarResearch: 3,
} as const;

interface UsageData {
  missions: number;
  chatMessages: number;
  radarOpportunities: number;
  radarResearch: number;
}

interface FreeLimitsState {
  usage: UsageData;
  limits: typeof FREE_LIMITS;
  remaining: {
    missions: number;
    chatMessages: number;
    radarOpportunities: number;
    radarResearch: number;
  };
  canCreate: {
    mission: boolean;
    chat: boolean;
    opportunity: boolean;
    research: boolean;
  };
  percentUsed: {
    missions: number;
    chatMessages: number;
    radarOpportunities: number;
    radarResearch: number;
  };
  isLoading: boolean;
  isPro: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook to track Free plan usage limits
 * Pro users have unlimited access
 */
export const useFreeLimits = (): FreeLimitsState => {
  const { currentBusiness } = useBusiness();
  const { isPro } = useSubscription();
  const [usage, setUsage] = useState<UsageData>({
    missions: 0,
    chatMessages: 0,
    radarOpportunities: 0,
    radarResearch: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = async () => {
    if (!currentBusiness) {
      setIsLoading(false);
      return;
    }

    // Pro users don't have limits
    if (isPro) {
      setUsage({ missions: 0, chatMessages: 0, radarOpportunities: 0, radarResearch: 0 });
      setIsLoading(false);
      return;
    }

    try {
      // Get start of current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch usage counts in parallel
      const [missionsRes, chatRes, opportunitiesRes, researchRes] = await Promise.all([
        // Missions created this month
        supabase
          .from("missions")
          .select("id", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startOfMonth),
        
        // Chat messages this month (user messages only)
        supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .eq("role", "user")
          .gte("created_at", startOfMonth),
        
        // Radar opportunities (internal) viewed/converted this month
        supabase
          .from("opportunities")
          .select("id", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startOfMonth),
        
        // Research/I+D items (external) this month
        supabase
          .from("learning_items")
          .select("id", { count: "exact", head: true })
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startOfMonth),
      ]);

      setUsage({
        missions: missionsRes.count || 0,
        chatMessages: chatRes.count || 0,
        radarOpportunities: opportunitiesRes.count || 0,
        radarResearch: researchRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching usage limits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [currentBusiness, isPro]);

  return useMemo(() => {
    // Pro users get unlimited
    if (isPro) {
      return {
        usage: { missions: 0, chatMessages: 0, radarOpportunities: 0, radarResearch: 0 },
        limits: FREE_LIMITS,
        remaining: {
          missions: Infinity,
          chatMessages: Infinity,
          radarOpportunities: Infinity,
          radarResearch: Infinity,
        },
        canCreate: {
          mission: true,
          chat: true,
          opportunity: true,
          research: true,
        },
        percentUsed: {
          missions: 0,
          chatMessages: 0,
          radarOpportunities: 0,
          radarResearch: 0,
        },
        isLoading,
        isPro: true,
        refresh: fetchUsage,
      };
    }

    const remaining = {
      missions: Math.max(0, FREE_LIMITS.missions - usage.missions),
      chatMessages: Math.max(0, FREE_LIMITS.chatMessages - usage.chatMessages),
      radarOpportunities: Math.max(0, FREE_LIMITS.radarOpportunities - usage.radarOpportunities),
      radarResearch: Math.max(0, FREE_LIMITS.radarResearch - usage.radarResearch),
    };

    return {
      usage,
      limits: FREE_LIMITS,
      remaining,
      canCreate: {
        mission: remaining.missions > 0,
        chat: remaining.chatMessages > 0,
        opportunity: remaining.radarOpportunities > 0,
        research: remaining.radarResearch > 0,
      },
      percentUsed: {
        missions: Math.min(100, (usage.missions / FREE_LIMITS.missions) * 100),
        chatMessages: Math.min(100, (usage.chatMessages / FREE_LIMITS.chatMessages) * 100),
        radarOpportunities: Math.min(100, (usage.radarOpportunities / FREE_LIMITS.radarOpportunities) * 100),
        radarResearch: Math.min(100, (usage.radarResearch / FREE_LIMITS.radarResearch) * 100),
      },
      isLoading,
      isPro: false,
      refresh: fetchUsage,
    };
  }, [usage, isPro, isLoading]);
};

/**
 * Component to display usage limit indicator
 */
export const formatLimitText = (used: number, limit: number, isPro: boolean): string => {
  if (isPro) return "Ilimitado";
  return `${used}/${limit}`;
};
