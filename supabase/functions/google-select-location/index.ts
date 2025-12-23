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
    const { businessId, locationId, locationName, locationAddress } = await req.json();

    if (!businessId || !locationId) {
      return new Response(
        JSON.stringify({ error: "businessId and locationId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the integration with the selected location
    const { error: updateError } = await supabase
      .from("business_integrations")
      .update({
        metadata: {
          google_location_id: locationId,
          google_location_name: locationName,
          google_location_address: locationAddress,
          location_selected_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews");

    if (updateError) {
      console.error("Failed to update integration:", updateError);
      throw updateError;
    }

    console.log("Location selected:", locationName, "for business:", businessId);

    return new Response(
      JSON.stringify({ success: true, message: "Location connected successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error selecting location:", error);
    return new Response(
      JSON.stringify({ error: "Failed to select location" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
