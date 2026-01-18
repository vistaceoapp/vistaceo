// Sector-specific Questions Index
// Each sector has ultra-specific questionnaires by business type
// 180 total questionnaires: 10 sectors × 18 business types each
// Structure: Quick (10-15 questions) + Complete (68-75 questions)
// 7 Dimensions: Crecimiento, Equipo, Tráfico, Rentabilidad, Finanzas, Eficiencia, Reputación

// Gastronomía y Bebidas (18 tipos) ✅
export * from './gastroQuestionsComplete';

// Turismo, hotelería, ocio y eventos (18 tipos) ✅
export * from './turismQuestions';
export * from './turismQuestionsComplete';
export * from './turismQuestionsV2';

// Retail y E-commerce (18 tipos) ✅
export * from './retailQuestions';

// Salud, bienestar y belleza (18 tipos) ✅
export * from './saludQuestions';

// Educación y academias (18 tipos) ✅
export * from './educacionQuestions';

// Servicios profesionales B2B (18 tipos) ✅
export * from './b2bQuestions';

// Hogar y mantenimiento (18 tipos) ✅
export * from './hogarQuestions';

// Construcción e inmobiliario (18 tipos) ✅
export * from './construccionQuestions';

// Transporte y logística (18 tipos) ✅
export * from './transporteQuestions';

// Agro y agroindustria (18 tipos) ✅
export * from './agroQuestions';

// ✅ COMPLETE: 10 sectors × 18 types = 180 questionnaires × 2 modes = 360 total
