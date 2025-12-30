import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { toast } from 'sonner';

interface HealthSyncResult {
  success: boolean;
  analysis?: {
    totalScore: number;
    certaintyPct: number;
    dimensions: Record<string, { score: number; confidence: string; rationale: string }>;
    strengths: string[];
    weaknesses: string[];
    dataQuality: number;
  };
  error?: string;
}

export const useHealthSync = () => {
  const { currentBusiness } = useBusiness();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncHealth = useCallback(async (): Promise<HealthSyncResult> => {
    if (!currentBusiness?.id) {
      return { success: false, error: 'No business selected' };
    }

    setIsSyncing(true);

    try {
      // Fetch ALL data sources in parallel
      const [setupRes, brainRes, integrationsRes, signalsRes] = await Promise.all([
        supabase
          .from('business_setup_progress')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .maybeSingle(),
        supabase
          .from('business_brains')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .maybeSingle(),
        supabase
          .from('business_integrations')
          .select('*')
          .eq('business_id', currentBusiness.id),
        supabase
          .from('signals')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      // Build comprehensive data payload
      const setupData = setupRes.data?.setup_data as Record<string, any> || {};
      const gastroData = setupData.gastroData || {};
      
      // Build Google data from setup or business
      const googleData = {
        placeId: currentBusiness.google_place_id || setupData.googlePlaceId,
        rating: currentBusiness.avg_rating || setupData.googleRating,
        reviewCount: setupData.googleReviewCount,
      };

      // Prepare analysis payload
      const analysisPayload = {
        businessId: currentBusiness.id,
        setupData: {
          businessName: currentBusiness.name,
          countryCode: currentBusiness.country,
          businessTypeId: setupData.businessTypeId,
          businessTypeLabel: setupData.businessTypeLabel,
          setupMode: setupData.mode || 'quick',
          googleAddress: currentBusiness.address,
          answers: gastroData,
          integrationsProfiled: setupData.integrationsProfiled || {},
        },
        googleData,
        brainData: brainRes.data || null,
        integrationsData: integrationsRes.data || [],
        signalsData: signalsRes.data || [],
      };

      console.log('[useHealthSync] Syncing with data:', {
        businessId: currentBusiness.id,
        hasGoogle: !!googleData.placeId,
        hasBrain: !!brainRes.data,
        integrationsCount: integrationsRes.data?.length || 0,
        signalsCount: signalsRes.data?.length || 0,
      });

      // Call the AI analysis edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'analyze-health-score',
        { body: analysisPayload }
      );

      if (functionError) {
        console.error('[useHealthSync] Function error:', functionError);
        throw new Error(functionError.message || 'Error al analizar salud del negocio');
      }

      if (!functionData?.success) {
        throw new Error(functionData?.error || 'Error en análisis');
      }

      setLastSync(new Date());
      toast.success('Diagnóstico actualizado', {
        description: `Score: ${functionData.analysis.totalScore} | Certeza: ${functionData.analysis.certaintyPct}%`,
      });

      return {
        success: true,
        analysis: functionData.analysis,
      };
    } catch (error) {
      console.error('[useHealthSync] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al sincronizar', { description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [currentBusiness]);

  return {
    syncHealth,
    isSyncing,
    lastSync,
  };
};
