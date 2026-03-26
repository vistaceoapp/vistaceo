import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const COUNTRY_NAMES: Record<string, string> = {
  AR: 'Argentina', BO: 'Bolivia', CL: 'Chile', CO: 'Colombia', CR: 'Costa Rica',
  DO: 'República Dominicana', EC: 'Ecuador', ES: 'España', GT: 'Guatemala',
  HN: 'Honduras', MX: 'México', NI: 'Nicaragua', PA: 'Panamá', PE: 'Perú',
  PY: 'Paraguay', SV: 'El Salvador', UY: 'Uruguay',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, country } = await req.json();
    
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Query too short' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const countryName = COUNTRY_NAMES[country] || 'Latinoamérica';
    
    const systemPrompt = `Sos un analista de negocios experto en LATAM y España. Tu tarea es generar un insight estratégico BREVE y ÚTIL para alguien que tiene un negocio o trabaja en el rubro que te describen.

REGLAS:
- Respondé SIEMPRE en JSON válido con este formato exacto (sin markdown, sin backticks):
{"businessType":"nombre normalizado del tipo de negocio/profesión","suggestions":[],"insight":"texto del insight","metric":"dato numérico o estadística relevante","metricLabel":"etiqueta corta del dato"}
- Si la consulta es ambigua, incluí en "suggestions" un array de 2-3 opciones posibles (strings simples como "Restaurante de comida rápida", "Restaurante gourmet", "Dark kitchen"). Si es claro, dejá suggestions vacío [].
- El "businessType" debe ser el nombre limpio y normalizado del negocio/profesión.
- El "insight" debe ser 1-2 oraciones máximo, concreto, accionable, relevante para ${countryName}. Puede ser una oportunidad, un dato de mercado, un consejo estratégico o una tendencia. NO uses frases genéricas.
- "metric" debe ser un número o porcentaje real/estimado relevante (ej: "73%", "+18%", "4 de 10").
- "metricLabel" describe qué mide ese dato (ej: "de negocios similares usan IA", "crecimiento promedio del sector").
- Usá voseo si el país es AR, UY, CR, GT, HN, NI, SV. Tuteo para los demás.
- NO inventes datos falsos. Usá estimaciones razonables basadas en tendencias reales del mercado.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Negocio/profesión: "${query.trim()}"\nPaís: ${countryName} (${country})` },
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'rate_limited' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'payment_required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback
      parsed = {
        businessType: query.trim(),
        suggestions: [],
        insight: 'VISTACEO analiza tu negocio, detecta prioridades y genera acciones concretas cada día.',
        metric: '85%',
        metricLabel: 'de los usuarios detectan oportunidades en su primera semana',
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('landing-insight error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
