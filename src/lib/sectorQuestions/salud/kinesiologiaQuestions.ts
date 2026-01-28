// Kinesiología / Fisioterapia / Rehabilitación - Cuestionario Hiper-Personalizado
// Quick: 15 preguntas | Complete: 70 preguntas
// 12 categorías + 7 dimensiones de salud

import { GastroQuestion } from '../../gastroQuestionsEngine';

export const KINESIOLOGIA_QUESTIONS: GastroQuestion[] = [
  // ========== IDENTIDAD Y POSICIONAMIENTO ==========
  {
    id: 'KIN_ID_01',
    category: 'identity',
    subcategory: 'business_model',
    dimension: 'growth',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué tipo de centro de rehabilitación operás?',
      'pt-BR': 'Que tipo de centro de reabilitação você opera?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Consultorio individual', 'pt-BR': 'Consultório individual' }, emoji: '👤' },
      { id: 'group_practice', label: { es: 'Clínica con varios kinesiólogos', 'pt-BR': 'Clínica com vários fisioterapeutas' }, emoji: '👥' },
      { id: 'multidisciplinary', label: { es: 'Centro multidisciplinario (traumato, neuro, etc.)', 'pt-BR': 'Centro multidisciplinar (traumato, neuro, etc.)' }, emoji: '🏥' },
      { id: 'sports', label: { es: 'Centro de rehabilitación deportiva', 'pt-BR': 'Centro de reabilitação esportiva' }, emoji: '⚽' },
      { id: 'home_care', label: { es: 'Atención a domicilio principalmente', 'pt-BR': 'Atendimento domiciliar principalmente' }, emoji: '🏠' }
    ]
  },
  {
    id: 'KIN_ID_02',
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
      { id: 'orthopedic', label: { es: 'Traumatología/Ortopedia', 'pt-BR': 'Traumatologia/Ortopedia' }, emoji: '🦴' },
      { id: 'neuro', label: { es: 'Neurorehabilitación', 'pt-BR': 'Neuroreabilitação' }, emoji: '🧠' },
      { id: 'sports', label: { es: 'Kinesiología deportiva', 'pt-BR': 'Fisioterapia esportiva' }, emoji: '🏃' },
      { id: 'respiratory', label: { es: 'Respiratoria', 'pt-BR': 'Respiratória' }, emoji: '🫁' },
      { id: 'pediatric', label: { es: 'Pediátrica', 'pt-BR': 'Pediátrica' }, emoji: '👶' },
      { id: 'geriatric', label: { es: 'Geriátrica', 'pt-BR': 'Geriátrica' }, emoji: '👴' },
      { id: 'pelvic', label: { es: 'Piso pélvico', 'pt-BR': 'Assoalho pélvico' }, emoji: '🩺' },
      { id: 'general', label: { es: 'General (sin especialidad)', 'pt-BR': 'Geral (sem especialidade)' }, emoji: '📋' }
    ]
  },
  {
    id: 'KIN_ID_03',
    category: 'identity',
    subcategory: 'differentiator',
    dimension: 'reputation',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es tu diferenciador principal?',
      'pt-BR': 'Qual é seu diferencial principal?'
    },
    type: 'single',
    options: [
      { id: 'tech', label: { es: 'Tecnología avanzada (láser, ondas de choque, etc.)', 'pt-BR': 'Tecnologia avançada (laser, ondas de choque, etc.)' }, emoji: '🔬' },
      { id: 'manual', label: { es: 'Técnicas manuales especializadas', 'pt-BR': 'Técnicas manuais especializadas' }, emoji: '🙌' },
      { id: 'sports_exp', label: { es: 'Experiencia con deportistas de élite', 'pt-BR': 'Experiência com atletas de elite' }, emoji: '🏆' },
      { id: 'holistic', label: { es: 'Enfoque integral/holístico', 'pt-BR': 'Abordagem integral/holística' }, emoji: '🧘' },
      { id: 'results', label: { es: 'Medición de resultados y seguimiento', 'pt-BR': 'Medição de resultados e acompanhamento' }, emoji: '📊' },
      { id: 'convenience', label: { es: 'Horarios flexibles y domicilio', 'pt-BR': 'Horários flexíveis e domicílio' }, emoji: '🕐' }
    ]
  },

  // ========== OFERTA Y SERVICIOS ==========
  {
    id: 'KIN_OF_01',
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
      { id: 'manual_therapy', label: { es: 'Terapia manual', 'pt-BR': 'Terapia manual' } },
      { id: 'exercise', label: { es: 'Ejercicio terapéutico', 'pt-BR': 'Exercício terapêutico' } },
      { id: 'electro', label: { es: 'Electroterapia', 'pt-BR': 'Eletroterapia' } },
      { id: 'dry_needling', label: { es: 'Punción seca', 'pt-BR': 'Agulhamento seco' } },
      { id: 'shock_wave', label: { es: 'Ondas de choque', 'pt-BR': 'Ondas de choque' } },
      { id: 'laser', label: { es: 'Láser terapéutico', 'pt-BR': 'Laser terapêutico' } },
      { id: 'kinesiotaping', label: { es: 'Kinesiotaping', 'pt-BR': 'Kinesiotaping' } },
      { id: 'hydrotherapy', label: { es: 'Hidroterapia', 'pt-BR': 'Hidroterapia' } },
      { id: 'pilates', label: { es: 'Pilates rehabilitador', 'pt-BR': 'Pilates reabilitador' } }
    ]
  },
  {
    id: 'KIN_OF_02',
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
      { id: '45min', label: { es: '45 minutos', 'pt-BR': '45 minutos' } },
      { id: '60min', label: { es: '60 minutos', 'pt-BR': '60 minutos' } },
      { id: 'variable', label: { es: 'Variable según tratamiento', 'pt-BR': 'Variável conforme tratamento' } }
    ]
  },
  {
    id: 'KIN_OF_03',
    category: 'offering',
    subcategory: 'programs',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecés programas o paquetes de sesiones?',
      'pt-BR': 'Você oferece programas ou pacotes de sessões?'
    },
    type: 'single',
    options: [
      { id: 'programs', label: { es: 'Sí, programas estructurados con objetivos', 'pt-BR': 'Sim, programas estruturados com objetivos' } },
      { id: 'packages', label: { es: 'Paquetes de sesiones con descuento', 'pt-BR': 'Pacotes de sessões com desconto' } },
      { id: 'both', label: { es: 'Ambos (programas y paquetes)', 'pt-BR': 'Ambos (programas e pacotes)' } },
      { id: 'none', label: { es: 'Solo sesiones individuales', 'pt-BR': 'Apenas sessões individuais' } }
    ]
  },
  {
    id: 'KIN_OF_04',
    category: 'offering',
    subcategory: 'home_visits',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Hacés atención a domicilio?',
      'pt-BR': 'Você faz atendimento a domicílio?'
    },
    type: 'single',
    options: [
      { id: 'main', label: { es: 'Es mi modelo principal', 'pt-BR': 'É meu modelo principal' } },
      { id: 'regular', label: { es: 'Sí, regularmente (+30% de pacientes)', 'pt-BR': 'Sim, regularmente (+30% de pacientes)' } },
      { id: 'occasional', label: { es: 'Ocasionalmente para casos especiales', 'pt-BR': 'Ocasionalmente para casos especiais' } },
      { id: 'none', label: { es: 'No, solo en consultorio', 'pt-BR': 'Não, apenas em consultório' } }
    ]
  },

  // ========== CLIENTE Y DEMANDA ==========
  {
    id: 'KIN_CL_01',
    category: 'demand',
    subcategory: 'patient_profile',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el perfil principal de tus pacientes?',
      'pt-BR': 'Qual é o perfil principal dos seus pacientes?'
    },
    type: 'single',
    options: [
      { id: 'post_surgery', label: { es: 'Post-quirúrgicos', 'pt-BR': 'Pós-cirúrgicos' } },
      { id: 'chronic', label: { es: 'Dolor crónico', 'pt-BR': 'Dor crônica' } },
      { id: 'sports', label: { es: 'Lesiones deportivas', 'pt-BR': 'Lesões esportivas' } },
      { id: 'elderly', label: { es: 'Tercera edad', 'pt-BR': 'Terceira idade' } },
      { id: 'neurological', label: { es: 'Pacientes neurológicos', 'pt-BR': 'Pacientes neurológicos' } },
      { id: 'mixed', label: { es: 'Mix variado', 'pt-BR': 'Mix variado' } }
    ]
  },
  {
    id: 'KIN_CL_02',
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
      { id: 'traumatologists', label: { es: 'Traumatólogos/Ortopedistas', 'pt-BR': 'Traumatologistas/Ortopedistas' } },
      { id: 'neurologists', label: { es: 'Neurólogos', 'pt-BR': 'Neurologistas' } },
      { id: 'sports_docs', label: { es: 'Médicos deportólogos', 'pt-BR': 'Médicos do esporte' } },
      { id: 'insurance', label: { es: 'Obras sociales/prepagas', 'pt-BR': 'Convênios' } },
      { id: 'direct', label: { es: 'Pacientes directos (sin derivación)', 'pt-BR': 'Pacientes diretos (sem encaminhamento)' } },
      { id: 'word_of_mouth', label: { es: 'Boca a boca / referencias', 'pt-BR': 'Boca a boca / referências' } }
    ]
  },
  {
    id: 'KIN_CL_03',
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
      { id: 'low', label: { es: 'Menos de 20', 'pt-BR': 'Menos de 20' } },
      { id: 'medium', label: { es: '20-40', 'pt-BR': '20-40' } },
      { id: 'high', label: { es: '40-60', 'pt-BR': '40-60' } },
      { id: 'very_high', label: { es: '60-100', 'pt-BR': '60-100' } },
      { id: 'industrial', label: { es: 'Más de 100', 'pt-BR': 'Mais de 100' } }
    ]
  },
  {
    id: 'KIN_CL_04',
    category: 'demand',
    subcategory: 'avg_treatment',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuántas sesiones dura un tratamiento promedio?',
      'pt-BR': 'Quantas sessões dura um tratamento médio?'
    },
    type: 'single',
    options: [
      { id: 'short', label: { es: '1-5 sesiones', 'pt-BR': '1-5 sessões' } },
      { id: 'medium', label: { es: '6-10 sesiones', 'pt-BR': '6-10 sessões' } },
      { id: 'long', label: { es: '10-20 sesiones', 'pt-BR': '10-20 sessões' } },
      { id: 'chronic', label: { es: 'Más de 20 / tratamientos crónicos', 'pt-BR': 'Mais de 20 / tratamentos crônicos' } }
    ]
  },

  // ========== VENTAS Y CONVERSIÓN ==========
  {
    id: 'KIN_VE_01',
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
      { id: 'web', label: { es: 'Reserva online', 'pt-BR': 'Reserva online' }, emoji: '🌐' },
      { id: 'app', label: { es: 'App específica', 'pt-BR': 'App específico' }, emoji: '📱' },
      { id: 'in_person', label: { es: 'Presencial', 'pt-BR': 'Presencial' }, emoji: '🏥' }
    ]
  },
  {
    id: 'KIN_VE_02',
    category: 'sales',
    subcategory: 'adherence',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué porcentaje de pacientes completa el tratamiento recomendado?',
      'pt-BR': 'Qual porcentagem de pacientes completa o tratamento recomendado?'
    },
    type: 'single',
    options: [
      { id: 'excellent', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' }, emoji: '🏆' },
      { id: 'good', label: { es: '60-80%', 'pt-BR': '60-80%' }, emoji: '✅' },
      { id: 'medium', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '⚠️' },
      { id: 'low', label: { es: 'Menos del 40%', 'pt-BR': 'Menos de 40%' }, emoji: '❌' },
      { id: 'unknown', label: { es: 'No lo mido', 'pt-BR': 'Não meço' }, emoji: '❓' }
    ]
  },
  {
    id: 'KIN_VE_03',
    category: 'sales',
    subcategory: 'no_show',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuál es tu tasa de ausentismo/cancelaciones?',
      'pt-BR': 'Qual é sua taxa de absenteísmo/cancelamentos?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos del 5%', 'pt-BR': 'Menos de 5%' } },
      { id: 'normal', label: { es: '5-10%', 'pt-BR': '5-10%' } },
      { id: 'high', label: { es: '10-20%', 'pt-BR': '10-20%' } },
      { id: 'critical', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' } }
    ]
  },

  // ========== FINANZAS Y MÁRGENES ==========
  {
    id: 'KIN_FI_01',
    category: 'finance',
    subcategory: 'session_price',
    dimension: 'profitability',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuál es el precio promedio de una sesión particular?',
      'pt-BR': 'Qual é o preço médio de uma sessão particular?'
    },
    type: 'single',
    options: [
      { id: 'low', label: { es: 'Menos de $15k ARS / R$100', 'pt-BR': 'Menos de R$100 / $15k ARS' } },
      { id: 'medium', label: { es: '$15k-30k ARS / R$100-200', 'pt-BR': 'R$100-200 / $15k-30k ARS' } },
      { id: 'high', label: { es: '$30k-50k ARS / R$200-350', 'pt-BR': 'R$200-350 / $30k-50k ARS' } },
      { id: 'premium', label: { es: 'Más de $50k ARS / R$350', 'pt-BR': 'Mais de R$350 / $50k ARS' } }
    ]
  },
  {
    id: 'KIN_FI_02',
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
      { id: 'private', label: { es: 'Menos del 30% (mayoría particulares)', 'pt-BR': 'Menos de 30% (maioria particulares)' } },
      { id: 'balanced', label: { es: '30-60%', 'pt-BR': '30-60%' } },
      { id: 'insurance_heavy', label: { es: '60-80%', 'pt-BR': '60-80%' } },
      { id: 'insurance_only', label: { es: 'Más del 80%', 'pt-BR': 'Mais de 80%' } }
    ]
  },
  {
    id: 'KIN_FI_03',
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
      { id: 'tier1', label: { es: 'Menos de $1M ARS / R$25k', 'pt-BR': 'Menos de R$25k / $1M ARS' } },
      { id: 'tier2', label: { es: '$1M-3M ARS / R$25k-75k', 'pt-BR': 'R$25k-75k / $1M-3M ARS' } },
      { id: 'tier3', label: { es: '$3M-8M ARS / R$75k-200k', 'pt-BR': 'R$75k-200k / $3M-8M ARS' } },
      { id: 'tier4', label: { es: '$8M-20M ARS / R$200k-500k', 'pt-BR': 'R$200k-500k / $8M-20M ARS' } },
      { id: 'tier5', label: { es: 'Más de $20M ARS / R$500k', 'pt-BR': 'Mais de R$500k / $20M ARS' } }
    ]
  },
  {
    id: 'KIN_FI_04',
    category: 'finance',
    subcategory: 'equipment_investment',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Cuánto invertiste en equipamiento en los últimos 2 años?',
      'pt-BR': 'Quanto você investiu em equipamentos nos últimos 2 anos?'
    },
    type: 'single',
    options: [
      { id: 'none', label: { es: 'Nada', 'pt-BR': 'Nada' } },
      { id: 'low', label: { es: 'Menos de $2M ARS / R$50k', 'pt-BR': 'Menos de R$50k / $2M ARS' } },
      { id: 'medium', label: { es: '$2M-10M ARS / R$50k-250k', 'pt-BR': 'R$50k-250k / $2M-10M ARS' } },
      { id: 'high', label: { es: 'Más de $10M ARS / R$250k', 'pt-BR': 'Mais de R$250k / $10M ARS' } }
    ]
  },

  // ========== OPERACIONES ==========
  {
    id: 'KIN_OP_01',
    category: 'operation',
    subcategory: 'facilities',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos boxes o camillas tenés?',
      'pt-BR': 'Quantos boxes ou macas você tem?'
    },
    type: 'single',
    options: [
      { id: 'one', label: { es: '1 (consultorio individual)', 'pt-BR': '1 (consultório individual)' } },
      { id: 'few', label: { es: '2-3', 'pt-BR': '2-3' } },
      { id: 'medium', label: { es: '4-6', 'pt-BR': '4-6' } },
      { id: 'large', label: { es: '7-10', 'pt-BR': '7-10' } },
      { id: 'clinic', label: { es: 'Más de 10', 'pt-BR': 'Mais de 10' } }
    ]
  },
  {
    id: 'KIN_OP_02',
    category: 'operation',
    subcategory: 'gym_area',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Tenés área de ejercicio terapéutico/gimnasio?',
      'pt-BR': 'Você tem área de exercício terapêutico/academia?'
    },
    type: 'single',
    options: [
      { id: 'full', label: { es: 'Sí, gimnasio completo', 'pt-BR': 'Sim, academia completa' } },
      { id: 'basic', label: { es: 'Área básica con equipamiento esencial', 'pt-BR': 'Área básica com equipamento essencial' } },
      { id: 'minimal', label: { es: 'Espacio reducido/improvisado', 'pt-BR': 'Espaço reduzido/improvisado' } },
      { id: 'none', label: { es: 'No tengo', 'pt-BR': 'Não tenho' } }
    ]
  },
  {
    id: 'KIN_OP_03',
    category: 'operation',
    subcategory: 'schedule',
    dimension: 'traffic',
    priority: 2,
    mode: 'both',
    question: {
      es: '¿Cuál es tu horario de atención?',
      'pt-BR': 'Qual é seu horário de atendimento?'
    },
    type: 'single',
    options: [
      { id: 'morning', label: { es: 'Solo mañana', 'pt-BR': 'Apenas manhã' } },
      { id: 'afternoon', label: { es: 'Solo tarde', 'pt-BR': 'Apenas tarde' } },
      { id: 'split', label: { es: 'Mañana y tarde (cortado)', 'pt-BR': 'Manhã e tarde (cortado)' } },
      { id: 'full', label: { es: 'Jornada completa continua', 'pt-BR': 'Jornada completa contínua' } },
      { id: 'extended', label: { es: 'Horario extendido (incluye sábados)', 'pt-BR': 'Horário estendido (inclui sábados)' } }
    ]
  },

  // ========== MARKETING ==========
  {
    id: 'KIN_MK_01',
    category: 'marketing',
    subcategory: 'channels',
    dimension: 'traffic',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cómo captás nuevos pacientes?',
      'pt-BR': 'Como você capta novos pacientes?'
    },
    type: 'multi',
    options: [
      { id: 'doctor_referral', label: { es: 'Derivación de médicos', 'pt-BR': 'Encaminhamento de médicos' }, emoji: '👨‍⚕️' },
      { id: 'insurance', label: { es: 'Obras sociales/prepagas', 'pt-BR': 'Convênios' }, emoji: '📋' },
      { id: 'word_of_mouth', label: { es: 'Boca a boca', 'pt-BR': 'Boca a boca' }, emoji: '💬' },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
      { id: 'google', label: { es: 'Google Maps / SEO', 'pt-BR': 'Google Maps / SEO' }, emoji: '🔍' },
      { id: 'sports_clubs', label: { es: 'Clubes deportivos', 'pt-BR': 'Clubes esportivos' }, emoji: '⚽' }
    ]
  },
  {
    id: 'KIN_MK_02',
    category: 'marketing',
    subcategory: 'doctor_network',
    dimension: 'traffic',
    priority: 1,
    mode: 'complete',
    question: {
      es: '¿Tenés una red activa de médicos derivadores?',
      'pt-BR': 'Você tem uma rede ativa de médicos que encaminham?'
    },
    type: 'single',
    options: [
      { id: 'strong', label: { es: 'Sí, +10 médicos que derivan regularmente', 'pt-BR': 'Sim, +10 médicos que encaminham regularmente' } },
      { id: 'moderate', label: { es: 'Algunos (3-10 médicos)', 'pt-BR': 'Alguns (3-10 médicos)' } },
      { id: 'few', label: { es: 'Pocos (1-2 médicos)', 'pt-BR': 'Poucos (1-2 médicos)' } },
      { id: 'none', label: { es: 'No tengo red de derivadores', 'pt-BR': 'Não tenho rede de encaminhadores' } }
    ]
  },

  // ========== RETENCIÓN ==========
  {
    id: 'KIN_RE_01',
    category: 'retention',
    subcategory: 'follow_up',
    dimension: 'reputation',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Hacés seguimiento post-tratamiento?',
      'pt-BR': 'Você faz acompanhamento pós-tratamento?'
    },
    type: 'single',
    options: [
      { id: 'systematic', label: { es: 'Sí, sistemáticamente (llamada/mensaje)', 'pt-BR': 'Sim, sistematicamente (ligação/mensagem)' } },
      { id: 'occasional', label: { es: 'A veces, con algunos pacientes', 'pt-BR': 'Às vezes, com alguns pacientes' } },
      { id: 'on_request', label: { es: 'Solo si el paciente contacta', 'pt-BR': 'Apenas se o paciente contata' } },
      { id: 'none', label: { es: 'No hago seguimiento', 'pt-BR': 'Não faço acompanhamento' } }
    ]
  },
  {
    id: 'KIN_RE_02',
    category: 'retention',
    subcategory: 'maintenance',
    dimension: 'profitability',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Ofrecés sesiones de mantenimiento después del alta?',
      'pt-BR': 'Você oferece sessões de manutenção após a alta?'
    },
    type: 'single',
    options: [
      { id: 'program', label: { es: 'Sí, programa estructurado de mantenimiento', 'pt-BR': 'Sim, programa estruturado de manutenção' } },
      { id: 'offer', label: { es: 'Lo sugiero pero pocos aceptan', 'pt-BR': 'Sugiro mas poucos aceitam' } },
      { id: 'on_demand', label: { es: 'Solo si el paciente lo pide', 'pt-BR': 'Apenas se o paciente pede' } },
      { id: 'none', label: { es: 'No ofrezco mantenimiento', 'pt-BR': 'Não ofereço manutenção' } }
    ]
  },

  // ========== EQUIPO ==========
  {
    id: 'KIN_EQ_01',
    category: 'team',
    subcategory: 'size',
    dimension: 'team',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Cuántos profesionales trabajan en tu centro?',
      'pt-BR': 'Quantos profissionais trabalham no seu centro?'
    },
    type: 'single',
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Apenas eu' } },
      { id: 'small', label: { es: '2-3 profesionales', 'pt-BR': '2-3 profissionais' } },
      { id: 'medium', label: { es: '4-6 profesionales', 'pt-BR': '4-6 profissionais' } },
      { id: 'large', label: { es: '7-15 profesionales', 'pt-BR': '7-15 profissionais' } },
      { id: 'clinic', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' } }
    ]
  },
  {
    id: 'KIN_EQ_02',
    category: 'team',
    subcategory: 'multidisciplinary',
    dimension: 'growth',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Tenés equipo multidisciplinario?',
      'pt-BR': 'Você tem equipe multidisciplinar?'
    },
    type: 'multi',
    options: [
      { id: 'physios', label: { es: 'Kinesiólogos/Fisioterapeutas', 'pt-BR': 'Fisioterapeutas' } },
      { id: 'ot', label: { es: 'Terapistas ocupacionales', 'pt-BR': 'Terapeutas ocupacionais' } },
      { id: 'speech', label: { es: 'Fonoaudiólogos', 'pt-BR': 'Fonoaudiólogos' } },
      { id: 'psycho', label: { es: 'Psicólogos', 'pt-BR': 'Psicólogos' } },
      { id: 'nutritionist', label: { es: 'Nutricionistas', 'pt-BR': 'Nutricionistas' } },
      { id: 'only_physio', label: { es: 'Solo kinesiología', 'pt-BR': 'Apenas fisioterapia' } }
    ]
  },

  // ========== TECNOLOGÍA ==========
  {
    id: 'KIN_TEC_01',
    category: 'technology',
    subcategory: 'management',
    dimension: 'efficiency',
    priority: 1,
    mode: 'both',
    question: {
      es: '¿Qué sistema usás para gestionar pacientes?',
      'pt-BR': 'Qual sistema você usa para gerenciar pacientes?'
    },
    type: 'single',
    options: [
      { id: 'specialized', label: { es: 'Software especializado en salud', 'pt-BR': 'Software especializado em saúde' } },
      { id: 'generic', label: { es: 'Sistema genérico de gestión', 'pt-BR': 'Sistema genérico de gestão' } },
      { id: 'excel', label: { es: 'Excel/planillas', 'pt-BR': 'Excel/planilhas' } },
      { id: 'paper', label: { es: 'Papel/agenda física', 'pt-BR': 'Papel/agenda física' } },
      { id: 'whatsapp', label: { es: 'Solo WhatsApp', 'pt-BR': 'Apenas WhatsApp' } }
    ]
  },
  {
    id: 'KIN_TEC_02',
    category: 'technology',
    subcategory: 'equipment',
    dimension: 'efficiency',
    priority: 2,
    mode: 'complete',
    question: {
      es: '¿Qué tecnología de tratamiento tenés?',
      'pt-BR': 'Qual tecnologia de tratamento você tem?'
    },
    type: 'multi',
    options: [
      { id: 'electro', label: { es: 'Electroterapia básica', 'pt-BR': 'Eletroterapia básica' } },
      { id: 'ultrasound', label: { es: 'Ultrasonido', 'pt-BR': 'Ultrassom' } },
      { id: 'laser', label: { es: 'Láser terapéutico', 'pt-BR': 'Laser terapêutico' } },
      { id: 'shock_wave', label: { es: 'Ondas de choque', 'pt-BR': 'Ondas de choque' } },
      { id: 'tecar', label: { es: 'TECAR/Radiofrecuencia', 'pt-BR': 'TECAR/Radiofrequência' } },
      { id: 'robotics', label: { es: 'Equipos robóticos/asistidos', 'pt-BR': 'Equipamentos robóticos/assistidos' } },
      { id: 'basic_only', label: { es: 'Solo equipamiento básico', 'pt-BR': 'Apenas equipamento básico' } }
    ]
  },

  // ========== OBJETIVOS ==========
  {
    id: 'KIN_OB_01',
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
      { id: 'revenue', label: { es: 'Mejorar facturación/rentabilidad', 'pt-BR': 'Melhorar faturamento/rentabilidade' }, emoji: '💰' },
      { id: 'specialize', label: { es: 'Especializarme más', 'pt-BR': 'Me especializar mais' }, emoji: '🎯' },
      { id: 'expand', label: { es: 'Expandir (nueva sede/kinesiólogos)', 'pt-BR': 'Expandir (nova sede/fisioterapeutas)' }, emoji: '🏢' },
      { id: 'equipment', label: { es: 'Invertir en equipamiento', 'pt-BR': 'Investir em equipamentos' }, emoji: '🔬' },
      { id: 'balance', label: { es: 'Mejor balance vida-trabajo', 'pt-BR': 'Melhor equilíbrio vida-trabalho' }, emoji: '⚖️' }
    ]
  },

  // ========== RIESGOS ==========
  {
    id: 'KIN_RI_01',
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
      { id: 'patient_acquisition', label: { es: 'Conseguir más pacientes', 'pt-BR': 'Conseguir mais pacientes' }, emoji: '👥' },
      { id: 'adherence', label: { es: 'Que los pacientes completen tratamiento', 'pt-BR': 'Que os pacientes completem tratamento' }, emoji: '🎯' },
      { id: 'insurance_rates', label: { es: 'Tarifas bajas de obras sociales', 'pt-BR': 'Tarifas baixas de convênios' }, emoji: '💸' },
      { id: 'competition', label: { es: 'Competencia (otros kinesiólogos)', 'pt-BR': 'Concorrência (outros fisioterapeutas)' }, emoji: '🏃' },
      { id: 'burnout', label: { es: 'Sobrecarga/burnout', 'pt-BR': 'Sobrecarga/burnout' }, emoji: '😓' },
      { id: 'differentiation', label: { es: 'Diferenciarme de la competencia', 'pt-BR': 'Me diferenciar da concorrência' }, emoji: '⭐' }
    ]
  }
];

export default KINESIOLOGIA_QUESTIONS;
