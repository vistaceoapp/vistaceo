/**
 * Contratos de respuesta explícitos para Edge Functions de VISTACEO.
 *
 * Se usan como genérico de `invokeEdgeFunctionSafe<T>` en cada call site
 * crítico para evitar `unknown`/`any` opaco y dar shape mínimo a `data`.
 *
 * Las funciones server-side ya devuelven adicionalmente
 * `{ success, quality, fallbackUsed, visibleText }` — eso lo cubre el wrapper,
 * acá tipamos solo el payload de negocio.
 */

export type LimitError =
  | 'free_limit_reached'
  | 'pro_limit_reached'
  | 'Rate limit exceeded'
  | string;

export interface AnalyzeHealthScoreResponse {
  analysis?: {
    totalScore?: number;
    certaintyPct?: number;
    [k: string]: unknown;
  };
  error?: LimitError;
  message?: string;
}

export interface AnalyzePatternsResponse {
  learningCreated?: number;
  error?: LimitError;
  message?: string;
}

export interface ScanCompetitorsResponse {
  competitorsFound?: number;
  error?: LimitError;
  message?: string;
}

export interface AnalyzeReputationResponse {
  analysis?: {
    overall_score?: number;
    [k: string]: unknown;
  };
  error?: LimitError;
  message?: string;
}

export interface GenerateDailySummaryResponse {
  summary?: {
    summary_text?: string;
    headline?: string;
    priorities?: unknown[];
    mood?: string;
    confidence_note?: string;
    signals?: unknown[];
    [k: string]: unknown;
  };
}

export interface GenerateOpportunityPlanResponse {
  plan?: unknown;
  error?: LimitError;
  message?: string;
}

export interface GenerateMissionPlanResponse {
  plan?: unknown;
  error?: LimitError;
  message?: string;
  used?: number;
  limit?: number;
}

export interface BrainAnalyzeGapsResponse {
  canGenerateSpecific?: boolean;
  mvcCompletion?: number;
  [k: string]: unknown;
}

export interface GenerateQuestionnaireResponse {
  questions?: unknown[];
  error?: LimitError;
  message?: string;
}

export interface VistaceoChatResponse {
  message?: string;
  audioScript?: string;
  learningExtract?: Record<string, unknown> & {
    missions_suggested?: unknown[];
  };
  error?: LimitError;
}

export interface GeneratePredictionsResponse {
  predictions?: unknown[];
  error?: LimitError;
  message?: string;
}

/** Type guard: confirma que `data` tiene al menos shape de objeto. */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Acceso seguro a una propiedad string opcional. */
export function getString(v: unknown, key: string): string | undefined {
  if (!isRecord(v)) return undefined;
  const x = v[key];
  return typeof x === 'string' ? x : undefined;
}

/** Acceso seguro a una propiedad number opcional. */
export function getNumber(v: unknown, key: string): number | undefined {
  if (!isRecord(v)) return undefined;
  const x = v[key];
  return typeof x === 'number' && Number.isFinite(x) ? x : undefined;
}
