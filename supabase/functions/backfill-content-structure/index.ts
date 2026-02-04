import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Backfill Content Structure
 * 
 * Enhances existing blog posts with missing SEO structure sections:
 * - ## Errores comunes y cómo evitarlos
 * - ## Mini ejercicio de 5 minutos
 * - ## Autoevaluación rápida
 * - ## Plantilla copiar y pegar
 * - ## Para quién es y para quién no
 */

interface EnhancementResult {
  slug: string;
  status: 'enhanced' | 'skipped' | 'failed';
  sections_added: string[];
  error?: string;
}

// Check which sections are missing
function getMissingSections(content: string): string[] {
  const missing: string[] = [];
  
  if (!content.includes('## Errores comunes')) {
    missing.push('errores_comunes');
  }
  if (!content.includes('## Mini ejercicio') && !content.includes('ejercicio de 5 minutos')) {
    missing.push('mini_ejercicio');
  }
  if (!content.includes('## Autoevaluación') && !content.includes('autoevaluación rápida')) {
    missing.push('autoevaluacion');
  }
  if (!content.includes('## Plantilla') && !content.includes('copiar y pegar')) {
    missing.push('plantilla');
  }
  if (!content.includes('## Para quién es')) {
    missing.push('para_quien');
  }
  
  return missing;
}

// Generate missing sections based on post topic
function generateMissingSections(
  title: string,
  category: string,
  missing: string[]
): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Get topic context from title
  const topic = title.toLowerCase();
  
  if (missing.includes('errores_comunes')) {
    sections['errores_comunes'] = `

## Errores comunes y cómo evitarlos

Antes de avanzar, revisá si estás cayendo en alguno de estos errores frecuentes:

1. **Empezar sin un objetivo claro**: Definí exactamente qué querés lograr antes de actuar.

2. **Querer hacer todo al mismo tiempo**: Priorizá las acciones de mayor impacto y avanzá paso a paso.

3. **No medir resultados**: Sin métricas, no podés saber si estás mejorando.

4. **Copiar sin adaptar**: Lo que funciona para otros puede no funcionar para tu contexto específico.

5. **Abandonar demasiado pronto**: Los resultados llevan tiempo. Dale al menos 30 días antes de evaluar.

`;
  }
  
  if (missing.includes('mini_ejercicio')) {
    sections['mini_ejercicio'] = `

## Mini ejercicio de 5 minutos

Tomá 5 minutos ahora mismo para aplicar lo que aprendiste:

**Paso 1** (1 min): Anotá cuál es tu mayor desafío actual relacionado con este tema.

**Paso 2** (2 min): De todo lo que leíste, elegí UNA sola acción que podrías implementar mañana.

**Paso 3** (2 min): Escribí exactamente cuándo y cómo vas a hacerlo.

> 💡 **Tip**: Compartí tu compromiso con alguien de tu equipo o escribilo en un lugar visible. Esto aumenta las probabilidades de que lo hagas.

`;
  }
  
  if (missing.includes('autoevaluacion')) {
    sections['autoevaluacion'] = `

## Autoevaluación rápida

Respondé estas preguntas para saber dónde estás parado:

1. ¿Tenés un proceso documentado para esto en tu negocio? (Sí / No / A medias)

2. ¿Tu equipo sabe exactamente qué hacer sin que vos estés encima? (Sí / No / A veces)

3. ¿Medís regularmente los resultados de esta área? (Sí / No / De vez en cuando)

4. ¿Hiciste alguna mejora en este aspecto en los últimos 3 meses? (Sí / No)

5. ¿Tenés claro cuál es el próximo paso a dar? (Sí / No)

**Interpretación:**
- **4-5 "Sí"**: Vas muy bien. Enfocate en optimizar y escalar.
- **2-3 "Sí"**: Tenés bases, pero hay oportunidades de mejora importantes.
- **0-1 "Sí"**: Este es un área prioritaria para trabajar. Empezá por lo básico.

`;
  }
  
  if (missing.includes('plantilla')) {
    sections['plantilla'] = `

## Plantilla copiar y pegar

Usá esta plantilla para arrancar:

---

**[NOMBRE DE TU NEGOCIO] - Plan de Acción**

**Fecha:** _______________

**Objetivo principal:** 
_________________________________

**Métrica de éxito:**
_________________________________

**Acciones concretas (próximos 7 días):**
1. _______________
2. _______________
3. _______________

**Responsable:** _______________

**Revisión programada:** _______________

---

> Copiá esto en un doc o imprimilo. Completarlo te va a llevar 3 minutos y te da claridad inmediata.

`;
  }
  
  if (missing.includes('para_quien')) {
    sections['para_quien'] = `

## Para quién es y para quién no

**✅ Este artículo es para vos si:**
- Liderás un negocio o equipo y querés mejorar resultados
- Buscás información práctica y aplicable, no solo teoría
- Estás dispuesto/a a implementar cambios paso a paso

**❌ Probablemente no te sirva si:**
- Buscás soluciones mágicas o resultados inmediatos sin esfuerzo
- No tenés ningún control sobre los procesos de tu organización
- Ya sos experto/a en el tema y buscás contenido muy avanzado

`;
  }
  
  return sections;
}

