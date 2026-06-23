// Dashboard Prepare — análisis previo al primer dashboard.
// Consolida el brain, separa confirmado de inferido, detecta cuello de botella,
// oportunidad más cercana, riesgo principal, misión inicial y preguntas sugeridas.
// Guarda el resultado en business_brains.dashboard_seed para que la UI
// lea SIN cambios de layout.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { withAntiGeneric } from "../_shared/brain-core/anti-generic-prompt.ts";
import { sanitizeForUser } from "../_shared/brain-core/sanitize-output.ts";
import { validateForUser, type BrainContext } from "../_shared/brain-core/validation-gate.ts";
import { toneForCountry } from "../_shared/brain-core/country-tone.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = withAntiGeneric(`
Sos el consultor ejecutivo de VISTACEO. Tu tarea es preparar la PRIMERA LECTURA ESTRATÉGICA
del dashboard de un negocio, usando exclusivamente la información que te paso del brain.
La salida debe sentirse hecha PARA ESTE NEGOCIO, no para un rubro.

Devolvé SOLO JSON con esta forma:
{
  "prioridad_principal": "Frase ejecutiva corta y específica para este caso (máx 180 chars).",
  "mision_recomendada": {
    "titulo": "Título humano y concreto",
    "motivo": "Por qué aplica a este negocio (anclado en un dato real)",
    "primer_paso": "Acción concreta para empezar hoy",
    "que_medir": "Métrica observable",
    "impacto_estimado": "alto|medio|bajo",
    "esfuerzo_estimado": "bajo|medio|alto"
  },
  "oportunidades_iniciales": [
    {
      "titulo": "Título corto y útil",
      "por_que_importa": "Razón conectada al negocio",
      "primer_paso": "Qué hacer primero",
      "que_mirar": "Indicador para saber si funciona"
    }
  ],
  "preguntas_sugeridas": ["3 a 5 preguntas específicas al caso"],
  "salud_resumen": {
    "lectura": "Frase humana sobre el estado actual del negocio según evidencia.",
    "confianza": "alta|media|baja",
    "criterios": ["Criterio 1", "Criterio 2"]
  },
  "datos_faltantes": ["Dato clave que aún falta para mejorar precisión"]
}

