// A/B variants for /promo. Switch ACTIVE_HERO / ACTIVE_CTA to test copy.

export const HERO_VARIANTS = {
  A: {
    title: "Saber qué hacer hoy para crecer.",
    highlight: "crecer",
    subtitle:
      "VISTACEO analiza tu contexto, detecta prioridades y te entrega misiones para actuar hoy.",
  },
  B: {
    title: "Tu CEO digital con IA, gratis para empezar hoy.",
    highlight: "hoy",
    subtitle:
      "Para tu negocio, servicio o profesión: VISTACEO te muestra qué priorizar y qué decidir para crecer.",
  },
  C: {
    title: "Descubrí qué hacer hoy para vender más y crecer.",
    highlight: "crecer",
    subtitle:
      "Un sistema ejecutivo con IA que convierte tu contexto en próximos pasos, sea cual sea tu negocio, servicio o profesión.",
  },
} as const;

export const CTA_VARIANTS = {
  A: "Crear cuenta gratis",
  B: "Recibir mi plan gratis",
  C: "Empezar gratis ahora",
} as const;

export type HeroVariant = keyof typeof HERO_VARIANTS;
export type CTAVariant = keyof typeof CTA_VARIANTS;

export const ACTIVE_HERO: HeroVariant = "A";
export const ACTIVE_CTA: CTAVariant = "A";

export function getActiveHero() {
  return HERO_VARIANTS[ACTIVE_HERO];
}

export function getActiveCTA() {
  return CTA_VARIANTS[ACTIVE_CTA];
}
