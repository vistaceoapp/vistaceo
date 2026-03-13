/**
 * Category-specific visual treatments for blog posts without hero images.
 * Ensures visual variety across the blog - no two categories look the same.
 */

export interface CategoryVisual {
  gradient: string;
  pattern: string;
  emoji: string;
}

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'empleo-habilidades': {
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.08))',
    pattern: '◆',
    emoji: '💼',
  },
  'ia-para-pymes': {
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.08))',
    pattern: '⬡',
    emoji: '🤖',
  },
  'servicios-profesionales-rentabilidad': {
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.08))',
    pattern: '◇',
    emoji: '📋',
  },
  'marketing-crecimiento': {
    gradient: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,179,8,0.08))',
    pattern: '△',
    emoji: '📈',
  },
  'finanzas-cashflow': {
    gradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(132,204,22,0.08))',
    pattern: '○',
    emoji: '💰',
  },
  'operaciones-procesos': {
    gradient: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(148,163,184,0.08))',
    pattern: '□',
    emoji: '⚙️',
  },
  'ventas-negociacion': {
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(236,72,153,0.08))',
    pattern: '▽',
    emoji: '🤝',
  },
  'liderazgo-management': {
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.08))',
    pattern: '◈',
    emoji: '🎯',
  },
  'estrategia-latam': {
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(59,130,246,0.08))',
    pattern: '⬢',
    emoji: '🌎',
  },
  'herramientas-productividad': {
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
    pattern: '⊞',
    emoji: '🛠️',
  },
  'data-analytics': {
    gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(16,185,129,0.08))',
    pattern: '◉',
    emoji: '📊',
  },
  'tendencias-ia-tech': {
    gradient: 'linear-gradient(135deg, rgba(217,70,239,0.15), rgba(236,72,153,0.08))',
    pattern: '✦',
    emoji: '🚀',
  },
};

const DEFAULT_VISUAL: CategoryVisual = {
  gradient: 'linear-gradient(135deg, rgba(38,146,220,0.12), rgba(116,108,230,0.06))',
  pattern: '◆',
  emoji: '📝',
};

export function getCategoryVisual(category: string | null | undefined): CategoryVisual {
  if (!category) return DEFAULT_VISUAL;
  return CATEGORY_VISUALS[category] || DEFAULT_VISUAL;
}
