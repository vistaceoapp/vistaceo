// VISTACEO Conversion Intelligence OS — Agent v2 (hiper-inteligente, sin gasto de IA)
// Añade:
//  - Señales con decaimiento exponencial (los últimos días pesan más).
//  - Velocidad de uso 7d vs 30d (aceleración / desaceleración).
//  - Micro-segmento (segmento base + señal dominante) para hyper-personalización.
//  - Resumen legible del razonamiento para /admin (por qué el agente eligió esto).
//  - Backoff extra para usuarios "resistant" y fatiga acumulada.
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
  velocity_7d: number;
  velocity_30d: number;
  recency_weighted_engagement: number;
};

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

// Decaimiento exponencial: eventos de hoy pesan 1.0, hace 7d ~0.5, hace 30d ~0.06
function recencyWeight(ageDays: number): number {
  return Math.exp(-ageDays / 10);
}

function countWeighted(events: Array<{ event_name: string; created_at: string }>): Record<string, number> {
  const out: Record<string, number> = {};
  const now = Date.now();
  for (const e of events) {
    const age = (now - new Date(e.created_at).getTime()) / 86400000;
    const w = recencyWeight(age);
    out[e.event_name] = (out[e.event_name] ?? 0) + w;
  }
  return out;
}

function countRaw(events: Array<{ event_name: string; created_at: string }>, days: number): Record<string, number> {
  const out: Record<string, number> = {};
  const cutoff = Date.now() - days * 86400000;
  for (const e of events) {
    if (new Date(e.created_at).getTime() < cutoff) continue;
    out[e.event_name] = (out[e.event_name] ?? 0) + 1;
  }
  return out;
}

function computeScores(input: {
  events: Array<{ event_name: string; created_at: string }>;
  hasBusiness: boolean;
  hasBrain: boolean;
  brainConfidence: number;
  isPro: boolean;
  emailEngagement: { opens: number; clicks: number; sends: number };
  daysSince: number;
}): Scores {
  // Pesos decaídos por recencia (para todos los scores "cualitativos")
  const w = countWeighted(input.events);
  // Conteos crudos para velocidad
  const c7 = countRaw(input.events, 7);
  const c30 = countRaw(input.events, 30);

  const activation =
    (input.hasBusiness ? 30 : 0) +
    (w["onboarding_completed"] ? 25 : 0) +
    (w["first_dashboard_viewed"] ? 15 : 0) +
    (w["first_chat_message_sent"] ? 15 : 0) +
    (w["first_value_detected"] ? 15 : 0);

  const engagement =
    Math.min(40, (w["dashboard_viewed"] ?? 0) * 5) +
    Math.min(20, (w["chat_message_sent"] ?? 0) * 4) +
    Math.min(15, (w["mission_viewed"] ?? 0) * 4) +
    Math.min(15, (w["radar_viewed"] ?? 0) * 4) +
    Math.min(10, (w["analytics_viewed"] ?? 0) * 3);

  const value =
    Math.min(35, (w["mission_completed"] ?? 0) * 18) +
    Math.min(25, (w["opportunity_saved"] ?? 0) * 12) +
    Math.min(20, (w["first_value_detected"] ?? 0) * 20) +
    Math.min(20, (w["chat_message_sent"] ?? 0) * 2.5);

  const intent =
    Math.min(40, (w["upgrade_clicked"] ?? 0) * 22) +
    Math.min(25, (w["pricing_viewed"] ?? 0) * 14) +
    Math.min(20, (w["pro_page_viewed"] ?? 0) * 10) +
    Math.min(15, (w["checkout_started"] ?? 0) * 15);

  const premium =
    Math.min(50, (w["premium_gate_viewed"] ?? 0) * 12) +
    Math.min(30, (w["premium_feature_clicked"] ?? 0) * 14) +
    Math.min(20, (w["upgrade_clicked"] ?? 0) * 10);

  const friction =
    Math.min(35, (w["modal_closed"] ?? 0) * 8) +
    Math.min(30, (w["short_session"] ?? 0) * 7) +
    Math.min(20, (w["payment_failed"] ?? 0) * 20) +
    Math.min(15, (w["onboarding_abandoned"] ?? 0) * 15);

  const churn =
    (input.daysSince > 14 && (c7["dashboard_viewed"] ?? 0) < 2 ? 50 : 0) +
    (input.daysSince > 7 && !w["first_value_detected"] ? 25 : 0) +
    Math.min(25, (w["onboarding_abandoned"] ?? 0) * 25);

  const trust =
    (w["mission_completed"] ?? 0) * 9 +
    (w["opportunity_saved"] ?? 0) * 7 +
    (w["user_returned"] ?? 0) * 5 +
    Math.min(20, input.brainConfidence * 25);

  const emailEng =
    input.emailEngagement.sends === 0
      ? 0
      : clamp(
          (input.emailEngagement.opens / Math.max(1, input.emailEngagement.sends)) * 50 +
            (input.emailEngagement.clicks / Math.max(1, input.emailEngagement.sends)) * 100,
        );

  // Velocidad: eventos "buenos" 7d vs 30d normalizado por semana
  const goodEvents = (o: Record<string, number>) =>
    (o["dashboard_viewed"] ?? 0) +
    (o["chat_message_sent"] ?? 0) +
    (o["mission_viewed"] ?? 0) +
    (o["mission_completed"] ?? 0) * 2 +
    (o["opportunity_saved"] ?? 0) * 2;

  const g7 = goodEvents(c7);
  const g30 = goodEvents(c30);
  const velocity_7d = clamp(g7 * 4);
  const velocity_30d = clamp(g30);
  const recency_weighted_engagement = clamp(engagement);

  const proReadiness = clamp(
    activation * 0.15 +
      engagement * 0.15 +
      value * 0.2 +
      intent * 0.2 +
      premium * 0.15 +
      trust * 0.1 +
      emailEng * 0.05 -
      friction * 0.1 -
      churn * 0.1 +
      (velocity_7d - velocity_30d / 4) * 0.05, // acelerando → sube
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
    velocity_7d,
    velocity_30d,
    recency_weighted_engagement,
  };
}

