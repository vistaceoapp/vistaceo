// Construcción e Inmobiliario - 18 Business Types
// Ultra-specific questionnaires with QUICK (12-15) and FULL (65-75) modes
// 12 mandatory categories + branching + brain mapping + mission triggers

export interface ConstruccionQuestion {
  id: string;
  category: string;
  question: string;
  type: 'single_choice' | 'multi_choice' | 'scale_1_10' | 'number' | 'currency' | 'text_short' | 'text_long' | 'date' | 'percentage';
  options?: string[];
  required: boolean;
  validation: { min?: number; max?: number; rule: string };
  maps_to_brain: string;
  why_it_matters: string;
  mission_triggers: string[];
  branching?: Array<{
    if: { question_id: string; operator: string; value: string | number };
    then_ask: string[];
    else_ask: string[];
  }>;
}

export interface ConstruccionQuestionnaire {
  meta: {
    country: string;
    language: string;
    timezone: string;
    sector: string;
    business_type: string;
    micro_variant: string | null;
    migration_mode: string;
    currency: {
      local_currency: string;
      allow_currency_switch: boolean;
      preferred_reporting_currency: string | null;
    };
    versioning: {
      quick_questions_target: string;
      full_questions_target: string;
    };
  };
  quick: { questions: ConstruccionQuestion[] };
  full: { questions: ConstruccionQuestion[] };
}

// 18 Business Types for Construcción e Inmobiliario
export const CONSTRUCCION_BUSINESS_TYPES = [
  'constructora_residencial',
  'constructora_comercial',
  'arquitectura',
  'ingenieria_civil',
  'inmobiliaria_ventas',
  'inmobiliaria_alquileres',
  'desarrolladora',
  'reformas_integrales',
  'demolicion',
  'movimiento_suelos',
  'estructuras_metalicas',
  'instalaciones_especiales',
  'impermeabilizacion',
  'pisos_revestimientos',
  'techos_cubiertas',
  'piscinas',
  'paisajismo',
  'project_management'
] as const;

export type ConstruccionBusinessType = typeof CONSTRUCCION_BUSINESS_TYPES[number];

