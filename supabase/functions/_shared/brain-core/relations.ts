// Brain Core — Red interna de relaciones (grafo por negocio).
// Helpers para upsert/lectura. Una arista representa una conexión
// entre dos elementos del brain (canal, oferta, cliente, fricción, objetivo, misión...).

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type RelationType =
  | "channel_to_conversion"
  | "offer_to_objection"
  | "customer_to_pain"
  | "country_to_context"
  | "friction_to_opportunity"
  | "goal_to_mission"
  | "mission_to_metric"
  | "radar_to_opportunity"
  | "chat_to_learning"
  | "learning_to_brain_update"
  | "dismissal_to_priority_change"
  | "missing_data_to_suggested_question";

export interface RelationEdge {
  originType: string;
  originKey: string;
  destinationType: string;
  destinationKey: string;
  relationType: RelationType | string;
  strength?: number; // 0..1
  confidence?: number; // 0..1
  evidence?: Record<string, unknown>;
  state?: "confirmed" | "inferred" | "possible" | "discarded";
}

export async function upsertRelation(
  db: SupabaseClient,
  businessId: string,
  brainId: string | null,
  edge: RelationEdge,
): Promise<void> {
  await db.from("brain_relations").upsert(
    {
      business_id: businessId,
      brain_id: brainId,
      origin_type: edge.originType,
      origin_key: edge.originKey,
      destination_type: edge.destinationType,
      destination_key: edge.destinationKey,
      relation_type: edge.relationType,
      strength: clamp01(edge.strength ?? 0.5),
      confidence: clamp01(edge.confidence ?? 0.5),
      evidence: edge.evidence ?? {},
      state: edge.state ?? "inferred",
    },
    { onConflict: "business_id,origin_type,origin_key,destination_type,destination_key,relation_type" },
  );
}

export async function listRelationsFor(
  db: SupabaseClient,
  businessId: string,
  filter?: { originType?: string; relationType?: string },
) {
  let q = db.from("brain_relations").select("*").eq("business_id", businessId);
  if (filter?.originType) q = q.eq("origin_type", filter.originType);
  if (filter?.relationType) q = q.eq("relation_type", filter.relationType);
  const { data } = await q;
  return data ?? [];
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}
