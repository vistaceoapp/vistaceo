// A/B variants for /promo. Switch ACTIVE_HERO / ACTIVE_CTA to test copy
// without adding a runtime experiments framework.

export const HERO_VARIANTS = {
  A: {
    title: "Crea tu cuenta gratis y recibí un plan claro para hacer crecer tu negocio.",
    subtitle:
      "VISTACEO analiza tu negocio, detecta prioridades y te entrega misiones accionables para saber qué hacer hoy.",
  },
  B: {
    title: "Tu negocio con un CEO digital con IA, gratis para empezar.",
    subtitle:
      "VISTACEO te muestra qué priorizar, qué decidir y qué hacer hoy para crecer.",
  },
  C: {
    title: "Descubrí qué hacer hoy para vender más, ordenar tu negocio y crecer.",
    subtitle:
      "Un sistema ejecutivo con IA que convierte tu contexto en próximos pasos concretos.",
  },
} as const;

export const CTA_VARIANTS = {
  A: "Crear cuenta gratis",
  B: "Recibir mi plan gratis",
  C: "Empezar gratis ahora",
} as const;

export type HeroVariant = keyof typeof HERO_VARIANTS;
export type CTAVariant = keyof typeof CTA_VARIANTS;

// Active variants — change here to test.
export const ACTIVE_HERO: HeroVariant = "A";
export const ACTIVE_CTA: CTAVariant = "A";

export function getActiveHero() {
  return HERO_VARIANTS[ACTIVE_HERO];
}

export function getActiveCTA() {
  return CTA_VARIANTS[ACTIVE_CTA];
}
