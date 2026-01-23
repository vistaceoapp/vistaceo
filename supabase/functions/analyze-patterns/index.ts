import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Blocked generic phrases that should never appear in opportunities
const BLOCKED_PHRASES = [
  // Generic business advice
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
  "optimizar marketing",
  "mejorar marketing",
  "aumentar marketing",
  "estrategia de marketing",
  "aumentar ejecución",
  "optimizar proceso de",
  "estrategia de retención",
  "sistema de check-in",
  "implementar check-ins",
  // Ultra-generic titles that add no value
  "ofertas para",
  "promociones para",
  "optimizar la",
  "mejorar la",
  "aumentar la",
  "optimizar el",
  "mejorar el",
  "aumentar el",
  // Vague operational terms
  "capacitación del personal",
  "retención de personal",
  "comunicación del equipo",
  "presencia en redes",
  "visibilidad online",
  "experiencia del cliente",
  // Generic process terms without specifics
  "proceso de marketing",
  "proceso de capacitación",
  "proceso de ventas",
  "proceso de servicio",
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

// Ultra-strict quality check for titles - must contain specific data
function isTitleTooGeneric(title: string): boolean {
  const titleLower = title.toLowerCase();
  
  // Must contain at least one of these specificity markers
  const specificityMarkers = [
    /\d+%/, // Percentage
    /\d+\/\d+/, // Ratio like 3/5, 4/10
    /\$[\d,.]+/, // Money amount
    /\d+\s*(días?|semanas?|meses?|horas?)/, // Time duration
    /\d+\s*(reseñas?|clientes?|pedidos?|ventas?|registros?)/, // Count of items
    /(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/, // Day of week
    /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/, // Month
    /(mediodía|almuerzo|cena|desayuno|noche)/, // Time of day/meal
    /["']([^"']+)["']/, // Quoted specific item name
  ];
  
  const hasSpecificData = specificityMarkers.some(marker => marker.test(titleLower));
  
  // Also check if title is suspiciously short or starts with generic verbs
  const startsGeneric = /^(mejorar|optimizar|aumentar|implementar|crear|desarrollar|establecer|definir)\s/i.test(title);
  const isTooShort = title.length < 25;
  
  if (startsGeneric && !hasSpecificData) {
    console.log(`Title too generic (starts with generic verb, no data): "${title}"`);
    return true;
  }
  
  if (isTooShort && !hasSpecificData) {
    console.log(`Title too generic (too short, no data): "${title}"`);
    return true;
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

      // =====================================================================
      // 🧠 ULTRA-COMPLETE SECTOR MAPPING - 180+ BUSINESS TYPES
      // =====================================================================
      // This comprehensive mapping covers ALL business types in the platform
      // Each sector has 5-6 highly specific queries for maximum relevance
      // =====================================================================
      
      const sectorQueries: Record<string, string[]> = {
        // ═══════════════════════════════════════════════════════════════════
        // A1_GASTRO - GASTRONOMÍA Y BEBIDAS (22 tipos)
        // ═══════════════════════════════════════════════════════════════════
        restaurant_general: ["restaurantes tendencias 2025", "menú restaurante innovación", "delivery restaurantes algoritmo", "restaurante marketing digital", "gastronomía experiencias"],
        alta_cocina: ["fine dining tendencias 2025", "restaurantes gourmet experiencia", "haute cuisine innovación", "restaurantes premium reservas", "gastronomía alta cocina premios"],
        bodegon_cantina: ["bodegones tradicionales tendencias", "cantinas comida casera", "restaurantes familiares marketing", "cocina tradicional local", "bodegón clásico renovación"],
        parrilla_asador: ["parrillas tendencias 2025", "asador cortes premium", "carnes a la brasa innovación", "steakhouse marketing", "parrilla argentina tendencias"],
        cocina_criolla: ["cocina criolla tendencias", "comida regional local", "gastronomía tradicional innovación", "platos típicos marketing", "cocina autóctona premium"],
        pescados_mariscos: ["marisquería tendencias 2025", "pescado fresco marketing", "ceviche innovación", "restaurante mar sostenibilidad", "seafood delivery tendencias"],
        pizzeria: ["pizzerías tendencias 2025", "pizza artesanal innovación", "pizzería delivery optimizar", "pizza napoletana marketing", "pizzas gourmet premium"],
        panaderia: ["panaderías artesanales 2025", "masa madre tendencias", "panadería marketing local", "pan saludable gluten free", "croissants croissantería"],
        pastas_italiana: ["pastas frescas tendencias", "cocina italiana innovación", "trattoria marketing 2025", "pasta artesanal premium", "restaurante italiano experiencia"],
        heladeria: ["heladerías artesanales 2025", "helados veganos plant-based", "gelato italiano tendencias", "helados funcionales proteína", "heladería marketing verano"],
        fast_food: ["fast food tendencias 2025", "hamburguesas gourmet innovación", "comida rápida saludable", "food truck marketing", "QSR digitalización"],
        cafeteria_pasteleria: ["cafeterías specialty coffee 2025", "café especialidad tendencias", "pastelería artesanal marketing", "coffee shop coworking", "cafetería experiencia premium"],
        cocina_asiatica: ["cocina asiática tendencias 2025", "sushi innovación", "ramen restaurante marketing", "comida japonesa delivery", "fusión asiática premium"],
        cocina_arabe: ["cocina árabe tendencias", "comida medio oriente 2025", "shawarma falafel innovación", "restaurante árabe marketing", "gastronomía oriental"],
        cocina_saludable: ["comida saludable tendencias 2025", "restaurante vegano marketing", "healthy food innovación", "plant-based tendencias", "comida orgánica delivery"],
        bar_cerveceria: ["bares tendencias 2025", "cervecería artesanal marketing", "cocktails innovación", "mixología molecular", "bar experiencias nocturnas"],
        servicio_comida: ["catering tendencias 2025", "viandas delivery corporativo", "food service innovación", "take away optimización", "comida empresas marketing"],
        dark_kitchen: ["dark kitchen tendencias 2025", "ghost kitchen optimización", "cocina fantasma delivery", "virtual brands estrategias", "cloud kitchen eficiencia"],
        
        // Aliases for common variations
        restaurante: ["restaurantes tendencias 2025", "menú restaurante innovación", "delivery restaurantes algoritmo", "restaurante marketing digital", "gastronomía experiencias"],
        cafeteria: ["cafeterías specialty coffee 2025", "café especialidad tendencias", "pastelería artesanal marketing", "coffee shop coworking", "cafetería experiencia premium"],
        bar: ["bares tendencias 2025", "cervecería artesanal marketing", "cocktails innovación", "mixología molecular", "bar experiencias nocturnas"],
        heladeria_alias: ["heladerías artesanales 2025", "helados veganos plant-based", "gelato italiano tendencias", "helados funcionales proteína", "heladería marketing verano"],
        fast_casual: ["fast casual tendencias 2025", "quick service innovación", "comida rápida premium", "fast food sostenibilidad", "QSR digitalización"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A2_TURISMO - TURISMO, HOTELERÍA, OCIO Y EVENTOS (18 tipos)
        // ═══════════════════════════════════════════════════════════════════
        hotel_urbano: ["hoteles urbanos tendencias 2025", "hotel business travel", "hotelería corporativa innovación", "hoteles ciudad marketing", "business hotel tecnología"],
        hotel_boutique: ["hotel boutique tendencias 2025", "hoteles experiencia premium", "boutique hotel diseño", "hoteles exclusivos marketing", "small luxury hotels"],
        resort_all_inclusive: ["resorts tendencias 2025", "all inclusive innovación", "resort sostenible", "turismo vacacional premium", "resort familiar experiencia"],
        hostel: ["hostels tendencias 2025", "turismo joven innovación", "hostel marketing digital", "albergues experiencia social", "backpackers tendencias"],
        posada_lodge: ["posadas rurales 2025", "lodge naturaleza", "ecoturismo tendencias", "turismo rural sostenible", "cabañas experiencia"],
        apart_hotel: ["apart hotel tendencias", "extended stay 2025", "apartamentos temporarios", "suites business travel", "corporate housing"],
        alquiler_temporario: ["alquiler temporario tendencias 2025", "Airbnb marketing", "short stay optimización", "alquiler vacacional", "rental management"],
        agencia_viajes: ["agencias viajes digitalización 2025", "travel agency innovación", "turismo personalizado AI", "agencia online marketing", "OTA tendencias"],
        operador_turistico: ["operadores turísticos 2025", "DMC tendencias", "receptivo turismo", "experiencias locales innovación", "tours operador marketing"],
        tours_guiados: ["tours guiados tendencias 2025", "city tour innovación", "free walking tour", "experiencias guiadas marketing", "tours culturales"],
        turismo_aventura: ["turismo aventura 2025", "outdoor tendencias", "ecoturismo innovación", "actividades naturaleza", "adventure travel marketing"],
        atracciones_tickets: ["atracciones turísticas 2025", "tickets online innovación", "experiencias reservas", "tours actividades marketing", "GetYourGuide tendencias"],
        parque_tematico: ["parques temáticos tendencias 2025", "entretenimiento familiar innovación", "theme park marketing", "atracciones experiencias", "parques diversiones"],
        teatro_espectaculos: ["teatros tendencias 2025", "espectáculos innovación", "eventos culturales marketing", "shows en vivo", "entretenimiento cultural"],
        salon_eventos_sociales: ["salones eventos 2025", "casamientos tendencias", "fiestas celebraciones", "eventos sociales innovación", "wedding venue marketing"],
        eventos_corporativos: ["eventos corporativos MICE 2025", "congresos convenciones", "meetings incentives", "eventos empresas innovación", "corporate events tendencias"],
        productora_eventos: ["productoras eventos 2025", "event production tendencias", "producción espectáculos", "eventos logística innovación", "show production"],
        ocio_nocturno: ["vida nocturna tendencias 2025", "clubes nocturnos innovación", "discotecas marketing", "nightlife experiencias", "boliches clubbing"],
        
        // Aliases
        hotel: ["hoteles boutique tendencias 2025", "turismo experiencial", "hotelería sostenible", "hoteles tecnología check-in", "hospitality innovación"],
        agencia_viajes_alias: ["agencias viajes digitalización 2025", "travel tech innovación", "turismo personalizado", "viajes experiencias", "OTA tendencias"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A3_RETAIL - COMERCIO MINORISTA Y E-COMMERCE (20 tipos)
        // ═══════════════════════════════════════════════════════════════════
        almacen_tienda_barrio: ["tiendas de barrio tendencias 2025", "comercio proximidad", "almacén marketing local", "retail cercanía innovación", "minimarket tendencias"],
        supermercado: ["supermercados tendencias 2025", "retail alimentario innovación", "autoservicio tecnología", "grocery marketing", "supermercado online"],
        moda_accesorios: ["retail moda tendencias 2025", "tiendas ropa marketing", "fashion retail innovación", "moda sostenible circular", "accesorios tendencias"],
        calzado_marroquineria: ["calzado retail tendencias 2025", "zapaterías innovación", "sneakers resale", "marroquinería premium", "footwear marketing"],
        joyeria_bijouterie: ["joyerías tendencias 2025", "bijouterie marketing", "accesorios lujo innovación", "jewelry retail", "joyas personalizadas"],
        electronica_tecnologia: ["retail electrónica 2025", "tiendas tecnología tendencias", "tech retail innovación", "electrónica ecommerce", "gadgets marketing"],
        deportes_outdoor: ["tiendas deportes tendencias 2025", "outdoor retail innovación", "running cycling marketing", "deportes ecommerce", "fitness retail"],
        hogar_deco: ["tiendas hogar tendencias 2025", "decoración retail innovación", "home decor marketing", "muebles diseño", "interiorismo retail"],
        jugueteria: ["jugueterías tendencias 2025", "toys retail innovación", "juguetes educativos marketing", "juguetería experiencias", "kids retail"],
        libreria: ["librerías tendencias 2025", "bookstore innovación", "librería experiencia café", "libros marketing", "retail cultural"],
        farmacia_perfumeria: ["farmacias tendencias 2025", "perfumería retail innovación", "cosmética marketing", "farmacia digital", "beauty retail"],
        optica: ["ópticas tendencias 2025", "retail óptico innovación", "lentes contacto marketing", "óptica digital", "eyewear tendencias"],
        ferreteria: ["ferreterías tendencias 2025", "hardware store innovación", "bricolaje marketing", "ferretería digital", "home improvement"],
        vivero_jardineria: ["viveros tendencias 2025", "jardinería retail innovación", "plantas marketing", "garden center", "vivero sostenible"],
        mascotas: ["pet shops tendencias 2025", "tiendas mascotas innovación", "pet retail marketing", "accesorios mascotas", "veterinaria retail"],
        automotriz_repuestos: ["repuestos automotriz 2025", "autopartes retail tendencias", "taller mecánico innovación", "car parts marketing", "automotive retail"],
        ecommerce_puro: ["ecommerce tendencias 2025", "tienda online innovación", "comercio electrónico marketing", "marketplace estrategias", "digital retail"],
        dropshipping_fulfillment: ["dropshipping tendencias 2025", "fulfillment innovación", "logística ecommerce", "warehousing retail", "3PL tendencias"],
        marketplace_plataforma: ["marketplaces tendencias 2025", "plataforma ecommerce innovación", "retail platform marketing", "agregadores", "multi-vendor"],
        venta_directa_catalogo: ["venta directa tendencias 2025", "catálogo innovación", "network marketing", "MLM tendencias", "direct sales"],
        
        // Aliases
        moda: ["retail moda tendencias 2025", "tiendas ropa marketing", "fashion retail innovación", "moda sostenible", "accesorios tendencias"],
        electronica: ["retail electrónica 2025", "tiendas tecnología tendencias", "tech retail innovación", "electrónica ecommerce", "gadgets marketing"],
        calzado: ["calzado retail tendencias 2025", "zapaterías innovación", "sneakers resale", "marroquinería premium", "footwear marketing"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A4_SALUD - SALUD Y BIENESTAR (16 tipos)
        // ═══════════════════════════════════════════════════════════════════
        consultorio_medico: ["consultorios médicos telemedicina 2025", "clínicas privadas marketing", "salud digital wearables", "medicina experiencia paciente", "healthcare innovación"],
        clinica_especialidad: ["clínicas especialidad tendencias 2025", "centros médicos innovación", "especialidades médicas marketing", "healthcare technology", "clínica privada"],
        odontologia: ["clínicas dentales marketing 2025", "odontología digital CAD CAM", "ortodoncia invisible tendencias", "turismo dental", "dental technology"],
        psicologia_psiquiatria: ["psicología online tendencias 2025", "terapia digital innovación", "salud mental marketing", "wellness mental", "psiquiatría telemedicina"],
        fisioterapia_rehabilitacion: ["fisioterapia tendencias 2025", "rehabilitación innovación", "kinesiología marketing", "recuperación deportiva", "physio technology"],
        nutricion: ["nutricionistas tendencias 2025", "nutrición online innovación", "dietista marketing digital", "alimentación saludable", "nutrition coaching"],
        optica_salud: ["óptica salud visual 2025", "optometría tendencias", "salud ocular innovación", "lentes contacto tecnología", "eye care"],
        farmacia_magistral: ["farmacias magistrales 2025", "formulación personalizada", "farmacia especializada innovación", "compounding pharmacy", "farmacia clínica"],
        laboratorio_diagnostico: ["laboratorios clínicos 2025", "diagnóstico innovación", "análisis clínicos tecnología", "lab testing marketing", "diagnostics"],
        centro_dialisis: ["centros diálisis tendencias", "nefrología innovación", "tratamiento renal", "kidney care", "dialysis technology"],
        estetica_medica: ["estética médica tendencias 2025", "medicina estética innovación", "tratamientos antienvejecimiento", "aesthetic medicine marketing", "cosmetic procedures"],
        spa_wellness: ["spa wellness tendencias 2025", "centros bienestar innovación", "wellness integral mindfulness", "spa tratamientos high-tech", "wellness retreat"],
        gimnasio_fitness: ["gimnasios tendencias 2025", "fitness innovación boutique", "gym marketing digital", "fitness technology", "workout tendencias"],
        yoga_pilates: ["yoga studios tendencias 2025", "pilates innovación", "wellness classes marketing", "mindfulness tendencias", "yoga online"],
        centro_belleza: ["centros belleza tendencias 2025", "salón estética innovación", "beauty marketing", "tratamientos faciales corporales", "spa day"],
        peluqueria_barberia: ["peluquerías tendencias 2025", "barbería innovación", "hair salon marketing", "barbershop experience", "styling tendencias"],
        
        // Aliases
        spa: ["spa wellness tendencias 2025", "centros bienestar innovación", "wellness integral mindfulness", "spa tratamientos high-tech", "wellness retreat"],
        consultorio: ["consultorios médicos telemedicina 2025", "clínicas privadas marketing", "salud digital wearables", "medicina experiencia paciente", "healthcare innovación"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A5_PROFESIONAL - SERVICIOS PROFESIONALES (18 tipos)
        // ═══════════════════════════════════════════════════════════════════
        estudio_abogados: ["estudios jurídicos tendencias 2025", "abogados marketing digital", "legaltech innovación", "law firm technology", "servicios legales online"],
        estudio_contable: ["estudios contables tendencias 2025", "contadores digitalización", "accounting tech innovación", "fintech contabilidad", "tax advisory"],
        consultoria_empresarial: ["consultoría empresas tendencias 2025", "consulting innovación", "advisory services marketing", "management consulting", "business strategy"],
        consultoria_ti: ["consultoría TI tendencias 2025", "IT services innovación", "technology consulting", "digital transformation", "tech advisory"],
        agencia_marketing: ["agencias marketing tendencias 2025", "marketing digital innovación", "creative agency", "publicidad digital", "branding estrategias"],
        estudio_diseno: ["estudios diseño tendencias 2025", "design agency innovación", "branding marketing", "diseño gráfico web", "UX UI tendencias"],
        estudio_arquitectura: ["estudios arquitectura tendencias 2025", "arquitectos innovación", "diseño sustentable", "architecture marketing", "building design"],
        inmobiliaria: ["inmobiliarias tendencias 2025", "real estate innovación", "proptech marketing", "corredores inmobiliarios", "property technology"],
        agente_seguros: ["seguros tendencias 2025", "insurtech innovación", "agentes seguros marketing", "insurance digital", "broker seguros"],
        asesoria_financiera: ["asesores financieros 2025", "wealth management tendencias", "fintech advisory", "planificación financiera", "investment advisory"],
        agencia_reclutamiento: ["reclutamiento tendencias 2025", "headhunting innovación", "HR tech marketing", "talent acquisition", "staffing agencies"],
        coworking: ["coworking tendencias 2025", "espacios trabajo flexibles", "oficinas compartidas innovación", "workspace marketing", "flex office"],
        imprenta: ["imprentas tendencias 2025", "print on demand innovación", "impresión digital marketing", "printing services", "graphic production"],
        servicios_audiovisuales: ["productoras audiovisuales 2025", "video production tendencias", "fotografía profesional", "content creation", "media services"],
        traduccion_localizacion: ["servicios traducción 2025", "localización innovación", "translation technology", "multilingual marketing", "language services"],
        notaria: ["notarías tendencias 2025", "servicios notariales digital", "notary tech", "certificación documentos", "legal notarial"],
        despachante_aduana: ["comercio exterior 2025", "despachantes aduana tendencias", "customs broker innovación", "import export marketing", "logistics freight"],
        seguridad_vigilancia: ["seguridad privada tendencias 2025", "vigilancia tecnología", "security services innovación", "monitoreo alarmas", "safety marketing"],
        
        // Aliases
        consultoria: ["consultoría empresas tendencias 2025", "consulting innovación", "advisory services marketing", "management consulting", "business strategy"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A6_EDUCACION - EDUCACIÓN Y FORMACIÓN (12 tipos)
        // ═══════════════════════════════════════════════════════════════════
        escuela_privada: ["colegios privados tendencias 2025", "educación K12 innovación", "escuelas tecnología", "private school marketing", "edtech primaria secundaria"],
        jardin_infantes: ["jardines infantes tendencias 2025", "early childhood education", "preescolar innovación", "childcare marketing", "kindergarten"],
        instituto_idiomas: ["institutos idiomas tendencias 2025", "language learning innovación", "academias inglés marketing", "cursos idiomas online", "language school"],
        academia_artes: ["academias artes tendencias 2025", "escuelas música arte", "creative education innovación", "art school marketing", "performing arts"],
        capacitacion_corporativa: ["capacitación empresas 2025", "corporate training tendencias", "L&D innovación", "formación corporativa", "upskilling reskilling"],
        coaching_mentoring: ["coaching tendencias 2025", "mentoring innovación", "desarrollo personal marketing", "life coaching", "executive coaching"],
        elearning_plataforma: ["e-learning tendencias 2025", "plataformas cursos online", "edtech innovación", "MOOC marketing", "digital learning"],
        tutoria_apoyo: ["tutorías tendencias 2025", "apoyo escolar innovación", "clases particulares marketing", "tutoring online", "academic support"],
        certificaciones_it: ["certificaciones IT tendencias 2025", "bootcamps programación", "coding school marketing", "tech education", "skills training"],
        universidad_posgrado: ["universidades tendencias 2025", "educación superior innovación", "posgrados MBA marketing", "higher education", "academic innovation"],
        formacion_oficios: ["formación oficios 2025", "escuelas técnicas tendencias", "vocational training", "oficios demandados", "skill trades"],
        autoescuela: ["autoescuelas tendencias 2025", "driving school innovación", "licencias conducir marketing", "academia manejo", "driver education"],
        
        // Aliases  
        educacion: ["educación tendencias 2025", "e-learning innovación", "cursos online certificaciones", "edtech gamificación", "formación digital"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A7_INDUSTRIA - INDUSTRIA Y MANUFACTURA (14 tipos)
        // ═══════════════════════════════════════════════════════════════════
        fabrica_alimentos: ["industria alimentaria tendencias 2025", "food manufacturing innovación", "producción alimentos marketing", "procesamiento comida", "food tech"],
        fabrica_textil: ["industria textil tendencias 2025", "manufacturing moda", "textile innovation", "confección ropa", "fashion production"],
        industria_metalurgica: ["metalurgia tendencias 2025", "industria metal innovación", "manufacturing steel", "metal fabrication", "industrial metal"],
        industria_plasticos: ["plásticos industria 2025", "packaging innovación", "manufacturing plastics", "materiales reciclables", "plastic production"],
        industria_madera: ["industria maderera 2025", "carpintería industrial", "wood manufacturing", "muebles producción", "forestry products"],
        taller_manufactura: ["talleres manufactura 2025", "small manufacturing tendencias", "artisan production", "custom manufacturing", "job shop"],
        imprenta_industrial: ["impresión industrial 2025", "packaging printing tendencias", "label manufacturing", "print production", "industrial graphics"],
        laboratorio_farmaceutico: ["laboratorios farmacéuticos 2025", "pharma manufacturing tendencias", "drug production", "pharmaceutical innovation", "biotech"],
        fabrica_cosmeticos: ["cosmética industrial 2025", "beauty manufacturing", "skincare production tendencias", "personal care manufacturing", "cosmetic innovation"],
        industria_quimica: ["industria química 2025", "chemical manufacturing tendencias", "specialty chemicals", "industrial chemicals", "chemical production"],
        electronica_industrial: ["electrónica industrial 2025", "electronic manufacturing", "PCB production tendencias", "tech manufacturing", "electronic assembly"],
        autopartes: ["autopartes manufacturing 2025", "automotive parts tendencias", "car components production", "OEM manufacturing", "auto industry"],
        packaging_envases: ["packaging tendencias 2025", "envases innovación", "sustainable packaging", "container manufacturing", "packaging solutions"],
        reciclaje_residuos: ["reciclaje industrial 2025", "waste management tendencias", "circular economy", "residuos innovación", "recycling business"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A8_CONSTRUCCION - CONSTRUCCIÓN E INMUEBLES (10 tipos)
        // ═══════════════════════════════════════════════════════════════════
        constructora_obra_civil: ["constructoras tendencias 2025", "construcción civil innovación", "building company marketing", "infrastructure development", "civil engineering"],
        desarrolladora_inmobiliaria: ["desarrolladoras inmobiliarias 2025", "real estate development tendencias", "property development", "residential commercial projects", "proptech development"],
        reformas_remodelaciones: ["reformas hogar tendencias 2025", "remodelación innovación", "home renovation marketing", "remodeling business", "interior renovation"],
        instalaciones_electricas: ["electricistas tendencias 2025", "instalaciones eléctricas innovación", "electrical services marketing", "smart home installation", "electrical contractor"],
        instalaciones_sanitarias: ["plomería tendencias 2025", "instalaciones sanitarias innovación", "plumbing services marketing", "bathroom renovation", "plumbing contractor"],
        climatizacion_hvac: ["climatización tendencias 2025", "HVAC innovación", "aire acondicionado marketing", "heating cooling services", "hvac contractor"],
        pintura_acabados: ["pintores tendencias 2025", "painting services innovación", "acabados interiores marketing", "decorative painting", "painting contractor"],
        carpinteria_muebles: ["carpintería tendencias 2025", "muebles a medida innovación", "custom furniture marketing", "woodworking services", "cabinet making"],
        vidrieria_cerramientos: ["vidriería tendencias 2025", "cerramientos innovación", "glass services marketing", "window installation", "glazing contractor"],
        paisajismo: ["paisajismo tendencias 2025", "landscaping innovación", "jardines diseño marketing", "outdoor design", "landscape architecture"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A9_TRANSPORTE - TRANSPORTE Y LOGÍSTICA (12 tipos)
        // ═══════════════════════════════════════════════════════════════════
        transporte_pasajeros: ["transporte pasajeros tendencias 2025", "buses turismo innovación", "charter services marketing", "passenger transport", "mobility services"],
        taxi_remis: ["taxis remises tendencias 2025", "ride hailing innovación", "taxi app marketing", "car service business", "taxi fleet"],
        mensajeria_courier: ["mensajería courier tendencias 2025", "last mile delivery innovación", "courier services marketing", "express delivery", "parcel delivery"],
        mudanzas_fletes: ["mudanzas tendencias 2025", "moving services innovación", "fletes logística marketing", "relocation business", "freight moving"],
        almacenamiento_deposito: ["almacenes depósitos 2025", "warehousing tendencias", "storage solutions innovación", "logistics warehouse", "fulfillment center"],
        transporte_carga: ["transporte carga tendencias 2025", "freight trucking innovación", "logistics transport marketing", "cargo shipping", "trucking business"],
        logistica_distribucion: ["logística distribución 2025", "supply chain tendencias", "distribution logistics innovación", "3PL services", "logistics management"],
        grua_auxilio: ["grúas auxilio 2025", "roadside assistance tendencias", "tow truck services", "vehicle recovery", "emergency towing"],
        alquiler_vehiculos: ["alquiler vehículos tendencias 2025", "car rental innovación", "fleet rental marketing", "vehicle leasing", "rent-a-car"],
        estacionamiento: ["estacionamientos tendencias 2025", "parking innovación", "parking management marketing", "smart parking", "parking solutions"],
        taller_mecanico: ["talleres mecánicos tendencias 2025", "automotive repair innovación", "car service marketing", "mechanic shop", "auto repair"],
        lavadero_autos: ["lavaderos autos tendencias 2025", "car wash innovación", "detailing marketing", "auto cleaning", "car care services"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A10_AGRO - AGRO Y ALIMENTOS PRIMARIOS (10 tipos)
        // ═══════════════════════════════════════════════════════════════════
        produccion_agricola: ["agricultura tendencias 2025", "agtech innovación", "farming technology marketing", "precision agriculture", "crop production"],
        ganaderia: ["ganadería tendencias 2025", "livestock innovación", "cattle farming marketing", "meat production", "animal husbandry"],
        agroindustria: ["agroindustria tendencias 2025", "food processing innovación", "agricultural industry marketing", "agribusiness", "farm to factory"],
        bodega_vinos: ["bodegas vinos tendencias 2025", "winery innovación", "wine marketing", "viticultura", "wine tourism"],
        cerveceria_artesanal: ["cervecerías artesanales tendencias 2025", "craft brewery innovación", "beer marketing", "microbrewery", "brewing business"],
        apicultura: ["apicultura tendencias 2025", "beekeeping innovación", "honey production marketing", "bee farming", "apiary business"],
        acuicultura_pesca: ["acuicultura tendencias 2025", "fish farming innovación", "aquaculture marketing", "fishing business", "seafood production"],
        productos_organicos: ["orgánicos tendencias 2025", "organic farming innovación", "productos naturales marketing", "sustainable agriculture", "organic certification"],
        vivero_plantas: ["viveros plantas tendencias 2025", "nursery business innovación", "plant production marketing", "horticulture", "greenhouse"],
        agroinsumos: ["agroinsumos tendencias 2025", "farm supplies innovación", "agricultural inputs marketing", "seeds fertilizers", "farm equipment"],
        
        // ═══════════════════════════════════════════════════════════════════
        // A11_TECNOLOGIA - TECNOLOGÍA Y DIGITAL (12 tipos)
        // ═══════════════════════════════════════════════════════════════════
        desarrollo_software: ["software development tendencias 2025", "desarrollo apps innovación", "tech startup marketing", "SaaS business", "coding services"],
        agencia_digital: ["agencias digitales tendencias 2025", "digital agency innovación", "web development marketing", "online marketing agency", "digital services"],
        saas_plataforma: ["SaaS tendencias 2025", "platform business innovación", "software subscription marketing", "cloud services", "B2B SaaS"],
        app_mobile: ["apps móviles tendencias 2025", "mobile development innovación", "app marketing", "iOS Android development", "mobile business"],
        ecommerce_tech: ["ecommerce tech tendencias 2025", "online store innovación", "digital commerce marketing", "ecommerce platform", "online retail tech"],
        fintech: ["fintech tendencias 2025", "financial technology innovación", "payments marketing", "digital banking", "crypto blockchain"],
        healthtech: ["healthtech tendencias 2025", "health technology innovación", "medical tech marketing", "digital health", "telemedicine tech"],
        edtech: ["edtech tendencias 2025", "education technology innovación", "learning platform marketing", "online education", "training tech"],
        proptech: ["proptech tendencias 2025", "real estate tech innovación", "property technology marketing", "real estate digital", "smart buildings"],
        insurtech: ["insurtech tendencias 2025", "insurance technology innovación", "digital insurance marketing", "insurance platform", "risk tech"],
        ai_machine_learning: ["inteligencia artificial tendencias 2025", "machine learning innovación", "AI business marketing", "automation tech", "cognitive services"],
        ciberseguridad: ["ciberseguridad tendencias 2025", "cybersecurity innovación", "security services marketing", "data protection", "infosec business"],
        
        // ═══════════════════════════════════════════════════════════════════
        // DEFAULT FALLBACK
        // ═══════════════════════════════════════════════════════════════════
        default: ["pequeños negocios tendencias 2025", "pymes digitalización", "emprendedores innovación", "negocios locales marketing", "comercio local estrategias"],
      };

      // =====================================================================
      // 🧠 INTELLIGENT QUERY SELECTION - FINDS BEST MATCH FOR ANY BUSINESS TYPE
      // =====================================================================
      
      // Normalize sector hint to find best match
      const normalizedSector = sectorHint.toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9_]/g, '_');
      
      // Try exact match first, then partial matches
      let baseQueries: string[] = [];
      
      // Exact match
      if (sectorQueries[normalizedSector]) {
        baseQueries = sectorQueries[normalizedSector];
        console.log(`[I+D] Exact sector match: ${normalizedSector}`);
      } 
      // Try finding partial match (e.g., "restaurant_general" matches "restaurante")
      else {
        const sectorKeys = Object.keys(sectorQueries);
        const partialMatch = sectorKeys.find(key => 
          normalizedSector.includes(key) || key.includes(normalizedSector) ||
          normalizedSector.split('_').some((part: string) => key.includes(part))
        );
        if (partialMatch) {
          baseQueries = sectorQueries[partialMatch];
          console.log(`[I+D] Partial sector match: ${normalizedSector} -> ${partialMatch}`);
        } else {
          // Try category-based fallback
          const category = (business.category || '').toLowerCase();
          const categoryMatch = sectorKeys.find(key => key.includes(category) || category.includes(key));
          if (categoryMatch) {
            baseQueries = sectorQueries[categoryMatch];
            console.log(`[I+D] Category fallback match: ${category} -> ${categoryMatch}`);
          } else {
            baseQueries = sectorQueries.default;
            console.log(`[I+D] Using default queries for: ${normalizedSector}`);
          }
        }
      }
      
      // Enhanced focus-based additional queries with more variety
      const focusQueries: Record<string, string[]> = {
        ventas: [
          `${sectorHint} aumentar ventas estrategias 2025`, 
          `${sectorHint} conversión clientes`,
          `${sectorHint} pricing estrategias precios`,
          `${sectorHint} upselling cross-selling`,
        ],
        reputacion: [
          `${sectorHint} reseñas Google reputación online`, 
          `${sectorHint} experiencia cliente NPS`,
          `${sectorHint} gestión quejas reclamaciones`,
          `${sectorHint} fidelización clientes`,
        ],
        operaciones: [
          `${sectorHint} eficiencia operativa automatización`, 
          `${sectorHint} optimizar costos`,
          `${sectorHint} productividad procesos`,
          `${sectorHint} tecnología operaciones`,
        ],
        marketing: [
          `${sectorHint} marketing digital 2025`, 
          `${sectorHint} redes sociales contenido viral`,
          `${sectorHint} publicidad online ads`,
          `${sectorHint} branding posicionamiento`,
        ],
        equipo: [
          `${sectorHint} recursos humanos retención talento`, 
          `${sectorHint} capacitación empleados`,
          `${sectorHint} cultura organizacional`,
          `${sectorHint} liderazgo equipos`,
        ],
        crecimiento: [
          `${sectorHint} expansión negocios`,
          `${sectorHint} franquicias crecimiento`,
          `${sectorHint} escalabilidad`,
          `${sectorHint} inversión capital`,
        ],
        innovacion: [
          `${sectorHint} innovación disruptiva`,
          `${sectorHint} tecnología transformación digital`,
          `${sectorHint} nuevos modelos negocio`,
          `${sectorHint} startups sector`,
        ],
      };

      const additionalFocusQueries = focusQueries[focusHint.toLowerCase()] || focusQueries.ventas;
      
      // Build ultra-comprehensive query list for MAXIMUM insights
      const queries = [
        // Base sector queries (5 queries) with country
        ...baseQueries.slice(0, 5).map(q => `${q} ${business.country || "LATAM"}`),
        // Focus-specific queries (4 queries)
        ...additionalFocusQueries.slice(0, 4).map(q => `${q} ${business.country || ""}`),
        // Local/city specific (if available)
        cityHint ? `${sectorHint} ${cityHint} tendencias noticias` : null,
        cityHint ? `negocios ${cityHint} 2025 tendencias` : null,
        // Platform-specific queries (universal)
        `${sectorHint} Google Maps reseñas optimizar 2025`,
        `${sectorHint} Instagram Reels TikTok contenido 2025`,
        `${sectorHint} WhatsApp Business ventas 2025`,
        // Innovation & Tech
        `${sectorHint} inteligencia artificial AI 2025`,
        `${sectorHint} automatización digitalización`,
        // Competition & Market
        `${sectorHint} competencia estrategias`,
        `${sectorHint} mercado tendencias consumidor`,
        // Sustainability (important trend)
        `${sectorHint} sostenibilidad sustentabilidad`,
      ].filter(Boolean) as string[];

      console.log(`[I+D] Fetching RSS for ${queries.length} queries (sector: ${sectorHint}, focus: ${focusHint})`);

      // Fetch MORE headlines for better variety (up to 16 parallel requests)
      const rssResults = await Promise.all(
        queries.slice(0, 16).map((q) => fetchGoogleNewsRss(q, locale))
      );

      // Keep more items for AI to choose from (up to 40 headlines)
      externalRssItems = rssResults.flat().slice(0, 40);
      console.log(`[I+D] Found ${externalRssItems.length} RSS headlines for analysis`);
    }

    // Append external RSS context ONLY for I+D.
    const analysisContextFinal =
      mode === "research"
        ? `${analysisContext}\n\n## RADAR EXTERNO (I+D) — TITULARES/TENDENCIAS REALES (RSS)\nIMPORTANTE: Usar ÚNICAMENTE estos titulares como fuentes.\n\n${formatRssForContext(externalRssItems)}`
        : analysisContext;

    // =====================================================================
    // 🧠 ULTRA-PERSONALIZED SYSTEM PROMPTS - MAXIMUM BRAIN CONTEXT
    // =====================================================================
    // Extract all brain context for hyper-personalization
    const brainFactualMemory = brain?.factual_memory || {};
    const brainDynamicMemory = brain?.dynamic_memory || {};
    const brainDecisionsMemory = brain?.decisions_memory || {};
    
    // Extract specific knowledge from factual memory
    const knownProducts = (brainFactualMemory as any).productos || (brainFactualMemory as any).menu_items || [];
    const knownPrices = (brainFactualMemory as any).precios || (brainFactualMemory as any).ticket_promedio || null;
    const knownStrengths = (brainFactualMemory as any).fortalezas || [];
    const knownWeaknesses = (brainFactualMemory as any).debilidades || [];
    const knownDifferentiators = (brainFactualMemory as any).diferenciadores || [];
    const knownTargetAudience = (brainFactualMemory as any).cliente_objetivo || (brainFactualMemory as any).publico_objetivo || null;
    const knownCompetitors = (brainFactualMemory as any).competidores || [];
    const knownSeasonality = (brainFactualMemory as any).temporadas || (brainFactualMemory as any).estacionalidad || null;
    
    // Extract patterns from dynamic memory
    const pulseHistory = (brainDynamicMemory as any).pulse_history || [];
    const recentGoodEvents = (brainDynamicMemory as any).last_good_events || [];
    const recentBadEvents = (brainDynamicMemory as any).last_bad_events || [];
    const avgPulse7d = (brainDynamicMemory as any).avg_pulse_7d || null;
    
    // Extract preferences from decisions memory
    const rejectedMissionTypes = (brainDecisionsMemory as any).rejected_types || [];
    const preferredMissionTypes = (brainDecisionsMemory as any).preferred_types || [];
    const pausedMissions = (brainDecisionsMemory as any).paused_missions || [];
    const completedMissionsCount = (brainDecisionsMemory as any).completed_count || 0;
    
    // Build ultra-detailed brain context string
    const brainContextStr = `
## 🧠 CEREBRO DEL NEGOCIO (MEMORIA PROFUNDA - USAR PARA ULTRA-PERSONALIZACIÓN)

### PERFIL ESTRATÉGICO DEL NEGOCIO
- **Tipo primario de negocio**: ${brain?.primary_business_type || business.category || "negocio local"}
- **Tipo secundario**: ${brain?.secondary_business_type || "N/A"}
- **Score de confianza del Brain**: ${brain?.confidence_score || 0}% (mientras más alto, más datos tenemos)
- **Foco actual del dueño**: ${brain?.current_focus || "crecimiento"} (prioridad: ${brain?.focus_priority || 5}/10)

### MEMORIA FACTUAL (Conocimiento verificado del negocio)
- **Productos/Menú destacados**: ${Array.isArray(knownProducts) && knownProducts.length > 0 ? knownProducts.slice(0, 5).join(", ") : "Por descubrir"}
- **Ticket promedio**: ${knownPrices || "Por determinar"}
- **Fortalezas identificadas**: ${Array.isArray(knownStrengths) && knownStrengths.length > 0 ? knownStrengths.join(", ") : "Por identificar"}
- **Debilidades conocidas**: ${Array.isArray(knownWeaknesses) && knownWeaknesses.length > 0 ? knownWeaknesses.join(", ") : "Por identificar"}
- **Diferenciadores clave**: ${Array.isArray(knownDifferentiators) && knownDifferentiators.length > 0 ? knownDifferentiators.join(", ") : "Por definir"}
- **Cliente objetivo**: ${knownTargetAudience || "Por perfilar"}
- **Competidores conocidos**: ${Array.isArray(knownCompetitors) && knownCompetitors.length > 0 ? knownCompetitors.slice(0, 3).join(", ") : "Por mapear"}
- **Estacionalidad**: ${knownSeasonality || "Por analizar"}

### MEMORIA DINÁMICA (Patrones recientes de rendimiento)
- **Pulso promedio últimos 7 días**: ${avgPulse7d ? `${avgPulse7d.toFixed(1)}/5` : "Sin datos suficientes"}
- **Total check-ins en historial**: ${pulseHistory.length} registros
- **Eventos POSITIVOS recientes del dueño**: ${Array.isArray(recentGoodEvents) && recentGoodEvents.length > 0 ? recentGoodEvents.slice(0, 3).join("; ") : "Sin registrar aún"}
- **Eventos NEGATIVOS recientes del dueño**: ${Array.isArray(recentBadEvents) && recentBadEvents.length > 0 ? recentBadEvents.slice(0, 3).join("; ") : "Sin registrar aún"}
- **Misiones completadas**: ${completedMissionsCount} en total

### PREFERENCIAS DEL DUEÑO (Aprendidas de sus decisiones)
- **Tipos de insight/misión que RECHAZÓ** (EVITAR estos temas): ${Array.isArray(rejectedMissionTypes) && rejectedMissionTypes.length > 0 ? rejectedMissionTypes.join(", ") : "Ninguno registrado aún"}
- **Tipos de insight/misión preferidos**: ${Array.isArray(preferredMissionTypes) && preferredMissionTypes.length > 0 ? preferredMissionTypes.join(", ") : "Por descubrir"}
- **Misiones pausadas** (indica posible fricción con el tema): ${Array.isArray(pausedMissions) && pausedMissions.length > 0 ? pausedMissions.slice(0, 3).map((m: any) => typeof m === 'string' ? m : m.title || 'Sin título').join(", ") : "Ninguna"}

### INSTRUCCIÓN CLAVE DE PERSONALIZACIÓN
Usá TODA esta información del Brain para:
1. Priorizar insights que ALINEEN con el foco actual (${brain?.current_focus || "crecimiento"})
2. EVITAR temas similares a los rechazados: ${Array.isArray(rejectedMissionTypes) && rejectedMissionTypes.length > 0 ? rejectedMissionTypes.join(", ") : "ninguno"}
3. Considerar las fortalezas y debilidades conocidas al explicar "por qué aplica"
4. Relacionar tendencias externas con los productos/servicios específicos cuando sea posible
5. Si el pulso reciente es bajo (${avgPulse7d ? avgPulse7d.toFixed(1) : "N/A"}/5), priorizar insights de alto impacto inmediato
`;
    
    const systemPrompt = mode === "research"
      ? `Eres el motor de Radar Externo (Investigación + Desarrollo / I+D) de Vistaceo.
Sos una IA de ÉLITE con acceso TOTAL al Cerebro del Negocio. Tu misión es generar insights ULTRA-PERSONALIZADOS que sean PERFECTOS para este negocio específico.

REGLA ABSOLUTA: I+D es EXTERNO. Detecta señales fuera del negocio (mercado/plataformas/competencia/regulación/macros/tendencias globales) y las traduce a "qué podría significar para vos".

${brainContextStr}

## CONTEXTO OPERATIVO DEL NEGOCIO
- **Nombre**: ${business.name}
- **País/Ciudad**: ${business.country || "LATAM"} - ${extractCityHint(business.address) || "zona local"}
- **Modelo de servicio**: ${business.service_model || "mixto"}
- **Canales activos**: ${business.delivery_platforms?.join(", ") || "presencial"}
- **Rating promedio en plataformas**: ${business.avg_rating ? `${business.avg_rating}/5` : "Sin datos"}


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
      : `Sos el consultor más preciso del mundo. Tu cliente es ${business.name}.

## TU VOZ:
- Hablale DIRECTAMENTE al dueño usando "vos/tu" y "tu negocio"
- NUNCA uses tercera persona ("El dueño ha expresado...", "Se detectó que...")
- Usá tono conversacional, como si estuvieras charlando con el dueño
- Títulos en minúsculas naturales (NO "Optimizar La Experiencia" sino "Optimizar la experiencia")

## REGLAS DE ORO:
1. ❌ PROHIBIDO títulos genéricos tipo "Mejorar X" o "Optimizar Y"
2. ✅ OBLIGATORIO incluir DATOS CONCRETOS en cada título (%, números, días, productos)
3. ❌ PROHIBIDO hablar en tercera persona
4. ✅ Los títulos deben ser accionables y únicos
5. 📊 Máximo 3 oportunidades de alta calidad
6. 🎯 Cada oportunidad resuelve UN problema específico

## FORMATO DE TÍTULO:
Usar minúsculas naturales (como en una conversación):
"[Acción]: [dato concreto de tu negocio]"

Ejemplos CORRECTOS:
✅ "Lanzar combo de mediodía: el 85% de tus clientes viene entre 12-14hs"
✅ "Responder las 4 reseñas negativas de esta semana"
✅ "Promoción para miércoles: es tu peor día con solo 2.1/5 de tráfico"
✅ "Alianzas con la universidad cercana: el 100% de tus clientes son estudiantes"
✅ "Reels de preparación: tu producto estrella fue mencionado 8 veces"

Ejemplos INCORRECTOS (nunca usar):
❌ "El dueño ha expresado que..." (tercera persona)
❌ "Se detectó que el negocio..." (impersonal)
❌ "Mejorar La Experiencia Del Cliente" (mayúsculas incorrectas)
❌ "Optimizar Proceso de Marketing" (genérico y mayúsculas)

## DESCRIPCIÓN:
Hablale directo al dueño:
"Detectamos que [dato]. Esto significa que [oportunidad]. Si lo aplicás, [beneficio]."

NO usar: "El dueño expresó...", "Se identificó que...", "El negocio presenta..."
SÍ usar: "Vos mencionaste...", "Tus datos muestran...", "En tu negocio..."

## FORMATO DE RESPUESTA (JSON válido):
{
  "opportunities": [
    {
      "title": "Título ultra-específico con dato concreto",
      "description": "Explicación basada en evidencia real del negocio",
      "impact_score": 1-10,
      "effort_score": 1-10,
      "source": "categoría",
      "evidence": {
        "trigger": "¿Qué dato específico disparó esto?",
        "signals": ["señal 1", "señal 2"],
        "dataPoints": número_de_datos_usados,
        "basedOn": ["fuente específica"]
      }
    }
  ],
  "patterns": [],
  "lessons": []
}

## VALIDACIÓN FINAL:
Antes de devolver, pregúntate para cada oportunidad:
- ¿El título incluye un número, %, día, producto o nombre específico? Si no → REESCRIBIR
- ¿El dueño de ${business.name} entendería esto en 3 segundos? Si no → SIMPLIFICAR
- ¿Se diferencia claramente de las otras oportunidades? Si no → ELIMINAR
- ¿Está basada en datos reales del contexto? Si no → ELIMINAR`;
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

      // =====================================================================
      // 🔔 CREATE NOTIFICATION FOR NEW EXTERNAL RESEARCH INSIGHTS
      // =====================================================================
      if (learningInserted > 0) {
        await supabase.from("insight_notifications").insert({
          business_id: businessId,
          notification_type: "new_research",
          title: `${learningInserted} nuevo${learningInserted > 1 ? 's' : ''} insight${learningInserted > 1 ? 's' : ''} de I+D`,
          message: `Se detectaron ${learningInserted} tendencia${learningInserted > 1 ? 's' : ''} externa${learningInserted > 1 ? 's' : ''} relevante${learningInserted > 1 ? 's' : ''} para tu sector.`,
          insights_count: learningInserted,
          metadata: {
            notification_source: "external_research",
            analysis_type: "research",
            business_type: brain?.primary_business_type || "general",
            country: business?.country || "AR",
            created_at: new Date().toISOString(),
          },
        });
        console.log(`Created notification for ${learningInserted} new research insights`);
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
        // Gate 4: Ultra-strict title specificity check
        if (isTitleTooGeneric(opp.title)) {
          console.log(`Filtered by title specificity: "${opp.title}"`);
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

      // =====================================================================
      // 🔔 CREATE NOTIFICATION FOR NEW INTERNAL OPPORTUNITIES
      // =====================================================================
      if (opportunitiesInserted > 0) {
        await supabase.from("insight_notifications").insert({
          business_id: businessId,
          notification_type: "new_opportunities",
          title: `${opportunitiesInserted} nueva${opportunitiesInserted > 1 ? 's' : ''} oportunidad${opportunitiesInserted > 1 ? 'es' : ''} detectada${opportunitiesInserted > 1 ? 's' : ''}`,
          message: `El análisis inteligente encontró ${opportunitiesInserted} oportunidad${opportunitiesInserted > 1 ? 'es' : ''} basada${opportunitiesInserted > 1 ? 's' : ''} en los datos de tu negocio.`,
          insights_count: opportunitiesInserted,
          metadata: {
            notification_source: "internal_analysis",
            analysis_type: "opportunities",
            business_focus: brain?.current_focus || "ventas",
            brain_confidence: brain?.confidence_score || 0,
            created_at: new Date().toISOString(),
          },
        });
        console.log(`Created notification for ${opportunitiesInserted} new opportunities`);
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
