import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getAllPublishedPosts } from '../lib/supabase';
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

async function generateSitemapXml(): Promise<string> {
  const posts = await getAllPublishedPosts();
  const clusters = getAllClusters();

  const urls: {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
    image?: { loc: string; title: string };
  }[] = [];

  const today = new Date().toISOString().split('T')[0];

  urls.push({
    loc: withTrailingSlash(`${SITE_URL}/`),
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  });

  for (const cluster of clusters) {
    urls.push({
      loc: withTrailingSlash(`${SITE_URL}/tema/${cluster.slug}/`),
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }

  for (const post of posts) {
    const lastmod = (post.updated_at || post.publish_at || new Date().toISOString()).split('T')[0];

    const entry: typeof urls[number] = {
      loc: withTrailingSlash(`${SITE_URL}/${post.slug}/`),
      lastmod,
      changefreq: 'monthly',
      priority: '0.8',
    };

    if (post.hero_image_url && post.hero_image_url.startsWith('http')) {
      entry.image = {
        loc: post.hero_image_url,
        title: post.image_alt_text || post.title,
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
        const imageBlock = url.image
          ? `\n    <image:image>\n      <image:loc>${escapeXml(url.image.loc)}</image:loc>\n      <image:title>${escapeXml(url.image.title)}</image:title>\n    </image:image>`
          : '';

        return (
          `  <url>\n` +
          `    <loc>${escapeXml(url.loc)}</loc>\n` +
          `    <lastmod>${escapeXml(url.lastmod)}</lastmod>\n` +
          `    <changefreq>${escapeXml(url.changefreq)}</changefreq>\n` +
          `    <priority>${escapeXml(url.priority)}</priority>` +
          `${imageBlock}\n` +
          `  </url>`
        );
      })
      .join('\n') +
    `\n</urlset>`
  );
}

function generateRobotsTxt(): string {
  const today = new Date().toISOString().split('T')[0];
  return (
    `# VistaCEO Blog - robots.txt\n` +
    `# ${SITE_URL}\n` +
    `# Last updated: ${today}\n\n` +
    `User-agent: *\n` +
    `Allow: /\n` +
    `Disallow: /api/\n` +
    `Disallow: /admin/\n\n` +
    `Sitemap: ${SITE_URL}/sitemap.xml\n`
  );
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
