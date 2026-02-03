/**
 * VistaSEOOS — Cloudflare Worker Router
 * 
 * Este Worker sirve HTML estático desde Supabase Storage para /blog/*
 * Garantiza que crawlers (LinkedIn, Google, etc.) reciban HTML completo sin JS.
 * 
 * INSTALACIÓN:
 * 1. Crear Worker en Cloudflare Dashboard
 * 2. Pegar este código
 * 3. Configurar variables de entorno:
 *    - SUPABASE_URL: https://nlewrgmcawzcdazhfiyy.supabase.co
 *    - STORAGE_BUCKET: blog-ssg-pages
 *    - ORIGIN_URL: https://vistaceo.lovable.app
 * 4. Agregar routes:
 *    - www.vistaceo.com/blog/*
 *    - www.vistaceo.com/sitemap.xml
 *    - www.vistaceo.com/robots.txt
 */

const CANONICAL_DOMAIN = 'https://www.vistaceo.com';

// Default config (can be overridden by env vars)
const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://nlewrgmcawzcdazhfiyy.supabase.co',
  STORAGE_BUCKET: 'blog-ssg-pages',
  ORIGIN_URL: 'https://vistaceo.lovable.app'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Config from env or defaults
    const config = {
      SUPABASE_URL: env.SUPABASE_URL || DEFAULT_CONFIG.SUPABASE_URL,
      STORAGE_BUCKET: env.STORAGE_BUCKET || DEFAULT_CONFIG.STORAGE_BUCKET,
      ORIGIN_URL: env.ORIGIN_URL || DEFAULT_CONFIG.ORIGIN_URL
    };

    // ===== SITEMAP =====
    if (pathname === '/sitemap.xml') {
      return handleSitemap(config);
    }

    // ===== ROBOTS.TXT =====
    if (pathname === '/robots.txt') {
      return handleRobots();
    }

    // ===== BLOG POSTS =====
    if (pathname.startsWith('/blog/')) {
      return handleBlogPost(pathname, config, request);
    }

    // ===== EVERYTHING ELSE: PASS TO ORIGIN =====
    return fetch(request);
  }
};

// ===== BLOG POST HANDLER =====
async function handleBlogPost(pathname, config, originalRequest) {
  // Extract slug from /blog/slug or /blog/slug/
  const slugMatch = pathname.match(/^\/blog\/([a-z0-9-]+)\/?$/);
  
  if (!slugMatch) {
    // Invalid blog path, pass to origin
    return fetch(originalRequest);
  }
  
  const slug = slugMatch[1];
  
  // 1. Try to fetch from Supabase Storage (SSG)
  const storagePath = `blog/${slug}/index.html`;
  const storageUrl = `${config.SUPABASE_URL}/storage/v1/object/public/${config.STORAGE_BUCKET}/${storagePath}`;
  
  try {
    const ssgResponse = await fetch(storageUrl, {
      cf: {
        cacheTtl: 300, // 5 minutes
        cacheEverything: true
      }
    });
    
    if (ssgResponse.ok) {
      const html = await ssgResponse.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          'X-SSG-Source': 'supabase-storage',
          'X-Robots-Tag': 'index, follow'
        }
      });
    }
  } catch (e) {
    console.log(`[SSG] Storage fetch failed for ${slug}:`, e.message);
  }
  
  // 2. Fallback to edge function (blog-seo)
  const edgeUrl = `${config.SUPABASE_URL}/functions/v1/blog-seo?slug=${slug}`;
  
  try {
    const edgeResponse = await fetch(edgeUrl);
    
    if (edgeResponse.ok) {
      const html = await edgeResponse.text();
      
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'X-SSG-Source': 'edge-function-fallback'
        }
      });
    }
  } catch (e) {
    console.log(`[SSG] Edge function failed for ${slug}:`, e.message);
  }
  
  // 3. Return 404
  return new Response(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Artículo no encontrado | VistaCEO</title>
  <meta name="robots" content="noindex">
  <style>
    body { font-family: system-ui; background: #0f0f0f; color: #e5e5e5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    a { color: #7c3aed; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Artículo no encontrado</h1>
    <p>El artículo que buscás no existe o fue eliminado.</p>
    <p><a href="${CANONICAL_DOMAIN}/blog">Ver todos los artículos</a></p>
  </div>
</body>
</html>
  `, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex'
    }
  });
}

// ===== SITEMAP HANDLER =====
async function handleSitemap(config) {
  const sitemapUrl = `${config.SUPABASE_URL}/functions/v1/sitemap`;
  
  try {
    const response = await fetch(sitemapUrl, {
      cf: {
        cacheTtl: 300,
        cacheEverything: true
      }
    });
    
    if (response.ok) {
      const xml = await response.text();
      return new Response(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300, s-maxage=300'
        }
      });
    }
  } catch (e) {
    console.log('[Sitemap] Edge function failed:', e.message);
  }
  
  // Fallback minimal sitemap
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${CANONICAL_DOMAIN}/</loc><priority>1.0</priority></url>
  <url><loc>${CANONICAL_DOMAIN}/blog</loc><priority>0.9</priority></url>
</urlset>`, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=60'
    }
  });
}

// ===== ROBOTS.TXT HANDLER =====
function handleRobots() {
  return new Response(`# VistaSEOOS - Robots.txt
# Canonical domain: ${CANONICAL_DOMAIN}

# ===== MAIN CRAWLERS =====

User-agent: Googlebot
Allow: /
Allow: /blog/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Allow: /blog/
Crawl-delay: 1

# ===== SOCIAL MEDIA BOTS =====

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: Slackbot
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Discordbot
Allow: /

# ===== ALL OTHER BOTS =====

User-agent: *
Allow: /
Allow: /blog/

# Block private routes
Disallow: /app/
Disallow: /setup
Disallow: /checkout
Disallow: /admin/
Disallow: /api/

# Block query parameters that create duplicate content
Disallow: /*?utm_
Disallow: /*?ref=
Disallow: /*?source=

# ===== SITEMAP =====

Sitemap: ${CANONICAL_DOMAIN}/sitemap.xml
`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
