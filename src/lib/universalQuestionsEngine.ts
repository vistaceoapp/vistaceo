// ============================================
// Universal Questions Engine v3
// Master router for all 180 questionnaires
// Structure: SECTOR_TIPO_NEGOCIO
// 10 sectors × 18 business types = 180 unique questionnaires
// Each with Quick (10-15) + Complete (68-75) versions
// ============================================

import { CountryCode, COUNTRY_PACKS } from './countryPacks';

// ============= UNIFIED QUESTION TYPE =============
export interface UniversalQuestion {
  id: string;
  category: string;
  mode: 'quick' | 'complete' | 'both';
  dimension: 'reputation' | 'profitability' | 'finances' | 'efficiency' | 'traffic' | 'team' | 'growth';
  weight: number;
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text' | 'money';
  options?: Array<{ 
    id: string; 
    label: { es: string; 'pt-BR': string }; 
    emoji?: string;
    impactScore?: number;
  }>;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[];
  countries?: CountryCode[];
}

// ============= SECTOR IDS =============
export const SECTOR_IDS = {
  GASTRO: 'A1_GASTRO',
  TURISMO: 'A2_TURISMO',
  RETAIL: 'A3_RETAIL',
  SALUD: 'A4_SALUD',
  EDUCACION: 'A5_EDUCACION',
  B2B: 'A6_B2B',
  HOGAR: 'A7_HOGAR',
  CONSTRUCCION: 'A8_CONSTRUCCION',
  TRANSPORTE: 'A9_TRANSPORTE',
  AGRO: 'A10_AGRO',
} as const;

// ============= IMPORTS - Sector Questionnaires =============
import { 
  GASTRO_COMPLETE_QUESTIONS, 
  GastroCompleteQuestion,
  GASTRO_BUSINESS_TYPES
} from './sectorQuestions/gastroQuestionsComplete';

import { 
  TURISM_COMPLETE_QUESTIONS, 
  TurismQuestion,
  TURISM_BUSINESS_TYPES
} from './sectorQuestions/turismQuestionsV2';

import { ALL_SALUD_QUESTIONS } from './sectorQuestions/saludQuestions';

import {
  ALMACEN_QUESTIONS,
  SUPERMERCADO_QUESTIONS,
  MODA_QUESTIONS,
  CALZADO_QUESTIONS,
  HOGAR_DECO_QUESTIONS,
} from './sectorQuestions/retailQuestions';

// ============= ADAPTERS =============
// Convert sector-specific question formats to UniversalQuestion

function mapCategory(cat: string): string {
  const mapping: Record<string, string> = {
    'identidad': 'identity',
    'operacion': 'operation',
    'ventas': 'sales',
    'menu': 'menu',
    'finanzas': 'finance',
    'equipo': 'team',
    'marketing': 'marketing',
    'reputacion': 'reputation',
    'objetivos': 'goals',
    'trafico': 'operation',
    'identity': 'identity',
    'operation': 'operation',
    'sales': 'sales',
    'finance': 'finance',
    'team': 'team',
    'reputation': 'reputation',
    'goals': 'goals',
  };
  return mapping[cat?.toLowerCase()] || 'operation';
}

function mapScoreAreaToDimension(area: string): UniversalQuestion['dimension'] {
  const mapping: Record<string, UniversalQuestion['dimension']> = {
    'Reputación': 'reputation',
    'Rentabilidad': 'profitability',
    'Finanzas': 'finances',
    'Eficiencia': 'efficiency',
    'Tráfico': 'traffic',
    'Equipo': 'team',
    'Crecimiento': 'growth',
  };
  return mapping[area] || 'efficiency';
}

function adaptGastroQuestions(questions: GastroCompleteQuestion[]): UniversalQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category),
    mode: q.mode,
    dimension: mapScoreAreaToDimension(q.score_area),
    weight: 8,
    title: q.title,
    help: q.help,
    type: q.type === 'money' ? 'number' : q.type as UniversalQuestion['type'],
    options: q.options?.map(opt => ({
      id: opt.id,
      label: opt.label,
      emoji: opt.emoji,
    })),
    min: q.min,
    max: q.max,
    unit: q.unit,
    required: q.required,
    businessTypes: q.businessTypes,
  }));
}

