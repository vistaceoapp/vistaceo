// Setup Steps Configuration (S00-S20)
// Cada pantalla del wizard de onboarding

import { CountryCode, COUNTRY_PACKS } from './countryPacks';

export interface SetupStep {
  id: string;
  order: number;
  title: (countryCode?: CountryCode) => string;
  subtitle: (countryCode?: CountryCode) => string;
  inputType: 'chips' | 'slider' | 'mix100' | 'text' | 'map' | 'menu' | 'toggle' | 'search' | 'preview' | 'cta';
  required: boolean;
  // Condiciones para mostrar el paso
  condition?: (data: SetupData) => boolean;
  // Opciones dinámicas por país
  getOptions?: (countryCode: CountryCode) => string[];
}

export interface SetupData {
  // S00 - Welcome
  started: boolean;
  
  // S01 - Location
  address: string;
  city: string;
  competitiveRadius: number; // km
  
  // S02 - Primary Type
  primaryType: string;
  
  // S03 - Service Model
  serviceModel: string;
  
  // S04 - Dayparts
  activeDayparts: string[];
  
  // S05 - Capacity
  seatingCapacity?: number;
  tablesCount?: number;
  avgTurnoverMinutes?: number;
  deliveryCapacityPerHour?: number;
  
  // S06 - Sales Base (ranges)
  monthlyRevenueMin: number;
  monthlyRevenueMax: number;
  avgTicketMin: number;
  avgTicketMax: number;
  dailyTransactionsMin: number;
  dailyTransactionsMax: number;
  
  // S07 - Channel Mix (must sum 100)
  channelMix: {
    dineIn: number;
    delivery: number;
    takeaway: number;
  };
  
  // S08 - Platforms
  deliveryPlatforms: string[];
  reservationPlatforms: string[];
  
  // S09-S10 - Menu
  menuMethod: 'photo' | 'pdf' | 'url' | 'manual';
  menuItems: MenuItemData[];
  
  // S11 - Sizes
  itemSizes: Record<string, 'S' | 'M' | 'L' | 'custom'>;
  
  // S12 - Price by Channel
  hasDifferentPricesByChannel: boolean;
  channelPriceDiff?: number; // % difference
  
  // S13 - Key Costs
  foodCostPercentMin: number;
  foodCostPercentMax: number;
  fixedCostsMin: number;
  fixedCostsMax: number;
  appCommissionPercent?: number;
  
  // S14 - Real Times
  avgPrepTimeMinutes: number;
  avgServiceDurationMinutes?: number;
  
  // S15 - Public Reputation
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  
  // S16 - Competition
  competitors: CompetitorData[];
  
  // S17 - Price Verification (auto)
  priceVerificationCoverage?: number;
  
  // S18 - Opportunities Map (preview)
  topOpportunities?: OpportunityPreview[];
  topRisks?: OpportunityPreview[];
  
  // US-specific
  salesTaxPercent?: number;
  tipPercent?: number;
  
  // BR-specific
  serviceFeePercent?: number;
  
  // Country
  countryCode: CountryCode;
}

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  price: number;
  size?: 'S' | 'M' | 'L' | 'custom';
  isStarItem?: boolean;
}

export interface CompetitorData {
  id: string;
  name: string;
  placeId?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: 1 | 2 | 3 | 4;
  hasVerifiedPrices?: boolean;
}

export interface OpportunityPreview {
  title: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
}

