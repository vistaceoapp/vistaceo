// =============================================
// MARKETPLACE SELLER - CUESTIONARIO HIPER-PERSONALIZADO
// Vendedor en MercadoLibre, Amazon, etc.
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const MARKETPLACE_SELLER_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'MKT_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿En qué marketplaces vendés actualmente?',
      'pt-BR': 'Em quais marketplaces você vende atualmente?'
    },
    help: {
      es: 'Canales principales de venta',
      'pt-BR': 'Canais principais de venda'
    },
    type: 'multi',
    options: [
      { id: 'mercadolibre', label: { es: 'MercadoLibre', 'pt-BR': 'Mercado Livre' }, emoji: '🟡' },
      { id: 'amazon', label: { es: 'Amazon', 'pt-BR': 'Amazon' }, emoji: '📦' },
      { id: 'tiendanube', label: { es: 'TiendaNube', 'pt-BR': 'Nuvemshop' }, emoji: '☁️' },
      { id: 'shopee', label: { es: 'Shopee', 'pt-BR': 'Shopee' }, emoji: '🧡' },
      { id: 'otros', label: { es: 'Otros marketplaces', 'pt-BR': 'Outros marketplaces' }, emoji: '🛒' }
    ],
    required: true
  },
  {
    id: 'MKT_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: {
      es: '¿Cuál es tu nivel de reputación en el marketplace principal?',
      'pt-BR': 'Qual é seu nível de reputação no marketplace principal?'
    },
    type: 'single',
    options: [
      { id: 'top', label: { es: 'MercadoLíder / Top Seller', 'pt-BR': 'MercadoLíder / Top Seller' }, impactScore: 100 },
      { id: 'high', label: { es: 'Reputación alta (verde)', 'pt-BR': 'Reputação alta (verde)' }, impactScore: 80 },
      { id: 'medium', label: { es: 'Reputación media (amarilla)', 'pt-BR': 'Reputação média (amarela)' }, impactScore: 50 },
      { id: 'low', label: { es: 'Reputación baja / recuperando', 'pt-BR': 'Reputação baixa / recuperando' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'MKT_ID_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Tenés marca propia o revendés productos de terceros?',
      'pt-BR': 'Você tem marca própria ou revende produtos de terceiros?'
    },
    type: 'single',
    options: [
      { id: 'propia', label: { es: 'Marca propia exclusiva', 'pt-BR': 'Marca própria exclusiva' }, impactScore: 100 },
      { id: 'mixto', label: { es: 'Mixto (propia + reventa)', 'pt-BR': 'Misto (própria + revenda)' }, impactScore: 70 },
      { id: 'reventa', label: { es: 'Solo reventa', 'pt-BR': 'Só revenda' }, impactScore: 40 },
      { id: 'dropshipping', label: { es: 'Dropshipping', 'pt-BR': 'Dropshipping' }, impactScore: 30 }
    ]
  },
  {
    id: 'MKT_ID_04',
    category: 'identity',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Usás fulfillment del marketplace (Flex, FBA)?',
      'pt-BR': 'Você usa fulfillment do marketplace (Full, FBA)?'
    },
    type: 'single',
    options: [
      { id: 'full', label: { es: 'Sí, 100% fulfillment', 'pt-BR': 'Sim, 100% fulfillment' }, impactScore: 100 },
      { id: 'parcial', label: { es: 'Parcial (algunos productos)', 'pt-BR': 'Parcial (alguns produtos)' }, impactScore: 70 },
      { id: 'propio', label: { es: 'Envío propio solamente', 'pt-BR': 'Envio próprio somente' }, impactScore: 40 },
      { id: 'mixto', label: { es: 'Mixto según producto', 'pt-BR': 'Misto segundo produto' }, impactScore: 60 }
    ]
  },

  // ========== CATÁLOGO ==========
  {
    id: 'MKT_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuántas publicaciones activas tenés?',
      'pt-BR': 'Quantos anúncios ativos você tem?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 50', 'pt-BR': 'Menos de 50' }, impactScore: 30 },
      { id: 'medium', label: { es: '50-200 publicaciones', 'pt-BR': '50-200 anúncios' }, impactScore: 60 },
      { id: 'large', label: { es: '200-500 publicaciones', 'pt-BR': '200-500 anúncios' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 500', 'pt-BR': 'Mais de 500' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'MKT_OF_02',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: {
      es: '¿Qué tipo de publicación usás principalmente?',
      'pt-BR': 'Que tipo de anúncio você usa principalmente?'
    },
    type: 'single',
    options: [
      { id: 'premium', label: { es: 'Premium/Clásica (mayor exposición)', 'pt-BR': 'Premium/Clássico (maior exposição)' }, impactScore: 100 },
      { id: 'gratis', label: { es: 'Gratuita (sin comisión)', 'pt-BR': 'Grátis (sem comissão)' }, impactScore: 40 },
      { id: 'mixto', label: { es: 'Mixto según producto', 'pt-BR': 'Misto segundo produto' }, impactScore: 70 }
    ]
  },
  {
    id: 'MKT_OF_03',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Optimizás títulos y descripciones con SEO del marketplace?',
      'pt-BR': 'Você otimiza títulos e descrições com SEO do marketplace?'
    },
    type: 'single',
    options: [
      { id: 'profesional', label: { es: 'Sí, con herramientas profesionales', 'pt-BR': 'Sim, com ferramentas profissionais' }, impactScore: 100 },
      { id: 'manual', label: { es: 'Sí, manualmente', 'pt-BR': 'Sim, manualmente' }, impactScore: 70 },
      { id: 'basico', label: { es: 'Solo lo básico', 'pt-BR': 'Só o básico' }, impactScore: 40 },
      { id: 'no', label: { es: 'No optimizo', 'pt-BR': 'Não otimizo' }, impactScore: 10 }
    ]
  },
  {
    id: 'MKT_OF_04',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 6,
    title: {
      es: '¿Usás publicidad paga dentro del marketplace (Product Ads)?',
      'pt-BR': 'Você usa publicidade paga dentro do marketplace (Product Ads)?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Sí, inversión significativa', 'pt-BR': 'Sim, investimento significativo' }, impactScore: 100 },
      { id: 'moderado', label: { es: 'Inversión moderada', 'pt-BR': 'Investimento moderado' }, impactScore: 70 },
      { id: 'poco', label: { es: 'Mínimo, solo productos clave', 'pt-BR': 'Mínimo, só produtos chave' }, impactScore: 40 },
      { id: 'no', label: { es: 'No uso publicidad paga', 'pt-BR': 'Não uso publicidade paga' }, impactScore: 20 }
    ]
  },

  // ========== VENTAS ==========
  {
    id: 'MKT_CL_01',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Cuántas ventas hacés por mes en promedio?',
      'pt-BR': 'Quantas vendas você faz por mês em média?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 100', 'pt-BR': 'Menos de 100' }, impactScore: 30 },
      { id: 'medium', label: { es: '100-500 ventas', 'pt-BR': '100-500 vendas' }, impactScore: 60 },
      { id: 'large', label: { es: '500-2000 ventas', 'pt-BR': '500-2000 vendas' }, impactScore: 80 },
      { id: 'mega', label: { es: 'Más de 2000', 'pt-BR': 'Mais de 2000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'MKT_CL_02',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: {
      es: '¿Cuál es tu porcentaje de reclamos y cancelaciones?',
      'pt-BR': 'Qual é sua porcentagem de reclamações e cancelamentos?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: 'Menos del 1%', 'pt-BR': 'Menos de 1%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '1-3%', 'pt-BR': '1-3%' }, impactScore: 70 },
      { id: 'regular', label: { es: '3-5%', 'pt-BR': '3-5%' }, impactScore: 40 },
      { id: 'alto', label: { es: 'Más del 5%', 'pt-BR': 'Mais de 5%' }, impactScore: 10 }
    ],
    required: true
  },
  {
    id: 'MKT_CL_03',
    category: 'reputation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Respondés mensajes de compradores en cuánto tiempo?',
      'pt-BR': 'Você responde mensagens de compradores em quanto tempo?'
    },
    type: 'single',
    options: [
      { id: 'inmediato', label: { es: 'Menos de 1 hora', 'pt-BR': 'Menos de 1 hora' }, impactScore: 100 },
      { id: 'rapido', label: { es: '1-4 horas', 'pt-BR': '1-4 horas' }, impactScore: 80 },
      { id: 'dia', label: { es: 'Dentro del día', 'pt-BR': 'Dentro do dia' }, impactScore: 50 },
      { id: 'lento', label: { es: 'Más de 24 horas', 'pt-BR': 'Mais de 24 horas' }, impactScore: 20 }
    ]
  },
  {
    id: 'MKT_CL_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Qué porcentaje de compradores son recurrentes?',
      'pt-BR': 'Que porcentagem de compradores são recorrentes?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, impactScore: 100 },
      { id: 'medio', label: { es: '10-20%', 'pt-BR': '10-20%' }, impactScore: 70 },
      { id: 'bajo', label: { es: '5-10%', 'pt-BR': '5-10%' }, impactScore: 40 },
      { id: 'minimo', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' }, impactScore: 20 }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'MKT_VE_01',
    category: 'sales',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu ticket promedio por venta?',
      'pt-BR': 'Qual é seu ticket médio por venda?'
    },
    type: 'number',
    min: 0,
    max: 100000,
    required: true
  },
  {
    id: 'MKT_VE_02',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuál es tu tasa de conversión (visitas a ventas)?',
      'pt-BR': 'Qual é sua taxa de conversão (visitas para vendas)?'
    },
    type: 'single',
    options: [
      { id: 'alta', label: { es: 'Más del 5%', 'pt-BR': 'Mais de 5%' }, impactScore: 100 },
      { id: 'buena', label: { es: '3-5%', 'pt-BR': '3-5%' }, impactScore: 80 },
      { id: 'media', label: { es: '1-3%', 'pt-BR': '1-3%' }, impactScore: 50 },
      { id: 'baja', label: { es: 'Menos del 1%', 'pt-BR': 'Menos de 1%' }, impactScore: 20 }
    ]
  },
  {
    id: 'MKT_VE_03',
    category: 'sales',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Ofrecés envío gratis en tus publicaciones?',
      'pt-BR': 'Você oferece frete grátis em seus anúncios?'
    },
    type: 'single',
    options: [
      { id: 'todos', label: { es: 'Sí, en todos los productos', 'pt-BR': 'Sim, em todos os produtos' }, impactScore: 100 },
      { id: 'mayoria', label: { es: 'En la mayoría', 'pt-BR': 'Na maioria' }, impactScore: 80 },
      { id: 'algunos', label: { es: 'Solo productos seleccionados', 'pt-BR': 'Só produtos selecionados' }, impactScore: 50 },
      { id: 'no', label: { es: 'No ofrezco envío gratis', 'pt-BR': 'Não ofereço frete grátis' }, impactScore: 30 }
    ]
  },
  {
    id: 'MKT_VE_04',
    category: 'marketing',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Participás en campañas promocionales del marketplace (Hot Sale, CyberMonday)?',
      'pt-BR': 'Você participa de campanhas promocionais do marketplace (Black Friday)?'
    },
    type: 'single',
    options: [
      { id: 'todas', label: { es: 'Sí, en todas', 'pt-BR': 'Sim, em todas' }, impactScore: 100 },
      { id: 'principales', label: { es: 'Solo las principales', 'pt-BR': 'Só as principais' }, impactScore: 70 },
      { id: 'pocas', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, impactScore: 40 },
      { id: 'no', label: { es: 'No participo', 'pt-BR': 'Não participo' }, impactScore: 20 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'MKT_FI_01',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuál es tu margen neto después de comisiones y envío?',
      'pt-BR': 'Qual é sua margem líquida depois de comissões e frete?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 30%', 'pt-BR': 'Mais de 30%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '20-30%', 'pt-BR': '20-30%' }, impactScore: 80 },
      { id: 'ajustado', label: { es: '10-20%', 'pt-BR': '10-20%' }, impactScore: 50 },
      { id: 'bajo', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'MKT_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuánto representan las comisiones del marketplace sobre tus ventas?',
      'pt-BR': 'Quanto representam as comissões do marketplace sobre suas vendas?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, impactScore: 100 },
      { id: 'normal', label: { es: '15-25%', 'pt-BR': '15-25%' }, impactScore: 70 },
      { id: 'alto', label: { es: '25-35%', 'pt-BR': '25-35%' }, impactScore: 40 },
      { id: 'muy_alto', label: { es: 'Más del 35%', 'pt-BR': 'Mais de 35%' }, impactScore: 20 }
    ]
  },
  {
    id: 'MKT_FI_03',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Cuánto capital tenés inmovilizado en inventario?',
      'pt-BR': 'Quanto capital você tem imobilizado em estoque?'
    },
    type: 'number',
    min: 0,
    max: 50000000
  },
  {
    id: 'MKT_FI_04',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 6,
    title: {
      es: '¿Cuántos días tarda el marketplace en liberarte los cobros?',
      'pt-BR': 'Quantos dias o marketplace demora para liberar seus pagamentos?'
    },
    type: 'single',
    options: [
      { id: 'inmediato', label: { es: 'Inmediato (MercadoPago Point)', 'pt-BR': 'Imediato' }, impactScore: 100 },
      { id: 'rapido', label: { es: '1-7 días', 'pt-BR': '1-7 dias' }, impactScore: 80 },
      { id: 'normal', label: { es: '7-14 días', 'pt-BR': '7-14 dias' }, impactScore: 50 },
      { id: 'lento', label: { es: 'Más de 14 días', 'pt-BR': 'Mais de 14 dias' }, impactScore: 30 }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'MKT_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿En cuántas horas despachás después de la venta?',
      'pt-BR': 'Em quantas horas você despacha depois da venda?'
    },
    type: 'single',
    options: [
      { id: 'mismo_dia', label: { es: 'Mismo día', 'pt-BR': 'Mesmo dia' }, impactScore: 100 },
      { id: '24h', label: { es: 'Dentro de 24 horas', 'pt-BR': 'Dentro de 24 horas' }, impactScore: 80 },
      { id: '48h', label: { es: '24-48 horas', 'pt-BR': '24-48 horas' }, impactScore: 50 },
      { id: 'mas', label: { es: 'Más de 48 horas', 'pt-BR': 'Mais de 48 horas' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'MKT_OP_02',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: {
      es: '¿Tenés sistema de gestión de inventario sincronizado?',
      'pt-BR': 'Você tem sistema de gestão de estoque sincronizado?'
    },
    type: 'single',
    options: [
      { id: 'profesional', label: { es: 'Sí, ERP/sistema profesional', 'pt-BR': 'Sim, ERP/sistema profissional' }, impactScore: 100 },
      { id: 'basico', label: { es: 'Sistema básico/planilla', 'pt-BR': 'Sistema básico/planilha' }, impactScore: 50 },
      { id: 'manual', label: { es: 'Control manual', 'pt-BR': 'Controle manual' }, impactScore: 20 },
      { id: 'ninguno', label: { es: 'Sin control formal', 'pt-BR': 'Sem controle formal' }, impactScore: 5 }
    ]
  },
  {
    id: 'MKT_OP_03',
    category: 'team',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuántas personas trabajan en el picking y empaque?',
      'pt-BR': 'Quantas pessoas trabalham no picking e empacotamento?'
    },
    type: 'number',
    min: 0,
    max: 50
  },
  {
    id: 'MKT_OP_04',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tenés problemas frecuentes de stock (agotados, sobrestockeados)?',
      'pt-BR': 'Você tem problemas frequentes de estoque (esgotados, sobreestoque)?'
    },
    type: 'single',
    options: [
      { id: 'no', label: { es: 'No, stock siempre óptimo', 'pt-BR': 'Não, estoque sempre ótimo' }, impactScore: 100 },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, impactScore: 60 },
      { id: 'frecuente', label: { es: 'Frecuentemente', 'pt-BR': 'Frequentemente' }, impactScore: 30 },
      { id: 'critico', label: { es: 'Es un problema crítico', 'pt-BR': 'É um problema crítico' }, impactScore: 10 }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'MKT_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántas personas gestionan la operación completa?',
      'pt-BR': 'Quantas pessoas gerenciam a operação completa?'
    },
    type: 'number',
    min: 1,
    max: 100,
    required: true
  },
  {
    id: 'MKT_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tenés rol dedicado a atención al cliente de marketplace?',
      'pt-BR': 'Você tem função dedicada a atendimento ao cliente do marketplace?'
    },
    type: 'single',
    options: [
      { id: 'dedicado', label: { es: 'Sí, persona/equipo dedicado', 'pt-BR': 'Sim, pessoa/equipe dedicada' }, impactScore: 100 },
      { id: 'compartido', label: { es: 'Rol compartido', 'pt-BR': 'Função compartilhada' }, impactScore: 60 },
      { id: 'yo', label: { es: 'Lo hago yo', 'pt-BR': 'Faço eu mesmo' }, impactScore: 30 }
    ]
  },
  {
    id: 'MKT_EQ_03',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 6,
    title: {
      es: '¿Tenés analista de datos/pricing dedicado?',
      'pt-BR': 'Você tem analista de dados/precificação dedicado?'
    },
    type: 'single',
    options: [
      { id: 'si', label: { es: 'Sí, especializado', 'pt-BR': 'Sim, especializado' }, impactScore: 100 },
      { id: 'parcial', label: { es: 'Parcialmente', 'pt-BR': 'Parcialmente' }, impactScore: 50 },
      { id: 'no', label: { es: 'No, lo hago manual', 'pt-BR': 'Não, faço manual' }, impactScore: 20 }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'MKT_OBJ_01',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu objetivo principal como seller?',
      'pt-BR': 'Qual é seu objetivo principal como vendedor?'
    },
    type: 'single',
    options: [
      { id: 'escalar', label: { es: 'Escalar ventas agresivamente', 'pt-BR': 'Escalar vendas agressivamente' }, impactScore: 100 },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad', 'pt-BR': 'Melhorar rentabilidade' }, impactScore: 80 },
      { id: 'diversificar', label: { es: 'Diversificar canales', 'pt-BR': 'Diversificar canais' }, impactScore: 70 },
      { id: 'marca', label: { es: 'Construir marca propia', 'pt-BR': 'Construir marca própria' }, impactScore: 60 }
    ],
    required: true
  },
  {
    id: 'MKT_OBJ_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Planeás expandir a otros marketplaces o países?',
      'pt-BR': 'Você planeja expandir para outros marketplaces ou países?'
    },
    type: 'single',
    options: [
      { id: 'si_corto', label: { es: 'Sí, en los próximos 6 meses', 'pt-BR': 'Sim, nos próximos 6 meses' }, impactScore: 100 },
      { id: 'si_largo', label: { es: 'Sí, pero más adelante', 'pt-BR': 'Sim, mas mais pra frente' }, impactScore: 70 },
      { id: 'evaluando', label: { es: 'Evaluando opciones', 'pt-BR': 'Avaliando opções' }, impactScore: 50 },
      { id: 'no', label: { es: 'No por ahora', 'pt-BR': 'Não por agora' }, impactScore: 30 }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'MKT_RI_01',
    category: 'goals',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor riesgo como seller?',
      'pt-BR': 'Qual é seu maior risco como vendedor?'
    },
    type: 'single',
    options: [
      { id: 'competencia', label: { es: 'Guerra de precios con competencia', 'pt-BR': 'Guerra de preços com concorrência' }, impactScore: 80 },
      { id: 'stock', label: { es: 'Problemas de stock/proveedor', 'pt-BR': 'Problemas de estoque/fornecedor' }, impactScore: 70 },
      { id: 'reputacion', label: { es: 'Pérdida de reputación', 'pt-BR': 'Perda de reputação' }, impactScore: 90 },
      { id: 'cambios', label: { es: 'Cambios en políticas del marketplace', 'pt-BR': 'Mudanças nas políticas do marketplace' }, impactScore: 60 }
    ],
    required: true
  },
  {
    id: 'MKT_RI_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de tu negocio depende del marketplace principal?',
      'pt-BR': 'Que porcentagem do seu negócio depende do marketplace principal?'
    },
    type: 'single',
    options: [
      { id: 'total', label: { es: '100% - único canal', 'pt-BR': '100% - único canal' }, impactScore: 20 },
      { id: 'mayoria', label: { es: '70-99%', 'pt-BR': '70-99%' }, impactScore: 40 },
      { id: 'mitad', label: { es: '50-70%', 'pt-BR': '50-70%' }, impactScore: 60 },
      { id: 'diversificado', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' }, impactScore: 100 }
    ]
  }
];

export default MARKETPLACE_SELLER_QUESTIONS;
