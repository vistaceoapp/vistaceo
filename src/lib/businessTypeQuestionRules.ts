// Business Type Question Rules - Ultra-intelligent filtering system
// Ensures that irrelevant questions are never asked based on business type
// Example: Dark Kitchen should never be asked about seating capacity

import type { GastroQuestion } from './gastroQuestionsEngine';

// ============= BUSINESS TYPE CHARACTERISTICS =============
// Define what each business type HAS or DOESN'T HAVE

export interface BusinessTypeProfile {
  id: string;
  // Physical characteristics
  hasDineIn: boolean;          // Has physical seating for customers
  hasReservations: boolean;    // Works with reservations
  hasTables: boolean;          // Has tables/seating to rotate
  hasFloorService: boolean;    // Has waiters/floor staff
  
  // Operational characteristics
  isDeliveryFocused: boolean;  // Primarily or only delivery
  isTakeawayPrimary: boolean;  // Primarily takeaway/para llevar
  hasPhysicalLocation: boolean; // Has a physical storefront customers visit
  isEventBased: boolean;       // Works on events/orders basis
  
  // Staff characteristics
  needsBartender: boolean;     // Needs specialized bar staff
  needsChefSpecialty: boolean; // Needs specialized chef (sushi, etc)
  
  // Product characteristics
  isSeasonalBusiness: boolean; // Strong seasonality (ice cream, etc)
  hasLiquorLicense: boolean;   // Sells alcohol as main business
  
  // Scale/format
  isSmallFormat: boolean;      // Food truck, kiosk, small counter
}

