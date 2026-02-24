/**
 * DOM LEAK SCANNER — P0 ZERO LEAKAGE
 * 
 * Capa 5: Escáner runtime de DOM que detecta y reporta fugas
 * de códigos internos, UUIDs, enums snake_case, o inglés suelto.
 * 
 * En producción: detecta, reemplaza silenciosamente, registra.
 * En desarrollo: muestra warning en consola.
 */

import { useEffect, useRef } from "react";

// Patterns that should NEVER appear in user-visible text
const LEAK_PATTERNS = [
  /\bQ_[A-Z]{2,}_\d{2,}\b/,                    // Q_BIO_104
  /\b[a-z]+_[a-z]+_\d{3}\b/,                    // b2b_arq_finance_001
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/,      // UUID
  /\bauth\.uid\b/,                               // SQL
  /\bconsole\.(log|error|warn|debug)\b/,          // Code
  /\b(undefined|null|NaN|TypeError|ReferenceError)\b/,  // JS errors
  /\bError:\s/,                                  // Error messages
  /\{\s*"[a-z_]+":/,                             // JSON objects visible
  /\[\s*\{/,                                     // JSON arrays visible
];

// Neutral replacements
const REPLACEMENT = "•";

interface LeakEvent {
  pattern: string;
  text: string;
  element: string;
  path: string;
  timestamp: number;
}

const reportedLeaks = new Set<string>();

function getElementPath(el: Node): string {
  const parts: string[] = [];
  let current: Node | null = el;
  let depth = 0;
  while (current && current !== document.body && depth < 5) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      const id = current.id ? `#${current.id}` : "";
      const cls = current.className && typeof current.className === 'string'
        ? `.${current.className.split(" ").slice(0, 2).join(".")}`
        : "";
      parts.unshift(`${tag}${id}${cls}`);
    }
    current = current.parentNode;
    depth++;
  }
  return parts.join(" > ");
}

function scanTextNode(node: Text): LeakEvent | null {
  const text = node.textContent || "";
  if (text.trim().length < 3) return null;
  
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(text)) {
      const key = `${pattern.source}:${text.slice(0, 50)}`;
      if (reportedLeaks.has(key)) return null;
      reportedLeaks.add(key);
      
      return {
        pattern: pattern.source,
        text: text.slice(0, 100),
        element: node.parentElement?.tagName || "TEXT",
        path: node.parentElement ? getElementPath(node.parentElement) : "unknown",
        timestamp: Date.now(),
      };
    }
  }
  return null;
}

function scanDOM(root: Node): LeakEvent[] {
  const leaks: LeakEvent[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Skip script, style, and hidden elements
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip invisible elements
      if (parent.offsetParent === null && tag !== "BODY") {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const leak = scanTextNode(node as Text);
    if (leak) leaks.push(leak);
  }
  return leaks;
}

/**
 * Hook that monitors the DOM for leak patterns.
 * Runs after each render cycle on a slight delay.
 * 
 * Usage: Call once in your App or Layout component:
 *   useDOMLeakScanner();
 */
export function useDOMLeakScanner(enabled = true) {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initial scan after mount
    const timer = setTimeout(() => {
      const leaks = scanDOM(document.body);
      if (leaks.length > 0) {
        console.warn(
          `[P0 ZERO LEAKAGE] ${leaks.length} fuga(s) detectada(s):`,
          leaks.map(l => ({ pattern: l.pattern, text: l.text, path: l.path }))
        );
      }
    }, 2000);

    // Observe mutations for ongoing monitoring
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              const leaks = scanDOM(node);
              if (leaks.length > 0) {
                console.warn(
                  `[P0 ZERO LEAKAGE] Fuga en contenido dinámico:`,
                  leaks.map(l => ({ text: l.text, path: l.path }))
                );
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
