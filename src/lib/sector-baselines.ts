/**
 * Personalización contextual del Dashboard.
 *
 * NO usa familias ni catálogos fijos: cada negocio tiene su propia
 * `personalized_signature` (mapa daypart → frase) y `personalized_label`
 * generados por la edge function `seed-business-brain` con Lovable AI a
 * partir del contexto real declarado en setup.
 *
 * Esta utilidad sólo resuelve el daypart actual y devuelve la línea
 * correspondiente desde `business.settings`. Si todavía no hay seed,
 * devuelve una línea neutra (sin inventar nada del negocio).
 */

export type DayPart =
  | "early_morning"
  | "morning"
  | "midday"
  | "afternoon"
  | "evening"
  | "late_night";

const DAYPART_LABEL: Record<DayPart, string> = {
  early_morning: "Temprano",
  morning: "Mañana",
  midday: "Mediodía",
  afternoon: "Tarde",
  evening: "Noche",
  late_night: "Madrugada",
};

export interface PersonalizedSignature {
  label: string;
  daypart: DayPart;
  daypartLabel: string;
  line: string;
  hasPersonalization: boolean;
}

export function currentDaypart(date: Date = new Date()): DayPart {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "early_morning";
  if (h >= 8 && h < 12) return "morning";
  if (h >= 12 && h < 15) return "midday";
  if (h >= 15 && h < 19) return "afternoon";
  if (h >= 19 && h < 23) return "evening";
  return "late_night";
}

export function dayPartLabel(dp: DayPart): string {
  return DAYPART_LABEL[dp];
}

interface BusinessLike {
  name?: string | null;
  category?: string | null;
  settings?: unknown;
}

const NEUTRAL_LINES: Record<DayPart, string> = {
  early_morning: "Arranque del día. Momento ideal para definir foco y prioridades.",
  morning: "Mañana operativa. Revisar pendientes críticos y bloquear tiempo de decisión.",
  midday: "Mediodía. Buen momento para revisar números del día anterior.",
  afternoon: "Tarde productiva. Avanzar con las palancas de mayor impacto.",
  evening: "Cierre del día. Consolidar resultados y planificar mañana.",
  late_night: "Fuera de horario operativo. Reservar para tareas de fondo.",
};

export function personalizedSignatureForNow(
  business: BusinessLike | null | undefined,
  date: Date = new Date(),
): PersonalizedSignature {
  const dp = currentDaypart(date);
  const settings =
    (business?.settings && typeof business.settings === "object"
      ? (business.settings as Record<string, unknown>)
      : {}) ?? {};

  const sigMap = (settings.personalized_signature as Record<string, string> | undefined) ?? {};
  const label =
    (typeof settings.personalized_label === "string" && settings.personalized_label.trim()) ||
    business?.category ||
    business?.name ||
    "Tu negocio";

  const personalLine = typeof sigMap[dp] === "string" ? sigMap[dp].trim() : "";
  const hasPersonalization = personalLine.length > 0;

  return {
    label: String(label),
    daypart: dp,
    daypartLabel: DAYPART_LABEL[dp],
    line: hasPersonalization ? personalLine : NEUTRAL_LINES[dp],
    hasPersonalization,
  };
}
