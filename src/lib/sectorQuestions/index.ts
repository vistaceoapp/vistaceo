// Sector-specific Questions Index
// Each sector has ultra-specific questionnaires by business type
// 180 total questionnaires: 10 sectors × 18 business types each

// Turismo, hotelería, ocio y eventos (18 tipos)
export * from './turismQuestions';
export * from './turismQuestionsComplete';

// Retail y E-commerce (18 tipos)
export * from './retailQuestions';

// TODO: Remaining 6 sectors (108 questionnaires):
// export * from './saludQuestions';      // Salud, bienestar y belleza
// export * from './educacionQuestions';  // Educación y academias
// export * from './b2bQuestions';        // Servicios profesionales B2B
// export * from './hogarQuestions';      // Hogar y mantenimiento
// export * from './construccionQuestions'; // Construcción e inmobiliario
// export * from './transporteQuestions'; // Transporte y logística
// export * from './agroQuestions';       // Agro y agroindustria
