// =============================================
// SUSCRIPCIÓN / CAJAS MENSUALES - CUESTIONARIO HIPER-PERSONALIZADO
// Modelo de negocio recurrente (subscription boxes)
// Quick: 15 preguntas | Complete: 70 preguntas
// =============================================

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const SUSCRIPCION_QUESTIONS: VistaSetupQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'SUB_ID_01',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Qué tipo de suscripción ofrecés?',
      'pt-BR': 'Que tipo de assinatura você oferece?'
    },
    type: 'single',
    options: [
      { id: 'discovery', label: { es: 'Discovery box (productos sorpresa)', 'pt-BR': 'Discovery box (produtos surpresa)' }, impactScore: 80 },
      { id: 'curada', label: { es: 'Caja curada personalizada', 'pt-BR': 'Caixa curada personalizada' }, impactScore: 90 },
      { id: 'reposicion', label: { es: 'Reposición automática', 'pt-BR': 'Reposição automática' }, impactScore: 70 },
      { id: 'acceso', label: { es: 'Acceso/membresía a beneficios', 'pt-BR': 'Acesso/membresia a benefícios' }, impactScore: 75 }
    ],
    required: true
  },
  {
    id: 'SUB_ID_02',
    category: 'identity',
    mode: 'both',
    dimension: 'growth',
    weight: 9,
    title: {
      es: '¿Cuál es el nicho de tu suscripción?',
      'pt-BR': 'Qual é o nicho da sua assinatura?'
    },
    type: 'single',
    options: [
      { id: 'belleza', label: { es: 'Belleza/cosmética', 'pt-BR': 'Beleza/cosméticos' }, emoji: '💄' },
      { id: 'alimentos', label: { es: 'Alimentos gourmet/snacks', 'pt-BR': 'Alimentos gourmet/snacks' }, emoji: '🍫' },
      { id: 'mascotas', label: { es: 'Mascotas', 'pt-BR': 'Pets' }, emoji: '🐕' },
      { id: 'fitness', label: { es: 'Fitness/suplementos', 'pt-BR': 'Fitness/suplementos' }, emoji: '💪' },
      { id: 'hobbies', label: { es: 'Hobbies/crafts', 'pt-BR': 'Hobbies/artesanato' }, emoji: '🎨' },
      { id: 'libros', label: { es: 'Libros/lectura', 'pt-BR': 'Livros/leitura' }, emoji: '📚' },
      { id: 'otro', label: { es: 'Otro nicho', 'pt-BR': 'Outro nicho' }, emoji: '📦' }
    ],
    required: true
  },
  {
    id: 'SUB_ID_03',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: {
      es: '¿Cuánto tiempo lleva operando tu servicio de suscripción?',
      'pt-BR': 'Quanto tempo seu serviço de assinatura está operando?'
    },
    type: 'single',
    options: [
      { id: 'nuevo', label: { es: 'Menos de 6 meses', 'pt-BR': 'Menos de 6 meses' }, impactScore: 40 },
      { id: 'joven', label: { es: '6-18 meses', 'pt-BR': '6-18 meses' }, impactScore: 60 },
      { id: 'establecido', label: { es: '18 meses - 3 años', 'pt-BR': '18 meses - 3 anos' }, impactScore: 80 },
      { id: 'maduro', label: { es: 'Más de 3 años', 'pt-BR': 'Mais de 3 anos' }, impactScore: 100 }
    ]
  },

  // ========== PLANES ==========
  {
    id: 'SUB_OF_01',
    category: 'menu',
    mode: 'both',
    dimension: 'profitability',
    weight: 10,
    title: {
      es: '¿Cuántos planes de suscripción ofrecés?',
      'pt-BR': 'Quantos planos de assinatura você oferece?'
    },
    type: 'single',
    options: [
      { id: 'uno', label: { es: 'Plan único', 'pt-BR': 'Plano único' }, impactScore: 50 },
      { id: 'dos_tres', label: { es: '2-3 planes', 'pt-BR': '2-3 planos' }, impactScore: 80 },
      { id: 'varios', label: { es: '4+ planes', 'pt-BR': '4+ planos' }, impactScore: 70 },
      { id: 'personalizado', label: { es: 'Totalmente personalizado', 'pt-BR': 'Totalmente personalizado' }, impactScore: 90 }
    ],
    required: true
  },
  {
    id: 'SUB_OF_02',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es el precio mensual de tu plan principal?',
      'pt-BR': 'Qual é o preço mensal do seu plano principal?'
    },
    type: 'number',
    min: 0,
    max: 500000,
    required: true
  },
  {
    id: 'SUB_OF_03',
    category: 'operation',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: {
      es: '¿Con qué frecuencia enviás las cajas?',
      'pt-BR': 'Com que frequência você envia as caixas?'
    },
    type: 'single',
    options: [
      { id: 'semanal', label: { es: 'Semanal', 'pt-BR': 'Semanal' }, impactScore: 70 },
      { id: 'quincenal', label: { es: 'Quincenal', 'pt-BR': 'Quinzenal' }, impactScore: 80 },
      { id: 'mensual', label: { es: 'Mensual', 'pt-BR': 'Mensal' }, impactScore: 100 },
      { id: 'bimestral', label: { es: 'Bimestral', 'pt-BR': 'Bimestral' }, impactScore: 60 },
      { id: 'trimestral', label: { es: 'Trimestral', 'pt-BR': 'Trimestral' }, impactScore: 50 }
    ]
  },
  {
    id: 'SUB_OF_04',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: {
      es: '¿Ofrecés descuentos por planes prepagos (3, 6, 12 meses)?',
      'pt-BR': 'Você oferece descontos por planos pré-pagos (3, 6, 12 meses)?'
    },
    type: 'single',
    options: [
      { id: 'todos', label: { es: 'Sí, todos los períodos', 'pt-BR': 'Sim, todos os períodos' }, impactScore: 100 },
      { id: 'algunos', label: { es: 'Solo algunos períodos', 'pt-BR': 'Só alguns períodos' }, impactScore: 70 },
      { id: 'no', label: { es: 'No, solo mensual', 'pt-BR': 'Não, só mensal' }, impactScore: 40 }
    ]
  },
  {
    id: 'SUB_OF_05',
    category: 'menu',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿El suscriptor puede personalizar el contenido de su caja?',
      'pt-BR': 'O assinante pode personalizar o conteúdo da caixa?'
    },
    type: 'single',
    options: [
      { id: 'total', label: { es: 'Sí, totalmente', 'pt-BR': 'Sim, totalmente' }, impactScore: 100 },
      { id: 'parcial', label: { es: 'Parcialmente (preferencias)', 'pt-BR': 'Parcialmente (preferências)' }, impactScore: 70 },
      { id: 'no', label: { es: 'No, caja sorpresa fija', 'pt-BR': 'Não, caixa surpresa fixa' }, impactScore: 50 }
    ]
  },

  // ========== RETENCIÓN ==========
  {
    id: 'SUB_CL_01',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuántos suscriptores activos tenés actualmente?',
      'pt-BR': 'Quantos assinantes ativos você tem atualmente?'
    },
    type: 'single',
    options: [
      { id: 'startup', label: { es: 'Menos de 100', 'pt-BR': 'Menos de 100' }, impactScore: 30 },
      { id: 'small', label: { es: '100-500', 'pt-BR': '100-500' }, impactScore: 50 },
      { id: 'medium', label: { es: '500-2000', 'pt-BR': '500-2000' }, impactScore: 70 },
      { id: 'large', label: { es: '2000-10000', 'pt-BR': '2000-10000' }, impactScore: 90 },
      { id: 'mega', label: { es: 'Más de 10000', 'pt-BR': 'Mais de 10000' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'SUB_CL_02',
    category: 'sales',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu tasa de churn mensual (bajas)?',
      'pt-BR': 'Qual é sua taxa de churn mensal (cancelamentos)?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: 'Menos del 3%', 'pt-BR': 'Menos de 3%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '3-5%', 'pt-BR': '3-5%' }, impactScore: 80 },
      { id: 'normal', label: { es: '5-8%', 'pt-BR': '5-8%' }, impactScore: 50 },
      { id: 'alto', label: { es: '8-12%', 'pt-BR': '8-12%' }, impactScore: 30 },
      { id: 'critico', label: { es: 'Más del 12%', 'pt-BR': 'Mais de 12%' }, impactScore: 10 }
    ],
    required: true
  },
  {
    id: 'SUB_CL_03',
    category: 'sales',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: {
      es: '¿Cuál es el lifetime promedio de un suscriptor (meses)?',
      'pt-BR': 'Qual é o lifetime médio de um assinante (meses)?'
    },
    type: 'number',
    min: 1,
    max: 60,
    required: true
  },
  {
    id: 'SUB_CL_04',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Cuál es el motivo principal de cancelación?',
      'pt-BR': 'Qual é o motivo principal de cancelamento?'
    },
    type: 'single',
    options: [
      { id: 'precio', label: { es: 'Precio/presupuesto', 'pt-BR': 'Preço/orçamento' }, impactScore: 60 },
      { id: 'contenido', label: { es: 'Contenido repetitivo', 'pt-BR': 'Conteúdo repetitivo' }, impactScore: 50 },
      { id: 'expectativas', label: { es: 'No cumple expectativas', 'pt-BR': 'Não cumpre expectativas' }, impactScore: 40 },
      { id: 'logistica', label: { es: 'Problemas de envío', 'pt-BR': 'Problemas de envio' }, impactScore: 70 },
      { id: 'desconocido', label: { es: 'No tenemos data clara', 'pt-BR': 'Não temos dados claros' }, impactScore: 20 }
    ]
  },
  {
    id: 'SUB_CL_05',
    category: 'operation',
    mode: 'complete',
    dimension: 'reputation',
    weight: 6,
    title: {
      es: '¿Tenés programa de pausa (skip) de envíos?',
      'pt-BR': 'Você tem programa de pausa (skip) de envios?'
    },
    type: 'single',
    options: [
      { id: 'flexible', label: { es: 'Sí, muy flexible', 'pt-BR': 'Sim, muito flexível' }, impactScore: 100 },
      { id: 'limitado', label: { es: 'Sí, limitado', 'pt-BR': 'Sim, limitado' }, impactScore: 70 },
      { id: 'no', label: { es: 'No ofrecemos pausa', 'pt-BR': 'Não oferecemos pausa' }, impactScore: 30 }
    ]
  },

  // ========== ADQUISICIÓN ==========
  {
    id: 'SUB_VE_01',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: {
      es: '¿Cuántos nuevos suscriptores adquirís por mes?',
      'pt-BR': 'Quantos novos assinantes você adquire por mês?'
    },
    type: 'single',
    options: [
      { id: 'bajo', label: { es: 'Menos de 50', 'pt-BR': 'Menos de 50' }, impactScore: 30 },
      { id: 'medio', label: { es: '50-200', 'pt-BR': '50-200' }, impactScore: 60 },
      { id: 'alto', label: { es: '200-500', 'pt-BR': '200-500' }, impactScore: 80 },
      { id: 'muy_alto', label: { es: 'Más de 500', 'pt-BR': 'Mais de 500' }, impactScore: 100 }
    ],
    required: true
  },
  {
    id: 'SUB_VE_02',
    category: 'finance',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: {
      es: '¿Cuál es tu costo de adquisición (CAC) por suscriptor?',
      'pt-BR': 'Qual é seu custo de aquisição (CAC) por assinante?'
    },
    type: 'number',
    min: 0,
    max: 100000
  },
  {
    id: 'SUB_VE_03',
    category: 'marketing',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: {
      es: '¿Cuál es tu principal canal de adquisición?',
      'pt-BR': 'Qual é seu principal canal de aquisição?'
    },
    type: 'single',
    options: [
      { id: 'social_ads', label: { es: 'Publicidad en redes sociales', 'pt-BR': 'Publicidade em redes sociais' }, impactScore: 70 },
      { id: 'google', label: { es: 'Google Ads/SEO', 'pt-BR': 'Google Ads/SEO' }, impactScore: 80 },
      { id: 'influencers', label: { es: 'Influencers/afiliados', 'pt-BR': 'Influencers/afiliados' }, impactScore: 75 },
      { id: 'referidos', label: { es: 'Programa de referidos', 'pt-BR': 'Programa de indicação' }, impactScore: 90 },
      { id: 'organico', label: { es: 'Orgánico/boca en boca', 'pt-BR': 'Orgânico/boca a boca' }, impactScore: 100 }
    ]
  },
  {
    id: 'SUB_VE_04',
    category: 'marketing',
    mode: 'complete',
    dimension: 'growth',
    weight: 6,
    title: {
      es: '¿Tenés programa de referidos activo?',
      'pt-BR': 'Você tem programa de indicação ativo?'
    },
    type: 'single',
    options: [
      { id: 'activo', label: { es: 'Sí, muy activo', 'pt-BR': 'Sim, muito ativo' }, impactScore: 100 },
      { id: 'basico', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, impactScore: 60 },
      { id: 'no', label: { es: 'No tenemos', 'pt-BR': 'Não temos' }, impactScore: 20 }
    ]
  },

  // ========== FINANZAS ==========
  {
    id: 'SUB_FI_01',
    category: 'finance',
    mode: 'both',
    dimension: 'finances',
    weight: 10,
    title: {
      es: '¿Cuál es tu MRR (ingreso recurrente mensual)?',
      'pt-BR': 'Qual é seu MRR (receita recorrente mensal)?'
    },
    type: 'number',
    min: 0,
    max: 100000000,
    required: true
  },
  {
    id: 'SUB_FI_02',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu margen bruto por caja enviada?',
      'pt-BR': 'Qual é sua margem bruta por caixa enviada?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, impactScore: 100 },
      { id: 'bueno', label: { es: '40-50%', 'pt-BR': '40-50%' }, impactScore: 80 },
      { id: 'normal', label: { es: '30-40%', 'pt-BR': '30-40%' }, impactScore: 60 },
      { id: 'ajustado', label: { es: '20-30%', 'pt-BR': '20-30%' }, impactScore: 40 },
      { id: 'bajo', label: { es: 'Menos del 20%', 'pt-BR': 'Menos de 20%' }, impactScore: 20 }
    ],
    required: true
  },
  {
    id: 'SUB_FI_03',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: {
      es: '¿Cuál es tu ratio LTV/CAC?',
      'pt-BR': 'Qual é seu ratio LTV/CAC?'
    },
    type: 'single',
    options: [
      { id: 'excelente', label: { es: 'Más de 4x', 'pt-BR': 'Mais de 4x' }, impactScore: 100 },
      { id: 'bueno', label: { es: '3-4x', 'pt-BR': '3-4x' }, impactScore: 80 },
      { id: 'normal', label: { es: '2-3x', 'pt-BR': '2-3x' }, impactScore: 60 },
      { id: 'bajo', label: { es: '1-2x', 'pt-BR': '1-2x' }, impactScore: 30 },
      { id: 'negativo', label: { es: 'Menos de 1x', 'pt-BR': 'Menos de 1x' }, impactScore: 10 }
    ]
  },
  {
    id: 'SUB_FI_04',
    category: 'finance',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: {
      es: '¿Qué porcentaje de suscriptores pagan con tarjeta automática?',
      'pt-BR': 'Que porcentagem de assinantes pagam com cartão automático?'
    },
    type: 'single',
    options: [
      { id: 'alto', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, impactScore: 100 },
      { id: 'medio', label: { es: '60-80%', 'pt-BR': '60-80%' }, impactScore: 70 },
      { id: 'bajo', label: { es: 'Menos del 60%', 'pt-BR': 'Menos de 60%' }, impactScore: 40 }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'SUB_OP_01',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: {
      es: '¿Cómo gestionás el fulfillment de las cajas?',
      'pt-BR': 'Como você gerencia o fulfillment das caixas?'
    },
    type: 'single',
    options: [
      { id: 'propio', label: { es: 'Fulfillment propio', 'pt-BR': 'Fulfillment próprio' }, impactScore: 70 },
      { id: 'tercerizado', label: { es: 'Tercerizado (3PL)', 'pt-BR': 'Terceirizado (3PL)' }, impactScore: 90 },
      { id: 'hibrido', label: { es: 'Híbrido', 'pt-BR': 'Híbrido' }, impactScore: 80 }
    ],
    required: true
  },
  {
    id: 'SUB_OP_02',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: {
      es: '¿Cuántos días antes del envío cerrás las personalizaciones?',
      'pt-BR': 'Quantos dias antes do envio você fecha as personalizações?'
    },
    type: 'number',
    min: 0,
    max: 30
  },
  {
    id: 'SUB_OP_03',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 6,
    title: {
      es: '¿Tenés problemas frecuentes de productos rotos en tránsito?',
      'pt-BR': 'Você tem problemas frequentes de produtos quebrados no transporte?'
    },
    type: 'single',
    options: [
      { id: 'no', label: { es: 'No, packaging muy seguro', 'pt-BR': 'Não, embalagem muito segura' }, impactScore: 100 },
      { id: 'ocasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' }, impactScore: 60 },
      { id: 'frecuente', label: { es: 'Es un problema recurrente', 'pt-BR': 'É um problema recorrente' }, impactScore: 20 }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'SUB_EQ_01',
    category: 'team',
    mode: 'both',
    dimension: 'team',
    weight: 8,
    title: {
      es: '¿Cuántas personas trabajan full-time en la operación?',
      'pt-BR': 'Quantas pessoas trabalham full-time na operação?'
    },
    type: 'number',
    min: 1,
    max: 100,
    required: true
  },
  {
    id: 'SUB_EQ_02',
    category: 'team',
    mode: 'complete',
    dimension: 'team',
    weight: 7,
    title: {
      es: '¿Tenés rol dedicado a curación de productos?',
      'pt-BR': 'Você tem função dedicada a curação de produtos?'
    },
    type: 'single',
    options: [
      { id: 'dedicado', label: { es: 'Sí, curador especializado', 'pt-BR': 'Sim, curador especializado' }, impactScore: 100 },
      { id: 'compartido', label: { es: 'Rol compartido', 'pt-BR': 'Função compartilhada' }, impactScore: 60 },
      { id: 'fundador', label: { es: 'Lo hace el fundador', 'pt-BR': 'O fundador faz' }, impactScore: 40 }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'SUB_OBJ_01',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 10,
    title: {
      es: '¿Cuál es tu objetivo principal ahora?',
      'pt-BR': 'Qual é seu objetivo principal agora?'
    },
    type: 'single',
    options: [
      { id: 'crecimiento', label: { es: 'Crecer base de suscriptores', 'pt-BR': 'Crescer base de assinantes' }, impactScore: 80 },
      { id: 'retencion', label: { es: 'Reducir churn', 'pt-BR': 'Reduzir churn' }, impactScore: 90 },
      { id: 'rentabilidad', label: { es: 'Mejorar rentabilidad por caja', 'pt-BR': 'Melhorar rentabilidade por caixa' }, impactScore: 85 },
      { id: 'ltv', label: { es: 'Aumentar LTV', 'pt-BR': 'Aumentar LTV' }, impactScore: 95 }
    ],
    required: true
  },
  {
    id: 'SUB_OBJ_02',
    category: 'goals',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: {
      es: '¿Planeás agregar productos adicionales de compra única?',
      'pt-BR': 'Você planeja adicionar produtos adicionais de compra única?'
    },
    type: 'single',
    options: [
      { id: 'si_activo', label: { es: 'Ya lo tenemos', 'pt-BR': 'Já temos' }, impactScore: 100 },
      { id: 'si_planeado', label: { es: 'En planes próximos', 'pt-BR': 'Nos planos próximos' }, impactScore: 70 },
      { id: 'no', label: { es: 'No, solo suscripción', 'pt-BR': 'Não, só assinatura' }, impactScore: 50 }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'SUB_RI_01',
    category: 'goals',
    mode: 'both',
    dimension: 'finances',
    weight: 9,
    title: {
      es: '¿Cuál es tu mayor desafío actual?',
      'pt-BR': 'Qual é seu maior desafio atual?'
    },
    type: 'single',
    options: [
      { id: 'churn', label: { es: 'Alto churn/cancelaciones', 'pt-BR': 'Alto churn/cancelamentos' }, impactScore: 70 },
      { id: 'cac', label: { es: 'CAC muy alto', 'pt-BR': 'CAC muito alto' }, impactScore: 60 },
      { id: 'margenes', label: { es: 'Márgenes bajos', 'pt-BR': 'Margens baixas' }, impactScore: 50 },
      { id: 'operaciones', label: { es: 'Complejidad operativa', 'pt-BR': 'Complexidade operacional' }, impactScore: 40 },
      { id: 'proveedores', label: { es: 'Conseguir productos/proveedores', 'pt-BR': 'Conseguir produtos/fornecedores' }, impactScore: 45 }
    ],
    required: true
  }
];

export default SUSCRIPCION_QUESTIONS;
