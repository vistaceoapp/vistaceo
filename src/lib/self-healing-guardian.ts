/**
 * Self-Healing Guardian — CEO 24/7
 * 
 * Continuously monitors the app for errors, data inconsistencies,
 * and UX issues. Auto-repairs what it can, logs what it can't.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPES
// ============================================

interface GuardianIssue {
  id: string;
  type: 'render_error' | 'data_leak' | 'broken_link' | 'stale_data' | 'missing_data' | 'ui_overflow';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  autoFixed: boolean;
  fixApplied?: string;
  timestamp: Date;
}

interface GuardianState {
  isRunning: boolean;
  lastScan: Date | null;
  issuesFound: number;
  issuesFixed: number;
  log: GuardianIssue[];
}

const state: GuardianState = {
  isRunning: false,
  lastScan: null,
  issuesFound: 0,
  issuesFixed: 0,
  log: [],
};

// ============================================
// TEXT SANITIZATION
// ============================================

/**
 * Sanitize any value to ensure it's safe for React rendering.
 * Catches: [object Object], raw JSON, URLs in wrong places, undefined/null strings.
 */
export function sanitizeForDisplay(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    // Catch "[object Object]" leaks
    if (value === '[object Object]') return '';
    // Catch raw JSON objects stringified
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        const parsed = JSON.parse(value);
        // Return a meaningful field if possible
        return parsed.title || parsed.name || parsed.text || parsed.message || '';
      } catch { return value; }
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(sanitizeForDisplay).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return obj.title as string || obj.name as string || obj.text as string || '';
  }
  return '';
}

/**
 * Clean URL from display text — extract domain or label.
 */
export function cleanUrlForDisplay(url: string): string {
  if (!url) return '';
  try {
    if (url.startsWith('http')) {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    }
  } catch { /* not a URL */ }
  // Strip URLs from mixed text
  return url.replace(/https?:\/\/[^\s]+/g, '').trim() || url;
}

// ============================================
// DOM HEALTH CHECKS
// ============================================

/**
 * Scan visible DOM for common issues.
 */
function scanDOMHealth(): GuardianIssue[] {
  const issues: GuardianIssue[] = [];

  // 1. Check for text overflow / truncation issues
  document.querySelectorAll('[class*="truncate"], [class*="line-clamp"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.scrollWidth > htmlEl.clientWidth * 1.5) {
      // Element is severely overflowing
      issues.push({
        id: `overflow-${Date.now()}-${Math.random()}`,
        type: 'ui_overflow',
        severity: 'info',
        description: `Text overflow detected: "${htmlEl.textContent?.substring(0, 50)}..."`,
        autoFixed: false,
        timestamp: new Date(),
      });
    }
  });

  // 2. Check for [object Object] leaks in visible text
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent || '';
    if (text.includes('[object Object]')) {
      issues.push({
        id: `object-leak-${Date.now()}`,
        type: 'data_leak',
        severity: 'critical',
        description: `[object Object] leak in DOM near: "${text.substring(0, 80)}"`,
        autoFixed: true,
        fixApplied: 'Replaced with empty string',
        timestamp: new Date(),
      });
      // Auto-fix: remove the leaked text
      node.textContent = text.replace(/\[object Object\]/g, '');
    }
  }

  // 3. Check for raw URLs displayed in cards (not in <a> tags)
  document.querySelectorAll('p, span, div').forEach((el) => {
    const text = el.textContent || '';
    const parent = el.parentElement;
    if (
      text.match(/https?:\/\/[^\s]{60,}/) && // Long URLs
      el.tagName !== 'A' &&
      !parent?.closest('a') &&
      !el.closest('[data-allow-urls]')
    ) {
      issues.push({
        id: `raw-url-${Date.now()}-${Math.random()}`,
        type: 'data_leak',
        severity: 'warning',
        description: `Raw URL displayed in non-link element: "${text.substring(0, 60)}..."`,
        autoFixed: false,
        timestamp: new Date(),
      });
    }
  });

  return issues;
}

// ============================================
// DATA HEALTH CHECKS
// ============================================

/**
 * Check for stale or missing critical data.
 */
