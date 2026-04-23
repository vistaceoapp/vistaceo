import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================================
// COGNITIVE ENGINE V5 - INLINE (Deno doesn't support local imports well)
// =====================================================================

interface LocaleProfile {
  language: string;
  voice: "voseo" | "tuteo" | "neutral";
  formality: "pro" | "casual";
  currency: string;
  lexicon_pack: string;
}

interface RejectedConcept {
  concept_hash: string;
  intent_signature: string | null;
  root_problem_signature: string | null;
  reason: string;
  blocked_until: string | null;
}

interface QualityGateResult {
  gate_id: number;
  name: string;
  passed: boolean;
  reason: string;
}

// Locale detection
function detectLocaleProfile(country: string | null): LocaleProfile {
  const c = (country || "AR").toUpperCase();
  const voseoCountries = ["AR", "UY", "PY", "GT", "HN", "SV", "NI", "CR"];
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

// Text normalization
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

// Concept hash generation
function generateConceptHash(title: string, description: string, source?: string): string {
  const titleKeywords = extractKeywords(title);
  const descKeywords = extractKeywords(description).slice(0, 4);
  const sourceNorm = source ? normalizeText(source).slice(0, 10) : "";
  
  const canonicalParts = [...titleKeywords, ...descKeywords, sourceNorm]
    .filter(Boolean)
    .sort();
  
  const canonicalKey = canonicalParts.join("_");
  const slug = canonicalKey.slice(0, 64);
  
  return `chv3_${slug}`;
}

// Intent signature generation
function generateIntentSignature(title: string, description: string): string {
  const combined = `${title} ${description}`.toLowerCase();
  
  let domain = "operations";
  if (combined.includes("venta") || combined.includes("revenue")) domain = "sales";
  if (combined.includes("market") || combined.includes("social") || combined.includes("instagram")) domain = "marketing";
  if (combined.includes("reseña") || combined.includes("review") || combined.includes("rating")) domain = "reputation";
  if (combined.includes("equipo") || combined.includes("personal")) domain = "team";
  if (combined.includes("menu") || combined.includes("producto")) domain = "product";
  
  let action = "improve";
  if (combined.includes("crear") || combined.includes("lanzar")) action = "create";
  if (combined.includes("responder")) action = "respond";
  if (combined.includes("promocion") || combined.includes("descuento")) action = "promote";
  
  let segment = "all";
  if (combined.includes("almuerzo") || combined.includes("mediodia")) segment = "lunch";
  if (combined.includes("estudiante")) segment = "students";
  if (combined.includes("delivery")) segment = "delivery";
  
  return `${domain}|${action}|${segment}`;
}

// Semantic similarity
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  
  const words1 = normalize(str1).split(/\s+/).filter(w => w.length > 3);
  const words2 = normalize(str2).split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = [...set1].filter(w => set2.has(w)).length;
  const union = new Set([...set1, ...set2]).size;
  
  return union > 0 ? intersection / union : 0;
}

// Quality gates
const BLOCKED_PHRASES = [
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
  "implementar una estrategia", "desarrollar un plan", "considerar la posibilidad"
];

const SPECIFICITY_MARKERS = [
  /\d+%/,
  /\d+\/\d+/,
  /\$[\d,.]+/,
  /\d+\s*(días?|semanas?|meses?|horas?)/,
  /\d+\s*(reseñas?|clientes?|pedidos?|ventas?|registros?)/,
  /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i,
  /(mediodía|almuerzo|cena|desayuno|noche)/i,
  /["']([^"']{3,}?)["']/,
];

