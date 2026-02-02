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

// PROMPT MAESTRO para generar copy de LinkedIn
const LINKEDIN_PROMPT = `Sos un/a redactor/a senior de LinkedIn para VistaCEO. Transformás una NOTA de blog en una publicación lista para LinkedIn.

Tu objetivo es maximizar:
- clicks al link (CTR),
- comentarios (engagement),
- y crecimiento de seguidores (follow intent),
manteniendo un tono humano, profesional y creíble (formal-cercano).

REGLAS OBLIGATORIAS:
- 100% VistaCEO: NO menciones Greentech ni nada parecido.
- Español LATAM, sin sonar robótico.
- Tono: formal-cercano (voz de líder/operador de negocio). Nada de humo.
- Emojis: USARLOS. Mínimo 2, máximo 4. Deben estar distribuidos naturalmente (🚀 💡 📈 🔥 ⚡ 🎯 💼 ✅ son buenos para negocios).
- Evitá: "en esta nota…", "en este artículo…", "te contamos…". Hablá directo.
- Extraé de la nota:
  - 1 idea central,
  - 3–6 insights accionables,
  - 1 dato o ejemplo concreto si existe.
- "Clickbait elegante":
  - Curiosidad + promesa clara + relevancia para negocio
  - Usá números, preguntas provocadoras, o afirmaciones audaces pero creíbles
  - SIN exageraciones vacías (no "cambiará tu vida", no "nunca visto").
- No uses MAYÚSCULAS excesivas.
- El post debe tener saltos de línea (aire visual).

ESTRUCTURA DEL POST (NO incluyas letras A, B, C, D, E, F ni etiquetas de sección):

1. HOOK/TITULAR (primera línea, MUY importante)
   - 6 a 14 palabras que ENGANCHAN
   - Incluir 1 emoji al inicio o final
   - Debe generar curiosidad real, con dato, número o pregunta provocadora
   - Ejemplos buenos: "El 73% de los CEOs ya usan IA. ¿Vos?" / "3 señales de que tu competencia te está pasando 🚨"

2. ENTRADA (1–2 párrafos cortos después del hook)
   - Enmarcá el problema/oportunidad
   - Una frase corta sola (estilo "golpe") para que se sienta humano

3. CUERPO (4 a 7 líneas)
   - Mezclá bullets "•" con frases sueltas
   - Cada insight → implicancia práctica
   - Incluir 1 emoji estratégico en algún bullet

4. CIERRE + CTA (2 líneas)
   - UNA pregunta concreta orientada a comentario
   - Cerrá con "Te leo 👇" o similar

5. LINK (línea aparte, SIN el prefijo "Link:")
   - Solo la URL directa: https://www.vistaceo.com/blog/...

6. HASHTAGS (última línea, 8 a 12)
   - Siempre #VistaCEO primero
   - Máximo 2 en inglés
   - Variá según el contenido

EJEMPLO DE FORMATO CORRECTO:
---
El 80% de las pymes que adoptan IA crecen 2x más rápido 🚀

No es magia. Es estrategia.

La diferencia entre los que escalan y los que se estancan está en cómo integran tecnología sin perder el foco humano.

• Automatizá lo repetitivo, pero no delegues las decisiones clave
• Los roles no desaparecen, se transforman → ¿tu equipo está listo?
• El ejemplo más claro: empresas que antes tardaban 3 días en analizar datos, hoy lo hacen en minutos 📊

La pregunta no es SI adoptar IA, sino CÓMO hacerlo sin romper lo que funciona.

¿Qué proceso de tu negocio automatizarías primero? Te leo 👇

https://www.vistaceo.com/blog/ejemplo-articulo

#VistaCEO #InteligenciaArtificial #Pymes #TransformacionDigital #Liderazgo #Negocios #Automatizacion #LATAM #Emprendimiento
---

IMPORTANTE: Entregá ÚNICAMENTE el texto final listo para copiar/pegar. 
- SIN letras de sección (A, B, C...)
- SIN etiquetas como "TITULAR:", "HOOK:", "CIERRE:"
- SIN comillas alrededor del texto
- SIN explicaciones antes o después`;

// Generate LinkedIn post copy using Lovable AI
async function generateLinkedInCopy(
  post: BlogPost,
  canonicalUrl: string,
  lovableApiKey: string
): Promise<string> {
  const postContext = `
TÍTULO: ${post.title}
RESUMEN: ${post.excerpt || 'Sin resumen'}
CONTENIDO:
${post.content_md.slice(0, 4000)}...

LINK CANÓNICO: ${canonicalUrl}
AUDIENCIA: CEOs, founders y dueños de pymes en LATAM
OBJETIVO: engagement + clicks
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
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[linkedin-generate-copy] AI generation failed:', errorText);
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const result = await response.json();
  let text = result.choices?.[0]?.message?.content || '';

  // Validate and fix the generated text
  text = validateLinkedInPost(text, canonicalUrl);

  return text;
}

// Validate LinkedIn post requirements
function validateLinkedInPost(text: string, canonicalUrl: string): string {
  let fixed = text.trim();

  // Ensure #VistaCEO is included
  if (!fixed.includes('#VistaCEO')) {
    fixed = fixed.replace(/(#\w+)(\s|$)/, '$1 #VistaCEO$2');
    if (!fixed.includes('#VistaCEO')) {
      fixed += '\n\n#VistaCEO';
    }
  }

  // Ensure the link is included
  if (!fixed.includes(canonicalUrl)) {
    if (fixed.includes('Link:')) {
      fixed = fixed.replace(/Link:\s*\[?URL\]?/i, `Link: ${canonicalUrl}`);
    } else {
      fixed = fixed.replace(/(\n\n#)/, `\n\nLink: ${canonicalUrl}\n\n#`);
    }
  }

  // Count emojis and trim if too many
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  const emojis = fixed.match(emojiRegex) || [];
  if (emojis.length > 4) {
    let count = 0;
    fixed = fixed.replace(emojiRegex, (match) => {
      count++;
      return count <= 3 ? match : '';
    });
  }

  // Count hashtags and ensure reasonable amount
  const hashtags = fixed.match(/#\w+/g) || [];
  if (hashtags.length < 8) {
    const additionalTags = ['#Negocios', '#Emprendimiento', '#LATAM', '#Liderazgo', '#Productividad', '#Estrategia', '#CEO', '#Pymes'];
    const missingCount = 8 - hashtags.length;
    const tagsToAdd = additionalTags
      .filter(t => !fixed.toLowerCase().includes(t.toLowerCase()))
      .slice(0, missingCount);
    
    if (tagsToAdd.length > 0) {
      fixed = fixed.trim() + ' ' + tagsToAdd.join(' ');
    }
  }

  return fixed;
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

    // Generate copy - use blog-seo edge function URL for LinkedIn sharing
    // This ensures bots get proper meta tags when scraping
    const supabaseProjectUrl = supabaseUrl.replace('/auth/v1', '');
    const seoUrl = `${supabaseProjectUrl}/functions/v1/blog-seo?slug=${post.slug}`;
    const canonicalUrl = `https://www.vistaceo.com/blog/${post.slug}`;
    
    // For LinkedIn post, use the SEO URL which serves proper meta tags to bots
    // Real users clicking the link get redirected to the canonical URL
    const generatedText = await generateLinkedInCopy(post as BlogPost, seoUrl, lovableApiKey);

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
