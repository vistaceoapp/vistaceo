// Estudio Contable / Auditoría B2B Questions - Complete Questionnaire
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const estudioContableQuestions: VistaSetupQuestion[] = [
  // ============================================
  // CATEGORÍA: IDENTITY (Identidad y Posicionamiento)
  // ============================================
  {
    id: 'b2b_contable_identity_001',
    category: 'identity',
    type: 'single',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es el enfoque principal del estudio?',
      'pt-BR': 'Qual é o foco principal do escritório?'
    },
    help: {
      es: 'El posicionamiento define tu mercado objetivo y servicios core',
      'pt-BR': 'O posicionamento define seu mercado-alvo e serviços principais'
    },
    options: [
      { id: 'pymes', label: { es: 'PyMEs y emprendedores', 'pt-BR': 'PMEs e empreendedores' }, emoji: '🏪', impactScore: 7 },
      { id: 'corporativo', label: { es: 'Empresas medianas/grandes', 'pt-BR': 'Empresas médias/grandes' }, emoji: '🏢', impactScore: 9 },
      { id: 'auditoria', label: { es: 'Auditoría y assurance', 'pt-BR': 'Auditoria e assurance' }, emoji: '🔍', impactScore: 8 },
      { id: 'tributario', label: { es: 'Especialización tributaria', 'pt-BR': 'Especialização tributária' }, emoji: '📋', impactScore: 8 },
      { id: 'integral', label: { es: 'Servicios integrales full-service', 'pt-BR': 'Serviços integrais full-service' }, emoji: '🎯', impactScore: 10 }
    ]
  },
  {
    id: 'b2b_contable_identity_002',
    category: 'identity',
    type: 'number',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    required: true,
    title: {
      es: '¿Cuántos años de trayectoria tiene el estudio?',
      'pt-BR': 'Quantos anos de trajetória tem o escritório?'
    },
    min: 0,
    max: 100,
    unit: 'años'
  },
  {
    id: 'b2b_contable_identity_003',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Qué certificaciones o membresías tiene el estudio?',
      'pt-BR': 'Quais certificações ou associações o escritório possui?'
    },
    options: [
      { id: 'colegio', label: { es: 'Colegio de Contadores', 'pt-BR': 'Conselho Regional de Contabilidade' }, emoji: '🎓' },
      { id: 'internacional', label: { es: 'Red internacional (BDO, Grant Thornton, etc.)', 'pt-BR': 'Rede internacional (BDO, Grant Thornton, etc.)' }, emoji: '🌐' },
      { id: 'iso', label: { es: 'Certificación ISO', 'pt-BR': 'Certificação ISO' }, emoji: '✅' },
      { id: 'lavado', label: { es: 'Certificación anti-lavado', 'pt-BR': 'Certificação anti-lavagem' }, emoji: '🛡️' },
      { id: 'ninguna', label: { es: 'Sin certificaciones formales', 'pt-BR': 'Sem certificações formais' }, emoji: '📝' }
    ]
  },
  {
    id: 'b2b_contable_identity_004',
    category: 'identity',
    type: 'multi',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿En qué industrias se especializa el estudio?',
      'pt-BR': 'Em quais indústrias o escritório se especializa?'
    },
    options: [
      { id: 'comercio', label: { es: 'Comercio y retail', 'pt-BR': 'Comércio e varejo' }, emoji: '🛒' },
      { id: 'servicios', label: { es: 'Servicios profesionales', 'pt-BR': 'Serviços profissionais' }, emoji: '💼' },
      { id: 'manufactura', label: { es: 'Manufactura e industria', 'pt-BR': 'Manufatura e indústria' }, emoji: '🏭' },
      { id: 'construccion', label: { es: 'Construcción e inmobiliario', 'pt-BR': 'Construção e imobiliário' }, emoji: '🏗️' },
      { id: 'agro', label: { es: 'Agro y commodities', 'pt-BR': 'Agro e commodities' }, emoji: '🌾' },
      { id: 'tech', label: { es: 'Tecnología y startups', 'pt-BR': 'Tecnologia e startups' }, emoji: '💻' },
      { id: 'salud', label: { es: 'Salud y farma', 'pt-BR': 'Saúde e farma' }, emoji: '🏥' },
      { id: 'generalista', label: { es: 'Generalista multi-industria', 'pt-BR': 'Generalista multi-indústria' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_contable_identity_005',
    category: 'identity',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Cuál es el diferenciador principal frente a competidores?',
      'pt-BR': 'Qual é o diferencial principal frente aos concorrentes?'
    },
    options: [
      { id: 'tecnologia', label: { es: 'Tecnología y automatización', 'pt-BR': 'Tecnologia e automação' }, emoji: '🤖' },
      { id: 'cercania', label: { es: 'Cercanía y atención personalizada', 'pt-BR': 'Proximidade e atendimento personalizado' }, emoji: '🤝' },
      { id: 'expertise', label: { es: 'Expertise técnico superior', 'pt-BR': 'Expertise técnico superior' }, emoji: '🧠' },
      { id: 'precio', label: { es: 'Relación precio-calidad', 'pt-BR': 'Relação preço-qualidade' }, emoji: '💰' },
      { id: 'velocidad', label: { es: 'Velocidad de respuesta', 'pt-BR': 'Velocidade de resposta' }, emoji: '⚡' }
    ]
  },

  // ============================================
  // CATEGORÍA: MENU (Servicios y Precios)
  // ============================================
  {
    id: 'b2b_contable_menu_001',
    category: 'menu',
    type: 'multi',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué servicios contables ofrece el estudio?',
      'pt-BR': 'Quais serviços contábeis o escritório oferece?'
    },
    options: [
      { id: 'contabilidad', label: { es: 'Contabilidad general', 'pt-BR': 'Contabilidade geral' }, emoji: '📚' },
      { id: 'impuestos', label: { es: 'Liquidación de impuestos', 'pt-BR': 'Liquidação de impostos' }, emoji: '📋' },
      { id: 'sueldos', label: { es: 'Liquidación de sueldos', 'pt-BR': 'Folha de pagamento' }, emoji: '💵' },
      { id: 'auditoria', label: { es: 'Auditoría de estados contables', 'pt-BR': 'Auditoria de demonstrações' }, emoji: '🔍' },
      { id: 'planeamiento', label: { es: 'Planeamiento tributario', 'pt-BR': 'Planejamento tributário' }, emoji: '🎯' },
      { id: 'societario', label: { es: 'Asesoría societaria', 'pt-BR': 'Assessoria societária' }, emoji: '🏛️' },
      { id: 'costos', label: { es: 'Análisis de costos', 'pt-BR': 'Análise de custos' }, emoji: '📊' },
      { id: 'outsourcing', label: { es: 'Outsourcing administrativo', 'pt-BR': 'Outsourcing administrativo' }, emoji: '📦' }
    ]
  },
  {
    id: 'b2b_contable_menu_002',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el modelo de pricing predominante?',
      'pt-BR': 'Qual é o modelo de precificação predominante?'
    },
    options: [
      { id: 'mensual', label: { es: 'Fee mensual fijo', 'pt-BR': 'Fee mensal fixo' }, emoji: '📅' },
      { id: 'hora', label: { es: 'Por hora profesional', 'pt-BR': 'Por hora profissional' }, emoji: '⏱️' },
      { id: 'proyecto', label: { es: 'Por proyecto/entregable', 'pt-BR': 'Por projeto/entregável' }, emoji: '📋' },
      { id: 'mixto', label: { es: 'Mixto (fee + horas extras)', 'pt-BR': 'Misto (fee + horas extras)' }, emoji: '🔄' },
      { id: 'success', label: { es: 'Success fee en planeamiento', 'pt-BR': 'Success fee em planejamento' }, emoji: '🎯' }
    ]
  },
  {
    id: 'b2b_contable_menu_003',
    category: 'menu',
    type: 'single',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es el fee mensual promedio por cliente PyME?',
      'pt-BR': 'Qual é o fee mensal médio por cliente PME?'
    },
    options: [
      { id: 'bajo', label: { es: 'Menos de $500 USD', 'pt-BR': 'Menos de R$ 2.500' }, emoji: '💵' },
      { id: 'medio_bajo', label: { es: '$500-1.000 USD', 'pt-BR': 'R$ 2.500-5.000' }, emoji: '💰' },
      { id: 'medio', label: { es: '$1.000-2.500 USD', 'pt-BR': 'R$ 5.000-12.500' }, emoji: '💎' },
      { id: 'medio_alto', label: { es: '$2.500-5.000 USD', 'pt-BR': 'R$ 12.500-25.000' }, emoji: '🏆' },
      { id: 'alto', label: { es: 'Más de $5.000 USD', 'pt-BR': 'Mais de R$ 25.000' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_contable_menu_004',
    category: 'menu',
    type: 'number',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cuál es el valor hora promedio facturado?',
      'pt-BR': 'Qual é o valor hora médio faturado?'
    },
    min: 0,
    max: 1000,
    unit: 'USD/hora'
  },
  {
    id: 'b2b_contable_menu_005',
    category: 'menu',
    type: 'multi',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Qué servicios adicionales de valor agregado ofrece?',
      'pt-BR': 'Quais serviços adicionais de valor agregado oferece?'
    },
    options: [
      { id: 'dashboard', label: { es: 'Dashboards financieros', 'pt-BR': 'Dashboards financeiros' }, emoji: '📊' },
      { id: 'flujo', label: { es: 'Proyección de flujo de caja', 'pt-BR': 'Projeção de fluxo de caixa' }, emoji: '💧' },
      { id: 'benchmark', label: { es: 'Benchmark de industria', 'pt-BR': 'Benchmark de indústria' }, emoji: '📈' },
      { id: 'capacitacion', label: { es: 'Capacitación a clientes', 'pt-BR': 'Capacitação a clientes' }, emoji: '🎓' },
      { id: 'compliance', label: { es: 'Compliance y gobierno', 'pt-BR': 'Compliance e governança' }, emoji: '🛡️' },
      { id: 'ninguno', label: { es: 'Solo servicios tradicionales', 'pt-BR': 'Só serviços tradicionais' }, emoji: '📝' }
    ]
  },
  {
    id: 'b2b_contable_menu_006',
    category: 'menu',
    type: 'single',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cuánto representa la auditoría en la facturación total?',
      'pt-BR': 'Quanto representa a auditoria no faturamento total?'
    },
    options: [
      { id: 'nada', label: { es: 'No hacemos auditoría', 'pt-BR': 'Não fazemos auditoria' }, emoji: '❌' },
      { id: 'poco', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '📊' },
      { id: 'moderado', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📈' },
      { id: 'significativo', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💼' },
      { id: 'core', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🔍' }
    ]
  },

  // ============================================
  // CATEGORÍA: SALES (Ventas y Conversión)
  // ============================================
  {
    id: 'b2b_contable_sales_001',
    category: 'sales',
    type: 'single',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la principal fuente de nuevos clientes?',
      'pt-BR': 'Qual é a principal fonte de novos clientes?'
    },
    options: [
      { id: 'referidos', label: { es: 'Referidos de clientes actuales', 'pt-BR': 'Indicações de clientes atuais' }, emoji: '🤝' },
      { id: 'profesionales', label: { es: 'Red de profesionales (abogados, etc.)', 'pt-BR': 'Rede de profissionais (advogados, etc.)' }, emoji: '👔' },
      { id: 'digital', label: { es: 'Marketing digital/web', 'pt-BR': 'Marketing digital/web' }, emoji: '💻' },
      { id: 'eventos', label: { es: 'Eventos y networking', 'pt-BR': 'Eventos e networking' }, emoji: '🎤' },
      { id: 'proactivo', label: { es: 'Prospección proactiva', 'pt-BR': 'Prospecção proativa' }, emoji: '📞' }
    ]
  },
  {
    id: 'b2b_contable_sales_002',
    category: 'sales',
    type: 'number',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos clientes nuevos incorporan por mes en promedio?',
      'pt-BR': 'Quantos clientes novos incorporam por mês em média?'
    },
    min: 0,
    max: 100,
    unit: 'clientes/mes'
  },
  {
    id: 'b2b_contable_sales_003',
    category: 'sales',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Cuál es la tasa de conversión de propuestas a clientes?',
      'pt-BR': 'Qual é a taxa de conversão de propostas a clientes?'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_contable_sales_004',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo toma cerrar un nuevo cliente en promedio?',
      'pt-BR': 'Quanto tempo leva para fechar um novo cliente em média?'
    },
    options: [
      { id: 'inmediato', label: { es: 'Menos de 1 semana', 'pt-BR': 'Menos de 1 semana' }, emoji: '⚡' },
      { id: 'rapido', label: { es: '1-2 semanas', 'pt-BR': '1-2 semanas' }, emoji: '🏃' },
      { id: 'normal', label: { es: '2-4 semanas', 'pt-BR': '2-4 semanas' }, emoji: '📅' },
      { id: 'largo', label: { es: '1-2 meses', 'pt-BR': '1-2 meses' }, emoji: '📆' },
      { id: 'muy_largo', label: { es: 'Más de 2 meses', 'pt-BR': 'Mais de 2 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'b2b_contable_sales_005',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Quién lidera el proceso comercial?',
      'pt-BR': 'Quem lidera o processo comercial?'
    },
    options: [
      { id: 'socios', label: { es: 'Socios exclusivamente', 'pt-BR': 'Sócios exclusivamente' }, emoji: '👔' },
      { id: 'gerentes', label: { es: 'Gerentes con autonomía', 'pt-BR': 'Gerentes com autonomia' }, emoji: '👨‍💼' },
      { id: 'equipo', label: { es: 'Equipo comercial dedicado', 'pt-BR': 'Equipe comercial dedicada' }, emoji: '🎯' },
      { id: 'mixto', label: { es: 'Mixto según tamaño de cliente', 'pt-BR': 'Misto conforme tamanho do cliente' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_contable_sales_006',
    category: 'sales',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Tienen un proceso de diagnóstico inicial estandarizado?',
      'pt-BR': 'Têm um processo de diagnóstico inicial padronizado?'
    },
    options: [
      { id: 'completo', label: { es: 'Sí, muy estructurado', 'pt-BR': 'Sim, muito estruturado' }, emoji: '✅' },
      { id: 'parcial', label: { es: 'Parcialmente definido', 'pt-BR': 'Parcialmente definido' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Informal, depende del caso', 'pt-BR': 'Informal, depende do caso' }, emoji: '💬' },
      { id: 'no', label: { es: 'No tenemos diagnóstico', 'pt-BR': 'Não temos diagnóstico' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: FINANCE (Finanzas y Márgenes)
  // ============================================
  {
    id: 'b2b_contable_finance_001',
    category: 'finance',
    type: 'single',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la facturación mensual promedio del estudio?',
      'pt-BR': 'Qual é o faturamento mensal médio do escritório?'
    },
    options: [
      { id: 'muy_chico', label: { es: 'Menos de $10k USD', 'pt-BR': 'Menos de R$ 50k' }, emoji: '🌱' },
      { id: 'chico', label: { es: '$10k-30k USD', 'pt-BR': 'R$ 50k-150k' }, emoji: '📈' },
      { id: 'mediano', label: { es: '$30k-80k USD', 'pt-BR': 'R$ 150k-400k' }, emoji: '💼' },
      { id: 'grande', label: { es: '$80k-200k USD', 'pt-BR': 'R$ 400k-1M' }, emoji: '🏆' },
      { id: 'muy_grande', label: { es: 'Más de $200k USD', 'pt-BR': 'Mais de R$ 1M' }, emoji: '👑' }
    ]
  },
  {
    id: 'b2b_contable_finance_002',
    category: 'finance',
    type: 'slider',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el margen operativo del estudio?',
      'pt-BR': 'Qual é a margem operacional do escritório?'
    },
    help: {
      es: 'EBITDA / Facturación',
      'pt-BR': 'EBITDA / Faturamento'
    },
    min: 0,
    max: 60,
    unit: '%'
  },
  {
    id: 'b2b_contable_finance_003',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuál es el porcentaje de incobrables/morosidad?',
      'pt-BR': 'Qual é a porcentagem de inadimplência?'
    },
    options: [
      { id: 'excelente', label: { es: 'Menos del 2%', 'pt-BR': 'Menos de 2%' }, emoji: '🌟' },
      { id: 'bueno', label: { es: '2-5%', 'pt-BR': '2-5%' }, emoji: '✅' },
      { id: 'moderado', label: { es: '5-10%', 'pt-BR': '5-10%' }, emoji: '⚠️' },
      { id: 'alto', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '🔴' },
      { id: 'critico', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, emoji: '🚨' }
    ]
  },
  {
    id: 'b2b_contable_finance_004',
    category: 'finance',
    type: 'slider',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de la facturación representa sueldos?',
      'pt-BR': 'Que porcentagem do faturamento representa salários?'
    },
    min: 20,
    max: 80,
    unit: '%'
  },
  {
    id: 'b2b_contable_finance_005',
    category: 'finance',
    type: 'single',
    mode: 'complete',
    dimension: 'finances',
    weight: 6,
    title: {
      es: '¿Cómo es el flujo de caja del estudio?',
      'pt-BR': 'Como é o fluxo de caixa do escritório?'
    },
    options: [
      { id: 'excelente', label: { es: 'Siempre positivo, con reservas', 'pt-BR': 'Sempre positivo, com reservas' }, emoji: '💎' },
      { id: 'bueno', label: { es: 'Generalmente positivo', 'pt-BR': 'Geralmente positivo' }, emoji: '✅' },
      { id: 'ajustado', label: { es: 'Ajustado pero manejable', 'pt-BR': 'Ajustado mas manejável' }, emoji: '⚖️' },
      { id: 'dificil', label: { es: 'Frecuentemente negativo', 'pt-BR': 'Frequentemente negativo' }, emoji: '⚠️' },
      { id: 'critico', label: { es: 'Problemas serios de liquidez', 'pt-BR': 'Problemas sérios de liquidez' }, emoji: '🚨' }
    ]
  },
  {
    id: 'b2b_contable_finance_006',
    category: 'finance',
    type: 'number',
    mode: 'complete',
    dimension: 'profitability',
    weight: 5,
    title: {
      es: '¿Cuál es la facturación promedio por empleado (anual)?',
      'pt-BR': 'Qual é o faturamento médio por funcionário (anual)?'
    },
    min: 0,
    max: 500000,
    unit: 'USD'
  },

  // ============================================
  // CATEGORÍA: OPERATION (Operaciones)
  // ============================================
  {
    id: 'b2b_contable_operation_001',
    category: 'operation',
    type: 'single',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué software contable utilizan internamente?',
      'pt-BR': 'Qual software contábil utilizam internamente?'
    },
    options: [
      { id: 'tradicional', label: { es: 'Sistema tradicional local', 'pt-BR': 'Sistema tradicional local' }, emoji: '💻' },
      { id: 'cloud_local', label: { es: 'ERP cloud local (Tango, Bejerman, etc.)', 'pt-BR': 'ERP cloud local (Omie, Bling, etc.)' }, emoji: '☁️' },
      { id: 'cloud_inter', label: { es: 'Cloud internacional (Xero, QBO)', 'pt-BR': 'Cloud internacional (Xero, QBO)' }, emoji: '🌐' },
      { id: 'custom', label: { es: 'Desarrollo propio', 'pt-BR': 'Desenvolvimento próprio' }, emoji: '🔧' },
      { id: 'mixto', label: { es: 'Múltiples según cliente', 'pt-BR': 'Múltiplos conforme cliente' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_contable_operation_002',
    category: 'operation',
    type: 'number',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cuántos clientes activos tiene el estudio?',
      'pt-BR': 'Quantos clientes ativos tem o escritório?'
    },
    min: 1,
    max: 5000,
    unit: 'clientes'
  },
  {
    id: 'b2b_contable_operation_003',
    category: 'operation',
    type: 'slider',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Qué porcentaje del trabajo está automatizado?',
      'pt-BR': 'Qual porcentagem do trabalho está automatizado?'
    },
    help: {
      es: 'Cargas automáticas, conciliaciones, reportes, etc.',
      'pt-BR': 'Cargas automáticas, conciliações, relatórios, etc.'
    },
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_contable_operation_004',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cómo gestionan la documentación de clientes?',
      'pt-BR': 'Como gerenciam a documentação de clientes?'
    },
    options: [
      { id: 'papel', label: { es: 'Mayormente en papel', 'pt-BR': 'Maioria em papel' }, emoji: '📄' },
      { id: 'local', label: { es: 'Digital local (carpetas)', 'pt-BR': 'Digital local (pastas)' }, emoji: '📁' },
      { id: 'cloud', label: { es: 'Cloud básico (Drive, Dropbox)', 'pt-BR': 'Cloud básico (Drive, Dropbox)' }, emoji: '☁️' },
      { id: 'gestion', label: { es: 'Sistema de gestión documental', 'pt-BR': 'Sistema de gestão documental' }, emoji: '🗂️' },
      { id: 'portal', label: { es: 'Portal de cliente integrado', 'pt-BR': 'Portal do cliente integrado' }, emoji: '🌐' }
    ]
  },
  {
    id: 'b2b_contable_operation_005',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tienen procesos de control de calidad formalizados?',
      'pt-BR': 'Têm processos de controle de qualidade formalizados?'
    },
    options: [
      { id: 'robusto', label: { es: 'Sí, con checklists y revisión de pares', 'pt-BR': 'Sim, com checklists e revisão de pares' }, emoji: '✅' },
      { id: 'parcial', label: { es: 'Parcial, solo para auditoría', 'pt-BR': 'Parcial, só para auditoria' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Informal, depende del profesional', 'pt-BR': 'Informal, depende do profissional' }, emoji: '👤' },
      { id: 'no', label: { es: 'No tenemos procesos formales', 'pt-BR': 'Não temos processos formais' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_operation_006',
    category: 'operation',
    type: 'number',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Cuántas horas promedio dedican por cliente/mes?',
      'pt-BR': 'Quantas horas médias dedicam por cliente/mês?'
    },
    min: 1,
    max: 200,
    unit: 'horas'
  },
  {
    id: 'b2b_contable_operation_007',
    category: 'operation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Cómo manejan los picos de trabajo (cierres, vencimientos)?',
      'pt-BR': 'Como lidam com os picos de trabalho (fechamentos, vencimentos)?'
    },
    options: [
      { id: 'planificado', label: { es: 'Planificación anticipada y horas extra', 'pt-BR': 'Planejamento antecipado e horas extras' }, emoji: '📅' },
      { id: 'freelance', label: { es: 'Freelancers o tercerización', 'pt-BR': 'Freelancers ou terceirização' }, emoji: '👥' },
      { id: 'estres', label: { es: 'Estrés y trabajo intensivo', 'pt-BR': 'Estresse e trabalho intensivo' }, emoji: '😰' },
      { id: 'distribuido', label: { es: 'Trabajo distribuido todo el año', 'pt-BR': 'Trabalho distribuído todo o ano' }, emoji: '⚖️' }
    ]
  },

  // ============================================
  // CATEGORÍA: TEAM (Equipo)
  // ============================================
  {
    id: 'b2b_contable_team_001',
    category: 'team',
    type: 'number',
    mode: 'both',
    dimension: 'team',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántas personas trabajan en el estudio?',
      'pt-BR': 'Quantas pessoas trabalham no escritório?'
    },
    min: 1,
    max: 500,
    unit: 'personas'
  },
  {
    id: 'b2b_contable_team_002',
    category: 'team',
    type: 'single',
    mode: 'both',
    dimension: 'team',
    weight: 9,
    title: {
      es: '¿Cuál es la estructura del equipo?',
      'pt-BR': 'Qual é a estrutura da equipe?'
    },
    options: [
      { id: 'plana', label: { es: 'Plana (socio + colaboradores)', 'pt-BR': 'Plana (sócio + colaboradores)' }, emoji: '📊' },
      { id: 'piramidal', label: { es: 'Piramidal tradicional', 'pt-BR': 'Piramidal tradicional' }, emoji: '🔺' },
      { id: 'pods', label: { es: 'Equipos por cliente/industria', 'pt-BR': 'Equipes por cliente/indústria' }, emoji: '👥' },
      { id: 'hibrida', label: { es: 'Híbrida según servicio', 'pt-BR': 'Híbrida conforme serviço' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_contable_team_003',
    category: 'team',
    type: 'number',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántos socios/directores tiene el estudio?',
      'pt-BR': 'Quantos sócios/diretores tem o escritório?'
    },
    min: 1,
    max: 50,
    unit: 'socios'
  },
  {
    id: 'b2b_contable_team_004',
    category: 'team',
    type: 'slider',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cuál es la rotación anual de personal?',
      'pt-BR': 'Qual é a rotação anual de pessoal?'
    },
    min: 0,
    max: 50,
    unit: '%'
  },
  {
    id: 'b2b_contable_team_005',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cómo es la modalidad de trabajo predominante?',
      'pt-BR': 'Como é a modalidade de trabalho predominante?'
    },
    options: [
      { id: 'presencial', label: { es: '100% presencial', 'pt-BR': '100% presencial' }, emoji: '🏢' },
      { id: 'hibrido', label: { es: 'Híbrido (2-3 días oficina)', 'pt-BR': 'Híbrido (2-3 dias escritório)' }, emoji: '🔄' },
      { id: 'remoto_parcial', label: { es: 'Mayormente remoto', 'pt-BR': 'Maioria remoto' }, emoji: '🏠' },
      { id: 'remoto_total', label: { es: '100% remoto', 'pt-BR': '100% remoto' }, emoji: '💻' }
    ]
  },
  {
    id: 'b2b_contable_team_006',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Tienen programa de capacitación continua?',
      'pt-BR': 'Têm programa de capacitação contínua?'
    },
    options: [
      { id: 'robusto', label: { es: 'Sí, con presupuesto y plan anual', 'pt-BR': 'Sim, com orçamento e plano anual' }, emoji: '🎓' },
      { id: 'parcial', label: { es: 'Esporádico según necesidad', 'pt-BR': 'Esporádico conforme necessidade' }, emoji: '📚' },
      { id: 'externo', label: { es: 'Solo cursos externos pagados', 'pt-BR': 'Só cursos externos pagos' }, emoji: '💼' },
      { id: 'no', label: { es: 'No tenemos programa', 'pt-BR': 'Não temos programa' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_team_007',
    category: 'team',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cuál es el mayor desafío con el equipo actualmente?',
      'pt-BR': 'Qual é o maior desafio com a equipe atualmente?'
    },
    options: [
      { id: 'conseguir', label: { es: 'Conseguir talento calificado', 'pt-BR': 'Conseguir talento qualificado' }, emoji: '🔍' },
      { id: 'retener', label: { es: 'Retener al equipo', 'pt-BR': 'Reter a equipe' }, emoji: '🤝' },
      { id: 'capacitar', label: { es: 'Actualizar conocimientos', 'pt-BR': 'Atualizar conhecimentos' }, emoji: '📚' },
      { id: 'productividad', label: { es: 'Mejorar productividad', 'pt-BR': 'Melhorar produtividade' }, emoji: '📈' },
      { id: 'ninguno', label: { es: 'Equipo estable y capaz', 'pt-BR': 'Equipe estável e capaz' }, emoji: '✅' }
    ]
  },

  // ============================================
  // CATEGORÍA: MARKETING (Marketing y Adquisición)
  // ============================================
  {
    id: 'b2b_contable_marketing_001',
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
      { id: 'minimo', label: { es: 'Menos de $500 USD', 'pt-BR': 'Menos de R$ 2.500' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$500-2.000 USD', 'pt-BR': 'R$ 2.500-10.000' }, emoji: '📊' },
      { id: 'significativo', label: { es: '$2.000-5.000 USD', 'pt-BR': 'R$ 10.000-25.000' }, emoji: '📈' },
      { id: 'alto', label: { es: 'Más de $5.000 USD', 'pt-BR': 'Mais de R$ 25.000' }, emoji: '🚀' }
    ]
  },
  {
    id: 'b2b_contable_marketing_002',
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
      { id: 'google', label: { es: 'Google Ads', 'pt-BR': 'Google Ads' }, emoji: '🔍' },
      { id: 'contenido', label: { es: 'Blog/Newsletter', 'pt-BR': 'Blog/Newsletter' }, emoji: '📝' },
      { id: 'eventos', label: { es: 'Eventos y webinars', 'pt-BR': 'Eventos e webinars' }, emoji: '🎤' },
      { id: 'prensa', label: { es: 'Prensa y PR', 'pt-BR': 'Imprensa e PR' }, emoji: '📰' },
      { id: 'ninguno', label: { es: 'Sin marketing activo', 'pt-BR': 'Sem marketing ativo' }, emoji: '🚫' }
    ]
  },
  {
    id: 'b2b_contable_marketing_003',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tienen sitio web actualizado?',
      'pt-BR': 'Têm site atualizado?'
    },
    options: [
      { id: 'moderno', label: { es: 'Sí, moderno con SEO y contenido', 'pt-BR': 'Sim, moderno com SEO e conteúdo' }, emoji: '🌐' },
      { id: 'basico', label: { es: 'Básico pero funcional', 'pt-BR': 'Básico mas funcional' }, emoji: '📄' },
      { id: 'desactualizado', label: { es: 'Desactualizado', 'pt-BR': 'Desatualizado' }, emoji: '⏳' },
      { id: 'no', label: { es: 'No tenemos sitio web', 'pt-BR': 'Não temos site' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_marketing_004',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Generan contenido de valor regularmente?',
      'pt-BR': 'Geram conteúdo de valor regularmente?'
    },
    options: [
      { id: 'activo', label: { es: 'Sí, semanalmente', 'pt-BR': 'Sim, semanalmente' }, emoji: '📝' },
      { id: 'regular', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '📅' },
      { id: 'esporadico', label: { es: 'Esporádicamente', 'pt-BR': 'Esporadicamente' }, emoji: '📆' },
      { id: 'no', label: { es: 'No generamos contenido', 'pt-BR': 'Não geramos conteúdo' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_marketing_005',
    category: 'marketing',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Participan en rankings o directorios de la industria?',
      'pt-BR': 'Participam em rankings ou diretórios da indústria?'
    },
    options: [
      { id: 'top', label: { es: 'Sí, aparecemos en los principales', 'pt-BR': 'Sim, aparecemos nos principais' }, emoji: '🏆' },
      { id: 'algunos', label: { es: 'En algunos rankings locales', 'pt-BR': 'Em alguns rankings locais' }, emoji: '📊' },
      { id: 'intentando', label: { es: 'Estamos trabajando en eso', 'pt-BR': 'Estamos trabalhando nisso' }, emoji: '🎯' },
      { id: 'no', label: { es: 'No participamos', 'pt-BR': 'Não participamos' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: REPUTATION (Retención y CX)
  // ============================================
  {
    id: 'b2b_contable_reputation_001',
    category: 'reputation',
    type: 'slider',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es la tasa de retención anual de clientes?',
      'pt-BR': 'Qual é a taxa de retenção anual de clientes?'
    },
    min: 50,
    max: 100,
    unit: '%'
  },
  {
    id: 'b2b_contable_reputation_002',
    category: 'reputation',
    type: 'number',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Cuál es la antigüedad promedio de los clientes?',
      'pt-BR': 'Qual é a antiguidade média dos clientes?'
    },
    min: 0,
    max: 50,
    unit: 'años'
  },
  {
    id: 'b2b_contable_reputation_003',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Miden la satisfacción de clientes formalmente?',
      'pt-BR': 'Medem a satisfação de clientes formalmente?'
    },
    options: [
      { id: 'nps', label: { es: 'Sí, con NPS u otra métrica', 'pt-BR': 'Sim, com NPS ou outra métrica' }, emoji: '📊' },
      { id: 'encuestas', label: { es: 'Encuestas esporádicas', 'pt-BR': 'Pesquisas esporádicas' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Solo feedback informal', 'pt-BR': 'Só feedback informal' }, emoji: '💬' },
      { id: 'no', label: { es: 'No medimos satisfacción', 'pt-BR': 'Não medimos satisfação' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_reputation_004',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Cuál es el motivo principal de pérdida de clientes?',
      'pt-BR': 'Qual é o motivo principal de perda de clientes?'
    },
    options: [
      { id: 'precio', label: { es: 'Precio/competencia más barata', 'pt-BR': 'Preço/concorrência mais barata' }, emoji: '💰' },
      { id: 'servicio', label: { es: 'Insatisfacción con el servicio', 'pt-BR': 'Insatisfação com o serviço' }, emoji: '😔' },
      { id: 'cierre', label: { es: 'Cierre/venta del cliente', 'pt-BR': 'Fechamento/venda do cliente' }, emoji: '🚪' },
      { id: 'internaliza', label: { es: 'Cliente internaliza', 'pt-BR': 'Cliente internaliza' }, emoji: '🏠' },
      { id: 'perdemos_poco', label: { es: 'Perdemos muy pocos clientes', 'pt-BR': 'Perdemos muito poucos clientes' }, emoji: '✅' }
    ]
  },
  {
    id: 'b2b_contable_reputation_005',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tienen un proceso de onboarding de clientes estructurado?',
      'pt-BR': 'Têm um processo de onboarding de clientes estruturado?'
    },
    options: [
      { id: 'excelente', label: { es: 'Sí, muy estructurado con checklist', 'pt-BR': 'Sim, muito estruturado com checklist' }, emoji: '✅' },
      { id: 'parcial', label: { es: 'Parcialmente definido', 'pt-BR': 'Parcialmente definido' }, emoji: '📋' },
      { id: 'informal', label: { es: 'Informal, depende del caso', 'pt-BR': 'Informal, depende do caso' }, emoji: '💬' },
      { id: 'no', label: { es: 'No tenemos proceso', 'pt-BR': 'Não temos processo' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_reputation_006',
    category: 'reputation',
    type: 'single',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Realizan reuniones periódicas de revisión con clientes?',
      'pt-BR': 'Realizam reuniões periódicas de revisão com clientes?'
    },
    options: [
      { id: 'trimestral', label: { es: 'Sí, al menos trimestralmente', 'pt-BR': 'Sim, pelo menos trimestralmente' }, emoji: '📅' },
      { id: 'semestral', label: { es: 'Semestralmente', 'pt-BR': 'Semestralmente' }, emoji: '📆' },
      { id: 'anual', label: { es: 'Solo anualmente', 'pt-BR': 'Só anualmente' }, emoji: '🗓️' },
      { id: 'demanda', label: { es: 'Solo cuando hay problemas', 'pt-BR': 'Só quando há problemas' }, emoji: '⚠️' },
      { id: 'no', label: { es: 'No hacemos reuniones de revisión', 'pt-BR': 'Não fazemos reuniões de revisão' }, emoji: '❌' }
    ]
  },

  // ============================================
  // CATEGORÍA: GOALS (Objetivos del Dueño)
  // ============================================
  {
    id: 'b2b_contable_goals_001',
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
      { id: 'crecer', label: { es: 'Crecer en facturación y clientes', 'pt-BR': 'Crescer em faturamento e clientes' }, emoji: '📈' },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, emoji: '💰' },
      { id: 'eficiencia', label: { es: 'Automatizar y eficientizar', 'pt-BR': 'Automatizar e eficientizar' }, emoji: '⚙️' },
      { id: 'equipo', label: { es: 'Fortalecer el equipo', 'pt-BR': 'Fortalecer a equipe' }, emoji: '👥' },
      { id: 'posicionamiento', label: { es: 'Mejorar posicionamiento/marca', 'pt-BR': 'Melhorar posicionamento/marca' }, emoji: '🏆' },
      { id: 'sucesion', label: { es: 'Preparar sucesión/venta', 'pt-BR': 'Preparar sucessão/venda' }, emoji: '🔄' }
    ]
  },
  {
    id: 'b2b_contable_goals_002',
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
    id: 'b2b_contable_goals_003',
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
      { id: 'advisory', label: { es: 'Consultoría financiera/advisory', 'pt-BR': 'Consultoria financeira/advisory' }, emoji: '🎯' },
      { id: 'tech', label: { es: 'Implementación de tecnología', 'pt-BR': 'Implementação de tecnologia' }, emoji: '💻' },
      { id: 'esg', label: { es: 'Reportes ESG/Sustentabilidad', 'pt-BR': 'Relatórios ESG/Sustentabilidade' }, emoji: '🌱' },
      { id: 'transfer', label: { es: 'Precios de transferencia', 'pt-BR': 'Preços de transferência' }, emoji: '🌐' },
      { id: 'forensic', label: { es: 'Forensic/Fraude', 'pt-BR': 'Forensic/Fraude' }, emoji: '🔍' },
      { id: 'ninguno', label: { es: 'Mantener servicios actuales', 'pt-BR': 'Manter serviços atuais' }, emoji: '✅' }
    ]
  },
  {
    id: 'b2b_contable_goals_004',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Planean inversiones tecnológicas importantes?',
      'pt-BR': 'Planejam investimentos tecnológicos importantes?'
    },
    options: [
      { id: 'grande', label: { es: 'Sí, transformación digital completa', 'pt-BR': 'Sim, transformação digital completa' }, emoji: '🚀' },
      { id: 'moderada', label: { es: 'Inversión moderada en herramientas', 'pt-BR': 'Investimento moderado em ferramentas' }, emoji: '💻' },
      { id: 'minima', label: { es: 'Solo actualizaciones mínimas', 'pt-BR': 'Só atualizações mínimas' }, emoji: '🔧' },
      { id: 'no', label: { es: 'No tenemos planes de inversión', 'pt-BR': 'Não temos planos de investimento' }, emoji: '❌' }
    ]
  },
  {
    id: 'b2b_contable_goals_005',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cuántas personas planean incorporar este año?',
      'pt-BR': 'Quantas pessoas planejam incorporar este ano?'
    },
    options: [
      { id: 'ninguna', label: { es: 'Ninguna, mantener equipo', 'pt-BR': 'Nenhuma, manter equipe' }, emoji: '✅' },
      { id: 'pocas', label: { es: '1-3 personas', 'pt-BR': '1-3 pessoas' }, emoji: '👤' },
      { id: 'moderadas', label: { es: '4-10 personas', 'pt-BR': '4-10 pessoas' }, emoji: '👥' },
      { id: 'muchas', label: { es: 'Más de 10 personas', 'pt-BR': 'Mais de 10 pessoas' }, emoji: '🏢' },
      { id: 'reducir', label: { es: 'Planificamos reducir', 'pt-BR': 'Planejamos reduzir' }, emoji: '📉' }
    ]
  },
  {
    id: 'b2b_contable_goals_006',
    category: 'goals',
    type: 'single',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Tienen planes de expansión geográfica?',
      'pt-BR': 'Têm planos de expansão geográfica?'
    },
    options: [
      { id: 'internacional', label: { es: 'Sí, a nivel internacional', 'pt-BR': 'Sim, a nível internacional' }, emoji: '🌎' },
      { id: 'nacional', label: { es: 'Sí, a otras ciudades/regiones', 'pt-BR': 'Sim, a outras cidades/regiões' }, emoji: '🗺️' },
      { id: 'local', label: { es: 'Solo crecimiento local', 'pt-BR': 'Só crescimento local' }, emoji: '📍' },
      { id: 'no', label: { es: 'No tenemos planes de expansión', 'pt-BR': 'Não temos planos de expansão' }, emoji: '🏠' }
    ]
  },
  {
    id: 'b2b_contable_goals_007',
    category: 'goals',
    type: 'text',
    mode: 'complete',
    dimension: 'growth',
    weight: 4,
    title: {
      es: '¿Cuál es el mayor desafío que enfrentan actualmente?',
      'pt-BR': 'Qual é o maior desafio que enfrentam atualmente?'
    },
    help: {
      es: 'Describe brevemente el principal obstáculo para el crecimiento',
      'pt-BR': 'Descreva brevemente o principal obstáculo para o crescimento'
    }
  }
];