// Insert sections into the content at appropriate positions
function insertSectionsIntoContent(content: string, sections: Record<string, string>): string {
  let enhancedContent = content;
  
  // Find the FAQ section or the end of the content to insert before
  const faqMatch = enhancedContent.match(/## Preguntas frecuentes|## FAQ/i);
  const insertPosition = faqMatch 
    ? enhancedContent.indexOf(faqMatch[0])
    : enhancedContent.length;
  
  // Build the sections to insert (in order)
  const orderedKeys = ['para_quien', 'errores_comunes', 'mini_ejercicio', 'autoevaluacion', 'plantilla'];
  let sectionsToInsert = '';
  
  for (const key of orderedKeys) {
    if (sections[key]) {
      sectionsToInsert += sections[key];
    }
  }
  
  // Insert before FAQ if exists, otherwise at the end
  if (faqMatch) {
    enhancedContent = 
      enhancedContent.slice(0, insertPosition) + 
      sectionsToInsert + '\n' +
      enhancedContent.slice(insertPosition);
  } else {
    enhancedContent += sectionsToInsert;
  }
  
  return enhancedContent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { 
      mode = 'analyze',
      limit = 10,
      post_id,
      dry_run = false 
    } = await req.json().catch(() => ({}));

    console.log(`[backfill-content] Starting (mode: ${mode}, limit: ${limit})`);

    // MODE: analyze - Check what needs enhancement
    if (mode === 'analyze') {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content_md, category')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const analysis = (posts || []).map(post => {
        const missing = getMissingSections(post.content_md || '');
        return {
          slug: post.slug,
          title: post.title,
          category: post.category,
          missing_sections: missing,
          needs_enhancement: missing.length > 0,
          sections_count: 5 - missing.length,
        };
      });
      
      return new Response(JSON.stringify({
        success: true,
        total: analysis.length,
        needs_work: analysis.filter(p => p.needs_enhancement).length,
        fully_complete: analysis.filter(p => !p.needs_enhancement).length,
        analysis: analysis.sort((a, b) => b.missing_sections.length - a.missing_sections.length),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // MODE: enhance_single - Enhance a specific post
    if (mode === 'enhance_single' && post_id) {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', post_id)
        .single();
      
      if (error) throw error;
      if (!post) throw new Error('Post not found');
      
      const missing = getMissingSections(post.content_md || '');
      
      if (missing.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          slug: post.slug,
          status: 'skipped',
          message: 'Post already has all required sections',
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      const sections = generateMissingSections(post.title, post.category || '', missing);
      const enhancedContent = insertSectionsIntoContent(post.content_md, sections);
      
      if (dry_run) {
        return new Response(JSON.stringify({
          success: true,
          slug: post.slug,
          status: 'dry_run',
          sections_to_add: missing,
          preview_length: enhancedContent.length,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ 
          content_md: enhancedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);
      
      if (updateError) throw updateError;
      
      return new Response(JSON.stringify({
        success: true,
        slug: post.slug,
        status: 'enhanced',
        sections_added: missing,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // MODE: enhance_all - Enhance all posts that need it
    if (mode === 'enhance_all') {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      const results: EnhancementResult[] = [];
      
      for (const post of posts || []) {
        console.log(`[backfill-content] Processing: ${post.slug}`);
        
        try {
          const missing = getMissingSections(post.content_md || '');
          
          if (missing.length === 0) {
            results.push({ slug: post.slug, status: 'skipped', sections_added: [] });
            continue;
          }
          
          if (dry_run) {
            results.push({ slug: post.slug, status: 'enhanced', sections_added: missing });
            continue;
          }
          
          const sections = generateMissingSections(post.title, post.category || '', missing);
          const enhancedContent = insertSectionsIntoContent(post.content_md, sections);
          
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ 
              content_md: enhancedContent,
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id);
          
          if (updateError) {
            results.push({ slug: post.slug, status: 'failed', sections_added: [], error: updateError.message });
          } else {
            results.push({ slug: post.slug, status: 'enhanced', sections_added: missing });
          }
          
          // Small delay between updates
          await new Promise(r => setTimeout(r, 200));
          
        } catch (err) {
          results.push({ slug: post.slug, status: 'failed', sections_added: [], error: String(err) });
        }
      }
      
      const summary = {
        total: results.length,
        enhanced: results.filter(r => r.status === 'enhanced').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        failed: results.filter(r => r.status === 'failed').length,
      };
      
      console.log(`[backfill-content] Complete:`, summary);
      
      return new Response(JSON.stringify({
        success: true,
        dry_run,
        summary,
        results,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    throw new Error('Invalid mode. Use: analyze, enhance_single, enhance_all');
    
  } catch (error) {
    console.error('[backfill-content] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
