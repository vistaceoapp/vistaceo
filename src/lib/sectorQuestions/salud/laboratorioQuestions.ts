// Laboratorio de Análisis Clínicos - Complete Questionnaire
// 21 questions across 9 valid categories
// Categories: identity, operation, sales, menu, finance, team, marketing, reputation, goals

import type { GastroQuestion } from '../../gastroQuestionsEngine';

export const LABORATORIO_QUESTIONS: GastroQuestion[] = [
  // ==================== IDENTITY (4) ====================
  {
    id: 'SA_LAB_001',
    category: 'identity',
    mode: 'both',
    dimension: 'reputation',
    weight: 9,
    title: { es: '¿Qué tipo de laboratorio operás?', 'pt-BR': 'Que tipo de laboratório você opera?' },
    type: 'single',
    required: true,
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'clinical', label: { es: 'Análisis clínicos generales', 'pt-BR': 'Análises clínicas gerais' }, emoji: '🔬', impactScore: 15 },
      { id: 'specialized', label: { es: 'Especializado (genética, hormonas, etc)', 'pt-BR': 'Especializado (genética, hormônios, etc)' }, emoji: '🧬', impactScore: 20 },
      { id: 'point_of_care', label: { es: 'Punto de atención rápida', 'pt-BR': 'Ponto de atendimento rápido' }, emoji: '⚡', impactScore: 15 },
      { id: 'full_service', label: { es: 'Servicio completo + Imágenes', 'pt-BR': 'Serviço completo + Imagens' }, emoji: '🏥', impactScore: 20 },
    ],
  },
  {
    id: 'SA_LAB_002',
    category: 'identity',
    mode: 'complete',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Tenés certificaciones de calidad?', 'pt-BR': 'Você tem certificações de qualidade?' },
    type: 'multi',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'iso', label: { es: 'ISO 15189 / 9001', 'pt-BR': 'ISO 15189 / 9001' }, emoji: '🏅', impactScore: 20 },
      { id: 'cap', label: { es: 'CAP', 'pt-BR': 'CAP' }, emoji: '🎖️', impactScore: 20 },
      { id: 'national', label: { es: 'Habilitación nacional', 'pt-BR': 'Habilitação nacional' }, emoji: '📜', impactScore: 15 },
      { id: 'none', label: { es: 'Solo habilitación básica', 'pt-BR': 'Só habilitação básica' }, emoji: '📋', impactScore: 8 },
    ],
  },
  {
    id: 'SA_LAB_003',
    category: 'identity',
    mode: 'complete',
    dimension: 'traffic',
    weight: 7,
    title: { es: '¿Cuántas sucursales tenés?', 'pt-BR': 'Quantas filiais você tem?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: '1', label: { es: 'Una sede', 'pt-BR': 'Uma sede' }, emoji: '🏠', impactScore: 10 },
      { id: '2-5', label: { es: '2-5 sucursales', 'pt-BR': '2-5 filiais' }, emoji: '🏢', impactScore: 15 },
      { id: '6-15', label: { es: '6-15 sucursales', 'pt-BR': '6-15 filiais' }, emoji: '🏙️', impactScore: 18 },
      { id: '15+', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🌐', impactScore: 20 },
    ],
  },

  // ==================== MENU/SERVICES (3) ====================
  {
    id: 'SA_LAB_004',
    category: 'menu',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Qué tipos de análisis ofrecés?', 'pt-BR': 'Que tipos de análises você oferece?' },
    type: 'multi',
    required: true,
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'blood', label: { es: 'Hematología / Sangre', 'pt-BR': 'Hematologia / Sangue' }, emoji: '🩸', impactScore: 15 },
      { id: 'urine', label: { es: 'Orina', 'pt-BR': 'Urina' }, emoji: '🧪', impactScore: 12 },
      { id: 'hormones', label: { es: 'Hormonas', 'pt-BR': 'Hormônios' }, emoji: '⚗️', impactScore: 18 },
      { id: 'genetics', label: { es: 'Genética', 'pt-BR': 'Genética' }, emoji: '🧬', impactScore: 20 },
      { id: 'microbiology', label: { es: 'Microbiología', 'pt-BR': 'Microbiologia' }, emoji: '🦠', impactScore: 15 },
    ],
  },
  {
    id: 'SA_LAB_005',
    category: 'menu',
    mode: 'complete',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Ofrecés toma de muestras a domicilio?', 'pt-BR': 'Você oferece coleta domiciliar?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'yes_active', label: { es: 'Sí, muy activo', 'pt-BR': 'Sim, muito ativo' }, emoji: '🏠', impactScore: 20 },
      { id: 'yes_occasional', label: { es: 'Sí, a pedido', 'pt-BR': 'Sim, sob demanda' }, emoji: '🚗', impactScore: 15 },
      { id: 'corporate', label: { es: 'Solo empresas', 'pt-BR': 'Só empresas' }, emoji: '🏢', impactScore: 12 },
      { id: 'no', label: { es: 'No', 'pt-BR': 'Não' }, emoji: '❌', impactScore: 5 },
    ],
  },

  // ==================== SALES (2) ====================
  {
    id: 'SA_LAB_006',
    category: 'sales',
    mode: 'both',
    dimension: 'traffic',
    weight: 9,
    title: { es: '¿Cuántos estudios procesás por día?', 'pt-BR': 'Quantos exames você processa por dia?' },
    type: 'single',
    required: true,
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: '0-50', label: { es: 'Menos de 50', 'pt-BR': 'Menos de 50' }, emoji: '📊', impactScore: 10 },
      { id: '50-150', label: { es: '50-150 estudios', 'pt-BR': '50-150 exames' }, emoji: '📈', impactScore: 15 },
      { id: '150-400', label: { es: '150-400 estudios', 'pt-BR': '150-400 exames' }, emoji: '🏥', impactScore: 18 },
      { id: '400+', label: { es: 'Más de 400', 'pt-BR': 'Mais de 400' }, emoji: '🏢', impactScore: 20 },
    ],
  },

  // ==================== OPERATION (3) ====================
  {
    id: 'SA_LAB_007',
    category: 'operation',
    mode: 'both',
    dimension: 'efficiency',
    weight: 9,
    title: { es: '¿Qué sistema de gestión usás?', 'pt-BR': 'Que sistema de gestão você usa?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'lis_complete', label: { es: 'LIS completo integrado', 'pt-BR': 'LIS completo integrado' }, emoji: '💻', impactScore: 20 },
      { id: 'lis_basic', label: { es: 'LIS básico', 'pt-BR': 'LIS básico' }, emoji: '📋', impactScore: 15 },
      { id: 'generic', label: { es: 'Software genérico', 'pt-BR': 'Software genérico' }, emoji: '📊', impactScore: 10 },
      { id: 'manual', label: { es: 'Mayormente manual', 'pt-BR': 'Maioria manual' }, emoji: '📝', impactScore: 5 },
    ],
  },
  {
    id: 'SA_LAB_008',
    category: 'operation',
    mode: 'complete',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cuál es el tiempo de entrega promedio?', 'pt-BR': 'Qual é o tempo de entrega médio?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'same_day', label: { es: 'Mismo día', 'pt-BR': 'Mesmo dia' }, emoji: '⚡', impactScore: 20 },
      { id: '24h', label: { es: '24 horas', 'pt-BR': '24 horas' }, emoji: '📅', impactScore: 18 },
      { id: '48h', label: { es: '48 horas', 'pt-BR': '48 horas' }, emoji: '📆', impactScore: 15 },
      { id: '72h+', label: { es: '72+ horas', 'pt-BR': '72+ horas' }, emoji: '⏳', impactScore: 10 },
    ],
  },

  // ==================== FINANCE (2) ====================
  {
    id: 'SA_LAB_009',
    category: 'finance',
    mode: 'both',
    dimension: 'profitability',
    weight: 9,
    title: { es: '¿Qué porcentaje de ingresos son particulares?', 'pt-BR': 'Qual porcentagem da receita é particular?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: '0-20', label: { es: '0-20%', 'pt-BR': '0-20%' }, emoji: '📊', impactScore: 8 },
      { id: '20-40', label: { es: '20-40%', 'pt-BR': '20-40%' }, emoji: '📈', impactScore: 12 },
      { id: '40-60', label: { es: '40-60%', 'pt-BR': '40-60%' }, emoji: '💰', impactScore: 18 },
      { id: '60+', label: { es: 'Más del 60%', 'pt-BR': 'Mais de 60%' }, emoji: '💎', impactScore: 20 },
    ],
  },

  // ==================== TEAM (2) ====================
  {
    id: 'SA_LAB_010',
    category: 'team',
    mode: 'both',
    dimension: 'efficiency',
    weight: 8,
    title: { es: '¿Cuántos bioquímicos trabajan?', 'pt-BR': 'Quantos bioquímicos trabalham?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: '1-2', label: { es: '1-2', 'pt-BR': '1-2' }, emoji: '👤', impactScore: 10 },
      { id: '3-6', label: { es: '3-6', 'pt-BR': '3-6' }, emoji: '👥', impactScore: 15 },
      { id: '7-15', label: { es: '7-15', 'pt-BR': '7-15' }, emoji: '🏥', impactScore: 18 },
      { id: '15+', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🏢', impactScore: 20 },
    ],
  },

  // ==================== MARKETING (1) ====================
  {
    id: 'SA_LAB_011',
    category: 'marketing',
    mode: 'both',
    dimension: 'traffic',
    weight: 8,
    title: { es: '¿Cómo atraés nuevos pacientes?', 'pt-BR': 'Como você atrai novos pacientes?' },
    type: 'multi',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'doctors', label: { es: 'Red de médicos', 'pt-BR': 'Rede de médicos' }, emoji: '👨‍⚕️', impactScore: 20 },
      { id: 'insurance', label: { es: 'Convenios con obras sociales', 'pt-BR': 'Convênios' }, emoji: '🏥', impactScore: 18 },
      { id: 'corporate', label: { es: 'Convenios empresariales', 'pt-BR': 'Convênios empresariais' }, emoji: '🏢', impactScore: 20 },
      { id: 'location', label: { es: 'Ubicación / Pasada', 'pt-BR': 'Localização / Passagem' }, emoji: '📍', impactScore: 12 },
    ],
  },

  // ==================== REPUTATION (2) ====================
  {
    id: 'SA_LAB_012',
    category: 'reputation',
    mode: 'both',
    dimension: 'reputation',
    weight: 8,
    title: { es: '¿Cuál es tu rating en Google?', 'pt-BR': 'Qual é sua avaliação no Google?' },
    type: 'single',
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: '4.5+', label: { es: '4.5 o más', 'pt-BR': '4.5 ou mais' }, emoji: '⭐', impactScore: 20 },
      { id: '4-4.5', label: { es: '4.0-4.4', 'pt-BR': '4.0-4.4' }, emoji: '⭐', impactScore: 15 },
      { id: '3.5-4', label: { es: '3.5-3.9', 'pt-BR': '3.5-3.9' }, emoji: '⭐', impactScore: 10 },
      { id: 'below_3.5', label: { es: 'Menos de 3.5', 'pt-BR': 'Menos de 3.5' }, emoji: '😔', impactScore: 5 },
    ],
  },

  // ==================== GOALS (2) ====================
  {
    id: 'SA_LAB_013',
    category: 'goals',
    mode: 'both',
    dimension: 'growth',
    weight: 8,
    title: { es: '¿Cuál es tu objetivo principal?', 'pt-BR': 'Qual é seu objetivo principal?' },
    type: 'single',
    required: true,
    businessTypes: ['laboratorio_analisis'],
    options: [
      { id: 'volume', label: { es: 'Aumentar volumen', 'pt-BR': 'Aumentar volume' }, emoji: '📈', impactScore: 15 },
      { id: 'private', label: { es: 'Más pacientes particulares', 'pt-BR': 'Mais pacientes particulares' }, emoji: '💰', impactScore: 20 },
      { id: 'corporate', label: { es: 'Más convenios empresariales', 'pt-BR': 'Mais convênios empresariais' }, emoji: '🏢', impactScore: 18 },
      { id: 'expand', label: { es: 'Abrir sucursales', 'pt-BR': 'Abrir filiais' }, emoji: '🚀', impactScore: 20 },
      { id: 'automation', label: { es: 'Automatizar procesos', 'pt-BR': 'Automatizar processos' }, emoji: '⚙️', impactScore: 18 },
    ],
  },
];

export default LABORATORIO_QUESTIONS;
