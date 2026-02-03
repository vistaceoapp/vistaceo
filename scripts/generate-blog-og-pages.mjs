#!/usr/bin/env node
/**
 * VistaSEOOS P0.2 — SSG Blog Pages Generator (MODO DIOS)
 * Generates BOTH slug.html AND slug/index.html for maximum compatibility
 * Includes full OG/Twitter/Schema + visible content for crawlers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';
const DEFAULT_OG_IMAGE = '/og-blog-default.jpg';

// Supabase config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

// Validation
const SLUG_REGEX = /^[a-z0-9-]{3,120}$/;

// ===== HELPER FUNCTIONS =====

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function truncateDescription(text, maxLength = 160) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

function isValidSlug(slug) {
  return slug && typeof slug === 'string' && SLUG_REGEX.test(slug);
}

function getValidImageUrl(heroImageUrl) {
  if (!heroImageUrl) return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
  if (heroImageUrl.startsWith('data:')) return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
  if (heroImageUrl.startsWith('https://')) return heroImageUrl;
  if (heroImageUrl.startsWith('http://')) return heroImageUrl.replace('http://', 'https://');
  if (heroImageUrl.startsWith('/')) return `${CANONICAL_DOMAIN}${heroImageUrl}`;
  return `${CANONICAL_DOMAIN}${DEFAULT_OG_IMAGE}`;
}

// ===== SUPABASE FETCH =====

async function fetchPublishedPosts() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=id,slug,title,excerpt,content_md,meta_title,meta_description,hero_image_url,image_alt_text,publish_at,updated_at,author_name,pillar,tags,category`;
  
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

// ===== META TAG GENERATION =====

function generateJsonLd(post, canonicalUrl, imageUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.meta_title || post.title,
    'description': truncateDescription(post.meta_description || post.excerpt),
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

function generateBreadcrumbJsonLd(post, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Inicio',
        'item': CANONICAL_DOMAIN
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': `${CANONICAL_DOMAIN}/blog`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': canonicalUrl
      }
    ]
  };
}

function generateHeadContent(post, canonicalUrl, imageUrl) {
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(truncateDescription(post.meta_description || post.excerpt));
  const jsonLd = generateJsonLd(post, canonicalUrl, imageUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(post, canonicalUrl);
  const publishDate = post.publish_at || new Date().toISOString();
  const modifiedDate = post.updated_at || publishDate;

  return `
    <!-- VistaSEOOS SSG Meta Tags - Generated at build time -->
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
    <meta property="og:image:alt" content="${escapeHtml(post.image_alt_text || title)}">
    <meta property="og:locale" content="es_LA">
    <meta property="article:published_time" content="${publishDate}">
    <meta property="article:modified_time" content="${modifiedDate}">
    <meta property="article:author" content="${escapeHtml(post.author_name || 'Equipo VistaCEO')}">
    ${post.tags?.length ? post.tags.map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join('\n    ') : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@vistaceo">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    <meta name="twitter:image:alt" content="${escapeHtml(post.image_alt_text || title)}">
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>
`;
}

// ===== VISIBLE CONTENT GENERATION (for crawler indexation) =====

function extractHeadings(markdown) {
  if (!markdown) return [];
  const headingRegex = /^#{2,3}\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push(match[1].replace(/[*_`]/g, '').trim());
  }
  return headings.slice(0, 10); // Max 10 headings
}

function extractFirstParagraphs(markdown, count = 2) {
  if (!markdown) return '';
  // Remove headings, code blocks, images
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#.*$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '');
  
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 50 && p.length < 500)
    .slice(0, count);
  
  return paragraphs.join('\n\n');
}

function generateVisibleContent(post) {
  const title = escapeHtml(post.title);
  const excerpt = escapeHtml(post.excerpt || '');
  const headings = extractHeadings(post.content_md);
  const intro = escapeHtml(extractFirstParagraphs(post.content_md, 2));
  const author = escapeHtml(post.author_name || 'Equipo VistaCEO');
  const publishDate = post.publish_at ? new Date(post.publish_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : '';

  return `
    <!-- SSG Visible Content for Crawler Indexation -->
    <div id="ssg-content" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
      <article itemscope itemtype="https://schema.org/BlogPosting">
        <h1 itemprop="headline">${title}</h1>
        <p itemprop="description">${excerpt}</p>
        <div itemprop="author" itemscope itemtype="https://schema.org/Person">
          <span itemprop="name">${author}</span>
        </div>
        ${publishDate ? `<time itemprop="datePublished" datetime="${post.publish_at}">${publishDate}</time>` : ''}
        <div itemprop="articleBody">
          ${intro ? `<p>${intro.replace(/\n\n/g, '</p><p>')}</p>` : ''}
          ${headings.length > 0 ? `
            <nav aria-label="Contenido del artículo">
              <h2>En este artículo</h2>
              <ul>
                ${headings.map(h => `<li>${escapeHtml(h)}</li>`).join('\n                ')}
              </ul>
            </nav>
          ` : ''}
        </div>
        <footer>
          <a href="${CANONICAL_DOMAIN}/blog">← Ver más artículos en el Blog de VistaCEO</a>
        </footer>
      </article>
    </div>
`;
}

// ===== HTML PROCESSING =====

function removeExistingMetaTags(html) {
  // Remove OG tags
  html = html.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<meta\s+content="[^"]*"\s+property="og:[^"]*"\s*\/?>/gi, '');
  
  // Remove Twitter tags
  html = html.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<meta\s+content="[^"]*"\s+name="twitter:[^"]*"\s*\/?>/gi, '');
  
  // Remove title, description, canonical
  html = html.replace(/<title>[^<]*<\/title>/gi, '');
  html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '');
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi, '');
  
  // Remove existing JSON-LD
  html = html.replace(/<script\s+type="application\/ld\+json">[^<]*<\/script>/gi, '');
  
  // Clean up whitespace
  html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return html;
}

function generateStaticPage(templateHtml, post) {
  const canonicalUrl = `${CANONICAL_DOMAIN}/blog/${post.slug}`;
  const imageUrl = getValidImageUrl(post.hero_image_url);
  
  // Clean template
  let html = removeExistingMetaTags(templateHtml);
  
  // Insert head content
  const headContent = generateHeadContent(post, canonicalUrl, imageUrl);
  html = html.replace(/<head>/i, `<head>${headContent}`);
  
  // Insert visible content for crawlers (hidden from users)
  const visibleContent = generateVisibleContent(post);
  html = html.replace(/<body([^>]*)>/i, `<body$1>${visibleContent}`);
  
  return html;
}

// ===== MAIN =====

async function main() {
  console.log('\n🚀 VistaSEOOS — SSG Blog Pages Generator (MODO DIOS)\n');
  console.log('='.repeat(60));
  
  // Validate dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found. Run "vite build" first.');
    process.exit(1);
  }
  
  // Load template
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: dist/index.html not found.');
    process.exit(1);
  }
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  console.log('✅ Template loaded from dist/index.html');
  
  // Check default OG image
  const defaultOgPath = path.join(DIST_DIR, 'og-blog-default.jpg');
  if (!fs.existsSync(defaultOgPath)) {
    console.warn('⚠️  Warning: og-blog-default.jpg not found in dist/');
  } else {
    console.log('✅ Default OG image exists');
  }
  
  // Create blog directory
  const blogDir = path.join(DIST_DIR, 'blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  
  // Fetch posts
  console.log('\n📡 Fetching published blog posts from Supabase...');
  let posts;
  try {
    posts = await fetchPublishedPosts();
    console.log(`✅ Found ${posts.length} published posts\n`);
  } catch (error) {
    console.error('❌ Error fetching posts:', error.message);
    console.log('⚠️  Skipping SSG generation due to API error');
    process.exit(0);
  }
  
  // Generate pages
  let successCount = 0;
  let skipCount = 0;
  const errors = [];
  const generatedFiles = [];
  
  for (const post of posts) {
    // Validate slug
    if (!isValidSlug(post.slug)) {
      console.warn(`⚠️  Skipping invalid slug: "${post.slug}"`);
      errors.push({ slug: post.slug, reason: 'Invalid slug format' });
      skipCount++;
      continue;
    }
    
    // Check for base64 images (should be blocked)
    if (post.hero_image_url?.startsWith('data:')) {
      console.warn(`⚠️  Warning: base64 image detected for "${post.slug}" - using default`);
    }
    
    try {
      const html = generateStaticPage(templateHtml, post);
      
      // Write BOTH file formats for maximum compatibility
      
      // 1. /blog/slug.html (direct file)
      const directPath = path.join(blogDir, `${post.slug}.html`);
      fs.writeFileSync(directPath, html, 'utf-8');
      generatedFiles.push(`/blog/${post.slug}.html`);
      
      // 2. /blog/slug/index.html (directory-based)
      const slugDir = path.join(blogDir, post.slug);
      fs.mkdirSync(slugDir, { recursive: true });
      const indexPath = path.join(slugDir, 'index.html');
      fs.writeFileSync(indexPath, html, 'utf-8');
      generatedFiles.push(`/blog/${post.slug}/index.html`);
      
      console.log(`✅ Generated: /blog/${post.slug}.html + /blog/${post.slug}/index.html`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error generating "${post.slug}":`, error.message);
      errors.push({ slug: post.slug, reason: error.message });
      skipCount++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SSG Generation Summary:\n');
  console.log(`   ✅ Success: ${successCount} posts (${successCount * 2} files)`);
  console.log(`   ⚠️  Skipped: ${skipCount} posts`);
  console.log(`   📄 Total: ${posts.length} posts`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  Errors:');
    errors.forEach(e => console.log(`   - ${e.slug}: ${e.reason}`));
  }
  
  // Verify a sample
  if (successCount > 0) {
    const sampleSlug = posts.find(p => isValidSlug(p.slug))?.slug;
    if (sampleSlug) {
      const samplePath = path.join(blogDir, `${sampleSlug}.html`);
      const sampleHtml = fs.readFileSync(samplePath, 'utf-8');
      const hasCanonical = sampleHtml.includes(`href="${CANONICAL_DOMAIN}/blog/${sampleSlug}"`);
      const hasOgUrl = sampleHtml.includes(`og:url" content="${CANONICAL_DOMAIN}/blog/${sampleSlug}"`);
      
      console.log('\n🔍 Sample verification (/blog/' + sampleSlug + '.html):');
      console.log(`   Canonical correct: ${hasCanonical ? '✅' : '❌'}`);
      console.log(`   og:url correct: ${hasOgUrl ? '✅' : '❌'}`);
    }
  }
  
  console.log('\n✨ SSG Generation complete!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
