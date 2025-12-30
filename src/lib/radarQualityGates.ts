/**
 * Sistema de filtrado con 6 gates para Radar
 * Una oportunidad solo se publica si pasa los 6 checks
 */

export interface QualityGateResult {
  passed: boolean;
  score: number; // 0-100
  gates: {
    name: string;
    passed: boolean;
    reason: string;
  }[];
  confidence: number; // 0-100
  priorityScore: number;
}

export interface OpportunityEvidence {
  trigger?: string;
  source?: string;
  signals?: string[];
  dataPoints?: number;
  sources?: string[];
  drivers?: string[];
  variables?: Record<string, any>;
  steps?: any[];
  basedOn?: string[];
  actionPlan?: any[];
  kpi?: string;
  timeEstimate?: string;
  risks?: string[];
  dependencies?: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
  created_at: string;
}

export interface BusinessContext {
  id: string;
  name: string;
  category?: string | null;
  country?: string | null;
  currentFocus?: string;
  activeMissionsCount?: number;
  maxParallelMissions?: number;
  isPro?: boolean;
  integrations?: string[];
  hasReviews?: boolean;
  hasSales?: boolean;
}

// Generic phrases that should be blocked
const BLOCKED_PHRASES = [
  "mejorar ventas",
  "aumentar clientes",
  "optimizar operaciones",
  "mejorar servicio",
  "incrementar ingresos",
  "aumentar ganancias",
  "mejorar negocio",
  "hacer crecer",
  "optimizar procesos",
  "mejorar rendimiento",
  "aumentar ventas",
  "mejorar calidad",
];

// Areas that match different focuses
const FOCUS_AREA_MAP: Record<string, string[]> = {
  ventas: ["ventas", "sales", "revenue", "ingresos", "ticket"],
  reputacion: ["reputación", "reviews", "reseñas", "rating", "opiniones"],
  marketing: ["marketing", "social", "visibilidad", "promoción", "publicidad"],
  operaciones: ["operaciones", "operations", "eficiencia", "tiempos", "costos"],
  equipo: ["equipo", "team", "personal", "staff", "empleados"],
  producto: ["producto", "menu", "carta", "items", "platos"],
};

/**
 * Gate 1: Fit duro (sector + tipo + país + canal + objetivo actual)
 */
function checkHardFit(
  opportunity: Opportunity, 
  business: BusinessContext
): { passed: boolean; reason: string } {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  // Must have at least title and description
  if (!opportunity.title || !opportunity.description) {
    return { passed: false, reason: "Falta información básica" };
  }
  
  // Title should be specific (not generic)
  const titleLower = opportunity.title.toLowerCase();
  const hasGenericTitle = BLOCKED_PHRASES.some(phrase => 
    titleLower === phrase || titleLower.includes(phrase)
  );
  
  if (hasGenericTitle) {
    return { passed: false, reason: "Título demasiado genérico" };
  }
  
  // Description should have minimum length
  if (!opportunity.description || opportunity.description.length < 30) {
    return { passed: false, reason: "Descripción insuficiente" };
  }
  
  return { passed: true, reason: "Aplica a tu tipo de negocio" };
}

/**
 * Gate 2: Señal disparadora (trigger claro)
 */
function checkTrigger(
  opportunity: Opportunity
): { passed: boolean; reason: string } {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  // Must have a trigger or source
  const hasTrigger = Boolean(
    evidence?.trigger || 
    evidence?.source || 
    opportunity.source ||
    (evidence?.signals && evidence.signals.length > 0)
  );
  
  if (!hasTrigger) {
    return { passed: false, reason: "Sin señal disparadora clara" };
  }
  
  return { 
    passed: true, 
    reason: evidence?.trigger || `Detectado via ${opportunity.source || 'diagnóstico'}` 
  };
}

/**
 * Gate 3: Evidencia mínima (al menos 2 señales)
 */
function checkMinimumEvidence(
  opportunity: Opportunity
): { passed: boolean; reason: string } {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  let signalCount = 0;
  
  // Count different evidence sources
  if (evidence?.signals?.length) signalCount += evidence.signals.length;
  if (evidence?.dataPoints && evidence.dataPoints > 0) signalCount += 1;
  if (evidence?.sources?.length) signalCount += evidence.sources.length;
  if (evidence?.basedOn?.length) signalCount += evidence.basedOn.length;
  if (opportunity.source) signalCount += 1;
  
  // Need at least 2 signals
  if (signalCount < 2) {
    return { passed: false, reason: `Solo ${signalCount} señal(es), necesito mínimo 2` };
  }
  
  return { passed: true, reason: `Basado en ${signalCount} señales` };
}

