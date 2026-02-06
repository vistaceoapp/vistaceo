/**
 * Chat → Modules Pipeline
 * 
 * Extracts actionable items from chat messages and routes them
 * to the appropriate modules (Radar, Missions, Analytics, Predictions).
 */

import { ContentCandidate, ContentType } from './audit-pipeline';

// ============================================
// EXTRACTION TYPES
// ============================================

export interface ChatExtraction {
  learnedFacts: LearnedFact[];
  openQuestions: OpenQuestion[];
  actionCandidates: ActionCandidate[];
  insightCandidates: InsightCandidate[];
  predictionTriggers: PredictionTrigger[];
}

export interface LearnedFact {
  category: 'factual' | 'preference' | 'constraint' | 'goal';
  key: string;
  value: string;
  confidence: number; // 0-1
  source: 'explicit' | 'inferred';
  requiresConfirmation: boolean;
}

export interface OpenQuestion {
  category: string;
  question: string;
  priority: number;
  unlocks: string; // What feature/insight this unlocks
}

export interface ActionCandidate {
  type: 'mission' | 'opportunity';
  title: string;
  description: string;
  basedOn: string;
  priority: 'high' | 'medium' | 'low';
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface InsightCandidate {
  category: string;
  insight: string;
  dataUsed: string;
  actionSuggestion?: string;
}

export interface PredictionTrigger {
  domain: string;
  signal: string;
  suggestedPrediction: string;
  requiredInputs: string[];
}

// ============================================
// EXTRACTION PATTERNS
// ============================================

const FACT_PATTERNS: Array<{
  pattern: RegExp;
  category: LearnedFact['category'];
  keyExtractor: (match: RegExpMatchArray) => string;
}> = [
  // Revenue/Sales patterns
  {
    pattern: /(?:factur|vend|ingres)[aoie]?\s+(?:alrededor de|aproximadamente|unos?)?\s*\$?\s*([\d.,]+)\s*(?:mil|k|m|millones?)?\s*(?:por\s+)?(?:mes|semana|día)/i,
    category: 'factual',
    keyExtractor: () => 'monthly_revenue_approx',
  },
  // Employee count
  {
    pattern: /(?:tengo|somos|hay)\s+(\d+)\s+(?:empleados?|personas?|trabajadores?)/i,
    category: 'factual',
    keyExtractor: () => 'employee_count',
  },
  // Goal patterns
  {
    pattern: /(?:quiero|busco|necesito|mi objetivo es)\s+(.+?)(?:\.|$)/i,
    category: 'goal',
    keyExtractor: () => 'current_goal',
  },
  // Constraint patterns
  {
    pattern: /(?:no puedo|no tengo|me falta|el problema es)\s+(.+?)(?:\.|$)/i,
    category: 'constraint',
    keyExtractor: () => 'constraint',
  },
  // Preference patterns
  {
    pattern: /(?:prefiero|me gusta más|siempre uso)\s+(.+?)(?:\.|$)/i,
    category: 'preference',
    keyExtractor: () => 'preference',
  },
];

const ACTION_TRIGGERS = [
  'cómo puedo',
  'qué debería',
  'ayudame a',
  'necesito',
  'quiero mejorar',
  'cómo hago para',
  'qué me recomendás',
];

const PREDICTION_DOMAINS = [
  { keywords: ['ventas', 'facturación', 'ingresos'], domain: 'sales' },
  { keywords: ['clientes', 'retención', 'churn'], domain: 'customers' },
  { keywords: ['costos', 'gastos', 'rentabilidad'], domain: 'costs' },
  { keywords: ['personal', 'empleados', 'equipo'], domain: 'hr' },
];

// ============================================
// EXTRACTION FUNCTIONS
// ============================================

export function extractFromChatMessage(
  userMessage: string,
  assistantResponse: string,
  conversationContext?: string[]
): ChatExtraction {
  const extraction: ChatExtraction = {
    learnedFacts: [],
    openQuestions: [],
    actionCandidates: [],
    insightCandidates: [],
    predictionTriggers: [],
  };

  // Extract facts from user message
  extraction.learnedFacts = extractFacts(userMessage);

  // Extract action candidates
  extraction.actionCandidates = extractActionCandidates(userMessage, assistantResponse);

  // Extract open questions (what we still need to know)
  extraction.openQuestions = extractOpenQuestions(assistantResponse);

  // Extract insight candidates
  extraction.insightCandidates = extractInsights(assistantResponse);

  // Check for prediction triggers
  extraction.predictionTriggers = extractPredictionTriggers(userMessage);

  return extraction;
}

function extractFacts(message: string): LearnedFact[] {
  const facts: LearnedFact[] = [];

  for (const { pattern, category, keyExtractor } of FACT_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      facts.push({
        category,
        key: keyExtractor(match),
        value: match[1] || match[0],
        confidence: 0.7, // Medium confidence for pattern matching
        source: 'explicit',
        requiresConfirmation: category !== 'factual',
      });
    }
  }

