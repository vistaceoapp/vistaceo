// Lazy AI Migration: solo re-genera contenido cuando el usuario VUELVE
// (gap > 24h desde último login). Usuarios activos no se ven afectados.
//
// Política: "Lo viejo dejalo. Aplicar a usuarios viejos sólo si vuelven."

import { supabase } from "@/integrations/supabase/client";

const LEGACY_CACHE_PREFIXES = [
  "mission_plan_",
  "opportunity_plan_",
  "prediction_",
  "analytics_",
  "missions_cache_",
  "opportunities_cache_",
  "brain_insights_cache_",
  "dashboard_ai_",
];

function clearLegacyLocalCache(): number {
  let removed = 0;
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (LEGACY_CACHE_PREFIXES.some((p) => k.startsWith(p))) {
        localStorage.removeItem(k);
        removed++;
      }
    }
  } catch {
    /* ignore */
  }
  return removed;
}

let inFlight: Promise<void> | null = null;

export function runLazyAiMigrationIfNeeded(userId: string): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const sessionKey = `va_lazy_migration_${userId}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");

      const { data, error } = await supabase.functions.invoke("migrate-legacy-on-relogin");
      if (error) {
        console.debug("[lazy-migration] edge invoke failed:", error.message);
        return;
      }
      const res = data as { action?: string; artifactsMarked?: number; gapHours?: number };
      if (res?.action === "marked_legacy") {
        const cleared = clearLegacyLocalCache();
        console.info(
          `[lazy-migration] re-entry gap=${res.gapHours}h. ServerArtifactsLegacy=${res.artifactsMarked ?? 0}. LocalCleared=${cleared}.`,
        );
      } else {
        console.debug("[lazy-migration] no action:", res?.action);
      }
    } catch (err) {
      console.debug("[lazy-migration] failed:", err);
    }
  })();

  return inFlight;
}
