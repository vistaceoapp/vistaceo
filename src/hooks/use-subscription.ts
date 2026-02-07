import { useEffect, useMemo, useState, useContext } from "react";
import { BusinessContext } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  isPro: boolean;
  planId: "free" | "pro_monthly" | "pro_yearly";
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean; // últimos 7 días
  paymentProvider: "mercadopago" | "paypal" | null;
  lastPaymentAt: Date | null;
  isLoading: boolean;
}

// Safe hook that doesn't throw if BusinessProvider is missing
function useOptionalBusiness() {
  const context = useContext(BusinessContext);
  return (
    context ?? {
      currentBusiness: null,
      businesses: [],
      loading: true,
      setCurrentBusiness: () => {},
      refreshBusinesses: async () => {},
    }
  );
}

const EMPTY: Omit<SubscriptionState, "isLoading"> = {
  isPro: false,
  planId: "free",
  expiresAt: null,
  daysRemaining: null,
  isExpiringSoon: false,
  paymentProvider: null,
  lastPaymentAt: null,
};

function computeDerived(expiresAt: Date | null) {
  if (!expiresAt) return { daysRemaining: null as number | null, isExpiringSoon: false };
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    daysRemaining,
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7,
  };
}

export const useSubscription = (): SubscriptionState => {
  const { currentBusiness, loading: businessLoading } = useOptionalBusiness();
  const [state, setState] = useState<Omit<SubscriptionState, "isLoading">>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (businessLoading) return;

      if (!currentBusiness) {
        if (isMounted) {
          setState(EMPTY);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        // Source of truth: active subscription for this business
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("plan_id, expires_at, payment_provider, created_at")
          .eq("business_id", currentBusiness.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (subscription?.expires_at) {
          const expiresAt = new Date(subscription.expires_at);
          const isActive = expiresAt.getTime() > Date.now();

          const derived = computeDerived(expiresAt);

          if (isMounted) {
            setState({
              isPro: isActive,
              planId: (subscription.plan_id || "free") as SubscriptionState["planId"],
              expiresAt,
              daysRemaining: derived.daysRemaining,
              isExpiringSoon: derived.isExpiringSoon,
              paymentProvider: (subscription.payment_provider || null) as SubscriptionState["paymentProvider"],
              lastPaymentAt: subscription.created_at ? new Date(subscription.created_at) : null,
            });
            setIsLoading(false);
          }
          return;
        }

        // Fallback (older data): business.settings
        const settings = currentBusiness.settings as Record<string, any> | null;
        const plan = settings?.plan || "free";
        const planId = settings?.plan_id || "free";
        const expiresAtStr = settings?.plan_expires_at;
        const paymentProvider = settings?.payment_provider || null;
        const lastPaymentAtStr = settings?.last_payment_at;

        const isPro = plan === "pro";
        const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
        const lastPaymentAt = lastPaymentAtStr ? new Date(lastPaymentAtStr) : null;
        const derived = computeDerived(expiresAt);

        if (isMounted) {
          setState({
            isPro,
            planId: planId as SubscriptionState["planId"],
            expiresAt,
            daysRemaining: derived.daysRemaining,
            isExpiringSoon: derived.isExpiringSoon,
            paymentProvider: paymentProvider as SubscriptionState["paymentProvider"],
            lastPaymentAt,
          });
          setIsLoading(false);
        }
      } catch (e) {
        console.error("[useSubscription] Failed to load subscription:", e);
        if (isMounted) {
          setState(EMPTY);
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [currentBusiness?.id, businessLoading]);

  return useMemo(() => ({ ...state, isLoading }), [state, isLoading]);
};

// Helper to check if a feature is available
export const useProFeature = (feature: string): boolean => {
  const { isPro } = useSubscription();

  const proOnlyFeatures = [
    "unlimited_missions",
    "voice_chat",
    "photo_analysis",
    "document_analysis",
    "advanced_analytics",
    "predictive_ai",
    "full_radar",
    "premium_integrations",
  ];

  if (proOnlyFeatures.includes(feature)) {
    return isPro;
  }

  return true; // Feature is available for free users
};

// Helper to get remaining missions for free users
export const useRemainingMissions = (): { used: number; limit: number; remaining: number } => {
  const { isPro } = useSubscription();

  if (isPro) {
    return { used: 0, limit: Infinity, remaining: Infinity };
  }

  // For free users, limit is 3 missions per month
  // This would need to be tracked in the database
  return { used: 0, limit: 3, remaining: 3 };
};

