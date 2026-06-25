// Hooks (ganchos) clickbait HIPER personalizados por subcategoría de negocio.
// Rotación determinística por email para que cada persona reciba copy distinto,
// incluso dentro de la misma subcategoría.

export type CategoryHook = {
  subject: string; // ≤55 chars idealmente
  opener: string;
  cta: string;
};

const FALLBACK: CategoryHook[] = [
  { subject: 'Tu diagnóstico te está esperando', opener: 'Tu negocio ya está calibrado a mitad de camino — falta lo más interesante.', cta: 'Ver mi diagnóstico →' },
  { subject: 'En 3 minutos ves la salud real de tu negocio', opener: 'Lo bueno: ya hiciste lo difícil. Lo que falta toma 3 minutos.', cta: 'Terminar ahora →' },
  { subject: 'Tu CEO digital sigue listo cuando quieras', opener: 'Guardamos todas tus respuestas — no perdiste nada.', cta: 'Retomar →' },
];

// ---- Subcategorías hiper específicas ----
const HOOKS: Record<string, CategoryHook[]> = {
  // GASTRO
  restaurante: [
    { subject: 'Tu carta tiene un plato que te hace perder plata', opener: 'Con tu calibración terminada, te decimos qué platos son tus estrellas y cuáles te restan margen.', cta: 'Ver mi análisis de menú →' },
    { subject: 'Mesa por mesa: dónde estás dejando ticket', opener: 'Rotación, hora pico y el plato que te conviene empujar en cena — todo en un panel.', cta: 'Activar mi panel →' },
  ],
  cafeteria: [
    { subject: 'Tu cafetería puede subir el ticket sin subir precios', opener: 'Hay 2 combos que tu público pide a gritos y todavía no los tenés activos.', cta: 'Ver mis combos →' },
    { subject: '¿Sabés cuál es tu hora más rentable?', opener: 'Te mostramos rotación por franja y qué producto empujar en cada una.', cta: 'Activar mi radar →' },
  ],
  bar: [
    { subject: 'Tu barra tiene 3 tragos que rinden por todos', opener: 'El resto te ocupa heladera y te baja margen. Te decimos cuáles.', cta: 'Ver mi mix de barra →' },
    { subject: 'Hora feliz vs noche: dónde realmente ganás', opener: 'Activá tu panel y mirá qué franja te conviene empujar esta semana.', cta: 'Activar mi panel →' },
  ],
  heladeria: [
    { subject: 'Tu sabor estrella no es el que pensás', opener: 'Mirá el ranking real por margen, rotación y desperdicio.', cta: 'Ver mi ranking →' },
    { subject: 'Cómo facturar igual los días fríos', opener: 'Tenemos 3 jugadas listas para tu local — calibradas con tus respuestas.', cta: 'Activar mi panel →' },
  ],
  panaderia: [
    { subject: 'Tu mostrador necesita un orden distinto', opener: 'Hay productos que te ocupan vidriera y no convierten. Te los marcamos.', cta: 'Ver mi mostrador →' },
    { subject: 'Tu pico de la mañana puede valer 20% más', opener: 'Activá tu panel y mirá qué combo desayuno te conviene fijar.', cta: 'Activar mi panel →' },
  ],
  // RETAIL
  ropa: [
    { subject: 'Tu local tiene 1 talle que se te muere en góndola', opener: 'Mirá el mix real por talle y temporada — y qué reponer ya.', cta: 'Ver mi análisis de stock →' },
    { subject: '¿Sabés cuál es tu prenda más rentable?', opener: 'No es la que más vendés. Te mostramos cuál te deja más por metro de vidriera.', cta: 'Ver mi ranking →' },
  ],
  perfumeria: [
    { subject: 'El producto que más te rinde está mal exhibido', opener: 'Con tus respuestas te decimos qué reubicar para subir ticket sin descuentos.', cta: 'Ver mi layout →' },
    { subject: 'Tu cliente repite — pero no en lo que pensás', opener: 'Activá tu panel y mirá el patrón real de recompra.', cta: 'Activar mi panel →' },
  ],
  gourmet: [
    { subject: 'Tu tienda gourmet tiene un combo que pide pista', opener: 'Calibrado con tu mix actual: 1 bundle que sube ticket sin descuentos.', cta: 'Ver mi bundle →' },
    { subject: '¿Qué categoría te rinde por metro cuadrado?', opener: 'Mirá el ranking real por margen y rotación de tu tienda.', cta: 'Ver mi ranking →' },
  ],
  mayorista: [
    { subject: 'Tu cliente top te está pagando con atraso', opener: 'Te marcamos los 3 clientes que más te trabajan el capital — y qué hacer.', cta: 'Ver mi panel comercial →' },
    { subject: 'Tu lista de precios no está bien segmentada', opener: 'Hay 2 cortes lógicos que te subirían margen sin perder volumen.', cta: 'Ver mi propuesta →' },
  ],
  marketplace_seller: [
    { subject: 'Tu reputación en MELI te está dejando ventas', opener: 'Te marcamos los 2 ajustes que más mueven la aguja esta semana.', cta: 'Ver mis ajustes →' },
    { subject: '¿Qué SKU empujar con publicidad esta semana?', opener: 'Calibrado con tu catálogo: cuál convierte y cuál sólo te consume click.', cta: 'Activar mi panel →' },
  ],
  segunda_mano: [
    { subject: 'Tu stock tiene piezas que rotan en 48hs', opener: 'Te mostramos qué categoría conviene priorizar para acelerar caja.', cta: 'Ver mi panel →' },
  ],
  suscripcion: [
    { subject: 'Tu churn tiene un mes pico — y se puede atacar', opener: 'Mirá la curva real de bajas y los 2 momentos donde intervenir.', cta: 'Ver mi cohorte →' },
  ],
  // SALUD
  consultorio_medico: [
    { subject: 'Tu agenda tiene huecos que se pueden cobrar', opener: 'Cancelaciones, no-shows y turnos sub-ocupados — todo en un panel.', cta: 'Activar mi panel clínico →' },
    { subject: '¿Cuántos pacientes activos tenés realmente?', opener: 'Te mostramos el conteo real, no la lista vieja.', cta: 'Ver mi diagnóstico →' },
  ],
  psicologia: [
    { subject: 'Tu agenda puede llenarse sin trabajar más horas', opener: 'Hay 2 huecos recurrentes que se pueden empaquetar distinto.', cta: 'Ver mi panel →' },
    { subject: 'El paciente que más te rinde es el que no pensás', opener: 'Mirá tu mix real por modalidad y frecuencia.', cta: 'Activar mi panel →' },
  ],
  nutricion: [
    { subject: 'Tu plan grupal puede sumar facturación esta semana', opener: 'Calibrado con tu perfil: 1 producto colectivo que tu público pide.', cta: 'Ver mi propuesta →' },
  ],
  kinesiologia: [
    { subject: 'Tus sesiones tienen un patrón de abandono claro', opener: 'Te mostramos en qué sesión se caen y qué hacer ahí.', cta: 'Ver mi cohorte →' },
  ],
  gimnasio: [
    { subject: 'Tu socio se va antes del mes 3 — y se evita', opener: 'Activá el panel y mirá las 2 intervenciones que más retención mueven.', cta: 'Activar mi panel →' },
  ],
  laboratorio: [
    { subject: 'Tu derivación se está perdiendo en el medio', opener: 'Te marcamos dónde se enfría el flujo médico-paciente-resultado.', cta: 'Ver mi panel →' },
  ],
  // B2B
  saas: [
    { subject: 'Tu activación de trial tiene 1 paso que rompe todo', opener: 'Calibrado con tu funnel: el paso donde más se cae el alta.', cta: 'Ver mi funnel →' },
    { subject: 'Tu pricing está dejando ARR sobre la mesa', opener: 'Hay un tier intermedio que tus clientes están pidiendo.', cta: 'Ver mi propuesta →' },
  ],
  agencia: [
    { subject: 'Tu cliente más rentable no es el más grande', opener: 'Mirá el ranking real por margen y horas invertidas.', cta: 'Ver mi ranking →' },
    { subject: 'Tu retainer puede subir sin perder cuenta', opener: 'Te marcamos las 2 cuentas con espacio real de upsell.', cta: 'Ver mi mapa →' },
  ],
  consultora: [
    { subject: 'Tu pipeline tiene una fuga en la propuesta', opener: 'Es el paso donde más se enfrían tus deals — te decimos por qué.', cta: 'Ver mi pipeline →' },
  ],
  industrial: [
    { subject: 'Tu OEE tiene 2 horas perdidas todos los días', opener: 'Calibrado con tu operación: dónde está la pérdida y cómo recuperarla.', cta: 'Ver mi panel productivo →' },
  ],
  distribuidora: [
    { subject: 'Tu ruta de reparto se puede acortar 18%', opener: 'Te marcamos los clientes que rompen el orden geográfico.', cta: 'Ver mi mapa →' },
  ],
  // SERVICIOS profesionales
  abogado: [
    { subject: 'Tu cartera tiene 1 caso tipo que te conviene priorizar', opener: 'Mirá tu mix real por margen y tiempo.', cta: 'Ver mi ranking de casos →' },
  ],
  contador: [
    { subject: 'Tu cartera mensual tiene clientes con margen negativo', opener: 'Te los marcamos y te damos el guion para renegociar.', cta: 'Ver mi cartera →' },
  ],
  arquitectura: [
    { subject: 'Tu proyecto promedio puede cerrarse 22% más rápido', opener: 'Hay 2 etapas donde se acumula el atraso — te las marcamos.', cta: 'Ver mi flujo →' },
  ],
  coach: [
    { subject: 'Tu programa grupal puede vender solo', opener: 'Calibrado con tu audiencia: el formato que tu público pide.', cta: 'Ver mi propuesta →' },
  ],
  freelance: [
    { subject: 'Estás cobrando barato 2 servicios — te los marcamos', opener: 'Mirá el benchmark real de tu rubro y país.', cta: 'Ver mi pricing →' },
  ],
  // E-COMMERCE
  ecom_moda: [
    { subject: 'Tu checkout pierde clientes en el envío', opener: 'Te marcamos los 2 cambios que más conversión te devuelven.', cta: 'Ver mi funnel →' },
  ],
  ecom_belleza: [
    { subject: 'Tu mejor producto está mal posicionado en home', opener: 'Calibrado con tu catálogo: el SKU que merece pista.', cta: 'Ver mi layout →' },
  ],
  ecom_gourmet: [
    { subject: 'Tu bundle puede subir ticket sin descuentos', opener: 'Hay 1 combo que tu público gourmet ya está pidiendo.', cta: 'Ver mi bundle →' },
  ],
  ecom_generico: [
    { subject: 'Tu tienda tiene oro escondido — te lo mostramos', opener: 'Con tus respuestas, en 3 minutos te decimos qué SKU empujar.', cta: 'Ver mi diagnóstico e-com →' },
  ],
  // HOGAR / SERVICIOS técnicos
  plomeria: [
    { subject: 'Hay 2 barrios donde tu trabajo rinde el doble', opener: 'Te los marcamos en mapa con tarifa promedio real.', cta: 'Ver mi mapa →' },
  ],
  electricidad: [
    { subject: 'Tu visita técnica se está cobrando barata', opener: 'Mirá el benchmark real para tu zona y tipo de trabajo.', cta: 'Ver mi pricing →' },
  ],
  jardineria: [
    { subject: 'Tu cliente recurrente puede valer 3x', opener: 'Te mostramos el plan mensual que tu zona ya paga.', cta: 'Ver mi propuesta →' },
  ],
  limpieza: [
    { subject: 'Tu equipo tiene 2 turnos que se desperdician', opener: 'Activá el panel y mirá la asignación óptima por cliente.', cta: 'Ver mi panel →' },
  ],
  // FALLBACK genéricos
  retail: [
    { subject: 'El radar de tu tienda te está esperando', opener: 'Qué producto te deja más margen y dónde estás dejando ventas.', cta: 'Ver mi radar →' },
  ],
  gastro: [
    { subject: 'Tu local está a un paso del panel operativo', opener: 'Costo, rotación, horarios pico — todo calibrado con tus respuestas.', cta: 'Activar mi panel →' },
  ],
  servicios: [
    { subject: 'Tu agenda puede vender más sin trabajar más', opener: 'Te mostramos dónde se cae tu agenda y cómo subir tu ticket.', cta: 'Ver mi diagnóstico →' },
  ],
  salud: [
    { subject: 'Tu consultorio merece una mirada profesional', opener: 'Cancelaciones, ocupación y derivaciones — en un solo panel.', cta: 'Activar mi panel clínico →' },
  ],
  b2b: [
    { subject: 'Tu pipeline tiene una fuga — la vemos por vos', opener: 'En qué etapa se te caen los deals, calibrado con tus respuestas.', cta: 'Ver mi análisis B2B →' },
  ],
  ecommerce: [
    { subject: 'Tu tienda online tiene oro escondido', opener: 'Qué SKU empujar y dónde se cae la conversión — en 3 minutos.', cta: 'Ver mi diagnóstico →' },
  ],
  hogar_serv: [
    { subject: 'Tu servicio puede llegar a más casas', opener: 'Qué barrios priorizar y dónde ganás más por visita.', cta: 'Ver mi mapa →' },
  ],
};

