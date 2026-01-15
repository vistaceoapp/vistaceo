// Universal Questions Engine v2 - Fully Integrated with Complete Questionnaires
// Routes questions based on sector + business type
// Supports 10 sectors × 18 business types = 180 unique questionnaires
// Each with Quick (10-15) + Complete (68-75) versions

import { CountryCode, COUNTRY_PACKS } from './countryPacks';
import { GastroQuestion } from './gastroQuestionsEngine';

// Import NEW sector-specific complete questionnaires
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

// ============= TYPE ADAPTERS =============
// Adapter to convert GastroCompleteQuestion to GastroQuestion format
function adaptGastroComplete(questions: GastroCompleteQuestion[]): GastroQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category) as any,
    mode: q.mode,
    dimension: mapScoreAreaToDimension(q.score_area),
    weight: 8,
    title: q.title,
    help: q.help,
    type: q.type === 'money' ? 'number' : q.type,
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

// Adapter to convert TurismQuestion to GastroQuestion format
function adaptTurism(questions: TurismQuestion[]): GastroQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category) as any,
    mode: q.mode,
    dimension: mapScoreAreaToDimension(q.score_area),
    weight: 8,
    title: q.title,
    help: q.help,
    type: q.type === 'money' ? 'number' : q.type,
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