// ============================================
// CONSTRUCTORA RESIDENCIAL - QUICK MODE (15 questions)
// ============================================
const constructoraQuickQuestions: ConstruccionQuestion[] = [
  {
    id: 'CON_CONS_Q01',
    category: 'Identidad & posicionamiento',
    question: '¿Qué tipo de construcciones residenciales realizás principalmente?',
    type: 'multi_choice',
    options: ['Viviendas unifamiliares', 'Dúplex/tríplex', 'Edificios pequeños (hasta 4 pisos)', 'Countries/barrios cerrados', 'Reformas mayores', 'Ampliaciones', 'Llave en mano'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.servicios.tipos_construccion',
    why_it_matters: 'Define tu nicho y competencias core',
    mission_triggers: ['especializar_nicho', 'desarrollar_portfolio']
  },
  {
    id: 'CON_CONS_Q02',
    category: 'Oferta & precios',
    question: '¿Cuál es el precio promedio por m² de construcción que manejás?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.precio_m2_local_amount',
    why_it_matters: 'KPI central para presupuestos y rentabilidad',
    mission_triggers: ['optimizar_costos_m2', 'ajustar_pricing_mercado']
  },
  {
    id: 'CON_CONS_Q03',
    category: 'Cliente ideal & demanda',
    question: '¿Quiénes son tus clientes principales?',
    type: 'single_choice',
    options: ['Familias que construyen su casa', 'Inversores inmobiliarios', 'Desarrolladoras (subcontrato)', 'Empresas/comercios', 'Mixto equilibrado'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.segmento_principal',
    why_it_matters: 'Cada segmento tiene necesidades y ciclos distintos',
    mission_triggers: ['profundizar_segmento', 'diversificar_clientes']
  },
  {
    id: 'CON_CONS_Q04',
    category: 'Ventas & conversión',
    question: '¿Cuántos presupuestos presentás por mes en promedio?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.presupuestos_mes',
    why_it_matters: 'Mide actividad comercial y potencial de cierre',
    mission_triggers: ['aumentar_pipeline', 'mejorar_calidad_leads']
  },
  {
    id: 'CON_CONS_Q05',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu facturación mensual promedio?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.facturacion_mensual_local_amount',
    why_it_matters: 'KPI principal del negocio',
    mission_triggers: ['aumentar_facturacion', 'estabilizar_flujo']
  },
  {
    id: 'CON_CONS_Q06',
    category: 'Operaciones & capacidad',
    question: '¿Cuántas obras podés manejar simultáneamente?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 50, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.capacidad_obras_simultaneas',
    why_it_matters: 'Define techo de ingresos y necesidad de estructura',
    mission_triggers: ['escalar_capacidad', 'optimizar_gestion_multiobra']
  },
  {
    id: 'CON_CONS_Q07',
    category: 'Marketing & adquisición',
    question: '¿Cómo llegan la mayoría de tus clientes?',
    type: 'single_choice',
    options: ['Recomendación de clientes', 'Arquitectos/estudios', 'Redes sociales', 'Web/Google', 'Inmobiliarias', 'Licitaciones', 'Desarrolladoras'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.canal_principal',
    why_it_matters: 'Invertir en lo que genera resultados',
    mission_triggers: ['potenciar_canal_ganador', 'desarrollar_alianzas']
  },
  {
    id: 'CON_CONS_Q08',
    category: 'Retención & experiencia',
    question: '¿Qué porcentaje de clientes te recomiendan o vuelven a contratar?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.retencion.tasa_referidos_recompra',
    why_it_matters: 'Mide satisfacción real y potencial de crecimiento orgánico',
    mission_triggers: ['programa_referidos', 'mejorar_experiencia_cliente']
  },
  {
    id: 'CON_CONS_Q09',
    category: 'Equipo & roles',
    question: '¿Cuántas personas tiene tu equipo estable (sin subcontratistas)?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.equipo.tamaño_estable',
    why_it_matters: 'Define complejidad organizacional',
    mission_triggers: ['estructurar_equipo', 'optimizar_plantilla']
  },
  {
    id: 'CON_CONS_Q10',
    category: 'Tecnología & integraciones',
    question: '¿Qué herramientas usás para gestionar obras?',
    type: 'multi_choice',
    options: ['Excel/planillas', 'Software de gestión (Obra, Procore, etc)', 'AutoCAD/Revit', 'WhatsApp grupos', 'Trello/Notion', 'ERP completo', 'Ninguna específica'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.tecnologia.herramientas_gestion',
    why_it_matters: 'Digitalización = control y eficiencia',
    mission_triggers: ['implementar_software_obras', 'integrar_herramientas']
  },
  {
    id: 'CON_CONS_Q11',
    category: 'Objetivos del dueño',
    question: '¿Cuál es tu principal objetivo este año?',
    type: 'single_choice',
    options: ['Duplicar facturación', 'Aumentar margen', 'Construir equipo sólido', 'Diversificar servicios', 'Estabilizar y ordenar', 'Menos estrés/mejor vida'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.meta_anual',
    why_it_matters: 'Orienta todas las recomendaciones',
    mission_triggers: ['plan_estrategico_anual', 'roadmap_objetivos']
  },
  {
    id: 'CON_CONS_Q12',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Cuál es tu mayor riesgo operativo actual?',
    type: 'single_choice',
    options: ['Aumentos de materiales', 'Retrasos en obra', 'Falta de mano de obra', 'Problemas de cobro', 'Accidentes laborales', 'Permisos/habilitaciones'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.riesgo_operativo_principal',
    why_it_matters: 'Mitigar riesgo crítico primero',
    mission_triggers: ['plan_mitigacion_riesgo', 'crear_contingencias']
  },
  {
    id: 'CON_CONS_Q13',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu margen bruto promedio por obra?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.margen_bruto_pct',
    why_it_matters: 'Rentabilidad real del negocio',
    mission_triggers: ['optimizar_margen', 'controlar_costos']
  },
  {
    id: 'CON_CONS_Q14',
    category: 'Ventas & conversión',
    question: 'De cada 10 presupuestos, ¿cuántos cerrás?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 10, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.tasa_cierre',
    why_it_matters: 'Eficiencia comercial',
    mission_triggers: ['mejorar_tasa_cierre', 'calificar_mejor_leads']
  },
  {
    id: 'CON_CONS_Q15',
    category: 'Operaciones & capacidad',
    question: '¿Cuál es la duración promedio de tus obras en meses?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 60, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.duracion_promedio_meses',
    why_it_matters: 'Afecta flujo de caja y planificación',
    mission_triggers: ['optimizar_tiempos', 'mejorar_planificacion']
  }
];

// ============================================
// CONSTRUCTORA RESIDENCIAL - FULL MODE (70 questions)
// ============================================
const constructoraFullQuestions: ConstruccionQuestion[] = [
  // Identidad & posicionamiento (6 questions)
  {
    id: 'CON_CONS_F01',
    category: 'Identidad & posicionamiento',
    question: '¿Qué tipo de construcciones residenciales realizás?',
    type: 'multi_choice',
    options: ['Viviendas unifamiliares', 'Dúplex/tríplex', 'Edificios hasta 4 pisos', 'Edificios +4 pisos', 'Countries', 'Reformas mayores', 'Ampliaciones', 'Llave en mano'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.servicios.tipos_construccion',
    why_it_matters: 'Define especialización y mercado objetivo',
    mission_triggers: ['especializar_nicho', 'ampliar_servicios']
  },
  {
    id: 'CON_CONS_F02',
    category: 'Identidad & posicionamiento',
    question: '¿Cuántos años lleva operando la constructora?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.identidad.años_operacion',
    why_it_matters: 'Experiencia = credibilidad',
    mission_triggers: ['comunicar_trayectoria', 'caso_exito_años']
  },
  {
    id: 'CON_CONS_F03',
    category: 'Identidad & posicionamiento',
    question: '¿Tenés habilitación como empresa constructora?',
    type: 'single_choice',
    options: ['Sí, categoría A', 'Sí, categoría B/C', 'En trámite', 'Trabajo como subcontratista', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.habilitacion_constructora',
    why_it_matters: 'Requisito para obras de mayor envergadura',
    mission_triggers: ['obtener_habilitacion', 'subir_categoria'],
    branching: [
      { if: { question_id: 'CON_CONS_F03', operator: 'equals', value: 'No' }, then_ask: ['CON_CONS_F04'], else_ask: [] }
    ]
  },
  {
    id: 'CON_CONS_F04',
    category: 'Identidad & posicionamiento',
    question: '¿Por qué no tenés habilitación todavía?',
    type: 'single_choice',
    options: ['Costo del trámite', 'Requisitos técnicos', 'Trabajo suficiente sin ella', 'Desconozco el proceso', 'Prefiero subcontratar'],
    required: false,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.motivo_sin_habilitacion',
    why_it_matters: 'Identificar bloqueantes para crecimiento',
    mission_triggers: ['guia_habilitacion', 'evaluar_necesidad']
  },
  {
    id: 'CON_CONS_F05',
    category: 'Identidad & posicionamiento',
    question: '¿En qué zonas geográficas trabajás principalmente?',
    type: 'text_short',
    required: true,
    validation: { rule: 'min_3_chars' },
    maps_to_brain: 'brain.identidad.zona_operacion',
    why_it_matters: 'Define mercado y competencia',
    mission_triggers: ['mapear_competencia', 'expandir_zona']
  },
  {
    id: 'CON_CONS_F06',
    category: 'Identidad & posicionamiento',
    question: '¿Cuál es tu diferenciador principal vs competencia?',
    type: 'single_choice',
    options: ['Precio competitivo', 'Calidad superior', 'Cumplimiento de plazos', 'Diseño/arquitectura', 'Servicio personalizado', 'Experiencia/trayectoria', 'Garantías extendidas'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.diferenciador',
    why_it_matters: 'Propuesta de valor única',
    mission_triggers: ['comunicar_diferenciador', 'fortalecer_propuesta']
  },
  
  // Oferta & precios (6 questions)
  {
    id: 'CON_CONS_F07',
    category: 'Oferta & precios',
    question: '¿Cuál es tu precio por m² de construcción tradicional?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.precio_m2_tradicional_local_amount',
    why_it_matters: 'Benchmark vs mercado',
    mission_triggers: ['ajustar_pricing', 'analizar_competencia_precios']
  },
  {
    id: 'CON_CONS_F08',
    category: 'Oferta & precios',
    question: '¿Cómo estructurás los pagos con clientes?',
    type: 'single_choice',
    options: ['Anticipo + avance de obra', 'Cuotas fijas mensuales', 'Hitos/entregables', 'Financiación propia', 'Depende del cliente', 'Todo al final'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.estructura_pagos',
    why_it_matters: 'Impacta flujo de caja y riesgo',
    mission_triggers: ['optimizar_estructura_pagos', 'reducir_riesgo_cobro']
  },
  {
    id: 'CON_CONS_F09',
    category: 'Oferta & precios',
    question: '¿Qué porcentaje de anticipo solicitás normalmente?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.precios.anticipo_pct',
    why_it_matters: 'Financia inicio y reduce riesgo',
    mission_triggers: ['ajustar_anticipo', 'justificar_anticipo']
  },
  {
    id: 'CON_CONS_F10',
    category: 'Oferta & precios',
    question: '¿Incluís ajuste por inflación en los contratos?',
    type: 'single_choice',
    options: ['Sí, CAC mensual', 'Sí, otro índice', 'Sí, pero informal', 'Presupuesto cerrado en USD', 'No, precio fijo ARS'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.politica_ajuste',
    why_it_matters: 'Crítico en contexto inflacionario',
    mission_triggers: ['implementar_clausula_ajuste', 'comunicar_ajustes']
  },
  {
    id: 'CON_CONS_F11',
    category: 'Oferta & precios',
    question: '¿Ofrecés llave en mano o solo construcción?',
    type: 'single_choice',
    options: ['Solo construcción', 'Llave en mano completo', 'Ambos según cliente', 'Llave en mano + amoblamiento'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.servicios.modalidad_entrega',
    why_it_matters: 'Llave en mano = mayor ticket',
    mission_triggers: ['desarrollar_llave_en_mano', 'alianzas_complementarias']
  },
  {
    id: 'CON_CONS_F12',
    category: 'Oferta & precios',
    question: '¿Cada cuánto actualizás tu lista de precios?',
    type: 'single_choice',
    options: ['Semanal', 'Quincenal', 'Mensual', 'Trimestral', 'Cuando suben materiales', 'No tengo lista fija'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.frecuencia_actualizacion',
    why_it_matters: 'Precio actualizado = margen protegido',
    mission_triggers: ['sistematizar_actualizacion_precios', 'alertas_costos']
  },
  
  // Cliente ideal & demanda (6 questions)
  {
    id: 'CON_CONS_F13',
    category: 'Cliente ideal & demanda',
    question: '¿Quiénes son tus clientes principales?',
    type: 'single_choice',
    options: ['Familias (su propia casa)', 'Inversores individuales', 'Desarrolladoras', 'Empresas/comercios', 'Gobierno/licitaciones', 'Mixto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.segmento_principal',
    why_it_matters: 'Cada segmento tiene dinámicas distintas',
    mission_triggers: ['profundizar_segmento', 'diversificar_cartera']
  },
  {
    id: 'CON_CONS_F14',
    category: 'Cliente ideal & demanda',
    question: '¿Cuál es el rango de presupuesto típico de tus obras?',
    type: 'single_choice',
    options: ['Hasta USD 50K', 'USD 50-100K', 'USD 100-250K', 'USD 250-500K', 'USD 500K-1M', 'Más de USD 1M'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.ticket_promedio_rango',
    why_it_matters: 'Define target y estrategia comercial',
    mission_triggers: ['ajustar_target', 'subir_ticket_promedio']
  },
  {
    id: 'CON_CONS_F15',
    category: 'Cliente ideal & demanda',
    question: '¿Qué porcentaje de clientes vienen con proyecto/planos?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.clientes.con_proyecto_pct',
    why_it_matters: 'Sin proyecto = oportunidad de servicio integral',
    mission_triggers: ['alianza_arquitectos', 'servicio_proyecto_incluido']
  },
  {
    id: 'CON_CONS_F16',
    category: 'Cliente ideal & demanda',
    question: '¿Cuál es la principal motivación de tus clientes?',
    type: 'single_choice',
    options: ['Vivienda propia', 'Inversión/renta', 'Ampliación familia', 'Mudanza de zona', 'Upgrade de vivienda', 'Negocio/local'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.motivacion_principal',
    why_it_matters: 'Adaptar mensaje y propuesta',
    mission_triggers: ['personalizar_propuesta', 'marketing_por_motivacion']
  },
  {
    id: 'CON_CONS_F17',
    category: 'Cliente ideal & demanda',
    question: '¿Cuántas consultas/leads recibís por mes?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.demanda.leads_mes',
    why_it_matters: 'Mide demanda del mercado',
    mission_triggers: ['aumentar_leads', 'calificar_leads']
  },
  {
    id: 'CON_CONS_F18',
    category: 'Cliente ideal & demanda',
    question: '¿Cuál es el ciclo de decisión típico del cliente?',
    type: 'single_choice',
    options: ['Menos de 1 mes', '1-3 meses', '3-6 meses', '6-12 meses', 'Más de 1 año'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.ciclo_decision',
    why_it_matters: 'Planificar seguimiento y pipeline',
    mission_triggers: ['optimizar_seguimiento', 'nurturing_largo_plazo']
  },
  
  // Ventas & conversión (6 questions)
  {
    id: 'CON_CONS_F19',
    category: 'Ventas & conversión',
    question: '¿Cuántos presupuestos presentás por mes?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.presupuestos_mes',
    why_it_matters: 'Actividad comercial',
    mission_triggers: ['aumentar_cotizaciones', 'optimizar_tiempo_comercial']
  },
  {
    id: 'CON_CONS_F20',
    category: 'Ventas & conversión',
    question: 'De cada 10 presupuestos, ¿cuántos cerrás?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 10, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.tasa_cierre',
    why_it_matters: 'Eficiencia comercial',
    mission_triggers: ['mejorar_cierre', 'analizar_perdidos']
  },
  {
    id: 'CON_CONS_F21',
    category: 'Ventas & conversión',
    question: '¿Cuál es la objeción más común para no cerrar?',
    type: 'single_choice',
    options: ['Precio alto', 'Plazos largos', 'Falta de confianza', 'Comparan con otros', 'No consiguen financiamiento', 'Postergan el proyecto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.objecion_principal',
    why_it_matters: 'Resolver objeción = más cierres',
    mission_triggers: ['respuestas_objeciones', 'ajustar_propuesta']
  },
  {
    id: 'CON_CONS_F22',
    category: 'Ventas & conversión',
    question: '¿Cómo presentás los presupuestos?',
    type: 'single_choice',
    options: ['Documento detallado profesional', 'Excel con items', 'Propuesta simplificada', 'Verbal + WhatsApp', 'Software especializado'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.formato_presupuesto',
    why_it_matters: 'Presentación profesional = más confianza',
    mission_triggers: ['mejorar_presentacion', 'estandarizar_propuestas']
  },
  {
    id: 'CON_CONS_F23',
    category: 'Ventas & conversión',
    question: '¿Hacés seguimiento a presupuestos no cerrados?',
    type: 'single_choice',
    options: ['Sistemático (CRM)', 'Manual pero constante', 'A veces', 'Rara vez', 'Nunca'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.seguimiento',
    why_it_matters: 'Seguimiento recupera hasta 30% de perdidos',
    mission_triggers: ['implementar_seguimiento', 'automatizar_recordatorios']
  },
  {
    id: 'CON_CONS_F24',
    category: 'Ventas & conversión',
    question: '¿Cuánto tiempo te lleva armar un presupuesto completo?',
    type: 'single_choice',
    options: ['Menos de 1 día', '1-3 días', '4-7 días', '1-2 semanas', 'Más de 2 semanas'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.tiempo_presupuesto',
    why_it_matters: 'Velocidad = ventaja competitiva',
    mission_triggers: ['acelerar_cotizaciones', 'templates_presupuesto']
  },
  
  // Finanzas & márgenes (7 questions)
  {
    id: 'CON_CONS_F25',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu facturación mensual promedio?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.facturacion_mensual_local_amount',
    why_it_matters: 'KPI principal del negocio',
    mission_triggers: ['aumentar_facturacion', 'estabilizar_ingresos']
  },
  {
    id: 'CON_CONS_F26',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu margen bruto promedio por obra?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.margen_bruto_pct',
    why_it_matters: 'Rentabilidad antes de gastos fijos',
    mission_triggers: ['mejorar_margen', 'control_costos']
  },
  {
    id: 'CON_CONS_F27',
    category: 'Finanzas & márgenes',
    question: '¿Qué porcentaje representan los materiales del costo total?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.materiales_pct',
    why_it_matters: 'Mayor costo variable típico',
    mission_triggers: ['negociar_proveedores', 'alianzas_materiales']
  },
  {
    id: 'CON_CONS_F28',
    category: 'Finanzas & márgenes',
    question: '¿Qué porcentaje representa la mano de obra?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.mano_obra_pct',
    why_it_matters: 'Segundo costo más importante',
    mission_triggers: ['optimizar_productividad', 'evaluar_subcontratos']
  },
  {
    id: 'CON_CONS_F29',
    category: 'Finanzas & márgenes',
    question: '¿Tenés problemas de flujo de caja?',
    type: 'single_choice',
    options: ['Nunca, muy ordenado', 'Ocasionalmente', 'Frecuentemente', 'Es mi mayor problema'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.finanzas.problema_flujo',
    why_it_matters: 'Flujo sano = negocio sostenible',
    mission_triggers: ['mejorar_flujo_caja', 'estructurar_pagos']
  },
  {
    id: 'CON_CONS_F30',
    category: 'Finanzas & márgenes',
    question: '¿Cuántos días de crédito te dan los proveedores?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 180, rule: 'reasonable_range' },
    maps_to_brain: 'brain.finanzas.dias_credito_proveedores',
    why_it_matters: 'Financia capital de trabajo',
    mission_triggers: ['negociar_credito', 'diversificar_proveedores']
  },
  {
    id: 'CON_CONS_F31',
    category: 'Finanzas & márgenes',
    question: '¿Tenés contador/asesor financiero especializado en construcción?',
    type: 'single_choice',
    options: ['Sí, especializado', 'Sí, genérico', 'Solo para impuestos', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.finanzas.asesor_financiero',
    why_it_matters: 'Asesoría especializada = mejores decisiones',
    mission_triggers: ['buscar_asesor_especializado', 'mejorar_control_financiero']
  },
  
  // Operaciones & capacidad (7 questions)
  {
    id: 'CON_CONS_F32',
    category: 'Operaciones & capacidad',
    question: '¿Cuántas obras podés manejar simultáneamente?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 50, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.capacidad_simultanea',
    why_it_matters: 'Define techo de ingresos',
    mission_triggers: ['escalar_capacidad', 'optimizar_gestion']
  },
  {
    id: 'CON_CONS_F33',
    category: 'Operaciones & capacidad',
    question: '¿Cuántas obras tenés activas actualmente?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.obras_activas',
    why_it_matters: 'Capacidad utilizada vs disponible',
    mission_triggers: ['llenar_capacidad', 'priorizar_obras']
  },
  {
    id: 'CON_CONS_F34',
    category: 'Operaciones & capacidad',
    question: '¿Cuál es la duración promedio de tus obras?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 60, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.duracion_promedio_meses',
    why_it_matters: 'Planificación y flujo de caja',
    mission_triggers: ['reducir_tiempos', 'mejorar_planificacion']
  },
  {
    id: 'CON_CONS_F35',
    category: 'Operaciones & capacidad',
    question: '¿Qué tan frecuentes son los retrasos en obra?',
    type: 'single_choice',
    options: ['Muy raro (<5%)', 'Ocasional (10-20%)', 'Frecuente (30-50%)', 'Casi siempre (>50%)'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.frecuencia_retrasos',
    why_it_matters: 'Cumplimiento = reputación',
    mission_triggers: ['reducir_retrasos', 'mejorar_estimaciones']
  },
  {
    id: 'CON_CONS_F36',
    category: 'Operaciones & capacidad',
    question: '¿Tenés depósito/obrador propio?',
    type: 'single_choice',
    options: ['Sí, propio', 'Alquilado', 'En cada obra', 'No tengo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.deposito',
    why_it_matters: 'Logística y almacenamiento',
    mission_triggers: ['optimizar_logistica', 'evaluar_deposito']
  },
  {
    id: 'CON_CONS_F37',
    category: 'Operaciones & capacidad',
    question: '¿Qué equipamiento propio tenés?',
    type: 'multi_choice',
    options: ['Mixer/hormigonera', 'Andamios', 'Herramientas eléctricas', 'Vehículos', 'Grúa/elevador', 'Encofrados', 'Mínimo'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.operaciones.equipamiento_propio',
    why_it_matters: 'Equipamiento = independencia y margen',
    mission_triggers: ['evaluar_inversiones', 'plan_equipamiento']
  },
  {
    id: 'CON_CONS_F38',
    category: 'Operaciones & capacidad',
    question: '¿Cómo manejás la compra de materiales?',
    type: 'single_choice',
    options: ['Compra centralizada', 'Por obra', 'Cliente compra algunos', 'Subcontratistas compran', 'Mixto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.gestion_compras',
    why_it_matters: 'Compra centralizada = mejores precios',
    mission_triggers: ['centralizar_compras', 'negociar_volumen']
  },
  
  // Marketing & adquisición (6 questions)
  {
    id: 'CON_CONS_F39',
    category: 'Marketing & adquisición',
    question: '¿Cuál es tu principal fuente de clientes?',
    type: 'single_choice',
    options: ['Referidos de clientes', 'Arquitectos/estudios', 'Redes sociales', 'Google/web', 'Inmobiliarias', 'Licitaciones', 'Desarrolladoras'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.fuente_principal',
    why_it_matters: 'Invertir donde funciona',
    mission_triggers: ['potenciar_canal', 'desarrollar_alianzas']
  },
  {
    id: 'CON_CONS_F40',
    category: 'Marketing & adquisición',
    question: '¿Tenés portfolio de obras profesional?',
    type: 'single_choice',
    options: ['Sí, web profesional', 'Sí, en redes', 'PDF/presentación', 'Fotos en celular', 'No tengo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.portfolio',
    why_it_matters: 'Portfolio = credencial de ventas',
    mission_triggers: ['crear_portfolio', 'mejorar_presentacion']
  },
  {
    id: 'CON_CONS_F41',
    category: 'Marketing & adquisición',
    question: '¿Cuántas reseñas/testimonios tenés de clientes?',
    type: 'number',
    required: false,
    validation: { min: 0, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.marketing.testimonios_cant',
    why_it_matters: 'Social proof = confianza',
    mission_triggers: ['recolectar_testimonios', 'publicar_casos_exito']
  },
  {
    id: 'CON_CONS_F42',
    category: 'Marketing & adquisición',
    question: '¿Usás redes sociales para el negocio?',
    type: 'multi_choice',
    options: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok', 'Pinterest', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.marketing.redes_sociales',
    why_it_matters: 'Presencia digital = leads',
    mission_triggers: ['estrategia_redes', 'contenido_obras']
  },
  {
    id: 'CON_CONS_F43',
    category: 'Marketing & adquisición',
    question: '¿Cuánto invertís en marketing por mes?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.marketing.inversion_mensual_local_amount',
    why_it_matters: 'ROI de marketing',
    mission_triggers: ['optimizar_inversion', 'testear_canales']
  },
  {
    id: 'CON_CONS_F44',
    category: 'Marketing & adquisición',
    question: '¿Tenés alianzas comerciales formales?',
    type: 'multi_choice',
    options: ['Arquitectos', 'Inmobiliarias', 'Bancos/financieras', 'Corralones', 'Desarrolladoras', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.marketing.alianzas',
    why_it_matters: 'Alianzas = flujo constante',
    mission_triggers: ['desarrollar_alianzas', 'formalizar_acuerdos']
  },
  
  // Retención & experiencia (6 questions)
  {
    id: 'CON_CONS_F45',
    category: 'Retención & experiencia',
    question: '¿Qué porcentaje de clientes te recomiendan?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.retencion.tasa_referidos',
    why_it_matters: 'Mejor CAC posible',
    mission_triggers: ['programa_referidos', 'incentivar_recomendaciones']
  },
  {
    id: 'CON_CONS_F46',
    category: 'Retención & experiencia',
    question: '¿Ofrecés garantía post-entrega?',
    type: 'single_choice',
    options: ['12 meses estructural + 6 terminaciones', '24 meses todo', 'Solo lo legal', 'Garantía verbal', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.garantia_post_entrega',
    why_it_matters: 'Garantía = diferenciador y confianza',
    mission_triggers: ['formalizar_garantias', 'comunicar_garantia']
  },
  {
    id: 'CON_CONS_F47',
    category: 'Retención & experiencia',
    question: '¿Cómo informás avance de obra al cliente?',
    type: 'single_choice',
    options: ['Reuniones semanales', 'Fotos diarias WhatsApp', 'App/plataforma', 'Cuando preguntan', 'Mensualmente'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.comunicacion_avance',
    why_it_matters: 'Comunicación = satisfacción',
    mission_triggers: ['mejorar_comunicacion', 'implementar_reportes']
  },
  {
    id: 'CON_CONS_F48',
    category: 'Retención & experiencia',
    question: '¿Cuál es la queja más frecuente de clientes?',
    type: 'single_choice',
    options: ['Demoras', 'Calidad terminaciones', 'Comunicación', 'Adicionales no previstos', 'Limpieza obra', 'Casi no tengo quejas'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.queja_frecuente',
    why_it_matters: 'Resolver queja común = mejor NPS',
    mission_triggers: ['resolver_pain', 'mejorar_proceso']
  },
  {
    id: 'CON_CONS_F49',
    category: 'Retención & experiencia',
    question: '¿Hacés entrega formal con documentación?',
    type: 'single_choice',
    options: ['Acta + manuales + planos', 'Solo acta', 'Informal', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.entrega_formal',
    why_it_matters: 'Entrega profesional = cierre limpio',
    mission_triggers: ['implementar_protocolo_entrega', 'documentar_entregas']
  },
  {
    id: 'CON_CONS_F50',
    category: 'Retención & experiencia',
    question: '¿Mantenés contacto post-entrega?',
    type: 'single_choice',
    options: ['Seguimiento activo', 'Solo si llaman', 'Visita anual', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.seguimiento_post_entrega',
    why_it_matters: 'Postventa genera referidos',
    mission_triggers: ['implementar_postventa', 'automatizar_seguimiento']
  },
  
  // Equipo & roles (6 questions)
  {
    id: 'CON_CONS_F51',
    category: 'Equipo & roles',
    question: '¿Cuántas personas tiene tu equipo estable?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.equipo.tamaño_estable',
    why_it_matters: 'Estructura organizacional',
    mission_triggers: ['estructurar_equipo', 'planificar_crecimiento']
  },
  {
    id: 'CON_CONS_F52',
    category: 'Equipo & roles',
    question: '¿Qué roles tenés cubiertos?',
    type: 'multi_choice',
    options: ['Director/dueño', 'Arquitecto/proyectista', 'Jefe de obra', 'Capataz', 'Administrativo', 'Comercial', 'Compras', 'RRHH'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.equipo.roles_cubiertos',
    why_it_matters: 'Identificar vacíos organizacionales',
    mission_triggers: ['completar_organigrama', 'definir_roles']
  },
  {
    id: 'CON_CONS_F53',
    category: 'Equipo & roles',
    question: '¿Cuántos operarios usás por obra típica?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.equipo.operarios_por_obra',
    why_it_matters: 'Productividad y costos',
    mission_triggers: ['optimizar_cuadrillas', 'medir_productividad']
  },
  {
    id: 'CON_CONS_F54',
    category: 'Equipo & roles',
    question: '¿Qué porcentaje de mano de obra es propia vs subcontratada?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.equipo.mano_obra_propia_pct',
    why_it_matters: 'Flexibilidad vs control',
    mission_triggers: ['evaluar_modelo_mano_obra', 'optimizar_subcontratos']
  },
  {
    id: 'CON_CONS_F55',
    category: 'Equipo & roles',
    question: '¿Cuál es tu mayor desafío con el personal?',
    type: 'single_choice',
    options: ['Encontrar gente calificada', 'Retener personal', 'Ausentismo', 'Productividad', 'Capacitación', 'Ninguno grave'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.desafio_principal',
    why_it_matters: 'Resolver bloqueante de crecimiento',
    mission_triggers: ['resolver_desafio_rrhh', 'mejorar_gestion_personas']
  },
  {
    id: 'CON_CONS_F56',
    category: 'Equipo & roles',
    question: '¿Tenés ART y seguros al día?',
    type: 'single_choice',
    options: ['Todo en regla', 'Parcialmente', 'Solo lo mínimo', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.seguros_laborales',
    why_it_matters: 'Cumplimiento legal y protección',
    mission_triggers: ['regularizar_seguros', 'auditar_cumplimiento']
  },
  
  // Tecnología & integraciones (6 questions)
  {
    id: 'CON_CONS_F57',
    category: 'Tecnología & integraciones',
    question: '¿Qué software usás para gestionar obras?',
    type: 'multi_choice',
    options: ['Procore', 'Obra/Bricks', 'Monday/Asana', 'Excel avanzado', 'AutoCAD/Revit', 'ERP (SAP, etc)', 'Ninguno específico'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.tecnologia.software_gestion',
    why_it_matters: 'Digitalización = eficiencia',
    mission_triggers: ['implementar_software', 'migrar_herramientas']
  },
  {
    id: 'CON_CONS_F58',
    category: 'Tecnología & integraciones',
    question: '¿Usás metodología BIM?',
    type: 'single_choice',
    options: ['Sí, completo', 'En algunos proyectos', 'En implementación', 'No, pero interesa', 'No aplica'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.bim',
    why_it_matters: 'BIM = menos errores y retrabajos',
    mission_triggers: ['implementar_bim', 'capacitar_equipo_bim']
  },
  {
    id: 'CON_CONS_F59',
    category: 'Tecnología & integraciones',
    question: '¿Cómo gestionás presupuestos y costos?',
    type: 'single_choice',
    options: ['Software especializado', 'Excel con macros', 'Excel simple', 'Manual/papel', 'Contador externo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.gestion_costos',
    why_it_matters: 'Control de costos = margen',
    mission_triggers: ['digitalizar_costos', 'implementar_control']
  },
  {
    id: 'CON_CONS_F60',
    category: 'Tecnología & integraciones',
    question: '¿Tenés página web profesional?',
    type: 'single_choice',
    options: ['Sí, profesional y actualizada', 'Sí, básica', 'En desarrollo', 'Solo redes', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.web',
    why_it_matters: 'Web = credibilidad y SEO',
    mission_triggers: ['crear_web', 'optimizar_seo']
  },
  {
    id: 'CON_CONS_F61',
    category: 'Tecnología & integraciones',
    question: '¿Usás drones para inspección/seguimiento?',
    type: 'single_choice',
    options: ['Sí, propio', 'Sí, contratado', 'A veces', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.drones',
    why_it_matters: 'Drones = eficiencia en seguimiento',
    mission_triggers: ['evaluar_drones', 'modernizar_seguimiento']
  },
  {
    id: 'CON_CONS_F62',
    category: 'Tecnología & integraciones',
    question: '¿Qué tan digitalizada está tu operación del 1 al 10?',
    type: 'scale_1_10',
    required: true,
    validation: { min: 1, max: 10, rule: 'scale' },
    maps_to_brain: 'brain.tecnologia.nivel_digitalizacion',
    why_it_matters: 'Base para roadmap tecnológico',
    mission_triggers: ['plan_digitalizacion', 'priorizar_herramientas']
  },
  
  // Objetivos del dueño (4 questions)
  {
    id: 'CON_CONS_F63',
    category: 'Objetivos del dueño',
    question: '¿Cuál es tu objetivo principal este año?',
    type: 'single_choice',
    options: ['Duplicar facturación', 'Aumentar margen 20%+', 'Profesionalizar equipo', 'Diversificar servicios', 'Estabilizar operación', 'Menos estrés personal'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.meta_anual',
    why_it_matters: 'Orienta todo el plan',
    mission_triggers: ['plan_estrategico', 'roadmap_anual']
  },
  {
    id: 'CON_CONS_F64',
    category: 'Objetivos del dueño',
    question: '¿Cuál es tu objetivo de facturación anual?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.objetivos.facturacion_objetivo_local_amount',
    why_it_matters: 'Calcular brecha y plan',
    mission_triggers: ['gap_analysis', 'plan_ventas']
  },
  {
    id: 'CON_CONS_F65',
    category: 'Objetivos del dueño',
    question: '¿Dónde ves la empresa en 5 años?',
    type: 'single_choice',
    options: ['Constructora regional líder', 'Especializada en nicho', 'Desarrolladora propia', 'Franquiciar modelo', 'Vender el negocio', 'Mantener tamaño actual'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.vision_5_años',
    why_it_matters: 'Visión define estrategia',
    mission_triggers: ['plan_largo_plazo', 'inversiones_estrategicas']
  },
  {
    id: 'CON_CONS_F66',
    category: 'Objetivos del dueño',
    question: '¿Qué te frustra más del negocio?',
    type: 'single_choice',
    options: ['Flujo de caja inestable', 'Demasiadas horas', 'Personal poco confiable', 'Competencia desleal', 'Burocracia/permisos', 'Clientes difíciles'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.frustracion_principal',
    why_it_matters: 'Resolver dolor primero',
    mission_triggers: ['atacar_frustracion', 'quick_wins']
  },
  
  // Riesgos, estacionalidad y restricciones (4 questions)
  {
    id: 'CON_CONS_F67',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Cuál es tu mayor riesgo operativo?',
    type: 'single_choice',
    options: ['Aumentos de materiales', 'Retrasos significativos', 'Accidentes laborales', 'Falta de mano de obra', 'Problemas de cobro', 'Permisos/regulaciones'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.riesgo_operativo_principal',
    why_it_matters: 'Mitigar riesgo crítico',
    mission_triggers: ['plan_contingencia', 'seguros_adicionales']
  },
  {
    id: 'CON_CONS_F68',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Hay estacionalidad en tu demanda?',
    type: 'single_choice',
    options: ['Muy marcada', 'Algo de variación', 'Bastante estable', 'Contratemporada aprovecho'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.estacionalidad',
    why_it_matters: 'Planificar flujo y recursos',
    mission_triggers: ['suavizar_estacionalidad', 'marketing_temporada_baja']
  },
  {
    id: 'CON_CONS_F69',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Tenés seguros empresariales completos?',
    type: 'single_choice',
    options: ['RC + Todo riesgo + Caución', 'Solo RC', 'Lo básico', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.seguros_empresariales',
    why_it_matters: 'Protección financiera',
    mission_triggers: ['completar_seguros', 'evaluar_cobertura']
  },
  {
    id: 'CON_CONS_F70',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Qué pasa si perdés un cliente/obra grande?',
    type: 'single_choice',
    options: ['Tengo reservas para 6+ meses', 'Puedo cubrir 3 meses', 'Sería muy difícil', 'No lo soportaría'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.resiliencia_financiera',
    why_it_matters: 'Capacidad de absorber golpes',
    mission_triggers: ['crear_fondo_reserva', 'diversificar_cartera']
  }
];

// Generate questionnaires for all 18 business types
function generateConstruccionQuestionnaire(businessType: ConstruccionBusinessType): ConstruccionQuestionnaire {
  const baseQuickQuestions = constructoraQuickQuestions;
  const baseFullQuestions = constructoraFullQuestions;
  
  // Adapt questions based on business type
  const typePrefix = businessType.toUpperCase().substring(0, 4);
  
  const adaptedQuick = baseQuickQuestions.map(q => ({
    ...q,
    id: q.id.replace('CONS', typePrefix)
  }));
  
  const adaptedFull = baseFullQuestions.map(q => ({
    ...q,
    id: q.id.replace('CONS', typePrefix)
  }));
  
  return {
    meta: {
      country: 'AR',
      language: 'es-AR',
      timezone: 'America/Buenos_Aires',
      sector: 'construccion_inmobiliario',
      business_type: businessType,
      micro_variant: null,
      migration_mode: 'reuse_first',
      currency: {
        local_currency: 'ARS',
        allow_currency_switch: true,
        preferred_reporting_currency: null
      },
      versioning: {
        quick_questions_target: '12-15',
        full_questions_target: '65-75'
      }
    },
    quick: { questions: adaptedQuick },
    full: { questions: adaptedFull }
  };
}

// Export questionnaires for each business type
export const construccionQuestionnaires: Record<ConstruccionBusinessType, ConstruccionQuestionnaire> = 
  CONSTRUCCION_BUSINESS_TYPES.reduce((acc, type) => {
    acc[type] = generateConstruccionQuestionnaire(type);
    return acc;
  }, {} as Record<ConstruccionBusinessType, ConstruccionQuestionnaire>);

// Helper function to get questions by mode
export function getConstruccionQuestions(
  businessType: ConstruccionBusinessType,
  mode: 'quick' | 'full'
): ConstruccionQuestion[] {
  const questionnaire = construccionQuestionnaires[businessType];
  return mode === 'quick' ? questionnaire.quick.questions : questionnaire.full.questions;
}

// Get all construccion business types with labels
export function getConstruccionBusinessTypeLabels(): Array<{ value: ConstruccionBusinessType; label: string; icon: string }> {
  return [
    { value: 'constructora_residencial', label: 'Constructora residencial', icon: '🏠' },
    { value: 'constructora_comercial', label: 'Constructora comercial', icon: '🏢' },
    { value: 'arquitectura', label: 'Estudio de arquitectura', icon: '📐' },
    { value: 'ingenieria_civil', label: 'Ingeniería civil', icon: '🌉' },
    { value: 'inmobiliaria_ventas', label: 'Inmobiliaria (ventas)', icon: '🏘️' },
    { value: 'inmobiliaria_alquileres', label: 'Inmobiliaria (alquileres)', icon: '🔑' },
    { value: 'desarrolladora', label: 'Desarrolladora inmobiliaria', icon: '🏗️' },
    { value: 'reformas_integrales', label: 'Reformas integrales', icon: '🔨' },
    { value: 'demolicion', label: 'Demolición', icon: '💥' },
    { value: 'movimiento_suelos', label: 'Movimiento de suelos', icon: '🚜' },
    { value: 'estructuras_metalicas', label: 'Estructuras metálicas', icon: '🔩' },
    { value: 'instalaciones_especiales', label: 'Instalaciones especiales', icon: '⚙️' },
    { value: 'impermeabilizacion', label: 'Impermeabilización', icon: '💧' },
    { value: 'pisos_revestimientos', label: 'Pisos y revestimientos', icon: '🪨' },
    { value: 'techos_cubiertas', label: 'Techos y cubiertas', icon: '🏚️' },
    { value: 'piscinas', label: 'Construcción de piscinas', icon: '🏊' },
    { value: 'paisajismo', label: 'Paisajismo', icon: '🌳' },
    { value: 'project_management', label: 'Project management', icon: '📋' }
  ];
}
