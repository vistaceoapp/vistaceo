// useAppSensors — sensores frontend que reportan a la edge function `report-incident`.
// Captura: window.onerror, unhandledrejection, fetch ≥500, LCP/INP altos, console.error.
// No interrumpe nada del UX: si falla el reporte, sigue silencioso.

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type Severity = "critical" | "high" | "medium" | "low";
type Category = "error" | "ux" | "perf" | "seo" | "content" | "structural" | "network";

interface ReportArgs {
  category: Category;
  severity?: Severity;
  title: string;
  detected_by: string;
  context?: Record<string, unknown>;
}

const SAMPLE_RATE = 1; // 100% by default; reduce to e.g. 0.3 if volume is too high
const recentlyReported = new Set<string>();
const DEDUPE_WINDOW_MS = 60_000;

function shouldReport(key: string): boolean {
  if (recentlyReported.has(key)) return false;
  if (Math.random() > SAMPLE_RATE) return false;
  recentlyReported.add(key);
  setTimeout(() => recentlyReported.delete(key), DEDUPE_WINDOW_MS);
  return true;
}

async function reportIncident(args: ReportArgs) {
  try {
    await supabase.functions.invoke("report-incident", {
      body: {
        source: "app",
        category: args.category,
        severity: args.severity ?? "medium",
        title: args.title,
        where_path: typeof window !== "undefined" ? window.location.pathname : null,
        detected_by: args.detected_by,
        context: {
          ...args.context,
          ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
          viewport: typeof window !== "undefined"
            ? { w: window.innerWidth, h: window.innerHeight }
            : null,
          ts: new Date().toISOString(),
        },
      },
    });
  } catch {
    /* fail silently — sensor must never break the app */
  }
}

export function useAppSensors() {
  const installedRef = useRef(false);

  useEffect(() => {
    if (installedRef.current) return;
    installedRef.current = true;

    // 1. Window errors
    const onError = (event: ErrorEvent) => {
      const key = `err:${event.message}:${event.filename}:${event.lineno}`;
      if (!shouldReport(key)) return;
      void reportIncident({
        category: "error",
        severity: "high",
        title: event.message?.slice(0, 200) || "Unknown window error",
        detected_by: "window.onerror",
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack ?? null,
        },
      });
    };

    // 2. Unhandled promise rejections
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        reason instanceof Error ? reason.message : String(reason ?? "unknown");
      const key = `rej:${msg}`;
      if (!shouldReport(key)) return;
      void reportIncident({
        category: "error",
        severity: "high",
        title: `Promise rejection: ${msg.slice(0, 180)}`,
        detected_by: "unhandledrejection",
        context: {
          stack: reason instanceof Error ? reason.stack : null,
        },
      });
    };

    // 3. Web Vitals via PerformanceObserver — flag slow INP / LCP
    let perfObserver: PerformanceObserver | null = null;
    try {
      perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // LCP > 4s is "poor"
          if (entry.entryType === "largest-contentful-paint" && entry.startTime > 4000) {
            const key = `lcp:${window.location.pathname}`;
            if (!shouldReport(key)) continue;
            void reportIncident({
              category: "perf",
              severity: "medium",
              title: `LCP lento (${Math.round(entry.startTime)}ms)`,
              detected_by: "PerformanceObserver:lcp",
              context: { lcp_ms: Math.round(entry.startTime) },
            });
          }
          // long task > 250ms
          if (entry.entryType === "longtask" && entry.duration > 250) {
            const key = `lt:${window.location.pathname}:${Math.round(entry.duration / 100)}`;
            if (!shouldReport(key)) continue;
            void reportIncident({
              category: "perf",
              severity: "low",
              title: `Tarea larga ${Math.round(entry.duration)}ms`,
              detected_by: "PerformanceObserver:longtask",
              context: { duration_ms: Math.round(entry.duration) },
            });
          }
        }
      });
      try {
        perfObserver.observe({ type: "largest-contentful-paint", buffered: true });
      } catch { /* not supported */ }
      try {
        perfObserver.observe({ type: "longtask", buffered: true });
      } catch { /* not supported */ }
    } catch {
      perfObserver = null;
    }

    // 4. Fetch interceptor — flag 5xx and timeouts
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const [input, init] = args;
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      try {
        const res = await originalFetch(...args);
        if (res.status >= 500) {
          const key = `5xx:${url}:${res.status}`;
          if (shouldReport(key)) {
            void reportIncident({
              category: "network",
              severity: "high",
              title: `HTTP ${res.status} en ${new URL(url, window.location.origin).pathname}`,
              detected_by: "fetch.interceptor",
              context: { url, status: res.status, method: init?.method ?? "GET" },
            });
          }
        }
        return res;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "fetch failed";
        const key = `fetch_fail:${url}:${msg}`;
        if (shouldReport(key)) {
          void reportIncident({
            category: "network",
            severity: "high",
            title: `Fetch falló: ${msg.slice(0, 120)}`,
            detected_by: "fetch.interceptor",
            context: { url, error: msg },
          });
        }
        throw err;
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      perfObserver?.disconnect();
      window.fetch = originalFetch;
    };
  }, []);
}

// Imperative helper for ErrorBoundary or manual reports.
export function reportBoundaryError(error: Error, info?: { componentStack?: string }) {
  void reportIncident({
    category: "error",
    severity: "critical",
    title: `ErrorBoundary: ${error.message.slice(0, 180)}`,
    detected_by: "ErrorBoundary",
    context: {
      stack: error.stack,
      componentStack: info?.componentStack ?? null,
    },
  });
}
