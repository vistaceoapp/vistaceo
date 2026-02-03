import type { APIRoute } from 'astro';
import { getLatestPosts } from '../lib/supabase';
import { getMetaDescription, getCanonicalUrl } from '../lib/seo';
import { truncate } from '../lib/text';

const SITE_URL = 'https://blog.vistaceo.com';

export const GET: APIRoute = async () => {
  const posts = await getLatestPosts(50);

  const items = posts.map(post => {
    const description = getMetaDescription(post);
    const link = getCanonicalUrl(post.slug);
    const pubDate = post.publish_at ? new Date(post.publish_at).toUTCString() : new Date().toUTCString();

    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>contacto@vistaceo.com (${post.author_name || 'Equipo VistaCEO'})</author>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VistaCEO Blog</title>
    <description>Insights, guías y estrategias para tomar mejores decisiones de negocio en Latinoamérica</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
