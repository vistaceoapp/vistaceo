import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const robotsTxt = `# VistaCEO Blog - robots.txt
# https://blog.vistaceo.com
# Last updated: ${new Date().toISOString().split('T')[0]}

# Allow ALL search engines full access
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Sitemaps - Critical for indexation
Sitemap: https://blog.vistaceo.com/sitemap.xml

# Google (primary target)
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-News
Allow: /

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 0

# Other major search engines
User-agent: DuckDuckBot
Allow: /

User-agent: Yandex
Allow: /

User-agent: Baiduspider
Allow: /

# Social media bots - important for sharing
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

User-agent: Slackbot
Allow: /

User-agent: Discordbot
Allow: /

# SEO tools
User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

# Host directive
Host: https://blog.vistaceo.com
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};