/**
 * Gate 4: Accionabilidad real (pasos concretos y medibles)
 */
function checkActionability(
  opportunity: Opportunity
): { passed: boolean; reason: string } {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  
  // Should have steps or be convertible to steps
  const hasSteps = Boolean(
    evidence?.steps?.length || 
    evidence?.actionPlan?.length
  );
  
  // Should have meaningful scores (not default 5/5)
  const hasNonDefaultScores = !(
    opportunity.impact_score === 5 && 
    opportunity.effort_score === 5
  );
  
  if (!hasNonDefaultScores) {
    return { passed: false, reason: "Impacto y esfuerzo no evaluados" };
  }
  
  return { 
    passed: true, 
    reason: hasSteps ? "Plan de acción definido" : "Convertible a misión" 
  };
}

/**
 * Gate 5: No duplicación (evitar repetir lo mismo)
 */
function checkNoDuplication(
  opportunity: Opportunity,
  existingOpportunities: Opportunity[] = []
): { passed: boolean; reason: string } {
  const titleLower = opportunity.title.toLowerCase();
  const descLower = (opportunity.description || "").toLowerCase();
  
  // Check for similar titles
  const similar = existingOpportunities.find(other => {
    if (other.id === opportunity.id) return false;
    
    const otherTitleLower = other.title.toLowerCase();
    const otherDescLower = (other.description || "").toLowerCase();
    
    // Check title similarity
    const titleWords = titleLower.split(" ");
    const otherTitleWords = otherTitleLower.split(" ");
    const commonWords = titleWords.filter(w => otherTitleWords.includes(w) && w.length > 3);
    
    return commonWords.length >= 3;
  });
  
  if (similar) {
    return { passed: false, reason: "Similar a otra oportunidad existente" };
  }
  
  return { passed: true, reason: "Oportunidad única" };
}

/**
 * Gate 6: Capacidad operativa (no saturar al usuario)
 */
function checkOperationalCapacity(
  opportunity: Opportunity,
  business: BusinessContext
): { passed: boolean; reason: string } {
  const activeMissions = business.activeMissionsCount || 0;
  const maxMissions = business.isPro ? 10 : 2;
  
  // If user is at capacity, only high impact opportunities should pass
  if (activeMissions >= maxMissions) {
    if (opportunity.impact_score >= 8) {
      return { passed: true, reason: "Alta prioridad - misiones al máximo" };
    }
    return { 
      passed: false, 
      reason: `Ya tienes ${activeMissions} misiones activas` 
    };
  }
  
  // If close to capacity, medium+ impact
  if (activeMissions >= maxMissions - 1) {
    if (opportunity.impact_score >= 6) {
      return { passed: true, reason: "Prioridad media-alta" };
    }
    return { 
      passed: false, 
      reason: "Mejor enfocarse en misiones actuales" 
    };
  }
  
  return { passed: true, reason: "Capacidad disponible" };
}

/**
 * Calculate confidence score (0-100)
 */
