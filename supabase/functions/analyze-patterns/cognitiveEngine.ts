// =====================================================================
// COGNITIVE OS V5 - CORE ENGINE
// Ultra-intelligent deduplication, quality gates, and concept management
// =====================================================================

// =====================================================================
// TYPES
// =====================================================================

export interface IntentJSON {
  domain: string;
  objective: string;
  lever: string;
  action: string;
  object: string;
  segment: string;
  channel: string;
  constraints: string[];
  kpis: string[];
  time_horizon: string;
  geo: string | null;
  offer_or_product: string | null;
}

export interface OpportunityCandidate {
  idempotency_key: string;
  concept_hash: string;
  intent_signature: string;
  root_problem_signature: string;
  intent_json: IntentJSON;
  title: string;
  summary: string;
  description: string;
  hypothesis: {
    because: string;
    expected_outcome: string;
    risk: string | null;
    mitigation: string | null;
  };
  scores: {
    impact: number;
    effort: number;
    confidence: number;
    justification: {
      impact: string;
      effort: string;
      confidence: string;
    };
  };
  kpis: {
    primary: string[];
    secondary: string[];
    proxy_if_missing: string;
  };
  evidence: {
    trigger: string;
    signals: string[];
    based_on_context_hash: string;
    assumptions: string[];
  };
  ai_plan: {
    version: number;
    type: string;
    summary: string;
    steps: Array<{
      id: string;
      do: string;
      why: string;
      owner: string;
      eta_days: number;
      kpi: string;
      definition_of_done: string;
    }>;
    generated_at_iso: string;
  };
  localization: {
    language: string;
    voice: string;
    currency: string;
  };
}

export interface QualityGateResult {
  passed: boolean;
  gate_id: number;
  name: string;
  reason: string;
}

export interface LocaleProfile {
  language: string;
  voice: "voseo" | "tuteo" | "neutral";
  formality: "pro" | "casual";
  currency: string;
  lexicon_pack: string;
}

export interface RejectedConcept {
  concept_hash: string;
  intent_signature: string | null;
  root_problem_signature: string | null;
  reason: string;
  blocked_until: string | null;
}

// =====================================================================
// LOCALE DETECTION
// =====================================================================

export function detectLocaleProfile(country: string | null): LocaleProfile {
  const c = (country || "AR").toUpperCase();
  
  // Voseo countries (Argentina, Uruguay, Paraguay, parts of Central America)
  const voseoCountries = ["AR", "UY", "PY", "GT", "HN", "SV", "NI", "CR"];
  // Tuteo countries (Mexico, Spain, most of LATAM)
  const tuteoCountries = ["MX", "ES", "PE", "EC", "VE", "CL", "CO", "BO", "DO", "PR", "CU", "PA"];
  
  const voice = voseoCountries.includes(c) ? "voseo" : 
                tuteoCountries.includes(c) ? "tuteo" : "neutral";
  
  const currencyMap: Record<string, string> = {
    AR: "ARS", MX: "MXN", CL: "CLP", CO: "COP", PE: "PEN",
    UY: "UYU", PY: "PYG", BO: "BOB", EC: "USD", VE: "USD",
    BR: "BRL", US: "USD", ES: "EUR", CR: "CRC", PA: "USD"
  };
  
  return {
    language: c === "BR" ? "pt-BR" : "es",
    voice,
    formality: "pro",
    currency: currencyMap[c] || "USD",
    lexicon_pack: c
  };
}

// =====================================================================
// CONCEPT HASH GENERATION (V3 - Deterministic)
// =====================================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, "_")
    .trim();
}

function extractKeywords(text: string, minLen = 4): string[] {
  const stopwords = new Set([
    "para", "como", "este", "esta", "estos", "estas", "una", "uno", "unos", "unas",
    "que", "con", "del", "los", "las", "por", "mas", "pero", "cuando", "donde",
    "porque", "como", "sobre", "entre", "puede", "pueden", "hacer", "hace",
    "mejorar", "optimizar", "aumentar", "incrementar", "implementar", "crear",
    "desarrollar", "establecer", "definir", "realizar", "ejecutar", "gestionar"
  ]);
  
  return normalizeText(text)
    .split("_")
    .filter(w => w.length >= minLen && !stopwords.has(w))
    .slice(0, 8);
}

