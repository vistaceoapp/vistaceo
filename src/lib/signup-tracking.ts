// Recolecta contexto exhaustivo del usuario al momento del signup
// para enviar al admin (info@vistaceo.com) y entender de dónde viene cada lead.
import { safeLocalStorage, safeSessionStorage } from "@/lib/safe-storage";

const FIRST_TOUCH_KEY = "vc_first_touch";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type FirstTouch = {
  landingUrl: string;
  referrer: string;
  utm: Record<string, string>;
  capturedAt: string;
};

/** Llamar lo antes posible (en App.tsx) para guardar el origen real del visitante. */
export function captureFirstTouchIfMissing() {
  try {
    if (safeLocalStorage.getItem(FIRST_TOUCH_KEY)) return;
    const url = new URL(window.location.href);
    const utm: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = url.searchParams.get(k);
      if (v) utm[k] = v;
    }
    const ft: FirstTouch = {
      landingUrl: window.location.href,
      referrer: document.referrer || "",
      utm,
      capturedAt: new Date().toISOString(),
    };
    safeLocalStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(ft));
  } catch {
    // ignore
  }
}

function readFirstTouch(): FirstTouch | null {
  try {
    const raw = safeLocalStorage.getItem(FIRST_TOUCH_KEY);
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}

function detectDevice(ua: string): { device: string; os: string; browser: string } {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
  let os = "Desconocido";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Desconocido";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  return { device: isMobile ? "Móvil" : "Escritorio", os, browser };
}

export function collectSignupTrackingContext() {
  const ft = readFirstTouch();
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const { device, os, browser } = detectDevice(ua);
  const tz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ""; }
  })();
  const language = typeof navigator !== "undefined" ? navigator.language : "";
  const screen = typeof window !== "undefined"
    ? `${window.screen?.width || 0}x${window.screen?.height || 0}`
    : "";
  const pendingPlan = safeLocalStorage.getItem("pendingPlan") || "";
  const sessionStart = safeSessionStorage.getItem("vc_session_start") || "";

  return {
    // Origen / atribución
    landingUrl: ft?.landingUrl || (typeof window !== "undefined" ? window.location.href : ""),
    referrer: ft?.referrer || (typeof document !== "undefined" ? document.referrer : ""),
    utmSource: ft?.utm?.utm_source || "",
    utmMedium: ft?.utm?.utm_medium || "",
    utmCampaign: ft?.utm?.utm_campaign || "",
    utmContent: ft?.utm?.utm_content || "",
    utmTerm: ft?.utm?.utm_term || "",
    firstTouchAt: ft?.capturedAt || "",
    // Contexto técnico
    userAgent: ua.slice(0, 200),
    device,
    os,
    browser,
    language,
    timezone: tz,
    screen,
    // Comportamiento
    pendingPlan,
    sessionStart,
    signupAt: new Date().toISOString(),
    currentUrl: typeof window !== "undefined" ? window.location.href : "",
  };
}
