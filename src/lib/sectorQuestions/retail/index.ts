// Retail Sector Questions Index
// Exports all retail business type questionnaires
// 13/13 types complete ✅

// Existing types
export * from './calzadoQuestions';
export * from './modaQuestions';

// Complete questionnaires - Fase 1 Retail
export * from './electronicaQuestions';
export * from './ferreteriaQuestions';
export * from './petShopQuestions';
export * from './ecommerceD2cQuestions';
export * from './libreriaQuestions';
export * from './jugueteriaQuestions';
export * from './deportesQuestions';
export * from './bellezaPerfumeriaQuestions';
export * from './gourmetQuestions';
export * from './segundaManoQuestions';
export * from './marketplaceSellerQuestions';
export * from './suscripcionQuestions';
export * from './mayoristaQuestions';

// Re-export types
export type { VistaSetupQuestion, VistaSetupQuestion as RetailQuestion } from '../../vistaSetupQuestion';