function adaptTurismQuestions(questions: TurismQuestion[]): UniversalQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category),
    mode: q.mode,
    dimension: mapScoreAreaToDimension(q.score_area),
    weight: 8,
    title: q.title,
    help: q.help,
    type: q.type === 'money' ? 'number' : q.type as UniversalQuestion['type'],
    options: q.options?.map(opt => ({
      id: opt.id,
      label: opt.label,
      emoji: opt.emoji,
    })),
    min: q.min,
    max: q.max,
    unit: q.unit,
    required: q.required,
    businessTypes: q.businessTypes,
  }));
}

function adaptSaludQuestions(questions: any[]): UniversalQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category || 'operation'),
    mode: q.mode || 'both',
    dimension: q.dimension || 'efficiency',
    weight: q.weight || 8,
    title: q.title,
    help: q.help,
    type: q.type as UniversalQuestion['type'],
    options: q.options?.map((opt: any) => ({
      id: opt.id,
      label: opt.label,
      emoji: opt.emoji,
      impactScore: opt.impactScore,
    })),
    min: q.min,
    max: q.max,
    unit: q.unit,
    required: q.required,
    businessTypes: q.businessTypes,
  }));
}

function adaptRetailQuestions(questions: any[]): UniversalQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category || 'operation'),
    mode: q.mode || 'both',
    dimension: q.dimension || 'efficiency',
    weight: q.weight || 8,
    title: q.title,
    help: q.help,
    type: q.type as UniversalQuestion['type'],
    options: q.options?.map((opt: any) => ({
      id: opt.id,
      label: opt.label,
      emoji: opt.emoji,
      impactScore: opt.impactScore,
    })),
    min: q.min,
    max: q.max,
    unit: q.unit,
    required: q.required,
    businessTypes: q.businessTypes,
  }));
}

// ============= BUSINESS TYPE ID MAPPING =============
// Maps from allBusinessTypes.ts IDs to questionnaire file IDs

const GASTRO_ID_MAP: Record<string, string> = {
  'restaurant_general': GASTRO_BUSINESS_TYPES.RESTAURANT_GENERAL,
  'alta_cocina': GASTRO_BUSINESS_TYPES.ALTA_COCINA,
  'bodegon_cantina': GASTRO_BUSINESS_TYPES.BODEGON,
  'parrilla_asador': GASTRO_BUSINESS_TYPES.PARRILLA,
  'cocina_criolla': GASTRO_BUSINESS_TYPES.COCINA_CRIOLLA,
  'pescados_mariscos': GASTRO_BUSINESS_TYPES.PESCADOS,
  'pizzeria': GASTRO_BUSINESS_TYPES.PIZZERIA,
  'panaderia': GASTRO_BUSINESS_TYPES.PANADERIA,
  'pastas_italiana': GASTRO_BUSINESS_TYPES.PASTAS,
  'heladeria': GASTRO_BUSINESS_TYPES.HELADERIA,
  'fast_food': GASTRO_BUSINESS_TYPES.FAST_FOOD,
  'cafeteria_pasteleria': GASTRO_BUSINESS_TYPES.CAFETERIA,
  'cocina_asiatica': GASTRO_BUSINESS_TYPES.ASIATICA,
  'cocina_arabe': GASTRO_BUSINESS_TYPES.ARABE,
  'cocina_saludable': GASTRO_BUSINESS_TYPES.SALUDABLE,
  'bar_cerveceria': GASTRO_BUSINESS_TYPES.BAR,
  'servicio_comida': GASTRO_BUSINESS_TYPES.SERVICIO_COMIDA,
  'dark_kitchen': GASTRO_BUSINESS_TYPES.DARK_KITCHEN,
};

const TURISMO_ID_MAP: Record<string, string> = {
  'hotel_urbano': TURISM_BUSINESS_TYPES.HOTEL_URBANO,
  'hotel_boutique': TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE,
  'resort_all_inclusive': TURISM_BUSINESS_TYPES.RESORT,
  'hostel': TURISM_BUSINESS_TYPES.HOSTEL,
  'posada_lodge': TURISM_BUSINESS_TYPES.POSADA,
  'apart_hotel': TURISM_BUSINESS_TYPES.APART_HOTEL,
  'alquiler_temporario': TURISM_BUSINESS_TYPES.ALQUILER_TEMP,
  'agencia_viajes': TURISM_BUSINESS_TYPES.AGENCIA_VIAJES,
  'tours_guiados': TURISM_BUSINESS_TYPES.TOURS,
  'turismo_aventura': TURISM_BUSINESS_TYPES.TURISMO_AVENTURA,
  'operador_turistico': TURISM_BUSINESS_TYPES.OPERADOR_TURISTICO,
  'parque_tematico': TURISM_BUSINESS_TYPES.PARQUE_TEMATICO,
  'atracciones_tickets': TURISM_BUSINESS_TYPES.ATRACCIONES,
  'teatro_espectaculos': TURISM_BUSINESS_TYPES.TEATRO,
  'salon_eventos_sociales': TURISM_BUSINESS_TYPES.SALON_EVENTOS,
  'eventos_corporativos': TURISM_BUSINESS_TYPES.EVENTOS_CORP,
  'productora_eventos': TURISM_BUSINESS_TYPES.PRODUCTORA,
  'ocio_nocturno': TURISM_BUSINESS_TYPES.ENTRETENIMIENTO,
};

