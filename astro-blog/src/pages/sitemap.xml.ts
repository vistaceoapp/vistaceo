import type { APIRoute } from 'astro';
import { getAllPublishedPosts } from '../lib/supabase';
import { getAllClusters } from '../lib/clusters';

const SITE_URL = 'https://blog.vistaceo.com';

export const GET: APIRoute = async () => {
  const posts = await getAllPublishedPosts();
  const clusters = getAllClusters();

  // Build URL entries with image sitemaps
  const urls: { loc: string; lastmod: string; changefreq: string; priority: string; image?: { loc: string; title: string } }[] = [];

  // Home page - highest priority, changes daily
  urls.push({
    loc: `${SITE_URL}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  });

  // Cluster/Category hubs - high priority, change weekly
  for (const cluster of clusters) {
    urls.push({
      // Trailing slash is important for consistency with crawlers/Search Console
      loc: `${SITE_URL}/tema/${cluster.slug}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.9'
    });
  }

  // Individual posts - medium-high priority with images
  for (const post of posts) {
    const lastmod = post.updated_at || post.publish_at || new Date().toISOString();
    const urlEntry: typeof urls[0] = {
      // Trailing slash is important for consistency with crawlers/Search Console
      loc: `${SITE_URL}/${post.slug}/`,
      lastmod: lastmod.split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    };
    
    // Add image if available
    if (post.hero_image_url && post.hero_image_url.startsWith('http')) {
      urlEntry.image = {
        loc: post.hero_image_url,
        title: post.image_alt_text || post.title
      };
    }
    
    urls.push(urlEntry);
  }

  // Generate XML with proper formatting including image namespace
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.image ? `
    <image:image>
      <image:loc>${escapeXml(url.image.loc)}</image:loc>
      <image:title>${escapeXml(url.image.title)}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}