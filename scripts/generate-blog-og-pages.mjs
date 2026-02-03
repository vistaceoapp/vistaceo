#!/usr/bin/env node
/**
 * SSG OG Pages Generator
 * Generates static HTML pages for each blog post with proper OG meta tags
 * Runs after Vite build to enable correct social sharing previews
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';
const DEFAULT_OG_IMAGE = '/og-blog-default.jpg';

// Supabase config - using environment variables or defaults for build
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

// Slug validation regex
const SLUG_REGEX = /^[a-z0-9-]{3,120}$/;

/**
 * Fetch all published blog posts from Supabase
 */
async function fetchPublishedPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=id,slug,title,excerpt,meta_title,meta_description,hero_image_url,image_alt_text,publish_at,updated_at,author_name,pillar,tags`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Sanitize and validate slug
 */
function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  return SLUG_REGEX.test(slug);
}

/**
 * Truncate description to optimal length without cutting words
 */
function truncateDescription(text, maxLength = 160) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Check if image URL is valid (not base64, is absolute https)
 */
function getValidImageUrl(heroImageUrl) {
  if (!heroImageUrl) return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
  if (heroImageUrl.startsWith('data:')) return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
  if (heroImageUrl.startsWith('http://') || heroImageUrl.startsWith('https://')) {
    return heroImageUrl;
  }
  // Relative URL - make absolute
  if (heroImageUrl.startsWith('/')) {
    return `${CANONICAL_DOMAIN}${heroImageUrl}`;
  }
  return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
}

/**
 * Generate JSON-LD BlogPosting schema
 */
function generateJsonLd(post, canonicalUrl, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': escapeHtml(post.meta_title || post.title),
    'description': escapeHtml(truncateDescription(post.meta_description || post.excerpt)),
    'image': imageUrl,
    'url': canonicalUrl,
    'datePublished': post.publish_at || new Date().toISOString(),
    'dateModified': post.updated_at || post.publish_at || new Date().toISOString(),
    'author': {
      '@type': 'Person',
      'name': post.author_name || 'Equipo VistaCEO'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'VistaCEO',
      'logo': {
        '@type': 'ImageObject',
        'url': `${CANONICAL_DOMAIN}/favicon.png`
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    }
  };
}

/**
 * Remove existing OG/Twitter meta tags from HTML to avoid duplicates
 */
function removeExistingMetaTags(html) {
  // Remove existing OG tags
  html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<meta\s+content="[^"]*"\s+property="og:[^"]*"\s*\/?>/gi, '');
  
  // Remove existing Twitter tags
  html = html.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<meta\s+content="[^"]*"\s+name="twitter:[^"]*"\s*\/?>/gi, '');
  
  // Remove existing title, description, canonical
  html = html.replace(/<title>[^<]*<\/title>/gi, '');
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi, '');
  
  // Remove any existing JSON-LD for BlogPosting
  html = html.replace(/<script\s+type="application\/ld\+json">[^<]*BlogPosting[^<]*<\/script>/gi, '');
  
  // Clean up multiple newlines
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return html;
}

/**
 * Generate the meta tags HTML for a blog post
 */
function generateMetaTags(post, canonicalUrl, imageUrl) {
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(truncateDescription(post.meta_description || post.excerpt));
  const jsonLd = generateJsonLd(post, canonicalUrl, imageUrl);

  return `
    <!-- Blog Post SSG Meta Tags -->
    <title>${title} | VistaCEO Blog</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="VistaCEO">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="es_LA">
    <meta property="article:published_time" content="${post.publish_at || ''}">
    <meta property="article:modified_time" content="${post.updated_at || ''}">
    <meta property="article:author" content="${escapeHtml(post.author_name || 'Equipo VistaCEO')}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@vistaceo">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
`;
}

/**
 * Generate static HTML page for a blog post
 */
function generateStaticPage(templateHtml, post) {
  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const imageUrl = getValidImageUrl(post.hero_image_url);
  
  // Remove existing meta tags to avoid duplicates
  let html = removeExistingMetaTags(templateHtml);
  
  // Generate new meta tags
  const metaTags = generateMetaTags(post, canonicalUrl, imageUrl);
  
  // Insert meta tags after the <head> tag
  html = html.replace(/<head>/i, `<head>${metaTags}`);
  
  return html;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting SSG OG pages generation...\n');
  
  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }
  
  // Read the template HTML
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: dist/index.html not found.');
    process.exit(1);
  }
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  console.log('✅ Template loaded from dist/index.html');
  
  // Verify default OG image exists
  const defaultOgPath = path.join(DIST_DIR, 'og-blog-default.jpg');
  if (!fs.existsSync(defaultOgPath)) {
    console.warn('⚠️  Warning: og-blog-default.jpg not found in dist/');
  }
  
  // Fetch published posts
  console.log('📡 Fetching published blog posts from Supabase...');
  let posts;
  try {
    posts = await fetchPublishedPosts();
    console.log(`✅ Found ${posts.length} published posts\n`);
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message);
    // Don't fail build if API is down - just skip SSG
    console.log('⚠️  Skipping SSG generation due to API error');
    process.exit(0);
  }
  
  // Generate static pages
  let successCount = 0;
  let skipCount = 0;
  const errors = [];
  
  for (const post of posts) {
    // Validate slug
    if (!isValidSlug(post.slug)) {
      console.warn(`⚠️  Skipping invalid slug: "${post.slug}"`);
      errors.push({ slug: post.slug, reason: 'Invalid slug format' });
      skipCount++;
      continue;
    }
    
    try {
      // Create directory
      const blogDir = path.join(DIST_DIR, 'blog', post.slug);
      fs.mkdirSync(blogDir, { recursive: true });
      
      // Generate HTML
      const html = generateStaticPage(templateHtml, post);
      
      // Write file
      const outputPath = path.join(blogDir, 'index.html');
      fs.writeFileSync(outputPath, html, 'utf-8');
      
      console.log(`✅ Generated: /blog/${post.slug}/index.html`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error generating page for "${post.slug}":`, error.message);
      errors.push({ slug: post.slug, reason: error.message });
      skipCount++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SSG Generation Summary:');
  console.log(`   ✅ Success: ${successCount} pages`);
  console.log(`   ⚠️  Skipped: ${skipCount} pages`);
  console.log(`   📄 Total posts: ${posts.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(e => console.log(`   - ${e.slug}: ${e.reason}`));
  }
  
  console.log('\n✨ SSG OG pages generation complete!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
