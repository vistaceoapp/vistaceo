// Retail Sector Questions Index
// Exports all retail business type questionnaires

// Existing types from retailQuestions.ts (5 types)
export * from './calzadoQuestions';
export * from './modaQuestions';
export * from './electronicaQuestions';

// New complete questionnaires (13 types)
export * from './electronicaQuestions';
export * from './ferreteriaQuestions';
export * from './petShopQuestions';
export * from './ecommerceD2cQuestions';

// Re-export types
export type { GastroQuestion as RetailQuestion } from '../../gastroQuestionsEngine';