// Adapter for Salud questions (already in GastroQuestion format mostly)
function adaptSalud(questions: any[]): GastroQuestion[] {
  return questions.map(q => ({
    id: q.id,
    category: mapCategory(q.category || 'operation') as any,
    mode: q.mode || 'both',
    dimension: mapScoreAreaToDimension(q.score_area || 'Eficiencia'),
    weight: 8,
    title: q.title,
    help: q.help,
    type: q.type === 'money' ? 'number' : q.type,
    options: q.options?.map((opt: any) => ({
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

// Map category names
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

// Map score_area to dimension
function mapScoreAreaToDimension(area: string): any {
  const mapping: Record<string, string> = {
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

// ============= BUSINESS TYPE ID MAPPING =============
// Map from allBusinessTypes.ts IDs to the IDs used in questionnaire files

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
  'resort_todo_incluido': TURISM_BUSINESS_TYPES.RESORT,
  'hostel_albergue': TURISM_BUSINESS_TYPES.HOSTEL,
  'apart_hotel': TURISM_BUSINESS_TYPES.APART_HOTEL,
  'posada_bb': TURISM_BUSINESS_TYPES.POSADA,
  'alquiler_temporario': TURISM_BUSINESS_TYPES.ALQUILER_TEMP,
  'agencia_viajes': TURISM_BUSINESS_TYPES.AGENCIA_VIAJES,
  'tours_guiados': TURISM_BUSINESS_TYPES.TOURS,
  'turismo_aventura': TURISM_BUSINESS_TYPES.TURISMO_AVENTURA,
  'operador_turistico': TURISM_BUSINESS_TYPES.OPERADOR_TURISTICO,
  'parque_tematico': TURISM_BUSINESS_TYPES.PARQUE_TEMATICO,
  'atracciones_tickets': TURISM_BUSINESS_TYPES.ATRACCIONES,
  'entretenimiento_ocio': TURISM_BUSINESS_TYPES.ENTRETENIMIENTO,
  'teatro_espectaculos': TURISM_BUSINESS_TYPES.TEATRO,
  'salon_eventos': TURISM_BUSINESS_TYPES.SALON_EVENTOS,
  'eventos_corporativos': TURISM_BUSINESS_TYPES.EVENTOS_CORP,
  'productora_eventos': TURISM_BUSINESS_TYPES.PRODUCTORA,
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

// ============= MAIN FUNCTION: Get questions for setup =============

export function getUniversalQuestionsForSetup(
  countryCode: CountryCode,
  areaId: string,
  businessTypeId: string,
  setupMode: 'quick' | 'complete'
): GastroQuestion[] {
  console.log('[UniversalQuestionsEngine v2] Getting questions for:', { areaId, businessTypeId, setupMode });
  
  let questions: GastroQuestion[] = [];
  
  // Route to the correct sector with the complete questionnaires
  switch (areaId) {
    case SECTOR_IDS.GASTRO:
      questions = getGastroQuestionsV2(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.TURISMO:
      questions = getTurismQuestionsV2(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.SALUD:
      questions = getSaludQuestions(businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.RETAIL:
      // TODO: Add complete retail questionnaire
      questions = getPlaceholderQuestions(areaId, businessTypeId, setupMode);
      break;
      
    case SECTOR_IDS.EDUCACION:
    case SECTOR_IDS.B2B:
    case SECTOR_IDS.HOGAR:
    case SECTOR_IDS.CONSTRUCCION:
    case SECTOR_IDS.TRANSPORTE:
    case SECTOR_IDS.AGRO:
      // TODO: Add sector-specific questionnaires
      questions = getPlaceholderQuestions(areaId, businessTypeId, setupMode);
      break;
      
    default:
      console.warn(`[UniversalQuestionsEngine] Unknown sector: ${areaId}`);
      questions = getPlaceholderQuestions(areaId, businessTypeId, setupMode);
  }
  
  // Filter by country if applicable
  const countryFiltered = questions.filter(q => 
    !q.countries || q.countries.includes(countryCode)
  );
  
  console.log(`[UniversalQuestionsEngine v2] Returning ${countryFiltered.length} questions for ${areaId}/${businessTypeId}/${setupMode}`);
  
  return countryFiltered;
}

// ============= GASTRONOMY V2 =============
function getGastroQuestionsV2(businessTypeId: string, mode: 'quick' | 'complete'): GastroQuestion[] {
  // Map the UI ID to the questionnaire ID
  const mappedId = GASTRO_ID_MAP[businessTypeId] || businessTypeId;
  
  // Get all questions and adapt them
  const allQuestions = adaptGastroComplete(GASTRO_COMPLETE_QUESTIONS);
  
  // Filter by mode and business type
  const filtered = allQuestions.filter(q => {
    // Mode filter
    if (q.mode !== 'both' && q.mode !== mode) return false;
    
    // Business type filter - if no businessTypes specified, applies to all
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    
    // Check if this question applies to this business type
    return q.businessTypes.includes(mappedId);
  });
  
  console.log(`[Gastro V2] ${filtered.length} questions for ${businessTypeId} (mapped: ${mappedId}) in ${mode} mode`);
  return filtered;
}

// ============= TURISMO V2 =============
function getTurismQuestionsV2(businessTypeId: string, mode: 'quick' | 'complete'): GastroQuestion[] {
  // Map the UI ID to the questionnaire ID
  const mappedId = TURISMO_ID_MAP[businessTypeId] || businessTypeId;
  
  // Get all questions and adapt them
  const allQuestions = adaptTurism(TURISM_COMPLETE_QUESTIONS);
  
  // Filter by mode and business type
  const filtered = allQuestions.filter(q => {
    // Mode filter
    if (q.mode !== 'both' && q.mode !== mode) return false;
    
    // Business type filter
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    
    return q.businessTypes.includes(mappedId);
  });
  
  console.log(`[Turismo V2] ${filtered.length} questions for ${businessTypeId} (mapped: ${mappedId}) in ${mode} mode`);
  return filtered;
}

// ============= SALUD =============
function getSaludQuestions(businessTypeId: string, mode: 'quick' | 'complete'): GastroQuestion[] {
  const mappedId = SALUD_ID_MAP[businessTypeId] || businessTypeId;
  
  const allQuestions = adaptSalud(ALL_SALUD_QUESTIONS);
  
  const filtered = allQuestions.filter(q => {
    if (q.mode !== 'both' && q.mode !== mode) return false;
    if (!q.businessTypes || q.businessTypes.length === 0) return true;
    return q.businessTypes.includes(mappedId);
  });
  
  console.log(`[Salud] ${filtered.length} questions for ${businessTypeId} in ${mode} mode`);
  return filtered;
}

// ============= PLACEHOLDER for sectors not yet fully implemented =============
function getPlaceholderQuestions(areaId: string, businessTypeId: string, mode: 'quick' | 'complete'): GastroQuestion[] {
  // Return a basic set of universal questions for sectors not yet fully implemented
  const quickCount = mode === 'quick' ? 12 : 70;
  
  const universalQuestions: GastroQuestion[] = [
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
        { id: 'low', label: { es: 'Menos de $1.000.000', 'pt-BR': 'Menos de R$10.000' }, emoji: '💵' },
        { id: 'medium', label: { es: '$1-5 millones', 'pt-BR': 'R$10-50.000' }, emoji: '💰' },
        { id: 'high', label: { es: '$5-20 millones', 'pt-BR': 'R$50-200.000' }, emoji: '💎' },
        { id: 'vhigh', label: { es: 'Más de $20 millones', 'pt-BR': 'Mais de R$200.000' }, emoji: '🏆' },
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
      mode: mode === 'complete' ? 'complete' : 'both',
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
      mode: mode === 'complete' ? 'complete' : 'both',
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
        { id: 'yes_active', label: { es: 'Sí, lo gestiono activamente', 'pt-BR': 'Sim, gerencio ativamente' }, emoji: '✅' },
        { id: 'yes_passive', label: { es: 'Sí, pero no lo actualizo', 'pt-BR': 'Sim, mas não atualizo' }, emoji: '⚠️' },
        { id: 'no', label: { es: 'No tengo', 'pt-BR': 'Não tenho' }, emoji: '❌' },
      ],
    },
    {
      id: 'U10_SATISFACTION',
      category: 'team',
      mode: 'complete',
      dimension: 'team',
      weight: 7,
      title: { es: '¿Cómo calificarías la satisfacción de tu equipo?', 'pt-BR': 'Como você classificaria a satisfação da sua equipe?' },
      type: 'slider',
      min: 1,
      max: 10,
      unit: '/10',
    },
    {
      id: 'U11_SEASONALITY',
      category: 'operation',
      mode: 'complete',
      dimension: 'traffic',
      weight: 7,
      title: { es: '¿Tu negocio es estacional?', 'pt-BR': 'Seu negócio é sazonal?' },
      type: 'single',
      options: [
        { id: 'no', label: { es: 'No, es estable todo el año', 'pt-BR': 'Não, é estável o ano todo' }, emoji: '📊' },
        { id: 'slight', label: { es: 'Variaciones leves', 'pt-BR': 'Variações leves' }, emoji: '📈' },
        { id: 'high', label: { es: 'Sí, muy estacional', 'pt-BR': 'Sim, muito sazonal' }, emoji: '🌊' },
      ],
    },
    {
      id: 'U12_COMPETITION',
      category: 'identity',
      mode: 'complete',
      dimension: 'growth',
      weight: 6,
      title: { es: '¿Cómo ves la competencia en tu zona?', 'pt-BR': 'Como você vê a concorrência na sua região?' },
      type: 'single',
      options: [
        { id: 'low', label: { es: 'Poca competencia', 'pt-BR': 'Pouca concorrência' }, emoji: '😊' },
        { id: 'moderate', label: { es: 'Competencia moderada', 'pt-BR': 'Concorrência moderada' }, emoji: '⚖️' },
        { id: 'high', label: { es: 'Alta competencia', 'pt-BR': 'Alta concorrência' }, emoji: '🔥' },
      ],
    },
  ];
  
  // For quick mode, return first 12 questions
  // For complete mode, return all 12 (base) + we'll add more sector-specific later
  const result = mode === 'quick' 
    ? universalQuestions.slice(0, 12) 
    : universalQuestions;
    
  console.log(`[Placeholder] ${result.length} questions for ${areaId}/${businessTypeId} in ${mode} mode`);
  return result;
}

// ============= CATEGORY LABELS (Universal) =============
export const UNIVERSAL_CATEGORY_LABELS: Record<string, { es: string; 'pt-BR': string; icon: string }> = {
  identity: { es: 'Identidad', 'pt-BR': 'Identidade', icon: '🏪' },
  operation: { es: 'Operación', 'pt-BR': 'Operação', icon: '⚙️' },
  sales: { es: 'Ventas', 'pt-BR': 'Vendas', icon: '💰' },
  menu: { es: 'Servicios', 'pt-BR': 'Serviços', icon: '📋' },
  finance: { es: 'Finanzas', 'pt-BR': 'Finanças', icon: '📊' },
  team: { es: 'Equipo', 'pt-BR': 'Equipe', icon: '👥' },
  marketing: { es: 'Marketing', 'pt-BR': 'Marketing', icon: '📣' },
  reputation: { es: 'Reputación', 'pt-BR': 'Reputação', icon: '⭐' },
  goals: { es: 'Objetivos', 'pt-BR': 'Objetivos', icon: '🎯' },
};

export function getUniversalCategoryLabel(category: string, lang: string): string {
  const labels = UNIVERSAL_CATEGORY_LABELS[category];
  if (!labels) return category;
  return lang === 'pt-BR' ? labels['pt-BR'] : labels.es;
}

// ============= QUESTION COUNTS =============
export function getQuestionCounts(areaId: string, businessTypeId: string): { quick: number; complete: number } {
  const quickQuestions = getUniversalQuestionsForSetup('AR', areaId, businessTypeId, 'quick');
  const completeQuestions = getUniversalQuestionsForSetup('AR', areaId, businessTypeId, 'complete');
  
  return {
    quick: quickQuestions.length,
    complete: completeQuestions.length,
  };
}
