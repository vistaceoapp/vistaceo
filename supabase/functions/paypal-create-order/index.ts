import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  businessId?: string;
  userId: string;
  planId: "pro_monthly" | "pro_yearly";
  country: string;
  email?: string;
  localAmount?: number;
  localCurrency?: string;
}

const USD_PRICES = {
  pro_monthly: 29,
  pro_yearly: 290,
} as const;

const PAYPAL_API_URL = Deno.env.get("PAYPAL_MODE") === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// PayPal Orders API accepts dash locales (es-ES, es-MX)
const getPayPalLocale = (country: string) => {
  if (country === "MX") return "es-MX";
  return "es-ES";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      businessId,
      userId,
      planId,
      country,
      email,
      localAmount,
      localCurrency,
    } = (await req.json()) as CreateOrderRequest;

    if (!userId || !planId || !country) {
      return new Response(JSON.stringify({ error: "userId, planId y country son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (country === "AR") {
      return new Response(JSON.stringify({ error: "PayPal no aplica para AR" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: "PayPal not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const usdAmount = USD_PRICES[planId];
    const description = planId === "pro_yearly"
      ? "VistaCEO Pro - Suscripción Anual (2 meses gratis)"
      : "VistaCEO Pro - Suscripción Mensual";

    // OAuth token
    const authResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("[paypal-create-order] PayPal auth error:", errorText);
      return new Response(JSON.stringify({ error: "PayPal authentication failed", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create order
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${userId}_${planId}_${Date.now()}`,
          description,
          custom_id: JSON.stringify({
            businessId: businessId || null,
            userId,
            planId,
            localAmount: localAmount || null,
            localCurrency: localCurrency || null,
            country,
            email: email || null,
          }),
          amount: {
            currency_code: "USD",
            value: usdAmount.toFixed(2),
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "VistaCEO",
            landing_page: "NO_PREFERENCE",
            user_action: "PAY_NOW",
            locale: getPayPalLocale(country),
            shipping_preference: "NO_SHIPPING",
          },
        },
      },
    };

    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("[paypal-create-order] PayPal order error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to create PayPal order", details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderResult = await orderResponse.json();
    return new Response(JSON.stringify({ orderId: orderResult.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[paypal-create-order] Error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: "Failed to create order", details: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
