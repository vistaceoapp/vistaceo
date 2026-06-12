// Generate ultra-personalized chat suggestions using Gemini + Brain context.
// Returns 6 questions that the AI can FULLY answer with the data available.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface Suggestion {
  id: string;
  text: string;
  category: "problema" | "oportunidad" | "mejora" | "analisis";
}

const FALLBACK: Suggestion[] = [
  { id: "f1", text: "¿Cuál es mi mayor problema ahora mismo y cómo lo resuelvo esta semana?", category: "problema" },
  { id: "f2", text: "¿Qué oportunidad concreta estoy dejando pasar?", category: "oportunidad" },
  { id: "f3", text: "Dame 3 acciones específicas para mejorar mis resultados en 7 días", category: "mejora" },
  { id: "f4", text: "¿Qué métrica debería mirar primero esta semana?", category: "analisis" },
  { id: "f5", text: "¿Cómo subo mi ticket promedio sin perder clientes?", category: "oportunidad" },
  { id: "f6", text: "¿Qué riesgo importante no estoy viendo?", category: "problema" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return new Response(JSON.stringify({ suggestions: FALLBACK }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [brainR, bizR, oppsR, missR, gapsR] = await Promise.all([
      supabase.from("business_brains").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("businesses").select("*").eq("id", businessId).maybeSingle(),
      supabase.from("opportunities").select("title,description,category").eq("business_id", businessId).is("dismissed_at", null).is("is_converted", false).order("created_at", { ascending: false }).limit(5),
      supabase.from("missions").select("title,status").eq("business_id", businessId).eq("status", "active").limit(3),
      supabase.from("data_gaps").select("field_name").eq("business_id", businessId).eq("status", "pending").order("priority", { ascending: false }).limit(5),
    ]);

    const brain = brainR.data ?? {};
    const business = bizR.data ?? {};
    const opportunities = oppsR.data ?? [];
    const missions = missR.data ?? [];
    const gaps = gapsR.data ?? [];

    const context = {
      business: {
        name: business.name, category: business.category, country: business.country,
        avg_rating: business.avg_rating, avg_ticket: business.avg_ticket,
      },
      brain_focus: brain.current_focus,
      factual_memory: brain.factual_memory,
      opportunities: opportunities.map((o: any) => ({ title: o.title, category: o.category })),
      active_missions: missions.map((m: any) => m.title),
      data_gaps: gaps.map((g: any) => g.field_name),
    };

    const system = `Sos un CEO mentor. Generás 6 PREGUNTAS que el dueño del negocio le haría a su CEO virtual.
Reglas estrictas:
- Cada pregunta debe poder responderse COMPLETAMENTE con los datos disponibles o con hipótesis razonables — no pidas información que el sistema no tiene.
- Hiper-específicas al negocio (nombre, rubro, país, métricas reales del contexto). Nada genérico.
- Mezclá categorías: 2 "problema", 2 "oportunidad", 1 "mejora", 1 "analisis".
- Tono natural en español, en primera persona del dueño. Máximo 110 caracteres c/u.
- Devolvé SOLO JSON válido: {"suggestions":[{"id":"s1","text":"...","category":"problema"}, ...]}`;

    const userMsg = `Contexto del negocio:\n${JSON.stringify(context, null, 2)}\n\nGenerá las 6 preguntas ahora.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      console.error("AI error", aiRes.status, await aiRes.text());
      return new Response(JSON.stringify({ suggestions: FALLBACK }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: { suggestions?: Suggestion[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }
    const suggestions = Array.isArray(parsed.suggestions) && parsed.suggestions.length >= 4
      ? parsed.suggestions.slice(0, 6).map((s, i) => ({
          id: s.id || `s${i + 1}`,
          text: String(s.text || "").trim(),
          category: (["problema", "oportunidad", "mejora", "analisis"].includes(s.category) ? s.category : "analisis") as Suggestion["category"],
        })).filter(s => s.text.length > 5)
      : FALLBACK;

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-chat-suggestions error", e);
    return new Response(JSON.stringify({ suggestions: FALLBACK }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
