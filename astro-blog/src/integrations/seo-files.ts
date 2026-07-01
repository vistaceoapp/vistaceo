import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getAllPublishedPosts } from '../lib/supabase';
import { extractImages } from '../lib/text';
import { getAllClusters } from '../lib/clusters';

const SITE_URL = 'https://blog.vistaceo.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function withTrailingSlash(url: string): string {
  // Keep query/hash intact if ever present.
  const [base, rest] = url.split(/(?=[?#])/);
  return base.endsWith('/') ? url : `${base}/${rest ?? ''}`;
}

// Minimum published posts a cluster must have to be listed in the sitemap.
// Thin/empty cluster pages get "Crawled - currently not indexed" in GSC, so
// we hide them until they reach the threshold.
const MIN_POSTS_PER_CLUSTER = 3;
// Minimum body length (chars) to expose a post in the sitemap. Anything
// thinner is hidden until it is rewritten/expanded.
const MIN_POST_LENGTH = 1500;

async function generateSitemapXml(): Promise<string> {
  const posts = await getAllPublishedPosts();
  const clusters = getAllClusters();

  const urls: {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
    images?: { loc: string; title: string; caption?: string }[];
    news?: { title: string; publication_date: string };
  }[] = [];

  const today = new Date().toISOString().split('T')[0];
  const nowIso = new Date().toISOString();
  const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;

  urls.push({
    loc: withTrailingSlash(`${SITE_URL}/`),
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  });

  // Count published posts per cluster and only list clusters with enough depth.
  const postsByCluster = posts.reduce<Record<string, number>>((acc, p) => {
    const key = (p as any).category;
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  for (const cluster of clusters) {
    if ((postsByCluster[cluster.slug] || 0) < MIN_POSTS_PER_CLUSTER) continue;
    urls.push({
      loc: withTrailingSlash(`${SITE_URL}/tema/${cluster.slug}/`),
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9',
    });
  }

  for (const post of posts) {
    // Skip thin posts: Google flags them as "Crawled - currently not indexed".
    const contentLen = ((post as any).content_md || '').length;
    if (contentLen > 0 && contentLen < MIN_POST_LENGTH) continue;

    const lastmodIso = post.updated_at || post.publish_at || nowIso;
    const lastmod = lastmodIso.split('T')[0];
    const ageMs = Date.now() - new Date(lastmodIso).getTime();
    const isFresh = ageMs < TWO_DAYS;


    const entry: typeof urls[number] = {
      loc: withTrailingSlash(`${SITE_URL}/${post.slug}/`),
      lastmod,
      changefreq: isFresh ? 'daily' : 'weekly',
      priority: isFresh ? '0.95' : '0.85',
    };

    const images: { loc: string; title: string; caption?: string }[] = [];
    if (post.hero_image_url && post.hero_image_url.startsWith('http')) {
      images.push({
        loc: post.hero_image_url,
        title: post.image_alt_text || post.title,
        caption: post.image_alt_text || post.title,
      });
    }
    // Inline images embedded in markdown → Google Images coverage boost.
    for (const img of extractImages((post as any).content_md || '')) {
      if (images.some(i => i.loc === img.url)) continue;
      images.push({ loc: img.url, title: img.caption || post.title, caption: img.caption || post.title });
      if (images.length >= 10) break; // Google recommends ≤1000, we cap for speed
    }
    if (images.length) entry.images = images;

    // News tag — solo para notas frescas (<48h). Boost de descubrimiento.
    if (isFresh) {
      entry.news = {
        title: post.title,
        publication_date: lastmodIso,
      };
    }

    urls.push(entry);
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n` +
    `        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls
      .map((url) => {
        const imageBlock = url.images && url.images.length
          ? url.images.map(im =>
              `\n    <image:image>\n      <image:loc>${escapeXml(im.loc)}</image:loc>\n      <image:title>${escapeXml(im.title)}</image:title>${im.caption ? `\n      <image:caption>${escapeXml(im.caption)}</image:caption>` : ''}\n    </image:image>`
            ).join('')
          : '';

        const newsBlock = url.news
          ? `\n    <news:news>\n      <news:publication>\n        <news:name>VISTACEO Latinoamérica</news:name>\n        <news:language>es</news:language>\n      </news:publication>\n      <news:publication_date>${escapeXml(url.news.publication_date)}</news:publication_date>\n      <news:title>${escapeXml(url.news.title)}</news:title>\n    </news:news>`
          : '';

        return (
          `  <url>\n` +
          `    <loc>${escapeXml(url.loc)}</loc>\n` +
          `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n` +
          `    <changefreq>${escapeXml(url.changefreq)}</changefreq>\n` +
          `    <priority>${escapeXml(url.priority)}</priority>` +
          `${imageBlock}` +
          `${newsBlock}\n` +
          `  </url>`
        );
      })
      .join('\n') +
    `\n</urlset>`
  );
}

function generateRobotsTxt(): string {
  const today = new Date().toISOString().split('T')[0];
  return [
    `# VistaCEO Blog - robots.txt`,
    `# ${SITE_URL}`,
    `# Last updated: ${today}`,
    ``,
    `# Allow all search engine crawlers`,
    `User-agent: Googlebot`,
    `Allow: /`,
    `Crawl-delay: 1`,
    ``,
    `User-agent: Bingbot`,
    `Allow: /`,
    `Crawl-delay: 1`,
    ``,
    `# Social media bots`,
    `User-agent: Twitterbot`,
    `Allow: /`,
    ``,
    `User-agent: facebookexternalhit`,
    `Allow: /`,
    ``,
    `User-agent: LinkedInBot`,
    `Allow: /`,
    ``,
    `# Block aggressive bots`,
    `User-agent: AhrefsBot`,
    `Disallow: /`,
    ``,
    `User-agent: SemrushBot`,
    `Disallow: /`,
    ``,
    `User-agent: DotBot`,
    `Disallow: /`,
    ``,
    `User-agent: MJ12bot`,
    `Disallow: /`,
    ``,
    `User-agent: GPTBot`,
    `Disallow: /`,
    ``,
    `User-agent: CCBot`,
    `Disallow: /`,
    ``,
    `User-agent: ClaudeBot`,
    `Disallow: /`,
    ``,
    `User-agent: Bytespider`,
    `Disallow: /`,
    ``,
    `# All other bots`,
    `User-agent: *`,
    `Allow: /`,
    `Disallow: /api/`,
    `Disallow: /admin/`,
    ``,
    `# Sitemap`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ``,
  ].join('\n');
}

async function ensureFileNotDirectory(outDir: string, fileName: string) {
  // GitHub Pages + Astro directory format can leave a directory like:
  // dist/sitemap.xml/index.html (served as HTML). If that directory exists,
  // it will shadow dist/sitemap.xml (the file). So we remove the dir first.
  const asDir = path.join(outDir, fileName);
  try {
    const stat = await fs.stat(asDir);
    if (stat.isDirectory()) {
      await fs.rm(asDir, { recursive: true, force: true });
    }
  } catch {
    // does not exist → ok
  }
}

export default function seoFiles(): AstroIntegration {
  return {
    name: 'vistaceo-seo-files',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const outDir = dir.pathname;

          const [sitemapXml, robotsTxt] = await Promise.all([
            generateSitemapXml(),
            Promise.resolve(generateRobotsTxt()),
          ]);

          await Promise.all([
            ensureFileNotDirectory(outDir, 'sitemap.xml'),
            ensureFileNotDirectory(outDir, 'robots.txt'),
          ]);

          await fs.writeFile(path.join(outDir, 'sitemap.xml'), sitemapXml, 'utf8');
          await fs.writeFile(path.join(outDir, 'robots.txt'), robotsTxt, 'utf8');

          logger.info('Generated sitemap.xml and robots.txt as static files');
        } catch (err) {
          logger.error(`Failed generating SEO files: ${String(err)}`);
          throw err;
        }
      },
    },
  };
}
