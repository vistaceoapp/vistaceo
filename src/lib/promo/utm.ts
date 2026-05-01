// UTM-preserving helpers for /promo landing.
// Reads current URL params and forwards Google Ads / attribution params
// to the auth flow so we never lose the source of a paid lead.

const FORWARD_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
] as const;

function readForwardParams(): URLSearchParams {
  const out = new URLSearchParams();
  if (typeof window === "undefined") return out;
  try {
    const current = new URLSearchParams(window.location.search);
    for (const key of FORWARD_KEYS) {
      const v = current.get(key);
      if (v) out.set(key, v);
    }
  } catch {
    // ignore — return empty
  }
  return out;
}

function buildHref(base: string, mode: "signup" | "login", extra?: Record<string, string>) {
  const params = readForwardParams();
  params.set("mode", mode);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  return `${base}?${params.toString()}`;
}

export function buildSignupHref(extra?: Record<string, string>) {
  return buildHref("/auth", "signup", { from: "promo", ...(extra || {}) });
}

export function buildLoginHref(extra?: Record<string, string>) {
  return buildHref("/auth", "login", { from: "promo", ...(extra || {}) });
}

export function getCurrentUTMs() {
  const params = readForwardParams();
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
    gclid: params.get("gclid") || "",
  };
}

export const PROMO_ORIGIN_KEY = "vc_promo_origin";

export function markPromoOrigin() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PROMO_ORIGIN_KEY, "1");
  } catch {
    // ignore
  }
}

export function isPromoOrigin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(PROMO_ORIGIN_KEY) === "1") return true;
    // fallback: ?from=promo in current URL
    const url = new URL(window.location.href);
    if (url.searchParams.get("from") === "promo") return true;
    // fallback: came from /promo path
    if (document.referrer && document.referrer.includes("/promo")) return true;
  } catch {
    // ignore
  }
  return false;
}
