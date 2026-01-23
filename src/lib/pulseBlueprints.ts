// Pulse Blueprint Types and Utilities
// These match the pulse_blueprints table structure

export interface PulseBlueprint {
  id: string;
  business_type: string;
  sector: string;
  selling_model_base: string;
  pregunta_principal_base: string;
  proxy_base: string | null;
  numeric_prompt_base: string | null;
  shift_mode_base: 'none' | 'optional' | 'required';
  labels_1_5: Record<string, string>;
  eventos_good_base: string[] | null;
  eventos_bad_base: string[] | null;
  adaptacion_por_brain: string | null;
  recommended_frequency: string;
  is_active: boolean;
}

export interface PulseCheckinData {
  applies_to_date: string;
  granularity: 'daily' | 'weekly' | 'monthly' | 'shift';
  shift_tag?: string | null;
  source: 'mercado_pago' | 'manual_numeric' | 'manual_qualitative' | 'mixed';
  revenue_local?: number | null;
  currency_local?: string;
  pulse_score_1_5: number;
  pulse_label: string;
  volume_proxy_type?: string | null;
  volume_proxy_value?: number | null;
  notes_good?: string | null;
  notes_bad?: string | null;
}

// Shift tags based on time
export const getAutoShiftTag = (): string | null => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 20) return 'afternoon';
  if (hour >= 20 || hour < 6) return 'night';
  return null;
};

export const SHIFT_LABELS: Record<string, { label: string; emoji: string }> = {
  morning: { label: 'Mañana', emoji: '☀️' },
  lunch: { label: 'Mediodía', emoji: '🍽️' },
  afternoon: { label: 'Tarde', emoji: '🌅' },
  night: { label: 'Noche', emoji: '🌙' },
};

// Default blueprint for fallback
export const DEFAULT_BLUEPRINT: Partial<PulseBlueprint> = {
  pregunta_principal_base: '¿Cómo estuvo el día hoy?',
  proxy_base: null,
  numeric_prompt_base: 'Ingresos del día (opcional)',
  shift_mode_base: 'optional',
  labels_1_5: {
    '1': 'muy flojo',
    '2': 'flojo',
    '3': 'normal',
    '4': 'bien',
    '5': 'excelente',
  },
  eventos_good_base: ['logro destacado'],
  eventos_bad_base: ['problema/incidente'],
};

// Pulse score colors
export const getPulseScoreColor = (score: number): string => {
  switch (score) {
    case 1: return 'text-destructive';
    case 2: return 'text-orange-500';
    case 3: return 'text-yellow-500';
    case 4: return 'text-success';
    case 5: return 'text-primary';
    default: return 'text-muted-foreground';
  }
};

export const getPulseScoreEmoji = (score: number): string => {
  switch (score) {
    case 1: return '😰';
    case 2: return '😐';
    case 3: return '👍';
    case 4: return '🔥';
    case 5: return '🚀';
    default: return '📊';
  }
};
