// Brain Core — Validación final antes de mostrar contenido al usuario.
// 9 checks de la Parte 1. Si falla, el caller debe regenerar.

import { containsForbiddenTokens } from "./visible-language.ts";
import { checkIsolation } from "./isolation-guard.ts";

export interface BrainContext {
  businessId: string;
  businessName?: string | null;
  country?: string | null;
  primaryType?: string | null;
  hasOfferProfile: boolean;
  hasCustomerProfile: boolean;
  totalSignals: number;
}

export interface ValidationResult {
  passed: boolean;
  failedChecks: string[];
  warnings: string[];
}

export function validateForUser(text: string, ctx: BrainContext): ValidationResult {
  const failed: string[] = [];
  const warns: string[] = [];

  // 1. Nace del brain (tiene contexto mínimo)
  if (ctx.totalSignals === 0 && !ctx.hasOfferProfile) {
    warns.push("brain_vacio");
  }

  // 2. No expone tokens internos
  if (containsForbiddenTokens(text)) failed.push("tokens_internos_visibles");

  // 3. No es JSON crudo ni código
  if (/^[\s]*[\{\[]/.test(text.trim())) failed.push("salida_es_json");
  if (/```/.test(text)) failed.push("salida_tiene_codeblock");

  // 4. Idioma español visible (sin restos de claves english snake_case en oraciones)
  if (/\b[a-z]+_[a-z]+_[a-z]+\b/.test(text)) failed.push("snake_case_visible");

  // 5. Aislamiento: no genérico ni plantilla
  const iso = checkIsolation(text, ctx.businessName ?? undefined);
  if (iso.isGeneric) failed.push("contenido_generico");
  if (iso.genericScore > 0 && iso.genericScore < 0.66) warns.push("levemente_generico");

  // 6. Longitud mínima razonable (premium UX)
  if (text.trim().length < 18) failed.push("respuesta_muy_corta");

  // 7. No errores backend en texto
  if (/\b(error 5\d\d|stack trace|exception|null reference|undefined is not)\b/i.test(text)) {
    failed.push("error_backend_filtrado");
  }

  // 8. No nombres de motores internos
  if (/\b(gemini|openai|gpt-?\d|claude|prompt|llm)\b/i.test(text)) {
    failed.push("motor_interno_filtrado");
  }

  // 9. Sin placeholders sin reemplazar
  if (/\{\{[^}]+\}\}|\$\{[^}]+\}/.test(text)) failed.push("placeholder_sin_reemplazar");

  return { passed: failed.length === 0, failedChecks: failed, warnings: warns };
}