const SALUD_ID_MAP: Record<string, string> = {
  'clinica_policonsultorio': 'clinica_policonsultorio',
  'consultorio_medico': 'consultorio_medico',
  'centro_odontologico': 'centro_odontologico',
  'laboratorio_analisis': 'laboratorio_analisis',
  'centro_diagnostico': 'centro_diagnostico',
  'kinesiologia_rehabilitacion': 'kinesiologia_rehabilitacion',
  'psicologia_salud_mental': 'psicologia_salud_mental',
  'nutricion_dietetica': 'nutricion_dietetica',
  'medicina_estetica': 'medicina_estetica',
  'centro_estetica': 'centro_estetica',
  'spa_masajes': 'spa_masajes',
  'gimnasio_fitness': 'gimnasio_fitness',
  'yoga_pilates': 'yoga_pilates',
  'peluqueria_salon': 'peluqueria_salon',
  'barberia': 'barberia',
  'manicuria_unas': 'manicuria_unas',
  'depilacion': 'depilacion',
  'optica_contactologia': 'optica_contactologia',
};

const RETAIL_ID_MAP: Record<string, string> = {
  'almacen_tienda_barrio': 'almacen_tienda',
  'supermercado': 'supermercado',
  'moda_accesorios': 'moda_accesorios',
  'calzado_marroquineria': 'calzado_marroquineria',
  'hogar_decoracion': 'hogar_decoracion',
  'electronica_tecnologia': 'electronica_tecnologia',
  'ferreteria': 'ferreteria',
  'libreria_papeleria': 'libreria_papeleria',
  'jugueteria': 'jugueteria',
  'deportes_outdoor': 'deportes_outdoor',
  'belleza_perfumeria': 'belleza_perfumeria',
  'pet_shop': 'pet_shop',
  'gourmet_delicatessen': 'gourmet_delicatessen',
  'segunda_mano': 'segunda_mano',
  'ecommerce_d2c': 'ecommerce_d2c',
  'seller_marketplace': 'seller_marketplace',
  'suscripcion_cajas': 'suscripcion_cajas',
  'mayorista_distribuidor': 'mayorista_distribuidor',
};

// ============= QUESTION BANKS BY SECTOR =============

// Cached question banks (lazy loaded)
let gastroQuestionsCache: UniversalQuestion[] | null = null;
let turismQuestionsCache: UniversalQuestion[] | null = null;
let saludQuestionsCache: UniversalQuestion[] | null = null;
let retailQuestionsCache: UniversalQuestion[] | null = null;

function getGastroQuestions(): UniversalQuestion[] {
  if (!gastroQuestionsCache) {
    gastroQuestionsCache = adaptGastroQuestions(GASTRO_COMPLETE_QUESTIONS);
  }
  return gastroQuestionsCache;
}

function getTurismQuestions(): UniversalQuestion[] {
  if (!turismQuestionsCache) {
    turismQuestionsCache = adaptTurismQuestions(TURISM_COMPLETE_QUESTIONS);
  }
  return turismQuestionsCache;
}

function getSaludQuestions(): UniversalQuestion[] {
  if (!saludQuestionsCache) {
    saludQuestionsCache = adaptSaludQuestions(ALL_SALUD_QUESTIONS);
  }
  return saludQuestionsCache;
}

function getRetailQuestions(): UniversalQuestion[] {
  if (!retailQuestionsCache) {
    // Combine all retail sub-questionnaires
    const allRetail = [
      ...ALMACEN_QUESTIONS,
      ...SUPERMERCADO_QUESTIONS,
      ...MODA_QUESTIONS,
      ...CALZADO_QUESTIONS,
      ...HOGAR_DECO_QUESTIONS,
    ];
    retailQuestionsCache = adaptRetailQuestions(allRetail);
  }
  return retailQuestionsCache;
}

