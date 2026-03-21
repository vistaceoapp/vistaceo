import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// LATAM-wide content - no country-specific targeting
const DEFAULT_REGION = 'LATAM';

// CRITICAL: Use the CANONICAL domains, never .lovable.app
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';
const BLOG_DOMAIN = 'https://blog.vistaceo.com';

// Pillars mapping
const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA y Tecnología', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  tendencias: { label: 'Tendencias y Oportunidades', emoji: '📈' },
};

// 12-Cluster system - maps pillar to specific category
const BLOG_CLUSTERS: Record<string, { label: string; emoji: string; pillar: string }> = {
  'empleo-habilidades': { label: 'Empleo y Habilidades', emoji: '💼', pillar: 'empleo' },
  'ia-para-pymes': { label: 'IA para PyMEs', emoji: '🤖', pillar: 'ia_aplicada' },
  'servicios-profesionales-rentabilidad': { label: 'Servicios Profesionales', emoji: '📋', pillar: 'servicios' },
  'marketing-crecimiento': { label: 'Marketing y Crecimiento', emoji: '📈', pillar: 'tendencias' },
  'finanzas-cashflow': { label: 'Finanzas y Cashflow', emoji: '💰', pillar: 'servicios' },
  'operaciones-procesos': { label: 'Operaciones y Procesos', emoji: '⚙️', pillar: 'ia_aplicada' },
  'ventas-negociacion': { label: 'Ventas y Negociación', emoji: '🤝', pillar: 'servicios' },
  'liderazgo-management': { label: 'Liderazgo y Management', emoji: '🎯', pillar: 'liderazgo' },
  'estrategia-latam': { label: 'Estrategia LATAM', emoji: '🌎', pillar: 'emprender' },
  'herramientas-productividad': { label: 'Herramientas y Productividad', emoji: '🛠️', pillar: 'ia_aplicada' },
  'data-analytics': { label: 'Data y Analytics', emoji: '📊', pillar: 'ia_aplicada' },
  'tendencias-ia-tech': { label: 'Tendencias IA y Tech', emoji: '🚀', pillar: 'tendencias' },
};

// Get category clusters for a pillar
function getClustersForPillar(pillar: string): string[] {
  return Object.entries(BLOG_CLUSTERS)
    .filter(([_, info]) => info.pillar === pillar)
    .map(([key]) => key);
}

// CATEGORY-TOPIC MATCHING RULES — EXHAUSTIVE keyword map for precise categorization
// Each category has weighted keywords: [weight, keyword] pairs
const CATEGORY_KEYWORD_MAP: Record<string, string[]> = {
  'empleo-habilidades': [
    'empleo', 'trabajo', 'cv', 'curriculum', 'entrevista', 'carrera', 'habilidades', 'talento',
    'sueldo', 'salario', 'freelance', 'remoto', 'contratación', 'recruiter', 'linkedin perfil',
    'portfolio', 'mercado laboral', 'búsqueda de empleo', 'primer empleo', 'cambio de carrera',
    'reconversión profesional', 'perfil profesional', 'habilidades blandas', 'soft skills',
    'empresa caótica', 'empresa bien gestionada', 'aceptar empleo', 'rol en datos',
    'negociar sueldo', 'oferta laboral', 'empleos demandados', 'perfiles demandados',
    'título tech', 'contratable', 'experiencia transferible', 'trabajos que crecen con ia',
    'upskilling', 'reskilling', 'burnout laboral', 'clima laboral', 'rotación personal',
    'onboarding empleo', 'culture fit', 'trabajo híbrido', 'nómada digital',
  ],
  'ia-para-pymes': [
    'ia para pymes', 'ia para negocio', 'inteligencia artificial negocio', 'chatbot negocio',
    'chatgpt para negocios', 'chatgpt para marketing', 'ia para ecommerce', 'ia para restaurantes',
    'ia para inmobiliarias', 'ia para abogados', 'ia para educación', 'ia para atención al cliente',
    'automatizar con ia', 'implementar ia', 'ia práctica', 'machine learning pymes',
    'ia para responder whatsapp', 'chatbot whatsapp business', 'bot de whatsapp',
    'ia seguimiento clientes', 'ia calificar leads', 'ia atención cliente 24/7',
    'ia guiones de ventas', 'whatsapp crm automatización', 'automatizar whatsapp ventas',
    'chatbot ia para negocios', 'ia para pequeñas empresas',
  ],
  'servicios-profesionales-rentabilidad': [
    'servicios profesionales', 'consultoría', 'agencia', 'freelancer a empresa',
    'rentabilidad servicios', 'honorarios', 'propuesta servicios', 'consultor independiente',
    'cotizar servicios', 'pricing servicios', 'escalar servicios', 'firma profesional',
    'pasar de freelance a empresa', 'modelo de servicio', 'retainer', 'servicio recurrente',
  ],
  'marketing-crecimiento': [
    'marketing', 'marketing digital', 'contenido marketing', 'redes sociales', 'marca personal',
    'branding', 'crecimiento orgánico', 'clientes nuevos', 'embudo', 'funnel', 'seo',
    'publicidad digital', 'ads', 'campaña marketing', 'engagement', 'comunidad online',
    'growth hacking', 'inbound marketing', 'email marketing', 'copywriting',
    'marketing no trae clientes', 'captación de leads', 'marketing pymes',
    'contenido que convierte', 'estrategia de contenidos', 'redes para negocios',
  ],
  'finanzas-cashflow': [
    'finanzas', 'cash flow', 'flujo de caja', 'costos', 'precio', 'margen',
    'inversión', 'presupuesto', 'deuda', 'crédito', 'impuestos', 'facturación',
    'fugas de dinero', 'ahorro empresarial', 'cashflow', 'rentabilidad financiera',
    'finanzas pymes', 'contabilidad', 'capital de trabajo', 'punto de equilibrio',
    'cobrar más', 'cobrar mejor', 'morosidad', 'financiamiento', 'inflación negocios',
  ],
  'operaciones-procesos': [
    'operaciones', 'procesos', 'sistemas operativos', 'eficiencia operativa',
    'workflow', 'automatizar procesos', 'logística', 'inventario', 'supply chain',
    'cadena de suministro', 'playbook', 'sop', 'procedimientos', 'orden interno',
    'mejora continua', 'lean', 'kaizen', 'six sigma', 'estandarizar procesos',
    'procesos internos', 'operaciones pyme', 'documentar procesos', 'cultura ejecución',
    'equipo no avanza', 'equipo trabaja mucho',
  ],
  'ventas-negociacion': [
    'ventas', 'vender', 'negociar', 'cerrar ventas', 'prospecto', 'pipeline ventas',
    'cotización', 'propuesta comercial', 'objeciones', 'cierre de ventas',
    'proceso de ventas', 'b2b ventas', 'b2c ventas', 'cold calling', 'prospección',
    'script de ventas', 'presentación comercial', 'negociación',
    'prompts para ventas', 'ia para ventas', 'agentes de ia para ventas',
  ],
  'liderazgo-management': [
    'liderazgo', 'líder', 'equipo', 'management', 'gestión equipo', 'cultura organizacional',
    'onboarding equipo', 'motivación equipo', 'delegación', 'feedback equipo',
    'reuniones efectivas', 'hábitos de liderazgo', 'tomar decisiones', 'management pyme',
    'cultura de ejecución', 'primera semana', 'construir equipo', 'retener talento',
    'liderazgo latam', 'liderazgo remoto', 'comunicación equipo',
  ],
  'estrategia-latam': [
    'estrategia', 'latam', 'latinoamérica', 'expansión regional', 'escalar negocio',
    'modelo de negocio', 'competencia mercado', 'oportunidad mercado', 'internacionalización',
    'negocios locales', 'emprender latam', 'startup latam', 'pyme latam',
    'estrategia regional', 'mercado latinoamericano', 'economía latam', 'negocio local inteligente',
    'soberanía datos latinoamérica',
  ],
  'herramientas-productividad': [
    'herramientas', 'productividad', 'apps productividad', 'software', 'plataforma',
    'gestión del tiempo', 'organización personal', 'notion', 'trello', 'asana',
    'calendario productividad', 'hábitos productivos', 'eficiencia personal',
    'stack tecnológico', 'herramientas pymes', 'ia para excel', 'ia para presentaciones',
    'ia para resumir pdf', 'chatpdf', 'ia estudiar', 'ia para redactar correos',
    'ia para redactar contratos', 'copilot microsoft', 'make tutorial', 'zapier tutorial',
    'n8n tutorial', 'n8n vs make vs zapier', 'zapier vs make', 'automatizar emails',
    'automatizar crm', 'automatizar reportes', 'webhooks n8n', 'n8n self hosted',
    'make escenarios', 'automatización no code', 'automatización pymes',
    'prompt engineering', 'mejores prompts', 'prompts para marketing', 'prompts para linkedin',
    'prompts para instagram', 'escribir mejor con ia',
  ],
  'data-analytics': [
    'data', 'analytics', 'métricas', 'kpi', 'dashboard', 'reporte datos',
    'indicadores negocio', 'medir resultados', 'análisis de datos', 'business intelligence',
    'tableau', 'excel avanzado', 'ia analizar datos excel', 'data driven',
    'bases de datos vectoriales', 'embeddings', 'rag inteligencia artificial',
    'llamaindex', 'langchain', 'big data pymes',
  ],
  'tendencias-ia-tech': [
    'tendencias', 'futuro', 'innovación tecnología', 'disrupción', 'startup tech',
    'transformación digital', 'tendencias ia', 'futuro ia', 'modelos multimodales',
    'agentes de ia', 'agentes autónomos', 'multiagentes', 'orquestación agentes',
    'langgraph', 'crewai', 'autogen', 'semantic kernel', 'openai swarm',
    'chatgpt en español', 'chatgpt gratis', 'chatgpt iniciar sesión',
    'gemini vs chatgpt', 'gemini advanced precio', 'claude vs chatgpt',
    'claude sonnet español', 'deepseek español', 'deepseek vs chatgpt',
    'perplexity ai vs google', 'grok ai', 'alternativas a chatgpt',
    'sora 2', 'heygen español', 'elevenlabs español', 'clonar voz ia',
    'crear video con ia', 'ia para videos productos', 'ia para reels',
    'ia subtítulos automáticos', 'avatar ia', 'ia crear imágenes gratis',
    'generador imágenes ia', 'midjourney', 'flux ai', 'ia para logos',
    'ia diseño flyers', 'ia editar fotos', 'ia mejorar calidad imagen',
    'prompts imágenes realistas', 'ciberseguridad ia', 'nuevo perfil profesional',
    'ia para videos', 'tendencias 2026', 'tecnología 2026',
  ],
};

// ENHANCED: Select category based on deep content analysis (title + keyword + secondary_keywords + content analysis)
function selectCategoryForTopic(topic: { 
  title_base: string; 
  pillar: string; 
  intent?: string | null; 
  primary_keyword?: string | null;
  secondary_keywords?: string[] | null;
  category?: string | null;
}): string {
  // If topic already has a category set, trust it
  if (topic.category && BLOG_CLUSTERS[topic.category]) {
    return topic.category;
  }
  
  const text = [
    topic.title_base,
    topic.intent || '',
    topic.primary_keyword || '',
    ...(topic.secondary_keywords || []),
  ].join(' ').toLowerCase();
  
  let bestCategory = '';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        // Multi-word keywords score higher (more specific = more valuable)
        const wordCount = kw.split(' ').length;
        score += wordCount * 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Fallback: use pillar-based default
  if (!bestCategory) {
    const pillarDefaults: Record<string, string> = {
      empleo: 'empleo-habilidades',
      ia_aplicada: 'ia-para-pymes',
      liderazgo: 'liderazgo-management',
      servicios: 'servicios-profesionales-rentabilidad',
      emprender: 'estrategia-latam',
      tendencias: 'tendencias-ia-tech',
    };
    bestCategory = pillarDefaults[topic.pillar] || 'tendencias-ia-tech';
  }
  
  return bestCategory;
}

