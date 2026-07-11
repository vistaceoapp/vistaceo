import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { validateBeforeStore } from "../_shared/validate-before-store.ts";
import { sanitizeAIOutput, containsForbidden } from "../_shared/ai-output-sanitizer.ts";
import { humanizeEvidence } from "../_shared/humanize-evidence.ts";
import { hyperPersonalizationCheck, type HyperAnchors } from "../_shared/brain-core/hyper-personalization-gate.ts";

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
// BUSINESS PRIORITIES ENGINE (Diagnóstico previo a la generación)
// =====================================================================

interface BusinessPriorities {
  weakest_dimension: string;
  weakest_score: number;
  strongest_dimension: string;
  strongest_score: number;
  main_goal: string;
  covered_areas: string[]; // áreas ya saturadas por oportunidades previas
  underworked_areas: string[]; // áreas poco trabajadas → priorizar diversidad
  effort_capacity: "baja" | "media" | "alta";
  risks: string[];
  recommended_focus: string; // dimensión a atacar primero
  recommended_reason: string;
}

const ALL_AREAS = [
  "ventas", "marketing", "operaciones", "reputacion", "finanzas",
  "equipo", "producto", "retencion", "web", "local_maps", "ide"
];

function inferAreaFromSource(source: string | null | undefined): string {
  const s = (source || "").toLowerCase();
  if (s.includes("venta") || s.includes("trafico") || s.includes("tráfico")) return "ventas";
  if (s.includes("reseñ") || s.includes("reseña") || s.includes("review") || s.includes("reputa")) return "reputacion";
  if (s.includes("marketing") || s.includes("redes") || s.includes("social")) return "marketing";
  if (s.includes("operac") || s.includes("proceso")) return "operaciones";
  if (s.includes("finan") || s.includes("costo") || s.includes("margen")) return "finanzas";
  if (s.includes("equipo") || s.includes("personal")) return "equipo";
  if (s.includes("producto") || s.includes("menu") || s.includes("menú")) return "producto";
  if (s.includes("retencion") || s.includes("retención") || s.includes("fideliz")) return "retencion";
  if (s.includes("web") || s.includes("sitio") || s.includes("seo")) return "web";
  if (s.includes("maps") || s.includes("local") || s.includes("google business")) return "local_maps";
  if (s.includes("i+d") || s.includes("innov") || s.includes("research")) return "ide";
  return "ventas";
}

