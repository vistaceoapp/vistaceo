// Dashboard Cards Configuration
// Basado en spec v1: 12 cards core + 3 por país

import { CountryCode } from './countryPacks';

export type CardState = 'active' | 'estimated' | 'blocked';

export interface DashboardCard {
  id: string;
  title: string;
  description: string;
  source: string[];
  requiredData: string[];
  stateWhenMissing: CardState;
  category: 'market' | 'pricing' | 'economics' | 'operations' | 'reputation' | 'radar';
  // Extra cards por país
  countrySpecific?: CountryCode[];
}

// Las 12 cards core
export const CORE_DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: 'market_position',
    title: 'Tu posición vs competidores',
    description: '% mejor/peor en rating y volumen reseñas',
    source: ['Google', 'Yelp', 'Tripadvisor'],
    requiredData: ['competitors', 'googleListing'],
    stateWhenMissing: 'blocked',
    category: 'market',
  },
  {
    id: 'price_vs_competition',
    title: 'Precio promedio vs competencia',
    description: '% arriba/abajo por canasta comparable',
    source: ['Menú', 'Verificación pública'],
    requiredData: ['menu', 'competitors'],
    stateWhenMissing: 'estimated',
    category: 'pricing',
  },
  {
    id: 'top_profit_items',
    title: 'Top 5 platos que te financian',
    description: 'Contribution proxy + demanda estimada',
    source: ['Menú', 'Ventas declaradas/integradas'],
    requiredData: ['menu', 'sales'],
    stateWhenMissing: 'estimated',
    category: 'economics',
  },
  {
    id: 'commission_impact',
    title: 'Impacto de comisiones',
    description: '% ventas en apps + costo en moneda',
    source: ['Mix canales', 'Fees'],
    requiredData: ['channelMix', 'appFees'],
    stateWhenMissing: 'blocked',
    category: 'economics',
  },
  {
    id: 'capacity_saturation',
    title: 'Capacidad saturación',
    description: '% saturación en pico (daypart)',
    source: ['Setup', 'Check-in'],
    requiredData: ['capacity', 'times'],
    stateWhenMissing: 'blocked',
    category: 'operations',
  },
  {
    id: 'time_vs_benchmark',
    title: 'Tiempo vs benchmark',
    description: 'Tiempo prep/servicio vs similares',
    source: ['Declarado', 'Comparables'],
    requiredData: ['prepTime'],
    stateWhenMissing: 'estimated',
    category: 'operations',
  },
  {
    id: 'reputation_trend',
    title: 'Reputación: trend 90 días',
    description: 'Cambio en rating y temas',
    source: ['Google', 'Yelp'],
    requiredData: ['googleListing'],
    stateWhenMissing: 'blocked',
    category: 'reputation',
  },
  {
    id: 'ticket_vs_target',
    title: 'Ticket medio vs objetivo',
    description: 'Ticket actual vs target sugerido',
    source: ['Declarado', 'Integraciones'],
    requiredData: ['sales'],
    stateWhenMissing: 'estimated',
    category: 'economics',
  },
  {
    id: 'waste_loss',
    title: 'Pérdida por merma (estimada)',
    description: '$ perdidos/mes (rango)',
    source: ['Declarado'],
    requiredData: ['costs'],
    stateWhenMissing: 'estimated',
    category: 'economics',
  },
  {
    id: 'opportunity_1',
    title: 'Oportunidad #1 (Radar)',
    description: '$ impacto mensual estimado',
    source: ['Motor Radar', 'Audit'],
    requiredData: ['sales', 'costs'],
    stateWhenMissing: 'blocked',
    category: 'radar',
  },
  {
    id: 'risk_1',
    title: 'Riesgo #1 (Radar)',
    description: '$ riesgo mensual estimado',
    source: ['Motor Radar', 'Audit'],
    requiredData: ['coverage'],
    stateWhenMissing: 'blocked',
    category: 'radar',
  },
  {
    id: 'suggested_missions',
    title: 'Misiones sugeridas',
    description: 'Acciones concretas + ROI esperado',
    source: ['Missions engine'],
    requiredData: [], // Siempre activa
    stateWhenMissing: 'active',
    category: 'radar',
  },
];

