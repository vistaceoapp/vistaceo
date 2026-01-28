// Laboratorio de Análisis Clínicos - Cuestionario Hiper-Personalizado
// Quick: 15 preguntas | Complete: 70 preguntas
// 12 categorías + 7 dimensiones de salud

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const LABORATORIO_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'LAB_ID_01',
    category: 'identity',
    subcategory: 'business_model',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipo de laboratorio operás?',
      'pt-BR': 'Que tipo de laboratório você opera?'
    },
    helpText: {
      es: 'Define tu modelo principal de servicio',
      'pt-BR': 'Define seu modelo principal de serviço'
    },
    type: 'single',
    options: [
      { id: 'clinical', label: { es: 'Análisis clínicos generales', 'pt-BR': 'Análises clínicas gerais' }, emoji: '🔬' },
      { id: 'specialized', label: { es: 'Especializado (hormonas, genética, etc.)', 'pt-BR': 'Especializado (hormônios, genética, etc.)' }, emoji: '🧬' },
      { id: 'occupational', label: { es: 'Medicina laboral/ocupacional', 'pt-BR': 'Medicina do trabalho/ocupacional' }, emoji: '👷' },
      { id: 'reference', label: { es: 'Laboratorio de referencia (B2B)', 'pt-BR': 'Laboratório de referência (B2B)' }, emoji: '🏢' },
      { id: 'mixed', label: { es: 'Mixto (varios servicios)', 'pt-BR': 'Misto (vários serviços)' }, emoji: '📊' }
    ],
    followUp: {
      condition: { optionIds: ['specialized'] },
      question: {
        id: 'LAB_ID_01_FU',
        category: 'identity',
        subcategory: 'specialization',
        dimension: 'growth',
        priority: 1,
        mode: 'complete',
        question: {
          es: '¿En qué especialidades te enfocás?',
          'pt-BR': 'Em quais especialidades você foca?'
        },
        type: 'multi',
        options: [
          { id: 'hormones', label: { es: 'Hormonas y endocrinología', 'pt-BR': 'Hormônios e endocrinologia' } },
          { id: 'genetics', label: { es: 'Genética y ADN', 'pt-BR': 'Genética e DNA' } },
          { id: 'allergies', label: { es: 'Alergias e intolerancias', 'pt-BR': 'Alergias e intolerâncias' } },
          { id: 'oncology', label: { es: 'Marcadores oncológicos', 'pt-BR': 'Marcadores oncológicos' } },
          { id: 'fertility', label: { es: 'Fertilidad y reproducción', 'pt-BR': 'Fertilidade e reprodução' } },
          { id: 'toxicology', label: { es: 'Toxicología', 'pt-BR': 'Toxicologia' } }
        ]
      }
    }
  },
  {
    id: 'LAB_ID_02',
    category: 'identity',
    subcategory: 'certification',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué certificaciones tiene tu laboratorio?',
      'pt-BR': 'Quais certificações seu laboratório possui?'
    },
    type: 'multi',
    options: [
      { id: 'iso15189', label: { es: 'ISO 15189', 'pt-BR': 'ISO 15189' }, emoji: '🏅' },
      { id: 'iso9001', label: { es: 'ISO 9001', 'pt-BR': 'ISO 9001' }, emoji: '✅' },
      { id: 'cap', label: { es: 'CAP (College of American Pathologists)', 'pt-BR': 'CAP (College of American Pathologists)' }, emoji: '🇺🇸' },
      { id: 'local', label: { es: 'Solo habilitación local/ministerio', 'pt-BR': 'Apenas habilitação local/ministério' }, emoji: '📋' },
      { id: 'process', label: { es: 'En proceso de certificación', 'pt-BR': 'Em processo de certificação' }, emoji: '⏳' },
      { id: 'none', label: { es: 'Sin certificaciones adicionales', 'pt-BR': 'Sem certificações adicionais' }, emoji: '➖' }
    ]
  },
  {
    id: 'LAB_ID_03',
    category: 'identity',
    subcategory: 'positioning',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es tu diferenciador principal vs la competencia?',
      'pt-BR': 'Qual é seu diferencial principal vs a concorrência?'
    },
    type: 'single',
    options: [
      { id: 'speed', label: { es: 'Resultados más rápidos', 'pt-BR': 'Resultados mais rápidos' }, emoji: '⚡' },
      { id: 'price', label: { es: 'Mejores precios', 'pt-BR': 'Melhores preços' }, emoji: '💰' },
      { id: 'tech', label: { es: 'Tecnología de punta', 'pt-BR': 'Tecnologia de ponta' }, emoji: '🔬' },
      { id: 'coverage', label: { es: 'Cobertura de obras sociales', 'pt-BR': 'Cobertura de convênios' }, emoji: '🏥' },
      { id: 'home', label: { es: 'Extracciones a domicilio', 'pt-BR': 'Coletas a domicílio' }, emoji: '🏠' },
      { id: 'specialty', label: { es: 'Análisis especializados únicos', 'pt-BR': 'Análises especializadas únicas' }, emoji: '🧬' }
    ]
  },

  // ========== OFERTA Y SERVICIOS ==========
  {
    id: 'LAB_OF_01',
    category: 'offering',
    subcategory: 'catalog',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos tipos de análisis ofrecés en tu catálogo?',
      'pt-BR': 'Quantos tipos de análises você oferece no catálogo?'
    },
    type: 'single',
    options: [
      { id: 'basic', label: { es: 'Menos de 100 (básicos)', 'pt-BR': 'Menos de 100 (básicos)' } },
      { id: 'standard', label: { es: '100-300 análisis', 'pt-BR': '100-300 análises' } },
      { id: 'complete', label: { es: '300-500 análisis', 'pt-BR': '300-500 análises' } },
      { id: 'extensive', label: { es: '500-1000 análisis', 'pt-BR': '500-1000 análises' } },
      { id: 'reference', label: { es: 'Más de 1000 (laboratorio de referencia)', 'pt-BR': 'Mais de 1000 (laboratório de referência)' } }
    ]
  },
  {
    id: 'LAB_OF_02',
    category: 'offering',
    subcategory: 'turnaround',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el tiempo promedio de entrega de resultados para análisis de rutina?',
      'pt-BR': 'Qual é o tempo médio de entrega de resultados para análises de rotina?'
    },
    type: 'single',
    options: [
      { id: 'same_day', label: { es: 'Mismo día', 'pt-BR': 'Mesmo dia' }, emoji: '⚡' },
      { id: '24h', label: { es: '24 horas', 'pt-BR': '24 horas' }, emoji: '🕐' },
      { id: '48h', label: { es: '48 horas', 'pt-BR': '48 horas' }, emoji: '📅' },
      { id: '72h', label: { es: '72 horas o más', 'pt-BR': '72 horas ou mais' }, emoji: '📆' }
    ]
  },
  {
    id: 'LAB_OF_03',
    category: 'offering',
    subcategory: 'packages',
    dimension: 'profitability',
    priority: 2,
    mode: 'both',
    question: {
      es: '¿Ofrecés paquetes o perfiles de análisis combinados?',
      'pt-BR': 'Você oferece pacotes ou perfis de análises combinados?'
    },
    type: 'single',
    options: [
      { id: 'many', label: { es: 'Sí, +10 perfiles (chequeo completo, deportivo, etc.)', 'pt-BR': 'Sim, +10 perfis (check-up completo, esportivo, etc.)' } },
      { id: 'some', label: { es: 'Algunos perfiles básicos (3-10)', 'pt-BR': 'Alguns perfis básicos (3-10)' } },
      { id: 'few', label: { es: 'Solo 1-2 paquetes', 'pt-BR': 'Apenas 1-2 pacotes' } },
      { id: 'none', label: { es: 'No, solo análisis individuales', 'pt-BR': 'Não, apenas análises individuais' } }
    ]
  },
  {
    id: 'LAB_OF_04',
    category: 'offering',
    subcategory: 'home_service',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Ofrecés servicio de extracción a domicilio?',
      'pt-BR': 'Você oferece serviço de coleta a domicílio?'
    },
    type: 'single',
    options: [
      { id: 'yes_premium', label: { es: 'Sí, con cargo adicional', 'pt-BR': 'Sim, com custo adicional' }, emoji: '💰' },
      { id: 'yes_free', label: { es: 'Sí, gratis sobre cierto monto', 'pt-BR': 'Sim, grátis acima de certo valor' }, emoji: '🎁' },
      { id: 'corporate_only', label: { es: 'Solo para empresas/corporativos', 'pt-BR': 'Apenas para empresas/corporativos' }, emoji: '🏢' },
      { id: 'no', label: { es: 'No ofrecemos domicilio', 'pt-BR': 'Não oferecemos domicílio' }, emoji: '❌' },
      { id: 'planned', label: { es: 'Lo estamos implementando', 'pt-BR': 'Estamos implementando' }, emoji: '⏳' }
    ]
  },
  {
    id: 'LAB_OF_05',
    category: 'offering',
    subcategory: 'digital_results',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo entregan los resultados a los pacientes?',
      'pt-BR': 'Como vocês entregam os resultados aos pacientes?'
    },
    type: 'multi',
    options: [
      { id: 'web_portal', label: { es: 'Portal web con login', 'pt-BR': 'Portal web com login' }, emoji: '🌐' },
      { id: 'app', label: { es: 'App móvil propia', 'pt-BR': 'App móvel próprio' }, emoji: '📱' },
      { id: 'email', label: { es: 'Email con PDF', 'pt-BR': 'Email com PDF' }, emoji: '📧' },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
      { id: 'physical', label: { es: 'Retiro presencial impreso', 'pt-BR': 'Retirada presencial impressa' }, emoji: '📄' }
    ]
  },

  // ========== CLIENTE Y DEMANDA ==========
  {
    id: 'LAB_CL_01',
    category: 'demand',
    subcategory: 'patient_mix',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es la composición de tus pacientes?',
      'pt-BR': 'Qual é a composição dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'private_majority', label: { es: 'Mayoría particulares (+60%)', 'pt-BR': 'Maioria particulares (+60%)' } },
      { id: 'insurance_majority', label: { es: 'Mayoría obras sociales/prepaga (+60%)', 'pt-BR': 'Maioria convênios (+60%)' } },
      { id: 'corporate_majority', label: { es: 'Mayoría empresas/corporativos (+60%)', 'pt-BR': 'Maioria empresas/corporativos (+60%)' } },
      { id: 'balanced', label: { es: 'Mix equilibrado', 'pt-BR': 'Mix equilibrado' } }
    ]
  },
  {
    id: 'LAB_CL_02',
    category: 'demand',
    subcategory: 'referral_source',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿De dónde vienen la mayoría de tus pacientes?',
      'pt-BR': 'De onde vem a maioria dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'doctors', label: { es: 'Derivación de médicos/consultorios', 'pt-BR': 'Encaminhamento de médicos/consultórios' }, emoji: '👨‍⚕️' },
      { id: 'clinics', label: { es: 'Convenios con clínicas/sanatorios', 'pt-BR': 'Convênios com clínicas/hospitais' }, emoji: '🏥' },
      { id: 'corporate', label: { es: 'Contratos corporativos', 'pt-BR': 'Contratos corporativos' }, emoji: '🏢' },
      { id: 'direct', label: { es: 'Pacientes directos (sin derivación)', 'pt-BR': 'Pacientes diretos (sem encaminhamento)' }, emoji: '🚶' },
      { id: 'insurance', label: { es: 'Cartilla de obras sociales', 'pt-BR': 'Rede de convênios' }, emoji: '📋' }
    ]
  },
  {
    id: 'LAB_CL_03',
    category: 'demand',
    subcategory: 'volume',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántas extracciones/muestras procesás por día en promedio?',
      'pt-BR': 'Quantas coletas/amostras você processa por dia em média?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos de 20', 'pt-BR': 'Menos de 20' } },
      { id: 'medium', label: { es: '20-50', 'pt-BR': '20-50' } },
      { id: 'high', label: { es: '50-100', 'pt-BR': '50-100' } },
      { id: 'very_high', label: { es: '100-200', 'pt-BR': '100-200' } },
      { id: 'industrial', label: { es: 'Más de 200', 'pt-BR': 'Mais de 200' } }
    ]
  },
  {
    id: 'LAB_CL_04',
    category: 'demand',
    subcategory: 'seasonality',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuándo tenés mayor demanda?',
      'pt-BR': 'Quando você tem maior demanda?'
    },
    type: 'multi',
    options: [
      { id: 'jan_mar', label: { es: 'Enero-Marzo (chequeos anuales)', 'pt-BR': 'Janeiro-Março (check-ups anuais)' } },
      { id: 'school', label: { es: 'Inicio escolar (certificados)', 'pt-BR': 'Início escolar (certificados)' } },
      { id: 'flu_season', label: { es: 'Temporada de gripe/invierno', 'pt-BR': 'Temporada de gripe/inverno' } },
      { id: 'corporate_q4', label: { es: 'Fin de año (exámenes laborales)', 'pt-BR': 'Fim de ano (exames laborais)' } },
      { id: 'stable', label: { es: 'Demanda estable todo el año', 'pt-BR': 'Demanda estável o ano todo' } }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'LAB_VE_01',
    category: 'sales',
    subcategory: 'booking',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cómo agendan turnos tus pacientes?',
      'pt-BR': 'Como seus pacientes agendam consultas?'
    },
    type: 'multi',
    options: [
      { id: 'phone', label: { es: 'Teléfono', 'pt-BR': 'Telefone' }, emoji: '📞' },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
      { id: 'web', label: { es: 'Reserva online web', 'pt-BR': 'Reserva online web' }, emoji: '🌐' },
      { id: 'app', label: { es: 'App móvil', 'pt-BR': 'App móvel' }, emoji: '📱' },
      { id: 'walkin', label: { es: 'Sin turno (orden de llegada)', 'pt-BR': 'Sem agendamento (ordem de chegada)' }, emoji: '🚶' }
    ]
  },
  {
    id: 'LAB_VE_02',
    category: 'sales',
    subcategory: 'conversion',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué porcentaje de pacientes que piden turno efectivamente asisten?',
      'pt-BR': 'Qual porcentagem de pacientes que agendam efetivamente comparecem?'
    },
    type: 'single',
    options: [
      { id: 'excellent', label: { es: 'Más del 95%', 'pt-BR': 'Mais de 95%' }, emoji: '🏆' },
      { id: 'good', label: { es: '85-95%', 'pt-BR': '85-95%' }, emoji: '✅' },
      { id: 'medium', label: { es: '70-85%', 'pt-BR': '70-85%' }, emoji: '⚠️' },
      { id: 'low', label: { es: 'Menos del 70%', 'pt-BR': 'Menos de 70%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo medimos', 'pt-BR': 'Não medimos' }, emoji: '❓' }
    ]
  },
  {
    id: 'LAB_VE_03',
    category: 'sales',
    subcategory: 'upsell',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecen análisis adicionales o perfiles más completos al momento de la extracción?',
      'pt-BR': 'Vocês oferecem análises adicionais ou perfis mais completos no momento da coleta?'
    },
    type: 'single',
    options: [
      { id: 'systematic', label: { es: 'Sí, sistemáticamente', 'pt-BR': 'Sim, sistematicamente' } },
      { id: 'sometimes', label: { es: 'A veces, según el caso', 'pt-BR': 'Às vezes, conforme o caso' } },
      { id: 'rarely', label: { es: 'Raramente', 'pt-BR': 'Raramente' } },
      { id: 'never', label: { es: 'No, solo lo que pide la orden', 'pt-BR': 'Não, apenas o que pede o pedido' } }
    ]
  },

  // ========== FINANZAS Y MÁRGENES ==========
  {
    id: 'LAB_FI_01',
    category: 'finance',
    subcategory: 'revenue',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es la facturación mensual promedio del laboratorio?',
      'pt-BR': 'Qual é o faturamento mensal médio do laboratório?'
    },
    type: 'single',
    options: [
      { id: 'tier1', label: { es: 'Menos de $2M ARS / R$50k', 'pt-BR': 'Menos de R$50k / $2M ARS' } },
      { id: 'tier2', label: { es: '$2M-5M ARS / R$50k-150k', 'pt-BR': 'R$50k-150k / $2M-5M ARS' } },
      { id: 'tier3', label: { es: '$5M-15M ARS / R$150k-400k', 'pt-BR': 'R$150k-400k / $5M-15M ARS' } },
      { id: 'tier4', label: { es: '$15M-50M ARS / R$400k-1.2M', 'pt-BR': 'R$400k-1.2M / $15M-50M ARS' } },
      { id: 'tier5', label: { es: 'Más de $50M ARS / R$1.2M', 'pt-BR': 'Mais de R$1.2M / $50M ARS' } }
    ]
  },
  {
    id: 'LAB_FI_02',
    category: 'finance',
    subcategory: 'insurance_dependency',
    dimension: 'finances',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué % de tu facturación viene de obras sociales/prepagas?',
      'pt-BR': 'Qual % do seu faturamento vem de convênios?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' } },
      { id: 'medium', label: { es: '30-50%', 'pt-BR': '30-50%' } },
      { id: 'high', label: { es: '50-70%', 'pt-BR': '50-70%' } },
      { id: 'very_high', label: { es: '70-90%', 'pt-BR': '70-90%' } },
      { id: 'total', label: { es: 'Más del 90%', 'pt-BR': 'Mais de 90%' } }
    ]
  },
  {
    id: 'LAB_FI_03',
    category: 'finance',
    subcategory: 'collection',
    dimension: 'finances',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el tiempo promedio de cobro a obras sociales?',
      'pt-BR': 'Qual é o tempo médio de recebimento dos convênios?'
    },
    type: 'single',
    options: [
      { id: 'fast', label: { es: 'Menos de 30 días', 'pt-BR': 'Menos de 30 dias' }, emoji: '⚡' },
      { id: 'normal', label: { es: '30-60 días', 'pt-BR': '30-60 dias' }, emoji: '📅' },
      { id: 'slow', label: { es: '60-90 días', 'pt-BR': '60-90 dias' }, emoji: '⏳' },
      { id: 'very_slow', label: { es: 'Más de 90 días', 'pt-BR': 'Mais de 90 dias' }, emoji: '🐌' },
      { id: 'variable', label: { es: 'Muy variable según financiador', 'pt-BR': 'Muito variável por convênio' }, emoji: '📊' }
    ]
  },
  {
    id: 'LAB_FI_04',
    category: 'finance',
    subcategory: 'margins',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es tu margen operativo aproximado?',
      'pt-BR': 'Qual é sua margem operacional aproximada?'
    },
    type: 'single',
    options: [
      { id: 'negative', label: { es: 'Negativo (pérdidas)', 'pt-BR': 'Negativo (prejuízo)' }, emoji: '🔴' },
      { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '🟠' },
      { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '🟡' },
      { id: 'good', label: { es: '20-30%', 'pt-BR': '20-30%' }, emoji: '🟢' },
      { id: 'excellent', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' }, emoji: '💚' }
    ]
  },
  {
    id: 'LAB_FI_05',
    category: 'finance',
    subcategory: 'reagent_cost',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué % de tus costos representan reactivos e insumos?',
      'pt-BR': 'Qual % dos seus custos são reagentes e insumos?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' } },
      { id: 'medium', label: { es: '20-35%', 'pt-BR': '20-35%' } },
      { id: 'high', label: { es: '35-50%', 'pt-BR': '35-50%' } },
      { id: 'very_high', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' } }
    ]
  },

  // ========== OPERACIONES Y CAPACIDAD ==========
  {
    id: 'LAB_OP_01',
    category: 'operation',
    subcategory: 'equipment',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el nivel de automatización de tu equipamiento?',
      'pt-BR': 'Qual é o nível de automação do seu equipamento?'
    },
    type: 'single',
    options: [
      { id: 'full_auto', label: { es: 'Totalmente automatizado (línea integrada)', 'pt-BR': 'Totalmente automatizado (linha integrada)' }, emoji: '🤖' },
      { id: 'high', label: { es: 'Alta automatización (equipos independientes)', 'pt-BR': 'Alta automação (equipamentos independentes)' }, emoji: '⚙️' },
      { id: 'mixed', label: { es: 'Mixto (automático + manual)', 'pt-BR': 'Misto (automático + manual)' }, emoji: '🔧' },
      { id: 'manual', label: { es: 'Mayormente manual', 'pt-BR': 'Majoritariamente manual' }, emoji: '👐' }
    ]
  },
  {
    id: 'LAB_OP_02',
    category: 'operation',
    subcategory: 'capacity',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿A qué % de capacidad operás actualmente?',
      'pt-BR': 'A qual % de capacidade você opera atualmente?'
    },
    type: 'single',
    options: [
      { id: 'underused', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' }, emoji: '📉' },
      { id: 'moderate', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '📊' },
      { id: 'optimal', label: { es: '70-85%', 'pt-BR': '70-85%' }, emoji: '✅' },
      { id: 'high', label: { es: '85-95%', 'pt-BR': '85-95%' }, emoji: '📈' },
      { id: 'saturated', label: { es: 'Más del 95% (saturado)', 'pt-BR': 'Mais de 95% (saturado)' }, emoji: '🔥' }
    ]
  },
  {
    id: 'LAB_OP_03',
    category: 'operation',
    subcategory: 'hours',
    dimension: 'traffic',
    priority: 2,
    mode: 'both',
    question: {
      es: '¿Cuál es tu horario de extracción?',
      'pt-BR': 'Qual é seu horário de coleta?'
    },
    type: 'single',
    options: [
      { id: 'morning', label: { es: 'Solo mañana (7-12h)', 'pt-BR': 'Apenas manhã (7-12h)' } },
      { id: 'extended_morning', label: { es: 'Mañana extendida (7-14h)', 'pt-BR': 'Manhã estendida (7-14h)' } },
      { id: 'full_day', label: { es: 'Jornada completa (7-19h)', 'pt-BR': 'Jornada completa (7-19h)' } },
      { id: '24h', label: { es: '24 horas (guardias)', 'pt-BR': '24 horas (plantões)' } }
    ]
  },
  {
    id: 'LAB_OP_04',
    category: 'operation',
    subcategory: 'branches',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuántas sucursales o puntos de extracción tenés?',
      'pt-BR': 'Quantas filiais ou pontos de coleta você tem?'
    },
    type: 'single',
    options: [
      { id: 'single', label: { es: 'Una única sede', 'pt-BR': 'Uma única sede' } },
      { id: 'few', label: { es: '2-3 sucursales', 'pt-BR': '2-3 filiais' } },
      { id: 'network', label: { es: '4-10 sucursales', 'pt-BR': '4-10 filiais' } },
      { id: 'chain', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' } }
    ]
  },
  {
    id: 'LAB_OP_05',
    category: 'operation',
    subcategory: 'lis',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué sistema de gestión de laboratorio (LIS) usás?',
      'pt-BR': 'Qual sistema de gestão de laboratório (LIS) você usa?'
    },
    type: 'single',
    options: [
      { id: 'enterprise', label: { es: 'Sistema enterprise (Labtech, CGM, etc.)', 'pt-BR': 'Sistema enterprise (Labtech, CGM, etc.)' } },
      { id: 'local', label: { es: 'Software local/nacional', 'pt-BR': 'Software local/nacional' } },
      { id: 'cloud', label: { es: 'SaaS en la nube', 'pt-BR': 'SaaS na nuvem' } },
      { id: 'custom', label: { es: 'Desarrollo propio', 'pt-BR': 'Desenvolvimento próprio' } },
      { id: 'basic', label: { es: 'Excel/planillas', 'pt-BR': 'Excel/planilhas' } },
      { id: 'none', label: { es: 'Sin sistema informatizado', 'pt-BR': 'Sem sistema informatizado' } }
    ]
  },

  // ========== MARKETING Y ADQUISICIÓN ==========
  {
    id: 'LAB_MK_01',
    category: 'marketing',
    subcategory: 'channels',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué canales usás para atraer pacientes?',
      'pt-BR': 'Quais canais você usa para atrair pacientes?'
    },
    type: 'multi',
    options: [
      { id: 'doctor_network', label: { es: 'Red de médicos derivadores', 'pt-BR': 'Rede de médicos que encaminham' }, emoji: '👨‍⚕️' },
      { id: 'insurance_listing', label: { es: 'Cartilla de obras sociales', 'pt-BR': 'Rede de convênios' }, emoji: '📋' },
      { id: 'google', label: { es: 'Google Ads / SEO', 'pt-BR': 'Google Ads / SEO' }, emoji: '🔍' },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'referral', label: { es: 'Boca a boca / referencias', 'pt-BR': 'Boca a boca / referências' }, emoji: '💬' },
      { id: 'corporate', label: { es: 'Venta corporativa B2B', 'pt-BR': 'Venda corporativa B2B' }, emoji: '🏢' }
    ]
  },
  {
    id: 'LAB_MK_02',
    category: 'marketing',
    subcategory: 'budget',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuánto invertís en marketing mensualmente?',
      'pt-BR': 'Quanto você investe em marketing mensalmente?'
    },
    type: 'single',
    options: [
      { id: 'none', label: { es: 'Nada', 'pt-BR': 'Nada' } },
      { id: 'minimal', label: { es: 'Menos de $100k ARS / R$2k', 'pt-BR': 'Menos de R$2k / $100k ARS' } },
      { id: 'moderate', label: { es: '$100k-500k ARS / R$2k-10k', 'pt-BR': 'R$2k-10k / $100k-500k ARS' } },
      { id: 'significant', label: { es: '$500k-2M ARS / R$10k-50k', 'pt-BR': 'R$10k-50k / $500k-2M ARS' } },
      { id: 'high', label: { es: 'Más de $2M ARS / R$50k', 'pt-BR': 'Mais de R$50k / $2M ARS' } }
    ]
  },
  {
    id: 'LAB_MK_03',
    category: 'marketing',
    subcategory: 'doctor_relations',
    dimension: 'traffic',
    priority: 1,
    mode: 'complete',
    question: {
      es: '¿Tenés un programa activo de relación con médicos derivadores?',
      'pt-BR': 'Você tem um programa ativo de relacionamento com médicos que encaminham?'
    },
    type: 'single',
    options: [
      { id: 'formal', label: { es: 'Sí, programa formal con visitas regulares', 'pt-BR': 'Sim, programa formal com visitas regulares' } },
      { id: 'informal', label: { es: 'Relaciones informales pero activas', 'pt-BR': 'Relações informais mas ativas' } },
      { id: 'passive', label: { es: 'Solo esperamos derivaciones', 'pt-BR': 'Apenas esperamos encaminhamentos' } },
      { id: 'none', label: { es: 'No trabajamos con derivadores', 'pt-BR': 'Não trabalhamos com encaminhadores' } }
    ]
  },

  // ========== RETENCIÓN Y EXPERIENCIA ==========
  {
    id: 'LAB_RE_01',
    category: 'retention',
    subcategory: 'repeat_rate',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué % de pacientes vuelve a hacerse análisis con ustedes?',
      'pt-BR': 'Qual % de pacientes volta a fazer análises com vocês?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' } },
      { id: 'medium', label: { es: '30-50%', 'pt-BR': '30-50%' } },
      { id: 'good', label: { es: '50-70%', 'pt-BR': '50-70%' } },
      { id: 'high', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' } },
      { id: 'unknown', label: { es: 'No lo medimos', 'pt-BR': 'Não medimos' } }
    ]
  },
  {
    id: 'LAB_RE_02',
    category: 'retention',
    subcategory: 'nps',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Medís la satisfacción de los pacientes?',
      'pt-BR': 'Vocês medem a satisfação dos pacientes?'
    },
    type: 'single',
    options: [
      { id: 'nps', label: { es: 'Sí, NPS formal', 'pt-BR': 'Sim, NPS formal' } },
      { id: 'surveys', label: { es: 'Encuestas ocasionales', 'pt-BR': 'Pesquisas ocasionais' } },
      { id: 'reviews', label: { es: 'Solo miramos reseñas online', 'pt-BR': 'Apenas vemos avaliações online' } },
      { id: 'none', label: { es: 'No medimos satisfacción', 'pt-BR': 'Não medimos satisfação' } }
    ]
  },
  {
    id: 'LAB_RE_03',
    category: 'retention',
    subcategory: 'complaints',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es la queja más frecuente de los pacientes?',
      'pt-BR': 'Qual é a reclamação mais frequente dos pacientes?'
    },
    type: 'single',
    options: [
      { id: 'wait', label: { es: 'Tiempo de espera para extracción', 'pt-BR': 'Tempo de espera para coleta' } },
      { id: 'results_delay', label: { es: 'Demora en resultados', 'pt-BR': 'Demora nos resultados' } },
      { id: 'price', label: { es: 'Precios altos', 'pt-BR': 'Preços altos' } },
      { id: 'access', label: { es: 'Dificultad para acceder a resultados', 'pt-BR': 'Dificuldade para acessar resultados' } },
      { id: 'extraction', label: { es: 'Experiencia de extracción (dolor, múltiples intentos)', 'pt-BR': 'Experiência de coleta (dor, múltiplas tentativas)' } },
      { id: 'none', label: { es: 'Casi no tenemos quejas', 'pt-BR': 'Quase não temos reclamações' } }
    ]
  },

  // ========== EQUIPO Y ROLES ==========
  {
    id: 'LAB_EQ_01',
    category: 'team',
    subcategory: 'size',
    dimension: 'team',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántas personas trabajan en el laboratorio?',
      'pt-BR': 'Quantas pessoas trabalham no laboratório?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: '1-5 personas', 'pt-BR': '1-5 pessoas' } },
      { id: 'small', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' } },
      { id: 'medium', label: { es: '16-40 personas', 'pt-BR': '16-40 pessoas' } },
      { id: 'large', label: { es: '41-100 personas', 'pt-BR': '41-100 pessoas' } },
      { id: 'enterprise', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' } }
    ]
  },
  {
    id: 'LAB_EQ_02',
    category: 'team',
    subcategory: 'composition',
    dimension: 'team',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es la composición de tu equipo técnico?',
      'pt-BR': 'Qual é a composição da sua equipe técnica?'
    },
    type: 'multi',
    options: [
      { id: 'biochemists', label: { es: 'Bioquímicos', 'pt-BR': 'Bioquímicos' } },
      { id: 'technicians', label: { es: 'Técnicos de laboratorio', 'pt-BR': 'Técnicos de laboratório' } },
      { id: 'phlebotomists', label: { es: 'Flebotomistas/Extraccionistas', 'pt-BR': 'Flebotomistas/Coletores' } },
      { id: 'admin', label: { es: 'Personal administrativo', 'pt-BR': 'Pessoal administrativo' } },
      { id: 'it', label: { es: 'Personal de sistemas/IT', 'pt-BR': 'Pessoal de sistemas/TI' } }
    ]
  },
  {
    id: 'LAB_EQ_03',
    category: 'team',
    subcategory: 'turnover',
    dimension: 'team',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo es la rotación de personal técnico?',
      'pt-BR': 'Como é a rotatividade de pessoal técnico?'
    },
    type: 'single',
    options: [
      { id: 'very_low', label: { es: 'Muy baja (equipo estable +3 años)', 'pt-BR': 'Muito baixa (equipe estável +3 anos)' } },
      { id: 'low', label: { es: 'Baja (1-2 salidas por año)', 'pt-BR': 'Baixa (1-2 saídas por ano)' } },
      { id: 'medium', label: { es: 'Media (cambios frecuentes)', 'pt-BR': 'Média (mudanças frequentes)' } },
      { id: 'high', label: { es: 'Alta (dificultad para retener)', 'pt-BR': 'Alta (dificuldade para reter)' } }
    ]
  },

  // ========== TECNOLOGÍA ==========
  {
    id: 'LAB_TEC_01',
    category: 'technology',
    subcategory: 'integration',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Tus equipos de análisis están integrados al LIS?',
      'pt-BR': 'Seus equipamentos de análise estão integrados ao LIS?'
    },
    type: 'single',
    options: [
      { id: 'full', label: { es: 'Sí, integración bidireccional completa', 'pt-BR': 'Sim, integração bidirecional completa' } },
      { id: 'partial', label: { es: 'Parcial (algunos equipos)', 'pt-BR': 'Parcial (alguns equipamentos)' } },
      { id: 'output_only', label: { es: 'Solo salida de resultados', 'pt-BR': 'Apenas saída de resultados' } },
      { id: 'none', label: { es: 'Sin integración (carga manual)', 'pt-BR': 'Sem integração (carga manual)' } }
    ]
  },
  {
    id: 'LAB_TEC_02',
    category: 'technology',
    subcategory: 'interoperability',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Integrás resultados con sistemas de salud externos?',
      'pt-BR': 'Você integra resultados com sistemas de saúde externos?'
    },
    type: 'multi',
    options: [
      { id: 'ehr', label: { es: 'Historias clínicas de hospitales/clínicas', 'pt-BR': 'Prontuários de hospitais/clínicas' } },
      { id: 'insurance', label: { es: 'Sistemas de obras sociales', 'pt-BR': 'Sistemas de convênios' } },
      { id: 'government', label: { es: 'Sistemas gubernamentales (notificaciones)', 'pt-BR': 'Sistemas governamentais (notificações)' } },
      { id: 'none', label: { es: 'Sin integraciones externas', 'pt-BR': 'Sem integrações externas' } }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'LAB_OB_01',
    category: 'goals',
    subcategory: 'priority',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu objetivo principal para los próximos 12 meses?',
      'pt-BR': 'Qual é seu objetivo principal para os próximos 12 meses?'
    },
    type: 'single',
    options: [
      { id: 'volume', label: { es: 'Aumentar volumen de pacientes', 'pt-BR': 'Aumentar volume de pacientes' }, emoji: '📈' },
      { id: 'profitability', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰' },
      { id: 'expand', label: { es: 'Abrir nuevas sucursales', 'pt-BR': 'Abrir novas filiais' }, emoji: '🏢' },
      { id: 'specialize', label: { es: 'Agregar análisis especializados', 'pt-BR': 'Adicionar análises especializadas' }, emoji: '🧬' },
      { id: 'automate', label: { es: 'Automatizar procesos', 'pt-BR': 'Automatizar processos' }, emoji: '🤖' },
      { id: 'certify', label: { es: 'Obtener certificaciones', 'pt-BR': 'Obter certificações' }, emoji: '🏅' }
    ]
  },
  {
    id: 'LAB_OB_02',
    category: 'goals',
    subcategory: 'growth_target',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué crecimiento esperás este año?',
      'pt-BR': 'Qual crescimento você espera este ano?'
    },
    type: 'single',
    options: [
      { id: 'maintain', label: { es: 'Mantener igual', 'pt-BR': 'Manter igual' } },
      { id: 'low', label: { es: '5-15% de crecimiento', 'pt-BR': '5-15% de crescimento' } },
      { id: 'medium', label: { es: '15-30% de crecimiento', 'pt-BR': '15-30% de crescimento' } },
      { id: 'high', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' } }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'LAB_RI_01',
    category: 'risks',
    subcategory: 'main_challenge',
    dimension: 'finances',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'competition', label: { es: 'Competencia de grandes cadenas', 'pt-BR': 'Concorrência de grandes redes' }, emoji: '🏪' },
      { id: 'pricing', label: { es: 'Presión de precios de obras sociales', 'pt-BR': 'Pressão de preços dos convênios' }, emoji: '💸' },
      { id: 'reagent_costs', label: { es: 'Costos crecientes de reactivos', 'pt-BR': 'Custos crescentes de reagentes' }, emoji: '📈' },
      { id: 'collection', label: { es: 'Demoras en cobros', 'pt-BR': 'Demoras em recebimentos' }, emoji: '⏳' },
      { id: 'talent', label: { es: 'Encontrar personal calificado', 'pt-BR': 'Encontrar pessoal qualificado' }, emoji: '👥' },
      { id: 'technology', label: { es: 'Actualización tecnológica', 'pt-BR': 'Atualização tecnológica' }, emoji: '💻' }
    ]
  },
  {
    id: 'LAB_RI_02',
    category: 'risks',
    subcategory: 'regulation',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo te afectan los cambios regulatorios?',
      'pt-BR': 'Como as mudanças regulatórias afetam você?'
    },
    type: 'single',
    options: [
      { id: 'major', label: { es: 'Fuertemente (muchas adaptaciones)', 'pt-BR': 'Fortemente (muitas adaptações)' } },
      { id: 'moderate', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' } },
      { id: 'minor', label: { es: 'Poco impacto', 'pt-BR': 'Pouco impacto' } },
      { id: 'proactive', label: { es: 'Nos adelantamos a los cambios', 'pt-BR': 'Nos antecipamos às mudanças' } }
    ]
  }
];

export default LABORATORIO_QUESTIONS;
