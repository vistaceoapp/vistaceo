import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const BRAIN_GAPS_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export const useAutoSync = () => {
  const { currentBusiness } = useBusiness();
  const lastSyncRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brainGapsDoneRef = useRef(false);
  const healthCheckDoneRef = useRef(false);

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

  // Proactively analyze brain gaps on first load
  const triggerBrainGaps = async () => {
    if (!currentBusiness || brainGapsDoneRef.current) return;
    brainGapsDoneRef.current = true;

    try {
      console.log("[auto-sync] Triggering brain-analyze-gaps for:", currentBusiness.id);
      const { error } = await supabase.functions.invoke("brain-analyze-gaps", {
        body: { businessId: currentBusiness.id }
      });
      if (error) {
        console.warn("[auto-sync] Brain gaps error (non-blocking):", error);
      } else {
        console.log("[auto-sync] Brain gaps analysis complete");
      }
    } catch (err) {
      console.warn("[auto-sync] Brain gaps failed (non-blocking):", err);
    }
  };

  // Auto-trigger health sync if no snapshot exists
  const checkAndSyncHealth = async () => {
    if (!currentBusiness || healthCheckDoneRef.current) return;
    healthCheckDoneRef.current = true;

    try {
      const { data: snapshots, error } = await supabase
        .from("snapshots")
        .select("id, created_at")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) return;

      const hasRecentSnapshot = snapshots && snapshots.length > 0 &&
        (Date.now() - new Date(snapshots[0].created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;

      if (!hasRecentSnapshot) {
        console.log("[auto-sync] No recent health snapshot, triggering analyze-health-score...");
        const { error: healthErr } = await supabase.functions.invoke("analyze-health-score", {
          body: { 
            businessId: currentBusiness.id,
            setupData: {
              businessName: currentBusiness.name,
              countryCode: currentBusiness.country,
            },
            googleData: {
              placeId: currentBusiness.google_place_id,
              rating: currentBusiness.avg_rating,
            },
            brainData: null,
            integrationsData: [],
            signalsData: [],
          }
        });
        if (healthErr) {
          console.warn("[auto-sync] Health sync error (non-blocking):", healthErr);
        } else {
          console.log("[auto-sync] Health snapshot created proactively");
        }
      }
    } catch (err) {
      console.warn("[auto-sync] Health check failed (non-blocking):", err);
    }
  };

  useEffect(() => {
    if (!currentBusiness) return;

    // Initial sync on mount (delayed to not block UI)
    const initialTimeout = setTimeout(() => {
      triggerSync();
    }, 3000);

    // Proactive brain gaps analysis (delayed further)
    const brainGapsTimeout = setTimeout(() => {
      triggerBrainGaps();
    }, 5000);

    // Check health snapshot freshness
    const healthTimeout = setTimeout(() => {
      checkAndSyncHealth();
    }, 8000);

    // Set up interval for periodic sync
    intervalRef.current = setInterval(() => {
      triggerSync();
    }, SYNC_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(brainGapsTimeout);
      clearTimeout(healthTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentBusiness?.id]);

  return { triggerSync, lastSync: lastSyncRef.current };
};

export default useAutoSync;