// Cards extra por país
export const COUNTRY_EXTRA_CARDS: DashboardCard[] = [
  // Argentina
  {
    id: 'ar_ticket_risk',
    title: 'Riesgo de desactualización de ticket',
    description: 'Brecha de precios por franja (inflación)',
    source: ['Señales de mercado'],
    requiredData: ['sales'],
    stateWhenMissing: 'estimated',
    category: 'pricing',
    countrySpecific: ['AR'],
  },
  {
    id: 'ar_price_gap',
    title: 'Brecha de precios (señal)',
    description: 'Diferencia vs mercado local',
    source: ['Menú', 'Comparables'],
    requiredData: ['menu', 'competitors'],
    stateWhenMissing: 'estimated',
    category: 'pricing',
    countrySpecific: ['AR'],
  },
  {
    id: 'ar_elasticity',
    title: 'Elasticidad sugerida',
    description: 'Cuánto podrías ajustar precios',
    source: ['Menú', 'Histórico'],
    requiredData: ['menu'],
    stateWhenMissing: 'blocked',
    category: 'pricing',
    countrySpecific: ['AR'],
  },
  // México
  {
    id: 'mx_zone_demand',
    title: 'Mapa de demanda por zona',
    description: 'Impacto de listing por ubicación',
    source: ['Google'],
    requiredData: ['googleListing'],
    stateWhenMissing: 'blocked',
    category: 'market',
    countrySpecific: ['MX'],
  },
  {
    id: 'mx_didi_uber_fees',
    title: 'Impacto DiDi/Uber por fees',
    description: 'Comparación de comisiones',
    source: ['Plataformas'],
    requiredData: ['channelMix'],
    stateWhenMissing: 'estimated',
    category: 'economics',
    countrySpecific: ['MX'],
  },
  {
    id: 'mx_reservations',
    title: 'Reservas OpenTable/TheFork',
    description: 'Volumen y conversión',
    source: ['Plataformas reservas'],
    requiredData: ['reservationPlatforms'],
    stateWhenMissing: 'blocked',
    category: 'operations',
    countrySpecific: ['MX'],
  },
  // Brasil
  {
    id: 'br_service_fee',
    title: 'Taxa de serviço / gorjeta',
    description: 'Configuración e impacto',
    source: ['Declarado'],
    requiredData: ['serviceFee'],
    stateWhenMissing: 'blocked',
    category: 'economics',
    countrySpecific: ['EC'],
  },
];

// Helper para obtener cards por país
export const getCardsForCountry = (countryCode: CountryCode): DashboardCard[] => {
  const countryCards = COUNTRY_EXTRA_CARDS.filter(
    card => card.countrySpecific?.includes(countryCode)
  );
  return [...CORE_DASHBOARD_CARDS, ...countryCards];
};

// Helper para determinar el estado de una card basado en datos disponibles
export const getCardState = (
  card: DashboardCard,
  availableData: string[]
): { state: CardState; missingData: string[] } => {
  const missingData = card.requiredData.filter(
    req => !availableData.includes(req)
  );
  
  if (missingData.length === 0) {
    return { state: 'active', missingData: [] };
  }
  
  return {
    state: card.stateWhenMissing,
    missingData,
  };
};

// Business Health Score - Sub-scores (7 dimensiones)
export interface HealthSubScore {
  id: string;
  name: string;
  description: string;
  icon: string;
  weight: number;
  source: string[];
  blockingFields: string[];
}

