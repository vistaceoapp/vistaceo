/**
 * Context Pack Builder — fuente única de contexto resumido y seguro
 * para cada módulo de VISTACEO.
 *
 * Regla: ningún módulo (Edge Function, chat, dashboard, radar, etc.)
 * debe recibir el brain crudo si puede recibir un ContextPack limpio.
 *
 * Salida:
 *  - resumida
 *  - sin JSON crudo innecesario
 *  - sin campos internos visibles (snake_case suelto, ids técnicos, etc.)
 *  - sin datos de otros negocios
 *  - con `module_specific_payload` para lo que necesita cada módulo
 */
import { supabase } from '@/integrations/supabase/client';
import { sanitizeAIOutput } from '@/lib/aiOutputSanitizer';

export type ContextPackModule =
  | 'dashboard'
  | 'chat'
  | 'radar'
  | 'missions'
  | 'analytics'
  | 'predictions'
  | 'setup'
  | 'admin';

export interface ContextPack {
  businessId: string;
  userId: string | null;
  module: ContextPackModule;
  businessSummary: {
    name?: string;
    country?: string;
    region?: string;
    activity?: string;
    sector?: string;
    businessType?: string;
    model?: string;
    customer?: string;
    channel?: string;
    mainGoal?: string;
    mainFriction?: string;
    tone?: string;
    language?: string;
  };
  brainSummary: {
    confirmed: Record<string, unknown>;
    inferred: Record<string, unknown>;
    uncertain: Record<string, unknown>;
    missingCritical: string[];
    confidence: number;
  };
  healthSummary?: {
    overallScore?: number;
    dimensions?: Record<string, number>;
    weakestDimensions?: string[];
    strongestDimensions?: string[];
  };
  activeFocus?: {
    area?: string;
    reason?: string;
    confidence?: number;
  };
  activeMissions?: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
  }>;
  topOpportunities?: Array<{
    id: string;
    title: string;
    type: 'internal' | 'external' | 'trend' | 'research';
    confidence?: number;
  }>;
  predictionsSummary?: Array<{
    id: string;
    title: string;
    probability?: number;
    horizon?: string;
  }>;
  recentEvents?: Array<{
    type: string;
    summary: string;
    createdAt: string;
  }>;
  missingData?: string[];
  blockedAssumptions?: string[];
  userCorrections?: string[];
  moduleInstruction: string;
  module_specific_payload?: Record<string, unknown>;
}

// ---------- helpers ----------

const SAFE_BRAIN_KEYS = new Set([
  'business_type_label', 'business_model', 'main_customer', 'main_channel',
  'main_goal', 'main_friction', 'offer_summary', 'client_summary',
  'decision_maker_summary', 'channel_summary', 'interpreted_activity',
  'sector', 'has_website', 'has_google', 'has_linkedin',
]);

type FactState = { state?: string; value?: unknown; confidence?: number };

function partitionFacts(
  factStates: Record<string, FactState> | null | undefined
): { confirmed: Record<string, unknown>; inferred: Record<string, unknown>; uncertain: Record<string, unknown>; missingCritical: string[] } {
  const confirmed: Record<string, unknown> = {};
  const inferred: Record<string, unknown> = {};
  const uncertain: Record<string, unknown> = {};
  const missing: string[] = [];
  if (!factStates) return { confirmed, inferred, uncertain, missingCritical: missing };

  for (const [field, fact] of Object.entries(factStates)) {
    if (!fact) continue;
    const state = fact.state ?? 'unknown';
    const value = fact.value;
    if (value === null || value === undefined || value === '') {
      missing.push(field);
      continue;
    }
    if (state === 'confirmed') confirmed[field] = value;
    else if (state === 'inferred' || state === 'possible') inferred[field] = value;
    else if (state === 'uncertain' || state === 'rejected') uncertain[field] = value;
    else confirmed[field] = value;
  }
  return { confirmed, inferred, uncertain, missingCritical: missing };
}

function pickSafe(obj: Record<string, unknown> | null | undefined): Record<string, unknown> {
  if (!obj) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!SAFE_BRAIN_KEYS.has(k)) continue;
    if (v === null || v === undefined || v === '') continue;
    out[k] = typeof v === 'string' ? sanitizeAIOutput(v, { mode: 'label' }) || v : v;
  }
  return out;
}

