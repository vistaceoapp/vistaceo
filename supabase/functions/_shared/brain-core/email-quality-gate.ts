// Brain Core — Email Quality Gate.
// Valida asunto + cuerpo de emails transaccionales/reactivación antes de encolar.
// Bloquea: patrones spammy, subject genérico, cuerpo sin personalización,
// promesas absolutas, ALL CAPS excesivo, exceso de emojis, links sospechosos.

import { extremeQualityCheck } from "./extreme-quality-gate.ts";
import {
  hyperPersonalizationCheck,
  type HyperAnchors,
} from "./hyper-personalization-gate.ts";

export interface EmailQualityInput {
  subject: string;
  body: string; // texto plano derivado del template (sin HTML)
  anchors: HyperAnchors;
  /** kind del email: reactivation | transactional | onboarding | recovery */
  kind?: "reactivation" | "transactional" | "onboarding" | "recovery" | "generic";
  /** mínimo de anclas de personalización en el body. Default 1. */
  minAnchors?: number;
}

export interface EmailQualityResult {
  ok: boolean;
  subjectOk: boolean;
  bodyOk: boolean;
  reasons: string[];
  personalizationScore: number;
}

const SPAMMY_SUBJECT = [
  /!{2,}/,
  /\b(gratis|free|urgente|urgent|ganaste|winner|100% garantizado|último aviso|acción requerida ya)\b/i,
  /\$\$\$/,
  /\bganar dinero\b/i,
  /\bhaz clic ahora\b/i,
];

const ABSOLUTE_PROMISES = [
  /garantiz(ado|amos)\s+(éxito|ventas|resultados|ganancias)/i,
  /duplic[aá]\s+(tus )?ventas/i,
  /triplic[aá]\s+(tus )?ventas/i,
  /100% de éxito/i,
  /sin riesgo/i,
];

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

function countMatches(text: string, re: RegExp): number {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  return (text.match(g) || []).length;
}

function upperRatio(s: string): number {
  const letters = s.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, "");
  if (letters.length < 8) return 0;
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, "").length;
  return upper / letters.length;
}

export function emailQualityCheck(input: EmailQualityInput): EmailQualityResult {
  const reasons: string[] = [];
  const subject = (input.subject ?? "").trim();
  const body = (input.body ?? "").trim();

  // ---- Subject ----
  let subjectOk = true;
  if (subject.length < 6) { subjectOk = false; reasons.push("subject demasiado corto"); }
  if (subject.length > 90) { subjectOk = false; reasons.push("subject demasiado largo (>90)"); }
  for (const re of SPAMMY_SUBJECT) if (re.test(subject)) {
    subjectOk = false; reasons.push("subject con patrón spammy");
  }
  if (upperRatio(subject) > 0.5) {
    subjectOk = false; reasons.push("subject con mayúsculas excesivas");
  }
  if (countMatches(subject, EMOJI_RE) > 2) {
    subjectOk = false; reasons.push("subject con exceso de emojis");
  }

  // ---- Body base (leaks, frases genéricas, snake_case, JSON crudo) ----
  const base = extremeQualityCheck({
    text: body,
    hasBrainEvidence: true,
    hasConcreteAction: true,
  });
  let bodyOk = base.ok;
  reasons.push(...base.reasons);

  // ---- Body length ----
  if (body.length < 80) { bodyOk = false; reasons.push("cuerpo del email demasiado corto"); }
  if (body.length > 6000) { bodyOk = false; reasons.push("cuerpo del email demasiado largo"); }

  // ---- Promesas absolutas ----
  for (const re of ABSOLUTE_PROMISES) if (re.test(body) || re.test(subject)) {
    bodyOk = false; reasons.push("promesa absoluta prohibida");
  }

  // ---- Emojis en cuerpo ----
  if (countMatches(body, EMOJI_RE) > 6) {
    bodyOk = false; reasons.push("exceso de emojis en cuerpo");
  }

  // ---- Placeholders sin reemplazar ----
  if (/\{\{[^}]+\}\}|\$\{[^}]+\}/.test(subject + " " + body)) {
    bodyOk = false; reasons.push("placeholder sin reemplazar en email");
  }
  if (/\b(Hola\s+,|Hola\s+null|Hola\s+undefined)/i.test(body)) {
    bodyOk = false; reasons.push("saludo con nombre vacío");
  }

  // ---- Links sospechosos ----
  const linkMatches = body.match(/https?:\/\/[^\s)]+/gi) || [];
  const suspicious = linkMatches.find((u) => /bit\.ly|tinyurl|goo\.gl|ow\.ly/i.test(u));
  if (suspicious) { bodyOk = false; reasons.push("link acortado sospechoso"); }

  // ---- Personalización ----
  // minAnchors <= 0 = el llamador declara explícitamente que este email puede ir
  // sin anclas de negocio (ej: recordatorio a alguien que aún no creó su negocio).
  const requestedMinAnchors = input.minAnchors ?? 1;
  const hp = hyperPersonalizationCheck({
    text: subject + "\n" + body,
    anchors: input.anchors,
    minAnchors: Math.max(1, requestedMinAnchors),
    requireSpecific: false,
  });
  if (!hp.ok && requestedMinAnchors > 0) {
    bodyOk = false;
    reasons.push(...hp.reasons.map((r) => `email/${r}`));
  }

  const ok = subjectOk && bodyOk;
  return {
    ok,
    subjectOk,
    bodyOk,
    reasons: Array.from(new Set(reasons)),
    personalizationScore: hp.score,
  };
}
