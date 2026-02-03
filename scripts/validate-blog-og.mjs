#!/usr/bin/env node
/**
 * Blog OG Validation Script
 * Validates that generated SSG pages have correct meta tags
 * Runs in CI to prevent deploys with broken OG tags
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const CANONICAL_DOMAIN = 'https://www.vistaceo.com';

let errors = [];
let warnings = [];
let passCount = 0;

/**
 * Parse HTML and extract meta tag content
 */
function extractMetaTags(html) {
  const tags = {};
  
  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  tags.title = titleMatch ? titleMatch[1] : null;
  
  // Meta description
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  tags.description = descMatch ? descMatch[1] : null;
  
  // Canonical
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  tags.canonical = canonicalMatch ? canonicalMatch[1] : null;
  
  // OG tags
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  tags.ogTitle = ogTitleMatch ? ogTitleMatch[1] : null;
  
  const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
  tags.ogDescription = ogDescMatch ? ogDescMatch[1] : null;
  
  const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i);
  tags.ogUrl = ogUrlMatch ? ogUrlMatch[1] : null;
  
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  tags.ogImage = ogImageMatch ? ogImageMatch[1] : null;
  
  const ogTypeMatch = html.match(/<meta\s+property="og:type"\s+content="([^"]*)"/i);
  tags.ogType = ogTypeMatch ? ogTypeMatch[1] : null;
  
  // Twitter tags
  const twitterCardMatch = html.match(/<meta\s+name="twitter:card"\s+content="([^"]*)"/i);
  tags.twitterCard = twitterCardMatch ? twitterCardMatch[1] : null;
  
  const twitterTitleMatch = html.match(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i);
  tags.twitterTitle = twitterTitleMatch ? twitterTitleMatch[1] : null;
  
  const twitterImageMatch = html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i);
  tags.twitterImage = twitterImageMatch ? twitterImageMatch[1] : null;
  
  // JSON-LD
  const jsonLdMatch = html.match(/<script\s+type="application\/ld\+json">([^<]*)<\/script>/i);
  tags.jsonLd = jsonLdMatch ? jsonLdMatch[1] : null;
  
  return tags;
}

/**
 * Count occurrences of a meta tag
 */
