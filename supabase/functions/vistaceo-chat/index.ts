import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  ANTI_GENERIC_SYSTEM,
  sanitizeVisibleString,
  extremeQualityCheck,
  safeUserFacingError,
  safeRateLimitMessage,
  safeCreditMessage,
} from "../_shared/brain-core/index.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================
// VISTACEO — CEO MULTIMODAL ULTRA
// Prompt Maestro v1.0
// =====================

const CEO_SYSTEM_PROMPT = `
===============================
VISTACEO — CEO ULTRA INTELIGENTE
Prompt Maestro v3.0 (consolidado, sin contradicciones)
===============================

ROL
Sos el CEO virtual del negocio del usuario. No sos asistente genérico: sos mentor ejecutivo de élite, claro, humano, estratégico, con criterio. Hablás como alguien que conoce el negocio en detalle (nombre, rubro, país, métricas, misiones, oportunidades, fricciones, decisiones previas).

PRIORIDAD ABSOLUTA — RESPONDER EL ÚLTIMO MENSAJE
- Respondé exactamente lo que se preguntó en el último mensaje del usuario. No mezcles temas previos, no cambies el eje, no repitas literal lo que escribió.
- Conectá con el negocio SOLO cuando aporte valor real. Usá nombre, rubro, ciudad/país y datos reales del Brain cuando existan. Si la conexión es débil, decilo breve y seguí.
- Anti-invención: nunca inventes métricas, clientes ni resultados. Si no tenés el dato, planteá hipótesis explícita ("lo más probable es...") y seguí adelante. Nunca te plantes en "necesito que me confirmes" sin antes dar una respuesta sustancial.

MULTI-PREGUNTA
- Si el usuario hace 2+ preguntas distintas en un mismo mensaje, elegí la más importante o la primera y respondela con perfección. Cerrá con una línea breve y natural ofreciendo trabajar el resto después ("El resto lo encaramos en el próximo mensaje, así le damos el foco que merece" — variá la redacción).

ESTILO HUMANO — PROHIBIDO SONAR A CHATBOT
- Tono CEO digital: claro, directo, cercano, con criterio. Cero call-center.
- Prohibidas estas frases: "como modelo de IA", "procesando tu solicitud", "aquí tienes la respuesta", "disculpá tuve un problema", "¿podés repetir el mensaje?", "no tengo suficiente información", "no puedo ayudarte con eso", "en conclusión", "espero que esto te ayude", "según los datos proporcionados", "solicitud recibida", "lamento los inconvenientes", "tu estrategia está fallando".
- Prohibido evadir: nunca devuelvas solo "necesito que me confirmes X antes de responder". La respuesta SIEMPRE tiene contenido sustancial primero; la pregunta de confirmación, si existe, va al final y es opcional.

EXTENSIÓN — MÁXIMO 2 PÁRRAFOS
- Techo duro: 2 párrafos. Si cierra mejor en 1, mejor.
- Cero introducción ceremonial, cero cierre ceremonial. Directo al insight.
- Cada oración debe sumar: dato del Brain, decisión, número, próximo paso. Cero relleno.
- Si necesitás listar pasos, usá numeración compacta "1. ... 2. ... 3. ..." en líneas separadas, no bullets largos.

ESTRUCTURA — ADAPTATIVA, NUNCA RÍGIDA
- Adaptá profundidad y forma al pedido. NO uses plantilla fija "Diagnóstico → Decisión → Prioridades 48-72h → Siguiente paso". Variá entre respuestas.
- Saludo o confirmación trivial → 1-2 líneas naturales.
- Explicación → párrafos cortos.
- Acción → numeración simple.
- Plan completo SOLO si el usuario lo pide explícitamente.

LIMPIEZA VISUAL DENTRO DE USER_REPLY
- Prohibido: asteriscos visibles, **negritas markdown**, viñetas con * - o •, JSON crudo, snake_case entre comillas, códigos internos (EASY_*, Q_*, opt_*, facts_to_add, learningExtract), barras invertidas, saltos escapados, null/undefined/NaN/[object Object], emojis excesivos.
- Para énfasis: palabras fuertes y oraciones claras, no markdown bold.
- Párrafos cortos, legibles en mobile.

ANTI-TRUNCACIÓN
- Nunca cortes una oración a la mitad. Si te falta espacio, recortá ideas enteras y cerrá la última frase con punto. Mejor decir menos completo que decir más cortado.

USO DEL BRAIN
- Antes de responder, mirá el contexto del negocio (CONFIG_JSON, BRAIN_JSON, STATE_JSON). Si hay rubro, país, cliente, objetivo, misión activa, oportunidad, alerta o métrica relevante, reflejalo naturalmente. Nunca respondas genérico teniendo contexto.

LOCALIZACIÓN
- Respondé en el idioma de CONFIG_JSON.language. Por defecto español neutro LATAM. Aplicá voseo solo si country ∈ {AR, UY, PY}.
- Moneda: usá currency_local del CONFIG. No agregues USD salvo que esté show_usd=true y haya tipo de cambio explícito.

DETECCIÓN DE INTENCIÓN DE MISIÓN
- Si el usuario insinúa o pide convertir algo en misión ("misión", "agregalo a misiones", "armá una misión", "convertir en misión", "aplicar a misión", "agendala", "ponele acción"), poblá missions_suggested con 1-3 misiones de altísima calidad (título <80 chars, descripción 1-2 oraciones por qué+cómo, prioridad P0/P1/P2, kpi medible, definition_of_done 3-5 pasos, due_hint realista).
- Si vos proponés una acción ejecutable hoy (no teoría), adjuntá 1 misión en missions_suggested. Si la respuesta es informativa o exploratoria, dejá el array vacío.
- En USER_REPLY mencioná naturalmente "te dejo la misión lista abajo para activarla" cuando uses missions_suggested.

CONTRATO DE SALIDA (OBLIGATORIO, ESTRICTO)
Devuelvé SIEMPRE estos 4 bloques exactos, en este orden, y NADA fuera de ellos:

<USER_REPLY>
(respuesta visible al usuario en markdown limpio, máx 2 párrafos. Prohibido dentro de este bloque: JSON, llaves con claves entrecomilladas, etiquetas XML, palabras técnicas tipo facts_to_add/missions_suggested/learningExtract.)
</USER_REPLY>

<CEO_AUDIO_SCRIPT>
(guión natural para voz, breve, sin markdown, sin emojis)
</CEO_AUDIO_SCRIPT>

<AVATAR_CUES>
{"mood":"calm|serious|energetic|empathetic|focused","pace":"slow|medium|fast","gestures":["nod","emphasis"]}
</AVATAR_CUES>

<LEARNING_EXTRACT>
{
  "facts_to_add": [{"key":"...","value":"...","confidence":0.0,"scope":"business|product|pricing|customer|ops|finance|team"}],
  "decisions": [{"decision":"...","status":"proposed|accepted","why":"...","date":"YYYY-MM-DD"}],
  "risks": [{"risk":"...","severity":"low|medium|high","mitigation":"..."}],
  "missions_suggested": [{"title":"...","description":"...","priority":"P0|P1|P2","kpi":"...","definition_of_done":["...","..."],"due_hint":"48h"}],
  "preferences": [{"preference":"...","value":"...","confidence":0.0}]
}
</LEARNING_EXTRACT>

⚠️ TODOS los textos del LEARNING_EXTRACT deben estar en español. Si no hay nada nuevo que aprender, devolvé el bloque con arrays vacíos. Nunca omitas el bloque.

CHEQUEO INTERNO ANTES DE CERRAR
- ¿Respondí el último mensaje exacto?
- ¿Usé el Brain cuando correspondía?
- ¿No inventé datos?
- ¿Cero asteriscos, JSON, códigos internos ni oraciones cortadas?
- ¿Suena a CEO inteligente, no a chatbot?
Si algo falla, reescribilo antes de devolver.
`;

