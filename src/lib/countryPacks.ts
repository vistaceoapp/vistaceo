// Country Packs - Configuración completa por país
// Basado en spec v1: 9 países soportados

export type CountryCode = 'AR' | 'MX' | 'CL' | 'CO' | 'BR' | 'UY' | 'CR' | 'PA' | 'US';

export const SUPPORTED_COUNTRIES: CountryCode[] = ['AR', 'MX', 'CL', 'CO', 'BR', 'UY', 'CR', 'PA', 'US'];

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
  BR: {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dayparts: ['Café da manhã', 'Almoço', 'Café da tarde', 'Jantar', 'Madrugada'],
    platforms: {
      delivery: ['iFood', 'Rappi'],
      reservations: ['TheFork (Restorando)'],
      reviews: ['Google Maps / Business Profile', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'nota fiscal',
      order: 'pedido',
      tip: 'gorjeta',
      serviceCharge: 'taxa de serviço',
    },
    additionalSteps: ['serviceFee'], // Taxa de serviço obligatorio
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
  US: {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    timezone: 'America/New_York', // Fallback
    dayparts: ['Breakfast', 'Lunch', 'Afternoon', 'Dinner', 'Late night'],
    platforms: {
      delivery: ['DoorDash', 'Uber Eats', 'Grubhub'],
      reservations: ['OpenTable', 'Google Reserve'],
      reviews: ['Google Maps / Business Profile', 'Yelp', 'Tripadvisor'],
    },
    lexicon: {
      receipt: 'receipt',
      order: 'order',
      tip: 'tip',
      serviceCharge: 'service charge',
    },
    additionalSteps: ['salesTax', 'tipping'], // Sales tax + tips obligatorios
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
