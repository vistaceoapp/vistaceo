import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, websiteUrl, trackingOptions } = await req.json();

    if (!businessId || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: "businessId and websiteUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique tracking ID
    const trackingId = `va_${crypto.randomUUID().slice(0, 8)}`;

    // Generate tracking script
    const trackingScript = generateTrackingScript(trackingId, websiteUrl, trackingOptions);

    // Save web analytics integration
    const { data, error } = await supabase
      .from("business_integrations")
      .upsert({
        business_id: businessId,
        integration_type: "web_analytics",
        status: "connected",
        credentials: {
          tracking_id: trackingId,
          website_url: websiteUrl,
        },
        metadata: {
          website_url: websiteUrl,
          tracking_id: trackingId,
          tracking_options: trackingOptions || {
            pageViews: true,
            clicks: true,
            forms: true,
            ecommerce: true,
            scrollDepth: true,
          },
          connected_at: new Date().toISOString(),
          // Initialize metrics
          visitors: 0,
          page_views: 0,
          conversion_rate: 0,
          cart_to_purchase: 0,
          comments_count: 0,
          avg_session_duration: 0,
        },
      }, { onConflict: "business_id,integration_type" });

    if (error) throw error;

    console.log("Web analytics setup for business:", businessId, "tracking_id:", trackingId);

    return new Response(
      JSON.stringify({ 
        success: true,
        trackingId,
        trackingScript,
        instructions: [
          "1. Copia el script de tracking",
          "2. Pégalo antes de </head> en tu sitio web",
          "3. Los datos comenzarán a sincronizarse automáticamente",
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error setting up web analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to setup web analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateTrackingScript(trackingId: string, websiteUrl: string, options: any): string {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  
  return `<!-- Vistaceo Web Analytics -->
<script>
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'va.start':new Date().getTime(),event:'va.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s);
  j.async=true;
  j.src='${SUPABASE_URL}/functions/v1/web-analytics-tracker?id='+i;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','vaLayer','${trackingId}');
</script>
<!-- End Vistaceo Analytics -->`;
}
