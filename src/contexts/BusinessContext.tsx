import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { safeSessionStorage } from "@/lib/safe-storage";
import type { Json } from "@/integrations/supabase/types";


interface Business {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  owner_id?: string;
  avg_ticket?: number | null;
  avg_rating?: number | null;
  created_at?: string | null;
  setup_completed?: boolean | null;
  precision_score?: number | null;
  service_model?: string | null;
  channel_mix?: Json | null;
  monthly_revenue_range?: Json | null;
  avg_ticket_range?: Json | null;
  daily_transactions_range?: Json | null;
  food_cost_range?: Json | null;
  active_dayparts?: string[] | null;
  delivery_platforms?: string[] | null;
  reservation_platforms?: string[] | null;
  competitive_radius_km?: number | null;
  google_place_id?: string | null;
  address?: string | null;
  settings?: Json | null;
}

export type { Business };

interface BusinessContextType {
  currentBusiness: Business | null;
  businesses: Business[];
  loading: boolean;
  setCurrentBusiness: (business: Business) => void;
  refreshBusinesses: () => Promise<void>;
}

export const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const BUSINESS_FIELDS =
  "id, name, category, country, currency, owner_id, avg_ticket, avg_rating, created_at, setup_completed, precision_score, service_model, channel_mix, monthly_revenue_range, avg_ticket_range, daily_transactions_range, food_cost_range, active_dayparts, delivery_platforms, reservation_platforms, competitive_radius_km, google_place_id, address, settings";

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedForUserRef = useRef<string | null>(null);

  const refreshBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusinessState(null);
      setLoading(false);
      fetchedForUserRef.current = null;
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select(BUSINESS_FIELDS)
        .eq("owner_id", user.id)
        .order("setup_completed", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const businessList = data || [];
      setBusinesses(businessList);
      setCurrentBusinessState((prev) => prev ?? businessList[0] ?? null);
      fetchedForUserRef.current = user.id;
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user && fetchedForUserRef.current === user.id && businesses.length > 0) {
      setLoading(false);
      return;
    }
    refreshBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const setCurrentBusiness = useCallback((business: Business) => {
    setCurrentBusinessState(business);
  }, []);

  // Backfill: si el negocio activo está completado pero nunca se sembró el Brain,
  // disparar el seed sectorial una sola vez (idempotente del lado del edge function).
  const seededRef = useRef<Set<string>>(new Set());
  const insightsSeededRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const b = currentBusiness;
    if (!b?.id || !b.setup_completed) return;
    const settings = (b.settings as Record<string, unknown> | null) ?? {};

    if (!seededRef.current.has(b.id) && !settings.brain_seeded_at) {
      seededRef.current.add(b.id);
      supabase.functions
        .invoke("seed-business-brain", { body: { businessId: b.id } })
        .catch((err) => console.warn("[business] seed backfill falló:", err));
    }

    // Safety net: seed inicial de misión + oportunidades + tendencias si nunca corrió
    // (usuarios que completaron setup pero nunca llegaron a /app/preparing).
    if (!insightsSeededRef.current.has(b.id) && !settings.seeding_completed_at) {
      insightsSeededRef.current.add(b.id);
      supabase.functions
        .invoke("seed-initial-insights", { body: { businessId: b.id } })
        .catch((err) => console.warn("[business] initial insights backfill falló:", err));
    }
  }, [currentBusiness]);


  const value = useMemo(
    () => ({ currentBusiness, businesses, loading, setCurrentBusiness, refreshBusinesses }),
    [currentBusiness, businesses, loading, setCurrentBusiness, refreshBusinesses]
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
