// Cliente frontend del motor IA "cero hardcode".
// Llama a la edge function `ai-forge-artifact` con el ContextPack del cliente.

import { supabase } from '@/integrations/supabase/client';
import type { ArtifactType } from '@/hooks/useAIArtifact';

export interface ForgeArgs {
  businessId: string;
  artifactType: ArtifactType;
  artifactKey: string;
  contextPack: unknown;
  signals?: unknown[];
  insights?: unknown[];
  competitors?: string[];
  integrations?: string[];
  seed: Record<string, unknown>;
  forceRegenerate?: boolean;
}

export interface ForgeResult<T = unknown> {
  ok: boolean;
  payload: T | null;
  signature: string | null;
  cached: boolean;
  modelUsed: string | null;
  gatePassed: boolean;
  reasons: string[];
}

export async function forgeArtifact<T = unknown>(args: ForgeArgs): Promise<ForgeResult<T>> {
  const { data, error } = await supabase.functions.invoke('ai-forge-artifact', {
    body: args,
  });

  if (error) {
    return {
      ok: false,
      payload: null,
      signature: null,
      cached: false,
      modelUsed: null,
      gatePassed: false,
      reasons: [`invoke_error:${error.message}`],
    };
  }
  return data as ForgeResult<T>;
}
