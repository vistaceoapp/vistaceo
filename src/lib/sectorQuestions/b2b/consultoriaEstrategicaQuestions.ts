// Consultoría Estratégica B2B Questions
// 68 preguntas hiper-personalizadas
import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const consultoriaEstrategicaQuestions: VistaSetupQuestion[] = [
  // ========== IDENTIDAD (8) ==========
  {
    id: 'B2B_CE_IDENTITY_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿En qué tipo de consultoría estratégica te especializás?',
      'pt-BR': 'Em que tipo de consultoria estratégica você se especializa?'
    },
    type: 'multi',
    options: [
      { id: 'estrategia_corporativa', label: { es: 'Estrategia corporativa', 'pt-BR': 'Estratégia corporativa' }, emoji: '🏢' },
      { id: 'transformacion', label: { es: 'Transformación digital', 'pt-BR': 'Transformação digital' }, emoji: '💻' },
      { id: 'growth', label: { es: 'Growth / crecimiento', 'pt-BR': 'Growth / crescimento' }, emoji: '📈' },
      { id: 'operaciones', label: { es: 'Optimización de operaciones', 'pt-BR': 'Otimização de operações' }, emoji: '⚙️' },
      { id: 'ma', label: { es: 'M&A / Due diligence', 'pt-BR': 'M&A / Due diligence' }, emoji: '🤝' },
      { id: 'innovacion', label: { es: 'Innovación y nuevos negocios', 'pt-BR': 'Inovação e novos negócios' }, emoji: '💡' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_02',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    required: true,
    title: {
      es: '¿Cuántos años de experiencia tenés en consultoría?',
      'pt-BR': 'Quantos anos de experiência você tem em consultoria?'
    },
    type: 'single',
    options: [
      { id: 'menos_3', label: { es: 'Menos de 3 años', 'pt-BR': 'Menos de 3 anos' }, emoji: '🌱' },
      { id: '3_7', label: { es: '3-7 años', 'pt-BR': '3-7 anos' }, emoji: '📈' },
      { id: '7_15', label: { es: '7-15 años', 'pt-BR': '7-15 anos' }, emoji: '⭐' },
      { id: 'mas_15', label: { es: 'Más de 15 años', 'pt-BR': 'Mais de 15 anos' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿En qué industrias tenés mayor experiencia?',
      'pt-BR': 'Em quais indústrias você tem mais experiência?'
    },
    type: 'multi',
    options: [
      { id: 'banca', label: { es: 'Banca y finanzas', 'pt-BR': 'Banco e finanças' }, emoji: '🏦' },
      { id: 'tech', label: { es: 'Tecnología', 'pt-BR': 'Tecnologia' }, emoji: '💻' },
      { id: 'retail', label: { es: 'Retail y consumo', 'pt-BR': 'Varejo e consumo' }, emoji: '🛒' },
      { id: 'salud', label: { es: 'Salud', 'pt-BR': 'Saúde' }, emoji: '🏥' },
      { id: 'manufactura', label: { es: 'Manufactura', 'pt-BR': 'Manufatura' }, emoji: '🏭' },
      { id: 'energia', label: { es: 'Energía', 'pt-BR': 'Energia' }, emoji: '⚡' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_04',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés background en alguna Big 4 o consultora top?',
      'pt-BR': 'Você tem experiência em alguma Big 4 ou consultoria top?'
    },
    type: 'single',
    options: [
      { id: 'big4', label: { es: 'Sí, Big 4 (Deloitte, PwC, EY, KPMG)', 'pt-BR': 'Sim, Big 4' }, emoji: '🏢' },
      { id: 'mbb', label: { es: 'Sí, MBB (McKinsey, BCG, Bain)', 'pt-BR': 'Sim, MBB' }, emoji: '👑' },
      { id: 'otra', label: { es: 'Otra consultora reconocida', 'pt-BR': 'Outra consultoria reconhecida' }, emoji: '⭐' },
      { id: 'no', label: { es: 'No, formación independiente', 'pt-BR': 'Não, formação independente' }, emoji: '🚀' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_05',
    category: 'identity',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Cómo es tu estructura actual?',
      'pt-BR': 'Como é sua estrutura atual?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Consultor independiente', 'pt-BR': 'Consultor independente' }, emoji: '1️⃣' },
      { id: 'boutique', label: { es: 'Boutique (2-10 personas)', 'pt-BR': 'Boutique (2-10 pessoas)' }, emoji: '👥' },
      { id: 'mediana', label: { es: 'Firma mediana (10-50)', 'pt-BR': 'Firma média (10-50)' }, emoji: '🏢' },
      { id: 'grande', label: { es: 'Firma grande (+50)', 'pt-BR': 'Firma grande (+50)' }, emoji: '🏛️' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_06',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Trabajás con clientes internacionales?',
      'pt-BR': 'Você trabalha com clientes internacionais?'
    },
    type: 'single',
    options: [
      { id: 'solo_local', label: { es: 'Solo mercado local', 'pt-BR': 'Só mercado local' }, emoji: '🏠' },
      { id: 'latam', label: { es: 'LATAM', 'pt-BR': 'LATAM' }, emoji: '🌎' },
      { id: 'global', label: { es: 'Global', 'pt-BR': 'Global' }, emoji: '🌍' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_07',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tenés metodologías propias registradas?',
      'pt-BR': 'Você tem metodologias próprias registradas?'
    },
    type: 'single',
    options: [
      { id: 'si', label: { es: 'Sí, frameworks propios', 'pt-BR': 'Sim, frameworks próprios' }, emoji: '📚' },
      { id: 'en_desarrollo', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '🔧' },
      { id: 'no', label: { es: 'No, uso metodologías estándar', 'pt-BR': 'Não, uso metodologias padrão' }, emoji: '📋' }
    ]
  },
  {
    id: 'B2B_CE_IDENTITY_08',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Tenés certificaciones relevantes?',
      'pt-BR': 'Você tem certificações relevantes?'
    },
    type: 'multi',
    options: [
      { id: 'mba', label: { es: 'MBA de escuela top', 'pt-BR': 'MBA de escola top' }, emoji: '🎓' },
      { id: 'pmp', label: { es: 'PMP / Scrum', 'pt-BR': 'PMP / Scrum' }, emoji: '📋' },
      { id: 'lean', label: { es: 'Lean Six Sigma', 'pt-BR': 'Lean Six Sigma' }, emoji: '⚡' },
      { id: 'otras', label: { es: 'Otras certificaciones', 'pt-BR': 'Outras certificações' }, emoji: '📜' }
    ]
  },

  // ========== OFERTA Y PRECIOS (8) ==========
  {
    id: 'B2B_CE_OFFER_01',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu modelo de pricing principal?',
      'pt-BR': 'Qual é seu modelo de pricing principal?'
    },
    type: 'single',
    options: [
      { id: 'proyecto', label: { es: 'Por proyecto (scope fijo)', 'pt-BR': 'Por projeto (escopo fixo)' }, emoji: '📦' },
      { id: 'retainer', label: { es: 'Retainer mensual', 'pt-BR': 'Retainer mensal' }, emoji: '📅' },
      { id: 'hora', label: { es: 'Por hora/día', 'pt-BR': 'Por hora/dia' }, emoji: '⏱️' },
      { id: 'success_fee', label: { es: 'Success fee / variable', 'pt-BR': 'Success fee / variável' }, emoji: '🎯' },
      { id: 'mixto', label: { es: 'Mixto', 'pt-BR': 'Misto' }, emoji: '🔀' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_02',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu tarifa diaria promedio?',
      'pt-BR': 'Qual é sua tarifa diária média?'
    },
    type: 'single',
    options: [
      { id: 'menos_500', label: { es: 'Menos de $500 USD', 'pt-BR': 'Menos de $500 USD' }, emoji: '💵' },
      { id: '500_1000', label: { es: '$500 - $1,000 USD', 'pt-BR': '$500 - $1.000 USD' }, emoji: '💰' },
      { id: '1000_2000', label: { es: '$1,000 - $2,000 USD', 'pt-BR': '$1.000 - $2.000 USD' }, emoji: '💎' },
      { id: 'mas_2000', label: { es: 'Más de $2,000 USD', 'pt-BR': 'Mais de $2.000 USD' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_03',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Cuál es el valor promedio de tus proyectos?',
      'pt-BR': 'Qual é o valor médio dos seus projetos?'
    },
    type: 'single',
    options: [
      { id: 'menos_10k', label: { es: 'Menos de $10K USD', 'pt-BR': 'Menos de $10K USD' }, emoji: '💵' },
      { id: '10k_50k', label: { es: '$10K - $50K USD', 'pt-BR': '$10K - $50K USD' }, emoji: '💰' },
      { id: '50k_150k', label: { es: '$50K - $150K USD', 'pt-BR': '$50K - $150K USD' }, emoji: '💎' },
      { id: 'mas_150k', label: { es: 'Más de $150K USD', 'pt-BR': 'Mais de $150K USD' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_04',
    category: 'menu',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuál es la duración típica de tus proyectos?',
      'pt-BR': 'Qual é a duração típica dos seus projetos?'
    },
    type: 'single',
    options: [
      { id: 'menos_1mes', label: { es: 'Menos de 1 mes', 'pt-BR': 'Menos de 1 mês' }, emoji: '⚡' },
      { id: '1_3_meses', label: { es: '1-3 meses', 'pt-BR': '1-3 meses' }, emoji: '📅' },
      { id: '3_6_meses', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' }, emoji: '📆' },
      { id: 'mas_6_meses', label: { es: 'Más de 6 meses', 'pt-BR': 'Mais de 6 meses' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_05',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Cobrás por fase de diagnóstico?',
      'pt-BR': 'Você cobra por fase de diagnóstico?'
    },
    type: 'single',
    options: [
      { id: 'si_separado', label: { es: 'Sí, se cotiza aparte', 'pt-BR': 'Sim, cotiza-se separado' }, emoji: '💰' },
      { id: 'incluido', label: { es: 'Incluido en el proyecto', 'pt-BR': 'Incluído no projeto' }, emoji: '📦' },
      { id: 'gratis', label: { es: 'Gratis para ganar el proyecto', 'pt-BR': 'Grátis para ganhar o projeto' }, emoji: '🎁' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_06',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Ofrecés servicios de implementación?',
      'pt-BR': 'Você oferece serviços de implementação?'
    },
    type: 'single',
    options: [
      { id: 'si_completo', label: { es: 'Sí, acompaño toda la implementación', 'pt-BR': 'Sim, acompanho toda a implementação' }, emoji: '🎯' },
      { id: 'parcial', label: { es: 'Parcial, supervisión', 'pt-BR': 'Parcial, supervisão' }, emoji: '👀' },
      { id: 'no', label: { es: 'No, solo estrategia', 'pt-BR': 'Não, só estratégia' }, emoji: '📋' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_07',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Tenés productos escalables (workshops, cursos)?',
      'pt-BR': 'Você tem produtos escaláveis (workshops, cursos)?'
    },
    type: 'single',
    options: [
      { id: 'si_varios', label: { es: 'Sí, varios productos', 'pt-BR': 'Sim, vários produtos' }, emoji: '📚' },
      { id: 'uno', label: { es: 'Uno o dos', 'pt-BR': 'Um ou dois' }, emoji: '📖' },
      { id: 'en_desarrollo', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '🔧' },
      { id: 'no', label: { es: 'No, solo consultoría', 'pt-BR': 'Não, só consultoria' }, emoji: '💼' }
    ]
  },
  {
    id: 'B2B_CE_OFFER_08',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Trabajás con partners o alianzas?',
      'pt-BR': 'Você trabalha com parceiros ou alianças?'
    },
    type: 'single',
    options: [
      { id: 'si_formal', label: { es: 'Sí, alianzas formales', 'pt-BR': 'Sim, alianças formais' }, emoji: '🤝' },
      { id: 'informal', label: { es: 'Colaboraciones informales', 'pt-BR': 'Colaborações informais' }, emoji: '👥' },
      { id: 'no', label: { es: 'No, trabajo independiente', 'pt-BR': 'Não, trabalho independente' }, emoji: '1️⃣' }
    ]
  },

  // ========== CLIENTE Y DEMANDA (8) ==========
  {
    id: 'B2B_CE_CLIENT_01',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué tamaño de empresas son tu cliente ideal?',
      'pt-BR': 'Que tamanho de empresas são seu cliente ideal?'
    },
    type: 'multi',
    options: [
      { id: 'startup', label: { es: 'Startups / Scale-ups', 'pt-BR': 'Startups / Scale-ups' }, emoji: '🚀' },
      { id: 'pyme', label: { es: 'PyMEs', 'pt-BR': 'PMEs' }, emoji: '🏠' },
      { id: 'mediana', label: { es: 'Empresas medianas', 'pt-BR': 'Empresas médias' }, emoji: '🏢' },
      { id: 'corporativo', label: { es: 'Corporativos / Enterprise', 'pt-BR': 'Corporativos / Enterprise' }, emoji: '🏛️' },
      { id: 'multinacional', label: { es: 'Multinacionales', 'pt-BR': 'Multinacionais' }, emoji: '🌐' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Quién es tu interlocutor principal?',
      'pt-BR': 'Quem é seu interlocutor principal?'
    },
    type: 'single',
    options: [
      { id: 'ceo', label: { es: 'CEO / Dueño', 'pt-BR': 'CEO / Dono' }, emoji: '👔' },
      { id: 'c_level', label: { es: 'C-Level (CFO, COO, CMO)', 'pt-BR': 'C-Level (CFO, COO, CMO)' }, emoji: '📊' },
      { id: 'director', label: { es: 'Directores / Gerentes', 'pt-BR': 'Diretores / Gerentes' }, emoji: '👥' },
      { id: 'board', label: { es: 'Board / Inversores', 'pt-BR': 'Board / Investidores' }, emoji: '🏛️' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cómo llegan la mayoría de tus clientes?',
      'pt-BR': 'Como chegam a maioria dos seus clientes?'
    },
    type: 'multi',
    options: [
      { id: 'referidos', label: { es: 'Referidos', 'pt-BR': 'Indicações' }, emoji: '🤝' },
      { id: 'linkedin', label: { es: 'LinkedIn', 'pt-BR': 'LinkedIn' }, emoji: '💼' },
      { id: 'eventos', label: { es: 'Eventos / conferencias', 'pt-BR': 'Eventos / conferências' }, emoji: '🎤' },
      { id: 'contenido', label: { es: 'Contenido / thought leadership', 'pt-BR': 'Conteúdo / thought leadership' }, emoji: '📝' },
      { id: 'outbound', label: { es: 'Prospección activa', 'pt-BR': 'Prospecção ativa' }, emoji: '📞' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuántos clientes activos tenés?',
      'pt-BR': 'Quantos clientes ativos você tem?'
    },
    type: 'single',
    options: [
      { id: 'menos_3', label: { es: 'Menos de 3', 'pt-BR': 'Menos de 3' }, emoji: '🌱' },
      { id: '3_6', label: { es: '3-6', 'pt-BR': '3-6' }, emoji: '📈' },
      { id: '6_10', label: { es: '6-10', 'pt-BR': '6-10' }, emoji: '⭐' },
      { id: 'mas_10', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_05',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Qué % de clientes son recurrentes?',
      'pt-BR': 'Que % de clientes são recorrentes?'
    },
    type: 'single',
    options: [
      { id: 'menos_20', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '📉' },
      { id: '20_40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📈' },
      { id: 'mas_60', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🔄' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_06',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Cuánto dura tu ciclo de venta típico?',
      'pt-BR': 'Quanto dura seu ciclo de venda típico?'
    },
    type: 'single',
    options: [
      { id: 'menos_1mes', label: { es: 'Menos de 1 mes', 'pt-BR': 'Menos de 1 mês' }, emoji: '⚡' },
      { id: '1_3_meses', label: { es: '1-3 meses', 'pt-BR': '1-3 meses' }, emoji: '📅' },
      { id: '3_6_meses', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' }, emoji: '📆' },
      { id: 'mas_6_meses', label: { es: 'Más de 6 meses', 'pt-BR': 'Mais de 6 meses' }, emoji: '🐢' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_07',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Cuál es tu ratio de conversión de propuestas?',
      'pt-BR': 'Qual é sua taxa de conversão de propostas?'
    },
    type: 'single',
    options: [
      { id: 'menos_20', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '😰' },
      { id: '20_40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📈' },
      { id: 'mas_60', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🎯' }
    ]
  },
  {
    id: 'B2B_CE_CLIENT_08',
    category: 'sales',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Participás en licitaciones/RFPs?',
      'pt-BR': 'Você participa de licitações/RFPs?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '📄' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'nunca', label: { es: 'Nunca, solo directo', 'pt-BR': 'Nunca, só direto' }, emoji: '🤝' }
    ]
  },

  // ========== FINANZAS (8) ==========
  {
    id: 'B2B_CE_FINANCE_01',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu facturación anual?',
      'pt-BR': 'Qual é seu faturamento anual?'
    },
    type: 'single',
    options: [
      { id: 'menos_100k', label: { es: 'Menos de $100K USD', 'pt-BR': 'Menos de $100K USD' }, emoji: '🌱' },
      { id: '100k_300k', label: { es: '$100K - $300K USD', 'pt-BR': '$100K - $300K USD' }, emoji: '📈' },
      { id: '300k_1m', label: { es: '$300K - $1M USD', 'pt-BR': '$300K - $1M USD' }, emoji: '⭐' },
      { id: 'mas_1m', label: { es: 'Más de $1M USD', 'pt-BR': 'Mais de $1M USD' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_02',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu margen neto aproximado?',
      'pt-BR': 'Qual é sua margem líquida aproximada?'
    },
    type: 'single',
    options: [
      { id: 'menos_20', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '😰' },
      { id: '20_40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '📈' },
      { id: 'mas_60', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🤩' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 8,
    title: {
      es: '¿Cuál es tu plazo de cobro promedio?',
      'pt-BR': 'Qual é seu prazo de recebimento médio?'
    },
    type: 'single',
    options: [
      { id: 'anticipado', label: { es: 'Anticipo al inicio', 'pt-BR': 'Antecipação no início' }, emoji: '✅' },
      { id: '30_dias', label: { es: '30 días', 'pt-BR': '30 dias' }, emoji: '📅' },
      { id: '60_dias', label: { es: '60 días', 'pt-BR': '60 dias' }, emoji: '📆' },
      { id: 'mas_60', label: { es: 'Más de 60 días', 'pt-BR': 'Mais de 60 dias' }, emoji: '😰' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_04',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Tenés ingresos recurrentes (retainers)?',
      'pt-BR': 'Você tem receitas recorrentes (retainers)?'
    },
    type: 'single',
    options: [
      { id: 'mayoria', label: { es: 'Mayoría recurrente', 'pt-BR': 'Maioria recorrente' }, emoji: '🔄' },
      { id: 'algunos', label: { es: 'Algunos clientes', 'pt-BR': 'Alguns clientes' }, emoji: '📊' },
      { id: 'pocos', label: { es: 'Muy pocos', 'pt-BR': 'Muito poucos' }, emoji: '📉' },
      { id: 'ninguno', label: { es: 'Todo por proyecto', 'pt-BR': 'Tudo por projeto' }, emoji: '📌' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_05',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 6,
    title: {
      es: '¿Cuántos meses de runway tenés?',
      'pt-BR': 'Quantos meses de runway você tem?'
    },
    type: 'single',
    options: [
      { id: 'menos_3', label: { es: 'Menos de 3 meses', 'pt-BR': 'Menos de 3 meses' }, emoji: '😰' },
      { id: '3_6', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' }, emoji: '📊' },
      { id: '6_12', label: { es: '6-12 meses', 'pt-BR': '6-12 meses' }, emoji: '✅' },
      { id: 'mas_12', label: { es: 'Más de 12 meses', 'pt-BR': 'Mais de 12 meses' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_06',
    category: 'finance',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cuánto invertís en desarrollo profesional?',
      'pt-BR': 'Quanto você investe em desenvolvimento profissional?'
    },
    type: 'single',
    options: [
      { id: 'menos_2k', label: { es: 'Menos de $2K/año', 'pt-BR': 'Menos de $2K/ano' }, emoji: '💵' },
      { id: '2k_5k', label: { es: '$2K - $5K/año', 'pt-BR': '$2K - $5K/ano' }, emoji: '📚' },
      { id: '5k_10k', label: { es: '$5K - $10K/año', 'pt-BR': '$5K - $10K/ano' }, emoji: '🎓' },
      { id: 'mas_10k', label: { es: 'Más de $10K/año', 'pt-BR': 'Mais de $10K/ano' }, emoji: '🏆' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_07',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 5,
    title: {
      es: '¿Tenés estacionalidad en ingresos?',
      'pt-BR': 'Você tem sazonalidade em receitas?'
    },
    type: 'single',
    options: [
      { id: 'muy_estacional', label: { es: 'Muy marcada', 'pt-BR': 'Muito marcada' }, emoji: '🎢' },
      { id: 'algo', label: { es: 'Algo estacional', 'pt-BR': 'Algo sazonal' }, emoji: '🌊' },
      { id: 'estable', label: { es: 'Bastante estable', 'pt-BR': 'Bastante estável' }, emoji: '📊' }
    ]
  },
  {
    id: 'B2B_CE_FINANCE_08',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 5,
    title: {
      es: '¿Cuánto gastás en herramientas/software?',
      'pt-BR': 'Quanto você gasta em ferramentas/software?'
    },
    type: 'single',
    options: [
      { id: 'menos_200', label: { es: 'Menos de $200/mes', 'pt-BR': 'Menos de $200/mês' }, emoji: '💵' },
      { id: '200_500', label: { es: '$200 - $500/mes', 'pt-BR': '$200 - $500/mês' }, emoji: '💰' },
      { id: 'mas_500', label: { es: 'Más de $500/mes', 'pt-BR': 'Mais de $500/mês' }, emoji: '💎' }
    ]
  },

  // ========== OPERACIONES (8) ==========
  {
    id: 'B2B_CE_OPS_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántos proyectos manejás en paralelo?',
      'pt-BR': 'Quantos projetos você gerencia em paralelo?'
    },
    type: 'single',
    options: [
      { id: '1_2', label: { es: '1-2', 'pt-BR': '1-2' }, emoji: '🎯' },
      { id: '3_5', label: { es: '3-5', 'pt-BR': '3-5' }, emoji: '📊' },
      { id: '6_10', label: { es: '6-10', 'pt-BR': '6-10' }, emoji: '📈' },
      { id: 'mas_10', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢' }
    ]
  },
  {
    id: 'B2B_CE_OPS_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Tenés metodología de entrega estandarizada?',
      'pt-BR': 'Você tem metodologia de entrega padronizada?'
    },
    type: 'single',
    options: [
      { id: 'si_completa', label: { es: 'Sí, muy estructurada', 'pt-BR': 'Sim, muito estruturada' }, emoji: '📚' },
      { id: 'parcial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, emoji: '📋' },
      { id: 'adaptable', label: { es: 'Adaptable por cliente', 'pt-BR': 'Adaptável por cliente' }, emoji: '🔀' },
      { id: 'no', label: { es: 'No, cada proyecto es único', 'pt-BR': 'Não, cada projeto é único' }, emoji: '🎨' }
    ]
  },
  {
    id: 'B2B_CE_OPS_03',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Usás herramientas de gestión de proyectos?',
      'pt-BR': 'Você usa ferramentas de gestão de projetos?'
    },
    type: 'multi',
    options: [
      { id: 'asana', label: { es: 'Asana / Monday', 'pt-BR': 'Asana / Monday' }, emoji: '📋' },
      { id: 'notion', label: { es: 'Notion', 'pt-BR': 'Notion' }, emoji: '📝' },
      { id: 'jira', label: { es: 'Jira / Trello', 'pt-BR': 'Jira / Trello' }, emoji: '📊' },
      { id: 'hojas', label: { es: 'Hojas de cálculo', 'pt-BR': 'Planilhas' }, emoji: '📈' },
      { id: 'ninguna', label: { es: 'Ninguna específica', 'pt-BR': 'Nenhuma específica' }, emoji: '📧' }
    ]
  },
  {
    id: 'B2B_CE_OPS_04',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo dedicás a tareas no facturables?',
      'pt-BR': 'Quanto tempo você dedica a tarefas não faturáveis?'
    },
    type: 'single',
    options: [
      { id: 'menos_20', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, emoji: '✅' },
      { id: '20_40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📊' },
      { id: '40_60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '😰' },
      { id: 'mas_60', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_CE_OPS_05',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tenés templates/entregables reutilizables?',
      'pt-BR': 'Você tem templates/entregáveis reutilizáveis?'
    },
    type: 'single',
    options: [
      { id: 'si_biblioteca', label: { es: 'Sí, biblioteca completa', 'pt-BR': 'Sim, biblioteca completa' }, emoji: '📚' },
      { id: 'algunos', label: { es: 'Algunos templates', 'pt-BR': 'Alguns templates' }, emoji: '📋' },
      { id: 'pocos', label: { es: 'Muy pocos', 'pt-BR': 'Muito poucos' }, emoji: '📝' },
      { id: 'no', label: { es: 'No, todo custom', 'pt-BR': 'Não, tudo customizado' }, emoji: '🎨' }
    ]
  },
  {
    id: 'B2B_CE_OPS_06',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Trabajás más remoto o presencial?',
      'pt-BR': 'Você trabalha mais remoto ou presencial?'
    },
    type: 'single',
    options: [
      { id: 'full_remoto', label: { es: 'Full remoto', 'pt-BR': 'Full remoto' }, emoji: '🏠' },
      { id: 'hibrido', label: { es: 'Híbrido', 'pt-BR': 'Híbrido' }, emoji: '🔀' },
      { id: 'mayoria_presencial', label: { es: 'Mayoría presencial', 'pt-BR': 'Maioria presencial' }, emoji: '🏢' }
    ]
  },
  {
    id: 'B2B_CE_OPS_07',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Cuál es tu mayor cuello de botella?',
      'pt-BR': 'Qual é seu maior gargalo?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Conseguir clientes', 'pt-BR': 'Conseguir clientes' }, emoji: '📈' },
      { id: 'delivery', label: { es: 'Capacidad de delivery', 'pt-BR': 'Capacidade de entrega' }, emoji: '⏰' },
      { id: 'propuestas', label: { es: 'Tiempo en propuestas', 'pt-BR': 'Tempo em propostas' }, emoji: '📄' },
      { id: 'admin', label: { es: 'Tareas administrativas', 'pt-BR': 'Tarefas administrativas' }, emoji: '📋' }
    ]
  },
  {
    id: 'B2B_CE_OPS_08',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Usás IA en tu trabajo?',
      'pt-BR': 'Você usa IA no seu trabalho?'
    },
    type: 'single',
    options: [
      { id: 'intensivo', label: { es: 'Intensivamente', 'pt-BR': 'Intensivamente' }, emoji: '🤖' },
      { id: 'moderado', label: { es: 'Moderadamente', 'pt-BR': 'Moderadamente' }, emoji: '💻' },
      { id: 'poco', label: { es: 'Poco', 'pt-BR': 'Pouco' }, emoji: '📝' },
      { id: 'no', label: { es: 'Casi nada', 'pt-BR': 'Quase nada' }, emoji: '❌' }
    ]
  },

  // ========== EQUIPO (8) ==========
  {
    id: 'B2B_CE_TEAM_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuántas personas hay en tu equipo core?',
      'pt-BR': 'Quantas pessoas há na sua equipe core?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '1️⃣' },
      { id: '2_3', label: { es: '2-3 personas', 'pt-BR': '2-3 pessoas' }, emoji: '👥' },
      { id: '4_10', label: { es: '4-10 personas', 'pt-BR': '4-10 pessoas' }, emoji: '👨‍👩‍👧‍👦' },
      { id: 'mas_10', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' }, emoji: '🏢' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Trabajás con freelancers o asociados?',
      'pt-BR': 'Você trabalha com freelancers ou associados?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '🤝' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'rara_vez', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🌧️' },
      { id: 'nunca', label: { es: 'Nunca, solo equipo fijo', 'pt-BR': 'Nunca, só equipe fixa' }, emoji: '🏠' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_03',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tenés soporte administrativo?',
      'pt-BR': 'Você tem suporte administrativo?'
    },
    type: 'single',
    options: [
      { id: 'si_dedicado', label: { es: 'Sí, dedicado', 'pt-BR': 'Sim, dedicado' }, emoji: '👤' },
      { id: 'compartido', label: { es: 'Compartido / part-time', 'pt-BR': 'Compartilhado / part-time' }, emoji: '📅' },
      { id: 'tercerizado', label: { es: 'Tercerizado', 'pt-BR': 'Terceirizado' }, emoji: '🏢' },
      { id: 'yo_hago', label: { es: 'Yo lo hago', 'pt-BR': 'Eu faço' }, emoji: '🙋' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_04',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Qué rol te gustaría delegar primero?',
      'pt-BR': 'Que função você gostaria de delegar primeiro?'
    },
    type: 'single',
    options: [
      { id: 'ventas', label: { es: 'Ventas / business development', 'pt-BR': 'Vendas / business development' }, emoji: '📈' },
      { id: 'admin', label: { es: 'Administración', 'pt-BR': 'Administração' }, emoji: '📋' },
      { id: 'delivery', label: { es: 'Parte del delivery', 'pt-BR': 'Parte da entrega' }, emoji: '🎯' },
      { id: 'marketing', label: { es: 'Marketing / contenidos', 'pt-BR': 'Marketing / conteúdos' }, emoji: '📢' },
      { id: 'ninguno', label: { es: 'Ninguno por ahora', 'pt-BR': 'Nenhum por agora' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_05',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Cómo formás a tu equipo?',
      'pt-BR': 'Como você treina sua equipe?'
    },
    type: 'single',
    options: [
      { id: 'programa_formal', label: { es: 'Programa formal', 'pt-BR': 'Programa formal' }, emoji: '📚' },
      { id: 'mentoring', label: { es: 'Mentoring en proyectos', 'pt-BR': 'Mentoring em projetos' }, emoji: '🎓' },
      { id: 'cursos_externos', label: { es: 'Cursos externos', 'pt-BR': 'Cursos externos' }, emoji: '🎯' },
      { id: 'no_aplica', label: { es: 'No aplica (solo)', 'pt-BR': 'Não se aplica (só)' }, emoji: '1️⃣' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_06',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Tenés problemas de rotación?',
      'pt-BR': 'Você tem problemas de rotatividade?'
    },
    type: 'single',
    options: [
      { id: 'si_alta', label: { es: 'Sí, alta rotación', 'pt-BR': 'Sim, alta rotatividade' }, emoji: '😰' },
      { id: 'algo', label: { es: 'Algo de rotación', 'pt-BR': 'Alguma rotatividade' }, emoji: '📊' },
      { id: 'no', label: { es: 'No, equipo estable', 'pt-BR': 'Não, equipe estável' }, emoji: '✅' },
      { id: 'no_aplica', label: { es: 'No aplica', 'pt-BR': 'Não se aplica' }, emoji: '1️⃣' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_07',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 5,
    title: {
      es: '¿Cómo manejás el conocimiento del equipo?',
      'pt-BR': 'Como você gerencia o conhecimento da equipe?'
    },
    type: 'single',
    options: [
      { id: 'wiki_formal', label: { es: 'Wiki / base de conocimiento', 'pt-BR': 'Wiki / base de conhecimento' }, emoji: '📚' },
      { id: 'documentos', label: { es: 'Documentos compartidos', 'pt-BR': 'Documentos compartilhados' }, emoji: '📁' },
      { id: 'informal', label: { es: 'Informal / verbal', 'pt-BR': 'Informal / verbal' }, emoji: '💬' },
      { id: 'no_aplica', label: { es: 'No aplica', 'pt-BR': 'Não se aplica' }, emoji: '1️⃣' }
    ]
  },
  {
    id: 'B2B_CE_TEAM_08',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 4,
    title: {
      es: '¿Hacés reuniones de equipo regulares?',
      'pt-BR': 'Você faz reuniões de equipe regulares?'
    },
    type: 'single',
    options: [
      { id: 'diarias', label: { es: 'Diarias', 'pt-BR': 'Diárias' }, emoji: '📅' },
      { id: 'semanales', label: { es: 'Semanales', 'pt-BR': 'Semanais' }, emoji: '📆' },
      { id: 'mensuales', label: { es: 'Mensuales', 'pt-BR': 'Mensais' }, emoji: '📊' },
      { id: 'no', label: { es: 'No regulares', 'pt-BR': 'Não regulares' }, emoji: '❌' }
    ]
  },

  // ========== MARKETING (8) ==========
  {
    id: 'B2B_CE_MKT_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu principal estrategia de posicionamiento?',
      'pt-BR': 'Qual é sua principal estratégia de posicionamento?'
    },
    type: 'single',
    options: [
      { id: 'especialista', label: { es: 'Especialista en un nicho', 'pt-BR': 'Especialista em um nicho' }, emoji: '🎯' },
      { id: 'thought_leader', label: { es: 'Thought leadership', 'pt-BR': 'Thought leadership' }, emoji: '💡' },
      { id: 'resultados', label: { es: 'Foco en resultados medibles', 'pt-BR': 'Foco em resultados mensuráveis' }, emoji: '📊' },
      { id: 'network', label: { es: 'Red de contactos', 'pt-BR': 'Rede de contatos' }, emoji: '🤝' },
      { id: 'no_claro', label: { es: 'No lo tengo claro', 'pt-BR': 'Não tenho claro' }, emoji: '🤔' }
    ]
  },
  {
    id: 'B2B_CE_MKT_02',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Tenés presencia digital activa?',
      'pt-BR': 'Você tem presença digital ativa?'
    },
    type: 'multi',
    options: [
      { id: 'linkedin', label: { es: 'LinkedIn activo', 'pt-BR': 'LinkedIn ativo' }, emoji: '💼' },
      { id: 'blog', label: { es: 'Blog / artículos', 'pt-BR': 'Blog / artigos' }, emoji: '📝' },
      { id: 'newsletter', label: { es: 'Newsletter', 'pt-BR': 'Newsletter' }, emoji: '📧' },
      { id: 'podcast', label: { es: 'Podcast / YouTube', 'pt-BR': 'Podcast / YouTube' }, emoji: '🎙️' },
      { id: 'nada', label: { es: 'Muy poca', 'pt-BR': 'Muito pouca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_MKT_03',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Tenés casos de éxito documentados?',
      'pt-BR': 'Você tem casos de sucesso documentados?'
    },
    type: 'single',
    options: [
      { id: 'varios', label: { es: 'Sí, varios con métricas', 'pt-BR': 'Sim, vários com métricas' }, emoji: '📊' },
      { id: 'algunos', label: { es: 'Algunos testimoniales', 'pt-BR': 'Alguns depoimentos' }, emoji: '💬' },
      { id: 'pocos', label: { es: 'Muy pocos', 'pt-BR': 'Muito poucos' }, emoji: '📝' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_MKT_04',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Das charlas o conferencias?',
      'pt-BR': 'Você dá palestras ou conferências?'
    },
    type: 'single',
    options: [
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '🎤' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'rara_vez', label: { es: 'Rara vez', 'pt-BR': 'Raramente' }, emoji: '🌧️' },
      { id: 'nunca', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_MKT_05',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Publicás contenido regularmente?',
      'pt-BR': 'Você publica conteúdo regularmente?'
    },
    type: 'single',
    options: [
      { id: 'semanal', label: { es: 'Semanalmente', 'pt-BR': 'Semanalmente' }, emoji: '🔥' },
      { id: 'quincenal', label: { es: 'Cada 2 semanas', 'pt-BR': 'A cada 2 semanas' }, emoji: '📅' },
      { id: 'mensual', label: { es: 'Mensualmente', 'pt-BR': 'Mensalmente' }, emoji: '📆' },
      { id: 'esporadico', label: { es: 'Esporádicamente', 'pt-BR': 'Esporadicamente' }, emoji: '🌧️' }
    ]
  },
  {
    id: 'B2B_CE_MKT_06',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tenés libro publicado?',
      'pt-BR': 'Você tem livro publicado?'
    },
    type: 'single',
    options: [
      { id: 'si_varios', label: { es: 'Sí, varios', 'pt-BR': 'Sim, vários' }, emoji: '📚' },
      { id: 'si_uno', label: { es: 'Sí, uno', 'pt-BR': 'Sim, um' }, emoji: '📖' },
      { id: 'en_proceso', label: { es: 'En proceso', 'pt-BR': 'Em processo' }, emoji: '✏️' },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_MKT_07',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Cuánto invertís en marketing?',
      'pt-BR': 'Quanto você investe em marketing?'
    },
    type: 'single',
    options: [
      { id: 'nada', label: { es: 'Nada', 'pt-BR': 'Nada' }, emoji: '💧' },
      { id: 'poco', label: { es: 'Menos de $500/mes', 'pt-BR': 'Menos de $500/mês' }, emoji: '💵' },
      { id: 'moderado', label: { es: '$500 - $2,000/mes', 'pt-BR': '$500 - $2.000/mês' }, emoji: '💰' },
      { id: 'alto', label: { es: 'Más de $2,000/mes', 'pt-BR': 'Mais de $2.000/mês' }, emoji: '💎' }
    ]
  },
  {
    id: 'B2B_CE_MKT_08',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 5,
    title: {
      es: '¿Tenés sitio web profesional?',
      'pt-BR': 'Você tem site profissional?'
    },
    type: 'single',
    options: [
      { id: 'si_completo', label: { es: 'Sí, con casos y blog', 'pt-BR': 'Sim, com casos e blog' }, emoji: '🌐' },
      { id: 'basico', label: { es: 'Básico / landing page', 'pt-BR': 'Básico / landing page' }, emoji: '📄' },
      { id: 'en_desarrollo', label: { es: 'En desarrollo', 'pt-BR': 'Em desenvolvimento' }, emoji: '🔧' },
      { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' }
    ]
  },

  // ========== REPUTACIÓN (8) ==========
  {
    id: 'B2B_CE_REP_01',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 10,
    required: true,
    title: {
      es: '¿Qué % de clientes te recomendarían activamente?',
      'pt-BR': 'Que % de clientes te recomendariam ativamente?'
    },
    type: 'single',
    options: [
      { id: 'mas_90', label: { es: 'Más del 90%', 'pt-BR': 'Mais de 90%' }, emoji: '🏆' },
      { id: '70_90', label: { es: '70-90%', 'pt-BR': '70-90%' }, emoji: '⭐' },
      { id: '50_70', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '📊' },
      { id: 'menos_50', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' }, emoji: '😰' }
    ]
  },
  {
    id: 'B2B_CE_REP_02',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Tenés recomendaciones en LinkedIn?',
      'pt-BR': 'Você tem recomendações no LinkedIn?'
    },
    type: 'single',
    options: [
      { id: 'muchas', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🌟' },
      { id: 'varias', label: { es: '5-15', 'pt-BR': '5-15' }, emoji: '⭐' },
      { id: 'pocas', label: { es: '1-5', 'pt-BR': '1-5' }, emoji: '📝' },
      { id: 'ninguna', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_REP_03',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Cuál es la queja más frecuente?',
      'pt-BR': 'Qual é a reclamação mais frequente?'
    },
    type: 'single',
    options: [
      { id: 'precio', label: { es: 'Precio alto', 'pt-BR': 'Preço alto' }, emoji: '💰' },
      { id: 'tiempo', label: { es: 'Tiempos de entrega', 'pt-BR': 'Prazos de entrega' }, emoji: '⏰' },
      { id: 'comunicacion', label: { es: 'Falta de comunicación', 'pt-BR': 'Falta de comunicação' }, emoji: '💬' },
      { id: 'implementacion', label: { es: 'Falta de implementación', 'pt-BR': 'Falta de implementação' }, emoji: '🔧' },
      { id: 'ninguna', label: { es: 'No hay quejas frecuentes', 'pt-BR': 'Não há reclamações frequentes' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_CE_REP_04',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Hacés encuestas de satisfacción?',
      'pt-BR': 'Você faz pesquisas de satisfação?'
    },
    type: 'single',
    options: [
      { id: 'siempre', label: { es: 'Al cierre de cada proyecto', 'pt-BR': 'Ao fim de cada projeto' }, emoji: '📊' },
      { id: 'mayoria', label: { es: 'En la mayoría', 'pt-BR': 'Na maioria' }, emoji: '📋' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'nunca', label: { es: 'Nunca', 'pt-BR': 'Nunca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_REP_05',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Cuántos clientes perdiste el último año?',
      'pt-BR': 'Quantos clientes você perdeu no último ano?'
    },
    type: 'single',
    options: [
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '✅' },
      { id: 'uno_dos', label: { es: '1-2', 'pt-BR': '1-2' }, emoji: '📊' },
      { id: 'varios', label: { es: '3-5', 'pt-BR': '3-5' }, emoji: '😰' },
      { id: 'muchos', label: { es: 'Más de 5', 'pt-BR': 'Mais de 5' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_CE_REP_06',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Pedís referidos activamente?',
      'pt-BR': 'Você pede indicações ativamente?'
    },
    type: 'single',
    options: [
      { id: 'programa', label: { es: 'Tengo programa formal', 'pt-BR': 'Tenho programa formal' }, emoji: '📋' },
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, emoji: '🤝' },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, emoji: '📅' },
      { id: 'nunca', label: { es: 'Casi nunca', 'pt-BR': 'Quase nunca' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_REP_07',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Has ganado premios del sector?',
      'pt-BR': 'Você ganhou prêmios do setor?'
    },
    type: 'single',
    options: [
      { id: 'varios', label: { es: 'Varios', 'pt-BR': 'Vários' }, emoji: '🏆' },
      { id: 'alguno', label: { es: 'Alguno', 'pt-BR': 'Algum' }, emoji: '🥇' },
      { id: 'nominado', label: { es: 'Nominado', 'pt-BR': 'Indicado' }, emoji: '📋' },
      { id: 'ninguno', label: { es: 'Ninguno', 'pt-BR': 'Nenhum' }, emoji: '❌' }
    ]
  },
  {
    id: 'B2B_CE_REP_08',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 5,
    title: {
      es: '¿Cómo manejás los conflictos con clientes?',
      'pt-BR': 'Como você lida com conflitos com clientes?'
    },
    type: 'single',
    options: [
      { id: 'proactivo', label: { es: 'Proactivamente, antes de escalar', 'pt-BR': 'Proativamente, antes de escalar' }, emoji: '🎯' },
      { id: 'transparente', label: { es: 'Transparencia y comunicación', 'pt-BR': 'Transparência e comunicação' }, emoji: '💬' },
      { id: 'formal', label: { es: 'Proceso formal', 'pt-BR': 'Processo formal' }, emoji: '📋' },
      { id: 'evito', label: { es: 'Trato de evitarlos', 'pt-BR': 'Tento evitá-los' }, emoji: '🙈' }
    ]
  },

  // ========== OBJETIVOS (8) ==========
  {
    id: 'B2B_CE_GOALS_01',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    required: true,
    title: {
      es: '¿Cuál es tu principal objetivo para los próximos 12 meses?',
      'pt-BR': 'Qual é seu principal objetivo para os próximos 12 meses?'
    },
    type: 'single',
    options: [
      { id: 'mas_clientes', label: { es: 'Conseguir más clientes', 'pt-BR': 'Conseguir mais clientes' }, emoji: '📈' },
      { id: 'subir_ticket', label: { es: 'Subir ticket promedio', 'pt-BR': 'Aumentar ticket médio' }, emoji: '💰' },
      { id: 'escalar', label: { es: 'Escalar con equipo', 'pt-BR': 'Escalar com equipe' }, emoji: '🚀' },
      { id: 'productizar', label: { es: 'Productizar servicios', 'pt-BR': 'Produtizar serviços' }, emoji: '📦' },
      { id: 'estabilizar', label: { es: 'Estabilizar ingresos', 'pt-BR': 'Estabilizar receitas' }, emoji: '⚖️' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Qué % de crecimiento esperás?',
      'pt-BR': 'Que % de crescimento você espera?'
    },
    type: 'single',
    options: [
      { id: 'mantener', label: { es: 'Mantener nivel actual', 'pt-BR': 'Manter nível atual' }, emoji: '📊' },
      { id: '10_30', label: { es: '10-30%', 'pt-BR': '10-30%' }, emoji: '📈' },
      { id: '30_50', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '🚀' },
      { id: 'mas_50', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_03',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Querés expandir a nuevos mercados?',
      'pt-BR': 'Você quer expandir para novos mercados?'
    },
    type: 'single',
    options: [
      { id: 'si_latam', label: { es: 'Sí, otros países LATAM', 'pt-BR': 'Sim, outros países LATAM' }, emoji: '🌎' },
      { id: 'si_global', label: { es: 'Sí, mercado global', 'pt-BR': 'Sim, mercado global' }, emoji: '🌍' },
      { id: 'nuevas_industrias', label: { es: 'Nuevas industrias locales', 'pt-BR': 'Novas indústrias locais' }, emoji: '🏭' },
      { id: 'no', label: { es: 'No, foco en lo actual', 'pt-BR': 'Não, foco no atual' }, emoji: '🎯' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_04',
    category: 'goals',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuánto querés trabajar semanalmente?',
      'pt-BR': 'Quanto você quer trabalhar semanalmente?'
    },
    type: 'single',
    options: [
      { id: 'menos_30', label: { es: 'Menos de 30 horas', 'pt-BR': 'Menos de 30 horas' }, emoji: '🏖️' },
      { id: '30_40', label: { es: '30-40 horas', 'pt-BR': '30-40 horas' }, emoji: '⚖️' },
      { id: '40_50', label: { es: '40-50 horas', 'pt-BR': '40-50 horas' }, emoji: '💼' },
      { id: 'mas_50', label: { es: 'Más de 50 horas', 'pt-BR': 'Mais de 50 horas' }, emoji: '🔥' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_05',
    category: 'goals',
    mode: 'complete',
    dimension: 'profitability',
    weight: 6,
    title: {
      es: '¿Cuál sería tu ingreso ideal anual?',
      'pt-BR': 'Qual seria sua receita ideal anual?'
    },
    type: 'single',
    options: [
      { id: 'lifestyle', label: { es: 'Lo suficiente para buen lifestyle', 'pt-BR': 'O suficiente para bom lifestyle' }, emoji: '🏖️' },
      { id: '200k', label: { es: '$150-200K USD', 'pt-BR': '$150-200K USD' }, emoji: '💰' },
      { id: '500k', label: { es: '$300-500K USD', 'pt-BR': '$300-500K USD' }, emoji: '💎' },
      { id: 'mas_500k', label: { es: 'Más de $500K USD', 'pt-BR': 'Mais de $500K USD' }, emoji: '👑' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_06',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Pensás vender o fusionar tu consultora?',
      'pt-BR': 'Você pensa em vender ou fundir sua consultoria?'
    },
    type: 'single',
    options: [
      { id: 'si_proximo', label: { es: 'Sí, en los próximos años', 'pt-BR': 'Sim, nos próximos anos' }, emoji: '📈' },
      { id: 'tal_vez', label: { es: 'Tal vez en el futuro', 'pt-BR': 'Talvez no futuro' }, emoji: '🤔' },
      { id: 'no', label: { es: 'No, es mi proyecto de vida', 'pt-BR': 'Não, é meu projeto de vida' }, emoji: '❤️' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_07',
    category: 'goals',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 5,
    title: {
      es: '¿Qué te gustaría automatizar?',
      'pt-BR': 'O que você gostaria de automatizar?'
    },
    type: 'multi',
    options: [
      { id: 'propuestas', label: { es: 'Creación de propuestas', 'pt-BR': 'Criação de propostas' }, emoji: '📄' },
      { id: 'reportes', label: { es: 'Reportes / entregables', 'pt-BR': 'Relatórios / entregáveis' }, emoji: '📊' },
      { id: 'admin', label: { es: 'Facturación / admin', 'pt-BR': 'Faturação / admin' }, emoji: '📋' },
      { id: 'marketing', label: { es: 'Marketing / contenido', 'pt-BR': 'Marketing / conteúdo' }, emoji: '📢' },
      { id: 'nada', label: { es: 'Nada por ahora', 'pt-BR': 'Nada por agora' }, emoji: '✅' }
    ]
  },
  {
    id: 'B2B_CE_GOALS_08',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 5,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'conseguir_clientes', label: { es: 'Conseguir suficientes clientes', 'pt-BR': 'Conseguir clientes suficientes' }, emoji: '📈' },
      { id: 'diferenciacion', label: { es: 'Diferenciarme de la competencia', 'pt-BR': 'Diferenciar-me da concorrência' }, emoji: '🎯' },
      { id: 'precio', label: { es: 'Justificar mis precios', 'pt-BR': 'Justificar meus preços' }, emoji: '💰' },
      { id: 'tiempo', label: { es: 'Falta de tiempo', 'pt-BR': 'Falta de tempo' }, emoji: '⏰' },
      { id: 'escalar', label: { es: 'Escalar sin perder calidad', 'pt-BR': 'Escalar sem perder qualidade' }, emoji: '🚀' }
    ]
  }
];