function decideSegment(
  s: Scores,
  ctx: { isPro: boolean; checkoutAbandoned: boolean; resistant: boolean; hasBusiness: boolean },
): string {
  if (ctx.isPro) return "pro_user";
  if (ctx.checkoutAbandoned) return "checkout_abandoned";
  if (ctx.resistant) return "resistant_to_messages";
  if (!ctx.hasBusiness) return "no_business_yet";
  if (s.churn_risk_score >= 60) return "at_risk";
  if (s.pro_readiness_score >= 70) return "ready_for_pro";
  if (s.purchase_intent_score >= 50) return "high_intent";
  if (s.premium_interest_score >= 40) return "interest_specific";
  if (s.velocity_7d > s.velocity_30d / 2 && s.value_realization_score >= 30) return "accelerating";
  if (s.value_realization_score >= 40) return "free_active";
  if (s.activation_score >= 60 && s.value_realization_score < 30) return "activated_no_value";
  return "new_unactivated";
}

// Detecta la señal más fuerte (para copy hyper-personalizado)
function topSignal(s: Scores): string {
  const pool: Array<[string, number]> = [
    ["purchase_intent", s.purchase_intent_score],
    ["premium_interest", s.premium_interest_score],
    ["value_realization", s.value_realization_score],
    ["engagement", s.engagement_score],
    ["friction", s.friction_score],
    ["churn_risk", s.churn_risk_score],
    ["trust", s.trust_score],
  ];
  pool.sort((a, b) => b[1] - a[1]);
  return pool[0][0];
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
    case "accelerating": return { strategy: "amplify_momentum", channel: "app", placement: "next_action_card", intent: "deepen" };
    case "free_active": return { strategy: "educate_user", channel: "app", placement: "next_action_card", intent: "deepen" };
    case "activated_no_value": return { strategy: "show_first_value", channel: "app", placement: "dashboard_top_banner", intent: "first_value" };
    case "no_business_yet": return { strategy: "complete_setup", channel: "app", placement: "dashboard_top_banner", intent: "setup" };
    default: return { strategy: "activate_user", channel: "app", placement: "dashboard_top_banner", intent: "activation" };
  }
}

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