export const HEALTH_SUB_SCORES: HealthSubScore[] = [
  {
    id: 'reputation',
    name: 'Reputación',
    description: 'Cómo te perciben los clientes',
    icon: '⭐',
    weight: 0.25,
    source: ['Google', 'Tripadvisor', 'Yelp', 'Reviews'],
    blockingFields: ['googleListing'],
  },
  {
    id: 'profitability',
    name: 'Rentabilidad',
    description: 'Márgenes y pricing',
    icon: '💰',
    weight: 0.20,
    source: ['Menú', 'Food cost', 'Precios'],
    blockingFields: ['menu', 'foodCost'],
  },
  {
    id: 'finances',
    name: 'Finanzas',
    description: 'Ingresos y costos fijos',
    icon: '📊',
    weight: 0.15,
    source: ['Ventas', 'Declarado', 'Integraciones'],
    blockingFields: ['sales', 'costs'],
  },
  {
    id: 'efficiency',
    name: 'Eficiencia',
    description: 'Operación y tiempos',
    icon: '⚡',
    weight: 0.15,
    source: ['Inventario', 'Tiempos', 'Check-ins'],
    blockingFields: ['capacity'],
  },
  {
    id: 'traffic',
    name: 'Tráfico',
    description: 'Flujo de clientes',
    icon: '👥',
    weight: 0.10,
    source: ['Canales', 'Dayparts', 'Delivery'],
    blockingFields: ['dayparts'],
  },
  {
    id: 'team',
    name: 'Equipo',
    description: 'Staff y capacidad',
    icon: '🧑‍🍳',
    weight: 0.10,
    source: ['Declarado', 'Staff'],
    blockingFields: [],
  },
  {
    id: 'growth',
    name: 'Crecimiento',
    description: 'Oportunidades y tendencias',
    icon: '📈',
    weight: 0.05,
    source: ['Radar', 'Tendencias', 'Mercado'],
    blockingFields: [],
  },
];

export const calculateHealthScore = (
  subScores: Record<string, number | null>
): { score: number; isEstimated: boolean; coverage: number } => {
  let totalWeight = 0;
  let weightedSum = 0;
  let coveredCount = 0;

  HEALTH_SUB_SCORES.forEach(sub => {
    const value = subScores[sub.id];
    if (value !== null && value !== undefined) {
      weightedSum += value * sub.weight;
      totalWeight += sub.weight;
      coveredCount++;
    }
  });

  if (totalWeight === 0) {
    return { score: 0, isEstimated: true, coverage: 0 };
  }

  const score = Math.round(weightedSum / totalWeight);
  const coverage = Math.round((coveredCount / HEALTH_SUB_SCORES.length) * 100);
  
  return {
    score,
    isEstimated: coverage < 100,
    coverage,
  };
};

// Centralized score styling used across Dashboard and Analytics
// bgColor is for light backgrounds, bgColorSolid for stripes/accents
export const getScoreStyle = (score: number | null) => {
  if (score === null) {
    return { 
      label: 'Sin datos', 
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      bgColorSolid: 'bg-muted',
      borderColor: 'border-border',
      ringColor: 'ring-muted'
    };
  }
  if (score >= 75) return { 
    label: score >= 90 ? 'Excelente' : 'Bien', 
    textColor: 'text-success',
    bgColor: 'bg-success/8',
    bgColorSolid: 'bg-success',
    borderColor: 'border-success/30',
    ringColor: 'ring-success/30'
  };
  if (score >= 40) return { 
    label: score >= 60 ? 'Mejorable' : 'En riesgo', 
    textColor: 'text-warning',
    bgColor: 'bg-warning/8',
    bgColorSolid: 'bg-warning',
    borderColor: 'border-warning/30',
    ringColor: 'ring-warning/30'
  };
  return { 
    label: 'Crítico', 
    textColor: 'text-destructive',
    bgColor: 'bg-destructive/8',
    bgColorSolid: 'bg-destructive',
    borderColor: 'border-destructive/30',
    ringColor: 'ring-destructive/30'
  };
};

// Legacy function for backwards compatibility
export const getScoreLabel = (score: number): { label: string; color: string } => {
  const style = getScoreStyle(score);
  return { label: style.label, color: style.textColor };
};
