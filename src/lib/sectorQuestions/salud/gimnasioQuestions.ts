// Gimnasio / Fitness Center - Cuestionario Hiper-Personalizado
// Quick: 15 preguntas | Complete: 70 preguntas
// 12 categorías + 7 dimensiones de salud

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const GIMNASIO_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'GYM_ID_01',
    category: 'identity',
    subcategory: 'gym_type',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipo de gimnasio operás?',
      'pt-BR': 'Que tipo de academia você opera?'
    },
    type: 'single',
    options: [
      { id: 'traditional', label: { es: 'Gimnasio tradicional (máquinas + peso libre)', 'pt-BR': 'Academia tradicional (máquinas + peso livre)' }, emoji: '🏋️' },
      { id: 'boutique', label: { es: 'Boutique/Especializado (CrossFit, F45, etc.)', 'pt-BR': 'Boutique/Especializado (CrossFit, F45, etc.)' }, emoji: '⚡' },
      { id: 'lowcost', label: { es: 'Low cost / 24h', 'pt-BR': 'Low cost / 24h' }, emoji: '💰' },
      { id: 'premium', label: { es: 'Premium/Club deportivo', 'pt-BR': 'Premium/Clube esportivo' }, emoji: '🌟' },
      { id: 'functional', label: { es: 'Centro de entrenamiento funcional', 'pt-BR': 'Centro de treinamento funcional' }, emoji: '🔥' },
      { id: 'women_only', label: { es: 'Solo para mujeres', 'pt-BR': 'Apenas para mulheres' }, emoji: '👩' }
    ]
  },
  {
    id: 'GYM_ID_02',
    category: 'identity',
    subcategory: 'specialties',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuáles son tus servicios principales?',
      'pt-BR': 'Quais são seus serviços principais?'
    },
    type: 'multi',
    options: [
      { id: 'weights', label: { es: 'Musculación/Peso libre', 'pt-BR': 'Musculação/Peso livre' }, emoji: '💪' },
      { id: 'cardio', label: { es: 'Área cardio', 'pt-BR': 'Área cardio' }, emoji: '🏃' },
      { id: 'classes', label: { es: 'Clases grupales', 'pt-BR': 'Aulas em grupo' }, emoji: '👥' },
      { id: 'functional', label: { es: 'Entrenamiento funcional', 'pt-BR': 'Treinamento funcional' }, emoji: '🔥' },
      { id: 'crossfit', label: { es: 'CrossFit/HIIT', 'pt-BR': 'CrossFit/HIIT' }, emoji: '⚡' },
      { id: 'pt', label: { es: 'Personal training', 'pt-BR': 'Personal training' }, emoji: '🎯' },
      { id: 'pool', label: { es: 'Pileta/Natación', 'pt-BR': 'Piscina/Natação' }, emoji: '🏊' },
      { id: 'spa', label: { es: 'Spa/Sauna', 'pt-BR': 'Spa/Sauna' }, emoji: '♨️' }
    ]
  },
  {
    id: 'GYM_ID_03',
    category: 'identity',
    subcategory: 'differentiator',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es tu diferenciador principal vs la competencia?',
      'pt-BR': 'Qual é seu diferencial principal vs a concorrência?'
    },
    type: 'single',
    options: [
      { id: 'equipment', label: { es: 'Equipamiento de última generación', 'pt-BR': 'Equipamento de última geração' }, emoji: '🔬' },
      { id: 'community', label: { es: 'Comunidad/ambiente', 'pt-BR': 'Comunidade/ambiente' }, emoji: '👥' },
      { id: 'trainers', label: { es: 'Calidad de entrenadores', 'pt-BR': 'Qualidade dos treinadores' }, emoji: '🏆' },
      { id: 'price', label: { es: 'Mejor precio', 'pt-BR': 'Melhor preço' }, emoji: '💰' },
      { id: 'location', label: { es: 'Ubicación privilegiada', 'pt-BR': 'Localização privilegiada' }, emoji: '📍' },
      { id: 'hours', label: { es: 'Horario extendido/24h', 'pt-BR': 'Horário estendido/24h' }, emoji: '🕐' },
      { id: 'classes', label: { es: 'Variedad de clases', 'pt-BR': 'Variedade de aulas' }, emoji: '📋' }
    ]
  },

  // ========== OFERTA Y SERVICIOS ==========
  {
    id: 'GYM_OF_01',
    category: 'offering',
    subcategory: 'membership_types',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipos de membresías ofrecés?',
      'pt-BR': 'Que tipos de mensalidades você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'monthly', label: { es: 'Mensual', 'pt-BR': 'Mensal' } },
      { id: 'quarterly', label: { es: 'Trimestral', 'pt-BR': 'Trimestral' } },
      { id: 'semester', label: { es: 'Semestral', 'pt-BR': 'Semestral' } },
      { id: 'annual', label: { es: 'Anual', 'pt-BR': 'Anual' } },
      { id: 'per_class', label: { es: 'Por clase/sesión', 'pt-BR': 'Por aula/sessão' } },
      { id: 'unlimited', label: { es: 'Ilimitado/Premium', 'pt-BR': 'Ilimitado/Premium' } },
      { id: 'off_peak', label: { es: 'Horario reducido (off-peak)', 'pt-BR': 'Horário reduzido (off-peak)' } }
    ]
  },
  {
    id: 'GYM_OF_02',
    category: 'offering',
    subcategory: 'classes',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántas clases grupales ofrecés por semana?',
      'pt-BR': 'Quantas aulas em grupo você oferece por semana?'
    },
    type: 'single',
    options: [
      { id: 'none', label: { es: 'No ofrecemos clases', 'pt-BR': 'Não oferecemos aulas' } },
      { id: 'few', label: { es: '1-10 clases', 'pt-BR': '1-10 aulas' } },
      { id: 'moderate', label: { es: '10-30 clases', 'pt-BR': '10-30 aulas' } },
      { id: 'many', label: { es: '30-50 clases', 'pt-BR': '30-50 aulas' } },
      { id: 'extensive', label: { es: 'Más de 50 clases', 'pt-BR': 'Mais de 50 aulas' } }
    ]
  },
  {
    id: 'GYM_OF_03',
    category: 'offering',
    subcategory: 'personal_training',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cómo es tu modelo de personal training?',
      'pt-BR': 'Como é seu modelo de personal training?'
    },
    type: 'single',
    options: [
      { id: 'in_house', label: { es: 'Entrenadores propios del gym', 'pt-BR': 'Treinadores próprios da academia' } },
      { id: 'external', label: { es: 'PTs externos que pagan canon', 'pt-BR': 'PTs externos que pagam taxa' } },
      { id: 'mixed', label: { es: 'Mixto (propios + externos)', 'pt-BR': 'Misto (próprios + externos)' } },
      { id: 'no_pt', label: { es: 'No ofrecemos personal training', 'pt-BR': 'Não oferecemos personal training' } }
    ]
  },
  {
    id: 'GYM_OF_04',
    category: 'offering',
    subcategory: 'additional_services',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué servicios adicionales ofrecés?',
      'pt-BR': 'Quais serviços adicionais você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'nutrition', label: { es: 'Nutrición', 'pt-BR': 'Nutrição' } },
      { id: 'physio', label: { es: 'Fisioterapia/Kinesiología', 'pt-BR': 'Fisioterapia' } },
      { id: 'store', label: { es: 'Tienda de suplementos', 'pt-BR': 'Loja de suplementos' } },
      { id: 'cafe', label: { es: 'Cafetería/Snack bar', 'pt-BR': 'Cafeteria/Lanchonete' } },
      { id: 'lockers', label: { es: 'Lockers premium', 'pt-BR': 'Armários premium' } },
      { id: 'childcare', label: { es: 'Guardería infantil', 'pt-BR': 'Creche infantil' } },
      { id: 'parking', label: { es: 'Estacionamiento', 'pt-BR': 'Estacionamento' } },
      { id: 'none', label: { es: 'Solo gimnasio', 'pt-BR': 'Apenas academia' } }
    ]
  },

  // ========== CLIENTE Y DEMANDA ==========
  {
    id: 'GYM_CL_01',
    category: 'demand',
    subcategory: 'member_count',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos socios activos tenés actualmente?',
      'pt-BR': 'Quantos sócios ativos você tem atualmente?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: 'Menos de 100', 'pt-BR': 'Menos de 100' } },
      { id: 'small', label: { es: '100-300', 'pt-BR': '100-300' } },
      { id: 'medium', label: { es: '300-700', 'pt-BR': '300-700' } },
      { id: 'large', label: { es: '700-1500', 'pt-BR': '700-1500' } },
      { id: 'very_large', label: { es: '1500-3000', 'pt-BR': '1500-3000' } },
      { id: 'mega', label: { es: 'Más de 3000', 'pt-BR': 'Mais de 3000' } }
    ]
  },
  {
    id: 'GYM_CL_02',
    category: 'demand',
    subcategory: 'member_profile',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el perfil principal de tus socios?',
      'pt-BR': 'Qual é o perfil principal dos seus sócios?'
    },
    type: 'single',
    options: [
      { id: 'young', label: { es: 'Jóvenes (18-30)', 'pt-BR': 'Jovens (18-30)' } },
      { id: 'professionals', label: { es: 'Profesionales (30-45)', 'pt-BR': 'Profissionais (30-45)' } },
      { id: 'mature', label: { es: 'Adultos (45-60)', 'pt-BR': 'Adultos (45-60)' } },
      { id: 'seniors', label: { es: 'Adultos mayores (+60)', 'pt-BR': 'Idosos (+60)' } },
      { id: 'families', label: { es: 'Familias', 'pt-BR': 'Famílias' } },
      { id: 'mixed', label: { es: 'Mix variado', 'pt-BR': 'Mix variado' } }
    ]
  },
  {
    id: 'GYM_CL_03',
    category: 'demand',
    subcategory: 'peak_hours',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuáles son tus horarios pico?',
      'pt-BR': 'Quais são seus horários de pico?'
    },
    type: 'multi',
    options: [
      { id: 'early_morning', label: { es: 'Mañana temprano (6-8h)', 'pt-BR': 'Manhã cedo (6-8h)' } },
      { id: 'morning', label: { es: 'Media mañana (8-11h)', 'pt-BR': 'Meio da manhã (8-11h)' } },
      { id: 'lunch', label: { es: 'Mediodía (12-14h)', 'pt-BR': 'Meio-dia (12-14h)' } },
      { id: 'afternoon', label: { es: 'Tarde (16-18h)', 'pt-BR': 'Tarde (16-18h)' } },
      { id: 'evening', label: { es: 'Noche (18-21h)', 'pt-BR': 'Noite (18-21h)' } },
      { id: 'late_night', label: { es: 'Noche tarde (21-23h)', 'pt-BR': 'Noite tarde (21-23h)' } }
    ]
  },
  {
    id: 'GYM_CL_04',
    category: 'demand',
    subcategory: 'capacity',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿A qué % de capacidad operás en horarios pico?',
      'pt-BR': 'A qual % de capacidade você opera nos horários de pico?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 50%', 'pt-BR': 'Menos de 50%' } },
      { id: 'medium', label: { es: '50-70%', 'pt-BR': '50-70%' } },
      { id: 'high', label: { es: '70-90%', 'pt-BR': '70-90%' } },
      { id: 'full', label: { es: 'Más del 90% (casi lleno)', 'pt-BR': 'Mais de 90% (quase cheio)' } },
      { id: 'overcrowded', label: { es: 'Saturado (hay quejas)', 'pt-BR': 'Saturado (há reclamações)' } }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'GYM_VE_01',
    category: 'sales',
    subcategory: 'acquisition',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cómo captás nuevos socios?',
      'pt-BR': 'Como você capta novos sócios?'
    },
    type: 'multi',
    options: [
      { id: 'referral', label: { es: 'Referidos de socios actuales', 'pt-BR': 'Indicações de sócios atuais' }, emoji: '💬' },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'google', label: { es: 'Google Ads / SEO', 'pt-BR': 'Google Ads / SEO' }, emoji: '🔍' },
      { id: 'walkin', label: { es: 'Walk-ins / ubicación', 'pt-BR': 'Walk-ins / localização' }, emoji: '🚶' },
      { id: 'corporate', label: { es: 'Convenios empresariales', 'pt-BR': 'Convênios empresariais' }, emoji: '🏢' },
      { id: 'promo', label: { es: 'Promociones y ofertas', 'pt-BR': 'Promoções e ofertas' }, emoji: '🏷️' }
    ]
  },
  {
    id: 'GYM_VE_02',
    category: 'sales',
    subcategory: 'trial',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecés clases de prueba gratuitas?',
      'pt-BR': 'Você oferece aulas experimentais gratuitas?'
    },
    type: 'single',
    options: [
      { id: 'yes_day', label: { es: 'Sí, pase por un día', 'pt-BR': 'Sim, passe por um dia' } },
      { id: 'yes_week', label: { es: 'Sí, semana de prueba', 'pt-BR': 'Sim, semana experimental' } },
      { id: 'yes_class', label: { es: 'Sí, una clase específica', 'pt-BR': 'Sim, uma aula específica' } },
      { id: 'paid_trial', label: { es: 'Prueba paga con descuento', 'pt-BR': 'Teste pago com desconto' } },
      { id: 'no', label: { es: 'No ofrecemos prueba gratis', 'pt-BR': 'Não oferecemos teste grátis' } }
    ]
  },
  {
    id: 'GYM_VE_03',
    category: 'sales',
    subcategory: 'conversion',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué % de visitas de prueba se convierten en socios?',
      'pt-BR': 'Qual % de visitas experimentais se convertem em sócios?'
    },
    type: 'single',
    options: [
      { id: 'excellent', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🏆' },
      { id: 'good', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '✅' },
      { id: 'medium', label: { es: '25-40%', 'pt-BR': '25-40%' }, emoji: '⚠️' },
      { id: 'low', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo medimos', 'pt-BR': 'Não medimos' }, emoji: '❓' }
    ]
  },

  // ========== FINANZAS Y MÁRGENES ==========
  {
    id: 'GYM_FI_01',
    category: 'finance',
    subcategory: 'avg_membership',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el precio de la membresía mensual básica?',
      'pt-BR': 'Qual é o preço da mensalidade básica?'
    },
    type: 'single',
    options: [
      { id: 'budget', label: { es: 'Menos de $25k ARS / R$150', 'pt-BR': 'Menos de R$150 / $25k ARS' } },
      { id: 'standard', label: { es: '$25k-50k ARS / R$150-300', 'pt-BR': 'R$150-300 / $25k-50k ARS' } },
      { id: 'mid', label: { es: '$50k-80k ARS / R$300-500', 'pt-BR': 'R$300-500 / $50k-80k ARS' } },
      { id: 'premium', label: { es: '$80k-150k ARS / R$500-900', 'pt-BR': 'R$500-900 / $80k-150k ARS' } },
      { id: 'luxury', label: { es: 'Más de $150k ARS / R$900', 'pt-BR': 'Mais de R$900 / $150k ARS' } }
    ]
  },
  {
    id: 'GYM_FI_02',
    category: 'finance',
    subcategory: 'monthly_revenue',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es la facturación mensual del gimnasio?',
      'pt-BR': 'Qual é o faturamento mensal da academia?'
    },
    type: 'single',
    options: [
      { id: 'tier1', label: { es: 'Menos de $5M ARS / R$120k', 'pt-BR': 'Menos de R$120k / $5M ARS' } },
      { id: 'tier2', label: { es: '$5M-15M ARS / R$120k-400k', 'pt-BR': 'R$120k-400k / $5M-15M ARS' } },
      { id: 'tier3', label: { es: '$15M-40M ARS / R$400k-1M', 'pt-BR': 'R$400k-1M / $15M-40M ARS' } },
      { id: 'tier4', label: { es: '$40M-100M ARS / R$1M-2.5M', 'pt-BR': 'R$1M-2.5M / $40M-100M ARS' } },
      { id: 'tier5', label: { es: 'Más de $100M ARS / R$2.5M', 'pt-BR': 'Mais de R$2.5M / $100M ARS' } }
    ]
  },
  {
    id: 'GYM_FI_03',
    category: 'finance',
    subcategory: 'churn',
    dimension: 'finances',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu tasa de baja/cancelación mensual?',
      'pt-BR': 'Qual é sua taxa de cancelamento mensal?'
    },
    type: 'single',
    options: [
      { id: 'excellent', label: { es: 'Menos del 3%', 'pt-BR': 'Menos de 3%' }, emoji: '🏆' },
      { id: 'good', label: { es: '3-5%', 'pt-BR': '3-5%' }, emoji: '✅' },
      { id: 'average', label: { es: '5-8%', 'pt-BR': '5-8%' }, emoji: '⚠️' },
      { id: 'high', label: { es: '8-12%', 'pt-BR': '8-12%' }, emoji: '🔴' },
      { id: 'critical', label: { es: 'Más del 12%', 'pt-BR': 'Mais de 12%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo medimos', 'pt-BR': 'Não medimos' }, emoji: '❓' }
    ]
  },
  {
    id: 'GYM_FI_04',
    category: 'finance',
    subcategory: 'revenue_mix',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué % de ingresos viene de fuentes adicionales (no membresías)?',
      'pt-BR': 'Qual % da receita vem de fontes adicionais (não mensalidades)?'
    },
    type: 'single',
    options: [
      { id: 'minimal', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' } },
      { id: 'some', label: { es: '10-20%', 'pt-BR': '10-20%' } },
      { id: 'moderate', label: { es: '20-35%', 'pt-BR': '20-35%' } },
      { id: 'significant', label: { es: 'Más del 35%', 'pt-BR': 'Mais de 35%' } }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'GYM_OP_01',
    category: 'operation',
    subcategory: 'size',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos metros cuadrados tiene el gimnasio?',
      'pt-BR': 'Quantos metros quadrados tem a academia?'
    },
    type: 'single',
    options: [
      { id: 'small', label: { es: 'Menos de 200 m²', 'pt-BR': 'Menos de 200 m²' } },
      { id: 'medium', label: { es: '200-500 m²', 'pt-BR': '200-500 m²' } },
      { id: 'large', label: { es: '500-1000 m²', 'pt-BR': '500-1000 m²' } },
      { id: 'very_large', label: { es: '1000-2000 m²', 'pt-BR': '1000-2000 m²' } },
      { id: 'mega', label: { es: 'Más de 2000 m²', 'pt-BR': 'Mais de 2000 m²' } }
    ]
  },
  {
    id: 'GYM_OP_02',
    category: 'operation',
    subcategory: 'hours',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu horario de apertura?',
      'pt-BR': 'Qual é seu horário de abertura?'
    },
    type: 'single',
    options: [
      { id: 'standard', label: { es: 'Horario comercial (6-22h)', 'pt-BR': 'Horário comercial (6-22h)' } },
      { id: 'extended', label: { es: 'Horario extendido (5-24h)', 'pt-BR': 'Horário estendido (5-24h)' } },
      { id: '24h', label: { es: '24 horas', 'pt-BR': '24 horas' } },
      { id: 'limited', label: { es: 'Horario reducido', 'pt-BR': 'Horário reduzido' } }
    ]
  },
  {
    id: 'GYM_OP_03',
    category: 'operation',
    subcategory: 'equipment_age',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué antigüedad tiene tu equipamiento promedio?',
      'pt-BR': 'Qual é a idade média do seu equipamento?'
    },
    type: 'single',
    options: [
      { id: 'new', label: { es: 'Menos de 2 años', 'pt-BR': 'Menos de 2 anos' }, emoji: '✨' },
      { id: 'recent', label: { es: '2-5 años', 'pt-BR': '2-5 anos' }, emoji: '👍' },
      { id: 'mature', label: { es: '5-8 años', 'pt-BR': '5-8 anos' }, emoji: '⚠️' },
      { id: 'old', label: { es: 'Más de 8 años', 'pt-BR': 'Mais de 8 anos' }, emoji: '🔧' }
    ]
  },
  {
    id: 'GYM_OP_04',
    category: 'operation',
    subcategory: 'branches',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuántas sedes tenés?',
      'pt-BR': 'Quantas unidades você tem?'
    },
    type: 'single',
    options: [
      { id: 'single', label: { es: 'Una única sede', 'pt-BR': 'Uma única unidade' } },
      { id: 'few', label: { es: '2-3 sedes', 'pt-BR': '2-3 unidades' } },
      { id: 'network', label: { es: '4-10 sedes', 'pt-BR': '4-10 unidades' } },
      { id: 'chain', label: { es: 'Más de 10 sedes', 'pt-BR': 'Mais de 10 unidades' } }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'GYM_MK_01',
    category: 'marketing',
    subcategory: 'digital_presence',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué presencia digital tenés?',
      'pt-BR': 'Qual presença digital você tem?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram activo', 'pt-BR': 'Instagram ativo' }, emoji: '📸' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '👥' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'youtube', label: { es: 'YouTube', 'pt-BR': 'YouTube' }, emoji: '📺' },
      { id: 'website', label: { es: 'Sitio web propio', 'pt-BR': 'Site próprio' }, emoji: '🌐' },
      { id: 'google', label: { es: 'Google My Business optimizado', 'pt-BR': 'Google Meu Negócio otimizado' }, emoji: '🔍' }
    ]
  },
  {
    id: 'GYM_MK_02',
    category: 'marketing',
    subcategory: 'budget',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuánto invertís en marketing mensualmente?',
      'pt-BR': 'Quanto você investe em marketing mensalmente?'
    },
    type: 'single',
    options: [
      { id: 'none', label: { es: 'Nada', 'pt-BR': 'Nada' } },
      { id: 'low', label: { es: 'Menos de $200k ARS / R$5k', 'pt-BR': 'Menos de R$5k / $200k ARS' } },
      { id: 'medium', label: { es: '$200k-1M ARS / R$5k-25k', 'pt-BR': 'R$5k-25k / $200k-1M ARS' } },
      { id: 'high', label: { es: '$1M-3M ARS / R$25k-75k', 'pt-BR': 'R$25k-75k / $1M-3M ARS' } },
      { id: 'very_high', label: { es: 'Más de $3M ARS / R$75k', 'pt-BR': 'Mais de R$75k / $3M ARS' } }
    ]
  },

  // ========== RETENCIÓN ==========
  {
    id: 'GYM_RE_01',
    category: 'retention',
    subcategory: 'engagement',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué % de socios asiste al menos 8 veces al mes?',
      'pt-BR': 'Qual % de sócios frequenta pelo menos 8 vezes por mês?'
    },
    type: 'single',
    options: [
      { id: 'high', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '🏆' },
      { id: 'good', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '✅' },
      { id: 'medium', label: { es: '25-40%', 'pt-BR': '25-40%' }, emoji: '⚠️' },
      { id: 'low', label: { es: 'Menos del 25%', 'pt-BR': 'Menos de 25%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo medimos', 'pt-BR': 'Não medimos' }, emoji: '❓' }
    ]
  },
  {
    id: 'GYM_RE_02',
    category: 'retention',
    subcategory: 'programs',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Tenés programas de retención activos?',
      'pt-BR': 'Você tem programas de retenção ativos?'
    },
    type: 'multi',
    options: [
      { id: 'onboarding', label: { es: 'Onboarding estructurado para nuevos', 'pt-BR': 'Onboarding estruturado para novos' } },
      { id: 'check_in', label: { es: 'Check-ins con socios inactivos', 'pt-BR': 'Check-ins com sócios inativos' } },
      { id: 'challenges', label: { es: 'Desafíos y competencias', 'pt-BR': 'Desafios e competições' } },
      { id: 'community', label: { es: 'Eventos de comunidad', 'pt-BR': 'Eventos de comunidade' } },
      { id: 'rewards', label: { es: 'Programa de rewards/puntos', 'pt-BR': 'Programa de rewards/pontos' } },
      { id: 'none', label: { es: 'No tenemos programas formales', 'pt-BR': 'Não temos programas formais' } }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'GYM_EQ_01',
    category: 'team',
    subcategory: 'size',
    dimension: 'team',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos empleados tenés?',
      'pt-BR': 'Quantos funcionários você tem?'
    },
    type: 'single',
    options: [
      { id: 'micro', label: { es: '1-5', 'pt-BR': '1-5' } },
      { id: 'small', label: { es: '6-15', 'pt-BR': '6-15' } },
      { id: 'medium', label: { es: '16-30', 'pt-BR': '16-30' } },
      { id: 'large', label: { es: '31-60', 'pt-BR': '31-60' } },
      { id: 'very_large', label: { es: 'Más de 60', 'pt-BR': 'Mais de 60' } }
    ]
  },
  {
    id: 'GYM_EQ_02',
    category: 'team',
    subcategory: 'trainers',
    dimension: 'team',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuántos instructores/entrenadores tenés?',
      'pt-BR': 'Quantos instrutores/treinadores você tem?'
    },
    type: 'single',
    options: [
      { id: 'few', label: { es: '1-3', 'pt-BR': '1-3' } },
      { id: 'some', label: { es: '4-8', 'pt-BR': '4-8' } },
      { id: 'many', label: { es: '9-15', 'pt-BR': '9-15' } },
      { id: 'lots', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' } }
    ]
  },

  // ========== TECNOLOGÍA ==========
  {
    id: 'GYM_TEC_01',
    category: 'technology',
    subcategory: 'management',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué sistema de gestión usás?',
      'pt-BR': 'Qual sistema de gestão você usa?'
    },
    type: 'single',
    options: [
      { id: 'specialized', label: { es: 'Software especializado de gimnasios', 'pt-BR': 'Software especializado de academias' } },
      { id: 'generic', label: { es: 'Sistema genérico de gestión', 'pt-BR': 'Sistema genérico de gestão' } },
      { id: 'excel', label: { es: 'Excel/planillas', 'pt-BR': 'Excel/planilhas' } },
      { id: 'manual', label: { es: 'Principalmente manual', 'pt-BR': 'Principalmente manual' } }
    ]
  },
  {
    id: 'GYM_TEC_02',
    category: 'technology',
    subcategory: 'access',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué sistema de acceso tenés?',
      'pt-BR': 'Qual sistema de acesso você tem?'
    },
    type: 'single',
    options: [
      { id: 'biometric', label: { es: 'Biométrico (huella, facial)', 'pt-BR': 'Biométrico (digital, facial)' } },
      { id: 'card', label: { es: 'Tarjeta/llavero magnético', 'pt-BR': 'Cartão/chaveiro magnético' } },
      { id: 'app', label: { es: 'App móvil con QR', 'pt-BR': 'App móvel com QR' } },
      { id: 'manual', label: { es: 'Control manual en recepción', 'pt-BR': 'Controle manual na recepção' } }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'GYM_OB_01',
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
      { id: 'members', label: { es: 'Aumentar cantidad de socios', 'pt-BR': 'Aumentar quantidade de sócios' }, emoji: '📈' },
      { id: 'retention', label: { es: 'Reducir cancelaciones', 'pt-BR': 'Reduzir cancelamentos' }, emoji: '🔄' },
      { id: 'revenue', label: { es: 'Mejorar ingresos/rentabilidad', 'pt-BR': 'Melhorar receita/rentabilidade' }, emoji: '💰' },
      { id: 'expand', label: { es: 'Abrir nueva sede', 'pt-BR': 'Abrir nova unidade' }, emoji: '🏢' },
      { id: 'equipment', label: { es: 'Renovar equipamiento', 'pt-BR': 'Renovar equipamento' }, emoji: '🔬' },
      { id: 'differentiate', label: { es: 'Diferenciarme de la competencia', 'pt-BR': 'Me diferenciar da concorrência' }, emoji: '⭐' }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'GYM_RI_01',
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
      { id: 'competition', label: { es: 'Competencia (nuevos gyms, low cost)', 'pt-BR': 'Concorrência (novas academias, low cost)' }, emoji: '🏋️' },
      { id: 'churn', label: { es: 'Alta rotación de socios', 'pt-BR': 'Alta rotatividade de sócios' }, emoji: '🔄' },
      { id: 'costs', label: { es: 'Costos crecientes (alquiler, servicios)', 'pt-BR': 'Custos crescentes (aluguel, serviços)' }, emoji: '📈' },
      { id: 'staff', label: { es: 'Encontrar/retener buen personal', 'pt-BR': 'Encontrar/reter bom pessoal' }, emoji: '👥' },
      { id: 'engagement', label: { es: 'Socios inactivos que no vienen', 'pt-BR': 'Sócios inativos que não vêm' }, emoji: '😴' },
      { id: 'seasonality', label: { es: 'Estacionalidad (verano baja)', 'pt-BR': 'Sazonalidade (verão baixa)' }, emoji: '📅' }
    ]
  }
];

export default GIMNASIO_QUESTIONS;
