/**
 * validateBeforeStore — gate unificado de pre-persistencia.
 *
 * Envuelve `auditContent` (audit-pipeline existente) y agrega un check
 * de Red List sobre los campos visibles. Debe llamarse antes de:
 *   - supabase.insert de misiones, oportunidades, predicciones
 *   - setState de contenido IA renderizable
 *   - persistencia de chat AI / dashboard copy / insights
 *
 * Si el resultado tiene `passed === false`, NO guardar y NO renderizar.
 * El caller debe regenerar con contexto reducido o usar fallback premium.
 */
import {
  auditContent,
  type AuditResult,
  type ContentCandidate,
  type BusinessContext,
  type ExistingItem,
} from '@/lib/user-lifecycle/audit-pipeline';
import { containsForbidden } from '@/lib/aiOutputSanitizer';

export type { AuditResult, ContentCandidate } from '@/lib/user-lifecycle/audit-pipeline';

export async function validateBeforeStore(
  candidate: ContentCandidate,
  context: BusinessContext,
  existing: ExistingItem[] = []
): Promise<AuditResult> {
  // Pre-gate visible: si campo de UI contiene Red List, falla sin tocar la IA.
  const visibleFields = [
    candidate.title,
    candidate.description,
    ...(candidate.steps?.flatMap(s => [s.title, s.description ?? '']) ?? []),
  ];
  const leak = visibleFields.find(f => f && containsForbidden(f));
  if (leak) {
    return {
      passed: false,
      averageScore: 0,
      scores: {
        relevance: 0,
        personalization: 0,
        novelty: 0,
        coherence: 0,
        actionability: 0,
      },
      issues: [
        {
          dimension: 'blocked',
          severity: 'error',
          message: 'Contenido contiene tokens prohibidos (Red List).',
          code: 'RED_LIST_LEAK',
        },
      ],
      suggestions: ['Regenerar con contexto reducido o usar fallback premium.'],
      dedupeResult: null,
    };
  }

  return auditContent(candidate, context, existing);
}
