/**
 * humanize-evidence.ts — P0 ZERO LEAKAGE para evidencia
 *
 * Convierte códigos internos (Q_AI_004, [Setup_answer] {...}, snake_case,
 * dimensiones internas) en lenguaje humano para mostrar al usuario.
 *
 * Si no puede traducir, devuelve un texto seguro genérico — nunca el objeto
 * crudo ni el código interno.
 */

import { sanitizeAIOutput, containsForbidden, isLeakedLabel } from "./aiOutputSanitizer";

const DIMENSION_LABELS: Record<string, string> = {
  operation: "operación",
  operations: "operación",
  team: "equipo",
  reputation: "reputación",
  reviews: "reseñas",
  profitability: "rentabilidad",
  finance: "finanzas",
  sales: "ventas",
  marketing: "marketing",
  growth: "crecimiento",
  efficiency: "eficiencia",
  traffic: "tráfico",
  product: "producto",
  customer: "clientes",
  customers: "clientes",
};

const FIELD_LABELS: Record<string, string> = {
  proposal_time: "tiempo de preparación de propuestas",
  team_load: "carga de trabajo del equipo",
  team_size: "tamaño del equipo",
  avg_ticket: "ticket promedio",
  monthly_revenue: "ingresos mensuales",
  monthly_clients: "clientes mensuales",
  conversion_rate: "tasa de conversión",
  delivery_time: "tiempo de entrega",
  response_time: "tiempo de respuesta",
  margin: "margen",
  recurrence: "recurrencia",
  retention: "retención",
  cac: "costo de adquisición",
  ltv: "valor del cliente",
};

const SAFE_FALLBACK =
  "Esta recomendación se basa en tus respuestas del diagnóstico inicial.";

const SETUP_ANSWER_RE = /\[?\s*setup_answer\s*\]?\s*\{[\s\S]*?\}/gi;
const Q_AI_REF_RE = /\(?\s*Q_AI_\d+\s*\)?/gi;
const JSON_BLOB_RE = /\{[\s\S]{0,400}?\}/g;

/** Es texto crudo no apto para mostrar (código, JSON, snake interno)? */
export function isRawEvidence(text: unknown): boolean {
  if (text == null) return true;
  if (typeof text !== "string") return true;
  const t = text.trim();
  if (!t) return true;
  if (SETUP_ANSWER_RE.test(t)) return true;
  SETUP_ANSWER_RE.lastIndex = 0;
  if (/^\s*\[/.test(t) && /\{/.test(t)) return true;
  if (/^\s*\{[\s\S]*\}\s*$/.test(t)) return true;
  return false;
}

/** Limpieza inline: quita códigos sin nukear todo el texto. */
export function stripInternalCodes(text: string): string {
  if (!text) return "";
  let out = text;
  out = out.replace(SETUP_ANSWER_RE, "");
  out = out.replace(Q_AI_REF_RE, "");
  // Limpia "( )" y dobles espacios
  out = out.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();
  // Snake_case suelto a label si lo conocemos
  for (const [k, v] of Object.entries({ ...DIMENSION_LABELS, ...FIELD_LABELS })) {
    out = out.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
  }
  return out;
}

export interface HumanizeContext {
  businessName?: string | null;
  businessCategory?: string | null;
  source?: string | null;
}

/**
 * Convierte un item de evidencia (string crudo, code, JSON o frase) a texto
 * humano. Nunca devuelve el objeto crudo.
 */
export function humanizeEvidence(
  item: unknown,
  ctx: HumanizeContext = {},
): string {
  // Objeto crudo → traducir a frase usando dimension/key conocidos
  if (item && typeof item === "object") {
    const obj = item as Record<string, unknown>;
    const dim = typeof obj.healthDimension === "string"
      ? DIMENSION_LABELS[obj.healthDimension.toLowerCase()] || obj.healthDimension
      : typeof obj.dimension === "string"
        ? DIMENSION_LABELS[obj.dimension.toLowerCase()] || obj.dimension
        : null;
    const field = typeof obj.targetBrainField === "string"
      ? FIELD_LABELS[obj.targetBrainField] || obj.targetBrainField.replace(/_/g, " ")
      : null;
    if (dim && field) {
      return `Por lo que respondiste sobre ${field} (${dim}).`;
    }
    if (dim) return `Por lo que respondiste en el diagnóstico de ${dim}.`;
    return SAFE_FALLBACK;
  }

  if (typeof item !== "string") return SAFE_FALLBACK;
  const raw = item.trim();
  if (!raw) return SAFE_FALLBACK;

  // [Setup_answer] {...} → frase humana
  if (/setup_answer/i.test(raw)) {
    // Detectar dimensión dentro del blob
    const dimMatch = raw.match(/"(operation|operations|team|reputation|sales|finance|marketing|growth|efficiency|reviews|product|customer|customers)"/i);
    if (dimMatch) {
      const dim = DIMENSION_LABELS[dimMatch[1].toLowerCase()] || dimMatch[1];
      return `Por lo que respondiste en el diagnóstico sobre ${dim}.`;
    }
    return "Por lo que respondiste en el diagnóstico inicial.";
  }

  // Solo un código Q_AI → frase genérica
  if (/^\(?\s*Q_AI_\d+\s*\)?$/.test(raw)) {
    return "Según una de tus respuestas del diagnóstico inicial.";
  }

  // Frase normal con códigos embebidos → limpiar inline
  let cleaned = stripInternalCodes(raw);
  cleaned = sanitizeAIOutput(cleaned, { mode: "structured" });
  if (!cleaned || cleaned.length < 4 || isLeakedLabel(cleaned) || containsForbidden(cleaned)) {
    return SAFE_FALLBACK;
  }
  return cleaned;
}

/** Humaniza array de evidencia, dedup, máx N items, sin vacíos. */
export function humanizeEvidenceList(
  items: unknown[] | null | undefined,
  ctx: HumanizeContext = {},
  max = 4,
): string[] {
  if (!Array.isArray(items)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    const h = humanizeEvidence(it, ctx);
    if (!h || h === SAFE_FALLBACK) continue;
    const key = h.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(h);
    if (out.length >= max) break;
  }
  return out;
}

/** Limpia un texto de descripción/resumen quitando códigos internos pero
 *  preservando la prosa. Si queda vacío devuelve fallback. */
export function humanizeProse(text: string | null | undefined, fallback = ""): string {
  if (!text) return fallback;
  let out = stripInternalCodes(String(text));
  out = sanitizeAIOutput(out, { mode: "prose" });
  if (!out || out.length < 8 || containsForbidden(out)) return fallback || SAFE_FALLBACK;
  return out;
}

export const EVIDENCE_SAFE_FALLBACK = SAFE_FALLBACK;
