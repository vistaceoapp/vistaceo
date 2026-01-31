// ============================================
// MOTOR DE PREDICCIONES PLANETARIO - TIPOS
// ============================================

// Anillos de horizonte
export type HorizonRing = 'H0' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7';

export const HORIZON_RINGS: Record<HorizonRing, { label: string; days: number; type: 'tactical' | 'strategic' | 'long_term' }> = {
  H0: { label: '30 días', days: 30, type: 'tactical' },
  H1: { label: '90 días', days: 90, type: 'tactical' },
  H2: { label: '6 meses', days: 180, type: 'tactical' },
  H3: { label: '12 meses', days: 365, type: 'strategic' },
  H4: { label: '3 años', days: 1095, type: 'strategic' },
  H5: { label: '5 años', days: 1825, type: 'long_term' },
  H6: { label: '7 años', days: 2555, type: 'long_term' },
  H7: { label: '10 años', days: 3650, type: 'long_term' },
};

// Dominios de predicción
export type PredictionDomain = 
  | 'cashflow' 
  | 'demand' 
  | 'operations' 
  | 'customer' 
  | 'competition' 
  | 'risk' 
  | 'strategy' 
  | 'pricing' 
  | 'inventory' 
  | 'sales' 
  | 'marketing' 
  | 'team' 
  | 'tech';

export const PREDICTION_DOMAINS: Record<PredictionDomain, { label: string; icon: string; color: string }> = {
  cashflow: { label: 'Caja', icon: 'Wallet', color: 'hsl(var(--success))' },
  demand: { label: 'Demanda', icon: 'TrendingUp', color: 'hsl(var(--primary))' },
  operations: { label: 'Operaciones', icon: 'Settings', color: 'hsl(var(--warning))' },
  customer: { label: 'Cliente', icon: 'Users', color: 'hsl(var(--info))' },
  competition: { label: 'Competencia', icon: 'Target', color: 'hsl(var(--destructive))' },
  risk: { label: 'Riesgo', icon: 'AlertTriangle', color: 'hsl(var(--destructive))' },
  strategy: { label: 'Estrategia', icon: 'Compass', color: 'hsl(var(--primary))' },
  pricing: { label: 'Precios', icon: 'DollarSign', color: 'hsl(var(--success))' },
  inventory: { label: 'Inventario', icon: 'Package', color: 'hsl(var(--warning))' },
  sales: { label: 'Ventas', icon: 'ShoppingCart', color: 'hsl(var(--success))' },
  marketing: { label: 'Marketing', icon: 'Megaphone', color: 'hsl(var(--primary))' },
  team: { label: 'Equipo', icon: 'Users2', color: 'hsl(var(--info))' },
  tech: { label: 'Tecnología', icon: 'Cpu', color: 'hsl(var(--muted))' },
};

// Nivel de publicación (gates anti-invento)
export type PublicationLevel = 'A' | 'B' | 'C';

export const PUBLICATION_LEVELS: Record<PublicationLevel, { label: string; description: string }> = {
  A: { label: 'Confirmada', description: 'Evidencia sólida, alta confianza' },
  B: { label: 'Probable', description: 'Evidencia parcial, drivers fuertes' },
  C: { label: 'En Bruma', description: 'Exploratoria, falta calibración' },
};

// Señal de referencia
export interface SignalRef {
  signal_id: string;
  name: string;
  source: 'internal' | 'ops' | 'external';
  trend: 'up' | 'down' | 'stable' | 'volatile';
  latest_value: number | string;
  unit: 'USD' | 'PERCENT' | 'COUNT' | 'DAYS' | 'TEXT';
  why_it_matters: string;
  threshold_note?: string;
}

// Banda de incertidumbre
export interface UncertaintyBand {
  metric: 'revenue' | 'cash' | 'margin' | 'conversion' | 'churn' | 'capacity' | 'sla' | 'inventory' | 'other';
  unit: 'USD' | 'LOCAL' | 'PERCENT' | 'COUNT' | 'DAYS';
  low: number;
  base: number;
  high: number;
}

// Ventana temporal
export interface TimeWindow {
  start: string; // ISO date
  end: string;
  action_window?: {
    start: string;
    end: string;
  };
}

// Impacto estimado
export interface EstimatedImpact {
  primary_metric: {
    name: string;
    unit: 'USD' | 'PERCENT' | 'COUNT' | 'DAYS';
    value: number;
    range: [number, number];
  };
  secondary_metrics?: Array<{
    name: string;
    unit: string;
    value: number;
  }>;
}

// Evidencia
export interface Evidence {
  evidence_strength: 'low' | 'medium' | 'high';
  signals_internal_top: SignalRef[];
  signals_external_top: SignalRef[];
  assumptions: string[];
  data_gaps: string[];
}

// Cadena causal
export interface CausalChain {
  nodes: string[];
  edges: Array<{
    from: string;
    to: string;
    sign: '+' | '-';
    lag: HorizonRing;
    strength: number; // 0-1
  }>;
}

// Acción recomendada
export interface RecommendedAction {
  tier: '48h' | '14d' | '90d';
  action: string;
  why: string;
  kpi: string;
  expected_effect: string;
}

// Acciones disponibles
export interface AvailableActions {
  convert_to_mission?: {
    mission_title: string;
    objective: string;
    steps: string[];
    kpi_targets: string[];
    deadline: string;
  };
  activate_monitoring?: {
    signals: string[];
    thresholds: Array<{ signal: string; value: number }>;
    check_frequency: 'daily' | 'weekly';
    notify_when: ('probability_up' | 'impact_up' | 'window_near')[];
  };
  open_simulation?: {
    sliders: Array<{
      name: string;
      min: number;
      max: number;
      default: number;
      unit: string;
      why: string;
    }>;
    locked_factors: string[];
  };
}

