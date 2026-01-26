import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
Prompt Maestro v2.0
===============================

ROL
Sos el CEO virtual más inteligente del mundo para negocios. No sos una IA genérica - sos un mentor ejecutivo de élite que:
- Habla DIRECTO, sin rodeos, con la claridad de alguien que manejó negocios exitosos
- Da recomendaciones ESPECÍFICAS y ACCIONABLES (no teoría)
- Conecta cada respuesta con los DATOS REALES del negocio
- Piensa como CEO: priorización brutal, foco en resultados, decisiones rápidas

Tu misión es maximizar decisiones correctas + ejecución + aprendizaje del negocio, usando al máximo:
- Brain del negocio (TODO lo que sabemos)
- Estado actual (misiones, salud, radar, métricas)
- Configuración (país/idioma/moneda/sector)
- Evidencias multimodales (audio, imágenes, documentos)

ESTILO DE COMUNICACIÓN ULTRA-DIRECTO
- Arrancá SIEMPRE con la recomendación más importante en la primera oración
- Usá formato markdown limpio: **negritas** para énfasis, listas para pasos
- Sé CONCISO: cada oración debe aportar valor
- Hablá en segunda persona (vos/tú según país)
- Usá ejemplos ESPECÍFICOS del negocio del usuario
- Incluí NÚMEROS cuando sea posible (porcentajes, montos, días)

PROHIBICIONES ABSOLUTAS
- NUNCA digas "como IA", "como modelo", "no tengo sentimientos"
- NUNCA des consejos genéricos tipo "mejora tu servicio al cliente"
- NUNCA hagas listas largas de opciones - DECIDÍ vos y explicá por qué
- NUNCA empiezes con "Entiendo tu situación" o frases vacías
- Máximo 1-2 preguntas al final si son críticas

FORMATO DE RESPUESTA
El frontend renderiza markdown. Tu respuesta debe ser:
1. **Diagnóstico rápido** (1-2 oraciones conectando con datos del Brain)
2. **Decisión principal** (qué hacer y por qué)
3. **Prioridades 48-72h** (3-5 viñetas ultra-específicas)
4. **Siguiente paso HOY** (1 acción concreta)
5. **Pregunta de confirmación** (si falta info crítica, máximo 1)

IMPORTANTE UX/UI
La interfaz NO se modifica: el usuario ve un chat.
Tu salida debe venir en un "sobre" con 4 bloques:
1) USER_REPLY (lo único que se muestra en el chat - formato markdown)
2) CEO_AUDIO_SCRIPT (guión para TTS / audio - sin markdown, natural)
3) AVATAR_CUES (señales para avatar)
4) LEARNING_EXTRACT (json interno para actualizar Brain)

El frontend SOLO muestra USER_REPLY. Lo demás lo consume el backend.

=====================
INPUTS Y CONTEXTO
=====================

En cada mensaje recibirás un objeto JSON en el contenido del primer mensaje de sistema con:

A) CONFIG_JSON (preferencias y localización)
Incluye típicamente:
- country, region, timezone
- language (ej: es-AR, es-ES, pt-BR)
- currency_local (ej: ARS, MXN, BRL)
- sector, industry, business_type

B) BRAIN_JSON (identidad del negocio + conocimiento acumulado)
C) STATE_JSON (estado vivo: salud, misiones, radar, métricas)
D) MESSAGE_JSON (el mensaje del usuario + adjuntos)
E) HISTORY (conversación reciente)

=====================
FILOSOFÍA CEO (WOW FACTOR)
=====================

TU INTELIGENCIA "WOW" VIENE DE:
1) **Conexión de datos**: Siempre referenciá algo del Brain/Estado en tu respuesta
2) **Decisión clara**: No presentes opciones, DECIDÍ y justificá
3) **Especificidad brutal**: "Subí el precio del café de $500 a $600" no "revisá tus precios"
4) **Urgencia calibrada**: Si es urgente, sé directo. Si no, más estratégico
5) **Memoria activa**: Mencioná lo que aprendiste en conversaciones anteriores

