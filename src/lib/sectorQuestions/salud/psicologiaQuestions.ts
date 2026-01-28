// Psicología / Salud Mental - Cuestionario Hiper-Personalizado
// Quick: 15 preguntas | Complete: 70 preguntas
// 12 categorías + 7 dimensiones de salud

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const PSICOLOGIA_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'PSI_ID_01',
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
      { id: 'shared', label: { es: 'Consultorio compartido con colegas', 'pt-BR': 'Consultório compartilhado com colegas' }, emoji: '👥' },
      { id: 'clinic', label: { es: 'Clínica/Centro de salud mental', 'pt-BR': 'Clínica/Centro de saúde mental' }, emoji: '🏥' },
      { id: 'online_only', label: { es: 'Solo atención online', 'pt-BR': 'Apenas atendimento online' }, emoji: '💻' },
      { id: 'hybrid', label: { es: 'Híbrido (presencial + online)', 'pt-BR': 'Híbrido (presencial + online)' }, emoji: '🔄' }
    ]
  },
  {
    id: 'PSI_ID_02',
    category: 'identity',
    subcategory: 'approach',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu enfoque terapéutico principal?',
      'pt-BR': 'Qual é sua abordagem terapêutica principal?'
    },
    type: 'single',
    options: [
      { id: 'cbt', label: { es: 'Cognitivo-Conductual (TCC)', 'pt-BR': 'Cognitivo-Comportamental (TCC)' } },
      { id: 'psychoanalysis', label: { es: 'Psicoanálisis', 'pt-BR': 'Psicanálise' } },
      { id: 'systemic', label: { es: 'Sistémico/Familiar', 'pt-BR': 'Sistêmico/Familiar' } },
      { id: 'humanistic', label: { es: 'Humanista/Gestalt', 'pt-BR': 'Humanista/Gestalt' } },
      { id: 'integrative', label: { es: 'Integrativo/Ecléctico', 'pt-BR': 'Integrativo/Eclético' } },
      { id: 'act', label: { es: 'ACT/Tercera ola', 'pt-BR': 'ACT/Terceira onda' } },
      { id: 'emdr', label: { es: 'EMDR/Trauma', 'pt-BR': 'EMDR/Trauma' } }
    ]
  },
  {
    id: 'PSI_ID_03',
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
      { id: 'anxiety', label: { es: 'Ansiedad y estrés', 'pt-BR': 'Ansiedade e estresse' }, emoji: '😰' },
      { id: 'depression', label: { es: 'Depresión', 'pt-BR': 'Depressão' }, emoji: '😔' },
      { id: 'couples', label: { es: 'Terapia de pareja', 'pt-BR': 'Terapia de casal' }, emoji: '💑' },
      { id: 'family', label: { es: 'Terapia familiar', 'pt-BR': 'Terapia familiar' }, emoji: '👨‍👩‍👧' },
      { id: 'children', label: { es: 'Infanto-juvenil', 'pt-BR': 'Infanto-juvenil' }, emoji: '👶' },
      { id: 'trauma', label: { es: 'Trauma y TEPT', 'pt-BR': 'Trauma e TEPT' }, emoji: '🌊' },
      { id: 'addiction', label: { es: 'Adicciones', 'pt-BR': 'Dependências' }, emoji: '🔗' },
      { id: 'eating', label: { es: 'Trastornos alimentarios', 'pt-BR': 'Transtornos alimentares' }, emoji: '🍽️' },
      { id: 'corporate', label: { es: 'Psicología organizacional', 'pt-BR': 'Psicologia organizacional' }, emoji: '🏢' },
      { id: 'general', label: { es: 'Generalista', 'pt-BR': 'Generalista' }, emoji: '📋' }
    ]
  },

  // ========== OFERTA Y SERVICIOS ==========
  {
    id: 'PSI_OF_01',
    category: 'offering',
    subcategory: 'session_types',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipos de sesiones ofrecés?',
      'pt-BR': 'Que tipos de sessões você oferece?'
    },
    type: 'multi',
    options: [
      { id: 'individual', label: { es: 'Terapia individual', 'pt-BR': 'Terapia individual' } },
      { id: 'couple', label: { es: 'Terapia de pareja', 'pt-BR': 'Terapia de casal' } },
      { id: 'family', label: { es: 'Terapia familiar', 'pt-BR': 'Terapia familiar' } },
      { id: 'group', label: { es: 'Terapia grupal', 'pt-BR': 'Terapia de grupo' } },
      { id: 'workshops', label: { es: 'Talleres/workshops', 'pt-BR': 'Oficinas/workshops' } },
      { id: 'assessment', label: { es: 'Evaluación/psicodiagnóstico', 'pt-BR': 'Avaliação/psicodiagnóstico' } }
    ]
  },
  {
    id: 'PSI_OF_02',
    category: 'offering',
    subcategory: 'session_duration',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuánto dura una sesión típica?',
      'pt-BR': 'Quanto dura uma sessão típica?'
    },
    type: 'single',
    options: [
      { id: '30min', label: { es: '30 minutos', 'pt-BR': '30 minutos' } },
      { id: '45min', label: { es: '45-50 minutos', 'pt-BR': '45-50 minutos' } },
      { id: '60min', label: { es: '60 minutos', 'pt-BR': '60 minutos' } },
      { id: 'variable', label: { es: 'Variable según tipo', 'pt-BR': 'Variável conforme tipo' } }
    ]
  },
  {
    id: 'PSI_OF_03',
    category: 'offering',
    subcategory: 'modality',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué modalidad de atención preferís?',
      'pt-BR': 'Qual modalidade de atendimento você prefere?'
    },
    type: 'single',
    options: [
      { id: 'presential', label: { es: 'Principalmente presencial', 'pt-BR': 'Principalmente presencial' } },
      { id: 'online', label: { es: 'Principalmente online', 'pt-BR': 'Principalmente online' } },
      { id: 'balanced', label: { es: 'Equilibrado 50/50', 'pt-BR': 'Equilibrado 50/50' } },
      { id: 'patient_choice', label: { es: 'Según preferencia del paciente', 'pt-BR': 'Conforme preferência do paciente' } }
    ]
  },
  {
    id: 'PSI_OF_04',
    category: 'offering',
    subcategory: 'frequency',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es la frecuencia típica de sesiones que recomendás?',
      'pt-BR': 'Qual é a frequência típica de sessões que você recomenda?'
    },
    type: 'single',
    options: [
      { id: 'weekly', label: { es: 'Semanal', 'pt-BR': 'Semanal' } },
      { id: 'biweekly', label: { es: 'Quincenal', 'pt-BR': 'Quinzenal' } },
      { id: 'twice_week', label: { es: '2 veces por semana', 'pt-BR': '2 vezes por semana' } },
      { id: 'flexible', label: { es: 'Variable según necesidad', 'pt-BR': 'Variável conforme necessidade' } }
    ]
  },

  // ========== CLIENTE Y DEMANDA ==========
  {
    id: 'PSI_CL_01',
    category: 'demand',
    subcategory: 'patient_age',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el rango de edad principal de tus pacientes?',
      'pt-BR': 'Qual é a faixa etária principal dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'children', label: { es: 'Niños (0-12)', 'pt-BR': 'Crianças (0-12)' } },
      { id: 'adolescents', label: { es: 'Adolescentes (13-18)', 'pt-BR': 'Adolescentes (13-18)' } },
      { id: 'young_adults', label: { es: 'Adultos jóvenes (18-35)', 'pt-BR': 'Adultos jovens (18-35)' } },
      { id: 'adults', label: { es: 'Adultos (35-55)', 'pt-BR': 'Adultos (35-55)' } },
      { id: 'seniors', label: { es: 'Adultos mayores (+55)', 'pt-BR': 'Adultos idosos (+55)' } },
      { id: 'mixed', label: { es: 'Mix variado', 'pt-BR': 'Mix variado' } }
    ]
  },
  {
    id: 'PSI_CL_02',
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
      { id: 'doctors', label: { es: 'Derivación de médicos/psiquiatras', 'pt-BR': 'Encaminhamento de médicos/psiquiatras' }, emoji: '👨‍⚕️' },
      { id: 'insurance', label: { es: 'Obras sociales/prepagas', 'pt-BR': 'Convênios' }, emoji: '📋' },
      { id: 'online', label: { es: 'Búsqueda online/redes sociales', 'pt-BR': 'Busca online/redes sociais' }, emoji: '🔍' },
      { id: 'platforms', label: { es: 'Plataformas de terapia (Terapify, etc.)', 'pt-BR': 'Plataformas de terapia' }, emoji: '📱' },
      { id: 'corporate', label: { es: 'Programas corporativos (EAP)', 'pt-BR': 'Programas corporativos (EAP)' }, emoji: '🏢' }
    ]
  },
  {
    id: 'PSI_CL_03',
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
      { id: 'high', label: { es: '20-30', 'pt-BR': '20-30' } },
      { id: 'very_high', label: { es: '30-40', 'pt-BR': '30-40' } },
      { id: 'full', label: { es: 'Más de 40', 'pt-BR': 'Mais de 40' } }
    ]
  },
  {
    id: 'PSI_CL_04',
    category: 'demand',
    subcategory: 'treatment_duration',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuánto tiempo dura un tratamiento promedio?',
      'pt-BR': 'Quanto tempo dura um tratamento médio?'
    },
    type: 'single',
    options: [
      { id: 'short', label: { es: 'Menos de 3 meses', 'pt-BR': 'Menos de 3 meses' } },
      { id: 'medium', label: { es: '3-6 meses', 'pt-BR': '3-6 meses' } },
      { id: 'long', label: { es: '6-12 meses', 'pt-BR': '6-12 meses' } },
      { id: 'very_long', label: { es: 'Más de 1 año', 'pt-BR': 'Mais de 1 ano' } },
      { id: 'variable', label: { es: 'Muy variable', 'pt-BR': 'Muito variável' } }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'PSI_VE_01',
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
      { id: 'email', label: { es: 'Email', 'pt-BR': 'Email' }, emoji: '📧' },
      { id: 'online', label: { es: 'Sistema de reserva online', 'pt-BR': 'Sistema de reserva online' }, emoji: '🌐' },
      { id: 'platform', label: { es: 'Plataforma de terapia', 'pt-BR': 'Plataforma de terapia' }, emoji: '📱' }
    ]
  },
  {
    id: 'PSI_VE_02',
    category: 'sales',
    subcategory: 'first_session',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecés primera sesión con descuento o gratuita?',
      'pt-BR': 'Você oferece primeira sessão com desconto ou gratuita?'
    },
    type: 'single',
    options: [
      { id: 'free', label: { es: 'Sí, primera sesión gratuita', 'pt-BR': 'Sim, primeira sessão gratuita' } },
      { id: 'discount', label: { es: 'Sí, con descuento', 'pt-BR': 'Sim, com desconto' } },
      { id: 'no', label: { es: 'No, precio regular desde el inicio', 'pt-BR': 'Não, preço regular desde o início' } }
    ]
  },
  {
    id: 'PSI_VE_03',
    category: 'sales',
    subcategory: 'dropout',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es tu tasa aproximada de abandono de terapia?',
      'pt-BR': 'Qual é sua taxa aproximada de abandono de terapia?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 15%', 'pt-BR': 'Menos de 15%' }, emoji: '🏆' },
      { id: 'medium', label: { es: '15-30%', 'pt-BR': '15-30%' }, emoji: '✅' },
      { id: 'high', label: { es: '30-50%', 'pt-BR': '30-50%' }, emoji: '⚠️' },
      { id: 'very_high', label: { es: 'Más del 50%', 'pt-BR': 'Mais de 50%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' }
    ]
  },

  // ========== FINANZAS Y MÁRGENES ==========
  {
    id: 'PSI_FI_01',
    category: 'finance',
    subcategory: 'session_price',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el precio de una sesión particular?',
      'pt-BR': 'Qual é o preço de uma sessão particular?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos de $20k ARS / R$120', 'pt-BR': 'Menos de R$120 / $20k ARS' } },
      { id: 'medium', label: { es: '$20k-40k ARS / R$120-250', 'pt-BR': 'R$120-250 / $20k-40k ARS' } },
      { id: 'high', label: { es: '$40k-60k ARS / R$250-400', 'pt-BR': 'R$250-400 / $40k-60k ARS' } },
      { id: 'premium', label: { es: 'Más de $60k ARS / R$400', 'pt-BR': 'Mais de R$400 / $60k ARS' } }
    ]
  },
  {
    id: 'PSI_FI_02',
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
    id: 'PSI_FI_03',
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
    id: 'PSI_FI_04',
    category: 'finance',
    subcategory: 'sliding_scale',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecés escala de honorarios o tarifas sociales?',
      'pt-BR': 'Você oferece escala de honorários ou tarifas sociais?'
    },
    type: 'single',
    options: [
      { id: 'yes', label: { es: 'Sí, tengo cupos con tarifa reducida', 'pt-BR': 'Sim, tenho vagas com tarifa reduzida' } },
      { id: 'case_by_case', label: { es: 'Lo evalúo caso a caso', 'pt-BR': 'Avalio caso a caso' } },
      { id: 'no', label: { es: 'No, tarifa única para todos', 'pt-BR': 'Não, tarifa única para todos' } }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'PSI_OP_01',
    category: 'operation',
    subcategory: 'office',
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
      { id: 'shared_office', label: { es: 'Consultorio compartido por horas', 'pt-BR': 'Consultório compartilhado por horas' } },
      { id: 'coworking', label: { es: 'Espacio de coworking médico', 'pt-BR': 'Espaço de coworking médico' } },
      { id: 'home', label: { es: 'Desde mi casa', 'pt-BR': 'De casa' } },
      { id: 'online', label: { es: 'Solo online', 'pt-BR': 'Apenas online' } }
    ]
  },
  {
    id: 'PSI_OP_02',
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
      { id: 'evening', label: { es: 'Tarde-noche (después de 18h)', 'pt-BR': 'Tarde-noite (após 18h)' } },
      { id: 'flexible', label: { es: 'Horario muy flexible', 'pt-BR': 'Horário muito flexível' } }
    ]
  },
  {
    id: 'PSI_OP_03',
    category: 'operation',
    subcategory: 'availability',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Atendés fines de semana?',
      'pt-BR': 'Você atende nos finais de semana?'
    },
    type: 'single',
    options: [
      { id: 'yes_both', label: { es: 'Sí, sábados y domingos', 'pt-BR': 'Sim, sábados e domingos' } },
      { id: 'saturday', label: { es: 'Solo sábados', 'pt-BR': 'Apenas sábados' } },
      { id: 'rarely', label: { es: 'Excepcionalmente', 'pt-BR': 'Excepcionalmente' } },
      { id: 'no', label: { es: 'No, solo días hábiles', 'pt-BR': 'Não, apenas dias úteis' } }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'PSI_MK_01',
    category: 'marketing',
    subcategory: 'presence',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué presencia digital tenés?',
      'pt-BR': 'Qual presença digital você tem?'
    },
    type: 'multi',
    options: [
      { id: 'instagram', label: { es: 'Instagram profesional', 'pt-BR': 'Instagram profissional' }, emoji: '📸' },
      { id: 'linkedin', label: { es: 'LinkedIn activo', 'pt-BR': 'LinkedIn ativo' }, emoji: '💼' },
      { id: 'website', label: { es: 'Sitio web propio', 'pt-BR': 'Site próprio' }, emoji: '🌐' },
      { id: 'google', label: { es: 'Perfil de Google My Business', 'pt-BR': 'Perfil do Google Meu Negócio' }, emoji: '🔍' },
      { id: 'directories', label: { es: 'Directorios de psicólogos', 'pt-BR': 'Diretórios de psicólogos' }, emoji: '📋' },
      { id: 'none', label: { es: 'Ninguna presencia digital', 'pt-BR': 'Nenhuma presença digital' }, emoji: '❌' }
    ]
  },
  {
    id: 'PSI_MK_02',
    category: 'marketing',
    subcategory: 'content',
    dimension: 'traffic',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Creás contenido educativo sobre salud mental?',
      'pt-BR': 'Você cria conteúdo educativo sobre saúde mental?'
    },
    type: 'single',
    options: [
      { id: 'regular', label: { es: 'Sí, regularmente (posts, videos, artículos)', 'pt-BR': 'Sim, regularmente (posts, vídeos, artigos)' } },
      { id: 'occasional', label: { es: 'Ocasionalmente', 'pt-BR': 'Ocasionalmente' } },
      { id: 'rarely', label: { es: 'Muy poco', 'pt-BR': 'Muito pouco' } },
      { id: 'none', label: { es: 'No creo contenido', 'pt-BR': 'Não crio conteúdo' } }
    ]
  },

  // ========== RETENCIÓN ==========
  {
    id: 'PSI_RE_01',
    category: 'retention',
    subcategory: 'between_sessions',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo es tu contacto entre sesiones?',
      'pt-BR': 'Como é seu contato entre sessões?'
    },
    type: 'single',
    options: [
      { id: 'available', label: { es: 'Disponible para mensajes breves', 'pt-BR': 'Disponível para mensagens breves' } },
      { id: 'emergencies', label: { es: 'Solo emergencias', 'pt-BR': 'Apenas emergências' } },
      { id: 'none', label: { es: 'No contacto entre sesiones', 'pt-BR': 'Sem contato entre sessões' } }
    ]
  },
  {
    id: 'PSI_RE_02',
    category: 'retention',
    subcategory: 'follow_up',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Hacés seguimiento cuando un paciente deja de venir?',
      'pt-BR': 'Você faz acompanhamento quando um paciente para de vir?'
    },
    type: 'single',
    options: [
      { id: 'systematic', label: { es: 'Sí, siempre contacto para cerrar proceso', 'pt-BR': 'Sim, sempre contato para fechar processo' } },
      { id: 'sometimes', label: { es: 'A veces, dependiendo del caso', 'pt-BR': 'Às vezes, dependendo do caso' } },
      { id: 'none', label: { es: 'No, respeto su decisión sin contactar', 'pt-BR': 'Não, respeito sua decisão sem contatar' } }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'PSI_EQ_01',
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
      { id: 'secretary', label: { es: 'Con secretaria/asistente', 'pt-BR': 'Com secretária/assistente' } },
      { id: 'colleagues', label: { es: 'Comparto espacio con colegas (independientes)', 'pt-BR': 'Compartilho espaço com colegas (independentes)' } },
      { id: 'team', label: { es: 'Equipo integrado (supervisión, derivaciones internas)', 'pt-BR': 'Equipe integrada (supervisão, encaminhamentos internos)' } }
    ]
  },
  {
    id: 'PSI_EQ_02',
    category: 'team',
    subcategory: 'supervision',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Tenés supervisión clínica?',
      'pt-BR': 'Você tem supervisão clínica?'
    },
    type: 'single',
    options: [
      { id: 'regular', label: { es: 'Sí, supervisión regular', 'pt-BR': 'Sim, supervisão regular' } },
      { id: 'occasional', label: { es: 'Ocasionalmente para casos difíciles', 'pt-BR': 'Ocasionalmente para casos difíceis' } },
      { id: 'peer', label: { es: 'Interconsulta entre pares', 'pt-BR': 'Interconsulta entre pares' } },
      { id: 'none', label: { es: 'No tengo supervisión', 'pt-BR': 'Não tenho supervisão' } }
    ]
  },

  // ========== TECNOLOGÍA ==========
  {
    id: 'PSI_TEC_01',
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
      { id: 'ehr', label: { es: 'Sistema de historia clínica digital', 'pt-BR': 'Sistema de prontuário digital' } },
      { id: 'scheduling', label: { es: 'Software de agendamiento', 'pt-BR': 'Software de agendamento' } },
      { id: 'video', label: { es: 'Plataforma de videollamadas profesional', 'pt-BR': 'Plataforma de videochamadas profissional' } },
      { id: 'billing', label: { es: 'Sistema de facturación', 'pt-BR': 'Sistema de faturamento' } },
      { id: 'basic', label: { es: 'Solo herramientas básicas (WhatsApp, Zoom)', 'pt-BR': 'Apenas ferramentas básicas (WhatsApp, Zoom)' } }
    ]
  },
  {
    id: 'PSI_TEC_02',
    category: 'technology',
    subcategory: 'video_platform',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué plataforma usás para sesiones online?',
      'pt-BR': 'Qual plataforma você usa para sessões online?'
    },
    type: 'single',
    options: [
      { id: 'specialized', label: { es: 'Plataforma especializada en terapia', 'pt-BR': 'Plataforma especializada em terapia' } },
      { id: 'zoom', label: { es: 'Zoom/Google Meet', 'pt-BR': 'Zoom/Google Meet' } },
      { id: 'whatsapp', label: { es: 'WhatsApp video', 'pt-BR': 'WhatsApp video' } },
      { id: 'none', label: { es: 'No hago sesiones online', 'pt-BR': 'Não faço sessões online' } }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'PSI_OB_01',
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
      { id: 'specialize', label: { es: 'Especializarme más', 'pt-BR': 'Me especializar mais' }, emoji: '🎯' },
      { id: 'balance', label: { es: 'Mejor balance vida-trabajo', 'pt-BR': 'Melhor equilíbrio vida-trabalho' }, emoji: '⚖️' },
      { id: 'expand', label: { es: 'Crear equipo/clínica', 'pt-BR': 'Criar equipe/clínica' }, emoji: '🏢' },
      { id: 'online', label: { es: 'Desarrollar práctica online', 'pt-BR': 'Desenvolver prática online' }, emoji: '💻' }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'PSI_RI_01',
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
      { id: 'retention', label: { es: 'Reducir abandonos de terapia', 'pt-BR': 'Reduzir abandonos de terapia' }, emoji: '🔄' },
      { id: 'pricing', label: { es: 'Cobrar lo que vale mi trabajo', 'pt-BR': 'Cobrar o que vale meu trabalho' }, emoji: '💸' },
      { id: 'burnout', label: { es: 'Evitar burnout/sobrecarga emocional', 'pt-BR': 'Evitar burnout/sobrecarga emocional' }, emoji: '😓' },
      { id: 'differentiation', label: { es: 'Diferenciarme de otros profesionales', 'pt-BR': 'Me diferenciar de outros profissionais' }, emoji: '⭐' },
      { id: 'admin', label: { es: 'Gestión administrativa', 'pt-BR': 'Gestão administrativa' }, emoji: '📋' }
    ]
  },
  {
    id: 'PSI_RI_02',
    category: 'risks',
    subcategory: 'burnout',
    dimension: 'team',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cómo manejás tu propio autocuidado?',
      'pt-BR': 'Como você gerencia seu próprio autocuidado?'
    },
    type: 'single',
    options: [
      { id: 'structured', label: { es: 'Tengo rutinas estructuradas de autocuidado', 'pt-BR': 'Tenho rotinas estruturadas de autocuidado' } },
      { id: 'some', label: { es: 'Algunas prácticas pero no consistentes', 'pt-BR': 'Algumas práticas mas não consistentes' } },
      { id: 'therapy', label: { es: 'Estoy en terapia personal', 'pt-BR': 'Estou em terapia pessoal' } },
      { id: 'struggling', label: { es: 'Me cuesta priorizarlo', 'pt-BR': 'Tenho dificuldade em priorizar' } }
    ]
  }
];

export default PSICOLOGIA_QUESTIONS;
