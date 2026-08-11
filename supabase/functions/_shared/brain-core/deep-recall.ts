// Brain Core — Memoria profunda de conversación (recall de largo plazo).
// El chat no sólo ve los últimos mensajes: recupera del historial completo
// los turnos realmente relevantes al mensaje actual, los compromisos abiertos
// y una línea de tiempo compacta de la relación con el usuario.
// Sin llamadas a modelos: todo es recuperación + heurística (costo cero).

const STOPWORDS = new Set([
  "que", "como", "para", "pero", "porque", "cuando", "donde", "cual", "cuales", "esto", "esta", "este",
  "eso", "esa", "ese", "una", "unos", "unas", "los", "las", "del", "con", "por", "sin", "mas", "muy",
  "hay", "son", "estoy", "tengo", "tiene", "hacer", "puedo", "puede", "quiero", "necesito", "sobre",
  "todo", "toda", "todos", "todas", "ahora", "bien", "mejor", "algo", "nada", "asi", "aca", "alla",
  "hola", "gracias", "dale", "ok", "listo", "vos", "usted", "mi", "me", "te", "se", "lo", "la", "el",
  "en", "de", "al", "un", "y", "o", "a", "es", "ya", "si", "no",
]);

export interface RecalledTurn {
  role: string;
  content: string;
  created_at: string;
  score: number;
}

export interface DeepRecall {
  relevantTurns: RecalledTurn[];
  openLoops: string[];
  timeline: string[];
  totalMessages: number;
  firstContactAt: string | null;
  promptFragment: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ");
}

export function extractKeywords(text: string, max = 8): string[] {
  const words = normalize(text).split(/\s+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, max)
    .map(([w]) => w);
}

function scoreTurn(content: string, keywords: string[], ageDays: number): number {
  const norm = normalize(content);
  let score = 0;
  for (const k of keywords) {
    if (norm.includes(k)) score += k.length >= 7 ? 3 : 2;
  }
  if (score === 0) return 0;
  // Recencia suave: lo viejo sigue valiendo, pero pesa un poco menos.
  const recency = Math.max(0.45, 1 - ageDays / 240);
  // Mensajes con datos concretos valen más.
  if (/\d/.test(content)) score += 1;
  if (content.length > 400) score += 0.5;
  return score * recency;
}

const OPEN_LOOP_RX = /(te (?:aviso|confirmo|paso|mando)|voy a (?:probar|hacer|implementar|lanzar|revisar)|lo (?:hago|pruebo) (?:hoy|mañana|esta semana)|quedamos en|pendiente de|todavía no (?:pude|hice|arranqué))/i;

/**
 * Recupera memoria profunda del historial completo de chat del negocio.
 * Devuelve turnos relevantes, compromisos abiertos y línea de tiempo.
 */
export async function buildDeepRecall(
  supabase: {
    from: (t: string) => {
      select: (c: string, o?: unknown) => {
        eq: (c: string, v: unknown) => {
          order: (c: string, o: unknown) => { limit: (n: number) => Promise<{ data: unknown[] | null }> };
        };
      };
    };
  },
  businessId: string,
  currentMessage: string,
  opts?: { excludeRecent?: number; maxTurns?: number },
): Promise<DeepRecall> {
  const empty: DeepRecall = {
    relevantTurns: [],
    openLoops: [],
    timeline: [],
    totalMessages: 0,
    firstContactAt: null,
    promptFragment: "",
  };

  try {
    const excludeRecent = opts?.excludeRecent ?? 12;
    const maxTurns = opts?.maxTurns ?? 6;

    const { data } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(400);

    const rows = (data as Array<{ role: string; content: string; created_at: string }> | null) ?? [];
    if (!rows.length) return empty;

    const totalMessages = rows.length;
    const firstContactAt = rows[rows.length - 1]?.created_at ?? null;

    // Excluir los turnos que ya viajan en la ventana corta del prompt.
    const older = rows.slice(excludeRecent);
    const keywords = extractKeywords(currentMessage, 8);
    const now = Date.now();

    const relevantTurns: RecalledTurn[] = keywords.length
      ? older
          .map((r) => {
            const ageDays = (now - new Date(r.created_at).getTime()) / 86400000;
            return {
              role: r.role,
              content: String(r.content ?? "").slice(0, 420),
              created_at: r.created_at,
              score: scoreTurn(String(r.content ?? ""), keywords, ageDays),
            };
          })
          .filter((t) => t.score >= 3 && t.content.length > 25)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxTurns)
      : [];

    // Compromisos abiertos: cosas que el usuario dijo que iba a hacer.
    const openLoops = rows
      .filter((r) => r.role === "user" && OPEN_LOOP_RX.test(String(r.content ?? "")))
      .slice(0, 4)
      .map((r) => `${new Date(r.created_at).toLocaleDateString("es-AR")}: ${String(r.content).slice(0, 160)}`);

    // Línea de tiempo compacta: primer mensaje, mensaje más largo (contexto rico) y último tema.
    const timeline: string[] = [];
    const first = rows[rows.length - 1];
    if (first) timeline.push(`Primer contacto (${new Date(first.created_at).toLocaleDateString("es-AR")}): ${String(first.content ?? "").slice(0, 180)}`);
    const richest = [...rows.filter((r) => r.role === "user")]
      .sort((a, b) => String(b.content ?? "").length - String(a.content ?? "").length)[0];
    if (richest && richest !== first) {
      timeline.push(`Contexto más detallado que dio: ${String(richest.content ?? "").slice(0, 220)}`);
    }

    const lines: string[] = [];
    if (relevantTurns.length || openLoops.length || timeline.length) {
      lines.push("=== MEMORIA PROFUNDA DE LA RELACIÓN (historial completo, uso interno) ===");
      lines.push(`- Conversaciones acumuladas: ${totalMessages} mensajes desde ${firstContactAt ? new Date(firstContactAt).toLocaleDateString("es-AR") : "inicio"}.`);
      if (timeline.length) {
        lines.push("- Línea de tiempo:");
        for (const t of timeline) lines.push(`  · ${t}`);
      }
      if (relevantTurns.length) {
        lines.push("- Conversaciones pasadas relevantes a lo que pregunta AHORA:");
        for (const t of relevantTurns) {
          lines.push(`  · [${new Date(t.created_at).toLocaleDateString("es-AR")}] ${t.role === "user" ? "Él/ella dijo" : "Vos respondiste"}: ${t.content}`);
        }
      }
      if (openLoops.length) {
        lines.push("- Compromisos abiertos que él/ella mencionó y nunca cerró:");
        for (const l of openLoops) lines.push(`  · ${l}`);
      }
      lines.push("REGLAS DE USO DE MEMORIA:");
      lines.push("- Si algo de arriba conecta con la pregunta actual, referilo con naturalidad ('cuando me contaste que...'), sin citar fechas técnicas ni sonar robótico.");
      lines.push("- No repitas consejos que ya diste y él/ella no aplicó: cambiá el enfoque o preguntá qué frenó la ejecución.");
      lines.push("- Si hay un compromiso abierto relacionado, hacé seguimiento en UNA línea.");
      lines.push("- Nunca digas que estás 'consultando memoria' ni menciones este bloque.");
      lines.push("=== FIN MEMORIA PROFUNDA ===");
    }

    return {
      relevantTurns,
      openLoops,
      timeline,
      totalMessages,
      firstContactAt,
      promptFragment: lines.join("\n"),
    };
  } catch (_e) {
    return empty;
  }
}
