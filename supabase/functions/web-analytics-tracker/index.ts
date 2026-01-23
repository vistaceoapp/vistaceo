import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/javascript",
};

serve(async (req) => {
  const url = new URL(req.url);
  const trackingId = url.searchParams.get("id");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // If this is a tracking request (POST), handle it
  if (req.method === "POST") {
    return handleTrackingEvent(req, trackingId);
  }

  // Otherwise, serve the tracking script
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  
  const script = `
(function() {
  var va = window.vaLayer = window.vaLayer || [];
  var trackingId = '${trackingId}';
  var endpoint = '${SUPABASE_URL}/functions/v1/web-analytics-tracker';
  
  // Session tracking
  var sessionId = sessionStorage.getItem('va_session') || 'ses_' + Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('va_session', sessionId);
  
  var visitorId = localStorage.getItem('va_visitor') || 'vis_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('va_visitor', visitorId);
  
  var pageStartTime = Date.now();
  
  function track(eventType, data) {
    var payload = {
      tracking_id: trackingId,
      session_id: sessionId,
      visitor_id: visitorId,
      event_type: eventType,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      data: data || {}
    };
    
    navigator.sendBeacon ? 
      navigator.sendBeacon(endpoint + '?id=' + trackingId, JSON.stringify(payload)) :
      fetch(endpoint + '?id=' + trackingId, {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true
      });
  }
  
  // Page view
  track('pageview', {
    title: document.title,
    path: window.location.pathname
  });
  
  // Time on page
  window.addEventListener('beforeunload', function() {
    track('session_end', {
      duration: Date.now() - pageStartTime
    });
  });
  
  // Scroll depth
  var maxScroll = 0;
  window.addEventListener('scroll', function() {
    var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
      maxScroll = scrollPercent;
      track('scroll_depth', { depth: scrollPercent });
    }
  });
  
  // Click tracking
  document.addEventListener('click', function(e) {
    var target = e.target.closest('a, button, [data-va-track]');
    if (target) {
      track('click', {
        element: target.tagName,
        text: target.innerText?.slice(0, 50),
        href: target.href,
        class: target.className
      });
    }
  });
  
  // Form submissions
  document.addEventListener('submit', function(e) {
    var form = e.target;
    track('form_submit', {
      form_id: form.id,
      form_action: form.action
    });
  });
  
  // E-commerce tracking (if present)
  window.vaTrackPurchase = function(orderData) {
    track('purchase', orderData);
  };
  
  window.vaTrackAddToCart = function(productData) {
    track('add_to_cart', productData);
  };
  
  window.vaTrackComment = function(commentData) {
    track('comment', commentData);
  };
  
  console.log('[Vistaceo Analytics] Tracking initialized:', trackingId);
})();
`;

  return new Response(script, { headers: corsHeaders });
});

async function handleTrackingEvent(req: Request, trackingId: string | null): Promise<Response> {
  try {
    const payload = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find business by tracking ID
    const { data: integration } = await supabase
      .from("business_integrations")
      .select("business_id, metadata")
      .eq("integration_type", "web_analytics")
      .eq("credentials->>tracking_id", trackingId)
      .single();

    if (!integration) {
      return new Response(JSON.stringify({ error: "Invalid tracking ID" }), { status: 400 });
    }

    // Store the event
    await supabase
      .from("external_data")
      .insert({
        business_id: integration.business_id,
        integration_id: integration.business_id, // Will need actual integration ID
        data_type: "web_event",
        content: payload,
        external_id: payload.session_id + "_" + payload.timestamp,
      });

    // Update metrics in integration metadata
    const metadata = integration.metadata as Record<string, any> || {};
    
    if (payload.event_type === "pageview") {
      metadata.page_views = (metadata.page_views || 0) + 1;
    } else if (payload.event_type === "purchase") {
      metadata.purchases = (metadata.purchases || 0) + 1;
    } else if (payload.event_type === "add_to_cart") {
      metadata.cart_additions = (metadata.cart_additions || 0) + 1;
    } else if (payload.event_type === "comment") {
      metadata.comments_count = (metadata.comments_count || 0) + 1;
    }

    // Recalculate conversion rate
    if (metadata.cart_additions && metadata.purchases) {
      metadata.cart_to_purchase = Math.round((metadata.purchases / metadata.cart_additions) * 100);
    }

    await supabase
      .from("business_integrations")
      .update({ 
        metadata,
        last_sync_at: new Date().toISOString()
      })
      .eq("business_id", integration.business_id)
      .eq("integration_type", "web_analytics");

    return new Response(JSON.stringify({ ok: true }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error tracking event:", error);
    return new Response(JSON.stringify({ error: "Failed to track event" }), { status: 500 });
  }
}