function runQualityGates(
  candidate: { title: string; description: string; impact_score: number; effort_score: number; concept_hash: string; intent_signature: string; evidence?: any },
  existingHashes: Set<string>,
  existingSignatures: Set<string>,
  rejectedConcepts: RejectedConcept[]
): { passed: boolean; score: number; gates: QualityGateResult[] } {
  const gates: QualityGateResult[] = [];
  const titleLower = candidate.title.toLowerCase();
  const combined = `${titleLower} ${candidate.description.toLowerCase()}`;
  
  // G1: Specificity
  const hasSpecificData = SPECIFICITY_MARKERS.some(m => m.test(candidate.title));
  const startsGeneric = /^(mejorar|optimizar|aumentar|implementar|crear|desarrollar|establecer|definir)\s/i.test(candidate.title);
  const isTooShort = candidate.title.length < 25;
  gates.push({
    gate_id: 1, name: "Specificity",
    passed: hasSpecificData || (!isTooShort && !startsGeneric),
    reason: hasSpecificData ? "Datos específicos" : startsGeneric ? "Inicio genérico" : "OK"
  });
  
  // G2: Non-Generic
  const hasBlockedPhrase = BLOCKED_PHRASES.some(p => combined.includes(p));
  gates.push({
    gate_id: 2, name: "Non-Generic",
    passed: !hasBlockedPhrase,
    reason: hasBlockedPhrase ? "Frase bloqueada" : "OK"
  });
  
  // G3: Evidence
  const hasEvidence = candidate.evidence?.trigger || candidate.evidence?.signals?.length > 0;
  gates.push({
    gate_id: 3, name: "Evidence",
    passed: !!hasEvidence,
    reason: hasEvidence ? "Evidencia presente" : "Sin evidencia"
  });
  
  // G4: Novelty (concept hash)
  gates.push({
    gate_id: 4, name: "Novelty-Hash",
    passed: !existingHashes.has(candidate.concept_hash),
    reason: existingHashes.has(candidate.concept_hash) ? "Hash duplicado" : "Hash único"
  });
  
  // G5: Not Blocked
  const isRejected = rejectedConcepts.some(r => {
    if (r.blocked_until && new Date(r.blocked_until) < new Date()) return false;
    return r.concept_hash === candidate.concept_hash || r.intent_signature === candidate.intent_signature;
  });
  gates.push({
    gate_id: 5, name: "Not-Blocked",
    passed: !isRejected,
    reason: isRejected ? "Concepto rechazado" : "OK"
  });
  
  // G6: Score Validity
  const hasDefaultScores = candidate.impact_score === 5 && candidate.effort_score === 5;
  gates.push({
    gate_id: 6, name: "Score-Validity",
    passed: !hasDefaultScores,
    reason: hasDefaultScores ? "Scores por defecto" : "Scores evaluados"
  });
  
  // G7: Intent Uniqueness
  gates.push({
    gate_id: 7, name: "Intent-Unique",
    passed: !existingSignatures.has(candidate.intent_signature),
    reason: existingSignatures.has(candidate.intent_signature) ? "Intent duplicado" : "Intent único"
  });
  
  // G8: Voice (no third person)
  const usesThirdPerson = /el dueño|se detectó|el negocio presenta|se identificó/i.test(combined);
  gates.push({
    gate_id: 8, name: "Voice",
    passed: !usesThirdPerson,
    reason: usesThirdPerson ? "Usa tercera persona" : "Voz correcta"
  });
  
  const passedCount = gates.filter(g => g.passed).length;
  const score = Math.round((passedCount / gates.length) * 100);
  
  return { passed: gates.every(g => g.passed), score, gates };
}

// =====================================================================
// RSS FETCHING FOR RESEARCH MODE
// =====================================================================

type RssItem = { title: string; link: string; publishedAt?: string; source?: string };

function countryToGoogleNewsLocale(country: string | null | undefined): { hl: string; gl: string } {
  const c = (country || "AR").toUpperCase();
  switch (c) {
    case "MX": return { hl: "es-419", gl: "MX" };
    case "CL": return { hl: "es-419", gl: "CL" };
    case "CO": return { hl: "es-419", gl: "CO" };
    case "CR": return { hl: "es-419", gl: "CR" };
    case "PA": return { hl: "es-419", gl: "PA" };
    case "US": return { hl: "es-419", gl: "US" };
    case "BR": return { hl: "pt-BR", gl: "BR" };
    case "UY": return { hl: "es-419", gl: "UY" };
    case "AR": default: return { hl: "es-419", gl: "AR" };
  }
}

async function fetchGoogleNewsRss(query: string, locale: { hl: string; gl: string }): Promise<RssItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.gl}:${locale.hl}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "lovable-cloud" } });
    if (!res.ok) return [];

    const xml = await res.text();
    const items: RssItem[] = [];
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    for (const raw of itemMatches.slice(0, 8)) {
      const title = (raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim();
      const link = (raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
      const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
      const source = (raw.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "").trim();
      if (title && link) items.push({ title, link, publishedAt: pubDate || undefined, source: source || undefined });
    }
    return items;
  } catch (e) {
    console.warn(`RSS fetch failed for query "${query}":`, e);
    return [];
  }
}

async function resolveGoogleNewsUrl(googleNewsUrl: string): Promise<string> {
  if (!googleNewsUrl.includes('news.google.com')) return googleNewsUrl;
  try {
    const response = await fetch(googleNewsUrl, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; lovable-bot/1.0)' }
    });
    if (response.url && !response.url.includes('news.google.com')) {
      return response.url;
    }
  } catch (e) {
    console.warn(`URL resolution failed:`, e);
  }
  return googleNewsUrl;
}

// =====================================================================
// SECTOR QUERIES - ULTRA-COMPLETE MAPPING
// =====================================================================

