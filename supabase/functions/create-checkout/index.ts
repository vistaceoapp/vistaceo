import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  businessId?: string;
  userId?: string;
  planId: "pro_monthly" | "pro_yearly";
  country: string;
  email?: string;
  localAmount?: number;
  localCurrency?: string;
  promoToken?: string;
}

// USD base prices (what we actually charge internationally)
const USD_PRICES = {
  pro_monthly: 49,
  pro_yearly: 290,
};

// ARS prices for Argentina (MercadoPago)
const ARS_PRICES = {
  pro_monthly: 49990,
  pro_yearly: 287880,
};

// PayPal API URLs - Use sandbox for testing, live for production
const PAYPAL_API_URL = Deno.env.get("PAYPAL_MODE") === "live" 
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

// PayPal only accepts BCP-47 locales with a 2-letter region (e.g. es-ES, es-MX).
// The previous value `es-419` (LATAM) is not accepted and causes INVALID_REQUEST.
const getPayPalLocale = (country: string) => {
  // Prefer a Spanish locale. PayPal supports es-ES and es-MX broadly.
  if (country === "MX") return "es-MX";
  return "es-ES";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessId, planId, country, localAmount, localCurrency, promoToken } = await req.json() as CheckoutRequest;
    let checkoutCountry = country;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "");
    if (!jwt) {
      return new Response(
        JSON.stringify({ error: "Necesitás iniciar sesión para pagar" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "", {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user: authenticatedUser }, error: authError } = await authClient.auth.getUser();
    if (authError || !authenticatedUser) {
      return new Response(
        JSON.stringify({ error: "La sesión venció. Volvé a ingresar para continuar" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userId = authenticatedUser.id;
    const email = authenticatedUser.email || undefined;
    console.log(`[Checkout] Starting for authenticated user: ${userId}, plan: ${planId}, country: ${checkoutCountry}${promoToken ? ", promo=YES" : ""}`);

    if (!planId || !country || !["pro_monthly", "pro_yearly"].includes(planId)) {
      return new Response(
        JSON.stringify({ error: "Datos de pago incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Promo validation: only valid for pro_monthly, unused, non-expired,
    // and belonging to this user.
    let promoOfferId: string | null = null;
    let promoUsdOverride: number | null = null;
    let promoArsOverride: number | null = null;
    if (promoToken) {
      const { data: offer } = await supabase
        .from("promo_offers")
        .select("id, user_id, recipient_email, plan_id, usd_amount, local_amount, currency, expires_at, used_at, country")
        .eq("token", promoToken)
        .maybeSingle();
      const now = Date.now();
      const recipientMatches = Boolean(
        offer && email && offer.recipient_email
        && offer.recipient_email.trim().toLowerCase() === email.trim().toLowerCase()
      );
      const valid = offer
        && (offer.user_id === userId || recipientMatches)
        && offer.plan_id === planId
        && !offer.used_at
        && new Date(offer.expires_at).getTime() > now;
      if (valid) {
        promoOfferId = offer.id;
        promoUsdOverride = Number(offer.usd_amount);
        checkoutCountry = offer.country || checkoutCountry;
        if (offer.currency === "ARS" && offer.local_amount) {
          promoArsOverride = Number(offer.local_amount);
        }
        console.log(`[Checkout] Promo applied: usd=${promoUsdOverride} ars=${promoArsOverride}`);
      } else {
        console.log(`[Checkout] Promo rejected (found=${!!offer}, identityMatch=${offer?.user_id === userId || recipientMatches}, used=${offer?.used_at}, expired=${offer && new Date(offer.expires_at).getTime() <= now}, planMatch=${offer?.plan_id === planId})`);
        return new Response(
          JSON.stringify({ error: "Ingresá con el mismo email que recibió esta oferta" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    let targetBusinessId = businessId || null;

    if (!targetBusinessId) {
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingBusiness?.id) {
        targetBusinessId = existingBusiness.id;
      } else {
        const placeholderName = email?.split("@")[0]?.trim() || "Mi negocio";
        const { data: placeholderBusiness, error: placeholderError } = await supabase
          .from("businesses")
          .insert({
            name: placeholderName,
            owner_id: userId,
            country: checkoutCountry,
            currency: checkoutCountry === "AR" ? "ARS" : "USD",
            setup_completed: false,
            settings: {
              pre_checkout_created: true,
              pending_plan: planId,
            },
          })
          .select("id")
          .single();

        if (placeholderError) {
          console.error("[Checkout] Failed creating placeholder business:", placeholderError);
          return new Response(
            JSON.stringify({ error: "No se pudo preparar el checkout" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        targetBusinessId = placeholderBusiness.id;
      }
    }

    const APP_URL = Deno.env.get("SITE_URL") || Deno.env.get("APP_URL") || "https://www.vistaceo.com";

    // ARGENTINA = MercadoPago in ARS
    // ALL OTHER COUNTRIES = PayPal in USD
    const isArgentina = checkoutCountry === "AR";

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

      const basePrice = ARS_PRICES[planId];
      const amount = promoArsOverride ?? basePrice;
      const isPromo = promoOfferId !== null;
      const description = isPromo
        ? "VISTACEO Pro - Primer mes (Promo 24hs)"
        : planId === "pro_yearly" 
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
            businessId: targetBusinessId, 
          userId, 
          planId,
          localAmount: amount,
          localCurrency: "ARS",
          promoOfferId,
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
      const usdAmount = promoUsdOverride ?? USD_PRICES[planId];
      const isPromo = promoOfferId !== null;
      const description = isPromo
        ? "VISTACEO Pro - Primer mes (Promo 24hs)"
        : planId === "pro_yearly" 
          ? "VistaCEO Pro - Suscripción Anual (2 meses gratis)" 
          : "VistaCEO Pro - Suscripción Mensual";

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
            businessId: targetBusinessId, 
            userId, 
            planId,
            localAmount: localAmount || null,
            localCurrency: localCurrency || null,
            country: checkoutCountry,
            promoOfferId,
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
              // NO_PREFERENCE permite pagar con tarjeta sin cuenta PayPal
              landing_page: "NO_PREFERENCE",
              user_action: "PAY_NOW",
              // Locale válido para PayPal (BCP-47 con región de 2 letras)
              locale: getPayPalLocale(checkoutCountry),
              shipping_preference: "NO_SHIPPING",
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
          business_id: targetBusinessId || "00000000-0000-0000-0000-000000000000",
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