function pickIndex(seed: string, len: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % Math.max(1, len);
}

// Devuelve una clave de subcategoría (más específica) y una de categoría madre (genérica fallback).
function resolveKeys(c?: string | null): { specific: string | null; parent: string | null } {
  if (!c) return { specific: null, parent: null };
  const k = c.toLowerCase().trim().replace(/[\s/-]+/g, '_');

  // Match exacto a una key del HOOKS
  if (HOOKS[k]) return { specific: k, parent: null };

  // GASTRO
  if (/(restaur|parril|pizz|bist)/.test(k)) return { specific: 'restaurante', parent: 'gastro' };
  if (/(cafet|coffee|caf[eé])/.test(k)) return { specific: 'cafeteria', parent: 'gastro' };
  if (/(bar|pub|cerver)/.test(k)) return { specific: 'bar', parent: 'gastro' };
  if (/(helad|ice)/.test(k)) return { specific: 'heladeria', parent: 'gastro' };
  if (/(panad|bakery|pasteler)/.test(k)) return { specific: 'panaderia', parent: 'gastro' };
  if (/(gastro|food)/.test(k)) return { specific: null, parent: 'gastro' };

  // RETAIL
  if (/(ropa|indument|moda|fashion|boutique)/.test(k) && !/ecom/.test(k)) return { specific: 'ropa', parent: 'retail' };
  if (/(perfum|belle|cosmet)/.test(k) && !/ecom/.test(k)) return { specific: 'perfumeria', parent: 'retail' };
  if (/(gourmet|delicat)/.test(k) && !/ecom/.test(k)) return { specific: 'gourmet', parent: 'retail' };
  if (/(mayor|wholesale)/.test(k)) return { specific: 'mayorista', parent: 'retail' };
  if (/(meli|marketplace_seller|mercadolibre)/.test(k)) return { specific: 'marketplace_seller', parent: 'retail' };
  if (/(segunda|usado|vintage)/.test(k)) return { specific: 'segunda_mano', parent: 'retail' };
  if (/(suscrip|subscription|box)/.test(k)) return { specific: 'suscripcion', parent: 'retail' };
  if (/(retail|tienda|comerc|kiosco|almac)/.test(k)) return { specific: null, parent: 'retail' };

  // SALUD
  if (/(psico|terapeut)/.test(k)) return { specific: 'psicologia', parent: 'salud' };
  if (/(nutric|dietet)/.test(k)) return { specific: 'nutricion', parent: 'salud' };
  if (/(kine|fisio|rehab)/.test(k)) return { specific: 'kinesiologia', parent: 'salud' };
  if (/(gimnas|gym|fitness|crossfit)/.test(k)) return { specific: 'gimnasio', parent: 'salud' };
  if (/(laborat|bioqu)/.test(k)) return { specific: 'laboratorio', parent: 'salud' };
  if (/(medic|clinic|consult|odont|dental)/.test(k)) return { specific: 'consultorio_medico', parent: 'salud' };
  if (/(salud|health)/.test(k)) return { specific: null, parent: 'salud' };

  // B2B
  if (/(saas|software|app)/.test(k)) return { specific: 'saas', parent: 'b2b' };
  if (/(agencia|agency|marketing)/.test(k)) return { specific: 'agencia', parent: 'b2b' };
  if (/(consult)/.test(k)) return { specific: 'consultora', parent: 'b2b' };
  if (/(industr|fabric|manufactur)/.test(k)) return { specific: 'industrial', parent: 'b2b' };
  if (/(distribuid|logistic)/.test(k)) return { specific: 'distribuidora', parent: 'b2b' };
  if (/(b2b|empresa|corp)/.test(k)) return { specific: null, parent: 'b2b' };

  // SERVICIOS profesionales
  if (/(aboga|legal|estudio_jur)/.test(k)) return { specific: 'abogado', parent: 'servicios' };
  if (/(contad|account|fiscal)/.test(k)) return { specific: 'contador', parent: 'servicios' };
  if (/(arqui|diseñ|design)/.test(k)) return { specific: 'arquitectura', parent: 'servicios' };
  if (/(coach|mentor|formac)/.test(k)) return { specific: 'coach', parent: 'servicios' };
  if (/(freelance|autonom)/.test(k)) return { specific: 'freelance', parent: 'servicios' };
  if (/(servic)/.test(k)) return { specific: null, parent: 'servicios' };

  // E-COMMERCE
  if (/(ecom|online|shop).*(moda|ropa|fashion)/.test(k)) return { specific: 'ecom_moda', parent: 'ecommerce' };
  if (/(ecom|online|shop).*(belle|perfum|cosmet)/.test(k)) return { specific: 'ecom_belleza', parent: 'ecommerce' };
  if (/(ecom|online|shop).*(gourmet|food)/.test(k)) return { specific: 'ecom_gourmet', parent: 'ecommerce' };
  if (/(ecom|online|shop)/.test(k)) return { specific: 'ecom_generico', parent: 'ecommerce' };

  // HOGAR / SERVICIOS técnicos
  if (/(plomer|gasista|sanitar)/.test(k)) return { specific: 'plomeria', parent: 'hogar_serv' };
  if (/(electric)/.test(k)) return { specific: 'electricidad', parent: 'hogar_serv' };
  if (/(jardin|paisaj)/.test(k)) return { specific: 'jardineria', parent: 'hogar_serv' };
  if (/(limpie|clean)/.test(k)) return { specific: 'limpieza', parent: 'hogar_serv' };
  if (/(hogar|home|reparac)/.test(k)) return { specific: null, parent: 'hogar_serv' };

  return { specific: null, parent: null };
}