function computeBusinessPriorities(
  business: any,
  brain: any,
  snapshots: any[],
  checkins: any[],
  externalData: any[],
  existingItems: any[],
  focusConfig: any
): BusinessPriorities {
  // 1) Dimensiones: del snapshot más reciente o derivado
  const latestSnap = snapshots?.[0];
  const dims: Record<string, number> = {};
  const snapDims = latestSnap?.dimensions || latestSnap?.health_dimensions || latestSnap?.scores || {};
  for (const [k, v] of Object.entries(snapDims)) {
    const num = typeof v === "number" ? v : (typeof v === "object" && v !== null && "score" in v ? Number((v as any).score) : NaN);
    if (!Number.isNaN(num)) dims[k.toLowerCase()] = num;
  }
  // Fallbacks heurísticos
  if (!dims["reputacion"] && business?.avg_rating) {
    dims["reputacion"] = Math.round((Number(business.avg_rating) / 5) * 100);
  }
  if (!dims["ventas"] && checkins.length > 0) {
    const avgTraffic = checkins.reduce((a, c) => a + (c.traffic_level || 3), 0) / checkins.length;
    dims["ventas"] = Math.round((avgTraffic / 5) * 100);
  }

  const dimEntries = Object.entries(dims);
  let weakest_dimension = "ventas";
  let weakest_score = 50;
  let strongest_dimension = "reputacion";
  let strongest_score = 50;
  if (dimEntries.length > 0) {
    const sorted = dimEntries.sort((a, b) => a[1] - b[1]);
    weakest_dimension = sorted[0][0];
    weakest_score = sorted[0][1];
    strongest_dimension = sorted[sorted.length - 1][0];
    strongest_score = sorted[sorted.length - 1][1];
  }

  // 2) Objetivo principal
  const main_goal = String(
    focusConfig?.primary_goal ||
    brain?.current_focus ||
    brain?.factual_memory?.objetivo_principal ||
    "crecimiento sostenido"
  );

  // 3) Áreas ya cubiertas/saturadas (≥2 items en esa área)
  const areaCount: Record<string, number> = {};
  for (const it of existingItems) {
    const area = inferAreaFromSource(it.source || it.title || "");
    areaCount[area] = (areaCount[area] || 0) + 1;
  }
  const covered_areas = Object.entries(areaCount).filter(([, c]) => c >= 2).map(([a]) => a);
  const underworked_areas = ALL_AREAS.filter(a => !areaCount[a] || areaCount[a] === 0);

  // 4) Capacidad de esfuerzo
  const teamSize = Number(brain?.factual_memory?.team_size || brain?.factual_memory?.empleados || 1);
  const effortPref = String(brain?.preferences_memory?.effort_capacity || "").toLowerCase();
  let effort_capacity: "baja" | "media" | "alta" = "media";
  if (effortPref.includes("baja") || teamSize <= 1) effort_capacity = "baja";
  else if (effortPref.includes("alta") || teamSize >= 5) effort_capacity = "alta";

  // 5) Riesgos
  const risks: string[] = [];
  const negativeReviews = externalData.filter(d => d.data_type === "review" && (d.sentiment_score || 0) < -0.2).length;
  if (negativeReviews >= 3) risks.push(`${negativeReviews} reseñas negativas recientes sin respuesta`);
  if (weakest_score < 40) risks.push(`Dimensión ${weakest_dimension} en zona crítica (${weakest_score}/100)`);
  if (checkins.length === 0) risks.push("Sin registros de tráfico → ceguera operativa");
  if ((brain?.confidence_score || 0) < 30) risks.push("Cerebro con baja confianza → faltan datos clave");

  // 6) Foco recomendado
  const recommended_focus = weakest_dimension;
  const recommended_reason = `Atacar ${weakest_dimension} (${weakest_score}/100) porque es la palanca más urgente del negocio y puede destrabar mejoras en otras áreas como ${strongest_dimension}.`;

  return {
    weakest_dimension,
    weakest_score,
    strongest_dimension,
    strongest_score,
    main_goal,
    covered_areas,
    underworked_areas,
    effort_capacity,
    risks,
    recommended_focus,
    recommended_reason,
  };
}