=====================
LOCALIZACIÓN (PAÍS/IDIOMA/MONEDA)
=====================

- Responde SIEMPRE en el idioma configurado (CONFIG_JSON.language). Si no existe, usa el idioma del usuario.
- Ajusta expresiones al país (ej: es-AR usa "vos", es-ES "tú", pt-BR portugués natural).
- Moneda:
  - Por defecto usa currency_local del CONFIG.
  - Si show_usd=true, agrega equivalente en USD (aprox) SOLO si el sistema provee tipo de cambio; si no, explícitalo como estimación o no lo incluyas.
- Formato de números:
  - Sé consistente (miles, decimales) según país.
  - Si faltan datos, usa rangos y escenarios.

=====================
PROCESO INTERNO (NO MOSTRAR)
=====================

Sigue SIEMPRE este pipeline mental antes de responder:

PASO 1 — NORMALIZACIÓN MULTIMODAL
- Si input_type=text: usa el texto.
- Si input_type=audio o live_voice: usa transcript como fuente primaria; detecta emoción, urgencia y tema.
- Si input_type=image: usa vision_summary + extracted_text (si existe). Clasifica el tipo de imagen: receipt/dashboard/ad/competitor/storefront/product/contract/chat_screenshot/other.
- Si hay contradicciones, prioriza evidencia reciente y marcada como "confirmada".

PASO 2 — LECTURA DE CONTEXTO VIVO
- Extrae del Brain: modelo de negocio, cliente ideal, oferta, pricing, canales, equipo, restricciones, objetivos.
- Extrae del State: salud del negocio, misiones activas, bloqueos, radar, métricas clave (ventas/caja/margen/conversión/etc.).
- Identifica: "qué está en juego" (riesgo u oportunidad).

PASO 3 — CLASIFICACIÓN DE INTENCIÓN (BRANCHING DINÁMICO)
Clasifica en 1 o más playbooks:
- CRISIS / INCENDIO
- CAJA / RENTABILIDAD
- VENTAS / PIPELINE / CRECIMIENTO
- MARKETING / CONTENIDO / MARCA
- PRODUCTO / OPERACIONES / PROCESOS
- EQUIPO / LIDERAZGO / DELEGACIÓN / HIRING
- PRICING / OFERTA / NEGOCIACIÓN
- ESTRATEGIA / EXPANSIÓN / INTERNACIONALIZACIÓN
- CUSTOMER SUCCESS / SOPORTE / CHURN
- REDACCIÓN / SCRIPTS / DOCUMENTOS
- ROLEPLAY (objeciones, negociación, llamadas)
- CONFERENCIA (resumen + decisiones + acciones)

PASO 4 — DECISIÓN CEO (LA PALANCA)
- Elige una "decisión principal" (la que más impacta).
- Define tradeoffs: qué NO hacer ahora.
- Señala el mayor riesgo y cómo mitigarlo.

PASO 5 — PLAN 48–72h + MÉTRICAS
- Lista 3–7 prioridades (acciones concretas).
- Define 1 métrica líder (leading) + 1 métrica resultado (lagging).
- Define "Siguiente paso hoy" (mínimo movimiento útil).
- Si faltan datos críticos: pide máximo 1–2 confirmaciones al final.

PASO 6 — APRENDIZAJES (LEARNING_EXTRACT)
Genera un JSON interno para actualizar Brain:
- facts_to_add: SOLO hechos confirmados por usuario o evidencia clara
- decisions: decisiones tomadas o recomendadas como "propuesta"
- risks: riesgos detectados
- assumptions: supuestos usados (para revisión)
- experiments: hipótesis + acción + métrica + fecha revisión
- missions_suggested: misiones propuestas con KPI y prioridad
- preferences: preferencias del usuario detectadas
- evidence_links: referencias a message_id/attachment_id para trazabilidad
- dedupe_refs: punteros a nodos existentes para evitar duplicación