// ============= BUSINESS TYPE PROFILES =============
export const BUSINESS_TYPE_PROFILES: Record<string, BusinessTypeProfile> = {
  // 1. Restaurant General - Full service restaurant
  restaurant_general: {
    id: 'restaurant_general',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 2. Alta Cocina - Fine dining
  alta_cocina: {
    id: 'alta_cocina',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 3. Bodegón / Cantina - Casual neighborhood eatery
  bodegon_cantina: {
    id: 'bodegon_cantina',
    hasDineIn: true,
    hasReservations: false,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 4. Parrilla / Asador - Grill/BBQ restaurant
  parrilla_asador: {
    id: 'parrilla_asador',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true, // Parrillero specialization
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 5. Cocina Criolla / Regional
  cocina_criolla: {
    id: 'cocina_criolla',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 6. Pescados, Mariscos y Ceviche
  pescados_mariscos: {
    id: 'pescados_mariscos',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 7. Pizzería
  pizzeria: {
    id: 'pizzeria',
    hasDineIn: true,
    hasReservations: false,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false, // Can have both
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true, // Pizzaiolo
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 8. Panadería
  panaderia: {
    id: 'panaderia',
    hasDineIn: false, // Usually counter service only
    hasReservations: false,
    hasTables: false, // May have a small seating area but not primary
    hasFloorService: false,
    isDeliveryFocused: false,
    isTakeawayPrimary: true,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true, // Baker
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: true,
  },
  
  // 9. Pastas - Cocina Italiana
  pastas_italiana: {
    id: 'pastas_italiana',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 10. Heladería
  heladeria: {
    id: 'heladeria',
    hasDineIn: false, // Usually counter service
    hasReservations: false,
    hasTables: false,
    hasFloorService: false,
    isDeliveryFocused: false,
    isTakeawayPrimary: true,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true, // Heladero artesanal
    isSeasonalBusiness: true, // Strong in summer
    hasLiquorLicense: false,
    isSmallFormat: true,
  },
  
  // 11. Fast Food (Hamburguesería, Panchos, Food truck)
  fast_food: {
    id: 'fast_food',
    hasDineIn: false, // Usually minimal or no seating
    hasReservations: false,
    hasTables: false,
    hasFloorService: false,
    isDeliveryFocused: false,
    isTakeawayPrimary: true,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: true,
  },
  
  // 12. Cafetería y Pastelería
  cafeteria_pasteleria: {
    id: 'cafeteria_pasteleria',
    hasDineIn: true,
    hasReservations: false,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false, // Barista instead
    needsChefSpecialty: true, // Barista/Pastelero
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 13. Cocina Asiática (Sushi, Ramen, etc.)
  cocina_asiatica: {
    id: 'cocina_asiatica',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true, // Sushi chef, etc.
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 14. Cocina Árabe - Oriental
  cocina_arabe: {
    id: 'cocina_arabe',
    hasDineIn: true,
    hasReservations: true,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 15. Cocina Saludable / Veggie
  cocina_saludable: {
    id: 'cocina_saludable',
    hasDineIn: true,
    hasReservations: false,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: true,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 16. Bar / Cervecería / Coctelería
  bar_cerveceria: {
    id: 'bar_cerveceria',
    hasDineIn: true,
    hasReservations: false,
    hasTables: true,
    hasFloorService: true,
    isDeliveryFocused: false,
    isTakeawayPrimary: false,
    hasPhysicalLocation: true,
    isEventBased: false,
    needsBartender: true,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: true,
    isSmallFormat: false,
  },
  
  // 17. Servicio de Comida (Catering, Viandas, etc.)
  servicio_comida: {
    id: 'servicio_comida',
    hasDineIn: false,
    hasReservations: false,
    hasTables: false,
    hasFloorService: false,
    isDeliveryFocused: true,
    isTakeawayPrimary: false,
    hasPhysicalLocation: false, // May have kitchen but no storefront
    isEventBased: true,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
  
  // 18. Dark Kitchen (Cocina Oculta/Ghost Kitchen)
  dark_kitchen: {
    id: 'dark_kitchen',
    hasDineIn: false,
    hasReservations: false,
    hasTables: false,
    hasFloorService: false,
    isDeliveryFocused: true,
    isTakeawayPrimary: false,
    hasPhysicalLocation: false, // No customer-facing storefront
    isEventBased: false,
    needsBartender: false,
    needsChefSpecialty: false,
    isSeasonalBusiness: false,
    hasLiquorLicense: false,
    isSmallFormat: false,
  },
};

// ============= QUESTION EXCLUSION RULES =============
// Maps question IDs to the business type characteristics required to see them

export interface QuestionRequirement {
  questionId: string;
  // If ANY of these are true, the question is excluded
  excludeIf: {
    noDineIn?: boolean;         // Exclude if business has no dine-in
    noTables?: boolean;         // Exclude if business has no tables
    noReservations?: boolean;   // Exclude if business doesn't do reservations
    noFloorService?: boolean;   // Exclude if business has no floor service
    deliveryOnly?: boolean;     // Exclude if business is delivery-focused
    noPhysicalLocation?: boolean; // Exclude if no customer-facing location
    isSmallFormat?: boolean;    // Exclude if small format business
    noBartender?: boolean;      // Exclude if doesn't need bartender
    noLiquorLicense?: boolean;  // Exclude if no liquor license
  };
}

// Questions that require specific business characteristics
export const QUESTION_EXCLUSION_RULES: QuestionRequirement[] = [
  // ========== SEATING / CAPACITY QUESTIONS ==========
  {
    questionId: 'Q_CAPACITY',
    excludeIf: { noDineIn: true, noTables: true },
  },
  {
    questionId: 'Q_TABLE_TURNOVER',
    excludeIf: { noTables: true },
  },
  {
    questionId: 'Q_SERVICE_TIME',
    excludeIf: { noDineIn: true, noFloorService: true },
  },
  
  // ========== RESERVATION QUESTIONS ==========
  {
    questionId: 'Q_RESERVATIONS',
    excludeIf: { noReservations: true, noDineIn: true },
  },
  
  // ========== FLOOR SERVICE / STAFF QUESTIONS ==========
  {
    questionId: 'Q_SHIFTS',
    excludeIf: { isSmallFormat: true },
  },
  {
    questionId: 'Q_TURNOVER', // Staff turnover
    excludeIf: { isSmallFormat: true },
  },
  
  // ========== BOTTLENECK QUESTIONS ==========
  {
    questionId: 'Q_BOTTLENECK',
    excludeIf: { deliveryOnly: true }, // Dark kitchens have different bottlenecks
  },
  
  // ========== DINE-IN SPECIFIC ==========
  {
    questionId: 'Q_CHANNEL_MIX_MAIN',
    excludeIf: { deliveryOnly: true }, // They already know their main channel
  },
  
  // ========== REPUTATION / AMBIANCE ==========
  {
    questionId: 'Q_TOP_COMPLAINT',
    excludeIf: { noPhysicalLocation: true }, // Different complaint types
  },
  
  // ========== PHYSICAL LOCATION ==========
  {
    questionId: 'Q_IS_RENTED',
    excludeIf: { noPhysicalLocation: true },
  },
];

// ============= SMART QUESTION FILTER =============
// Main function to check if a question should be shown for a business type

export function shouldShowQuestion(
  question: GastroQuestion,
  businessTypeId: string
): boolean {
  // Get business type profile
  const profile = BUSINESS_TYPE_PROFILES[businessTypeId];
  
  // If no profile found, show all questions (fallback)
  if (!profile) {
    console.warn(`No profile found for business type: ${businessTypeId}`);
    return true;
  }
  
  // Find exclusion rule for this question
  const rule = QUESTION_EXCLUSION_RULES.find(r => r.questionId === question.id);
  
  // If no specific rule, show the question
  if (!rule) {
    return true;
  }
  
  // Check each exclusion condition
  const { excludeIf } = rule;
  
  if (excludeIf.noDineIn && !profile.hasDineIn) {
    return false;
  }
  
  if (excludeIf.noTables && !profile.hasTables) {
    return false;
  }
  
  if (excludeIf.noReservations && !profile.hasReservations) {
    return false;
  }
  
  if (excludeIf.noFloorService && !profile.hasFloorService) {
    return false;
  }
  
  if (excludeIf.deliveryOnly && profile.isDeliveryFocused) {
    return false;
  }
  
  if (excludeIf.noPhysicalLocation && !profile.hasPhysicalLocation) {
    return false;
  }
  
  if (excludeIf.isSmallFormat && profile.isSmallFormat) {
    return false;
  }
  
  if (excludeIf.noBartender && !profile.needsBartender) {
    return false;
  }
  
  if (excludeIf.noLiquorLicense && !profile.hasLiquorLicense) {
    return false;
  }
  
  return true;
}

// ============= ADDITIONAL SMART FILTERING =============
// Filter options within a question based on business type

export function filterQuestionOptions(
  question: GastroQuestion,
  businessTypeId: string
): GastroQuestion {
  const profile = BUSINESS_TYPE_PROFILES[businessTypeId];
  if (!profile || !question.options) {
    return question;
  }
  
  // Smart option filtering based on business type
  let filteredOptions = [...question.options];
  
  // For Q_CHANNELS - filter out dine_in for delivery-only businesses
  if (question.id === 'Q_CHANNELS' && profile.isDeliveryFocused) {
    // Don't completely remove dine_in, but they can still choose if they want
    // This allows flexibility
  }
  
  // For Q_BOTTLENECK - adjust options based on business type
  if (question.id === 'Q_BOTTLENECK') {
    if (!profile.hasDineIn) {
      // Remove floor/salon option for non-dine-in businesses
      filteredOptions = filteredOptions.filter(opt => opt.id !== 'floor');
    }
    if (!profile.hasFloorService) {
      filteredOptions = filteredOptions.filter(opt => opt.id !== 'checkout');
    }
  }
  
  // For Q_PEAKS - adjust for event-based businesses
  if (question.id === 'Q_PEAKS' && profile.isEventBased) {
    // Event-based businesses have different peak patterns
    // Keep all options for now, but could customize labels
  }
  
  return {
    ...question,
    options: filteredOptions,
  };
}

// ============= GET BUSINESS TYPE PROFILE =============
export function getBusinessTypeProfile(businessTypeId: string): BusinessTypeProfile | null {
  return BUSINESS_TYPE_PROFILES[businessTypeId] || null;
}

// ============= DEBUG HELPER =============
// Get list of excluded questions for a business type
export function getExcludedQuestionsForType(businessTypeId: string): string[] {
  const profile = BUSINESS_TYPE_PROFILES[businessTypeId];
  if (!profile) return [];
  
  return QUESTION_EXCLUSION_RULES
    .filter(rule => {
      const { excludeIf } = rule;
      
      if (excludeIf.noDineIn && !profile.hasDineIn) return true;
      if (excludeIf.noTables && !profile.hasTables) return true;
      if (excludeIf.noReservations && !profile.hasReservations) return true;
      if (excludeIf.noFloorService && !profile.hasFloorService) return true;
      if (excludeIf.deliveryOnly && profile.isDeliveryFocused) return true;
      if (excludeIf.noPhysicalLocation && !profile.hasPhysicalLocation) return true;
      if (excludeIf.isSmallFormat && profile.isSmallFormat) return true;
      if (excludeIf.noBartender && !profile.needsBartender) return true;
      if (excludeIf.noLiquorLicense && !profile.hasLiquorLicense) return true;
      
      return false;
    })
    .map(rule => rule.questionId);
}