  return facts;
}

function extractActionCandidates(
  userMessage: string,
  assistantResponse: string
): ActionCandidate[] {
  const candidates: ActionCandidate[] = [];
  const lowerMessage = userMessage.toLowerCase();

  // Check if user is asking for action
  const isActionRequest = ACTION_TRIGGERS.some(trigger => 
    lowerMessage.includes(trigger)
  );

  if (!isActionRequest) return candidates;

  // Extract action from assistant response
  // Look for imperative sentences or recommendations
  const actionPatterns = [
    /(?:te recomiendo|deberías|podrías|una buena opción sería)\s+(.+?)(?:\.|$)/gi,
    /(?:paso \d+|primero|segundo|tercero)[:\s]+(.+?)(?:\.|$)/gi,
  ];

  for (const pattern of actionPatterns) {
    const matches = assistantResponse.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 20) {
        candidates.push({
          type: 'mission',
          title: truncateToTitle(match[1]),
          description: match[1],
          basedOn: userMessage.slice(0, 100),
          priority: 'medium',
          estimatedEffort: 'medium',
          estimatedImpact: 'medium',
        });
      }
    }
  }

  // Dedupe by title similarity
  return dedupeByTitle(candidates);
}

function extractOpenQuestions(response: string): OpenQuestion[] {
  const questions: OpenQuestion[] = [];
  
  // Look for questions in the response
  const questionPattern = /\?([^?]*)\?|(?:me podrías decir|necesito saber|sería útil conocer)\s+(.+?)(?:\.|$)/gi;
  
  const matches = response.matchAll(questionPattern);
  for (const match of matches) {
    const questionText = match[1] || match[2];
    if (questionText && questionText.length > 10) {
      questions.push({
        category: inferQuestionCategory(questionText),
        question: questionText.trim(),
        priority: 5,
        unlocks: 'better_recommendations',
      });
    }
  }

  return questions.slice(0, 3); // Max 3 questions per message
}

function extractInsights(response: string): InsightCandidate[] {
  const insights: InsightCandidate[] = [];

  // Look for insight patterns
  const insightPatterns = [
    /(?:esto significa que|lo interesante es que|un dato importante)\s+(.+?)(?:\.|$)/gi,
    /(?:basándome en|según lo que me contás)\s+(.+?)(?:\.|$)/gi,
  ];

  for (const pattern of insightPatterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 30) {
        insights.push({
          category: 'chat_derived',
          insight: match[1],
          dataUsed: 'conversation',
        });
      }
    }
  }

  return insights.slice(0, 2); // Max 2 insights per message
}

