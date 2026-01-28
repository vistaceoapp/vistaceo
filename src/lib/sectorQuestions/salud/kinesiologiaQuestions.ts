// Kinesiología / Fisioterapia / Rehabilitación - Complete Questionnaire
// 24 questions across 9 valid categories
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { VistaSetupQuestion } from '../../vistaSetupQuestion';

export const KINESIOLOGIA_QUESTIONS: VistaSetupQuestion[] = [
  // ==================== IDENTITY (4) ====================
  {
    id: 'SA_KIN_001',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { es: '¿Qué tipo de centro operás?', 'pt-BR': 'Que tipo de centro você opera?' },
    type: 'single',
    required: true,
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'solo', label: { es: 'Consultorio individual', 'pt-BR': 'Consultório individual' }, emoji: '👨‍⚕️', impactScore: 12 },
      { id: 'clinic', label: { es: 'Clínica con equipo', 'pt-BR': 'Clínica com equipe' }, emoji: '🏥', impactScore: 18 },
      { id: 'rehab_center', label: { es: 'Centro de rehabilitación', 'pt-BR': 'Centro de reabilitação' }, emoji: '🏢', impactScore: 20 },
      { id: 'sports', label: { es: 'Especializado en deportistas', 'pt-BR': 'Especializado em esportistas' }, emoji: '⚽', impactScore: 18 },
    ],
  },
  {
    id: 'SA_KIN_002',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Tenés especialización?', 'pt-BR': 'Você tem especialização?' },
    type: 'multi',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'sports', label: { es: 'Deportiva', 'pt-BR': 'Esportiva' }, emoji: '⚽', impactScore: 18 },
      { id: 'neuro', label: { es: 'Neurológica', 'pt-BR': 'Neurológica' }, emoji: '🧠', impactScore: 20 },
      { id: 'ortho', label: { es: 'Traumatológica / Ortopédica', 'pt-BR': 'Traumatológica / Ortopédica' }, emoji: '🦴', impactScore: 15 },
      { id: 'respiratory', label: { es: 'Respiratoria', 'pt-BR': 'Respiratória' }, emoji: '💨', impactScore: 15 },
      { id: 'pediatric', label: { es: 'Pediátrica', 'pt-BR': 'Pediátrica' }, emoji: '👶', impactScore: 15 },
    ],
  },

  // ==================== MENU/SERVICES (3) ====================
  {
    id: 'SA_KIN_003',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Qué servicios ofrecés?', 'pt-BR': 'Quais serviços você oferece?' },
    type: 'multi',
    required: true,
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'manual', label: { es: 'Terapia manual', 'pt-BR': 'Terapia manual' }, emoji: '🙌', impactScore: 15 },
      { id: 'exercise', label: { es: 'Ejercicio terapéutico', 'pt-BR': 'Exercício terapêutico' }, emoji: '🏋️', impactScore: 15 },
      { id: 'electro', label: { es: 'Electroterapia', 'pt-BR': 'Eletroterapia' }, emoji: '⚡', impactScore: 12 },
      { id: 'dry_needling', label: { es: 'Punción seca', 'pt-BR': 'Agulhamento a seco' }, emoji: '💉', impactScore: 18 },
      { id: 'massage', label: { es: 'Masoterapia', 'pt-BR': 'Massoterapia' }, emoji: '💆', impactScore: 12 },
    ],
  },
  {
    id: 'SA_KIN_004',
    category: 'menu',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: { es: '¿Ofrecés atención a domicilio?', 'pt-BR': 'Você oferece atendimento domiciliar?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'yes_active', label: { es: 'Sí, frecuentemente', 'pt-BR': 'Sim, frequentemente' }, emoji: '🏠', impactScore: 18 },
      { id: 'yes_occasional', label: { es: 'Sí, ocasionalmente', 'pt-BR': 'Sim, ocasionalmente' }, emoji: '🚗', impactScore: 12 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
    ],
  },

  // ==================== SALES (3) ====================
  {
    id: 'SA_KIN_005',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Cuántos pacientes atendés por semana?', 'pt-BR': 'Quantos pacientes você atende por semana?' },
    type: 'single',
    required: true,
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: '0-20', label: { es: 'Menos de 20', 'pt-BR': 'Menos de 20' }, emoji: '👤', impactScore: 8 },
      { id: '20-40', label: { es: '20-40 pacientes', 'pt-BR': '20-40 pacientes' }, emoji: '👥', impactScore: 15 },
      { id: '40-70', label: { es: '40-70 pacientes', 'pt-BR': '40-70 pacientes' }, emoji: '🏢', impactScore: 18 },
      { id: '70+', label: { es: 'Más de 70', 'pt-BR': 'Mais de 70' }, emoji: '🏥', impactScore: 20 },
    ],
  },
  {
    id: 'SA_KIN_006',
    category: 'sales',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: { es: '¿De dónde vienen la mayoría de tus pacientes?', 'pt-BR': 'De onde vem a maioria dos seus pacientes?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'doctors', label: { es: 'Derivación de médicos', 'pt-BR': 'Encaminhamento de médicos' }, emoji: '👨‍⚕️', impactScore: 20 },
      { id: 'word_of_mouth', label: { es: 'Boca a boca', 'pt-BR': 'Boca a boca' }, emoji: '🗣️', impactScore: 18 },
      { id: 'insurance', label: { es: 'Obras sociales / Seguros', 'pt-BR': 'Convênios / Seguros' }, emoji: '🏥', impactScore: 15 },
      { id: 'search', label: { es: 'Búsqueda online', 'pt-BR': 'Busca online' }, emoji: '🔍', impactScore: 12 },
    ],
  },

  // ==================== OPERATION (3) ====================
  {
    id: 'SA_KIN_007',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cómo gestionás los turnos?', 'pt-BR': 'Como você gerencia os agendamentos?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'software', label: { es: 'Software especializado', 'pt-BR': 'Software especializado' }, emoji: '💻', impactScore: 20 },
      { id: 'whatsapp', label: { es: 'WhatsApp / Teléfono', 'pt-BR': 'WhatsApp / Telefone' }, emoji: '📱', impactScore: 12 },
      { id: 'manual', label: { es: 'Agenda manual', 'pt-BR': 'Agenda manual' }, emoji: '📒', impactScore: 5 },
    ],
  },
  {
    id: 'SA_KIN_008',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 7,
    title: { es: '¿Usás historia clínica electrónica?', 'pt-BR': 'Você usa prontuário eletrônico?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'yes_complete', label: { es: 'Sí, completa con seguimiento', 'pt-BR': 'Sim, completo com acompanhamento' }, emoji: '💻', impactScore: 20 },
      { id: 'yes_basic', label: { es: 'Sí, básica', 'pt-BR': 'Sim, básico' }, emoji: '📋', impactScore: 12 },
      { id: 'paper', label: { es: 'No, papel', 'pt-BR': 'Não, papel' }, emoji: '📝', impactScore: 5 },
    ],
  },

  // ==================== FINANCE (3) ====================
  {
    id: 'SA_KIN_009',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: { es: '¿Cuál es el valor de tu sesión particular?', 'pt-BR': 'Qual é o valor da sua sessão particular?' },
    type: 'number',
    businessTypes: ['kinesiologia_rehabilitacion'],
  },
  {
    id: 'SA_KIN_010',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 8,
    title: { es: '¿Qué porcentaje de pacientes son particulares?', 'pt-BR': 'Qual porcentagem de pacientes são particulares?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: '0-25', label: { es: '0-25%', 'pt-BR': '0-25%' }, emoji: '📊', impactScore: 8 },
      { id: '25-50', label: { es: '25-50%', 'pt-BR': '25-50%' }, emoji: '📈', impactScore: 12 },
      { id: '50-75', label: { es: '50-75%', 'pt-BR': '50-75%' }, emoji: '💰', impactScore: 18 },
      { id: '75-100', label: { es: '75-100%', 'pt-BR': '75-100%' }, emoji: '💎', impactScore: 20 },
    ],
  },

  // ==================== TEAM (2) ====================
  {
    id: 'SA_KIN_011',
    category: 'team',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cuántos kinesiólogos trabajan?', 'pt-BR': 'Quantos fisioterapeutas trabalham?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'solo', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤', impactScore: 10 },
      { id: '2-3', label: { es: '2-3 profesionales', 'pt-BR': '2-3 profissionais' }, emoji: '👥', impactScore: 15 },
      { id: '4-8', label: { es: '4-8 profesionales', 'pt-BR': '4-8 profissionais' }, emoji: '🏥', impactScore: 18 },
      { id: '8+', label: { es: 'Más de 8', 'pt-BR': 'Mais de 8' }, emoji: '🏢', impactScore: 20 },
    ],
  },

  // ==================== MARKETING (2) ====================
  {
    id: 'SA_KIN_012',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Cómo atraés nuevos pacientes?', 'pt-BR': 'Como você atrai novos pacientes?' },
    type: 'multi',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'doctors', label: { es: 'Red de médicos', 'pt-BR': 'Rede de médicos' }, emoji: '👨‍⚕️', impactScore: 20 },
      { id: 'referrals', label: { es: 'Referidos de pacientes', 'pt-BR': 'Indicações de pacientes' }, emoji: '🗣️', impactScore: 18 },
      { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱', impactScore: 12 },
      { id: 'google', label: { es: 'Google My Business', 'pt-BR': 'Google Meu Negócio' }, emoji: '🔍', impactScore: 15 },
    ],
  },

  // ==================== REPUTATION (2) ====================
  {
    id: 'SA_KIN_013',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { es: '¿Cuál es tu rating en Google?', 'pt-BR': 'Qual é sua avaliação no Google?' },
    type: 'single',
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '⭐', impactScore: 20 },
      { id: '4-4.5', label: { es: '4.0-4.4', 'pt-BR': '4.0-4.4' }, emoji: '⭐', impactScore: 15 },
      { id: '3.5-4', label: { es: '3.5-3.9', 'pt-BR': '3.5-3.9' }, emoji: '⭐', impactScore: 10 },
      { id: 'no_reviews', label: { es: 'No tengo reseñas', 'pt-BR': 'Não tenho avaliações' }, emoji: '❓', impactScore: 0 },
    ],
  },

  // ==================== GOALS (2) ====================
  {
    id: 'SA_KIN_014',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' },
    type: 'single',
    required: true,
    businessTypes: ['kinesiologia_rehabilitacion'],
    options: [
      { id: 'grow_patients', label: { es: 'Aumentar pacientes', 'pt-BR': 'Aumentar pacientes' }, emoji: '📈', impactScore: 15 },
      { id: 'specialization', label: { es: 'Posicionarme en especialidad', 'pt-BR': 'Posicionar-me na especialidade' }, emoji: '🎯', impactScore: 18 },
      { id: 'private', label: { es: 'Más pacientes particulares', 'pt-BR': 'Mais pacientes particulares' }, emoji: '💰', impactScore: 20 },
      { id: 'team', label: { es: 'Armar equipo', 'pt-BR': 'Montar equipe' }, emoji: '👥', impactScore: 18 },
    ],
  },
];

export default KINESIOLOGIA_QUESTIONS;