Si la información es escasa, sé humilde: usá "con la información actual, la señal más fuerte parece..."
en lugar de inventar.
`);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { businessId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");
    if (!businessId) throw new Error("businessId requerido");

    const supabase = createClient(SUPABASE_URL, SERVICE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const [biz, brain, insights, signals] = await Promise.all([
      supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
      supabase.from("business_brains").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("business_insights").select("question,answer,category").eq("business_id", businessId).order("created_at", { ascending: false }).limit(40),
      supabase.from("signals").select("signal_type,source,raw_text,content,created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
    ]);

    const business = biz.data ?? {};
    const brainRow = brain.data ?? {};
    const tone = toneForCountry(business.country ?? "AR");

    const contextBlock = buildContextBlock(business, brainRow, insights.data ?? [], signals.data ?? [], tone);

    const seed = await generateSeed(LOVABLE_API_KEY, contextBlock);

    // Validación visible
    const ctx: BrainContext = {
      businessId,
      businessName: business.name ?? null,
      country: business.country ?? null,
      primaryType: brainRow.primary_business_type ?? null,
      hasOfferProfile: !!brainRow.offer_profile && Object.keys(brainRow.offer_profile).length > 0,
      hasCustomerProfile: !!brainRow.customer_profile && Object.keys(brainRow.customer_profile).length > 0,
      totalSignals: brainRow.total_signals ?? 0,
    };

    const flat = JSON.stringify(seed);
    const v = validateForUser(flat, ctx);

    // Runtime gate: bloquear narrativa de dashboard con frases genéricas/leaks
    const { runtimeOutputGate, safeFallback } = await import("../_shared/brain-core/runtime-output-gate.ts");
    const narrativeText = [seed.headline, seed.summary, seed.focus_justification, seed.next_step]
      .filter((x) => typeof x === "string").join("\n");
    if (narrativeText) {
      const dashGate = runtimeOutputGate({
        text: narrativeText,
        kind: "dashboard",
        hasBrainEvidence: !!(brainRow.factual_memory || brainRow.offer_profile),
        hasConcreteAction: true,
      });
      if (!dashGate.ok) {
        console.warn("[runtime-output-gate:dashboard] flagged:", dashGate.reasons);
        (seed as any).headline = `Estoy construyendo la lectura real de ${business.name ?? "este negocio"}.`;
        (seed as any).summary = safeFallback("dashboard");
        (seed as any)._gateReasons = dashGate.reasons;
      }
    }

    const clean = sanitizeForUser(seed);

    // Persistimos en brain.dashboard_seed
    await supabase
      .from("business_brains")
      .update({ dashboard_seed: clean, last_learning_at: new Date().toISOString() })
      .eq("business_id", businessId);

    return new Response(
      JSON.stringify({ ok: true, seed: clean, validation: v }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[dashboard-prepare] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildContextBlock(
  business: Record<string, unknown>,
  brain: Record<string, unknown>,
  insights: Array<{ question: string; answer: string; category: string }>,
  signals: Array<Record<string, unknown>>,
  tone: { pronoun: string; verb: string },
): string {
  const lines: string[] = [];
  lines.push(`Negocio: ${business.name ?? "sin nombre"}`);
  lines.push(`País: ${business.country ?? "AR"} (usar ${tone.pronoun})`);
  lines.push(`Tipo: ${brain.primary_business_type ?? business.category ?? "desconocido"}`);
  lines.push(`Foco actual: ${brain.current_focus ?? "ventas"}`);
  lines.push(`Nivel de contexto: ${brain.mvc_completion_pct ?? 0}%`);

  const offer = brain.offer_profile as Record<string, unknown> | undefined;
  if (offer && Object.keys(offer).length) {
    lines.push(`Oferta conocida: ${JSON.stringify(offer).slice(0, 500)}`);
  }
  const cust = brain.customer_profile as Record<string, unknown> | undefined;
  if (cust && Object.keys(cust).length) {
    lines.push(`Cliente conocido: ${JSON.stringify(cust).slice(0, 500)}`);
  }
  const fact = brain.fact_states as Record<string, { state: string; value: unknown; confidence: number }> | undefined;
  if (fact && Object.keys(fact).length) {
    lines.push("Hechos del brain (campo: estado, valor, confianza):");
    for (const [k, v] of Object.entries(fact).slice(0, 20)) {
      lines.push(`- ${k}: ${v.state} | ${JSON.stringify(v.value).slice(0, 80)} | ${v.confidence}`);
    }
  }
  if (insights.length) {
    lines.push("Insights recientes (Q/A):");
    insights.slice(0, 12).forEach((i) => lines.push(`- [${i.category}] ${i.question} -> ${i.answer}`));
  }
  if (signals.length) {
    lines.push("Señales recientes:");
    signals.slice(0, 8).forEach((s) => lines.push(`- ${s.signal_type}/${s.source}: ${String((s as any).raw_text ?? "").slice(0, 120)}`));
  }
  return lines.join("\n");
}

async function generateSeed(apiKey: string, ctx: string): Promise<Record<string, unknown>> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: `${SYSTEM}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("dashboard")}\n\n${(await import("../_shared/brain-core/prompt2-rules.ts")).prompt2Rules("focus")}` },
        { role: "user", content: `Contexto del brain:\n${ctx}\n\nGenerá el JSON de primera lectura.` },
      ],
      temperature: 0.55,
      max_tokens: 1400,
    }),
  });
  if (!resp.ok) {
    if (resp.status === 429) throw new Error("AI_RATE_LIMIT");
    if (resp.status === 402) throw new Error("AI_CREDITS_EXHAUSTED");
    throw new Error(`gateway ${resp.status}`);
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("respuesta sin json");
  return JSON.parse(m[0]);
}
