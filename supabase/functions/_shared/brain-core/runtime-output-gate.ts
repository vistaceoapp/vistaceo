// Brain Core — Runtime Output Gate.
// Gate único y reutilizable para validar TEXTO VISIBLE antes de devolverlo
// al usuario. Combina extremeQualityCheck + reglas anti-pregunta-genérica +
// reglas anti-misión-plantilla. Soporta regeneración con un callback.

import { extremeQualityCheck } from "./extreme-quality-gate.ts";
import {
  isGenericDirectQuestion,
  isForbiddenMissionTitle,
} from "./prompt2-rules.ts";
import {
  hyperPersonalizationCheck,
  type HyperAnchors,
} from "./hyper-personalization-gate.ts";

export type GateKind =
  | "question"     // títulos de preguntas del onboarding / próxima mejor pregunta
  | "mission"      // títulos / descripciones de misiones
  | "action"       // acción de hoy
  | "opportunity"  // oportunidades / radar
  | "prediction"   // predicciones prudentes
  | "chat"         // respuestas del chat ejecutivo
  | "dashboard"    // narrativas del dashboard / foco
  | "radar"        // insights de radar
  | "analytics"    // interpretación de métricas
  | "email"        // cuerpo de email (usar emailQualityCheck para subject+body)
  | "generic";

export interface GateInput {
  text: string;
  kind: GateKind;
  hasBrainEvidence?: boolean;
  hasConcreteAction?: boolean;
  /** Anclas del brain para exigir personalización. Opcional. */
  anchors?: HyperAnchors;
  /** Mínimo de anclas del brain requeridas en el texto. Default por kind. */
  minAnchors?: number;
}

export interface GateResult {
  ok: boolean;
  reasons: string[];
}

const SAFE_FALLBACK_BY_KIND: Record<GateKind, string> = {
  question:
    "Para no recomendarte algo genérico, necesito ubicar dónde se pierde más valor hoy: cuando alguien consulta, cuando ve el precio, antes de pagar, después de comprar o cuando debería volver.",
  mission:
    "Detectá dónde se frena la decisión del cliente: en la primera consulta, al ver el precio, en la confianza, en la documentación o en el seguimiento. Ese dato define la próxima acción.",
  action:
    "Revisá los últimos 10 contactos del negocio y marcá en qué momento se frenó cada uno: consulta, precio, confianza, pago o recompra.",
  opportunity:
    "Hay una oportunidad clara en revisar dónde se frena la decisión del cliente: consulta, precio, confianza o recompra. Detectar ese punto suele liberar ventas que ya estás generando pero no cerrando.",
  prediction:
    "Si la mayoría de las ventas viene de clientes nuevos, existe riesgo de depender demasiado de captación constante. Conviene observar cuántos vuelven a comprar.",
  chat:
    "Lo más rentable ahora es ubicar dónde se pierde la decisión del cliente: en la primera consulta, al ver el precio, en la confianza o en la recompra. Revisá tus últimos 10 contactos y marcá en qué punto se frenó cada uno; ese patrón define la próxima acción y, si me lo contás, la armamos juntos.",
  dashboard:
    "Estoy construyendo la lectura real del negocio. Antes de recomendar acciones, necesito confirmar si la oportunidad está en atraer más clientes, convertir mejor, aumentar ticket o activar recompra.",
  radar:
    "Hay una señal externa relevante para el sector. Antes de convertirla en misión, conviene contrastarla con tus datos internos: canal principal, cliente objetivo y último cuello de botella.",
  analytics:
    "Los números apuntan a un cuello concreto en la decisión del cliente. Antes de recomendar cambios, conviene confirmar dónde se frena hoy: consulta, precio, confianza o recompra.",
  email:
    "Tenemos una novedad para tu negocio. Volvé al panel cuando puedas para revisar lo que preparamos según tu contexto.",
  generic:
    "Necesito un dato más del negocio para darte una recomendación útil y específica.",
};