async function scanDataHealth(businessId: string): Promise<GuardianIssue[]> {
  const issues: GuardianIssue[] = [];

  try {
    // Check brain freshness
    const { data: brain } = await supabase
      .from('business_brains')
      .select('updated_at, last_learning_at, confidence_score')
      .eq('business_id', businessId)
      .maybeSingle();

    if (!brain) {
      issues.push({
        id: `no-brain-${businessId}`,
        type: 'missing_data',
        severity: 'critical',
        description: 'Business brain not initialized',
        autoFixed: false,
        timestamp: new Date(),
      });
    } else {
      const brainAge = Date.now() - new Date(brain.updated_at).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (brainAge > sevenDays) {
        issues.push({
          id: `stale-brain-${businessId}`,
          type: 'stale_data',
          severity: 'warning',
          description: `Brain data is ${Math.floor(brainAge / (24 * 60 * 60 * 1000))} days old`,
          autoFixed: false,
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    console.warn('[Guardian] Data scan error:', error);
  }

  return issues;
}

// ============================================
// ERROR INTERCEPTION
// ============================================

let errorListenerInstalled = false;

function installGlobalErrorHandlers() {
  if (errorListenerInstalled) return;
  errorListenerInstalled = true;

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const message = error?.message || String(error);
    
    // Auto-recover from known issues
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      console.warn('[Guardian] Network error intercepted, will retry on next action');
      event.preventDefault();
      return;
    }

    if (message.includes('Objects are not valid as a React child')) {
      console.error('[Guardian] React render error — object leaked to UI');
      state.log.push({
        id: `react-child-${Date.now()}`,
        type: 'render_error',
        severity: 'critical',
        description: `React child error: ${message.substring(0, 100)}`,
        autoFixed: false,
        timestamp: new Date(),
      });
      event.preventDefault();
      return;
    }
  });

  // Catch runtime errors
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    
    // Suppress non-critical errors
    if (
      message.includes('ResizeObserver') ||
      message.includes('Script error') ||
      message.includes('Loading chunk')
    ) {
      event.preventDefault();
      return;
    }

    state.log.push({
      id: `runtime-${Date.now()}`,
      type: 'render_error',
      severity: 'warning',
      description: message.substring(0, 150),
      autoFixed: false,
      timestamp: new Date(),
    });
  });
}

// ============================================
// MAIN GUARDIAN LOOP
// ============================================

let scanInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the self-healing guardian.
 * Runs DOM scans every 30s and data scans every 5min.
 */
export function startGuardian(businessId?: string) {
  if (state.isRunning) return;
  state.isRunning = true;

  installGlobalErrorHandlers();

  // DOM scan every 30 seconds
  let scanCount = 0;
  scanInterval = setInterval(() => {
    scanCount++;
    
    // DOM scan
    const domIssues = scanDOMHealth();
    if (domIssues.length > 0) {
      state.issuesFound += domIssues.length;
      state.issuesFixed += domIssues.filter(i => i.autoFixed).length;
      state.log.push(...domIssues);
      
      // Keep log manageable
      if (state.log.length > 100) {
        state.log = state.log.slice(-50);
      }
    }

    // Data scan every 5 minutes (every 10th DOM scan)
    if (businessId && scanCount % 10 === 0) {
      scanDataHealth(businessId).then(dataIssues => {
        state.issuesFound += dataIssues.length;
        state.log.push(...dataIssues);
      });
    }

    state.lastScan = new Date();
  }, 30000);

  // Initial scan after 3 seconds
  setTimeout(() => {
    const initialIssues = scanDOMHealth();
    state.issuesFound += initialIssues.length;
    state.issuesFixed += initialIssues.filter(i => i.autoFixed).length;
    state.log.push(...initialIssues);
    state.lastScan = new Date();
  }, 3000);

  console.log('[Guardian] Self-healing guardian started ✓');
}

export function stopGuardian() {
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  state.isRunning = false;
}

export function getGuardianState(): GuardianState {
  return { ...state };
}

export default { startGuardian, stopGuardian, getGuardianState, sanitizeForDisplay, cleanUrlForDisplay };
