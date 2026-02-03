#!/usr/bin/env node
/**
 * VistaSEOOS P1.1 — Static Sitemap Generator
 * Generates sitemap.xml at build time with all published posts
 * Includes lastmod from updated_at for accurate crawling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';

// Supabase config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
  { path: '/auth', priority: '0.3', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.2', changefreq: 'yearly' },
  { path: '/terms', priority: '0.2', changefreq: 'yearly' },
];

async function fetchPublishedPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=slug,updated_at,publish_at,pillar&order=publish_at.desc`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  return response.json();
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return dateStr.split('T')[0];
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function main() {
  console.log('\n🗺️  VistaSEOOS — Sitemap Generator\n');
  console.log('='.repeat(50));
  
  // Check dist directory
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }
  
  const today = formatDate(new Date().toISOString());
  
  // Fetch published posts
  console.log('📡 Fetching published blog posts...');
  let posts = [];
  try {
    posts = await fetchPublishedPosts();
    console.log(`✅ Found ${posts.length} published posts\n`);
  } catch (error) {
    console.error('⚠️  Warning: Could not fetch posts:', error.message);
    console.log('   Generating sitemap with static pages only...\n');
  }
  
  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  for (const page of STATIC_PAGES) {
    xml += `  <url>
    <loc>${CANONICAL_DOMAIN}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Add blog posts
  let blogCount = 0;
  for (const post of posts) {
    if (!post.slug) continue;
    
    const lastmod = formatDate(post.updated_at || post.publish_at);
    
    xml += `  <url>
    <loc>${CANONICAL_DOMAIN}/blog/${escapeXml(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    blogCount++;
  }

  xml += `</urlset>
`;

  // Write sitemap
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml, 'utf-8');
  
  console.log('📝 Sitemap generated:');
  console.log(`   - Static pages: ${STATIC_PAGES.length}`);
  console.log(`   - Blog posts: ${blogCount}`);
  console.log(`   - Total URLs: ${STATIC_PAGES.length + blogCount}`);
  console.log(`   - Output: dist/sitemap.xml`);
  
  // Verify file size (Google limit is 50MB / 50,000 URLs)
  const stats = fs.statSync(sitemapPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   - File size: ${sizeMB} MB`);
  
  if (stats.size > 50 * 1024 * 1024) {
    console.warn('⚠️  Warning: Sitemap exceeds 50MB limit!');
  }
  
  if (STATIC_PAGES.length + blogCount > 50000) {
    console.warn('⚠️  Warning: Sitemap exceeds 50,000 URLs limit!');
    console.log('   Consider implementing sitemap index with segmentation.');
  }
  
  console.log('\n✨ Sitemap generation complete!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