function buildPrioritiesBlock(p: BusinessPriorities): string {
  return `\n## 🎯 DIAGNÓSTICO PRIORITARIO (usar para priorizar y diversificar)
- Punto más débil: **${p.weakest_dimension}** (${p.weakest_score}/100) ← atacar primero
- Mayor fortaleza: ${p.strongest_dimension} (${p.strongest_score}/100)
- Objetivo principal del usuario: ${p.main_goal}
- Capacidad de ejecución: ${p.effort_capacity}
- Áreas ya saturadas (NO repetir): ${p.covered_areas.length ? p.covered_areas.join(", ") : "ninguna"}
- Áreas poco trabajadas (PRIORIZAR diversidad): ${p.underworked_areas.slice(0, 6).join(", ") || "ninguna"}
- Riesgos detectados: ${p.risks.length ? p.risks.join(" · ") : "sin riesgos críticos"}
- 👉 Foco recomendado: **${p.recommended_focus}** — ${p.recommended_reason}
`;
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
  // identity_profile/sector_profile/current_situation son columnas legacy que ya
  // no existen. Reconstruimos identidad desde factual_memory + offer_profile +
  // customer_profile para que el prompt tenga anclas reales (evita salidas
  // genéricas o filtrado de tokens crudos del brain).
  const identity = (brain?.identity_profile as any) || {};
  const sectorProf = (brain?.sector_profile as any) || {};
  const situation = (brain?.current_situation as any) || {};
  const factual = (brain?.factual_memory as any) || {};
  const offerProfile = (brain?.offer_profile as any) || {};
  const customerProfile = (brain?.customer_profile as any) || {};
  const asArr = (v: any): string[] => Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : (typeof v === "string" && v.trim() ? [v.trim()] : []);
  const displayName = identity.display_name || factual.business_type_label || business.name;
  const subtype = identity.subtype || sectorProf.subtype || factual.sector || factual.subsector || null;
  const modelo = identity.business_model || sectorProf.model || factual.business_model || offerProfile.model || null;
  const offerings: string[] = (asArr(identity.offerings).length ? asArr(identity.offerings) : asArr(offerProfile.summary).concat(asArr(factual.offer_summary), asArr(factual.unidades_negocio))).slice(0, 6);
  const channels: string[] = (asArr(identity.channels).length ? asArr(identity.channels) : asArr(factual.main_channel).concat(asArr(factual.channel_summary), asArr(offerProfile.channels))).slice(0, 6);
  const customerType = identity.customer_type || customerProfile.summary || factual.main_customer || factual.client_summary || null;
  const primaryPains: string[] = (asArr(identity.primary_pains).length ? asArr(identity.primary_pains) : asArr(factual.primary_pains).concat(asArr(factual.main_friction))).slice(0, 5);
  const oppAngles: string[] = (asArr(identity.opportunity_angles).length ? asArr(identity.opportunity_angles) : asArr(factual.opportunity_angles)).slice(0, 5);
  const stage = identity.business_stage || situation.stage || factual.business_stage || "active";
  const city = (business as any).city || null;
  const address = (business as any).address || null;

  let context = `## NEGOCIO: ${displayName}
- Nombre comercial exacto: "${business.name}"
- País: ${business.country || "AR"}${city ? ` · Ciudad: ${city}` : ""}${address ? ` · Dirección: ${address}` : ""}
- Categoría base: ${brain?.primary_business_type || business.category || "sin definir"}${subtype ? ` · Subtipo: ${subtype}` : ""}
- Modelo de negocio: ${modelo || "sin definir"}
- Etapa: ${stage}
- Foco actual: ${brain?.current_focus || "ventas"}
- Rating público: ${business.avg_rating || "Sin datos"}
- Ticket promedio: ${(business as any).avg_ticket || "sin datos"} · Rango de facturación: ${(business as any).monthly_revenue_range || "sin datos"}
- Instagram: ${business.instagram_handle || "no cargado"} · Google Place: ${business.google_place_id ? "cargado" : "no cargado"}
- Moneda: ${locale.currency}
- Voz: ${locale.voice === "voseo" ? "Usá vos/voseo (Implementá, Creá, Probá)" : "Usa tú/tuteo (Implementa, Crea, Prueba)"}

## PERFIL DE IDENTIDAD REAL (usar SIEMPRE en cada título/descripción)
- Cliente objetivo: ${customerType || "sin definir"}
- Productos/servicios que vende HOY: ${offerings.length ? offerings.join(" · ") : "sin definir"}
- Canales reales de venta: ${channels.length ? channels.join(" · ") : "sin definir"}
- Dolores concretos declarados: ${primaryPains.length ? primaryPains.join(" · ") : "sin declarar"}
- Ángulos de oportunidad detectados: ${oppAngles.length ? oppAngles.join(" · ") : "ninguno"}

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
        const q = humanizeEvidence(insight.question);
        const a = humanizeEvidence(insight.answer);
        if (q && a) context += `- ${q}: **${a}**\n`;
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

  // Recent signals (humanized — never dump raw JSON or internal IDs into the prompt)
  if (signals.length > 0) {
    context += `\n## SEÑALES RECIENTES\n`;
    for (const signal of signals.slice(0, 8)) {
      const raw = signal.raw_text || signal.content;
      const human = humanizeEvidence(raw);
      if (human && human.length > 6) context += `- ${human}\n`;
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
    // PLAN ENFORCEMENT (server-side, before AI call)
    // Free: 1 escaneo/mes  ·  Pro: 5 escaneos manuales/mes
    // ========================================================
    const FREE_LIMIT = 1;
    const PRO_LIMIT = 5;
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
      const cap = isPro ? PRO_LIMIT : FREE_LIMIT;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const table = earlyMode === "research" ? "learning_items" : "opportunities";
      const { count } = await supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .gte("created_at", startOfMonth.toISOString());

      if ((count || 0) >= cap) {
        console.log(`[analyze-patterns] Limit reached on ${table}: ${count}/${cap} (pro=${isPro})`);
        return new Response(
          JSON.stringify({
            error: isPro ? "pro_limit_reached" : "free_limit_reached",
            limit: cap,
            used: count,
            mode: earlyMode,
            upgrade_url: isPro ? null : "/checkout",
            message: isPro
              ? `Alcanzaste el tope de ${PRO_LIMIT} escaneos manuales del Radar este mes. Se reinicia el día 1.`
              : earlyMode === "research"
              ? `En el plan Free hay ${FREE_LIMIT} escaneo de investigación por mes. Pasá a Pro para hasta ${PRO_LIMIT}.`
              : `En el plan Free hay ${FREE_LIMIT} escaneo de oportunidades por mes. Pasá a Pro para hasta ${PRO_LIMIT}.`,
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (quotaErr) {
      // Fail-open: nunca bloquear por error de chequeo
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

    // Build context + priorities diagnosis
    const priorities = computeBusinessPriorities(
      business,
      brain,
      snapshotsRes.data || [],
      checkinsRes.data || [],
      externalDataRes.data || [],
      existingItems,
      focusConfigRes.data
    );
    console.log(`[analyze-patterns] Priorities → weakest=${priorities.weakest_dimension}(${priorities.weakest_score}) goal=${priorities.main_goal} covered=[${priorities.covered_areas.join(",")}]`);

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
    ) + buildPrioritiesBlock(priorities);

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
4. PROHIBIDO recomendaciones operativas internas (responder reseñas, optimizar procesos): eso lo cubre el Radar interno.
5. Enfocate SOLO en: innovación, experimentos, nuevos canales, nuevos productos, modelos recurrentes, automatizaciones, diferenciación, tendencias externas y casos de estudio adaptables.
6. Diversidad obligatoria: no repetir el mismo tipo de insight; mezclar tendencias, casos, innovaciones y señales de mercado.
7. Ningún insight puede solaparse con items existentes ni con áreas saturadas (${priorities.covered_areas.join(", ") || "ninguna"}).
8. Conectar siempre al objetivo principal: "${priorities.main_goal}" y al punto débil: "${priorities.weakest_dimension}".
9. Cada título debe ser específico y mencionar la tendencia concreta (sin tecnicismos en inglés).

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
          model: "google/gemini-2.5-flash", // Cost-optimized: market RSS analysis tolera flash sin perder calidad (gates + validateBeforeStore filtran)
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

        // PROMPT 4 — validateBeforeStore para research/learning_items.
        const audit = validateBeforeStore({
          module: "opportunity",
          title,
          description: enrichedContent,
          source_url: resolvedUrl,
        });
        if (!audit.passed) {
          console.log(`[validateBeforeStore] dropped research (${audit.reasons.join(",")}): "${title}"`);
          learningFiltered++;
          continue;
        }
        const safeTitle = sanitizeAIOutput(audit.sanitized.title ?? title, { mode: "label" });
        const safeContent = sanitizeAIOutput(audit.sanitized.description ?? enrichedContent, { mode: "prose" });

        const { error: insertErr } = await supabase.from("learning_items").insert({
          business_id: businessId,
          title: safeTitle,
          content: safeContent,
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

      // Brain signal: registrar evento research generado (cierra gap de auto-aprendizaje)
      if (learningInserted > 0) {
        try {
          await supabase.from("signals").insert({
            business_id: businessId,
            brain_id: brain?.id || null,
            signal_type: "research_generated",
            source: "analyze-patterns",
            content: { inserted: learningInserted, filtered: learningFiltered, model: "google/gemini-2.5-flash" },
            confidence: "medium",
            importance: 4,
          });
        } catch (e) { console.warn("[analyze-patterns] research signal insert failed", e); }
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
    
    const opportunitiesPrompt = `Sos el CEO digital de ${business.name} (${brain?.primary_business_type || "negocio"}). Tu trabajo: detectar oportunidades INTERNAS accionables que ataquen el punto más débil del negocio y diversifiquen las áreas trabajadas.

${analysisContext}

## 🔐 GATES DE CALIDAD (cumplir TODOS o descartar):
- Gate 0 — HYPER-PERSONALIZACIÓN OBLIGATORIA: cada título Y cada descripción DEBE mencionar por nombre al menos UNO de estos elementos REALES del negocio: un producto/servicio de "Productos/servicios que vende HOY", el nombre del negocio, el subtipo, la ciudad, el cliente objetivo declarado, o un dolor específico declarado. Está PROHIBIDO producir oportunidades que servirían igual a cualquier negocio del sector (ej: "Digitaliza tu inventario en Google Sheets", "Crea tu Perfil de Negocio en Google", "Publica más en Instagram", "Responde reseñas", "Mejora tu presencia digital", "Optimiza tus procesos"). Si el negocio vende "copias, impresiones, anillados" el título debe hablar de copias / impresiones / anillados. Si vende "tarjetas de presentación", debe hablar de tarjetas.
- Gate 1 — Cero genérico: PROHIBIDO títulos vagos ("Mejorar X", "Optimizar Y"). Cada título lleva un dato concreto (%, número, día, producto real, área). PROHIBIDO recomendar acciones "básicas de setup" (crear Google Business, abrir Instagram, hacer Excel) salvo que el negocio explícitamente no las tenga Y sea el dolor #1.
- Gate 2 — Cero solapamiento: ninguna oportunidad puede parecerse a otra dentro del lote ni a items existentes (ver lista de "ITEMS EXISTENTES" y "CONCEPTOS RECHAZADOS").
- Gate 3 — Cero monocultivo: NO todas al mismo objetivo (no 3 promociones, no 3 descuentos, no 3 acciones de redes). Máximo 1 por área.
- Gate 4 — Diversidad obligatoria entre estas áreas: ventas, marketing, operaciones, reputación, finanzas, equipo, producto, retención, web, local_maps. Priorizar áreas listadas como "poco trabajadas" en el diagnóstico.
- Gate 5 — Anclaje a datos: cada oportunidad cita un dato/hipótesis del contexto en su campo "evidence.trigger" (ej: "vende copias A4 en Quito y no tiene canal digital de pedidos").
- Gate 6 — Acción → beneficio → impacto: cada oportunidad tiene acción clara, beneficio explícito y un impacto lógico medible.
- Gate 7 — Sin inventar métricas: si falta información, declarar la hipótesis ("hipótesis prudente: ...") en vez de fabricar cifras duras.
- Gate 8 — Priorizar alto impacto + esfuerzo bajo/medio + conexión directa con el punto débil principal (${priorities.weakest_dimension}).

## 🥇 OPORTUNIDAD RECOMENDADA (obligatorio):
- Marcar EXACTAMENTE una con \`"is_recommended": true\`.
- Esa oportunidad DEBE atacar la dimensión más débil: **${priorities.weakest_dimension}** (${priorities.weakest_score}/100).
- Incluir \`"recommendation_reason"\` breve, tipo: "Recomendada primero porque ataca tu punto más débil (${priorities.weakest_dimension}) y puede destrabar mejoras en ${priorities.strongest_dimension}."

## ESTILO:
- ${locale.voice === "voseo" ? "Hablale de VOS al dueño (implementá, creá, probá, fijate)." : "Háblale de TÚ al dueño (implementa, crea, prueba, fíjate)."}
- Prohibido tercera persona ("El dueño", "Se detectó", "El negocio").
- Máximo 3 oportunidades de altísima calidad.
- Capacidad de ejecución del negocio: ${priorities.effort_capacity} → calibrar effort_score.

## CATEGORÍAS PERMITIDAS PARA "source" (en español, sin códigos):
ventas | marketing | operaciones | reputación | finanzas | equipo | producto | retención | web | local_maps

## FORMATO JSON ESTRICTO:
{
  "opportunities": [
    {
      "title": "Título ultra-específico con dato concreto",
      "description": "Acción → beneficio → impacto, hablando directo al dueño",
      "impact_score": 1-10,
      "effort_score": 1-10,
      "source": "ventas|marketing|operaciones|reputación|finanzas|equipo|producto|retención|web|local_maps",
      "area_tag": "misma categoría que source",
      "is_recommended": true|false,
      "recommendation_reason": "Solo si is_recommended=true",
      "evidence": {
        "trigger": "Dato/hipótesis concreto que disparó esto",
        "signals": ["señal 1", "señal 2"],
        "dataPoints": 0,
        "basedOn": ["fuente específica del contexto"]
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
        model: "google/gemini-2.5-pro", // Downgraded from pro: flash handles opportunity analysis well
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

    // ── DIVERSITY GATE: max 1 por área, salvo área(s) más débil(es) (hasta 2-3) ──
    // Determinar áreas "débiles" donde se permite mayor concentración:
    //   - weakest_score < 40 → hasta 3 oportunidades en esa área
    //   - weakest_score < 55 → hasta 2 oportunidades en esa área
    //   - resto de áreas → máximo 1
    const weakArea = inferAreaFromSource(priorities.weakest_dimension);
    const weakAreaQuota = priorities.weakest_score < 40 ? 3 : (priorities.weakest_score < 55 ? 2 : 1);
    const areaCountThisRun: Record<string, number> = {};
    const rawOpps: any[] = Array.isArray(analysis.opportunities) ? [...analysis.opportunities] : [];

    rawOpps.sort((a, b) => {
      const ar = a?.is_recommended ? 1 : 0;
      const br = b?.is_recommended ? 1 : 0;
      if (ar !== br) return br - ar;
      const aScore = (a?.impact_score || 5) * 2 - (a?.effort_score || 5);
      const bScore = (b?.impact_score || 5) * 2 - (b?.effort_score || 5);
      return bScore - aScore;
    });

    if (rawOpps.length > 0 && !rawOpps.some(o => o?.is_recommended)) {
      rawOpps[0].is_recommended = true;
      rawOpps[0].recommendation_reason = priorities.recommended_reason;
    }

    let recommendedAlreadyAssigned = false;

    for (const opp of rawOpps) {
      const title = String(opp?.title || "").trim();
      const description = String(opp?.description || "").trim();

      if (!title || title.length < 10 || !description || description.length < 20) {
        opportunitiesFiltered++;
        continue;
      }

      // Gate 0 — Anti-genérico HYPER-PERSONALIZACIÓN
      // Rechaza títulos que sirven a cualquier negocio del sector, salvo que
      // mencionen un elemento REAL del negocio (nombre, subtipo, ciudad,
      // producto/servicio, cliente objetivo o dolor declarado).
      const _identity = (brain?.identity_profile as any) || {};
      const _sectorProf = (brain?.sector_profile as any) || {};
      const _factual = (brain?.factual_memory as any) || {};
      const _offerP = (brain?.offer_profile as any) || {};
      const _customerP = (brain?.customer_profile as any) || {};
      const _anchorTokens: string[] = [];
      const _pushTokens = (v: unknown) => {
        if (typeof v === "string") {
          v.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .split(/[\s,·|/;:()\-]+/)
            .filter((w) => w.length >= 4)
            .forEach((w) => _anchorTokens.push(w));
        } else if (Array.isArray(v)) {
          v.forEach(_pushTokens);
        } else if (v && typeof v === "object") {
          Object.values(v as Record<string, unknown>).forEach(_pushTokens);
        }
      };
      _pushTokens(business.name);
      _pushTokens((business as any).city);
      _pushTokens(_identity.display_name);
      _pushTokens(_identity.subtype);
      _pushTokens(_identity.customer_type);
      _pushTokens(_identity.offerings);
      _pushTokens(_identity.primary_pains);
      _pushTokens(_sectorProf.subtype);
      // Fallback anchors desde factual_memory / offer / customer profile
      _pushTokens(_factual.business_type_label);
      _pushTokens(_factual.sector);
      _pushTokens(_factual.subsector);
      _pushTokens(_factual.main_customer);
      _pushTokens(_factual.client_summary);
      _pushTokens(_factual.main_channel);
      _pushTokens(_factual.main_friction);
      _pushTokens(_factual.main_goal);
      _pushTokens(_factual.offer_summary);
      _pushTokens(_factual.primary_pains);
      _pushTokens(_factual.opportunity_angles);
      _pushTokens(_factual.keywords);
      _pushTokens(_factual.unidades_negocio);
      _pushTokens(_factual.learning_product);
      _pushTokens(_factual.learning_business);
      _pushTokens(_offerP.summary);
      _pushTokens(_customerP.summary);
      const _uniqueAnchors = Array.from(new Set(_anchorTokens.filter(t =>
        !["negocio","empresa","local","tienda","cliente","clientes","servicio","servicios","producto","productos","pequeño","pequeña","principal","mejor","nuevo","nueva","para","como","tipo","actual","pyme","pymes","marca","marcas","proyecto","proyectos","alto","valor","gestion","estrategia","desarrollo"].includes(t)
      )));
      const combined = `${title} ${description}`.toLowerCase();
      const hasAnchor = _uniqueAnchors.length === 0
        ? true // sin identity_profile no podemos exigirlo — dejar pasar
        : _uniqueAnchors.some((tok) => combined.includes(tok));

      const GENERIC_PATTERNS: RegExp[] = [
        /perfil de (negocio|empresa) en google/i,
        /google (my )?business( profile)?/i,
        /google business/i,
        /(crea|activa|abrí|abre|activá) tu (cuenta|perfil) (de|en) (google|instagram|facebook|tiktok)/i,
        /plantilla de google sheets/i,
        /digitaliza (tu )?(inventario|stock|proceso)/i,
        /publica (más|mas) en (instagram|redes)/i,
        /responde (todas )?(las )?rese(ñ|n)as/i,
        /pide rese(ñ|n)as/i,
        /mejora tu presencia digital/i,
        /optimiza tus procesos/i,
        /crea contenido de valor/i,
        /aumenta tus ventas/i,
        /capta m(á|a)s clientes/i,
        /automatiza procesos/i,
        /transformaci(o|ó)n digital/i,
      ];
      const looksGeneric = GENERIC_PATTERNS.some((re) => re.test(title) || re.test(description.slice(0, 200)));
      if (looksGeneric && !hasAnchor) {
        console.log(`[analyze-patterns] Filtered by Gate 0 (genérico + sin anclaje al negocio): "${title}"`);
        opportunitiesFiltered++;
        continue;
      }
      if (!hasAnchor && _uniqueAnchors.length > 0) {
        console.log(`[analyze-patterns] Filtered by Gate 0 (sin anclaje real: ${_uniqueAnchors.slice(0,6).join(",")}): "${title}"`);
        opportunitiesFiltered++;
        continue;
      }


      const area = inferAreaFromSource(opp?.area_tag || opp?.source || title);
      const quota = area === weakArea ? weakAreaQuota : 1;
      const seen = areaCountThisRun[area] || 0;
      if (seen >= quota) {
        console.log(`Filtered (diversity gate, área "${area}" llena ${seen}/${quota}): "${title}"`);
        opportunitiesFiltered++;
        continue;
      }

      const conceptHash = generateConceptHash(title, description, opp.source);
      const intentSignature = generateIntentSignature(title, description);

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

      const isDupe = existingItems.some(ex =>
        calculateSimilarity(title, ex.title) > 0.5 ||
        calculateSimilarity(`${title} ${description}`, `${ex.title} ${ex.description || ""}`) > 0.55
      );
      if (isDupe) {
        console.log(`Filtered: semantic duplicate - "${title}"`);
        opportunitiesFiltered++;
        continue;
      }

      const isRecommended = !!opp.is_recommended && !recommendedAlreadyAssigned;
      if (isRecommended) recommendedAlreadyAssigned = true;

      const enrichedEvidence = {
        ...(opp.evidence || {}),
        area_tag: area,
        is_recommended: isRecommended,
        recommendation_reason: isRecommended
          ? (opp.recommendation_reason || priorities.recommended_reason)
          : undefined,
        priority_context: {
          weakest_dimension: priorities.weakest_dimension,
          weakest_score: priorities.weakest_score,
          main_goal: priorities.main_goal,
        },
      };

      // PROMPT 4 — validateBeforeStore: bloquea market_signal, URLs crudas, [object Object], etc.
      const safeAudit = validateBeforeStore({
        module: "opportunity",
        title,
        description,
        source_url: typeof opp.source === "string" && /^https?:\/\//.test(opp.source) ? opp.source : undefined,
      });
      if (!safeAudit.passed) {
        console.log(`[validateBeforeStore] dropped opportunity (${safeAudit.reasons.join(",")}): "${title}"`);
        opportunitiesFiltered++;
        continue;
      }
      const safeTitle = sanitizeAIOutput(safeAudit.sanitized.title ?? title, { mode: "label" });
      const safeDescription = sanitizeAIOutput(safeAudit.sanitized.description ?? description, { mode: "prose" });
      if (containsForbidden(safeTitle) || containsForbidden(safeDescription)) {
        opportunitiesFiltered++;
        continue;
      }

      // HYPER-PERSONALIZATION GATE — la oportunidad debe anclar al menos 2
      // variables reales del negocio (sector, ciudad, cliente, oferta, canal, fricción…).
      // Bloquea outputs tipo "arma tu servicio consultoría" si el usuario aclaró
      // que NO hace consultoría, y en general genéricos disfrazados.
      try {
        const bp: any = (business as any).business_profile || {};
        const anchors: HyperAnchors = {
          businessName: (business as any).name || (business as any).business_name,
          sector: (business as any).sector || bp.sector,
          subSector: (business as any).sub_sector || bp.sub_sector || (business as any).business_type_label,
          country: (business as any).country || (business as any).country_code,
          city: (business as any).city || bp.city,
          customer: bp.customer || bp.target_customer,
          channel: bp.channel || bp.main_channel,
          offer: bp.offer || bp.value_proposition,
          mainFriction: bp.main_friction || bp.friction,
          mainGoal: (business as any).main_goal || bp.main_goal,
        };
        const hyper = hyperPersonalizationCheck({
          text: `${safeTitle}. ${safeDescription}`,
          anchors,
          minAnchors: 2,
          requireSpecific: true,
        });
        if (!hyper.ok) {
          console.log(`[hyper-gate] dropped opportunity (score=${hyper.score.toFixed(2)}, matched=${hyper.matchedAnchors.join("|")}, reasons=${hyper.reasons.join(";")}): "${safeTitle}"`);
          opportunitiesFiltered++;
          continue;
        }
      } catch (e) {
        console.warn("[hyper-gate] check failed, allowing:", e instanceof Error ? e.message : e);
      }

      const { error: insertError } = await supabase.from("opportunities").insert({
        business_id: businessId,
        title: safeTitle,
        description: safeDescription,
        source: opp.source || "diagnóstico",
        impact_score: opp.impact_score || 5,
        effort_score: opp.effort_score || 5,
        evidence: enrichedEvidence,
        concept_hash: conceptHash,
        intent_signature: intentSignature,
        ai_plan_json: opp.ai_plan || {},
        quality_gate_score: gateResult.score,
        quality_gate_details: { gates: gateResult.gates, area_tag: area, is_recommended: isRecommended }
      });

      if (!insertError) {
        opportunitiesInserted++;
        areaCountThisRun[area] = (areaCountThisRun[area] || 0) + 1;
        existingHashes.add(conceptHash);
        existingSignatures.add(intentSignature);
        existingItems.push({ id: "", title: safeTitle, description: safeDescription, source: opp.source });
        console.log(`Inserted opportunity [${area}${isRecommended ? " ⭐ recommended" : ""}]: "${safeTitle}" (score: ${gateResult.score})`);
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

    // Brain signal: oportunidades generadas (cierra gap de auto-aprendizaje del brain)
    if (opportunitiesInserted > 0) {
      try {
        await supabase.from("signals").insert({
          business_id: businessId,
          brain_id: brain?.id || null,
          signal_type: "opportunities_generated",
          source: "analyze-patterns",
          content: { inserted: opportunitiesInserted, filtered: opportunitiesFiltered },
          confidence: "high",
          importance: 6,
        });
      } catch (e) { console.warn("[analyze-patterns] opportunities signal insert failed", e); }
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
