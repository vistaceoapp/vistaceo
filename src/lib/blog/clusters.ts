/**
 * VistaSEOOS P2.2 — Blog Clusters System
 * Defines topic clusters for internal linking and content organization
 */

export interface Cluster {
  id: string;
  name: string;
  slug: string;
  description: string;
  pillarTitle: string;
  pillarDescription: string;
  keywords: string[];
  relatedClusters: string[];
  emoji: string;
  color: string;
}

// 12 Macro Clusters for VistaCEO
export const BLOG_CLUSTERS: Record<string, Cluster> = {
  'agentes-ia': {
    id: 'agentes-ia',
    name: 'Agentes de IA en Empresas',
    slug: 'agentes-ia',
    description: 'Implementación y uso de agentes de IA para automatización empresarial',
    pillarTitle: 'Guía Completa de Agentes de IA para Empresas',
    pillarDescription: 'Todo lo que necesitas saber sobre agentes de IA y cómo implementarlos',
    keywords: ['agentes ia', 'automatización inteligente', 'ia empresarial', 'asistentes virtuales'],
    relatedClusters: ['productividad-ia', 'herramientas-ia', 'automatizacion'],
    emoji: '🤖',
    color: 'hsl(var(--primary))'
  },
  'productividad-ia': {
    id: 'productividad-ia',
    name: 'Productividad con IA',
    slug: 'productividad-ia',
    description: 'Aumentar eficiencia de equipos usando herramientas de IA',
    pillarTitle: 'Productividad con IA: Guía para Equipos de Trabajo',
    pillarDescription: 'Cómo multiplicar la productividad de tu equipo con inteligencia artificial',
    keywords: ['productividad ia', 'eficiencia', 'trabajo en equipo', 'optimización'],
    relatedClusters: ['agentes-ia', 'herramientas-ia', 'liderazgo'],
    emoji: '⚡',
    color: 'hsl(var(--chart-1))'
  },
  'empleos-ia': {
    id: 'empleos-ia',
    name: 'Empleos y Carrera en Era IA',
    slug: 'empleos-ia',
    description: 'Cómo adaptarse y prosperar profesionalmente con la revolución IA',
    pillarTitle: 'Guía de Carrera para la Era de la IA en LATAM',
    pillarDescription: 'Estrategias para mantener relevancia profesional en la era de la IA',
    keywords: ['empleos ia', 'carrera profesional', 'reconversión', 'futuro del trabajo', 'latam'],
    relatedClusters: ['productividad-ia', 'liderazgo', 'tendencias'],
    emoji: '💼',
    color: 'hsl(var(--chart-2))'
  },
  'liderazgo': {
    id: 'liderazgo',
    name: 'Liderazgo y Decisiones CEO',
    slug: 'liderazgo',
    description: 'Toma de decisiones estratégicas para líderes empresariales',
    pillarTitle: 'Liderazgo Empresarial en la Era Digital',
    pillarDescription: 'Cómo liderar equipos y tomar decisiones en la era de la IA',
    keywords: ['liderazgo', 'ceo', 'decisiones estratégicas', 'gestión'],
    relatedClusters: ['productividad-ia', 'finanzas-pymes', 'operaciones'],
    emoji: '👔',
    color: 'hsl(var(--chart-3))'
  },
  'finanzas-pymes': {
    id: 'finanzas-pymes',
    name: 'Finanzas para PyMEs',
    slug: 'finanzas-pymes',
    description: 'Gestión financiera inteligente para pequeñas y medianas empresas',
    pillarTitle: 'Finanzas Inteligentes para PyMEs y Startups',
    pillarDescription: 'Control financiero y rentabilidad para negocios en crecimiento',
    keywords: ['finanzas pymes', 'rentabilidad', 'flujo de caja', 'costos'],
    relatedClusters: ['liderazgo', 'operaciones', 'ventas'],
    emoji: '💰',
    color: 'hsl(var(--chart-4))'
  },
  'operaciones': {
    id: 'operaciones',
    name: 'Operaciones y Procesos',
    slug: 'operaciones',
    description: 'Optimización de procesos operativos empresariales',
    pillarTitle: 'Operaciones Eficientes: Guía de Optimización',
    pillarDescription: 'Cómo diseñar y mejorar procesos operativos con tecnología',
    keywords: ['operaciones', 'procesos', 'eficiencia operativa', 'mejora continua'],
    relatedClusters: ['automatizacion', 'finanzas-pymes', 'herramientas-ia'],
    emoji: '⚙️',
    color: 'hsl(var(--chart-5))'
  },
  'marketing-organico': {
    id: 'marketing-organico',
    name: 'Marketing y Crecimiento Orgánico',
    slug: 'marketing-organico',
    description: 'Estrategias de marketing sin depender de publicidad paga',
    pillarTitle: 'Marketing Orgánico: Crecer sin Pagar Anuncios',
    pillarDescription: 'Estrategias de crecimiento orgánico sostenible',
    keywords: ['marketing orgánico', 'seo', 'contenido', 'crecimiento', 'branding'],
    relatedClusters: ['ventas', 'tendencias', 'herramientas-ia'],
    emoji: '📈',
    color: 'hsl(142 76% 36%)'
  },
  'ventas': {
    id: 'ventas',
    name: 'Ventas y Prospección',
    slug: 'ventas',
    description: 'Técnicas de ventas modernas y prospección inteligente',
    pillarTitle: 'Ventas Modernas: Prospectar y Cerrar con IA',
    pillarDescription: 'Cómo vender más usando tecnología y datos',
    keywords: ['ventas', 'prospección', 'cierre', 'crm', 'pipeline'],
    relatedClusters: ['marketing-organico', 'herramientas-ia', 'finanzas-pymes'],
    emoji: '🎯',
    color: 'hsl(0 84% 60%)'
  },
  'herramientas-ia': {
    id: 'herramientas-ia',
    name: 'Herramientas y Stacks',
    slug: 'herramientas-ia',
    description: 'Comparativas y reviews de herramientas de IA',
    pillarTitle: 'Las Mejores Herramientas de IA para Negocios',
    pillarDescription: 'Guía comparativa de herramientas de IA por caso de uso',
    keywords: ['herramientas ia', 'comparativas', 'stack tecnológico', 'software'],
    relatedClusters: ['agentes-ia', 'automatizacion', 'productividad-ia'],
    emoji: '🛠️',
    color: 'hsl(262 83% 58%)'
  },
  'casos-reales': {
    id: 'casos-reales',
    name: 'Casos Reales y Playbooks',
    slug: 'casos-reales',
    description: 'Historias de implementación y frameworks prácticos',
    pillarTitle: 'Casos de Éxito: IA en Empresas Reales',
    pillarDescription: 'Historias reales de transformación digital',
    keywords: ['casos de éxito', 'playbooks', 'implementación', 'ejemplos'],
    relatedClusters: ['agentes-ia', 'automatizacion', 'liderazgo'],
    emoji: '📖',
    color: 'hsl(45 93% 47%)'
  },
  'tendencias': {
    id: 'tendencias',
    name: 'Tendencias y Análisis',
    slug: 'tendencias',
    description: 'Análisis del mercado y tendencias tecnológicas',
    pillarTitle: 'Tendencias de IA: Lo que Viene para Empresas',
    pillarDescription: 'Análisis de tendencias y predicciones del mercado',
    keywords: ['tendencias', 'análisis', 'futuro', 'predicciones', 'mercado'],
    relatedClusters: ['empleos-ia', 'herramientas-ia', 'liderazgo'],
    emoji: '🔮',
    color: 'hsl(200 98% 39%)'
  },
  'automatizacion': {
    id: 'automatizacion',
    name: 'Automatización Empresarial',
    slug: 'automatizacion',
    description: 'Automatizar tareas y procesos sin romper nada',
    pillarTitle: 'Automatización para Empresas: Guía Completa',
    pillarDescription: 'Cómo automatizar tu negocio paso a paso',
    keywords: ['automatización', 'workflows', 'integración', 'no-code'],
    relatedClusters: ['agentes-ia', 'operaciones', 'herramientas-ia'],
    emoji: '🔄',
    color: 'hsl(330 81% 60%)'
  }
};

