#!/usr/bin/env node
/**
 * VistaSEOOS — Static Sitemap Generator + IndexNow Auto-Submit
 *
 * Generates at build time inside dist/:
 *   - sitemap.xml         (sitemap index → main + blog)
 *   - sitemap-pages.xml   (all main-domain indexable URLs)
 *   - sitemap-blog.xml    (proxy ref to blog.vistaceo.com sitemap)
 *
 * After generation, optionally pings IndexNow + warms up sitemaps
 * so Bing/Yandex/Naver/Seznam pick up changes immediately.
 *
 * Disable IndexNow ping via env: SITEMAP_SKIP_INDEXNOW=1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';
const BLOG_DOMAIN = 'https://blog.vistaceo.com';
const INDEXNOW_KEY = '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d';
const INDEXNOW_HOST = 'www.vistaceo.com';

// Supabase config (used only to add post URLs to the main sitemap optionally;
// blog sitemap itself lives at blog.vistaceo.com/sitemap.xml).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

// IMPORTANT: only public, indexable URLs.
// Excluded: /auth, /checkout, /setup*, /app/*, /admin/*, /promo (paid traffic),
// /v2, /v3, /ultra, /minimalista (variants), /reset-password, /unsubscribe,
// /bienvenido-pro (post-purchase).
// /blog on main domain is a 301-equivalent redirect (BlogRedirect.tsx) to
// blog.vistaceo.com — it MUST NOT appear in the sitemap to avoid Google
// reporting "Página con redirección" / canonical confusion.
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily', hreflang: true },
  { path: '/politicas', priority: '0.5', changefreq: 'monthly' },
  { path: '/condiciones', priority: '0.5', changefreq: 'monthly' },
];

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return String(dateStr).split('T')[0];
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority, hreflang }) {
  const alts = hreflang
    ? `\n    <xhtml:link rel="alternate" hreflang="es" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="es-419" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`
    : '';
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${alts}
  </url>
`;
}

function buildSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${CANONICAL_DOMAIN}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BLOG_DOMAIN}/sitemap.xml</loc>
  </sitemap>
</sitemapindex>
`;
}

function buildPagesSitemap(today) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
  for (const page of STATIC_PAGES) {
    xml += urlEntry({
      loc: `${CANONICAL_DOMAIN}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
      hreflang: page.hreflang,
    });
  }
  xml += `</urlset>\n`;
  return xml;
}

async function pingIndexNow(urls) {
  if (process.env.SITEMAP_SKIP_INDEXNOW === '1') {
    console.log('⏭️  IndexNow skipped (SITEMAP_SKIP_INDEXNOW=1)');
    return;
  }

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${CANONICAL_DOMAIN}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const engines = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  console.log(`📡 Submitting ${urls.length} URLs to IndexNow...`);
  const results = await Promise.allSettled(
    engines.map(async (engine) => {
      try {
        const r = await fetch(engine, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return { engine, status: r.status, ok: r.ok };
      } catch (e) {
        return { engine, status: 0, ok: false, error: String(e) };
      }
    })
  );
  for (const r of results) {
    if (r.status === 'fulfilled') {
      console.log(`   ${r.value.ok ? '✅' : '⚠️'} ${r.value.engine} → ${r.value.status}`);
    } else {
      console.log(`   ❌ ${r.reason}`);
    }
  }

  // Warm up sitemaps so CDN cache refreshes
  await Promise.allSettled([
    fetch(`${CANONICAL_DOMAIN}/sitemap.xml`, { headers: { 'Cache-Control': 'no-cache' } }).catch(() => {}),
    fetch(`${BLOG_DOMAIN}/sitemap.xml`, { headers: { 'Cache-Control': 'no-cache' } }).catch(() => {}),
  ]);
  console.log('🔥 Sitemap CDN warmup done');
}

async function main() {
  console.log('\n🗺️  VistaSEOOS — Sitemap Generator\n' + '='.repeat(50));

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }

  const today = formatDate(new Date().toISOString());

  // 1. Sitemap index
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), buildSitemapIndex(), 'utf-8');
  console.log('✅ sitemap.xml (index) written');

  // 2. Pages sitemap
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap-pages.xml'), buildPagesSitemap(today), 'utf-8');
  console.log(`✅ sitemap-pages.xml written (${STATIC_PAGES.length} URLs)`);

  // 3. IndexNow ping for main-domain URLs
  const urls = STATIC_PAGES.map((p) => `${CANONICAL_DOMAIN}${p.path}`);
  try {
    await pingIndexNow(urls);
  } catch (e) {
    console.warn('⚠️  IndexNow ping failed (non-blocking):', e.message);
  }

  console.log('\n✨ Sitemap generation complete!\n');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