const SECTOR_QUERIES: Record<string, string[]> = {
  // GASTRO
  restaurant_general: ["restaurantes tendencias 2025", "menú restaurante innovación", "delivery restaurantes", "gastronomía experiencias"],
  alta_cocina: ["fine dining tendencias 2025", "restaurantes gourmet", "haute cuisine innovación"],
  parrilla_asador: ["parrillas tendencias 2025", "asador cortes premium", "carnes a la brasa"],
  pizzeria: ["pizzerías tendencias 2025", "pizza artesanal", "pizzería delivery"],
  cafeteria_pasteleria: ["cafeterías specialty coffee 2025", "café especialidad", "pastelería artesanal"],
  heladeria: ["heladerías artesanales 2025", "helados veganos", "gelato italiano"],
  fast_food: ["fast food tendencias 2025", "hamburguesas gourmet", "QSR digitalización"],
  bar_cerveceria: ["bares tendencias 2025", "cervecería artesanal", "cocktails innovación"],
  dark_kitchen: ["dark kitchen tendencias 2025", "ghost kitchen", "virtual brands"],
  
  // RETAIL
  moda_accesorios: ["retail moda tendencias 2025", "tiendas ropa marketing", "moda sostenible"],
  electronica_tecnologia: ["retail electrónica 2025", "tiendas tecnología", "gadgets marketing"],
  farmacia_perfumeria: ["farmacias tendencias 2025", "perfumería retail", "beauty retail"],
  ecommerce_puro: ["ecommerce tendencias 2025", "tienda online", "marketplace estrategias"],
  
  // SALUD
  consultorio_medico: ["consultorios telemedicina 2025", "clínicas privadas", "salud digital"],
  odontologia: ["clínicas dentales 2025", "odontología digital", "ortodoncia invisible"],
  spa_wellness: ["spa wellness tendencias 2025", "centros bienestar", "wellness mindfulness"],
  gimnasio_fitness: ["gimnasios tendencias 2025", "fitness boutique", "gym marketing"],
  peluqueria_barberia: ["peluquerías tendencias 2025", "barbería innovación", "hair salon"],
  
  // TURISMO
  hotel_boutique: ["hotel boutique tendencias 2025", "hoteles experiencia", "hospitality"],
  agencia_viajes: ["agencias viajes 2025", "travel tech", "turismo personalizado"],
  turismo_aventura: ["turismo aventura 2025", "ecoturismo", "outdoor tendencias"],
  
  // SERVICIOS
  consultoria_empresarial: ["consultoría empresas 2025", "consulting innovación", "advisory"],
  agencia_marketing: ["agencias marketing 2025", "marketing digital", "creative agency"],
  coworking: ["coworking tendencias 2025", "espacios flexibles", "workspace"],
  
  // EDUCACION
  instituto_idiomas: ["institutos idiomas 2025", "language learning", "cursos online"],
  capacitacion_corporativa: ["capacitación empresas 2025", "corporate training", "upskilling"],
  elearning_plataforma: ["e-learning tendencias 2025", "edtech innovación", "digital learning"],
  
  // DEFAULT
  general: ["negocios tendencias 2025", "emprendimiento innovación", "pymes marketing digital"]
};

function getSectorQueries(businessType: string, focus: string): string[] {
  const sectorType = businessType?.toLowerCase() || "general";
  const queries = SECTOR_QUERIES[sectorType] || SECTOR_QUERIES.general;
  
  // Add focus-specific queries
  const focusQueries: Record<string, string[]> = {
    ventas: ["aumentar ventas retail 2025", "técnicas venta innovación"],
    reputacion: ["gestión reputación online 2025", "reseñas clientes"],
    marketing: ["marketing digital tendencias 2025", "redes sociales negocios"],
    eficiencia: ["eficiencia operativa 2025", "automatización negocios"],
    equipo: ["gestión equipos 2025", "recursos humanos retail"],
    producto: ["desarrollo producto 2025", "innovación menú"],
    costos: ["reducción costos 2025", "optimización gastos"],
  };
  
  const focusSpecific = focusQueries[focus?.toLowerCase()] || [];
  return [...queries, ...focusSpecific].slice(0, 6);
}

// =====================================================================
// CONTEXT BUILDER
// =====================================================================

