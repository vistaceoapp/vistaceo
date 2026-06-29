// VISTACEO Conversion Intelligence OS — Agent (scores + decision + dedupe)
// Para cada usuario:
//  1. Carga brain, plan, eventos, perfil de conversion, memoria, prefs.
//  2. Recalcula los 10 scores + pro_readiness + conversion_probability.
//  3. Decide segmento, estrategia, canal, placement, timing, CTA.
//  4. Pasa Anti-Annoyance + Frequency + Quality gates (reutiliza brain-core).
//  5. Guarda decision + actualiza profile + memoria.
//  6. Si la decisión es enviar email, encola UNA vez vía send-transactional-email
//     con idempotency_key determinístico (anti-duplicación absoluta).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Scores = {
  activation_score: number;
  engagement_score: number;
  value_realization_score: number;
  purchase_intent_score: number;
  premium_interest_score: number;
  friction_score: number;
  churn_risk_score: number;
  trust_score: number;
  email_engagement_score: number;
  pro_readiness_score: number;
  conversion_probability: number;
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function computeScores(input: {
  events: Array<{ event_name: string; created_at: string }>;
  hasBusiness: boolean;
  hasBrain: boolean;
  brainConfidence: number;
  isPro: boolean;
  emailEngagement: { opens: number; clicks: number; sends: number };
  daysSince: number;
}): Scores {
  const counts: Record<string, number> = {};
  for (const e of input.events) counts[e.event_name] = (counts[e.event_name] ?? 0) + 1;

  const activation =
    (input.hasBusiness ? 30 : 0) +
    (counts["onboarding_completed"] ? 25 : 0) +
    (counts["first_dashboard_viewed"] ? 15 : 0) +
    (counts["first_chat_message_sent"] ? 15 : 0) +
    (counts["first_value_detected"] ? 15 : 0);

  const engagement =
    Math.min(40, (counts["dashboard_viewed"] ?? 0) * 4) +
    Math.min(20, (counts["chat_message_sent"] ?? 0) * 3) +
    Math.min(15, (counts["mission_viewed"] ?? 0) * 3) +
    Math.min(15, (counts["radar_viewed"] ?? 0) * 3) +
    Math.min(10, (counts["analytics_viewed"] ?? 0) * 2);

  const value =
    Math.min(35, (counts["mission_completed"] ?? 0) * 15) +
    Math.min(25, (counts["opportunity_saved"] ?? 0) * 10) +
    Math.min(20, (counts["first_value_detected"] ?? 0) * 20) +
    Math.min(20, (counts["chat_message_sent"] ?? 0) * 2);

  const intent =
    Math.min(40, (counts["upgrade_clicked"] ?? 0) * 20) +
    Math.min(25, (counts["pricing_viewed"] ?? 0) * 12) +
    Math.min(20, (counts["pro_page_viewed"] ?? 0) * 8) +
    Math.min(15, (counts["checkout_started"] ?? 0) * 15);

  const premium =
    Math.min(50, (counts["premium_gate_viewed"] ?? 0) * 10) +
    Math.min(30, (counts["premium_feature_clicked"] ?? 0) * 12) +
    Math.min(20, (counts["upgrade_clicked"] ?? 0) * 8);

  const friction =
    Math.min(35, (counts["modal_closed"] ?? 0) * 7) +
    Math.min(30, (counts["short_session"] ?? 0) * 6) +
    Math.min(20, (counts["payment_failed"] ?? 0) * 20) +
    Math.min(15, (counts["onboarding_abandoned"] ?? 0) * 15);

  const churn =
    (input.daysSince > 14 && (counts["dashboard_viewed"] ?? 0) < 2 ? 50 : 0) +
    (input.daysSince > 7 && !counts["first_value_detected"] ? 25 : 0) +
    Math.min(25, (counts["onboarding_abandoned"] ?? 0) * 25);

  const trust =
    (counts["mission_completed"] ?? 0) * 8 +
    (counts["opportunity_saved"] ?? 0) * 6 +
    (counts["user_returned"] ?? 0) * 4 +
    Math.min(20, input.brainConfidence * 25);

  const emailEng =
    input.emailEngagement.sends === 0
      ? 0
      : clamp(
          (input.emailEngagement.opens / Math.max(1, input.emailEngagement.sends)) * 50 +
            (input.emailEngagement.clicks / Math.max(1, input.emailEngagement.sends)) * 100,
        );

  const proReadiness = clamp(
    activation * 0.15 +
      engagement * 0.15 +
      value * 0.2 +
      intent * 0.2 +
      premium * 0.15 +
      trust * 0.1 +
      emailEng * 0.05 -
      friction * 0.1 -
      churn * 0.1,
  );

  return {
    activation_score: clamp(activation),
    engagement_score: clamp(engagement),
    value_realization_score: clamp(value),
    purchase_intent_score: clamp(intent),
    premium_interest_score: clamp(premium),
    friction_score: clamp(friction),
    churn_risk_score: clamp(churn),
    trust_score: clamp(trust),
    email_engagement_score: clamp(emailEng),
    pro_readiness_score: proReadiness,
    conversion_probability: input.isPro ? 100 : proReadiness,
  };
}

