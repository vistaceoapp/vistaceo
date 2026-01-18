// Transporte y Logística - 18 Business Types
// Ultra-specific questionnaires: Quick (10-15) + Complete (68-75)
// 7 Dimensions: Crecimiento, Equipo, Tráfico, Rentabilidad, Finanzas, Eficiencia, Reputación

export interface TransporteQuestion {
  id: string;
  category: string;
  mode: 'quick' | 'complete' | 'both';
  dimension: 'crecimiento' | 'equipo' | 'trafico' | 'rentabilidad' | 'finanzas' | 'eficiencia' | 'reputacion';
  weight: number;
  title: string;
  title_pt?: string;
  type: 'single' | 'multi' | 'number' | 'slider' | 'text' | 'money';
  options?: { value: string; label: string; label_pt?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  appliesTo?: string[];
}

// 18 Business Types for Transport & Logistics
export const TRANSPORTE_BUSINESS_TYPES = {
  TRANSPORTE_CARGA: 'transporte_carga',
  TRANSPORTE_PASAJEROS: 'transporte_pasajeros',
  MENSAJERIA_PAQUETERIA: 'mensajeria_paqueteria',
  LOGISTICA_3PL: 'logistica_3pl',
  MUDANZAS: 'mudanzas',
  ALQUILER_VEHICULOS: 'alquiler_vehiculos',
  TAXI_REMIS: 'taxi_remis',
  TRANSPORTE_ESCOLAR: 'transporte_escolar',
  TRANSPORTE_TURISTICO: 'transporte_turistico',
  GRUAS_AUXILIO: 'gruas_auxilio',
  TRANSPORTE_REFRIGERADO: 'transporte_refrigerado',
  COURIER_EXPRESS: 'courier_express',
  TRANSPORTE_MARITIMO: 'transporte_maritimo',
  TRANSPORTE_AEREO: 'transporte_aereo',
  ALMACENAMIENTO: 'almacenamiento',
  DISTRIBUCION: 'distribucion',
  TRANSPORTE_ESPECIAL: 'transporte_especial',
  OPERADOR_MULTIMODAL: 'operador_multimodal'
};

// Business type groupings for conditional logic
const CARGA_TYPES = [
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_CARGA,
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_REFRIGERADO,
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_ESPECIAL,
  TRANSPORTE_BUSINESS_TYPES.DISTRIBUCION
];

const PASAJEROS_TYPES = [
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_PASAJEROS,
  TRANSPORTE_BUSINESS_TYPES.TAXI_REMIS,
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_ESCOLAR,
  TRANSPORTE_BUSINESS_TYPES.TRANSPORTE_TURISTICO
];

const LOGISTICA_TYPES = [
  TRANSPORTE_BUSINESS_TYPES.LOGISTICA_3PL,
  TRANSPORTE_BUSINESS_TYPES.ALMACENAMIENTO,
  TRANSPORTE_BUSINESS_TYPES.OPERADOR_MULTIMODAL
];

const ENVIOS_TYPES = [
  TRANSPORTE_BUSINESS_TYPES.MENSAJERIA_PAQUETERIA,
  TRANSPORTE_BUSINESS_TYPES.COURIER_EXPRESS
];

export const TRANSPORTE_COMPLETE_QUESTIONS: TransporteQuestion[] = [
  // ========== IDENTIDAD Y OPERACIÓN (Category 1) ==========
  {
    id: 'trans_flota_vehiculos',
    category: 'identidad',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántos vehículos tiene tu flota activa?',
    title_pt: 'Quantos veículos sua frota ativa possui?',
    type: 'number',
    min: 1,
    max: 500
  },
  {
    id: 'trans_tipo_vehiculos',
    category: 'identidad',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué tipos de vehículos opera tu empresa?',
    title_pt: 'Que tipos de veículos sua empresa opera?',
    type: 'multi',
    options: [
      { value: 'motos', label: 'Motos/Bicicletas', label_pt: 'Motos/Bicicletas' },
      { value: 'autos', label: 'Automóviles', label_pt: 'Automóveis' },
      { value: 'vans', label: 'Vans/Furgonetas', label_pt: 'Vans/Furgonetas' },
      { value: 'camiones_livianos', label: 'Camiones livianos', label_pt: 'Caminhões leves' },
      { value: 'camiones_pesados', label: 'Camiones pesados', label_pt: 'Caminhões pesados' },
      { value: 'trailer', label: 'Trailer/Semirremolque', label_pt: 'Trailer/Semirreboque' },
      { value: 'buses', label: 'Buses/Microbuses', label_pt: 'Ônibus/Microônibus' },
      { value: 'especiales', label: 'Vehículos especiales', label_pt: 'Veículos especiais' }
    ]
  },
  {
    id: 'trans_edad_flota',
    category: 'identidad',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es la edad promedio de tu flota?',
    title_pt: 'Qual é a idade média da sua frota?',
    type: 'single',
    options: [
      { value: '0-2', label: '0-2 años', label_pt: '0-2 anos' },
      { value: '3-5', label: '3-5 años', label_pt: '3-5 anos' },
      { value: '6-10', label: '6-10 años', label_pt: '6-10 anos' },
      { value: '10+', label: 'Más de 10 años', label_pt: 'Mais de 10 anos' }
    ]
  },
  {
    id: 'trans_conductores',
    category: 'equipo',
    mode: 'both',
    dimension: 'equipo',
    weight: 3,
    title: '¿Cuántos conductores/operadores tienes?',
    title_pt: 'Quantos motoristas/operadores você tem?',
    type: 'number',
    min: 1,
    max: 200
  },
  {
    id: 'trans_cobertura_geografica',
    category: 'identidad',
    mode: 'both',
    dimension: 'trafico',
    weight: 3,
    title: '¿Cuál es tu cobertura geográfica principal?',
    title_pt: 'Qual é sua cobertura geográfica principal?',
    type: 'single',
    options: [
      { value: 'local', label: 'Local (misma ciudad)', label_pt: 'Local (mesma cidade)' },
      { value: 'regional', label: 'Regional (estado/provincia)', label_pt: 'Regional (estado)' },
      { value: 'nacional', label: 'Nacional', label_pt: 'Nacional' },
      { value: 'internacional', label: 'Internacional', label_pt: 'Internacional' }
    ]
  },
  {
    id: 'trans_servicios_ofreces',
    category: 'identidad',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Qué servicios principales ofreces?',
    title_pt: 'Quais serviços principais você oferece?',
    type: 'multi',
    options: [
      { value: 'carga_general', label: 'Carga general', label_pt: 'Carga geral' },
      { value: 'carga_refrigerada', label: 'Carga refrigerada', label_pt: 'Carga refrigerada' },
      { value: 'paqueteria', label: 'Paquetería/Courier', label_pt: 'Encomendas/Courier' },
      { value: 'mudanzas', label: 'Mudanzas', label_pt: 'Mudanças' },
      { value: 'pasajeros', label: 'Transporte de pasajeros', label_pt: 'Transporte de passageiros' },
      { value: 'especial', label: 'Carga especial/sobredimensionada', label_pt: 'Carga especial' },
      { value: 'almacenamiento', label: 'Almacenamiento', label_pt: 'Armazenamento' },
      { value: 'ultima_milla', label: 'Última milla', label_pt: 'Última milha' }
    ]
  },

  // ========== OPERACIONES Y EFICIENCIA (Category 2) ==========
  {
    id: 'trans_viajes_diarios',
    category: 'operaciones',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántos viajes/entregas realizas en promedio por día?',
    title_pt: 'Quantas viagens/entregas você realiza em média por dia?',
    type: 'number',
    min: 1,
    max: 1000
  },
  {
    id: 'trans_km_mensuales',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuántos kilómetros recorre tu flota mensualmente?',
    title_pt: 'Quantos quilômetros sua frota percorre mensalmente?',
    type: 'single',
    options: [
      { value: '0-10000', label: 'Menos de 10,000 km', label_pt: 'Menos de 10.000 km' },
      { value: '10000-50000', label: '10,000 - 50,000 km', label_pt: '10.000 - 50.000 km' },
      { value: '50000-100000', label: '50,000 - 100,000 km', label_pt: '50.000 - 100.000 km' },
      { value: '100000+', label: 'Más de 100,000 km', label_pt: 'Mais de 100.000 km' }
    ]
  },
  {
    id: 'trans_utilizacion_flota',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Qué porcentaje de utilización tiene tu flota?',
    title_pt: 'Qual porcentagem de utilização sua frota tem?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    unit: '%'
  },
  {
    id: 'trans_sistema_gestion',
    category: 'operaciones',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Usas sistema de gestión de flota (TMS/GPS)?',
    title_pt: 'Você usa sistema de gestão de frota (TMS/GPS)?',
    type: 'single',
    options: [
      { value: 'ninguno', label: 'No uso ninguno', label_pt: 'Não uso nenhum' },
      { value: 'gps_basico', label: 'Solo GPS básico', label_pt: 'Apenas GPS básico' },
      { value: 'tms_simple', label: 'TMS simple', label_pt: 'TMS simples' },
      { value: 'tms_avanzado', label: 'TMS avanzado integrado', label_pt: 'TMS avançado integrado' }
    ]
  },
  {
    id: 'trans_tiempo_entrega',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es tu tiempo promedio de entrega?',
    title_pt: 'Qual é seu tempo médio de entrega?',
    type: 'single',
    options: [
      { value: 'mismo_dia', label: 'Mismo día', label_pt: 'Mesmo dia' },
      { value: '24h', label: '24 horas', label_pt: '24 horas' },
      { value: '48h', label: '48 horas', label_pt: '48 horas' },
      { value: '72h+', label: '72+ horas', label_pt: '72+ horas' }
    ],
    appliesTo: [...ENVIOS_TYPES, ...CARGA_TYPES]
  },
  {
    id: 'trans_entregas_fallidas',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué porcentaje de entregas fallidas tienes?',
    title_pt: 'Qual porcentagem de entregas falhas você tem?',
    type: 'slider',
    min: 0,
    max: 30,
    step: 1,
    unit: '%'
  },
  {
    id: 'trans_mantenimiento',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cómo gestionas el mantenimiento de vehículos?',
    title_pt: 'Como você gerencia a manutenção de veículos?',
    type: 'single',
    options: [
      { value: 'reactivo', label: 'Solo cuando falla', label_pt: 'Somente quando falha' },
      { value: 'calendario', label: 'Por calendario fijo', label_pt: 'Por calendário fixo' },
      { value: 'km', label: 'Por kilómetros', label_pt: 'Por quilômetros' },
      { value: 'predictivo', label: 'Mantenimiento predictivo', label_pt: 'Manutenção preditiva' }
    ]
  },
  {
    id: 'trans_combustible_gasto',
    category: 'operaciones',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 3,
    title: '¿Qué porcentaje de tus costos representa el combustible?',
    title_pt: 'Qual porcentagem dos seus custos o combustível representa?',
    type: 'slider',
    min: 10,
    max: 60,
    step: 5,
    unit: '%'
  },

  // ========== CLIENTES Y MERCADO (Category 3) ==========
  {
    id: 'trans_tipo_clientes',
    category: 'clientes',
    mode: 'both',
    dimension: 'trafico',
    weight: 3,
    title: '¿Quiénes son tus clientes principales?',
    title_pt: 'Quem são seus principais clientes?',
    type: 'multi',
    options: [
      { value: 'empresas', label: 'Empresas/Corporativos', label_pt: 'Empresas/Corporativos' },
      { value: 'pymes', label: 'PyMEs', label_pt: 'PMEs' },
      { value: 'ecommerce', label: 'E-commerce/Tiendas online', label_pt: 'E-commerce/Lojas online' },
      { value: 'particulares', label: 'Particulares', label_pt: 'Particulares' },
      { value: 'gobierno', label: 'Gobierno/Instituciones', label_pt: 'Governo/Instituições' },
      { value: 'industria', label: 'Industrias/Fábricas', label_pt: 'Indústrias/Fábricas' }
    ]
  },
  {
    id: 'trans_clientes_activos',
    category: 'clientes',
    mode: 'both',
    dimension: 'trafico',
    weight: 2,
    title: '¿Cuántos clientes activos tienes?',
    title_pt: 'Quantos clientes ativos você tem?',
    type: 'number',
    min: 1,
    max: 10000
  },
  {
    id: 'trans_concentracion_clientes',
    category: 'clientes',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Qué porcentaje de ingresos representa tu cliente más grande?',
    title_pt: 'Qual porcentagem da receita representa seu maior cliente?',
    type: 'slider',
    min: 5,
    max: 80,
    step: 5,
    unit: '%'
  },
  {
    id: 'trans_contratos_recurrentes',
    category: 'clientes',
    mode: 'complete',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Qué porcentaje de clientes tiene contrato recurrente?',
    title_pt: 'Qual porcentagem de clientes tem contrato recorrente?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    unit: '%'
  },
  {
    id: 'trans_captacion_clientes',
    category: 'clientes',
    mode: 'complete',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Cómo consigues nuevos clientes principalmente?',
    title_pt: 'Como você consegue novos clientes principalmente?',
    type: 'multi',
    options: [
      { value: 'referidos', label: 'Referidos/Boca a boca', label_pt: 'Indicações/Boca a boca' },
      { value: 'licitaciones', label: 'Licitaciones', label_pt: 'Licitações' },
      { value: 'ventas_directas', label: 'Ventas directas', label_pt: 'Vendas diretas' },
      { value: 'plataformas', label: 'Plataformas digitales', label_pt: 'Plataformas digitais' },
      { value: 'publicidad', label: 'Publicidad', label_pt: 'Publicidade' },
      { value: 'alianzas', label: 'Alianzas comerciales', label_pt: 'Parcerias comerciais' }
    ]
  },
  {
    id: 'trans_competidores',
    category: 'clientes',
    mode: 'complete',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Cuántos competidores directos identificas en tu zona?',
    title_pt: 'Quantos concorrentes diretos você identifica na sua zona?',
    type: 'single',
    options: [
      { value: '1-5', label: '1-5 competidores', label_pt: '1-5 concorrentes' },
      { value: '6-15', label: '6-15 competidores', label_pt: '6-15 concorrentes' },
      { value: '16-30', label: '16-30 competidores', label_pt: '16-30 concorrentes' },
      { value: '30+', label: 'Más de 30', label_pt: 'Mais de 30' }
    ]
  },

  // ========== EQUIPO Y RRHH (Category 4) ==========
  {
    id: 'trans_empleados_total',
    category: 'equipo',
    mode: 'both',
    dimension: 'equipo',
    weight: 3,
    title: '¿Cuántos empleados tiene tu empresa en total?',
    title_pt: 'Quantos funcionários sua empresa tem no total?',
    type: 'number',
    min: 1,
    max: 500
  },
  {
    id: 'trans_rotacion_conductores',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Cuál es tu rotación anual de conductores?',
    title_pt: 'Qual é sua rotação anual de motoristas?',
    type: 'single',
    options: [
      { value: '0-10', label: 'Menos del 10%', label_pt: 'Menos de 10%' },
      { value: '10-25', label: '10-25%', label_pt: '10-25%' },
      { value: '25-50', label: '25-50%', label_pt: '25-50%' },
      { value: '50+', label: 'Más del 50%', label_pt: 'Mais de 50%' }
    ]
  },
  {
    id: 'trans_capacitacion',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Ofreces capacitación regular a conductores?',
    title_pt: 'Você oferece treinamento regular para motoristas?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'inicial', label: 'Solo inicial', label_pt: 'Apenas inicial' },
      { value: 'anual', label: 'Anual', label_pt: 'Anual' },
      { value: 'continua', label: 'Continua/Mensual', label_pt: 'Contínuo/Mensal' }
    ]
  },
  {
    id: 'trans_licencias_especiales',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Qué porcentaje de conductores tiene licencias especiales?',
    title_pt: 'Qual porcentagem de motoristas tem licenças especiais?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    unit: '%',
    appliesTo: CARGA_TYPES
  },
  {
    id: 'trans_despacho_equipo',
    category: 'equipo',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Tienes equipo de despacho/logística dedicado?',
    title_pt: 'Você tem equipe de despacho/logística dedicada?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, lo hace el dueño', label_pt: 'Não, o dono faz' },
      { value: '1-2', label: '1-2 personas', label_pt: '1-2 pessoas' },
      { value: '3-5', label: '3-5 personas', label_pt: '3-5 pessoas' },
      { value: '5+', label: 'Más de 5 personas', label_pt: 'Mais de 5 pessoas' }
    ]
  },

  // ========== FINANZAS (Category 5) ==========
  {
    id: 'trans_facturacion_mensual',
    category: 'finanzas',
    mode: 'both',
    dimension: 'finanzas',
    weight: 3,
    title: '¿Cuál es tu facturación mensual promedio?',
    title_pt: 'Qual é seu faturamento mensal médio?',
    type: 'money',
    min: 0,
    max: 10000000
  },
  {
    id: 'trans_margen_operativo',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 3,
    title: '¿Cuál es tu margen operativo aproximado?',
    title_pt: 'Qual é sua margem operacional aproximada?',
    type: 'slider',
    min: -10,
    max: 40,
    step: 2,
    unit: '%'
  },
  {
    id: 'trans_precio_km',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Conoces tu costo por kilómetro recorrido?',
    title_pt: 'Você conhece seu custo por quilômetro percorrido?',
    type: 'single',
    options: [
      { value: 'no', label: 'No lo calculo', label_pt: 'Não calculo' },
      { value: 'aproximado', label: 'Tengo un aproximado', label_pt: 'Tenho um aproximado' },
      { value: 'exacto', label: 'Lo calculo exactamente', label_pt: 'Calculo exatamente' }
    ]
  },
  {
    id: 'trans_cobranza_dias',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿En cuántos días cobras en promedio?',
    title_pt: 'Em quantos dias você recebe em média?',
    type: 'single',
    options: [
      { value: 'contado', label: 'Contado/Inmediato', label_pt: 'À vista/Imediato' },
      { value: '15', label: '15 días', label_pt: '15 dias' },
      { value: '30', label: '30 días', label_pt: '30 dias' },
      { value: '60+', label: '60+ días', label_pt: '60+ dias' }
    ]
  },
  {
    id: 'trans_seguros_flota',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Qué tipo de seguros tiene tu flota?',
    title_pt: 'Que tipo de seguros sua frota tem?',
    type: 'multi',
    options: [
      { value: 'responsabilidad', label: 'Responsabilidad civil', label_pt: 'Responsabilidade civil' },
      { value: 'todo_riesgo', label: 'Todo riesgo', label_pt: 'Risco total' },
      { value: 'carga', label: 'Seguro de carga', label_pt: 'Seguro de carga' },
      { value: 'vida_conductor', label: 'Vida para conductores', label_pt: 'Vida para motoristas' },
      { value: 'robo', label: 'Robo/Asalto', label_pt: 'Roubo/Assalto' }
    ]
  },
  {
    id: 'trans_financiamiento_vehiculos',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Qué porcentaje de la flota está financiada?',
    title_pt: 'Qual porcentagem da frota está financiada?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    unit: '%'
  },

  // ========== TECNOLOGÍA (Category 6) ==========
  {
    id: 'trans_tracking_tiempo_real',
    category: 'tecnologia',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Ofreces tracking en tiempo real a tus clientes?',
    title_pt: 'Você oferece rastreamento em tempo real para seus clientes?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'basico', label: 'Básico (WhatsApp/llamada)', label_pt: 'Básico (WhatsApp/ligação)' },
      { value: 'link', label: 'Link de seguimiento', label_pt: 'Link de rastreamento' },
      { value: 'app', label: 'App/Portal de cliente', label_pt: 'App/Portal do cliente' }
    ]
  },
  {
    id: 'trans_app_conductores',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Tus conductores usan app para gestión de entregas?',
    title_pt: 'Seus motoristas usam app para gestão de entregas?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, todo manual', label_pt: 'Não, tudo manual' },
      { value: 'whatsapp', label: 'WhatsApp/Mensajes', label_pt: 'WhatsApp/Mensagens' },
      { value: 'app_terceros', label: 'App de terceros', label_pt: 'App de terceiros' },
      { value: 'app_propia', label: 'App propia', label_pt: 'App próprio' }
    ]
  },
  {
    id: 'trans_facturacion_electronica',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Usas facturación electrónica automatizada?',
    title_pt: 'Você usa faturamento eletrônico automatizado?',
    type: 'single',
    options: [
      { value: 'no', label: 'No/Manual', label_pt: 'Não/Manual' },
      { value: 'parcial', label: 'Parcialmente', label_pt: 'Parcialmente' },
      { value: 'si', label: 'Sí, automatizado', label_pt: 'Sim, automatizado' }
    ]
  },
  {
    id: 'trans_optimizacion_rutas',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Usas software de optimización de rutas?',
    title_pt: 'Você usa software de otimização de rotas?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, rutas manuales', label_pt: 'Não, rotas manuais' },
      { value: 'google_maps', label: 'Google Maps/Waze', label_pt: 'Google Maps/Waze' },
      { value: 'software_basico', label: 'Software básico', label_pt: 'Software básico' },
      { value: 'software_avanzado', label: 'Software avanzado con IA', label_pt: 'Software avançado com IA' }
    ]
  },

  // ========== MARKETING Y REPUTACIÓN (Category 7) ==========
  {
    id: 'trans_presencia_digital',
    category: 'marketing',
    mode: 'both',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Qué presencia digital tienes?',
    title_pt: 'Qual presença digital você tem?',
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna', label_pt: 'Nenhuma' },
      { value: 'website', label: 'Sitio web', label_pt: 'Site' },
      { value: 'redes', label: 'Redes sociales', label_pt: 'Redes sociais' },
      { value: 'google', label: 'Google Business', label_pt: 'Google Business' },
      { value: 'plataformas', label: 'Plataformas de transporte', label_pt: 'Plataformas de transporte' }
    ]
  },
  {
    id: 'trans_nps_satisfaccion',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Mides la satisfacción de tus clientes?',
    title_pt: 'Você mede a satisfação dos seus clientes?',
    type: 'single',
    options: [
      { value: 'no', label: 'No mido', label_pt: 'Não meço' },
      { value: 'informal', label: 'Feedback informal', label_pt: 'Feedback informal' },
      { value: 'encuestas', label: 'Encuestas ocasionales', label_pt: 'Pesquisas ocasionais' },
      { value: 'nps', label: 'NPS/Métricas formales', label_pt: 'NPS/Métricas formais' }
    ]
  },
  {
    id: 'trans_reclamos_mensuales',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Cuántos reclamos recibes mensualmente?',
    title_pt: 'Quantas reclamações você recebe mensalmente?',
    type: 'single',
    options: [
      { value: '0-5', label: '0-5 reclamos', label_pt: '0-5 reclamações' },
      { value: '6-15', label: '6-15 reclamos', label_pt: '6-15 reclamações' },
      { value: '16-30', label: '16-30 reclamos', label_pt: '16-30 reclamações' },
      { value: '30+', label: 'Más de 30', label_pt: 'Mais de 30' }
    ]
  },
  {
    id: 'trans_certificaciones',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Tienes certificaciones de calidad/seguridad?',
    title_pt: 'Você tem certificações de qualidade/segurança?',
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna', label_pt: 'Nenhuma' },
      { value: 'iso', label: 'ISO 9001/14001', label_pt: 'ISO 9001/14001' },
      { value: 'basc', label: 'BASC', label_pt: 'BASC' },
      { value: 'oea', label: 'OEA/AEO', label_pt: 'OEA/AEO' },
      { value: 'ctpat', label: 'C-TPAT', label_pt: 'C-TPAT' },
      { value: 'otras', label: 'Otras sectoriales', label_pt: 'Outras setoriais' }
    ]
  },

  // ========== SEGURIDAD Y CUMPLIMIENTO (Category 8) ==========
  {
    id: 'trans_accidentes_anual',
    category: 'seguridad',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuántos accidentes tuvo tu flota el último año?',
    title_pt: 'Quantos acidentes sua frota teve no último ano?',
    type: 'single',
    options: [
      { value: '0', label: 'Ninguno', label_pt: 'Nenhum' },
      { value: '1-3', label: '1-3 accidentes', label_pt: '1-3 acidentes' },
      { value: '4-10', label: '4-10 accidentes', label_pt: '4-10 acidentes' },
      { value: '10+', label: 'Más de 10', label_pt: 'Mais de 10' }
    ]
  },
  {
    id: 'trans_control_horas',
    category: 'seguridad',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Controlas las horas de conducción de tus operadores?',
    title_pt: 'Você controla as horas de direção dos seus operadores?',
    type: 'single',
    options: [
      { value: 'no', label: 'No controlo', label_pt: 'Não controlo' },
      { value: 'manual', label: 'Control manual', label_pt: 'Controle manual' },
      { value: 'tacografo', label: 'Tacógrafo', label_pt: 'Tacógrafo' },
      { value: 'digital', label: 'Sistema digital automatizado', label_pt: 'Sistema digital automatizado' }
    ]
  },
  {
    id: 'trans_camaras_seguridad',
    category: 'seguridad',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Tienes cámaras de seguridad en vehículos?',
    title_pt: 'Você tem câmeras de segurança nos veículos?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'algunos', label: 'En algunos vehículos', label_pt: 'Em alguns veículos' },
      { value: 'todos', label: 'En toda la flota', label_pt: 'Em toda a frota' },
      { value: 'dashcam_ia', label: 'Dashcam con IA', label_pt: 'Dashcam com IA' }
    ]
  },

  // ========== METAS Y CRECIMIENTO (Category 9) ==========
  {
    id: 'trans_meta_crecimiento',
    category: 'metas',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 3,
    title: '¿Cuál es tu meta de crecimiento para este año?',
    title_pt: 'Qual é sua meta de crescimento para este ano?',
    type: 'single',
    options: [
      { value: 'mantener', label: 'Mantener nivel actual', label_pt: 'Manter nível atual' },
      { value: '0-10', label: 'Crecer 0-10%', label_pt: 'Crescer 0-10%' },
      { value: '10-25', label: 'Crecer 10-25%', label_pt: 'Crescer 10-25%' },
      { value: '25-50', label: 'Crecer 25-50%', label_pt: 'Crescer 25-50%' },
      { value: '50+', label: 'Crecer más del 50%', label_pt: 'Crescer mais de 50%' }
    ]
  },
  {
    id: 'trans_expansion_planes',
    category: 'metas',
    mode: 'complete',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Tienes planes de expansión geográfica?',
    title_pt: 'Você tem planos de expansão geográfica?',
    type: 'single',
    options: [
      { value: 'no', label: 'No por ahora', label_pt: 'Não por agora' },
      { value: 'misma_region', label: 'Más cobertura local', label_pt: 'Mais cobertura local' },
      { value: 'nueva_region', label: 'Nueva región/estado', label_pt: 'Nova região/estado' },
      { value: 'internacional', label: 'Expansión internacional', label_pt: 'Expansão internacional' }
    ]
  },
  {
    id: 'trans_renovacion_flota',
    category: 'metas',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Planeas renovar/ampliar tu flota este año?',
    title_pt: 'Você planeja renovar/ampliar sua frota este ano?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'reemplazar', label: 'Solo reemplazar viejos', label_pt: 'Apenas substituir antigos' },
      { value: 'ampliar', label: 'Ampliar flota', label_pt: 'Ampliar frota' },
      { value: 'electrificar', label: 'Migrar a eléctricos', label_pt: 'Migrar para elétricos' }
    ]
  },
  {
    id: 'trans_mayor_desafio',
    category: 'metas',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Cuál es tu mayor desafío actual?',
    title_pt: 'Qual é seu maior desafio atual?',
    type: 'single',
    options: [
      { value: 'combustible', label: 'Costos de combustible', label_pt: 'Custos de combustível' },
      { value: 'conductores', label: 'Encontrar conductores', label_pt: 'Encontrar motoristas' },
      { value: 'competencia', label: 'Competencia de precios', label_pt: 'Competição de preços' },
      { value: 'clientes', label: 'Conseguir clientes', label_pt: 'Conseguir clientes' },
      { value: 'tecnologia', label: 'Modernización tecnológica', label_pt: 'Modernização tecnológica' },
      { value: 'regulaciones', label: 'Regulaciones/Permisos', label_pt: 'Regulações/Permissões' }
    ]
  },

  // ========== ESPECÍFICOS POR TIPO (Category 10) ==========
  // Para Transporte de Pasajeros
  {
    id: 'trans_asientos_promedio',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es la capacidad promedio de tus vehículos?',
    title_pt: 'Qual é a capacidade média dos seus veículos?',
    type: 'single',
    options: [
      { value: '4-7', label: '4-7 pasajeros', label_pt: '4-7 passageiros' },
      { value: '8-15', label: '8-15 pasajeros', label_pt: '8-15 passageiros' },
      { value: '16-30', label: '16-30 pasajeros', label_pt: '16-30 passageiros' },
      { value: '30+', label: 'Más de 30', label_pt: 'Mais de 30' }
    ],
    appliesTo: PASAJEROS_TYPES
  },
  {
    id: 'trans_ocupacion_promedio',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es tu ocupación promedio por viaje?',
    title_pt: 'Qual é sua ocupação média por viagem?',
    type: 'slider',
    min: 20,
    max: 100,
    step: 10,
    unit: '%',
    appliesTo: PASAJEROS_TYPES
  },

  // Para Almacenamiento/3PL
  {
    id: 'trans_m2_almacen',
    category: 'especifico',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuántos metros cuadrados de almacén tienes?',
    title_pt: 'Quantos metros quadrados de armazém você tem?',
    type: 'number',
    min: 50,
    max: 100000,
    appliesTo: LOGISTICA_TYPES
  },
  {
    id: 'trans_ocupacion_almacen',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué porcentaje de ocupación tiene tu almacén?',
    title_pt: 'Qual porcentagem de ocupação seu armazém tem?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    unit: '%',
    appliesTo: LOGISTICA_TYPES
  },
  {
    id: 'trans_wms_sistema',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Usas sistema WMS para gestión de almacén?',
    title_pt: 'Você usa sistema WMS para gestão de armazém?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, todo manual', label_pt: 'Não, tudo manual' },
      { value: 'excel', label: 'Excel/Hojas de cálculo', label_pt: 'Excel/Planilhas' },
      { value: 'wms_basico', label: 'WMS básico', label_pt: 'WMS básico' },
      { value: 'wms_avanzado', label: 'WMS avanzado', label_pt: 'WMS avançado' }
    ],
    appliesTo: LOGISTICA_TYPES
  },

  // Para Courier/Mensajería
  {
    id: 'trans_paquetes_diarios',
    category: 'especifico',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántos paquetes/envíos gestionas por día?',
    title_pt: 'Quantos pacotes/envios você gerencia por dia?',
    type: 'number',
    min: 10,
    max: 50000,
    appliesTo: ENVIOS_TYPES
  },
  {
    id: 'trans_peso_promedio',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es el peso promedio de tus envíos?',
    title_pt: 'Qual é o peso médio dos seus envios?',
    type: 'single',
    options: [
      { value: '0-1', label: 'Menos de 1 kg', label_pt: 'Menos de 1 kg' },
      { value: '1-5', label: '1-5 kg', label_pt: '1-5 kg' },
      { value: '5-20', label: '5-20 kg', label_pt: '5-20 kg' },
      { value: '20+', label: 'Más de 20 kg', label_pt: 'Mais de 20 kg' }
    ],
    appliesTo: ENVIOS_TYPES
  },
  {
    id: 'trans_puntos_entrega',
    category: 'especifico',
    mode: 'complete',
    dimension: 'trafico',
    weight: 2,
    title: '¿Tienes puntos de entrega/lockers asociados?',
    title_pt: 'Você tem pontos de entrega/lockers associados?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, solo a domicilio', label_pt: 'Não, apenas em domicílio' },
      { value: '1-10', label: '1-10 puntos', label_pt: '1-10 pontos' },
      { value: '10-50', label: '10-50 puntos', label_pt: '10-50 pontos' },
      { value: '50+', label: 'Más de 50', label_pt: 'Mais de 50' }
    ],
    appliesTo: ENVIOS_TYPES
  }
];

// Helper function to get questions for transport sector
export function getTransporteQuestions(businessType?: string, mode?: 'quick' | 'complete'): TransporteQuestion[] {
  let questions = [...TRANSPORTE_COMPLETE_QUESTIONS];
  
  // Filter by business type if specified
  if (businessType) {
    questions = questions.filter(q => {
      if (!q.appliesTo) return true;
      return q.appliesTo.includes(businessType);
    });
  }
  
  // Filter by mode if specified
  if (mode) {
    questions = questions.filter(q => q.mode === mode || q.mode === 'both');
  }
  
  return questions;
}
