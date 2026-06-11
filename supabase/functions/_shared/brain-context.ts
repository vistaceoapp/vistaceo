// BrainContext: fuente única de verdad para todos los generadores IA.
// Construye un contexto rico desde el brain del negocio + computa un
// brain_signature determinístico para cachear artefactos generados.
//
// Diseño:
//  - Acepta un EdgeContextPack ya construido por el cliente (preferido) o
//    lo arma desde Supabase si solo recibe businessId.
//  - Humaniza señales/insights ANTES de exponerlos al prompt (sin Q_AI_,
//    sin [Setup_answer], sin JSON crudo).
//  - El signature es estable: mismo input → mismo hash → cache hit.

import type { EdgeContextPack } from "./context-pack-types.ts";
import { humanizeEvidence, humanizeDimension } from "./humanize-evidence.ts";

export interface BrainContext {
  businessId: string;
  business: {
    name: string;
    sector: string;
    subSector: string;
    country: string;
    city: string;
    stage: string;
    model: string;
    customer: string;
    channel: string;
    mainGoal: string;
    mainFriction: string;
    tone: "tuteo" | "voseo";
    language: string;
  };
  brain: {
    confidence: number;
    confirmed: Record<string, unknown>;
    missingCritical: string[];
    healthOverall: number;
    healthDimensions: Record<string, number>;
    weakest: string[];
    strongest: string[];
    activeFocus: string;
    activeFocusReason: string;
  };
  signals: string[]; // ya humanizadas
  insights: Array<{ question: string; answer: string }>; // ya humanizadas
  competitors: string[];
  integrations: string[];
  signature: string; // sha256 hex
}

// Países con voseo predominante (AR, UY, PY, partes de CO/CR)
const VOSEO_COUNTRIES = new Set([
  "AR", "Argentina", "UY", "Uruguay", "PY", "Paraguay",
]);

