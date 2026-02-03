#!/usr/bin/env node
/**
 * VistaSEOOS P0.1 — Production OG Verification
 * Verifies that blog posts serve correct OG/canonical metadata in production
 * Tests with multiple User-Agents (LinkedInBot, FacebookBot, etc.)
 * 
 * Usage:
 *   BLOG_VERIFY_SLUGS=slug1,slug2 node scripts/verify-prod-og.mjs
 *   node scripts/verify-prod-og.mjs --all  # Fetches all published slugs
 */

import { fileURLToPath } from 'url';

const CANONICAL_DOMAIN = 'https://www.vistaceo.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nlewrgmcawzcdazhfiyy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZXdyZ21jYXd6Y2RhemhmaXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDg0NjksImV4cCI6MjA4MjA4NDQ2OX0.fWTySDGOsNNvddTJSj39qVq5gAWwXOVXf-dBzfDDJl0';

// User-Agents to test
const USER_AGENTS = {
  'LinkedInBot': 'LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)',
  'FacebookBot': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'TwitterBot': 'Twitterbot/1.0',
  'WhatsApp': 'WhatsApp/2.19.81 A',
  'Human': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

/**
 * Extract meta tag content from HTML
 */
function extractMeta(html, patterns) {
  const results = {};
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern);
    results[key] = match ? match[1] : null;
  }
  
  return results;
}

/**
 * Count occurrences of a pattern
 */
function countOccurrences(html, pattern) {
  const matches = html.match(new RegExp(pattern, 'gi'));
  return matches ? matches.length : 0;
}

/**
 * Verify a single URL with a specific User-Agent
 */
