// Retail Sector Questions Index
// Exports all retail business type questionnaires

// Existing types
export * from './calzadoQuestions';
export * from './modaQuestions';

// Complete questionnaires
export * from './electronicaQuestions';
export * from './ferreteriaQuestions';
export * from './petShopQuestions';
export * from './ecommerceD2cQuestions';
export * from './libreriaQuestions';
export * from './jugueteriaQuestions';
export * from './deportesQuestions';

// Re-export types
export type { GastroQuestion as RetailQuestion } from '../../gastroQuestionsEngine';
