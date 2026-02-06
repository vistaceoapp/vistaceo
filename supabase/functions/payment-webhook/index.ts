import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// PayPal API URLs
const PAYPAL_API_URL = Deno.env.get("PAYPAL_MODE") === "live" 
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "mercadopago";
    const action = url.searchParams.get("action");

    // Handle PayPal capture (when user returns from PayPal)
    if (action === "capture" && provider === "paypal") {
      return await handlePayPalCapture(req, supabase);
    }

    if (provider === "mercadopago") {
      // =====================
      // MERCADO PAGO WEBHOOK (Argentina - ARS)
      // =====================
      const body = await req.json();
      console.log("[Webhook] MercadoPago notification:", body.type, body.data?.id);

      if (body.type === "payment") {
        const paymentId = body.data.id;
        
        const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
        const paymentResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: { "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}` },
          }
        );

        if (!paymentResponse.ok) {
          console.error("[Webhook] Failed to get MP payment details");
          return new Response("OK", { status: 200 });
        }

        const payment = await paymentResponse.json();
        console.log("[Webhook] Payment status:", payment.status);

        if (payment.status === "approved") {
          const refData = JSON.parse(payment.external_reference || "{}");
          const { businessId, userId, planId, localAmount, localCurrency } = refData;

          const paymentInfo = {
            provider: "mercadopago" as const,
            paymentId: String(payment.id),
            amount: payment.transaction_amount,
            currency: payment.currency_id || "ARS",
            localAmount: localAmount || payment.transaction_amount,
            localCurrency: localCurrency || "ARS",
          };

          await createSubscription(supabase, businessId, userId, planId, paymentInfo);
        }
      }

      return new Response("OK", { status: 200 });

    } else if (provider === "paypal") {
      // =====================
      // PAYPAL WEBHOOK (International - USD)
      // =====================
      const body = await req.json();
      console.log("[Webhook] PayPal notification:", body.event_type);

      // Verify webhook signature (optional but recommended for production)
      // const isValid = await verifyPayPalWebhook(req, body);

      if (body.event_type === "PAYMENT.CAPTURE.COMPLETED" || 
          body.event_type === "CHECKOUT.ORDER.APPROVED") {
        const resource = body.resource;
        const customId = resource.custom_id || resource.purchase_units?.[0]?.custom_id || "{}";
        const customData = JSON.parse(customId);
        const { businessId, userId, planId, localAmount, localCurrency } = customData;

        const amount = resource.amount?.value 
          || resource.purchase_units?.[0]?.amount?.value 
          || "0";
        const currency = resource.amount?.currency_code 
          || resource.purchase_units?.[0]?.amount?.currency_code 
          || "USD";

        const paymentInfo = {
          provider: "paypal" as const,
          paymentId: resource.id,
          amount: parseFloat(amount),
          currency: currency,
          localAmount: localAmount || null,
          localCurrency: localCurrency || null,
        };

        await createSubscription(supabase, businessId, userId, planId, paymentInfo);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Unknown provider", { status: 400 });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response("OK", { status: 200 });
  }
});

