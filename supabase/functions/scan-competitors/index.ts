// PROMPT 4 HARDENED — scan-competitors
// Reglas:
//  - Nunca inventar competidores. Sin Google Places => fallback premium.
//  - `ai_estimated` queda explícitamente prohibido como fuente real.
//  - Cada candidato pasa por gateCompetitor + validateBeforeStore.
//  - Respuesta unificada con quality/fallbackUsed (no leaks técnicos).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { handlePreflight, okResponse, failResponse } from "../_shared/edge-safe-response.ts";
import { validateBeforeStore } from "../_shared/validate-before-store.ts";
import { gateCompetitor } from "../_shared/quality-gates.ts";

const FALLBACK_TEXT =
  "Todavía no hay competidores confiables detectados. Podés agregar 2 referencias manuales o permitir una nueva búsqueda por zona, sector y tipo de cliente.";

serve(async (req) => {
  const pre = handlePreflight(req); if (pre) return pre;
  try {
    const { businessId } = await req.json();
    if (!businessId) {
      return failResponse("missing_businessId", { module: "competitor", fallbackText: FALLBACK_TEXT });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, address, google_place_id, category, country, competitive_radius_km")
      .eq("id", businessId)
      .single();
    if (bizError || !business) {
      return failResponse("business_not_found", { module: "competitor", fallbackText: FALLBACK_TEXT });
    }

    // Fuente real obligatoria.
    if (!GOOGLE_PLACES_API_KEY || !business.google_place_id) {
      return okResponse({
        data: { competitorsFound: 0, source: "insufficient_data" },
        visibleText: FALLBACK_TEXT,
        quality: { passed: false, reasons: ["no_verifiable_source"] },
        fallbackUsed: true,
        eventsToEmit: [{ eventType: "competitor_scan_insufficient_data", payload: { businessId } }],
      });
    }

    const radius = (business.competitive_radius_km || 2) * 1000;
    let competitorsFound = 0;
    let competitorsRejected = 0;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.google_place_id}&fields=geometry,types&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    if (!detailsData.result?.geometry?.location) {
      return okResponse({
        data: { competitorsFound: 0, source: "place_lookup_failed" },
        visibleText: FALLBACK_TEXT,
        quality: { passed: false, reasons: ["place_lookup_failed"] },
        fallbackUsed: true,
        eventsToEmit: [{ eventType: "competitor_scan_insufficient_data", payload: { businessId } }],
      });
    }

    const { lat, lng } = detailsData.result.geometry.location;
    const types = detailsData.result.types || [];
    const searchType = types.includes("restaurant") ? "restaurant"
      : types.includes("cafe") ? "cafe"
      : types.includes("bar") ? "bar"
      : "establishment";

    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${searchType}&key=${GOOGLE_PLACES_API_KEY}`;
    const nearbyRes = await fetch(nearbyUrl);
    const nearbyData = await nearbyRes.json();

    const candidates = (nearbyData.results || [])
      .filter((p: any) => p.place_id !== business.google_place_id)
      .slice(0, 15);

    for (const place of candidates) {
      // Validación dura por candidato.
      const gate = gateCompetitor({ name: place.name, sourceType: "google_places" });
      const audit = validateBeforeStore({
        module: "competitor",
        title: place.name,
        description: place.vicinity || place.name,
      });
      if (!gate.passed || !audit.passed) {
        competitorsRejected++;
        continue;
      }
      const distanceKm = haversine(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
      await supabase.from("business_competitors").upsert({
        business_id: businessId,
        name: place.name,
        address: place.vicinity || null,
        google_place_id: place.place_id,
        rating: place.rating || null,
        review_count: place.user_ratings_total || null,
        distance_km: Math.round(distanceKm * 10) / 10,
        price_level: place.price_level || null,
        metadata: {
          types: place.types,
          business_status: place.business_status,
          source: "google_places",
          scanned_at: new Date().toISOString(),
        },
      }, { onConflict: "business_id,google_place_id" });
      competitorsFound++;
    }

    return okResponse({
      data: { competitorsFound, competitorsRejected, source: "google_places" },
      quality: { passed: competitorsFound > 0, reasons: competitorsFound === 0 ? ["no_results"] : [] },
      fallbackUsed: competitorsFound === 0,
      visibleText: competitorsFound === 0 ? FALLBACK_TEXT : undefined,
      eventsToEmit: [{
        eventType: competitorsFound > 0 ? "competitor_scan_completed" : "competitor_scan_insufficient_data",
        payload: { businessId, competitorsFound, competitorsRejected },
        modulesToRecalculate: ["analytics", "radar"],
      }],
    });
  } catch (error) {
    return failResponse(error, { module: "competitor", fallbackText: FALLBACK_TEXT });
  }
});

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
