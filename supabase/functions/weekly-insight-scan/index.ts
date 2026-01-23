import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[weekly-insight-scan] Starting automated weekly I+D scan...");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get all active businesses with brains
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, category, country, address")
      .eq("setup_completed", true);

    if (bizError) throw bizError;

    console.log(`[weekly-insight-scan] Found ${businesses?.length || 0} active businesses`);

    const results: { businessId: string; insightsCreated: number; error?: string }[] = [];

    for (const business of businesses || []) {
      try {
        console.log(`[weekly-insight-scan] Scanning for business: ${business.name}`);

        // Get brain context for personalization
        const { data: brain } = await supabase
          .from("business_brains")
          .select("primary_business_type, current_focus, factual_memory, dynamic_memory")
          .eq("business_id", business.id)
          .single();

        // Call analyze-patterns with research mode
        const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-patterns`;
        const response = await fetch(analyzeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            businessId: business.id,
            type: "research",
            brainContext: brain
              ? {
                  primaryType: brain.primary_business_type,
                  focus: brain.current_focus,
                  factualMemory: brain.factual_memory,
                }
              : null,
            automated: true,
          }),
        });

        const result = await response.json();
        const insightsCreated = result.learningCreated || 0;

        results.push({ businessId: business.id, insightsCreated });

        // If new insights were created, create a notification
        if (insightsCreated > 0) {
          await supabase.from("insight_notifications").insert({
            business_id: business.id,
            notification_type: "new_insights",
            title: `${insightsCreated} nuevos insights de I+D`,
            message: `El escaneo semanal encontró ${insightsCreated} tendencias relevantes para tu negocio.`,
            insights_count: insightsCreated,
            metadata: {
              scan_type: "weekly_automated",
              scan_date: new Date().toISOString(),
            },
          });

          console.log(`[weekly-insight-scan] Created notification for ${business.name}: ${insightsCreated} insights`);
        }

        // Update or create weekly metrics
        const weekStart = getWeekStart();
        const weekEnd = getWeekEnd();

        // Get current learning items count by type
        const { data: learningItems } = await supabase
          .from("learning_items")
          .select("item_type")
          .eq("business_id", business.id)
          .gte("created_at", weekStart.toISOString())
          .lte("created_at", weekEnd.toISOString());

        const insightsByType: Record<string, number> = {};
        (learningItems || []).forEach((item) => {
          const type = item.item_type || "general";
          insightsByType[type] = (insightsByType[type] || 0) + 1;
        });

        // Get applied/dismissed counts from signals
        const { count: appliedCount } = await supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business.id)
          .eq("signal_type", "research_converted")
          .gte("created_at", weekStart.toISOString());

        const { count: dismissedCount } = await supabase
          .from("signals")
          .select("*", { count: "exact", head: true })
          .eq("business_id", business.id)
          .eq("signal_type", "research_dismissed")
          .gte("created_at", weekStart.toISOString());

        // Upsert metrics for this week
        const { error: metricsError } = await supabase.from("insight_metrics").upsert(
          {
            business_id: business.id,
            period_start: weekStart.toISOString().split("T")[0],
            period_end: weekEnd.toISOString().split("T")[0],
            total_insights: learningItems?.length || 0,
            insights_by_type: insightsByType,
            insights_applied: appliedCount || 0,
            insights_dismissed: dismissedCount || 0,
            top_categories: Object.entries(insightsByType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => ({ category, count })),
          },
          {
            onConflict: "business_id,period_start",
            ignoreDuplicates: false,
          }
        );

        if (metricsError) {
          console.warn(`[weekly-insight-scan] Error upserting metrics: ${metricsError.message}`);
        }
      } catch (bizScanError) {
        console.error(`[weekly-insight-scan] Error scanning ${business.id}:`, bizScanError);
        results.push({
          businessId: business.id,
          insightsCreated: 0,
          error: bizScanError instanceof Error ? bizScanError.message : "Unknown error",
        });
      }
    }

    const totalInsights = results.reduce((sum, r) => sum + r.insightsCreated, 0);
    console.log(`[weekly-insight-scan] Completed. Total insights created: ${totalInsights}`);

    return new Response(
      JSON.stringify({
        success: true,
        businessesScanned: results.length,
        totalInsightsCreated: totalInsights,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[weekly-insight-scan] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

function getWeekEnd(): Date {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}
