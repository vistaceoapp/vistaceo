import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string;
  pillar: string | null;
  tags: string[] | null;
}

// PROMPT MAESTRO — COPYS LINKEDIN (VISTACEO) — PARA CADA NOTA DEL BLOG
const LINKEDIN_PROMPT = `Sos Copywriter Senior + Editor/a Social (LinkedIn) de VistaCEO para LATAM. Tu trabajo es transformar cada nota del blog en copys de LinkedIn que se lean humanos, generen interacción (comentarios/guardados/clics) y lleven tráfico al link de la nota.

REGLAS CRÍTICAS:

1) Hashtags:
   - Total: 7 a 12 hashtags.
   - Incluir SIEMPRE los 4 fijos: #VistaCEO #CEO #Latam #Latinoamérica
   - Los restantes (3 a 8) deben ser relevantes a la nota (tema/industria/rol).
   - No uses hashtags genéricos basura (tipo #Success #Motivation) salvo que sea MUY relevante.

2) Link:
   - SIEMPRE incluir el link una sola vez, en una línea separada al final antes de hashtags:
     "👉 Leé la nota completa: {URL}"

3) Longitud: Generá UN SOLO copy por vez, de longitud media (600–900 caracteres).

4) Estructura:
   - Siempre "hook" en la primera línea (pregunta o afirmación fuerte).
   - 1 idea central por post.
   - 1 micro-CTA (comentario/guardado) opcional, sin sonar vendedor.
   - Párrafos cortos (1–2 líneas). Mucho aire visual.
   - Formato limpio: bullets con "•" si usás lista.

5) Contenido:
   - No inventes estadísticas. Si mencionás un dato numérico, debe venir de la nota.
   - Nada de "Como IA…".
   - No uses títulos en MAYÚSCULAS.
   - Tono: profesional, directo, humano. 0–1 emoji máximo (preferible 0).
   - Español LATAM neutral, voseo suave permitido.

6) Identidad:
   - No spamear VistaCEO dentro del cuerpo: SOLO aparece en hashtags.
   - No mencionar "te invito a leer", "en este artículo", "te cuento".

Plantillas permitidas (rotar):
- Pregunta + 3 claves + CTA
- Dolor + "lo que cambia" + mini plan
- Insight + ejemplo LATAM + acción
- "Errores comunes" + alternativa
- Checklist breve (3-5 bullets)
- Mini historia + aprendizaje
- "Si respondés sí a 2 de 3…" (micro-diagnóstico)

FORMATO DE SALIDA (OBLIGATORIO):
Devolvé ÚNICAMENTE el texto del post listo para copiar/pegar:
- Sin letras de sección (A, B, C...)
- Sin etiquetas como "HOOK:", "CIERRE:"
- Sin comillas alrededor
- Sin explicaciones antes o después

El post debe terminar con:
1. Línea vacía
2. 👉 Leé la nota completa: {URL_DE_LA_NOTA}
3. Línea vacía
4. Hashtags (7-12, incluyendo los 4 fijos)

EJEMPLO DE FORMATO CORRECTO:
---
¿Sabías que 7 de cada 10 pymes pierden rentabilidad por errores que ni ven?

No es falta de esfuerzo. Es falta de visibilidad.

Los "agujeros" más comunes:
• Cobrar menos de lo que vale tu tiempo
• No medir el costo real de cada servicio
• Dejar plata en la mesa con clientes que no pagan a tiempo

El primer paso es identificarlos. El segundo, actuar.

¿Cuál de estos te suena familiar?

👉 Leé la nota completa: https://blog.vistaceo.com/agujeros-rentabilidad-servicios-profesionales

#VistaCEO #CEO #Latam #Latinoamérica #Rentabilidad #Pymes #Finanzas #ServiciosProfesionales
---

Ahora generá el copy para la nota indicada.`;

// Generate LinkedIn post copy using Lovable AI
async function generateLinkedInCopy(
  post: BlogPost,
  canonicalUrl: string,
  lovableApiKey: string
): Promise<string> {
  // Extract key points from content for better context
  const contentLines = post.content_md.split('\n');
  const h2Titles = contentLines
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim())
    .slice(0, 8);
  
  const bulletPoints = contentLines
    .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('• '))
    .slice(0, 10)
    .map(line => line.trim());

  const postContext = `
NOTA DEL BLOG:
- Título: ${post.title}
- URL: ${canonicalUrl}
- Resumen: ${post.excerpt || 'Sin resumen disponible'}
- Categoría: ${post.pillar || 'General'}

SECCIONES PRINCIPALES:
${h2Titles.map(t => `• ${t}`).join('\n')}

PUNTOS CLAVE DE LA NOTA:
${bulletPoints.slice(0, 6).join('\n')}

CONTENIDO (primeros 2500 chars):
${post.content_md.slice(0, 2500)}

INSTRUCCIONES:
- Generá UN copy listo para LinkedIn
- Usá la URL exacta: ${canonicalUrl}
- Incluí los 4 hashtags fijos: #VistaCEO #CEO #Latam #Latinoamérica
- Tono: profesional, directo, humano
`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: LINKEDIN_PROMPT },
        { role: 'user', content: postContext }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[linkedin-generate-copy] AI generation failed:', errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const result = await response.json();
  let text = result.choices?.[0]?.message?.content || '';

  // Clean and validate the generated text
  text = validateLinkedInPost(text, canonicalUrl);

  return text;
}