// Payload visual
export interface VisualPayload {
  bubble: {
    x_prob: number; // 0-1
    y_impact: number;
    size: number;
    urgency: number; // 0-1
    glow: number; // 0-1
  };
  timeline: {
    lane: string;
    position_start: string;
    position_end: string;
  };
  sparklines?: Array<{
    signal_id: string;
    points: number[];
  }>;
}

// Predicción completa
export interface Prediction {
  id: string;
  business_id: string;
  brain_id?: string;
  domain: PredictionDomain;
  horizon_ring: HorizonRing;
  title: string;
  summary?: string;
  publication_level: PublicationLevel;
  probability: number; // 0-1
  confidence: number; // 0-1
  uncertainty_band: UncertaintyBand;
  time_window: TimeWindow;
  estimated_impact: EstimatedImpact;
  evidence: Evidence;
  causal_chain: CausalChain;
  is_breakpoint: boolean;
  breakpoint_thresholds?: Array<{ metric: string; value: number; why: string }>;
  recommended_actions: RecommendedAction[];
  available_actions: AvailableActions;
  visual_payload: VisualPayload;
  status: 'active' | 'dismissed' | 'converted' | 'expired' | 'verified';
  converted_to_mission_id?: string;
  dismissed_at?: string;
  verified_at?: string;
  verification_result?: 'occurred' | 'partially_occurred' | 'not_occurred';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

// Evento de calibración
export interface CalibrationEvent {
  id: string;
  business_id: string;
  prediction_id?: string;
  priority: number; // 1-5
  reason: string;
  improves: Array<{
    prediction_id: string;
    delta_confidence: number;
    delta_uncertainty_reduction: number;
  }>;
  input: {
    type: 'tap' | 'slider' | 'minmax' | 'quick_number' | 'select';
    question: string;
    unit?: string;
    options?: Array<{ label: string; value: string | number }>;
    min?: number;
    max?: number;
    default?: number;
  };
  answer?: unknown;
  answered_at?: string;
  delta_confidence?: number;
  delta_uncertainty_reduction?: number;
  status: 'pending' | 'answered' | 'skipped' | 'expired';
  created_at: string;
  updated_at: string;
}

// Blueprint causal
export interface CausalBlueprint {
  id: string;
  business_type: string;
  sector: string;
  display_name: string;
  causal_graph: {
    nodes: Array<{
      id: string;
      label: string;
      type: 'metric' | 'driver' | 'outcome';
    }>;
    edges: Array<{
      from: string;
      to: string;
      sign: '+' | '-';
      strength: number;
      lag_days: number;
    }>;
  };
  native_metrics: Array<{
    id: string;
    label: string;
    unit: string;
    is_required: boolean;
  }>;
  leading_indicators: Array<{
    id: string;
    label: string;
    typical_lag_days: number;
  }>;
  controllable_levers: Array<{
    id: string;
    label: string;
    min: number;
    max: number;
    unit: string;
  }>;
  structural_risks: Array<{
    id: string;
    label: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  seasonality_pattern: {
    type: 'monthly' | 'quarterly' | 'annual';
    peaks: number[]; // month indices
    troughs: number[];
  };
  signature_predictions: Array<{
    id: string;
    title_template: string;
    domain: PredictionDomain;
    typical_horizon: HorizonRing;
  }>;
  typical_shocks: Array<{
    id: string;
    label: string;
    countries: string[];
    probability_base: number;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Configuración del gemelo digital
export interface DigitalTwinConfig {
  id: string;
  business_id: string;
  risk_personality: 'conservative' | 'balanced' | 'aggressive';
  custom_driver_weights: Record<string, number>;
  baseline_metrics: Record<string, number>;
  known_constraints: string[];
  active_assumptions: string[];
  calibration_accuracy: Record<HorizonRing, number>;
  drift_status: 'stable' | 'drifting' | 'regime_change';
  last_drift_check?: string;
  created_at: string;
  updated_at: string;
}

// Modelo UI para la esfera planetaria
export interface PredictionUIModel {
  sphere_state: {
    clarity: number; // 0-1
    pulse_state: 'calm' | 'active' | 'urgent';
    halo_reliability: number; // 0-1
    fog_level: number; // 0-1
    focus_target?: string;
  };
  rings: Array<{
    ring_id: HorizonRing;
    ring_confidence: number;
    ring_density: number;
    ring_label: string;
    event_objects: Prediction[];
  }>;
  constellations: Record<PredictionDomain, {
    active: boolean;
    count: number;
    avg_probability: number;
  }>;
  bubble_map: Array<{
    prediction_id: string;
    x: number;
    y: number;
    size: number;
    color: string;
  }>;
  timeline: Array<{
    prediction_id: string;
    domain: PredictionDomain;
    start: string;
    end: string;
    action_window_start?: string;
    action_window_end?: string;
  }>;
  quality_dashboard: {
    accuracy_event_rate: number;
    mean_absolute_error_by_horizon: Record<HorizonRing, number>;
    calibration_buckets: Record<string, number>; // '10%', '30%', etc.
    coverage_by_domain: Record<PredictionDomain, number>;
    sharpness: number;
    drift_status: 'stable' | 'drifting' | 'regime_change';
  };
}

// Response del motor de predicciones
export interface PredictionEngineResponse {
  meta: {
    business_id: string;
    generated_at: string;
    model_version: string;
    processing_time_ms: number;
  };
  ui_model: PredictionUIModel;
  predictions_feed: Prediction[];
  calibration_events: CalibrationEvent[];
  quality_dashboard: PredictionUIModel['quality_dashboard'];
  notes_for_system?: Record<string, unknown>;
}
