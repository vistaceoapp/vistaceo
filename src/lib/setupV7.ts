// Setup Wizard v7.0 - Definitive Configuration
// Zero-bug architecture with strict type safety

import { CountryCode, COUNTRY_PACKS } from './countryPacks';

export const SETUP_VERSION = '7.0';

// Step definitions
export interface SetupStepV7 {
  id: string;
  order: number;
  title: Record<string, string>;
  subtitle: Record<string, string>;
  section: 'welcome' | 'identity' | 'profile' | 'questionnaire' | 'integrations' | 'finish';
  required: boolean;
  fastTrack: boolean;
}

export const SETUP_STEPS_V7: SetupStepV7[] = [
  {
    id: 'country',
    order: 0,
    title: { es: 'País', 'pt-BR': 'País' },
    subtitle: { es: 'Dónde operás', 'pt-BR': 'Onde você opera' },
    section: 'welcome',
    required: true,
    fastTrack: true,
  },
  {
    id: 'sector',
    order: 1,
    title: { es: 'Sector', 'pt-BR': 'Setor' },
    subtitle: { es: 'Tu industria', 'pt-BR': 'Sua indústria' },
    section: 'identity',
    required: true,
    fastTrack: true,
  },
  {
    id: 'type',
    order: 2,
    title: { es: 'Tipo de Negocio', 'pt-BR': 'Tipo de Negócio' },
    subtitle: { es: 'Qué hacés', 'pt-BR': 'O que você faz' },
    section: 'identity',
    required: true,
    fastTrack: true,
  },
  {
    id: 'name',
    order: 3,
    title: { es: 'Nombre del Negocio', 'pt-BR': 'Nome do Negócio' },
    subtitle: { es: 'Cómo te llaman tus clientes', 'pt-BR': 'Como seus clientes te chamam' },
    section: 'identity',
    required: true,
    fastTrack: true,
  },
  {
    id: 'mode',
    order: 4,
    title: { es: 'Modo de Setup', 'pt-BR': 'Modo de Setup' },
    subtitle: { es: 'Elige tu camino', 'pt-BR': 'Escolha seu caminho' },
    section: 'profile',
    required: true,
    fastTrack: true,
  },
  {
    id: 'google',
    order: 5,
    title: { es: 'Google Business', 'pt-BR': 'Google Business' },
    subtitle: { es: 'Conectar tu perfil público', 'pt-BR': 'Conectar seu perfil público' },
    section: 'profile',
    required: false,
    fastTrack: true,
  },
  {
    id: 'questionnaire',
    order: 6,
    title: { es: 'Cuestionario', 'pt-BR': 'Questionário' },
    subtitle: { es: 'Conocer tu negocio', 'pt-BR': 'Conhecer seu negócio' },
    section: 'questionnaire',
    required: true,
    fastTrack: true,
  },
  {
    id: 'integrations',
    order: 7,
    title: { es: 'Integraciones', 'pt-BR': 'Integrações' },
    subtitle: { es: 'Conectar tus herramientas', 'pt-BR': 'Conectar suas ferramentas' },
    section: 'integrations',
    required: false,
    fastTrack: true,
  },
  {
    id: 'create',
    order: 8,
    title: { es: 'Crear Negocio', 'pt-BR': 'Criar Negócio' },
    subtitle: { es: 'Activar tu Brain', 'pt-BR': 'Ativar seu Brain' },
    section: 'finish',
    required: true,
    fastTrack: true,
  },
];

// Setup data structure (values only, no labels)
export interface SetupDataV7 {
  // Identity
  countryCode: CountryCode;
  areaId: string;
  businessTypeId: string;
  businessName: string;
  
  // Mode
  setupMode: 'quick' | 'complete';
  
  // Google
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleLat?: number;
  googleLng?: number;
  googleAddress?: string;
  
  // Questionnaire answers (by question ID)
  answers: Record<string, any>;
  
  // Integrations profiled (Free mode)
  integrationsProfiled: {
    payments: string[];
    reviews: string[];
    social: string[];
    other: string[];
  };
  
  // Computed
  precisionScore: number;
  estimatedHealthScore: number;
}

export const getDefaultSetupDataV7 = (countryCode: CountryCode = 'AR'): SetupDataV7 => ({
  countryCode,
  areaId: '',
  businessTypeId: '',
  businessName: '',
  setupMode: 'complete',
  answers: {},
  integrationsProfiled: {
    payments: [],
    reviews: [],
    social: [],
    other: [],
  },
  precisionScore: 0,
  estimatedHealthScore: 50,
});

// Get step text based on language
export const getStepText = (step: SetupStepV7, countryCode: CountryCode): { title: string; subtitle: string } => {
  const lang = COUNTRY_PACKS[countryCode]?.locale?.startsWith('pt') ? 'pt-BR' : 'es';
  return {
    title: step.title[lang] || step.title.es,
    subtitle: step.subtitle[lang] || step.subtitle.es,
  };
};

// Get active steps based on mode
export const getActiveSteps = (mode: 'quick' | 'complete'): SetupStepV7[] => {
  return SETUP_STEPS_V7.filter(step => mode === 'complete' || step.fastTrack);
};

// Calculate precision score based on filled data
export const calculatePrecisionV7 = (data: SetupDataV7): number => {
  let score = 0;
  const weights = {
    identity: 25,
    google: 15,
    answers: 40,
    integrations: 20,
  };
  
  // Identity (25 points)
  if (data.countryCode) score += 5;
  if (data.areaId) score += 5;
  if (data.businessTypeId) score += 10;
  if (data.businessName && data.businessName.length >= 2) score += 5;
  
  // Google (15 points)
  if (data.googlePlaceId) score += 15;
  
  // Answers (40 points based on % answered)
  const answeredCount = Object.keys(data.answers).filter(k => data.answers[k] !== undefined && data.answers[k] !== null && data.answers[k] !== '').length;
  const expectedQuestions = data.setupMode === 'complete' ? 20 : 8;
  score += Math.min(40, Math.round((answeredCount / expectedQuestions) * 40));
  
  // Integrations profiled (20 points)
  const integrationsCount = 
    data.integrationsProfiled.payments.length +
    data.integrationsProfiled.reviews.length +
    data.integrationsProfiled.social.length +
    data.integrationsProfiled.other.length;
  score += Math.min(20, integrationsCount * 4);
  
  return Math.min(100, score);
};

// Platform integrations by country
export const getIntegrationsByCountry = (countryCode: CountryCode) => {
  const pack = COUNTRY_PACKS[countryCode];
  
  return {
    payments: pack?.platforms?.delivery || ['Mercado Pago', 'PayPal'],
    reviews: ['Google', 'TripAdvisor', 'Yelp'],
    social: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok'],
    other: pack?.platforms?.reservations || [],
  };
};

// Questionnaire categories
export const QUESTIONNAIRE_CATEGORIES = [
  { id: 'operations', label: { es: 'Operaciones', 'pt-BR': 'Operações' }, icon: 'Settings' },
  { id: 'sales', label: { es: 'Ventas', 'pt-BR': 'Vendas' }, icon: 'TrendingUp' },
  { id: 'marketing', label: { es: 'Marketing', 'pt-BR': 'Marketing' }, icon: 'Megaphone' },
  { id: 'finance', label: { es: 'Finanzas', 'pt-BR': 'Finanças' }, icon: 'DollarSign' },
  { id: 'team', label: { es: 'Equipo', 'pt-BR': 'Equipe' }, icon: 'Users' },
];
