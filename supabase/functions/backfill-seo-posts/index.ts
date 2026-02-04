import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping from pillars to blog clusters (12 categories) - PRIMARY mapping
const PILLAR_TO_CLUSTER: Record<string, string> = {
  'empleo': 'empleo-habilidades',
  'ia_aplicada': 'ia-para-pymes',
  'liderazgo': 'liderazgo-management',
  'servicios': 'servicios-profesionales-rentabilidad',
  'emprender': 'estrategia-latam',
  'tendencias': 'tendencias-ia-tech',
};

// More specific keyword patterns for cluster refinement
const CLUSTER_PATTERNS: Record<string, RegExp> = {
  'empleo-habilidades': /empleo|trabajo como buscar|carrera profesional|cv |currículum|entrevista laboral|contratar|búsqueda de empleo|recrut|talento humano|rrhh|recursos humanos|reconvertir/i,
  'ia-para-pymes': /inteligencia artificial para|ia aplicada|ai para empresas|machine learning|automatización con ia|chatbot|agente de ia|llm|gpt para|modelo de ia|automatizar tareas/i,
  'servicios-profesionales-rentabilidad': /consultor|agencia|profesional independiente|honorarios|facturar|rentabilidad de servicios|firma|despacho|estudio contable/i,
  'marketing-crecimiento': /marketing digital|seo para|google ads|publicidad online|redes sociales|growth hack|crecimiento orgánico|leads|conversión|funnel/i,
  'finanzas-cashflow': /finanzas pyme|flujo de caja|cashflow|inversión para|costos fijos|pricing|rentabilidad financiera|presupuesto|capital de trabajo|margen/i,
  'operaciones-procesos': /operaciones|procesos de negocio|eficiencia operativa|workflow|gestión operativa|lean|kaizen|mejora continua|supply chain/i,
  'ventas-negociacion': /ventas b2b|vender más|negociación comercial|cierre de ventas|prospección|comercial|pipeline|propuesta comercial|objeciones/i,
  'liderazgo-management': /liderazgo|gestión de equipos|management|toma de decisiones|cultura organizacional|motivar equipos|delegar|ceo|director|gerente/i,
  'estrategia-latam': /latinoamérica|estrategia regional|internacionalización|expansión|mercado latam|emprender en|startup/i,
  'herramientas-productividad': /herramientas para|app de productividad|software para pymes|notion|slack|asana|trello|zapier|integración/i,
  'data-analytics': /data driven|análisis de datos|analytics|métricas de negocio|kpi|dashboard|reportes|medición|bi |business intelligence/i,
  'tendencias-ia-tech': /tendencias? 202[4-9]|futuro del trabajo|innovación tecnológica|disrupción|tecnología emergente|transformación digital/i,
};

// Smart cluster detection - prioritizes pillar mapping, then content analysis
function detectClusterFromContent(title: string, content: string, currentPillar: string): string {
  // FIRST: Use direct pillar mapping if available
  if (currentPillar && PILLAR_TO_CLUSTER[currentPillar]) {
    const defaultCluster = PILLAR_TO_CLUSTER[currentPillar];
    
    // Check if content strongly matches a more specific cluster
    const text = `${title} ${content}`.toLowerCase();
    
    // Only override if there's a strong specific pattern match
    for (const [cluster, pattern] of Object.entries(CLUSTER_PATTERNS)) {
      if (pattern.test(text)) {
        // Count how specific the match is
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          // If strong match to a cluster different from default, use it
          // But only if it makes sense given the pillar
          const pillarRelatedClusters: Record<string, string[]> = {
            'empleo': ['empleo-habilidades'],
            'ia_aplicada': ['ia-para-pymes', 'tendencias-ia-tech', 'herramientas-productividad', 'operaciones-procesos'],
            'liderazgo': ['liderazgo-management', 'estrategia-latam'],
            'servicios': ['servicios-profesionales-rentabilidad', 'finanzas-cashflow', 'ventas-negociacion'],
            'emprender': ['estrategia-latam', 'marketing-crecimiento', 'finanzas-cashflow'],
            'tendencias': ['tendencias-ia-tech', 'data-analytics', 'herramientas-productividad'],
          };
          
          const allowedClusters = pillarRelatedClusters[currentPillar] || [defaultCluster];
          if (allowedClusters.includes(cluster)) {
            return cluster;
          }
        }
      }
    }
    
    return defaultCluster;
  }
  
  // Fallback: use content analysis
  const text = `${title} ${content}`.toLowerCase();
  for (const [cluster, pattern] of Object.entries(CLUSTER_PATTERNS)) {
    if (pattern.test(text)) {
      return cluster;
    }
  }
  
  return 'tendencias-ia-tech';
}