const MODULE_INSTRUCTION: Record<ContextPackModule, string> = {
  dashboard: 'Generar mensaje ejecutivo accionable. No mencionar campos internos. Hablar al usuario sobre su negocio específico.',
  chat: 'Responder como CEO humano. Usar el contexto provisto. NO devolver JSON, arrays, ni metadata. Hablar en el idioma y tono del negocio.',
  radar: 'Generar oportunidades específicas al sector, país y fricción principal. Citar fuente cuando aplique. Evitar consejos genéricos.',
  missions: 'Generar misiones con pasos accionables y específicos al brain. Cada paso debe tener cómo hacerlo, por qué, y definición de hecho.',
  analytics: 'Resumir evolución del negocio usando solo datos confirmados. Marcar datos faltantes como hipótesis a validar.',
  predictions: 'Generar escenarios prudentes basados en variables conocidas. Marcar nivel de certeza y datos faltantes críticos.',
  setup: 'Generar próximas preguntas que muevan campos del brain con bajo conocimiento. Evitar repetir lo confirmado.',
  admin: 'Resumir el negocio en español humano para revisión administrativa. Mostrar interpretación, no JSON crudo.',
};

// ---------- builder ----------

export interface BuildContextPackOptions {
  userId?: string | null;
  recentEventsLimit?: number;
}

