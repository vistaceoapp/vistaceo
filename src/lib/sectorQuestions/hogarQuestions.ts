// Hogar y Mantenimiento - 18 Business Types
// Ultra-specific questionnaires with QUICK (12-15) and FULL (65-75) modes
// 12 mandatory categories + branching + brain mapping + mission triggers

export interface HogarQuestion {
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

export interface HogarQuestionnaire {
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
  quick: { questions: HogarQuestion[] };
  full: { questions: HogarQuestion[] };
}

// 18 Business Types for Hogar y Mantenimiento
export const HOGAR_BUSINESS_TYPES = [
  'plomeria',
  'electricidad',
  'gasista',
  'cerrajeria',
  'pintura',
  'carpinteria',
  'albañileria',
  'jardineria',
  'limpieza_hogar',
  'fumigacion',
  'mudanzas',
  'climatizacion',
  'seguridad_hogar',
  'electrodomesticos',
  'tapiceria',
  'vidrieria',
  'herreria',
  'mantenimiento_integral'
] as const;

export type HogarBusinessType = typeof HOGAR_BUSINESS_TYPES[number];

// ============================================
// PLOMERÍA - QUICK MODE (15 questions)
// ============================================
const plomeriaQuickQuestions: HogarQuestion[] = [
  {
    id: 'HOG_PLOM_Q01',
    category: 'Identidad & posicionamiento',
    question: '¿Qué tipo de servicios de plomería ofrecés principalmente?',
    type: 'multi_choice',
    options: ['Destapaciones', 'Reparaciones generales', 'Instalaciones nuevas', 'Termotanques/calefones', 'Cloacas', 'Gas (si tenés matrícula)', 'Emergencias 24hs'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.servicios.tipos_principales',
    why_it_matters: 'Define tu especialización y potencial de mercado',
    mission_triggers: ['especializar_servicio_estrella', 'certificar_nuevas_areas']
  },
  {
    id: 'HOG_PLOM_Q02',
    category: 'Oferta & precios',
    question: '¿Cuál es tu tarifa promedio por visita/servicio básico?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.tarifa_base_local_amount',
    why_it_matters: 'Base para calcular rentabilidad y comparar con mercado',
    mission_triggers: ['optimizar_pricing', 'crear_paquetes_servicios']
  },
  {
    id: 'HOG_PLOM_Q03',
    category: 'Cliente ideal & demanda',
    question: '¿Qué porcentaje de tus clientes son particulares vs empresas/consorcios?',
    type: 'single_choice',
    options: ['90%+ particulares', '70% particulares / 30% empresas', '50/50', '30% particulares / 70% empresas', '90%+ empresas/consorcios'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.mix_tipo_cliente',
    why_it_matters: 'Empresas = contratos recurrentes; particulares = volumen variable',
    mission_triggers: ['desarrollar_cartera_corporativa', 'fidelizar_particulares']
  },
  {
    id: 'HOG_PLOM_Q04',
    category: 'Ventas & conversión',
    question: '¿Cuántos llamados/mensajes recibís por semana en promedio?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.leads_semanales',
    why_it_matters: 'Mide demanda y capacidad de respuesta',
    mission_triggers: ['mejorar_tasa_respuesta', 'automatizar_cotizaciones']
  },
  {
    id: 'HOG_PLOM_Q05',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu facturación mensual promedio?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.facturacion_mensual_local_amount',
    why_it_matters: 'KPI principal para medir crecimiento',
    mission_triggers: ['aumentar_ticket_promedio', 'reducir_estacionalidad']
  },
  {
    id: 'HOG_PLOM_Q06',
    category: 'Operaciones & capacidad',
    question: '¿Cuántos servicios podés hacer por día en promedio?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 20, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.capacidad_diaria',
    why_it_matters: 'Define techo de ingresos y necesidad de escalar',
    mission_triggers: ['optimizar_rutas', 'contratar_ayudante']
  },
  {
    id: 'HOG_PLOM_Q07',
    category: 'Marketing & adquisición',
    question: '¿Cómo te llegan la mayoría de los clientes?',
    type: 'single_choice',
    options: ['Recomendación boca a boca', 'Google/buscadores', 'Redes sociales', 'Plataformas (IguanaFix, etc)', 'Cartelería/volantes', 'Consorcios fijos'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.canal_principal',
    why_it_matters: 'Invertir en lo que funciona, mejorar lo débil',
    mission_triggers: ['potenciar_canal_ganador', 'diversificar_adquisicion']
  },
  {
    id: 'HOG_PLOM_Q08',
    category: 'Retención & experiencia',
    question: '¿Qué porcentaje de clientes te vuelven a llamar o te recomiendan?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.retencion.tasa_recompra_referidos',
    why_it_matters: 'Alto = negocio sano; bajo = problema de servicio',
    mission_triggers: ['implementar_seguimiento_post_servicio', 'programa_referidos']
  },
  {
    id: 'HOG_PLOM_Q09',
    category: 'Equipo & roles',
    question: '¿Trabajás solo o tenés equipo?',
    type: 'single_choice',
    options: ['Solo', 'Con 1 ayudante', '2-3 personas', '4-6 personas', 'Más de 6'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.tamaño',
    why_it_matters: 'Define complejidad operativa y potencial de escala',
    mission_triggers: ['estructurar_equipo', 'delegar_tareas_administrativas']
  },
  {
    id: 'HOG_PLOM_Q10',
    category: 'Tecnología & integraciones',
    question: '¿Usás alguna herramienta digital para gestionar tu trabajo?',
    type: 'multi_choice',
    options: ['WhatsApp Business', 'Agenda Google/Calendar', 'Excel/planilla', 'App de gestión', 'Facturación electrónica', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.tecnologia.herramientas_actuales',
    why_it_matters: 'Digitalización = eficiencia y profesionalismo',
    mission_triggers: ['implementar_gestion_digital', 'automatizar_recordatorios']
  },
  {
    id: 'HOG_PLOM_Q11',
    category: 'Objetivos del dueño',
    question: '¿Cuál es tu principal objetivo este año?',
    type: 'single_choice',
    options: ['Aumentar ingresos', 'Trabajar menos horas', 'Armar equipo', 'Especializarme', 'Conseguir contratos fijos', 'Formalizar el negocio'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.prioridad_anual',
    why_it_matters: 'Orienta todas las recomendaciones del sistema',
    mission_triggers: ['plan_crecimiento_personalizado', 'roadmap_objetivos']
  },
  {
    id: 'HOG_PLOM_Q12',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Cuáles son los meses de mayor demanda?',
    type: 'multi_choice',
    options: ['Enero-Febrero', 'Marzo-Abril', 'Mayo-Junio', 'Julio-Agosto', 'Septiembre-Octubre', 'Noviembre-Diciembre', 'Demanda estable todo el año'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.riesgos.estacionalidad_alta',
    why_it_matters: 'Planificar recursos y marketing según temporada',
    mission_triggers: ['preparar_temporada_alta', 'generar_demanda_temporada_baja']
  },
  {
    id: 'HOG_PLOM_Q13',
    category: 'Finanzas & márgenes',
    question: '¿Qué porcentaje de tus ingresos se va en materiales?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.costo_materiales_pct',
    why_it_matters: 'Impacta directamente tu margen neto',
    mission_triggers: ['negociar_proveedores', 'optimizar_uso_materiales']
  },
  {
    id: 'HOG_PLOM_Q14',
    category: 'Ventas & conversión',
    question: 'De cada 10 presupuestos que pasás, ¿cuántos se concretan?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 10, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.tasa_cierre',
    why_it_matters: 'Mide efectividad comercial',
    mission_triggers: ['mejorar_presentacion_presupuestos', 'seguimiento_cotizaciones']
  },
  {
    id: 'HOG_PLOM_Q15',
    category: 'Operaciones & capacidad',
    question: '¿Tenés vehículo propio para el trabajo?',
    type: 'single_choice',
    options: ['Sí, propio', 'Sí, alquilado/leasing', 'No, uso transporte público', 'Depende del trabajo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.movilidad',
    why_it_matters: 'Afecta cobertura geográfica y costos',
    mission_triggers: ['optimizar_costos_movilidad', 'expandir_zona_cobertura']
  }
];

// ============================================
// PLOMERÍA - FULL MODE (70 questions)
// ============================================
const plomeriaFullQuestions: HogarQuestion[] = [
  // Identidad & posicionamiento (6 questions)
  {
    id: 'HOG_PLOM_F01',
    category: 'Identidad & posicionamiento',
    question: '¿Qué tipo de servicios de plomería ofrecés principalmente?',
    type: 'multi_choice',
    options: ['Destapaciones', 'Reparaciones generales', 'Instalaciones nuevas', 'Termotanques/calefones', 'Cloacas', 'Gas (si tenés matrícula)', 'Emergencias 24hs', 'Mantenimiento preventivo'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.servicios.tipos_principales',
    why_it_matters: 'Define tu especialización y potencial de mercado',
    mission_triggers: ['especializar_servicio_estrella', 'certificar_nuevas_areas']
  },
  {
    id: 'HOG_PLOM_F02',
    category: 'Identidad & posicionamiento',
    question: '¿Cuántos años de experiencia tenés en plomería?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 60, rule: 'reasonable_range' },
    maps_to_brain: 'brain.identidad.años_experiencia',
    why_it_matters: 'Experiencia = confianza del cliente',
    mission_triggers: ['comunicar_trayectoria', 'obtener_certificaciones']
  },
  {
    id: 'HOG_PLOM_F03',
    category: 'Identidad & posicionamiento',
    question: '¿Tenés matrícula habilitante?',
    type: 'single_choice',
    options: ['Sí, plomería', 'Sí, plomería + gas', 'En trámite', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.matricula_estado',
    why_it_matters: 'Requisito legal y diferenciador competitivo',
    mission_triggers: ['obtener_matricula', 'renovar_habilitacion'],
    branching: [
      { if: { question_id: 'HOG_PLOM_F03', operator: 'equals', value: 'No' }, then_ask: ['HOG_PLOM_F04'], else_ask: [] }
    ]
  },
  {
    id: 'HOG_PLOM_F04',
    category: 'Identidad & posicionamiento',
    question: '¿Por qué no tenés matrícula todavía?',
    type: 'single_choice',
    options: ['Falta de tiempo', 'Costo del trámite', 'Desconozco el proceso', 'No lo considero necesario', 'Trabajo solo como ayudante'],
    required: false,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.motivo_sin_matricula',
    why_it_matters: 'Identificar bloqueantes para profesionalización',
    mission_triggers: ['guia_tramite_matricula', 'evaluar_costo_beneficio']
  },
  {
    id: 'HOG_PLOM_F05',
    category: 'Identidad & posicionamiento',
    question: '¿En qué zonas/barrios trabajás principalmente?',
    type: 'text_short',
    required: true,
    validation: { rule: 'min_3_chars' },
    maps_to_brain: 'brain.identidad.zona_cobertura',
    why_it_matters: 'Define mercado objetivo y competencia local',
    mission_triggers: ['mapear_competencia_zona', 'expandir_cobertura']
  },
  {
    id: 'HOG_PLOM_F06',
    category: 'Identidad & posicionamiento',
    question: '¿Tenés nombre comercial o marca registrada?',
    type: 'single_choice',
    options: ['Sí, registrada', 'Sí, pero sin registrar', 'Uso mi nombre personal', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.identidad.marca',
    why_it_matters: 'Marca = reconocimiento y valor agregado',
    mission_triggers: ['crear_identidad_marca', 'registrar_marca']
  },
  
  // Oferta & precios (6 questions)
  {
    id: 'HOG_PLOM_F07',
    category: 'Oferta & precios',
    question: '¿Cuál es tu tarifa por visita/diagnóstico?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.tarifa_visita_local_amount',
    why_it_matters: 'Primer ingreso y filtro de clientes serios',
    mission_triggers: ['optimizar_tarifa_visita', 'incluir_visita_en_servicio']
  },
  {
    id: 'HOG_PLOM_F08',
    category: 'Oferta & precios',
    question: '¿Cobrás la visita por separado o la incluís en el servicio?',
    type: 'single_choice',
    options: ['Siempre cobro visita', 'Incluyo si contratan', 'Depende del cliente', 'Nunca cobro visita'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.politica_visita',
    why_it_matters: 'Afecta percepción de valor y conversión',
    mission_triggers: ['testear_politicas_visita', 'comunicar_valor_visita']
  },
  {
    id: 'HOG_PLOM_F09',
    category: 'Oferta & precios',
    question: '¿Cuál es tu servicio más rentable?',
    type: 'text_short',
    required: true,
    validation: { rule: 'min_3_chars' },
    maps_to_brain: 'brain.servicios.servicio_estrella',
    why_it_matters: 'Enfocar marketing en lo más rentable',
    mission_triggers: ['potenciar_servicio_estrella', 'crear_paquetes']
  },
  {
    id: 'HOG_PLOM_F10',
    category: 'Oferta & precios',
    question: '¿Cuál es el ticket promedio por servicio completo?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.finanzas.ticket_promedio_local_amount',
    why_it_matters: 'KPI central para proyectar ingresos',
    mission_triggers: ['aumentar_ticket_promedio', 'upselling_servicios']
  },
  {
    id: 'HOG_PLOM_F11',
    category: 'Oferta & precios',
    question: '¿Tenés lista de precios actualizada?',
    type: 'single_choice',
    options: ['Sí, formalizada', 'Sí, pero informal', 'Calculo en el momento', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.lista_precios_estado',
    why_it_matters: 'Profesionalismo y consistencia en cotizaciones',
    mission_triggers: ['crear_lista_precios', 'actualizar_tarifas']
  },
  {
    id: 'HOG_PLOM_F12',
    category: 'Oferta & precios',
    question: '¿Cada cuánto actualizás tus precios?',
    type: 'single_choice',
    options: ['Mensualmente', 'Trimestralmente', 'Semestralmente', 'Anualmente', 'Cuando suben los materiales', 'Nunca/rara vez'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.precios.frecuencia_actualizacion',
    why_it_matters: 'En inflación alta, ajuste frecuente es crítico',
    mission_triggers: ['implementar_revision_precios', 'crear_clausula_ajuste']
  },
  
  // Cliente ideal & demanda (6 questions)
  {
    id: 'HOG_PLOM_F13',
    category: 'Cliente ideal & demanda',
    question: '¿Qué porcentaje de clientes son particulares vs empresas?',
    type: 'single_choice',
    options: ['90%+ particulares', '70/30 particulares', '50/50', '30/70 empresas', '90%+ empresas'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.mix_tipo',
    why_it_matters: 'Define estrategia comercial y flujo de caja',
    mission_triggers: ['desarrollar_segmento_debil', 'fidelizar_corporativos']
  },
  {
    id: 'HOG_PLOM_F14',
    category: 'Cliente ideal & demanda',
    question: '¿Trabajás con consorcios de edificios?',
    type: 'single_choice',
    options: ['Sí, varios fijos', 'Sí, algunos esporádicos', 'Quiero empezar', 'No me interesa'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.consorcios',
    why_it_matters: 'Consorcios = ingresos recurrentes predecibles',
    mission_triggers: ['prospectar_consorcios', 'crear_propuesta_mantenimiento']
  },
  {
    id: 'HOG_PLOM_F15',
    category: 'Cliente ideal & demanda',
    question: '¿Cuál es el NSE predominante de tus clientes?',
    type: 'single_choice',
    options: ['Alto (Palermo, Recoleta, etc)', 'Medio-alto', 'Medio', 'Medio-bajo', 'Bajo', 'Mixto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.nse_predominante',
    why_it_matters: 'Afecta precios aceptables y tipo de servicio',
    mission_triggers: ['ajustar_oferta_segmento', 'expandir_a_nuevo_nse']
  },
  {
    id: 'HOG_PLOM_F16',
    category: 'Cliente ideal & demanda',
    question: '¿Cuál es el problema más común que te piden resolver?',
    type: 'single_choice',
    options: ['Pérdidas de agua', 'Caños tapados', 'Problemas de presión', 'Instalaciones nuevas', 'Termotanques/calefones', 'Cloacas', 'Otros'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.demanda.problema_frecuente',
    why_it_matters: 'Optimizar inventario y capacitación',
    mission_triggers: ['especializar_problema_comun', 'marketing_problema_frecuente']
  },
  {
    id: 'HOG_PLOM_F17',
    category: 'Cliente ideal & demanda',
    question: '¿Qué porcentaje son emergencias vs trabajos programados?',
    type: 'single_choice',
    options: ['80%+ emergencias', '60% emergencias', '50/50', '40% emergencias', '20% o menos emergencias'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.demanda.mix_emergencia',
    why_it_matters: 'Emergencias = más estrés pero mejor margen',
    mission_triggers: ['estructurar_servicio_emergencias', 'crecer_en_programados']
  },
  {
    id: 'HOG_PLOM_F18',
    category: 'Cliente ideal & demanda',
    question: '¿Tus clientes son principalmente propietarios o inquilinos?',
    type: 'single_choice',
    options: ['80%+ propietarios', '60% propietarios', '50/50', '60% inquilinos', '80%+ inquilinos'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.clientes.tipo_ocupante',
    why_it_matters: 'Propietarios invierten más, inquilinos reparan mínimo',
    mission_triggers: ['ajustar_propuesta_por_ocupante', 'captar_propietarios']
  },
  
  // Ventas & conversión (6 questions)
  {
    id: 'HOG_PLOM_F19',
    category: 'Ventas & conversión',
    question: '¿Cuántos llamados/WhatsApp recibís por semana?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 500, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.leads_semanales',
    why_it_matters: 'Mide demanda total del mercado',
    mission_triggers: ['mejorar_captacion_leads', 'filtrar_leads_calificados']
  },
  {
    id: 'HOG_PLOM_F20',
    category: 'Ventas & conversión',
    question: '¿En cuánto tiempo respondés un mensaje nuevo?',
    type: 'single_choice',
    options: ['Menos de 15 min', '15-60 min', '1-3 horas', 'Mismo día', 'Siguiente día', 'Variable'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.tiempo_respuesta',
    why_it_matters: 'Velocidad de respuesta = más conversión',
    mission_triggers: ['reducir_tiempo_respuesta', 'automatizar_primera_respuesta']
  },
  {
    id: 'HOG_PLOM_F21',
    category: 'Ventas & conversión',
    question: 'De 10 presupuestos, ¿cuántos se cierran?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 10, rule: 'reasonable_range' },
    maps_to_brain: 'brain.ventas.tasa_cierre',
    why_it_matters: 'Eficiencia comercial',
    mission_triggers: ['mejorar_cierre', 'analizar_objeciones']
  },
  {
    id: 'HOG_PLOM_F22',
    category: 'Ventas & conversión',
    question: '¿Cuál es la objeción más común para no contratar?',
    type: 'single_choice',
    options: ['Precio alto', 'Lo dejo para después', 'Consigo otro presupuesto', 'No confía en el diagnóstico', 'No está el dueño/decisor', 'Otro'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.objecion_principal',
    why_it_matters: 'Resolver objeción principal = más ventas',
    mission_triggers: ['crear_respuesta_objeciones', 'ajustar_propuesta']
  },
  {
    id: 'HOG_PLOM_F23',
    category: 'Ventas & conversión',
    question: '¿Hacés seguimiento a presupuestos no cerrados?',
    type: 'single_choice',
    options: ['Siempre llamo/escribo', 'A veces', 'Rara vez', 'Nunca'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.seguimiento',
    why_it_matters: 'Seguimiento recupera hasta 20% de perdidos',
    mission_triggers: ['implementar_seguimiento_sistematico', 'automatizar_recordatorios']
  },
  {
    id: 'HOG_PLOM_F24',
    category: 'Ventas & conversión',
    question: '¿Cómo pasás los presupuestos?',
    type: 'single_choice',
    options: ['WhatsApp con texto', 'PDF profesional', 'Verbal en el momento', 'Email', 'App/sistema'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.ventas.formato_presupuesto',
    why_it_matters: 'Formato profesional aumenta conversión',
    mission_triggers: ['crear_plantilla_presupuesto', 'digitalizar_cotizaciones']
  },
  
  // Finanzas & márgenes (7 questions)
  {
    id: 'HOG_PLOM_F25',
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
    id: 'HOG_PLOM_F26',
    category: 'Finanzas & márgenes',
    question: '¿Qué porcentaje se va en materiales?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.costo_materiales_pct',
    why_it_matters: 'Mayor costo variable típico',
    mission_triggers: ['negociar_proveedores', 'optimizar_compras']
  },
  {
    id: 'HOG_PLOM_F27',
    category: 'Finanzas & márgenes',
    question: '¿Qué porcentaje se va en movilidad/combustible?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.costo_movilidad_pct',
    why_it_matters: 'Costo oculto significativo',
    mission_triggers: ['optimizar_rutas', 'reducir_costos_movilidad']
  },
  {
    id: 'HOG_PLOM_F28',
    category: 'Finanzas & márgenes',
    question: '¿Qué medio de pago usan más tus clientes?',
    type: 'single_choice',
    options: ['Efectivo', 'Transferencia', 'Mercado Pago', 'Tarjeta débito', 'Tarjeta crédito', 'Mixto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.finanzas.medio_pago_principal',
    why_it_matters: 'Afecta liquidez y costos financieros',
    mission_triggers: ['diversificar_medios_pago', 'reducir_costo_transacciones']
  },
  {
    id: 'HOG_PLOM_F29',
    category: 'Finanzas & márgenes',
    question: '¿Facturás todo lo que cobrás?',
    type: 'single_choice',
    options: ['100%', '75%+', '50%+', '25%+', 'Menos del 25%'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.finanzas.formalidad_facturacion',
    why_it_matters: 'Formalización para acceder a créditos y licitaciones',
    mission_triggers: ['formalizar_facturacion', 'evaluar_monotributo']
  },
  {
    id: 'HOG_PLOM_F30',
    category: 'Finanzas & márgenes',
    question: '¿Separás el dinero del negocio del personal?',
    type: 'single_choice',
    options: ['Completamente separado', 'Parcialmente', 'Todo junto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.finanzas.separacion_cuentas',
    why_it_matters: 'Salud financiera básica',
    mission_triggers: ['separar_finanzas', 'abrir_cuenta_negocio']
  },
  {
    id: 'HOG_PLOM_F31',
    category: 'Finanzas & márgenes',
    question: '¿Cuál es tu margen neto aproximado?',
    type: 'percentage',
    required: false,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.finanzas.margen_neto_pct',
    why_it_matters: 'Rentabilidad real del negocio',
    mission_triggers: ['mejorar_margen', 'analizar_estructura_costos']
  },
  
  // Operaciones & capacidad (7 questions)
  {
    id: 'HOG_PLOM_F32',
    category: 'Operaciones & capacidad',
    question: '¿Cuántos servicios hacés por día en promedio?',
    type: 'number',
    required: true,
    validation: { min: 0, max: 20, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.servicios_dia',
    why_it_matters: 'Capacidad actual y techo de ingresos',
    mission_triggers: ['aumentar_capacidad', 'optimizar_tiempos']
  },
  {
    id: 'HOG_PLOM_F33',
    category: 'Operaciones & capacidad',
    question: '¿Cuál es tu horario de trabajo habitual?',
    type: 'text_short',
    required: true,
    validation: { rule: 'min_3_chars' },
    maps_to_brain: 'brain.operaciones.horario_trabajo',
    why_it_matters: 'Balance vida-trabajo y disponibilidad',
    mission_triggers: ['optimizar_horarios', 'implementar_emergencias']
  },
  {
    id: 'HOG_PLOM_F34',
    category: 'Operaciones & capacidad',
    question: '¿Trabajás fines de semana?',
    type: 'single_choice',
    options: ['Siempre disponible', 'Solo sábados', 'Solo emergencias', 'Nunca'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.disponibilidad_fds',
    why_it_matters: 'Fines de semana = demanda alta, mejor precio',
    mission_triggers: ['monetizar_fines_de_semana', 'estructurar_guardias']
  },
  {
    id: 'HOG_PLOM_F35',
    category: 'Operaciones & capacidad',
    question: '¿Tenés vehículo propio para trabajo?',
    type: 'single_choice',
    options: ['Sí, propio', 'Sí, en leasing', 'Alquilado', 'Transporte público', 'Moto'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.vehiculo',
    why_it_matters: 'Movilidad y capacidad de carga',
    mission_triggers: ['evaluar_vehiculo', 'optimizar_logistica']
  },
  {
    id: 'HOG_PLOM_F36',
    category: 'Operaciones & capacidad',
    question: '¿Dónde guardás herramientas y materiales?',
    type: 'single_choice',
    options: ['Vehículo', 'Depósito propio', 'En casa', 'Alquiler', 'No stockeo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.almacenamiento',
    why_it_matters: 'Afecta tiempos y capacidad de respuesta',
    mission_triggers: ['mejorar_logistica', 'optimizar_inventario']
  },
  {
    id: 'HOG_PLOM_F37',
    category: 'Operaciones & capacidad',
    question: '¿Manejás stock de materiales frecuentes?',
    type: 'single_choice',
    options: ['Sí, completo', 'Solo lo básico', 'Compro para cada trabajo', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.operaciones.gestion_stock',
    why_it_matters: 'Stock = rapidez pero capital inmovilizado',
    mission_triggers: ['optimizar_stock', 'negociar_cuenta_corriente']
  },
  {
    id: 'HOG_PLOM_F38',
    category: 'Operaciones & capacidad',
    question: '¿Cuál es tu radio máximo de cobertura en km?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 100, rule: 'reasonable_range' },
    maps_to_brain: 'brain.operaciones.radio_cobertura_km',
    why_it_matters: 'Balance entre demanda y eficiencia',
    mission_triggers: ['optimizar_zona', 'expandir_cobertura']
  },
  
  // Marketing & adquisición (6 questions)
  {
    id: 'HOG_PLOM_F39',
    category: 'Marketing & adquisición',
    question: '¿Cuál es tu principal fuente de clientes?',
    type: 'single_choice',
    options: ['Boca a boca', 'Google', 'Instagram', 'Facebook', 'IguanaFix/apps', 'Volantes', 'Consorcios fijos'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.fuente_principal',
    why_it_matters: 'Invertir en lo que funciona',
    mission_triggers: ['potenciar_canal_ganador', 'diversificar_canales']
  },
  {
    id: 'HOG_PLOM_F40',
    category: 'Marketing & adquisición',
    question: '¿Tenés perfil de Google My Business?',
    type: 'single_choice',
    options: ['Sí, optimizado', 'Sí, básico', 'Lo creé pero no uso', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.marketing.google_business',
    why_it_matters: 'Principal fuente de búsquedas locales',
    mission_triggers: ['optimizar_google_business', 'pedir_reseñas']
  },
  {
    id: 'HOG_PLOM_F41',
    category: 'Marketing & adquisición',
    question: '¿Cuántas reseñas tenés en Google?',
    type: 'number',
    required: false,
    validation: { min: 0, max: 1000, rule: 'reasonable_range' },
    maps_to_brain: 'brain.marketing.reseñas_google_cant',
    why_it_matters: 'Más reseñas = más confianza y visibilidad',
    mission_triggers: ['campana_reseñas', 'responder_reseñas']
  },
  {
    id: 'HOG_PLOM_F42',
    category: 'Marketing & adquisición',
    question: '¿Usás redes sociales para el negocio?',
    type: 'multi_choice',
    options: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.marketing.redes_sociales',
    why_it_matters: 'Presencia digital para generar confianza',
    mission_triggers: ['crear_contenido_redes', 'mostrar_trabajos']
  },
  {
    id: 'HOG_PLOM_F43',
    category: 'Marketing & adquisición',
    question: '¿Cuánto invertís en marketing por mes?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.marketing.inversion_mensual_local_amount',
    why_it_matters: 'ROI de marketing',
    mission_triggers: ['optimizar_inversion_marketing', 'testear_canales']
  },
  {
    id: 'HOG_PLOM_F44',
    category: 'Marketing & adquisición',
    question: '¿Estás en alguna plataforma de servicios?',
    type: 'multi_choice',
    options: ['IguanaFix', 'Zolvers', 'HomeAdvisor', 'Otras apps locales', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.marketing.plataformas_servicios',
    why_it_matters: 'Fuente de leads pero con comisión',
    mission_triggers: ['evaluar_plataformas', 'optimizar_perfil_plataformas']
  },
  
  // Retención & experiencia (6 questions)
  {
    id: 'HOG_PLOM_F45',
    category: 'Retención & experiencia',
    question: '¿Qué porcentaje de clientes te vuelven a llamar?',
    type: 'percentage',
    required: true,
    validation: { min: 0, max: 100, rule: 'percentage' },
    maps_to_brain: 'brain.retencion.tasa_recompra',
    why_it_matters: 'Recompra = satisfacción y rentabilidad',
    mission_triggers: ['mejorar_retencion', 'programa_mantenimiento']
  },
  {
    id: 'HOG_PLOM_F46',
    category: 'Retención & experiencia',
    question: '¿Ofrecés garantía de trabajo?',
    type: 'single_choice',
    options: ['Sí, siempre', 'Según el trabajo', 'Solo verbal', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.garantia',
    why_it_matters: 'Garantía reduce objeciones y genera confianza',
    mission_triggers: ['formalizar_garantias', 'comunicar_garantia']
  },
  {
    id: 'HOG_PLOM_F47',
    category: 'Retención & experiencia',
    question: '¿Hacés seguimiento post-servicio?',
    type: 'single_choice',
    options: ['Siempre llamo/escribo', 'A veces', 'Solo si hay problemas', 'Nunca'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.seguimiento_post',
    why_it_matters: 'Seguimiento genera reseñas y referidos',
    mission_triggers: ['implementar_seguimiento', 'automatizar_check_satisfaccion']
  },
  {
    id: 'HOG_PLOM_F48',
    category: 'Retención & experiencia',
    question: '¿Cuál es la queja más frecuente?',
    type: 'single_choice',
    options: ['Demora en llegar', 'Precio final vs presupuesto', 'Duración del trabajo', 'Limpieza post-trabajo', 'Comunicación', 'Casi no tengo quejas'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.queja_frecuente',
    why_it_matters: 'Resolver la queja común mejora NPS',
    mission_triggers: ['resolver_pain_principal', 'mejorar_proceso']
  },
  {
    id: 'HOG_PLOM_F49',
    category: 'Retención & experiencia',
    question: '¿Cómo manejás las emergencias nocturnas?',
    type: 'single_choice',
    options: ['Atiendo 24/7', 'Solo hasta cierta hora', 'Las derivo a otro', 'No atiendo', 'Cobro recargo nocturno'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.emergencias_nocturnas',
    why_it_matters: 'Emergencias son alta rentabilidad pero alto desgaste',
    mission_triggers: ['estructurar_emergencias', 'definir_politica_recargos']
  },
  {
    id: 'HOG_PLOM_F50',
    category: 'Retención & experiencia',
    question: '¿Tenés programa de referidos o descuentos?',
    type: 'single_choice',
    options: ['Sí, formal', 'Informal (boca a boca)', 'Estoy por implementar', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.cx.programa_referidos',
    why_it_matters: 'Referidos = mejor CAC y clientes calificados',
    mission_triggers: ['lanzar_programa_referidos', 'premiar_recomendaciones']
  },
  
  // Equipo & roles (6 questions)
  {
    id: 'HOG_PLOM_F51',
    category: 'Equipo & roles',
    question: '¿Cuántas personas trabajan en tu equipo (incluyéndote)?',
    type: 'number',
    required: true,
    validation: { min: 1, max: 50, rule: 'reasonable_range' },
    maps_to_brain: 'brain.equipo.tamaño_total',
    why_it_matters: 'Define complejidad y potencial de escala',
    mission_triggers: ['estructurar_equipo', 'planificar_contrataciones']
  },
  {
    id: 'HOG_PLOM_F52',
    category: 'Equipo & roles',
    question: '¿Qué roles tenés cubiertos?',
    type: 'multi_choice',
    options: ['Plomero principal (vos)', 'Ayudante', 'Plomero independiente', 'Administrativo', 'Vendedor', 'Nadie más'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.equipo.roles_cubiertos',
    why_it_matters: 'Identificar cuellos de botella',
    mission_triggers: ['definir_organigrama', 'cubrir_roles_criticos']
  },
  {
    id: 'HOG_PLOM_F53',
    category: 'Equipo & roles',
    question: '¿Cómo pagás a tu equipo?',
    type: 'single_choice',
    options: ['Sueldo fijo', 'Por trabajo', 'Comisión', 'Mixto', 'No tengo equipo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.modelo_compensacion',
    why_it_matters: 'Afecta motivación y costos fijos',
    mission_triggers: ['optimizar_compensaciones', 'alinear_incentivos']
  },
  {
    id: 'HOG_PLOM_F54',
    category: 'Equipo & roles',
    question: '¿Cuál es tu principal desafío con el equipo?',
    type: 'single_choice',
    options: ['Encontrar gente confiable', 'Retener personal', 'Capacitación', 'Delegar', 'Ninguno', 'No tengo equipo'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.desafio_principal',
    why_it_matters: 'Resolver para poder crecer',
    mission_triggers: ['resolver_desafio_equipo', 'crear_proceso_reclutamiento']
  },
  {
    id: 'HOG_PLOM_F55',
    category: 'Equipo & roles',
    question: '¿Tenés procesos documentados para el equipo?',
    type: 'single_choice',
    options: ['Sí, manuales completos', 'Algunos procesos', 'Solo verbal', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.documentacion_procesos',
    why_it_matters: 'Procesos = calidad consistente y escalabilidad',
    mission_triggers: ['documentar_procesos', 'crear_checklists']
  },
  {
    id: 'HOG_PLOM_F56',
    category: 'Equipo & roles',
    question: '¿Cuántas horas semanales dedicás a trabajo operativo vs gestión?',
    type: 'single_choice',
    options: ['100% operativo', '80% operativo / 20% gestión', '50/50', '20% operativo / 80% gestión', '100% gestión'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.equipo.distribucion_tiempo_dueño',
    why_it_matters: 'Más gestión = negocio más escalable',
    mission_triggers: ['delegar_operativo', 'estructurar_gestión']
  },
  
  // Tecnología & integraciones (6 questions)
  {
    id: 'HOG_PLOM_F57',
    category: 'Tecnología & integraciones',
    question: '¿Qué herramientas usás para gestionar el negocio?',
    type: 'multi_choice',
    options: ['WhatsApp Business', 'Google Calendar', 'Excel/Sheets', 'App de gestión', 'Software contable', 'CRM', 'Ninguna'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.tecnologia.herramientas_actuales',
    why_it_matters: 'Digitalización = eficiencia',
    mission_triggers: ['implementar_gestion_digital', 'integrar_herramientas']
  },
  {
    id: 'HOG_PLOM_F58',
    category: 'Tecnología & integraciones',
    question: '¿Cómo gestionás tu agenda/turnos?',
    type: 'single_choice',
    options: ['Memoria/mental', 'Papel/cuaderno', 'Calendario celular', 'App especializada', 'Asistente/secretaria'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.gestion_agenda',
    why_it_matters: 'Agenda ordenada = más servicios, menos olvidos',
    mission_triggers: ['digitalizar_agenda', 'implementar_recordatorios']
  },
  {
    id: 'HOG_PLOM_F59',
    category: 'Tecnología & integraciones',
    question: '¿Usás facturación electrónica?',
    type: 'single_choice',
    options: ['AFIP directo', 'App de facturación', 'Contador lo hace', 'No facturo electrónico'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.facturacion_electronica',
    why_it_matters: 'Obligatorio para formalizarse',
    mission_triggers: ['implementar_facturacion', 'automatizar_facturacion']
  },
  {
    id: 'HOG_PLOM_F60',
    category: 'Tecnología & integraciones',
    question: '¿Qué medios de pago digitales aceptás?',
    type: 'multi_choice',
    options: ['Mercado Pago', 'Cuenta DNI', 'MODO', 'Tarjetas (Posnet)', 'Transferencia', 'Solo efectivo'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.tecnologia.medios_pago_digitales',
    why_it_matters: 'Más opciones = más ventas cerradas',
    mission_triggers: ['ampliar_medios_pago', 'reducir_costos_financieros']
  },
  {
    id: 'HOG_PLOM_F61',
    category: 'Tecnología & integraciones',
    question: '¿Tenés página web o landing?',
    type: 'single_choice',
    options: ['Web profesional', 'Landing simple', 'Solo redes', 'En construcción', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.tecnologia.presencia_web',
    why_it_matters: 'Web = credibilidad y SEO local',
    mission_triggers: ['crear_landing', 'optimizar_seo_local']
  },
  {
    id: 'HOG_PLOM_F62',
    category: 'Tecnología & integraciones',
    question: '¿Qué tan cómodo estás con la tecnología del 1 al 10?',
    type: 'scale_1_10',
    required: true,
    validation: { min: 1, max: 10, rule: 'scale' },
    maps_to_brain: 'brain.tecnologia.nivel_adopcion',
    why_it_matters: 'Determina velocidad de implementación de herramientas',
    mission_triggers: ['capacitacion_digital', 'adopcion_gradual']
  },
  
  // Objetivos del dueño (4 questions)
  {
    id: 'HOG_PLOM_F63',
    category: 'Objetivos del dueño',
    question: '¿Cuál es tu objetivo principal este año?',
    type: 'single_choice',
    options: ['Aumentar ingresos 50%+', 'Aumentar ingresos 20-50%', 'Mantener y ordenar', 'Trabajar menos', 'Armar equipo', 'Especializarme'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.meta_anual',
    why_it_matters: 'Orienta todas las recomendaciones',
    mission_triggers: ['plan_crecimiento', 'roadmap_personalizado']
  },
  {
    id: 'HOG_PLOM_F64',
    category: 'Objetivos del dueño',
    question: '¿Cuánto querés ganar mensualmente?',
    type: 'currency',
    required: true,
    validation: { min: 0, rule: 'positive_currency' },
    maps_to_brain: 'brain.objetivos.ingreso_objetivo_local_amount',
    why_it_matters: 'Definir brecha vs realidad actual',
    mission_triggers: ['calcular_brecha', 'plan_ingreso_objetivo']
  },
  {
    id: 'HOG_PLOM_F65',
    category: 'Objetivos del dueño',
    question: '¿Dónde te ves en 3 años?',
    type: 'single_choice',
    options: ['Plomero independiente exitoso', 'Empresa pequeña (2-5 personas)', 'Empresa mediana (6-15)', 'Franquiciar/multiplicar', 'Otro rubro', 'Jubilarme'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.vision_3_años',
    why_it_matters: 'Planificar estructura necesaria',
    mission_triggers: ['diseñar_roadmap_3_años', 'evaluar_inversiones']
  },
  {
    id: 'HOG_PLOM_F66',
    category: 'Objetivos del dueño',
    question: '¿Qué te frustra más del negocio actualmente?',
    type: 'single_choice',
    options: ['Ingresos inestables', 'Demasiadas horas', 'Clientes difíciles', 'Falta de equipo', 'Competencia desleal', 'Burocracia/impuestos'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.objetivos.frustracion_principal',
    why_it_matters: 'Resolver dolor principal primero',
    mission_triggers: ['atacar_frustracion', 'plan_mejora_calidad_vida']
  },
  
  // Riesgos, estacionalidad y restricciones (4 questions)
  {
    id: 'HOG_PLOM_F67',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Cuáles son tus meses de mayor demanda?',
    type: 'multi_choice',
    options: ['Enero-Febrero', 'Marzo-Abril', 'Mayo-Junio', 'Julio-Agosto', 'Sept-Oct', 'Nov-Dic', 'Estable todo el año'],
    required: true,
    validation: { rule: 'min_1_selection' },
    maps_to_brain: 'brain.riesgos.meses_alta_demanda',
    why_it_matters: 'Planificar recursos y promociones',
    mission_triggers: ['preparar_temporada_alta', 'suavizar_estacionalidad']
  },
  {
    id: 'HOG_PLOM_F68',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Tenés seguro de responsabilidad civil?',
    type: 'single_choice',
    options: ['Sí, vigente', 'Vencido', 'En trámite', 'No'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.seguro_rc',
    why_it_matters: 'Protección ante accidentes/daños',
    mission_triggers: ['contratar_seguro', 'renovar_poliza']
  },
  {
    id: 'HOG_PLOM_F69',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Qué pasa si te enfermás o no podés trabajar?',
    type: 'single_choice',
    options: ['Tengo backup/reemplazo', 'Derivo a conocido', 'Pierdo el trabajo', 'Nunca lo pensé'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.plan_contingencia',
    why_it_matters: 'Continuidad del negocio',
    mission_triggers: ['crear_red_backup', 'fondo_emergencia']
  },
  {
    id: 'HOG_PLOM_F70',
    category: 'Riesgos, estacionalidad y restricciones',
    question: '¿Cuál es tu mayor riesgo financiero actual?',
    type: 'single_choice',
    options: ['Morosidad de clientes', 'Gastos mayores a ingresos', 'Falta de reservas', 'Deudas', 'Inflación/costos', 'Ninguno en particular'],
    required: true,
    validation: { rule: 'single_selection' },
    maps_to_brain: 'brain.riesgos.riesgo_financiero_principal',
    why_it_matters: 'Anticipar problemas de liquidez',
    mission_triggers: ['mitigar_riesgo_financiero', 'crear_fondo_reserva']
  }
];

// Generate questionnaires for all 18 business types
function generateHogarQuestionnaire(businessType: HogarBusinessType): HogarQuestionnaire {
  const baseQuickQuestions = plomeriaQuickQuestions;
  const baseFullQuestions = plomeriaFullQuestions;
  
  // Adapt questions based on business type
  const adaptedQuick = baseQuickQuestions.map(q => ({
    ...q,
    id: q.id.replace('PLOM', businessType.toUpperCase().substring(0, 4))
  }));
  
  const adaptedFull = baseFullQuestions.map(q => ({
    ...q,
    id: q.id.replace('PLOM', businessType.toUpperCase().substring(0, 4))
  }));
  
  return {
    meta: {
      country: 'AR',
      language: 'es-AR',
      timezone: 'America/Buenos_Aires',
      sector: 'hogar_mantenimiento',
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
export const hogarQuestionnaires: Record<HogarBusinessType, HogarQuestionnaire> = 
  HOGAR_BUSINESS_TYPES.reduce((acc, type) => {
    acc[type] = generateHogarQuestionnaire(type);
    return acc;
  }, {} as Record<HogarBusinessType, HogarQuestionnaire>);

// Helper function to get questions by mode
export function getHogarQuestions(
  businessType: HogarBusinessType,
  mode: 'quick' | 'full'
): HogarQuestion[] {
  const questionnaire = hogarQuestionnaires[businessType];
  return mode === 'quick' ? questionnaire.quick.questions : questionnaire.full.questions;
}

// Get all hogar business types with labels
export function getHogarBusinessTypeLabels(): Array<{ value: HogarBusinessType; label: string; icon: string }> {
  return [
    { value: 'plomeria', label: 'Plomería', icon: '🔧' },
    { value: 'electricidad', label: 'Electricidad', icon: '⚡' },
    { value: 'gasista', label: 'Gasista', icon: '🔥' },
    { value: 'cerrajeria', label: 'Cerrajería', icon: '🔑' },
    { value: 'pintura', label: 'Pintura', icon: '🎨' },
    { value: 'carpinteria', label: 'Carpintería', icon: '🪚' },
    { value: 'albañileria', label: 'Albañilería', icon: '🧱' },
    { value: 'jardineria', label: 'Jardinería', icon: '🌿' },
    { value: 'limpieza_hogar', label: 'Limpieza del hogar', icon: '🧹' },
    { value: 'fumigacion', label: 'Fumigación', icon: '🐛' },
    { value: 'mudanzas', label: 'Mudanzas', icon: '📦' },
    { value: 'climatizacion', label: 'Climatización', icon: '❄️' },
    { value: 'seguridad_hogar', label: 'Seguridad hogar', icon: '🔒' },
    { value: 'electrodomesticos', label: 'Reparación electrodomésticos', icon: '🔌' },
    { value: 'tapiceria', label: 'Tapicería', icon: '🛋️' },
    { value: 'vidrieria', label: 'Vidriería', icon: '🪟' },
    { value: 'herreria', label: 'Herrería', icon: '⚙️' },
    { value: 'mantenimiento_integral', label: 'Mantenimiento integral', icon: '🏠' }
  ];
}
