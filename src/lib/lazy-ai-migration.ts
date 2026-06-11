// Lazy AI Migration: only re-genera contenido viejo cuando el usuario VUELVE
// al sistema (gap > 24h desde su último login). No toca nada para usuarios
// activos día a día.
//
// Política definida por el usuario:
//   "Lo viejo dejalo, lo empecemos a aplicar a nuevos usuarios.
//    A usuarios viejos sólo si vuelven a loguearse."

import { supabase } from "@/integrations/supabase/client";

const REENTRY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 horas

// Prefijos de localStorage que cachean contenido IA crudo.
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
    // localStorage puede no estar disponible
  }
  return removed;
}

async function markServerArtifactsLegacy(userId: string): Promise<void> {
  try {
    const { data: bizs } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", userId);
    const ids = (bizs ?? []).map((b) => b.id).filter(Boolean);
    if (ids.length === 0) return;
    await (supabase as unknown as {
      from: (t: string) => {
        update: (v: Record<string, unknown>) => {
          in: (col: string, vals: string[]) => Promise<unknown>;
        };
      };
    })
      .from("ai_artifacts_cache")
      .update({ legacy: true })
      .in("business_id", ids);
  } catch (err) {
    console.debug("[lazy-migration] mark legacy skipped:", err);
  }
}

let inFlight: Promise<void> | null = null;

export function runLazyAiMigrationIfNeeded(userId: string): Promise<void> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      // Una sola corrida por sesión de browser por usuario.
      const sessionKey = `va_lazy_migration_${userId}`;
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");

      // Leer last_login_at ANTES de que track-user-activity lo actualice.
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_login_at, last_active_at")
        .eq("id", userId)
        .maybeSingle();

      const last = profile?.last_login_at ?? profile?.last_active_at;
      if (!last) return; // primer login — no hay nada legacy
      const gap = Date.now() - new Date(last).getTime();
      if (gap < REENTRY_THRESHOLD_MS) return; // usuario activo

      const cleared = clearLegacyLocalCache();
      await markServerArtifactsLegacy(userId);
      console.info(
        `[lazy-migration] re-entry detected (gap=${Math.round(gap / 3600000)}h). Cleared ${cleared} local caches; server artifacts marked legacy.`,
      );
    } catch (err) {
      console.debug("[lazy-migration] failed:", err);
    }
  })();

  return inFlight;
}
