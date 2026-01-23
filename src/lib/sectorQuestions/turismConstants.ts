// ============================================
// TURISMO - Constants and Types
// Shared between turismQuestionsV2 and turismQuestionsExtended
// ============================================

export interface TurismQuestion {
  id: string;
  category: string;
  categoryLabel: { es: string; 'pt-BR': string };
  mode: 'quick' | 'complete' | 'both';
  score_area: 'Reputación' | 'Rentabilidad' | 'Finanzas' | 'Eficiencia' | 'Tráfico' | 'Equipo' | 'Crecimiento';
  title: { es: string; 'pt-BR': string };
  help?: { es: string; 'pt-BR': string };
  type: 'single' | 'multi' | 'number' | 'slider' | 'text' | 'money';
  options?: Array<{ id: string; label: { es: string; 'pt-BR': string }; emoji?: string }>;
  min?: number;
  max?: number;
  unit?: string;
  required?: boolean;
  businessTypes?: string[]; // Si se especifica, solo para estos tipos
}

// IDs de tipos de negocio turismo
export const TURISM_BUSINESS_TYPES = {
  HOTEL_URBANO: 'A2_T001_HOTEL_URBANO',
  HOTEL_BOUTIQUE: 'A2_T002_HOTEL_BOUTIQUE',
  RESORT: 'A2_T003_RESORT_TODO',
  HOSTEL: 'A2_T004_HOSTEL',
  APART_HOTEL: 'A2_T005_APART_HOTEL',
  POSADA: 'A2_T006_POSADA_BB',
  ALQUILER_TEMP: 'A2_T007_ALQUILER_TEMP',
  AGENCIA_VIAJES: 'A2_T008_AGENCIA_VIAJES',
  TOURS: 'A2_T009_TOURS',
  TURISMO_AVENTURA: 'A2_T010_TURISMO_AVENTURA',
  OPERADOR_TURISTICO: 'A2_T011_OPERADOR_TURISTICO',
  PARQUE_TEMATICO: 'A2_T012_PARQUE_TEMATICO',
  ATRACCIONES: 'A2_T013_ATRACCIONES',
  ENTRETENIMIENTO: 'A2_T014_ENTRETENIMIENTO',
  TEATRO: 'A2_T015_TEATRO',
  SALON_EVENTOS: 'A2_T016_SALON_EVENTOS',
  EVENTOS_CORP: 'A2_T017_EVENTOS_CORP',
  PRODUCTORA: 'A2_T018_PRODUCTORA',
};

// Grupos de tipos para preguntas condicionales
export const ALOJAMIENTO = [
  TURISM_BUSINESS_TYPES.HOTEL_URBANO,
  TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE,
  TURISM_BUSINESS_TYPES.RESORT,
  TURISM_BUSINESS_TYPES.HOSTEL,
  TURISM_BUSINESS_TYPES.APART_HOTEL,
  TURISM_BUSINESS_TYPES.POSADA,
  TURISM_BUSINESS_TYPES.ALQUILER_TEMP,
];

export const HOTELES = [
  TURISM_BUSINESS_TYPES.HOTEL_URBANO,
  TURISM_BUSINESS_TYPES.HOTEL_BOUTIQUE,
  TURISM_BUSINESS_TYPES.RESORT,
];

export const AGENCIAS_TOURS = [
  TURISM_BUSINESS_TYPES.AGENCIA_VIAJES,
  TURISM_BUSINESS_TYPES.TOURS,
  TURISM_BUSINESS_TYPES.TURISMO_AVENTURA,
  TURISM_BUSINESS_TYPES.OPERADOR_TURISTICO,
];

export const ATRACCIONES_PARQUES = [
  TURISM_BUSINESS_TYPES.PARQUE_TEMATICO,
  TURISM_BUSINESS_TYPES.ATRACCIONES,
  TURISM_BUSINESS_TYPES.ENTRETENIMIENTO,
  TURISM_BUSINESS_TYPES.TEATRO,
];

export const EVENTOS = [
  TURISM_BUSINESS_TYPES.SALON_EVENTOS,
  TURISM_BUSINESS_TYPES.EVENTOS_CORP,
  TURISM_BUSINESS_TYPES.PRODUCTORA,
];
