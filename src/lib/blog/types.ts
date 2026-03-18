// Blog Factory Types

export interface BlogPost {
  id: string;
  topic_id: string | null;
  plan_id: string | null;
  status: 'draft' | 'published' | 'archived';
  publish_at: string | null;
  country_code: string;
  sector: string | null;
  category: string | null;
  pillar: string | null;
  tags: string[];
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[];
  intent: 'informational' | 'comparative' | 'soft-transactional' | 'navigational';
  required_subtopics: string[];
  unique_angle: string | null;
  hero_image_url: string | null;
  image_alt_text: string | null;
  internal_links: InternalLink[];
  external_sources: ExternalSource[];
  schema_jsonld: Record<string, unknown>;
  reading_time_min: number;
  author_name: string;
  author_bio: string | null;
  author_url: string | null;
  quality_gate_report: QualityGateReport;
  created_at: string;
  updated_at: string;
}

export interface BlogTopic {
  id: string;
  title_base: string;
  slug: string;
  pillar: string;
  category: string | null;
  country_codes: string[];
  sector: string | null;
  intent: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  required_subtopics: string[];
  unique_angle_options: string[];
  seasonality: string | null;
  priority_score: number;
  generated_filler: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPlan {
  id: string;
  topic_id: string | null;
  planned_date: string;
  country_code: string;
  pillar: string;
  status: 'planned' | 'published' | 'skipped' | 'replaced';
  publish_attempts: number;
  last_attempt_at: string | null;
  skip_reason: string | null;
  created_at: string;
  updated_at: string;
  topic?: BlogTopic;
}

export interface BlogRun {
  id: string;
  run_at: string;
  chosen_topic_id: string | null;
  chosen_plan_id: string | null;
  result: 'published' | 'skipped' | 'failed';
  skip_reason: string | null;
  notes: string | null;
  quality_gate_report: QualityGateReport;
  post_id: string | null;
  created_at: string;
}

export interface BlogConfig {
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InternalLink {
  url: string;
  anchor: string;
  context?: string;
}

export interface ExternalSource {
  url: string;
  title: string;
  domain?: string;
}

export interface QualityGateReport {
  passed: boolean;
  score?: number;
  checks?: {
    anti_cannibalization?: boolean;
    unique_value?: boolean;
    intent_coherence?: boolean;
    editorial_review?: boolean;
    [key: string]: boolean | undefined;
  };
  issues?: string[];
  timestamp?: string;
  rewrite_attempts?: number;
  opportunity?: {
    score?: number;
    status?: string;
    reason?: string;
    demand_potential?: number;
    brand_fit?: number;
    ctr_potential?: number;
    ranking_potential?: number;
    engagement_potential?: number;
    conversion_assist?: number;
    cluster_power?: number;
    differentiation?: number;
    freshness_potential?: number;
    cannibalization_risk?: number;
  };
  editorial_brief?: {
    keyword_principal?: string;
    keywords_secundarias?: string[];
    entidades_semanticas_clave?: string[];
    intencion_principal?: string;
    intenciones_secundarias?: string[];
    perfil_lector?: string;
    problema_concreto?: string;
    promesa_exacta?: string;
    angulo_diferencial?: string;
    estructura_ideal?: string[];
    nivel_profundidad?: string;
    tipo_de_pieza?: string;
    cta_ideal?: string;
    enlaces_a_empujar?: string[];
    enlaces_a_recibir?: string[];
    oportunidades?: Record<string, boolean | string>;
  };
  headline_lab?: {
    winner?: string;
    winner_reason?: string;
    meta_description?: string;
    seo_titles?: string[];
    emotional_titles?: string[];
    specific_titles?: string[];
    curiosity_titles?: string[];
    business_titles?: string[];
    pain_titles?: string[];
    discarded_titles?: string[];
  };
  hypotheses?: {
    ctr?: string;
    ranking?: string;
    engagement?: string;
    next_action?: string;
  };
  explainability?: {
    why_topic_chosen?: string;
    why_rejected?: string | null;
    expected_to_measure?: string[];
    gate_focus?: string[];
  };
  [key: string]: unknown;
}

export const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA y Tecnología', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  tendencias: { label: 'Tendencias y Oportunidades', emoji: '📈' },
} as const;

export type PillarKey = keyof typeof PILLARS;

// Extended 12 clusters for blog categorization (maps to Astro blog)
export const BLOG_CLUSTERS = {
  'empleo-habilidades': { label: 'Empleo y Habilidades', emoji: '💼', pillar: 'empleo' },
  'ia-para-pymes': { label: 'IA para PyMEs', emoji: '🤖', pillar: 'ia_aplicada' },
  'servicios-profesionales-rentabilidad': { label: 'Servicios Profesionales', emoji: '📋', pillar: 'servicios' },
  'marketing-crecimiento': { label: 'Marketing y Crecimiento', emoji: '📈', pillar: 'tendencias' },
  'finanzas-cashflow': { label: 'Finanzas y Cashflow', emoji: '💰', pillar: 'servicios' },
  'operaciones-procesos': { label: 'Operaciones y Procesos', emoji: '⚙️', pillar: 'ia_aplicada' },
  'ventas-negociacion': { label: 'Ventas y Negociación', emoji: '🤝', pillar: 'servicios' },
  'liderazgo-management': { label: 'Liderazgo y Management', emoji: '🎯', pillar: 'liderazgo' },
  'estrategia-latam': { label: 'Estrategia LATAM', emoji: '🌎', pillar: 'emprender' },
  'herramientas-productividad': { label: 'Herramientas y Productividad', emoji: '🛠️', pillar: 'ia_aplicada' },
  'data-analytics': { label: 'Data y Analytics', emoji: '📊', pillar: 'ia_aplicada' },
  'tendencias-ia-tech': { label: 'Tendencias IA y Tech', emoji: '🚀', pillar: 'tendencias' },
} as const;

export type BlogClusterKey = keyof typeof BLOG_CLUSTERS;