// Generate keyphrase from title - keep it meaningful and complete
function generateKeyphrase(title: string): string {
  // Clean up title but keep it mostly intact
  const cleaned = title.toLowerCase()
    .replace(/[¿?¡!:()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If title is short enough, use it as is
  if (cleaned.length <= 50) {
    return cleaned;
  }
  
  // Otherwise, extract the most important part
  const stopWords = ['que', 'para', 'por', 'con', 'sin', 'los', 'las', 'del', 'una', 'uno', 'cómo', 'qué', 'más', 'son', 'hay', 'van', 'el', 'la', 'en', 'de', 'y', 'a'];
  const words = cleaned.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));
  
  // Take the most meaningful 4-6 words
  return words.slice(0, 6).join(' ');
}

// Generate secondary keywords
function generateSecondaryKeywords(title: string, content: string, cluster: string): string[] {
  const keywords: string[] = [];
  const text = `${title} ${content}`.toLowerCase();
  
  // Extract important terms (2-3 word phrases)
  const phrases = text.match(/\b[a-záéíóúñü]{4,}\s+[a-záéíóúñü]{4,}/g) || [];
  const uniquePhrases = [...new Set(phrases)];
  keywords.push(...uniquePhrases.slice(0, 8));
  
  // Add cluster-specific keywords
  const clusterKeywords: Record<string, string[]> = {
    'empleo-habilidades': ['búsqueda de empleo', 'desarrollo profesional', 'habilidades laborales', 'mercado laboral'],
    'ia-para-pymes': ['inteligencia artificial', 'automatización', 'herramientas ia', 'productividad'],
    'servicios-profesionales-rentabilidad': ['rentabilidad servicios', 'gestión clientes', 'pricing'],
    'marketing-crecimiento': ['marketing digital', 'crecimiento', 'leads', 'conversión'],
    'finanzas-cashflow': ['flujo de caja', 'gestión financiera', 'costos', 'presupuesto'],
    'operaciones-procesos': ['procesos', 'eficiencia', 'operaciones', 'automatización'],
    'ventas-negociacion': ['ventas', 'negociación', 'cierre', 'clientes'],
    'liderazgo-management': ['liderazgo', 'gestión de equipos', 'toma de decisiones', 'cultura'],
    'estrategia-latam': ['latinoamérica', 'estrategia', 'mercados', 'expansión'],
    'herramientas-productividad': ['herramientas', 'productividad', 'software', 'apps'],
    'data-analytics': ['datos', 'analytics', 'métricas', 'kpis'],
    'tendencias-ia-tech': ['tendencias', 'tecnología', 'innovación', 'futuro'],
  };
  
  keywords.push(...(clusterKeywords[cluster] || []));
  
  return [...new Set(keywords)].slice(0, 12);
}

