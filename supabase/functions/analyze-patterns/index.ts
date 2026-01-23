import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked generic phrases that should never appear in opportunities
const BLOCKED_PHRASES = [
  "mejorar ventas",
  "aumentar clientes", 
  "optimizar operaciones",
  "mejorar servicio",
  "incrementar ingresos",
  "mejorar negocio",
  "hacer crecer",
  "optimizar procesos",
  "mejorar rendimiento",
  "aumentar ventas",
  "mejorar calidad",
  "incrementar productividad",
  "maximizar beneficios",
  "potenciar resultados",
  "aumentar ganancias",
  "mejorar eficiencia",
  "sistema de check-in", // Too generic
  "implementar check-ins", // Too generic
];

// Function to calculate semantic similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-záéíóúñ\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-záéíóúñ\s]/g, '');
  
  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);
  
  return similarity;
}

// Check if opportunity is duplicate of existing ones
function isDuplicate(
  newOpp: { title: string; description: string },
  existingOpps: Array<{ title: string; description: string | null }>
): boolean {
  for (const existing of existingOpps) {
    // Check title similarity
    const titleSim = calculateSimilarity(newOpp.title, existing.title);
    if (titleSim > 0.5) {
      console.log(`Duplicate detected (title similarity ${titleSim.toFixed(2)}): "${newOpp.title}" ~ "${existing.title}"`);
      return true;
    }
    
    // Check combined title+description similarity
    const newCombined = `${newOpp.title} ${newOpp.description}`;
    const existCombined = `${existing.title} ${existing.description || ''}`;
    const combinedSim = calculateSimilarity(newCombined, existCombined);
    if (combinedSim > 0.6) {
      console.log(`Duplicate detected (combined similarity ${combinedSim.toFixed(2)}): "${newOpp.title}"`);
      return true;
    }
  }
  return false;
}

// Check if opportunity contains blocked generic phrases
function containsBlockedPhrase(title: string, description: string): boolean {
  const combined = `${title} ${description}`.toLowerCase();
  for (const phrase of BLOCKED_PHRASES) {
    if (combined.includes(phrase)) {
      console.log(`Blocked phrase detected: "${phrase}" in "${title}"`);
      return true;
    }
  }
  return false;
}

type RssItem = { title: string; link: string; publishedAt?: string; source?: string };

function countryToGoogleNewsLocale(country: string | null | undefined): { hl: string; gl: string } {
  // Default to Spanish LATAM.
  const c = (country || "AR").toUpperCase();
  switch (c) {
    case "MX":
      return { hl: "es-419", gl: "MX" };
    case "CL":
      return { hl: "es-419", gl: "CL" };
    case "CO":
      return { hl: "es-419", gl: "CO" };
    case "CR":
      return { hl: "es-419", gl: "CR" };
    case "PA":
      return { hl: "es-419", gl: "PA" };
    case "US":
      return { hl: "es-419", gl: "US" };
    case "BR":
      return { hl: "pt-BR", gl: "BR" };
    case "UY":
      return { hl: "es-419", gl: "UY" };
    case "AR":
    default:
      return { hl: "es-419", gl: "AR" };
  }
}

function extractCityHint(address: string | null | undefined): string {
  if (!address) return "";
  // Keep it simple: first chunk before comma is usually a city/zone.
  return address.split(",")[0]?.trim() || "";
}