export function pickHook(
  category: string | null | undefined,
  seed: string,
  firstName?: string,
  businessName?: string,
): CategoryHook {
  const { specific, parent } = resolveKeys(category);
  const pool: CategoryHook[] =
    (specific && HOOKS[specific]) ||
    (parent && HOOKS[parent]) ||
    FALLBACK;

  const base = pool[pickIndex(seed, pool.length)];
  const name = (firstName || '').trim();
  const biz = (businessName || '').trim();

  // 4 variantes de "vestido" del subject para que dos personas de la misma
  // subcategoría reciban un asunto distinto, incluso si cae el mismo `base`.
  let subject = base.subject;
  const variant = pickIndex(seed + 'v', 5);
  if (variant === 0 && name) subject = `${name}, ${subject.charAt(0).toLowerCase()}${subject.slice(1)}`;
  else if (variant === 1 && biz) subject = `${subject} — ${biz}`;
  else if (variant === 2 && biz) subject = `${biz}: ${subject.charAt(0).toLowerCase()}${subject.slice(1)}`;
  else if (variant === 3 && name) subject = `${subject} (${name})`;
  // variant === 4: subject limpio sin nombre/biz

  // Variar opener con el biz cuando corresponda
  let opener = base.opener;
  if (biz && pickIndex(seed + 'o', 3) === 0) {
    opener = `${biz}: ${opener.charAt(0).toLowerCase()}${opener.slice(1)}`;
  }

  return { subject, opener, cta: base.cta };
}
