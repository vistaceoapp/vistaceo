import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
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
  // Setup and dashboard fields
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

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, category, country, currency, owner_id, avg_ticket, avg_rating, created_at, setup_completed, precision_score, service_model, channel_mix, monthly_revenue_range, avg_ticket_range, daily_transactions_range, food_cost_range, active_dayparts, delivery_platforms, reservation_platforms, competitive_radius_km, google_place_id, address, settings")
        .eq("owner_id", user.id);

      if (error) throw error;

      const businessList = data || [];
      setBusinesses(businessList);
      
      // Set first business as current if none selected
      if (businessList.length > 0 && !currentBusiness) {
        setCurrentBusiness(businessList[0]);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBusinesses();
  }, [user]);

  return (
    <BusinessContext.Provider 
      value={{ 
        currentBusiness, 
        businesses, 
        loading, 
        setCurrentBusiness, 
        refreshBusinesses 
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