// ============= UNIVERSAL BASE QUESTIONS =============
// For sectors not yet fully implemented

function getUniversalBaseQuestions(mode: 'quick' | 'complete'): UniversalQuestion[] {
  const base: UniversalQuestion[] = [
    {
      id: 'U01_YEARS',
      category: 'identity',
      mode: 'both',
      dimension: 'growth',
      weight: 8,
      title: { es: '¿Hace cuánto opera tu negocio?', 'pt-BR': 'Há quanto tempo seu negócio opera?' },
      type: 'single',
      options: [
        { id: '<1y', label: { es: 'Menos de 1 año', 'pt-BR': 'Menos de 1 ano' }, emoji: '🆕' },
        { id: '1-3y', label: { es: '1-3 años', 'pt-BR': '1-3 anos' }, emoji: '📅' },
        { id: '3-10y', label: { es: '3-10 años', 'pt-BR': '3-10 anos' }, emoji: '📈' },
        { id: '10+', label: { es: 'Más de 10 años', 'pt-BR': 'Mais de 10 anos' }, emoji: '🏆' },
      ],
    },
    {
      id: 'U02_TEAM_SIZE',
      category: 'team',
      mode: 'both',
      dimension: 'team',
      weight: 8,
      title: { es: '¿Cuántas personas trabajan en tu negocio?', 'pt-BR': 'Quantas pessoas trabalham no seu negócio?' },
      type: 'single',
      options: [
        { id: '1', label: { es: 'Solo yo', 'pt-BR': 'Só eu' }, emoji: '👤' },
        { id: '2-5', label: { es: '2-5 personas', 'pt-BR': '2-5 pessoas' }, emoji: '👥' },
        { id: '6-15', label: { es: '6-15 personas', 'pt-BR': '6-15 pessoas' }, emoji: '👨‍👩‍👦‍👦' },
        { id: '16+', label: { es: 'Más de 15', 'pt-BR': 'Mais de 15' }, emoji: '🏢' },
      ],
    },
    {
      id: 'U03_REVENUE',
      category: 'finance',
      mode: 'both',
      dimension: 'finances',
      weight: 9,
      title: { es: '¿Cuál es tu facturación mensual promedio?', 'pt-BR': 'Qual é seu faturamento mensal médio?' },
      type: 'single',
      options: [
        { id: 'low', label: { es: 'Baja', 'pt-BR': 'Baixa' }, emoji: '💵' },
        { id: 'medium', label: { es: 'Media', 'pt-BR': 'Média' }, emoji: '💰' },
        { id: 'high', label: { es: 'Alta', 'pt-BR': 'Alta' }, emoji: '💎' },
        { id: 'vhigh', label: { es: 'Muy alta', 'pt-BR': 'Muito alta' }, emoji: '🏆' },
      ],
    },
    {
      id: 'U04_GOAL',
      category: 'goals',
      mode: 'both',
      dimension: 'growth',
      weight: 9,
      title: { es: '¿Cuál es tu principal objetivo ahora?', 'pt-BR': 'Qual é seu principal objetivo agora?' },
      type: 'single',
      options: [
        { id: 'revenue', label: { es: 'Aumentar ingresos', 'pt-BR': 'Aumentar receita' }, emoji: '📈' },
        { id: 'efficiency', label: { es: 'Mejorar eficiencia', 'pt-BR': 'Melhorar eficiência' }, emoji: '⚡' },
        { id: 'reputation', label: { es: 'Mejorar reputación', 'pt-BR': 'Melhorar reputação' }, emoji: '⭐' },
        { id: 'expand', label: { es: 'Expandir/Crecer', 'pt-BR': 'Expandir/Crescer' }, emoji: '🚀' },
      ],
    },
    {
      id: 'U05_CHALLENGE',
      category: 'goals',
      mode: 'both',
      dimension: 'efficiency',
      weight: 8,
      title: { es: '¿Cuál es tu mayor desafío?', 'pt-BR': 'Qual é seu maior desafio?' },
      type: 'single',
      options: [
        { id: 'time', label: { es: 'Falta de tiempo', 'pt-BR': 'Falta de tempo' }, emoji: '⏰' },
        { id: 'money', label: { es: 'Recursos financieros', 'pt-BR': 'Recursos financeiros' }, emoji: '💰' },
        { id: 'team', label: { es: 'Gestión de equipo', 'pt-BR': 'Gestão de equipe' }, emoji: '👥' },
        { id: 'clients', label: { es: 'Conseguir clientes', 'pt-BR': 'Conseguir clientes' }, emoji: '📣' },
      ],
    },
    {
      id: 'U06_POSITIONING',
      category: 'identity',
      mode: 'both',
      dimension: 'profitability',
      weight: 7,
      title: { es: '¿Cómo definirías tu posicionamiento?', 'pt-BR': 'Como você definiria seu posicionamento?' },
      type: 'single',
      options: [
        { id: 'budget', label: { es: 'Económico', 'pt-BR': 'Econômico' }, emoji: '💰' },
        { id: 'value', label: { es: 'Buena relación precio-calidad', 'pt-BR': 'Boa relação custo-benefício' }, emoji: '⚖️' },
        { id: 'premium', label: { es: 'Premium', 'pt-BR': 'Premium' }, emoji: '✨' },
        { id: 'luxury', label: { es: 'Lujo', 'pt-BR': 'Luxo' }, emoji: '💎' },
      ],
    },
    {
      id: 'U07_MARKETING',
      category: 'marketing',
      mode: 'both',
      dimension: 'traffic',
      weight: 7,
      title: { es: '¿Cómo atraés nuevos clientes?', 'pt-BR': 'Como você atrai novos clientes?' },
      type: 'multi',
      options: [
        { id: 'social', label: { es: 'Redes sociales', 'pt-BR': 'Redes sociais' }, emoji: '📱' },
        { id: 'referrals', label: { es: 'Boca a boca', 'pt-BR': 'Boca a boca' }, emoji: '🗣️' },
        { id: 'google', label: { es: 'Google/SEO', 'pt-BR': 'Google/SEO' }, emoji: '🔍' },
        { id: 'ads', label: { es: 'Publicidad paga', 'pt-BR': 'Publicidade paga' }, emoji: '📢' },
      ],
    },
    {
      id: 'U08_DIGITAL',
      category: 'operation',
      mode: 'complete',
      dimension: 'efficiency',
      weight: 6,
      title: { es: '¿Qué herramientas digitales usás?', 'pt-BR': 'Quais ferramentas digitais você usa?' },
      type: 'multi',
      options: [
        { id: 'pos', label: { es: 'Sistema de gestión/POS', 'pt-BR': 'Sistema de gestão/POS' }, emoji: '💻' },
        { id: 'accounting', label: { es: 'Software contable', 'pt-BR': 'Software contábil' }, emoji: '📊' },
        { id: 'crm', label: { es: 'CRM/Clientes', 'pt-BR': 'CRM/Clientes' }, emoji: '👥' },
        { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' },
      ],
    },
    {
      id: 'U09_GOOGLE',
      category: 'reputation',
      mode: 'both',
      dimension: 'reputation',
      weight: 9,
      title: { es: '¿Tenés perfil en Google Maps/Business?', 'pt-BR': 'Você tem perfil no Google Maps/Business?' },
      type: 'single',
      options: [
        { id: 'yes_optimized', label: { es: 'Sí, optimizado', 'pt-BR': 'Sim, otimizado' }, emoji: '✅' },
        { id: 'yes_basic', label: { es: 'Sí, básico', 'pt-BR': 'Sim, básico' }, emoji: '📍' },
        { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' },
      ],
    },
    {
      id: 'U10_RATING',
      category: 'reputation',
      mode: 'both',
      dimension: 'reputation',
      weight: 8,
      title: { es: 'Tu calificación promedio online', 'pt-BR': 'Sua nota média online' },
      type: 'slider',
      min: 1,
      max: 5,
      unit: '⭐',
    },
    {
      id: 'U11_SOCIAL',
      category: 'marketing',
      mode: 'both',
      dimension: 'traffic',
      weight: 7,
      title: { es: '¿En qué redes sociales estás activo?', 'pt-BR': 'Em quais redes sociais você está ativo?' },
      type: 'multi',
      options: [
        { id: 'instagram', label: { es: 'Instagram', 'pt-BR': 'Instagram' }, emoji: '📸' },
        { id: 'facebook', label: { es: 'Facebook', 'pt-BR': 'Facebook' }, emoji: '📘' },
        { id: 'tiktok', label: { es: 'TikTok', 'pt-BR': 'TikTok' }, emoji: '🎵' },
        { id: 'whatsapp', label: { es: 'WhatsApp Business', 'pt-BR': 'WhatsApp Business' }, emoji: '💬' },
        { id: 'none', label: { es: 'Ninguna', 'pt-BR': 'Nenhuma' }, emoji: '❌' },
      ],
    },
    {
      id: 'U12_SEASONALITY',
      category: 'operation',
      mode: 'both',
      dimension: 'traffic',
      weight: 7,
      title: { es: '¿Tu negocio tiene estacionalidad?', 'pt-BR': 'Seu negócio tem sazonalidade?' },
      type: 'single',
      options: [
        { id: 'very', label: { es: 'Muy estacional', 'pt-BR': 'Muito sazonal' }, emoji: '📊' },
        { id: 'some', label: { es: 'Algo estacional', 'pt-BR': 'Algo sazonal' }, emoji: '📈' },
        { id: 'stable', label: { es: 'Estable todo el año', 'pt-BR': 'Estável o ano todo' }, emoji: '➖' },
      ],
    },
  ];

  // For complete mode, add more detailed questions
  if (mode === 'complete') {
    const completeExtras: UniversalQuestion[] = [
      {
        id: 'U13_COMPETITION',
        category: 'identity',
        mode: 'complete',
        dimension: 'growth',
        weight: 6,
        title: { es: '¿Cuántos competidores directos tenés cerca?', 'pt-BR': 'Quantos concorrentes diretos você tem perto?' },
        type: 'single',
        options: [
          { id: 'none', label: { es: 'Casi ninguno', 'pt-BR': 'Quase nenhum' }, emoji: '🏆' },
          { id: 'few', label: { es: 'Pocos (1-3)', 'pt-BR': 'Poucos (1-3)' }, emoji: '👀' },
          { id: 'several', label: { es: 'Varios (4-10)', 'pt-BR': 'Vários (4-10)' }, emoji: '🏪' },
          { id: 'many', label: { es: 'Muchos (+10)', 'pt-BR': 'Muitos (+10)' }, emoji: '🔥' },
        ],
      },
      {
        id: 'U14_DIFFERENTIATOR',
        category: 'identity',
        mode: 'complete',
        dimension: 'reputation',
        weight: 8,
        title: { es: '¿Qué te diferencia de la competencia?', 'pt-BR': 'O que te diferencia da concorrência?' },
        type: 'multi',
        options: [
          { id: 'price', label: { es: 'Precio', 'pt-BR': 'Preço' }, emoji: '💰' },
          { id: 'quality', label: { es: 'Calidad', 'pt-BR': 'Qualidade' }, emoji: '⭐' },
          { id: 'service', label: { es: 'Atención al cliente', 'pt-BR': 'Atendimento' }, emoji: '🤝' },
          { id: 'location', label: { es: 'Ubicación', 'pt-BR': 'Localização' }, emoji: '📍' },
          { id: 'innovation', label: { es: 'Innovación', 'pt-BR': 'Inovação' }, emoji: '💡' },
        ],
      },
      {
        id: 'U15_OWNER_ROLE',
        category: 'team',
        mode: 'complete',
        dimension: 'efficiency',
        weight: 7,
        title: { es: '¿Cuál es tu rol principal?', 'pt-BR': 'Qual é seu papel principal?' },
        type: 'single',
        options: [
          { id: 'all', label: { es: 'Hago de todo', 'pt-BR': 'Faço de tudo' }, emoji: '🦸' },
          { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, emoji: '⚙️' },
          { id: 'sales', label: { es: 'Ventas/Comercial', 'pt-BR': 'Vendas/Comercial' }, emoji: '📈' },
          { id: 'admin', label: { es: 'Administración', 'pt-BR': 'Administração' }, emoji: '📊' },
          { id: 'strategic', label: { es: 'Estrategia (no operativo)', 'pt-BR': 'Estratégia (não operacional)' }, emoji: '🎯' },
        ],
      },
      // Add more complete-mode questions to reach 68-75 total
    ];
    
    return [...base, ...completeExtras];
  }

  return base;
}

// ============= MAIN ROUTER FUNCTION =============
export function getUniversalQuestionsForSetup(
  countryCode: CountryCode,
  areaId: string,
  businessTypeId: string,
  setupMode: 'quick' | 'complete'
): UniversalQuestion[] {
  console.log('[UniversalEngine v3] Routing:', { areaId, businessTypeId, setupMode });
  
  let questions: UniversalQuestion[] = [];
  
  switch (areaId) {
    case SECTOR_IDS.GASTRO:
      questions = getQuestionsForGastro(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.TURISMO:
      questions = getQuestionsForTurismo(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.SALUD:
      questions = getQuestionsForSalud(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.RETAIL:
      questions = getQuestionsForRetail(businessTypeId, setupMode);
      break;
      
    // TODO: Implement remaining sectors
    case SECTOR_IDS.EDUCACION:
    case SECTOR_IDS.B2B:
    case SECTOR_IDS.HOGAR:
    case SECTOR_IDS.CONSTRUCCION:
    case SECTOR_IDS.TRANSPORTE:
    case SECTOR_IDS.AGRO:
      questions = getUniversalBaseQuestions(setupMode);
      break;
      
    default:
      console.warn(`[UniversalEngine] Unknown sector: ${areaId}`);
      questions = getUniversalBaseQuestions(setupMode);
  }
  
  // Filter by country if applicable
  const filtered = questions.filter(q => 
    !q.countries || q.countries.includes(countryCode)
  );
  
  console.log(`[UniversalEngine v3] Returning ${filtered.length} questions for ${areaId}/${businessTypeId} (${setupMode})`);
  
  return filtered;
}

// ============= SECTOR-SPECIFIC ROUTERS =============

function getQuestionsForGastro(businessTypeId: string, mode: 'quick' | 'complete'): UniversalQuestion[] {
  const mappedId = GASTRO_ID_MAP[businessTypeId] || businessTypeId;
  const allQuestions = getGastroQuestions();
  
  return allQuestions.filter(q => {
    // Mode filter
    if (q.mode !== 'both' && q.mode !== mode) return false;
    
    // Business type filter
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    return q.businessTypes.includes(mappedId);
  });
}

function getQuestionsForTurismo(businessTypeId: string, mode: 'quick' | 'complete'): UniversalQuestion[] {
  const mappedId = TURISMO_ID_MAP[businessTypeId] || businessTypeId;
  const allQuestions = getTurismQuestions();
  
  return allQuestions.filter(q => {
    if (q.mode !== 'both' && q.mode !== mode) return false;
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    return q.businessTypes.includes(mappedId);
  });
}

function getQuestionsForSalud(businessTypeId: string, mode: 'quick' | 'complete'): UniversalQuestion[] {
  const mappedId = SALUD_ID_MAP[businessTypeId] || businessTypeId;
  const allQuestions = getSaludQuestions();
  
  return allQuestions.filter(q => {
    if (q.mode !== 'both' && q.mode !== mode) return false;
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    return q.businessTypes.includes(mappedId);
  });
}

function getQuestionsForRetail(businessTypeId: string, mode: 'quick' | 'complete'): UniversalQuestion[] {
  const mappedId = RETAIL_ID_MAP[businessTypeId] || businessTypeId;
  const allQuestions = getRetailQuestions();
  
  return allQuestions.filter(q => {
    if (q.mode !== 'both' && q.mode !== mode) return false;
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    return q.businessTypes.includes(mappedId);
  });
}

// ============= CATEGORY LABELS =============
export function getUniversalCategoryLabel(category: string, lang: 'es' | 'pt-BR'): string {
  const labels: Record<string, { es: string; 'pt-BR': string }> = {
    identity: { es: 'Identidad', 'pt-BR': 'Identidade' },
    operation: { es: 'Operación', 'pt-BR': 'Operação' },
    sales: { es: 'Ventas', 'pt-BR': 'Vendas' },
    menu: { es: 'Menú/Carta', 'pt-BR': 'Menu/Cardápio' },
    finance: { es: 'Finanzas', 'pt-BR': 'Finanças' },
    team: { es: 'Equipo', 'pt-BR': 'Equipe' },
    marketing: { es: 'Marketing', 'pt-BR': 'Marketing' },
    reputation: { es: 'Reputación', 'pt-BR': 'Reputação' },
    goals: { es: 'Objetivos', 'pt-BR': 'Objetivos' },
  };
  
  return labels[category]?.[lang] || category;
}

// ============= EXPORTS =============
export type { GastroCompleteQuestion } from './sectorQuestions/gastroQuestionsComplete';
export type { TurismQuestion } from './sectorQuestions/turismQuestionsV2';
