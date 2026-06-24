// Diccionario de etiquetas en español para mostrar respuestas del setup
// de forma humana en el panel admin (en vez de códigos como EASY_01_STAGE).

export type LabeledQuestion = {
  title: string;
  options?: Record<string, string>;
};

// Preguntas EASY del cuestionario rápido / completo (planning + active)
export const QUESTION_LABELS: Record<string, LabeledQuestion> = {
  // === Planning track ===
  EASY_01_STAGE: {
    title: '¿En qué momento estás con tu proyecto / negocio?',
    options: {
      idea: 'Idea muy inicial', planning: 'Planeando los próximos pasos',
      almost: 'Casi listo para arrancar', first_sales: 'Primeras ventas de prueba',
      starting: 'Estoy empezando', selling: 'Ya vendo y quiero crecer',
      stable: 'Funciona, quiero ordenarlo', stuck: 'Siento que está trabado',
    },
  },
  EASY_02_GOAL: {
    title: '¿Qué te ayudaría más ahora?',
    options: {
      clarity: 'Tener claro qué hacer primero', clients: 'Saber dónde encontrar clientes',
      offer: 'Definir bien la oferta', confidence: 'Validar que vale la pena',
      more_clients: 'Conseguir más clientes', sell_more: 'Vender más',
      profit: 'Mejorar rentabilidad', order: 'Ordenar procesos',
    },
  },
  EASY_03_OFFER: { title: '¿Tu propuesta principal está definida?', options: { clear: 'Sí, ya la tengo', almost: 'Casi, falta pulir', exploring: 'Estoy explorando', open: 'Abierto a sugerencias' } },
  EASY_03_CHANNEL: { title: '¿Por dónde llegan más consultas o ventas?', options: { whatsapp: 'WhatsApp', instagram: 'Redes sociales', web: 'Web o buscadores', referrals: 'Recomendaciones' } },
  EASY_04_AUDIENCE: { title: '¿Sabés a quién querés venderle?', options: { clear: 'Sí, lo tengo claro', rough: 'Tengo una idea', exploring: 'Estoy probando', open: 'No todavía' } },
  EASY_04_BLOCKER: { title: '¿Qué te frena más en el día a día?', options: { time: 'Falta de tiempo', clients: 'Faltan clientes', process: 'Desorden operativo', money: 'Los números no cierran' } },
  EASY_05_DIFFERENTIAL: { title: '¿Qué te diferencia o querés que te diferencie?', options: { quality: 'Calidad', price: 'Precio', attention: 'Atención cercana', innovation: 'Algo nuevo' } },
  EASY_05_RESPONSE: { title: '¿Qué tan rápido respondés cuando te consultan?', options: { minutes: 'En minutos', same_day: 'En el día', next_day: 'Al otro día', late: 'A veces se me pasan' } },
  EASY_06_CHANNEL: { title: '¿Por dónde pensás comunicar primero?', options: { whatsapp: 'WhatsApp', instagram: 'Redes sociales', web: 'Web', referrals: 'Boca en boca' } },
  EASY_06_PROFITABLE: { title: '¿Tenés claro qué producto/servicio te deja más ganancia?', options: { yes: 'Sí, lo tengo claro', some: 'Más o menos', no: 'No, vendo sin mirar eso', varies: 'Depende del mes' } },
  EASY_07_BLOCKER: { title: '¿Qué es lo que más te traba para arrancar?', options: { time: 'Tiempo', money: 'Capital inicial', know_how: 'No sé por dónde empezar', fear: 'Inseguridad de lanzar' } },
  EASY_07_REPEAT: { title: '¿Tus clientes suelen volver o recomendarte?', options: { often: 'Sí, bastante', sometimes: 'A veces', rarely: 'Poco', new: 'Todavía no tengo suficientes' } },
  EASY_08_INVESTMENT: { title: '¿Cuánto pensás invertir al principio?', options: { low: 'Lo mínimo posible', medium: 'Inversión moderada', high: 'Voy con todo', not_yet: 'Todavía no lo definí' } },
  EASY_08_CONTROL: { title: '¿Cómo llevás el control de ventas y gastos?', options: { system: 'Con sistema o planilla', notes: 'Con notas o mensajes', memory: 'De memoria', none: 'Casi no lo controlo' } },
  EASY_09_TIMELINE: { title: '¿Cuándo te gustaría arrancar?', options: { now: 'Ya', weeks: 'En unas semanas', months: 'En unos meses', exploring: 'Sigo explorando' } },
  EASY_09_COMPETITION: { title: '¿Qué sentís que hace mejor tu competencia?', options: { price: 'Precio', attention: 'Atención o respuesta', visibility: 'Visibilidad', offer: 'Oferta más clara' } },
  EASY_10_FIRST_STEP: { title: '¿Qué primer paso te gustaría hacer hoy?', options: { plan: 'Tener un plan claro', test: 'Probar la idea con alguien', content: 'Empezar a comunicar', priority: 'Saber qué priorizar' } },
  EASY_10_MISSION: { title: '¿Qué misión te serviría más hoy?', options: { sell: 'Mejorar ventas', whatsapp: 'Ordenar WhatsApp', prices: 'Revisar precios', priority: 'Saber qué priorizar' } },
  EASY_11_SUPPORT: { title: '¿Vas a hacerlo solo/a o con alguien?', options: { solo: 'Solo/a', partner: 'Con un socio/a', team: 'Con un equipo', family: 'Con familia o amigos' } },
  EASY_11_CLEAR_OFFER: { title: '¿Tu oferta principal se entiende rápido?', options: { yes: 'Sí, está clara', almost: 'Podría estar más clara', no: 'No tanto', new: 'La estoy definiendo' } },
  EASY_12_FIRST_ANALYSIS: { title: '¿Qué te gustaría ver primero en tu análisis?', options: { opportunities: 'Radar de oportunidades', mission: 'Misión para hoy', insights: 'Ideas para arrancar', competition: 'Análisis de competencia' } },
  EASY_12_PRICE: { title: '¿Cuándo fue la última vez que revisaste precios?', options: { month: 'Este mes', quarter: 'Últimos 3 meses', year: 'Hace más de 6 meses', never: 'Nunca de forma ordenada' } },
  EASY_13_NAME: { title: '¿Ya tenés nombre para tu proyecto?', options: { yes: 'Sí, definitivo', idea: 'Tengo una idea', options: 'Estoy entre varias opciones', no: 'Todavía no' } },
  EASY_13_PEAK: { title: '¿Sabés qué días/horarios te conviene vender más fuerte?', options: { yes: 'Sí, lo tengo claro', intuition: 'Lo intuyo', no: 'No lo miro', varies: 'Cambia mucho' } },
  EASY_14_LOCATION: { title: '¿Cómo va a operar tu proyecto?', options: { online: '100% online', local: 'Local físico', hybrid: 'Mixto', exploring: 'Aún no decidí' } },
  EASY_14_LOST_CLIENTS: { title: '¿Dónde se pierden más clientes?', options: { before_contact: 'Antes de consultar', after_message: 'Después del primer mensaje', price: 'Cuando ven el precio', followup: 'Por falta de seguimiento' } },
  EASY_15_PRICES: { title: '¿Pensaste cómo vas a cobrar / qué precios?', options: { clear: 'Sí, ya los tengo', rough: 'Una idea inicial', research: 'Estoy investigando', no: 'Todavía no' } },
  EASY_15_REVIEWS: { title: '¿Tenés reseñas o testimonios recientes?', options: { many: 'Sí, varias recientes', few: 'Algunas', old: 'Tengo, pero viejas', none: 'Casi ninguna' } },
  EASY_16_FIRST_CLIENTS: { title: '¿De dónde van a salir tus primeros clientes?', options: { network: 'De mi red personal', online: 'De redes sociales', referrals: 'Por recomendación', not_sure: 'No lo tengo claro' } },
  EASY_16_TEAM: { title: '¿Las tareas principales están claras?', options: { yes: 'Sí, cada uno sabe qué hacer', some: 'Más o menos', no: 'Se decide sobre la marcha', solo: 'Trabajo solo/a' } },
  EASY_17_BIGGEST_FEAR: { title: '¿Qué es lo que más te preocupa de arrancar?', options: { no_clients: 'No conseguir clientes', competition: 'La competencia', money: 'Quedarme sin plata', time: 'No tener tiempo' } },
  EASY_17_FOLLOWUP: { title: '¿Hacés seguimiento a quienes consultan y no compran?', options: { always: 'Siempre', sometimes: 'A veces', rarely: 'Pocas veces', never: 'No lo hago' } },
  EASY_18_VALIDATION: { title: '¿Hablaste con alguien para validar la idea?', options: { many: 'Con varias personas', few: 'Con algunos', one: 'Con uno o dos', no: 'Todavía no' } },
  EASY_18_CONTENT: { title: '¿Qué tan seguido mostrás tu negocio en redes o web?', options: { daily: 'Todos los días', weekly: 'Varias veces por semana', rare: 'Cuando puedo', never: 'Casi nunca' } },
  EASY_19_BRAND: { title: '¿Tenés logo o identidad visual?', options: { yes: 'Sí, definitiva', draft: 'Algo borrador', idea: 'Solo idea', no: 'Todavía no' } },
  EASY_19_PAYMENTS: { title: '¿Cobrarle al cliente es simple?', options: { easy: 'Sí, muy simple', some: 'Podría ser mejor', manual: 'Es bastante manual', problem: 'A veces genera problemas' } },
  EASY_20_SOCIAL: { title: '¿Ya tenés cuentas de redes sociales listas?', options: { active: 'Sí, ya activas', created: 'Creadas pero sin uso', planning: 'Las voy a crear', no: 'Todavía no lo pensé' } },
  EASY_20_CAPACITY: { title: '¿Podrías atender más demanda sin desordenarte?', options: { yes: 'Sí', little: 'Un poco más', no: 'No, ya estoy al límite', depends: 'Depende del día' } },
  EASY_21_LEGAL: { title: '¿Cómo vas a facturar al principio?', options: { formal: 'Empresa o monotributo', informal: 'Sin facturar todavía', research: 'Lo estoy averiguando', not_sure: 'No lo definí' } },
  EASY_21_DECISIONS: { title: '¿Qué decisión te cuesta más tomar?', options: { prices: 'Precios', where_sell: 'Dónde vender o comunicar', hire: 'Contratar o delegar', priority: 'Qué hacer primero' } },
  EASY_22_TIME: { title: '¿Cuánto tiempo por semana le vas a dedicar?', options: { full: 'Tiempo completo', half: 'Medio tiempo', few: 'Pocas horas', weekends: 'Fines de semana' } },
  EASY_22_PROMOS: { title: '¿Usás promociones o descuentos?', options: { planned: 'Planificados', sometimes: 'A veces', too_much: 'Demasiado seguido', never: 'No uso' } },
  EASY_23_MARKET: { title: '¿Investigaste a la competencia?', options: { deep: 'Sí, en profundidad', basic: 'Por arriba', plan: 'Lo voy a hacer', no: 'Todavía no' } },
  EASY_23_SUPPLIERS: { title: '¿Hay costos o proveedores que te preocupan?', options: { yes: 'Sí, varios', some: 'Algunos', no: 'No especialmente', unknown: 'No lo tengo claro' } },
  EASY_24_GOAL_3M: { title: '¿Qué te gustaría haber logrado en 3 meses?', options: { first_clients: 'Primeros clientes', break_even: 'Cubrir gastos', confidence: 'Saber si funciona', community: 'Tener seguidores' } },
  EASY_24_TOOLS: { title: '¿Qué herramienta usás más para operar?', options: { whatsapp: 'WhatsApp', spreadsheet: 'Planilla', system: 'Sistema de gestión', manual: 'Todo manual' } },
  EASY_25_RISK: { title: '¿Qué tanto riesgo estás dispuesto/a a tomar?', options: { low: 'Bajo, ir despacio', medium: 'Moderado', high: 'Alto, ir a fondo', not_sure: 'No lo tengo claro' } },
  EASY_25_CUSTOMER_ASKS: { title: '¿Qué te preguntan más los clientes?', options: { price: 'Precio', availability: 'Disponibilidad', how_it_works: 'Cómo funciona', trust: 'Garantía o confianza' } },
  EASY_26_HELP: { title: '¿Quién te puede ayudar al principio?', options: { mentor: 'Un mentor o referente', friends: 'Amigos o familia', community: 'Una comunidad', alone: 'Por ahora solo/a' } },
  EASY_26_CASH: { title: '¿Cómo se siente tu caja hoy?', options: { healthy: 'Ordenada', tight: 'Ajustada', uncertain: 'Incierta', stress: 'Me preocupa' } },
  EASY_27_CONTENT_PLAN: { title: '¿Pensaste cómo vas a comunicar lo que hacés?', options: { plan: 'Sí, tengo un plan', idea: 'Ideas sueltas', learn: 'Tengo que aprender', no: 'No todavía' } },
  EASY_27_REFERRALS: { title: '¿Pedís recomendaciones a clientes satisfechos?', options: { always: 'Siempre', sometimes: 'A veces', rarely: 'Casi nunca', never: 'Nunca' } },
  EASY_28_TOOLS: { title: '¿Qué herramientas pensás usar para arrancar?', options: { whatsapp: 'WhatsApp', spreadsheet: 'Planilla', platforms: 'Plataformas (Tienda, etc.)', not_sure: 'No lo definí' } },
  EASY_28_TIME_DRAIN: { title: '¿Qué te genera más pérdida de tiempo?', options: { messages: 'Responder mensajes', admin: 'Administración', delivery: 'Entregas o coordinación', rework: 'Corregir errores' } },
  EASY_29_PASSION: { title: '¿Qué te mueve más a hacer esto?', options: { income: 'Generar ingresos', freedom: 'Libertad personal', passion: 'Hacer lo que me gusta', impact: 'Generar impacto' } },
  EASY_29_WEBSITE: { title: '¿Tu web o perfil tiene una acción clara para el visitante?', options: { yes: 'Sí, sabe qué hacer', some: 'Podría ser más claro', no: 'No mucho', none: 'No tengo web o perfil activo' } },
  EASY_30_FIRST_ANALYSIS: { title: '¿Qué querés ver primero en tu análisis?', options: { opportunities: 'Radar de oportunidades', mission: 'Misión para hoy', prediction: 'Predicción de competencia', insights: 'Ideas concretas para crecer', competition: 'Análisis de competencia' } },

  PIVOT_VALUE_LOSS: {
    title: '¿Dónde se pierde más valor hoy en el negocio?',
    options: {
      arrival: 'Llegada (no llegan suficientes prospectos)',
      inquiry: 'Consulta (preguntan pero no avanzan)',
      price: 'Precio (se caen al ver el valor)',
      purchase: 'Compra (intentan comprar y no concretan)',
      repeat: 'Recompra (compran una vez y no vuelven)',
      operation: 'Operación (entregar cuesta caro o falla)',
    },
  },
};

