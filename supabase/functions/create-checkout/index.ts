import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  businessId?: string;
  userId: string;
  planId: "pro_monthly" | "pro_yearly";
  country: string;
  email?: string;
  localAmount?: number;
  localCurrency?: string;
}

// USD base prices (what we actually charge internationally)
const USD_PRICES = {
  pro_monthly: 29,
  pro_yearly: 290,
};

// ARS prices for Argentina (MercadoPago)
const ARS_PRICES = {
  pro_monthly: 29990,
  pro_yearly: 299900,
};

// PayPal API URLs - Use sandbox for testing, live for production
const PAYPAL_API_URL = Deno.env.get("PAYPAL_MODE") === "live" 
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, userId, planId, country, email, localAmount, localCurrency } = await req.json() as CheckoutRequest;

    console.log(`[Checkout] Starting for user: ${userId}, plan: ${planId}, country: ${country}`);

    if (!userId || !planId) {
      return new Response(
        JSON.stringify({ error: "userId and planId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const APP_URL = Deno.env.get("APP_URL") || "https://vistaceo.lovable.app";

    // ARGENTINA = MercadoPago in ARS
    // ALL OTHER COUNTRIES = PayPal in USD
    const isArgentina = country === "AR";

    if (isArgentina) {
      // =====================
      // MERCADO PAGO (ARGENTINA ONLY - ARS)
      // =====================
      const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
      
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        console.error("[Checkout] MercadoPago access token not configured");
        return new Response(
          JSON.stringify({ error: "MercadoPago not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const amount = ARS_PRICES[planId];
      const description = planId === "pro_yearly" 
        ? "VistaCEO Pro - Anual (2 meses gratis)" 
        : "VistaCEO Pro - Mensual";

      const preferenceData = {
        items: [{
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: "ARS",
        }],
        payer: {
          email: email || "",
        },
        back_urls: {
          success: `${APP_URL}/checkout?status=success`,
          failure: `${APP_URL}/checkout?status=failure`,
          pending: `${APP_URL}/checkout?status=pending`,
        },
        auto_return: "approved",
        external_reference: JSON.stringify({ 
          businessId: businessId || null, 
          userId, 
          planId,
          localAmount: amount,
          localCurrency: "ARS",
        }),
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook?provider=mercadopago`,
      };

      console.log("[Checkout] Creating MercadoPago preference...");

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferenceData),
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error("[Checkout] MercadoPago error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create MercadoPago checkout" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const mpData = await mpResponse.json();
      console.log("[Checkout] MercadoPago preference created:", mpData.id);

      return new Response(
        JSON.stringify({
          provider: "mercadopago",
          checkoutUrl: mpData.init_point,
          preferenceId: mpData.id,
          amount: amount,
          currency: "ARS",
          displayAmount: amount,
          displayCurrency: "ARS",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      // =====================
      // PAYPAL (ALL OTHER COUNTRIES - USD)
      // =====================
      const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
      const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
      
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        console.error("[Checkout] PayPal credentials not configured");
        return new Response(
          JSON.stringify({ error: "PayPal not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Always charge in USD for international
      const usdAmount = USD_PRICES[planId];
      const description = planId === "pro_yearly" 
        ? "VistaCEO Pro - Yearly (2 months free)" 
        : "VistaCEO Pro - Monthly";

      console.log(`[Checkout] Getting PayPal access token from ${PAYPAL_API_URL}...`);

      // Get PayPal access token
      const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error("[Checkout] PayPal auth error:", errorText);
        return new Response(
          JSON.stringify({ 
            error: "Failed to authenticate with PayPal",
            details: "Please verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correct and match the environment (sandbox vs live)"
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authData = await authResponse.json();
      const accessToken = authData.access_token;
      console.log("[Checkout] PayPal authenticated successfully");

      // Create PayPal order in USD
      const orderData = {
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: `${userId}_${planId}_${Date.now()}`,
          description: description,
          custom_id: JSON.stringify({ 
            businessId: businessId || null, 
            userId, 
            planId,
            localAmount: localAmount || null,
            localCurrency: localCurrency || null,
            country,
          }),
          amount: {
            currency_code: "USD",
            value: usdAmount.toFixed(2),
          },
        }],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "VistaCEO",
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: `${APP_URL}/checkout?status=success&provider=paypal`,
              cancel_url: `${APP_URL}/checkout?status=cancelled`,
            },
          },
        },
      };

      console.log("[Checkout] Creating PayPal order...");

      const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("[Checkout] PayPal order error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create PayPal order", details: errorText }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const orderResult = await orderResponse.json();
      const approveLink = orderResult.links.find((l: any) => l.rel === "payer-action") 
        || orderResult.links.find((l: any) => l.rel === "approve");
      
      console.log("[Checkout] PayPal order created:", orderResult.id, "Status:", orderResult.status);

      // Store the order ID for capture later (non-blocking)
      try {
        await supabase.from("business_insights").insert({
          business_id: businessId || "00000000-0000-0000-0000-000000000000",
          category: "payment",
          question: "PayPal Order Created",
          answer: JSON.stringify({
            orderId: orderResult.id,
            userId,
            planId,
            amount: usdAmount,
            status: orderResult.status,
          }),
          metadata: { type: "paypal_order_pending" },
        });
      } catch (logErr) {
        console.warn("[Checkout] Could not log order:", logErr);
      }

      return new Response(
        JSON.stringify({
          provider: "paypal",
          checkoutUrl: approveLink?.href,
          orderId: orderResult.id,
          amount: usdAmount,
          currency: "USD",
          displayAmount: localAmount || usdAmount,
          displayCurrency: localCurrency || "USD",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("[Checkout] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