function buildReasoningSummary(input: {
  segment: string;
  microSegment: string;
  scores: Scores;
  plan: { strategy: string; channel: string; intent: string };
  blockedBy: string | null;
  daysSince: number;
  isPro: boolean;
  eventCount: number;
}): string {
  const s = input.scores;
  const parts: string[] = [];
  parts.push(`Segmento: ${input.segment} (micro: ${input.microSegment}).`);
  parts.push(
    `Scores → activación ${s.activation_score}, valor ${s.value_realization_score}, intención ${s.purchase_intent_score}, premium ${s.premium_interest_score}, fricción ${s.friction_score}, churn ${s.churn_risk_score}.`,
  );
  parts.push(`Velocidad: 7d=${s.velocity_7d} vs 30d=${s.velocity_30d} (${s.velocity_7d > s.velocity_30d / 2 ? "acelerando" : "desacelerando"}).`);
  parts.push(`Días desde registro: ${input.daysSince}. Eventos totales: ${input.eventCount}.`);
  parts.push(`Decisión: ${input.plan.strategy} vía ${input.plan.channel} → intent "${input.plan.intent}".`);
  if (input.blockedBy) parts.push(`Bloqueado por: ${input.blockedBy}.`);
  if (input.isPro) parts.push("Usuario Pro: modo silencio activo.");
  return parts.join(" ");
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

    const [profileRes, businessRes, eventsRes, subRes, userRes] = await Promise.all([
      supabase.from("user_conversion_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("businesses").select("id, business_brains(confidence_score)").eq("owner_id", userId).maybeSingle(),
      supabase.from("conversion_events").select("event_name, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1000),
      supabase.from("subscriptions").select("status, expires_at").eq("user_id", userId).order("expires_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.auth.admin.getUserById(userId),
    ]);

    const profile = profileRes.data ?? {};
    const business = businessRes.data as any;
    const events = eventsRes.data ?? [];
    const isPro = !!(subRes.data && subRes.data.status === "active" && subRes.data.expires_at && new Date(subRes.data.expires_at) > new Date());
    const brainConfidence = Number(business?.business_brains?.[0]?.confidence_score ?? 0);
    const userRow = userRes.data?.user;
    const userEmail = userRow?.email ?? "";

    const emailLogRes = userEmail
      ? await supabase.from("email_send_log").select("status, created_at").eq("recipient_email", userEmail).order("created_at", { ascending: false }).limit(50)
      : { data: [] as any[] };
    const emailLog = emailLogRes.data ?? [];

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

    const segment = decideSegment(scores, { isPro, checkoutAbandoned, resistant, hasBusiness: !!business?.id });
    const signal = topSignal(scores);
    const microSegment = `${segment}:${signal}`;
    let plan = decideStrategy(segment);

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

    if (
      ["direct_upgrade", "contextual_upgrade"].includes(plan.strategy) &&
      scores.value_realization_score < 25
    ) {
      plan = { strategy: "show_first_value", channel: "app", placement: "dashboard_top_banner", intent: "first_value" };
      blockedBy = (blockedBy ? blockedBy + "+" : "") + "no_value_yet";
    }

    const reasoning = buildReasoningSummary({
      segment, microSegment, scores, plan, blockedBy, daysSince, isPro, eventCount: events.length,
    });

    await supabase.from("user_conversion_profiles").upsert(
      {
        user_id: userId,
        plan_status: isPro ? "pro" : "free",
        subscription_status: subRes.data?.status ?? null,
        days_since_signup: daysSince,
        sessions_count: (profile.sessions_count ?? 0),
        last_active_at: new Date().toISOString(),
        last_agent_run_at: new Date().toISOString(),
        activation_score: scores.activation_score,
        engagement_score: scores.engagement_score,
        value_realization_score: scores.value_realization_score,
        purchase_intent_score: scores.purchase_intent_score,
        premium_interest_score: scores.premium_interest_score,
        friction_score: scores.friction_score,
        churn_risk_score: scores.churn_risk_score,
        trust_score: scores.trust_score,
        email_engagement_score: scores.email_engagement_score,
        pro_readiness_score: scores.pro_readiness_score,
        conversion_probability: scores.conversion_probability,
        velocity_7d: scores.velocity_7d,
        velocity_30d: scores.velocity_30d,
        recency_weighted_engagement: scores.recency_weighted_engagement,
        current_conversion_segment: segment,
        current_conversion_strategy: plan.strategy,
        micro_segment: microSegment,
        top_signal: signal,
        reasoning_summary: reasoning,
        next_best_action: plan.intent,
        next_best_channel: plan.channel,
        next_best_timing: "now",
      },
      { onConflict: "user_id" },
    );

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
        context_snapshot: {
          segment, microSegment, topSignal: signal, isPro, checkoutAbandoned,
          daysSince, eventCount: events.length, reasoning,
        },
      })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        ok: true,
        decision_id: decisionRow?.id ?? null,
        segment,
        micro_segment: microSegment,
        top_signal: signal,
        plan,
        scores,
        blocked_by: blockedBy,
        reasoning,
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
