// useAIArtifact: hook centralizado para leer artefactos generados por IA
// con cache por brain_signature. Si el item es legacy o stale, devuelve
// `isStale=true` para que la UI muestre skeleton + botón "regenerar".

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ArtifactType = 'mission' | 'opportunity' | 'prediction' | 'analytics' | 'radar_mission';

interface UseAIArtifactArgs<T> {
  businessId: string | null | undefined;
  artifactType: ArtifactType;
  artifactKey: string | null | undefined;
  expectedSignature?: string | null;
}

interface UseAIArtifactResult<T> {
  payload: T | null;
  loading: boolean;
  isStale: boolean;
  isLegacy: boolean;
  modelUsed: string | null;
  generatedAt: string | null;
  refetch: () => Promise<void>;
}

export function useAIArtifact<T = unknown>(
  args: UseAIArtifactArgs<T>,
): UseAIArtifactResult<T> {
  const [payload, setPayload] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    signature: string | null;
    legacy: boolean;
    modelUsed: string | null;
    generatedAt: string | null;
  }>({ signature: null, legacy: false, modelUsed: null, generatedAt: null });

  const fetchIt = useCallback(async () => {
    if (!args.businessId || !args.artifactKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('ai_artifacts_cache')
      .select('payload, brain_signature, legacy, model_used, generated_at')
      .eq('business_id', args.businessId)
      .eq('artifact_type', args.artifactType)
      .eq('artifact_key', args.artifactKey)
      .maybeSingle();

    if (data) {
      setPayload(data.payload as T);
      setMeta({
        signature: data.brain_signature,
        legacy: data.legacy,
        modelUsed: data.model_used,
        generatedAt: data.generated_at,
      });
    } else {
      setPayload(null);
      setMeta({ signature: null, legacy: false, modelUsed: null, generatedAt: null });
    }
    setLoading(false);
  }, [args.businessId, args.artifactType, args.artifactKey]);

  useEffect(() => {
    void fetchIt();
  }, [fetchIt]);

  const isStale = Boolean(
    args.expectedSignature && meta.signature && args.expectedSignature !== meta.signature,
  );

  return {
    payload,
    loading,
    isStale,
    isLegacy: meta.legacy,
    modelUsed: meta.modelUsed,
    generatedAt: meta.generatedAt,
    refetch: fetchIt,
  };
}
