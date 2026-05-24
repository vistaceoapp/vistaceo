// Seeds initial Radar opportunities + 1 trend right after setup completes.
// Strategy: invoke analyze-patterns (opportunities + research) and, if AI
// returned nothing, insert deterministic fallbacks so the user never lands
// on an empty Radar.

import { createClient } from "npm:@supabase/supabase-js@2";

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

const GENERIC_TREND = {
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
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return new Response(JSON.stringify({ error: "businessId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[seed-initial-insights] Starting for business: ${businessId}`);

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
    const [{ count: oppCount }, { count: learnCount }] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      supabase
        .from("learning_items")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
    ]);

    let seededOpps = 0;
    let seededTrends = 0;

    if ((oppCount || 0) < 1) {
      // Insert 2 generic opportunities so user lands on a populated radar.
      for (const opp of GENERIC_OPPS) {
        const { error } = await supabase.from("opportunities").insert({
          business_id: businessId,
          title: opp.title,
          description: opp.description,
          source: "diagnóstico inicial",
          impact_score: opp.impact_score,
          effort_score: opp.effort_score,
          evidence: { origin: "setup_seed" },
        });
        if (!error) seededOpps++;
      }
    }

    if ((learnCount || 0) < 1) {
      const { error } = await supabase.from("learning_items").insert({
        business_id: businessId,
        title: GENERIC_TREND.title,
        content: GENERIC_TREND.content,
        item_type: GENERIC_TREND.item_type,
        source: GENERIC_TREND.source,
        action_steps: GENERIC_TREND.action_steps,
        is_read: false,
        is_saved: false,
      });
      if (!error) seededTrends++;
    }

    console.log(
      `[seed-initial-insights] Done. AI opps=${oppCount} trends=${learnCount} | seeded opps=${seededOpps} trends=${seededTrends}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        ai_opportunities: oppCount || 0,
        ai_trends: learnCount || 0,
        fallback_opportunities_inserted: seededOpps,
        fallback_trends_inserted: seededTrends,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[seed-initial-insights] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