async function fetchGoogleNewsRss(query: string, locale: { hl: string; gl: string }): Promise<RssItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.gl}:${locale.hl}`;
  const res = await fetch(url, { headers: { "User-Agent": "lovable-cloud" } });
  if (!res.ok) return [];

  const xml = await res.text();
  const items: RssItem[] = [];

  // Very small XML parse (enough for RSS): item blocks + title/link/pubDate/source.
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const raw of itemMatches.slice(0, 12)) {
    const title = (raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "").trim();
    const link = (raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
    const pubDate = (raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "").trim();
    const source = (raw.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "").trim();

    if (title && link) items.push({ title, link, publishedAt: pubDate || undefined, source: source || undefined });
  }

  return items;
}

function formatRssForContext(items: RssItem[]): string {
  if (!items.length) return "(sin titulares externos confiables disponibles)";
  return items
    .map((it, idx) => {
      const meta = [it.source, it.publishedAt].filter(Boolean).join(" — ");
      return `${idx + 1}. ${it.title}\n   url: ${it.link}${meta ? `\n   publicado: ${meta}` : ""}`;
    })
    .join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch business data
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!business) {
      throw new Error("Business not found");
    }

    // Fetch ALL existing opportunities for deduplication
    const { data: existingOpportunities } = await supabase
      .from("opportunities")
      .select("id, title, description, source")
      .eq("business_id", businessId)
      .is("dismissed_at", null);

    // Fetch ALL existing missions to avoid suggesting same things
    const { data: existingMissions } = await supabase
      .from("missions")
      .select("id, title, description")
      .eq("business_id", businessId);

    // Combine both for deduplication
    const existingItems = [
      ...(existingOpportunities || []),
      ...(existingMissions || []).map(m => ({ ...m, source: 'mission' }))
    ];

    console.log(`Existing items for deduplication: ${existingItems.length}`);

    // Fetch business brain for deep personalization
    const { data: brain } = await supabase
      .from("business_brains")
      .select("*")
      .eq("business_id", businessId)
      .single();

    // Fetch recent data for pattern analysis
    const [checkinsRes, actionsRes, lessonsRes, insightsRes, externalDataRes, signalsRes, snapshotsRes, focusConfigRes] = await Promise.all([
      supabase.from("checkins").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("daily_actions").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("lessons").select("*").eq("business_id", businessId).limit(20),
      supabase.from("business_insights").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(50),
      supabase.from("external_data").select("*").eq("business_id", businessId).order("synced_at", { ascending: false }).limit(50),
      supabase.from("signals").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(30),
      supabase.from("snapshots").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(3),
      supabase.from("business_focus_config").select("*").eq("business_id", businessId).single(),
    ]);

    // Build ultra-personalized analysis context
    const analysisContext = buildDeepAnalysisContext(
      business, 
      brain,
      checkinsRes.data || [],
      actionsRes.data || [],
      lessonsRes.data || [],
      insightsRes.data || [],
      externalDataRes.data || [],
      signalsRes.data || [],
      snapshotsRes.data || [],
      focusConfigRes.data,
      existingItems
    );

    console.log("Analyzing patterns for business:", business.name);

    const mode = typeof type === "string" ? type : "opportunities";

    // --- External sources (REAL) for I+D ---
    let externalRssItems: RssItem[] = [];
    if (mode === "research") {
      const locale = countryToGoogleNewsLocale(business.country);
      const cityHint = extractCityHint(business.address);
      const sectorHint = brain?.primary_business_type || business.category || "gastronomía";
      const focusHint = brain?.current_focus || "ventas";

      // Ultra-detailed sector-specific query mapping for hyper-personalized results
      const sectorQueries: Record<string, string[]> = {
        // GASTRONOMÍA - Detailed
        restaurante: [
          "restaurantes tendencias 2025 innovación", 
          "menú innovador restaurante fine dining",
          "delivery restaurantes optimizar algoritmo",
          "restaurantes sostenibilidad packaging",
          "restaurant marketing digital 2025",
          "gastronomía experiencias inmersivas",
        ],
        cafeteria: [
          "cafeterías specialty coffee 2025", 
          "café de especialidad tendencias latte art",
          "coffee shop marketing redes sociales",
          "cafeterías coworking espacio híbrido",
          "cold brew nuevas tendencias café",
        ],
        bar: [
          "bar cocktails tendencias 2025", 
          "mixología innovación molecular",
          "bares experiencias after work premium",
          "bar sin alcohol mocktails premium",
          "bares speakeasy concepto secreto",
        ],
        heladeria: [
          "heladerías artesanales 2025", 
          "helados veganos plant-based tendencias",
          "heladerías sabores exóticos innovación",
          "helados funcionales proteína",
          "gelato italiano técnicas",
        ],
        panaderia: [
          "panaderías artesanales tendencias 2025", 
          "masa madre fermentados sourdough",
          "panadería marketing local comunidad",
          "pan saludable gluten free",
          "croissants tendencias croissantería",
        ],
        dark_kitchen: [
          "dark kitchen tendencias 2025", 
          "cocinas fantasma optimización delivery",
          "ghost kitchen algoritmo apps",
          "virtual brands marcas virtuales",
          "cloud kitchen eficiencia operativa",
        ],
        fast_casual: [
          "fast casual tendencias 2025", 
          "quick service restaurant innovación",
          "comida rápida saludable premium",
          "fast food sostenibilidad packaging",
          "QSR digitalización pedidos",
        ],
        // RETAIL - Detailed
        moda: [
          "retail moda tendencias 2025", 
          "tiendas ropa marketing digital influencers",
          "moda sostenible circular segunda mano",
          "fashion retail omnicanal experiencia",
          "tiendas ropa personalización cliente",
        ],
        electronica: [
          "retail electrónica tendencias 2025", 
          "tiendas tecnología servicios reparación",
          "electrónica ecommerce showrooming",
          "tech retail experiencias demos",
        ],
        calzado: [
          "calzado retail tendencias 2025", 
          "zapaterías omnicanal fitting virtual",
          "calzado sostenible reciclado",
          "sneakers resale reventa tendencias",
        ],
        // SALUD
        spa: [
          "spa wellness tendencias 2025", 
          "centros bienestar innovación experiencias",
          "wellness integral mindfulness retiros",
          "spa tratamientos high-tech",
        ],
        consultorio: [
          "consultorios médicos telemedicina 2025", 
          "clínicas privadas marketing digital pacientes",
          "salud digital wearables integración",
          "consultorios experiencia paciente",
        ],
        odontologia: [
          "clínicas dentales marketing 2025", 
          "odontología digital CAD CAM",
          "ortodoncia invisible tendencias",
          "turismo dental mercados",
        ],
        // TURISMO
        hotel: [
          "hoteles boutique tendencias 2025", 
          "turismo experiencial local auténtico",
          "hotelería sostenible certificaciones",
          "hoteles tecnología check-in sin contacto",
        ],
        agencia_viajes: [
          "agencias viajes digitalización 2025", 
          "turismo personalizado AI recomendaciones",
          "viajes experiencias únicas aventura",
          "travel tech innovación",
        ],
        // B2B
        consultoria: [
          "consultoría empresas tendencias 2025", 
          "servicios B2B suscripción recurrente",
          "consulting digital transformación",
          "advisory AI automatización",
        ],
        // EDUCACIÓN
        educacion: [
          "educación tendencias 2025",
          "e-learning innovación plataformas",
          "cursos online certificaciones",
          "edtech gamificación",
        ],
        // DEFAULT
        default: [
          "pequeños negocios tendencias 2025", 
          "pymes digitalización marketing",
          "emprendedores innovación local",
          "negocios locales redes sociales",
          "marketing local comunidad",
        ],
      };

      // Get sector-specific queries
      const baseQueries = sectorQueries[sectorHint.toLowerCase()] || sectorQueries.default;
      
      // Focus-based additional queries
      const focusQueries: Record<string, string[]> = {
        ventas: [`${sectorHint} aumentar ventas estrategias 2025`, `${sectorHint} conversión clientes`],
        reputacion: [`${sectorHint} reseñas Google reputación online`, `${sectorHint} experiencia cliente NPS`],
        operaciones: [`${sectorHint} eficiencia operativa automatización`, `${sectorHint} optimizar costos`],
        marketing: [`${sectorHint} marketing digital 2025`, `${sectorHint} redes sociales contenido viral`],
        equipo: [`${sectorHint} recursos humanos retención talento`, `${sectorHint} capacitación empleados`],
      };

      const additionalFocusQueries = focusQueries[focusHint.toLowerCase()] || [];
      
      // Build comprehensive query list for maximum insights
      const queries = [
        // Base sector queries
        ...baseQueries.map(q => `${q} ${business.country || "LATAM"}`),
        // Focus-specific queries
        ...additionalFocusQueries.map(q => `${q} ${business.country || ""}`),
        // Local/city specific
        cityHint ? `${sectorHint} ${cityHint} tendencias` : null,
        // Platform specific
        `${sectorHint} Google Maps reseñas optimizar 2025`,
        `${sectorHint} Instagram Reels TikTok contenido 2025`,
        // Innovation
        `${sectorHint} innovación tecnología 2025`,
        // Competition
        `${sectorHint} competencia estrategias ganadoras`,
      ].filter(Boolean) as string[];

      console.log(`Fetching RSS for ${queries.length} queries (sector: ${sectorHint}, focus: ${focusHint})`);

      // Fetch more headlines for better variety
      const rssResults = await Promise.all(
        queries.slice(0, 12).map((q) => fetchGoogleNewsRss(q, locale))
      );

      // Keep more items for AI to choose the best ones
      externalRssItems = rssResults.flat().slice(0, 25);
      console.log(`Found ${externalRssItems.length} RSS headlines for I+D analysis`);
    }

    // Append external RSS context ONLY for I+D.
    const analysisContextFinal =
      mode === "research"
        ? `${analysisContext}\n\n## RADAR EXTERNO (I+D) — TITULARES/TENDENCIAS REALES (RSS)\nIMPORTANTE: Usar ÚNICAMENTE estos titulares como fuentes.\n\n${formatRssForContext(externalRssItems)}`
        : analysisContext;

    // ULTRA-PERSONALIZED SYSTEM PROMPTS - Enhanced for 7-10 insights/month
    const systemPrompt = mode === "research"
      ? `Eres el motor de Radar Externo (Investigación + Desarrollo / I+D) de Vistaceo.

REGLA ABSOLUTA: I+D es EXTERNO. Detecta señales fuera del negocio (mercado/plataformas/competencia/regulación/macros/tendencias globales) y las traduce a "qué podría significar para vos".

## CONTEXTO DEL NEGOCIO (CRÍTICO PARA PERSONALIZACIÓN)
- **Sector**: ${brain?.primary_business_type || business.category || "negocio local"}
- **País/Ciudad**: ${business.country || "LATAM"} - ${extractCityHint(business.address) || "zona local"}
- **Foco actual del dueño**: ${brain?.current_focus || "crecimiento"}
- **Modelo de servicio**: ${business.service_model || "mixto"}
- **Canales activos**: ${business.delivery_platforms?.join(", ") || "presencial"}

## GUARDRAILS (NO NEGOCIABLE)
- Prohibido diagnosticar operación interna o métricas del negocio.
- Prohibido dar "plan interno paso a paso" como obligación.
- Prohibido contenido genérico o sin fuente real.
- Prohibido inventar fuentes/URLs.

## FUENTES (CRÍTICO)
- Vas a recibir una lista de titulares RSS con URL.
- SOLO podés usar esas URLs como fuentes.
- Si la lista está vacía o no hay nada relevante para ESTE negocio, devolvé learning_items: [].

## PERSONALIZACIÓN SUPREMA
Cada ítem debe explicar por qué aplica a ESTE negocio usando: tipo/sector, país/ciudad, canales (delivery/salón), foco actual.
Menciona explícitamente "${brain?.primary_business_type || business.category}" y "${business.country || "LATAM"}" en el why_applies.

## QUÉ SÍ ENTRA EN I+D
- Tendencias de consumo específicas del sector
- Cambios de plataformas (Google/Maps, IG/TikTok, delivery apps)
- Movidas competitivas externas (cadenas/referentes)
- Tendencias de producto/menú/servicio globales aplicables
- Macro/regulatorio (alerta, no implementación)
- Innovaciones tecnológicas del sector
- Cambios en comportamiento del consumidor

## PRIORIDAD DE INSIGHTS
1. Alta prioridad: Tendencias que afectan DIRECTAMENTE a ${brain?.primary_business_type || "este tipo de negocio"}
2. Media prioridad: Tendencias del sector más amplio aplicables
3. Baja prioridad: Tendencias generales de negocios locales

## CONTRATO DE SALIDA (JSON estricto)
Devuelve EXACTAMENTE:
{
  "learning_items": [
    {
      "title": "(max 60 chars, específico al sector)",
      "content": "Señal externa + qué significa para ${brain?.primary_business_type || "tu negocio"} (no prescriptivo)",
      "item_type": "trend" | "benchmark" | "platform" | "competitive" | "product" | "macro",
      "category": "consumo" | "plataforma" | "competencia" | "producto" | "macro" | "operacion_externa",
      "why_applies": "Por qué esto aplica específicamente a un ${brain?.primary_business_type || "negocio"} en ${business.country || "LATAM"}",
      "freshness": "YYYY-MM",
      "transferability": "alta" | "media" | "baja",
      "priority": "alta" | "media" | "baja",
      "sources": [
        { "title": "...", "url": "https://...", "publisher": "...", "published_at": "RFC2822 or YYYY-MM-DD" }
      ],
      "action_steps": ["2-4 pasos opcionales, tipo 'ideas de exploración' (no obligación)"]
    }
  ]
}

## REGLAS DE CALIDAD
- GENERAR ENTRE 5-8 ÍTEMS de alta calidad (para alcanzar 7-10 insights/mes con escaneos semanales)
- Cada ítem DEBE incluir al menos 1 source con URL real tomada del RSS.
- Si un ítem no puede citar una fuente, NO lo devuelvas.
- Priorizar variedad: diferentes categorías (consumo, plataforma, competencia, producto).
- Ordenar por relevancia para ${brain?.primary_business_type || "este negocio"}.
`
      : `Eres un consultor de negocios gastronómicos con 20 años de experiencia en LATAM.
Tu especialidad es detectar oportunidades CONCRETAS y ESPECÍFICAS basadas en datos reales.

## REGLAS CRÍTICAS:
1. NUNCA generes oportunidades genéricas como "mejorar ventas" o "aumentar clientes"
2. Cada oportunidad DEBE mencionar datos específicos del negocio (números, nombres, fechas)
3. NUNCA sugieras algo que ya existe en la lista de "Oportunidades/Misiones Existentes"
4. Si no hay datos suficientes para una oportunidad concreta, NO la generes
5. Máximo 3 oportunidades por análisis - prefiere calidad sobre cantidad
6. Los títulos deben ser ÚNICOS y diferenciarse claramente entre sí

## FORMATO DE RESPUESTA (JSON válido):
{
  "opportunities": [
    {
      "title": "Título específico (mencionar dato concreto)",
      "description": "Descripción con evidencia del negocio (mencionar dato, fecha, o patrón detectado)",
      "impact_score": 1-10,
      "effort_score": 1-10,
      "source": "categoría",
      "evidence": {
        "trigger": "¿Qué dato disparó esta oportunidad?",
        "signals": ["señal 1", "señal 2"],
        "dataPoints": número_de_datos_usados,
        "basedOn": ["fuente 1", "fuente 2"]
      }
    }
  ],
  "patterns": [],
  "lessons": []
}

## EJEMPLOS DE OPORTUNIDADES CORRECTAS:
✅ "Potenciar el almuerzo: 73% del tráfico vs 27% cena" (menciona datos específicos)
✅ "Responder a las 4 reseñas negativas sobre tiempos de espera" (número concreto)
✅ "Promoción para miércoles: día más bajo con solo 2.1/5 de tráfico" (día + métrica)
✅ "Destacar la Milanesa Napolitana ($8500) - mencionada en 3 reseñas positivas" (producto + precio + dato)

## EJEMPLOS DE OPORTUNIDADES INCORRECTAS (BLOQUEADAS):
❌ "Implementar sistema de check-ins" (demasiado genérico)
❌ "Mejorar la comunicación con el equipo" (sin datos específicos)
❌ "Optimizar operaciones" (vacío de contenido)
❌ "Aumentar presencia en redes" (sin estrategia concreta)

Solo genera oportunidades que PUEDAS respaldar con datos del contexto proporcionado.`;
    // =====================================================================
    // 🧠 ULTRA-INTELLIGENT AI ENGINE - PREMIUM CONFIGURATION
    // =====================================================================
    // Using google/gemini-2.5-pro for maximum intelligence and personalization
    // This is the top-tier model for complex reasoning, context understanding,
    // and generating ultra-personalized business insights
    // =====================================================================
    
    console.log("[analyze-patterns] Using PREMIUM AI model: google/gemini-2.5-pro");
    console.log(`[analyze-patterns] Context size: ${analysisContextFinal.length} chars`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // 🔥 PREMIUM MODEL: google/gemini-2.5-pro
        // Top-tier for: complex reasoning, multimodal, big context, ultra-personalization
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisContextFinal },
        ],
        // Lower temperature for more focused, precise outputs
        temperature: 0.25,
        // 8000 tokens allows for 8-10 complete, detailed learning items with rich content
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiMessage = aiData.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    // =====================================================================
    // 🧠 ULTRA-ROBUST JSON PARSING WITH MULTIPLE FALLBACKS
    // =====================================================================
    let analysis;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedMessage = aiMessage
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();
      
      // First try to extract complete JSON object
      let jsonMatch = cleanedMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
        console.log("[analyze-patterns] Successfully parsed complete JSON response");
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiMessage.substring(0, 500));
      
      // Try to recover partial learning_items array
      try {
        const partialMatch = aiMessage.match(/"learning_items"\s*:\s*\[([\s\S]*)/);
        if (partialMatch) {
          // Try to extract as many complete items as possible
          const itemsStr = partialMatch[1];
          const items: any[] = [];
          let depth = 1;
          let currentItem = '';
          let inString = false;
          let escapeNext = false;
          
          for (const char of itemsStr) {
            if (escapeNext) {
              currentItem += char;
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              currentItem += char;
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
            }
            
            if (!inString) {
              if (char === '{') depth++;
              if (char === '}') depth--;
            }
            
            currentItem += char;
            
            // Complete item found when depth returns to 1
            if (depth === 1 && char === '}') {
              try {
                const parsed = JSON.parse(currentItem.trim().replace(/^,\s*/, ''));
                if (parsed.title && parsed.content) {
                  items.push(parsed);
                }
              } catch {
                // Skip malformed items
              }
              currentItem = '';
            }
          }
          
          if (items.length > 0) {
            console.log(`Recovered ${items.length} items from partial response`);
            analysis = { learning_items: items, opportunities: [], patterns: [], lessons: [] };
          } else {
            throw new Error("Could not recover any items");
          }
        } else {
          throw new Error("No learning_items found");
        }
      } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
        analysis = { patterns: [], opportunities: [], lessons: [], learning_items: [] };
      }
    }

    // Persist results
    let opportunitiesInserted = 0;
    let opportunitiesFiltered = 0;
    let learningInserted = 0;

    // If research mode: insert learning_items (I+D EXTERNO) with enhanced validation
    if (mode === "research") {
      const { data: existingLearning } = await supabase
        .from("learning_items")
        .select("id, title, content")
        .eq("business_id", businessId);

      // Fetch dismissed patterns from brain to avoid similar content
      const dismissedPatterns = brain?.decisions_memory?.dismissed_patterns || [];

      const items = Array.isArray(analysis.learning_items) ? analysis.learning_items : [];

      console.log(`Processing ${items.length} research items with enhanced validation`);

      for (const it of items) {
        const title = String(it?.title || "").trim();
        const content = String(it?.content || "").trim();
        const itemType = String(it?.item_type || "insight").trim();
        const category = typeof it?.category === "string" ? it.category : "consumo";
        const actionSteps = Array.isArray(it?.action_steps) ? it.action_steps : [];
        const freshness = typeof it?.freshness === "string" ? it.freshness : "2025-01";
        const transferability = typeof it?.transferability === "string" ? it.transferability : "media";
        const whyApplies = typeof it?.why_applies === "string" ? it.why_applies : "";

        // NEW: Parse sources array (URLs/publishers from the RSS we passed in)
        const sourcesArr: { title?: string; url?: string; publisher?: string; published_at?: string }[] =
          Array.isArray(it?.sources) ? it.sources : [];

        // GATE 0: Must have at least 1 real source with URL
        const hasRealSource = sourcesArr.some((s) => typeof s?.url === "string" && s.url.startsWith("http"));
        if (!hasRealSource) {
          console.log(`Filtered: no real source URL - "${title}"`);
          opportunitiesFiltered++;
          continue;
        }

        // GATE 1: Minimum length validation
        if (!title || title.length < 15 || !content || content.length < 50) {
          console.log(`Filtered: insufficient content - "${title}"`);
          opportunitiesFiltered++;
          continue;
        }

        // GATE 2: Block internal recommendations (should be external only)
        const internalPhrases = [
          "mejorar ventas", "aumentar clientes", "optimizar", "subir el ticket",
          "responder reseñas", "mejorar tiempos", "capacitar equipo", "reducir costos",
          "implementar sistema", "mejorar servicio", "aumentar ingresos"
        ];
        const combinedLower = `${title} ${content}`.toLowerCase();
        const hasInternalPhrase = internalPhrases.some(p => combinedLower.includes(p));
        if (hasInternalPhrase) {
          console.log(`Filtered: internal phrase detected - "${title}"`);
          opportunitiesFiltered++;
          continue;
        }

        // GATE 3: Deduplicate by semantic similarity
        const isDup = (existingLearning || []).some((ex: any) => {
          const simTitle = calculateSimilarity(title, ex.title || "");
          const simBody = calculateSimilarity(`${title} ${content}`, `${ex.title || ""} ${ex.content || ""}`);
          return simTitle > 0.5 || simBody > 0.55;
        });
        if (isDup) {
          console.log(`Filtered: duplicate detected - "${title}"`);
          opportunitiesFiltered++;
          continue;
        }

        // GATE 4: Check against dismissed patterns from brain
        const matchesDismissed = dismissedPatterns.some((pattern: string) => 
          calculateSimilarity(title, pattern) > 0.4 ||
          calculateSimilarity(content, pattern) > 0.4
        );
        if (matchesDismissed) {
          console.log(`Filtered: matches dismissed pattern - "${title}"`);
          opportunitiesFiltered++;
          continue;
        }

        // Build source string from first real source
        const firstSource = sourcesArr.find((s) => s?.url?.startsWith("http"));
        const sourceStr = firstSource
          ? `${firstSource.publisher || "Fuente"} (${freshness}) | ${firstSource.url}`
          : `mercado | ${freshness}`;

        // Build content with why_applies + source citation
        const enrichedContent = `${content}\n\n**Por qué aplica a tu negocio:** ${whyApplies || "Relevante para tu sector y mercado."}\n\n**Fuente:** [${firstSource?.title || "Ver artículo"}](${firstSource?.url || "#"})`;

        const { error: insertErr } = await supabase.from("learning_items").insert({
          business_id: businessId,
          title,
          content: enrichedContent,
          item_type: itemType,
          source: sourceStr,
          action_steps: actionSteps,
          is_read: false,
          is_saved: false,
        });

        if (!insertErr) {
          learningInserted++;
          console.log(`Inserted research item: "${title}"`);
        }
      }

      console.log("Research generation complete:", {
        learningGenerated: items.length,
        learningInserted,
        learningFiltered: opportunitiesFiltered,
      });

      return new Response(
        JSON.stringify({
          success: true,
          learningCreated: learningInserted,
          learningFiltered: opportunitiesFiltered,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default mode: opportunities (INTERNO)
    if (analysis.opportunities && analysis.opportunities.length > 0) {
      for (const opp of analysis.opportunities) {
        if (containsBlockedPhrase(opp.title, opp.description)) {
          opportunitiesFiltered++;
          continue;
        }
        if (isDuplicate(opp, existingItems)) {
          opportunitiesFiltered++;
          continue;
        }
        if (!opp.title || opp.title.length < 10 || !opp.description || opp.description.length < 20) {
          opportunitiesFiltered++;
          continue;
        }

        const { error: insertError } = await supabase.from("opportunities").insert({
          business_id: businessId,
          title: opp.title,
          description: opp.description,
          source: opp.source || "patterns",
          impact_score: opp.impact_score || 5,
          effort_score: opp.effort_score || 5,
          evidence: opp.evidence || {},
        });

        if (!insertError) {
          opportunitiesInserted++;
          existingItems.push({ id: "", title: opp.title, description: opp.description, source: "new" });
        }
      }
    }

    // Save new lessons (with deduplication)
    if (analysis.lessons && analysis.lessons.length > 0) {
      for (const lesson of analysis.lessons) {
        const similarLesson = (lessonsRes.data || []).find((l: any) =>
          calculateSimilarity(l.content, lesson.content) > 0.6
        );

        if (!similarLesson) {
          await supabase.from("lessons").insert({
            business_id: businessId,
            content: lesson.content,
            category: lesson.category || "general",
            source: "ai_analysis",
            importance: lesson.importance || 5,
          });
        }
      }
    }

    console.log("Pattern analysis complete:", {
      patternsFound: analysis.patterns?.length || 0,
      opportunitiesGenerated: analysis.opportunities?.length || 0,
      opportunitiesInserted,
      opportunitiesFiltered,
      lessonsLearned: analysis.lessons?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        patterns: analysis.patterns || [],
        opportunitiesCreated: opportunitiesInserted,
        opportunitiesFiltered,
        lessonsLearned: analysis.lessons?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildDeepAnalysisContext(
  business: any,
  brain: any,
  checkins: any[],
  actions: any[],
  lessons: any[],
  insights: any[],
  externalData: any[],
  signals: any[],
  snapshots: any[],
  focusConfig: any,
  existingItems: any[]
): string {
  let context = `# ANÁLISIS PARA: ${business.name}

## PERFIL DEL NEGOCIO
- **Nombre**: ${business.name}
- **Tipo**: ${business.category || "Gastronómico"}
- **País**: ${business.country || "Argentina"}
- **Ciudad/Zona**: ${business.address || "No especificado"}
- **Ticket promedio**: ${business.avg_ticket ? `$${business.avg_ticket}` : "No especificado"}
- **Rating actual**: ${business.avg_rating ? `${business.avg_rating}/5` : "No especificado"}
- **Modelo de servicio**: ${business.service_model || "No especificado"}
- **Plataformas delivery**: ${business.delivery_platforms?.join(", ") || "Ninguna"}
- **Días/Horarios fuertes**: ${business.active_dayparts?.join(", ") || "No especificado"}
`;

  // Brain context (what we already know) - ULTRA PERSONALIZED
  if (brain) {
    context += `
## MEMORIA DEL NEGOCIO (Lo que ya sabemos)
- **Foco actual**: ${brain.current_focus || "ventas"}
- **Tipo principal**: ${brain.primary_business_type || "restaurant"}
- **Tipo secundario**: ${brain.secondary_business_type || "N/A"}
- **Confianza del sistema**: ${brain.confidence_score || 0}%
- **Señales procesadas**: ${brain.total_signals || 0}
- **Última actualización**: ${brain.last_learning_at || "Nunca"}

### Datos factuales conocidos:
${JSON.stringify(brain.factual_memory || {}, null, 2)}

### Preferencias del dueño:
${JSON.stringify(brain.preferences_memory || {}, null, 2)}

### Decisiones previas (misiones pausadas/rechazadas):
${JSON.stringify(brain.decisions_memory || {}, null, 2)}
`;

    // Include dynamic memory (pulse history, events)
    const dynamicMem = brain.dynamic_memory || {};
    if (dynamicMem.pulse_history && dynamicMem.pulse_history.length > 0) {
      const recentPulses = dynamicMem.pulse_history.slice(0, 7);
      context += `
### Pulso reciente del negocio (últimos 7 días):
${recentPulses.map((p: any) => `- ${p.date} (${p.shift || 'día'}): ${p.score}/5 - ${p.label || ''} ${p.revenue ? `| $${p.revenue}` : ''}`).join('\n')}
- **Promedio 7 días**: ${dynamicMem.avg_pulse_7d?.toFixed(1) || 'N/A'}/5
`;
    }

    if (dynamicMem.good_events && dynamicMem.good_events.length > 0) {
      context += `
### Eventos positivos recientes:
${dynamicMem.good_events.slice(0, 5).map((e: any) => `- ${e.date}: ${e.note}`).join('\n')}
`;
    }

    if (dynamicMem.bad_events && dynamicMem.bad_events.length > 0) {
      context += `
### Eventos negativos recientes (áreas de mejora):
${dynamicMem.bad_events.slice(0, 5).map((e: any) => `- ${e.date}: ${e.note}`).join('\n')}
`;
    }
  }

  // Focus config
  if (focusConfig) {
    context += `
## CONFIGURACIÓN DE FOCO
- **Foco principal**: ${focusConfig.current_focus}
- **Foco secundario**: ${focusConfig.secondary_focus || "ninguno"}
- **Límite semanal de acciones**: ${focusConfig.weekly_action_limit || 3}
`;
  }

  // EXISTING ITEMS - CRITICAL FOR DEDUPLICATION
  if (existingItems.length > 0) {
    context += `
## ⚠️ OPORTUNIDADES/MISIONES EXISTENTES (NO REPETIR)
${existingItems.map(item => `- "${item.title}"`).join("\n")}
`;
  }

  // Business insights from micro-questions (MOST IMPORTANT)
  if (insights.length > 0) {
    context += `\n## RESPUESTAS DEL DUEÑO (${insights.length} datos)\n`;
    
    const byCategory: Record<string, any[]> = {};
    for (const insight of insights) {
      const cat = insight.category || "general";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(insight);
    }
    
    for (const [cat, catInsights] of Object.entries(byCategory)) {
      context += `\n**[${cat.toUpperCase()}]**\n`;
      for (const insight of catInsights.slice(0, 8)) {
        context += `- ${insight.question}: **${insight.answer}**\n`;
      }
    }
  }

  // Signals (recent observations)
  if (signals.length > 0) {
    context += `\n## SEÑALES RECIENTES (${signals.length})\n`;
    for (const signal of signals.slice(0, 10)) {
      const content = signal.content || {};
      context += `- [${signal.signal_type}] ${signal.raw_text || JSON.stringify(content).slice(0, 100)}\n`;
    }
  }

  // Latest snapshot (health diagnosis)
  if (snapshots.length > 0) {
    const latest = snapshots[0];
    context += `\n## ÚLTIMO DIAGNÓSTICO DE SALUD
- **Score total**: ${latest.total_score || 0}/100
- **Fortalezas**: ${JSON.stringify(latest.strengths || [])}
- **Debilidades**: ${JSON.stringify(latest.weaknesses || [])}
- **Acciones sugeridas**: ${JSON.stringify(latest.top_actions || [])}
`;
  }

  // Check-ins analysis with specific numbers
  if (checkins.length > 0) {
    const byDay: Record<string, number[]> = {};
    const bySlot: Record<string, number[]> = {};

    for (const checkin of checkins) {
      const date = new Date(checkin.created_at);
      const dayName = date.toLocaleDateString("es", { weekday: "long" });
      const traffic = checkin.traffic_level || 3;

      if (!byDay[dayName]) byDay[dayName] = [];
      byDay[dayName].push(traffic);

      if (checkin.slot) {
        if (!bySlot[checkin.slot]) bySlot[checkin.slot] = [];
        bySlot[checkin.slot].push(traffic);
      }
    }

    context += `\n## TRÁFICO (${checkins.length} check-ins)\n`;

    // Find best and worst days
    const dayStats = Object.entries(byDay).map(([day, traffics]) => ({
      day,
      avg: traffics.reduce((a, b) => a + b, 0) / traffics.length,
      count: traffics.length
    })).sort((a, b) => b.avg - a.avg);

    context += `**Ranking de días:**\n`;
    for (const stat of dayStats) {
      context += `- ${stat.day}: ${stat.avg.toFixed(1)}/5 (${stat.count} registros)\n`;
    }

    if (dayStats.length >= 2) {
      context += `\n📈 **Mejor día**: ${dayStats[0].day} (${dayStats[0].avg.toFixed(1)}/5)\n`;
      context += `📉 **Peor día**: ${dayStats[dayStats.length-1].day} (${dayStats[dayStats.length-1].avg.toFixed(1)}/5)\n`;
    }

    if (Object.keys(bySlot).length > 0) {
      context += `\n**Por turno:**\n`;
      for (const [slot, traffics] of Object.entries(bySlot)) {
        const avg = traffics.reduce((a, b) => a + b, 0) / traffics.length;
        const percent = ((traffics.length / checkins.length) * 100).toFixed(0);
        context += `- ${slot}: ${avg.toFixed(1)}/5 (${percent}% del total)\n`;
      }
    }
  }

  // Actions analysis
  if (actions.length > 0) {
    const completed = actions.filter(a => a.status === "completed").length;
    const skipped = actions.filter(a => a.status === "skipped").length;
    const completionRate = ((completed / actions.length) * 100).toFixed(0);

    const byCategory: Record<string, { completed: number; total: number }> = {};
    for (const action of actions) {
      const cat = action.category || "general";
      if (!byCategory[cat]) byCategory[cat] = { completed: 0, total: 0 };
      byCategory[cat].total++;
      if (action.status === "completed") byCategory[cat].completed++;
    }

    context += `\n## ACCIONES (${actions.length} totales)
- ✅ Completadas: ${completed}
- ⏭️ Omitidas: ${skipped}
- 📊 Tasa de ejecución: **${completionRate}%**

**Por categoría:**\n`;

    for (const [cat, stats] of Object.entries(byCategory)) {
      const rate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0;
      const emoji = parseInt(rate as string) >= 70 ? "✅" : parseInt(rate as string) >= 40 ? "⚠️" : "❌";
      context += `- ${emoji} ${cat}: ${stats.completed}/${stats.total} (${rate}%)\n`;
    }
  }

  // External data (reviews with specific mentions)
  if (externalData.length > 0) {
    const reviews = externalData.filter(d => d.data_type === 'review');
    
    if (reviews.length > 0) {
      const positiveReviews = reviews.filter(r => (r.sentiment_score || 0) > 0.5);
      const negativeReviews = reviews.filter(r => (r.sentiment_score || 0) < -0.2);
      const avgRating = reviews.reduce((sum, r) => sum + (r.content?.rating || 0), 0) / reviews.length;
      
      context += `\n## RESEÑAS EXTERNAS (${reviews.length})
- Rating promedio: **${avgRating.toFixed(1)}/5**
- Positivas: ${positiveReviews.length}
- Negativas: ${negativeReviews.length}
`;
      
      if (negativeReviews.length > 0) {
        context += `\n**Reseñas negativas recientes:**\n`;
        for (const review of negativeReviews.slice(0, 3)) {
          const text = review.content?.text?.slice(0, 150) || "Sin texto";
          context += `- ⭐${review.content?.rating || "?"}: "${text}..."\n`;
        }
      }
    }
  }

  return context;
}
