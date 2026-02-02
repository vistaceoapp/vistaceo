import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const CANONICAL_DOMAIN = "https://www.vistaceo.com";
const DEFAULT_OG_IMAGE = `${CANONICAL_DOMAIN}/og-blog-default.jpg`;

// Bot User-Agent patterns
const BOT_PATTERNS = [
  'linkedinbot',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'sogou',
  'ia_archiver',
  'pinterest',
  'embedly',
  'quora link preview',
  'outbrain',
  'vkshare',
  'w3c_validator',
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(bot => ua.includes(bot));
}

function isValidPublicImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.startsWith('data:')) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  return true;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

serve(async (req) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const userAgent = req.headers.get('user-agent') || '';

  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!slug) {
    return new Response('Missing slug parameter', { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch the blog post
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, excerpt, hero_image_url, slug, publish_at, author_name, content_md')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    console.error('[blog-seo] Post not found:', slug, error);
    // Redirect to blog index for non-existent posts
    return new Response(null, {
      status: 302,
      headers: { 'Location': `${CANONICAL_DOMAIN}/blog` }
    });
  }

  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const ogImage = isValidPublicImageUrl(post.hero_image_url) 
    ? post.hero_image_url 
    : DEFAULT_OG_IMAGE;
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(post.meta_description || post.excerpt || '');
  const author = escapeHtml(post.author_name || 'VistaCEO');

  // Generate excerpt for content preview (first 300 chars of markdown, cleaned)
  const contentPreview = post.content_md
    ? escapeHtml(post.content_md.replace(/[#*_`\[\]]/g, '').substring(0, 300) + '...')
    : description;

  // Check if this is a bot or a real user
  const isBotRequest = isBot(userAgent);

  console.log(`[blog-seo] Request for "${slug}" | UA: ${userAgent.substring(0, 50)}... | isBot: ${isBotRequest}`);

  // Generate full HTML page with proper meta tags
  const html = `<!DOCTYPE html>
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
  
  ${!isBotRequest ? `
  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.replace("${canonicalUrl}");</script>
  ` : ''}
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #0a0a0a;
      color: #fff;
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { color: #888; line-height: 1.6; }
    a { color: #a855f7; }
    .redirect { margin-top: 2rem; padding: 1rem; background: #1a1a1a; border-radius: 8px; }
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <p><strong>Por ${author}</strong></p>
    <p>${description}</p>
    ${!isBotRequest ? `
    <div class="redirect">
      <p>Redirigiendo al artículo completo...</p>
      <p>Si no eres redirigido automáticamente, <a href="${canonicalUrl}">haz clic aquí</a>.</p>
    </div>
    ` : `
    <p>${contentPreview}</p>
    <p><a href="${canonicalUrl}">Leer artículo completo →</a></p>
    `}
  </article>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      ...corsHeaders,
    },
  });
});