function buildAnalysisContext(
  business: any,
  brain: any,
  checkins: any[],
  actions: any[],
  lessons: any[],
  insights: any[],
  externalData: any[],
  signals: any[],
  snapshots: any[],
  focusConfig: any,
  existingItems: any[],
  rejectedConcepts: RejectedConcept[],
  locale: LocaleProfile
): string {
  let context = `## NEGOCIO: ${business.name}
- País: ${business.country || "AR"}
- Categoría: ${brain?.primary_business_type || business.category || "restaurant"}
- Foco actual: ${brain?.current_focus || "ventas"}
- Rating: ${business.avg_rating || "Sin datos"}
- Moneda: ${locale.currency}
- Voz: ${locale.voice === "voseo" ? "Usá vos/voseo (Implementá, Creá, Probá)" : "Usa tú/tuteo (Implementa, Crea, Prueba)"}

## INSTRUCCIONES CRÍTICAS DE LOCALIZACIÓN
${locale.voice === "voseo" ? 
  "OBLIGATORIO: Hablale de VOS al dueño. Usá: vos, tu negocio, implementá, creá, probá, fijate, armá." :
  "OBLIGATORIO: Háblale de TÚ al dueño. Usa: tú, tu negocio, implementa, crea, prueba, fíjate, arma."
}
PROHIBIDO: Tercera persona (El dueño, Se detectó, El negocio presenta)
`;

  // Brain memory
  if (brain) {
    context += `\n## MEMORIA DEL CEREBRO
- Confianza: ${brain.confidence_score || 0}%
- Señales procesadas: ${brain.total_signals || 0}
### Datos factuales:
${JSON.stringify(brain.factual_memory || {}, null, 2)}
### Preferencias:
${JSON.stringify(brain.preferences_memory || {}, null, 2)}
### Decisiones (misiones rechazadas):
${JSON.stringify(brain.decisions_memory || {}, null, 2)}
`;
  }

  // Rejected concepts - CRITICAL for avoiding duplicates
  if (rejectedConcepts.length > 0) {
    context += `\n## ⛔ CONCEPTOS RECHAZADOS (NUNCA SUGERIR)
${rejectedConcepts.map(r => `- "${r.concept_hash}" (${r.reason})`).join("\n")}
`;
  }

  // Existing items for deduplication
  if (existingItems.length > 0) {
    context += `\n## ⚠️ ITEMS EXISTENTES (NO DUPLICAR)
${existingItems.slice(0, 30).map(item => `- "${item.title}"`).join("\n")}
`;
  }

  // Business insights
  if (insights.length > 0) {
    context += `\n## CONOCIMIENTO DEL NEGOCIO (${insights.length} datos)\n`;
    const byCategory: Record<string, any[]> = {};
    for (const insight of insights) {
      const cat = insight.category || "general";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(insight);
    }
    for (const [cat, catInsights] of Object.entries(byCategory)) {
      context += `\n**[${cat.toUpperCase()}]**\n`;
      for (const insight of catInsights.slice(0, 6)) {
        context += `- ${insight.question}: **${insight.answer}**\n`;
      }
    }
  }

  // Checkin analysis
  if (checkins.length > 0) {
    const byDay: Record<string, number[]> = {};
    for (const checkin of checkins) {
      const date = new Date(checkin.created_at);
      const dayName = date.toLocaleDateString("es", { weekday: "long" });
      if (!byDay[dayName]) byDay[dayName] = [];
      byDay[dayName].push(checkin.traffic_level || 3);
    }
    
    const dayStats = Object.entries(byDay).map(([day, traffics]) => ({
      day,
      avg: traffics.reduce((a, b) => a + b, 0) / traffics.length,
      count: traffics.length
    })).sort((a, b) => b.avg - a.avg);
    
    if (dayStats.length >= 2) {
      context += `\n## TRÁFICO
📈 Mejor día: ${dayStats[0].day} (${dayStats[0].avg.toFixed(1)}/5)
📉 Peor día: ${dayStats[dayStats.length-1].day} (${dayStats[dayStats.length-1].avg.toFixed(1)}/5)
`;
    }
  }

  // Recent signals
  if (signals.length > 0) {
    context += `\n## SEÑALES RECIENTES\n`;
    for (const signal of signals.slice(0, 8)) {
      context += `- [${signal.signal_type}] ${signal.raw_text || JSON.stringify(signal.content).slice(0, 80)}\n`;
    }
  }

  // External data (reviews)
  if (externalData.length > 0) {
    const reviews = externalData.filter(d => d.data_type === 'review');
    if (reviews.length > 0) {
      const negativeReviews = reviews.filter(r => (r.sentiment_score || 0) < -0.2);
      context += `\n## RESEÑAS
- Total: ${reviews.length}
- Negativas: ${negativeReviews.length}
`;
      if (negativeReviews.length > 0) {
        context += `Reseñas negativas recientes:\n`;
        for (const review of negativeReviews.slice(0, 3)) {
          const text = review.content?.text?.slice(0, 100) || "Sin texto";
          context += `- ⭐${review.content?.rating || "?"}: "${text}..."\n`;
        }
      }
    }
  }

  return context;
}

