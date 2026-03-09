import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["info@vistaceo.com", "lickevinmerdinian@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    // Delete user
    if (action === "delete_user") {
      const { userId } = body;
      if (!userId) throw new Error("userId required");

      // Delete from auth (cascades to profiles via trigger)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        action_type: "delete_user",
        target_user_id: userId,
        action_data: { deleted_at: new Date().toISOString() },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update subscription (grant/revoke pro)
    if (action === "update_subscription") {
      const { userId, planId, durationDays } = body;
      if (!userId) throw new Error("userId required");

      // Get user's business
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId)
        .limit(1);

      const businessId = businesses?.[0]?.id;

      if (planId === "free" || planId === "revoke") {
        // Revoke: deactivate all active subscriptions
        if (businessId) {
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
            .eq("business_id", businessId)
            .eq("status", "active");

          await supabase
            .from("businesses")
            .update({ settings: { plan: "free" } })
            .eq("id", businessId);
        }
      } else {
        // Grant pro
        const days = durationDays || 365;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

        if (businessId) {
          // Deactivate existing
          await supabase
            .from("subscriptions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
            .eq("business_id", businessId)
            .eq("status", "active");

          // Create new
          await supabase.from("subscriptions").insert({
            business_id: businessId,
            user_id: userId,
            plan_id: planId || "pro_yearly",
            status: "active",
            payment_provider: "admin_grant",
            payment_id: `admin_${Date.now()}`,
            payment_amount: 0,
            payment_currency: "USD",
            starts_at: new Date().toISOString(),
            expires_at: expiresAt,
          });

          await supabase
            .from("businesses")
            .update({ settings: { plan: "pro", plan_id: planId || "pro_yearly" } })
            .eq("id", businessId);
        }
      }

      await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        action_type: "update_subscription",
        target_user_id: userId,
        action_data: { planId, durationDays },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update user profile
    if (action === "update_profile") {
      const { userId, updates } = body;
      if (!userId) throw new Error("userId required");

      const allowedFields = ["full_name"];
      const safeUpdates: Record<string, any> = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) safeUpdates[key] = updates[key];
      }

      if (Object.keys(safeUpdates).length > 0) {
        await supabase.from("profiles").update(safeUpdates).eq("id", userId);
      }

      await supabase.from("admin_audit_log").insert({
        admin_user_id: user.id,
        action_type: "update_profile",
        target_user_id: userId,
        action_data: safeUpdates,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Admin manage users error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
