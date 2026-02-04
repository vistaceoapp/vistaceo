import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const robotsTxt = `# VistaCEO Blog - robots.txt
# https://blog.vistaceo.com

User-agent: *
Allow: /

# Sitemaps
Sitemap: https://blog.vistaceo.com/sitemap.xml

# Allow all bots to index content
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

# Crawl-delay (be nice to our server)
User-agent: *
Crawl-delay: 1

# Host
Host: https://blog.vistaceo.com
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};