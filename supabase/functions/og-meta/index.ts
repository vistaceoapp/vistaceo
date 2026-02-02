import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const DEFAULT_OG_IMAGE = `${CANONICAL_DOMAIN}/og-blog-default.jpg`;

// Check if image is a valid public URL
function isValidPublicImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug parameter required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the blog post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('title, meta_title, meta_description, excerpt, hero_image_url, slug, publish_at, author_name')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !post) {
      // Return default meta for non-existent posts
      return new Response(JSON.stringify({
        title: 'VistaCEO Blog',
        description: 'Artículos sobre gestión empresarial e inteligencia artificial para negocios en LATAM.',
        image: DEFAULT_OG_IMAGE,
        url: `${CANONICAL_DOMAIN}/blog`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const ogImage = isValidPublicImageUrl(post.hero_image_url) 
      ? post.hero_image_url 
      : DEFAULT_OG_IMAGE;

    const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;

    return new Response(JSON.stringify({
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      image: ogImage,
      url: canonicalUrl,
      publishedTime: post.publish_at,
      author: post.author_name || 'VistaCEO',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[og-meta] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
