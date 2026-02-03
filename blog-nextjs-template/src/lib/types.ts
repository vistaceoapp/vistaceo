export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  excerpt: string | null;
  content_md: string;
  hero_image_url: string | null;
  image_alt_text: string | null;
  pillar: string | null;
  tags: string[] | null;
  author_name: string | null;
  author_bio: string | null;
  reading_time_min: number | null;
  publish_at: string | null;
  updated_at: string;
  created_at: string;
  status: string;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
}

export interface Cluster {
  slug: string;
  name: string;
  description: string;
  emoji: string;
}

export const CLUSTERS: Record<string, Cluster> = {
  empleo: {
    slug: "empleo",
    name: "Empleo y Carreras",
    description: "Guías para conseguir empleo, desarrollar habilidades y crecer profesionalmente en la era de la IA",
    emoji: "💼",
  },
  ia_aplicada: {
    slug: "ia-aplicada",
    name: "IA y Tecnología",
    description: "Cómo implementar inteligencia artificial en tu negocio de forma práctica",
    emoji: "🤖",
  },
  liderazgo: {
    slug: "liderazgo",
    name: "Liderazgo y Gestión",
    description: "Estrategias para liderar equipos y tomar mejores decisiones empresariales",
    emoji: "🎯",
  },
  servicios: {
    slug: "servicios",
    name: "Servicios Profesionales",
    description: "Optimización y rentabilidad para consultoras, agencias y profesionales independientes",
    emoji: "📋",
  },
  emprender: {
    slug: "emprender",
    name: "Emprender",
    description: "Todo lo que necesitás saber para lanzar y escalar tu startup",
    emoji: "🚀",
  },
  tendencias: {
    slug: "tendencias",
    name: "Tendencias y Oportunidades",
    description: "Análisis de mercado y oportunidades emergentes en Latinoamérica",
    emoji: "📈",
  },
};
