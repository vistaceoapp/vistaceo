// Psicología / Salud Mental - Complete Questionnaire
// 24 questions across 9 valid categories
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const PSICOLOGIA_QUESTIONS: GastroQuestion[] = [
  // ==================== IDENTITY (4) ====================
  {
    id: 'SA_PSI_001',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { es: '¿Qué tipo de práctica tenés?', 'pt-BR': 'Que tipo de prática você tem?' },
    type: 'single',
    required: true,
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'individual', label: { es: 'Consultorio individual', 'pt-BR': 'Consultório individual' }, emoji: '👤', impactScore: 12 },
      { id: 'group_practice', label: { es: 'Consultorio grupal / Asociados', 'pt-BR': 'Consultório em grupo / Associados' }, emoji: '👥', impactScore: 18 },
      { id: 'clinic', label: { es: 'Centro de salud mental', 'pt-BR': 'Centro de saúde mental' }, emoji: '🏥', impactScore: 20 },
      { id: 'online_only', label: { es: 'Solo atención online', 'pt-BR': 'Só atendimento online' }, emoji: '💻', impactScore: 18 },
    ],
  },
  {
    id: 'SA_PSI_002',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Cuál es tu orientación teórica?', 'pt-BR': 'Qual é sua orientação teórica?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'cbt', label: { es: 'Cognitivo-conductual (TCC)', 'pt-BR': 'Cognitivo-comportamental (TCC)' }, emoji: '🧠', impactScore: 18 },
      { id: 'psychoanalysis', label: { es: 'Psicoanálisis', 'pt-BR': 'Psicanálise' }, emoji: '🛋️', impactScore: 15 },
      { id: 'systemic', label: { es: 'Sistémica / Familiar', 'pt-BR': 'Sistêmica / Familiar' }, emoji: '👨‍👩‍👧‍👦', impactScore: 15 },
      { id: 'integrative', label: { es: 'Integrativa', 'pt-BR': 'Integrativa' }, emoji: '🔄', impactScore: 18 },
    ],
  },
  {
    id: 'SA_PSI_003',
    category: 'identity',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: { es: '¿Tenés especialización?', 'pt-BR': 'Você tem especialização?' },
    type: 'multi',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'anxiety', label: { es: 'Ansiedad / Estrés', 'pt-BR': 'Ansiedade / Estresse' }, emoji: '😰', impactScore: 15 },
      { id: 'depression', label: { es: 'Depresión', 'pt-BR': 'Depressão' }, emoji: '😔', impactScore: 15 },
      { id: 'couples', label: { es: 'Parejas', 'pt-BR': 'Casais' }, emoji: '❤️', impactScore: 18 },
      { id: 'children', label: { es: 'Niños / Adolescentes', 'pt-BR': 'Crianças / Adolescentes' }, emoji: '👶', impactScore: 15 },
      { id: 'trauma', label: { es: 'Trauma / TEPT', 'pt-BR': 'Trauma / TEPT' }, emoji: '🩹', impactScore: 18 },
    ],
  },

  // ==================== MENU/SERVICES (3) ====================
  {
    id: 'SA_PSI_004',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Qué modalidades de atención ofrecés?', 'pt-BR': 'Quais modalidades de atendimento você oferece?' },
    type: 'multi',
    required: true,
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'individual', label: { es: 'Terapia individual', 'pt-BR': 'Terapia individual' }, emoji: '👤', impactScore: 15 },
      { id: 'couples', label: { es: 'Terapia de pareja', 'pt-BR': 'Terapia de casal' }, emoji: '❤️', impactScore: 18 },
      { id: 'family', label: { es: 'Terapia familiar', 'pt-BR': 'Terapia familiar' }, emoji: '👨‍👩‍👧', impactScore: 15 },
      { id: 'group', label: { es: 'Terapia grupal', 'pt-BR': 'Terapia em grupo' }, emoji: '👥', impactScore: 18 },
      { id: 'online', label: { es: 'Terapia online', 'pt-BR': 'Terapia online' }, emoji: '💻', impactScore: 20 },
    ],
  },
  {
    id: 'SA_PSI_005',
    category: 'menu',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Qué porcentaje de sesiones son online?', 'pt-BR': 'Qual porcentagem das sessões são online?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: '0-20', label: { es: '0-20% (mayormente presencial)', 'pt-BR': '0-20% (maioria presencial)' }, emoji: '🏢', impactScore: 10 },
      { id: '20-50', label: { es: '20-50% híbrido', 'pt-BR': '20-50% híbrido' }, emoji: '🔄', impactScore: 15 },
      { id: '50-80', label: { es: '50-80% online', 'pt-BR': '50-80% online' }, emoji: '💻', impactScore: 18 },
      { id: '80-100', label: { es: '80-100% online', 'pt-BR': '80-100% online' }, emoji: '🌐', impactScore: 20 },
    ],
  },

  // ==================== SALES (3) ====================
  {
    id: 'SA_PSI_006',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Cuántos pacientes atendés por semana?', 'pt-BR': 'Quantos pacientes você atende por semana?' },
    type: 'single',
    required: true,
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: '0-10', label: { es: 'Menos de 10', 'pt-BR': 'Menos de 10' }, emoji: '👤', impactScore: 8 },
      { id: '10-20', label: { es: '10-20 pacientes', 'pt-BR': '10-20 pacientes' }, emoji: '👥', impactScore: 15 },
      { id: '20-30', label: { es: '20-30 pacientes', 'pt-BR': '20-30 pacientes' }, emoji: '🏥', impactScore: 18 },
      { id: '30+', label: { es: 'Más de 30', 'pt-BR': 'Mais de 30' }, emoji: '🏢', impactScore: 20 },
    ],
  },
  {
    id: 'SA_PSI_007',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: { es: '¿Tenés lista de espera?', 'pt-BR': 'Você tem lista de espera?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'yes_long', label: { es: 'Sí, más de 2 semanas', 'pt-BR': 'Sim, mais de 2 semanas' }, emoji: '📋', impactScore: 20 },
      { id: 'yes_short', label: { es: 'Sí, menos de 2 semanas', 'pt-BR': 'Sim, menos de 2 semanas' }, emoji: '📝', impactScore: 15 },
      { id: 'no', label: { es: 'No, tengo disponibilidad', 'pt-BR': 'Não, tenho disponibilidade' }, emoji: '✅', impactScore: 10 },
    ],
  },

  // ==================== OPERATION (3) ====================
  {
    id: 'SA_PSI_008',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia os agendamentos?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'software', label: { es: 'Software especializado', 'pt-BR': 'Software especializado' }, emoji: '💻', impactScore: 20 },
      { id: 'calendar', label: { es: 'Google Calendar / Similar', 'pt-BR': 'Google Calendar / Similar' }, emoji: '📅', impactScore: 15 },
      { id: 'whatsapp', label: { es: 'WhatsApp / Teléfono', 'pt-BR': 'WhatsApp / Telefone' }, emoji: '📱', impactScore: 10 },
      { id: 'manual', label: { es: 'Agenda manual', 'pt-BR': 'Agenda manual' }, emoji: '📒', impactScore: 5 },
    ],
  },
  {
    id: 'SA_PSI_009',
    category: 'operation',
    mode: 'complete',
    dimension: 'finances',
    weight: 7,
    title: { es: '¿Cuál es tu tasa de ausencias/cancelaciones?', 'pt-BR': 'Qual é sua taxa de faltas/cancelamentos?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'low', label: { es: 'Menos del 10%', 'pt-BR': 'Menos de 10%' }, emoji: '💚', impactScore: 20 },
      { id: 'medium', label: { es: '10-20%', 'pt-BR': '10-20%' }, emoji: '💛', impactScore: 12 },
      { id: 'high', label: { es: 'Más del 20%', 'pt-BR': 'Mais de 20%' }, emoji: '🔴', impactScore: 5 },
    ],
  },

  // ==================== FINANCE (3) ====================
  {
    id: 'SA_PSI_010',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: { es: '¿Cuál es el valor de tu sesión particular?', 'pt-BR': 'Qual é o valor da sua sessão particular?' },
    type: 'number',
    businessTypes: ['psicologia_salud_mental'],
  },
  {
    id: 'SA_PSI_011',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: { es: '¿Qué porcentaje de pacientes son particulares?', 'pt-BR': 'Qual porcentagem de pacientes são particulares?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: '0-25', label: { es: '0-25%', 'pt-BR': '0-25%' }, emoji: '📊', impactScore: 8 },
      { id: '25-50', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '📈', impactScore: 12 },
      { id: '50-75', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💰', impactScore: 18 },
      { id: '75-100', label: { es: '75-100%', 'pt-BR': '75-100%' }, emoji: '💎', impactScore: 20 },
    ],
  },

  // ==================== TEAM (1) ====================
  {
    id: 'SA_PSI_012',
    category: 'team',
    mode: 'both',
    dimension: 'efficiency',
    weight: 7,
    title: { es: '¿Trabajás con otros profesionales?', 'pt-BR': 'Você trabalha com outros profissionais?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'solo', label: { es: 'Solo/a', 'pt-BR': 'Sozinho/a' }, emoji: '👤', impactScore: 10 },
      { id: 'partners', label: { es: 'Con colegas asociados', 'pt-BR': 'Com colegas associados' }, emoji: '👥', impactScore: 18 },
      { id: 'team', label: { es: 'Equipo interdisciplinario', 'pt-BR': 'Equipe interdisciplinar' }, emoji: '🏥', impactScore: 20 },
    ],
  },

  // ==================== MARKETING (2) ====================
  {
    id: 'SA_PSI_013',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Cómo atraés nuevos pacientes?', 'pt-BR': 'Como você atrai novos pacientes?' },
    type: 'multi',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'referrals', label: { es: 'Referidos de pacientes', 'pt-BR': 'Indicações de pacientes' }, emoji: '🗣️', impactScore: 20 },
      { id: 'doctors', label: { es: 'Red de médicos', 'pt-BR': 'Rede de médicos' }, emoji: '👨‍⚕️', impactScore: 18 },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 12 },
      { id: 'directories', label: { es: 'Directorios de psicólogos', 'pt-BR': 'Diretórios de psicólogos' }, emoji: '📋', impactScore: 15 },
    ],
  },

  // ==================== REPUTATION (2) ====================
  {
    id: 'SA_PSI_014',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Cómo manejan las recomendaciones tus pacientes?', 'pt-BR': 'Como seus pacientes lidam com recomendações?' },
    type: 'single',
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'frequent', label: { es: 'Muchos me recomiendan', 'pt-BR': 'Muitos me recomendam' }, emoji: '⭐', impactScore: 20 },
      { id: 'some', label: { es: 'Algunos me recomiendan', 'pt-BR': 'Alguns me recomendam' }, emoji: '👍', impactScore: 15 },
      { id: 'few', label: { es: 'Pocos', 'pt-BR': 'Poucos' }, emoji: '😐', impactScore: 8 },
    ],
  },

  // ==================== GOALS (2) ====================
  {
    id: 'SA_PSI_015',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' },
    type: 'single',
    required: true,
    businessTypes: ['psicologia_salud_mental'],
    options: [
      { id: 'grow', label: { es: 'Llenar agenda', 'pt-BR': 'Encher agenda' }, emoji: '📈', impactScore: 15 },
      { id: 'private', label: { es: 'Más pacientes particulares', 'pt-BR': 'Mais pacientes particulares' }, emoji: '💰', impactScore: 20 },
      { id: 'specialize', label: { es: 'Especializarme más', 'pt-BR': 'Especializar-me mais' }, emoji: '🎯', impactScore: 18 },
      { id: 'online', label: { es: 'Crecer en terapia online', 'pt-BR': 'Crescer em terapia online' }, emoji: '💻', impactScore: 18 },
      { id: 'balance', label: { es: 'Mejor equilibrio trabajo-vida', 'pt-BR': 'Melhor equilíbrio trabalho-vida' }, emoji: '⚖️', impactScore: 15 },
    ],
  },
];

export default PSICOLOGIA_QUESTIONS;
