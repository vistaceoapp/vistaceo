// Server-side mirror of src/lib/humanize-evidence.ts (Deno-safe, self-contained).
// Translates internal identifiers (Q_AI_xxx, [Setup_answer] {JSON}, dimension snake_case)
// into natural-language phrases BEFORE they enter AI prompts or persisted descriptions.

const DIMENSION_LABELS: Record<string, string> = {
  traffic: "tráfico y captación",
  profitability: "rentabilidad",
  finances: "finanzas",
  efficiency: "operación y eficiencia",
  team: "equipo",
  growth: "crecimiento",
  reputation: "reputación",
};

const CATEGORY_LABELS: Record<string, string> = {
  identity: "identidad del negocio",
  operation: "operación",
  sales: "ventas",
  finance: "finanzas",
  team: "equipo",
  marketing: "marketing",
  reputation: "reputación",
  goals: "objetivos",
};

function stripJsonBlobs(s: string): string {
  return s
    .replace(/\{[\s\S]{20,}?\}/g, "")
    .replace(/\[[\s\S]{40,}?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function humanizeDimension(d?: string | null): string {
  if (!d) return "";
  return DIMENSION_LABELS[d.toLowerCase()] || d.replace(/_/g, " ");
}

export function humanizeCategory(c?: string | null): string {
  if (!c) return "";
  return CATEGORY_LABELS[c.toLowerCase()] || c.replace(/_/g, " ");
}

export function humanizeEvidence(raw: unknown): string {
  if (raw == null) return "";
  let s = typeof raw === "string" ? raw : (() => {
    try { return JSON.stringify(raw); } catch { return String(raw); }
  })();

  // 1. [Setup_answer] {...json...} -> "según el diagnóstico"
  s = s.replace(/\[Setup_answer\]\s*\{[\s\S]*?\}/gi, "según tu diagnóstico inicial");
  s = s.replace(/\[setup_answer\][^\n]*/gi, "según tu diagnóstico inicial");

  // 2. Q_AI_xxx codes -> "respuesta del diagnóstico"
  s = s.replace(/\bQ_AI_\d+\b/gi, "respuesta del diagnóstico");
  s = s.replace(/\bQ_[A-Z]{2,}_\d+\b/g, "respuesta del diagnóstico");

  // 3. snake_case dimension/category leaks
  for (const [k, v] of Object.entries(DIMENSION_LABELS)) {
    s = s.replace(new RegExp(`\\b${k}\\b`, "gi"), v);
  }

  // 4. Strip stray JSON blobs and obvious technical noise
  s = stripJsonBlobs(s);
  s = s.replace(/\b(business_id|owner_id|signal_id|concept_hash|intent_signature|raw_text)\b\s*[:=]?\s*\S*/gi, "");
  s = s.replace(/\s{2,}/g, " ").trim();

  return s;
}

export function humanizeEvidenceList(items: unknown[]): string[] {
  return (items || [])
    .map((i) => humanizeEvidence(i))
    .filter((s) => s && s.length > 3);
}
