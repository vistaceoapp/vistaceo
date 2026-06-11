// PromptForge: ensambla prompts dinámicos por tipo de artefacto desde el BrainContext.
// Cero texto fijo de negocio: todo se rellena con variables del brain.
// Solo la estructura (qué pedir, en qué formato) es estática.

import type { BrainContext } from "./brain-context.ts";
import { renderBrainContextForPrompt } from "./brain-context.ts";

const STRUCTURE_HEADER = `Sos VISTACEO, motor de inteligencia ejecutiva. Tu salida debe estar 100% personalizada al negocio descrito.
PROHIBIDO: usar frases genéricas tipo "analizar el problema", "definir el objetivo", "planificar la acción". 
PROHIBIDO: mencionar identificadores internos (Q_AI_, [Setup_answer], JSON crudo).
OBLIGATORIO: cada texto debe mencionar al menos UNA variable concreta del negocio (sector, país, cliente, objetivo, fricción o señal).`;

export interface MissionSeed {
  triggerType: "radar_insight" | "opportunity" | "manual" | "focus_gap";
  triggerTitle: string;
  triggerDescription: string;
  triggerSource?: string;
}

export interface OpportunitySeed {
  triggerType: "signal" | "pattern" | "external" | "competitor";
  triggerTitle: string;
  triggerEvidence: string;
}

export interface PredictionSeed {
  horizon: "7d" | "30d" | "90d";
  dimension?: string;
}

export interface AnalyticsSeed {
  dimension: string;
  metrics: Record<string, number | string>;
}

export interface RadarMissionSeed {
  insightTitle: string;
  insightSummary: string;
  insightUrl?: string;
}

// ---------- MISSION ----------
export function forgeMissionPrompt(ctx: BrainContext, seed: MissionSeed) {
  const brain = renderBrainContextForPrompt(ctx);
  const system = `${STRUCTURE_HEADER}

Vas a generar una MISIÓN ejecutable, hyper personalizada al negocio.

FORMATO ESTRICTO JSON:
{
  "title": "5-12 palabras, menciona algo concreto del negocio",
  "description": "2-3 oraciones, explica por qué esta misión hoy para ESTE negocio en ${ctx.business.country || "su país"}",
  "category": "growth|service|tech|custom",
  "estimatedDays": 1-30,
  "expectedImpact": "una oración con el resultado medible esperado",
  "steps": [
    {
      "title": "verbo + objeto específico al negocio (no genérico)",
      "what": "qué hacer concretamente",
      "how": "cómo hacerlo paso a paso, 2-4 oraciones, con detalles del sector ${ctx.business.sector || ""}",
      "why": "por qué importa para este negocio",
      "example": "ejemplo concreto realista para ${ctx.business.country || "su contexto"}",
      "metric": "qué medir para saber si funcionó",
      "doneCriteria": "criterio binario de cumplimiento",
      "estimatedMinutes": 15-240
    }
  ]
}

Mínimo 5 pasos, máximo 8. Cada step.how debe tener >120 caracteres.`;

  const user = `${brain}

### Disparador de la misión
Origen: ${seed.triggerType}
Título: ${seed.triggerTitle}
${seed.triggerDescription ? `Descripción: ${seed.triggerDescription}` : ""}
${seed.triggerSource ? `Fuente: ${seed.triggerSource}` : ""}

Generá la misión ahora. Solo JSON válido, sin markdown.`;
  return { system, user };
}

// ---------- OPPORTUNITY ----------
export function forgeOpportunityPrompt(ctx: BrainContext, seed: OpportunitySeed) {
  const brain = renderBrainContextForPrompt(ctx);
  const system = `${STRUCTURE_HEADER}

Vas a generar una OPORTUNIDAD ejecutiva, hyper personalizada.

FORMATO ESTRICTO JSON:
{
  "title": "8-14 palabras",
  "summary": "3-4 oraciones explicando qué es y por qué aplica a ESTE negocio",
  "whyItApplies": "explicación de por qué la señal/patrón importa para el sector ${ctx.business.sector || ""} en ${ctx.business.country || ""}",
  "potentialImpact": "qué cambia si lo aprovecha",
  "urgency": "low|medium|high",
  "confidence": 0.0-1.0,
  "actionPath": "qué misión concreta podría derivarse",
  "evidenceSummary": "1-2 oraciones humanas sobre la evidencia (sin JSON)"
}`;

  const user = `${brain}

### Disparador
Tipo: ${seed.triggerType}
Título: ${seed.triggerTitle}
Evidencia: ${seed.triggerEvidence}

Generá la oportunidad. Solo JSON válido.`;
  return { system, user };
}

// ---------- PREDICTION ----------
export function forgePredictionPrompt(ctx: BrainContext, seed: PredictionSeed) {
  const brain = renderBrainContextForPrompt(ctx);
  const system = `${STRUCTURE_HEADER}

Vas a generar una PREDICCIÓN ejecutiva accionable.

FORMATO ESTRICTO JSON:
{
  "title": "evento futuro concreto, 8-14 palabras",
  "probability": 0.0-1.0,
  "horizon": "${seed.horizon}",
  "rationale": "3-5 oraciones con la lógica causal basada en señales del negocio",
  "leadingIndicators": ["3-5 indicadores que adelantan el evento"],
  "recommendedAction": "qué hacer hoy para aprovechar o mitigar"
}`;
  const user = `${brain}

${seed.dimension ? `Dimensión foco: ${seed.dimension}` : ""}

Generá la predicción. Solo JSON válido.`;
  return { system, user };
}

// ---------- ANALYTICS ----------
export function forgeAnalyticsPrompt(ctx: BrainContext, seed: AnalyticsSeed) {
  const brain = renderBrainContextForPrompt(ctx);
  const system = `${STRUCTURE_HEADER}

Vas a interpretar métricas y devolver una lectura ejecutiva personalizada.

FORMATO ESTRICTO JSON:
{
  "headline": "una oración con el hallazgo principal",
  "interpretation": "3-5 oraciones interpretando las métricas en contexto del sector ${ctx.business.sector || ""}",
  "risk": "riesgo principal si no se actúa",
  "opportunity": "oportunidad clave que revelan los números",
  "nextStep": "única acción recomendada"
}`;
  const user = `${brain}

### Dimensión analizada: ${seed.dimension}
### Métricas:
${Object.entries(seed.metrics).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

Solo JSON válido.`;
  return { system, user };
}

// ---------- RADAR → MISSION ----------
export function forgeRadarMissionPrompt(ctx: BrainContext, seed: RadarMissionSeed) {
  return forgeMissionPrompt(ctx, {
    triggerType: "radar_insight",
    triggerTitle: seed.insightTitle,
    triggerDescription: seed.insightSummary,
    triggerSource: seed.insightUrl,
  });
}
