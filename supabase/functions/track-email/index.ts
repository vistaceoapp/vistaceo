// track-email
// Public endpoint (no JWT) that tracks email opens (1x1 pixel) and clicks (redirect).
// Usage:
//   GET /track-email?e=<trackingId>&t=open                 -> 1x1 GIF
//   GET /track-email?e=<trackingId>&t=click&u=<encodedURL> -> 302 redirect
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const PIXEL = Uint8Array.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
]);

function pixelResponse() {
  return new Response(PIXEL, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const trackingId = url.searchParams.get("e") || "";
    const type = (url.searchParams.get("t") || "open").toLowerCase();
    const target = url.searchParams.get("u") || "";
    const template = url.searchParams.get("tpl") || null;
    const recipient = (url.searchParams.get("r") || "").toLowerCase();

    const ua = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "";

    // Fire-and-forget insert (do not block redirect on DB)
    if (trackingId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        await supabase.from("email_engagement_events").insert({
          tracking_id: trackingId,
          recipient_email: recipient || "unknown@unknown",
          template_name: template,
          event_type: type === "click" ? "click" : "open",
          url: target || null,
          user_agent: ua.slice(0, 500),
          ip: ip.slice(0, 64),
        });
      } catch (e) {
        console.error("[track-email] insert failed", e);
      }
    }

    if (type === "click" && target) {
      // Validate URL to avoid open-redirect to arbitrary protocols
      let safe = "https://www.vistaceo.com/";
      try {
        const u = new URL(target);
        if (u.protocol === "https:" || u.protocol === "http:") safe = u.toString();
      } catch { /* ignore */ }
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: safe, "Cache-Control": "no-store" },
      });
    }

    return pixelResponse();
  } catch (err) {
    console.error("[track-email] error", err);
    return pixelResponse();
  }
});
