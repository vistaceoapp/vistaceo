/**
 * seed-business-brain
 *
 * Inserta signals semilla sectoriales en el Brain de un negocio.
 * Idempotente: si ya existen signals con source='sector_baseline' para ese
 * negocio, no hace nada.
 *
 * Body: { businessId: string, force?: boolean }
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// === Catálogo sectorial duplicado para edge runtime (no se pueden importar src/) ===
type DayPart = "early_morning" | "morning" | "midday" | "afternoon" | "evening" | "late_night";

interface SectorSeedSignal {
  signal_type: string;
  importance: number;
  confidence: "low" | "medium" | "high";
  content: Record<string, unknown>;
  raw_text: string;
}

interface SectorBaseline {
  key: string;
  displayName: string;
  peakDayparts: DayPart[];
  seedSignals: SectorSeedSignal[];
}

const SECTOR_BASELINES: Record<string, SectorBaseline> = {
  cafeteria: {
    key: "cafeteria",
    displayName: "Cafetería",
    peakDayparts: ["early_morning", "morning", "afternoon"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "ticket_promedio_referencia", min: 1800, max: 5200 }, raw_text: "Ticket referencia cafetería de especialidad: 1.800–5.200." },
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "recurrencia_clientes_pct", min: 35, max: 55 }, raw_text: "Recurrencia típica: 35–55%." },
      { signal_type: "sector_benchmark", importance: 7, confidence: "high", content: { metric: "dayparts_pico", value: ["early_morning","morning","afternoon"] }, raw_text: "Tres picos: 7–9, 10–12 y 16–18." },
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "food_cost_pct", min: 28, max: 38 }, raw_text: "Food cost objetivo: 28–38%." },
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "mix_pasteleria_pct", min: 25, max: 45 }, raw_text: "Pastelería: 25–45% del ticket." },
      { signal_type: "sector_lever", importance: 7, confidence: "medium", content: { lever: "programa_fidelizacion", impact: "alto" }, raw_text: "Fidelización digital sube recurrencia 8–15 pts en 90 días." },
      { signal_type: "sector_risk", importance: 6, confidence: "medium", content: { risk: "competencia_radio_500m", impact: "medio" }, raw_text: "Alta densidad de competencia en 500 m presiona ticket." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "menu_engineering", impact: "medio" }, raw_text: "Menú destacando 3 estrellas sube ticket 4–9%." },
    ],
  },
  restaurante: {
    key: "restaurante",
    displayName: "Restaurante",
    peakDayparts: ["midday", "evening"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "rotacion_mesas_servicio", min: 1.5, max: 2.8 }, raw_text: "Rotación de mesas por servicio: 1.5–2.8." },
      { signal_type: "sector_benchmark", importance: 7, confidence: "high", content: { metric: "dayparts_pico", value: ["midday","evening"] }, raw_text: "Picos: 13–15 y 21–23." },
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "food_cost_pct", min: 30, max: 38 }, raw_text: "Food cost saludable: 30–38%." },
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "labor_cost_pct", min: 28, max: 35 }, raw_text: "Costo personal: 28–35% de venta." },
      { signal_type: "sector_lever", importance: 7, confidence: "medium", content: { lever: "reservas_propias", impact: "alto" }, raw_text: "Reservas en canal propio bajan comisiones 6–12%." },
      { signal_type: "sector_risk", importance: 6, confidence: "medium", content: { risk: "dependencia_apps_delivery", impact: "alto" }, raw_text: "Más de 30% por apps erosiona margen." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "carta_estacional", impact: "medio" }, raw_text: "Carta estacional con 3 destacados sube ticket 5–10%." },
    ],
  },
  retail: {
    key: "retail",
    displayName: "Retail",
    peakDayparts: ["midday", "afternoon", "evening"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "conversion_rate_pct", min: 12, max: 28 }, raw_text: "Conversión retail físico: 12–28%." },
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "upt_unidades_por_ticket", min: 1.4, max: 2.6 }, raw_text: "UPT saludable: 1.4–2.6." },
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "rotacion_inventario_anual", min: 4, max: 8 }, raw_text: "Rotación inventario anual: 4–8x." },
      { signal_type: "sector_lever", importance: 7, confidence: "medium", content: { lever: "clienteling_whatsapp", impact: "alto" }, raw_text: "Clienteling segmentado sube recurrencia 10–20%." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "vidriera_semanal", impact: "medio" }, raw_text: "Vidriera semanal: tráfico +5–12%." },
      { signal_type: "sector_risk", importance: 6, confidence: "medium", content: { risk: "stock_dormido", impact: "medio" }, raw_text: "25%+ SKUs sin venta 90 días erosiona capital." },
    ],
  },
  servicios: {
    key: "servicios",
    displayName: "Servicios profesionales",
    peakDayparts: ["morning", "midday", "afternoon"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "horas_facturables_pct", min: 55, max: 75 }, raw_text: "Horas facturables sobre disponibles: 55–75%." },
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "tasa_renovacion_cliente_pct", min: 60, max: 85 }, raw_text: "Renovación de clientes: 60–85%." },
      { signal_type: "sector_lever", importance: 7, confidence: "medium", content: { lever: "paquetizar_servicios", impact: "alto" }, raw_text: "Paquetizar sube ticket 15–30%." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "proceso_onboarding", impact: "medio" }, raw_text: "Onboarding claro reduce churn temprano." },
      { signal_type: "sector_risk", importance: 6, confidence: "medium", content: { risk: "dependencia_pocos_clientes", impact: "alto" }, raw_text: "+40% en 1 cliente = riesgo." },
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "ciclo_cobro_dias", min: 7, max: 30 }, raw_text: "Ciclo de cobro: 7–30 días." },
    ],
  },
  digital: {
    key: "digital",
    displayName: "Negocio digital",
    peakDayparts: ["morning", "midday", "afternoon", "evening"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 6, confidence: "medium", content: { metric: "conversion_landing_pct", min: 1.5, max: 6 }, raw_text: "Conversión landing LATAM: 1.5–6%." },
      { signal_type: "sector_benchmark", importance: 7, confidence: "medium", content: { metric: "churn_mensual_pct", min: 3, max: 8 }, raw_text: "Churn aceptable PyME SaaS: 3–8%." },
      { signal_type: "sector_lever", importance: 7, confidence: "medium", content: { lever: "activacion_primeros_7_dias", impact: "alto" }, raw_text: "Activación 7d predice retención 90d." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "contenido_seo_evergreen", impact: "alto" }, raw_text: "SEO evergreen compone tráfico en 3–6 meses." },
      { signal_type: "sector_risk", importance: 6, confidence: "medium", content: { risk: "dependencia_un_canal", impact: "alto" }, raw_text: "+60% tráfico desde 1 canal = frágil." },
    ],
  },
  _default: {
    key: "_default",
    displayName: "Negocio",
    peakDayparts: ["morning", "midday", "afternoon"],
    seedSignals: [
      { signal_type: "sector_benchmark", importance: 5, confidence: "medium", content: { metric: "recurrencia_clientes_pct", min: 25, max: 50 }, raw_text: "Recurrencia PyME estable: 25–50%." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "foco_3_palancas", impact: "alto" }, raw_text: "Foco 3 palancas/mes > 10 iniciativas paralelas." },
      { signal_type: "sector_lever", importance: 6, confidence: "medium", content: { lever: "medicion_semanal_kpis", impact: "medio" }, raw_text: "Medir 3–5 KPIs semanales acelera decisiones." },
      { signal_type: "sector_risk", importance: 5, confidence: "medium", content: { risk: "decision_por_intuicion", impact: "medio" }, raw_text: "Decidir sin números chicos = corregir tarde." },
    ],
  },
};

const ALIAS_MAP: Record<string, string> = {
  cafe: "cafeteria", cafetería: "cafeteria", coffee: "cafeteria",
  resto: "restaurante", bistro: "restaurante", bistró: "restaurante",
  tienda: "retail", boutique: "retail",
  ecommerce: "digital", saas: "digital",
  agencia: "servicios", estudio: "servicios", consultoria: "servicios", consultoría: "servicios", b2b: "servicios",
};

function resolveBaseline(category?: string | null): SectorBaseline {
  if (!category) return SECTOR_BASELINES._default;
  const k = category.toLowerCase().trim();
  return SECTOR_BASELINES[ALIAS_MAP[k] ?? k] ?? SECTOR_BASELINES._default;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const businessId = String(body?.businessId ?? "").trim();
    const force = Boolean(body?.force);
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cargar negocio
    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, name, category, country, settings")
      .eq("id", businessId)
      .maybeSingle();

    if (bizErr || !biz) {
      return new Response(JSON.stringify({ error: "negocio no encontrado", detail: bizErr?.message }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotencia: ya hay seed para este negocio
    if (!force) {
      const { count } = await supabase
        .from("signals")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("source", "sector_baseline");
      if ((count ?? 0) > 0) {
        return new Response(JSON.stringify({ skipped: true, reason: "ya existe seed", existing: count }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Garantizar brain
    let { data: brain } = await supabase
      .from("business_brains")
      .select("id")
      .eq("business_id", businessId)
      .maybeSingle();

    if (!brain) {
      const { data: created, error: brainErr } = await supabase
        .from("business_brains")
        .insert({ business_id: businessId })
        .select("id")
        .single();
      if (brainErr) {
        return new Response(JSON.stringify({ error: "no se pudo crear brain", detail: brainErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      brain = created;
    }

    const baseline = resolveBaseline(biz.category as string | null | undefined);

    // Insertar signals seed
    const rows = baseline.seedSignals.map((s) => ({
      business_id: businessId,
      brain_id: brain!.id,
      signal_type: s.signal_type,
      source: "sector_baseline",
      content: { ...s.content, sector_key: baseline.key, sector_display: baseline.displayName },
      raw_text: s.raw_text,
      confidence: s.confidence,
      importance: s.importance,
    }));

    const { error: insErr, count } = await supabase
      .from("signals")
      .insert(rows, { count: "exact" });

    if (insErr) {
      return new Response(JSON.stringify({ error: "no se pudieron insertar signals", detail: insErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Marcar negocio como seeded
    const settings = (biz.settings as Record<string, unknown>) || {};
    await supabase
      .from("businesses")
      .update({
        settings: { ...settings, brain_seeded_at: new Date().toISOString(), brain_seed_sector: baseline.key, needs_seed: false },
      })
      .eq("id", businessId);

    return new Response(JSON.stringify({
      ok: true,
      sector: baseline.key,
      inserted: count ?? rows.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "fallo inesperado", detail: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
