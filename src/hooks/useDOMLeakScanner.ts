/**
 * DOM LEAK SCANNER — P0 ZERO LEAKAGE (v2 - Safe)
 * 
 * Detects leaked internal tokens in visible DOM text.
 * v2: Read-only scan + console warning only (no DOM mutation to avoid React crashes).
 */

import { useEffect, useRef } from "react";

// Patterns that should NEVER appear in user-visible text
const LEAK_PATTERNS = [
  /\[object Object\]/,                             // Object stringification leak
  /\bQ_[A-Z]{2,}_\d{2,}\b/,                       // Q_BIO_104
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/,        // UUID
  /\bauth\.uid\b/,                                 // SQL
  /\bconsole\.(log|error|warn|debug)\b/,           // Code
  /\b(undefined|null|NaN|TypeError|ReferenceError)\b/i,  // JS errors
  /\bError:\s/,                                    // Error messages
];

const reportedLeaks = new Set<string>();

function scanTextNode(node: Text): string | null {
  const text = node.textContent || "";
  if (text.trim().length < 3) return null;
  
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(text)) {
      const key = `${pattern.source}:${text.slice(0, 50)}`;
      if (reportedLeaks.has(key)) return null;
      reportedLeaks.add(key);
      return `[Leak] pattern=${pattern.source} text="${text.slice(0, 80)}"`;
    }
  }
  return null;
}

function scanDOM(root: Node): string[] {
  const leaks: string[] = [];
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node: Node | null;
    let count = 0;
    while ((node = walker.nextNode()) && count < 2000) {
      count++;
      const leak = scanTextNode(node as Text);
      if (leak) leaks.push(leak);
    }
  } catch {
    // Silently ignore DOM access errors
  }
  return leaks;
}

export function useDOMLeakScanner(enabled = true) {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Delayed initial scan (read-only)
    const timer = setTimeout(() => {
      const leaks = scanDOM(document.body);
      if (leaks.length > 0) {
        console.warn(`[P0 ZERO LEAKAGE] ${leaks.length} leak(s) detected:`, leaks);
      }
    }, 3000);

    // Observe mutations — read-only, no DOM modification
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const leaks = scanDOM(node);
              if (leaks.length > 0) {
                console.warn(`[P0 ZERO LEAKAGE] Dynamic leak:`, leaks);
              }
            }
          }
        }
      }
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [enabled]);
}
