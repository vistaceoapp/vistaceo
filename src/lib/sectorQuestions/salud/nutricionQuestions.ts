// Nutrición / Dietética - Cuestionario Hiper-Personalizado
// Quick: 15 preguntas | Complete: 70 preguntas
// 12 categorías + 7 dimensiones de salud

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const NUTRICION_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'NUT_ID_01',
    category: 'identity',
    subcategory: 'practice_model',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipo de práctica tenés?',
      'pt-BR': 'Que tipo de prática você tem?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Consultorio individual', 'pt-BR': 'Consultório individual' }, emoji: '👤' },
      { id: 'clinic', label: { es: 'Clínica con equipo de nutrición', 'pt-BR': 'Clínica com equipe de nutrição' }, emoji: '🏥' },
      { id: 'online', label: { es: 'Solo atención online', 'pt-BR': 'Apenas atendimento online' }, emoji: '💻' },
      { id: 'hybrid', label: { es: 'Híbrido (presencial + online)', 'pt-BR': 'Híbrido (presencial + online)' }, emoji: '🔄' },
      { id: 'corporate', label: { es: 'Nutrición empresarial/institucional', 'pt-BR': 'Nutrição empresarial/institucional' }, emoji: '🏢' },
      { id: 'fitness', label: { es: 'Dentro de gimnasio/centro deportivo', 'pt-BR': 'Dentro de academia/centro esportivo' }, emoji: '🏋️' }
    ]
  },
  {
    id: 'NUT_ID_02',
    category: 'identity',
    subcategory: 'specialization',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuáles son tus especialidades principales?',
      'pt-BR': 'Quais são suas especialidades principais?'
    },
    type: 'multi',
    options: [
      { id: 'weight', label: { es: 'Pérdida de peso', 'pt-BR': 'Perda de peso' }, emoji: '⚖️' },
      { id: 'sports', label: { es: 'Nutrición deportiva', 'pt-BR': 'Nutrição esportiva' }, emoji: '🏃' },
      { id: 'clinical', label: { es: 'Nutrición clínica (diabetes, HTA, etc.)', 'pt-BR': 'Nutrição clínica (diabetes, HTA, etc.)' }, emoji: '🏥' },
      { id: 'eating_disorders', label: { es: 'Trastornos alimentarios', 'pt-BR': 'Transtornos alimentares' }, emoji: '🍽️' },
      { id: 'pediatric', label: { es: 'Nutrición pediátrica', 'pt-BR': 'Nutrição pediátrica' }, emoji: '👶' },
      { id: 'maternal', label: { es: 'Nutrición materno-infantil', 'pt-BR': 'Nutrição materno-infantil' }, emoji: '🤰' },
      { id: 'veg', label: { es: 'Alimentación vegetariana/vegana', 'pt-BR': 'Alimentação vegetariana/vegana' }, emoji: '🥗' },
      { id: 'intolerance', label: { es: 'Intolerancias y alergias', 'pt-BR': 'Intolerâncias e alergias' }, emoji: '⚠️' },
      { id: 'general', label: { es: 'Generalista', 'pt-BR': 'Generalista' }, emoji: '📋' }
    ]
  },
  {
    id: 'NUT_ID_03',
    category: 'identity',
    subcategory: 'approach',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu enfoque nutricional principal?',
      'pt-BR': 'Qual é sua abordagem nutricional principal?'
    },
    type: 'single',
    options: [
      { id: 'flexible', label: { es: 'Alimentación flexible/intuitiva', 'pt-BR': 'Alimentação flexível/intuitiva' } },
      { id: 'structured', label: { es: 'Planes estructurados con macros', 'pt-BR': 'Planos estruturados com macros' } },
      { id: 'haes', label: { es: 'HAES / Sin dietas', 'pt-BR': 'HAES / Sem dietas' } },
      { id: 'functional', label: { es: 'Nutrición funcional/integrativa', 'pt-BR': 'Nutrição funcional/integrativa' } },
      { id: 'evidence', label: { es: 'Basado en evidencia científica estricta', 'pt-BR': 'Baseado em evidência científica estrita' } },
      { id: 'personalized', label: { es: 'Súper personalizado según cada paciente', 'pt-BR': 'Super personalizado conforme cada paciente' } }
    ]
  },

  // ========== OFERTA Y SERVICIOS ==========
  {
    id: 'NUT_OF_01',
    category: 'offering',
    subcategory: 'services',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué servicios ofrecés?',
      'pt-BR': 'Quais serviços você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'consultation', label: { es: 'Consultas individuales', 'pt-BR': 'Consultas individuais' } },
      { id: 'meal_plans', label: { es: 'Planes alimentarios personalizados', 'pt-BR': 'Planos alimentares personalizados' } },
      { id: 'follow_up', label: { es: 'Seguimiento semanal/mensual', 'pt-BR': 'Acompanhamento semanal/mensal' } },
      { id: 'group', label: { es: 'Programas grupales', 'pt-BR': 'Programas em grupo' } },
      { id: 'workshops', label: { es: 'Talleres/charlas', 'pt-BR': 'Oficinas/palestras' } },
      { id: 'corporate', label: { es: 'Servicios corporativos', 'pt-BR': 'Serviços corporativos' } },
      { id: 'app', label: { es: 'App/plataforma con contenido', 'pt-BR': 'App/plataforma com conteúdo' } },
      { id: 'recipes', label: { es: 'Recetarios/contenido digital', 'pt-BR': 'Receituários/conteúdo digital' } }
    ]
  },
  {
    id: 'NUT_OF_02',
    category: 'offering',
    subcategory: 'consultation_duration',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuánto dura una consulta típica?',
      'pt-BR': 'Quanto dura uma consulta típica?'
    },
    type: 'single',
    options: [
      { id: '30min', label: { es: '30 minutos', 'pt-BR': '30 minutos' } },
      { id: '45min', label: { es: '45 minutos', 'pt-BR': '45 minutos' } },
      { id: '60min', label: { es: '60 minutos', 'pt-BR': '60 minutos' } },
      { id: 'first_longer', label: { es: 'Primera más larga, seguimiento más corto', 'pt-BR': 'Primeira mais longa, acompanhamento mais curto' } }
    ]
  },
  {
    id: 'NUT_OF_03',
    category: 'offering',
    subcategory: 'packages',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Vendés paquetes o programas de seguimiento?',
      'pt-BR': 'Você vende pacotes ou programas de acompanhamento?'
    },
    type: 'single',
    options: [
      { id: 'programs', label: { es: 'Sí, programas de 1-3 meses', 'pt-BR': 'Sim, programas de 1-3 meses' } },
      { id: 'packages', label: { es: 'Paquetes de consultas con descuento', 'pt-BR': 'Pacotes de consultas com desconto' } },
      { id: 'subscription', label: { es: 'Suscripción mensual', 'pt-BR': 'Assinatura mensal' } },
      { id: 'individual', label: { es: 'Solo consultas individuales', 'pt-BR': 'Apenas consultas individuais' } }
    ]
  },
  {
    id: 'NUT_OF_04',
    category: 'offering',
    subcategory: 'tools',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué herramientas complementarias usás?',
      'pt-BR': 'Quais ferramentas complementares você usa?'
    },
    type: 'multi',
    options: [
      { id: 'body_comp', label: { es: 'Análisis de composición corporal (bioimpedancia)', 'pt-BR': 'Análise de composição corporal (bioimpedância)' } },
      { id: 'anthropometry', label: { es: 'Antropometría manual', 'pt-BR': 'Antropometria manual' } },
      { id: 'lab_analysis', label: { es: 'Interpretación de análisis de laboratorio', 'pt-BR': 'Interpretação de exames laboratoriais' } },
      { id: 'food_diary', label: { es: 'Apps de registro alimentario', 'pt-BR': 'Apps de registro alimentar' } },
      { id: 'genetic', label: { es: 'Tests genéticos/microbiota', 'pt-BR': 'Testes genéticos/microbiota' } },
      { id: 'basic', label: { es: 'Solo básico (balanza, cinta)', 'pt-BR': 'Apenas básico (balança, fita)' } }
    ]
  },

  // ========== CLIENTE Y DEMANDA ==========
  {
    id: 'NUT_CL_01',
    category: 'demand',
    subcategory: 'patient_profile',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el motivo principal de consulta de tus pacientes?',
      'pt-BR': 'Qual é o motivo principal de consulta dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'weight_loss', label: { es: 'Bajar de peso', 'pt-BR': 'Perder peso' } },
      { id: 'health', label: { es: 'Mejorar salud (diabetes, colesterol, etc.)', 'pt-BR': 'Melhorar saúde (diabetes, colesterol, etc.)' } },
      { id: 'performance', label: { es: 'Rendimiento deportivo', 'pt-BR': 'Desempenho esportivo' } },
      { id: 'aesthetic', label: { es: 'Estética/composición corporal', 'pt-BR': 'Estética/composição corporal' } },
      { id: 'relationship', label: { es: 'Mejorar relación con la comida', 'pt-BR': 'Melhorar relação com a comida' } },
      { id: 'mixed', label: { es: 'Mix variado', 'pt-BR': 'Mix variado' } }
    ]
  },
  {
    id: 'NUT_CL_02',
    category: 'demand',
    subcategory: 'referral',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿De dónde vienen la mayoría de tus pacientes?',
      'pt-BR': 'De onde vem a maioria dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'word_of_mouth', label: { es: 'Recomendaciones de otros pacientes', 'pt-BR': 'Recomendações de outros pacientes' }, emoji: '💬' },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'doctors', label: { es: 'Derivación de médicos', 'pt-BR': 'Encaminhamento de médicos' }, emoji: '👨‍⚕️' },
      { id: 'gym', label: { es: 'Gimnasio/entrenadores', 'pt-BR': 'Academia/treinadores' }, emoji: '🏋️' },
      { id: 'insurance', label: { es: 'Obras sociales/prepagas', 'pt-BR': 'Convênios' }, emoji: '📋' },
      { id: 'google', label: { es: 'Búsqueda en Google', 'pt-BR': 'Busca no Google' }, emoji: '🔍' }
    ]
  },
  {
    id: 'NUT_CL_03',
    category: 'demand',
    subcategory: 'volume',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos pacientes atendés por semana?',
      'pt-BR': 'Quantos pacientes você atende por semana?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos de 10', 'pt-BR': 'Menos de 10' } },
      { id: 'medium', label: { es: '10-20', 'pt-BR': '10-20' } },
      { id: 'high', label: { es: '20-35', 'pt-BR': '20-35' } },
      { id: 'very_high', label: { es: '35-50', 'pt-BR': '35-50' } },
      { id: 'full', label: { es: 'Más de 50', 'pt-BR': 'Mais de 50' } }
    ]
  },
  {
    id: 'NUT_CL_04',
    category: 'demand',
    subcategory: 'treatment_duration',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuánto tiempo dura un seguimiento promedio?',
      'pt-BR': 'Quanto tempo dura um acompanhamento médio?'
    },
    type: 'single',
    options: [
      { id: 'short', label: { es: 'Menos de 2 meses', 'pt-BR': 'Menos de 2 meses' } },
      { id: 'medium', label: { es: '2-4 meses', 'pt-BR': '2-4 meses' } },
      { id: 'long', label: { es: '4-6 meses', 'pt-BR': '4-6 meses' } },
      { id: 'very_long', label: { es: 'Más de 6 meses', 'pt-BR': 'Mais de 6 meses' } }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'NUT_VE_01',
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
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '💬' },
      { id: 'phone', label: { es: 'Teléfono', 'pt-BR': 'Telefone' }, emoji: '📞' },
      { id: 'online', label: { es: 'Reserva online', 'pt-BR': 'Reserva online' }, emoji: '🌐' },
      { id: 'social', label: { es: 'DM en redes sociales', 'pt-BR': 'DM em redes sociais' }, emoji: '📱' },
      { id: 'email', label: { es: 'Email', 'pt-BR': 'Email' }, emoji: '📧' }
    ]
  },
  {
    id: 'NUT_VE_02',
    category: 'sales',
    subcategory: 'adherence',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué porcentaje de pacientes completa el seguimiento recomendado?',
      'pt-BR': 'Qual porcentagem de pacientes completa o acompanhamento recomendado?'
    },
    type: 'single',
    options: [
      { id: 'excellent', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' }, emoji: '🏆' },
      { id: 'good', label: { es: '50-70%', 'pt-BR': '50-70%' }, emoji: '✅' },
      { id: 'medium', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '⚠️' },
      { id: 'low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' }
    ]
  },
  {
    id: 'NUT_VE_03',
    category: 'sales',
    subcategory: 'first_conversion',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué % de consultas de primera vez se convierten en seguimiento?',
      'pt-BR': 'Qual % de consultas de primeira vez se convertem em acompanhamento?'
    },
    type: 'single',
    options: [
      { id: 'high', label: { es: 'Más del 70%', 'pt-BR': 'Mais de 70%' } },
      { id: 'medium', label: { es: '50-70%', 'pt-BR': '50-70%' } },
      { id: 'low', label: { es: '30-50%', 'pt-BR': '30-50%' } },
      { id: 'very_low', label: { es: 'Menos del 30%', 'pt-BR': 'Menos de 30%' } }
    ]
  },

  // ========== FINANZAS Y MÁRGENES ==========
  {
    id: 'NUT_FI_01',
    category: 'finance',
    subcategory: 'consultation_price',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el precio de una consulta particular?',
      'pt-BR': 'Qual é o preço de uma consulta particular?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos de $15k ARS / R$80', 'pt-BR': 'Menos de R$80 / $15k ARS' } },
      { id: 'medium', label: { es: '$15k-30k ARS / R$80-180', 'pt-BR': 'R$80-180 / $15k-30k ARS' } },
      { id: 'high', label: { es: '$30k-50k ARS / R$180-300', 'pt-BR': 'R$180-300 / $30k-50k ARS' } },
      { id: 'premium', label: { es: 'Más de $50k ARS / R$300', 'pt-BR': 'Mais de R$300 / $50k ARS' } }
    ]
  },
  {
    id: 'NUT_FI_02',
    category: 'finance',
    subcategory: 'revenue_mix',
    dimension: 'finances',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué % de tus ingresos viene de obras sociales/prepagas?',
      'pt-BR': 'Qual % da sua receita vem de convênios?'
    },
    type: 'single',
    options: [
      { id: 'private', label: { es: 'Menos del 20% (mayoría particulares)', 'pt-BR': 'Menos de 20% (maioria particulares)' } },
      { id: 'mixed', label: { es: '20-50%', 'pt-BR': '20-50%' } },
      { id: 'insurance_heavy', label: { es: '50-80%', 'pt-BR': '50-80%' } },
      { id: 'insurance_only', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' } }
    ]
  },
  {
    id: 'NUT_FI_03',
    category: 'finance',
    subcategory: 'monthly_revenue',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu facturación mensual aproximada?',
      'pt-BR': 'Qual é seu faturamento mensal aproximado?'
    },
    type: 'single',
    options: [
      { id: 'tier1', label: { es: 'Menos de $500k ARS / R$12k', 'pt-BR': 'Menos de R$12k / $500k ARS' } },
      { id: 'tier2', label: { es: '$500k-1.5M ARS / R$12k-40k', 'pt-BR': 'R$12k-40k / $500k-1.5M ARS' } },
      { id: 'tier3', label: { es: '$1.5M-4M ARS / R$40k-100k', 'pt-BR': 'R$40k-100k / $1.5M-4M ARS' } },
      { id: 'tier4', label: { es: '$4M-10M ARS / R$100k-250k', 'pt-BR': 'R$100k-250k / $4M-10M ARS' } },
      { id: 'tier5', label: { es: 'Más de $10M ARS / R$250k', 'pt-BR': 'Mais de R$250k / $10M ARS' } }
    ]
  },
  {
    id: 'NUT_FI_04',
    category: 'finance',
    subcategory: 'digital_income',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Generás ingresos por productos digitales?',
      'pt-BR': 'Você gera renda com produtos digitais?'
    },
    type: 'single',
    options: [
      { id: 'significant', label: { es: 'Sí, +30% de mis ingresos', 'pt-BR': 'Sim, +30% da minha renda' } },
      { id: 'some', label: { es: 'Sí, 10-30%', 'pt-BR': 'Sim, 10-30%' } },
      { id: 'minimal', label: { es: 'Poco, menos del 10%', 'pt-BR': 'Pouco, menos de 10%' } },
      { id: 'none', label: { es: 'No, solo consultas', 'pt-BR': 'Não, apenas consultas' } }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'NUT_OP_01',
    category: 'operation',
    subcategory: 'workspace',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Dónde atendés?',
      'pt-BR': 'Onde você atende?'
    },
    type: 'single',
    options: [
      { id: 'own_office', label: { es: 'Consultorio propio exclusivo', 'pt-BR': 'Consultório próprio exclusivo' } },
      { id: 'shared', label: { es: 'Consultorio compartido por horas', 'pt-BR': 'Consultório compartilhado por horas' } },
      { id: 'clinic', label: { es: 'Dentro de clínica/centro médico', 'pt-BR': 'Dentro de clínica/centro médico' } },
      { id: 'gym', label: { es: 'En gimnasio/centro deportivo', 'pt-BR': 'Em academia/centro esportivo' } },
      { id: 'home', label: { es: 'Desde mi casa', 'pt-BR': 'De casa' } },
      { id: 'online_only', label: { es: 'Solo online', 'pt-BR': 'Apenas online' } }
    ]
  },
  {
    id: 'NUT_OP_02',
    category: 'operation',
    subcategory: 'schedule',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu horario de atención?',
      'pt-BR': 'Qual é seu horário de atendimento?'
    },
    type: 'single',
    options: [
      { id: 'morning', label: { es: 'Solo mañana', 'pt-BR': 'Apenas manhã' } },
      { id: 'afternoon', label: { es: 'Solo tarde', 'pt-BR': 'Apenas tarde' } },
      { id: 'split', label: { es: 'Mañana y tarde', 'pt-BR': 'Manhã e tarde' } },
      { id: 'full', label: { es: 'Jornada completa', 'pt-BR': 'Jornada completa' } },
      { id: 'flexible', label: { es: 'Horario muy flexible', 'pt-BR': 'Horário muito flexível' } }
    ]
  },
  {
    id: 'NUT_OP_03',
    category: 'operation',
    subcategory: 'meal_plan_creation',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo creás los planes alimentarios?',
      'pt-BR': 'Como você cria os planos alimentares?'
    },
    type: 'single',
    options: [
      { id: 'software', label: { es: 'Software especializado', 'pt-BR': 'Software especializado' } },
      { id: 'templates', label: { es: 'Plantillas propias que personalizo', 'pt-BR': 'Templates próprios que personalizo' } },
      { id: 'manual', label: { es: 'Cada uno desde cero', 'pt-BR': 'Cada um do zero' } },
      { id: 'guidelines', label: { es: 'Solo doy pautas generales, no planes detallados', 'pt-BR': 'Apenas dou diretrizes gerais, não planos detalhados' } }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'NUT_MK_01',
    category: 'marketing',
    subcategory: 'social_presence',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué presencia tenés en redes sociales?',
      'pt-BR': 'Qual presença você tem nas redes sociais?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram activo (+1k seguidores)', 'pt-BR': 'Instagram ativo (+1k seguidores)' }, emoji: '📸' },
      { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
      { id: 'youtube', label: { es: 'YouTube', 'pt-BR': 'YouTube' }, emoji: '📺' },
      { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '👥' },
      { id: 'linkedin', label: { es: 'LinkedIn', 'pt-BR': 'LinkedIn' }, emoji: '💼' },
      { id: 'minimal', label: { es: 'Presencia mínima', 'pt-BR': 'Presença mínima' }, emoji: '📱' },
      { id: 'none', label: { es: 'Sin redes sociales', 'pt-BR': 'Sem redes sociais' }, emoji: '❌' }
    ]
  },
  {
    id: 'NUT_MK_02',
    category: 'marketing',
    subcategory: 'content',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Creás contenido educativo?',
      'pt-BR': 'Você cria conteúdo educativo?'
    },
    type: 'single',
    options: [
      { id: 'daily', label: { es: 'Sí, contenido diario/semanal', 'pt-BR': 'Sim, conteúdo diário/semanal' } },
      { id: 'regular', label: { es: 'Regularmente (2-4 veces por mes)', 'pt-BR': 'Regularmente (2-4 vezes por mês)' } },
      { id: 'occasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' } },
      { id: 'none', label: { es: 'No creo contenido', 'pt-BR': 'Não crio conteúdo' } }
    ]
  },
  {
    id: 'NUT_MK_03',
    category: 'marketing',
    subcategory: 'collaborations',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Tenés alianzas con otros profesionales?',
      'pt-BR': 'Você tem alianças com outros profissionais?'
    },
    type: 'multi',
    options: [
      { id: 'doctors', label: { es: 'Médicos que me derivan', 'pt-BR': 'Médicos que me encaminham' } },
      { id: 'trainers', label: { es: 'Entrenadores/gimnasios', 'pt-BR': 'Treinadores/academias' } },
      { id: 'psychologists', label: { es: 'Psicólogos', 'pt-BR': 'Psicólogos' } },
      { id: 'chefs', label: { es: 'Chefs/servicios de comida', 'pt-BR': 'Chefs/serviços de comida' } },
      { id: 'brands', label: { es: 'Marcas de alimentos', 'pt-BR': 'Marcas de alimentos' } },
      { id: 'none', label: { es: 'No tengo alianzas', 'pt-BR': 'Não tenho alianças' } }
    ]
  },

  // ========== RETENCIÓN ==========
  {
    id: 'NUT_RE_01',
    category: 'retention',
    subcategory: 'follow_up',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cómo es tu seguimiento entre consultas?',
      'pt-BR': 'Como é seu acompanhamento entre consultas?'
    },
    type: 'single',
    options: [
      { id: 'intensive', label: { es: 'Seguimiento diario/semanal por WhatsApp', 'pt-BR': 'Acompanhamento diário/semanal por WhatsApp' } },
      { id: 'moderate', label: { es: 'Check-in semanal breve', 'pt-BR': 'Check-in semanal breve' } },
      { id: 'on_demand', label: { es: 'Disponible si tienen dudas', 'pt-BR': 'Disponível se tiverem dúvidas' } },
      { id: 'none', label: { es: 'Solo en las consultas', 'pt-BR': 'Apenas nas consultas' } }
    ]
  },
  {
    id: 'NUT_RE_02',
    category: 'retention',
    subcategory: 'results_tracking',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo medís los resultados de tus pacientes?',
      'pt-BR': 'Como você mede os resultados dos seus pacientes?'
    },
    type: 'multi',
    options: [
      { id: 'weight', label: { es: 'Peso', 'pt-BR': 'Peso' } },
      { id: 'measurements', label: { es: 'Medidas corporales', 'pt-BR': 'Medidas corporais' } },
      { id: 'composition', label: { es: 'Composición corporal', 'pt-BR': 'Composição corporal' } },
      { id: 'labs', label: { es: 'Valores de laboratorio', 'pt-BR': 'Valores laboratoriais' } },
      { id: 'energy', label: { es: 'Energía/bienestar subjetivo', 'pt-BR': 'Energia/bem-estar subjetivo' } },
      { id: 'photos', label: { es: 'Fotos de progreso', 'pt-BR': 'Fotos de progresso' } },
      { id: 'habits', label: { es: 'Cambios de hábitos', 'pt-BR': 'Mudanças de hábitos' } }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'NUT_EQ_01',
    category: 'team',
    subcategory: 'practice_type',
    dimension: 'team',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Trabajás solo/a o con equipo?',
      'pt-BR': 'Você trabalha sozinho/a ou com equipe?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo/a', 'pt-BR': 'Sozinho/a' } },
      { id: 'assistant', label: { es: 'Con asistente/secretaria', 'pt-BR': 'Com assistente/secretária' } },
      { id: 'colleagues', label: { es: 'Con otros nutricionistas', 'pt-BR': 'Com outros nutricionistas' } },
      { id: 'multidisciplinary', label: { es: 'Equipo multidisciplinario', 'pt-BR': 'Equipe multidisciplinar' } }
    ]
  },

  // ========== TECNOLOGÍA ==========
  {
    id: 'NUT_TEC_01',
    category: 'technology',
    subcategory: 'tools',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué herramientas tecnológicas usás?',
      'pt-BR': 'Quais ferramentas tecnológicas você usa?'
    },
    type: 'multi',
    options: [
      { id: 'nutrition_software', label: { es: 'Software de nutrición (Nutrium, etc.)', 'pt-BR': 'Software de nutrição (Nutrium, etc.)' } },
      { id: 'scheduling', label: { es: 'Sistema de agendamiento online', 'pt-BR': 'Sistema de agendamento online' } },
      { id: 'ehr', label: { es: 'Historia clínica digital', 'pt-BR': 'Prontuário digital' } },
      { id: 'food_apps', label: { es: 'Apps de registro alimentario', 'pt-BR': 'Apps de registro alimentar' } },
      { id: 'video', label: { es: 'Plataforma de videollamadas', 'pt-BR': 'Plataforma de videochamadas' } },
      { id: 'basic', label: { es: 'Solo herramientas básicas', 'pt-BR': 'Apenas ferramentas básicas' } }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'NUT_OB_01',
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
      { id: 'patients', label: { es: 'Aumentar cantidad de pacientes', 'pt-BR': 'Aumentar quantidade de pacientes' }, emoji: '📈' },
      { id: 'income', label: { es: 'Mejorar ingresos', 'pt-BR': 'Melhorar renda' }, emoji: '💰' },
      { id: 'digital', label: { es: 'Desarrollar productos digitales', 'pt-BR': 'Desenvolver produtos digitais' }, emoji: '💻' },
      { id: 'specialize', label: { es: 'Especializarme más', 'pt-BR': 'Me especializar mais' }, emoji: '🎯' },
      { id: 'brand', label: { es: 'Construir marca personal', 'pt-BR': 'Construir marca pessoal' }, emoji: '⭐' },
      { id: 'team', label: { es: 'Armar equipo/clínica', 'pt-BR': 'Montar equipe/clínica' }, emoji: '👥' },
      { id: 'balance', label: { es: 'Mejor balance vida-trabajo', 'pt-BR': 'Melhor equilíbrio vida-trabalho' }, emoji: '⚖️' }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'NUT_RI_01',
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
      { id: 'acquisition', label: { es: 'Conseguir más pacientes', 'pt-BR': 'Conseguir mais pacientes' }, emoji: '👥' },
      { id: 'adherence', label: { es: 'Que los pacientes sigan el plan', 'pt-BR': 'Que os pacientes sigam o plano' }, emoji: '🎯' },
      { id: 'pricing', label: { es: 'Cobrar lo que vale mi trabajo', 'pt-BR': 'Cobrar o que vale meu trabalho' }, emoji: '💸' },
      { id: 'differentiation', label: { es: 'Diferenciarme de la competencia', 'pt-BR': 'Me diferenciar da concorrência' }, emoji: '⭐' },
      { id: 'time', label: { es: 'Falta de tiempo para todo', 'pt-BR': 'Falta de tempo para tudo' }, emoji: '⏰' },
      { id: 'content', label: { es: 'Crear contenido consistente', 'pt-BR': 'Criar conteúdo consistente' }, emoji: '📱' }
    ]
  }
];

export default NUTRICION_QUESTIONS;
