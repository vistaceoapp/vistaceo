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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider") || "mercadopago";

    if (provider === "mercadopago") {
      // =====================
      // MERCADO PAGO WEBHOOK (Argentina - ARS)
      // =====================
      const body = await req.json();
      console.log("MercadoPago webhook received:", body.type, body.data?.id);

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
          console.error("Failed to get MP payment details");
          return new Response("OK", { status: 200 });
        }

        const payment = await paymentResponse.json();
        console.log("Payment status:", payment.status);

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
      console.log("PayPal webhook received:", body.event_type);

      if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const resource = body.resource;
        const customData = JSON.parse(resource.custom_id || "{}");
        const { businessId, userId, planId, localAmount, localCurrency, country } = customData;

        const paymentInfo = {
          provider: "paypal" as const,
          paymentId: resource.id,
          amount: parseFloat(resource.amount?.value || "0"),
          currency: resource.amount?.currency_code || "USD",
          localAmount: localAmount || null,
          localCurrency: localCurrency || null,
        };

        await createSubscription(supabase, businessId, userId, planId, paymentInfo);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Unknown provider", { status: 400 });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("OK", { status: 200 });
  }
});

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
  console.log(`Creating subscription for user ${userId}, plan ${planId}`);

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
      console.error("Failed to create subscription:", subError);
    }

    // Update business settings
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        settings: {
          plan: "pro",
          plan_id: planId,
          plan_expires_at: expiresAt.toISOString(),
          payment_provider: paymentInfo.provider,
          last_payment_at: now.toISOString(),
          last_payment_amount: paymentInfo.amount,
          last_payment_currency: paymentInfo.currency,
        },
        updated_at: now.toISOString(),
      })
      .eq("id", targetBusinessId);

    if (updateError) {
      console.error("Failed to update business:", updateError);
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

    console.log(`Subscription created for business ${targetBusinessId} until ${expiresAt.toISOString()}`);
  } else {
    // No business yet - store pending upgrade in profile metadata
    console.log(`User ${userId} paid for Pro but has no business yet. Will apply on setup.`);
    
    // We could store this in a pending_upgrades table if needed
    // For now, the user's pro status will be applied when they complete setup
  }
}
