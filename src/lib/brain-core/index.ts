// Frontend mirror del brain-core (Parte 1).
// Utilidades puras para aplicar idioma visible en componentes existentes
// sin modificar la UX/UI. Se usan opcionalmente desde los renders actuales.

export type ToneVoice = "tu" | "voseo" | "neutro";

const VOSEO_COUNTRIES = new Set(["AR", "UY", "PY"]);

export function resolveVoice(countryCode?: string | null, configured?: string | null): ToneVoice {
  if (configured === "voseo" || configured === "tu" || configured === "neutro") return configured;
  if (!countryCode) return "tu";
  return VOSEO_COUNTRIES.has(countryCode.toUpperCase()) ? "voseo" : "tu";
}

const VOSEO_TO_TU: Array<[RegExp, string]> = [
  [/\bvos\b/gi, "tú"],
  [/\bsos\b/gi, "eres"],
  [/\btenés\b/gi, "tienes"], [/\btenes\b/gi, "tienes"],
  [/\bpodés\b/gi, "puedes"], [/\bpodes\b/gi, "puedes"],
  [/\bquerés\b/gi, "quieres"], [/\bqueres\b/gi, "quieres"],
  [/\bsabés\b/gi, "sabes"],
  [/\bdecís\b/gi, "dices"],
  [/\bsentís\b/gi, "sientes"],
  [/\bvenís\b/gi, "vienes"],
  [/\bmirá\b/gi, "mira"],
  [/\bcontá\b/gi, "cuenta"],
  [/\bpensá\b/gi, "piensa"],
  [/\bprobá\b/gi, "prueba"],
  [/\barmá\b/gi, "arma"],
  [/\bempezá\b/gi, "empieza"],
  [/\bseguí\b/gi, "sigue"],
  [/\brevisá\b/gi, "revisa"],
  [/\bvalidá\b/gi, "valida"],
  [/\bdefiní\b/gi, "define"],
  [/\bmedí\b/gi, "mide"],
];

const TU_TO_VOSEO: Array<[RegExp, string]> = [
  [/\btú\b/g, "vos"], [/\bTú\b/g, "Vos"],
  [/\beres\b/gi, "sos"],
  [/\btienes\b/gi, "tenés"],
  [/\bpuedes\b/gi, "podés"],
  [/\bquieres\b/gi, "querés"],
  [/\bsabes\b/gi, "sabés"],
];

export function applyVisibleVoice(text: string, voice: ToneVoice): string {
  if (!text) return text;
  if (voice === "voseo") {
    let o = text;
    for (const [re, rep] of TU_TO_VOSEO) o = o.replace(re, rep);
    return o;
  }
  if (voice === "tu") {
    let o = text;
    for (const [re, rep] of VOSEO_TO_TU) o = o.replace(re, rep);
    return o;
  }
  return text;
}

// Etiquetas visibles
export const VISIBLE_LABELS: Record<string, string> = {
  why_now: "Por qué aplica a tu caso",
  specific_action: "Primer paso recomendado",
  impact_score: "Impacto estimado",
  effort_score: "Esfuerzo estimado",
  metric: "Qué deberías medir",
  connected_mission: "Misión relacionada",
  certainty_score: "Confianza del análisis",
  evidence_from_brain: "Por qué aplica a tu caso",
  confirmed: "Confirmado",
  inferred: "Inferido",
  possible: "Posible",
  doubtful: "Por validar",
  discarded: "Descartado",
  pending: "Por validar",
};

export function visibleLabel(key: string): string {
  return VISIBLE_LABELS[key] ?? key;
}
