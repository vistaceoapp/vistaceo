import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResolveRequest {
  businessId: string;
  text: string;
  entityType?: 'product' | 'issue' | 'channel' | 'segment' | 'process';
  createIfNotFound?: boolean;
}

interface ResolvedEntity {
  id: string;
  canonicalName: string;
  displayName: string;
  entityType: string;
  confidence: number;
  matchedOn: string;
}

// Normalize text for matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim();
}

// Calculate similarity between two strings (Jaccard-like)
function similarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1;
  
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Find best matching entity
async function resolveEntity(
  supabase: any,
  businessId: string,
  text: string,
  entityType?: string
): Promise<ResolvedEntity | null> {
  const normalizedText = normalizeText(text);
  
  // Build query
  let query = supabase
    .from('canonical_entities')
    .select('*')
    .eq('business_id', businessId);
  
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  
  const { data: entities, error } = await query;
  
  if (error || !entities?.length) {
    return null;
  }
  
  let bestMatch: ResolvedEntity | null = null;
  let bestScore = 0;
  
  for (const entity of entities) {
    // Check canonical name
    const canonicalScore = similarity(text, entity.canonical_name);
    if (canonicalScore > bestScore) {
      bestScore = canonicalScore;
      bestMatch = {
        id: entity.id,
        canonicalName: entity.canonical_name,
        displayName: entity.display_name,
        entityType: entity.entity_type,
        confidence: canonicalScore,
        matchedOn: 'canonical_name',
      };
    }
    
    // Check display name
    const displayScore = similarity(text, entity.display_name);
    if (displayScore > bestScore) {
      bestScore = displayScore;
      bestMatch = {
        id: entity.id,
        canonicalName: entity.canonical_name,
        displayName: entity.display_name,
        entityType: entity.entity_type,
        confidence: displayScore,
        matchedOn: 'display_name',
      };
    }
    
    // Check synonyms
    const synonyms = entity.synonyms as string[];
    for (const synonym of synonyms) {
      const synScore = similarity(text, synonym);
      if (synScore > bestScore) {
        bestScore = synScore;
        bestMatch = {
          id: entity.id,
          canonicalName: entity.canonical_name,
          displayName: entity.display_name,
          entityType: entity.entity_type,
          confidence: synScore,
          matchedOn: `synonym:${synonym}`,
        };
      }
    }
  }
  
  // Only return if confidence is above threshold
  if (bestMatch && bestScore >= 0.6) {
    return bestMatch;
  }
  
  return null;
}

// Add synonym to existing entity
async function addSynonym(
  supabase: any,
  entityId: string,
  newSynonym: string
): Promise<boolean> {
  const { data: entity, error } = await supabase
    .from('canonical_entities')
    .select('synonyms')
    .eq('id', entityId)
    .single();
  
  if (error || !entity) return false;
  
  const synonyms = entity.synonyms as string[];
  const normalizedNew = normalizeText(newSynonym);
  
  // Check if already exists
  if (synonyms.some(s => normalizeText(s) === normalizedNew)) {
    return true;
  }
  
  // Add new synonym
  synonyms.push(newSynonym);
  
  await supabase
    .from('canonical_entities')
    .update({ synonyms })
    .eq('id', entityId);
  
  return true;
}