async function verifyUrl(slug, userAgentName, userAgent) {
  const url = `${CANONICAL_DOMAIN}/blog/${slug}`;
  const expectedCanonical = url;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}`,
        details: null
      };
    }
    
    const html = await response.text();
    
    // Extract all relevant meta tags
    const meta = extractMeta(html, {
      canonical: /<link\s+rel="canonical"\s+href="([^"]+)"/i,
      ogUrl: /<meta\s+property="og:url"\s+content="([^"]+)"/i,
      ogTitle: /<meta\s+property="og:title"\s+content="([^"]+)"/i,
      ogDescription: /<meta\s+property="og:description"\s+content="([^"]+)"/i,
      ogImage: /<meta\s+property="og:image"\s+content="([^"]+)"/i,
      ogType: /<meta\s+property="og:type"\s+content="([^"]+)"/i,
      twitterCard: /<meta\s+name="twitter:card"\s+content="([^"]+)"/i,
      twitterTitle: /<meta\s+name="twitter:title"\s+content="([^"]+)"/i,
      twitterImage: /<meta\s+name="twitter:image"\s+content="([^"]+)"/i,
      title: /<title>([^<]+)<\/title>/i
    });
    
    // Count duplicates
    const duplicates = {
      'og:title': countOccurrences(html, 'property="og:title"'),
      'og:description': countOccurrences(html, 'property="og:description"'),
      'og:url': countOccurrences(html, 'property="og:url"'),
      'og:image': countOccurrences(html, 'property="og:image"'),
      'canonical': countOccurrences(html, 'rel="canonical"')
    };
    
    // Validation checks
    const issues = [];
    
    // Check canonical
    if (!meta.canonical) {
      issues.push('Missing canonical');
    } else if (meta.canonical !== expectedCanonical) {
      issues.push(`Canonical mismatch: "${meta.canonical}" (expected: "${expectedCanonical}")`);
    }
    
    // Check og:url
    if (!meta.ogUrl) {
      issues.push('Missing og:url');
    } else if (meta.ogUrl !== expectedCanonical) {
      issues.push(`og:url mismatch: "${meta.ogUrl}"`);
    }
    
    // Check og:title
    if (!meta.ogTitle || meta.ogTitle.trim() === '') {
      issues.push('Empty or missing og:title');
    }
    
    // Check og:description
    if (!meta.ogDescription || meta.ogDescription.trim() === '') {
      issues.push('Empty or missing og:description');
    }
    
    // Check og:image
    if (!meta.ogImage) {
      issues.push('Missing og:image');
    } else if (!meta.ogImage.startsWith('https://')) {
      issues.push(`og:image not HTTPS: "${meta.ogImage}"`);
    } else if (meta.ogImage.startsWith('data:')) {
      issues.push('og:image is base64 (BLOCKED)');
    }
    
    // Check og:type
    if (meta.ogType !== 'article') {
      issues.push(`og:type should be "article", got: "${meta.ogType}"`);
    }
    
    // Check Twitter card
    if (meta.twitterCard !== 'summary_large_image') {
      issues.push(`twitter:card should be "summary_large_image", got: "${meta.twitterCard}"`);
    }
    
    // Check for duplicates
    for (const [tag, count] of Object.entries(duplicates)) {
      if (count > 1) {
        issues.push(`Duplicate ${tag}: ${count} occurrences`);
      }
    }
    
    // Check if canonical points to home (the MAIN bug we're fixing)
    if (meta.canonical === CANONICAL_DOMAIN || meta.canonical === `${CANONICAL_DOMAIN}/`) {
      issues.push('⚠️  CRITICAL: Canonical points to HOME page!');
    }
    
    return {
      success: issues.length === 0,
      meta,
      duplicates,
      issues,
      error: null
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      details: null
    };
  }
}

/**
 * Fetch all published slugs from Supabase
 */
async function fetchPublishedSlugs() {
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?status=eq.published&select=slug&order=publish_at.desc&limit=20`;
  
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch slugs: ${response.status}`);
  }
  
  const posts = await response.json();
  return posts.map(p => p.slug);
}

/**
 * Print result for a single verification
 */
function printResult(slug, uaName, result) {
  const prefix = result.success 
    ? `${colors.green}✓${colors.reset}` 
    : `${colors.red}✗${colors.reset}`;
  
  console.log(`  ${prefix} ${colors.cyan}${uaName}${colors.reset}`);
  
  if (!result.success) {
    if (result.error) {
      console.log(`    ${colors.red}Error: ${result.error}${colors.reset}`);
    }
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`    ${colors.yellow}→ ${issue}${colors.reset}`);
      });
    }
  } else {
    // Show key values on success
    console.log(`    ${colors.dim}canonical: ${result.meta.canonical}${colors.reset}`);
    console.log(`    ${colors.dim}og:url: ${result.meta.ogUrl}${colors.reset}`);
    console.log(`    ${colors.dim}og:image: ${result.meta.ogImage?.substring(0, 60)}...${colors.reset}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🔍 VistaSEOOS — Production OG Verification\n');
  console.log('=' .repeat(60));
  
  // Get slugs to verify
  let slugs = [];
  
  if (process.argv.includes('--all')) {
    console.log('📡 Fetching all published slugs from Supabase...');
    try {
      slugs = await fetchPublishedSlugs();
      console.log(`   Found ${slugs.length} published posts\n`);
    } catch (error) {
      console.error(`${colors.red}❌ Failed to fetch slugs: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  } else if (process.env.BLOG_VERIFY_SLUGS) {
    slugs = process.env.BLOG_VERIFY_SLUGS.split(',').map(s => s.trim()).filter(Boolean);
  } else {
    console.log(`${colors.yellow}⚠️  No slugs specified.${colors.reset}`);
    console.log('   Usage:');
    console.log('     BLOG_VERIFY_SLUGS=slug1,slug2 node scripts/verify-prod-og.mjs');
    console.log('     node scripts/verify-prod-og.mjs --all\n');
    process.exit(1);
  }
  
  if (slugs.length === 0) {
    console.log(`${colors.yellow}No slugs to verify.${colors.reset}`);
    process.exit(0);
  }
  
  // Verify each slug with each User-Agent
  let totalTests = 0;
  let passedTests = 0;
  const failedSlugs = [];
  
  for (const slug of slugs) {
    console.log(`\n📄 ${colors.cyan}/blog/${slug}${colors.reset}`);
    console.log(`   ${CANONICAL_DOMAIN}/blog/${slug}`);
    
    let slugPassed = true;
    
    for (const [uaName, uaString] of Object.entries(USER_AGENTS)) {
      const result = await verifyUrl(slug, uaName, uaString);
      totalTests++;
      
      if (result.success) {
        passedTests++;
      } else {
        slugPassed = false;
      }
      
      printResult(slug, uaName, result);
    }
    
    if (!slugPassed) {
      failedSlugs.push(slug);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary:\n');
  console.log(`   Slugs tested:  ${slugs.length}`);
  console.log(`   Total checks:  ${totalTests}`);
  console.log(`   ${colors.green}Passed:${colors.reset}        ${passedTests}`);
  console.log(`   ${colors.red}Failed:${colors.reset}        ${totalTests - passedTests}`);
  
  if (failedSlugs.length > 0) {
    console.log(`\n${colors.red}❌ Failed slugs:${colors.reset}`);
    failedSlugs.forEach(slug => console.log(`   - /blog/${slug}`));
    console.log(`\n${colors.red}VERIFICATION FAILED${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}✅ ALL CHECKS PASSED${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch(error => {
  console.error(`${colors.red}❌ Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