function countMetaTag(html, pattern) {
  const regex = new RegExp(pattern, 'gi');
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Validate a single blog page
 */
function validateBlogPage(slug, html) {
  const pageErrors = [];
  const pageWarnings = [];
  const tags = extractMetaTags(html);
  const expectedCanonical = `${CANONICAL_DOMAIN}/blog/${slug}`;
  
  // Test 1: Canonical URL
  if (!tags.canonical) {
    pageErrors.push('Missing canonical URL');
  } else if (tags.canonical !== expectedCanonical) {
    pageErrors.push(`Canonical mismatch: expected "${expectedCanonical}", got "${tags.canonical}"`);
  }
  
  // Test 2: OG URL
  if (!tags.ogUrl) {
    pageErrors.push('Missing og:url');
  } else if (tags.ogUrl !== expectedCanonical) {
    pageErrors.push(`og:url mismatch: expected "${expectedCanonical}", got "${tags.ogUrl}"`);
  }
  
  // Test 3: og:title and og:description not empty
  if (!tags.ogTitle || tags.ogTitle.trim() === '') {
    pageErrors.push('og:title is empty or missing');
  }
  if (!tags.ogDescription || tags.ogDescription.trim() === '') {
    pageErrors.push('og:description is empty or missing');
  }
  
  // Test 4: og:image validation
  if (!tags.ogImage) {
    pageErrors.push('Missing og:image');
  } else if (!tags.ogImage.startsWith('https://') && tags.ogImage !== '/og-blog-default.jpg') {
    pageErrors.push(`og:image must be https or /og-blog-default.jpg, got: ${tags.ogImage}`);
  }
  
  // Test 5: Twitter card
  if (tags.twitterCard !== 'summary_large_image') {
    pageErrors.push(`twitter:card must be "summary_large_image", got: "${tags.twitterCard}"`);
  }
  
  // Test 6: og:type should be article
  if (tags.ogType !== 'article') {
    pageWarnings.push(`og:type should be "article", got: "${tags.ogType}"`);
  }
  
  // Test 7: Check for duplicate tags
  const duplicates = [];
  if (countMetaTag(html, 'property="og:title"') > 1) duplicates.push('og:title');
  if (countMetaTag(html, 'property="og:description"') > 1) duplicates.push('og:description');
  if (countMetaTag(html, 'property="og:url"') > 1) duplicates.push('og:url');
  if (countMetaTag(html, 'property="og:image"') > 1) duplicates.push('og:image');
  if (countMetaTag(html, 'name="twitter:title"') > 1) duplicates.push('twitter:title');
  if (countMetaTag(html, 'rel="canonical"') > 1) duplicates.push('canonical');
  
  if (duplicates.length > 0) {
    pageErrors.push(`Duplicate meta tags found: ${duplicates.join(', ')}`);
  }
  
  // Test 8: JSON-LD validation
  if (tags.jsonLd) {
    try {
      const jsonLdData = JSON.parse(tags.jsonLd);
      if (jsonLdData['@type'] !== 'BlogPosting') {
        pageWarnings.push('JSON-LD @type should be BlogPosting');
      }
      if (!jsonLdData.headline) {
        pageWarnings.push('JSON-LD missing headline');
      }
    } catch (e) {
      pageErrors.push('Invalid JSON-LD: ' + e.message);
    }
  } else {
    pageWarnings.push('Missing JSON-LD structured data');
  }
  
  return { errors: pageErrors, warnings: pageWarnings };
}

/**
 * Main validation
 */
async function main() {
  console.log('🔍 Starting Blog OG Validation...\n');
  
  // Check dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Error: dist/ directory not found');
    process.exit(1);
  }
  
  // Check .htaccess exists and has blog rules
  const htaccessPath = path.join(DIST_DIR, '.htaccess');
  if (!fs.existsSync(htaccessPath)) {
    errors.push('.htaccess not found in dist/');
  } else {
    const htaccessContent = fs.readFileSync(htaccessPath, 'utf-8');
    
    // Check for both slug.html and slug/index.html rules
    const hasSlugHtmlRule = htaccessContent.includes('/blog/%1.html');
    const hasIndexHtmlRule = htaccessContent.includes('/blog/%1/index.html');
    
    if (!hasSlugHtmlRule && !hasIndexHtmlRule) {
      errors.push('.htaccess missing blog SSG routing rules');
    }
    
    // Check that blog rules come before SPA fallback
    const blogRuleIndex = Math.min(
      htaccessContent.indexOf('/blog/%1.html') >= 0 ? htaccessContent.indexOf('/blog/%1.html') : Infinity,
      htaccessContent.indexOf('/blog/%1/index.html') >= 0 ? htaccessContent.indexOf('/blog/%1/index.html') : Infinity
    );
    const spaFallbackIndex = htaccessContent.indexOf('RewriteRule ^ index.html');
    
    if (blogRuleIndex === Infinity) {
      errors.push('.htaccess: no blog SSG rules found');
    } else if (spaFallbackIndex >= 0 && blogRuleIndex > spaFallbackIndex) {
      errors.push('.htaccess: blog SSG rules must come BEFORE SPA fallback');
    } else {
      console.log('✅ .htaccess has correct blog routing order');
      if (hasSlugHtmlRule) console.log('   ✓ slug.html rule present');
      if (hasIndexHtmlRule) console.log('   ✓ slug/index.html rule present');
    }
  }
  
  // Check default OG image exists
  const defaultOgPath = path.join(DIST_DIR, 'og-blog-default.jpg');
  if (!fs.existsSync(defaultOgPath)) {
    warnings.push('og-blog-default.jpg not found in dist/');
  } else {
    console.log('✅ Default OG image exists');
  }
  
  // Find and validate blog pages
  const blogDir = path.join(DIST_DIR, 'blog');
  if (!fs.existsSync(blogDir)) {
    console.log('ℹ️  No blog directory found - skipping page validation');
  } else {
    const slugs = fs.readdirSync(blogDir).filter(f => {
      const stat = fs.statSync(path.join(blogDir, f));
      return stat.isDirectory();
    });
    
    console.log(`\n📄 Validating ${slugs.length} blog pages...\n`);
    
    // Validate up to 10 pages (or all if fewer)
    const pagesToValidate = slugs.slice(0, Math.min(10, slugs.length));
    
    for (const slug of pagesToValidate) {
      const indexPath = path.join(blogDir, slug, 'index.html');
      if (!fs.existsSync(indexPath)) {
        errors.push(`${slug}: index.html not found`);
        continue;
      }
      
      const html = fs.readFileSync(indexPath, 'utf-8');
      const result = validateBlogPage(slug, html);
      
      if (result.errors.length > 0) {
        errors.push(...result.errors.map(e => `${slug}: ${e}`));
      }
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings.map(w => `${slug}: ${w}`));
      }
      
      if (result.errors.length === 0) {
        console.log(`✅ ${slug}`);
        passCount++;
      } else {
        console.log(`❌ ${slug}`);
        result.errors.forEach(e => console.log(`   - ${e}`));
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Summary:');
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Errors: ${errors.length}`);
  console.log(`   ⚠️  Warnings: ${warnings.length}`);
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`   - ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors (blocking deployment):');
    errors.forEach(e => console.log(`   - ${e}`));
    console.log('\n❌ Validation FAILED - fix errors before deploying\n');
    process.exit(1);
  }
  
  console.log('\n✨ Validation PASSED!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
