import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Business {
  id: string;
  name: string;
  category: string;
  country: string;
  currency: string;
  avg_ticket?: number | null;
  avg_rating?: number | null;
  created_at?: string | null;
}

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
        .select("id, name, category, country, currency, avg_ticket, avg_rating, created_at")
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