function calculateConfidence(
  opportunity: Opportunity,
  business: BusinessContext
): number {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  let score = 40; // Base score
  
  // Evidence factors
  if (evidence?.dataPoints && evidence.dataPoints >= 50) score += 20;
  else if (evidence?.dataPoints && evidence.dataPoints >= 20) score += 10;
  
  if (evidence?.signals?.length && evidence.signals.length >= 3) score += 15;
  else if (evidence?.signals?.length && evidence.signals.length >= 2) score += 10;
  
  if (evidence?.sources?.length && evidence.sources.length >= 2) score += 10;
  
  // Integration factors
  if (business.integrations?.length && business.integrations.length >= 2) score += 10;
  if (business.hasReviews) score += 5;
  if (business.hasSales) score += 5;
  
  // Impact/effort balance
  const balance = opportunity.impact_score - opportunity.effort_score;
  if (balance >= 3) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate priority score for ranking
 * Formula: (Impact × Probability) / Effort, adjusted by urgency and focus
 */
function calculatePriorityScore(
  opportunity: Opportunity,
  business: BusinessContext,
  confidence: number
): number {
  const probability = confidence / 100;
  const impact = opportunity.impact_score;
  const effort = Math.max(1, opportunity.effort_score);
  
  // Base score
  let score = (impact * probability) / effort;
  
  // Focus alignment bonus
  if (business.currentFocus) {
    const focusAreas = FOCUS_AREA_MAP[business.currentFocus.toLowerCase()] || [];
    const titleLower = opportunity.title.toLowerCase();
    const descLower = (opportunity.description || "").toLowerCase();
    const sourceLower = (opportunity.source || "").toLowerCase();
    
    const matchesFocus = focusAreas.some(area => 
      titleLower.includes(area) || descLower.includes(area) || sourceLower.includes(area)
    );
    
    if (matchesFocus) score *= 1.3;
  }
  
  // Quick win bonus
  if (impact >= 7 && effort <= 4) score *= 1.2;
  
  return Math.round(score * 100) / 100;
}

/**
 * Main function: Run all 6 quality gates
 */
export function runQualityGates(
  opportunity: Opportunity,
  business: BusinessContext,
  existingOpportunities: Opportunity[] = []
): QualityGateResult {
  const gates = [
    { name: "Fit duro", ...checkHardFit(opportunity, business) },
    { name: "Señal disparadora", ...checkTrigger(opportunity) },
    { name: "Evidencia mínima", ...checkMinimumEvidence(opportunity) },
    { name: "Accionabilidad", ...checkActionability(opportunity) },
    { name: "No duplicación", ...checkNoDuplication(opportunity, existingOpportunities) },
    { name: "Capacidad operativa", ...checkOperationalCapacity(opportunity, business) },
  ];
  
  const passedCount = gates.filter(g => g.passed).length;
  const allPassed = passedCount === gates.length;
  
  const confidence = calculateConfidence(opportunity, business);
  const priorityScore = calculatePriorityScore(opportunity, business, confidence);
  
  // Score is percentage of gates passed, weighted
  const score = Math.round((passedCount / gates.length) * 100);
  
  return {
    passed: allPassed,
    score,
    gates,
    confidence,
    priorityScore,
  };
}

/**
 * Get time estimate based on effort score
 */
export function getTimeEstimate(effortScore: number): string {
  if (effortScore <= 2) return "30 min - 1 hora";
  if (effortScore <= 4) return "1-2 horas";
  if (effortScore <= 6) return "2-4 horas";
  if (effortScore <= 8) return "1-3 días";
  return "1-2 semanas";
}

/**
 * Get drivers/areas impacted
 */
export function getImpactedDrivers(opportunity: Opportunity): string[] {
  const evidence = opportunity.evidence as OpportunityEvidence | null;
  if (evidence?.drivers?.length) return evidence.drivers;
  
  const source = (opportunity.source || "").toLowerCase();
  const title = opportunity.title.toLowerCase();
  const desc = (opportunity.description || "").toLowerCase();
  const combined = `${source} ${title} ${desc}`;
  
  const drivers: string[] = [];
  
  if (combined.includes("reseña") || combined.includes("rating") || combined.includes("opinión")) {
    drivers.push("Reputación");
  }
  if (combined.includes("venta") || combined.includes("revenue") || combined.includes("ticket")) {
    drivers.push("Ventas");
  }
  if (combined.includes("marketing") || combined.includes("social") || combined.includes("visibilidad")) {
    drivers.push("Marketing");
  }
  if (combined.includes("operación") || combined.includes("tiempo") || combined.includes("eficiencia")) {
    drivers.push("Operaciones");
  }
  if (combined.includes("equipo") || combined.includes("personal") || combined.includes("staff")) {
    drivers.push("Equipo");
  }
  if (combined.includes("producto") || combined.includes("menú") || combined.includes("carta")) {
    drivers.push("Producto");
  }
  if (combined.includes("cliente") || combined.includes("retención") || combined.includes("fidelización")) {
    drivers.push("Retención");
  }
  
  return drivers.length > 0 ? drivers : ["General"];
}

/**
 * Filter and rank opportunities
 */
export function filterAndRankOpportunities(
  opportunities: Opportunity[],
  business: BusinessContext,
  weeklyLimit: number = 8
): {
  published: (Opportunity & { qualityGate: QualityGateResult })[];
  candidates: (Opportunity & { qualityGate: QualityGateResult })[];
} {
  // Run quality gates on all opportunities
  const withGates = opportunities.map(opp => ({
    ...opp,
    qualityGate: runQualityGates(opp, business, opportunities)
  }));
  
  // Separate passed vs candidates
  const passed = withGates.filter(o => o.qualityGate.passed);
  const failed = withGates.filter(o => !o.qualityGate.passed);
  
  // Sort by priority score
  passed.sort((a, b) => b.qualityGate.priorityScore - a.qualityGate.priorityScore);
  
  // Apply weekly limit
  const published = passed.slice(0, weeklyLimit);
  const queued = passed.slice(weeklyLimit);
  
  return {
    published,
    candidates: [...queued, ...failed]
  };
}
