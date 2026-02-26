import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Get existing integration to MERGE metadata (not overwrite)
    const { data: integration, error: intErr } = await supabase
      .from("business_integrations")
      .select("id, metadata")
      .eq("business_id", businessId)
      .eq("integration_type", "google_reviews")
      .single();

    if (intErr || !integration) {
      return new Response(
        JSON.stringify({ error: "Google Reviews integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingMeta = (integration.metadata as Record<string, any>) || {};

    // Merge with existing metadata to preserve account_email, gbp_locations, etc.
    const mergedMetadata = {
      ...existingMeta,
      google_location_id: locationId,
      google_location_name: locationName,
      google_location_address: locationAddress,
      location_selected_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("business_integrations")
      .update({
        metadata: mergedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration.id);

    if (updateError) {
      console.error("Failed to update integration:", updateError);
      throw updateError;
    }

    console.log("Location selected:", locationName, "for business:", businessId);

    // Auto-trigger initial review sync
    try {
      await supabase.functions.invoke("google-sync-reviews", {
        body: { businessId },
      });
      console.log("Triggered initial review sync after location selection");
    } catch (syncErr) {
      console.warn("Could not trigger initial sync (non-fatal):", syncErr);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Location connected successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error selecting location:", error);
    return new Response(
      JSON.stringify({ error: "Failed to select location", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
