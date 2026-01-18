// Agro y Agroindustria - 18 Business Types
// Ultra-specific questionnaires: Quick (10-15) + Complete (68-75)
// 7 Dimensions: Crecimiento, Equipo, Tráfico, Rentabilidad, Finanzas, Eficiencia, Reputación

export interface AgroQuestion {
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

// 18 Business Types for Agro & Agroindustry
export const AGRO_BUSINESS_TYPES = {
  PRODUCCION_AGRICOLA: 'produccion_agricola',
  PRODUCCION_GANADERA: 'produccion_ganadera',
  AVICULTURA: 'avicultura',
  PORCICULTURA: 'porcicultura',
  ACUICULTURA: 'acuicultura',
  APICULTURA: 'apicultura',
  FLORICULTURA: 'floricultura',
  VIVEROS: 'viveros',
  AGROINDUSTRIA: 'agroindustria',
  FRIGORIFICOS: 'frigorificos',
  ACOPIO_GRANOS: 'acopio_granos',
  DISTRIBUCION_INSUMOS: 'distribucion_insumos',
  MAQUINARIA_AGRICOLA: 'maquinaria_agricola',
  SERVICIOS_AGRICOLAS: 'servicios_agricolas',
  ORGANICOS_SUSTENTABLES: 'organicos_sustentables',
  FORESTAL: 'forestal',
  LACTEOS: 'lacteos',
  VITICULTURA: 'viticultura'
};

// Business type groupings for conditional logic
const CULTIVOS_TYPES = [
  AGRO_BUSINESS_TYPES.PRODUCCION_AGRICOLA,
  AGRO_BUSINESS_TYPES.FLORICULTURA,
  AGRO_BUSINESS_TYPES.VIVEROS,
  AGRO_BUSINESS_TYPES.ORGANICOS_SUSTENTABLES,
  AGRO_BUSINESS_TYPES.VITICULTURA
];

const GANADERIA_TYPES = [
  AGRO_BUSINESS_TYPES.PRODUCCION_GANADERA,
  AGRO_BUSINESS_TYPES.AVICULTURA,
  AGRO_BUSINESS_TYPES.PORCICULTURA,
  AGRO_BUSINESS_TYPES.ACUICULTURA,
  AGRO_BUSINESS_TYPES.APICULTURA,
  AGRO_BUSINESS_TYPES.LACTEOS
];

const PROCESAMIENTO_TYPES = [
  AGRO_BUSINESS_TYPES.AGROINDUSTRIA,
  AGRO_BUSINESS_TYPES.FRIGORIFICOS,
  AGRO_BUSINESS_TYPES.ACOPIO_GRANOS
];

const SERVICIOS_TYPES = [
  AGRO_BUSINESS_TYPES.DISTRIBUCION_INSUMOS,
  AGRO_BUSINESS_TYPES.MAQUINARIA_AGRICOLA,
  AGRO_BUSINESS_TYPES.SERVICIOS_AGRICOLAS
];

export const AGRO_COMPLETE_QUESTIONS: AgroQuestion[] = [
  // ========== IDENTIDAD Y OPERACIÓN (Category 1) ==========
  {
    id: 'agro_hectareas_produccion',
    category: 'identidad',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántas hectáreas tiene tu producción?',
    title_pt: 'Quantos hectares tem sua produção?',
    type: 'number',
    min: 1,
    max: 100000,
    appliesTo: [...CULTIVOS_TYPES, AGRO_BUSINESS_TYPES.FORESTAL]
  },
  {
    id: 'agro_cabezas_ganado',
    category: 'identidad',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántas cabezas de ganado/animales tienes?',
    title_pt: 'Quantas cabeças de gado/animais você tem?',
    type: 'number',
    min: 1,
    max: 100000,
    appliesTo: GANADERIA_TYPES
  },
  {
    id: 'agro_tipo_produccion',
    category: 'identidad',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 3,
    title: '¿Qué tipo de producción principal tienes?',
    title_pt: 'Que tipo de produção principal você tem?',
    type: 'multi',
    options: [
      { value: 'granos', label: 'Granos (maíz, soja, trigo)', label_pt: 'Grãos (milho, soja, trigo)' },
      { value: 'hortalizas', label: 'Hortalizas/Verduras', label_pt: 'Hortaliças/Verduras' },
      { value: 'frutas', label: 'Frutas', label_pt: 'Frutas' },
      { value: 'carne', label: 'Carne bovina/porcina', label_pt: 'Carne bovina/suína' },
      { value: 'aves', label: 'Aves/Huevos', label_pt: 'Aves/Ovos' },
      { value: 'leche', label: 'Leche/Lácteos', label_pt: 'Leite/Laticínios' },
      { value: 'miel', label: 'Miel/Derivados', label_pt: 'Mel/Derivados' },
      { value: 'flores', label: 'Flores/Plantas', label_pt: 'Flores/Plantas' },
      { value: 'madera', label: 'Madera/Forestales', label_pt: 'Madeira/Florestais' },
      { value: 'vino', label: 'Uvas/Vino', label_pt: 'Uvas/Vinho' }
    ]
  },
  {
    id: 'agro_sistema_produccion',
    category: 'identidad',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué sistema de producción utilizas?',
    title_pt: 'Que sistema de produção você usa?',
    type: 'single',
    options: [
      { value: 'convencional', label: 'Convencional', label_pt: 'Convencional' },
      { value: 'organico', label: 'Orgánico certificado', label_pt: 'Orgânico certificado' },
      { value: 'transicion', label: 'En transición orgánica', label_pt: 'Em transição orgânica' },
      { value: 'regenerativo', label: 'Regenerativo', label_pt: 'Regenerativo' },
      { value: 'hidroponico', label: 'Hidropónico/Controlado', label_pt: 'Hidropônico/Controlado' }
    ]
  },
  {
    id: 'agro_propiedad_tierra',
    category: 'identidad',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Cuál es tu situación de propiedad de tierra/instalaciones?',
    title_pt: 'Qual é sua situação de propriedade de terra/instalações?',
    type: 'single',
    options: [
      { value: 'propia', label: '100% propia', label_pt: '100% própria' },
      { value: 'mayoria_propia', label: 'Mayoría propia + alquiler', label_pt: 'Maioria própria + aluguel' },
      { value: 'mayoria_alquiler', label: 'Mayoría alquilada', label_pt: 'Maioria alugada' },
      { value: 'alquiler', label: '100% alquilada', label_pt: '100% alugada' }
    ]
  },
  {
    id: 'agro_ciclos_anuales',
    category: 'identidad',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuántos ciclos de producción tienes al año?',
    title_pt: 'Quantos ciclos de produção você tem por ano?',
    type: 'single',
    options: [
      { value: '1', label: '1 ciclo (anual)', label_pt: '1 ciclo (anual)' },
      { value: '2', label: '2 ciclos', label_pt: '2 ciclos' },
      { value: '3-4', label: '3-4 ciclos', label_pt: '3-4 ciclos' },
      { value: 'continuo', label: 'Producción continua', label_pt: 'Produção contínua' }
    ],
    appliesTo: CULTIVOS_TYPES
  },

  // ========== EQUIPO Y MANO DE OBRA (Category 2) ==========
  {
    id: 'agro_empleados_permanentes',
    category: 'equipo',
    mode: 'both',
    dimension: 'equipo',
    weight: 3,
    title: '¿Cuántos empleados permanentes tienes?',
    title_pt: 'Quantos funcionários permanentes você tem?',
    type: 'number',
    min: 0,
    max: 500
  },
  {
    id: 'agro_empleados_temporales',
    category: 'equipo',
    mode: 'both',
    dimension: 'equipo',
    weight: 2,
    title: '¿Cuántos empleados temporales contratas en temporada alta?',
    title_pt: 'Quantos funcionários temporários você contrata na alta temporada?',
    type: 'number',
    min: 0,
    max: 1000
  },
  {
    id: 'agro_capacitacion_equipo',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Ofreces capacitación a tu personal?',
    title_pt: 'Você oferece treinamento para seu pessoal?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'induccion', label: 'Solo inducción inicial', label_pt: 'Apenas indução inicial' },
      { value: 'anual', label: 'Capacitación anual', label_pt: 'Treinamento anual' },
      { value: 'continua', label: 'Programa continuo', label_pt: 'Programa contínuo' }
    ]
  },
  {
    id: 'agro_profesional_agronomo',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Cuentas con asesoría de ingeniero agrónomo/veterinario?',
    title_pt: 'Você conta com assessoria de engenheiro agrônomo/veterinário?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'ocasional', label: 'Consultas ocasionales', label_pt: 'Consultas ocasionais' },
      { value: 'contrato', label: 'Contrato periódico', label_pt: 'Contrato periódico' },
      { value: 'planta', label: 'Profesional de planta', label_pt: 'Profissional fixo' }
    ]
  },
  {
    id: 'agro_seguridad_laboral',
    category: 'equipo',
    mode: 'complete',
    dimension: 'equipo',
    weight: 2,
    title: '¿Tienes programa de seguridad laboral?',
    title_pt: 'Você tem programa de segurança no trabalho?',
    type: 'single',
    options: [
      { value: 'no', label: 'No formalizado', label_pt: 'Não formalizado' },
      { value: 'basico', label: 'EPP básico', label_pt: 'EPI básico' },
      { value: 'programa', label: 'Programa formal', label_pt: 'Programa formal' },
      { value: 'certificado', label: 'Certificación de seguridad', label_pt: 'Certificação de segurança' }
    ]
  },

  // ========== MAQUINARIA Y TECNOLOGÍA (Category 3) ==========
  {
    id: 'agro_maquinaria_propia',
    category: 'tecnologia',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué porcentaje de maquinaria es propia vs contratada?',
    title_pt: 'Qual porcentagem de maquinaria é própria vs contratada?',
    type: 'single',
    options: [
      { value: 'toda_propia', label: '100% propia', label_pt: '100% própria' },
      { value: 'mayoria_propia', label: 'Mayoría propia', label_pt: 'Maioria própria' },
      { value: 'mixto', label: '50/50', label_pt: '50/50' },
      { value: 'mayoria_contratada', label: 'Mayoría contratada', label_pt: 'Maioria contratada' },
      { value: 'toda_contratada', label: '100% contratada', label_pt: '100% contratada' }
    ]
  },
  {
    id: 'agro_edad_maquinaria',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cuál es la edad promedio de tu maquinaria?',
    title_pt: 'Qual é a idade média da sua maquinaria?',
    type: 'single',
    options: [
      { value: '0-5', label: '0-5 años', label_pt: '0-5 anos' },
      { value: '5-10', label: '5-10 años', label_pt: '5-10 anos' },
      { value: '10-20', label: '10-20 años', label_pt: '10-20 anos' },
      { value: '20+', label: 'Más de 20 años', label_pt: 'Mais de 20 anos' }
    ]
  },
  {
    id: 'agro_tecnologia_precision',
    category: 'tecnologia',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Usas tecnología de agricultura de precisión?',
    title_pt: 'Você usa tecnologia de agricultura de precisão?',
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna', label_pt: 'Nenhuma' },
      { value: 'gps', label: 'GPS en maquinaria', label_pt: 'GPS em maquinaria' },
      { value: 'drones', label: 'Drones/Imágenes aéreas', label_pt: 'Drones/Imagens aéreas' },
      { value: 'sensores', label: 'Sensores de suelo/clima', label_pt: 'Sensores de solo/clima' },
      { value: 'software', label: 'Software de gestión agrícola', label_pt: 'Software de gestão agrícola' },
      { value: 'vra', label: 'Aplicación variable (VRA)', label_pt: 'Aplicação variável (VRA)' }
    ],
    appliesTo: CULTIVOS_TYPES
  },
  {
    id: 'agro_riego_sistema',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué sistema de riego utilizas?',
    title_pt: 'Que sistema de irrigação você usa?',
    type: 'single',
    options: [
      { value: 'secano', label: 'Secano (sin riego)', label_pt: 'Sequeiro (sem irrigação)' },
      { value: 'gravedad', label: 'Riego por gravedad', label_pt: 'Irrigação por gravidade' },
      { value: 'aspersion', label: 'Aspersión', label_pt: 'Aspersão' },
      { value: 'goteo', label: 'Goteo', label_pt: 'Gotejo' },
      { value: 'pivot', label: 'Pivot central', label_pt: 'Pivô central' }
    ],
    appliesTo: CULTIVOS_TYPES
  },
  {
    id: 'agro_trazabilidad',
    category: 'tecnologia',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Tienes sistema de trazabilidad de productos?',
    title_pt: 'Você tem sistema de rastreabilidade de produtos?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'parcial', label: 'Parcial/Manual', label_pt: 'Parcial/Manual' },
      { value: 'digital', label: 'Sistema digital', label_pt: 'Sistema digital' },
      { value: 'blockchain', label: 'Trazabilidad blockchain', label_pt: 'Rastreabilidade blockchain' }
    ]
  },

  // ========== COMERCIALIZACIÓN (Category 4) ==========
  {
    id: 'agro_canales_venta',
    category: 'comercializacion',
    mode: 'both',
    dimension: 'trafico',
    weight: 3,
    title: '¿Cuáles son tus principales canales de venta?',
    title_pt: 'Quais são seus principais canais de venda?',
    type: 'multi',
    options: [
      { value: 'intermediarios', label: 'Intermediarios/Acopiadores', label_pt: 'Intermediários/Armazenadores' },
      { value: 'industria', label: 'Venta directa a industria', label_pt: 'Venda direta à indústria' },
      { value: 'exportacion', label: 'Exportación', label_pt: 'Exportação' },
      { value: 'mercados', label: 'Mercados mayoristas', label_pt: 'Mercados atacadistas' },
      { value: 'retail', label: 'Retail/Supermercados', label_pt: 'Varejo/Supermercados' },
      { value: 'directo', label: 'Venta directa al consumidor', label_pt: 'Venda direta ao consumidor' },
      { value: 'cooperativa', label: 'Cooperativa', label_pt: 'Cooperativa' }
    ]
  },
  {
    id: 'agro_contratos_forward',
    category: 'comercializacion',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Qué porcentaje de producción vendes con contratos forward/anticipados?',
    title_pt: 'Qual porcentagem da produção você vende com contratos forward/antecipados?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 10,
    unit: '%'
  },
  {
    id: 'agro_almacenamiento_propio',
    category: 'comercializacion',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Tienes capacidad de almacenamiento propia?',
    title_pt: 'Você tem capacidade de armazenamento própria?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, vendo directo', label_pt: 'Não, vendo direto' },
      { value: 'parcial', label: 'Almacenamiento parcial', label_pt: 'Armazenamento parcial' },
      { value: 'completo', label: 'Almacenamiento completo', label_pt: 'Armazenamento completo' },
      { value: 'excedente', label: 'Almaceno y alquilo espacio', label_pt: 'Armazeno e alugo espaço' }
    ]
  },
  {
    id: 'agro_valor_agregado',
    category: 'comercializacion',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Agregas valor a tu producción antes de vender?',
    title_pt: 'Você agrega valor à sua produção antes de vender?',
    type: 'multi',
    options: [
      { value: 'no', label: 'No, vendo en bruto', label_pt: 'Não, vendo em bruto' },
      { value: 'clasificacion', label: 'Clasificación/Selección', label_pt: 'Classificação/Seleção' },
      { value: 'empaque', label: 'Empaque/Marca propia', label_pt: 'Embalagem/Marca própria' },
      { value: 'procesamiento', label: 'Procesamiento básico', label_pt: 'Processamento básico' },
      { value: 'transformacion', label: 'Transformación industrial', label_pt: 'Transformação industrial' }
    ]
  },
  {
    id: 'agro_certificaciones',
    category: 'comercializacion',
    mode: 'both',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Tienes certificaciones de calidad?',
    title_pt: 'Você tem certificações de qualidade?',
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna', label_pt: 'Nenhuma' },
      { value: 'organico', label: 'Orgánico', label_pt: 'Orgânico' },
      { value: 'global_gap', label: 'GlobalGAP', label_pt: 'GlobalGAP' },
      { value: 'fair_trade', label: 'Fair Trade', label_pt: 'Comércio Justo' },
      { value: 'rainforest', label: 'Rainforest Alliance', label_pt: 'Rainforest Alliance' },
      { value: 'denominacion', label: 'Denominación de origen', label_pt: 'Denominação de origem' },
      { value: 'iso', label: 'ISO/HACCP', label_pt: 'ISO/HACCP' }
    ]
  },

  // ========== FINANZAS (Category 5) ==========
  {
    id: 'agro_facturacion_anual',
    category: 'finanzas',
    mode: 'both',
    dimension: 'finanzas',
    weight: 3,
    title: '¿Cuál es tu facturación anual aproximada?',
    title_pt: 'Qual é seu faturamento anual aproximado?',
    type: 'money',
    min: 0,
    max: 100000000
  },
  {
    id: 'agro_rentabilidad',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 3,
    title: '¿Cuál es tu margen de rentabilidad neta?',
    title_pt: 'Qual é sua margem de rentabilidade líquida?',
    type: 'single',
    options: [
      { value: 'negativo', label: 'Negativo', label_pt: 'Negativo' },
      { value: '0-10', label: '0-10%', label_pt: '0-10%' },
      { value: '10-20', label: '10-20%', label_pt: '10-20%' },
      { value: '20-30', label: '20-30%', label_pt: '20-30%' },
      { value: '30+', label: 'Más del 30%', label_pt: 'Mais de 30%' }
    ]
  },
  {
    id: 'agro_financiamiento',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Cómo financias la operación/campaña?',
    title_pt: 'Como você financia a operação/campanha?',
    type: 'multi',
    options: [
      { value: 'propio', label: 'Capital propio', label_pt: 'Capital próprio' },
      { value: 'banco', label: 'Crédito bancario', label_pt: 'Crédito bancário' },
      { value: 'proveedor', label: 'Crédito de proveedores', label_pt: 'Crédito de fornecedores' },
      { value: 'anticipo', label: 'Anticipo de compradores', label_pt: 'Antecipação de compradores' },
      { value: 'subsidios', label: 'Subsidios/Programas gobierno', label_pt: 'Subsídios/Programas governo' }
    ]
  },
  {
    id: 'agro_costo_insumos',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Qué porcentaje de tus costos son insumos (semillas, fertilizantes, agroquímicos)?',
    title_pt: 'Qual porcentagem dos seus custos são insumos (sementes, fertilizantes, agroquímicos)?',
    type: 'slider',
    min: 10,
    max: 70,
    step: 5,
    unit: '%',
    appliesTo: CULTIVOS_TYPES
  },
  {
    id: 'agro_costo_alimentacion',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Qué porcentaje de tus costos es alimentación animal?',
    title_pt: 'Qual porcentagem dos seus custos é alimentação animal?',
    type: 'slider',
    min: 20,
    max: 80,
    step: 5,
    unit: '%',
    appliesTo: GANADERIA_TYPES
  },
  {
    id: 'agro_seguro_agricola',
    category: 'finanzas',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Contratas seguro agrícola/ganadero?',
    title_pt: 'Você contrata seguro agrícola/pecuário?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'basico', label: 'Cobertura básica', label_pt: 'Cobertura básica' },
      { value: 'multirriesgo', label: 'Multirriesgo', label_pt: 'Multirrisco' },
      { value: 'integral', label: 'Integral con pérdidas', label_pt: 'Integral com perdas' }
    ]
  },

  // ========== PRODUCCIÓN Y RENDIMIENTOS (Category 6) ==========
  {
    id: 'agro_rendimiento_vs_zona',
    category: 'produccion',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cómo es tu rendimiento vs promedio de la zona?',
    title_pt: 'Como é seu rendimento vs média da região?',
    type: 'single',
    options: [
      { value: 'bajo', label: 'Por debajo del promedio', label_pt: 'Abaixo da média' },
      { value: 'promedio', label: 'Similar al promedio', label_pt: 'Similar à média' },
      { value: 'alto', label: '10-20% superior', label_pt: '10-20% superior' },
      { value: 'top', label: 'Más del 20% superior', label_pt: 'Mais de 20% superior' }
    ]
  },
  {
    id: 'agro_perdidas_produccion',
    category: 'produccion',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué porcentaje de pérdidas tienes normalmente?',
    title_pt: 'Qual porcentagem de perdas você tem normalmente?',
    type: 'slider',
    min: 0,
    max: 40,
    step: 2,
    unit: '%'
  },
  {
    id: 'agro_plagas_manejo',
    category: 'produccion',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Cómo manejas plagas y enfermedades?',
    title_pt: 'Como você gerencia pragas e doenças?',
    type: 'single',
    options: [
      { value: 'reactivo', label: 'Reactivo cuando aparecen', label_pt: 'Reativo quando aparecem' },
      { value: 'calendario', label: 'Calendario fijo', label_pt: 'Calendário fixo' },
      { value: 'monitoreo', label: 'Monitoreo y umbral', label_pt: 'Monitoramento e limiar' },
      { value: 'integrado', label: 'Manejo integrado (MIP)', label_pt: 'Manejo integrado (MIP)' }
    ],
    appliesTo: CULTIVOS_TYPES
  },
  {
    id: 'agro_sanidad_animal',
    category: 'produccion',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Tienes programa de sanidad animal?',
    title_pt: 'Você tem programa de sanidade animal?',
    type: 'single',
    options: [
      { value: 'basico', label: 'Solo vacunas obligatorias', label_pt: 'Apenas vacinas obrigatórias' },
      { value: 'preventivo', label: 'Programa preventivo', label_pt: 'Programa preventivo' },
      { value: 'integral', label: 'Programa integral', label_pt: 'Programa integral' },
      { value: 'certificado', label: 'Certificación sanitaria', label_pt: 'Certificação sanitária' }
    ],
    appliesTo: GANADERIA_TYPES
  },
  {
    id: 'agro_genetica_semillas',
    category: 'produccion',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué calidad de genética/semillas utilizas?',
    title_pt: 'Que qualidade de genética/sementes você usa?',
    type: 'single',
    options: [
      { value: 'propia', label: 'Producción propia', label_pt: 'Produção própria' },
      { value: 'comercial', label: 'Comercial estándar', label_pt: 'Comercial padrão' },
      { value: 'certificada', label: 'Certificada', label_pt: 'Certificada' },
      { value: 'premium', label: 'Premium/Última generación', label_pt: 'Premium/Última geração' }
    ]
  },

  // ========== SUSTENTABILIDAD (Category 7) ==========
  {
    id: 'agro_practicas_sustentables',
    category: 'sustentabilidad',
    mode: 'both',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Qué prácticas sustentables implementas?',
    title_pt: 'Que práticas sustentáveis você implementa?',
    type: 'multi',
    options: [
      { value: 'ninguna', label: 'Ninguna específica', label_pt: 'Nenhuma específica' },
      { value: 'rotacion', label: 'Rotación de cultivos', label_pt: 'Rotação de culturas' },
      { value: 'cobertura', label: 'Cultivos de cobertura', label_pt: 'Culturas de cobertura' },
      { value: 'siembra_directa', label: 'Siembra directa', label_pt: 'Plantio direto' },
      { value: 'compostaje', label: 'Compostaje/Reciclaje', label_pt: 'Compostagem/Reciclagem' },
      { value: 'energia_renovable', label: 'Energía renovable', label_pt: 'Energia renovável' },
      { value: 'agua_eficiente', label: 'Uso eficiente de agua', label_pt: 'Uso eficiente de água' }
    ]
  },
  {
    id: 'agro_huella_carbono',
    category: 'sustentabilidad',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Mides tu huella de carbono?',
    title_pt: 'Você mede sua pegada de carbono?',
    type: 'single',
    options: [
      { value: 'no', label: 'No', label_pt: 'Não' },
      { value: 'interes', label: 'Me interesa medirla', label_pt: 'Tenho interesse em medir' },
      { value: 'estimacion', label: 'Tengo estimación', label_pt: 'Tenho estimativa' },
      { value: 'certificada', label: 'Medición certificada', label_pt: 'Medição certificada' }
    ]
  },
  {
    id: 'agro_bienestar_animal',
    category: 'sustentabilidad',
    mode: 'complete',
    dimension: 'reputacion',
    weight: 2,
    title: '¿Cumples estándares de bienestar animal?',
    title_pt: 'Você cumpre padrões de bem-estar animal?',
    type: 'single',
    options: [
      { value: 'basico', label: 'Requisitos mínimos legales', label_pt: 'Requisitos mínimos legais' },
      { value: 'buenas_practicas', label: 'Buenas prácticas', label_pt: 'Boas práticas' },
      { value: 'certificado', label: 'Certificación de bienestar', label_pt: 'Certificação de bem-estar' },
      { value: 'premium', label: 'Estándares premium', label_pt: 'Padrões premium' }
    ],
    appliesTo: GANADERIA_TYPES
  },

  // ========== MERCADO Y COMPETENCIA (Category 8) ==========
  {
    id: 'agro_poder_negociacion',
    category: 'mercado',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Cómo es tu poder de negociación con compradores?',
    title_pt: 'Como é seu poder de negociação com compradores?',
    type: 'single',
    options: [
      { value: 'bajo', label: 'Bajo, acepto precios', label_pt: 'Baixo, aceito preços' },
      { value: 'medio', label: 'Medio, algo de margen', label_pt: 'Médio, alguma margem' },
      { value: 'alto', label: 'Alto, negocio bien', label_pt: 'Alto, negocio bem' },
      { value: 'muy_alto', label: 'Muy alto, fijo condiciones', label_pt: 'Muito alto, fixo condições' }
    ]
  },
  {
    id: 'agro_dependencia_comprador',
    category: 'mercado',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Qué porcentaje de ventas va a tu comprador principal?',
    title_pt: 'Qual porcentagem de vendas vai para seu principal comprador?',
    type: 'slider',
    min: 10,
    max: 100,
    step: 10,
    unit: '%'
  },
  {
    id: 'agro_volatilidad_precios',
    category: 'mercado',
    mode: 'complete',
    dimension: 'finanzas',
    weight: 2,
    title: '¿Cómo te afecta la volatilidad de precios?',
    title_pt: 'Como a volatilidade de preços afeta você?',
    type: 'single',
    options: [
      { value: 'muy_afectado', label: 'Muy afectado, sin cobertura', label_pt: 'Muito afetado, sem cobertura' },
      { value: 'afectado', label: 'Afectado moderadamente', label_pt: 'Afetado moderadamente' },
      { value: 'cubierto', label: 'Tengo coberturas parciales', label_pt: 'Tenho coberturas parciais' },
      { value: 'protegido', label: 'Bien protegido/Contratos fijos', label_pt: 'Bem protegido/Contratos fixos' }
    ]
  },

  // ========== METAS Y CRECIMIENTO (Category 9) ==========
  {
    id: 'agro_meta_crecimiento',
    category: 'metas',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 3,
    title: '¿Cuál es tu objetivo principal para los próximos 2 años?',
    title_pt: 'Qual é seu objetivo principal para os próximos 2 anos?',
    type: 'single',
    options: [
      { value: 'mantener', label: 'Mantener producción actual', label_pt: 'Manter produção atual' },
      { value: 'crecer_area', label: 'Crecer en área/animales', label_pt: 'Crescer em área/animais' },
      { value: 'mejorar_rendimiento', label: 'Mejorar rendimientos', label_pt: 'Melhorar rendimentos' },
      { value: 'agregar_valor', label: 'Agregar valor/Procesar', label_pt: 'Agregar valor/Processar' },
      { value: 'diversificar', label: 'Diversificar productos', label_pt: 'Diversificar produtos' },
      { value: 'exportar', label: 'Exportar', label_pt: 'Exportar' }
    ]
  },
  {
    id: 'agro_inversion_planificada',
    category: 'metas',
    mode: 'complete',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Planeas invertir en el próximo año?',
    title_pt: 'Você planeja investir no próximo ano?',
    type: 'multi',
    options: [
      { value: 'no', label: 'No por ahora', label_pt: 'Não por agora' },
      { value: 'tierra', label: 'Más tierra/Instalaciones', label_pt: 'Mais terra/Instalações' },
      { value: 'maquinaria', label: 'Maquinaria/Equipos', label_pt: 'Maquinaria/Equipamentos' },
      { value: 'tecnologia', label: 'Tecnología', label_pt: 'Tecnologia' },
      { value: 'riego', label: 'Sistema de riego', label_pt: 'Sistema de irrigação' },
      { value: 'procesamiento', label: 'Capacidad de procesamiento', label_pt: 'Capacidade de processamento' }
    ]
  },
  {
    id: 'agro_mayor_desafio',
    category: 'metas',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Cuál es tu mayor desafío actual?',
    title_pt: 'Qual é seu maior desafio atual?',
    type: 'single',
    options: [
      { value: 'clima', label: 'Variabilidad climática', label_pt: 'Variabilidade climática' },
      { value: 'costos', label: 'Costos de insumos', label_pt: 'Custos de insumos' },
      { value: 'precios', label: 'Precios de venta bajos', label_pt: 'Preços de venda baixos' },
      { value: 'mano_obra', label: 'Conseguir mano de obra', label_pt: 'Conseguir mão de obra' },
      { value: 'financiamiento', label: 'Acceso a financiamiento', label_pt: 'Acesso a financiamento' },
      { value: 'comercializacion', label: 'Comercialización', label_pt: 'Comercialização' },
      { value: 'tecnologia', label: 'Adopción tecnológica', label_pt: 'Adoção tecnológica' }
    ]
  },

  // ========== ESPECÍFICOS POR TIPO (Category 10) ==========
  // Para Lácteos
  {
    id: 'agro_litros_dia',
    category: 'especifico',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántos litros de leche produces por día?',
    title_pt: 'Quantos litros de leite você produz por dia?',
    type: 'number',
    min: 10,
    max: 100000,
    appliesTo: [AGRO_BUSINESS_TYPES.LACTEOS]
  },
  {
    id: 'agro_ordeña_sistema',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué sistema de ordeña utilizas?',
    title_pt: 'Que sistema de ordenha você usa?',
    type: 'single',
    options: [
      { value: 'manual', label: 'Manual', label_pt: 'Manual' },
      { value: 'balde', label: 'Balde al pie', label_pt: 'Balde ao pé' },
      { value: 'espina', label: 'Sala espina de pescado', label_pt: 'Sala espinha de peixe' },
      { value: 'rotativa', label: 'Rotativa', label_pt: 'Rotativa' },
      { value: 'robot', label: 'Robot de ordeña', label_pt: 'Robô de ordenha' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.LACTEOS]
  },

  // Para Viticultura
  {
    id: 'agro_variedades_uva',
    category: 'especifico',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Qué variedades de uva cultivas?',
    title_pt: 'Que variedades de uva você cultiva?',
    type: 'multi',
    options: [
      { value: 'malbec', label: 'Malbec', label_pt: 'Malbec' },
      { value: 'cabernet', label: 'Cabernet Sauvignon', label_pt: 'Cabernet Sauvignon' },
      { value: 'merlot', label: 'Merlot', label_pt: 'Merlot' },
      { value: 'chardonnay', label: 'Chardonnay', label_pt: 'Chardonnay' },
      { value: 'torrontes', label: 'Torrontés', label_pt: 'Torrontés' },
      { value: 'mesa', label: 'Uvas de mesa', label_pt: 'Uvas de mesa' },
      { value: 'otras', label: 'Otras variedades', label_pt: 'Outras variedades' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.VITICULTURA]
  },
  {
    id: 'agro_bodega_propia',
    category: 'especifico',
    mode: 'complete',
    dimension: 'rentabilidad',
    weight: 2,
    title: '¿Tienes bodega propia para vinificación?',
    title_pt: 'Você tem adega própria para vinificação?',
    type: 'single',
    options: [
      { value: 'no', label: 'No, vendo uva', label_pt: 'Não, vendo uva' },
      { value: 'terceros', label: 'Vinifico en bodega de terceros', label_pt: 'Vinifico em adega de terceiros' },
      { value: 'propia_pequeña', label: 'Bodega propia pequeña', label_pt: 'Adega própria pequena' },
      { value: 'propia_grande', label: 'Bodega propia con capacidad', label_pt: 'Adega própria com capacidade' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.VITICULTURA]
  },

  // Para Avicultura
  {
    id: 'agro_aves_cantidad',
    category: 'especifico',
    mode: 'both',
    dimension: 'eficiencia',
    weight: 3,
    title: '¿Cuántas aves tienes en producción?',
    title_pt: 'Quantas aves você tem em produção?',
    type: 'number',
    min: 100,
    max: 10000000,
    appliesTo: [AGRO_BUSINESS_TYPES.AVICULTURA]
  },
  {
    id: 'agro_tipo_avicultura',
    category: 'especifico',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Qué tipo de producción avícola tienes?',
    title_pt: 'Que tipo de produção avícola você tem?',
    type: 'single',
    options: [
      { value: 'huevo', label: 'Producción de huevo', label_pt: 'Produção de ovo' },
      { value: 'carne', label: 'Producción de carne (pollo)', label_pt: 'Produção de carne (frango)' },
      { value: 'mixto', label: 'Mixto', label_pt: 'Misto' },
      { value: 'reproductoras', label: 'Reproductoras', label_pt: 'Reprodutoras' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.AVICULTURA]
  },

  // Para Acuicultura
  {
    id: 'agro_especies_acuicolas',
    category: 'especifico',
    mode: 'both',
    dimension: 'crecimiento',
    weight: 2,
    title: '¿Qué especies produces?',
    title_pt: 'Que espécies você produz?',
    type: 'multi',
    options: [
      { value: 'tilapia', label: 'Tilapia', label_pt: 'Tilápia' },
      { value: 'trucha', label: 'Trucha', label_pt: 'Truta' },
      { value: 'salmon', label: 'Salmón', label_pt: 'Salmão' },
      { value: 'camaron', label: 'Camarón', label_pt: 'Camarão' },
      { value: 'otros_peces', label: 'Otros peces', label_pt: 'Outros peixes' },
      { value: 'moluscos', label: 'Moluscos', label_pt: 'Moluscos' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.ACUICULTURA]
  },
  {
    id: 'agro_tipo_acuicultura',
    category: 'especifico',
    mode: 'complete',
    dimension: 'eficiencia',
    weight: 2,
    title: '¿Qué tipo de sistema acuícola utilizas?',
    title_pt: 'Que tipo de sistema aquícola você usa?',
    type: 'single',
    options: [
      { value: 'estanques', label: 'Estanques/Pozas', label_pt: 'Tanques/Viveiros' },
      { value: 'jaulas', label: 'Jaulas flotantes', label_pt: 'Gaiolas flutuantes' },
      { value: 'ras', label: 'Sistema RAS (recirculación)', label_pt: 'Sistema RAS (recirculação)' },
      { value: 'intensivo', label: 'Intensivo en tierra', label_pt: 'Intensivo em terra' }
    ],
    appliesTo: [AGRO_BUSINESS_TYPES.ACUICULTURA]
  }
];

// Helper function to get questions for agro sector
export function getAgroQuestions(businessType?: string, mode?: 'quick' | 'complete'): AgroQuestion[] {
  let questions = [...AGRO_COMPLETE_QUESTIONS];
  
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
