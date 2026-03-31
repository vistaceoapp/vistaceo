/**
 * VISTACEO Health Score System — Single Source of Truth
 * 
 * 6-tier semantic scale used identically across app and landing.
 * No green for health scores — green is reserved for positive trends only.
 */

export type HealthState = 'veryCritical' | 'critical' | 'regular' | 'good' | 'veryGood' | 'excellent';

export interface HealthStyle {
  state: HealthState;
  label: string;
  /** Tailwind text color class */
  textColor: string;
  /** Tailwind bg with opacity for subtle backgrounds */
  bgColor: string;
  /** Solid bg for stripes/accents */
  bgColorSolid: string;
  /** Border with opacity */
  borderColor: string;
  /** Ring with opacity */
  ringColor: string;
  /** HSL CSS variable reference for SVG strokes */
  strokeHsl: string;
}

/**
 * Maps a score (0-100) to the 6-tier health state.
 * This is the ONLY function that should determine health visual state.
 */
export function getHealthState(score: number): HealthState {
  if (score >= 96) return 'excellent';
  if (score >= 85) return 'veryGood';
  if (score >= 70) return 'good';
  if (score >= 50) return 'regular';
  if (score >= 30) return 'critical';
  return 'veryCritical';
}

/**
 * Maps a score to its full visual style object.
 * Used by all health components in both app and landing.
 */
export function getHealthStyle(score: number | null): HealthStyle {
  if (score === null) {
    return {
      state: 'critical',
      label: 'Sin datos',
      textColor: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      bgColorSolid: 'bg-muted',
      borderColor: 'border-border',
      ringColor: 'ring-muted',
      strokeHsl: 'hsl(var(--muted-foreground))',
    };
  }

  const state = getHealthState(score);

  const styles: Record<HealthState, HealthStyle> = {
    veryCritical: {
      state: 'veryCritical',
      label: 'Muy crítico',
      textColor: 'text-health-veryCritical',
      bgColor: 'bg-health-veryCritical/10',
      bgColorSolid: 'bg-health-veryCritical',
      borderColor: 'border-health-veryCritical/30',
      ringColor: 'ring-health-veryCritical/30',
      strokeHsl: 'hsl(var(--health-very-critical))',
    },
    critical: {
      state: 'critical',
      label: 'Crítico',
      textColor: 'text-health-critical',
      bgColor: 'bg-health-critical/10',
      bgColorSolid: 'bg-health-critical',
      borderColor: 'border-health-critical/30',
      ringColor: 'ring-health-critical/30',
      strokeHsl: 'hsl(var(--health-critical))',
    },
    regular: {
      state: 'regular',
      label: 'Regular',
      textColor: 'text-health-regular',
      bgColor: 'bg-health-regular/10',
      bgColorSolid: 'bg-health-regular',
      borderColor: 'border-health-regular/30',
      ringColor: 'ring-health-regular/30',
      strokeHsl: 'hsl(var(--health-regular))',
    },
    good: {
      state: 'good',
      label: 'Bueno',
      textColor: 'text-health-good',
      bgColor: 'bg-health-good/10',
      bgColorSolid: 'bg-health-good',
      borderColor: 'border-health-good/30',
      ringColor: 'ring-health-good/30',
      strokeHsl: 'hsl(var(--health-good))',
    },
    veryGood: {
      state: 'veryGood',
      label: 'Muy bueno',
      textColor: 'text-health-veryGood',
      bgColor: 'bg-health-veryGood/10',
      bgColorSolid: 'bg-health-veryGood',
      borderColor: 'border-health-veryGood/30',
      ringColor: 'ring-health-veryGood/30',
      strokeHsl: 'hsl(var(--health-very-good))',
    },
    excellent: {
      state: 'excellent',
      label: 'Excelente',
      textColor: 'text-health-excellent',
      bgColor: 'bg-health-excellent/10',
      bgColorSolid: 'bg-health-excellent',
      borderColor: 'border-health-excellent/30',
      ringColor: 'ring-health-excellent/30',
      strokeHsl: 'hsl(var(--health-excellent))',
    },
  };

  return styles[state];
}

/**
 * Legacy-compatible wrapper that returns the same shape as old getScoreStyle.
 */
export function getScoreStyleV2(score: number | null) {
  const style = getHealthStyle(score);
  return {
    label: style.label,
    textColor: style.textColor,
    bgColor: style.bgColor,
    bgColorSolid: style.bgColorSolid,
    borderColor: style.borderColor,
    ringColor: style.ringColor,
  };
}
