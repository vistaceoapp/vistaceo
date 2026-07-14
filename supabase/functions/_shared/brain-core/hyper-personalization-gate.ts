// Brain Core — Hyper-Personalization Gate.
// Segunda capa sobre extreme-quality-gate. Exige que cualquier salida visible
// esté anclada en variables REALES del negocio: sector, sub-sector, país,
// ciudad, cliente objetivo, canal, oferta, fricción o nombre del negocio.
//
// Si un output no menciona al menos N anclas concretas del brain, se
// considera "insuficientemente personalizado" y debe regenerarse.

export interface HyperAnchors {
  businessName?: string | null;
  sector?: string | null;
  subSector?: string | null;
  niche?: string | null;
  businessModel?: string | null;
  stage?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  geoScope?: string | null;
  customer?: string | null;
  customerSegment?: string | null;
  channel?: string | null;
  offer?: string | null;
  valueProp?: string | null;
  differentiator?: string | null;
  priceRange?: string | null;
  ticketSize?: string | null;
  salesCycle?: string | null;
  seasonality?: string | null;
  teamSize?: string | null;
  mainFriction?: string | null;
  mainGoal?: string | null;
  competitors?: string[];
  currency?: string | null;
}

export interface HyperCheckInput {
  text: string;
  anchors: HyperAnchors;
  /** Mínimo de anclas distintas presentes en el texto. Default 2. */
  minAnchors?: number;
  /** Si true, exige al menos una ancla que NO sea sector genérico. */
  requireSpecific?: boolean;
}