// ===== HELPER FUNCTIONS =====

export function getClusterByPillar(pillar: string | null | undefined): Cluster | null {
  if (!pillar) return null;
  return BLOG_CLUSTERS[pillar] || null;
}

export function getRelatedClusters(clusterId: string): Cluster[] {
  const cluster = BLOG_CLUSTERS[clusterId];
  if (!cluster) return [];
  
  return cluster.relatedClusters
    .map(id => BLOG_CLUSTERS[id])
    .filter(Boolean);
}

export function getAllClusters(): Cluster[] {
  return Object.values(BLOG_CLUSTERS);
}

export function suggestCluster(title: string, content: string): Cluster | null {
  const text = `${title} ${content}`.toLowerCase();
  
  let bestMatch: Cluster | null = null;
  let bestScore = 0;
  
  for (const cluster of Object.values(BLOG_CLUSTERS)) {
    let score = 0;
    for (const keyword of cluster.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // Multi-word keywords score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = cluster;
    }
  }
  
  return bestMatch;
}

// ===== INTERNAL LINKING SUGGESTIONS =====

interface LinkSuggestion {
  anchorText: string;
  targetSlug: string;
  targetTitle: string;
  relevanceScore: number;
}

export function suggestInternalLinks(
  currentSlug: string,
  currentPillar: string | null,
  allPosts: Array<{ slug: string; title: string; pillar?: string | null; tags?: string[] | null }>
): LinkSuggestion[] {
  const suggestions: LinkSuggestion[] = [];
  
  // Get related clusters
  const relatedClusterIds = currentPillar 
    ? (BLOG_CLUSTERS[currentPillar]?.relatedClusters || [])
    : [];
  
  for (const post of allPosts) {
    if (post.slug === currentSlug) continue;
    
    let score = 0;
    
    // Same pillar = high relevance
    if (post.pillar && post.pillar === currentPillar) {
      score += 10;
    }
    
    // Related cluster = medium relevance
    if (post.pillar && relatedClusterIds.includes(post.pillar)) {
      score += 5;
    }
    
    // Any pillar = low relevance
    if (post.pillar) {
      score += 1;
    }
    
    if (score > 0) {
      suggestions.push({
        anchorText: post.title,
        targetSlug: post.slug,
        targetTitle: post.title,
        relevanceScore: score
      });
    }
  }
  
  // Sort by relevance
  suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return suggestions.slice(0, 6);
}