export function generateIntentSignature(intent: Partial<IntentJSON>): string {
  const parts = [
    intent.domain || "general",
    intent.objective || "improve",
    intent.lever || "unknown",
    intent.action || "do",
    intent.object || "thing",
    intent.segment || "all",
    intent.channel || "any"
  ];
  return parts.map(p => normalizeText(p)).join("|");
}

export function generateRootProblemSignature(
  domain: string,
  rootProblem: string,
  segment: string
): string {
  return [
    normalizeText(domain),
    normalizeText(rootProblem),
    normalizeText(segment)
  ].join("|");
}

export function generateConceptHash(
  title: string,
  description: string,
  source?: string
): string {
  // Extract core keywords from title and description
  const titleKeywords = extractKeywords(title);
  const descKeywords = extractKeywords(description).slice(0, 4);
  const sourceNorm = source ? normalizeText(source) : "";
  
  // Build canonical key
  const canonicalParts = [
    ...titleKeywords,
    ...descKeywords,
    sourceNorm
  ].filter(Boolean).sort();
  
  const canonicalKey = canonicalParts.join("_");
  
  // Generate stable slug
  const slug = canonicalKey.slice(0, 64);
  
  return `chv3_${slug}`;
}

// Infer intent from title/description using heuristics
export function inferIntentFromText(
  title: string,
  description: string,
  businessType: string,
  focus: string
): IntentJSON {
  const combined = `${title} ${description}`.toLowerCase();
  
  // Domain inference
  let domain = "operations";
  if (combined.includes("venta") || combined.includes("revenue") || combined.includes("factur")) domain = "sales";
  if (combined.includes("market") || combined.includes("social") || combined.includes("instagram") || combined.includes("promoci")) domain = "marketing";
  if (combined.includes("reseña") || combined.includes("review") || combined.includes("rating") || combined.includes("reputac")) domain = "reputation";
  if (combined.includes("equipo") || combined.includes("personal") || combined.includes("staff") || combined.includes("emplead")) domain = "team";
  if (combined.includes("menu") || combined.includes("producto") || combined.includes("carta") || combined.includes("plato")) domain = "product";
  if (combined.includes("costo") || combined.includes("gasto") || combined.includes("precio")) domain = "costs";
  
  // Action inference
  let action = "improve";
  if (combined.includes("crear") || combined.includes("lanzar") || combined.includes("nuevo")) action = "create";
  if (combined.includes("responder") || combined.includes("contestar")) action = "respond";
  if (combined.includes("promocion") || combined.includes("descuento") || combined.includes("oferta")) action = "promote";
  if (combined.includes("capacitar") || combined.includes("entrenar")) action = "train";
  if (combined.includes("analizar") || combined.includes("medir")) action = "analyze";
  
  // Object extraction (what is being acted upon)
  let object = "general";
  const objectPatterns = [
    { pattern: /reseña|review/i, obj: "reviews" },
    { pattern: /menu|carta|plato/i, obj: "menu" },
    { pattern: /promocion|oferta|descuento/i, obj: "promotion" },
    { pattern: /horario|turno|jornada/i, obj: "schedule" },
    { pattern: /precio|tarifa/i, obj: "pricing" },
    { pattern: /equipo|personal|staff/i, obj: "team" },
    { pattern: /cliente|consumidor/i, obj: "customers" },
    { pattern: /delivery|envio|pedido/i, obj: "delivery" },
    { pattern: /instagram|facebook|red social/i, obj: "social_media" },
  ];
  for (const { pattern, obj } of objectPatterns) {
    if (pattern.test(combined)) {
      object = obj;
      break;
    }
  }
  
  // Segment inference
  let segment = "all_customers";
  if (combined.includes("almuerzo") || combined.includes("mediodia")) segment = "lunch_crowd";
  if (combined.includes("estudiante") || combined.includes("universidad")) segment = "students";
  if (combined.includes("familiar") || combined.includes("familia")) segment = "families";
  if (combined.includes("noche") || combined.includes("cena")) segment = "dinner_crowd";
  if (combined.includes("delivery") || combined.includes("envio")) segment = "delivery_customers";
  if (combined.includes("turista") || combined.includes("visitante")) segment = "tourists";
  
  // Channel inference
  let channel = "in_store";
  if (combined.includes("instagram") || combined.includes("facebook") || combined.includes("tiktok")) channel = "social_media";
  if (combined.includes("google") || combined.includes("maps") || combined.includes("reseña")) channel = "google";
  if (combined.includes("delivery") || combined.includes("rappi") || combined.includes("pedidos")) channel = "delivery_apps";
  if (combined.includes("whatsapp") || combined.includes("telefon")) channel = "direct_contact";
  
  return {
    domain,
    objective: focus || "growth",
    lever: domain,
    action,
    object,
    segment,
    channel,
    constraints: [],
    kpis: [],
    time_horizon: "short_term",
    geo: null,
    offer_or_product: null
  };
}

