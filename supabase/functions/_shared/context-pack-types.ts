// Shared ContextPack type used by Edge Functions.
// The client builds the ContextPack via src/lib/context-pack-builder.ts
// and sends it in the request body. Edge Functions consume it as
// READ-ONLY context — never echo it back to the user verbatim.

export type ContextPackModule =
  | 'dashboard'
  | 'chat'
  | 'radar'
  | 'missions'
  | 'analytics'
  | 'predictions'
  | 'setup'
  | 'admin';

export interface EdgeContextPack {
  businessId: string;
  userId: string | null;
  module: ContextPackModule;
  businessSummary: {
    name?: string;
    country?: string;
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
  activeFocus?: { area?: string; reason?: string; confidence?: number };
  activeMissions?: Array<{ id: string; title: string; status: string; progress: number }>;
  topOpportunities?: Array<{ id: string; title: string; type: string; confidence?: number }>;
  predictionsSummary?: Array<{ id: string; title: string; probability?: number; horizon?: string }>;
  recentEvents?: Array<{ type: string; summary: string; createdAt: string }>;
  missingData?: string[];
  moduleInstruction: string;
  module_specific_payload?: Record<string, unknown>;
}

/** Returns a compact, human-readable summary of the ContextPack to inject in prompts. */
export function contextPackToPromptDigest(pack: EdgeContextPack): string {
  const b = pack.businessSummary ?? {};
  const lines: string[] = [];
  if (b.name) lines.push(`Negocio: ${b.name}`);
  if (b.activity || b.sector) lines.push(`Actividad: ${[b.activity, b.sector].filter(Boolean).join(' — ')}`);
  if (b.country) lines.push(`País: ${b.country}`);
  if (b.customer) lines.push(`Cliente: ${b.customer}`);
  if (b.channel) lines.push(`Canal: ${b.channel}`);
  if (b.mainGoal) lines.push(`Objetivo: ${b.mainGoal}`);
  if (b.mainFriction) lines.push(`Fricción: ${b.mainFriction}`);
  const conf = Object.entries(pack.brainSummary?.confirmed ?? {}).slice(0, 6)
    .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join('; ');
  if (conf) lines.push(`Confirmado: ${conf}`);
  if (pack.brainSummary?.missingCritical?.length) {
    lines.push(`Datos faltantes: ${pack.brainSummary.missingCritical.slice(0, 5).join(', ')}`);
  }
  if (pack.healthSummary?.weakestDimensions?.length) {
    lines.push(`Dimensiones débiles: ${pack.healthSummary.weakestDimensions.join(', ')}`);
  }
  if (pack.activeMissions?.length) {
    lines.push(`Misiones activas: ${pack.activeMissions.map(m => m.title).join('; ')}`);
  }
  if (pack.topOpportunities?.length) {
    lines.push(`Oportunidades recientes: ${pack.topOpportunities.map(o => o.title).join('; ')}`);
  }
  return lines.join('\n');
}

export function hasMinimumContext(pack: EdgeContextPack | null | undefined): boolean {
  if (!pack) return false;
  const b = pack.businessSummary ?? {};
  return Boolean(b.name || b.activity || b.sector || b.country);
}
