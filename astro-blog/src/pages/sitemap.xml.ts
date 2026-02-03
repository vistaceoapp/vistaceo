import type { APIRoute } from 'astro';
import { getAllPublishedPosts } from '../lib/supabase';
import { getAllClusters } from '../lib/clusters';

const SITE_URL = 'https://blog.vistaceo.com';

export const GET: APIRoute = async () => {
  const posts = await getAllPublishedPosts();
  const clusters = getAllClusters();

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [];

  // Home
  urls.push({
    loc: SITE_URL,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: '1.0'
  });

  // Cluster hubs
  for (const cluster of clusters) {
    urls.push({
      loc: `${SITE_URL}/tema/${cluster.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  // Posts
  for (const post of posts) {
    urls.push({
      loc: `${SITE_URL}/${post.slug}`,
      lastmod: post.updated_at || post.publish_at || new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod.split('T')[0]}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
