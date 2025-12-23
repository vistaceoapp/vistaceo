import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const useAutoSync = () => {
  const { currentBusiness } = useBusiness();
  const lastSyncRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSync = async () => {
    if (!currentBusiness) return;

    try {
      console.log("[auto-sync] Triggering sync for business:", currentBusiness.id);
      
      const { data, error } = await supabase.functions.invoke("sync-external-data", {
        body: { businessId: currentBusiness.id }
      });

      if (error) {
        console.error("[auto-sync] Sync error:", error);
        return;
      }

      console.log("[auto-sync] Sync completed:", data);
      lastSyncRef.current = new Date();
    } catch (error) {
      console.error("[auto-sync] Error:", error);
    }
  };

  useEffect(() => {
    if (!currentBusiness) return;

    // Initial sync on mount (delayed to not block UI)
    const initialTimeout = setTimeout(() => {
      triggerSync();
    }, 3000);

    // Set up interval for periodic sync
    intervalRef.current = setInterval(() => {
      triggerSync();
    }, SYNC_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentBusiness?.id]);

  return { triggerSync, lastSync: lastSyncRef.current };
};

export default useAutoSync;