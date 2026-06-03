import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
- Por defecto: español NEUTRO apto para toda LATAM (sin "vos", sin "tú" exclusivos). Solo aplicá voseo si CONFIG_JSON.country ∈ {AR, UY, PY} o tone="voseo".
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
Genera un JSON interno para actualizar Brain.
⚠️ OBLIGATORIO: TODOS los textos (keys, values, descriptions, decisions) DEBEN estar en ESPAÑOL. NUNCA escribas en inglés.
- facts_to_add: SOLO hechos confirmados por usuario o evidencia clara. Keys y values siempre en español.
- decisions: decisiones tomadas o recomendadas como "propuesta"
- risks: riesgos detectados (en español)
- assumptions: supuestos usados (para revisión)
- experiments: hipótesis + acción + métrica + fecha revisión
- missions_suggested: misiones propuestas con KPI y prioridad (títulos y descripciones en español)
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
(aquí va la respuesta visible al usuario — SOLO texto natural en markdown limpio.
PROHIBIDO dentro de USER_REPLY: bloques de código JSON crudo, objetos JSON literales, llaves { } con claves entrecomilladas, etiquetas tipo XML, palabras clave técnicas como "facts_to_add" / "decisions" / "missions_suggested" / "learningExtract".
Si necesitas estructurar datos, usá viñetas con guiones; el JSON SOLO va en LEARNING_EXTRACT.)
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
    const { messages, businessContext, inputType = "text", messageId, personalityPrompt, attachments = [] } = await req.json();
    
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
    // Free: 3 chat messages/month. Pro: alta capacidad = 100/mes.
    // Fail-open on errors so a transient DB issue can't lock users out.
    // ============================================================
    const FREE_CHAT_PER_MONTH = 3;
    const PRO_CHAT_PER_MONTH = 100;
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

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { count: usedThisMonth } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("business_id", businessContext.id)
          .eq("role", "user")
          .gte("created_at", startOfMonth);

        const cap = isProPlan ? PRO_CHAT_PER_MONTH : FREE_CHAT_PER_MONTH;
        if ((usedThisMonth ?? 0) >= cap) {
          console.log(
            `[plan-limit] business ${businessContext.id} hit chat cap (${usedThisMonth}/${cap}) pro=${isProPlan}`,
          );
          return new Response(
            JSON.stringify({
              error: isProPlan ? "pro_cap_reached" : "free_limit_reached",
              limit_type: "chat",
              used: usedThisMonth,
              limit: cap,
              message: isProPlan
                ? `Alcanzaste el tope mensual de tu plan Pro (alta capacidad: ${PRO_CHAT_PER_MONTH} mensajes). El contador se reinicia el día 1.`
                : "Alcanzaste el límite de 3 mensajes mensuales del plan Gratis. Pasate a Pro para alta capacidad de conversación.",
              upgrade_url: isProPlan ? null : "/checkout",
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
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
    const isComplex = hasImages || complexHints.test(lastText) || lastText.length > 600;
    // Cost optimization: Free users always use Lite (≈4× más barato).
    // Pro users get Flash sólo para queries complejas (alta calidad), Lite para el resto.
    const selectedModel = isProPlan && isComplex
      ? "google/gemini-2.5-flash"
      : "google/gemini-2.5-flash-lite";

    // Trivial detector: saludos, agradecimientos, confirmaciones cortas — gastan mínimo.
    const trivialHints = /^(hola|hi|hey|buenas|gracias|ok|listo|dale|si|no|perfecto|genial|ya|👍|🙏)\b/i;
    const isTrivial = !hasImages && lastText.length < 60 && trivialHints.test(lastText.trim());

    // Cap dinámico de tokens (ahorro inteligente sin perder calidad):
    //  · Trivial → 220 (saludo / confirmación, no necesita más)
    //  · Free simple → 480 (cabe 1 decisión + viñetas + próximo paso, modo directo)
    //  · Free complejo → 760 (análisis sin desperdicio)
    //  · Pro simple → 600
    //  · Pro complejo → 1100 (alta capacidad real)
    let maxTokens: number;
    if (isTrivial) maxTokens = 260;
    else if (!isProPlan) maxTokens = isComplex ? 1100 : 650;
    else maxTokens = isComplex ? 1800 : 900;

    // PROMPT MAESTRO VISTACEO — directiva final inyectada al system
    const brevityDirective = {
      role: "system" as const,
      content: `PROMPT MAESTRO VISTACEO (obligatorio, prioridad máxima sobre cualquier otra instrucción).

CONTRATO DE SALIDA
- Devolvé SIEMPRE el contrato XML exacto: <USER_REPLY>...</USER_REPLY><CEO_AUDIO_SCRIPT>...</CEO_AUDIO_SCRIPT><AVATAR_CUES>{...}</AVATAR_CUES><LEARNING_EXTRACT>{...}</LEARNING_EXTRACT>.
- PROHIBIDO devolver JSON suelto, fences \`\`\`json o cualquier formato fuera del contrato. Rompe el chat.

REGLA SUPREMA — RESPONDER EL ÚLTIMO MENSAJE
- Respondé EXACTAMENTE el último mensaje del usuario. No mezcles temas, no contestes preguntas anteriores, no cambies el eje.
- No repitas literal lo que el usuario escribió. Asumí que lo sabe. Arrancá por el insight, no por el resumen.

CONEXIÓN CON EL NEGOCIO — CONECTAR, NO FORZAR
- Primero respondé lo que se preguntó con precisión (legal, técnico, académico, estratégico, lo que sea).
- Después conectá con el negocio SOLO si la conexión es real y aporta valor. Usá nombre, rubro, ciudad y datos reales del Brain.
- Nunca fuerces "ventas/tráfico/marketing" si el tema no lo pide.
- Si la relación con el negocio es débil, decilo con honestidad breve y seguí.

ANTI-INVENCIÓN
- No inventes métricas, canales, clientes, resultados ni datos del usuario. Si no lo sabés, decilo y trabajá con hipótesis explícitas ("la causa más probable parece…", "habría que confirmar…").
- Separá hechos confirmados de hipótesis. Usá lenguaje de probabilidad cuando corresponda.

ESTILO HUMANO — PROHIBIDO SONAR A IA
- Tono CEO digital: claro, humano, estratégico, directo, cercano, con criterio. Nada de tono call-center ni chatbot.
- PROHIBIDAS estas frases salvo que el usuario las pida: "Como modelo de IA", "Procesando tu solicitud", "Aquí tienes la respuesta", "Disculpá, tuve un problema procesando la respuesta", "¿Podés repetir el mensaje?", "No tengo suficiente información", "No puedo ayudarte con eso", "Decisión principal", "Prioridades 48 a 72 horas", "Recomendación ejecutiva", "En conclusión", "Espero que esto te ayude", "Según los datos proporcionados", "Solicitud recibida", "Lamento los inconvenientes", "Tu estrategia está fallando".

ESTRUCTURA NATURAL — ANTI-PLANTILLA
- NO uses la plantilla rígida "Diagnóstico → Decisión principal → Prioridades 48-72h → Próximo paso" salvo que el usuario pida explícitamente un plan, diagnóstico o estrategia.
- Adaptá profundidad y forma al pedido. No todas las respuestas necesitan lista, ni misión, ni oportunidad, ni explicación larga.
- Si es saludo o confirmación trivial → 1-2 líneas naturales.
- Si pide explicación → párrafos cortos claros.
- Si pide acción → numeración simple "1. ..." "2. ..." en líneas separadas.
- Variá la estructura entre respuestas. No suenes igual cada vez.

LIMPIEZA VISUAL OBLIGATORIA DENTRO DE USER_REPLY
- PROHIBIDO: asteriscos visibles, **negritas markdown**, viñetas con * - o •, JSON crudo, snake_case entre comillas, códigos internos (EASY_06, Q_BIO_104, opt_high, b2b_arq_*), barras invertidas, saltos escapados, null/undefined/NaN/[object Object], emojis excesivos.
- Para énfasis: NO uses markdown bold. Usá palabras fuertes y oraciones claras.
- Párrafos cortos. Que se lea cómodo en mobile.

ANTI-TRUNCACIÓN
- NUNCA cortes una oración a la mitad. Si te falta espacio, priorizá lo accionable y cerrá las frases con punto.

MISIONES Y OPORTUNIDADES — SOLO SI SUMAN
- Proponé misión u oportunidad solo cuando aporten valor real. No cierres todas las respuestas con "te armo una misión".
- Si sale una misión, hiper-específica al negocio (nombre, sector, ciudad, métricas reales, objetivo, plazo, indicador).

USO DEL BRAIN
- Antes de responder, mirá el Brain. Si hay rubro, país, cliente, objetivo o métrica relevante, reflejalo. Nunca respondas genérico teniendo contexto.
- Si aparece info nueva útil, marcala en LEARNING_EXTRACT con texto en español. No la anuncies con frases tipo "guardé esto"; si la mencionás, hacelo natural.

PROHIBIDO MOSTRAR ERRORES TÉCNICOS
- Nunca digas que hubo error, que no pudiste procesar, que necesitás que repitan. Si falta info, respondé con lo disponible y planteá hipótesis.

CHEQUEO INTERNO ANTES DE CERRAR USER_REPLY
- ¿Respondí el último mensaje exacto?
- ¿Usé el Brain cuando correspondía?
- ¿Conecté con el negocio sin deformar la pregunta?
- ¿No inventé datos?
- ¿No usé frases prohibidas ni plantilla rígida?
- ¿No quedan asteriscos, JSON, códigos internos ni oraciones cortadas?
- ¿Suena a persona inteligente, no a chatbot?
Si alguna falla, reescribilo antes de devolver.`,
    };

    const aiMessages = [
      { role: "system", content: CEO_SYSTEM_PROMPT },
      { role: "system", content: contextInjection },
      brevityDirective,
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

    // Último fallback: mensaje amigable si aún está vacío
    if (!parsed.userReply || parsed.userReply.trim().length < 8) {
      parsed.userReply = "Disculpá, no pude generar una respuesta clara esta vez. ¿Podés reformular o darme un poco más de contexto?";
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