// POST-GENERATION CATEGORY VALIDATION: Re-analyze final content to confirm category
function validateAndCorrectCategory(
  content: string, 
  title: string, 
  currentCategory: string
): string {
  const fullText = `${title} ${content.substring(0, 3000)}`.toLowerCase();
  
  let bestCategory = '';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORD_MAP)) {
    let score = 0;
    for (const kw of keywords) {
      // Count occurrences in the full text
      const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = fullText.match(regex);
      if (matches) {
        score += matches.length * kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Only override if the new category has a significantly higher score
  if (bestCategory && bestCategory !== currentCategory && bestScore > 10) {
    console.log(`[generate-blog-post] Category corrected: ${currentCategory} → ${bestCategory} (score: ${bestScore})`);
    return bestCategory;
  }
  
  return currentCategory;
}

// ═══════════════════════════════════════════
// FORMAT ENGINE: 10 article formats
// ═══════════════════════════════════════════

interface ArticleFormat {
  id: string;
  name: string;
  when: string;
  sections: string[];
  contentTypes: string[];
}

const ARTICLE_FORMATS: ArticleFormat[] = [
  {
    id: 'manual-operacion',
    name: 'Manual de Operación',
    when: 'proceso, implementación, paso a paso, cómo hacer',
    sections: ['La meta en una frase', 'Resumen rápido', 'Lo mínimo antes de arrancar', 'Paso a paso numerado', 'La traba típica y cómo evitarla', 'Indicador de éxito', 'Plantilla lista para usar', 'Preguntas frecuentes', 'Próximos pasos'],
    contentTypes: ['proceso', 'implementación'],
  },
  {
    id: 'escaner-negocio',
    name: 'Escáner de Negocio',
    when: 'diagnóstico, problema, síntoma, evaluar, medir',
    sections: ['Señales de alerta', 'La pregunta clave', 'Dónde se va la plata o el tiempo', 'Test rápido Sí/No', 'Interpretación por niveles', 'Acción en 24 horas', 'Plan de 30 días', 'Qué mirar cada semana', 'Preguntas frecuentes'],
    contentTypes: ['diagnóstico', 'evaluación'],
  },
  {
    id: 'filtro-anti-humo',
    name: 'Filtro Anti-Humo',
    when: 'herramienta, tendencia, moda, promesa, tecnología nueva, evaluar herramienta',
    sections: ['Veredicto en 20 segundos', 'Para quién sí y para quién no', 'Qué problema real resuelve', 'Lo que prometen vs lo que pasa', 'Dificultad real de implementación', '3 usos reales en una PyME', 'Costos visibles e invisibles', 'Prueba mínima de 60 minutos', 'Alternativas si no te cierra', 'Próximos pasos'],
    contentTypes: ['tendencia', 'herramienta', 'evaluación'],
  },
  {
    id: 'cambio-de-lente',
    name: 'Cambio de Lente',
    when: 'liderazgo, cultura, mentalidad, hábito, creencia, mito, paradigma',
    sections: ['La frase que nos frena', 'El costo de seguir igual', 'La idea nueva', 'Antes vs Después', 'Cómo bajarlo a una regla de equipo', 'Resistencia que vas a escuchar', 'Reto práctico de una semana', 'Preguntas frecuentes'],
    contentTypes: ['mentalidad', 'liderazgo', 'cultura'],
  },
  {
    id: 'anatomia-resultado',
    name: 'Anatomía de un Resultado',
    when: 'caso real, éxito, error, experiencia, historia, resultado',
    sections: ['La foto final con números', 'Qué detonó el cambio', 'Las 3 decisiones que movieron la aguja', 'Lo que salió mal', 'Qué se puede copiar', 'Qué no conviene copiar', 'Indicadores que miraron', 'Tu auditoría rápida', 'Tu primer movimiento'],
    contentTypes: ['caso real', 'experiencia'],
  },
  {
    id: 'comparativa-clara',
    name: 'Comparativa Clara',
    when: 'comparar, elegir, vs, alternativas, opciones, mejor',
    sections: ['Las dos opciones en una frase', 'Contexto: por qué esta decisión importa', 'Opción A a fondo', 'Opción B a fondo', 'Comparativa punto por punto', 'Recomendación por escenario', 'Errores comunes al elegir', 'Próximos pasos'],
    contentTypes: ['comparativa', 'decisión'],
  },
  {
    id: 'guia-decision',
    name: 'Guía de Decisión',
    when: 'decidir, priorizar, elegir, recursos limitados, presupuesto',
    sections: ['El dilema real', 'Los factores que importan', 'Matriz simple de decisión', 'Regla de desempate', 'Qué pasa si elegís mal', 'El camino más seguro', 'Preguntas frecuentes', 'Próximos pasos'],
    contentTypes: ['decisión', 'estrategia'],
  },
  {
    id: 'plan-7-dias',
    name: 'Plan de 7 Días',
    when: 'rápido, sprint, arrancar, motivación, primera semana, empezar',
    sections: ['El objetivo del sprint', 'Lo que necesitás antes de arrancar', 'Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7', 'Qué medir al final', 'Siguiente sprint'],
    contentTypes: ['plan', 'acción rápida'],
  },
  {
    id: 'biblioteca-plantillas',
    name: 'Biblioteca de Plantillas',
    when: 'plantilla, template, modelo, recurso, herramienta práctica, descargar',
    sections: ['Para qué sirven estas plantillas', 'Plantilla 1 con ejemplo completado', 'Plantilla 2 con ejemplo completado', 'Plantilla 3 con ejemplo completado', 'Cómo adaptarlas a tu negocio', 'Errores al usar plantillas', 'Próximos pasos'],
    contentTypes: ['recurso', 'plantilla'],
  },
  {
    id: 'preguntas-incomodas',
    name: 'Preguntas Incómodas',
    when: 'estrategia, claridad, reflexión, autoengaño, rumbo, foco',
    sections: ['Por qué hacerte estas preguntas', 'Las 7-10 preguntas duras', 'Señales de autoengaño', 'Cómo responder con honestidad', 'Plan de enfoque con las respuestas', 'Preguntas frecuentes', 'Próximos pasos'],
    contentTypes: ['estrategia', 'reflexión'],
  },
  {
    id: 'mapa-de-ruta',
    name: 'Mapa de Ruta',
    when: 'plan, roadmap, trimestre, semestre, largo plazo, escalar, fase, etapa',
    sections: ['Dónde estás hoy', 'Dónde querés llegar', 'Fase 1: Cimientos (semana 1-4)', 'Fase 2: Tracción (mes 2-3)', 'Fase 3: Escala (mes 4-6)', 'Indicadores por fase', 'Trampas comunes en cada fase', 'Tu primer movimiento hoy'],
    contentTypes: ['plan', 'roadmap', 'escalar'],
  },
  {
    id: 'caja-de-herramientas',
    name: 'Caja de Herramientas',
    when: 'stack, herramientas, apps, software, ecosistema, toolkit, tecnología',
    sections: ['El problema que resuelve este stack', 'Herramienta 1: qué hace y cómo se usa', 'Herramienta 2: qué hace y cómo se usa', 'Herramienta 3: qué hace y cómo se usa', 'Cómo conectarlas entre sí', 'Stack mínimo vs stack completo', 'Costos reales mensuales', 'Alternativas gratuitas', 'Próximos pasos'],
    contentTypes: ['herramienta', 'stack', 'toolkit'],
  },
  // ═══ NEW ULTRA-DYNAMIC FORMATS ═══
  {
    id: 'diagnostico-inteligente',
    name: 'Diagnóstico Inteligente',
    when: 'problema, detectar, señal, alerta, falla, debilidad, riesgo',
    sections: ['El problema real', 'Señales que lo confirman', 'Diagnóstico preciso', 'Acciones inmediatas (primeras 24h)', 'Errores comunes al intentar resolverlo', 'Cómo medir si estás mejorando', 'Cómo lo resolvería VISTACEO'],
    contentTypes: ['diagnóstico', 'problema'],
  },
  {
    id: 'simulacion-empresarial',
    name: 'Simulación Empresarial',
    when: 'escenario, simulación, qué pasa si, proyección, decisión difícil',
    sections: ['Situación inicial del negocio', 'Decisión A y su resultado probable', 'Decisión B y su resultado probable', 'Decisión C y su resultado probable', 'Análisis comparativo', 'Recomendación estratégica según perfil', 'Tu siguiente paso'],
    contentTypes: ['simulación', 'escenario', 'decisión'],
  },
  {
    id: 'mision-empresarial',
    name: 'Misión Empresarial',
    when: 'misión, acción, tarea, ejecutar, sprint, hacer hoy, productividad',
    sections: ['El problema real que vas a atacar', 'Contexto y por qué importa ahora', 'Misiones para hoy (3 acciones concretas)', 'Misiones para los próximos 7 días', 'Resultado esperado si ejecutás todo', 'Cómo automatizarlo con VISTACEO'],
    contentTypes: ['misión', 'acción', 'ejecución'],
  },
  {
    id: 'radar-estrategias',
    name: 'Radar de Estrategias',
    when: 'estrategia, opción, camino, alternativa, rumbo, dirección',
    sections: ['Situación actual del negocio', 'Estrategia 1 con pros y contras', 'Estrategia 2 con pros y contras', 'Estrategia 3 con pros y contras', 'Cuál elegir según tu perfil', 'Plan de implementación de la elegida', 'Indicadores de éxito'],
    contentTypes: ['estrategia', 'decisión'],
  },
  {
    id: 'anatomia-error',
    name: 'Anatomía de un Error',
    when: 'error, fallo, trampa, equivocación, mito, creencia falsa',
    sections: ['El error en una frase', 'Por qué ocurre (la raíz)', 'Consecuencias reales en números', 'Cómo detectarlo a tiempo', 'La alternativa correcta paso a paso', 'Checklist de prevención', 'Preguntas frecuentes'],
    contentTypes: ['error', 'aprendizaje'],
  },
  {
    id: 'toolkit-empresarial',
    name: 'Toolkit Empresarial',
    when: 'kit, recursos, herramientas, colección, pack, bundle',
    sections: ['Problema que resuelve este toolkit', 'Herramienta 1 con ejemplo práctico', 'Herramienta 2 con ejemplo práctico', 'Herramienta 3 con ejemplo práctico', 'Herramienta 4 con ejemplo práctico', 'Comparativa rápida por tamaño de negocio', 'Recomendación final según perfil', 'Próximos pasos'],
    contentTypes: ['herramientas', 'recursos'],
  },
  {
    id: 'checklist-accionable',
    name: 'Checklist Accionable',
    when: 'checklist, verificar, auditoría, revisar, lista, control',
    sections: ['Para qué sirve esta checklist', 'Antes de empezar', 'Checklist completa (15-20 ítems)', 'Los 5 ítems más críticos', 'Qué hacer con los que no cumplís', 'Frecuencia de revisión recomendada', 'Próximos pasos'],
    contentTypes: ['checklist', 'auditoría'],
  },
  {
    id: 'manual-sector',
    name: 'Manual Práctico por Sector',
    when: 'restaurante, consultorio, agencia, tienda, estudio, clínica, sector',
    sections: ['El contexto de este sector', 'Los 3 problemas más comunes', 'Solución práctica para cada uno', 'Métricas clave del sector', 'Herramientas recomendadas para este sector', 'Errores típicos del sector', 'Plan de acción personalizado', 'Próximos pasos'],
    contentTypes: ['sector', 'nicho'],
  },
  {
    id: 'mapa-decisiones',
    name: 'Mapa de Decisiones',
    when: 'flujo, árbol, decisión, si esto entonces, condicional',
    sections: ['La decisión central', 'Pregunta 1: ¿Tenés X?', 'Si sí → Camino A', 'Si no → Camino B', 'Pregunta 2: ¿Querés Y?', 'Resultado por cada combinación', 'Tu camino recomendado', 'Primer paso según tu respuesta'],
    contentTypes: ['decisión', 'flujo'],
  },
  {
    id: 'tendencias-futuras',
    name: 'Tendencias Futuras',
    when: 'tendencia, futuro, 2025, 2026, predicción, próximo, viene',
    sections: ['El panorama actual', 'Tendencia 1 y su impacto', 'Tendencia 2 y su impacto', 'Tendencia 3 y su impacto', 'Quién gana y quién pierde', 'Cómo prepararte ahora', 'Las 3 acciones que podés tomar hoy', 'Próximos pasos'],
    contentTypes: ['tendencia', 'futuro'],
  },
  {
    id: 'errores-comunes',
    name: 'Errores Comunes y Soluciones',
    when: 'errores, problemas, fallas, no funciona, por qué falla',
    sections: ['Por qué importa evitar estos errores', 'Error 1: descripción y solución', 'Error 2: descripción y solución', 'Error 3: descripción y solución', 'Error 4: descripción y solución', 'Error 5: descripción y solución', 'Patrón común detrás de estos errores', 'Checklist de prevención', 'Próximos pasos'],
    contentTypes: ['errores', 'soluciones'],
  },
  {
    id: 'framework-estrategico',
    name: 'Framework Estratégico',
    when: 'framework, modelo, sistema, metodología, estructura, método',
    sections: ['Qué problema resuelve este framework', 'Los pilares del framework', 'Pilar 1 con ejemplo real', 'Pilar 2 con ejemplo real', 'Pilar 3 con ejemplo real', 'Cómo implementarlo en 5 pasos', 'Errores al aplicar frameworks', 'Adaptación según tu negocio', 'Próximos pasos'],
    contentTypes: ['framework', 'metodología'],
  },
  {
    id: 'playbook-implementacion',
    name: 'Playbook de Implementación',
    when: 'implementar, instalar, configurar, montar, lanzar, desplegar',
    sections: ['El objetivo final', 'Requisitos previos', 'Fase 1: Preparación', 'Fase 2: Configuración', 'Fase 3: Prueba', 'Fase 4: Lanzamiento', 'Fase 5: Optimización', 'Métricas de éxito', 'Troubleshooting común', 'Próximos pasos'],
    contentTypes: ['implementación', 'playbook'],
  },
];

// Select format based on topic content + variety
function selectFormatForTopic(
  topic: { title_base: string; intent?: string | null; pillar: string },
  recentFormats: string[]
): ArticleFormat {
  const text = `${topic.title_base} ${topic.intent || ''}`.toLowerCase();
  
  // Score each format
  const scored = ARTICLE_FORMATS.map(fmt => {
    let score = 0;
    const keywords = fmt.when.split(', ');
    for (const kw of keywords) {
      if (text.includes(kw)) score += 2;
    }
    // Penalize recently used formats
    const recentIndex = recentFormats.indexOf(fmt.id);
    if (recentIndex !== -1) score -= (5 - recentIndex); // More recent = bigger penalty
    return { format: fmt, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // Pick top scorer, or random from top 3 if tied
  const topScore = scored[0].score;
  const topFormats = scored.filter(s => s.score >= topScore - 1);
  return topFormats[Math.floor(Math.random() * Math.min(3, topFormats.length))].format;
}

// External sources by pillar (for "Para profundizar" section)
const EXTERNAL_SOURCES: Record<string, Array<{title: string, url: string, domain: string}>> = {
  empleo: [
    { title: 'Organización Internacional del Trabajo (OIT)', url: 'https://www.ilo.org/es', domain: 'ilo.org' },
    { title: 'LinkedIn Economic Graph', url: 'https://economicgraph.linkedin.com/', domain: 'linkedin.com' },
    { title: 'World Economic Forum - Future of Jobs', url: 'https://www.weforum.org/reports/the-future-of-jobs-report-2023', domain: 'weforum.org' },
  ],
  ia_aplicada: [
    { title: 'Google AI Blog', url: 'https://ai.googleblog.com/', domain: 'googleblog.com' },
    { title: 'OpenAI Research', url: 'https://openai.com/research', domain: 'openai.com' },
    { title: 'MIT Technology Review - AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/', domain: 'technologyreview.com' },
  ],
  liderazgo: [
    { title: 'Harvard Business Review', url: 'https://hbr.org/', domain: 'hbr.org' },
    { title: 'McKinsey Insights', url: 'https://www.mckinsey.com/featured-insights', domain: 'mckinsey.com' },
    { title: 'Deloitte Insights', url: 'https://www2.deloitte.com/insights/', domain: 'deloitte.com' },
  ],
  servicios: [
    { title: 'Banco Mundial - Servicios', url: 'https://www.bancomundial.org/', domain: 'bancomundial.org' },
    { title: 'CEPAL - Comisión Económica para América Latina', url: 'https://www.cepal.org/', domain: 'cepal.org' },
    { title: 'BID - Banco Interamericano de Desarrollo', url: 'https://www.iadb.org/', domain: 'iadb.org' },
  ],
  emprender: [
    { title: 'Y Combinator Resources', url: 'https://www.ycombinator.com/library', domain: 'ycombinator.com' },
    { title: 'Endeavor - Emprendimiento', url: 'https://endeavor.org/', domain: 'endeavor.org' },
    { title: 'Startup Genome', url: 'https://startupgenome.com/', domain: 'startupgenome.com' },
  ],
  tendencias: [
    { title: 'Gartner Research', url: 'https://www.gartner.com/en/research', domain: 'gartner.com' },
    { title: 'Forrester Research', url: 'https://www.forrester.com/', domain: 'forrester.com' },
    { title: 'World Economic Forum', url: 'https://www.weforum.org/', domain: 'weforum.org' },
  ],
};

interface QualityGateReport {
  passed: boolean;
  score: number;
  checks: {
    no_h1_repeated: boolean;
    real_headings: boolean;
    has_hero_image: boolean;
    has_inline_images: boolean;
    has_internal_links: boolean;
    has_external_links: boolean;
    short_paragraphs: boolean;
    sentence_case_headings: boolean;
    no_keyword_stuffing: boolean;
    min_word_count: boolean;
    has_checklist: boolean;
    has_examples: boolean;
    no_markdown_tables: boolean;
    no_broken_lines: boolean;
  };
  issues: string[];
  timestamp: string;
  rewrite_attempts: number;
  opportunity?: Record<string, unknown>;
  editorial_brief?: Record<string, unknown>;
  headline_lab?: Record<string, unknown>;
  hypotheses?: Record<string, unknown>;
  explainability?: Record<string, unknown>;
  [key: string]: unknown;
}

function clampScore(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function buildOpportunityModel(topic: any, samePillarPosts: any[], crossPillarPosts: any[], cannibalizationRisk: number) {
  const demandPotential = clampScore((topic?.priority_score || 50) + Math.min((topic?.secondary_keywords || []).length * 3, 15));
  const brandFit = clampScore(topic?.pillar ? 92 : 75);
  const ctrPotential = clampScore(70 + (/\b(cómo|guía|vs|errores|plantilla|checklist|ejemplos|mejores)\b/i.test(topic?.title_base || '') ? 16 : 6));
  const rankingPotential = clampScore(68 + Math.min((topic?.required_subtopics || []).length * 4, 20));
  const engagementPotential = clampScore(70 + Math.min((topic?.unique_angle_options || []).length * 6, 18));
  const conversionAssist = clampScore(topic?.intent === 'commercial' || topic?.intent === 'soft-transactional' ? 88 : 72);
  const clusterPower = clampScore(64 + Math.min(samePillarPosts.length * 5 + crossPillarPosts.length * 2, 28));
  const differentiation = clampScore(66 + Math.min((topic?.unique_angle_options || []).length * 8, 24) + (/latam|pymes|negocio|empresa/i.test(topic?.title_base || '') ? 6 : 0));
  const freshnessPotential = clampScore(topic?.seasonality ? 82 : 71);
  const score = clampScore(
    demandPotential * 0.14 +
    brandFit * 0.12 +
    ctrPotential * 0.12 +
    rankingPotential * 0.12 +
    engagementPotential * 0.1 +
    conversionAssist * 0.08 +
    clusterPower * 0.1 +
    differentiation * 0.14 +
    freshnessPotential * 0.08 -
    cannibalizationRisk * 0.12
  );

  let status = 'review';
  if (score < 75) status = 'rejected';
  else if (score < 85) status = 'reformulate';
  else if (score < 92) status = 'pipeline';
  else status = 'high_priority';

  return {
    score,
    status,
    reason: status === 'high_priority'
      ? 'Alta ventaja editorial, buen potencial de cluster y click.'
      : status === 'pipeline'
        ? 'Tema publicable con buena oportunidad real.'
        : status === 'reformulate'
          ? 'Necesita mejor ángulo o promesa antes de entrar al pipeline.'
          : 'No alcanza el umbral editorial mínimo.',
    demand_potential: demandPotential,
    brand_fit: brandFit,
    ctr_potential: ctrPotential,
    ranking_potential: rankingPotential,
    engagement_potential: engagementPotential,
    conversion_assist: conversionAssist,
    cluster_power: clusterPower,
    differentiation,
    freshness_potential: freshnessPotential,
    cannibalization_risk: cannibalizationRisk,
  };
}

function generateHeadlineLab(topic: any) {
  const base = topic?.title_base || 'Nueva guía';
  const kw = topic?.primary_keyword || base;
  const seoTitles = [
    base,
    `Cómo ${kw} sin perder tiempo ni plata`,
    `${base}: guía práctica para LATAM`,
    `${kw}: errores, ejemplos y pasos reales`,
    `${base} en ${new Date().getFullYear()}`,
  ];
  const emotionalTitles = [
    `Si ${kw} te está frenando, empezá por acá`,
    `La forma más clara de entender ${kw}`,
    `Lo que nadie te explica bien sobre ${kw}`,
  ];
  const specificTitles = [
    `${kw}: qué hacer hoy, esta semana y este mes`,
    `${kw} para PyMEs: criterios concretos para decidir`,
    `${kw}: guía con ejemplos reales y errores comunes`,
  ];
  const curiosityTitles = [
    `El cambio silencioso detrás de ${kw}`,
    `Por qué muchas empresas fallan con ${kw}`,
    `Qué cambia de verdad cuando mejorás ${kw}`,
  ];
  const businessTitles = [
    `${kw}: impacto en ventas, tiempo y foco`,
    `${kw}: cómo convertirlo en ventaja competitiva`,
  ];
  const painTitles = [
    `¿${kw} te está costando más de lo que pensás?`,
    `El error más caro al resolver ${kw}`,
  ];
  const winner = seoTitles[0];
  return {
    winner,
    winner_reason: 'Combina claridad, intención explícita, promesa concreta y buen potencial de CTR sin sonar a plantilla.',
    meta_description: `Entendé ${kw} con enfoque práctico para LATAM: criterios, errores comunes, ejemplos y próximos pasos para decidir mejor.`,
    seo_titles: seoTitles,
    emotional_titles: emotionalTitles,
    specific_titles: specificTitles,
    curiosity_titles: curiosityTitles,
    business_titles: businessTitles,
    pain_titles: painTitles,
    discarded_titles: [...seoTitles.slice(1), ...emotionalTitles, ...specificTitles, ...curiosityTitles, ...businessTitles, ...painTitles],
  };
}

function buildEditorialBrief(topic: any, format: any, samePillarPosts: any[], crossPillarPosts: any[]) {
  const primaryKeyword = topic?.primary_keyword || topic?.title_base || '';
  return {
    keyword_principal: primaryKeyword,
    keywords_secundarias: topic?.secondary_keywords || [],
    entidades_semanticas_clave: [primaryKeyword, ...(topic?.required_subtopics || [])].filter(Boolean).slice(0, 8),
    intencion_principal: topic?.intent || 'informational',
    intenciones_secundarias: ['resolver dudas', 'comparar alternativas', 'profundizar criterio'],
    perfil_lector: 'Dueños de negocio, líderes y profesionales de habla hispana en LATAM que buscan criterio práctico, no humo.',
    problema_concreto: `La audiencia necesita entender ${primaryKeyword} con claridad, contexto y pasos accionables.`,
    promesa_exacta: `Salir de la lectura con un criterio claro para aplicar ${primaryKeyword} mejor que el promedio del mercado.`,
    angulo_diferencial: 'Contexto real LATAM + enfoque práctico + síntesis editorial superior.',
    estructura_ideal: format?.sections || [],
    nivel_profundidad: 'alto',
    tipo_de_pieza: format?.name || 'guía',
    cta_ideal: 'Descubrir la solución o módulo de VistaCEO más alineado al problema tratado.',
    enlaces_a_empujar: samePillarPosts.slice(0, 3).map((post: any) => `${BLOG_DOMAIN}/${post.slug}/`),
    enlaces_a_recibir: crossPillarPosts.slice(0, 2).map((post: any) => `${BLOG_DOMAIN}/${post.slug}/`),
    oportunidades: {
      snippet: true,
      faq: true,
      tabla: false,
      checklist: true,
      comparativa: /vs|compar/i.test(topic?.title_base || ''),
      grafico_visual: true,
    },
  };
}

function buildHypotheses(topic: any, opportunity: any) {
  return {
    ctr: `El tema debería ganar clic por una promesa clara, especificidad alta y foco en ${topic?.primary_keyword || topic?.title_base}.`,
    ranking: `La pieza puede rankear si cubre intención principal + subtemas esperables + enlaces de cluster alrededor de ${topic?.pillar}.`,
    engagement: 'Esperamos buena profundidad de lectura si la intro confirma intención rápido y los ejemplos aterrizan el problema.',
    next_action: opportunity?.score >= 92 ? 'Empujar interlinking y monitorear CTR inicial.' : 'Observar CTR y reforzar apertura si queda tibia.',
  };
}

function buildExplainability(topic: any, opportunity: any, qualityGateFocus: string[]) {
  return {
    why_topic_chosen: `Se eligió por su score de oportunidad ${opportunity?.score || 0}/100, su encaje con ${topic?.pillar || 'el cluster'} y su potencial de resolver una intención clara.`,
    why_rejected: opportunity?.score < 75 ? 'Tema descartado por baja oportunidad editorial.' : null,
    expected_to_measure: ['CTR orgánico', 'tiempo de lectura', 'scroll depth', 'interlinking asistido', 'queries emergentes'],
    gate_focus: qualityGateFocus,
  };
}

const LEGACY_UNIVERSAL_SECTIONS = [
  'En 2 minutos',
  'Para quién es (y para quién no)',
  'La idea clave',
  'Qué cambia en la práctica',
  'Próximos 3 pasos',
  'Para profundizar',
];

const GENERIC_FAQ_HEADING_PATTERNS = [
  /^###\s+¿Qué es .*\?\s*$/i,
  /^###\s+¿Cómo empezar con .*\?\s*$/i,
  /^###\s+¿Necesito herramientas especiales\?\s*$/i,
];

function tokenizeMeaningful(text: string): string[] {
  const stopwords = new Set(['para', 'como', 'esta', 'este', 'esto', 'desde', 'sobre', 'entre', 'porque', 'donde', 'vista', 'vistaceo', 'blog', 'guia']);
  const matches = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[a-z0-9]+/g) || [];

  return [...new Set(matches.filter(token => token.length > 3 && !stopwords.has(token)))];
}

function computeTokenOverlap(a: string, b: string): number {
  const aTokens = tokenizeMeaningful(a);
  const bTokens = new Set(tokenizeMeaningful(b));
  if (aTokens.length === 0) return 1;
  return aTokens.filter(token => bTokens.has(token)).length / aTokens.length;
}

function buildAlignedMetaTitle(editorialTitle: string, seoCandidate?: string | null): string {
  const cleanEditorial = editorialTitle.trim();
  const cleanCandidate = (seoCandidate || '').trim();
  const chosen = cleanCandidate && computeTokenOverlap(cleanEditorial, cleanCandidate) >= 0.45
    ? cleanCandidate
    : cleanEditorial;

  if (chosen.length <= 58) return chosen;
  return `${chosen.slice(0, 55).replace(/\s+\S*$/, '').trim()}...`;
}

function buildStrictMetaDescription(editorialTitle: string, brief: any, fallback: string): string {
  const audience = 'PyMEs, líderes y equipos de LATAM';
  const differentiator = /latam/i.test(brief?.angulo_diferencial || '')
    ? 'con criterio práctico y contexto LATAM.'
    : 'con ejemplos reales y criterio accionable.';

  let description = `${editorialTitle}: guía clara para ${audience}, ${differentiator}`;

  if (description.length < 140) {
    description = `${description} Aprendé qué mirar primero, qué evitar y cómo decidir mejor.`;
  }

  if (description.length > 155) {
    description = `${description.slice(0, 152).replace(/\s+\S*$/, '').trim()}...`;
  }

  if (description.length < 120) {
    const cleanFallback = fallback.replace(/\s+/g, ' ').trim();
    description = `${description} ${cleanFallback}`.slice(0, 155).trim();
  }

  return description;
}

function detectLegacyTemplateHits(content: string): string[] {
  return LEGACY_UNIVERSAL_SECTIONS.filter(section => {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^##\\s+${escaped}\\s*$`, 'gim').test(content);
  });
}

function normalizeHeadingLabel(heading: string): string {
  return heading
    .replace(/^#{2,3}\s+/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateTemplateEntropyScore(content: string): number {
  const headings = (content.match(/^##\s+.+$/gm) || []).map(normalizeHeadingLabel);
  const headingCounts = headings.reduce<Record<string, number>>((acc, heading) => {
    acc[heading] = (acc[heading] || 0) + 1;
    return acc;
  }, {});
  const duplicateHeadingGroups = Object.values(headingCounts).filter(count => count > 1).length;
  const legacyHits = detectLegacyTemplateHits(content).length;
  const faqSections = (content.match(/^##\s+(?:Preguntas frecuentes|FAQ)\s*$/gim) || []).length;

  return clampScore(100 - legacyHits * 14 - duplicateHeadingGroups * 18 - Math.max(0, faqSections - 1) * 18);
}

function removeMarkdownSectionByHeading(content: string, headingText: string): string {
  const target = normalizeHeadingLabel(`## ${headingText}`);
  const lines = content.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (normalizeHeadingLabel(lines[i]) === target) {
      i += 1;
      while (i < lines.length && !/^##\s+/.test(lines[i])) {
        i += 1;
      }
      i -= 1;
      continue;
    }
    result.push(lines[i]);
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function removeDuplicateFaqSections(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let faqSeen = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+(?:Preguntas frecuentes|FAQ)\s*$/i.test(lines[i].trim())) {
      if (faqSeen) {
        i += 1;
        while (i < lines.length && !/^##\s+/.test(lines[i])) {
          i += 1;
        }
        i -= 1;
        continue;
      }
      faqSeen = true;
    }
    result.push(lines[i]);
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function stripRepeatedGenericFaqBlocks(content: string): { content: string; removed: number } {
  const lines = content.split('\n');
  const totalGeneric = lines.filter(line => GENERIC_FAQ_HEADING_PATTERNS.some(pattern => pattern.test(line.trim()))).length;
  if (totalGeneric <= 1) return { content, removed: 0 };

  const result: string[] = [];
  let removed = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (GENERIC_FAQ_HEADING_PATTERNS.some(pattern => pattern.test(trimmed))) {
      i += 1;
      while (i < lines.length && !/^###\s+/.test(lines[i]) && !/^##\s+/.test(lines[i])) {
        i += 1;
      }
      i -= 1;
      removed += 1;
      continue;
    }
    result.push(lines[i]);
  }

  return {
    content: result.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    removed,
  };
}

function removeEmptyFaqSections(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+(?:Preguntas frecuentes|FAQ)\s*$/i.test(lines[i].trim())) {
      const blockLines = [lines[i]];
      i += 1;
      while (i < lines.length && !/^##\s+/.test(lines[i])) {
        blockLines.push(lines[i]);
        i += 1;
      }
      i -= 1;

      if (blockLines.some(line => /^###\s+/.test(line.trim()))) {
        result.push(...blockLines);
      }
      continue;
    }

    result.push(lines[i]);
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function getJustifiedOptionalModules(topic: any, format: ArticleFormat): string[] {
  const text = `${topic?.title_base || ''} ${topic?.intent || ''} ${format?.id || ''}`.toLowerCase();
  const modules = new Set<string>();

  if (/vs|compar|alternativ|elegir|opcion/.test(text)) modules.add('comparativa');
  if (/problema|diagnostic|error|falla|riesgo/.test(text)) modules.add('diagnóstico');
  if (/como|paso a paso|implementar|configurar|operacion/.test(text)) modules.add('pasos accionables');
  if (/checklist|auditoria|verificar/.test(text)) modules.add('checklist');
  if (/plantilla|modelo|template|recurso/.test(text)) modules.add('plantilla');
  if (/caso|ejemplo|resultado/.test(text)) modules.add('caso práctico');

  if (modules.size === 0) modules.add('ningún módulo extra fijo');
  return [...modules];
}

function hashStringToInt(input: string): number {
  // Simple stable hash (djb2)
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) + input.charCodeAt(i);
    hash = hash & 0xffffffff;
  }
  return Math.abs(hash);
}

function hasMarkdownTable(content: string): boolean {
  // Detect markdown tables: header line + separator line
  const lines = content.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i].trim();
    const b = lines[i + 1].trim();
    if (!a.startsWith('|')) continue;
    if (!b.startsWith('|')) continue;
    // separator like: | --- | :---: |
    if (/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(b)) return true;
  }
  return false;
}

/**
 * Convert markdown tables to structured lists (preserves information, removes forbidden format)
 */
function convertTablesToLists(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Detect table start (header row)
    if (line.startsWith('|') && i + 1 < lines.length) {
      const nextLine = lines[i + 1]?.trim() || '';
      if (/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(nextLine)) {
        // Parse header
        const headers = line.split('|').map(c => c.trim()).filter(Boolean);
        i += 2; // Skip header + separator
        
        // Parse data rows
        const rows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const cells = lines[i].trim().split('|').map(c => c.trim()).filter(Boolean);
          rows.push(cells);
          i++;
        }
        
        // Convert to list format
        if (rows.length > 0) {
          result.push('');
          for (const row of rows) {
            const firstCell = row[0] || '';
            const details = row.slice(1).map((cell, idx) => {
              const header = headers[idx + 1] || '';
              return header ? `${header}: ${cell}` : cell;
            }).filter(d => d && d !== ':').join(' · ');
            
            result.push(`- **${firstCell}**${details ? ` — ${details}` : ''}`);
          }
          result.push('');
        }
        continue;
      }
    }
    
    result.push(lines[i]);
    i++;
  }
  
  return result.join('\n');
}

function detectBrokenFormattingIssues(content: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');

  const pipeSpamLines = lines.filter(l => (l.match(/\|/g) || []).length >= 12);
  if (pipeSpamLines.length > 0) {
    issues.push(`Found ${pipeSpamLines.length} line(s) with excessive pipes - likely malformed table`);
  }

  const fenceCount = (content.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    issues.push('Unbalanced code fences (```), likely broken markdown');
  }

  return issues;
}

interface BlogTopic {
  id: string;
  title_base: string;
  slug: string;
  pillar: string;
  intent: string;
  country_codes: string[];
  priority_score: number;
}

interface BlogPlan {
  id: string;
  topic_id: string;
  planned_date: string;
  country_code: string;
  pillar: string;
  status: string;
  publish_attempts: number;
}

// Upload base64 image to Supabase Storage and return public URL
async function uploadImageToStorage(
  base64Data: string,
  slug: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    // Extract the base64 content and mime type
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      console.log('[generate-blog-post] Invalid base64 format');
      return null;
    }
    
    const mimeType = matches[1];
    const base64Content = matches[2];
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `hero-${slug}-${Date.now()}.${extension}`;
    
    // Decode base64 to binary
    const binaryString = atob(base64Content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Upload to Supabase Storage (use apikey header, not Bearer)
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': mimeType,
          'x-upsert': 'true',
        },
        body: bytes,
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[generate-blog-post] Storage upload failed:', error);
      return null;
    }
    
    // Return public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    console.log('[generate-blog-post] Image uploaded to Storage:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[generate-blog-post] Storage upload error:', error);
    return null;
  }
}

// Pillar-specific image contexts for ultra-realistic generation
const PILLAR_IMAGE_CONTEXTS: Record<string, { scene: string; mood: string }> = {
  empleo: {
    scene: 'professional office setting, career development, job interview preparation, resume on desk',
    mood: 'ambitious, hopeful, professional growth'
  },
  ia_aplicada: {
    scene: 'modern tech workspace, laptop with data visualization, subtle AI elements, smart devices',
    mood: 'innovative, cutting-edge, human-tech harmony'
  },
  liderazgo: {
    scene: 'team meeting, strategic planning, leadership moment, mentoring session',
    mood: 'confident, inspiring, decisive'
  },
  servicios: {
    scene: 'client consultation, professional service delivery, business discussion',
    mood: 'trustworthy, expert, solution-focused'
  },
  emprender: {
    scene: 'startup environment, entrepreneur at work, business planning, growth metrics',
    mood: 'energetic, determined, visionary'
  },
  tendencias: {
    scene: 'market analysis, trend charts, business forecasting, strategic overview',
    mood: 'forward-thinking, analytical, opportunity-focused'
  }
};

// Generate hero image using Lovable AI - ULTRA REALISTIC, NO TEXT
// Returns a PUBLIC HTTPS URL (never base64)
async function generateHeroImage(
  title: string,
  pillar: string,
  slug: string,
  lovableApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    const pillarContext = PILLAR_IMAGE_CONTEXTS[pillar] || PILLAR_IMAGE_CONTEXTS.tendencias;
    
    // Ultra-realistic prompt - NO TEXT, NO LOGOS
    const prompt = `
Professional editorial photograph for a business blog article titled "${title}".

STYLE: Ultra photorealistic, professional editorial photography, cinematic natural lighting, shallow depth of field, 8K resolution, Hasselblad quality.

CONTEXT: ${pillarContext.scene}
MOOD: ${pillarContext.mood}, premium business editorial, authentic, human warmth.

SETTING: Modern Latin American office or workspace (Argentina, Mexico, Colombia style), clean and minimal, subtle blue/violet accent tones, natural daylight through windows.

CRITICAL - FORBIDDEN ELEMENTS: No text, no letters, no numbers, no logos, no watermarks, no UI elements, no screenshots, no captions, no subtitles.

PEOPLE: If people appear, show them from behind, silhouettes, hands only, or tastefully blurred. Never show identifiable faces directly.

Aspect ratio: 16:9. Ultra high resolution.
`.trim();

    console.log('[generate-blog-post] Generating ultra-realistic hero image for:', slug);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      console.log('[generate-blog-post] Image generation failed:', response.status);
      return null;
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.log('[generate-blog-post] No image in response');
      return null;
    }
    
    // CRITICAL: If the image is base64, upload to Storage
    if (imageUrl.startsWith('data:')) {
      console.log('[generate-blog-post] Detected base64 image, uploading to Storage...');
      const storageUrl = await uploadImageToStorage(imageUrl, slug, supabaseUrl, supabaseKey);
      if (storageUrl) {
        console.log('[generate-blog-post] Hero image uploaded:', storageUrl);
        return storageUrl;
      }
      console.log('[generate-blog-post] Storage upload failed, using default image');
      return null;
    }
    
    // If it's already a valid HTTPS URL, use it
    if (imageUrl.startsWith('https://')) {
      console.log('[generate-blog-post] Hero image already HTTPS:', imageUrl);
      return imageUrl;
    }
    
    console.log('[generate-blog-post] Invalid image URL format, skipping');
    return null;
  } catch (error) {
    console.error('[generate-blog-post] Image generation error:', error);
    return null;
  }
}