function extractPredictionTriggers(message: string): PredictionTrigger[] {
  const triggers: PredictionTrigger[] = [];
  const lowerMessage = message.toLowerCase();

  // Check for prediction-related keywords
  const predictionKeywords = ['qué va a pasar', 'predicción', 'proyección', 'forecast', 'estimación'];
  const hasPredictionIntent = predictionKeywords.some(kw => lowerMessage.includes(kw));

  if (!hasPredictionIntent) return triggers;

  // Find which domain
  for (const { keywords, domain } of PREDICTION_DOMAINS) {
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      triggers.push({
        domain,
        signal: message.slice(0, 100),
        suggestedPrediction: `Proyección de ${domain}`,
        requiredInputs: ['historical_data', 'current_metrics'],
      });
    }
  }

  return triggers;
}

// ============================================
// CONVERSION TO CONTENT CANDIDATES
// ============================================

export function actionToContentCandidate(
  action: ActionCandidate,
  businessId: string
): ContentCandidate {
  return {
    type: action.type === 'mission' ? 'mission' : 'opportunity',
    businessId,
    title: action.title,
    description: action.description,
    source: 'chat',
    basedOn: [{ type: 'chat', summary: action.basedOn }],
    metadata: {
      priority: action.priority,
      estimatedEffort: action.estimatedEffort,
      estimatedImpact: action.estimatedImpact,
    },
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function truncateToTitle(text: string): string {
  const words = text.split(' ').slice(0, 8);
  let title = words.join(' ');
  if (title.length > 60) {
    title = title.slice(0, 57) + '...';
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function dedupeByTitle(candidates: ActionCandidate[]): ActionCandidate[] {
  const seen = new Set<string>();
  return candidates.filter(c => {
    const normalized = c.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function inferQuestionCategory(question: string): string {
  const lower = question.toLowerCase();
  if (lower.includes('venta') || lower.includes('ingreso')) return 'sales';
  if (lower.includes('cliente')) return 'customers';
  if (lower.includes('costo') || lower.includes('gasto')) return 'costs';
  if (lower.includes('empleado') || lower.includes('personal')) return 'hr';
  return 'general';
}

// ============================================
// LIMITS & THROTTLING
// ============================================

export const CHAT_TO_MODULE_LIMITS = {
  maxMissionsPerWeek: 3,
  maxOpportunitiesPerWeek: 5,
  maxInsightsPerWeek: 10,
  maxPredictionsPerWeek: 2,
  minMessagesBetweenActions: 3, // Don't create action every message
};

export interface ChatModuleTracker {
  missionsCreatedThisWeek: number;
  opportunitiesCreatedThisWeek: number;
  insightsCreatedThisWeek: number;
  predictionsCreatedThisWeek: number;
  messagesSinceLastAction: number;
  weekStartDate: Date;
}

export function canCreateFromChat(
  tracker: ChatModuleTracker,
  type: 'mission' | 'opportunity' | 'insight' | 'prediction'
): boolean {
  // Reset if new week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  if (tracker.weekStartDate < weekStart) {
    // New week, reset counts
    tracker.missionsCreatedThisWeek = 0;
    tracker.opportunitiesCreatedThisWeek = 0;
    tracker.insightsCreatedThisWeek = 0;
    tracker.predictionsCreatedThisWeek = 0;
    tracker.weekStartDate = weekStart;
  }

  // Check minimum messages between actions
  if (tracker.messagesSinceLastAction < CHAT_TO_MODULE_LIMITS.minMessagesBetweenActions) {
    return false;
  }

  // Check type-specific limits
  switch (type) {
    case 'mission':
      return tracker.missionsCreatedThisWeek < CHAT_TO_MODULE_LIMITS.maxMissionsPerWeek;
    case 'opportunity':
      return tracker.opportunitiesCreatedThisWeek < CHAT_TO_MODULE_LIMITS.maxOpportunitiesPerWeek;
    case 'insight':
      return tracker.insightsCreatedThisWeek < CHAT_TO_MODULE_LIMITS.maxInsightsPerWeek;
    case 'prediction':
      return tracker.predictionsCreatedThisWeek < CHAT_TO_MODULE_LIMITS.maxPredictionsPerWeek;
    default:
      return false;
  }
}
