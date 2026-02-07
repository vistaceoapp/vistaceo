import { useEffect, useMemo, useRef, useContext } from "react";
import { BusinessContext } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionState {
  isPro: boolean;
  planId: "free" | "pro_monthly" | "pro_yearly";
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean;
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

const EMPTY_RESULT: SubscriptionState = {
  isPro: false,
  planId: "free",
  expiresAt: null,
  daysRemaining: null,
  isExpiringSoon: false,
  paymentProvider: null,
  lastPaymentAt: null,
  isLoading: false,
};

function computeDerived(expiresAt: Date | null) {
  if (!expiresAt) return { daysRemaining: null as number | null, isExpiringSoon: false };
  const diffMs = expiresAt.getTime() - Date.now();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return {
    daysRemaining,
    isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7,
  };
}

async function fetchSubscription(businessId: string, settingsFallback: Record<string, any> | null): Promise<Omit<SubscriptionState, "isLoading">> {
  // Primary source: subscriptions table
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("plan_id, expires_at, payment_provider, created_at")
    .eq("business_id", businessId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && subscription?.expires_at) {
    const expiresAt = new Date(subscription.expires_at);
    const isActive = expiresAt.getTime() > Date.now();
    const derived = computeDerived(expiresAt);

    return {
      isPro: isActive,
      planId: (subscription.plan_id || "free") as SubscriptionState["planId"],
      expiresAt,
      daysRemaining: derived.daysRemaining,
      isExpiringSoon: derived.isExpiringSoon,
      paymentProvider: (subscription.payment_provider || null) as SubscriptionState["paymentProvider"],
      lastPaymentAt: subscription.created_at ? new Date(subscription.created_at) : null,
    };
  }

  // Fallback: business.settings (legacy)
  const plan = settingsFallback?.plan || "free";
  const planId = settingsFallback?.plan_id || "free";
  const expiresAtStr = settingsFallback?.plan_expires_at;
  const paymentProvider = settingsFallback?.payment_provider || null;
  const lastPaymentAtStr = settingsFallback?.last_payment_at;

  const isPro = plan === "pro";
  const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
  const lastPaymentAt = lastPaymentAtStr ? new Date(lastPaymentAtStr) : null;
  const derived = computeDerived(expiresAt);

  return {
    isPro,
    planId: planId as SubscriptionState["planId"],
    expiresAt,
    daysRemaining: derived.daysRemaining,
    isExpiringSoon: derived.isExpiringSoon,
    paymentProvider: paymentProvider as SubscriptionState["paymentProvider"],
    lastPaymentAt,
  };
}

export const useSubscription = (): SubscriptionState => {
  const { currentBusiness, loading: businessLoading } = useOptionalBusiness();

  const businessId = currentBusiness?.id ?? null;
  const settingsRef = useRef<Record<string, any> | null>(null);

  // Keep settings in ref to avoid query key changes
  if (currentBusiness?.settings) {
    settingsRef.current = currentBusiness.settings as Record<string, any>;
  }

  const { data, isLoading } = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: () => fetchSubscription(businessId!, settingsRef.current),
    enabled: !!businessId && !businessLoading,
    staleTime: 60_000, // 1 min
    gcTime: 5 * 60_000, // 5 min (previously cacheTime)
    refetchOnWindowFocus: false,
  });

  return useMemo<SubscriptionState>(() => {
    if (businessLoading || !businessId) {
      return { ...EMPTY_RESULT, isLoading: businessLoading };
    }

    if (isLoading || !data) {
      return { ...EMPTY_RESULT, isLoading: true };
    }

    return { ...data, isLoading: false };
  }, [businessLoading, businessId, isLoading, data]);
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

  return true;
};

// Helper to get remaining missions for free users
export const useRemainingMissions = (): { used: number; limit: number; remaining: number } => {
  const { isPro } = useSubscription();

  if (isPro) {
    return { used: 0, limit: Infinity, remaining: Infinity };
  }

  return { used: 0, limit: 3, remaining: 3 };
};