// Definición de los pasos
export const SETUP_STEPS: SetupStep[] = [
  {
    id: 'S00',
    order: 0,
    title: (cc) => cc ? getLocalCopy(cc, 'welcome_title') : 'Bienvenido',
    subtitle: (cc) => cc ? COUNTRY_PACKS[cc] ? 
      `Creamos el Brain de tu negocio en ${COUNTRY_PACKS[cc].name}. Tu dashboard nace en vivo, en ${COUNTRY_PACKS[cc].currency}.` 
      : 'Tu dashboard nace en vivo.' : 'Tu dashboard nace en vivo.',
    inputType: 'cta',
    required: true,
  },
  {
    id: 'S01',
    order: 1,
    title: () => 'Ubicación competitiva',
    subtitle: () => 'Confirmá tu dirección y radio competitivo. Esto define con quién te comparamos.',
    inputType: 'map',
    required: true,
  },
  {
    id: 'S02',
    order: 2,
    title: () => '¿Qué sos principalmente hoy?',
    subtitle: () => 'Seleccioná el tipo principal de tu negocio.',
    inputType: 'chips',
    required: true,
    getOptions: () => ['Restaurante', 'Bar', 'Cafetería', 'QSR', 'Food truck', 'Cocina oculta'],
  },
  {
    id: 'S03',
    order: 3,
    title: () => '¿Cómo vendés principalmente?',
    subtitle: () => 'Tu modelo de servicio principal.',
    inputType: 'chips',
    required: true,
    getOptions: () => ['Salón', 'Delivery-first', 'Take away', 'Híbrido'],
  },
  {
    id: 'S04',
    order: 4,
    title: () => '¿En qué franjas competís fuerte?',
    subtitle: () => 'Seleccioná los horarios donde más vendés.',
    inputType: 'chips',
    required: true,
    getOptions: (cc) => COUNTRY_PACKS[cc]?.dayparts || [],
  },
  {
    id: 'S05',
    order: 5,
    title: () => 'Tu capacidad real hoy',
    subtitle: () => 'Sin vueltas: cuánto podés atender.',
    inputType: 'slider',
    required: true,
  },
  {
    id: 'S06',
    order: 6,
    title: () => 'Ventas base',
    subtitle: (cc) => cc ? `Facturación mensual (rango) en ${COUNTRY_PACKS[cc]?.currency || 'moneda local'} + ticket medio + transacciones/día.` : 'Ubicamos tu negocio económicamente.',
    inputType: 'slider',
    required: true,
  },
  {
    id: 'S07',
    order: 7,
    title: () => 'Mix de canales',
    subtitle: () => 'Repartí 100% de tu venta por canal.',
    inputType: 'mix100',
    required: true,
  },
  {
    id: 'S08',
    order: 8,
    title: () => 'Plataformas',
    subtitle: () => 'Seleccioná las plataformas que usás.',
    inputType: 'chips',
    required: false,
    getOptions: (cc) => [...(COUNTRY_PACKS[cc]?.platforms.delivery || []), ...(COUNTRY_PACKS[cc]?.platforms.reservations || [])],
  },
  {
    id: 'S09',
    order: 9,
    title: () => 'Menú - método',
    subtitle: () => 'Elegí la forma más rápida de cargar tu menú.',
    inputType: 'chips',
    required: true,
    getOptions: () => ['Foto', 'PDF', 'URL', 'Manual'],
  },
  {
    id: 'S10',
    order: 10,
    title: () => 'Menú - mínimo viable',
    subtitle: () => 'Cargá mínimo: 12 items con precio (o 8 estrella).',
    inputType: 'menu',
    required: true,
  },
  {
    id: 'S11',
    order: 11,
    title: () => 'Tamaño/gramaje',
    subtitle: () => 'Marcá tamaños en items clave para comparar justo.',
    inputType: 'chips',
    required: false,
  },
  {
    id: 'S12',
    order: 12,
    title: () => '¿Cambiás precios según canal?',
    subtitle: () => 'Apps vs salón: ¿mismo precio o diferente?',
    inputType: 'toggle',
    required: true,
  },
  {
    id: 'S13',
    order: 13,
    title: () => 'Costos clave',
    subtitle: () => 'Con rangos alcanza: food cost, fijos, comisiones.',
    inputType: 'slider',
    required: true,
  },
  {
    id: 'S14',
    order: 14,
    title: () => 'Tiempos reales',
    subtitle: () => 'Tiempo de preparación y/o duración según tu modelo.',
    inputType: 'slider',
    required: true,
  },
  {
    id: 'S15',
    order: 15,
    title: () => 'Reputación pública',
    subtitle: () => 'Conectamos tu ficha pública (Google) para reseñas reales.',
    inputType: 'search',
    required: false,
  },
  {
    id: 'S16',
    order: 16,
    title: () => 'Competencia directa',
    subtitle: () => 'Elegí 5-12 competidores reales en tu radio.',
    inputType: 'search',
    required: true,
  },
  {
    id: 'S17',
    order: 17,
    title: () => 'Verificación de precios',
    subtitle: () => 'Verificamos precios públicos de competidores.',
    inputType: 'preview',
    required: false,
  },
  {
    id: 'S18',
    order: 18,
    title: () => 'Mapa de oportunidades',
    subtitle: () => 'Antes de entrar: top 3 oportunidades y riesgos (con fuente).',
    inputType: 'preview',
    required: false,
  },
  {
    id: 'S19',
    order: 19,
    title: () => 'Final PMO',
    subtitle: () => 'Chequear PMO: lo faltante bloquea.',
    inputType: 'preview',
    required: true,
  },
  {
    id: 'S20',
    order: 20,
    title: (cc) => cc ? getLocalCopy(cc, 'brain_active') : '¡Listo!',
    subtitle: () => 'Tu Brain está activo. Entrás a un dashboard armado para vos.',
    inputType: 'cta',
    required: true,
  },
  // Pasos adicionales por país
  {
    id: 'US_TAX',
    order: 5.5, // Entre capacity y sales
    title: () => 'Sales Tax & Tips',
    subtitle: () => 'Required for US: sales tax rate and tipping structure.',
    inputType: 'slider',
    required: true,
    condition: (data) => data.countryCode === 'US',
  },
  {
    id: 'BR_SERVICE',
    order: 5.5,
    title: () => 'Taxa de serviço',
    subtitle: () => 'Configure a taxa de serviço (gorjeta) padrão.',
    inputType: 'slider',
    required: true,
    condition: (data) => data.countryCode === 'BR',
  },
];

