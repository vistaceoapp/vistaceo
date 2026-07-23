// Seeds initial Radar opportunities + 1 trend right after setup completes.
// Strategy: invoke analyze-patterns (opportunities + research) and, if AI
// returned nothing, insert deterministic fallbacks so the user never lands
// on an empty Radar.
// PROMPT 4: every insert passes server-side validateBeforeStore + seed gates.

import { createClient } from "npm:@supabase/supabase-js@2";
import { validateBeforeStore } from "../_shared/validate-before-store.ts";
import { gateSeedInsight } from "../_shared/quality-gates.ts";
import { sanitizeAIOutput } from "../_shared/ai-output-sanitizer.ts";
import { hasMinimumContext, type EdgeContextPack } from "../_shared/context-pack-types.ts";
import { failResponse } from "../_shared/edge-safe-response.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FallbackOpp {
  title: string;
  description: string;
  impact_score: number;
  effort_score: number;
}

const GENERIC_OPPS: FallbackOpp[] = [
  {
    title: "Activá tu Perfil de Google con fotos y horarios",
    description:
      "Tu Perfil de Empresa en Google es el primer punto de contacto con clientes nuevos. Subí 5 fotos recientes, verificá horarios y respondé las últimas reseñas para mejorar visibilidad local en las próximas 2 semanas.",
    impact_score: 8,
    effort_score: 3,
  },
  {
    title: "Definí tu oferta estrella y comunicala en redes",
    description:
      "Identificá el producto o servicio con mejor margen y posicionalo como protagonista en Instagram durante 7 días. Una sola oferta clara convierte mucho más que un menú completo difuso.",
    impact_score: 7,
    effort_score: 4,
  },
];

const GENERIC_MISSION = {
  title: "Activá tu presencia digital en 7 días",
  description:
    "Misión inicial diseñada para que en una semana ya tengas el cimiento digital que toda decisión posterior necesita: perfil de Google verificado, oferta clara y primera prueba de comunicación. Es la base sobre la que se apoya todo el resto del plan.",
  area: "growth",
  impact_score: 9,
  effort_score: 3,
  steps: [
    { id: 1, text: "Verificar y completar tu Perfil de Empresa en Google (fotos, horarios, categoría).", done: false },
    { id: 2, text: "Definir tu oferta estrella en una frase de 10 palabras o menos.", done: false },
    { id: 3, text: "Publicar la oferta en tu red principal (Instagram, LinkedIn o WhatsApp Estados).", done: false },
    { id: 4, text: "Pedir 2 reseñas reales a clientes recurrentes.", done: false },
    { id: 5, text: "Revisar los resultados al día 7 y anotar qué funcionó mejor.", done: false },
  ],
};

