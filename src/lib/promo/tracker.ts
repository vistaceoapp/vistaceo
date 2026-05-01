// Lightweight tracker for /promo — works for anonymous visitors (no AuthProvider/BusinessContext required).
// Persists events to Supabase via edge function `track-user-activity` if available; always falls back to
// console.debug + window.dataLayer (Google Tag Manager) so paid traffic can still be measured.

import { supabase } from "@/integrations/supabase/client";
import { safeSessionStorage } from "@/lib/safe-storage";

type PromoEvent =
  | "promo_landing_view"
  | "promo_signup_cta_click"
  | "promo_secondary_cta_click";

function getOrCreateAnonSession(): string {
  const KEY = "vc_anon_session";
  const existing = safeSessionStorage.getItem(KEY);
  if (existing) return existing;
  const fresh = `a_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
  safeSessionStorage.setItem(KEY, fresh);
  return fresh;
}

export async function trackPromoEvent(
  event: PromoEvent,
  data: Record<string, unknown> = {}
) {
  const payload = {
    event_type: "feature_use",
    event_data: { feature: event, ...data },
    page_path:
      typeof window !== "undefined" ? window.location.pathname : "/promo",
    session_id: getOrCreateAnonSession(),
  };

  // Push to GTM dataLayer (works even without backend) so Google Ads conversion tags fire.
  try {
    if (typeof window !== "undefined") {
      // @ts-expect-error - dataLayer is dynamic
      window.dataLayer = window.dataLayer || [];
      // @ts-expect-error - dataLayer is dynamic
      window.dataLayer.push({ event, ...data });
    }
  } catch {
    // ignore
  }

  // Fire-and-forget edge call. Errors are swallowed — never break the landing.
  try {
    await supabase.functions.invoke("track-user-activity", { body: payload });
  } catch (err) {
    console.debug("[promo-tracker] failed:", err);
  }
}
