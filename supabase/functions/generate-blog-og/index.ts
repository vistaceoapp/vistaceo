import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const DEFAULT_OG_IMAGE = `${CANONICAL_DOMAIN}/og-blog-default.jpg`;

function isValidPublicImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  return true;
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  hero_image_url: string | null;
  publish_at: string | null;
  author_name: string | null;
  content_md: string;
}

function generateOGHtml(post: BlogPost): string {
  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const ogImage = isValidPublicImageUrl(post.hero_image_url) 
    ? post.hero_image_url 
    : DEFAULT_OG_IMAGE;
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(post.meta_description || post.excerpt || '');
  const author = escapeHtml(post.author_name || 'Equipo VistaCEO');

  // Clean excerpt for content preview
  const contentPreview = post.content_md
    ? escapeHtml(post.content_md.replace(/[#*_`\[\]]/g, '').substring(0, 500) + '...')
    : description;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} | VistaCEO Blog</title>
  <meta name="title" content="${title} | VistaCEO Blog">
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="VistaCEO">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${title}">
  <meta property="og:locale" content="es_LA">
  <meta property="article:published_time" content="${post.publish_at || ''}">
  <meta property="article:author" content="${author}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@vistaceo">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Favicon -->
  <link rel="icon" href="${CANONICAL_DOMAIN}/favicon.png">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${title}",
    "description": "${description}",
    "image": "${ogImage}",
    "datePublished": "${post.publish_at || ''}",
    "author": {
      "@type": "Person",
      "name": "${author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "VistaCEO",
      "logo": {
        "@type": "ImageObject",
        "url": "${CANONICAL_DOMAIN}/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${canonicalUrl}"
    }
  }
  </script>
  
  <!-- Immediate redirect for real users -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.replace("${canonicalUrl}");</script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #0a0a0a;
      color: #fff;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #fff; }
    p { color: #888; line-height: 1.6; }
    a { color: #a855f7; }
    .meta { font-size: 0.875rem; color: #666; margin-bottom: 1.5rem; }
    .redirect { margin-top: 2rem; padding: 1rem; background: #1a1a1a; border-radius: 8px; }
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p class="meta">Por ${author} · VistaCEO</p>
    <p>${description}</p>
    <div class="redirect">
      <p>Cargando artículo completo...</p>
      <p>Si no eres redirigido automáticamente, <a href="${canonicalUrl}">haz clic aquí</a>.</p>
    </div>
  </article>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { post_id, slug, regenerate_all } = body;

    console.log('[generate-blog-og] Request:', { post_id, slug, regenerate_all });

    // Option 1: Regenerate all published posts
    if (regenerate_all) {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, meta_title, meta_description, hero_image_url, publish_at, author_name, content_md')
        .eq('status', 'published');

      if (error) throw error;

      console.log(`[generate-blog-og] Regenerating OG for ${posts?.length || 0} posts...`);

      let successCount = 0;
      let errorCount = 0;

      for (const post of posts || []) {
        try {
          const html = generateOGHtml(post as BlogPost);
          const filePath = `${post.slug}.html`;

          const { error: uploadError } = await supabase.storage
            .from('blog-seo-pages')
            .upload(filePath, html, {
              contentType: 'text/html',
              upsert: true,
            });

          if (uploadError) {
            console.error(`[generate-blog-og] Upload error for ${post.slug}:`, uploadError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`[generate-blog-og] Error processing ${post.slug}:`, err);
          errorCount++;
        }
      }

      console.log(`[generate-blog-og] Regeneration complete: ${successCount} success, ${errorCount} errors`);

      return new Response(JSON.stringify({
        success: true,
        processed: posts?.length || 0,
        successCount,
        errorCount,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Option 2: Generate for specific post
    let postQuery = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, meta_title, meta_description, hero_image_url, publish_at, author_name, content_md')
      .eq('status', 'published');

    if (post_id) {
      postQuery = postQuery.eq('id', post_id);
    } else if (slug) {
      postQuery = postQuery.eq('slug', slug);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'post_id, slug, or regenerate_all required',
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: post, error: postError } = await postQuery.single();

    if (postError || !post) {
      console.error('[generate-blog-og] Post not found:', postError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Post not found or not published',
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate HTML
    const html = generateOGHtml(post as BlogPost);
    const filePath = `${post.slug}.html`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('blog-seo-pages')
      .upload(filePath, html, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) {
      console.error('[generate-blog-og] Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('blog-seo-pages')
      .getPublicUrl(filePath);

    console.log('[generate-blog-og] OG page generated:', publicUrlData.publicUrl);

    return new Response(JSON.stringify({
      success: true,
      slug: post.slug,
      og_page_url: publicUrlData.publicUrl,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[generate-blog-og] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
