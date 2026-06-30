// VISTACEO Conversion OS — Cliente liviano de tracking + Next Best Action.
// No reemplaza signup-tracking ni lifecycle-tracking; los complementa con eventos finos
// (premium_gate_viewed, modal_closed, checkout_started, upgrade_clicked, etc.).
import { supabase } from "@/integrations/supabase/client";

export type ConversionEventName =
  | "dashboard_viewed"
  | "chat_message_sent"
  | "mission_viewed"
  | "mission_completed"
  | "opportunity_saved"
  | "radar_viewed"
  | "analytics_viewed"
  | "premium_gate_viewed"
  | "premium_feature_clicked"
  | "pricing_viewed"
  | "pro_page_viewed"
  | "upgrade_clicked"
  | "checkout_started"
  | "payment_failed"
  | "payment_success"
  | "modal_closed"
  | "short_session"
  | "onboarding_abandoned"
  | "onboarding_completed"
  | "first_value_detected"
  | "user_returned"
  | "first_dashboard_viewed"
  | "first_chat_message_sent"
  | "conversion_card_clicked"
  | "conversion_card_dismissed";

const KEY_TRIGGERS = new Set<ConversionEventName>([
  "checkout_started",
  "payment_failed",
  "upgrade_clicked",
  "premium_gate_viewed",
  "first_value_detected",
  "mission_completed",
]);

export async function trackConversionEvent(
  event: ConversionEventName,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;
    await supabase.functions.invoke("conversion-track-event", {
      body: {
        user_id: userId,
        event_name: event,
        meta,
        run_agent: KEY_TRIGGERS.has(event),
      },
    });
  } catch (err) {
    if (import.meta.env.DEV) console.warn("[conversion-track]", (err as Error).message);
  }
}

export async function fetchNextBestAction(): Promise<{
  decision_id: string;
  strategy: string;
  placement: string | null;
  intent: string;
  segment: string | null;
} | null> {
  try {
    const { data, error } = await supabase.functions.invoke("conversion-next-best-action");
    if (error) return null;
    return (data as { action: any } | null)?.action ?? null;
  } catch {
    return null;
  }
}