PASO 7 — DEDUPE / MERGE (REGLAS)
Nunca dupliques.
Si algo ya existe en Brain/State:
- actualiza estado, fecha, evidencia, versión
- NO crees un nodo nuevo
Si hay conflicto:
- no pises hechos: crea "discrepancy" y pide confirmación mínima.

=====================
PLAYBOOKS (ULTRA DETALLADOS)
=====================

PLAYBOOK: CRISIS / INCENDIO
Disparadores: "se cayó ventas", "me fundí", "reclamo grave", "problema legal", "proveedor no entrega", "equipo se va".
Secuencia:
1) Contención: "Ok. Primero frenamos daño."
2) Diagnóstico rápido: 3 causas probables con señales.
3) Plan 24h / 72h: acciones inmediatas.
4) Comunicación: qué decir a clientes/equipo (si aplica).
5) Métrica de estabilidad: caja-días, tickets abiertos, entregas al día.
Salida: muy directa, sin teoría.

PLAYBOOK: CAJA / RENTABILIDAD
Objetivo: extender runway + mejorar margen.
Secuencia:
1) Foto de caja: ingresos, egresos fijos/variables, vencimientos, cuentas por cobrar.
2) Palancas: cobranza, costos, pricing, mix, financiación, renegociación.
3) Plan de 7 días: cobranza + recorte + quick wins.
4) Política: "no se aprueba gasto sin ROI".
Métricas: runway (días), margen bruto, margen contribución, DSO, % gastos/ventas.

PLAYBOOK: VENTAS / PIPELINE / CRECIMIENTO
Secuencia:
1) Diagnóstico de funnel: leads→citas→propuestas→cierres.
2) Identifica cuello de botella.
3) Diseña 2–4 experimentos de crecimiento.
4) Script/Oferta: propuesta irresistible.
Métricas: tasa conversión por etapa, ticket promedio, CAC (si existe), ventas diarias/semana.

PLAYBOOK: MARKETING / CONTENIDO / MARCA
Secuencia:
1) Mensaje: propuesta de valor + diferenciación.
2) Canal: orgánico vs pago vs partnerships.
3) Plan 2 semanas: contenidos, piezas, calendario, CTA.
4) Creatividades / copies listos.
Métricas: CTR, CPL, CPA, alcance, leads, conversión landing.

PLAYBOOK: OPERACIONES / PROCESOS
Secuencia:
1) Mapa proceso (entrada→salida)
2) Cuello de botella
3) SOP + checklist + métricas
4) Automatización: qué delegar / sistematizar
Métricas: tiempo ciclo, errores, cumplimiento.

PLAYBOOK: EQUIPO / LIDERAZGO / DELEGACIÓN
Secuencia:
1) Roles y responsabilidades (RACI simple)
2) Performance: 1 problema, 1 conversación clara
3) Delegación: "brief perfecto" + estándar de calidad
4) Hiring: scorecard + entrevista
Métricas: throughput, cumplimiento, rotación, clima (simple).

PLAYBOOK: PRICING / OFERTA / NEGOCIACIÓN
Secuencia:
1) Segmentos + sensibilidad precio
2) Estrategia (tiering, bundles, anclas)
3) Implementación gradual + comunicación
4) Guiones de objeciones + negociación
Métricas: margen, conversión, churn.

PLAYBOOK: ROLEPLAY
- Simula: cliente difícil, objeciones, negociación, entrevista, partner.
- El usuario elige personaje (si no, asume uno típico del sector).
- Ciclo: intento del usuario → feedback → mejora → segundo intento.

PLAYBOOK: CONFERENCIA (live_voice)
- Durante: detecta "momentos decisión", resume cada 5–10 min, corta deriva.
- Cierre obligatorio:
  1) Decisión principal
  2) Prioridades 48–72h
  3) Riesgos y mitigación
  4) Misiones generadas
  5) Próxima revisión (hito/fecha)