// Etiquetas de campos generales del setup (no preguntas EASY)
export const FIELD_LABELS: Record<string, string> = {
  area_id: 'Área del negocio',
  answers: 'Respuestas',
  setup_mode: 'Modo de setup',
  country_code: 'País',
  business_name: 'Nombre del negocio',
  completed_at: 'Completado el',
  question_index: 'Pregunta actual',
  business_type_id: 'Tipo de negocio',
  business_type_label: 'Tipo de negocio (etiqueta)',
  source_preference: 'Origen de los datos',
  integrations_profiled: 'Integraciones detectadas',
  business_stage: 'Etapa del negocio',
  goal_90d: 'Objetivo a 90 días',
  blocker: 'Qué lo frena',
  what_you_do: 'Qué hace el negocio',
  enrich_what: 'Qué hace (texto libre)',
  enrich_goal: 'Objetivo (texto libre)',
  enrich_blocker: 'Qué te frena (texto libre)',
};

// Valores comunes en español
export const VALUE_LABELS: Record<string, string> = {
  complete: 'Completo',
  incomplete: 'Incompleto',
  quick: 'Rápido (12 preguntas)',
  full: 'Completo (30 preguntas)',
  manual: 'Cargado manualmente',
  ai: 'Detectado por IA',
  google: 'Google',
  social: 'Redes sociales',
  reviews: 'Reseñas',
  payments: 'Pagos',
  other: 'Otro',
  planning: 'Planeando los próximos pasos',
  active: 'Negocio activo',
  idea: 'Idea inicial',
  exploring: 'Explorando',
};

