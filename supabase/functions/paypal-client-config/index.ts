import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal accepts BCP-47 locales with a 2-letter region.
const getPayPalLocale = (country: string) => {
  if (country === "MX") return "es_MX";
  // PayPal SDK expects underscore form (es_ES), while API uses dash (es-ES).
  return "es_ES";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { country } = (await req.json().catch(() => ({}))) as { country?: string };

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "PayPal not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        clientId,
        locale: getPayPalLocale(country || ""),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[paypal-client-config] Error:", e);
    return new Response(JSON.stringify({ error: "Failed to load PayPal config" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