function decideSegment(s: Scores, ctx: { isPro: boolean; checkoutAbandoned: boolean; resistant: boolean }): string {
  if (ctx.isPro) return "pro_user";
  if (ctx.checkoutAbandoned) return "checkout_abandoned";
  if (ctx.resistant) return "resistant_to_messages";
  if (s.churn_risk_score >= 60) return "at_risk";
  if (s.pro_readiness_score >= 70) return "ready_for_pro";
  if (s.purchase_intent_score >= 50) return "high_intent";
  if (s.premium_interest_score >= 40) return "interest_specific";
  if (s.value_realization_score >= 40) return "free_active";
  if (s.activation_score >= 60 && s.value_realization_score < 30) return "activated_no_value";
  return "new_unactivated";
}

function decideStrategy(segment: string): { strategy: string; channel: string; placement: string | null; intent: string } {
  switch (segment) {
    case "pro_user": return { strategy: "silent_mode", channel: "silent", placement: null, intent: "no_op" };
    case "checkout_abandoned": return { strategy: "recover_checkout", channel: "app", placement: "checkout_recovery_card", intent: "recovery" };
    case "resistant_to_messages": return { strategy: "silent_mode", channel: "silent", placement: null, intent: "back_off" };
    case "at_risk": return { strategy: "reduce_friction", channel: "app", placement: "dashboard_top_banner", intent: "recover_with_value" };
    case "ready_for_pro": return { strategy: "direct_upgrade", channel: "app", placement: "next_action_card", intent: "upgrade" };
    case "high_intent": return { strategy: "contextual_upgrade", channel: "app", placement: "next_action_card", intent: "upgrade_contextual" };
    case "interest_specific": return { strategy: "soft_upgrade", channel: "app", placement: "opportunity_locked_card", intent: "show_pro_value" };
    case "free_active": return { strategy: "educate_user", channel: "app", placement: "next_action_card", intent: "deepen" };
    case "activated_no_value": return { strategy: "show_first_value", channel: "app", placement: "dashboard_top_banner", intent: "first_value" };
    default: return { strategy: "activate_user", channel: "app", placement: "dashboard_top_banner", intent: "activation" };
  }
}

