// Consultoría Financiera / M&A B2B Questions - Complete Questionnaire
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const consultoriaFinancieraQuestions: VistaSetupQuestion[] = [
  // ============================================
  // CATEGORÍA: IDENTITY (Identidad y Posicionamiento)
  // ============================================
  {
    id: 'b2b_finanzas_identity_001',
    category: 'identity',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el enfoque principal de la consultoría?',
      'pt-BR': 'Qual é o foco principal da consultoria?'
    },
    options: [
      { id: 'ma', label: { es: 'M&A / Fusiones y adquisiciones', 'pt-BR': 'M&A / Fusões e aquisições' }, emoji: '🤝', impactScore: 10 },
      { id: 'valuacion', label: { es: 'Valuación de empresas', 'pt-BR': 'Avaliação de empresas' }, emoji: '📊', impactScore: 9 },
      { id: 'reestructuracion', label: { es: 'Reestructuración financiera', 'pt-BR': 'Reestruturação financeira' }, emoji: '🔄', impactScore: 9 },
      { id: 'levantamiento', label: { es: 'Levantamiento de capital', 'pt-BR': 'Captação de capital' }, emoji: '💰', impactScore: 9 },
      { id: 'cfo', label: { es: 'CFO as a Service', 'pt-BR': 'CFO as a Service' }, emoji: '👔', impactScore: 8 },
      { id: 'integral', label: { es: 'Advisory financiero integral', 'pt-BR': 'Advisory financeiro integral' }, emoji: '🌟', impactScore: 10 }
    ]
  },
  {
    id: 'b2b_finanzas_identity_002',
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
    id: 'b2b_finanzas_identity_003',
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
      { id: 'tech', label: { es: 'Tecnología / SaaS', 'pt-BR': 'Tecnologia / SaaS' }, emoji: '💻' },
      { id: 'consumo', label: { es: 'Consumo / Retail', 'pt-BR': 'Consumo / Varejo' }, emoji: '🛒' },
      { id: 'salud', label: { es: 'Salud y farma', 'pt-BR': 'Saúde e farma' }, emoji: '🏥' },
      { id: 'industria', label: { es: 'Industria / Manufactura', 'pt-BR': 'Indústria / Manufatura' }, emoji: '🏭' },
      { id: 'finserv', label: { es: 'Servicios financieros', 'pt-BR': 'Serviços financeiros' }, emoji: '🏦' },
      { id: 'energia', label: { es: 'Energía e infraestructura', 'pt-BR': 'Energia e infraestrutura' }, emoji: '⚡' },
      { id: 'real_estate', label: { es: 'Real estate', 'pt-BR': 'Real estate' }, emoji: '🏢' },
      { id: 'generalista', label: { es: 'Generalista multi-industria', 'pt-BR': 'Generalista multi-indústria' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_finanzas_identity_004',
    category: 'identity',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Qué tamaño de transacciones manejan típicamente?',
      'pt-BR': 'Qual tamanho de transações gerenciam tipicamente?'
    },
    options: [
      { id: 'pequeno', label: { es: 'Menos de $5M USD', 'pt-BR': 'Menos de R$ 25M' }, emoji: '🌱' },
      { id: 'medio_bajo', label: { es: '$5M-20M USD', 'pt-BR': 'R$ 25M-100M' }, emoji: '📈' },
      { id: 'medio', label: { es: '$20M-100M USD', 'pt-BR': 'R$ 100M-500M' }, emoji: '💼' },
      { id: 'grande', label: { es: '$100M-500M USD', 'pt-BR': 'R$ 500M-2.5B' }, emoji: '🏆' },
      { id: 'mega', label: { es: 'Más de $500M USD', 'pt-BR': 'Mais de R$ 2.5B' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_finanzas_identity_005',
    category: 'identity',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Cuál es el diferenciador principal?',
      'pt-BR': 'Qual é o diferencial principal?'
    },
    options: [
      { id: 'track_record', label: { es: 'Track record de deals cerrados', 'pt-BR': 'Track record de deals fechados' }, emoji: '🏆' },
      { id: 'network', label: { es: 'Network de inversores', 'pt-BR': 'Network de investidores' }, emoji: '🤝' },
      { id: 'expertise', label: { es: 'Expertise sectorial', 'pt-BR': 'Expertise setorial' }, emoji: '🎯' },
      { id: 'metodologia', label: { es: 'Metodología propietaria', 'pt-BR': 'Metodologia proprietária' }, emoji: '📊' },
      { id: 'cercania', label: { es: 'Cercanía y atención personalizada', 'pt-BR': 'Proximidade e atendimento personalizado' }, emoji: '💼' }
    ]
  },

  // ============================================
  // CATEGORÍA: MENU (Servicios y Precios)
  // ============================================
  {
    id: 'b2b_finanzas_menu_001',
    category: 'menu',
    type: 'multi',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué servicios financieros ofrece la consultora?',
      'pt-BR': 'Quais serviços financeiros a consultoria oferece?'
    },
    options: [
      { id: 'sell_side', label: { es: 'M&A Sell-side (venta de empresas)', 'pt-BR': 'M&A Sell-side (venda de empresas)' }, emoji: '💰' },
      { id: 'buy_side', label: { es: 'M&A Buy-side (adquisiciones)', 'pt-BR': 'M&A Buy-side (aquisições)' }, emoji: '🛒' },
      { id: 'valuacion', label: { es: 'Valuación de empresas', 'pt-BR': 'Avaliação de empresas' }, emoji: '📊' },
      { id: 'due_diligence', label: { es: 'Due diligence financiero', 'pt-BR': 'Due diligence financeiro' }, emoji: '🔍' },
      { id: 'fundraising', label: { es: 'Levantamiento de capital (equity/debt)', 'pt-BR': 'Captação de capital (equity/debt)' }, emoji: '🚀' },
      { id: 'reestructuracion', label: { es: 'Reestructuración financiera', 'pt-BR': 'Reestruturação financeira' }, emoji: '🔄' },
      { id: 'modelo', label: { es: 'Modelado financiero', 'pt-BR': 'Modelagem financeira' }, emoji: '📈' },
      { id: 'cfo', label: { es: 'CFO Services / Controller', 'pt-BR': 'CFO Services / Controller' }, emoji: '👔' }
    ]
  },
  {
    id: 'b2b_finanzas_menu_002',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el modelo de fee para M&A?',
      'pt-BR': 'Qual é o modelo de fee para M&A?'
    },
    options: [
      { id: 'success_only', label: { es: 'Solo success fee', 'pt-BR': 'Só success fee' }, emoji: '🎯' },
      { id: 'retainer_success', label: { es: 'Retainer + success fee', 'pt-BR': 'Retainer + success fee' }, emoji: '💎' },
      { id: 'retainer_alto', label: { es: 'Retainer mensual alto', 'pt-BR': 'Retainer mensal alto' }, emoji: '💰' },
      { id: 'mixto', label: { es: 'Variable según deal', 'pt-BR': 'Variável conforme deal' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_finanzas_menu_003',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es el success fee típico en M&A?',
      'pt-BR': 'Qual é o success fee típico em M&A?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos del 2%', 'pt-BR': 'Menos de 2%' }, emoji: '💵' },
      { id: 'estandar', label: { es: '2-3%', 'pt-BR': '2-3%' }, emoji: '📊' },
      { id: 'medio', label: { es: '3-5%', 'pt-BR': '3-5%' }, emoji: '💰' },
      { id: 'alto', label: { es: '5-7%', 'pt-BR': '5-7%' }, emoji: '💎' },
      { id: 'lehman', label: { es: 'Escala Lehman', 'pt-BR': 'Escala Lehman' }, emoji: '📈' }
    ]
  },
  {
    id: 'b2b_finanzas_menu_004',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cuál es el retainer mensual promedio?',
      'pt-BR': 'Qual é o retainer mensal médio?'
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
    id: 'b2b_finanzas_menu_005',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cobran por valuaciones stand-alone?',
      'pt-BR': 'Cobram por avaliações stand-alone?'
    },
    options: [
      { id: 'si_premium', label: { es: 'Sí, fee premium', 'pt-BR': 'Sim, fee premium' }, emoji: '💎' },
      { id: 'si_estandar', label: { es: 'Sí, fee estándar', 'pt-BR': 'Sim, fee padrão' }, emoji: '💰' },
      { id: 'incluido', label: { es: 'Incluido en mandatos', 'pt-BR': 'Incluído em mandatos' }, emoji: '📋' },
      { id: 'no', label: { es: 'No ofrecemos stand-alone', 'pt-BR': 'Não oferecemos stand-alone' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: SALES (Ventas y Conversión)
  // ============================================
  {
    id: 'b2b_finanzas_sales_001',
    category: 'sales',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la principal fuente de nuevos mandatos?',
      'pt-BR': 'Qual é a principal fonte de novos mandatos?'
    },
    options: [
      { id: 'referidos', label: { es: 'Referidos de clientes/deals pasados', 'pt-BR': 'Indicações de clientes/deals passados' }, emoji: '🤝' },
      { id: 'network', label: { es: 'Network de bancos/fondos', 'pt-BR': 'Network de bancos/fundos' }, emoji: '🏦' },
      { id: 'proactivo', label: { es: 'Prospección proactiva', 'pt-BR': 'Prospecção proativa' }, emoji: '📞' },
      { id: 'eventos', label: { es: 'Eventos de industria', 'pt-BR': 'Eventos de indústria' }, emoji: '🎤' },
      { id: 'inbound', label: { es: 'Inbound / Reputación de mercado', 'pt-BR': 'Inbound / Reputação de mercado' }, emoji: '📥' }
    ]
  },
  {
    id: 'b2b_finanzas_sales_002',
    category: 'sales',
    type: 'number',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos mandatos nuevos toman por año?',
      'pt-BR': 'Quantos mandatos novos assumem por ano?'
    },
    min: 1,
    max: 100,
    unit: 'mandatos/año'
  },
  {
    id: 'b2b_finanzas_sales_003',
    category: 'sales',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuál es la tasa de cierre de deals (success rate)?',
      'pt-BR': 'Qual é a taxa de fechamento de deals (success rate)?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_sales_004',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo toma cerrar un mandato típico?',
      'pt-BR': 'Quanto tempo leva para fechar um mandato típico?'
    },
    options: [
      { id: 'rapido', label: { es: 'Menos de 1 mes', 'pt-BR': 'Menos de 1 mês' }, emoji: '⚡' },
      { id: 'normal', label: { es: '1-3 meses', 'pt-BR': '1-3 meses' }, emoji: '📅' },
      { id: 'medio', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' }, emoji: '📆' },
      { id: 'largo', label: { es: '6-12 meses', 'pt-BR': '6-12 meses' }, emoji: '🗓️' },
      { id: 'muy_largo', label: { es: 'Más de 12 meses', 'pt-BR': 'Mais de 12 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'b2b_finanzas_sales_005',
    category: 'sales',
    type: 'number',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Cuántos mandatos activos tienen simultáneamente?',
      'pt-BR': 'Quantos mandatos ativos têm simultaneamente?'
    },
    min: 1,
    max: 50,
    unit: 'mandatos'
  },

  // ============================================
  // CATEGORÍA: FINANCE (Finanzas y Márgenes)
  // ============================================
  {
    id: 'b2b_finanzas_finance_001',
    category: 'finance',
    type: 'single',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la facturación anual de la consultora?',
      'pt-BR': 'Qual é o faturamento anual da consultoria?'
    },
    options: [
      { id: 'muy_chico', label: { es: 'Menos de $500k USD', 'pt-BR': 'Menos de R$ 2.5M' }, emoji: '🌱' },
      { id: 'chico', label: { es: '$500k-1.5M USD', 'pt-BR': 'R$ 2.5M-7.5M' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$1.5M-5M USD', 'pt-BR': 'R$ 7.5M-25M' }, emoji: '💼' },
      { id: 'grande', label: { es: '$5M-15M USD', 'pt-BR': 'R$ 25M-75M' }, emoji: '🏆' },
      { id: 'muy_grande', label: { es: 'Más de $15M USD', 'pt-BR': 'Mais de R$ 75M' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_finanzas_finance_002',
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
    max: 70,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_finance_003',
    category: 'finance',
    type: 'slider',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué % de ingresos viene de success fees?',
      'pt-BR': 'Qual % de receitas vem de success fees?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_finance_004',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cómo es la volatilidad de ingresos?',
      'pt-BR': 'Como é a volatilidade de receitas?'
    },
    options: [
      { id: 'estable', label: { es: 'Muy estable (retainers altos)', 'pt-BR': 'Muito estável (retainers altos)' }, emoji: '📊' },
      { id: 'moderada', label: { es: 'Moderada', 'pt-BR': 'Moderada' }, emoji: '📈' },
      { id: 'alta', label: { es: 'Alta (depende de cierres)', 'pt-BR': 'Alta (depende de fechamentos)' }, emoji: '📉' },
      { id: 'muy_alta', label: { es: 'Muy alta', 'pt-BR': 'Muito alta' }, emoji: '🎢' }
    ]
  },
  {
    id: 'b2b_finanzas_finance_005',
    category: 'finance',
    type: 'number',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cuál es el revenue promedio por deal cerrado?',
      'pt-BR': 'Qual é a receita média por deal fechado?'
    },
    min: 10000,
    max: 10000000,
    unit: 'USD'
  },

  // ============================================
  // CATEGORÍA: OPERATION (Operaciones)
  // ============================================
  {
    id: 'b2b_finanzas_operation_001',
    category: 'operation',
    type: 'multi',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué herramientas utilizan para análisis?',
      'pt-BR': 'Quais ferramentas utilizam para análise?'
    },
    options: [
      { id: 'excel', label: { es: 'Excel avanzado', 'pt-BR': 'Excel avançado' }, emoji: '📊' },
      { id: 'pitchbook', label: { es: 'PitchBook / CapIQ', 'pt-BR': 'PitchBook / CapIQ' }, emoji: '💼' },
      { id: 'bloomberg', label: { es: 'Bloomberg', 'pt-BR': 'Bloomberg' }, emoji: '📈' },
      { id: 'powerbi', label: { es: 'Power BI / Tableau', 'pt-BR': 'Power BI / Tableau' }, emoji: '📉' },
      { id: 'dataroom', label: { es: 'Data rooms (Intralinks, etc.)', 'pt-BR': 'Data rooms (Intralinks, etc.)' }, emoji: '🔐' },
      { id: 'crm', label: { es: 'CRM para pipeline', 'pt-BR': 'CRM para pipeline' }, emoji: '👥' }
    ]
  },
  {
    id: 'b2b_finanzas_operation_002',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cómo estructuran los deal teams?',
      'pt-BR': 'Como estruturam os deal teams?'
    },
    options: [
      { id: 'dedicado', label: { es: 'Equipo dedicado por deal', 'pt-BR': 'Equipe dedicada por deal' }, emoji: '👥' },
      { id: 'pool', label: { es: 'Pool compartido', 'pt-BR': 'Pool compartilhado' }, emoji: '🔄' },
      { id: 'socios', label: { es: 'Socios manejan todo', 'pt-BR': 'Sócios gerenciam tudo' }, emoji: '👔' },
      { id: 'hibrido', label: { es: 'Híbrido según tamaño', 'pt-BR': 'Híbrido conforme tamanho' }, emoji: '🔀' }
    ]
  },
  {
    id: 'b2b_finanzas_operation_003',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Tienen acceso a deal flow de Private Equity/VC?',
      'pt-BR': 'Têm acesso a deal flow de Private Equity/VC?'
    },
    options: [
      { id: 'amplio', label: { es: 'Sí, red amplia de fondos', 'pt-BR': 'Sim, rede ampla de fundos' }, emoji: '🌐' },
      { id: 'selectivo', label: { es: 'Relaciones selectas', 'pt-BR': 'Relações selecionadas' }, emoji: '🎯' },
      { id: 'limitado', label: { es: 'Limitado', 'pt-BR': 'Limitado' }, emoji: '📊' },
      { id: 'no', label: { es: 'No tenemos acceso directo', 'pt-BR': 'Não temos acesso direto' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_finanzas_operation_004',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Tienen metodología de valuación propietaria?',
      'pt-BR': 'Têm metodologia de avaliação proprietária?'
    },
    options: [
      { id: 'si_robusta', label: { es: 'Sí, muy desarrollada', 'pt-BR': 'Sim, muito desenvolvida' }, emoji: '✅' },
      { id: 'si_basica', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básica' }, emoji: '📋' },
      { id: 'estandar', label: { es: 'Usamos metodologías estándar', 'pt-BR': 'Usamos metodologias padrão' }, emoji: '📊' },
      { id: 'variable', label: { es: 'Depende del proyecto', 'pt-BR': 'Depende do projeto' }, emoji: '🔄' }
    ]
  },

  // ============================================
  // CATEGORÍA: TEAM (Equipo)
  // ============================================
  {
    id: 'b2b_finanzas_team_001',
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
    max: 200,
    unit: 'personas'
  },
  {
    id: 'b2b_finanzas_team_002',
    category: 'team',
    type: 'number',
    mode: 'both',
    dimension: 'team',
    weight: 9,
    title: {
      es: '¿Cuántos socios/partners tiene la firma?',
      'pt-BR': 'Quantos sócios/partners tem a firma?'
    },
    min: 1,
    max: 50,
    unit: 'socios'
  },
  {
    id: 'b2b_finanzas_team_003',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuál es el background típico del equipo?',
      'pt-BR': 'Qual é o background típico da equipe?'
    },
    options: [
      { id: 'banca', label: { es: 'Ex-banca de inversión', 'pt-BR': 'Ex-banco de investimento' }, emoji: '🏦' },
      { id: 'big4', label: { es: 'Ex-Big 4', 'pt-BR': 'Ex-Big 4' }, emoji: '🔍' },
      { id: 'pe', label: { es: 'Ex-Private Equity/VC', 'pt-BR': 'Ex-Private Equity/VC' }, emoji: '💼' },
      { id: 'corporativo', label: { es: 'Ex-corporativo (CFOs, etc.)', 'pt-BR': 'Ex-corporativo (CFOs, etc.)' }, emoji: '👔' },
      { id: 'mixto', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_finanzas_team_004',
    category: 'team',
    type: 'slider',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuál es la rotación anual del equipo?',
      'pt-BR': 'Qual é a rotação anual da equipe?'
    },
    min: 0,
    max: 50,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_team_005',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cómo compensan al equipo senior?',
      'pt-BR': 'Como compensam a equipe sênior?'
    },
    options: [
      { id: 'carry', label: { es: 'Salario + carry en deals', 'pt-BR': 'Salário + carry em deals' }, emoji: '💎' },
      { id: 'bonus', label: { es: 'Salario + bonus por performance', 'pt-BR': 'Salário + bônus por performance' }, emoji: '🎯' },
      { id: 'equity', label: { es: 'Equity en la firma', 'pt-BR': 'Equity na firma' }, emoji: '📊' },
      { id: 'fijo', label: { es: 'Principalmente fijo', 'pt-BR': 'Principalmente fixo' }, emoji: '💰' }
    ]
  },

  // ============================================
  // CATEGORÍA: MARKETING (Marketing y Adquisición)
  // ============================================
  {
    id: 'b2b_finanzas_marketing_001',
    category: 'marketing',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuánto invierten en marketing/BD anualmente?',
      'pt-BR': 'Quanto investem em marketing/BD anualmente?'
    },
    options: [
      { id: 'minimo', label: { es: 'Mínimo (reputación basta)', 'pt-BR': 'Mínimo (reputação basta)' }, emoji: '🏆' },
      { id: 'bajo', label: { es: 'Menos de $20k USD', 'pt-BR': 'Menos de R$ 100k' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$20k-50k USD', 'pt-BR': 'R$ 100k-250k' }, emoji: '📊' },
      { id: 'significativo', label: { es: '$50k-150k USD', 'pt-BR': 'R$ 250k-750k' }, emoji: '📈' },
      { id: 'alto', label: { es: 'Más de $150k USD', 'pt-BR': 'Mais de R$ 750k' }, emoji: '🚀' }
    ]
  },
  {
    id: 'b2b_finanzas_marketing_002',
    category: 'marketing',
    type: 'multi',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Qué actividades de BD/marketing realizan?',
      'pt-BR': 'Quais atividades de BD/marketing realizam?'
    },
    options: [
      { id: 'eventos', label: { es: 'Eventos exclusivos para CEOs', 'pt-BR': 'Eventos exclusivos para CEOs' }, emoji: '🎤' },
      { id: 'publicaciones', label: { es: 'Publicaciones/estudios de mercado', 'pt-BR': 'Publicações/estudos de mercado' }, emoji: '📰' },
      { id: 'linkedin', label: { es: 'LinkedIn / Thought leadership', 'pt-BR': 'LinkedIn / Thought leadership' }, emoji: '💼' },
      { id: 'conferencias', label: { es: 'Conferencias de industria', 'pt-BR': 'Conferências de indústria' }, emoji: '🎙️' },
      { id: 'prensa', label: { es: 'PR / Menciones en prensa', 'pt-BR': 'PR / Menções na imprensa' }, emoji: '📺' },
      { id: 'referral', label: { es: 'Solo referidos', 'pt-BR': 'Só indicações' }, emoji: '🤝' }
    ]
  },
  {
    id: 'b2b_finanzas_marketing_003',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Publican league tables / track record públicamente?',
      'pt-BR': 'Publicam league tables / track record publicamente?'
    },
    options: [
      { id: 'si_activo', label: { es: 'Sí, activamente', 'pt-BR': 'Sim, ativamente' }, emoji: '📊' },
      { id: 'selectivo', label: { es: 'Solo casos selectos', 'pt-BR': 'Só casos selecionados' }, emoji: '🎯' },
      { id: 'confidencial', label: { es: 'Solo en propuestas (confidencial)', 'pt-BR': 'Só em propostas (confidencial)' }, emoji: '🔒' },
      { id: 'no', label: { es: 'No publicamos', 'pt-BR': 'Não publicamos' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: REPUTATION (Retención y CX)
  // ============================================
  {
    id: 'b2b_finanzas_reputation_001',
    category: 'reputation',
    type: 'slider',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué % de clientes vuelve a contratar?',
      'pt-BR': 'Qual % de clientes volta a contratar?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_reputation_002',
    category: 'reputation',
    type: 'slider',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Cuál es el success rate en deals que toman?',
      'pt-BR': 'Qual é o success rate em deals que assumem?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_finanzas_reputation_003',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Miden satisfacción de clientes?',
      'pt-BR': 'Medem satisfação de clientes?'
    },
    options: [
      { id: 'formal', label: { es: 'Sí, encuesta post-deal', 'pt-BR': 'Sim, pesquisa pós-deal' }, emoji: '📊' },
      { id: 'informal', label: { es: 'Conversación informal', 'pt-BR': 'Conversa informal' }, emoji: '💬' },
      { id: 'referencia', label: { es: 'Solo si piden referencia', 'pt-BR': 'Só se pedem referência' }, emoji: '🤝' },
      { id: 'no', label: { es: 'No medimos formalmente', 'pt-BR': 'Não medimos formalmente' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_finanzas_reputation_004',
    category: 'reputation',
    type: 'number',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Cuántos deals han cerrado en los últimos 3 años?',
      'pt-BR': 'Quantos deals fecharam nos últimos 3 anos?'
    },
    min: 0,
    max: 200,
    unit: 'deals'
  },

  // ============================================
  // CATEGORÍA: GOALS (Objetivos del Dueño)
  // ============================================
  {
    id: 'b2b_finanzas_goals_001',
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
      { id: 'deals', label: { es: 'Cerrar más deals', 'pt-BR': 'Fechar mais deals' }, emoji: '🎯' },
      { id: 'ticket', label: { es: 'Subir ticket promedio', 'pt-BR': 'Subir ticket médio' }, emoji: '💎' },
      { id: 'servicios', label: { es: 'Diversificar servicios', 'pt-BR': 'Diversificar serviços' }, emoji: '🔄' },
      { id: 'equipo', label: { es: 'Crecer el equipo', 'pt-BR': 'Crescer a equipe' }, emoji: '👥' },
      { id: 'network', label: { es: 'Expandir network de inversores', 'pt-BR': 'Expandir network de investidores' }, emoji: '🌐' },
      { id: 'internacional', label: { es: 'Deals cross-border', 'pt-BR': 'Deals cross-border' }, emoji: '🌎' }
    ]
  },
  {
    id: 'b2b_finanzas_goals_002',
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
    id: 'b2b_finanzas_goals_003',
    category: 'goals',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿En qué áreas quieren expandirse?',
      'pt-BR': 'Em quais áreas querem expandir-se?'
    },
    options: [
      { id: 'fundraising', label: { es: 'Capital raising', 'pt-BR': 'Capital raising' }, emoji: '🚀' },
      { id: 'reestructura', label: { es: 'Reestructuración/turnaround', 'pt-BR': 'Reestruturação/turnaround' }, emoji: '🔄' },
      { id: 'pe_advisory', label: { es: 'PE/VC advisory', 'pt-BR': 'PE/VC advisory' }, emoji: '💼' },
      { id: 'exit', label: { es: 'Exit planning para founders', 'pt-BR': 'Exit planning para founders' }, emoji: '🎯' },
      { id: 'cross_border', label: { es: 'Deals internacionales', 'pt-BR': 'Deals internacionais' }, emoji: '🌎' },
      { id: 'mantener', label: { es: 'Mantener foco actual', 'pt-BR': 'Manter foco atual' }, emoji: '✅' }
    ]
  },
  {
    id: 'b2b_finanzas_goals_004',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Planean incorporar nuevos socios?',
      'pt-BR': 'Planejam incorporar novos sócios?'
    },
    options: [
      { id: 'si_senior', label: { es: 'Sí, lateral senior', 'pt-BR': 'Sim, lateral sênior' }, emoji: '👔' },
      { id: 'si_interno', label: { es: 'Sí, promoción interna', 'pt-BR': 'Sim, promoção interna' }, emoji: '📈' },
      { id: 'evaluando', label: { es: 'Evaluando opciones', 'pt-BR': 'Avaliando opções' }, emoji: '🔍' },
      { id: 'no', label: { es: 'No por ahora', 'pt-BR': 'Não por enquanto' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_finanzas_goals_005',
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
