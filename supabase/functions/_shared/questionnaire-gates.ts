// Server-side validation for generated setup questions (PROMPT 4).
// Every question returned by generate-questionnaire MUST pass
// validateQuestionServer() — questions that fail are dropped server-side.

import { containsForbidden } from './ai-output-sanitizer.ts';

export interface ServerQuestionOption {
  id?: string;
  label?: { es?: string; 'pt-BR'?: string };
  emoji?: string;
  impactScore?: number;
}

export interface ServerQuestion {
  id?: string;
  category?: string;
  dimension?: string;
  type?: string;
  weight?: number;
  title?: { es?: string; 'pt-BR'?: string };
  help?: { es?: string; 'pt-BR'?: string };
  options?: ServerQuestionOption[];
  required?: boolean;
  [key: string]: unknown;
}

export interface ValidatedQuestion extends ServerQuestion {
  targetBrainField: string;
  healthDimension: string;
  affectedModules: string[];
  intentKey: string;
  simplicityScore: number;
  mobileSafe: boolean;
  specialClarifyOption: typeof CLARIFY_OPTION;
}

export const CLARIFY_OPTION = {
  id: '__CLARIFY__',
  label: { es: 'No sé / Quiero aclarar algo', 'pt-BR': 'Não sei / Quero esclarecer algo' },
  autoAdvance: false,
  opensInput: true,
  horizontal: true,
} as const;

const DIM_TO_MODULES: Record<string, string[]> = {
  reputation: ['analytics', 'radar', 'dashboard'],
  profitability: ['analytics', 'dashboard', 'missions'],
  finances: ['analytics', 'dashboard'],
  efficiency: ['missions', 'dashboard'],
  traffic: ['radar', 'analytics', 'dashboard'],
  team: ['missions', 'dashboard'],
  growth: ['radar', 'missions', 'dashboard'],
};

const HARD_CONCEPTS: RegExp[] = [
  /flujo de caja/i, /margen/i, /ticket promedio/i, /conversi[oó]n/i,
  /recompra/i, /capital de trabajo/i, /retenci[oó]n/i, /rotaci[oó]n/i,
  /pipeline/i, /ciclo de venta/i, /punto de equilibrio/i, /ocupaci[oó]n/i,
];

export function buildIntentKey(titleEs: string): string {
  return titleEs
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!,.:;()"']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 5)
    .join('_');
}

export function computeSimplicityScore(q: ServerQuestion): number {
  const titleEs = q.title?.es ?? '';
  const words = titleEs.split(/\s+/).filter(Boolean).length;
  const opts = Array.isArray(q.options) ? q.options : [];
  let score = 10;
  if (words > 12) score -= 3;
  else if (words > 9) score -= 1;
  if (q.type === 'text') score -= 4;
  if (opts.length > 6) score -= 3;
  if (opts.some((o) => (o.label?.es ?? '').length > 30)) score -= 1;
  if ((titleEs.match(/¿/g)?.length ?? 0) > 1) score -= 3;
  return Math.max(1, Math.min(10, score));
}

export interface QuestionValidation {
  passed: boolean;
  reasons: string[];
  question: ValidatedQuestion;
}

/**
 * Server-side gate per question. Drops questions that:
 * - have no options (when single/multi), or more than 6 normal options
 * - leak Red List tokens, are generic, too long, or ask multiple things
 * - have no brain impact (missing dimension/category)
 * - use hard concepts without a short explainer
 * - are not mobile-safe
 */
export function validateQuestionServer(q: ServerQuestion): QuestionValidation {
  const reasons: string[] = [];
  const titleEs = (q.title?.es ?? '').trim();
  const opts = Array.isArray(q.options) ? q.options : [];

  if (!titleEs) reasons.push('empty_title');
  if (titleEs && containsForbidden(titleEs)) reasons.push('red_list_leak');

  const words = titleEs.split(/\s+/).filter(Boolean).length;
  if (words > 14) reasons.push('question_too_long');
  if (/\bej\.?\s*:/i.test(titleEs) || /por ejemplo/i.test(titleEs)) reasons.push('inline_example');
  if ((titleEs.match(/¿/g)?.length ?? 0) > 1) reasons.push('multiple_questions_in_one');
  if (/\.{3}$|…$/.test(titleEs)) reasons.push('truncated_question');

  if (q.type === 'single' || q.type === 'multi') {
    if (opts.length < 3) reasons.push('missing_options');
    if (opts.length > 6) reasons.push('too_many_options');
  }
  for (const o of opts) {
    const lbl = o.label?.es ?? '';
    if (containsForbidden(lbl)) reasons.push('red_list_leak');
  }

  const dimension = q.dimension ?? '';
  const category = q.category ?? '';
  if (!dimension || !DIM_TO_MODULES[dimension]) reasons.push('no_brain_impact');
  if (!category) reasons.push('no_brain_impact');

  const usesHardConcept = HARD_CONCEPTS.some((rx) => rx.test(titleEs));
  if (usesHardConcept && !(q.help?.es && q.help.es.trim().length > 0)) {
    reasons.push('hard_concept_without_explainer');
  }

  const mobileSafe =
    titleEs.length <= 95 &&
    opts.every((o) => (o.label?.es ?? '').length <= 40) &&
    opts.length <= 6;
  if (!mobileSafe) reasons.push('not_mobile_safe');

  const question: ValidatedQuestion = {
    ...q,
    targetBrainField:
      (q as Record<string, unknown>).targetBrainField as string ??
      `factual.${category || 'general'}.${String(q.id ?? buildIntentKey(titleEs)).toLowerCase()}`,
    healthDimension: dimension || 'growth',
    affectedModules: DIM_TO_MODULES[dimension] ?? ['dashboard'],
    intentKey: buildIntentKey(titleEs),
    simplicityScore: computeSimplicityScore(q),
    mobileSafe,
    specialClarifyOption: CLARIFY_OPTION,
  };

  return { passed: reasons.length === 0, reasons: Array.from(new Set(reasons)), question };
}
