// Brain Core — Capa de aislamiento absoluto por negocio.
// Detecta texto genérico, plantillas, y contenido que serviría para cualquier negocio.

const GENERIC_PHRASES = [
  "mejorar tu presencia digital",
  "mejorar la presencia digital",
  "crear contenido de calidad",
  "publicar más en redes",
  "interactuar con tu audiencia",
  "definir tu propuesta de valor",
  "conocer a tu cliente ideal",
  "optimizar tu sitio web",
  "hacer estrategia de marketing",
  "mejorar la experiencia del cliente",
  "ofrecer un buen servicio",
  "diferenciarte de la competencia",
  "tener una identidad de marca",
  "usar las redes sociales",
  "estar presente en google",
  "ser constante",
  "aportar valor",
];

const PLATITUDE_PATTERNS: RegExp[] = [
  /\bcomo (?:dueño|emprendedor|profesional)\b/i,
  /\bes importante (?:que|tener|hacer)\b/i,
  /\brecuerda que\b/i,
  /\bla clave (?:es|está|para)\b/i,
  /\bdebes saber que\b/i,
  /\ben el mundo (?:actual|de los negocios|digital)\b/i,
];

export interface IsolationCheck {
  isGeneric: boolean;
  issues: string[];
  genericScore: number; // 0..1
}

/**
 * Revisa si un texto suena a plantilla o consejo genérico.
 * NO bloquea aún; el caller decide regenerar.
 */
export function checkIsolation(text: string, businessName?: string): IsolationCheck {
  const issues: string[] = [];
  if (!text) return { isGeneric: false, issues: [], genericScore: 0 };

  const lower = text.toLowerCase();

  let hits = 0;
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) {
      hits++;
      issues.push(`frase_generica:${phrase}`);
    }
  }
  for (const re of PLATITUDE_PATTERNS) {
    if (re.test(text)) {
      hits++;
      issues.push(`platitud:${re.source}`);
    }
  }

  // Si el negocio tiene nombre y NO aparece ni un dato específico, sumamos sospecha leve.
  if (businessName && businessName.length > 2) {
    const mentionsBusiness = lower.includes(businessName.toLowerCase());
    if (!mentionsBusiness && text.length > 220) {
      // texto largo sin anclar al negocio
      issues.push("sin_anclaje_al_negocio");
      hits += 0.5;
    }
  }

  const genericScore = Math.min(1, hits / 3);
  return {
    isGeneric: genericScore >= 0.66,
    issues,
    genericScore,
  };
}

/**
 * Fingerprint determinístico por negocio para evitar copiar salidas entre negocios.
 */
export function buildIsolationFingerprint(parts: {
  businessId: string;
  businessName?: string | null;
  country?: string | null;
  primaryType?: string | null;
  offerSummary?: string | null;
}): string {
  const seed = [
    parts.businessId,
    parts.businessName ?? "",
    parts.country ?? "",
    parts.primaryType ?? "",
    (parts.offerSummary ?? "").slice(0, 80),
  ].join("|").toLowerCase();
  // hash determinístico simple (FNV-1a)
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return `fp_${h.toString(36)}`;
}