// Helper para obtener pasos ordenados y filtrados
export const getOrderedSteps = (countryCode: CountryCode, data: Partial<SetupData>): SetupStep[] => {
  const fullData = { ...getDefaultSetupData(countryCode), ...data } as SetupData;
  return SETUP_STEPS
    .filter(step => !step.condition || step.condition(fullData))
    .sort((a, b) => a.order - b.order);
};

// Datos por defecto
export const getDefaultSetupData = (countryCode: CountryCode): Partial<SetupData> => ({
  countryCode,
  started: false,
  address: '',
  city: '',
  competitiveRadius: 2,
  primaryType: '',
  serviceModel: '',
  activeDayparts: [],
  channelMix: { dineIn: 60, delivery: 30, takeaway: 10 },
  deliveryPlatforms: [],
  reservationPlatforms: [],
  menuMethod: 'manual',
  menuItems: [],
  hasDifferentPricesByChannel: false,
  competitors: [],
  monthlyRevenueMin: 0,
  monthlyRevenueMax: 0,
  avgTicketMin: 0,
  avgTicketMax: 0,
  dailyTransactionsMin: 0,
  dailyTransactionsMax: 0,
  foodCostPercentMin: 25,
  foodCostPercentMax: 35,
  fixedCostsMin: 0,
  fixedCostsMax: 0,
  avgPrepTimeMinutes: 15,
});

// Copys localizados
function getLocalCopy(cc: CountryCode, key: string): string {
  const pack = COUNTRY_PACKS[cc];
  const isPortuguese = pack.locale.startsWith('pt');
  const isEnglish = pack.locale.startsWith('en');
  
  const copies: Record<string, { es: string; pt: string; en: string }> = {
    welcome_title: {
      es: '¡Bienvenido!',
      pt: 'Bem-vindo!',
      en: 'Welcome!',
    },
    brain_active: {
      es: 'Brain activo',
      pt: 'Brain ativo',
      en: 'Brain active',
    },
  };
  
  const copy = copies[key];
  if (!copy) return key;
  
  if (isPortuguese) return copy.pt;
  if (isEnglish) return copy.en;
  return copy.es;
}

// Validación PMO
export const validatePMO = (data: Partial<SetupData>): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  // Identity
  if (!data.address || !data.city || !data.countryCode) {
    missing.push('Identidad (nombre, dirección, ciudad, país)');
  }
  
  // Model
  if (!data.primaryType || !data.serviceModel) {
    missing.push('Modelo (tipo principal + modelo de servicio)');
  }
  
  // Sales
  if (!data.monthlyRevenueMin || !data.avgTicketMin || !data.dailyTransactionsMin) {
    missing.push('Ventas (facturación, ticket, transacciones)');
  }
  
  // Menu
  const starItems = data.menuItems?.filter(i => i.isStarItem)?.length || 0;
  const totalItems = data.menuItems?.length || 0;
  if (totalItems < 12 && starItems < 8) {
    missing.push('Menú (mínimo 12 items o 8 estrella)');
  }
  
  // Costs
  if (!data.foodCostPercentMin) {
    missing.push('Costos (food cost % + fijos)');
  }
  
  // Competition
  if (!data.competitors || data.competitors.length < 5) {
    missing.push('Competencia (5-12 competidores)');
  }
  
  return { valid: missing.length === 0, missing };
};
