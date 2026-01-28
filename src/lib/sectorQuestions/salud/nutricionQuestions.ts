// Nutrición / Dietética - Complete Questionnaire
// 23 questions across 9 valid categories
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const NUTRICION_QUESTIONS: GastroQuestion[] = [
  // ==================== IDENTITY (3) ====================
  {
    id: 'SA_NUT_001',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { es: '¿Qué tipo de práctica tenés?', 'pt-BR': 'Que tipo de prática você tem?' },
    type: 'single',
    required: true,
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'solo', label: { es: 'Consultorio individual', 'pt-BR': 'Consultório individual' }, emoji: '👤', impactScore: 12 },
      { id: 'clinic', label: { es: 'Clínica / Centro', 'pt-BR': 'Clínica / Centro' }, emoji: '🏥', impactScore: 18 },
      { id: 'gym_partner', label: { es: 'Asociado a gimnasio', 'pt-BR': 'Associado a academia' }, emoji: '🏋️', impactScore: 15 },
      { id: 'online_only', label: { es: '100% online', 'pt-BR': '100% online' }, emoji: '💻', impactScore: 18 },
    ],
  },
  {
    id: 'SA_NUT_002',
    category: 'identity',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Cuál es tu especialización?', 'pt-BR': 'Qual é sua especialização?' },
    type: 'multi',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'weight_loss', label: { es: 'Pérdida de peso', 'pt-BR': 'Perda de peso' }, emoji: '⚖️', impactScore: 15 },
      { id: 'sports', label: { es: 'Nutrición deportiva', 'pt-BR': 'Nutrição esportiva' }, emoji: '🏃', impactScore: 18 },
      { id: 'clinical', label: { es: 'Nutrición clínica', 'pt-BR': 'Nutrição clínica' }, emoji: '🏥', impactScore: 18 },
      { id: 'pediatric', label: { es: 'Pediátrica', 'pt-BR': 'Pediátrica' }, emoji: '👶', impactScore: 15 },
      { id: 'vegan', label: { es: 'Vegetariana / Vegana', 'pt-BR': 'Vegetariana / Vegana' }, emoji: '🥗', impactScore: 15 },
    ],
  },

  // ==================== MENU/SERVICES (3) ====================
  {
    id: 'SA_NUT_003',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Qué servicios ofrecés?', 'pt-BR': 'Quais serviços você oferece?' },
    type: 'multi',
    required: true,
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'individual', label: { es: 'Consulta individual', 'pt-BR': 'Consulta individual' }, emoji: '👤', impactScore: 15 },
      { id: 'plans', label: { es: 'Planes nutricionales', 'pt-BR': 'Planos nutricionais' }, emoji: '📋', impactScore: 15 },
      { id: 'body_comp', label: { es: 'Análisis de composición corporal', 'pt-BR': 'Análise de composição corporal' }, emoji: '📊', impactScore: 18 },
      { id: 'online', label: { es: 'Seguimiento online', 'pt-BR': 'Acompanhamento online' }, emoji: '💻', impactScore: 18 },
      { id: 'corporate', label: { es: 'Programas empresariales', 'pt-BR': 'Programas empresariais' }, emoji: '🏢', impactScore: 20 },
    ],
  },
  {
    id: 'SA_NUT_004',
    category: 'menu',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: { es: '¿Ofrecés productos o suplementos?', 'pt-BR': 'Você oferece produtos ou suplementos?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'yes_sell', label: { es: 'Sí, los vendo', 'pt-BR': 'Sim, eu vendo' }, emoji: '💊', impactScore: 15 },
      { id: 'recommend', label: { es: 'Solo recomiendo marcas', 'pt-BR': 'Só recomendo marcas' }, emoji: '👍', impactScore: 12 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
    ],
  },

  // ==================== SALES (3) ====================
  {
    id: 'SA_NUT_005',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Cuántos pacientes atendés por semana?', 'pt-BR': 'Quantos pacientes você atende por semana?' },
    type: 'single',
    required: true,
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: '0-10', label: { es: 'Menos de 10', 'pt-BR': 'Menos de 10' }, emoji: '👤', impactScore: 8 },
      { id: '10-25', label: { es: '10-25 pacientes', 'pt-BR': '10-25 pacientes' }, emoji: '👥', impactScore: 15 },
      { id: '25-40', label: { es: '25-40 pacientes', 'pt-BR': '25-40 pacientes' }, emoji: '🏥', impactScore: 18 },
      { id: '40+', label: { es: 'Más de 40', 'pt-BR': 'Mais de 40' }, emoji: '🏢', impactScore: 20 },
    ],
  },
  {
    id: 'SA_NUT_006',
    category: 'sales',
    mode: 'complete',
    dimension: 'growth',
    weight: 7,
    title: { es: '¿Cuál es tu tasa de retención?', 'pt-BR': 'Qual é sua taxa de retenção?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'high', label: { es: 'Alta (>70% completan tratamiento)', 'pt-BR': 'Alta (>70% completam tratamento)' }, emoji: '💚', impactScore: 20 },
      { id: 'medium', label: { es: 'Media (50-70%)', 'pt-BR': 'Média (50-70%)' }, emoji: '💛', impactScore: 15 },
      { id: 'low', label: { es: 'Baja (<50%)', 'pt-BR': 'Baixa (<50%)' }, emoji: '🔴', impactScore: 8 },
    ],
  },

  // ==================== OPERATION (3) ====================
  {
    id: 'SA_NUT_007',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia os agendamentos?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'software', label: { es: 'Software especializado', 'pt-BR': 'Software especializado' }, emoji: '💻', impactScore: 20 },
      { id: 'calendar', label: { es: 'Google Calendar / Similar', 'pt-BR': 'Google Calendar / Similar' }, emoji: '📅', impactScore: 15 },
      { id: 'whatsapp', label: { es: 'WhatsApp', 'pt-BR': 'WhatsApp' }, emoji: '📱', impactScore: 10 },
      { id: 'manual', label: { es: 'Agenda manual', 'pt-BR': 'Agenda manual' }, emoji: '📒', impactScore: 5 },
    ],
  },
  {
    id: 'SA_NUT_008',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: { es: '¿Usás app o plataforma para seguimiento?', 'pt-BR': 'Você usa app ou plataforma para acompanhamento?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'own_app', label: { es: 'Sí, app propia', 'pt-BR': 'Sim, app próprio' }, emoji: '📱', impactScore: 20 },
      { id: 'third_party', label: { es: 'Sí, app de terceros', 'pt-BR': 'Sim, app de terceiros' }, emoji: '📲', impactScore: 15 },
      { id: 'whatsapp', label: { es: 'WhatsApp/Email', 'pt-BR': 'WhatsApp/Email' }, emoji: '💬', impactScore: 10 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
    ],
  },

  // ==================== FINANCE (3) ====================
  {
    id: 'SA_NUT_009',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: { es: '¿Cuál es el valor de tu consulta inicial?', 'pt-BR': 'Qual é o valor da sua consulta inicial?' },
    type: 'number',
    businessTypes: ['nutricion_dietetica'],
  },
  {
    id: 'SA_NUT_010',
    category: 'finance',
    mode: 'complete',
    dimension: 'profitability',
    weight: 7,
    title: { es: '¿Qué porcentaje son pacientes particulares?', 'pt-BR': 'Qual porcentagem são pacientes particulares?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: '0-25', label: { es: '0-25%', 'pt-BR': '0-25%' }, emoji: '📊', impactScore: 8 },
      { id: '25-50', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '📈', impactScore: 12 },
      { id: '50-75', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💰', impactScore: 18 },
      { id: '75-100', label: { es: '75-100%', 'pt-BR': '75-100%' }, emoji: '💎', impactScore: 20 },
    ],
  },

  // ==================== TEAM (1) ====================
  {
    id: 'SA_NUT_011',
    category: 'team',
    mode: 'both',
    dimension: 'efficiency',
    weight: 7,
    title: { es: '¿Trabajás con otros profesionales?', 'pt-BR': 'Você trabalha com outros profissionais?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'solo', label: { es: 'Solo/a', 'pt-BR': 'Sozinho/a' }, emoji: '👤', impactScore: 10 },
      { id: 'team', label: { es: 'Equipo de nutricionistas', 'pt-BR': 'Equipe de nutricionistas' }, emoji: '👥', impactScore: 18 },
      { id: 'multidisciplinary', label: { es: 'Equipo multidisciplinario', 'pt-BR': 'Equipe multidisciplinar' }, emoji: '🏥', impactScore: 20 },
    ],
  },

  // ==================== MARKETING (2) ====================
  {
    id: 'SA_NUT_012',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Cómo atraés nuevos pacientes?', 'pt-BR': 'Como você atrai novos pacientes?' },
    type: 'multi',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'referrals', label: { es: 'Referidos', 'pt-BR': 'Indicações' }, emoji: '🗣️', impactScore: 20 },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 15 },
      { id: 'doctors', label: { es: 'Médicos', 'pt-BR': 'Médicos' }, emoji: '👨‍⚕️', impactScore: 18 },
      { id: 'gyms', label: { es: 'Gimnasios', 'pt-BR': 'Academias' }, emoji: '🏋️', impactScore: 15 },
      { id: 'content', label: { es: 'Contenido / Blog', 'pt-BR': 'Conteúdo / Blog' }, emoji: '📝', impactScore: 12 },
    ],
  },
  {
    id: 'SA_NUT_013',
    category: 'marketing',
    mode: 'complete',
    dimension: 'reputation',
    weight: 7,
    title: { es: '¿Tenés presencia activa en redes?', 'pt-BR': 'Você tem presença ativa nas redes?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'very_active', label: { es: 'Muy activa (contenido frecuente)', 'pt-BR': 'Muito ativa (conteúdo frequente)' }, emoji: '📱', impactScore: 20 },
      { id: 'moderate', label: { es: 'Moderada', 'pt-BR': 'Moderada' }, emoji: '📲', impactScore: 15 },
      { id: 'minimal', label: { es: 'Mínima', 'pt-BR': 'Mínima' }, emoji: '😐', impactScore: 8 },
      { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌', impactScore: 5 },
    ],
  },

  // ==================== REPUTATION (2) ====================
  {
    id: 'SA_NUT_014',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Cuál es tu rating en Google?', 'pt-BR': 'Qual é sua avaliação no Google?' },
    type: 'single',
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '⭐', impactScore: 20 },
      { id: '4-4.5', label: { es: '4.0-4.4', 'pt-BR': '4.0-4.4' }, emoji: '⭐', impactScore: 15 },
      { id: '3.5-4', label: { es: '3.5-3.9', 'pt-BR': '3.5-3.9' }, emoji: '⭐', impactScore: 10 },
      { id: 'no_reviews', label: { es: 'No tengo reseñas', 'pt-BR': 'Não tenho avaliações' }, emoji: '❓', impactScore: 0 },
    ],
  },

  // ==================== GOALS (2) ====================
  {
    id: 'SA_NUT_015',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' },
    type: 'single',
    required: true,
    businessTypes: ['nutricion_dietetica'],
    options: [
      { id: 'grow', label: { es: 'Más pacientes', 'pt-BR': 'Mais pacientes' }, emoji: '📈', impactScore: 15 },
      { id: 'retain', label: { es: 'Mejorar retención', 'pt-BR': 'Melhorar retenção' }, emoji: '🔄', impactScore: 18 },
      { id: 'online', label: { es: 'Crecer en online', 'pt-BR': 'Crescer online' }, emoji: '💻', impactScore: 18 },
      { id: 'specialize', label: { es: 'Especializarme', 'pt-BR': 'Especializar-me' }, emoji: '🎯', impactScore: 18 },
      { id: 'products', label: { es: 'Lanzar productos/cursos', 'pt-BR': 'Lançar produtos/cursos' }, emoji: '📦', impactScore: 20 },
    ],
  },
];

export default NUTRICION_QUESTIONS;