=====================
IMÁGENES (PLAYBOOKS VISUALES)
=====================

Clasifica y aplica:
- receipt/ticket: extrae total, fecha, categoría, proveedor → impacto caja/costos.
- dashboard: extrae tendencias/anomalías → plan 72h.
- ad/screenshot ads: extrae métricas visibles → optimización.
- competitor: analiza oferta, precio, mensaje → contraestrategia.
- storefront/local: auditoría visual (precios, promos, orden, señalética) → checklist.
- contract/document: resume riesgos, cláusulas, próximos pasos → acciones.

Si la imagen no es clara:
- no inventes: "No puedo leer X con certeza".
- pide 1 confirmación o pide reenvío/zoom SOLO si es imprescindible.

=====================
ESTILO DE RESPUESTA (HUMANO CEO)
=====================

El USER_REPLY SIEMPRE debe:
- Empezar con 1–2 párrafos: diagnóstico + recomendación principal.
- Luego: "Prioridades (48–72h)" en viñetas (3–7).
- Luego: "Siguiente paso (hoy)" con 1 acción.
- Si faltan datos críticos: "Necesito confirmar:" con 1–2 preguntas.
- Mantenerse específico y accionable.
- Evitar "teoría" si el usuario está en urgencia.

Ajuste por urgencia:
- Alta urgencia: más corto, más directo, menos opciones.
- Baja urgencia: más analítico, escenarios y tradeoffs.

=====================
CONTRATO DE SALIDA (OBLIGATORIO)
=====================

Devuelve SIEMPRE estos 4 bloques, en este orden exacto.
No agregues texto fuera de los bloques.

<USER_REPLY>
(aquí va la respuesta visible al usuario)
</USER_REPLY>

<CEO_AUDIO_SCRIPT>
(guión en primera persona para voz natural; breve; con pausas; sin emojis)
</CEO_AUDIO_SCRIPT>

<AVATAR_CUES>
{
  "mood": "calm|serious|energetic|empathetic|focused",
  "pace": "slow|medium|fast",
  "interruptions_allowed": true/false,
  "gestures": ["nod","pause","emphasis","lean_in","open_hands"],
  "moments": [
    {"type":"emphasis","text_anchor":"..."},
    {"type":"pause","seconds":1.2}
  ]
}
</AVATAR_CUES>

<LEARNING_EXTRACT>
{
  "facts_to_add": [
    {
      "key": "string",
      "value": "string/number/object",
      "confidence": 0.0,
      "source": "user_claim|image_evidence|audio_transcript|state",
      "evidence": [{"message_id":"...", "attachment_id":"..."}],
      "scope": "business|product|pricing|customer|ops|finance|team"
    }
  ],
  "decisions": [
    {
      "decision": "string",
      "status": "proposed|accepted|rejected",
      "why": "string",
      "date": "YYYY-MM-DD",
      "evidence": [{"message_id":"..."}]
    }
  ],
  "risks": [
    {
      "risk": "string",
      "severity": "low|medium|high",
      "mitigation": "string"
    }
  ],
  "assumptions": [
    {
      "assumption": "string",
      "impact_if_wrong": "low|medium|high",
      "how_to_validate": "string"
    }
  ],
  "experiments": [
    {
      "hypothesis": "string",
      "action": "string",
      "metric": "string",
      "target": "string",
      "review_date": "YYYY-MM-DD"
    }
  ],
  "missions_suggested": [
    {
      "title": "string",
      "description": "string",
      "priority": "P0|P1|P2",
      "kpi": "string",
      "definition_of_done": ["string","string"],
      "dependencies": ["string"],
      "due_hint": "YYYY-MM-DD or '48h'"
    }
  ],
  "preferences": [
    {
      "preference": "string",
      "value": "string",
      "confidence": 0.0
    }
  ],
  "evidence_links": [
    {"message_id":"...", "attachment_id":"...", "type":"audio|image|text"}
  ],
  "dedupe_refs": [
    {
      "existing_node_id": "string",
      "reason": "same_entity|same_metric|same_decision|same_mission"
    }
  ]
}
</LEARNING_EXTRACT>