// Merge two entities (keep first, merge synonyms from second)
async function mergeEntities(
  supabase: any,
  keepEntityId: string,
  mergeEntityId: string
): Promise<boolean> {
  // Get both entities
  const { data: entities, error } = await supabase
    .from('canonical_entities')
    .select('*')
    .in('id', [keepEntityId, mergeEntityId]);
  
  if (error || entities?.length !== 2) return false;
  
  const keepEntity = entities.find((e: any) => e.id === keepEntityId);
  const mergeEntity = entities.find((e: any) => e.id === mergeEntityId);
  
  if (!keepEntity || !mergeEntity) return false;
  
  // Merge synonyms
  const mergedSynonyms = [...new Set([
    ...keepEntity.synonyms,
    ...mergeEntity.synonyms,
    mergeEntity.canonical_name,
    mergeEntity.display_name,
  ])];
  
  // Update keep entity
  await supabase
    .from('canonical_entities')
    .update({
      synonyms: mergedSynonyms,
      mention_count: (keepEntity.mention_count || 0) + (mergeEntity.mention_count || 0),
    })
    .eq('id', keepEntityId);
  
  // Update mentions to point to keep entity
  await supabase
    .from('entity_mentions')
    .update({ entity_id: keepEntityId })
    .eq('entity_id', mergeEntityId);
  
  // Update relations
  await supabase
    .from('entity_relations')
    .update({ entity_a_id: keepEntityId })
    .eq('entity_a_id', mergeEntityId);
  
  await supabase
    .from('entity_relations')
    .update({ entity_b_id: keepEntityId })
    .eq('entity_b_id', mergeEntityId);
  
  // Delete merge entity
  await supabase
    .from('canonical_entities')
    .delete()
    .eq('id', mergeEntityId);
  
  return true;
}

// Get entity suggestions (potential duplicates)
async function findDuplicateCandidates(
  supabase: any,
  businessId: string,
  entityType?: string
): Promise<Array<{ entity1: any; entity2: any; similarity: number }>> {
  let query = supabase
    .from('canonical_entities')
    .select('*')
    .eq('business_id', businessId);
  
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  
  const { data: entities, error } = await query;
  
  if (error || !entities?.length) return [];
  
  const candidates: Array<{ entity1: any; entity2: any; similarity: number }> = [];
  
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const e1 = entities[i];
      const e2 = entities[j];
      
      // Only compare same type
      if (e1.entity_type !== e2.entity_type) continue;
      
      const sim = similarity(e1.canonical_name, e2.canonical_name);
      
      if (sim >= 0.5) {
        candidates.push({ entity1: e1, entity2: e2, similarity: sim });
      }
    }
  }
  
  return candidates.sort((a, b) => b.similarity - a.similarity);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || 'resolve';

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'resolve': {
        const { businessId, text, entityType, createIfNotFound } = body as ResolveRequest;
        
        if (!businessId || !text) {
          return new Response(
            JSON.stringify({ error: "businessId and text are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const resolved = await resolveEntity(supabase, businessId, text, entityType);
        
        if (resolved) {
          return new Response(
            JSON.stringify({ found: true, entity: resolved }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Create if not found and requested
        if (createIfNotFound && entityType) {
          const { data: newEntity, error } = await supabase
            .from('canonical_entities')
            .insert({
              business_id: businessId,
              entity_type: entityType,
              canonical_name: normalizeText(text).replace(/\s+/g, '_'),
              display_name: text,
              synonyms: [],
              mention_count: 1,
              confidence: 0.5,
            })
            .select()
            .single();
          
          if (!error && newEntity) {
            return new Response(
              JSON.stringify({
                found: false,
                created: true,
                entity: {
                  id: newEntity.id,
                  canonicalName: newEntity.canonical_name,
                  displayName: newEntity.display_name,
                  entityType: newEntity.entity_type,
                  confidence: 1,
                  matchedOn: 'created',
                },
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        return new Response(
          JSON.stringify({ found: false, entity: null }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'add_synonym': {
        const { entityId, synonym } = body;
        const success = await addSynonym(supabase, entityId, synonym);
        return new Response(
          JSON.stringify({ success }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'merge': {
        const { keepEntityId, mergeEntityId } = body;
        const success = await mergeEntities(supabase, keepEntityId, mergeEntityId);
        return new Response(
          JSON.stringify({ success }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'find_duplicates': {
        const { businessId, entityType } = body;
        const candidates = await findDuplicateCandidates(supabase, businessId, entityType);
        return new Response(
          JSON.stringify({ candidates }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[brain-resolve-entity] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
