// Chat Context Summary — contexto del negocio comprimido y relevante para chat.
// Objetivo: dar al modelo solo lo que necesita para responder la pregunta actual,
// sin saturarlo con JSON crudo ni datos irrelevantes.

export interface ChatContextSummary {
  businessName: string;
  country: string;
  sector: string;
  activity: string;
  model: string;
  customer: string;
  channel: string;
  mainGoal: string;
  mainFriction: string;
  avgTicket: string;
  monthlyRevenue: string;
  staffSize: string;
  location: string;
  activeMissions: string[];
  openOpportunities: string[];
  recentFacts: string[];
  weakDimensions: string[];
  strongDimensions: string[];
  missingData: string[];
}

function safeString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    const maybe = (v as Record<string, unknown>)?.value;
    if (typeof maybe === "string") return maybe.trim();
    if (typeof maybe === "number" || typeof maybe === "boolean") return String(maybe);
    return "";
  }
  return "";
}

function pickFact(
  factual: Record<string, unknown>,
  keys: string[],
  fallback?: string
): string {
  for (const k of keys) {
    const v = safeString(factual[k]);
    if (v) return v;
  }
  return fallback || "";
}

function extractRecentFacts(factual: Record<string, unknown> | null | undefined, max = 8): string[] {
  if (!factual) return [];
  const out: string[] = [];
  const learningKeys = Object.keys(factual).filter(k => k.startsWith("learning_"));
  for (const k of learningKeys) {
    const arr = factual[k];
    if (!Array.isArray(arr)) continue;
    for (const item of arr.slice(0, 3)) {
      if (item && typeof item === "object") {
        const q = safeString((item as any).q);
        const a = safeString((item as any).a);
        if (q && a) out.push(`${q}: ${a}`);
      }
    }
  }
  // También incluir claves estructuradas de nivel superior
  const structuredKeys = [
    "avg_ticket", "service_model", "channel_mix", "staff_size", "billing_model",
    "target_audience", "main_offering", "main_pain_point", "competitor_edge",
    "growth_bottleneck", "peak_hours", "seasonality", "price_range", "delivery_channel",
    "lead_source", "retention_strategy", "differentiator", "sales_cycle_days",
    "monthly_revenue", "daily_transactions", "food_cost_pct", "rent_cost_pct",
    "customer_acquisition_channel", "primary_customer", "location", "business_model",
  ];
  for (const k of structuredKeys) {
    const v = safeString(factual[k]);
    if (v) out.push(`${k.replace(/_/g, " ")}: ${v}`);
  }
  return out.slice(0, max);
}

export function buildChatContextSummary(
  business: { name?: string; country?: string; category?: string } | null | undefined,
  brain: Record<string, unknown> | null | undefined,
  memory: {
    activeMissions?: Array<{ title?: string }>;
    openOpportunities?: Array<{ title?: string }>;
    latestSnapshot?: { sub_scores?: Record<string, number>; total_score?: number } | null;
    businessInsights?: string[];
  } = {}
): ChatContextSummary {
  const factual = (brain?.factual_memory as Record<string, unknown>) || {};
  const prefs = (brain?.preferences_memory as Record<string, unknown>) || {};

  const dims = memory.latestSnapshot?.sub_scores || {};
  const sorted = Object.entries(dims)
    .sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))
    .filter(([_, v]) => typeof v === "number");

  return {
    businessName: business?.name || "tu negocio",
    country: business?.country || safeString(prefs.country_code) || "AR",
    sector: brain?.primary_business_type as string || business?.category || "",
    activity: pickFact(factual, ["interpreted_activity", "business_type_label", "sector"]),
    model: pickFact(factual, ["business_model", "service_model", "billing_model"]),
    customer: pickFact(factual, ["primary_customer", "main_customer", "client_summary", "target_audience"]),
    channel: pickFact(factual, ["customer_acquisition_channel", "main_channel", "channel_summary", "channel_mix", "lead_source"]),
    mainGoal: pickFact(factual, ["main_goal", "growth_bottleneck", "current_focus"]),
    mainFriction: pickFact(factual, ["main_pain_point", "main_friction", "growth_bottleneck"]),
    avgTicket: pickFact(factual, ["avg_ticket", "avg_ticket_range"]),
    monthlyRevenue: pickFact(factual, ["monthly_revenue", "monthly_revenue_range"]),
    staffSize: pickFact(factual, ["staff_size", "employee_count"]),
    location: pickFact(factual, ["location", "address", "city", "region"]),
    activeMissions: (memory.activeMissions || []).map(m => m.title || "").filter(Boolean).slice(0, 4),
    openOpportunities: (memory.openOpportunities || []).map(o => o.title || "").filter(Boolean).slice(0, 4),
    recentFacts: extractRecentFacts(factual, 8),
    weakDimensions: sorted.slice(0, 2).map(([k]) => k),
    strongDimensions: sorted.slice(-2).map(([k]) => k),
    missingData: (brain?.missing_critical as string[]) || [],
  };
}

