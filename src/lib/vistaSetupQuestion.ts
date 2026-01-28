// ============================================
// VISTA SETUP QUESTION - Universal Interface Re-export
// This is THE canonical interface for all sector questionnaires
// Actually defined in gastroQuestionsEngine.ts for backward compatibility
// This file provides clean imports for new code
// ============================================

// Re-export the canonical types from gastroQuestionsEngine
export type {
  GastroQuestion,
  GastroQuestion as VistaSetupQuestion,
  QuestionOption,
  QuestionOption as VistaQuestionOption,
  HealthDimension,
} from './gastroQuestionsEngine';

export {
  CATEGORY_LABELS,
  CANONICAL_DIMENSIONS,
  DIMENSION_MAPPING,
} from './gastroQuestionsEngine';

// Question categories
export type QuestionCategory = 
  | 'identity'        // Identidad y posicionamiento
  | 'operation'       // Operaciones y capacidad
  | 'sales'           // Ventas y conversión
  | 'menu'            // Oferta y precios (legacy: menu)
  | 'finance'         // Finanzas y márgenes
  | 'team'            // Equipo y roles
  | 'marketing'       // Marketing y adquisición
  | 'reputation'      // Retención y experiencia (CX)
  | 'goals';          // Objetivos del dueño

// Question input types
export type QuestionType = 'single' | 'multi' | 'number' | 'slider' | 'text';

// Dimension labels for UI
export const DIMENSION_LABELS: Record<string, { es: string; 'pt-BR': string; icon: string }> = {
  reputation: { es: 'Reputación', 'pt-BR': 'Reputação', icon: '⭐' },
  profitability: { es: 'Rentabilidad', 'pt-BR': 'Rentabilidade', icon: '💰' },
  finances: { es: 'Finanzas', 'pt-BR': 'Finanças', icon: '📊' },
  efficiency: { es: 'Eficiencia', 'pt-BR': 'Eficiência', icon: '⚙️' },
  traffic: { es: 'Tráfico', 'pt-BR': 'Tráfego', icon: '📈' },
  team: { es: 'Equipo', 'pt-BR': 'Equipe', icon: '👥' },
  growth: { es: 'Crecimiento', 'pt-BR': 'Crescimento', icon: '🚀' },
};
