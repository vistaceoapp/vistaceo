// BrainContext signature mirror — frontend.
// Mantiene paridad con supabase/functions/_shared/brain-context.ts para que
// el cliente pueda calcular el mismo signature y detectar cache stale antes
// de pedir contenido a la edge function.

export interface BrainSignatureInput {
  sector?: string;
  subSector?: string;
  country?: string;
  stage?: string;
  model?: string;
  healthDimensions?: Record<string, number>;
  weakest?: string[];
  activeFocus?: string;
  topSignals?: string[];
  signalCount?: number;
  insightCount?: number;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeBrainSignature(input: BrainSignatureInput): Promise<string> {
  const sigInput = JSON.stringify({
    sector: input.sector ?? '',
    sub: input.subSector ?? '',
    country: input.country ?? '',
    stage: input.stage ?? '',
    model: input.model ?? '',
    health: input.healthDimensions ?? {},
    weakest: input.weakest ?? [],
    focus: input.activeFocus ?? '',
    signalCount: input.signalCount ?? 0,
    insightCount: input.insightCount ?? 0,
    topSignals: (input.topSignals ?? []).slice(0, 10),
  });
  return sha256Hex(sigInput);
}
