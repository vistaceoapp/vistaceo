/**
 * Zero-Failure Audit Pipeline
 * 
 * Every piece of content (Radar, Missions, Insights, Predictions) 
 * MUST pass through this pipeline before being shown to a user.
 */

// ============================================
// AUDIT SCORING DIMENSIONS
// ============================================

export interface AuditScores {
  relevance: number;       // 0-100: Does it apply to this business?
  personalization: number; // 0-100: Uses specific user data?
  novelty: number;         // 0-100: Not a duplicate?
  coherence: number;       // 0-100: Makes sense in context?
  actionability: number;   // 0-100: Clear next step?
}

export interface AuditResult {
  passed: boolean;
  scores: AuditScores;
  averageScore: number;
  issues: AuditIssue[];
  suggestions: string[];
  dedupeResult: DedupeResult | null;
  traceId?: string;
}

export interface AuditIssue {
  dimension: keyof AuditScores | 'generic' | 'duplicate' | 'blocked';
  severity: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

export interface DedupeResult {
  isDuplicate: boolean;
  similarItems: Array<{
    id: string;
    title: string;
    similarity: number;
    type: 'exact' | 'semantic' | 'intent';
  }>;
  shouldMerge: boolean;
  mergeTargetId?: string;
}

// ============================================
// CONTENT TYPES
// ============================================

export type ContentType = 
  | 'opportunity'   // Radar items
  | 'mission'       // Action plans
  | 'insight'       // Analytics insights
  | 'prediction'    // Predictive scenarios
  | 'chat_response' // Chat AI responses
  | 'notification'; // System notifications

export interface ContentCandidate {
  type: ContentType;
  businessId: string;
  title: string;
  description: string;
  source?: string;
  basedOn?: Array<{ type: string; id?: string; summary: string }>;
  variables?: Record<string, unknown>;
  steps?: Array<{ title: string; description?: string }>;
  metadata?: Record<string, unknown>;
}

// ============================================
// BLOCKED PHRASES (Global + Extensible)
// ============================================

export const GLOBAL_BLOCKED_PHRASES = [
  // Spanish generic advice
  'mejora tu negocio',
  'aumenta tus ventas',
  'optimiza tu operación',
  'sé más eficiente',
  'atrae más clientes',
  'implementa mejoras',
  'considera hacer',
  'podrías intentar',
  'una buena idea sería',
  'te recomiendo mejorar',
  'es importante que',
  'deberías pensar en',
  'analiza tu situación',
  'evalúa tus opciones',
  'trabaja en tu',
  'enfócate en mejorar',
  'desarrolla estrategias',
  'implementa un plan',
  'genera más ingresos',
  'reduce tus costos',
  'mejora la experiencia',
  'optimiza procesos',
  'incrementa la productividad',
  'potencia tu marca',
  'fortalece tu presencia',
];

// ============================================
// MINIMUM THRESHOLDS
// ============================================

export const AUDIT_THRESHOLDS: Record<ContentType, {
  minAverageScore: number;
  minRelevance: number;
  minPersonalization: number;
  minNovelty: number;
  minCoherence: number;
  minActionability: number;
  maxDailyItems: number;
  maxWeeklyItems: number;
  maxSimilarityAllowed: number;
}> = {
  opportunity: {
    minAverageScore: 65,
    minRelevance: 70,
    minPersonalization: 50,
    minNovelty: 80,
    minCoherence: 60,
    minActionability: 60,
    maxDailyItems: 3,
    maxWeeklyItems: 10,
    maxSimilarityAllowed: 0.7,
  },
  mission: {
    minAverageScore: 70,
    minRelevance: 75,
    minPersonalization: 60,
    minNovelty: 85,
    minCoherence: 70,
    minActionability: 80,
    maxDailyItems: 2,
    maxWeeklyItems: 5,
    maxSimilarityAllowed: 0.6,
  },
  insight: {
    minAverageScore: 60,
    minRelevance: 65,
    minPersonalization: 55,
    minNovelty: 70,
    minCoherence: 65,
    minActionability: 50,
    maxDailyItems: 5,
    maxWeeklyItems: 20,
    maxSimilarityAllowed: 0.75,
  },
  prediction: {
    minAverageScore: 75,
    minRelevance: 80,
    minPersonalization: 70,
    minNovelty: 60,
    minCoherence: 80,
    minActionability: 70,
    maxDailyItems: 2,
    maxWeeklyItems: 8,
    maxSimilarityAllowed: 0.65,
  },
  chat_response: {
    minAverageScore: 50,
    minRelevance: 60,
    minPersonalization: 40,
    minNovelty: 30,
    minCoherence: 70,
    minActionability: 40,
    maxDailyItems: 999,
    maxWeeklyItems: 999,
    maxSimilarityAllowed: 0.9,
  },
  notification: {
    minAverageScore: 55,
    minRelevance: 60,
    minPersonalization: 50,
    minNovelty: 75,
    minCoherence: 60,
    minActionability: 50,
    maxDailyItems: 5,
    maxWeeklyItems: 15,
    maxSimilarityAllowed: 0.8,
  },
};

// ============================================
// SCORING FUNCTIONS
// ============================================

function checkBlockedPhrases(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const phrase of GLOBAL_BLOCKED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  
  return found;
}

function calculateRelevance(
  content: ContentCandidate,
  businessContext: BusinessContext
): { score: number; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  let score = 50; // Base score

  // Check if uses business type
  const text = `${content.title} ${content.description}`.toLowerCase();
  
  if (businessContext.category) {
    const categoryKeywords = getCategoryKeywords(businessContext.category);
    const hasRelevantKeyword = categoryKeywords.some(kw => text.includes(kw));
    if (hasRelevantKeyword) score += 20;
  }

  // Check if uses location context
  if (businessContext.country && text.includes(businessContext.country.toLowerCase())) {
    score += 10;
  }

  // Check basedOn (evidence)
  if (content.basedOn && content.basedOn.length > 0) {
    score += 15;
  } else {
    issues.push({
      dimension: 'relevance',
      severity: 'warning',
      message: 'No evidence or data source specified',
      code: 'NO_BASED_ON',
    });
  }

  // Check variables usage
  if (content.variables && Object.keys(content.variables).length > 0) {
    score += 15;
  }

  return { score: Math.min(100, score), issues };
}

function calculatePersonalization(
  content: ContentCandidate,
  businessContext: BusinessContext
): { score: number; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  let score = 30;

  const text = `${content.title} ${content.description}`.toLowerCase();

  // Check for business name mention
  if (businessContext.name && text.includes(businessContext.name.toLowerCase())) {
    score += 15;
  }

  // Check for specific numbers/metrics
  const hasNumbers = /\d+%|\$\d+|\d+\.\d+|\d+ (días|meses|semanas|clientes|ventas)/.test(text);
  if (hasNumbers) {
    score += 25;
  } else {
    issues.push({
      dimension: 'personalization',
      severity: 'warning',
      message: 'No specific metrics or numbers used',
      code: 'NO_SPECIFICS',
    });
  }

  // Check for sector-specific terms
  if (businessContext.sector) {
    const sectorTerms = getSectorTerms(businessContext.sector);
    const hasSectorTerm = sectorTerms.some(term => text.includes(term.toLowerCase()));
    if (hasSectorTerm) score += 20;
  }

  // Check variables
  if (content.variables) {
    const varCount = Object.keys(content.variables).length;
    score += Math.min(20, varCount * 5);
  }

  return { score: Math.min(100, score), issues };
}

function calculateNovelty(
  content: ContentCandidate,
  existingItems: ExistingItem[]
): { score: number; issues: AuditIssue[]; dedupeResult: DedupeResult } {
  const issues: AuditIssue[] = [];
  const similarItems: DedupeResult['similarItems'] = [];
  
  const conceptHash = generateConceptHash(content.title, content.description);
  const intentSig = generateIntentSignature(content.title, content.description);

  for (const item of existingItems) {
    // Exact hash match
    if (item.conceptHash === conceptHash) {
      similarItems.push({
        id: item.id,
        title: item.title,
        similarity: 1.0,
        type: 'exact',
      });
      continue;
    }

    // Intent signature match
    if (item.intentSignature === intentSig) {
      similarItems.push({
        id: item.id,
        title: item.title,
        similarity: 0.9,
        type: 'intent',
      });
      continue;
    }

    // Semantic similarity
    const similarity = calculateSemanticSimilarity(
      `${content.title} ${content.description}`,
      `${item.title} ${item.description}`
    );
    
    if (similarity > 0.6) {
      similarItems.push({
        id: item.id,
        title: item.title,
        similarity,
        type: 'semantic',
      });
    }
  }

  const maxSimilarity = similarItems.length > 0 
    ? Math.max(...similarItems.map(s => s.similarity))
    : 0;

  const isDuplicate = maxSimilarity >= 0.85;
  const shouldMerge = maxSimilarity >= 0.7 && maxSimilarity < 0.85;
  
  let score = 100 - (maxSimilarity * 100);
  
  if (isDuplicate) {
    issues.push({
      dimension: 'duplicate',
      severity: 'error',
      message: `Duplicate of existing item: ${similarItems[0]?.title}`,
      code: 'DUPLICATE',
    });
  } else if (shouldMerge) {
    issues.push({
      dimension: 'novelty',
      severity: 'warning',
      message: 'Very similar to existing item, consider merging',
      code: 'SIMILAR',
    });
  }

  return {
    score: Math.max(0, score),
    issues,
    dedupeResult: {
      isDuplicate,
      similarItems,
      shouldMerge,
      mergeTargetId: shouldMerge ? similarItems[0]?.id : undefined,
    },
  };
}

function calculateCoherence(
  content: ContentCandidate,
  businessContext: BusinessContext
): { score: number; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  let score = 60;

  // Check for blocked phrases
  const blockedFound = checkBlockedPhrases(`${content.title} ${content.description}`);
  if (blockedFound.length > 0) {
    score -= blockedFound.length * 15;
    issues.push({
      dimension: 'generic',
      severity: 'error',
      message: `Generic phrases detected: ${blockedFound.join(', ')}`,
      code: 'BLOCKED_PHRASE',
    });
  }

  // Check title length
  const titleWords = content.title.split(' ').length;
  if (titleWords < 4) {
    score -= 10;
    issues.push({
      dimension: 'coherence',
      severity: 'warning',
      message: 'Title too short/vague',
      code: 'SHORT_TITLE',
    });
  } else if (titleWords >= 6) {
    score += 10;
  }

  // Check description length
  const descWords = content.description.split(' ').length;
  if (descWords < 10) {
    score -= 10;
  } else if (descWords >= 20) {
    score += 10;
  }

  // Check steps quality for missions
  if (content.type === 'mission' && content.steps) {
    const vagueSteps = content.steps.filter(step => {
      const stepText = `${step.title} ${step.description || ''}`;
      return checkBlockedPhrases(stepText).length > 0;
    });
    
    if (vagueSteps.length > 0) {
      score -= vagueSteps.length * 10;
      issues.push({
        dimension: 'coherence',
        severity: 'warning',
        message: `${vagueSteps.length} steps are too generic`,
        code: 'VAGUE_STEPS',
      });
    }
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

function calculateActionability(
  content: ContentCandidate
): { score: number; issues: AuditIssue[] } {
  const issues: AuditIssue[] = [];
  let score = 40;

  const text = `${content.title} ${content.description}`.toLowerCase();

  // Check for action verbs
  const actionVerbs = [
    'crear', 'subir', 'publicar', 'responder', 'contactar', 'llamar',
    'enviar', 'actualizar', 'agregar', 'eliminar', 'configurar', 'activar',
    'lanzar', 'implementar', 'ofrecer', 'programar', 'revisar', 'ajustar'
  ];
  
  const hasActionVerb = actionVerbs.some(verb => text.includes(verb));
  if (hasActionVerb) {
    score += 20;
  } else {
    issues.push({
      dimension: 'actionability',
      severity: 'warning',
      message: 'No clear action verb found',
      code: 'NO_ACTION_VERB',
    });
  }

  // Check for measurement
  const measurementTerms = ['medir', 'métrica', 'resultado', 'objetivo', '%', 'aumento'];
  const hasMeasurement = measurementTerms.some(term => text.includes(term));
  if (hasMeasurement) {
    score += 15;
  }

  // Check for timeline
  const timelineTerms = ['hoy', 'mañana', 'esta semana', 'este mes', 'días', 'horas'];
  const hasTimeline = timelineTerms.some(term => text.includes(term));
  if (hasTimeline) {
    score += 15;
  }

  // Check steps for missions
  if (content.type === 'mission' && content.steps && content.steps.length > 0) {
    score += 10;
    if (content.steps.length >= 3 && content.steps.length <= 8) {
      score += 10;
    }
  }

  return { score: Math.min(100, score), issues };
}

// ============================================
// MAIN AUDIT FUNCTION
// ============================================

export interface BusinessContext {
  id: string;
  name: string;
  category?: string;
  sector?: string;
  country?: string;
  focusArea?: string;
}

export interface ExistingItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  conceptHash?: string;
  intentSignature?: string;
  createdAt: Date;
}

export async function auditContent(
  content: ContentCandidate,
  businessContext: BusinessContext,
  existingItems: ExistingItem[]
): Promise<AuditResult> {
  const issues: AuditIssue[] = [];
  const suggestions: string[] = [];

  // Run all scoring dimensions
  const relevanceResult = calculateRelevance(content, businessContext);
  const personalizationResult = calculatePersonalization(content, businessContext);
  const noveltyResult = calculateNovelty(content, existingItems);
  const coherenceResult = calculateCoherence(content, businessContext);
  const actionabilityResult = calculateActionability(content);

  // Collect all issues
  issues.push(
    ...relevanceResult.issues,
    ...personalizationResult.issues,
    ...noveltyResult.issues,
    ...coherenceResult.issues,
    ...actionabilityResult.issues
  );

  const scores: AuditScores = {
    relevance: relevanceResult.score,
    personalization: personalizationResult.score,
    novelty: noveltyResult.score,
    coherence: coherenceResult.score,
    actionability: actionabilityResult.score,
  };

  const averageScore = (
    scores.relevance +
    scores.personalization +
    scores.novelty +
    scores.coherence +
    scores.actionability
  ) / 5;

  // Get thresholds for this content type
  const thresholds = AUDIT_THRESHOLDS[content.type];

  // Check if passes all thresholds
  const passesThresholds = 
    averageScore >= thresholds.minAverageScore &&
    scores.relevance >= thresholds.minRelevance &&
    scores.personalization >= thresholds.minPersonalization &&
    scores.novelty >= thresholds.minNovelty &&
    scores.coherence >= thresholds.minCoherence &&
    scores.actionability >= thresholds.minActionability;

  // Check for blocking issues
  const hasBlockingIssue = issues.some(i => 
    i.severity === 'error' && 
    (i.code === 'BLOCKED_PHRASE' || i.code === 'DUPLICATE')
  );

  const passed = passesThresholds && !hasBlockingIssue;

  // Generate suggestions
  if (scores.relevance < thresholds.minRelevance) {
    suggestions.push('Add specific data or evidence that triggered this recommendation');
  }
  if (scores.personalization < thresholds.minPersonalization) {
    suggestions.push('Include specific metrics, percentages, or business data');
  }
  if (scores.novelty < thresholds.minNovelty) {
    suggestions.push('Check for similar existing items and consider merging');
  }
  if (scores.coherence < thresholds.minCoherence) {
    suggestions.push('Remove generic phrases and be more specific');
  }
  if (scores.actionability < thresholds.minActionability) {
    suggestions.push('Add clear action verb and measurable outcome');
  }

  return {
    passed,
    scores,
    averageScore,
    issues,
    suggestions,
    dedupeResult: noveltyResult.dedupeResult,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCategoryKeywords(category: string): string[] {
  const keywords: Record<string, string[]> = {
    restaurant: ['restaurante', 'comida', 'menú', 'plato', 'cocina', 'chef', 'delivery'],
    cafe: ['café', 'cafetería', 'barista', 'bebida', 'snack'],
    retail: ['tienda', 'producto', 'inventario', 'stock', 'venta'],
    service: ['servicio', 'cliente', 'atención', 'cita', 'reserva'],
    beauty: ['belleza', 'estética', 'tratamiento', 'spa', 'salón'],
    fitness: ['gym', 'fitness', 'entrenamiento', 'clase', 'membresía'],
    professional: ['consultoría', 'asesoría', 'profesional', 'proyecto'],
  };
  return keywords[category] || [];
}

function getSectorTerms(sector: string): string[] {
  const terms: Record<string, string[]> = {
    gastronomia: ['plato', 'menú', 'cocina', 'receta', 'ingrediente'],
    retail: ['producto', 'inventario', 'proveedor', 'margen'],
    servicios: ['cliente', 'cita', 'servicio', 'calidad'],
    salud: ['paciente', 'turno', 'tratamiento', 'salud'],
  };
  return terms[sector] || [];
}

export function generateConceptHash(title: string, description: string): string {
  const normalize = (s: string) => s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, '_')
    .trim();

  const keywords = `${title} ${description}`
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 8)
    .map(normalize)
    .sort()
    .join('_');

  return `ch_${keywords.slice(0, 64)}`;
}

export function generateIntentSignature(title: string, description: string, category?: string): string {
  const text = `${title} ${description}`.toLowerCase();
  
  // More granular domain detection
  let domain = 'operations';
  if (text.includes('venta') || text.includes('revenue') || text.includes('factur') || text.includes('ingreso')) domain = 'sales';
  else if (text.includes('market') || text.includes('instagram') || text.includes('redes') || text.includes('publicidad') || text.includes('contenido') || text.includes('promoci')) domain = 'marketing';
  else if (text.includes('reseña') || text.includes('review') || text.includes('reputaci') || text.includes('calificaci') || text.includes('rating') || text.includes('google maps')) domain = 'reputation';
  else if (text.includes('costo') || text.includes('gasto') || text.includes('precio') || text.includes('margen') || text.includes('food cost') || text.includes('insumo')) domain = 'costs';
  else if (text.includes('equipo') || text.includes('personal') || text.includes('capacit') || text.includes('rotaci') || text.includes('contrat')) domain = 'team';
  else if (text.includes('menú') || text.includes('menu') || text.includes('carta') || text.includes('producto') || text.includes('oferta')) domain = 'product';
  else if (text.includes('delivery') || text.includes('rappi') || text.includes('uber') || text.includes('pedidos ya')) domain = 'delivery';
  else if (text.includes('client') || text.includes('fidel') || text.includes('retenci') || text.includes('experiencia')) domain = 'customer';
  else if (text.includes('tecnolog') || text.includes('sistema') || text.includes('automat') || text.includes('software')) domain = 'tech';
  if (category) domain = category;
  
  // More granular action detection
  let action = 'improve';
  if (text.includes('crear') || text.includes('lanzar') || text.includes('implementar') || text.includes('diseñ') || text.includes('desarrollar')) action = 'create';
  else if (text.includes('responder') || text.includes('reaccionar')) action = 'respond';
  else if (text.includes('reducir') || text.includes('eliminar') || text.includes('bajar') || text.includes('minimizar')) action = 'reduce';
  else if (text.includes('aumentar') || text.includes('incrementar') || text.includes('subir') || text.includes('duplicar') || text.includes('crecer')) action = 'increase';
  else if (text.includes('optimizar') || text.includes('mejorar') || text.includes('refinar')) action = 'optimize';
  else if (text.includes('analizar') || text.includes('evaluar') || text.includes('investigar') || text.includes('medir')) action = 'analyze';
  
  // Extract primary object/target for finer differentiation
  const objectPatterns = [
    /(?:de|del|la|el|tu|tus)\s+(\w+(?:\s+\w+)?)/g
  ];
  let object = '';
  for (const pat of objectPatterns) {
    const match = pat.exec(text);
    if (match?.[1] && match[1].length > 3) { object = match[1].trim().slice(0, 20); break; }
  }
  
  return `${domain}|${action}|${object}`;
}

function calculateSemanticSimilarity(text1: string, text2: string): number {
  const STOPWORDS = new Set([
    'para', 'como', 'con', 'por', 'que', 'del', 'los', 'las', 'una', 'unos',
    'esto', 'esta', 'esos', 'esas', 'puede', 'podria', 'deberia', 'seria',
    'más', 'mas', 'muy', 'bien', 'mejor', 'cada', 'todo', 'toda', 'todos',
    'hacer', 'tener', 'haber', 'estar', 'este', 'ese', 'aquel',
    'negocio', 'empresa', 'estrategia', 'forma', 'manera',
    'the', 'and', 'for', 'with', 'your', 'you', 'that', 'this',
  ]);

  const normalize = (s: string) => s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

  const getTokens = (s: string) => {
    const words = normalize(s).split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
    // Add bigrams for phrase-level matching
    const bigrams: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(`${words[i]}_${words[i + 1]}`);
    }
    return [...words, ...bigrams];
  };

  const tokens1 = getTokens(text1);
  const tokens2 = getTokens(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const intersection = [...set1].filter(w => set2.has(w)).length;
  const union = new Set([...set1, ...set2]).size;

  const jaccard = union > 0 ? intersection / union : 0;
  
  // Also check containment: if one text's keywords are mostly in the other
  const containment1 = set1.size > 0 ? intersection / set1.size : 0;
  const containment2 = set2.size > 0 ? intersection / set2.size : 0;
  const maxContainment = Math.max(containment1, containment2);
  
  // Weighted: Jaccard + containment bonus for subset relationships
  return Math.min(1, jaccard * 0.6 + maxContainment * 0.4);
}

// ============================================
// RATE LIMITING
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  resetAt: Date;
  reason?: string;
}

export function checkRateLimit(
  contentType: ContentType,
  existingItems: ExistingItem[],
  period: 'daily' | 'weekly'
): RateLimitResult {
  const thresholds = AUDIT_THRESHOLDS[contentType];
  const limit = period === 'daily' ? thresholds.maxDailyItems : thresholds.maxWeeklyItems;

  const now = new Date();
  const periodStart = new Date(now);
  
  if (period === 'daily') {
    periodStart.setHours(0, 0, 0, 0);
  } else {
    periodStart.setDate(periodStart.getDate() - 7);
  }

  const itemsInPeriod = existingItems.filter(item => 
    item.type === contentType && item.createdAt >= periodStart
  );

  const currentCount = itemsInPeriod.length;
  const allowed = currentCount < limit;

  const resetAt = new Date(periodStart);
  if (period === 'daily') {
    resetAt.setDate(resetAt.getDate() + 1);
  } else {
    resetAt.setDate(resetAt.getDate() + 7);
  }

  return {
    allowed,
    currentCount,
    limit,
    resetAt,
    reason: allowed ? undefined : `Rate limit exceeded: ${currentCount}/${limit} ${period}`,
  };
}
