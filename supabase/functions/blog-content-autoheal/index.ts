import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * BLOG CONTENT AUTOHEAL
 * Detecta notas publicadas que no cumplen el estándar mínimo de calidad
 * (≥5 H2s, ≥8000 chars, hero_image_url presente) y las repara automáticamente.
 *
 * Se ejecuta cada 6 horas vía cron. Garantiza que nunca haya una nota
 * incompleta o sin menú lateral suficiente en el blog.
 */

const MIN_H2 = 5;
const MIN_CHARS = 8000;
const MAX_PER_RUN = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Buscar notas publicadas con contenido pobre
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, content_md, hero_image_url')
      .eq('status', 'published')
      .order('publish_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    const weak = (posts || []).filter((p: any) => {
      const md: string = p.content_md || '';
      const h2 = (md.match(/\n## /g) || []).length;
      const chars = md.length;
      const noImg = !p.hero_image_url;
      return h2 < MIN_H2 || chars < MIN_CHARS || noImg;
    }).slice(0, MAX_PER_RUN);

    console.log(`[blog-content-autoheal] Encontradas ${weak.length} notas débiles`);

    const results: any[] = [];

    // Reparar contenido en paralelo
    await Promise.all(weak.map(async (p: any) => {
      try {
        const md: string = p.content_md || '';
        const h2 = (md.match(/\n## /g) || []).length;
        const needsContent = h2 < MIN_H2 || md.length < MIN_CHARS;
        const needsImage = !p.hero_image_url;

        if (needsContent) {
          const { data } = await supabase.functions.invoke('blog-improve-post', {
            body: { post_id: p.id, mode: 'expand' },
          });
          results.push({ slug: p.slug, action: 'improve', result: data });
        }
        if (needsImage) {
          const { data } = await supabase.functions.invoke('backfill-blog-images', {
            body: { slugs: [p.slug] },
          });
          results.push({ slug: p.slug, action: 'image', result: data });
        }
      } catch (e: any) {
        results.push({ slug: p.slug, error: e.message });
      }
    }));

    return new Response(JSON.stringify({
      success: true,
      checked: posts?.length ?? 0,
      weak: weak.length,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[blog-content-autoheal] error:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