// =====================================================================
// QUALITY GATES V5 (15 GATES)
// =====================================================================

const BLOCKED_PHRASES = [
  // Ultra-generic advice (never use)
  "mejorar ventas", "aumentar clientes", "optimizar operaciones",
  "mejorar servicio", "incrementar ingresos", "mejorar negocio",
  "hacer crecer", "optimizar procesos", "mejorar rendimiento",
  "aumentar ventas", "mejorar calidad", "incrementar productividad",
  "maximizar beneficios", "potenciar resultados", "aumentar ganancias",
  "mejorar eficiencia", "optimizar marketing", "mejorar marketing",
  "aumentar marketing", "estrategia de marketing", "aumentar ejecución",
  "optimizar proceso de", "estrategia de retención", "sistema de check-in",
  "implementar check-ins", "ofertas para", "promociones para",
  "optimizar la", "mejorar la", "aumentar la", "optimizar el",
  "mejorar el", "aumentar el", "capacitación del personal",
  "retención de personal", "comunicación del equipo", "presencia en redes",
  "visibilidad online", "experiencia del cliente", "proceso de marketing",
  "proceso de capacitación", "proceso de ventas", "proceso de servicio",
  "implementar una estrategia", "desarrollar un plan", "considerar la posibilidad"
];

const SPECIFICITY_MARKERS = [
  /\d+%/, // Percentage
  /\d+\/\d+/, // Ratio
  /\$[\d,.]+/, // Money
  /\d+\s*(días?|semanas?|meses?|horas?)/, // Time duration
  /\d+\s*(reseñas?|clientes?|pedidos?|ventas?|registros?)/, // Counts
  /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i, // Days
  /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i, // Months
  /(mediodía|almuerzo|cena|desayuno|noche)/i, // Dayparts
  /["']([^"']{3,}?)["']/, // Quoted specific items
];