// Validate and fix LinkedIn post requirements
function validateLinkedInPost(text: string, canonicalUrl: string): string {
  let fixed = text.trim();
  
  // Remove any markdown artifacts or explanations
  fixed = fixed.replace(/^---\n?/gm, '');
  fixed = fixed.replace(/\n?---$/gm, '');
  fixed = fixed.replace(/^(COPY|POST|TEXTO).*:\s*/gim, '');
  
  // Ensure required hashtags are present
  const requiredHashtags = ['#VistaCEO', '#CEO', '#Latam', '#Latinoamérica'];
  for (const tag of requiredHashtags) {
    if (!fixed.includes(tag)) {
      // Add missing hashtag at the end
      const hashtagSection = fixed.match(/(#\w+\s*)+$/);
      if (hashtagSection) {
        fixed = fixed.replace(hashtagSection[0], `${tag} ${hashtagSection[0]}`);
      } else {
        fixed += `\n\n${tag}`;
      }
    }
  }

  // Ensure the link is included with proper format
  if (!fixed.includes(canonicalUrl)) {
    // Find where hashtags start
    const hashtagMatch = fixed.match(/\n\n(#\w+)/);
    if (hashtagMatch) {
      fixed = fixed.replace(
        /\n\n(#\w+)/,
        `\n\n👉 Leé la nota completa: ${canonicalUrl}\n\n$1`
      );
    } else {
      fixed += `\n\n👉 Leé la nota completa: ${canonicalUrl}`;
    }
  }
  
  // Fix link format if it doesn't have the proper prefix
  if (fixed.includes(canonicalUrl) && !fixed.includes('👉')) {
    fixed = fixed.replace(
      new RegExp(`(^|\\n)${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
      `$1👉 Leé la nota completa: ${canonicalUrl}`
    );
  }

  // Limit emojis to max 2
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = fixed.match(emojiRegex) || [];
  if (emojis.length > 2) {
    let count = 0;
    fixed = fixed.replace(emojiRegex, (match) => {
      count++;
      return count <= 1 ? match : '';
    });
  }

  // Ensure proper spacing
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n');
  
  return fixed.trim();
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

    const { post_id } = await req.json().catch(() => ({}));

    if (!post_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'post_id is required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('[linkedin-generate-copy] Processing post:', post_id);

    // Check if already generated
    const { data: existingPub } = await supabase
      .from('social_publications')
      .select('*')
      .eq('channel', 'linkedin')
      .eq('blog_post_id', post_id)
      .maybeSingle();

    if (existingPub?.generated_text) {
      console.log('[linkedin-generate-copy] Already has copy, returning existing');
      return new Response(JSON.stringify({
        success: true,
        already_generated: true,
        generated_text: existingPub.generated_text,
        canonical_url: existingPub.canonical_url
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get the blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, content_md, pillar, tags')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      console.error('[linkedin-generate-copy] Post not found:', postError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Blog post not found'
      }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Generate copy - use blog.vistaceo.com as canonical URL
    // This is the professional Astro SSG blog with proper OG meta tags
    const canonicalUrl = `https://blog.vistaceo.com/${post.slug}`;
    
    // Generate LinkedIn copy with the canonical blog URL
    const generatedText = await generateLinkedInCopy(post as BlogPost, canonicalUrl, lovableApiKey);

    // Save to social_publications (status = 'queued' since not auto-published yet)
    console.log('[linkedin-generate-copy] Attempting to save to social_publications...');
    
    const upsertResult = await supabase.from('social_publications').upsert({
      channel: 'linkedin',
      blog_post_id: post_id,
      status: 'queued',
      generated_text: generatedText,
      canonical_url: canonicalUrl,
      error_message: null,
      attempts: (existingPub?.attempts || 0) + 1
    }, {
      onConflict: 'channel,blog_post_id'
    });

    console.log('[linkedin-generate-copy] Upsert result:', JSON.stringify(upsertResult));

    if (upsertResult.error) {
      console.error('[linkedin-generate-copy] Upsert error:', upsertResult.error);
      throw new Error(`Failed to save: ${upsertResult.error.message}`);
    }

    console.log('[linkedin-generate-copy] Copy saved and generated successfully');

    return new Response(JSON.stringify({
      success: true,
      generated_text: generatedText,
      canonical_url: canonicalUrl
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[linkedin-generate-copy] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
