import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  businessId?: string; // Optional - may not exist before setup
  userId: string;
  planId: "pro_monthly" | "pro_yearly";
  country: string;
  email?: string;
  currency?: string;
}

// Pricing configuration per plan - Clean prices ending in 99/999
const PRICING = {
  pro_monthly: {
    AR: { amount: 29999, currency: "ARS", description: "VistaCEO Pro - Mensual" },
    DEFAULT: { amount: 29, currency: "USD", description: "VistaCEO Pro - Monthly" },
  },
  pro_yearly: {
    AR: { amount: 299999, currency: "ARS", description: "VistaCEO Pro - Anual (2 meses gratis)" },
    DEFAULT: { amount: 299, currency: "USD", description: "VistaCEO Pro - Yearly (2 months free)" },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, userId, planId, country, email } = await req.json() as CheckoutRequest;

    // Only userId and planId are required - businessId may not exist before setup
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

    // Determine if we should use MercadoPago (Argentina) or PayPal (International)
    const isArgentina = country === "AR";
    const pricing = PRICING[planId][isArgentina ? "AR" : "DEFAULT"];

    if (isArgentina) {
      // =====================
      // MERCADO PAGO CHECKOUT
      // =====================
      const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
      
      if (!MERCADOPAGO_ACCESS_TOKEN) {
        return new Response(
          JSON.stringify({ error: "MercadoPago not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create MercadoPago preference
      const preferenceData = {
        items: [{
          title: pricing.description,
          quantity: 1,
          unit_price: pricing.amount,
          currency_id: pricing.currency,
        }],
        payer: {
          email: email || "", // Use provided email or MP will fill
        },
        back_urls: {
          success: `${Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app"}/checkout?status=success`,
          failure: `${Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app"}/checkout?status=failure`,
          pending: `${Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app"}/checkout?status=pending`,
        },
        auto_return: "approved",
        external_reference: JSON.stringify({ businessId: businessId || null, userId, planId }),
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook?provider=mercadopago`,
      };

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
        console.error("MercadoPago error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create MercadoPago checkout" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const mpData = await mpResponse.json();
      console.log("MercadoPago preference created:", mpData.id);

      return new Response(
        JSON.stringify({
          provider: "mercadopago",
          checkoutUrl: mpData.init_point,
          preferenceId: mpData.id,
          amount: pricing.amount,
          currency: pricing.currency,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      // =====================
      // PAYPAL CHECKOUT
      // =====================
      const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
      const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
      
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: "PayPal not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get PayPal access token
      const authResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!authResponse.ok) {
        console.error("PayPal auth error:", await authResponse.text());
        return new Response(
          JSON.stringify({ error: "Failed to authenticate with PayPal" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authData = await authResponse.json();
      const accessToken = authData.access_token;

      // Create PayPal order
      const orderData = {
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: `${userId}_${planId}`,
          description: pricing.description,
          custom_id: JSON.stringify({ businessId: businessId || null, userId, planId }),
          amount: {
            currency_code: pricing.currency,
            value: pricing.amount.toFixed(2),
          },
        }],
        application_context: {
          brand_name: "VistaCEO",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: `${Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app"}/checkout?status=success`,
          cancel_url: `${Deno.env.get("APP_URL") || "https://id-preview--1ff7ac2b-f14d-46a6-b810-8f2856f7779d.lovable.app"}/checkout?status=cancelled`,
        },
      };

      const orderResponse = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("PayPal order error:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create PayPal order" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const orderResult = await orderResponse.json();
      const approveLink = orderResult.links.find((l: any) => l.rel === "approve");
      
      console.log("PayPal order created:", orderResult.id);

      return new Response(
        JSON.stringify({
          provider: "paypal",
          checkoutUrl: approveLink?.href,
          orderId: orderResult.id,
          amount: pricing.amount,
          currency: pricing.currency,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
