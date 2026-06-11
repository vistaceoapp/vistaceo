import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { startGuardian, stopGuardian } from "@/lib/self-healing-guardian";
import { buildContextPack } from "@/lib/context-pack-builder";

const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 min — menos presión sobre la app
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const ranTodayKey = (kind: string, businessId: string) => `autosync:${kind}:${businessId}`;
const ranToday = (kind: string, businessId: string) => {
  try {
    const last = localStorage.getItem(ranTodayKey(kind, businessId));
    return last ? Date.now() - Number(last) < ONE_DAY_MS : false;
  } catch { return false; }
};
const markRan = (kind: string, businessId: string) => {
  try { localStorage.setItem(ranTodayKey(kind, businessId), String(Date.now())); } catch {}
};
const idle = (cb: () => void, delay = 0) => {
  const w = window as any;
  const run = () => (w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 0));
  return delay > 0 ? setTimeout(run, delay) : (run(), 0 as unknown as ReturnType<typeof setTimeout>);
};

export const useAutoSync = () => {
  const { currentBusiness } = useBusiness();
  const lastSyncRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brainGapsDoneRef = useRef(false);
  const healthCheckDoneRef = useRef(false);

  const triggerSync = async () => {
    if (!currentBusiness) return;
    if (ranToday("sync", currentBusiness.id)) {
      console.log("[auto-sync] Skipped sync (ya corrió hoy)");
      return;
    }

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
      markRan("sync", currentBusiness.id);
    } catch (error) {
      console.error("[auto-sync] Error:", error);
    }
  };

  // Proactively analyze brain gaps on first load
  const triggerBrainGaps = async () => {
    if (!currentBusiness || brainGapsDoneRef.current) return;
    brainGapsDoneRef.current = true;
    if (ranToday("braingaps", currentBusiness.id)) {
      console.log("[auto-sync] Skipped brain-gaps (ya corrió hoy)");
      return;
    }

    try {
      console.log("[auto-sync] Triggering brain-analyze-gaps for:", currentBusiness.id);
      const cp = await buildContextPack('admin', currentBusiness.id).catch(() => null);
      const { error } = await supabase.functions.invoke("brain-analyze-gaps", {
        body: { businessId: currentBusiness.id, module: 'admin', contextPack: cp }
      });
      if (error) {
        console.warn("[auto-sync] Brain gaps error (non-blocking):", error);
      } else {
        console.log("[auto-sync] Brain gaps analysis complete");
        markRan("braingaps", currentBusiness.id);
      }
    } catch (err) {
      console.warn("[auto-sync] Brain gaps failed (non-blocking):", err);
    }
  };

  // Auto-trigger health sync if no snapshot exists
  const checkAndSyncHealth = async () => {
    if (!currentBusiness || healthCheckDoneRef.current) return;
    healthCheckDoneRef.current = true;
    if (ranToday("health", currentBusiness.id)) {
      console.log("[auto-sync] Skipped health check (ya corrió hoy)");
      return;
    }

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
        const cpHealth = await buildContextPack('analytics', currentBusiness.id).catch(() => null);
        const { error: healthErr } = await supabase.functions.invoke("analyze-health-score", {
          body: {
            businessId: currentBusiness.id,
            module: 'analytics',
            contextPack: cpHealth,
            outputContract: 'health_score_v1',
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
          markRan("health", currentBusiness.id);
        }
      } else {
        markRan("health", currentBusiness.id);
      }
    } catch (err) {
      console.warn("[auto-sync] Health check failed (non-blocking):", err);
    }
  };

  useEffect(() => {
    if (!currentBusiness) return;

    // Start self-healing guardian
    startGuardian(currentBusiness.id);

    // Diferimos a idle para no competir con el render inicial
    const initialTimeout = idle(() => triggerSync(), 3000);
    const brainGapsTimeout = idle(() => triggerBrainGaps(), 6000);
    const healthTimeout = idle(() => checkAndSyncHealth(), 9000);

    // Set up interval for periodic sync
    intervalRef.current = setInterval(() => {
      triggerSync();
    }, SYNC_INTERVAL_MS);

    return () => {
      stopGuardian();
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
