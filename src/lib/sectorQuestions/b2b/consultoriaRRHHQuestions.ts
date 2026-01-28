// Consultoría RRHH / Headhunting B2B Questions - Complete Questionnaire
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const consultoriaRRHHQuestions: VistaSetupQuestion[] = [
  // ============================================
  // CATEGORÍA: IDENTITY (Identidad y Posicionamiento)
  // ============================================
  {
    id: 'b2b_rrhh_identity_001',
    category: 'identity',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el enfoque principal de la consultora?',
      'pt-BR': 'Qual é o foco principal da consultoria?'
    },
    options: [
      { id: 'headhunting', label: { es: 'Búsqueda ejecutiva / Headhunting', 'pt-BR': 'Busca executiva / Headhunting' }, emoji: '🎯', impactScore: 9 },
      { id: 'seleccion', label: { es: 'Selección masiva/volumen', 'pt-BR': 'Seleção massiva/volume' }, emoji: '👥', impactScore: 7 },
      { id: 'consulting', label: { es: 'Consultoría de RRHH integral', 'pt-BR': 'Consultoria de RH integral' }, emoji: '💼', impactScore: 8 },
      { id: 'capacitacion', label: { es: 'Capacitación y desarrollo', 'pt-BR': 'Capacitação e desenvolvimento' }, emoji: '🎓', impactScore: 7 },
      { id: 'outsourcing', label: { es: 'Outsourcing de RRHH', 'pt-BR': 'Outsourcing de RH' }, emoji: '🔄', impactScore: 8 },
      { id: 'mixto', label: { es: 'Full-service RRHH', 'pt-BR': 'Full-service RH' }, emoji: '🌟', impactScore: 10 }
    ]
  },
  {
    id: 'b2b_rrhh_identity_002',
    category: 'identity',
    type: 'number',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    required: true,
    title: {
      es: '¿Cuántos años de trayectoria tiene la consultora?',
      'pt-BR': 'Quantos anos de trajetória tem a consultoria?'
    },
    min: 0,
    max: 50,
    unit: 'años'
  },
  {
    id: 'b2b_rrhh_identity_003',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿En qué industrias se especializan?',
      'pt-BR': 'Em quais indústrias se especializam?'
    },
    options: [
      { id: 'tech', label: { es: 'Tecnología / IT', 'pt-BR': 'Tecnologia / TI' }, emoji: '💻' },
      { id: 'finanzas', label: { es: 'Banca y finanzas', 'pt-BR': 'Banco e finanças' }, emoji: '🏦' },
      { id: 'consumo', label: { es: 'Consumo masivo / Retail', 'pt-BR': 'Consumo massivo / Varejo' }, emoji: '🛒' },
      { id: 'salud', label: { es: 'Salud y farma', 'pt-BR': 'Saúde e farma' }, emoji: '🏥' },
      { id: 'industria', label: { es: 'Industria / Manufactura', 'pt-BR': 'Indústria / Manufatura' }, emoji: '🏭' },
      { id: 'energia', label: { es: 'Energía y recursos', 'pt-BR': 'Energia e recursos' }, emoji: '⚡' },
      { id: 'generalista', label: { es: 'Generalista multi-industria', 'pt-BR': 'Generalista multi-indústria' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_rrhh_identity_004',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Qué niveles jerárquicos cubren principalmente?',
      'pt-BR': 'Quais níveis hierárquicos cobrem principalmente?'
    },
    options: [
      { id: 'cxo', label: { es: 'C-Level (CEO, CFO, etc.)', 'pt-BR': 'C-Level (CEO, CFO, etc.)' }, emoji: '👔' },
      { id: 'director', label: { es: 'Directores y VP', 'pt-BR': 'Diretores e VP' }, emoji: '📊' },
      { id: 'gerentes', label: { es: 'Gerentes y Jefes', 'pt-BR': 'Gerentes e Chefes' }, emoji: '👨‍💼' },
      { id: 'profesionales', label: { es: 'Profesionales especializados', 'pt-BR': 'Profissionais especializados' }, emoji: '🎓' },
      { id: 'operativos', label: { es: 'Posiciones operativas', 'pt-BR': 'Posições operacionais' }, emoji: '👷' }
    ]
  },
  {
    id: 'b2b_rrhh_identity_005',
    category: 'identity',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Cuál es su diferenciador principal?',
      'pt-BR': 'Qual é seu diferencial principal?'
    },
    options: [
      { id: 'base_datos', label: { es: 'Base de datos / Network exclusivo', 'pt-BR': 'Base de dados / Network exclusivo' }, emoji: '📊' },
      { id: 'metodologia', label: { es: 'Metodología de evaluación', 'pt-BR': 'Metodologia de avaliação' }, emoji: '🔍' },
      { id: 'velocidad', label: { es: 'Velocidad de respuesta', 'pt-BR': 'Velocidade de resposta' }, emoji: '⚡' },
      { id: 'garantia', label: { es: 'Garantía de permanencia', 'pt-BR': 'Garantia de permanência' }, emoji: '🛡️' },
      { id: 'expertise', label: { es: 'Expertise en industria', 'pt-BR': 'Expertise em indústria' }, emoji: '🏆' }
    ]
  },

  // ============================================
  // CATEGORÍA: MENU (Servicios y Precios)
  // ============================================
  {
    id: 'b2b_rrhh_menu_001',
    category: 'menu',
    type: 'multi',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué servicios de RRHH ofrece la consultora?',
      'pt-BR': 'Quais serviços de RH a consultoria oferece?'
    },
    options: [
      { id: 'headhunting', label: { es: 'Búsqueda ejecutiva', 'pt-BR': 'Busca executiva' }, emoji: '🎯' },
      { id: 'seleccion', label: { es: 'Selección de personal', 'pt-BR': 'Seleção de pessoal' }, emoji: '👥' },
      { id: 'assessment', label: { es: 'Assessment y evaluaciones', 'pt-BR': 'Assessment e avaliações' }, emoji: '📋' },
      { id: 'clima', label: { es: 'Encuestas de clima', 'pt-BR': 'Pesquisas de clima' }, emoji: '🌡️' },
      { id: 'capacitacion', label: { es: 'Capacitación y desarrollo', 'pt-BR': 'Capacitação e desenvolvimento' }, emoji: '🎓' },
      { id: 'compensaciones', label: { es: 'Estudios de compensaciones', 'pt-BR': 'Estudos de compensações' }, emoji: '💰' },
      { id: 'outplacement', label: { es: 'Outplacement', 'pt-BR': 'Outplacement' }, emoji: '🔄' },
      { id: 'coaching', label: { es: 'Coaching ejecutivo', 'pt-BR': 'Coaching executivo' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_rrhh_menu_002',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el modelo de pricing para búsquedas?',
      'pt-BR': 'Qual é o modelo de precificação para buscas?'
    },
    options: [
      { id: 'retained', label: { es: 'Retained (anticipo + success)', 'pt-BR': 'Retained (adiantamento + success)' }, emoji: '💎' },
      { id: 'contingency', label: { es: 'Contingency (100% al éxito)', 'pt-BR': 'Contingency (100% ao sucesso)' }, emoji: '🎯' },
      { id: 'container', label: { es: 'Container (fee mensual)', 'pt-BR': 'Container (fee mensal)' }, emoji: '📅' },
      { id: 'mixto', label: { es: 'Mixto según posición', 'pt-BR': 'Misto conforme posição' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_rrhh_menu_003',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es el fee promedio como % del salario anual?',
      'pt-BR': 'Qual é o fee médio como % do salário anual?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '💵' },
      { id: 'estandar', label: { es: '15-20%', 'pt-BR': '15-20%' }, emoji: '📊' },
      { id: 'premium', label: { es: '20-25%', 'pt-BR': '20-25%' }, emoji: '💎' },
      { id: 'executive', label: { es: '25-33%', 'pt-BR': '25-33%' }, emoji: '👔' },
      { id: 'top', label: { es: 'Más del 33%', 'pt-BR': 'Mais de 33%' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_rrhh_menu_004',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cuál es el fee promedio por búsqueda ejecutiva?',
      'pt-BR': 'Qual é o fee médio por busca executiva?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos de $5k USD', 'pt-BR': 'Menos de R$ 25k' }, emoji: '💵' },
      { id: 'medio', label: { es: '$5k-15k USD', 'pt-BR': 'R$ 25k-75k' }, emoji: '💰' },
      { id: 'alto', label: { es: '$15k-30k USD', 'pt-BR': 'R$ 75k-150k' }, emoji: '💎' },
      { id: 'premium', label: { es: '$30k-60k USD', 'pt-BR': 'R$ 150k-300k' }, emoji: '🏆' },
      { id: 'top', label: { es: 'Más de $60k USD', 'pt-BR': 'Mais de R$ 300k' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_rrhh_menu_005',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Qué garantía de permanencia ofrecen?',
      'pt-BR': 'Qual garantia de permanência oferecem?'
    },
    options: [
      { id: 'ninguna', label: { es: 'Sin garantía', 'pt-BR': 'Sem garantia' }, emoji: '❌' },
      { id: 'tres_meses', label: { es: '3 meses', 'pt-BR': '3 meses' }, emoji: '📅' },
      { id: 'seis_meses', label: { es: '6 meses', 'pt-BR': '6 meses' }, emoji: '📆' },
      { id: 'un_ano', label: { es: '12 meses', 'pt-BR': '12 meses' }, emoji: '🗓️' },
      { id: 'variable', label: { es: 'Variable según posición', 'pt-BR': 'Variável conforme posição' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_rrhh_menu_006',
    category: 'menu',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Qué herramientas de assessment utilizan?',
      'pt-BR': 'Quais ferramentas de assessment utilizam?'
    },
    options: [
      { id: 'disc', label: { es: 'DISC', 'pt-BR': 'DISC' }, emoji: '🎯' },
      { id: 'mbti', label: { es: 'MBTI', 'pt-BR': 'MBTI' }, emoji: '🧠' },
      { id: 'hogan', label: { es: 'Hogan', 'pt-BR': 'Hogan' }, emoji: '📊' },
      { id: 'predictive', label: { es: 'Predictive Index', 'pt-BR': 'Predictive Index' }, emoji: '📈' },
      { id: 'propias', label: { es: 'Herramientas propias', 'pt-BR': 'Ferramentas próprias' }, emoji: '🔧' },
      { id: 'ninguna', label: { es: 'Sin herramientas formales', 'pt-BR': 'Sem ferramentas formais' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: SALES (Ventas y Conversión)
  // ============================================
  {
    id: 'b2b_rrhh_sales_001',
    category: 'sales',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la principal fuente de nuevas búsquedas?',
      'pt-BR': 'Qual é a principal fonte de novas buscas?'
    },
    options: [
      { id: 'clientes', label: { es: 'Clientes recurrentes', 'pt-BR': 'Clientes recorrentes' }, emoji: '🔄' },
      { id: 'referidos', label: { es: 'Referidos', 'pt-BR': 'Indicações' }, emoji: '🤝' },
      { id: 'prospeccion', label: { es: 'Prospección activa', 'pt-BR': 'Prospecção ativa' }, emoji: '📞' },
      { id: 'digital', label: { es: 'Marketing digital/inbound', 'pt-BR': 'Marketing digital/inbound' }, emoji: '💻' },
      { id: 'eventos', label: { es: 'Eventos y networking', 'pt-BR': 'Eventos e networking' }, emoji: '🎤' }
    ]
  },
  {
    id: 'b2b_rrhh_sales_002',
    category: 'sales',
    type: 'number',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántas búsquedas nuevas ingresan por mes?',
      'pt-BR': 'Quantas buscas novas entram por mês?'
    },
    min: 0,
    max: 500,
    unit: 'búsquedas/mes'
  },
  {
    id: 'b2b_rrhh_sales_003',
    category: 'sales',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuál es la tasa de conversión de propuestas?',
      'pt-BR': 'Qual é a taxa de conversão de propostas?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_sales_004',
    category: 'sales',
    type: 'number',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuántos clientes activos tienen?',
      'pt-BR': 'Quantos clientes ativos têm?'
    },
    min: 1,
    max: 1000,
    unit: 'clientes'
  },
  {
    id: 'b2b_rrhh_sales_005',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Cuánto toma cerrar un nuevo cliente corporativo?',
      'pt-BR': 'Quanto leva para fechar um novo cliente corporativo?'
    },
    options: [
      { id: 'rapido', label: { es: 'Menos de 2 semanas', 'pt-BR': 'Menos de 2 semanas' }, emoji: '⚡' },
      { id: 'normal', label: { es: '2-4 semanas', 'pt-BR': '2-4 semanas' }, emoji: '📅' },
      { id: 'largo', label: { es: '1-2 meses', 'pt-BR': '1-2 meses' }, emoji: '📆' },
      { id: 'muy_largo', label: { es: '2-3 meses', 'pt-BR': '2-3 meses' }, emoji: '🗓️' },
      { id: 'extenso', label: { es: 'Más de 3 meses', 'pt-BR': 'Mais de 3 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'b2b_rrhh_sales_006',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Tienen equipo comercial dedicado?',
      'pt-BR': 'Têm equipe comercial dedicada?'
    },
    options: [
      { id: 'si_equipo', label: { es: 'Sí, equipo dedicado', 'pt-BR': 'Sim, equipe dedicada' }, emoji: '👥' },
      { id: 'mixto', label: { es: 'Consultores hacen venta', 'pt-BR': 'Consultores fazem venda' }, emoji: '🔄' },
      { id: 'socios', label: { es: 'Solo socios venden', 'pt-BR': 'Só sócios vendem' }, emoji: '👔' },
      { id: 'inbound', label: { es: 'Solo inbound/referidos', 'pt-BR': 'Só inbound/indicações' }, emoji: '📥' }
    ]
  },

  // ============================================
  // CATEGORÍA: FINANCE (Finanzas y Márgenes)
  // ============================================
  {
    id: 'b2b_rrhh_finance_001',
    category: 'finance',
    type: 'single',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la facturación mensual promedio?',
      'pt-BR': 'Qual é o faturamento mensal médio?'
    },
    options: [
      { id: 'muy_chico', label: { es: 'Menos de $15k USD', 'pt-BR': 'Menos de R$ 75k' }, emoji: '🌱' },
      { id: 'chico', label: { es: '$15k-50k USD', 'pt-BR': 'R$ 75k-250k' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$50k-150k USD', 'pt-BR': 'R$ 250k-750k' }, emoji: '💼' },
      { id: 'grande', label: { es: '$150k-400k USD', 'pt-BR': 'R$ 750k-2M' }, emoji: '🏆' },
      { id: 'muy_grande', label: { es: 'Más de $400k USD', 'pt-BR': 'Mais de R$ 2M' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_rrhh_finance_002',
    category: 'finance',
    type: 'slider',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el margen operativo de la consultora?',
      'pt-BR': 'Qual é a margem operacional da consultoria?'
    },
    min: 0,
    max: 60,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_finance_003',
    category: 'finance',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuál es el fill rate (% de búsquedas cerradas)?',
      'pt-BR': 'Qual é o fill rate (% de buscas fechadas)?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_finance_004',
    category: 'finance',
    type: 'number',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuántos días promedio para cerrar una búsqueda?',
      'pt-BR': 'Quantos dias médios para fechar uma busca?'
    },
    min: 7,
    max: 180,
    unit: 'días'
  },
  {
    id: 'b2b_rrhh_finance_005',
    category: 'finance',
    type: 'slider',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Qué porcentaje representa headhunting en la facturación?',
      'pt-BR': 'Qual porcentagem representa headhunting no faturamento?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_finance_006',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 5,
    title: {
      es: '¿Cómo es el flujo de caja?',
      'pt-BR': 'Como é o fluxo de caixa?'
    },
    options: [
      { id: 'excelente', label: { es: 'Estable con reservas', 'pt-BR': 'Estável com reservas' }, emoji: '💎' },
      { id: 'bueno', label: { es: 'Generalmente positivo', 'pt-BR': 'Geralmente positivo' }, emoji: '✅' },
      { id: 'variable', label: { es: 'Variable según cierres', 'pt-BR': 'Variável conforme fechamentos' }, emoji: '📊' },
      { id: 'ajustado', label: { es: 'Frecuentemente ajustado', 'pt-BR': 'Frequentemente ajustado' }, emoji: '⚠️' }
    ]
  },

  // ============================================
  // CATEGORÍA: OPERATION (Operaciones)
  // ============================================
  {
    id: 'b2b_rrhh_operation_001',
    category: 'operation',
    type: 'single',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué ATS/CRM utilizan?',
      'pt-BR': 'Qual ATS/CRM utilizam?'
    },
    options: [
      { id: 'internacional', label: { es: 'ATS internacional (Bullhorn, JobAdder, etc.)', 'pt-BR': 'ATS internacional (Bullhorn, JobAdder, etc.)' }, emoji: '🌐' },
      { id: 'local', label: { es: 'ATS local/regional', 'pt-BR': 'ATS local/regional' }, emoji: '📍' },
      { id: 'crm', label: { es: 'CRM adaptado (Salesforce, HubSpot)', 'pt-BR': 'CRM adaptado (Salesforce, HubSpot)' }, emoji: '💼' },
      { id: 'propio', label: { es: 'Sistema propio', 'pt-BR': 'Sistema próprio' }, emoji: '🔧' },
      { id: 'basico', label: { es: 'Excel/Drive básico', 'pt-BR': 'Excel/Drive básico' }, emoji: '📊' }
    ]
  },
  {
    id: 'b2b_rrhh_operation_002',
    category: 'operation',
    type: 'number',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cuántos candidatos tiene en su base de datos?',
      'pt-BR': 'Quantos candidatos tem na base de dados?'
    },
    min: 100,
    max: 1000000,
    unit: 'candidatos'
  },
  {
    id: 'b2b_rrhh_operation_003',
    category: 'operation',
    type: 'number',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuántas búsquedas activas maneja cada consultor?',
      'pt-BR': 'Quantas buscas ativas cada consultor gerencia?'
    },
    min: 1,
    max: 50,
    unit: 'búsquedas'
  },
  {
    id: 'b2b_rrhh_operation_004',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo hacen sourcing de candidatos?',
      'pt-BR': 'Como fazem sourcing de candidatos?'
    },
    options: [
      { id: 'linkedin', label: { es: 'LinkedIn Recruiter principalmente', 'pt-BR': 'LinkedIn Recruiter principalmente' }, emoji: '💼' },
      { id: 'base_propia', label: { es: 'Base de datos propia', 'pt-BR': 'Base de dados própria' }, emoji: '📊' },
      { id: 'network', label: { es: 'Networking y referidos', 'pt-BR': 'Networking e indicações' }, emoji: '🤝' },
      { id: 'mixto', label: { es: 'Múltiples fuentes', 'pt-BR': 'Múltiplas fontes' }, emoji: '🔄' },
      { id: 'hunting', label: { es: 'Research directo/hunting', 'pt-BR': 'Research direto/hunting' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_rrhh_operation_005',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tienen metodología de entrevistas estandarizada?',
      'pt-BR': 'Têm metodologia de entrevistas padronizada?'
    },
    options: [
      { id: 'estructurada', label: { es: 'Sí, totalmente estructurada', 'pt-BR': 'Sim, totalmente estruturada' }, emoji: '✅' },
      { id: 'parcial', label: { es: 'Guías básicas', 'pt-BR': 'Guias básicos' }, emoji: '📋' },
      { id: 'flexible', label: { es: 'Flexible según consultor', 'pt-BR': 'Flexível conforme consultor' }, emoji: '🔄' },
      { id: 'no', label: { es: 'Sin metodología formal', 'pt-BR': 'Sem metodologia formal' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_rrhh_operation_006',
    category: 'operation',
    type: 'multi',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Qué tecnologías de IA/automatización usan?',
      'pt-BR': 'Quais tecnologias de IA/automação usam?'
    },
    options: [
      { id: 'matching', label: { es: 'AI matching de candidatos', 'pt-BR': 'AI matching de candidatos' }, emoji: '🤖' },
      { id: 'screening', label: { es: 'Screening automatizado', 'pt-BR': 'Screening automatizado' }, emoji: '🔍' },
      { id: 'chatbots', label: { es: 'Chatbots para candidatos', 'pt-BR': 'Chatbots para candidatos' }, emoji: '💬' },
      { id: 'video', label: { es: 'Entrevistas en video async', 'pt-BR': 'Entrevistas em vídeo async' }, emoji: '📹' },
      { id: 'ninguna', label: { es: 'Sin herramientas de IA', 'pt-BR': 'Sem ferramentas de IA' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: TEAM (Equipo)
  // ============================================
  {
    id: 'b2b_rrhh_team_001',
    category: 'team',
    type: 'number',
    mode: 'both',
    dimension: 'team',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántas personas tiene el equipo?',
      'pt-BR': 'Quantas pessoas tem a equipe?'
    },
    min: 1,
    max: 500,
    unit: 'personas'
  },
  {
    id: 'b2b_rrhh_team_002',
    category: 'team',
    type: 'number',
    mode: 'both',
    dimension: 'team',
    weight: 9,
    title: {
      es: '¿Cuántos consultores senior tienen?',
      'pt-BR': 'Quantos consultores seniores têm?'
    },
    min: 0,
    max: 100,
    unit: 'consultores'
  },
  {
    id: 'b2b_rrhh_team_003',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cómo está estructurado el equipo?',
      'pt-BR': 'Como está estruturada a equipe?'
    },
    options: [
      { id: 'industria', label: { es: 'Por industria/vertical', 'pt-BR': 'Por indústria/vertical' }, emoji: '🏢' },
      { id: 'funcion', label: { es: 'Por función (RRHH, Finanzas, etc.)', 'pt-BR': 'Por função (RH, Finanças, etc.)' }, emoji: '📊' },
      { id: 'nivel', label: { es: 'Por nivel jerárquico', 'pt-BR': 'Por nível hierárquico' }, emoji: '📈' },
      { id: 'generalista', label: { es: 'Generalistas', 'pt-BR': 'Generalistas' }, emoji: '🔄' },
      { id: 'mixto', label: { es: 'Estructura híbrida', 'pt-BR': 'Estrutura híbrida' }, emoji: '🔀' }
    ]
  },
  {
    id: 'b2b_rrhh_team_004',
    category: 'team',
    type: 'slider',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuál es la rotación anual de consultores?',
      'pt-BR': 'Qual é a rotação anual de consultores?'
    },
    min: 0,
    max: 50,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_team_005',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cómo compensan a los consultores?',
      'pt-BR': 'Como compensam os consultores?'
    },
    options: [
      { id: 'fijo', label: { es: 'Salario fijo principalmente', 'pt-BR': 'Salário fixo principalmente' }, emoji: '💵' },
      { id: 'variable_bajo', label: { es: 'Fijo + variable moderado', 'pt-BR': 'Fixo + variável moderado' }, emoji: '📊' },
      { id: 'variable_alto', label: { es: 'Fijo bajo + alto variable', 'pt-BR': 'Fixo baixo + alto variável' }, emoji: '🎯' },
      { id: 'comision', label: { es: 'Casi 100% comisión', 'pt-BR': 'Quase 100% comissão' }, emoji: '💰' }
    ]
  },
  {
    id: 'b2b_rrhh_team_006',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cuál es el mayor desafío con el equipo?',
      'pt-BR': 'Qual é o maior desafio com a equipe?'
    },
    options: [
      { id: 'conseguir', label: { es: 'Conseguir buenos consultores', 'pt-BR': 'Conseguir bons consultores' }, emoji: '🔍' },
      { id: 'retener', label: { es: 'Retener talento', 'pt-BR': 'Reter talento' }, emoji: '🤝' },
      { id: 'productividad', label: { es: 'Mejorar productividad', 'pt-BR': 'Melhorar produtividade' }, emoji: '📈' },
      { id: 'capacitar', label: { es: 'Capacitación continua', 'pt-BR': 'Capacitação contínua' }, emoji: '🎓' },
      { id: 'ninguno', label: { es: 'Equipo estable', 'pt-BR': 'Equipe estável' }, emoji: '✅' }
    ]
  },

  // ============================================
  // CATEGORÍA: MARKETING (Marketing y Adquisición)
  // ============================================
  {
    id: 'b2b_rrhh_marketing_001',
    category: 'marketing',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuánto invierten en marketing mensualmente?',
      'pt-BR': 'Quanto investem em marketing mensalmente?'
    },
    options: [
      { id: 'nada', label: { es: 'Prácticamente nada', 'pt-BR': 'Praticamente nada' }, emoji: '🚫' },
      { id: 'minimo', label: { es: 'Menos de $1k USD', 'pt-BR': 'Menos de R$ 5k' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$1k-5k USD', 'pt-BR': 'R$ 5k-25k' }, emoji: '📊' },
      { id: 'significativo', label: { es: '$5k-15k USD', 'pt-BR': 'R$ 25k-75k' }, emoji: '📈' },
      { id: 'alto', label: { es: 'Más de $15k USD', 'pt-BR': 'Mais de R$ 75k' }, emoji: '🚀' }
    ]
  },
  {
    id: 'b2b_rrhh_marketing_002',
    category: 'marketing',
    type: 'multi',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué canales de marketing utilizan?',
      'pt-BR': 'Quais canais de marketing utilizam?'
    },
    options: [
      { id: 'linkedin', label: { es: 'LinkedIn (orgánico y/o ads)', 'pt-BR': 'LinkedIn (orgânico e/ou ads)' }, emoji: '💼' },
      { id: 'contenido', label: { es: 'Blog/Estudios de mercado', 'pt-BR': 'Blog/Estudos de mercado' }, emoji: '📝' },
      { id: 'eventos', label: { es: 'Eventos HR/Industry', 'pt-BR': 'Eventos RH/Industry' }, emoji: '🎤' },
      { id: 'prensa', label: { es: 'PR y prensa especializada', 'pt-BR': 'PR e imprensa especializada' }, emoji: '📰' },
      { id: 'referral', label: { es: 'Programa de referidos', 'pt-BR': 'Programa de indicações' }, emoji: '🤝' },
      { id: 'ninguno', label: { es: 'Sin marketing activo', 'pt-BR': 'Sem marketing ativo' }, emoji: '🚫' }
    ]
  },
  {
    id: 'b2b_rrhh_marketing_003',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Publican estudios de mercado/salarios?',
      'pt-BR': 'Publicam estudos de mercado/salários?'
    },
    options: [
      { id: 'regular', label: { es: 'Sí, regularmente', 'pt-BR': 'Sim, regularmente' }, emoji: '📊' },
      { id: 'anual', label: { es: 'Anualmente', 'pt-BR': 'Anualmente' }, emoji: '📅' },
      { id: 'esporadico', label: { es: 'Esporádicamente', 'pt-BR': 'Esporadicamente' }, emoji: '📆' },
      { id: 'no', label: { es: 'No publicamos estudios', 'pt-BR': 'Não publicamos estudos' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_rrhh_marketing_004',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Tienen sitio web con portal de empleo?',
      'pt-BR': 'Têm site com portal de emprego?'
    },
    options: [
      { id: 'completo', label: { es: 'Sí, portal completo con aplicaciones', 'pt-BR': 'Sim, portal completo com aplicações' }, emoji: '🌐' },
      { id: 'basico', label: { es: 'Listado básico de vacantes', 'pt-BR': 'Lista básica de vagas' }, emoji: '📋' },
      { id: 'institucional', label: { es: 'Solo web institucional', 'pt-BR': 'Só web institucional' }, emoji: '🏢' },
      { id: 'no', label: { es: 'Sin sitio web propio', 'pt-BR': 'Sem site próprio' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: REPUTATION (Retención y CX)
  // ============================================
  {
    id: 'b2b_rrhh_reputation_001',
    category: 'reputation',
    type: 'slider',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la tasa de recompra de clientes?',
      'pt-BR': 'Qual é a taxa de recompra de clientes?'
    },
    help: {
      es: '% de clientes que vuelven a contratar en 12 meses',
      'pt-BR': '% de clientes que voltam a contratar em 12 meses'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_reputation_002',
    category: 'reputation',
    type: 'slider',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Cuál es el % de candidatos que pasan la garantía?',
      'pt-BR': 'Qual é o % de candidatos que passam a garantia?'
    },
    min: 50,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_reputation_003',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Miden satisfacción de clientes formalmente?',
      'pt-BR': 'Medem satisfação de clientes formalmente?'
    },
    options: [
      { id: 'nps', label: { es: 'Sí, con NPS u otra métrica', 'pt-BR': 'Sim, com NPS ou outra métrica' }, emoji: '📊' },
      { id: 'encuestas', label: { es: 'Encuestas post-proceso', 'pt-BR': 'Pesquisas pós-processo' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Solo feedback informal', 'pt-BR': 'Só feedback informal' }, emoji: '💬' },
      { id: 'no', label: { es: 'No medimos', 'pt-BR': 'Não medimos' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_rrhh_reputation_004',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Miden experiencia del candidato?',
      'pt-BR': 'Medem experiência do candidato?'
    },
    options: [
      { id: 'sistematico', label: { es: 'Sí, sistemáticamente', 'pt-BR': 'Sim, sistematicamente' }, emoji: '📊' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📋' },
      { id: 'no', label: { es: 'No medimos', 'pt-BR': 'Não medimos' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_rrhh_reputation_005',
    category: 'reputation',
    type: 'number',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Cuál es la antigüedad promedio de clientes?',
      'pt-BR': 'Qual é a antiguidade média de clientes?'
    },
    min: 0,
    max: 30,
    unit: 'años'
  },

  // ============================================
  // CATEGORÍA: GOALS (Objetivos del Dueño)
  // ============================================
  {
    id: 'b2b_rrhh_goals_001',
    category: 'goals',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el objetivo principal para los próximos 12 meses?',
      'pt-BR': 'Qual é o objetivo principal para os próximos 12 meses?'
    },
    options: [
      { id: 'crecer', label: { es: 'Crecer en facturación', 'pt-BR': 'Crescer em faturamento' }, emoji: '📈' },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰' },
      { id: 'diversificar', label: { es: 'Diversificar servicios', 'pt-BR': 'Diversificar serviços' }, emoji: '🔄' },
      { id: 'tecnologia', label: { es: 'Invertir en tecnología', 'pt-BR': 'Investir em tecnologia' }, emoji: '💻' },
      { id: 'equipo', label: { es: 'Fortalecer equipo', 'pt-BR': 'Fortalecer equipe' }, emoji: '👥' },
      { id: 'posicionar', label: { es: 'Posicionarse en nuevo nicho', 'pt-BR': 'Posicionar-se em novo nicho' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_rrhh_goals_002',
    category: 'goals',
    type: 'slider',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuánto quieren crecer en facturación este año?',
      'pt-BR': 'Quanto querem crescer em faturamento este ano?'
    },
    min: -20,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_rrhh_goals_003',
    category: 'goals',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Qué nuevos servicios quieren desarrollar?',
      'pt-BR': 'Quais novos serviços querem desenvolver?'
    },
    options: [
      { id: 'rpo', label: { es: 'RPO (Recruitment Process Outsourcing)', 'pt-BR': 'RPO (Recruitment Process Outsourcing)' }, emoji: '🔄' },
      { id: 'consulting', label: { es: 'Consultoría organizacional', 'pt-BR': 'Consultoria organizacional' }, emoji: '💼' },
      { id: 'hr_tech', label: { es: 'Implementación HR Tech', 'pt-BR': 'Implementação HR Tech' }, emoji: '💻' },
      { id: 'employer', label: { es: 'Employer branding', 'pt-BR': 'Employer branding' }, emoji: '🏆' },
      { id: 'analytics', label: { es: 'People analytics', 'pt-BR': 'People analytics' }, emoji: '📊' },
      { id: 'ninguno', label: { es: 'Mantener foco actual', 'pt-BR': 'Manter foco atual' }, emoji: '✅' }
    ]
  },
  {
    id: 'b2b_rrhh_goals_004',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Planean expandirse geográficamente?',
      'pt-BR': 'Planejam expandir-se geograficamente?'
    },
    options: [
      { id: 'internacional', label: { es: 'Sí, internacionalmente', 'pt-BR': 'Sim, internacionalmente' }, emoji: '🌎' },
      { id: 'nacional', label: { es: 'Sí, a nivel nacional', 'pt-BR': 'Sim, a nível nacional' }, emoji: '🗺️' },
      { id: 'local', label: { es: 'Foco local actual', 'pt-BR': 'Foco local atual' }, emoji: '📍' },
      { id: 'remoto', label: { es: 'Modelo 100% remoto', 'pt-BR': 'Modelo 100% remoto' }, emoji: '💻' }
    ]
  },
  {
    id: 'b2b_rrhh_goals_005',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Planean inversiones tecnológicas significativas?',
      'pt-BR': 'Planejam investimentos tecnológicos significativos?'
    },
    options: [
      { id: 'grande', label: { es: 'Sí, transformación digital', 'pt-BR': 'Sim, transformação digital' }, emoji: '🚀' },
      { id: 'moderada', label: { es: 'Inversión moderada', 'pt-BR': 'Investimento moderado' }, emoji: '💻' },
      { id: 'minima', label: { es: 'Solo actualizaciones', 'pt-BR': 'Só atualizações' }, emoji: '🔧' },
      { id: 'no', label: { es: 'Sin planes de inversión', 'pt-BR': 'Sem planos de investimento' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_rrhh_goals_006',
    category: 'goals',
    type: 'text',
    mode: 'complete',
    dimension: 'growth',
    weight: 4,
    title: {
      es: '¿Cuál es el mayor desafío que enfrentan actualmente?',
      'pt-BR': 'Qual é o maior desafio que enfrentam atualmente?'
    }
  }
];
