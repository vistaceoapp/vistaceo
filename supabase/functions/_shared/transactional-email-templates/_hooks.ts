// Hooks (ganchos) clickbait personalizados por categoría de negocio.
// Se usa una rotación determinística por email + stage para variar copy
// sin que dos personas reciban exactamente lo mismo.

export type CategoryHook = {
  // Hook corto para asunto (≤55 chars idealmente)
  subject: string;
  // Frase de apertura para el cuerpo
  opener: string;
  // CTA personalizado
  cta: string;
};

const FALLBACK: CategoryHook[] = [
  { subject: 'Tu diagnóstico te está esperando', opener: 'Tu negocio ya está calibrado a mitad de camino — falta lo más interesante.', cta: 'Ver mi diagnóstico →' },
  { subject: 'En 3 minutos ves la salud real de tu negocio', opener: 'Lo bueno: ya hiciste lo difícil. Lo que falta toma 3 minutos.', cta: 'Terminar ahora →' },
  { subject: 'Tu CEO digital sigue listo cuando quieras', opener: 'Guardamos todas tus respuestas — no perdiste nada.', cta: 'Retomar →' },
];

const HOOKS_BY_CATEGORY: Record<string, CategoryHook[]> = {
  retail: [
    { subject: 'El radar de tu tienda te está esperando', opener: 'Vamos a mirar juntos qué producto te está dejando más margen y dónde estás dejando ventas en la mesa.', cta: 'Ver mi radar de tienda →' },
    { subject: 'Sabemos por qué tu ticket promedio no sube', opener: 'Con lo que ya respondiste alcanza para activar el panel y mostrarte dónde se cae la conversión.', cta: 'Activar mi panel →' },
    { subject: '¿Sabés cuál es tu producto más rentable?', opener: 'En 3 minutos terminás y te decimos cuál de tus productos te conviene empujar esta semana.', cta: 'Ver mi mix →' },
  ],
  gastro: [
    { subject: 'Tu menú tiene un plato que te está haciendo perder plata', opener: 'Con tu calibración terminada, te mostramos qué platos son tus estrellas y cuáles te están restando margen.', cta: 'Ver mi análisis de menú →' },
    { subject: 'En 3 minutos tenés tu radar gastronómico', opener: 'Tu negocio quedó a un paso de tener su panel de operación — costo, rotación, horarios pico.', cta: 'Terminar mi calibración →' },
    { subject: 'Te falta poco para optimizar tu salón', opener: 'Salud operativa, rotación de mesas y oportunidades para tu local — todo en un panel.', cta: 'Activar mi panel →' },
  ],
  servicios: [
    { subject: 'Tu agenda puede vender más sin trabajar más', opener: 'Con lo que respondiste podemos mostrarte dónde se cae tu agenda y cómo subir tu ticket sin más horas.', cta: 'Ver mi diagnóstico →' },
    { subject: '¿Sabés cuánto te cuesta cada consulta perdida?', opener: 'Tu CEO digital ya tiene el contexto — falta 1 paso para que te muestre el dinero que estás dejando ir.', cta: 'Activar mi CEO →' },
    { subject: 'En 3 minutos ves dónde escalar tu servicio', opener: 'Identificamos qué clientes te dejan más, dónde optimizar tu tiempo y qué seguir cobrando aparte.', cta: 'Terminar ahora →' },
  ],
  salud: [
    { subject: 'Tu centro de salud merece una mirada profesional', opener: 'Con lo que ya contestaste activamos el panel de tu consultorio: cancelaciones, ocupación y derivaciones.', cta: 'Activar mi panel clínico →' },
    { subject: 'Te falta poco para ver la salud real de tu consultorio', opener: 'Vamos a mostrarte cuántos pacientes activos tenés, dónde se caen los turnos y qué tratamientos rinden más.', cta: 'Ver mi diagnóstico →' },
    { subject: 'Optimizá tu agenda clínica en 3 minutos', opener: 'Tu CEO digital ya tiene el contexto de tu práctica — falta poco para verlo en acción.', cta: 'Terminar mi calibración →' },
  ],
  b2b: [
    { subject: 'Tu pipeline tiene una fuga — la vemos por vos', opener: 'Con tus respuestas podemos mostrarte en qué etapa del pipeline se te están cayendo los deals.', cta: 'Ver mi análisis B2B →' },
    { subject: 'Activá el radar de cuentas para tu equipo', opener: 'Tu CEO digital ya tiene el contexto — falta poco para tener radar de cuentas y forecast más afilado.', cta: 'Activar mi radar →' },
    { subject: 'En 3 minutos tenés tu panel de ventas B2B', opener: 'Ciclo de venta, ticket promedio, cuentas estratégicas — todo ordenado por impacto.', cta: 'Terminar ahora →' },
  ],
  ecommerce: [
    { subject: 'Tu tienda online tiene oro escondido — te lo mostramos', opener: 'Con tus respuestas, en 3 minutos te decimos qué SKU te conviene empujar y dónde se cae la conversión.', cta: 'Ver mi diagnóstico e-com →' },
    { subject: '¿En qué paso del checkout perdés clientes?', opener: 'Tu calibración ya está en marcha — falta lo mejor: las oportunidades reales de tu catálogo.', cta: 'Activar mi panel →' },
    { subject: 'Tu mix de productos te está pidiendo orden', opener: 'Activá tu CEO digital y empezá a decidir con datos, no con la corazonada del mes pasado.', cta: 'Terminar ahora →' },
  ],
  hogar_serv: [
    { subject: 'Tu servicio puede llegar a más casas — te decimos cómo', opener: 'Con tus respuestas ya casi listo: cuántos trabajos hacés bien, dónde ganás más y qué barrios te conviene priorizar.', cta: 'Ver mi mapa →' },
    { subject: 'Optimizá tu agenda de visitas en 3 minutos', opener: 'Tu CEO digital ya conoce tu zona y servicio — falta poco para que te muestre cómo escalar sin desordenar.', cta: 'Activar mi panel →' },
  ],
};

