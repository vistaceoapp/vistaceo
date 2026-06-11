// Server-side validateBeforeStore — equivalent contract to
// src/lib/validate-before-store.ts but runs inside Edge Functions
// where the React audit pipeline is not available.
//
// Strategy: enforce the Red List + module quality gate. If the
// candidate fails, the caller MUST NOT insert/upsert/return it.

import { containsForbidden, sanitizeAIOutput } from './ai-output-sanitizer.ts';
import { gateByModule, type ModuleKind, type GateResult } from './quality-gates.ts';

export interface ServerAuditCandidate {
  module: ModuleKind;
  title?: string;
  description?: string;
  text?: string;
  steps?: Array<{ title?: string; description?: string }>;
  baseEvidence?: string;
  interpretation?: string;
  source_url?: string;
  metricsCount?: number;
  raw?: Record<string, unknown>;
}

export interface ServerAuditResult {
  passed: boolean;
  reasons: string[];
  sanitized: ServerAuditCandidate;
  fallbackUsed: boolean;
}

function sanitizeFields(c: ServerAuditCandidate): ServerAuditCandidate {
  return {
    ...c,
    title: c.title ? sanitizeAIOutput(c.title, { mode: 'label' }) : c.title,
    description: c.description ? sanitizeAIOutput(c.description, { mode: 'prose' }) : c.description,
    text: c.text ? sanitizeAIOutput(c.text, { mode: 'prose' }) : c.text,
    interpretation: c.interpretation ? sanitizeAIOutput(c.interpretation, { mode: 'prose' }) : c.interpretation,
    baseEvidence: c.baseEvidence ? sanitizeAIOutput(c.baseEvidence, { mode: 'prose' }) : c.baseEvidence,
    steps: c.steps?.map(s => ({
      title: s.title ? sanitizeAIOutput(s.title, { mode: 'label' }) : s.title,
      description: s.description ? sanitizeAIOutput(s.description, { mode: 'structured' }) : s.description,
    })),
  };
}

export function validateBeforeStore(candidate: ServerAuditCandidate): ServerAuditResult {
  const sanitized = sanitizeFields(candidate);
  const reasons: string[] = [];

  // Red List on every visible field.
  const visibleFields: Array<string | undefined> = [
    sanitized.title, sanitized.description, sanitized.text,
    sanitized.interpretation, sanitized.baseEvidence,
    ...(sanitized.steps?.flatMap(s => [s.title, s.description]) ?? []),
  ];
  for (const f of visibleFields) {
    if (f && containsForbidden(f)) {
      reasons.push('red_list_leak');
      break;
    }
  }

  // Module-specific gate.
  const gate: GateResult = gateByModule(candidate.module, {
    text: sanitized.text ?? sanitized.description ?? sanitized.title ?? '',
    title: sanitized.title,
    description: sanitized.description,
    steps: sanitized.steps,
    baseEvidence: sanitized.baseEvidence,
    interpretation: sanitized.interpretation,
    source_url: candidate.source_url,
    metricsCount: candidate.metricsCount,
  });
  reasons.push(...gate.reasons);

  return {
    passed: reasons.length === 0,
    reasons: Array.from(new Set(reasons)),
    sanitized,
    fallbackUsed: false,
  };
}
