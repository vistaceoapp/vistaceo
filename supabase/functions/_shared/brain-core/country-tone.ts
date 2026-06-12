// Brain Core — Reglas de país, idioma visible y tono (tu vs voseo)
// Parte 1: idioma visible. Se aplica DESPUÉS de la generación del modelo.

export type ToneVoice = "tu" | "voseo" | "neutro";

// Países que justifican voseo. Resto = "tu" (neutro LATAM/ES).
const VOSEO_COUNTRIES = new Set(["AR", "UY", "PY"]);

export function resolveVoice(countryCode?: string | null, configured?: string | null): ToneVoice {
  if (configured === "voseo" || configured === "tu" || configured === "neutro") return configured;
  if (!countryCode) return "tu";
  const cc = countryCode.toUpperCase();
  if (VOSEO_COUNTRIES.has(cc)) return "voseo";
  return "tu";
}

// Resumen de tono por país, usado por chat-context.ts para el system prompt.
const TONE_LABELS: Record<ToneVoice, string> = {
  voseo: "voseo rioplatense cercano",
  tu: "tuteo profesional cercano",
  neutro: "español neutro profesional",
};

export function resolveCountryTone(countryCode?: string | null): { voice: ToneVoice; label: string } {
  const voice = resolveVoice(countryCode ?? null, null);
  return { voice, label: TONE_LABELS[voice] };
}

// Tono accionable para prompts de generación (pronombre + estilo verbal).
export function toneForCountry(countryCode?: string | null): { pronoun: string; verb: string } {
  const voice = resolveVoice(countryCode ?? null, null);
  if (voice === "voseo") return { pronoun: "vos", verb: "imperativo voseante (activá, sumá, medí)" };
  return { pronoun: "tú", verb: "imperativo tuteante (activa, suma, mide)" };
}




// Mapa bidireccional para corregir el voseo erróneo cuando el país NO lo justifica.
// Conjugaciones imperativas y presentes más comunes en respuestas IA.
const VOSEO_TO_TU: Array<[RegExp, string]> = [
  [/\bvos\b/gi, "tú"],
  [/\bsos\b/gi, "eres"],
  [/\btenes\b/gi, "tienes"],
  [/\btenés\b/gi, "tienes"],
  [/\bpodes\b/gi, "puedes"],
  [/\bpodés\b/gi, "puedes"],
  [/\bquerés\b/gi, "quieres"],
  [/\bqueres\b/gi, "quieres"],
  [/\bsabés\b/gi, "sabes"],
  [/\bhaces\b/gi, "haces"], // ambiguo, dejamos
  [/\bhacés\b/gi, "haces"],
  [/\bsentís\b/gi, "sientes"],
  [/\bvenís\b/gi, "vienes"],
  [/\bdecís\b/gi, "dices"],
  // Imperativos voseo terminados en á/é/í tónica
  [/\bmirá\b/gi, "mira"],
  [/\bfijate\b/gi, "fíjate"],
  [/\bdale\b/gi, "adelante"],
  [/\bcontá\b/gi, "cuenta"],
  [/\bpensá\b/gi, "piensa"],
  [/\barmá\b/gi, "arma"],
  [/\bprobá\b/gi, "prueba"],
  [/\bsumá\b/gi, "suma"],
  [/\bmedí\b/gi, "mide"],
  [/\brevisá\b/gi, "revisa"],
  [/\bdefiní\b/gi, "define"],
  [/\bvalidá\b/gi, "valida"],
  [/\bempezá\b/gi, "empieza"],
  [/\bseguí\b/gi, "sigue"],
];

const TU_TO_VOSEO: Array<[RegExp, string]> = [
  [/\btú\b/g, "vos"],
  [/\bTú\b/g, "Vos"],
  [/\beres\b/gi, "sos"],
  [/\btienes\b/gi, "tenés"],
  [/\bpuedes\b/gi, "podés"],
  [/\bquieres\b/gi, "querés"],
  [/\bsabes\b/gi, "sabés"],
];

/**
 * Aplica el voice apropiado al texto visible.
 * No toca código, JSON, ni tags HTML.
 */
export function applyVisibleVoice(text: string, voice: ToneVoice): string {
  if (!text) return text;
  if (voice === "voseo") {
    let out = text;
    for (const [re, rep] of TU_TO_VOSEO) out = out.replace(re, rep);
    return out;
  }
  if (voice === "tu") {
    let out = text;
    for (const [re, rep] of VOSEO_TO_TU) out = out.replace(re, rep);
    return out;
  }
  return text;
}