export function renderChatContextSummary(ctx: ChatContextSummary, lastUserText: string): string {
  const lines: string[] = [];
  lines.push("=== CONTEXTO DEL NEGOCIO (resumen ejecutivo) ===");
  lines.push(`- Negocio: ${ctx.businessName} (${ctx.country})`);
  if (ctx.sector) lines.push(`- Rubro: ${ctx.sector}`);
  if (ctx.activity) lines.push(`- Actividad: ${ctx.activity}`);
  if (ctx.model) lines.push(`- Modelo: ${ctx.model}`);
  if (ctx.customer) lines.push(`- Cliente: ${ctx.customer}`);
  if (ctx.channel) lines.push(`- Canal principal: ${ctx.channel}`);
  if (ctx.mainGoal) lines.push(`- Objetivo principal: ${ctx.mainGoal}`);
  if (ctx.mainFriction) lines.push(`- Fricción principal: ${ctx.mainFriction}`);
  if (ctx.avgTicket) lines.push(`- Ticket promedio: ${ctx.avgTicket}`);
  if (ctx.monthlyRevenue) lines.push(`- Facturación mensual aprox: ${ctx.monthlyRevenue}`);
  if (ctx.staffSize) lines.push(`- Equipo: ${ctx.staffSize}`);
  if (ctx.location) lines.push(`- Ubicación: ${ctx.location}`);

  if (ctx.activeMissions.length) {
    lines.push(`- Misiones activas: ${ctx.activeMissions.join(" | ")}`);
  }
  if (ctx.openOpportunities.length) {
    lines.push(`- Oportunidades abiertas: ${ctx.openOpportunities.join(" | ")}`);
  }
  if (ctx.recentFacts.length) {
    lines.push("- Datos recientes confirmados:");
    for (const f of ctx.recentFacts.slice(0, 6)) lines.push(`  · ${f}`);
  }
  if (ctx.weakDimensions.length) {
    lines.push(`- Áreas a fortalecer: ${ctx.weakDimensions.join(", ")}`);
  }
  if (ctx.strongDimensions.length) {
    lines.push(`- Áreas fuertes: ${ctx.strongDimensions.join(", ")}`);
  }
  if (ctx.missingData.length) {
    lines.push(`- Datos que convendría confirmar: ${ctx.missingData.slice(0, 3).join(", ")}`);
  }

  lines.push("");
  lines.push("=== PREGUNTA ACTUAL ===");
  lines.push(`"""${lastUserText}"""`);
  lines.push("");
  lines.push("REGLA DE ORO: respondé directamente a la PREGUNTA ACTUAL. Usá el contexto del negocio solo si aporta valor real a esta respuesta. No des vueltas. No repitas la pregunta.");

  return lines.join("\n");
}