// Handle PayPal payment capture when user returns from PayPal
async function handlePayPalCapture(req: Request, supabase: any) {
  try {
    const body = await req.json();
    const { orderId, userId, businessId, planId, localAmount, localCurrency, country } = body;

    console.log("[Webhook] Capturing PayPal order:", orderId);

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "PayPal not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      console.error("[Webhook] PayPal auth failed");
      return new Response(
        JSON.stringify({ error: "PayPal authentication failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the payment
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureResult = await captureResponse.json();
    console.log("[Webhook] PayPal capture result:", captureResult.status);

    if (captureResult.status === "COMPLETED") {
      const captureInfo = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      
      const paymentInfo = {
        provider: "paypal" as const,
        paymentId: captureInfo?.id || orderId,
        amount: parseFloat(captureInfo?.amount?.value || "29"),
        currency: captureInfo?.amount?.currency_code || "USD",
        localAmount: localAmount || null,
        localCurrency: localCurrency || null,
      };

      await createSubscription(supabase, businessId, userId, planId, paymentInfo);

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "COMPLETED",
          message: "Payment captured successfully"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: captureResult.status,
          message: captureResult.message || "Payment not completed"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("[Webhook] Capture error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to capture payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

interface PaymentInfo {
  provider: "mercadopago" | "paypal";
  paymentId: string;
  amount: number;
  currency: string;
  localAmount?: number | null;
  localCurrency?: string | null;
}

async function createSubscription(
  supabase: any,
  businessId: string | null,
  userId: string,
  planId: string,
  paymentInfo: PaymentInfo
) {
  console.log(`[Webhook] Creating subscription for user ${userId}, plan ${planId}`);

  const now = new Date();
  const expiresAt = new Date(now);
  
  if (planId === "pro_yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  // If no business yet, find user's business
  let targetBusinessId = businessId;
  if (!targetBusinessId) {
    const { data: businesses } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);
    
    if (businesses && businesses.length > 0) {
      targetBusinessId = businesses[0].id;
    }
  }

  if (targetBusinessId) {
    // Create subscription record
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        business_id: targetBusinessId,
        user_id: userId,
        plan_id: planId,
        status: "active",
        payment_provider: paymentInfo.provider,
        payment_id: paymentInfo.paymentId,
        payment_amount: paymentInfo.amount,
        payment_currency: paymentInfo.currency,
        local_amount: paymentInfo.localAmount,
        local_currency: paymentInfo.localCurrency,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

    if (subError) {
      console.error("[Webhook] Failed to create subscription:", subError);
    } else {
      console.log("[Webhook] Subscription created successfully");
    }

    // Update business settings with JSONB merge
    const { data: currentBusiness } = await supabase
      .from("businesses")
      .select("settings")
      .eq("id", targetBusinessId)
      .single();

    const currentSettings = currentBusiness?.settings || {};
    const newSettings = {
      ...currentSettings,
      plan: "pro",
      plan_id: planId,
      plan_expires_at: expiresAt.toISOString(),
      payment_provider: paymentInfo.provider,
      last_payment_at: now.toISOString(),
      last_payment_amount: paymentInfo.amount,
      last_payment_currency: paymentInfo.currency,
    };

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        settings: newSettings,
        updated_at: now.toISOString(),
      })
      .eq("id", targetBusinessId);

    if (updateError) {
      console.error("[Webhook] Failed to update business:", updateError);
    } else {
      console.log("[Webhook] Business settings updated with Pro status");
    }

    // Create audit record
    await supabase.from("business_insights").insert({
      business_id: targetBusinessId,
      category: "payment",
      question: "Upgrade a Pro",
      answer: JSON.stringify({
        plan: planId,
        provider: paymentInfo.provider,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        local_amount: paymentInfo.localAmount,
        local_currency: paymentInfo.localCurrency,
        payment_id: paymentInfo.paymentId,
        expires_at: expiresAt.toISOString(),
      }),
      metadata: { type: "payment_confirmation" },
    });

    console.log(`[Webhook] Subscription complete for business ${targetBusinessId} until ${expiresAt.toISOString()}`);

    // Send Pro Activated email
    try {
      // Get user profile for email details
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      // Get business setup status
      const { data: businessData } = await supabase
        .from("businesses")
        .select("setup_completed")
        .eq("id", targetBusinessId)
        .single();

      if (profile?.email) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

        await fetch(`${SUPABASE_URL}/functions/v1/send-email-pro-activated`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            email: profile.email,
            fullName: profile.full_name || "",
            businessId: targetBusinessId,
            planId,
            setupCompleted: businessData?.setup_completed || false,
          }),
        });
        console.log("[Webhook] Pro activated email triggered");
      }
    } catch (emailError) {
      console.error("[Webhook] Failed to send Pro email (non-blocking):", emailError);
    }
  } else {
    // No business yet - store pending upgrade for when they complete setup
    console.log(`[Webhook] User ${userId} paid for Pro but has no business yet.`);
    
    // Store in profiles or a pending_payments table
    await supabase.from("profiles").update({
      metadata: {
        pending_pro: true,
        pending_plan_id: planId,
        pending_payment_provider: paymentInfo.provider,
        pending_payment_id: paymentInfo.paymentId,
        pending_payment_at: now.toISOString(),
        pending_expires_at: expiresAt.toISOString(),
      }
    }).eq("id", userId);

    console.log(`[Webhook] Stored pending Pro upgrade for user ${userId}`);
  }
}
