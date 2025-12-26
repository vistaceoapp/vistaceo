import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignalInput {
  businessId: string;
  signalType: 'user_input' | 'integration_data' | 'feedback' | 'action_outcome' | 'checkin' | 'alert' | 'chat' | 'gap_answer';
  source: string;
  content: Record<string, any>;
  rawText?: string;
  confidence?: 'high' | 'medium' | 'low';
  importance?: number;
}

async function recordSignal(supabase: any, input: SignalInput): Promise<string | null> {
  // Get brain for this business
  const { data: brain } = await supabase
    .from('business_brains')
    .select('id')
    .eq('business_id', input.businessId)
    .maybeSingle();

  // Insert signal
  const { data: signal, error } = await supabase
    .from('signals')
    .insert({
      business_id: input.businessId,
      brain_id: brain?.id,
      signal_type: input.signalType,
      source: input.source,
      content: input.content,
      raw_text: input.rawText,
      confidence: input.confidence || 'medium',
      importance: input.importance || 5
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error recording signal:', error);
    return null;
  }

  // Update brain signal count
  if (brain?.id) {
    await supabase
      .from('business_brains')
      .update({
        total_signals: supabase.rpc('increment_signal_count', { brain_id: brain.id }),
        last_learning_at: new Date().toISOString()
      })
      .eq('id', brain.id);
  }

  // If this is a gap answer, update the data gap
  if (input.signalType === 'gap_answer' && input.content.gap_id) {
    await supabase
      .from('data_gaps')
      .update({
        status: 'answered',
        answered_at: new Date().toISOString(),
        answer: input.content.answer,
        answered_via: input.source
      })
      .eq('id', input.content.gap_id);

    // Also update factual memory with the answer
    if (brain?.id && input.content.field_name && input.content.answer) {
      const { data: currentBrain } = await supabase
        .from('business_brains')
        .select('factual_memory')
        .eq('id', brain.id)
        .single();

      const updatedMemory = {
        ...(currentBrain?.factual_memory || {}),
        [input.content.field_name]: input.content.answer
      };

      await supabase
        .from('business_brains')
        .update({ factual_memory: updatedMemory })
        .eq('id', brain.id);
    }
  }

  return signal?.id;
}

// Batch record multiple signals (e.g., from integration sync)
async function recordBatchSignals(supabase: any, signals: SignalInput[]): Promise<number> {
  let recorded = 0;
  
  for (const signal of signals) {
    const id = await recordSignal(supabase, signal);
    if (id) recorded++;
  }

  return recorded;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if batch or single
    if (Array.isArray(body.signals)) {
      const count = await recordBatchSignals(supabase, body.signals);
      return new Response(
        JSON.stringify({ recorded: count, message: `${count} signals recorded` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const signalId = await recordSignal(supabase, body);
      return new Response(
        JSON.stringify({ signalId, message: signalId ? 'Signal recorded' : 'Failed to record' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in brain-record-signal:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