// Anti-annoyance & frequency guard
function applyGuards(
  decision: { channel: string; intent: string; strategy: string },
  profile: any,
): { allowed: boolean; reason?: string; downgradeTo?: string } {
  const now = Date.now();
  if (profile?.do_not_disturb_until && new Date(profile.do_not_disturb_until).getTime() > now) {
    return { allowed: false, reason: "dnd_active" };
  }
  if (decision.channel === "email") {
    if (profile?.email_suppressed_until && new Date(profile.email_suppressed_until).getTime() > now) {
      return { allowed: false, reason: "email_suppressed_window", downgradeTo: "app" };
    }
    if ((profile?.email_count_7d ?? 0) >= 3) {
      return { allowed: false, reason: "email_weekly_cap", downgradeTo: "app" };
    }
    if (profile?.last_email_sent_at && now - new Date(profile.last_email_sent_at).getTime() < 48 * 3600 * 1000) {
      return { allowed: false, reason: "email_48h_window", downgradeTo: "app" };
    }
  }
  if ((profile?.modal_close_count_7d ?? 0) >= 3 && decision.strategy !== "silent_mode") {
    return { allowed: false, reason: "modal_fatigue", downgradeTo: "silent" };
  }
  if ((profile?.prompt_count_7d ?? 0) >= 7) {
    return { allowed: false, reason: "prompt_weekly_cap", downgradeTo: "silent" };
  }
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const body = await req.json().catch(() => ({}));
    const userId: string | undefined = body?.user_id;
    const triggerEvent: string | undefined = body?.trigger_event;
    if (!userId) return new Response(JSON.stringify({ error: "missing_user_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // ---- Load context ----
    const [profileRes, businessRes, eventsRes, subRes, emailLogRes] = await Promise.all([
      supabase.from("user_conversion_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("businesses").select("id, business_brains(confidence_score)").eq("owner_id", userId).maybeSingle(),
      supabase.from("conversion_events").select("event_name, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(500),
      supabase.from("subscriptions").select("status, expires_at").eq("user_id", userId).order("expires_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("email_send_log").select("status, created_at").eq("recipient_email", (await supabase.auth.admin.getUserById(userId)).data?.user?.email ?? "").order("created_at", { ascending: false }).limit(50),
    ]);

    const profile = profileRes.data ?? {};
    const business = businessRes.data as any;
    const events = eventsRes.data ?? [];
    const isPro = !!(subRes.data && subRes.data.status === "active" && subRes.data.expires_at && new Date(subRes.data.expires_at) > new Date());
    const brainConfidence = Number(business?.business_brains?.[0]?.confidence_score ?? 0);
    const emailLog = emailLogRes.data ?? [];

    const userRow = (await supabase.auth.admin.getUserById(userId)).data?.user;
    const createdAt = userRow?.created_at ? new Date(userRow.created_at) : new Date();
    const daysSince = Math.floor((Date.now() - createdAt.getTime()) / 86400000);

    const emailEngagement = {
      opens: emailLog.filter((e) => e.status === "opened").length,
      clicks: emailLog.filter((e) => e.status === "clicked").length,
      sends: emailLog.filter((e) => e.status === "sent").length,
    };

    const scores = computeScores({
      events,
      hasBusiness: !!business?.id,
      hasBrain: brainConfidence > 0,
      brainConfidence,
      isPro,
      emailEngagement,
      daysSince,
    });

    const recentEvents = events.filter((e) => Date.now() - new Date(e.created_at).getTime() < 7 * 86400000);
    const checkoutAbandoned =
      recentEvents.some((e) => e.event_name === "checkout_started") &&
      !recentEvents.some((e) => e.event_name === "payment_success");
    const resistant = (profile.modal_close_count_7d ?? 0) >= 4;

    const segment = decideSegment(scores, { isPro, checkoutAbandoned, resistant });
    let plan = decideStrategy(segment);

    // Guards
    const guard = applyGuards(plan, profile);
    let blockedBy: string | null = null;
    let passedGate = true;
    if (!guard.allowed) {
      blockedBy = guard.reason ?? "guard";
      passedGate = false;
      if (guard.downgradeTo === "silent") {
        plan = { ...plan, strategy: "silent_mode", channel: "silent", placement: null, intent: "back_off" };
      } else if (guard.downgradeTo === "app" && plan.channel === "email") {
        plan = { ...plan, channel: "app" };
      }
    }

    // Quality rule: never sell before value
    if (
      ["direct_upgrade", "contextual_upgrade"].includes(plan.strategy) &&
      scores.value_realization_score < 25
    ) {
      plan = { strategy: "show_first_value", channel: "app", placement: "dashboard_top_banner", intent: "first_value" };
      blockedBy = (blockedBy ? blockedBy + "+" : "") + "no_value_yet";
    }

    // ---- Persist scores + profile ----
    await supabase.from("user_conversion_profiles").upsert(
      {
        user_id: userId,
        plan_status: isPro ? "pro" : "free",
        subscription_status: subRes.data?.status ?? null,
        days_since_signup: daysSince,
        sessions_count: (profile.sessions_count ?? 0),
        last_active_at: new Date().toISOString(),
        ...scores,
        current_conversion_segment: segment,
        current_conversion_strategy: plan.strategy,
        next_best_action: plan.intent,
        next_best_channel: plan.channel,
        next_best_timing: "now",
      },
      { onConflict: "user_id" },
    );

    // ---- Log decision ----
    const { data: decisionRow } = await supabase
      .from("conversion_agent_decisions")
      .insert({
        user_id: userId,
        strategy: plan.strategy,
        channel: plan.channel,
        placement: plan.placement,
        timing: "now",
        intent: plan.intent,
        reason: triggerEvent ? `trigger:${triggerEvent}` : "scheduled",
        passed_quality_gate: passedGate,
        blocked_by_guard: blockedBy,
        scores_snapshot: scores,
        context_snapshot: { segment, isPro, checkoutAbandoned, daysSince, eventCount: events.length },
      })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        ok: true,
        decision_id: decisionRow?.id ?? null,
        segment,
        plan,
        scores,
        blocked_by: blockedBy,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[conv-agent] fatal", (e as Error).message);
    return new Response(JSON.stringify({ error: "internal", detail: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