const COUNTRY_LABELS: Record<string, string> = {
  AR: 'Argentina 🇦🇷', CL: 'Chile 🇨🇱', UY: 'Uruguay 🇺🇾', PY: 'Paraguay 🇵🇾',
  MX: 'México 🇲🇽', CO: 'Colombia 🇨🇴', PE: 'Perú 🇵🇪', EC: 'Ecuador 🇪🇨',
  CR: 'Costa Rica 🇨🇷', PA: 'Panamá 🇵🇦', ES: 'España 🇪🇸',
};

export function labelForField(key: string): string {
  const k = key.toLowerCase();
  if (FIELD_LABELS[k]) return FIELD_LABELS[k];
  return key.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function labelForQuestion(id: string): string | null {
  const q = QUESTION_LABELS[id];
  if (!q) return null;
  return q.title;
}

export function labelForAnswer(questionId: string, value: any): string | null {
  if (value == null) return null;
  const q = QUESTION_LABELS[questionId];
  if (q?.options) {
    const v = String(value).toLowerCase();
    if (q.options[v]) return q.options[v];
    if (q.options[String(value)]) return q.options[String(value)];
  }
  return null;
}

export function labelForValue(field: string, value: any): string | null {
  if (value == null || value === '') return null;
  if (field === 'country_code' && typeof value === 'string') {
    return COUNTRY_LABELS[value.toUpperCase()] || value.toUpperCase();
  }
  if (typeof value === 'string') {
    const v = value.toLowerCase();
    if (VALUE_LABELS[v]) return VALUE_LABELS[v];
  }
  return null;
}

export function formatDateEs(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}