const GENERIC_TRENDS = [
  {
    title: "El 73% de los consumidores investiga online antes de comprar",
    content:
      "Tener presencia digital actualizada (Google, Instagram, web) ya no es opcional: es el filtro previo que define si te eligen o pasan al siguiente. Negocios con perfil completo capturan hasta 2.7x más clientes nuevos.\n\n**Por qué aplica a tu negocio:** Es el punto de partida obligatorio para cualquier estrategia de crecimiento sostenible.\n\n**Fuente:** [Tendencias de consumo digital](https://www.thinkwithgoogle.com/)",
    item_type: "trend",
    source: "https://www.thinkwithgoogle.com/",
    action_steps: [
      { text: "Auditar tu Perfil de Google esta semana" },
      { text: "Publicar 3 historias en Instagram con tu producto estrella" },
      { text: "Pedir 2 reseñas a clientes recurrentes" },
    ],
  },
  {
    title: "Las reseñas verificadas multiplican x4 la intención de compra",
    content:
      "Los consumidores confían más en otros consumidores que en cualquier publicidad. Un negocio con 20+ reseñas reales y respuestas activas convierte hasta 4 veces más que uno sin gestión de reputación.\n\n**Por qué aplica a tu negocio:** Es la palanca con mejor ROI de los próximos 30 días: cuesta cero y genera prueba social compuesta.\n\n**Fuente:** [BrightLocal Local Consumer Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/)",
    item_type: "trend",
    source: "https://www.brightlocal.com/research/local-consumer-review-survey/",
    action_steps: [
      { text: "Pedir 5 reseñas reales a clientes de las últimas 2 semanas" },
      { text: "Responder TODAS las reseñas existentes (positivas y negativas)" },
      { text: "Crear un flujo simple post-venta para invitar a reseñar" },
    ],
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { businessId, contextPack, force: forceFlag } = await req.json();
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const pack = contextPack as EdgeContextPack | undefined;
    if (pack && !hasMinimumContext(pack)) {
      console.warn("[seed-initial-insights] ContextPack received but lacks minimum context");
    }

    console.log(`[seed-initial-insights] Starting for business: ${businessId}`);

    // Candado de idempotencia: si otra ejecución ya está sembrando, salir.
    // Si terminó hace poco, también salir.
    {
      const { data: bizRow } = await supabase
        .from("businesses")
        .select("settings")
        .eq("id", businessId)
        .maybeSingle();
      const settings = (bizRow?.settings as Record<string, unknown> | null) ?? {};
      const startedAt = typeof settings.seeding_started_at === "string" ? Date.parse(settings.seeding_started_at) : 0;
      const completedAt = typeof settings.seeding_completed_at === "string" ? Date.parse(settings.seeding_completed_at) : 0;
      const now = Date.now();
      const force = forceFlag === true;
      // Verificar si el seed anterior efectivamente produjo contenido.
      // Si marcamos completed pero no hay opps/research (caso: outage de créditos IA),
      // permitir re-ejecutar aunque el flag esté seteado.
      let hasRealContent = true;
      if (completedAt && !force) {
        const [{ count: oppCount }, { count: liCount }] = await Promise.all([
          supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("business_id", businessId),
          supabase.from("learning_items").select("id", { count: "exact", head: true }).eq("business_id", businessId),
        ]);
        hasRealContent = (oppCount ?? 0) > 0 || (liCount ?? 0) > 0;
      }
      if (completedAt && now - completedAt < 24 * 60 * 60 * 1000 && hasRealContent && !force) {
        console.log("[seed-initial-insights] already completed recently, skipping");
        return new Response(JSON.stringify({ ok: true, skipped: "already_completed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (startedAt && now - startedAt < 60 * 1000 && !force) {
        console.log("[seed-initial-insights] another run in progress, skipping");
        return new Response(JSON.stringify({ ok: true, skipped: "in_progress" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase
        .from("businesses")
        .update({ settings: { ...settings, seeding_started_at: new Date().toISOString() } })
        .eq("id", businessId);
    }


    // Fire both analyze-patterns calls in parallel and wait for them.
    const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-patterns`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseServiceKey}`,
    };

    const callAnalyze = (type: "opportunities" | "research") =>
      fetch(analyzeUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          businessId,
          type,
          automated: true,
          premiumMode: true,
        }),
      })
        .then((r) => r.json())
        .catch((err) => {
          console.warn(`[seed-initial-insights] analyze-patterns ${type} failed`, err);
          return null;
        });

    await Promise.all([callAnalyze("opportunities"), callAnalyze("research")]);

    // Verify counts and seed fallbacks if AI produced nothing.
    const [{ count: oppCount }, { count: learnCount }, { count: missionCount }] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("learning_items")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
    ]);

    let seededOpps = 0;
    let seededTrends = 0;
    let seededMissions = 0;

    const qualityReasons: string[] = [];

    // ZERO-GENERIC POLICY (opps + trends): NO insertamos oportunidades/trends
    // hardcoded ("Perfil de Google", "oferta estrella en Instagram", etc.).
    // Esos fallbacks arruinan la percepción para negocios B2B, consultoría,
    // SaaS, real estate, etc. Si analyze-patterns no produjo nada personalizado,
    // preferimos radar vacío antes que radar con recomendaciones que no
    // corresponden al negocio. La UI ya maneja el estado "en preparación".
    if ((oppCount || 0) < 2) {
      console.warn(
        `[seed-initial-insights] AI produced ${oppCount || 0}/2 opps — NOT seeding generic fallbacks (zero-generic policy).`,
      );
      qualityReasons.push("ai_opps_insufficient_no_generic_fallback");
    }

    if ((learnCount || 0) < 2) {
      console.warn(
        `[seed-initial-insights] AI produced ${learnCount || 0}/2 trends — NOT seeding generic fallbacks (zero-generic policy).`,
      );
      qualityReasons.push("ai_trends_insufficient_no_generic_fallback");
    }
    // Marcamos referencias como usadas para evitar warnings del linter.
    void GENERIC_OPPS; void GENERIC_TRENDS; void gateSeedInsight; void sanitizeAIOutput;

    // Guarantee at least 1 mission so missions page never appears empty.
    // First try a HYPER-PERSONALIZED mission via Lovable AI, fallback only on failure.
    if ((missionCount || 0) < 1) {
      let mission = { ...GENERIC_MISSION };

      try {
        // Pull rich business context for personalization
        const { data: biz } = await supabase
          .from("businesses")
          .select("name, category, country, city, address, instagram_handle, google_place_id, avg_ticket, avg_rating, settings, channel_mix, monthly_revenue_range")
          .eq("id", businessId)
          .maybeSingle();

        const { data: brain } = await supabase
          .from("business_brains")
          .select("primary_business_type, current_focus, factual_memory, preferences_memory, offer_profile, customer_profile")
          .eq("business_id", businessId)
          .maybeSingle();

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY && biz) {
          const factual = ((brain as any)?.factual_memory || {}) as Record<string, any>;
          const prefs = ((brain as any)?.preferences_memory || {}) as Record<string, any>;
          const offer = ((brain as any)?.offer_profile || {}) as Record<string, any>;
          const customer = ((brain as any)?.customer_profile || {}) as Record<string, any>;
          const ctx = {
            nombre: biz.name,
            categoria: biz.category,
            pais: biz.country,
            ciudad: (biz as any).city || null,
            instagram: biz.instagram_handle,
            tiene_google: !!biz.google_place_id,
            ticket_promedio: biz.avg_ticket,
            rating: biz.avg_rating,
            tipo_negocio: (brain as any)?.primary_business_type || factual.business_type_label || null,
            actividad: factual.business_type_label || factual.interpreted_activity || null,
            subtipo: factual.sector || factual.subsector || null,
            modelo: factual.business_model || offer.model || null,
            canales: factual.main_channel || factual.channel_summary || offer.channels || null,
            ofertas: offer.summary || factual.offer_summary || factual.unidades_negocio || null,
            cliente: customer.summary || factual.main_customer || factual.client_summary || null,
            dolores: factual.primary_pains || factual.main_friction || null,
            oportunidades: factual.opportunity_angles || null,
            objetivo: factual.main_goal || (brain as any)?.current_focus || null,
            keywords: Array.isArray(factual.keywords) ? factual.keywords.slice(0, 12) : null,
            descripcion_usuario: typeof factual.raw_user_text === "string" ? factual.raw_user_text.slice(0, 800) : null,
            tono: prefs.tone || null,
            etapa: factual.business_stage || "active",
          };

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-pro",
              messages: [
                {
                  role: "system",
                  content:
                    "Sos un consultor ejecutivo senior. Generás UNA misión inicial 100% personalizada para un negocio puntual, en español rioplatense profesional, sin anglicismos ni frases genéricas. Está prohibido decir 'mejorá tu negocio' o 'aumentá las ventas' sin contexto. Cada paso debe ser accionable en ≤7 días, mencionar el negocio o su sector específico, y arrancar con verbo en infinitivo. Devolvé SOLO JSON válido sin markdown.",
                },
                {
                  role: "user",
                  content: `Negocio: ${JSON.stringify(ctx)}\n\nDevolvé este JSON exacto:\n{\n  "title": "string ≤70 chars, específico al negocio",\n  "description": "string 160-280 chars explicando por qué esta misión es prioritaria para ESTE negocio puntual",\n  "area": "growth" | "service" | "tech" | "custom",\n  "impact_score": 1-10,\n  "effort_score": 1-10,\n  "steps": [{"id": 1, "text": "verbo en infinitivo + acción concreta con dato/herramienta", "done": false}, ... 5 a 7 pasos]\n}`,
                },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (aiRes.ok) {
            const json = await aiRes.json();
            const raw = json?.choices?.[0]?.message?.content;
            const parsed = raw ? JSON.parse(raw) : null;
            if (
              parsed?.title &&
              parsed?.description &&
              Array.isArray(parsed?.steps) &&
              parsed.steps.length >= 3
            ) {
              mission = {
                title: String(parsed.title).slice(0, 120),
                description: String(parsed.description).slice(0, 600),
                area: ["growth", "service", "tech", "custom"].includes(parsed.area) ? parsed.area : "growth",
                impact_score: Math.max(1, Math.min(10, Number(parsed.impact_score) || 8)),
                effort_score: Math.max(1, Math.min(10, Number(parsed.effort_score) || 4)),
                steps: parsed.steps.slice(0, 8).map((s: any, i: number) => ({
                  id: i + 1,
                  text: String(s?.text || s).slice(0, 240),
                  done: false,
                })),
              };
              console.log("[seed-initial-insights] Personalized mission generated by AI");
            }
          } else {
            console.warn("[seed-initial-insights] AI mission generation HTTP", aiRes.status);
          }
        }
      } catch (aiErr) {
        console.warn("[seed-initial-insights] AI mission personalization failed, using fallback:", aiErr);
      }

      // ZERO-GENERIC POLICY: Only insert the mission if it was generated by AI
      // for THIS specific business. If the AI failed or the audit blocks it,
      // we DO NOT insert any fallback. Better empty than generic.
      const isHyperPersonalized = mission.title !== GENERIC_MISSION.title;
      if (!isHyperPersonalized) {
        console.warn("[seed-initial-insights] AI mission unavailable — skipping seed (no generic fallback).");
      } else {
        const missionAudit = validateBeforeStore({
          module: 'mission',
          title: mission.title,
          description: mission.description,
          steps: mission.steps.map((s: any) => ({ title: s.text, description: s.text })),
        });
        if (missionAudit.passed) {
          const { error } = await supabase.from("missions").insert({
            business_id: businessId,
            title: mission.title,
            description: mission.description,
            area: mission.area,
            impact_score: mission.impact_score,
            effort_score: mission.effort_score,
            steps: mission.steps,
            status: "active",
          });
          if (!error) seededMissions++;
          else console.warn("[seed-initial-insights] mission insert failed:", error);
        } else {
          console.warn("[seed-initial-insights] AI mission blocked by audit, NOT falling back to generic:", missionAudit.reasons);
          qualityReasons.push(...missionAudit.reasons);
        }
      }
    }

    console.log(
      `[seed-initial-insights] Done. AI opps=${oppCount} trends=${learnCount} missions=${missionCount} | seeded opps=${seededOpps} trends=${seededTrends} missions=${seededMissions}`,
    );

    // Marcar como completado para evitar dobles ejecuciones futuras
    try {
      const { data: bizRow2 } = await supabase
        .from("businesses").select("settings").eq("id", businessId).maybeSingle();
      const s2 = (bizRow2?.settings as Record<string, unknown> | null) ?? {};
      await supabase
        .from("businesses")
        .update({ settings: { ...s2, seeding_completed_at: new Date().toISOString(), seeding_started_at: null } })
        .eq("id", businessId);
    } catch (e) { console.warn("[seed-initial-insights] failed to mark completed", e); }


    const dedupedReasons = Array.from(new Set(qualityReasons));
    return new Response(
      JSON.stringify({
        success: true,
        ai_opportunities: oppCount || 0,
        ai_trends: learnCount || 0,
        ai_missions: missionCount || 0,
        fallback_opportunities_inserted: seededOpps,
        fallback_trends_inserted: seededTrends,
        fallback_missions_inserted: seededMissions,
        quality: { passed: dedupedReasons.length === 0, reasons: dedupedReasons },
        fallbackUsed: seededOpps + seededTrends + seededMissions > 0,
        eventsToEmit: [
          { eventType: 'dashboard_generated', modulesToRecalculate: ['dashboard'] },
          ...(seededOpps > 0 || (oppCount || 0) > 0
            ? [{ eventType: 'opportunity_generated', modulesToRecalculate: ['radar', 'dashboard'] }]
            : []),
          { eventType: 'analytics_updated', modulesToRecalculate: ['analytics'] },
          ...(seededOpps + seededTrends + seededMissions > 0
            ? [{ eventType: 'fallback_used', modulesToRecalculate: [] }]
            : []),
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return failResponse(err, {
      module: 'seed_insight',
      fallbackText: 'Estamos preparando tus primeras oportunidades. El radar se completa automáticamente en unos minutos.',
      reasons: ['seed_initial_insights_failed'],
    });
  }
});
