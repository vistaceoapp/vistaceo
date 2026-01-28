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
  };
  issues?: string[];
  timestamp?: string;
}

export const PILLARS = {
  empleo: { label: 'Empleo y Carreras', emoji: '💼' },
  ia_aplicada: { label: 'IA Aplicada', emoji: '🤖' },
  liderazgo: { label: 'Liderazgo y Gestión', emoji: '🎯' },
  servicios: { label: 'Servicios Profesionales', emoji: '📋' },
  emprender: { label: 'Emprender', emoji: '🚀' },
  sistema_inteligente: { label: 'Sistema Inteligente', emoji: '🧠' },
} as const;

export const COUNTRIES = {
  AR: { name: 'Argentina', flag: '🇦🇷' },
  CL: { name: 'Chile', flag: '🇨🇱' },
  UY: { name: 'Uruguay', flag: '🇺🇾' },
  CO: { name: 'Colombia', flag: '🇨🇴' },
  EC: { name: 'Ecuador', flag: '🇪🇨' },
  CR: { name: 'Costa Rica', flag: '🇨🇷' },
  MX: { name: 'México', flag: '🇲🇽' },
  PA: { name: 'Panamá', flag: '🇵🇦' },
} as const;

export type PillarKey = keyof typeof PILLARS;
export type CountryCode = keyof typeof COUNTRIES;