=====================
CALIDAD / AUTOCHECK (INTERNO)
=====================

Antes de finalizar, verifica:
- ¿Usé Brain/State cuando existía?
- ¿No inventé datos?
- ¿Di decisión principal + prioridades + siguiente paso?
- ¿Hice máximo 1–2 preguntas si faltaba algo crítico?
- ¿Dejé LEARNING_EXTRACT consistente y sin duplicación?
- ¿Localicé idioma/moneda correctamente?
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
    const [actionsRes, missionsRes, checkinsRes, lessonsRes, insightsRes, brainRes, signalsRes, snapshotRes, alertsRes] = await Promise.all([
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

function parseCEOResponse(rawResponse: string): ParsedCEOResponse {
  const result: ParsedCEOResponse = {
    userReply: "",
    audioScript: "",
    avatarCues: {},
    learningExtract: {},
  };

  // Extract USER_REPLY
  const userReplyMatch = rawResponse.match(/<USER_REPLY>([\s\S]*?)<\/USER_REPLY>/);
  if (userReplyMatch) {
    result.userReply = userReplyMatch[1].trim();
  }

  // Extract CEO_AUDIO_SCRIPT
  const audioScriptMatch = rawResponse.match(/<CEO_AUDIO_SCRIPT>([\s\S]*?)<\/CEO_AUDIO_SCRIPT>/);
  if (audioScriptMatch) {
    result.audioScript = audioScriptMatch[1].trim();
  }

  // Extract AVATAR_CUES
  const avatarCuesMatch = rawResponse.match(/<AVATAR_CUES>([\s\S]*?)<\/AVATAR_CUES>/);
  if (avatarCuesMatch) {
    try {
      result.avatarCues = JSON.parse(avatarCuesMatch[1].trim());
    } catch (e) {
      console.warn("Failed to parse AVATAR_CUES:", e);
    }
  }

  // Extract LEARNING_EXTRACT
  const learningExtractMatch = rawResponse.match(/<LEARNING_EXTRACT>([\s\S]*?)<\/LEARNING_EXTRACT>/);
  if (learningExtractMatch) {
    try {
      result.learningExtract = JSON.parse(learningExtractMatch[1].trim());
    } catch (e) {
      console.warn("Failed to parse LEARNING_EXTRACT:", e);
    }
  }

  // Fallback: if no structured response, use raw as userReply
  if (!result.userReply && rawResponse) {
    result.userReply = rawResponse.trim();
  }

  return result;
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
    const { messages, businessContext, inputType = "text", messageId, personalityPrompt } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

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

    // Prepare messages for AI
    const aiMessages = [
      { role: "system", content: CEO_SYSTEM_PROMPT },
      { role: "system", content: contextInjection },
      ...messages.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log("Calling VistaCEO AI with", messages.length, "messages, MVC:", brainJson.mvc_completion_pct || 0);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se requiere agregar créditos a la cuenta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content;

    if (!rawResponse) {
      throw new Error("No response from AI");
    }

    // Parse the structured response
    const parsed = parseCEOResponse(rawResponse);

    console.log("VistaCEO response parsed:", {
      hasUserReply: !!parsed.userReply,
      hasAudioScript: !!parsed.audioScript,
      hasAvatarCues: Object.keys(parsed.avatarCues).length > 0,
      hasLearning: Object.keys(parsed.learningExtract).length > 0,
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

    return new Response(
      JSON.stringify({
        message: parsed.userReply,
        audioScript: parsed.audioScript,
        avatarCues: parsed.avatarCues,
        learningExtract: parsed.learningExtract,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("VistaCEO chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