// ═══════════════════════════════════════════
// SANITIZE AI-GENERATED MARKDOWN
// Removes ALL raw HTML artifacts before saving
// ═══════════════════════════════════════════
function sanitizeAIGeneratedMarkdown(md: string): string {
  let clean = md;
  
  // Remove raw HTML img tags → convert to markdown
  clean = clean.replace(/<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  clean = clean.replace(/<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/gi, '![$1]($2)');
  clean = clean.replace(/<img\s+[^>]*src="([^"]+)"[^>]*\/?>/gi, '![]($1)');
  
  // Remove raw HTML anchor tags → convert to markdown
  clean = clean.replace(/<a\s+[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, '[$2]($1)');
  
  // Strip stray HTML attributes that pollute text
  clean = clean.replace(/\s*(?:loading|decoding|class|style|width|height|srcset|sizes)\s*=\s*"[^"]*"/gi, '');
  
  // Remove encoded HTML entities
  clean = clean.replace(/%3C\/?a(?:\s[^%]*)?\s*%3E/gi, '');
  clean = clean.replace(/%3C\/?(?:div|span|p|img|br)\s*(?:[^%]*)%3E/gi, '');
  
  // CRITICAL: Convert raw HTML heading tags to markdown headings
  clean = clean.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
  clean = clean.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
  clean = clean.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
  clean = clean.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1');
  clean = clean.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1');
  clean = clean.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1');
  
  // Convert raw <hr> tags to markdown
  clean = clean.replace(/<hr\s*[^>]*\/?>/gi, '\n---\n');
  
  // Remove raw HTML block tags (keep inner text)
  clean = clean.replace(/<(?:div|span|section|article|header|footer|nav|p|br)\s*[^>]*>/gi, '');
  clean = clean.replace(/<\/(?:div|span|section|article|header|footer|nav|p|br)>/gi, '');
  
  // Remove empty image/link URLs - CRITICAL: includes https:// with nothing after
  clean = clean.replace(/!\[[^\]]*\]\(\s*\)/g, '');
  clean = clean.replace(/!\[[^\]]*\]\(https?:\/\/\s*\)/g, '');
  clean = clean.replace(/!\[[^\]]*\]\(https?:\/\/[^a-zA-Z0-9][^)]*\)/g, (match) => {
    // Keep only if URL has real domain (more than just https://)
    const urlMatch = match.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (!urlMatch) return '';
    const url = urlMatch[1].trim();
    // Must have a real host (e.g. https://something.com/...)
    if (/^https?:\/\/[a-zA-Z0-9]/.test(url)) return match;
    return '';
  });
  clean = clean.replace(/\[([^\]]+)\]\(\s*\)/g, '$1');
  
  // Remove AI placeholders
  clean = clean.replace(/\[insertar\s[^\]]*\]/gi, '');
  clean = clean.replace(/\[PLACEHOLDER[^\]]*\]/gi, '');
  clean = clean.replace(/\*\*Nota del editor\*\*[^\n]*/gi, '');
  
  // Fix broken image markdown: ![alt](broken-url)rest-of-url
  clean = clean.replace(/^!\[([^\]]*)\]\(([^)]*%3[Cc][^)]*)\)(.*)$/gm, (full, alt, src, tail) => {
    const realUrl = tail.match(/https?:\/\/[^\s"'>]+\.(png|jpe?g|webp)(\?[^\s"'>]*)?/i);
    if (realUrl) return `![${alt}](${realUrl[0]})`;
    if (/^https?:\/\//i.test(src) && !/%3[Cc]/i.test(src)) return `![${alt}](${src})`;
    return '';
  });
  
  // Remove any remaining raw Supabase URLs that appear as plain text
  clean = clean.replace(/(?<!\(|!)nlewrgmcawzcdazhfiyy\.supabase\.co\/storage\/v1\/object\/public\/blog-images\/[^\s"')>]+/g, '');
  
  // CRITICAL: Remove CODE_BLOCK placeholders that may leak from processing
  // Catches: __CODE_BLOCK_0__, CODE_BLOCK_0, **CODE_BLOCK_0**, `CODE_BLOCK_0`
  clean = clean.replace(/__CODE_BLOCK_\d+__/g, '');
  clean = clean.replace(/\*{0,2}\bCODE_BLOCK[_\s]*\d+\b\*{0,2}/gi, '');
  clean = clean.replace(/`CODE_BLOCK[_\s]*\d+`/gi, '');
  
  // Remove truncated supabase URLs (e.g. nlewrgmcawzcdazhfiyy.supabase.co/st...)
  clean = clean.replace(/[a-z0-9-]+\.supabase\.co\/(?:storage|st)[^\s"'<>)]*(?:\.\.\.)?/gi, '');
  
  // Remove entire lines that are just raw HTML attribute fragments
  clean = clean.replace(/^\s*(?:alt|src|loading|class|decoding|width|height)\s*=\s*"[^"]*"\s*$/gm, '');
  
  // Remove stray closing angle brackets
  clean = clean.replace(/^\s*>\s*$/gm, '');
  
  // Clean up multiple blank lines
  clean = clean.replace(/\n{3,}/g, '\n\n');
  
  return clean;
}

// Generate inline image for content body
async function generateInlineImage(
  title: string,
  pillar: string,
  slug: string,
  lovableApiKey: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string | null> {
  try {
    const pillarContext = PILLAR_IMAGE_CONTEXTS[pillar] || PILLAR_IMAGE_CONTEXTS.tendencias;
    
    const prompt = `
Detailed professional photograph showing a practical concept related to "${title}".

SCENE: ${pillarContext.scene}, focus on hands, documents, screen (without readable text), or workspace details.
MOOD: ${pillarContext.mood}, human and authentic.

COMPOSITION: Close-up or medium shot. Shallow depth of field. Natural lighting.

CRITICAL - ABSOLUTELY FORBIDDEN: No text, no letters, no numbers, no logos, no watermarks, no UI elements, no visible words.

Latin American office context. Premium editorial quality.

Aspect ratio: 3:2. Ultra high resolution.
`.trim();

    console.log('[generate-blog-post] Generating inline image for:', slug);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const imageUrl = result.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('data:')) {
      // Upload with inline prefix
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;
      
      const mimeType = matches[1];
      const base64Content = matches[2];
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `inline-${slug}-${Date.now()}.${extension}`;
      
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/blog-images/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': mimeType,
            'x-upsert': 'true',
          },
          body: bytes,
        }
      );
      
      if (!uploadResponse.ok) return null;
      
      return `${supabaseUrl}/storage/v1/object/public/blog-images/${fileName}`;
    }
    
    return imageUrl.startsWith('https://') ? imageUrl : null;
  } catch (error) {
    console.error('[generate-blog-post] Inline image generation error:', error);
    return null;
  }
}

// Validate and fix content structure
function validateAndFixContent(content: string, title: string): { content: string; issues: string[] } {
  const issues: string[] = [];
  let fixedContent = content;

  // 1. Remove repeated H1 (title) at the start of content
  const h1Pattern = new RegExp(`^#\\s*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\n`, 'i');
  if (h1Pattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(h1Pattern, '');
    issues.push('Removed repeated H1 from content body');
  }
  
  // Also remove any H1 that matches approximately
  fixedContent = fixedContent.replace(/^#\s+[^\n]+\n\n?/, '');

  // 2. DO NOT convert bold text to headings - this was creating too many H2s
  // Bold text stays as bold text. The AI should generate proper headings directly.

  // 3. Ensure headings use sentence case (not Title Case)
  // IMPORTANT: Preserve brand names, tools, and proper nouns
  const PRESERVED_WORDS = new Set([
    // Tech brands & tools
    'zapier', 'make', 'google', 'microsoft', 'apple', 'amazon', 'meta', 'openai',
    'chatgpt', 'gemini', 'claude', 'perplexity', 'midjourney', 'canva', 'notion',
    'trello', 'asana', 'slack', 'zoom', 'hubspot', 'salesforce', 'shopify',
    'wordpress', 'woocommerce', 'stripe', 'paypal', 'mercadopago', 'excel',
    'whatsapp', 'instagram', 'linkedin', 'tiktok', 'youtube', 'facebook',
    'figma', 'miro', 'airtable', 'clickup', 'monday', 'jira', 'github',
    'copilot', 'dall-e', 'sora', 'heygen', 'elevenlabs', 'deepseek', 'grok',
    'tableau', 'power bi', 'looker', 'langchain', 'llamaindex', 'crewai',
    'autogen', 'n8n', 'integromat', 'mailchimp', 'sendinblue', 'resend',
    // Abbreviations
    'ia', 'ai', 'seo', 'crm', 'erp', 'saas', 'b2b', 'b2c', 'roi', 'kpi',
    'ceo', 'cfo', 'cto', 'hr', 'it', 'latam', 'pyme', 'pymes', 'pdf', 'api',
    'url', 'ux', 'ui', 'rrhh', 'mvp', 'okr',
    // Countries
    'argentina', 'chile', 'uruguay', 'colombia', 'méxico', 'ecuador',
    'costa rica', 'panamá', 'perú', 'brasil',
  ]);
  
  // Build a map of lowercase → proper case for preserved words
  const PROPER_CASE: Record<string, string> = {
    'zapier': 'Zapier', 'make': 'Make', 'google': 'Google', 'microsoft': 'Microsoft',
    'apple': 'Apple', 'amazon': 'Amazon', 'meta': 'Meta', 'openai': 'OpenAI',
    'chatgpt': 'ChatGPT', 'gemini': 'Gemini', 'claude': 'Claude', 'perplexity': 'Perplexity',
    'midjourney': 'Midjourney', 'canva': 'Canva', 'notion': 'Notion', 'trello': 'Trello',
    'asana': 'Asana', 'slack': 'Slack', 'zoom': 'Zoom', 'hubspot': 'HubSpot',
    'salesforce': 'Salesforce', 'shopify': 'Shopify', 'wordpress': 'WordPress',
    'stripe': 'Stripe', 'paypal': 'PayPal', 'mercadopago': 'MercadoPago',
    'excel': 'Excel', 'whatsapp': 'WhatsApp', 'instagram': 'Instagram',
    'linkedin': 'LinkedIn', 'tiktok': 'TikTok', 'youtube': 'YouTube',
    'facebook': 'Facebook', 'figma': 'Figma', 'miro': 'Miro', 'airtable': 'Airtable',
    'clickup': 'ClickUp', 'monday': 'Monday', 'jira': 'Jira', 'github': 'GitHub',
    'copilot': 'Copilot', 'deepseek': 'DeepSeek', 'grok': 'Grok',
    'tableau': 'Tableau', 'langchain': 'LangChain', 'llamaindex': 'LlamaIndex',
    'crewai': 'CrewAI', 'autogen': 'AutoGen', 'n8n': 'n8n', 'mailchimp': 'Mailchimp',
    'heygen': 'HeyGen', 'elevenlabs': 'ElevenLabs',
    'ia': 'IA', 'ai': 'AI', 'seo': 'SEO', 'crm': 'CRM', 'erp': 'ERP',
    'saas': 'SaaS', 'b2b': 'B2B', 'b2c': 'B2C', 'roi': 'ROI', 'kpi': 'KPI',
    'ceo': 'CEO', 'cfo': 'CFO', 'cto': 'CTO', 'hr': 'HR', 'it': 'IT',
    'latam': 'LATAM', 'pyme': 'PyME', 'pymes': 'PyMEs', 'pdf': 'PDF', 'api': 'API',
    'ux': 'UX', 'ui': 'UI', 'rrhh': 'RRHH', 'mvp': 'MVP', 'okr': 'OKR',
    'argentina': 'Argentina', 'chile': 'Chile', 'uruguay': 'Uruguay',
    'colombia': 'Colombia', 'méxico': 'México', 'ecuador': 'Ecuador',
    'costa rica': 'Costa Rica', 'panamá': 'Panamá', 'perú': 'Perú', 'brasil': 'Brasil',
    'vistaceo': 'VistaCEO', 'integromat': 'Integromat',
  };

  fixedContent = fixedContent.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
    // Only fix ALL-CAPS headings or excessive title-case, not normal text
    const words = text.split(/\s+/);
    const titleCaseWords = words.filter((w: string) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(w));
    const isExcessiveTitleCase = words.length > 3 && titleCaseWords.length / words.length > 0.7;
    
    if (!isExcessiveTitleCase) return match; // Leave it as-is
    
    // Convert to sentence case preserving brand names
    const sentenceCase = words.map((word: string, idx: number) => {
      const lowerWord = word.toLowerCase().replace(/[¿¡?!:.,;()]/g, '');
      const properCase = PROPER_CASE[lowerWord];
      if (properCase) {
        // Restore punctuation
        const prefix = word.match(/^[¿¡]/)?.[0] || '';
        const suffix = word.match(/[?!:.,;)]+$/)?.[0] || '';
        return prefix + properCase + suffix;
      }
      if (idx === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return word.toLowerCase();
    }).join(' ');
    
    if (text !== sentenceCase) {
      issues.push(`Fixed heading case: "${text}" -> "${sentenceCase}"`);
    }
    return `${hashes} ${sentenceCase}`;
  });

  return { content: fixedContent, issues };
}

// Quality gate checks
function runQualityGates(content: string, title: string): QualityGateReport {
  const report: QualityGateReport = {
    passed: false,
    score: 0,
    checks: {
      no_h1_repeated: true,
      real_headings: false,
      has_hero_image: false,
      has_inline_images: false,
      has_internal_links: false,
      has_external_links: false,
      short_paragraphs: false,
      sentence_case_headings: false,
      no_keyword_stuffing: false,
      min_word_count: false,
      has_checklist: true, // Always pass - optional
      has_examples: false,
      no_markdown_tables: false,
      no_broken_lines: false,
    },
    issues: [],
    timestamp: new Date().toISOString(),
    rewrite_attempts: 0,
  };

  // Check for H1 in content
  if (content.match(/^#\s+[^\n]+/m)) {
    report.checks.no_h1_repeated = false;
    report.issues.push('Content contains H1 - should only use H2/H3');
  }

  // Check for real H2/H3 headings (3 H2 minimum)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  report.checks.real_headings = h2Count >= 3;
  if (!report.checks.real_headings) {
    report.issues.push(`Insufficient headings: ${h2Count} H2 (need 3+)`);
  }

  // Internal links - NON-BLOCKING (informational only)
  const internalLinks = (content.match(/\[([^\]]+)\]\(\/blog[^\)]+\)/g) || []).length;
  report.checks.has_internal_links = internalLinks >= 1;
  if (internalLinks === 0) {
    report.issues.push(`No internal links found (recommended: 2+)`);
  }

  // External links - NON-BLOCKING
  const externalLinks = (content.match(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g) || []).length;
  report.checks.has_external_links = externalLinks >= 1;

  // Paragraph length (200 words max, very relaxed)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('-') && !p.startsWith('|') && !p.startsWith('>'));
  const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 200);
  report.checks.short_paragraphs = longParagraphs.length <= 3;

  // Sentence case - informational only, always passes
  report.checks.sentence_case_headings = true;

  // Word count - HARD requirement
  const wordCount = content.split(/\s+/).length;
  report.checks.min_word_count = wordCount >= 800;
  if (!report.checks.min_word_count) {
    report.issues.push(`Only ${wordCount} words (need 800+)`);
  }

  // Keyword stuffing
  const words = content.toLowerCase().split(/\s+/);
  const wordFreq: Record<string, number> = {};
  words.forEach(w => {
    if (w.length > 5) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(wordFreq));
  report.checks.no_keyword_stuffing = maxFreq < wordCount * 0.04;

  // Examples - NON-BLOCKING
  const hasExamples = /\*\*ejemplo/i.test(content) || /ejemplo:/i.test(content) || /caso real/i.test(content) || /caso práctico/i.test(content);
  report.checks.has_examples = hasExamples;

  // Markdown tables: AUTO-CONVERT to lists instead of blocking
  if (hasMarkdownTable(content)) {
    content = convertTablesToLists(content);
    report.issues.push('Markdown tables auto-converted to lists');
  }
  report.checks.no_markdown_tables = true; // Always pass after auto-conversion

  // Hard block: broken formatting
  const brokenIssues = detectBrokenFormattingIssues(content);
  report.checks.no_broken_lines = brokenIssues.length === 0;
  if (!report.checks.no_broken_lines) {
    report.issues.push(...brokenIssues);
  }

  // HARD BLOCK: raw HTML in content (most critical check)
  const hasRawHTML = /<(?:img|a|div|span|h[1-6]|section|article)\s+[^>]*>/i.test(content) ||
    /(?:loading|class|decoding)\s*=\s*"[^"]*"/i.test(content) ||
    /nlewrgmcawzcdazhfiyy\.supabase\.co\/st/i.test(content);
  if (hasRawHTML) {
    report.issues.push('CRITICAL: Raw HTML or leaked code detected in content');
  }

  // HARD BLOCK: CODE_BLOCK placeholders leaked into content
  const hasCodeBlockLeak = /\bCODE_BLOCK[_\s]*\d+\b/i.test(content) || /__CODE_BLOCK_\d+__/.test(content);
  if (hasCodeBlockLeak) {
    report.issues.push('CRITICAL: CODE_BLOCK placeholder leaked into content');
  }

  // Calculate score
  const checksArray = Object.values(report.checks);
  const passedChecks = checksArray.filter(Boolean).length;
  report.score = Math.round((passedChecks / checksArray.length) * 100);
  
  // PASS if: minimum word count met, has headings, no tables, no broken formatting, NO raw HTML, NO code block leaks
  report.passed = report.checks.min_word_count &&
    report.checks.real_headings &&
    report.checks.no_markdown_tables &&
    report.checks.no_broken_lines &&
    !hasRawHTML &&
    !hasCodeBlockLeak;

  return report;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for manual run options
    let forceRun = false;
    let specificTopicId: string | null = null;
    let automated = false;
    let calledFromDailyPublish = false;
    
    try {
      const body = await req.json();
      forceRun = body.force || false;
      specificTopicId = body.topic_id || null;
      automated = body.automated || false;
      calledFromDailyPublish = body.mode === 'auto' || false;
    } catch {
      // No body, use defaults
    }

    console.log('[generate-blog-post] Starting generation with PATCH V3...', { forceRun, specificTopicId, automated });

    // 1. Check pacing - should we publish today?
    const { data: configData } = await supabase
      .from('blog_config')
      .select('*');
    
    const config: Record<string, any> = {};
    (configData || []).forEach(row => {
      config[row.key] = row.value;
    });

    const goLiveDate = config.go_live_date?.date || new Date().toISOString().split('T')[0];
    const annualTarget = config.annual_target_posts?.count || 350;
    const horizonDays = config.horizon_days?.days || 365;

    // Calculate pacing - 350 posts / 365 days ≈ 1 post per day
    const now = new Date();
    const goLive = new Date(goLiveDate);
    const daysElapsed = Math.max(1, Math.floor((now.getTime() - goLive.getTime()) / (1000 * 60 * 60 * 24)));
    const expectedPublishes = Math.max(daysElapsed, 1); // At least 1 post per day elapsed

    // Check if we already published today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: publishedToday } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('publish_at', todayStart.toISOString());

    console.log('[generate-blog-post] Pacing check:', { 
      daysElapsed, 
      expectedPublishes, 
      publishedToday,
      forceRun 
    });

    // Only skip if we already published 2 today (unless forced or called from blog-daily-publish)
    // When called from blog-daily-publish, pacing is already handled by the caller
    const DAILY_POST_LIMIT = 3;
    if (!forceRun && !calledFromDailyPublish && (publishedToday || 0) >= DAILY_POST_LIMIT) {
      console.log(`[generate-blog-post] Already published ${publishedToday} today (limit: ${DAILY_POST_LIMIT}), skipping...`);
      
      await supabase.from('blog_runs').insert({
        result: 'skipped',
        skip_reason: 'already_published_today',
        notes: `Published today: ${publishedToday}/${DAILY_POST_LIMIT}`,
        quality_gate_report: { pacing: 'daily_limit_reached' }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'already_published_today',
        message: `Already published ${publishedToday}/${DAILY_POST_LIMIT} post(s) today`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Proceed with generation - up to 2 posts per day
    console.log(`[generate-blog-post] Proceeding with generation (${publishedToday || 0}/${DAILY_POST_LIMIT} today)`);

    // 2. Select topic from blog_plan
    let selectedPlan: BlogPlan | null = null;
    let selectedTopic: BlogTopic | null = null;

    if (specificTopicId) {
      // Manual topic selection
      const { data: topic } = await supabase
        .from('blog_topics')
        .select('*')
        .eq('id', specificTopicId)
        .single();
      
      selectedTopic = topic;
    } else {
      // Get next planned topic
      const today = now.toISOString().split('T')[0];
      
      const { data: plans } = await supabase
        .from('blog_plan')
        .select('*, topic:blog_topics(*)')
        .eq('status', 'planned')
        .lte('planned_date', today)
        .order('planned_date', { ascending: true })
        .order('publish_attempts', { ascending: true })
        .limit(1);

      if (plans && plans.length > 0) {
        selectedPlan = plans[0];
        selectedTopic = plans[0].topic;
      }
    }

    // If no planned topic, get random from backlog
    if (!selectedTopic) {
      console.log('[generate-blog-post] No planned topic, selecting from backlog...');
      
      // Get last published pillar to avoid repetition
      const { data: lastPost } = await supabase
        .from('blog_posts')
        .select('pillar')
        .eq('status', 'published')
        .order('publish_at', { ascending: false })
        .limit(1)
        .single();

      const lastPillar = lastPost?.pillar;

      // Select topic with different pillar
      let query = supabase
        .from('blog_topics')
        .select('*')
        .order('priority_score', { ascending: false })
        .limit(10);

      if (lastPillar) {
        query = query.neq('pillar', lastPillar);
      }

      const { data: topics } = await query;

      if (topics && topics.length > 0) {
        // Random selection from top 10 for variety
        selectedTopic = topics[Math.floor(Math.random() * Math.min(5, topics.length))];
      }
    }

    if (!selectedTopic) {
      console.log('[generate-blog-post] No topics available');
      
      await supabase.from('blog_runs').insert({
        result: 'failed',
        skip_reason: 'no_topics_available',
        notes: 'No topics found in blog_topics or blog_plan',
        quality_gate_report: { error: 'no_topics' }
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'no_topics_available'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[generate-blog-post] Selected topic:', selectedTopic.title_base);

    // 3. LATAM-wide content (no country rotation)
    console.log('[generate-blog-post] Using LATAM-wide content (no country targeting)');

    // 4. vInfinity CAPA 4: Multi-signal cannibalization detection
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('slug, primary_keyword, title, category, pillar, excerpt')
      .eq('status', 'published')
      .limit(200);

    const slugSimilarity = (existingPosts || []).some(post => {
      const newTitle = selectedTopic!.title_base.toLowerCase();
      const existTitle = post.title.toLowerCase();
      const newKw = (selectedTopic!.title_base || '').toLowerCase();
      const existKw = (post.primary_keyword || '').toLowerCase();
      
      // Signal 1: slug word overlap (5+ shared words)
      const existingWords = new Set<string>(post.slug.toLowerCase().split('-'));
      const newWords = new Set<string>(selectedTopic!.slug.toLowerCase().split('-'));
      const slugOverlap = [...existingWords].filter((w: string) => newWords.has(w) && w.length > 3).length;
      
      // Signal 2: title similarity (shared significant words)
      const existTitleWords = new Set<string>(existTitle.split(/\s+/).filter((w: string) => w.length > 4));
      const newTitleWords = new Set<string>(newTitle.split(/\s+/).filter((w: string) => w.length > 4));
      const titleOverlap = [...existTitleWords].filter((w: string) => newTitleWords.has(w)).length;
      
      // Signal 3: same category + similar keyword
      const sameCategory = post.category === selectedTopic!.pillar || post.pillar === selectedTopic!.pillar;
      const kwOverlap = existKw && newKw && (existKw.includes(newKw) || newKw.includes(existKw));
      
      // vInfinity: riesgo critico if promise + intent + reader overlap
      const isCritical = slugOverlap >= 5 || (titleOverlap >= 3 && sameCategory);
      const isHigh = (titleOverlap >= 2 && kwOverlap) || slugOverlap >= 4;
      
      if (isCritical) {
        console.log(`[generate-blog-post] CRITICAL cannibalization: "${post.title}" vs "${selectedTopic!.title_base}" (slug:${slugOverlap}, title:${titleOverlap})`);
      } else if (isHigh) {
        console.log(`[generate-blog-post] HIGH cannibalization risk: "${post.title}" (title:${titleOverlap}, kwOverlap:${kwOverlap})`);
      }
      
      return isCritical || isHigh;
    });

    if (slugSimilarity && !forceRun) {
      console.log('[generate-blog-post] Cannibalization risk, marking topic and trying next...');
      
      // Mark topic as used so it doesn't get retried
      await supabase
        .from('blog_topics')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', selectedTopic.id);

      // Update plan if exists
      if (selectedPlan) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'skipped',
            skip_reason: 'cannibalization_risk',
            publish_attempts: (selectedPlan.publish_attempts || 0) + 1
          })
          .eq('id', selectedPlan.id);
      }

      // Try to find ANOTHER topic instead of just returning
      const { data: altTopics } = await supabase
        .from('blog_topics')
        .select('*')
        .is('last_used_at', null)
        .neq('id', selectedTopic.id)
        .order('priority_score', { ascending: false })
        .limit(5);

      if (altTopics && altTopics.length > 0) {
        selectedTopic = altTopics[Math.floor(Math.random() * Math.min(3, altTopics.length))];
        selectedPlan = null;
        console.log('[generate-blog-post] Switched to alternative topic:', selectedTopic.title_base);
      } else {
        return new Response(JSON.stringify({
          success: false,
          reason: 'no_available_topics',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // 5. Get existing posts for internal linking
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('slug, title, pillar')
      .eq('status', 'published')
      .limit(50);

    const samePillarPosts = (relatedPosts || []).filter(p => p.pillar === selectedTopic!.pillar).slice(0, 6);
    const crossPillarPosts = (relatedPosts || []).filter(p => p.pillar !== selectedTopic!.pillar).slice(0, 4);
    
    // Build internal links for prompt — use BLOG_DOMAIN with trailing slash
    const internalLinksForPrompt = [...samePillarPosts, ...crossPillarPosts].map(p => 
      `- [${p.title}](https://blog.vistaceo.com/${p.slug}/)`
    ).join('\n');

    // Get external sources for this pillar
    const pillarSources = EXTERNAL_SOURCES[selectedTopic.pillar as keyof typeof EXTERNAL_SOURCES] || EXTERNAL_SOURCES.liderazgo;

    // 5.5. vInfinity CAPA 9: Anti-pattern checks
    // No 2 same head_term in 72h, no 3 consecutive same skeleton
    const threeDaysAgoTs = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: recentPosts3 } = await supabase
      .from('blog_posts')
      .select('quality_gate_report, primary_keyword, category')
      .eq('status', 'published')
      .gte('publish_at', threeDaysAgoTs)
      .order('publish_at', { ascending: false })
      .limit(5);
    
    const recentFormats = (recentPosts3 || [])
      .map((p: any) => p.quality_gate_report?.format_id)
      .filter(Boolean) as string[];
    
    // vInfinity CAPA 9: Check 72h keyword block
    const recentKws = (recentPosts3 || []).map((p: any) => (p.primary_keyword || '').toLowerCase()).filter(Boolean);
    const currentKw = (selectedTopic.title_base || '').toLowerCase().slice(0, 40);
    const headTermBlocked = recentKws.some((k: string) => k.length > 5 && currentKw.length > 5 && (k.includes(currentKw) || currentKw.includes(k)));
    
    if (headTermBlocked && !forceRun) {
      console.log(`[generate-blog-post] vInfinity CAPA 9: head_term "${currentKw}" blocked — published within 72h`);
      // Try alternative topic
      const { data: altTopics2 } = await supabase
        .from('blog_topics')
        .select('*')
        .is('last_used_at', null)
        .neq('id', selectedTopic.id)
        .neq('pillar', selectedTopic.pillar) // Force different pillar
        .order('priority_score', { ascending: false })
        .limit(5);
      
      if (altTopics2 && altTopics2.length > 0) {
        selectedTopic = altTopics2[Math.floor(Math.random() * Math.min(3, altTopics2.length))];
        selectedPlan = null;
        console.log(`[generate-blog-post] Switched to alt topic (72h rule): ${selectedTopic.title_base}`);
      }
    }
    
    let selectedFormat = selectFormatForTopic(selectedTopic, recentFormats);
    const justifiedOptionalModules = getJustifiedOptionalModules(selectedTopic, selectedFormat);
    
    // vInfinity CAPA 9: Block 3 consecutive same format
    if (recentFormats.length >= 2 && recentFormats[0] === recentFormats[1] && recentFormats[0] === selectedFormat.id) {
      console.log(`[generate-blog-post] vInfinity CAPA 9: Format "${selectedFormat.id}" used 2x consecutively, forcing different`);
      const altFormat = ARTICLE_FORMATS.find(f => f.id !== selectedFormat.id);
      if (altFormat) selectedFormat = altFormat;
    }
    
    console.log('[generate-blog-post] Selected format:', selectedFormat.id, selectedFormat.name);

    // 6. Generate content with Lovable AI
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const pillarInfo = PILLARS[selectedTopic.pillar as keyof typeof PILLARS] || { label: selectedTopic.pillar, emoji: '📝' };
    const cannibalizationRisk = slugSimilarity ? 82 : 18;
    const opportunityModel = buildOpportunityModel(selectedTopic, samePillarPosts, crossPillarPosts, cannibalizationRisk);
    const headlineLab = generateHeadlineLab(selectedTopic);
    const editorialBrief = buildEditorialBrief(selectedTopic, selectedFormat, samePillarPosts, crossPillarPosts);
    const hypotheses = buildHypotheses(selectedTopic, opportunityModel);
    const explainability = buildExplainability(selectedTopic, opportunityModel, [
      'Intent Match Gate',
      'Originality Gate',
      'CTR Magnetism Gate',
      'Interlinking Power Gate',
      'Zero Embarrassment Gate',
    ]);

    // PATCH V7 System Prompt - CONTENIDO REAL + SEO PREMIUM
    const systemPrompt = `Sos un editor senior de contenido SEO para VistaCEO. Tu objetivo es generar artículos que:
1. Tengan CONTENIDO SUSTANCIAL Y PROFUNDO sobre el tema (esto es lo MÁS IMPORTANTE)
2. Sean ULTRA SEO (keywords naturales, estructura perfecta para rankear)
3. Sean ULTRA HUMANOS (suena a persona real, no a plantilla ni IA)

═══════════════════════════════════════════════════════════════
              REGLA 0: CONTENIDO REAL Y PROFUNDO (LA MÁS IMPORTANTE)
═══════════════════════════════════════════════════════════════

EL 70% DEL ARTÍCULO DEBE SER CONTENIDO SUSTANCIAL sobre el tema:
- Análisis profundo del problema/oportunidad con datos reales o estimaciones fundamentadas
- Contexto histórico o de mercado relevante (qué cambió, por qué importa ahora)
- Explicaciones detalladas de conceptos, no solo listas
- Casos reales o realistas con detalles específicos (números, plazos, resultados)
- Comparación de enfoques/estrategias con pros y contras
- Insights originales que no se encuentran en el primer resultado de Google
- Análisis de tendencias con impacto en LATAM
- Datos de mercado, estudios o reportes relevantes (citar fuentes cuando existan)

⛔ EL ARTÍCULO NO PUEDE SER solo checklists, plantillas y ejercicios.
Los elementos interactivos (checklist, plantilla, autoevaluación) son COMPLEMENTOS (máximo 30% del artículo), NO el contenido principal.

═══════════════════════════════════════════════════════════════
                    10 REGLAS SEO PREMIUM (OBLIGATORIAS)
═══════════════════════════════════════════════════════════════

⛔ PROHIBIDO:
- NUNCA tablas Markdown (pipes |). Usá listas o bloques de código.
- NUNCA líneas de más de 120 caracteres.
- NUNCA bloques de texto densos sin respiración.
- NUNCA parecer un artículo generado por IA.
- NUNCA empezar oraciones con "En el mundo actual", "En la era digital", etc.
- NUNCA que más del 30% del artículo sean checklists, templates o ejercicios.

═══════════════════════════════════════════════════════════════
REGLA 1: PAQUETE SEO COMPLETO
═══════════════════════════════════════════════════════════════

La keyphrase principal aparece EXACTAMENTE en 5 lugares:
1. En el primer párrafo (intro) - una vez, natural
2. En un H2 - una sola vez
3. En el ALT de 1 imagen (lo generamos después)
4. En la meta description (ya la generamos)
5. En el cierre (próximos pasos)

El resto del contenido usa VARIACIONES SEMÁNTICAS, nunca repetir la keyword.

Keywords secundarias a distribuir naturalmente (8-15):
- Variaciones LATAM del tema
- Términos "People Also Ask" relacionados
- Conceptos asociados (herramientas, procesos, métricas)

Entidades a mencionar (5-12):
- Herramientas reconocidas del tema
- Organizaciones o frameworks relevantes
- Conceptos que Google entiende como "tema"

═══════════════════════════════════════════════════════════════
REGLA 2: ESTRUCTURA SEGÚN FORMATO ASIGNADO
═══════════════════════════════════════════════════════════════

**INTRO (70-110 palabras):**
- Hook con dolor real ("¿Te pasa que...?")
- Promesa clara ("en 10 min vas a...")
- Keyphrase natural (1 vez)
- 1 frase de contexto LATAM

**CUERPO:**
Seguí EXCLUSIVAMENTE la estructura del FORMATO ASIGNADO (indicado abajo).
NO uses secciones genéricas como "En 2 minutos", "Para quién es", "La idea clave", "Qué cambia en la práctica" o "Próximos 3 pasos".
Cada artículo DEBE sentirse estructuralmente DIFERENTE a los anteriores.

El cuerpo debe tener 6-10 H2, mayoritariamente contenido sustancial:
- Análisis profundo con datos, contexto y ejemplos
- Cada sección con una idea clara y desarrollo real
- Alternar párrafos cortos con secciones más detalladas

**FAQ (opcional, solo si aporta):**
- 3-5 preguntas REALES que la gente busca sobre ESTE tema específico
- NUNCA preguntas genéricas tipo "¿Qué es X?" o "¿Necesito herramientas especiales?"
- Cada pregunta debe ser única y específica al tema tratado
- Respuestas directas de 30-50 palabras

**CIERRE:**
- Un párrafo de cierre fuerte con acción concreta
- CTA VistaCEO sutil si aplica

**LINKS EXTERNOS:**
${pillarSources.map(s => `- [${s.title}](${s.url})`).join('\n')}

═══════════════════════════════════════════════════════════════
REGLA 3: LEGIBILIDAD PREMIUM
═══════════════════════════════════════════════════════════════

- Párrafos de 1-2 frases (3 máximo)
- Cada sección: 1 idea → 1 ejemplo → 1 acción
- Regla 1 pantalla: cada bloque debe poder leerse sin scrollear mucho
- Listas: 7-12 ítems máx (si no, partir en 2)
- Alternar párrafos cortos (1 oración) con normales para ritmo
- Cada 100-150 palabras: un elemento visual (lista, callout, ejemplo)

═══════════════════════════════════════════════════════════════
REGLA 4: EEAT PRÁCTICO
═══════════════════════════════════════════════════════════════

- Explicar como alguien que lo hace de verdad (pasos, criterios, señales)
- Si no hay dato duro, hablar en términos prácticos
- Cuando haya números o afirmaciones fuertes, citar fuente
- Incluir 1-2 opiniones/insights propios del "autor"

═══════════════════════════════════════════════════════════════
REGLA 5: EJEMPLOS OBLIGATORIOS (2-4)
═══════════════════════════════════════════════════════════════

Formato exacto para cada ejemplo:

> **Ejemplo:** Una pyme de [sector] en [país LATAM] quería [objetivo]. [Qué hicieron brevemente].
>
> **Qué haría hoy:** [Acción específica]. Tiempo: [X horas/días].
>
> **Error típico:** [Lo que la mayoría hace mal].

═══════════════════════════════════════════════════════════════
REGLA 6: LINKS INTERNOS (8-12) — vInfinity CAPA 7
═══════════════════════════════════════════════════════════════

Posts relacionados para linkear (USAR ESTAS URLs EXACTAS con https://blog.vistaceo.com):
${internalLinksForPrompt || '- [Ver más artículos](https://blog.vistaceo.com/)'}
- [Más sobre ${pillarInfo.label}](https://blog.vistaceo.com/tema/${selectedTopic.pillar}/)

- 1 link a "pilar" (guía madre o categoría) en https://blog.vistaceo.com/tema/SLUG/
- 5-8 links a posts relacionados (cluster) con URL completa https://blog.vistaceo.com/SLUG/
- 1-2 links a features/páginas relevantes de VistaCEO en https://www.vistaceo.com/
- Anclas naturales (NUNCA "clic aquí")
- SIEMPRE usar URLs completas con https://blog.vistaceo.com/ (NUNCA /blog/slug)

═══════════════════════════════════════════════════════════════
REGLA 7: COLOCACIÓN EXACTA DE KEYPHRASE
═══════════════════════════════════════════════════════════════

5 lugares EXACTOS (ni más, ni menos):
1. Primer párrafo (intro)
2. Un H2 (solo uno)
3. Meta description (ya lo hacemos)
4. ALT de 1 imagen (ya lo hacemos)
5. Cierre (próximos pasos)

El resto: VARIACIONES SEMÁNTICAS únicamente.

═══════════════════════════════════════════════════════════════
REGLA 8: ELEMENTOS WOW
═══════════════════════════════════════════════════════════════

Incluir AL MENOS 2 de estos:
- Framework simple (ej: "3 capas", "matriz impacto/esfuerzo", "regla 80/20")
- Mini caso LATAM con números suaves (sin inventar)
- Comparación "Antes vs Después" (bullets)
- Sección "Señales de que lo estás haciendo bien" (3-6 señales)

═══════════════════════════════════════════════════════════════
REGLA 9: ESTILO ULTRA-HUMANO
═══════════════════════════════════════════════════════════════

- Voseo natural ("podés", "tenés", "hacé")
- Frases cortas que golpean
- Preguntas retóricas para enganchar
- Variar la estructura de cada sección
- No empezar todas las oraciones igual
- Frases tipo: "La realidad es que...", "Acá viene lo importante:", "Esto es clave:"
- Oraciones de impacto solas: "Eso cambia todo." "Y acá es donde la mayoría falla."

═══════════════════════════════════════════════════════════════
REGLA 10: CTA DE VISTACEO (sin spam)
═══════════════════════════════════════════════════════════════

- 1 mención en cuerpo máximo (opcional, natural)
- CTA final de 2-3 líneas: "Si te sirvió esto, en VistaCEO podés..."
- Conectar al tema (misiones/radar/chat/analytics) sin inventar

═══════════════════════════════════════════════════════════════
CONTEXTO
═══════════════════════════════════════════════════════════════
- Pilar: ${pillarInfo.label} ${pillarInfo.emoji}
- Audiencia: emprendedores y profesionales de LATAM
- Intent: ${selectedTopic.intent}
- Objetivo: tráfico orgánico + tiempo en página alto + featured snippets

═══════════════════════════════════════════════════════════════
FORMATO DEL ARTÍCULO: "${selectedFormat.name}" (${selectedFormat.id})
═══════════════════════════════════════════════════════════════

IMPORTANTE: Este artículo DEBE seguir el formato "${selectedFormat.name}".
Las secciones obligatorias son (usá H2 para cada una):
${selectedFormat.sections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

NO uses la estructura genérica de siempre. Seguí ESTE formato específico.
Cada artículo debe sentirse DIFERENTE a los anteriores.

Respondé SOLO con el Markdown, sin H1, sin explicaciones previas.`;

    const userPrompt = `Escribí un artículo completo para el blog de VistaCEO.

TÍTULO (ya lo renderiza la página, NO lo incluyas): ${headlineLab.winner}

KEYPHRASE PRINCIPAL: ${editorialBrief.keyword_principal}

FORMATO ASIGNADO: "${selectedFormat.name}"
Secciones obligatorias: ${selectedFormat.sections.join(' → ')}

BRIEF EDITORIAL OBLIGATORIO:
- Intención principal: ${editorialBrief.intencion_principal}
- Perfil lector: ${editorialBrief.perfil_lector}
- Problema concreto: ${editorialBrief.problema_concreto}
- Promesa exacta: ${editorialBrief.promesa_exacta}
- Ángulo diferencial: ${editorialBrief.angulo_diferencial}
- Keywords secundarias: ${(editorialBrief.keywords_secundarias as string[]).join(', ') || 'ninguna'}
- Entidades semánticas clave: ${(editorialBrief.entidades_semanticas_clave as string[]).join(', ') || 'ninguna'}
- Enlaces a empujar: ${(editorialBrief.enlaces_a_empujar as string[]).join(', ') || 'ninguno'}
- Enlaces a recibir: ${(editorialBrief.enlaces_a_recibir as string[]).join(', ') || 'ninguno'}
- Hipótesis CTR: ${hypotheses.ctr}
- Hipótesis ranking: ${hypotheses.ranking}

RECORDÁ: REGLA 0 es la MÁS IMPORTANTE:
- EL 70% del artículo debe ser CONTENIDO SUSTANCIAL: análisis profundo, datos reales, contexto de mercado, casos detallados, insights originales.
- Las herramientas prácticas (checklist, plantilla, ejercicio) son COMPLEMENTOS, elegí solo 1 y que sea el 30% máximo.
- Quiero que el lector APRENDA algo real y profundo sobre el tema, no solo que tenga una lista de tareas.

TAMBIÉN:
1. La keyphrase aparece en 5 lugares EXACTOS (intro, 1 H2, meta, alt, cierre)
2. Seguí la estructura del formato "${selectedFormat.name}" - NO la estructura genérica
3. Párrafos ultra cortos (1-3 oraciones máximo)
4. EEAT práctico: escribí como experto que lo hace de verdad
5. 2-4 ejemplos DETALLADOS con contexto, decisión, resultado
6. 8-12 links internos con anclas naturales usando https://blog.vistaceo.com/SLUG/ (NUNCA /blog/slug)
7. FAQ con 4-6 preguntas reales que la gente busca
8. Voseo natural, frases cortas, ritmo variado
9. CTA VistaCEO sutil al final
10. Mínimo 1200 palabras de contenido real (no relleno)

⛔ PROHIBIDO: tablas Markdown, líneas >120 chars, keywords repetidas, frases genéricas de IA, artículos que son solo listas y templates.
⛔ NUNCA incluir HTML crudo de ningún tipo. SOLO markdown puro. Nada de <img>, <a>, <h2>, <div>. Nada de atributos como loading="lazy", class="content-image", id="seccion". Si querés una imagen usá ![alt](url). Si querés un link usá [texto](url). Si querés un heading usá ## Texto. NUNCA HTML.
⛔ NUNCA incluir URLs de storage raw como nlewrgmcawzcdazhfiyy.supabase.co en el texto. Solo en sintaxis de imagen markdown.
⛔ NUNCA escribir "CODE_BLOCK_0", "CODE_BLOCK_1", "__CODE_BLOCK__" ni ningún placeholder técnico. Estos son artefactos internos del sistema. Si querés mostrar código, usá triple backtick (\`\`\`). NUNCA la palabra "CODE_BLOCK" como texto.`;

    console.log('[generate-blog-post] Calling Lovable AI with PATCH V7 prompt...');

    let contentMd = '';
    let rewriteAttempts = 0;
    const maxRewrites = 4;
    let qualityGateReport: QualityGateReport;

    // Generation loop with rewrite attempts
    do {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rewriteAttempts === 0 ? userPrompt : `${userPrompt}\n\nIMPORTANTE: El intento anterior no pasó el quality gate. Problemas detectados:\n${qualityGateReport!.issues.join('\n')}\n\nCorregí estos problemas en esta nueva versión.` }
          ],
          max_tokens: 12000,
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[generate-blog-post] AI error:', errorText);
        
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({
            success: false,
            reason: 'rate_limited',
            message: 'AI rate limit exceeded, please try again later'
          }), { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
        
        throw new Error(`AI generation failed: ${aiResponse.status}`);
      }

      const aiResult = await aiResponse.json();
      contentMd = aiResult.choices?.[0]?.message?.content || '';

      if (!contentMd || contentMd.length < 500) {
        throw new Error('Generated content too short');
      }

      // Validate and fix content
      const { content: fixedContent, issues: fixIssues } = validateAndFixContent(contentMd, selectedTopic.title_base);
      contentMd = fixedContent;
      
      // CRITICAL: Sanitize any raw HTML artifacts from AI output (DOUBLE PASS)
      contentMd = sanitizeAIGeneratedMarkdown(contentMd);
      contentMd = sanitizeAIGeneratedMarkdown(contentMd); // Second pass catches nested artifacts
      
      // Run quality gates
      qualityGateReport = runQualityGates(contentMd, selectedTopic.title_base);
      qualityGateReport.issues = [...qualityGateReport.issues, ...fixIssues];
      qualityGateReport.rewrite_attempts = rewriteAttempts;
      qualityGateReport.opportunity = opportunityModel;
      qualityGateReport.editorial_brief = editorialBrief;
      qualityGateReport.headline_lab = headlineLab;
      qualityGateReport.hypotheses = hypotheses;
      qualityGateReport.explainability = explainability;
      (qualityGateReport as any).format_id = selectedFormat.id;
      (qualityGateReport as any).format_name = selectedFormat.name;

      console.log(`[generate-blog-post] Quality gate attempt ${rewriteAttempts + 1}:`, {
        passed: qualityGateReport.passed,
        score: qualityGateReport.score,
        issueCount: qualityGateReport.issues.length,
        issuesList: qualityGateReport.issues.slice(0, 8)
      });

      rewriteAttempts++;
    } while (!qualityGateReport.passed && rewriteAttempts < maxRewrites);

    // If still not passed after max rewrites, skip
    if (!qualityGateReport.passed) {
      console.log('[generate-blog-post] Quality gate failed after max rewrites, skipping...');
      
      if (selectedPlan) {
        await supabase
          .from('blog_plan')
          .update({ 
            status: 'skipped',
            skip_reason: 'quality_gate_failed',
            publish_attempts: (selectedPlan.publish_attempts || 0) + 1
          })
          .eq('id', selectedPlan.id);
      }

      await supabase.from('blog_runs').insert({
        chosen_topic_id: selectedTopic.id,
        chosen_plan_id: selectedPlan?.id,
        result: 'skipped',
        skip_reason: 'quality_gate_failed',
        notes: `Failed after ${rewriteAttempts} attempts: ${qualityGateReport.issues.join(', ')}`,
        quality_gate_report: qualityGateReport
      });

      return new Response(JSON.stringify({
        success: false,
        reason: 'quality_gate_failed',
        attempts: rewriteAttempts,
        issues: qualityGateReport.issues
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[generate-blog-post] Content passed quality gate, generating images...');

    // 7. Generate HERO image (ultra-realistic, no text)
    const heroImageUrl = await generateHeroImage(selectedTopic.title_base, selectedTopic.pillar, selectedTopic.slug, lovableApiKey!, supabaseUrl, supabaseKey);
    qualityGateReport.checks.has_hero_image = !!heroImageUrl;
    
    // 7b. Generate INLINE image (for content body)
    let inlineImageUrl: string | null = null;
    if (heroImageUrl) {
      // Only generate inline if hero succeeded (to save API calls)
      inlineImageUrl = await generateInlineImage(selectedTopic.title_base, selectedTopic.pillar, selectedTopic.slug, lovableApiKey!, supabaseUrl, supabaseKey);
      qualityGateReport.checks.has_inline_images = !!inlineImageUrl;
      
      // Insert inline image into content after "En 2 minutos" or first H2
      if (inlineImageUrl) {
        const inlineAlt = `${selectedTopic.title_base} - concepto visual`;
        const imageMarkdown = `\n![${inlineAlt}](${inlineImageUrl})\n`;
        
        // Try to insert after "En 2 minutos" section
        const en2MinMatch = contentMd.match(/^## En 2 minutos.*?\n\n(?:[-*].*\n)+/m);
        if (en2MinMatch && en2MinMatch.index !== undefined) {
          const insertPos = en2MinMatch.index + en2MinMatch[0].length;
          contentMd = contentMd.slice(0, insertPos) + imageMarkdown + contentMd.slice(insertPos);
          console.log('[generate-blog-post] Inline image inserted after "En 2 minutos"');
        } else {
          // Fallback: insert after first H2
          const firstH2Match = contentMd.match(/^## .*?\n\n/m);
          if (firstH2Match && firstH2Match.index !== undefined) {
            const insertPos = firstH2Match.index + firstH2Match[0].length;
            contentMd = contentMd.slice(0, insertPos) + imageMarkdown + contentMd.slice(insertPos);
            console.log('[generate-blog-post] Inline image inserted after first H2');
          }
        }
      }
    } else {
      qualityGateReport.checks.has_inline_images = false;
    }

    // 8. Generate metadata
    const excerpt = contentMd
      .split('\n')
      .find((line: string) => line.length > 50 && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('>'))
      ?.slice(0, 160) || selectedTopic.title_base;

    const suffix = ' | VistaCEO';
    const baseMetaTitle = (headlineLab.winner as string) || selectedTopic.title_base;
    const maxTitleLen = 60 - suffix.length;
    const trimmedTitle = baseMetaTitle.length > maxTitleLen
      ? baseMetaTitle.slice(0, maxTitleLen - 3) + '...'
      : baseMetaTitle;
    const metaTitle = `${trimmedTitle}${suffix}`;
    const metaDescription = ((headlineLab.meta_description as string) || excerpt).slice(0, 155) + ((((headlineLab.meta_description as string) || excerpt).length > 155) ? '...' : '');

    // Calculate reading time
    const wordCountTotal = contentMd.split(/\s+/).length;
    const readingTimeMin = Math.max(4, Math.ceil(wordCountTotal / 200));

    // Build internal links array — always use BLOG_DOMAIN
    const internalLinks = [...samePillarPosts, ...crossPillarPosts].map(post => ({
      url: `${BLOG_DOMAIN}/${post.slug}/`,
      anchor: post.title,
      context: post.pillar === selectedTopic!.pillar ? 'same_pillar' : 'cross_pillar'
    }));

    // Build external sources array
    const externalSources = pillarSources.map(s => ({
      url: s.url,
      title: s.title,
      domain: s.domain
    }));

    // 8.5. Select category based on TOPIC CONTENT (not rotation)
    let selectedCategory = selectCategoryForTopic(selectedTopic);
    console.log('[generate-blog-post] Initial category (topic-matched):', selectedCategory);
    
    // 8.6. POST-GENERATION VALIDATION: Re-analyze actual content to correct category if needed
    selectedCategory = validateAndCorrectCategory(contentMd, selectedTopic.title_base, selectedCategory);
    
    // Also ensure pillar matches the category's pillar
    const categoryPillar = BLOG_CLUSTERS[selectedCategory]?.pillar;
    if (categoryPillar && categoryPillar !== selectedTopic.pillar) {
      console.log(`[generate-blog-post] Pillar adjusted: ${selectedTopic.pillar} → ${categoryPillar} (to match category ${selectedCategory})`);
    }
    console.log('[generate-blog-post] Final category (validated):', selectedCategory);

    // Generate schema JSON-LD - use CANONICAL_DOMAIN
    const schemaJsonld = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedTopic.title_base,
      "description": metaDescription,
      "image": heroImageUrl || `${CANONICAL_DOMAIN}/og-blog-default.jpg`,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "Equipo VistaCEO",
        "url": `${CANONICAL_DOMAIN}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": "VistaCEO",
        "logo": {
          "@type": "ImageObject",
          "url": `${CANONICAL_DOMAIN}/favicon.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${BLOG_DOMAIN}/${selectedTopic.slug}/`
      },
      "wordCount": wordCountTotal,
      "inLanguage": "es",
      "articleSection": BLOG_CLUSTERS[selectedCategory]?.label || 'Tendencias'
    };

    // 9. Check for slug collision and generate unique slug
    let postSlug = selectedTopic.slug;
    const { data: existingSlug } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', postSlug)
      .maybeSingle();
    
    if (existingSlug) {
      // Add date suffix to make unique
      const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      postSlug = `${selectedTopic.slug}-${dateSuffix}`;
      console.log(`[generate-blog-post] Slug collision detected, using: ${postSlug}`);
    }

    // Insert blog post
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        topic_id: selectedTopic.id,
        plan_id: selectedPlan?.id,
        status: 'published',
        publish_at: new Date().toISOString(),
        country_code: 'AR',
        pillar: selectedTopic.pillar,
        category: selectedCategory,
        intent: selectedTopic.intent,
        title: selectedTopic.title_base,
        slug: postSlug,
        excerpt,
        content_md: contentMd,
        meta_title: metaTitle,
        meta_description: metaDescription,
        primary_keyword: selectedTopic.title_base.toLowerCase().slice(0, 50),
        reading_time_min: readingTimeMin,
        internal_links: internalLinks,
        external_sources: externalSources,
        schema_jsonld: schemaJsonld,
        quality_gate_report: qualityGateReport,
        author_name: 'Equipo VistaCEO',
        author_url: `${CANONICAL_DOMAIN}/about`,
        hero_image_url: heroImageUrl,
        image_alt_text: `Imagen ilustrativa: ${selectedTopic.title_base}`,
        canonical_url: `${BLOG_DOMAIN}/${postSlug}/`,
        secondary_keywords: selectedTopic.secondary_keywords || [],
        tags: selectedTopic.required_subtopics || [],
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    console.log('[generate-blog-post] Post created:', newPost.id);

    // 10. Update blog_plan if used
    if (selectedPlan) {
      await supabase
        .from('blog_plan')
        .update({ 
          status: 'published',
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', selectedPlan.id);
    }

    // 11. Update topic last_used_at
    await supabase
      .from('blog_topics')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', selectedTopic.id);

    // 12. Record run
    await supabase.from('blog_runs').insert({
      chosen_topic_id: selectedTopic.id,
      chosen_plan_id: selectedPlan?.id,
      result: 'published',
      post_id: newPost.id,
      quality_gate_report: qualityGateReport,
      notes: `PATCH V6: Published "${selectedTopic.title_base}" for LATAM (score: ${qualityGateReport.score}%)`
    });

    // 13. Generate OG/SEO page for social sharing (async, non-blocking)
    const triggerOGGeneration = async () => {
      try {
        console.log('[generate-blog-post] Generating OG page for post:', newPost.slug);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-blog-og`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id: newPost.id }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] OG generation result:', result);
      } catch (error) {
        console.error('[generate-blog-post] OG generation error:', error);
      }
    };
    
    // 14. Trigger LinkedIn auto-publish (async, non-blocking)
    const triggerLinkedInPublish = async () => {
      try {
        console.log('[generate-blog-post] Triggering LinkedIn publish for post:', newPost.id);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/linkedin-publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id: newPost.id }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] LinkedIn publish result:', result);
      } catch (error) {
        console.error('[generate-blog-post] LinkedIn publish error:', error);
      }
    };
    
    // Trigger site deploy for SSG regeneration
    const triggerSiteDeploy = async () => {
      try {
        console.log('[generate-blog-post] Triggering site deploy for SSG regeneration');
        
        const response = await fetch(`${supabaseUrl}/functions/v1/trigger-site-deploy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            post_id: newPost.id,
            trigger_reason: 'blog_published'
          }),
        });
        
        const result = await response.json();
        console.log('[generate-blog-post] Site deploy trigger result:', result);
      } catch (error) {
        console.error('[generate-blog-post] Site deploy trigger error:', error);
      }
    };
    
    // Trigger SEO auto-indexer for immediate indexing of new post
    const triggerSEOIndexer = async () => {
      try {
        console.log('[generate-blog-post] Triggering SEO auto-indexer for new post');
        const response = await fetch(`${supabaseUrl}/functions/v1/seo-auto-indexer`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ trigger: 'new_post', slug: newPost.slug }),
        });
        const result = await response.json();
        console.log('[generate-blog-post] SEO indexer result:', result);
      } catch (error) {
        console.error('[generate-blog-post] SEO indexer error:', error);
      }
    };

    // ═══ vInfinity CAPA 7: Post-publish interlinking ═══
    // Update 3 old high-traffic posts with links to new post
    const triggerPostPublishInterlinking = async () => {
      try {
        console.log('[generate-blog-post] vInfinity CAPA 7: Post-publish interlinking...');
        // Get 3 recent posts from same pillar that DON'T already link to this post
        const { data: oldPosts } = await supabase
          .from('blog_posts')
          .select('id, slug, content_md, pillar')
          .eq('status', 'published')
          .eq('pillar', selectedTopic!.pillar)
          .neq('slug', postSlug)
          .order('publish_at', { ascending: false })
          .limit(5);
        
        let linkedCount = 0;
        for (const oldPost of (oldPosts || [])) {
          if (linkedCount >= 3) break;
          // Skip if already links to new post
          if (oldPost.content_md?.includes(postSlug)) continue;
          
          // Find best insertion point: before "## Próximos" or "## Preguntas frecuentes" or end
          let updatedMd = oldPost.content_md || '';
          const insertionPatterns = [
            /^## Próximos/m,
            /^## Preguntas frecuentes/m,
            /^## Para profundizar/m,
          ];
          
          let inserted = false;
          const linkBlock = `\n\n> 📖 Te puede interesar: [${selectedTopic!.title_base}](${BLOG_DOMAIN}/${postSlug}/)\n`;
          
          for (const pattern of insertionPatterns) {
            const match = updatedMd.match(pattern);
            if (match && match.index !== undefined) {
              updatedMd = updatedMd.slice(0, match.index) + linkBlock + '\n' + updatedMd.slice(match.index);
              inserted = true;
              break;
            }
          }
          
          if (!inserted) {
            updatedMd += linkBlock;
          }
          
          await supabase.from('blog_posts').update({ 
            content_md: updatedMd,
            updated_at: new Date().toISOString()
          }).eq('id', oldPost.id);
          
          linkedCount++;
          console.log(`[generate-blog-post] Added interlink in: ${oldPost.slug} → ${postSlug}`);
        }
        
        console.log(`[generate-blog-post] vInfinity CAPA 7: Added ${linkedCount} interlinks from old posts`);
      } catch (error) {
        console.error('[generate-blog-post] Interlinking error:', error);
      }
    };

    // Trigger production truth audit on the new post
    const triggerProductionTruthAudit = async () => {
      try {
        console.log('[generate-blog-post] Triggering production truth audit for:', postSlug);
        await fetch(`${supabaseUrl}/functions/v1/production-truth-audit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slug: postSlug, limit: 1, mode: 'single' }),
        });
      } catch (error) {
        console.error('[generate-blog-post] Production truth audit error:', error);
      }
    };

    // Fire all tasks in parallel - don't await
    Promise.all([
      triggerOGGeneration().catch(err => console.error('[generate-blog-post] OG background error:', err)),
      triggerLinkedInPublish().catch(err => console.error('[generate-blog-post] LinkedIn background error:', err)),
      triggerSiteDeploy().catch(err => console.error('[generate-blog-post] Deploy background error:', err)),
      triggerSEOIndexer().catch(err => console.error('[generate-blog-post] SEO background error:', err)),
      triggerPostPublishInterlinking().catch(err => console.error('[generate-blog-post] Interlinking background error:', err)),
      triggerProductionTruthAudit().catch(err => console.error('[generate-blog-post] Truth audit background error:', err))
    ]);

    return new Response(JSON.stringify({
      success: true,
      post: {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        region: 'LATAM',
        pillar: selectedTopic.pillar,
        url: `/blog/${newPost.slug}`,
        hero_image: !!heroImageUrl
      },
      quality_gate: qualityGateReport,
      linkedin_queued: true
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('[generate-blog-post] Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
