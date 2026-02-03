#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

const DIST_DIR = './dist';
const SITE_URL = 'https://blog.vistaceo.com';

function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name === 'index.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkHtmlFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = load(html);
  const errors = [];
  
  // Get relative path for logging
  const relativePath = path.relative(DIST_DIR, filePath);
  const isHome = relativePath === 'index.html';
  
  // Check charset
  const charset = $('meta[charset]').attr('charset');
  if (!charset || charset.toLowerCase() !== 'utf-8') {
    errors.push(`Missing or invalid charset (expected utf-8, got ${charset})`);
  }
  
  // Check title
  const title = $('title').text();
  if (!title) {
    errors.push('Missing <title>');
  } else if (title.length > 70) {
    errors.push(`Title too long: ${title.length} chars (max 70)`);
  }
  
  // Check meta description
  const description = $('meta[name="description"]').attr('content');
  if (!description) {
    errors.push('Missing meta description');
  } else if (description.length > 170) {
    errors.push(`Meta description too long: ${description.length} chars (max 170)`);
  }
  
  // Check canonical
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    errors.push('Missing canonical URL');
  } else if (!canonical.startsWith(SITE_URL)) {
    errors.push(`Canonical URL doesn't start with ${SITE_URL}: ${canonical}`);
  }
  
  // Check OG tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogUrl = $('meta[property="og:url"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');
  
  if (!ogTitle) errors.push('Missing og:title');
  if (!ogDescription) errors.push('Missing og:description');
  if (!ogImage) errors.push('Missing og:image');
  if (!ogUrl) errors.push('Missing og:url');
  if (!ogType) errors.push('Missing og:type');
  
  // For post pages, verify OG is specific (not home values)
  if (!isHome && ogTitle) {
    if (ogTitle === 'VistaCEO Blog | Insights para PyMEs Latinoamericanas') {
      errors.push('og:title appears to be home page title, not post-specific');
    }
  }
  
  // Check og:image is valid URL
  if (ogImage && !ogImage.startsWith('http')) {
    errors.push(`og:image is not a full URL: ${ogImage}`);
  }
  
  // Check Twitter cards
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  if (!twitterCard) {
    errors.push('Missing twitter:card');
  } else if (twitterCard !== 'summary_large_image') {
    errors.push(`twitter:card should be summary_large_image, got ${twitterCard}`);
  }
  
  // Check JSON-LD
  const jsonLdScripts = $('script[type="application/ld+json"]');
  if (jsonLdScripts.length === 0) {
    errors.push('Missing JSON-LD structured data');
  } else {
    // Verify JSON is valid
    jsonLdScripts.each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (!json['@context'] || json['@context'] !== 'https://schema.org') {
          errors.push(`JSON-LD #${i + 1}: Invalid or missing @context`);
        }
      } catch (e) {
        errors.push(`JSON-LD #${i + 1}: Invalid JSON - ${e.message}`);
      }
    });
  }
  
  return { path: relativePath, errors };
}

async function main() {
  console.log('🔍 SEO Check - VistaCEO Blog\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const htmlFiles = getAllHtmlFiles(DIST_DIR);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  let totalErrors = 0;
  const results = [];
  
  for (const file of htmlFiles) {
    const result = checkHtmlFile(file);
    results.push(result);
    totalErrors += result.errors.length;
  }
  
  // Print results
  for (const result of results) {
    if (result.errors.length > 0) {
      console.log(`❌ ${result.path}`);
      for (const error of result.errors) {
        console.log(`   • ${error}`);
      }
      console.log('');
    } else {
      console.log(`✅ ${result.path}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total: ${htmlFiles.length} files, ${totalErrors} errors`);
  
  if (totalErrors > 0) {
    console.log('\n❌ SEO check FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ SEO check PASSED');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