export function runQualityGatesV5(
  candidate: {
    title: string;
    description: string;
    impact_score: number;
    effort_score: number;
    concept_hash: string;
    intent_signature: string;
    root_problem_signature: string;
    evidence?: any;
  },
  existingHashes: Set<string>,
  existingSignatures: Set<string>,
  rejectedConcepts: RejectedConcept[],
  locale: LocaleProfile
): { passed: boolean; score: number; gates: QualityGateResult[] } {
  const gates: QualityGateResult[] = [];
  const titleLower = candidate.title.toLowerCase();
  const descLower = candidate.description.toLowerCase();
  const combined = `${titleLower} ${descLower}`;
  
  // G1: Specificity - Title must have structure with data
  const hasSpecificData = SPECIFICITY_MARKERS.some(m => m.test(candidate.title));
  const isShort = candidate.title.length < 25;
  const startsGeneric = /^(mejorar|optimizar|aumentar|implementar|crear|desarrollar|establecer|definir)\s/i.test(candidate.title);
  
  gates.push({
    gate_id: 1,
    name: "Specificity",
    passed: hasSpecificData || (!isShort && !startsGeneric),
    reason: hasSpecificData ? "Contiene datos específicos" : 
            (isShort || startsGeneric) ? "Título genérico o muy corto" : "OK"
  });
  
  // G2: Non-Generic - No blocked phrases
  const hasBlockedPhrase = BLOCKED_PHRASES.some(p => combined.includes(p));
  gates.push({
    gate_id: 2,
    name: "Non-Generic",
    passed: !hasBlockedPhrase,
    reason: hasBlockedPhrase ? "Contiene frase genérica bloqueada" : "Sin frases genéricas"
  });
  
  // G3: Evidence Integrity - Must have real signals
  const hasEvidence = candidate.evidence && (
    candidate.evidence.trigger ||
    (candidate.evidence.signals && candidate.evidence.signals.length > 0)
  );
  gates.push({
    gate_id: 3,
    name: "Evidence",
    passed: !!hasEvidence,
    reason: hasEvidence ? "Evidencia presente" : "Sin evidencia real"
  });
  
  // G4: Feasibility (placeholder - always passes for now)
  gates.push({
    gate_id: 4,
    name: "Feasibility",
    passed: true,
    reason: "Dentro de restricciones"
  });
  
  // G5: Novelty Global - Not in existing hashes
  const isDuplicateHash = existingHashes.has(candidate.concept_hash);
  gates.push({
    gate_id: 5,
    name: "Novelty-Hash",
    passed: !isDuplicateHash,
    reason: isDuplicateHash ? "Concept hash duplicado" : "Hash único"
  });
  
  // G6: Not Blocked - Check rejected concepts
  const isRejected = rejectedConcepts.some(r => {
    const hashMatch = r.concept_hash === candidate.concept_hash;
    const signatureMatch = r.intent_signature === candidate.intent_signature;
    const rootMatch = r.root_problem_signature === candidate.root_problem_signature;
    
    // Check if still blocked
    if (r.blocked_until) {
      const blockedDate = new Date(r.blocked_until);
      if (blockedDate < new Date()) return false; // Expired
    }
    
    return hashMatch || signatureMatch || rootMatch;
  });
  gates.push({
    gate_id: 6,
    name: "Not-Blocked",
    passed: !isRejected,
    reason: isRejected ? "Concepto rechazado previamente" : "No bloqueado"
  });
  
  // G7: Score Validity - No default 5/5
  const hasDefaultScores = candidate.impact_score === 5 && candidate.effort_score === 5;
  gates.push({
    gate_id: 7,
    name: "Score-Validity",
    passed: !hasDefaultScores,
    reason: hasDefaultScores ? "Scores por defecto (5/5)" : "Scores evaluados"
  });
  
  // G8: Measurement - Has KPIs (check in evidence or description)
  const mentionsKPI = /\d+%|\+\d+|\-\d+|rating|reseña|venta|cliente|ticket|pedido/i.test(combined);
  gates.push({
    gate_id: 8,
    name: "Measurement",
    passed: mentionsKPI,
    reason: mentionsKPI ? "Métricas mencionadas" : "Sin métricas claras"
  });
  
  // G9: Localization - Check voice consistency
  const usesThirdPerson = /el dueño|se detectó|el negocio presenta|se identificó/i.test(combined);
  gates.push({
    gate_id: 9,
    name: "Localization",
    passed: !usesThirdPerson,
    reason: usesThirdPerson ? "Usa tercera persona" : "Voz correcta"
  });
  
  // G10: Safety/Compliance (placeholder)
  gates.push({
    gate_id: 10,
    name: "Safety",
    passed: true,
    reason: "Contenido seguro"
  });
  
  // G11: Root Problem Uniqueness - Check signature
  const isDuplicateSignature = existingSignatures.has(candidate.intent_signature);
  gates.push({
    gate_id: 11,
    name: "Root-Unique",
    passed: !isDuplicateSignature,
    reason: isDuplicateSignature ? "Intent signature duplicada" : "Intent único"
  });
  
  // G12: Actionability - Has clear action verb
  const hasActionVerb = /^(lanz|respond|cre|implement|arm|prob|med|analiz|revis|activ|configur|contact|envi|public)/i.test(candidate.title);
  gates.push({
    gate_id: 12,
    name: "Actionability",
    passed: hasActionVerb || hasSpecificData,
    reason: hasActionVerb ? "Acción clara" : hasSpecificData ? "Datos específicos" : "Sin acción clara"
  });
  
  // G13: Timing Fit (placeholder - always passes)
  gates.push({
    gate_id: 13,
    name: "Timing-Fit",
    passed: true,
    reason: "Timing apropiado"
  });
  
  // G14: User Fit (placeholder - would need user style model)
  gates.push({
    gate_id: 14,
    name: "User-Fit",
    passed: true,
    reason: "Adecuado al usuario"
  });
  
  // G15: Learning Value - Must add real value
  const contentLength = candidate.description.length;
  gates.push({
    gate_id: 15,
    name: "Learning-Value",
    passed: contentLength >= 50,
    reason: contentLength >= 50 ? "Contenido sustancial" : "Contenido insuficiente"
  });
  
  // Calculate overall score and result
  const passedCount = gates.filter(g => g.passed).length;
  const score = Math.round((passedCount / gates.length) * 100);
  const allPassed = gates.every(g => g.passed);
  
  return { passed: allPassed, score, gates };
}

