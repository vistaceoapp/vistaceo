// Country Packs - Configuración completa por país
// Basado en spec v1: 9 países soportados

// 9 países soportados - Solo español (ordenados alfabéticamente)
export type CountryCode = 'AR' | 'CL' | 'CO' | 'CR' | 'EC' | 'MX' | 'PA' | 'PY' | 'UY';

export const SUPPORTED_COUNTRIES: CountryCode[] = ['AR', 'CL', 'CO', 'CR', 'EC', 'MX', 'PA', 'PY', 'UY'];

export interface CountryPack {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  timezone: string;
  dayparts: string[];
  platforms: {
    delivery: string[];
    reservations: string[];
    reviews: string[];
  };
  lexicon: {
    receipt: string;
    order: string;
    tip: string;
    serviceCharge: string;
  };
  // Pasos adicionales requeridos por país
  additionalSteps: string[];
}

export const COUNTRY_PACKS: Record<CountryCode, CountryPack> = {
  AR: {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
    currencySymbol: '$',
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    dayparts: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Late night'],
    platforms: {
      delivery: ['PedidosYa', 'Rappi'],
      reservations: ['TheFork (Restorando)', 'Google Reserve'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'ticket',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'cargo por servicio',
    },
    additionalSteps: [],
  },
  MX: {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    currency: 'MXN',
    currencySymbol: '$',
    locale: 'es-MX',
    timezone: 'America/Mexico_City',
    dayparts: ['Desayuno', 'Comida', 'Merienda', 'Cena', 'Noche'],
    platforms: {
      delivery: ['Uber Eats', 'DiDi Food', 'Rappi'],
      reservations: ['OpenTable', 'TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'ticket',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'cargo por servicio',
    },
    additionalSteps: [],
  },
  CL: {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    currency: 'CLP',
    currencySymbol: '$',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    dayparts: ['Desayuno', 'Almuerzo', 'Once', 'Cena', 'Late night'],
    platforms: {
      delivery: ['PedidosYa', 'Rappi'],
      reservations: ['TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'boleta',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    currency: 'COP',
    currencySymbol: '$',
    locale: 'es-CO',
    timezone: 'America/Bogota',
    dayparts: ['Desayuno', 'Almuerzo', 'Onces', 'Cena', 'Late night'],
    platforms: {
      delivery: ['Rappi', 'DiDi Food'],
      reservations: ['TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'factura',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  EC: {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'es-EC',
    timezone: 'America/Guayaquil',
    dayparts: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Noche'],
    platforms: {
      delivery: ['PedidosYa', 'Rappi'],
      reservations: ['TheFork'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'factura',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  PY: {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    currency: 'PYG',
    currencySymbol: '₲',
    locale: 'es-PY',
    timezone: 'America/Asuncion',
    dayparts: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Noche'],
    platforms: {
      delivery: ['PedidosYa'],
      reservations: [],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'factura',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  UY: {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    currency: 'UYU',
    currencySymbol: '$',
    locale: 'es-UY',
    timezone: 'America/Montevideo',
    dayparts: ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Late night'],
    platforms: {
      delivery: ['PedidosYa', 'Rappi'],
      reservations: ['TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'ticket',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  CR: {
    code: 'CR',
    name: 'Costa Rica',
    flag: '🇨🇷',
    currency: 'CRC',
    currencySymbol: '₡',
    locale: 'es-CR',
    timezone: 'America/Costa_Rica',
    dayparts: ['Desayuno', 'Almuerzo', 'Café', 'Cena', 'Noche'],
    platforms: {
      delivery: ['PedidosYa', 'Rappi'],
      reservations: ['TheFork'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'factura',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
  PA: {
    code: 'PA',
    name: 'Panamá',
    flag: '🇵🇦',
    currency: 'PAB',
    currencySymbol: 'B/.',
    locale: 'es-PA',
    timezone: 'America/Panama',
    dayparts: ['Desayuno', 'Almuerzo', 'Café', 'Cena', 'Noche'],
    platforms: {
      delivery: ['PedidosYa'],
      reservations: ['TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'factura',
      order: 'pedido',
      tip: 'propina',
      serviceCharge: 'servicio',
    },
    additionalSteps: [],
  },
};

// Helpers
export const getCountryPack = (code: CountryCode): CountryPack => {
  return COUNTRY_PACKS[code];
};

export const isCountrySupported = (code: string): code is CountryCode => {
  return SUPPORTED_COUNTRIES.includes(code as CountryCode);
};

export const formatCurrency = (amount: number, countryCode: CountryCode): string => {
  const pack = COUNTRY_PACKS[countryCode];
  return new Intl.NumberFormat(pack.locale, {
    style: 'currency',
    currency: pack.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getLocalizedCopy = (countryCode: CountryCode, key: 'welcome' | 'menuMissing' | 'salesCostsMissing' | 'notAvailable'): string => {
  const pack = COUNTRY_PACKS[countryCode];
  const isPortuguese = pack.locale.startsWith('pt');
  const isEnglish = pack.locale.startsWith('en');

  const copies = {
    welcome: {
      es: `Creamos el Brain de tu negocio en ${pack.name}. Tu dashboard nace en vivo, en ${pack.currency}.`,
      pt: `Vamos criar o Brain do seu negócio no ${pack.name}. Seu dashboard nasce ao vivo, em ${pack.currency}.`,
      en: `Let's build your business Brain in the ${pack.name}. Your dashboard is born live, in ${pack.currency}.`,
    },
    menuMissing: {
      es: 'Sin tu menú no puedo comparar precios.',
      pt: 'Sem seu cardápio eu não consigo comparar preços.',
      en: "I can't compute price opportunities without your menu.",
    },
    salesCostsMissing: {
      es: 'Sin ventas y costos, cualquier "impacto" sería inventado.',
      pt: 'Sem vendas e custos, qualquer "impacto" vira chute.',
      en: 'Without sales and costs, any "impact" would be made up.',
    },
    notAvailable: {
      es: `Aún no estamos disponibles en tu país. Hoy soportamos: ${SUPPORTED_COUNTRIES.join(', ')}.`,
      pt: `Ainda não estamos disponíveis no seu país. Hoje: ${SUPPORTED_COUNTRIES.join(', ')}.`,
      en: `We're not available in your country yet. Today: ${SUPPORTED_COUNTRIES.join(', ')}.`,
    },
  };

  if (isPortuguese) return copies[key].pt;
  if (isEnglish) return copies[key].en;
  return copies[key].es;
};

// Business types con presets
export const BUSINESS_TYPES = [
  { value: 'restaurant', label: { es: 'Restaurante', pt: 'Restaurante', en: 'Restaurant' }, emoji: '🍽️' },
  { value: 'cafeteria', label: { es: 'Cafetería', pt: 'Cafeteria', en: 'Café' }, emoji: '☕' },
  { value: 'bar', label: { es: 'Bar', pt: 'Bar', en: 'Bar' }, emoji: '🍺' },
  { value: 'fast_casual', label: { es: 'Fast Casual / QSR', pt: 'Fast Casual / QSR', en: 'Fast Casual / QSR' }, emoji: '🍔' },
  { value: 'food_truck', label: { es: 'Food Truck', pt: 'Food Truck', en: 'Food Truck' }, emoji: '🚚' },
  { value: 'dark_kitchen', label: { es: 'Cocina Oculta', pt: 'Dark Kitchen', en: 'Ghost Kitchen' }, emoji: '👨‍🍳' },
] as const;

export const SERVICE_MODELS = [
  { value: 'full_service', label: { es: 'Salón', pt: 'Salão', en: 'Full-service' } },
  { value: 'delivery_first', label: { es: 'Delivery-first', pt: 'Delivery-first', en: 'Delivery-first' } },
  { value: 'takeaway', label: { es: 'Take away', pt: 'Take away', en: 'Takeaway' } },
  { value: 'hybrid', label: { es: 'Híbrido', pt: 'Híbrido', en: 'Hybrid' } },
] as const;

// PMO - Perfil Mínimo Operable
export interface PMOStatus {
  identity: boolean; // nombre, dirección, ciudad, país
  model: boolean; // tipo principal + modelo de servicio
  sales: boolean; // facturación mensual + ticket medio + transacciones/día
  menu: boolean; // 12+ items con precio (o 8 estrella)
  costs: boolean; // food cost % + costos fijos
  competition: boolean; // 5-12 competidores
}

export const getPMOCompletionPercentage = (status: PMOStatus): number => {
  const fields = Object.values(status);
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

// Metric states
export type MetricState = 'active' | 'estimated' | 'blocked';

export interface MetricStatus {
  state: MetricState;
  reason?: string;
  missingData?: string[];
  confidenceRange?: [number, number];
}

// ============= LOCALIZED REVENUE RANGES BY COUNTRY =============
// Adjusted for each country's currency and typical business sizes

export interface RevenueRange {
  id: string;
  label: { es: string };
  impactScore: number;
}

export const REVENUE_RANGES: Record<CountryCode, RevenueRange[]> = {
  AR: [
    { id: 'tier1', label: { es: 'Menos de $2M ARS' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$2M - $5M ARS' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$5M - $15M ARS' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $15M ARS' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  MX: [
    { id: 'tier1', label: { es: 'Menos de $100k MXN' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$100k - $300k MXN' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$300k - $800k MXN' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $800k MXN' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  CL: [
    { id: 'tier1', label: { es: 'Menos de $5M CLP' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$5M - $15M CLP' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$15M - $40M CLP' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $40M CLP' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  CO: [
    { id: 'tier1', label: { es: 'Menos de $20M COP' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$20M - $60M COP' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$60M - $150M COP' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $150M COP' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  EC: [
    { id: 'tier1', label: { es: 'Menos de $1k USD' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$1k - $5k USD' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$5k - $15k USD' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $15k USD' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  PY: [
    { id: 'tier1', label: { es: 'Menos de ₲10M' }, impactScore: -5 },
    { id: 'tier2', label: { es: '₲10M - ₲50M' }, impactScore: 5 },
    { id: 'tier3', label: { es: '₲50M - ₲150M' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de ₲150M' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  UY: [
    { id: 'tier1', label: { es: 'Menos de $200k UYU' }, impactScore: -5 },
    { id: 'tier2', label: { es: '$200k - $600k UYU' }, impactScore: 5 },
    { id: 'tier3', label: { es: '$600k - $1.5M UYU' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de $1.5M UYU' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  CR: [
    { id: 'tier1', label: { es: 'Menos de ₡3M' }, impactScore: -5 },
    { id: 'tier2', label: { es: '₡3M - ₡10M' }, impactScore: 5 },
    { id: 'tier3', label: { es: '₡10M - ₡25M' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de ₡25M' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
  PA: [
    { id: 'tier1', label: { es: 'Menos de B/.5k' }, impactScore: -5 },
    { id: 'tier2', label: { es: 'B/.5k - B/.15k' }, impactScore: 5 },
    { id: 'tier3', label: { es: 'B/.15k - B/.40k' }, impactScore: 10 },
    { id: 'tier4', label: { es: 'Más de B/.40k' }, impactScore: 15 },
    { id: 'prefer_not', label: { es: 'Prefiero no decir' }, impactScore: 0 },
  ],
};

export const getRevenueRanges = (countryCode: CountryCode): RevenueRange[] => {
  return REVENUE_RANGES[countryCode] || REVENUE_RANGES.AR;
};

// Get currency label with symbol for display
export const getCurrencyLabel = (countryCode: CountryCode): string => {
  const pack = COUNTRY_PACKS[countryCode];
  return `${pack.currencySymbol} (${pack.currency})`;
};
