// Google Ads Conversion Tracking
// Conversion ID: AW-18121816177
// Conversion Label: vn55CI7e86QcEPHwk8FD (Vista de página / Signup)

const CONVERSION_SEND_TO = "AW-18121816177/vn55CI7e86QcEPHwk8FD";
const FIRED_KEY = "vc_gads_signup_fired";

/**
 * Dispara la conversión de signup en Google Ads.
 * Idempotente: solo se dispara una vez por usuario (persistido en localStorage).
 */
export function fireGoogleAdsSignupConversion(extra?: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(FIRED_KEY)) return;

    const w = window as any;
    w.dataLayer = w.dataLayer || [];

    const fire = () => {
      try {
        if (typeof w.gtag === "function") {
          w.gtag("event", "conversion", {
            send_to: CONVERSION_SEND_TO,
            ...(extra || {}),
          });
        } else {
          w.dataLayer.push({
            event: "conversion",
            send_to: CONVERSION_SEND_TO,
            ...(extra || {}),
          });
        }
        localStorage.setItem(FIRED_KEY, new Date().toISOString());
      } catch (err) {
        console.debug("[gads] conversion fire failed:", err);
      }
    };

    // Si gtag aún no cargó (deferred), reintentar en breve
    if (typeof (window as any).gtag !== "function") {
      setTimeout(fire, 1500);
    } else {
      fire();
    }
  } catch (err) {
    console.debug("[gads] conversion error:", err);
  }
}
