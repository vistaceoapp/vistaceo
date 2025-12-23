import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function syncs external data from connected integrations
// In production, each integration would have its own API calls
// For now, we simulate the sync process

interface SyncResult {
  integration: string;
  itemsSynced: number;
  success: boolean;
  message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, integrationTypes } = await req.json();

    if (!businessId) {
      return new Response(
        JSON.stringify({ error: "businessId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[sync-external-data] Starting sync for business: ${businessId}`);

    // Get connected integrations
    const { data: integrations, error: intError } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", "connected");

    if (intError) {
      console.error("Error fetching integrations:", intError);
      throw intError;
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No hay integraciones conectadas",
          results: [] 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: SyncResult[] = [];

    for (const integration of integrations) {
      try {
        console.log(`[sync-external-data] Syncing ${integration.integration_type}...`);
        
        let syncedData: any[] = [];
        
        // Simulate sync based on integration type
        // In production, these would be real API calls
        switch (integration.integration_type) {
          case "google_reviews":
            syncedData = await simulateGoogleReviewsSync(businessId);
            break;
          case "instagram":
            syncedData = await simulateInstagramSync(businessId);
            break;
          case "facebook":
            syncedData = await simulateFacebookSync(businessId);
            break;
          case "mercadopago":
            syncedData = await simulateMercadoPagoSync(businessId);
            break;
          default:
            console.log(`[sync-external-data] No sync handler for ${integration.integration_type}`);
            continue;
        }

        // Insert synced data
        if (syncedData.length > 0) {
          for (const item of syncedData) {
            await supabase.from("external_data").upsert({
              business_id: businessId,
              integration_id: integration.id,
              data_type: item.type,
              external_id: item.external_id,
              content: item.content,
              sentiment_score: item.sentiment_score,
              importance: item.importance,
              synced_at: new Date().toISOString(),
            }, {
              onConflict: "id"
            });
          }
        }

        // Update last sync time
        await supabase
          .from("business_integrations")
          .update({ 
            last_sync_at: new Date().toISOString(),
            metadata: {
              ...integration.metadata,
              last_sync_items: syncedData.length,
            }
          })
          .eq("id", integration.id);

        results.push({
          integration: integration.integration_type,
          itemsSynced: syncedData.length,
          success: true,
        });

        console.log(`[sync-external-data] Synced ${syncedData.length} items from ${integration.integration_type}`);

      } catch (syncError) {
        console.error(`Error syncing ${integration.integration_type}:`, syncError);
        results.push({
          integration: integration.integration_type,
          itemsSynced: 0,
          success: false,
          message: syncError instanceof Error ? syncError.message : "Unknown error",
        });
      }
    }

    // Trigger pattern analysis after sync
    try {
      await supabase.functions.invoke("analyze-patterns", {
        body: { businessId }
      });
      console.log(`[sync-external-data] Triggered pattern analysis`);
    } catch (analysisError) {
      console.error("Error triggering analysis:", analysisError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sincronización completada`,
        results,
        totalItemsSynced: results.reduce((sum, r) => sum + r.itemsSynced, 0),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[sync-external-data] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simulation functions - these would be replaced with real API calls
async function simulateGoogleReviewsSync(businessId: string) {
  // Simulate fetching Google Reviews
  const reviews = [
    {
      type: "review",
      external_id: `gr_${Date.now()}_1`,
      content: {
        rating: 5,
        text: "Excelente servicio, muy buena atención!",
        author: "Cliente 1",
        date: new Date().toISOString(),
      },
      sentiment_score: 0.9,
      importance: 7,
    },
    {
      type: "review",
      external_id: `gr_${Date.now()}_2`,
      content: {
        rating: 4,
        text: "Buena comida, pero un poco lento el servicio.",
        author: "Cliente 2",
        date: new Date().toISOString(),
      },
      sentiment_score: 0.5,
      importance: 8,
    },
  ];
  return reviews;
}

async function simulateInstagramSync(businessId: string) {
  // Simulate fetching Instagram metrics
  return [
    {
      type: "metric",
      external_id: `ig_${Date.now()}_followers`,
      content: {
        metric_type: "followers",
        value: 1250,
        change: +15,
        period: "last_7_days",
      },
      sentiment_score: null,
      importance: 5,
    },
    {
      type: "metric",
      external_id: `ig_${Date.now()}_engagement`,
      content: {
        metric_type: "engagement_rate",
        value: 4.2,
        change: +0.3,
        period: "last_7_days",
      },
      sentiment_score: null,
      importance: 6,
    },
  ];
}

async function simulateFacebookSync(businessId: string) {
  // Simulate fetching Facebook data
  return [
    {
      type: "review",
      external_id: `fb_${Date.now()}_1`,
      content: {
        rating: 5,
        text: "Me encanta este lugar!",
        author: "Usuario FB",
        date: new Date().toISOString(),
      },
      sentiment_score: 0.95,
      importance: 6,
    },
  ];
}

async function simulateMercadoPagoSync(businessId: string) {
  // Simulate fetching MercadoPago transactions
  return [
    {
      type: "transaction",
      external_id: `mp_${Date.now()}_1`,
      content: {
        amount: 15000,
        currency: "ARS",
        status: "approved",
        payment_method: "qr",
        date: new Date().toISOString(),
      },
      sentiment_score: null,
      importance: 5,
    },
    {
      type: "metric",
      external_id: `mp_${Date.now()}_daily`,
      content: {
        metric_type: "daily_sales",
        value: 85000,
        transaction_count: 12,
        period: "today",
      },
      sentiment_score: null,
      importance: 8,
    },
  ];
}