// PROMPT MAESTRO - Generate optimized content structure
function buildPromptMaestro(post: any, cluster: string): string {
  const keyphrase = post.primary_keyword || generateKeyphrase(post.title);
  
  return `
PROMPT MAESTRO — VISTACEO BLOG (SEO + HUMAN READABILITY) — MODO REWRITE

Rol:
Sos el/la Editor/a Jefe + Especialista SEO del blog de VistaCEO.
Tu objetivo es reescribir esta nota para que:
1) Se lea ultra humana, clara y escaneable
2) Markdown perfecto sin caracteres raros
3) SEO fuerte sin keyword stuffing

DATOS DE ENTRADA:
- MODO: "REWRITE"
- TITULO_OBJETIVO: "${post.title}"
- FRASE_CLAVE_PRINCIPAL: "${keyphrase}"
- CATEGORIA: "${cluster}"
- BORRADOR_MD: El contenido actual necesita reescritura completa

REGLAS CRÍTICAS:

1. SEO (estilo Yoast):
La FRASE_CLAVE_PRINCIPAL "${keyphrase}" debe aparecer en:
- H1/título (natural)
- Primer párrafo (natural)
- 1 H2 (natural)
- ALT de 1 imagen
- Meta description

2. Estructura obligatoria:
- Intro 70-110 palabras con hook + promesa
- Bloque "## En 2 minutos" (5 bullets concretos)
- Bloque "## Para quién es y para quién no"
- H2 obligatorios:
  - Por qué importa ahora (LATAM)
  - Qué cambia en la práctica (ejemplo real)
  - Cómo empezar hoy (paso a paso)
  - Checklist rápida
  - Mini ejercicio de 5 minutos
  - Autoevaluación rápida (3-5 preguntas)
  - Plantilla copiar y pegar
  - Errores comunes y cómo evitarlos
  - Preguntas frecuentes (FAQ 4-7 preguntas)

3. Legibilidad:
- Párrafos de 1-3 frases máximo
- Listas de 7-12 items max
- Espacio antes/después de cada H2
- Sin "--- ##" ni headings en medio de párrafos

4. Links:
- 3-6 internos (cluster + pilares)
- 2-4 externos (fuentes confiables)

5. CTA VistaCEO:
- 1 mención natural en cierre
- Conectar al beneficio del tema

Genera el contenido completo en Markdown limpio.
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { mode = 'analyze', limit = 5, post_id } = await req.json().catch(() => ({}));
    
    // MODE: analyze - Check what needs to be fixed
    if (mode === 'analyze') {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, pillar, category, primary_keyword, secondary_keywords, content_md, hero_image_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const analysis = (posts || []).map(post => {
        const hasKeyphrase = !!post.primary_keyword;
        const hasSecondaryKw = post.secondary_keywords && post.secondary_keywords.length > 0;
        const hasCluster = !!post.category;
        const hasImage = !!post.hero_image_url && !post.hero_image_url.startsWith('data:');
        const hasEn2Min = post.content_md?.includes('## En 2 minutos');
        const hasFaq = /##.*preguntas frecuentes|##.*faq/i.test(post.content_md || '');
        const hasChecklist = /##.*checklist/i.test(post.content_md || '');
        
        const detectedCluster = detectClusterFromContent(post.title, post.content_md || '', post.pillar || '');
        
        return {
          slug: post.slug,
          title: post.title,
          current_pillar: post.pillar,
          current_category: post.category,
          detected_cluster: detectedCluster,
          needs_seo: !hasKeyphrase || !hasSecondaryKw,
          needs_cluster: !hasCluster || post.category !== detectedCluster,
          needs_image: !hasImage,
          needs_structure: !hasEn2Min || !hasFaq || !hasChecklist,
          score: (hasKeyphrase ? 20 : 0) + (hasSecondaryKw ? 15 : 0) + (hasCluster ? 15 : 0) + 
                 (hasImage ? 20 : 0) + (hasEn2Min ? 10 : 0) + (hasFaq ? 10 : 0) + (hasChecklist ? 10 : 0),
        };
      });
      
      return new Response(JSON.stringify({
        success: true,
        total: analysis.length,
        needs_work: analysis.filter(p => p.score < 80).length,
        analysis: analysis.sort((a, b) => a.score - b.score),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // MODE: fix_single - Fix a specific post
    if (mode === 'fix_single' && post_id) {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', post_id)
        .single();
      
      if (error) throw error;
      if (!post) throw new Error('Post not found');
      
      console.log(`[backfill-seo] Processing: ${post.slug}`);
      
      // Detect best cluster
      const cluster = detectClusterFromContent(post.title, post.content_md || '', post.pillar || '');
      
      // ALWAYS regenerate keyphrase from title (don't use truncated existing ones)
      const keyphrase = generateKeyphrase(post.title);
      
      // Generate secondary keywords
      const secondaryKw = generateSecondaryKeywords(post.title, post.content_md || '', cluster);
      
      // Generate optimized meta - keep title complete
      const metaTitle = `${post.title} | VistaCEO Blog`;
      const metaDesc = post.meta_description || 
        `${post.excerpt || post.title}. Guía práctica para negocios en LATAM con checklist y plantillas.`;
      
      // Update the post with SEO fields (no truncation on primary_keyword)
      const updates: Record<string, any> = {
        category: cluster,
        primary_keyword: keyphrase,
        secondary_keywords: secondaryKw,
        meta_title: metaTitle.slice(0, 65),
        meta_description: metaDesc.slice(0, 160),
        canonical_url: `https://blog.vistaceo.com/${post.slug}/`,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', post.id);
      
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({
        success: true,
        post_id: post.id,
        slug: post.slug,
        updates,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // MODE: fix_all - Fix all posts that need work
    if (mode === 'fix_all') {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      const results: any[] = [];
      
      for (const post of posts || []) {
        console.log(`[backfill-seo] Processing: ${post.slug}`);
        
        try {
          const cluster = detectClusterFromContent(post.title, post.content_md || '', post.pillar || '');
          // ALWAYS regenerate keyphrase from title
          const keyphrase = generateKeyphrase(post.title);
          const secondaryKw = generateSecondaryKeywords(post.title, post.content_md || '', cluster);
          
          const metaTitle = `${post.title} | VistaCEO Blog`;
          const metaDesc = post.meta_description || 
            `${post.excerpt || post.title}. Guía práctica para negocios en LATAM.`;
          
          const updates: Record<string, any> = {
            category: cluster,
            primary_keyword: keyphrase,
            secondary_keywords: secondaryKw,
            meta_title: metaTitle.slice(0, 65),
            meta_description: metaDesc.slice(0, 160),
            canonical_url: `https://blog.vistaceo.com/${post.slug}/`,
            updated_at: new Date().toISOString(),
          };
          
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update(updates)
            .eq('id', post.id);
          
          if (updateError) {
            results.push({ slug: post.slug, status: 'error', error: updateError.message });
          } else {
            results.push({ slug: post.slug, status: 'updated', cluster, keyphrase });
          }
          
          // Rate limit
          await new Promise(r => setTimeout(r, 500));
          
        } catch (err) {
          results.push({ slug: post.slug, status: 'error', error: String(err) });
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    throw new Error('Invalid mode. Use: analyze, fix_single, fix_all');
    
  } catch (error) {
    console.error('[backfill-seo] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