function pickIndex(seed: string, len: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % Math.max(1, len);
}

function normalizeCategory(c?: string | null): string | null {
  if (!c) return null;
  const k = c.toLowerCase().trim();
  if (k.includes('gastro') || k.includes('restaur') || k.includes('cafet') || k.includes('bar')) return 'gastro';
  if (k.includes('retail') || k.includes('tienda') || k.includes('comerc')) return 'retail';
  if (k.includes('ecom') || k.includes('online') || k.includes('shop')) return 'ecommerce';
  if (k.includes('salud') || k.includes('clinic') || k.includes('consult') || k.includes('medic')) return 'salud';
  if (k.includes('b2b') || k.includes('saas') || k.includes('empresa')) return 'b2b';
  if (k.includes('servic') || k.includes('coach') || k.includes('consul')) return 'servicios';
  if (k.includes('hogar') || k.includes('plomer') || k.includes('electric') || k.includes('jardin')) return 'hogar_serv';
  return null;
}

export function pickHook(
  category: string | null | undefined,
  seed: string,
  firstName?: string,
  businessName?: string,
): CategoryHook {
  const cat = normalizeCategory(category);
  const pool = (cat && HOOKS_BY_CATEGORY[cat]) || FALLBACK;
  const base = pool[pickIndex(seed, pool.length)];
  const name = (firstName || '').trim();
  const biz = (businessName || '').trim();
  let subject = base.subject;
  if (name && pickIndex(seed + 'n', 3) === 0) subject = `${name}, ${subject.charAt(0).toLowerCase()}${subject.slice(1)}`;
  else if (biz && pickIndex(seed + 'b', 4) === 0) subject = `${subject} — ${biz}`;
  return { ...base, subject };
}