// Anclas mínimas requeridas por tipo cuando se provee `anchors`.
const DEFAULT_MIN_ANCHORS: Record<GateKind, number> = {
  question: 1,
  mission: 2,
  action: 2,
  opportunity: 2,
  prediction: 1,
  chat: 1,
  dashboard: 1,
  radar: 2,
  analytics: 2,
  email: 1,
  generic: 1,
};

export function runtimeOutputGate(input: GateInput): GateResult {
  const reasons: string[] = [];
  const t = (input.text ?? "").trim();

  // 1) base extrema (frases genéricas, leaks técnicos, inglés residual, etc.)
  const base = extremeQualityCheck({
    text: t,
    hasBrainEvidence: input.hasBrainEvidence,
    hasConcreteAction: input.hasConcreteAction,
  });
  reasons.push(...base.reasons);

  // 2) reglas específicas por tipo
  switch (input.kind) {
    case "question":
      if (isGenericDirectQuestion(t)) reasons.push("pregunta genérica directa");
      break;
    case "mission":
      // Detectar título prohibido en cualquier parte del texto
      if (isForbiddenMissionTitle(t)) reasons.push("título de misión plantilla");
      break;
    case "action":
      if (t.length < 30) reasons.push("acción demasiado corta para ser concreta");
      break;
    case "chat":
      if (/^\s*necesito m[aá]s informaci[oó]n\.?\s*$/i.test(t)) {
        reasons.push("chat respondió pidiendo más info como respuesta principal");
      }
      if (/tuve un problema|intenta de nuevo/i.test(t)) {
        reasons.push("chat expuso error crudo");
      }
      break;
  }

  // 3) hyper-personalization: si el caller pasa anchors, exigir presencia
  if (input.anchors) {
    const min = input.minAnchors ?? DEFAULT_MIN_ANCHORS[input.kind] ?? 1;
    const hp = hyperPersonalizationCheck({
      text: t,
      anchors: input.anchors,
      minAnchors: min,
      requireSpecific: input.kind === "mission" || input.kind === "opportunity",
    });
    if (!hp.ok) reasons.push(...hp.reasons);
  }

  return { ok: reasons.length === 0, reasons: Array.from(new Set(reasons)) };
}

export function safeFallback(kind: GateKind): string {
  return SAFE_FALLBACK_BY_KIND[kind] ?? SAFE_FALLBACK_BY_KIND.generic;
}

/**
 * Intenta generar una salida válida ejecutando `produce` hasta `maxAttempts`.
 * Si todos los intentos fallan, devuelve `safeFallback(kind)`.
 */
export async function withRegeneration(
  kind: GateKind,
  produce: (attempt: number) => Promise<string>,
  opts: {
    maxAttempts?: number;
    hasBrainEvidence?: boolean;
    hasConcreteAction?: boolean;
    anchors?: HyperAnchors;
    minAnchors?: number;
  } = {},
): Promise<{ text: string; regenerated: number; fellBack: boolean; lastReasons: string[] }> {
  const maxAttempts = Math.max(1, Math.min(3, opts.maxAttempts ?? 3));
  let lastReasons: string[] = [];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let text = "";
    try {
      text = await produce(attempt);
    } catch (e) {
      lastReasons = [`producer error: ${(e as Error).message}`];
      continue;
    }
    const r = runtimeOutputGate({
      text,
      kind,
      hasBrainEvidence: opts.hasBrainEvidence,
      hasConcreteAction: opts.hasConcreteAction,
      anchors: opts.anchors,
      minAnchors: opts.minAnchors,
    });
    if (r.ok) return { text, regenerated: attempt, fellBack: false, lastReasons: [] };
    lastReasons = r.reasons;
    console.warn(`[runtime-output-gate:${kind}] attempt ${attempt + 1} blocked:`, r.reasons);
  }
  return {
    text: safeFallback(kind),
    regenerated: maxAttempts,
    fellBack: true,
    lastReasons,
  };
}