export async function buildContextPack(
  module: ContextPackModule,
  businessId: string,
  options: BuildContextPackOptions = {}
): Promise<ContextPack> {
  const recentLimit = options.recentEventsLimit ?? 8;

  // Fetch en paralelo, escopado por businessId (RLS lo refuerza).
  const [
    { data: business },
    { data: brain },
    { data: missionRows },
    { data: oppRows },
    { data: predRows },
    { data: eventRows },
    { data: focusRow },
  ] = await Promise.all([
    supabase.from('businesses').select('id, name, country, owner_id, category, settings').eq('id', businessId).maybeSingle(),
    supabase.from('business_brains').select('*').eq('business_id', businessId).maybeSingle(),
    supabase.from('missions').select('id, title, status, current_step, steps').eq('business_id', businessId).eq('status', 'active').limit(5),
    supabase.from('opportunities').select('id, title, source, impact_score').eq('business_id', businessId).order('created_at', { ascending: false }).limit(5),
    supabase.from('predictions').select('id, title, probability, horizon_ring').eq('business_id', businessId).eq('status', 'active').limit(5),
    supabase.from('admin_audit_log').select('action_type, action_data, created_at').eq('target_business_id', businessId).like('action_type', 'brain_event:%').order('created_at', { ascending: false }).limit(recentLimit),
    supabase.from('business_focus_config').select('current_focus, focus_weights').eq('business_id', businessId).maybeSingle(),
  ]);

  const factual = (brain?.factual_memory ?? {}) as Record<string, unknown>;
  const prefs = (brain?.preferences_memory ?? {}) as Record<string, unknown>;
  const factStates = (brain?.fact_states ?? null) as Record<string, FactState> | null;
  const { confirmed, inferred, uncertain, missingCritical } = partitionFacts(factStates);
  const safeFactual = pickSafe(factual);

  const businessSummary: ContextPack['businessSummary'] = {
    name: business?.name ?? undefined,
    country: (business?.country as string | undefined) ?? (prefs.country_code as string | undefined),
    activity: (safeFactual.interpreted_activity as string) || (safeFactual.business_type_label as string),
    sector: safeFactual.sector as string | undefined,
    businessType: brain?.primary_business_type ?? undefined,
    model: safeFactual.business_model as string | undefined,
    customer: (confirmed.main_customer ?? safeFactual.client_summary ?? safeFactual.main_customer) as string | undefined,
    channel: (confirmed.main_channel ?? safeFactual.channel_summary ?? safeFactual.main_channel) as string | undefined,
    mainGoal: (confirmed.main_goal ?? safeFactual.main_goal) as string | undefined,
    mainFriction: (confirmed.main_friction ?? safeFactual.main_friction) as string | undefined,
    tone: (prefs.tone as string) || undefined,
    language: (prefs.language as string) || 'es',
  };

  const overallScore = (brain?.dashboard_seed as Record<string, unknown> | undefined)?.health_score as number | undefined;
  const dimensions = (brain?.dashboard_seed as Record<string, unknown> | undefined)?.dimensions as Record<string, number> | undefined;
  const sortedDims = dimensions ? Object.entries(dimensions).sort((a, b) => a[1] - b[1]) : [];

  const healthSummary = dimensions || overallScore !== undefined ? {
    overallScore,
    dimensions,
    weakestDimensions: sortedDims.slice(0, 2).map(([k]) => k),
    strongestDimensions: sortedDims.slice(-2).map(([k]) => k),
  } : undefined;

  const activeMissions = (missionRows ?? []).map(m => {
    const steps = (m.steps as Array<{ done?: boolean }> | null) ?? [];
    const done = steps.filter(s => s?.done).length;
    return {
      id: m.id as string,
      title: sanitizeAIOutput(m.title as string, { mode: 'label' }) || (m.title as string),
      status: m.status as string,
      progress: steps.length > 0 ? Math.round((done / steps.length) * 100) : 0,
    };
  });

  const topOpportunities = (oppRows ?? []).map(o => ({
    id: o.id as string,
    title: sanitizeAIOutput(o.title as string, { mode: 'label' }) || (o.title as string),
    type: (o.source === 'external' ? 'external' : 'internal') as 'internal' | 'external',
    confidence: typeof o.impact_score === 'number' ? o.impact_score / 10 : undefined,
  }));

  const predictionsSummary = (predRows ?? []).map(p => ({
    id: p.id as string,
    title: sanitizeAIOutput(p.title as string, { mode: 'label' }) || (p.title as string),
    probability: p.probability as number | undefined,
    horizon: p.horizon_ring as string | undefined,
  }));

  const recentEvents = (eventRows ?? []).map(e => {
    const data = (e.action_data ?? {}) as Record<string, unknown>;
    return {
      type: String(e.action_type).replace('brain_event:', ''),
      summary: (data.normalized_input as string) || (data.event_type as string) || String(e.action_type),
      createdAt: String(e.created_at),
    };
  });

  const pack: ContextPack = {
    businessId,
    userId: options.userId ?? (business?.owner_id as string | null) ?? null,
    module,
    businessSummary,
    brainSummary: {
      confirmed,
      inferred,
      uncertain,
      missingCritical,
      confidence: typeof brain?.confidence_score === 'number' ? brain.confidence_score : (brain?.mvc_completion_pct ?? 0) / 100,
    },
    healthSummary,
    activeFocus: focusRow ? {
      area: (focusRow.current_focus as string | undefined),
      reason: undefined,
      confidence: undefined,
    } : (brain?.current_focus ? { area: brain.current_focus as string } : undefined),
    activeMissions,
    topOpportunities,
    predictionsSummary,
    recentEvents,
    missingData: missingCritical,
    blockedAssumptions: [],
    userCorrections: [],
    moduleInstruction: MODULE_INSTRUCTION[module],
  };

  // Payload específico por módulo (sin duplicar lo ya provisto).
  switch (module) {
    case 'chat':
      pack.module_specific_payload = {
        respondAs: 'ceo_human',
        forbiddenOutputs: ['json', 'arrays', 'snake_case_fields', 'raw_brain'],
      };
      break;
    case 'radar':
      pack.module_specific_payload = {
        country: businessSummary.country,
        sector: businessSummary.sector,
        mainFriction: businessSummary.mainFriction,
        mainGoal: businessSummary.mainGoal,
      };
      break;
    case 'missions':
      pack.module_specific_payload = {
        constraints: { hasTeam: confirmed.has_team ?? false, hasBudget: confirmed.has_budget ?? false },
        successCriteria: businessSummary.mainGoal,
      };
      break;
    case 'predictions':
      pack.module_specific_payload = {
        knownVariables: Object.keys(confirmed),
        missingCritical,
      };
      break;
  }

  return pack;
}