// =====================================================================
// MAIN HANDLER
// =====================================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Handle empty or malformed body gracefully
      return new Response(
        JSON.stringify({ error: "Invalid or empty request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { businessId, type } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch business data
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!business) {
      throw new Error("Business not found");
    }

    // ========================================================
    // FREE PLAN ENFORCEMENT (server-side, before AI call)
    // Free: 3 opportunities/mes y 3 research items/mes
    // ========================================================
    const FREE_LIMIT = 3;
    const earlyMode = typeof type === "string" ? type : "opportunities";
    try {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, expires_at")
        .eq("business_id", businessId)
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      const isPro = !!sub;
      if (!isPro) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const table = earlyMode === "research" ? "learning_items" : "opportunities";
        const { count } = await supabase
          .from(table)
          .select("id", { count: "exact", head: true })
          .eq("business_id", businessId)
          .gte("created_at", startOfMonth.toISOString());

        if ((count || 0) >= FREE_LIMIT) {
          console.log(`[analyze-patterns] Free limit reached on ${table}: ${count}/${FREE_LIMIT}`);
          return new Response(
            JSON.stringify({
              error: "free_limit_reached",
              limit: FREE_LIMIT,
              used: count,
              mode: earlyMode,
              upgrade_url: "/checkout",
              message: earlyMode === "research"
                ? "Llegaste al límite de 3 investigaciones del Radar este mes en el plan Free."
                : "Llegaste al límite de 3 oportunidades del Radar este mes en el plan Free.",
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch (quotaErr) {
      // Fail-open: nunca bloquear Pro por un error de chequeo
      console.warn("[analyze-patterns] Quota check failed (fail-open):", quotaErr);
    }

    // Detect locale
    const locale = detectLocaleProfile(business.country);
    console.log(`[analyze-patterns] Locale: ${locale.voice} (${locale.currency})`);

    // Fetch ALL existing items for deduplication
    const [
      existingOppsRes,
      existingMissionsRes,
      existingLearningRes,
      rejectedRes,
      brainRes,
      checkinsRes,
      actionsRes,
      lessonsRes,
      insightsRes,
      externalDataRes,
      signalsRes,
      snapshotsRes,
      focusConfigRes
    ] = await Promise.all([
      supabase.from("opportunities").select("id, title, description, source, concept_hash, intent_signature").eq("business_id", businessId).is("dismissed_at", null),
      supabase.from("missions").select("id, title, description, concept_hash").eq("business_id", businessId),
      supabase.from("learning_items").select("id, title, content, concept_hash, intent_signature").eq("business_id", businessId),
      supabase.from("rejected_concepts").select("concept_hash, intent_signature, root_problem_signature, reason, blocked_until").eq("business_id", businessId),
      supabase.from("business_brains").select("*").eq("business_id", businessId).single(),
      supabase.from("checkins").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("daily_actions").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("lessons").select("*").eq("business_id", businessId).limit(20),
      supabase.from("business_insights").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(50),
      supabase.from("external_data").select("*").eq("business_id", businessId).order("synced_at", { ascending: false }).limit(50),
      supabase.from("signals").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(3),
      supabase.from("business_focus_config").select("*").eq("business_id", businessId).single()
    ]);

    const brain = brainRes.data;
    const rejectedConcepts: RejectedConcept[] = (rejectedRes.data || []).filter(r => {
      if (!r.blocked_until) return true;
      return new Date(r.blocked_until) > new Date();
    });

    // Build existing hashes and signatures sets
    const existingHashes = new Set<string>();
    const existingSignatures = new Set<string>();
    const existingItems: Array<{ id: string; title: string; description: string | null; source?: string }> = [];

    for (const opp of existingOppsRes.data || []) {
      if (opp.concept_hash) existingHashes.add(opp.concept_hash);
      if (opp.intent_signature) existingSignatures.add(opp.intent_signature);
      existingItems.push({ id: opp.id, title: opp.title, description: opp.description, source: opp.source });
    }
    for (const mission of existingMissionsRes.data || []) {
      if (mission.concept_hash) existingHashes.add(mission.concept_hash);
      existingItems.push({ id: mission.id, title: mission.title, description: mission.description });
    }
    for (const learning of existingLearningRes.data || []) {
      if (learning.concept_hash) existingHashes.add(learning.concept_hash);
      if (learning.intent_signature) existingSignatures.add(learning.intent_signature);
    }
    for (const rejected of rejectedConcepts) {
      existingHashes.add(rejected.concept_hash);
      if (rejected.intent_signature) existingSignatures.add(rejected.intent_signature);
    }

    console.log(`[analyze-patterns] Deduplication index: ${existingHashes.size} hashes, ${existingSignatures.size} signatures, ${rejectedConcepts.length} rejected`);

    const mode = typeof type === "string" ? type : "opportunities";

    // Build context
    const analysisContext = buildAnalysisContext(
      business,
      brain,
      checkinsRes.data || [],
      actionsRes.data || [],
      lessonsRes.data || [],
      insightsRes.data || [],
      externalDataRes.data || [],
      signalsRes.data || [],
      snapshotsRes.data || [],
      focusConfigRes.data,
      existingItems,
      rejectedConcepts,
      locale
    );

    // =====================================================================
    // RESEARCH MODE (I+D EXTERNO)
    // =====================================================================
    if (mode === "research") {
      const newsLocale = countryToGoogleNewsLocale(business.country);
      const sectorType = brain?.primary_business_type || business.category || "general";
      const focusHint = brain?.current_focus || "ventas";
      const queries = getSectorQueries(sectorType, focusHint);

      // Fetch RSS feeds in parallel
      const rssResults = await Promise.all(
        queries.map(q => fetchGoogleNewsRss(q, newsLocale))
      );
      const allRssItems = rssResults.flat().slice(0, 20);

      if (allRssItems.length === 0) {
        return new Response(
          JSON.stringify({ success: true, learningCreated: 0, message: "No external sources found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rssContext = allRssItems.map((it, idx) => 
        `${idx + 1}. ${it.title}\n   url: ${it.link}${it.source ? `\n   fuente: ${it.source}` : ""}`
      ).join("\n\n");

      const researchPrompt = `Sos un analista de mercado experto. Analizá estas noticias y tendencias del sector ${sectorType} y generá insights de I+D para ${business.name}.

## NOTICIAS RECIENTES:
${rssContext}

## CONTEXTO DEL NEGOCIO:
${analysisContext}

## REGLAS:
1. Generá máximo 4 insights de I+D de alta calidad
2. Cada insight DEBE incluir al menos 1 fuente real (URL de las noticias)
3. ${locale.voice === "voseo" ? "Hablale de VOS al dueño" : "Háblale de TÚ al dueño"}
4. NO generar recomendaciones internas (responder reseñas, optimizar procesos)
5. Enfocate en TENDENCIAS EXTERNAS aplicables al negocio
6. Cada título debe ser específico y mencionar la tendencia concreta

## FORMATO JSON:
{
  "learning_items": [
    {
      "title": "Título específico de la tendencia",
      "content": "Análisis de la tendencia y por qué es relevante",
      "item_type": "trend|case_study|innovation|market_signal",
      "category": "consumo|tecnologia|competencia|mercado|regulacion",
      "freshness": "2025-01",
      "transferability": "alta|media|baja",
      "why_applies": "Por qué esto aplica específicamente a tu negocio",
      "sources": [
        {"title": "Título artículo", "url": "URL real", "publisher": "Nombre medio"}
      ],
      "action_steps": ["Paso 1", "Paso 2"]
    }
  ]
}`;

      console.log(`[analyze-patterns] Research mode: ${allRssItems.length} RSS items`);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", // Downgraded from pro: flash handles market analysis well
          messages: [
            { role: "system", content: "Sos un analista de mercado experto. Generás insights de I+D basados en fuentes reales." },
            { role: "user", content: researchPrompt }
          ],
          temperature: 0.3,
          max_tokens: 6000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiData = await response.json();
      const aiMessage = aiData.choices?.[0]?.message?.content || "";

      let analysis;
      try {
        const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn("[analyze-patterns] No JSON found in research response, length:", aiMessage.length);
          analysis = { learning_items: [] };
        } else {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.error("[analyze-patterns] Failed to parse research response, attempting repair...");
        // Try to repair truncated JSON by closing brackets
        try {
          let raw = aiMessage.match(/\{[\s\S]*/)?.[0] || "";
          // Close any unclosed arrays and objects
          const openBrackets = (raw.match(/\[/g) || []).length - (raw.match(/\]/g) || []).length;
          const openBraces = (raw.match(/\{/g) || []).length - (raw.match(/\}/g) || []).length;
          for (let i = 0; i < openBrackets; i++) raw += "]";
          for (let i = 0; i < openBraces; i++) raw += "}";
          analysis = JSON.parse(raw);
        } catch {
          console.error("[analyze-patterns] JSON repair failed, skipping research");
          analysis = { learning_items: [] };
        }
      }

      let learningInserted = 0;
      let learningFiltered = 0;

      for (const it of analysis.learning_items || []) {
        const title = String(it?.title || "").trim();
        const content = String(it?.content || "").trim();
        
        if (!title || title.length < 15 || !content || content.length < 50) {
          learningFiltered++;
          continue;
        }

        // Generate concept hash
        const conceptHash = generateConceptHash(title, content, "research");
        const intentSignature = generateIntentSignature(title, content);

        // Check if already exists
        if (existingHashes.has(conceptHash)) {
          console.log(`Filtered: duplicate hash - "${title}"`);
          learningFiltered++;
          continue;
        }

        // Check semantic similarity
        const isDupe = existingItems.some(ex => 
          calculateSimilarity(title, ex.title) > 0.5 ||
          calculateSimilarity(`${title} ${content}`, `${ex.title} ${ex.description || ""}`) > 0.55
        );
        if (isDupe) {
          console.log(`Filtered: semantic duplicate - "${title}"`);
          learningFiltered++;
          continue;
        }

        // Resolve source URL
        const sources = Array.isArray(it?.sources) ? it.sources : [];
        const firstSource = sources.find((s: any) => s?.url?.startsWith("http"));
        let resolvedUrl = firstSource?.url || "";
        let sourcePublisher = firstSource?.publisher || "Fuente";

        if (resolvedUrl.includes('news.google.com')) {
          try {
            resolvedUrl = await resolveGoogleNewsUrl(resolvedUrl);
            const urlObj = new URL(resolvedUrl);
            sourcePublisher = urlObj.hostname.replace('www.', '');
          } catch { /* keep original */ }
        }

        const enrichedContent = `${content}\n\n**Por qué aplica a tu negocio:** ${it.why_applies || "Relevante para tu sector."}\n\n**Fuente:** [${firstSource?.title || sourcePublisher}](${resolvedUrl || "#"})`;

        const { error: insertErr } = await supabase.from("learning_items").insert({
          business_id: businessId,
          title,
          content: enrichedContent,
          item_type: it.item_type || "insight",
          source: resolvedUrl || "mercado",
          action_steps: Array.isArray(it.action_steps) ? it.action_steps : [],
          is_read: false,
          is_saved: false,
          concept_hash: conceptHash,
          intent_signature: intentSignature,
        });

        if (!insertErr) {
          learningInserted++;
          existingHashes.add(conceptHash);
          console.log(`Inserted research: "${title}"`);
        }
      }

      // Create notification if items inserted
      if (learningInserted > 0) {
        await supabase.from("insight_notifications").insert({
          business_id: businessId,
          notification_type: "new_research",
          title: `${learningInserted} nuevo${learningInserted > 1 ? 's' : ''} insight${learningInserted > 1 ? 's' : ''} de I+D`,
          message: `Se detectaron ${learningInserted} tendencia${learningInserted > 1 ? 's' : ''} externa${learningInserted > 1 ? 's' : ''} relevante${learningInserted > 1 ? 's' : ''} para tu sector.`,
          insights_count: learningInserted,
        });
      }

      console.log(`[analyze-patterns] Research complete: ${learningInserted} inserted, ${learningFiltered} filtered`);

      return new Response(
        JSON.stringify({ success: true, learningCreated: learningInserted, learningFiltered }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================================
    // OPPORTUNITIES MODE (INTERNO)
    // =====================================================================
    
    const opportunitiesPrompt = `Sos un asesor de negocios experto para ${brain?.primary_business_type || "restaurantes"}. Analizá el contexto y generá oportunidades de mejora ULTRA-ESPECÍFICAS.

${analysisContext}

## REGLAS DE ORO:
1. ❌ PROHIBIDO títulos genéricos tipo "Mejorar X" o "Optimizar Y"
2. ✅ OBLIGATORIO incluir DATOS CONCRETOS en cada título (%, números, días, productos)
3. ${locale.voice === "voseo" ? "✅ Hablale de VOS (implementá, creá, probá, fijate)" : "✅ Háblale de TÚ (implementa, crea, prueba, fíjate)"}
4. ❌ PROHIBIDO tercera persona (El dueño, Se detectó, El negocio)
5. 📊 Máximo 3 oportunidades de ALTA calidad
6. 🎯 Cada oportunidad resuelve UN problema específico
7. ❌ NO repetir conceptos de items existentes

## FORMATO DE TÍTULO (minúsculas naturales):
"[Acción específica]: [dato concreto del negocio]"

Ejemplos CORRECTOS:
✅ "Lanzar combo de mediodía: el 85% de tus clientes viene entre 12-14hs"
✅ "Responder las 4 reseñas negativas de esta semana"
✅ "Promoción para miércoles: es tu peor día con solo 2.1/5 de tráfico"

## FORMATO JSON:
{
  "opportunities": [
    {
      "title": "Título ultra-específico con dato concreto",
      "description": "Explicación basada en evidencia real, hablando directo al dueño",
      "impact_score": 1-10 (NO usar 5 por defecto),
      "effort_score": 1-10 (NO usar 5 por defecto),
      "source": "diagnóstico|tráfico|reseñas|ventas|marketing|equipo",
      "evidence": {
        "trigger": "¿Qué dato disparó esto?",
        "signals": ["señal 1", "señal 2"],
        "dataPoints": número,
        "basedOn": ["fuente específica"]
      },
      "ai_plan": {
        "version": 1,
        "summary": "Resumen de 1 línea",
        "steps": [
          {"id": "1", "do": "Acción concreta", "why": "Por qué", "eta_days": 1, "kpi": "Métrica"}
        ]
      }
    }
  ]
}`;

    console.log(`[analyze-patterns] Opportunities mode for: ${business.name}`);
    console.log(`[analyze-patterns] Context size: ${analysisContext.length} chars`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Downgraded from pro: flash handles opportunity analysis well
        messages: [
          { role: "system", content: `Sos un asesor de negocios experto. ${locale.voice === "voseo" ? "Hablás de vos." : "Hablas de tú."}` },
          { role: "user", content: opportunitiesPrompt }
        ],
        temperature: 0.25,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content || "";

    let analysis;
    try {
      const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("[analyze-patterns] No JSON found in opportunities response, length:", aiMessage.length);
        analysis = { opportunities: [] };
      } else {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("[analyze-patterns] Failed to parse opportunities response, attempting repair...");
      try {
        let raw = aiMessage.match(/\{[\s\S]*/)?.[0] || "";
        const openBrackets = (raw.match(/\[/g) || []).length - (raw.match(/\]/g) || []).length;
        const openBraces = (raw.match(/\{/g) || []).length - (raw.match(/\}/g) || []).length;
        for (let i = 0; i < openBrackets; i++) raw += "]";
        for (let i = 0; i < openBraces; i++) raw += "}";
        analysis = JSON.parse(raw);
      } catch {
        console.error("[analyze-patterns] JSON repair failed for opportunities");
        analysis = { opportunities: [] };
      }
    }

    let opportunitiesInserted = 0;
    let opportunitiesFiltered = 0;

    for (const opp of analysis.opportunities || []) {
      const title = String(opp?.title || "").trim();
      const description = String(opp?.description || "").trim();
      
      if (!title || title.length < 10 || !description || description.length < 20) {
        opportunitiesFiltered++;
        continue;
      }

      // Generate hashes
      const conceptHash = generateConceptHash(title, description, opp.source);
      const intentSignature = generateIntentSignature(title, description);

      // Run quality gates
      const gateResult = runQualityGates(
        {
          title,
          description,
          impact_score: opp.impact_score || 5,
          effort_score: opp.effort_score || 5,
          concept_hash: conceptHash,
          intent_signature: intentSignature,
          evidence: opp.evidence
        },
        existingHashes,
        existingSignatures,
        rejectedConcepts
      );

      if (!gateResult.passed) {
        const failedGates = gateResult.gates.filter(g => !g.passed).map(g => g.name);
        console.log(`Filtered by gates (${failedGates.join(", ")}): "${title}"`);
        opportunitiesFiltered++;
        continue;
      }

      // Check semantic similarity as final check
      const isDupe = existingItems.some(ex => 
        calculateSimilarity(title, ex.title) > 0.5 ||
        calculateSimilarity(`${title} ${description}`, `${ex.title} ${ex.description || ""}`) > 0.55
      );
      if (isDupe) {
        console.log(`Filtered: semantic duplicate - "${title}"`);
        opportunitiesFiltered++;
        continue;
      }

      // Insert opportunity with all new fields
      const { error: insertError } = await supabase.from("opportunities").insert({
        business_id: businessId,
        title,
        description,
        source: opp.source || "diagnóstico",
        impact_score: opp.impact_score || 5,
        effort_score: opp.effort_score || 5,
        evidence: opp.evidence || {},
        concept_hash: conceptHash,
        intent_signature: intentSignature,
        ai_plan_json: opp.ai_plan || {},
        quality_gate_score: gateResult.score,
        quality_gate_details: { gates: gateResult.gates }
      });

      if (!insertError) {
        opportunitiesInserted++;
        existingHashes.add(conceptHash);
        existingSignatures.add(intentSignature);
        existingItems.push({ id: "", title, description, source: opp.source });
        console.log(`Inserted opportunity: "${title}" (score: ${gateResult.score})`);
      }
    }

    // Create notification if items inserted
    if (opportunitiesInserted > 0) {
      await supabase.from("insight_notifications").insert({
        business_id: businessId,
        notification_type: "new_opportunities",
        title: `${opportunitiesInserted} nueva${opportunitiesInserted > 1 ? 's' : ''} oportunidad${opportunitiesInserted > 1 ? 'es' : ''}`,
        message: `El análisis inteligente encontró ${opportunitiesInserted} oportunidad${opportunitiesInserted > 1 ? 'es' : ''} basada${opportunitiesInserted > 1 ? 's' : ''} en los datos de tu negocio.`,
        insights_count: opportunitiesInserted,
      });
    }

    console.log(`[analyze-patterns] Opportunities complete: ${opportunitiesInserted} inserted, ${opportunitiesFiltered} filtered`);

    return new Response(
      JSON.stringify({
        success: true,
        opportunitiesCreated: opportunitiesInserted,
        opportunitiesFiltered,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Pattern analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
