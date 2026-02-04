import type { APIRoute } from 'astro';
import { getAllPublishedPosts } from '../lib/supabase';
import { getAllClusters } from '../lib/clusters';

const SITE_URL = 'https://blog.vistaceo.com';

export const GET: APIRoute = async () => {
  const posts = await getAllPublishedPosts();
  const clusters = getAllClusters();

  // Build URL entries
  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

  // Home page - highest priority, changes daily
  urls.push({
    loc: SITE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  });

  // Cluster/Category hubs - high priority, change weekly
  for (const cluster of clusters) {
    urls.push({
      loc: `${SITE_URL}/tema/${cluster.slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  // Individual posts - medium priority
  for (const post of posts) {
    const lastmod = post.updated_at || post.publish_at || new Date().toISOString();
    urls.push({
      loc: `${SITE_URL}/${post.slug}`,
      lastmod: lastmod.split('T')[0],
      changefreq: 'monthly',
      priority: '0.7'
    });
  }

  // Generate XML with proper formatting
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};