// Universal Questions Engine - Routes questions based on sector + business type
// Supports 10 sectors × 18 business types = 180 unique questionnaires

import { CountryCode, COUNTRY_PACKS } from './countryPacks';
import { ALL_GASTRO_QUESTIONS, GastroQuestion } from './gastroQuestionsEngine';

// Import sector-specific questions
import * as TurismQuestions from './sectorQuestions/turismQuestions';
import * as TurismQuestionsComplete from './sectorQuestions/turismQuestionsComplete';
import * as RetailQuestions from './sectorQuestions/retailQuestions';
import * as SaludQuestions from './sectorQuestions/saludQuestions';

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

// ============= QUESTION MAPPINGS BY SECTOR + BUSINESS TYPE =============

// Turismo sector - complete mapping
const TURISMO_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {
  // From turismQuestions.ts
  hotel_urbano: TurismQuestions.HOTEL_URBANO_QUESTIONS || [],
  hotel_boutique: TurismQuestions.HOTEL_BOUTIQUE_QUESTIONS || [],
  resort: TurismQuestions.RESORT_QUESTIONS || [],
  hostel: TurismQuestions.HOSTEL_QUESTIONS || [],
  agencia_viajes: TurismQuestions.AGENCIA_VIAJES_QUESTIONS || [],
  tours_guiados: TurismQuestions.TOURS_GUIADOS_QUESTIONS || [],
  parque_tematico: TurismQuestions.PARQUE_TEMATICO_QUESTIONS || [],
  salon_eventos: TurismQuestions.SALON_EVENTOS_QUESTIONS || [],
  ocio_nocturno: TurismQuestions.OCIO_NOCTURNO_QUESTIONS || [],
  // From turismQuestionsComplete.ts
  posada_lodge: TurismQuestionsComplete.POSADA_LODGE_QUESTIONS || [],
  apart_hotel: TurismQuestionsComplete.APART_HOTEL_QUESTIONS || [],
  alquiler_temporario: TurismQuestionsComplete.ALQUILER_TEMPORARIO_QUESTIONS || [],
  operador_turistico: TurismQuestionsComplete.OPERADOR_TURISTICO_QUESTIONS || [],
  turismo_aventura: TurismQuestionsComplete.TURISMO_AVENTURA_QUESTIONS || [],
  atracciones_tickets: TurismQuestionsComplete.ATRACCIONES_TICKETS_QUESTIONS || [],
  teatro_espectaculos: TurismQuestionsComplete.TEATRO_ESPECTACULOS_QUESTIONS || [],
  eventos_corporativos: TurismQuestionsComplete.EVENTOS_MICE_QUESTIONS || [],
  productora_eventos: TurismQuestionsComplete.PRODUCTORA_EVENTOS_QUESTIONS || [],
};

// Retail sector - complete mapping
const RETAIL_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {
  almacen_tienda: RetailQuestions.ALMACEN_QUESTIONS || [],
  supermercado: RetailQuestions.SUPERMERCADO_QUESTIONS || [],
  moda_accesorios: RetailQuestions.MODA_QUESTIONS || [],
  calzado: RetailQuestions.CALZADO_QUESTIONS || [],
  hogar_deco: RetailQuestions.HOGAR_DECO_QUESTIONS || [],
  electronica: RetailQuestions.ELECTRONICA_QUESTIONS || [],
  ferreteria: RetailQuestions.FERRETERIA_QUESTIONS || [],
  libreria: RetailQuestions.LIBRERIA_QUESTIONS || [],
  jugueteria: RetailQuestions.JUGUETERIA_QUESTIONS || [],
  deportes: RetailQuestions.DEPORTES_QUESTIONS || [],
  belleza_perfumeria: RetailQuestions.BELLEZA_PERFUMERIA_QUESTIONS || [],
  pet_shop: RetailQuestions.PETSHOP_QUESTIONS || [],
  gourmet: RetailQuestions.GOURMET_QUESTIONS || [],
  segunda_mano: RetailQuestions.SEGUNDA_MANO_QUESTIONS || [],
  ecommerce_d2c: RetailQuestions.ECOMMERCE_D2C_QUESTIONS || [],
  marketplace_seller: RetailQuestions.MARKETPLACE_SELLER_QUESTIONS || [],
  suscripcion: RetailQuestions.SUSCRIPCION_QUESTIONS || [],
  mayorista: RetailQuestions.MAYORISTA_QUESTIONS || [],
};