export interface HyperCheckResult {
  ok: boolean;
  matchedAnchors: string[];
  missingCritical: string[];
  score: number; // 0..1
  reasons: string[];
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(v?: string | null): string[] {
  if (!v) return [];
  return norm(v)
    .split(/[^a-z0-9ñü]+/)
    .filter((t) => t.length >= 4);
}

function textIncludesAny(text: string, keywords: string[]): boolean {
  if (!keywords.length) return false;
  const n = norm(text);
  return keywords.some((k) => k.length >= 4 && n.includes(k));
}

const GENERIC_SECTORS = new Set([
  "servicios", "negocio", "empresa", "comercio", "tienda", "local",
  "profesional", "consultoria", "digital", "online",
]);

export function hyperPersonalizationCheck(input: HyperCheckInput): HyperCheckResult {
  const a = input.anchors;
  const text = input.text ?? "";
  const matched: string[] = [];
  const reasons: string[] = [];

  const checks: Array<{ key: string; kws: string[]; specific?: boolean }> = [
    { key: "businessName", kws: tokens(a.businessName), specific: true },
    { key: "sector", kws: tokens(a.sector), specific: !!a.sector && !GENERIC_SECTORS.has(norm(a.sector)) },
    { key: "subSector", kws: tokens(a.subSector), specific: true },
    { key: "niche", kws: tokens(a.niche), specific: true },
    { key: "businessModel", kws: tokens(a.businessModel), specific: true },
    { key: "stage", kws: tokens(a.stage), specific: false },
    { key: "country", kws: tokens(a.country), specific: true },
    { key: "city", kws: tokens(a.city), specific: true },
    { key: "region", kws: tokens(a.region), specific: true },
    { key: "geoScope", kws: tokens(a.geoScope), specific: false },
    { key: "customer", kws: tokens(a.customer), specific: true },
    { key: "customerSegment", kws: tokens(a.customerSegment), specific: true },
    { key: "channel", kws: tokens(a.channel), specific: false },
    { key: "offer", kws: tokens(a.offer), specific: true },
    { key: "valueProp", kws: tokens(a.valueProp), specific: true },
    { key: "differentiator", kws: tokens(a.differentiator), specific: true },
    { key: "priceRange", kws: tokens(a.priceRange), specific: false },
    { key: "ticketSize", kws: tokens(a.ticketSize), specific: false },
    { key: "salesCycle", kws: tokens(a.salesCycle), specific: false },
    { key: "seasonality", kws: tokens(a.seasonality), specific: false },
    { key: "teamSize", kws: tokens(a.teamSize), specific: false },
    { key: "mainFriction", kws: tokens(a.mainFriction), specific: true },
    { key: "mainGoal", kws: tokens(a.mainGoal), specific: false },
    ...(a.competitors ?? []).slice(0, 3).map((c) => ({
      key: `competitor:${c}`, kws: tokens(c), specific: true,
    })),
  ];

  const specificMatches: string[] = [];
  for (const c of checks) {
    if (!c.kws.length) continue;
    if (textIncludesAny(text, c.kws)) {
      matched.push(c.key);
      if (c.specific) specificMatches.push(c.key);
    }
  }

  const min = Math.max(1, input.minAnchors ?? 2);
  const missingCritical: string[] = [];

  if (matched.length < min) {
    reasons.push(`personalización insuficiente: ${matched.length}/${min} anclas presentes`);
    if (!a.sector) missingCritical.push("sector");
    if (!a.customer) missingCritical.push("cliente");
    if (!a.country) missingCritical.push("país");
  }

  if (input.requireSpecific && specificMatches.length === 0) {
    reasons.push("sin ancla específica del negocio (solo genéricas)");
  }

  // Score: proporción de anclas disponibles que aparecen en el texto.
  const available = checks.filter((c) => c.kws.length > 0).length || 1;
  const score = Math.min(1, matched.length / Math.max(2, available));

  return {
    ok: reasons.length === 0,
    matchedAnchors: matched,
    missingCritical,
    score,
    reasons,
  };
}

/**
 * Fuerza de contexto del brain (0..1). Se usa para decidir si vale la pena
 * generar contenido o si conviene primero pedirle 1 dato al usuario.
 */
export function contextStrengthScore(a: HyperAnchors, signalCount = 0): number {
  const weights: Array<[string, number, boolean]> = [
    ["sector", 0.10, !!a.sector],
    ["subSector", 0.09, !!a.subSector],
    ["niche", 0.06, !!a.niche],
    ["businessModel", 0.06, !!a.businessModel],
    ["stage", 0.03, !!a.stage],
    ["country", 0.05, !!a.country],
    ["city", 0.03, !!a.city],
    ["customer", 0.12, !!a.customer],
    ["customerSegment", 0.05, !!a.customerSegment],
    ["offer", 0.10, !!a.offer],
    ["valueProp", 0.06, !!a.valueProp],
    ["differentiator", 0.04, !!a.differentiator],
    ["priceRange", 0.03, !!a.priceRange || !!a.ticketSize],
    ["mainFriction", 0.09, !!a.mainFriction],
    ["mainGoal", 0.05, !!a.mainGoal],
    ["channel", 0.03, !!a.channel],
    ["signals", 0.03, signalCount >= 3],
  ];
  let s = 0;
  for (const [, w, present] of weights) if (present) s += w;
  return Math.min(1, s);
}

/**
 * Extrae HyperAnchors desde formas heterogéneas (row de `businesses`,
 * row de `business_brains`, o un `context` con { business, brain }).
 * Cero-hardcode: solo devuelve lo que existe en los datos.
 */
export function buildHyperAnchors(input: {
  business?: any;
  brain?: any;
  context?: any;
}): HyperAnchors {
  const b = input.business ?? input.context?.business ?? {};
  const br = input.brain ?? input.context?.brain ?? {};
  const fm = br?.factual_memory ?? br?.confirmed ?? {};
  const op = br?.offer_profile ?? {};
  const cp = br?.customer_profile ?? {};

  const pick = (...vals: any[]): string | null => {
    for (const v of vals) {
      if (v == null) continue;
      if (typeof v === "string" && v.trim()) return v.trim();
      if (typeof v === "object" && typeof v?.value === "string" && v.value.trim()) return v.value.trim();
    }
    return null;
  };

  const offers: string[] = [];
  if (Array.isArray(op?.offers)) for (const o of op.offers) if (typeof o?.name === "string") offers.push(o.name);
  if (typeof op?.main_offer === "string") offers.push(op.main_offer);

  const competitors: string[] = [];
  const cSrc = br?.competitors ?? fm?.competitors ?? [];
  if (Array.isArray(cSrc)) for (const c of cSrc.slice(0, 5)) {
    if (typeof c === "string") competitors.push(c);
    else if (typeof c?.name === "string") competitors.push(c.name);
  }

  return {
    businessName: pick(b?.name, b?.business_name, fm?.business_name),
    sector: pick(b?.sector, br?.primary_business_type, fm?.sector),
    subSector: pick(b?.sub_sector, b?.subSector, fm?.sub_sector),
    niche: pick(fm?.niche, fm?.nicho, br?.niche, b?.niche),
    businessModel: pick(b?.business_model, b?.model, fm?.business_model, fm?.model, br?.business_model),
    stage: pick(b?.stage, b?.lifecycle_stage, fm?.stage, fm?.etapa),
    country: pick(b?.country, fm?.country),
    city: pick(b?.city, fm?.city),
    region: pick(b?.region, b?.province, b?.state, fm?.region, fm?.provincia),
    geoScope: pick(b?.geo_scope, fm?.geo_scope, fm?.alcance_geografico),
    customer: pick(cp?.description, cp?.segment, fm?.customer, fm?.target_customer),
    customerSegment: pick(cp?.segment, cp?.type, fm?.customer_segment, fm?.segmento),
    channel: pick(b?.main_channel, fm?.channel, fm?.main_channel),
    offer: offers[0] ?? pick(op?.description, fm?.offer, fm?.main_offer),
    valueProp: pick(op?.value_prop, br?.value_prop, fm?.value_prop, fm?.propuesta_valor),
    differentiator: pick(op?.differentiator, br?.differentiator, fm?.differentiator, fm?.diferencial),
    priceRange: pick(op?.price_range, b?.price_range, fm?.price_range, fm?.rango_precio),
    ticketSize: pick(op?.ticket_size, fm?.ticket_size, fm?.ticket_promedio, fm?.avg_ticket),
    salesCycle: pick(op?.sales_cycle, fm?.sales_cycle, fm?.ciclo_venta),
    seasonality: pick(fm?.seasonality, fm?.estacionalidad, br?.seasonality),
    teamSize: pick(b?.team_size, b?.employees, fm?.team_size, fm?.empleados),
    mainFriction: pick(fm?.main_friction, fm?.main_challenge, br?.main_friction),
    mainGoal: pick(fm?.main_goal, fm?.goal_90d, br?.main_goal),
    competitors,
    currency: pick(b?.currency, fm?.currency),
  };
}

