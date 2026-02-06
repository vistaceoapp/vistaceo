import { useMemo, useContext } from "react";
import { BusinessContext } from "@/contexts/BusinessContext";

interface SubscriptionState {
  isPro: boolean;
  planId: "free" | "pro_monthly" | "pro_yearly";
  expiresAt: Date | null;
  daysRemaining: number | null;
  isExpiringSoon: boolean; // últimos 7 días
  paymentProvider: "mercadopago" | "paypal" | null;
  lastPaymentAt: Date | null;
}

// Safe hook that doesn't throw if BusinessProvider is missing
function useOptionalBusiness() {
  const context = useContext(BusinessContext);
  return context ?? { currentBusiness: null, businesses: [], loading: true, setCurrentBusiness: () => {}, refreshBusinesses: async () => {} };
}

export const useSubscription = (): SubscriptionState => {
  const { currentBusiness } = useOptionalBusiness();

  return useMemo(() => {
    if (!currentBusiness) {
      return {
        isPro: false,
        planId: "free",
        expiresAt: null,
        daysRemaining: null,
        isExpiringSoon: false,
        paymentProvider: null,
        lastPaymentAt: null,
      };
    }

    const settings = currentBusiness.settings as Record<string, any> | null;
    
    if (!settings) {
      return {
        isPro: false,
        planId: "free",
        expiresAt: null,
        daysRemaining: null,
        isExpiringSoon: false,
        paymentProvider: null,
        lastPaymentAt: null,
      };
    }

    const plan = settings.plan || "free";
    const planId = settings.plan_id || "free";
    const expiresAtStr = settings.plan_expires_at;
    const paymentProvider = settings.payment_provider || null;
    const lastPaymentAtStr = settings.last_payment_at;

    const isPro = plan === "pro";
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
    const lastPaymentAt = lastPaymentAtStr ? new Date(lastPaymentAtStr) : null;

    let daysRemaining: number | null = null;
    let isExpiringSoon = false;

    if (expiresAt) {
      const now = new Date();
      const diffMs = expiresAt.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;
    }

    return {
      isPro,
      planId: planId as "free" | "pro_monthly" | "pro_yearly",
      expiresAt,
      daysRemaining,
      isExpiringSoon,
      paymentProvider,
      lastPaymentAt,
    };
  }, [currentBusiness]);
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
