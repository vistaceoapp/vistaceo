import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * BLOG IMPROVE POST - Mejora la escritura de notas existentes
 * Aplica el Prompt Maestro V3 completo a notas existentes
 */

const IMPROVE_PROMPT = `Sos Editor Senior del blog de VistaCEO para LATAM. Tu trabajo es reescribir una nota existente para que sea ULTRA LEGIBLE y HUMANA.

PROBLEMA PRINCIPAL A RESOLVER:
El markdown actual NO SE RENDERIZA bien. El lector ve símbolos crudos como:
- **texto** literal en vez de negrita
- Links como (https://...) que no son clicables
- Listas con - que no se formatean
- Símbolos raros, mucho ** y __ visible

TU MISIÓN: Reescribir para que el HTML renderizado sea HERMOSO y PROFESIONAL.

REGLAS CRÍTICAS DE ESCRITURA:

1) FORMATO MARKDOWN CORRECTO:
   - **Negrita**: usar **texto** correctamente (no abusar)
   - Links: SIEMPRE usar formato [texto descriptivo](url)
   - NO poner URLs sueltas - siempre dentro de [](url)
   - Listas: usar - con espacio, NO bullets unicode
   - Separadores: usar --- solo entre secciones principales

2) ESTRUCTURA OBLIGATORIA (en este orden):
   - Párrafo intro potente (2-3 oraciones)
   - ## En 2 minutos (resumen con bullets concisos)
   - ## Por qué esto importa (conectar con dolor real)
   - [Secciones H2 temáticas del contenido]
   - ## Checklist (5-7 items con - [ ])
   - ## Plantilla (formato simple, rellenable)
   - ## Para quién es y para quién no (✅ y ❌)
   - ## Errores comunes (5 errores numerados)
   - ## Mini ejercicio (3 pasos simples)
   - ## Autoevaluación rápida (5 preguntas Sí/No)
   - ## Preguntas frecuentes (4-5 FAQs)
   - ## Próximos pasos (3 acciones concretas)
   - ## Para profundizar (3-5 links externos útiles)

3) FORMATO FAQs - CRÍTICO:
   - Cada pregunta como ### ¿Pregunta aquí?
   - Respuesta breve debajo (2-3 oraciones)
   - NO usar ## para cada FAQ

4) LINKS EXTERNOS - MUY IMPORTANTE:
   - Formato: [Nombre del recurso](https://url-completa.com)
   - NUNCA dejar URLs sueltas
   - Incluir descripción breve de cada recurso
   - Usar fuentes confiables (Google, MIT, Harvard, etc.)
   
5) LEGIBILIDAD MÁXIMA:
   - Párrafos de 1-2 oraciones MÁXIMO
   - Mucho aire entre secciones
   - Una idea por párrafo
   - Evitar bloques de texto largos
   - Usar subtítulos (###) para dividir contenido largo

6) EJEMPLOS LATAM (3-5 obligatorios):
   > **Ejemplo:** [Situación en país LATAM]
   >
   > **Acción:** [Qué hacer]
   >
   > **Error típico:** [Qué evitar]

7) TONO HUMANO:
   - Español LATAM neutral
   - Profesional pero cálido
   - Directo, sin rodeos
   - Máximo 1 emoji por sección
   - NO usar "te invito", "en este artículo"
   - NO inventar estadísticas

FORMATO DE SALIDA:
- Solo el contenido markdown limpio
- Sin H1 (el título ya existe)
- Sin frontmatter
- Sin explicaciones
- Empezá con el párrafo intro`;


async function improvePost(
  postId: string,
  title: string,
  currentContent: string,
  category: string,
  primaryKeyword: string,
  lovableApiKey: string
): Promise<string> {
  const context = `
NOTA A MEJORAR:
- Título: ${title}
- Categoría: ${category}
- Keyword principal: ${primaryKeyword}

CONTENIDO ACTUAL:
${currentContent}

INSTRUCCIONES:
1. Mantené el contenido valioso que ya existe
2. Agregá las secciones faltantes del Prompt Maestro V3
3. Mejorá la legibilidad (párrafos cortos, aire visual)
4. Asegurate de que las FAQs usen ### para cada pregunta
5. Agregá la sección "## Por qué esto importa" si falta
6. Verificá que haya al menos 3 ejemplos LATAM con el formato correcto
7. Mantené un tono profesional y directo
`;

  console.log(`[blog-improve-post] Calling AI for post: ${postId}`);

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: IMPROVE_PROMPT },
        { role: 'user', content: context }
      ],
      max_tokens: 8000,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[blog-improve-post] AI generation failed:', errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const result = await response.json();
  let text = result.choices?.[0]?.message?.content || '';

  // Clean any markdown artifacts
  text = text.trim();
  text = text.replace(/^```markdown\n?/i, '');
  text = text.replace(/\n?```$/i, '');
  text = text.replace(/^---\n[\s\S]*?\n---\n?/m, ''); // Remove frontmatter if present

  return text;
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
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { post_id, dry_run = false } = await req.json().catch(() => ({}));

    if (!post_id) {
      // If no post_id, return list of posts that need improvement
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, category, status')
        .eq('status', 'published')
        .order('publish_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        posts: posts?.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category
        }))
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('[blog-improve-post] Processing post:', post_id);

    // Get the post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Post not found'
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Improve the content
    const improvedContent = await improvePost(
      post.id,
      post.title,
      post.content_md,
      post.category || 'general',
      post.primary_keyword || post.title,
      lovableApiKey
    );

    if (dry_run) {
      // Return preview without saving
      return new Response(JSON.stringify({
        success: true,
        dry_run: true,
        post_id: post.id,
        title: post.title,
        original_length: post.content_md.length,
        improved_length: improvedContent.length,
        improved_content: improvedContent
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Update the post
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        content_md: improvedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', post_id);

    if (updateError) {
      throw updateError;
    }

    console.log('[blog-improve-post] Post updated successfully:', post_id);

    return new Response(JSON.stringify({
      success: true,
      post_id: post.id,
      title: post.title,
      original_length: post.content_md.length,
      improved_length: improvedContent.length
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[blog-improve-post] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