// =====================================================================
// SEMANTIC SIMILARITY (Enhanced)
// =====================================================================

export function calculateSemanticSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  
  const s1 = normalize(str1);
  const s2 = normalize(str2);
  
  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  // Jaccard similarity
  const intersection = [...set1].filter(w => set2.has(w)).length;
  const union = new Set([...set1, ...set2]).size;
  
  return union > 0 ? intersection / union : 0;
}

// Check if two items are semantically similar (near-dupes)
export function isNearDuplicate(
  newItem: { title: string; description: string },
  existingItems: Array<{ title: string; description: string | null }>,
  titleThreshold = 0.5,
  combinedThreshold = 0.55
): { isDuplicate: boolean; matchedTitle?: string } {
  for (const existing of existingItems) {
    const titleSim = calculateSemanticSimilarity(newItem.title, existing.title);
    if (titleSim > titleThreshold) {
      return { isDuplicate: true, matchedTitle: existing.title };
    }
    
    const newCombined = `${newItem.title} ${newItem.description}`;
    const existCombined = `${existing.title} ${existing.description || ""}`;
    const combinedSim = calculateSemanticSimilarity(newCombined, existCombined);
    if (combinedSim > combinedThreshold) {
      return { isDuplicate: true, matchedTitle: existing.title };
    }
  }
  
  return { isDuplicate: false };
}

// =====================================================================
// LOCALIZED TEXT GENERATION
// =====================================================================

export function getLocalizedVerbs(voice: "voseo" | "tuteo" | "neutral"): Record<string, string> {
  if (voice === "voseo") {
    return {
      implement: "Implementá",
      create: "Creá",
      respond: "Respondé",
      analyze: "Analizá",
      launch: "Lanzá",
      activate: "Activá",
      configure: "Configurá",
      contact: "Contactá",
      review: "Revisá",
      try: "Probá",
      measure: "Medí",
      send: "Enviá",
      publish: "Publicá",
      add: "Agregá",
      remove: "Eliminá",
      change: "Cambiá",
      improve: "Mejorá",
      focus: "Enfocate",
      check: "Fijate"
    };
  }
  
  // Tuteo (Mexico, Spain, etc.)
  return {
    implement: "Implementa",
    create: "Crea",
    respond: "Responde",
    analyze: "Analiza",
    launch: "Lanza",
    activate: "Activa",
    configure: "Configura",
    contact: "Contacta",
    review: "Revisa",
    try: "Prueba",
    measure: "Mide",
    send: "Envía",
    publish: "Publica",
    add: "Agrega",
    remove: "Elimina",
    change: "Cambia",
    improve: "Mejora",
    focus: "Enfócate",
    check: "Fíjate"
  };
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    ARS: "$", MXN: "$", CLP: "$", COP: "$", PEN: "S/",
    UYU: "$", USD: "US$", EUR: "€", BRL: "R$"
  };
  
  const symbol = symbols[currency] || "$";
  
  // Format with thousands separator
  const formatted = amount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${symbol}${formatted}`;
}