function pickTone(country: string): "tuteo" | "voseo" {
  if (!country) return "tuteo";
  return VOSEO_COUNTRIES.has(country) || VOSEO_COUNTRIES.has(country.toUpperCase())
    ? "voseo"
    : "tuteo";
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Construye el BrainContext desde un EdgeContextPack que ya viene del cliente.
 * El cliente arma el pack con src/lib/context-pack-builder.ts.
 */
export async function buildBrainContextFromPack(
  pack: EdgeContextPack,
  extras?: {
    signals?: Array<{ raw_text?: string } | string>;
    insights?: Array<{ question?: string; answer?: string }>;
    competitors?: string[];
    integrations?: string[];
  },
): Promise<BrainContext> {
  const b = pack.businessSummary ?? {};
  const h = pack.healthSummary ?? {};
  const br = pack.brainSummary ?? { confirmed: {}, inferred: {}, uncertain: {}, missingCritical: [], confidence: 0 };

  const signals = (extras?.signals ?? [])
    .map((s) => humanizeEvidence(typeof s === "string" ? s : s?.raw_text))
    .filter((s) => s && s.length > 4)
    .slice(0, 20);

  const insights = (extras?.insights ?? [])
    .map((i) => ({
      question: humanizeEvidence(i.question ?? ""),
      answer: humanizeEvidence(i.answer ?? ""),
    }))
    .filter((i) => i.question && i.answer)
    .slice(0, 30);

  const ctx: Omit<BrainContext, "signature"> = {
    businessId: pack.businessId,
    business: {
      name: b.name ?? "",
      sector: b.sector ?? "",
      subSector: (b as any).subSector ?? "",
      country: b.country ?? "",
      city: (b as any).city ?? "",
      stage: (b as any).stage ?? "",
      model: b.model ?? "",
      customer: b.customer ?? "",
      channel: b.channel ?? "",
      mainGoal: b.mainGoal ?? "",
      mainFriction: b.mainFriction ?? "",
      tone: pickTone(b.country ?? ""),
      language: b.language ?? "es",
    },
    brain: {
      confidence: br.confidence ?? 0,
      confirmed: br.confirmed ?? {},
      missingCritical: br.missingCritical ?? [],
      healthOverall: h.overallScore ?? 0,
      healthDimensions: h.dimensions ?? {},
      weakest: h.weakestDimensions ?? [],
      strongest: h.strongestDimensions ?? [],
      activeFocus: pack.activeFocus?.area ?? "",
      activeFocusReason: pack.activeFocus?.reason ?? "",
    },
    signals,
    insights,
    competitors: extras?.competitors ?? [],
    integrations: extras?.integrations ?? [],
  };

  // Signature: solo variables que justifican regenerar todo el contenido.
  const sigInput = JSON.stringify({
    sector: ctx.business.sector,
    sub: ctx.business.subSector,
    country: ctx.business.country,
    stage: ctx.business.stage,
    model: ctx.business.model,
    health: ctx.brain.healthDimensions,
    weakest: ctx.brain.weakest,
    focus: ctx.brain.activeFocus,
    signalCount: signals.length,
    insightCount: insights.length,
    topSignals: signals.slice(0, 10),
  });
  const signature = await sha256Hex(sigInput);

  return { ...ctx, signature };
}

/** Render compacto del brain para inyectar en cualquier prompt IA. */
export function renderBrainContextForPrompt(ctx: BrainContext): string {
  const b = ctx.business;
  const br = ctx.brain;
  const lines: string[] = [];
  lines.push(`### Negocio`);
  if (b.name) lines.push(`Nombre: ${b.name}`);
  if (b.sector) lines.push(`Sector: ${b.sector}${b.subSector ? ` / ${b.subSector}` : ""}`);
  if (b.country) lines.push(`País: ${b.country}${b.city ? ` (${b.city})` : ""}`);
  if (b.stage) lines.push(`Etapa: ${b.stage}`);
  if (b.model) lines.push(`Modelo de ingresos: ${b.model}`);
  if (b.customer) lines.push(`Cliente: ${b.customer}`);
  if (b.channel) lines.push(`Canal principal: ${b.channel}`);
  if (b.mainGoal) lines.push(`Objetivo: ${b.mainGoal}`);
  if (b.mainFriction) lines.push(`Fricción: ${b.mainFriction}`);
  lines.push(`Tono: ${b.tone} (Español neutro profesional)`);

  lines.push(`\n### Salud del negocio (confianza brain: ${(br.confidence * 100).toFixed(0)}%)`);
  if (br.healthOverall) lines.push(`Score global: ${br.healthOverall}`);
  for (const [k, v] of Object.entries(br.healthDimensions)) {
    lines.push(`- ${humanizeDimension(k)}: ${v}`);
  }
  if (br.weakest.length) lines.push(`Dimensiones más débiles: ${br.weakest.map(humanizeDimension).join(", ")}`);
  if (br.activeFocus) lines.push(`Foco activo: ${br.activeFocus}${br.activeFocusReason ? ` — ${br.activeFocusReason}` : ""}`);

  if (ctx.insights.length) {
    lines.push(`\n### Diagnóstico (respuestas del usuario)`);
    for (const i of ctx.insights.slice(0, 12)) {
      lines.push(`- ${i.question}: ${i.answer}`);
    }
  }

  if (ctx.signals.length) {
    lines.push(`\n### Señales recientes`);
    for (const s of ctx.signals.slice(0, 10)) lines.push(`- ${s}`);
  }

  if (ctx.competitors.length) lines.push(`\n### Competidores: ${ctx.competitors.slice(0, 5).join(", ")}`);
  if (ctx.integrations.length) lines.push(`\n### Integraciones activas: ${ctx.integrations.join(", ")}`);

  if (br.missingCritical?.length) {
    lines.push(`\n### Datos críticos faltantes (no inventes valores): ${br.missingCritical.slice(0, 6).join(", ")}`);
  }

  return lines.join("\n");
}