// TODO: Future sectors - placeholder for now
// Salud sector - complete mapping
const SALUD_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {
  clinica_policonsultorio: SaludQuestions.CLINICA_QUESTIONS || [],
  consultorio_medico: SaludQuestions.CONSULTORIO_QUESTIONS || [],
  centro_odontologico: SaludQuestions.ODONTOLOGIA_QUESTIONS || [],
  laboratorio_analisis: SaludQuestions.LABORATORIO_QUESTIONS || [],
  centro_diagnostico: SaludQuestions.DIAGNOSTICO_IMAGENES_QUESTIONS || [],
  kinesiologia_rehabilitacion: SaludQuestions.KINESIOLOGIA_QUESTIONS || [],
  psicologia_salud_mental: SaludQuestions.PSICOLOGIA_QUESTIONS || [],
  nutricion_dietetica: SaludQuestions.NUTRICION_QUESTIONS || [],
  medicina_estetica: SaludQuestions.MEDICINA_ESTETICA_QUESTIONS || [],
  centro_estetica: SaludQuestions.CENTRO_ESTETICA_QUESTIONS || [],
  spa_masajes: SaludQuestions.SPA_QUESTIONS || [],
  gimnasio_fitness: SaludQuestions.GIMNASIO_QUESTIONS || [],
  yoga_pilates: SaludQuestions.YOGA_PILATES_QUESTIONS || [],
  peluqueria_salon: SaludQuestions.PELUQUERIA_QUESTIONS || [],
  barberia: SaludQuestions.BARBERIA_QUESTIONS || [],
  manicuria_unas: SaludQuestions.MANICURIA_QUESTIONS || [],
  depilacion: SaludQuestions.DEPILACION_QUESTIONS || [],
  optica_contactologia: SaludQuestions.OPTICA_QUESTIONS || [],
};
const EDUCACION_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};
const B2B_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};
const HOGAR_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};
const CONSTRUCCION_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};
const TRANSPORTE_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};
const AGRO_QUESTIONS_MAP: Record<string, GastroQuestion[]> = {};

// ============= MAIN FUNCTION: Get questions for setup =============

export function getUniversalQuestionsForSetup(
  countryCode: CountryCode,
  areaId: string,
  businessTypeId: string,
  setupMode: 'quick' | 'complete'
): GastroQuestion[] {
  console.log('[UniversalQuestionsEngine] Getting questions for:', { areaId, businessTypeId, setupMode });
  
  let questions: GastroQuestion[] = [];
  
  // Route to the correct sector
  switch (areaId) {
    case SECTOR_IDS.GASTRO:
      // Use original gastronomy engine
      questions = getGastroQuestions(businessTypeId);
      break;
      
    case SECTOR_IDS.TURISMO:
      questions = TURISMO_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.RETAIL:
      questions = RETAIL_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.SALUD:
      questions = SALUD_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.EDUCACION:
      questions = EDUCACION_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.B2B:
      questions = B2B_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.HOGAR:
      questions = HOGAR_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.CONSTRUCCION:
      questions = CONSTRUCCION_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.TRANSPORTE:
      questions = TRANSPORTE_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    case SECTOR_IDS.AGRO:
      questions = AGRO_QUESTIONS_MAP[businessTypeId] || [];
      break;
      
    default:
      console.warn(`[UniversalQuestionsEngine] Unknown sector: ${areaId}, falling back to gastro`);
      questions = getGastroQuestions(businessTypeId);
  }
  
  // If no specific questions found, log warning
  if (questions.length === 0) {
    console.warn(`[UniversalQuestionsEngine] No questions found for ${areaId}/${businessTypeId}`);
    // Return empty - component will handle "no questions" case
    return [];
  }
  
  // Filter by mode
  const filteredQuestions = questions.filter(q => 
    q.mode === 'both' || q.mode === setupMode
  );
  
  // Filter by country if applicable
  const countryFiltered = filteredQuestions.filter(q => 
    !q.countries || q.countries.includes(countryCode)
  );
  
  console.log(`[UniversalQuestionsEngine] Returning ${countryFiltered.length} questions for ${businessTypeId}`);
  
  return countryFiltered;
}

// Helper: Get gastronomy questions (uses existing engine)
function getGastroQuestions(businessTypeId: string): GastroQuestion[] {
  // Filter questions for the specific business type
  return ALL_GASTRO_QUESTIONS.filter(q => 
    !q.businessTypes || q.businessTypes.length === 0 || q.businessTypes.includes(businessTypeId)
  );
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