// =====================
// Context Building Functions
// =====================

interface BusinessContext {
  id: string;
  name: string;
  category?: string;
  country?: string;
  avg_ticket?: number;
  avg_rating?: number;
}

interface BrainData {
  primary_business_type?: string;
  secondary_business_type?: string;
  current_focus?: string;
  focus_priority?: number;
  mvc_completion_pct?: number;
  confidence_score?: number;
  total_signals?: number;
  factual_memory?: Record<string, unknown>;
  preferences_memory?: Record<string, unknown>;
  decisions_memory?: Record<string, unknown>;
  dynamic_memory?: Record<string, unknown>;
}

interface MemoryContext {
  recentActions: Array<{ title: string; status: string; completed_at: string }>;
  activeMissions: Array<{ title: string; current_step: number; status: string }>;
  recentCheckins: Array<{ traffic_level: number; slot: string; created_at: string }>;
  lessons: string[];
  businessInsights: string[];
  brain: BrainData | null;
  recentSignals: Array<{ signal_type: string; source: string; content: unknown; raw_text: string }>;
  latestSnapshot: { total_score: number; sub_scores: Record<string, number> } | null;
  activeAlerts: Array<{ title: string; severity: string; category: string }>;
  openOpportunities: Array<{ title: string; impact: string; status: string }>;
  competitors: Array<{ name: string; strengths: unknown; weaknesses: unknown }>;
  learningItems: Array<{ title: string; category: string; status: string }>;
  weeklyPriorities: Array<{ title: string; priority: number; status: string }>;
}

function buildConfigJson(business: BusinessContext, brain: BrainData | null): Record<string, unknown> {
  const countryMap: Record<string, { lang: string; currency: string; region: string }> = {
    AR: { lang: "es-AR", currency: "ARS", region: "Buenos Aires" },
    MX: { lang: "es-MX", currency: "MXN", region: "CDMX" },
    CL: { lang: "es-CL", currency: "CLP", region: "Santiago" },
    CO: { lang: "es-CO", currency: "COP", region: "Bogotá" },
    BR: { lang: "pt-BR", currency: "BRL", region: "São Paulo" },
    UY: { lang: "es-UY", currency: "UYU", region: "Montevideo" },
    CR: { lang: "es-CR", currency: "CRC", region: "San José" },
    PA: { lang: "es-PA", currency: "PAB", region: "Ciudad de Panamá" },
    US: { lang: "en-US", currency: "USD", region: "United States" },
  };

  const countryInfo = countryMap[business.country || "AR"] || countryMap["AR"];

  return {
    country: business.country || "AR",
    region: countryInfo.region,
    timezone: "America/Argentina/Buenos_Aires", // Could be dynamic based on country
    language: countryInfo.lang,
    currency_local: countryInfo.currency,
    show_usd: false,
    sector: brain?.primary_business_type || business.category || "restaurant",
    industry: "gastronomy",
    business_type: brain?.primary_business_type || business.category || "restaurant",
    user_style: {
      depth: "balanceado",
      formality: "casual",
      numbers: true,
    },
    avatar_enabled: false,
    voice_enabled: false,
    live_conference_enabled: false,
  };
}

function buildBrainJson(brain: BrainData | null, business: BusinessContext): Record<string, unknown> {
  if (!brain) {
    return {
      business_name: business.name,
      business_type: business.category || "restaurant",
      mvc_completion_pct: 0,
      confidence_score: 0,
      factual_memory: {},
      preferences_memory: {},
      decisions_memory: {},
      dynamic_memory: {},
    };
  }

  return {
    business_name: business.name,
    business_type: brain.primary_business_type || business.category,
    secondary_type: brain.secondary_business_type,
    current_focus: brain.current_focus || "ventas",
    focus_priority: brain.focus_priority || 1,
    mvc_completion_pct: brain.mvc_completion_pct || 0,
    confidence_score: brain.confidence_score || 0,
    total_signals: brain.total_signals || 0,
    factual_memory: brain.factual_memory || {},
    preferences_memory: brain.preferences_memory || {},
    decisions_memory: brain.decisions_memory || {},
    dynamic_memory: brain.dynamic_memory || {},
  };
}

function buildStateJson(memory: MemoryContext): Record<string, unknown> {
  // Calculate health from latest snapshot
  const healthScore = memory.latestSnapshot?.total_score || 0;
  const subScores = memory.latestSnapshot?.sub_scores || {};

  // Calculate avg traffic
  const avgTraffic = memory.recentCheckins.length > 0
    ? memory.recentCheckins.reduce((acc, c) => acc + (c.traffic_level || 0), 0) / memory.recentCheckins.length
    : null;

  return {
    health: {
      total_score: healthScore,
      sub_scores: subScores,
      last_updated: new Date().toISOString(),
    },
    missions: {
      active: memory.activeMissions.map(m => ({
        title: m.title,
        current_step: m.current_step,
        status: m.status,
      })),
      total_active: memory.activeMissions.length,
    },
    alerts: {
      active: memory.activeAlerts.map(a => ({
        title: a.title,
        severity: a.severity,
        category: a.category,
      })),
      total: memory.activeAlerts.length,
    },
    metrics: {
      avg_traffic_7d: avgTraffic,
      recent_actions_completed: memory.recentActions.filter(a => a.status === "completed").length,
      total_signals: memory.recentSignals.length,
    },
    recent_lessons: memory.lessons.slice(0, 5),
    business_insights: memory.businessInsights.slice(0, 10),
  };
}

// =====================
// Database Fetching
// =====================

