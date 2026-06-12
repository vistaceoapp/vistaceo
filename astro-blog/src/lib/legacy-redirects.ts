// Mapeo de slugs legacy de "/categoria/{x}/" → cluster actual en "/tema/{x}/"
// Usado por src/pages/categoria/[slug].astro para consolidar URLs viejas
// que aún aparecen en Google Search Console como 404.
export const LEGACY_CAT_MAP: Record<string, string> = {
  empleo: 'empleo-habilidades',
  ia: 'ia-para-pymes',
  marketing: 'marketing-crecimiento',
  finanzas: 'finanzas-cashflow',
  operaciones: 'operaciones-procesos',
  ventas: 'ventas-negociacion',
  liderazgo: 'liderazgo-management',
  estrategia: 'estrategia-latam',
  herramientas: 'herramientas-productividad',
  data: 'data-analytics',
  servicios: 'servicios-profesionales-rentabilidad',
  tendencias: 'tendencias-ia-tech',
};
