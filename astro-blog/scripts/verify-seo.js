#!/usr/bin/env node

/**
 * SEO Verification Script
 * Checks that critical SEO files are present and properly formatted
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = './dist';
const REQUIRED_FILES = ['robots.txt', 'sitemap.xml', 'index.html'];
const SITE_URL = 'https://blog.vistaceo.com';

let errors = 0;
let warnings = 0;

function log(type, message) {
  const prefix = {
    error: '❌ ERROR:',
    warn: '⚠️  WARN:',
    ok: '✅ OK:',
    info: 'ℹ️  INFO:'
  };
  console.log(`${prefix[type] || ''} ${message}`);
}

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  log('error', `${DIST_DIR} directory not found. Run build first.`);
  process.exit(1);
}

// Check required files
console.log('\n=== Checking Required SEO Files ===\n');

for (const file of REQUIRED_FILES) {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    log('ok', `${file} exists (${stats.size} bytes)`);
  } else {
    log('error', `${file} is MISSING!`);
    errors++;
  }
}

// Check robots.txt content
console.log('\n=== Checking robots.txt Content ===\n');

const robotsPath = path.join(DIST_DIR, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  
  // Check for accidental blocking
  if (robotsContent.includes('Disallow: /') && !robotsContent.includes('Allow: /')) {
    log('error', 'robots.txt may be blocking all crawlers!');
    errors++;
  } else if (robotsContent.includes('Allow: /')) {
    log('ok', 'robots.txt allows crawling');
  }
  
  // Check for sitemap reference
  if (robotsContent.includes('Sitemap:')) {
    log('ok', 'robots.txt includes sitemap reference');
  } else {
    log('warn', 'robots.txt should include sitemap reference');
    warnings++;
  }
  
  // Check sitemap URL is correct
  if (robotsContent.includes(`${SITE_URL}/sitemap.xml`)) {
    log('ok', 'Sitemap URL is correct');
  } else if (robotsContent.includes('sitemap.xml')) {
    log('warn', 'Sitemap URL might not be absolute');
    warnings++;
  }
}

// Check sitemap.xml content
console.log('\n=== Checking sitemap.xml Content ===\n');

const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  // Check if it's valid XML
  if (sitemapContent.startsWith('<?xml')) {
    log('ok', 'sitemap.xml has valid XML declaration');
  } else {
    log('error', 'sitemap.xml missing XML declaration');
    errors++;
  }
  
  // Count URLs
  const urlMatches = sitemapContent.match(/<url>/g) || [];
  log('info', `sitemap.xml contains ${urlMatches.length} URLs`);
  
  if (urlMatches.length < 5) {
    log('warn', 'sitemap.xml has very few URLs');
    warnings++;
  }
  
  // Check for correct site URL
  if (sitemapContent.includes(SITE_URL)) {
    log('ok', `URLs use correct domain: ${SITE_URL}`);
  } else {
    log('error', `URLs should use ${SITE_URL}`);
    errors++;
  }
  
  // Check for trailing slashes consistency
  const trailingSlashUrls = (sitemapContent.match(/blog\.vistaceo\.com\/[^<]+\//g) || []).length;
  const noTrailingSlashUrls = (sitemapContent.match(/blog\.vistaceo\.com\/[^<\/]+(?=<)/g) || []).length;
  
  if (trailingSlashUrls > 0 && noTrailingSlashUrls > 0) {
    log('warn', `Mixed trailing slashes: ${trailingSlashUrls} with, ${noTrailingSlashUrls} without`);
    warnings++;
  }
}

// Check HTML files for noindex
console.log('\n=== Checking HTML for noindex ===\n');

const htmlFiles = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.html'));
let noindexFound = false;

for (const file of htmlFiles.slice(0, 5)) {
  const filePath = path.join(DIST_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('noindex') || content.includes('NOINDEX')) {
    log('error', `${file} contains noindex directive!`);
    noindexFound = true;
    errors++;
  }
  
  // Check for canonical
  if (content.includes('rel="canonical"')) {
    log('ok', `${file} has canonical tag`);
  } else if (file === 'index.html') {
    log('warn', `${file} missing canonical tag`);
    warnings++;
  }
}

if (!noindexFound) {
  log('ok', 'No noindex directives found in checked HTML files');
}

// Summary
console.log('\n=== SEO Check Summary ===\n');

if (errors > 0) {
  log('error', `${errors} error(s) found - FIX BEFORE DEPLOYING`);
  process.exit(1);
} else if (warnings > 0) {
  log('warn', `${warnings} warning(s) found but OK to deploy`);
} else {
  log('ok', 'All SEO checks passed!');
}

console.log('');