async function fetchMemoryContext(supabase: any, businessId: string): Promise<MemoryContext> {
  try {
    const [
      actionsRes, missionsRes, checkinsRes, lessonsRes, insightsRes,
      brainRes, signalsRes, snapshotRes, alertsRes,
      opportunitiesRes, competitorsRes, learningRes, prioritiesRes,
    ] = await Promise.all([
      supabase
        .from("daily_actions")
        .select("title, status, completed_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("missions")
        .select("title, current_step, status")
        .eq("business_id", businessId)
        .in("status", ["active", "in_progress"])
        .limit(5),
      supabase
        .from("checkins")
        .select("traffic_level, slot, created_at")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(7),
      supabase
        .from("lessons")
        .select("content, category, importance")
        .eq("business_id", businessId)
        .order("importance", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("business_insights")
        .select("category, question, answer")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("business_brains")
        .select("*")
        .eq("business_id", businessId)
        .maybeSingle(),
      supabase
        .from("signals")
        .select("signal_type, source, content, raw_text, created_at")
        .eq("business_id", businessId)
        .not("signal_type", "in", "(chat,ceo_chat,ceo_chat_learning)")
        .order("created_at", { ascending: false })
        .limit(15),
      supabase
        .from("snapshots")
        .select("total_score, sub_scores")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("alerts")
        .select("title, severity, category")
        .eq("business_id", businessId)
        .eq("status", "active")
        .limit(5),
      supabase
        .from("opportunities")
        .select("title, impact, status")
        .eq("business_id", businessId)
        .neq("status", "dismissed")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("business_competitors")
        .select("name, strengths, weaknesses")
        .eq("business_id", businessId)
        .limit(5),
      supabase
        .from("learning_items")
        .select("title, category, status")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("weekly_priorities")
        .select("title, priority, status")
        .eq("business_id", businessId)
        .order("priority", { ascending: true })
        .limit(5),
    ]);

    const lessons: string[] = [];
    if (lessonsRes.data) {
      for (const lesson of lessonsRes.data) {
        lessons.push(`[${lesson.category}] ${lesson.content}`);
      }
    }

    const insights: string[] = [];
    if (insightsRes.data) {
      for (const insight of insightsRes.data) {
        insights.push(`${insight.question}: ${insight.answer}`);
      }
    }

    return {
      recentActions: actionsRes.data || [],
      activeMissions: missionsRes.data || [],
      recentCheckins: checkinsRes.data || [],
      lessons,
      businessInsights: insights,
      brain: brainRes.data,
      recentSignals: signalsRes.data || [],
      latestSnapshot: snapshotRes.data,
      activeAlerts: alertsRes.data || [],
      openOpportunities: opportunitiesRes.data || [],
      competitors: competitorsRes.data || [],
      learningItems: learningRes.data || [],
      weeklyPriorities: prioritiesRes.data || [],
    };
  } catch (error) {
    console.error("Error fetching memory context:", error);
    return {
      recentActions: [],
      activeMissions: [],
      recentCheckins: [],
      lessons: [],
      businessInsights: [],
      brain: null,
      recentSignals: [],
      latestSnapshot: null,
      activeAlerts: [],
      openOpportunities: [],
      competitors: [],
      learningItems: [],
      weeklyPriorities: [],
    };
  }
}


// =====================
// Response Parsing
// =====================

interface ParsedCEOResponse {
  userReply: string;
  audioScript: string;
  avatarCues: Record<string, unknown>;
  learningExtract: Record<string, unknown>;
}

// =====================
// QUALITY GATE — Capa de calidad UX premium
// =====================

/** Patrones que NUNCA deben aparecer en USER_REPLY. */
const LEAK_PATTERNS_HARD: RegExp[] = [
  /\bEASY_\d+_[A-Z_]+/i,
  /\bQ_[A-Z]{2,}_\d{2,}\b/,
  /\bopt_[a-z_]+\b/i,
  /\bfacts_to_add\b/i,
  /\blearningExtract\b/i,
  /\bmissions_suggested\b/i,
  /\bdefinition_of_done\b/i,
  /\bconcept_hash\b/i,
  /\bintent_signature\b/i,
  /<\/?(USER_REPLY|CEO_AUDIO_SCRIPT|AVATAR_CUES|LEARNING_EXTRACT|BRAIN_JSON|STATE_JSON|CONFIG_JSON)[^>]*>/i,
  /```\s*json[\s\S]*?```/i,
  /^\s*\{[\s\S]*"[a-zA-Z_]+"\s*:/m,
];

/** Recorta el texto a la última oración completa (evita cortes a mitad). */
function trimToCompleteSentence(text: string): string {
  if (!text) return text;
  const t = text.trim();
  if (/[.!?…"'»\)\]]$/.test(t)) return t;
  // Buscar último cierre de oración fuerte
  const lastEnd = Math.max(
    t.lastIndexOf("."),
    t.lastIndexOf("!"),
    t.lastIndexOf("?"),
    t.lastIndexOf("…"),
  );
  // Si está razonablemente lejos del final, cortar ahí
  if (lastEnd > t.length * 0.55) {
    return t.slice(0, lastEnd + 1).trim();
  }
  // Si no hay buen punto, cerrar con punto suspensivo de forma elegante
  return t.replace(/[,;:\-—\s]+$/, "") + "…";
}

/** Quita la primera oración si es un eco textual del mensaje del usuario. */
function removeEcho(reply: string, userText: string): string {
  if (!reply || !userText) return reply;
  const userNorm = userText.trim().toLowerCase().replace(/\s+/g, " ");
  if (userNorm.length < 20) return reply;
  const firstChunk = reply.split(/(?<=[.!?])\s+/)[0] || "";
  const replyNorm = firstChunk.toLowerCase().replace(/\s+/g, " ");
  // Si la primera oración contiene >70% del texto del usuario, es eco
  const minLen = Math.min(userNorm.length, replyNorm.length);
  if (minLen > 30 && (replyNorm.includes(userNorm.slice(0, Math.min(80, userNorm.length))) ||
      userNorm.includes(replyNorm.slice(0, Math.min(80, replyNorm.length))))) {
    return reply.slice(firstChunk.length).trimStart();
  }
  return reply;
}

/** Frases prohibidas del Prompt Maestro VISTACEO (suenan a IA o a plantilla). */
const BANNED_PHRASES: RegExp[] = [
  /\bcomo modelo de ia\b/i,
  /\bcomo (?:una )?inteligencia artificial\b/i,
  /\bprocesando tu solicitud\b/i,
  /\baqu[íi] tienes la respuesta\b/i,
  /disculp[áa],?\s+tuve un problema procesando/i,
  /¿pod[ée]s repetir el mensaje\?/i,
  /\bno tengo suficiente informaci[óo]n\b/i,
  /\bno puedo ayudarte con eso\b/i,
  /\bdecisi[óo]n principal\b/i,
  /\bprioridades 48[\s-]*(?:a\s*)?72\s*h(?:oras|s)?\b/i,
  /\brecomendaci[óo]n ejecutiva\b/i,
  /\ben conclusi[óo]n\b/i,
  /\bespero que esto te ayude\b/i,
  /\bseg[úu]n los datos proporcionados\b/i,
  /\bsolicitud recibida\b/i,
  /\blamento los inconvenientes\b/i,
  /\btu estrategia est[áa] fallando\b/i,
];

/** Evalúa si una respuesta es de baja calidad (debe descartarse o reintentar). */
export function isLowQualityReply(reply: string): { bad: boolean; reason?: string } {
  if (!reply || reply.trim().length < 12) return { bad: true, reason: "too_short" };
  for (const p of LEAK_PATTERNS_HARD) {
    if (p.test(reply)) return { bad: true, reason: `leak:${p.source.slice(0, 30)}` };
  }
  for (const p of BANNED_PHRASES) {
    if (p.test(reply)) return { bad: true, reason: `banned:${p.source.slice(0, 24)}` };
  }
  // Demasiados símbolos sospechosos
  const symbolRatio = (reply.match(/[{}\[\]<>]/g) || []).length / reply.length;
  if (symbolRatio > 0.04) return { bad: true, reason: "symbol_ratio" };
  // Empieza como JSON
  if (/^\s*[\{\[]/.test(reply)) return { bad: true, reason: "starts_json" };
  // Markdown bold suelto (** ... ) → la marca pide no usar negritas markdown
  const boldMarkers = (reply.match(/\*\*/g) || []).length;
  if (boldMarkers >= 4) return { bad: true, reason: "markdown_bold" };
  // Viñetas con asterisco/guion al inicio de línea (la marca pide numeración)
  if (/^[\s]*[*\-•]\s+\S/m.test(reply) && (reply.match(/^[\s]*[*\-•]\s+/gm) || []).length >= 3) {
    return { bad: true, reason: "bullet_symbols" };
  }
  // Truncación obvia: termina sin signo de cierre y la última palabra es conjunción
  const tail = reply.trim().split(/\s+/).slice(-1)[0] || "";
  if (!/[.!?…"')\]]$/.test(reply.trim()) && /^(y|o|de|en|con|para|el|la|los|las|un|una|que|del|al|si|pero|por|sin|sobre|entre)$/i.test(tail)) {
    return { bad: true, reason: "truncated_tail" };
  }
  return { bad: false };
}

/** Aplica todas las reparaciones de calidad al userReply. */
function qualityRepairReply(reply: string, userText: string): string {
  if (!reply) return reply;
  let out = reply;
  // 1) Quitar fences JSON sueltos
  out = out.replace(/```\s*(?:json|jsonc|js|ts)?[\s\S]*?```/gi, "").trim();
  // 2) Quitar líneas que son solo un objeto JSON
  out = out
    .split("\n")
    .filter((line) => !/^\s*\{[\s\S]*"[a-zA-Z_]+"\s*:/.test(line))
    .join("\n");
  // 3) Eco del input del usuario
  out = removeEcho(out, userText);
  // 4) Quitar negritas markdown (la marca pide no usar **bold**)
  out = out.replace(/\*\*([^*\n]+)\*\*/g, "$1");
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "$1");
  // 5) Convertir viñetas con * o - en numeración simple
  const lines = out.split("\n");
  let bulletCount = 0;
  const renumbered = lines.map((ln) => {
    const m = ln.match(/^(\s*)[*\-•]\s+(.*)$/);
    if (m) {
      bulletCount += 1;
      return `${m[1]}${bulletCount}. ${m[2]}`;
    }
    return ln;
  });
  if (bulletCount >= 2) out = renumbered.join("\n");
  // 6) Colapsar saltos
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  // 7) Anti-truncación: cerrar oración si quedó cortada
  out = trimToCompleteSentence(out);
  return out;
}


function parseCEOResponse(rawResponse: string, userText: string = ""): ParsedCEOResponse {
  const result: ParsedCEOResponse = {
    userReply: "",
    audioScript: "",
    avatarCues: {},
    learningExtract: {},
  };


  // ===== JSON FALLBACK: model returned {"USER_REPLY": "...", ...} instead of XML =====
  let workingRaw = rawResponse;
  const fencedJson = rawResponse.match(/```(?:json|jsonc)?\s*(\{[\s\S]*?\})\s*```/i);
  const trimmedRaw = rawResponse.trim();
  const jsonCandidate = fencedJson ? fencedJson[1] : (trimmedRaw.startsWith("{") ? trimmedRaw : null);
  if (jsonCandidate && /"(USER_REPLY|userReply)"\s*:/.test(jsonCandidate)) {
    try {
      const parsed = JSON.parse(jsonCandidate);
      const reply = parsed.USER_REPLY ?? parsed.userReply ?? "";
      const audio = parsed.CEO_AUDIO_SCRIPT ?? parsed.audioScript ?? "";
      const cues = parsed.AVATAR_CUES ?? parsed.avatarCues ?? {};
      const learn = parsed.LEARNING_EXTRACT ?? parsed.learningExtract ?? {};
      if (typeof reply === "string" && reply.trim()) result.userReply = reply.trim();
      if (typeof audio === "string") result.audioScript = audio.trim();
      if (cues && typeof cues === "object") result.avatarCues = cues as Record<string, unknown>;
      if (learn && typeof learn === "object") result.learningExtract = learn as Record<string, unknown>;
      workingRaw = ""; // already handled, skip XML extraction
    } catch (e) {
      console.warn("Failed to parse JSON-wrapped CEO response:", e);
    }
  }

  // Extract USER_REPLY (XML format)
  const userReplyMatch = workingRaw.match(/<USER_REPLY>([\s\S]*?)<\/USER_REPLY>/);
  if (userReplyMatch && !result.userReply) {
    result.userReply = userReplyMatch[1].trim();
  }

  // Extract CEO_AUDIO_SCRIPT
  const audioScriptMatch = workingRaw.match(/<CEO_AUDIO_SCRIPT>([\s\S]*?)<\/CEO_AUDIO_SCRIPT>/);
  if (audioScriptMatch && !result.audioScript) {
    result.audioScript = audioScriptMatch[1].trim();
  }

  // Extract AVATAR_CUES
  const avatarCuesMatch = workingRaw.match(/<AVATAR_CUES>([\s\S]*?)<\/AVATAR_CUES>/);
  if (avatarCuesMatch && Object.keys(result.avatarCues).length === 0) {
    try {
      result.avatarCues = JSON.parse(avatarCuesMatch[1].trim());
    } catch (e) {
      console.warn("Failed to parse AVATAR_CUES:", e);
    }
  }

  // Extract LEARNING_EXTRACT
  const learningExtractMatch = workingRaw.match(/<LEARNING_EXTRACT>([\s\S]*?)<\/LEARNING_EXTRACT>/);
  if (learningExtractMatch && Object.keys(result.learningExtract).length === 0) {
    try {
      let jsonStr = learningExtractMatch[1].trim();
      try {
        result.learningExtract = JSON.parse(jsonStr);
      } catch {
        jsonStr = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\x00-\x1F\x7F]/g, '');
        const openBraces = (jsonStr.match(/{/g) || []).length;
        const closeBraces = (jsonStr.match(/}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/]/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) jsonStr += ']';
        for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}';
        result.learningExtract = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.warn("Failed to parse LEARNING_EXTRACT:", e);
    }
  }

  // Fallback: if no structured response and raw doesn't look like a JSON envelope, use raw as userReply
  if (!result.userReply && rawResponse) {
    const fallback = rawResponse.trim();
    if (!/^\s*[\{\[]/.test(fallback) && !/"(USER_REPLY|userReply|facts_to_add|learningExtract)"/i.test(fallback)) {
      result.userReply = fallback;
    } else {
      result.userReply = "Disculpá, tuve un problema procesando la respuesta. ¿Podés repetir el mensaje?";
    }
  }

  // ============================================================
  // ZERO LEAKAGE FIREWALL — strip ALL internal blocks/markers
  // even when the model omits closing tags or wrapper tags.
  // ============================================================
  if (result.userReply) {
    const INTERNAL_TAGS = [
      'CEO_AUDIO_SCRIPT', 'AVATAR_CUES', 'LEARNING_EXTRACT', 'USER_REPLY',
      'BRAIN_JSON', 'STATE_JSON', 'CONFIG_JSON', 'SYSTEM_PROMPT',
      'INTERNAL', 'METADATA', 'DEBUG', 'TOOL_CALL', 'TOOL_RESULT',
    ];
    let cleaned = result.userReply;
    for (const tag of INTERNAL_TAGS) {
      // Closed block first (greedy across the whole tag pair)
      cleaned = cleaned.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
      // Unclosed/truncated block: remove from opening tag to end-of-string
      cleaned = cleaned.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*$`, 'gi'), '');
      // Orphan tags
      cleaned = cleaned.replace(new RegExp(`<\\/?${tag}[^>]*>`, 'gi'), '');
    }
    // Remove fenced code blocks that contain JSON or internal markers
    cleaned = cleaned.replace(/```(?:json|jsonc|js|ts)?\s*[\s\S]*?```/gi, (block) => {
      return /"(facts_to_add|decisions|risks|missions_suggested|mood|pace|gestures|moments|userReply|audioScript|learningExtract|BRAIN_JSON|STATE_JSON|CONFIG_JSON)"|<\/?(USER_REPLY|CEO_AUDIO_SCRIPT|AVATAR_CUES|LEARNING_EXTRACT)/i.test(block) ? '' : block;
    });
    // Remove orphan JSON blobs left over from internal blocks
    cleaned = cleaned.replace(/\{\s*"(facts_to_add|decisions|risks|missions_suggested|mood|pace|gestures|interruptions_allowed|moments|attachment_id|message_id|scope|definition_of_done|due_hint|userReply|audioScript|learningExtract|avatarCues)"[\s\S]*?\}\s*\}?/gi, '');
    // Strip any standalone JSON object that takes a whole line block at start/end
    cleaned = cleaned.replace(/^\s*\{[\s\S]*?"[a-z_]+"\s*:[\s\S]*?\}\s*$/i, '');
    // Cleanup orphan whitespace and stray symbols
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    result.userReply = cleaned;
  }

  // ===== QUALITY REPAIR — anti-eco, anti-truncación, anti-JSON =====
  if (result.userReply) {
    result.userReply = qualityRepairReply(result.userReply, userText);
  }




  // CRITICAL: Auto-generate audio script if missing but we have userReply
  // This ensures TTS always works even if the model forgets the audio block
  if (!result.audioScript && result.userReply) {
    result.audioScript = generateAudioScriptFromReply(result.userReply);
    console.log("Auto-generated audio script from userReply");
  }

  return result;
}

// Generate a natural audio script from the markdown reply
function generateAudioScriptFromReply(userReply: string): string {
  // Remove markdown formatting for natural speech
  let script = userReply
    // Remove headers
    .replace(/#{1,6}\s*/g, "")
    // Remove bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Remove bullet points and replace with natural pauses
    .replace(/^[-•*]\s*/gm, "... ")
    // Remove numbered lists
    .replace(/^\d+\.\s*/gm, "... ")
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Clean up multiple spaces and newlines
    .replace(/\n{2,}/g, "... ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    // Remove emojis for cleaner speech
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "")
    .trim();

  // Limit length for TTS (max ~500 chars for reasonable audio length)
  if (script.length > 600) {
    // Find a good cut point
    const cutPoint = script.lastIndexOf(".", 550);
    if (cutPoint > 300) {
      script = script.substring(0, cutPoint + 1);
    } else {
      script = script.substring(0, 550) + "...";
    }
  }

  return script;
}

// =====================
// Brain Learning Integration
// =====================

async function processLearningExtract(
  supabase: any,
  businessId: string,
  learningExtract: Record<string, unknown>,
  messageId: string
): Promise<void> {
  if (!learningExtract || Object.keys(learningExtract).length === 0) {
    return;
  }

  try {
    // Get current brain
    const { data: brain } = await supabase
      .from("business_brains")
      .select("factual_memory, decisions_memory, dynamic_memory, total_signals")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!brain) return;

    const updates: Record<string, unknown> = {};
    let learningCount = 0;

    // Process facts_to_add - store with more context
    const factsToAdd = learningExtract.facts_to_add as Array<{ 
      key: string; 
      value: unknown; 
      confidence: number;
      scope?: string;
    }> | undefined;
    
    if (factsToAdd && Array.isArray(factsToAdd) && factsToAdd.length > 0) {
      const factualMemory = (brain.factual_memory as Record<string, unknown>) || {};
      
      for (const fact of factsToAdd) {
        if (fact.key && fact.confidence >= 0.5) {
          // Group by scope for better organization
          const scope = fact.scope || "general";
          const scopeKey = `learning_${scope}`;
          
          if (!factualMemory[scopeKey]) {
            factualMemory[scopeKey] = [];
          }
          
          const scopeArray = factualMemory[scopeKey] as unknown[];
          
          // Add with timestamp for tracking
          const newFact = {
            q: fact.key,
            a: fact.value,
            t: new Date().toISOString(),
            c: fact.confidence,
          };
          
          // Avoid duplicates by checking if similar key exists
          const existingIdx = scopeArray.findIndex((f: any) => 
            typeof f === 'object' && f.q === fact.key
          );
          
          if (existingIdx >= 0) {
            // Update existing
            scopeArray[existingIdx] = newFact;
          } else {
            // Add new, keep max 15 per scope
            scopeArray.unshift(newFact);
            if (scopeArray.length > 15) {
              scopeArray.pop();
            }
          }
          
          factualMemory[scopeKey] = scopeArray;
          learningCount++;
        }
      }
      updates.factual_memory = factualMemory;
    }

    // Process decisions
    const decisions = learningExtract.decisions as Array<{ decision: string; status: string; date: string; why?: string }> | undefined;
    if (decisions && Array.isArray(decisions) && decisions.length > 0) {
      const decisionsMemory = (brain.decisions_memory as Record<string, unknown>) || {};
      const existingDecisions = (decisionsMemory.recent_decisions as unknown[]) || [];
      
      const newDecisions = decisions.map(d => ({
        ...d,
        recorded_at: new Date().toISOString(),
      }));
      
      decisionsMemory.recent_decisions = [...newDecisions, ...existingDecisions.slice(0, 20)];
      updates.decisions_memory = decisionsMemory;
      learningCount += decisions.length;
    }

    // Process preferences
    const preferences = learningExtract.preferences as Array<{ preference: string; value: string; confidence: number }> | undefined;
    if (preferences && Array.isArray(preferences) && preferences.length > 0) {
      const dynamicMemory = (brain.dynamic_memory as Record<string, unknown>) || {};
      const existingPrefs = (dynamicMemory.user_preferences as Record<string, unknown>) || {};
      
      for (const pref of preferences) {
        if (pref.confidence >= 0.5) {
          existingPrefs[pref.preference] = {
            value: pref.value,
            confidence: pref.confidence,
            updated_at: new Date().toISOString(),
          };
          learningCount++;
        }
      }
      dynamicMemory.user_preferences = existingPrefs;
      updates.dynamic_memory = dynamicMemory;
    }

    // Process risks and assumptions into dynamic_memory
    const risks = learningExtract.risks as Array<{ risk: string; severity: string; mitigation: string }> | undefined;
    if (risks && Array.isArray(risks) && risks.length > 0) {
      const dynamicMemory = (updates.dynamic_memory as Record<string, unknown>) || 
                           (brain.dynamic_memory as Record<string, unknown>) || {};
      const existingRisks = (dynamicMemory.identified_risks as unknown[]) || [];
      dynamicMemory.identified_risks = [...risks.slice(0, 5), ...existingRisks.slice(0, 10)];
      updates.dynamic_memory = dynamicMemory;
    }

    // Process missions_to_create — auto-crea misión cuando el usuario lo pidió
    // explícitamente. El trigger Free (límite=1) bloqueará automáticamente si excede.
    const missionsToCreate = learningExtract.missions_to_create as Array<{
      title: string;
      description?: string;
      priority?: string;
      category?: string;
    }> | undefined;
    if (missionsToCreate && Array.isArray(missionsToCreate) && missionsToCreate.length > 0) {
      const valid = missionsToCreate.filter(m => m && typeof m.title === "string" && m.title.trim().length > 3).slice(0, 3);
      for (const m of valid) {
        const { error: mErr } = await supabase.from("missions").insert({
          business_id: businessId,
          title: m.title.trim().slice(0, 120),
          description: (m.description ?? "").slice(0, 600),
          status: "pending",
          priority: ["high", "medium", "low"].includes(m.priority ?? "") ? m.priority : "medium",
          category: ["growth", "service", "tech", "custom"].includes(m.category ?? "") ? m.category : "custom",
        });
        if (mErr) {
          console.warn("[chat] missions_to_create insert blocked:", mErr.message);
          break; // probable free-limit; cortamos y no spammeamos
        }
        learningCount++;
      }
    }

    // Update brain if there are changes
    if (Object.keys(updates).length > 0) {
      updates.last_learning_at = new Date().toISOString();
      updates.total_signals = (brain.total_signals || 0) + learningCount;
      
      await supabase
        .from("business_brains")
        .update(updates)
        .eq("business_id", businessId);
      
      console.log("Brain updated with learning:", { 
        keys: Object.keys(updates), 
        newLearnings: learningCount 
      });
    }

    // Record signal for learning
    await supabase.from("signals").insert({
      business_id: businessId,
      signal_type: "ceo_chat_learning",
      source: "vistaceo-chat",
      content: learningExtract,
      raw_text: `Learning extracted: ${learningCount} new items from message ${messageId}`,
      confidence: "high",
      importance: 7,
    });

  } catch (error) {
    console.error("Error processing learning extract:", error);
  }
}

// =====================
// Main Handler
// =====================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reqBody = await req.json();
    const { messages, inputType = "text", messageId, personalityPrompt, attachments = [], contextPack, businessId, module } = reqBody;
    // Backwards-compatible: prefer ContextPack businessSummary; fall back to raw businessContext if old client still sends it.
    const businessContext = reqBody.businessContext ?? (contextPack ? {
      id: contextPack.businessId ?? businessId,
      name: contextPack.businessSummary?.name,
      category: contextPack.businessSummary?.sector ?? contextPack.businessSummary?.activity,
      country: contextPack.businessSummary?.country,
    } : { id: businessId });
    console.log('[vistaceo-chat] module=', module ?? 'chat', 'hasContextPack=', !!contextPack);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    // ============================================================
    // PLAN ENFORCEMENT (server-side, before consuming AI)
    // Free: 3 mensajes LIFETIME (de por vida). Pro: ilimitado.
    // Misma calidad e inteligencia de respuesta para free y pro.
    // Fail-open en errores para no bloquear al usuario por fallos transitorios.
    // ============================================================
    const FREE_CHAT_LIFETIME = 3;
    let isProPlan = false;
    if (supabase && businessContext?.id) {
      try {
        const { data: activeSub } = await supabase
          .from("subscriptions")
          .select("status, expires_at")
          .eq("business_id", businessContext.id)
          .eq("status", "active")
          .gt("expires_at", new Date().toISOString())
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        isProPlan = !!activeSub;

        if (!isProPlan) {
          const { count: usedLifetime } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("business_id", businessContext.id)
            .eq("role", "user");

          if ((usedLifetime ?? 0) >= FREE_CHAT_LIFETIME) {
            console.log(
              `[plan-limit] business ${businessContext.id} hit FREE lifetime chat cap (${usedLifetime}/${FREE_CHAT_LIFETIME})`,
            );
            return new Response(
              JSON.stringify({
                error: "free_limit_reached",
                limit_type: "chat",
                used: usedLifetime,
                limit: FREE_CHAT_LIFETIME,
                message:
                  "Usaste los 3 mensajes gratis de tu cuenta. Pasate a Pro para chatear sin límites con tu CEO virtual.",
                upgrade_url: "/checkout",
              }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
        }
      } catch (limitErr) {
        // Never block the user if the quota check itself crashes.
        console.error("[plan-limit] check failed, allowing request:", limitErr);
      }
    }

    // Fetch memory context if we have business ID
    let memoryContext: MemoryContext = {
      recentActions: [],
      activeMissions: [],
      recentCheckins: [],
      lessons: [],
      businessInsights: [],
      brain: null,
      recentSignals: [],
      latestSnapshot: null,
      activeAlerts: [],
    };

    if (businessContext?.id && supabase) {
      memoryContext = await fetchMemoryContext(supabase, businessContext.id);
    }

    // Build structured context JSONs
    const configJson = buildConfigJson(businessContext, memoryContext.brain);
    const brainJson = buildBrainJson(memoryContext.brain, businessContext);
    const stateJson = buildStateJson(memoryContext);

    // Build personality injection if provided
    const personalityInjection = personalityPrompt ? `
=== PERSONALIDAD DEL CEO ===
${personalityPrompt}
=== FIN PERSONALIDAD ===
` : "";

    // Build context injection message
    const contextInjection = `
${personalityInjection}
=== CONTEXTO DEL NEGOCIO (JSON) ===

CONFIG_JSON:
${JSON.stringify(configJson, null, 2)}

BRAIN_JSON:
${JSON.stringify(brainJson, null, 2)}

STATE_JSON:
${JSON.stringify(stateJson, null, 2)}

MESSAGE_JSON:
{
  "message_id": "${messageId || `msg-${Date.now()}`}",
  "input_type": "${inputType}",
  "timestamp": "${new Date().toISOString()}"
}

=== FIN CONTEXTO ===
`;

    // Prepare messages for AI (with multimodal support for images)
    // Cost-optimized: 12 messages of context preserve coherence while reducing tokens ~40%
    const recentMessages = messages.slice(-12).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // Inject image attachments into the last user message as multimodal content
    const imageAttachments = (attachments || []).filter((a: any) => a?.type === "image" && a?.dataUrl);
    if (imageAttachments.length > 0 && recentMessages.length > 0) {
      const lastIdx = recentMessages.length - 1;
      const last = recentMessages[lastIdx];
      if (last.role === "user") {
        const textPart = typeof last.content === "string" ? last.content : "";
        recentMessages[lastIdx] = {
          role: "user",
          content: [
            { type: "text", text: textPart || "Analizá esta imagen en el contexto de mi negocio." },
            ...imageAttachments.map((a: any) => ({
              type: "image_url",
              image_url: { url: a.dataUrl },
            })),
          ] as any,
        };
      }
    }

    // ---------- EFICIENCIA IA: selector dinámico de modelo ----------
    // Mensajes simples → Flash Lite (~4x más barato). Complejos/multimodales → Flash.
    const lastUserMsg = [...recentMessages].reverse().find((m: any) => m.role === "user");
    const lastText = typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : (lastUserMsg?.content?.[0]?.text || "");
    const isShort = lastText.length < 220;
    const hasImages = imageAttachments.length > 0;
    const complexHints = /(crisis|urgente|estrategia|plan|análisis|analiza|presupuesto|forecast|expansión|despido|legal|pricing|precio|margen|caja|equipo|conflict)/i;
    const specificDataHints = /\b(cuál(?:es)?|qué|cuánto|cuántos|cuántas|top|ranking|listame|dame|mejor(?:es)?|peor(?:es)?|más vendid|menos vendid|productos?|servicios?|clientes?|competidores?|precios?|métricas?)\b/i;
    const wantsSpecificData = specificDataHints.test(lastText);
    const isComplex = hasImages || complexHints.test(lastText) || wantsSpecificData || lastText.length > 600;

    // Modelo: máxima inteligencia para TODOS (free y pro).
    // El free debe sentir el poder real de la app — eso convierte a Pro.
    // Diferencia free vs pro = cantidad de mensajes/mes, NO calidad por mensaje.
    const trivialHints = /^(hola|hi|hey|buenas|gracias|ok|listo|dale|si|no|perfecto|genial|ya|👍|🙏)\b/i;
    const isTrivial = !hasImages && lastText.length < 60 && trivialHints.test(lastText.trim());

    // Máxima inteligencia SIEMPRE para cualquier mensaje real.
    // Solo los saludos triviales usan el modelo liviano.
    let selectedModel: string;
    if (isTrivial) selectedModel = "google/gemini-2.5-flash-lite";
    else selectedModel = "google/gemini-3-flash-preview";

    // Cap de tokens — suficiente para cerrar oraciones (anti-truncación).
    // Máximo 2 párrafos enfocados. Mismo techo para free y pro.
    let maxTokens: number;
    if (isTrivial) maxTokens = 220;
    else maxTokens = isComplex ? 1100 : 800;

    // Capa de terminología profesional contextual por país y actividad
    const { buildTerminologyContext } = await import("../_shared/brain-core/contextual-terminology.ts");
    const ctxBrain = memoryContext.brain as Record<string, unknown> | null;
    const ctxFactual = (ctxBrain?.factual_memory as Record<string, unknown>) || {};
    const terminology = buildTerminologyContext({
      activity: (ctxBrain?.primary_business_type as string) || businessContext?.category || null,
      offer: (ctxFactual.offer as string) ?? null,
      customer: (ctxFactual.customer as string) ?? null,
      channel: (ctxFactual.channel as string) ?? null,
      country: businessContext?.country ?? null,
    });

    const aiMessages = [
      { role: "system", content: CEO_SYSTEM_PROMPT },
      { role: "system", content: ANTI_GENERIC_SYSTEM },
      { role: "system", content: terminology.promptFragment },
      { role: "system", content: contextInjection },
      ...recentMessages,
    ];

    console.log("Calling VistaCEO AI:", {
      msgs: messages.length, model: selectedModel,
      complex: isComplex, trivial: isTrivial, short: isShort, maxTokens, pro: isProPlan,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: aiMessages,
        stream: false,
        temperature: isTrivial ? 0.4 : 0.6,
        max_tokens: maxTokens,
      }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ message: safeRateLimitMessage() }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ message: safeCreditMessage() }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content;

    if (!rawResponse) {
      throw new Error("No response from AI");
    }

    // Parse the structured response (pasamos texto de usuario para anti-eco)
    let parsed = parseCEOResponse(rawResponse, lastText);

    // ===== QUALITY GATE: auto-retry si la respuesta es de baja calidad =====
    const quality = isLowQualityReply(parsed.userReply);
    if (quality.bad) {
      console.warn("Quality gate failed, retrying:", quality.reason);
      try {
        const retryResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              ...aiMessages,
              { role: "system", content: `RETRY: tu respuesta anterior falló el control de calidad (${quality.reason}). Devolvé el contrato XML exacto con <USER_REPLY>...</USER_REPLY> en markdown limpio, sin JSON, sin códigos internos, sin cortar oraciones, sin repetir el mensaje del usuario.` },
            ],
            stream: false,
            temperature: 0.4,
            max_tokens: maxTokens,
          }),
        });
        if (retryResp.ok) {
          const retryData = await retryResp.json();
          const retryRaw = retryData.choices?.[0]?.message?.content;
          if (retryRaw) {
            const retryParsed = parseCEOResponse(retryRaw, lastText);
            if (!isLowQualityReply(retryParsed.userReply).bad) {
              parsed = retryParsed;
              console.log("Quality retry succeeded");
            }
          }
        }
      } catch (e) {
        console.error("Quality retry failed:", e);
      }
    }

    // Sanitiza la salida visible (Parte 3 §8): remueve snake_case, JSON, inglés técnico
    parsed.userReply = sanitizeVisibleString(parsed.userReply || "");

    // Quality gate extremo (Parte 3 §7) + runtime gate por tipo "chat"
    const concreteActionRx = /\b(haz|hacé|hacer|prob[áa]|revis[áa]|cre[áa]|defin[íi]|envi[áa]|mid[ée]|llam[áa]|escrib[íi]|ofrec[ée]|publica|prepara|ajusta|ordena|mape[áa]|ubica|detect[áa])\b/i;
    const extreme = extremeQualityCheck({
      text: parsed.userReply,
      hasBrainEvidence: !!(businessContext?.id),
      hasConcreteAction: concreteActionRx.test(parsed.userReply),
    });
    const chatGate = (await import("../_shared/brain-core/runtime-output-gate.ts")).runtimeOutputGate({
      text: parsed.userReply,
      kind: "chat",
      hasBrainEvidence: !!(businessContext?.id),
      hasConcreteAction: concreteActionRx.test(parsed.userReply),
    });
    if (!extreme.ok || !chatGate.ok) {
      console.warn("chat gate flagged (soft):", [...extreme.reasons, ...chatGate.reasons].join(" | "));
      // CRÍTICO: NUNCA reemplazar una respuesta real de la IA por texto enlatado.
      // Solo usamos fallback si hay una fuga técnica real (JSON crudo, error, basura).
      const hardLeakRx = /(\[object Object\]|```json|\{\s*"[a-zA-Z_]+"\s*:|undefined|NaN\b|<USER_REPLY|LEARNING_EXTRACT|stack trace|TypeError|Error:)/;
      const tooBroken = !parsed.userReply || parsed.userReply.trim().length < 8 || hardLeakRx.test(parsed.userReply);
      if (tooBroken) {
        const sf = (await import("../_shared/brain-core/runtime-output-gate.ts")).safeFallback("chat");
        parsed.userReply = sf;
      }
      // Flags blandos ("sin acción concreta", etc.) → se mantiene la respuesta real.
    }

    // ===== RETRY BLINDADO EN TEXTO PLANO =====
    // Si después de todos los filtros la respuesta quedó vacía o cae al fallback
    // enlatado, intentamos UNA llamada extra al modelo más capaz sin contrato XML.
    // Esto garantiza que el usuario SIEMPRE reciba una respuesta real del CEO.
    if (!parsed.userReply || parsed.userReply.trim().length < 30) {
      try {
        console.warn("Activating plain-text guaranteed retry");
        const plainResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `Sos el CEO virtual del negocio del usuario. Respondé el último mensaje en español natural, máximo 2 párrafos, tono ejecutivo cercano, sin asteriscos markdown, sin JSON, sin etiquetas XML, sin frases tipo "como IA" o "disculpá tuve un problema". Usá los datos del negocio cuando aporten valor. Si no tenés un dato exacto, planteá hipótesis explícita y seguí. Nunca te plantes solo en pedir confirmación: siempre dar contenido sustancial primero.\n\nContexto del negocio:\n${JSON.stringify({ brain: brainJson, state: stateJson, config: configJson }).slice(0, 6000)}`,
              },
              ...recentMessages,
            ],
            stream: false,
            temperature: 0.55,
            max_tokens: 900,
          }),
        });
        if (plainResp.ok) {
          const plainData = await plainResp.json();
          const plainText = plainData.choices?.[0]?.message?.content;
          if (plainText && typeof plainText === "string" && plainText.trim().length > 30) {
            parsed.userReply = sanitizeVisibleString(qualityRepairReply(plainText.trim(), lastText));
          }
        }
      } catch (e) {
        console.error("Plain-text guaranteed retry failed:", e);
      }
    }

    // Último fallback seguro (Parte 3 §12)
    if (!parsed.userReply || parsed.userReply.trim().length < 8) {
      parsed.userReply = safeUserFacingError(lastText);
    }

    console.log("VistaCEO response parsed:", {
      hasUserReply: !!parsed.userReply,
      hasAudioScript: !!parsed.audioScript,
      hasAvatarCues: Object.keys(parsed.avatarCues).length > 0,
      hasLearning: Object.keys(parsed.learningExtract).length > 0,
      qualityRetried: quality.bad,
    });


    // Process learning extract asynchronously
    if (supabase && businessContext?.id && Object.keys(parsed.learningExtract).length > 0) {
      processLearningExtract(supabase, businessContext.id, parsed.learningExtract, messageId || `msg-${Date.now()}`)
        .catch(err => console.error("Error processing learning:", err));
    }

    // Record chat signal
    if (supabase && businessContext?.id && messages.length > 0) {
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      if (lastUserMessage) {
        await supabase.from("signals").insert({
          business_id: businessContext.id,
          signal_type: "ceo_chat",
          source: "vistaceo-chat",
          content: {
            user_message: lastUserMessage.content.slice(0, 500),
            response_preview: parsed.userReply.slice(0, 200),
            has_learning: Object.keys(parsed.learningExtract).length > 0,
          },
          raw_text: lastUserMessage.content.slice(0, 1000),
          confidence: "high",
          importance: 6,
        });
      }
    }

    // Server-side validateBeforeStore (Prompt 3): block Red List leaks before returning.
    try {
      const { validateBeforeStore } = await import("../_shared/validate-before-store.ts");
      const audit = validateBeforeStore({ module: 'chat', text: parsed.userReply });
      if (!audit.passed) {
        console.warn('[vistaceo-chat] validateBeforeStore blocked:', audit.reasons);
        const sf = (await import("../_shared/brain-core/runtime-output-gate.ts")).safeFallback("chat");
        parsed.userReply = sf;
      } else if (audit.sanitized.text) {
        parsed.userReply = audit.sanitized.text;
      }
    } catch (e) {
      console.error('[vistaceo-chat] server validate failed:', e);
    }

    return new Response(
      JSON.stringify({
        message: parsed.userReply,
        audioScript: parsed.audioScript,
        avatarCues: parsed.avatarCues,
        learningExtract: parsed.learningExtract,
        quality: { passed: true },
        fallbackUsed: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("VistaCEO chat error:", error);
    return new Response(
      JSON.stringify({ message: safeUserFacingError(String(error)) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
