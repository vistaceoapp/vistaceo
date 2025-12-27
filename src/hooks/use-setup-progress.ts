import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { SetupData, getDefaultSetupData, validatePMO } from '@/lib/setupSteps';
import { CountryCode } from '@/lib/countryPacks';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface SetupProgress {
  id: string;
  business_id: string;
  current_step: string;
  setup_data: Partial<SetupData>;
  pmo_status: {
    identity: boolean;
    model: boolean;
    sales: boolean;
    menu: boolean;
    costs: boolean;
    competition: boolean;
  };
  precision_score: number;
  completed_at: string | null;
}

export const useSetupProgress = () => {
  const { currentBusiness } = useBusiness();
  const [progress, setProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!currentBusiness?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('business_setup_progress')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProgress({
          ...data,
          setup_data: (data.setup_data || {}) as Partial<SetupData>,
          pmo_status: (data.pmo_status || {
            identity: false,
            model: false,
            sales: false,
            menu: false,
            costs: false,
            competition: false,
          }) as SetupProgress['pmo_status'],
        });
      } else {
        // Create initial progress
        const countryCode = (currentBusiness.country as CountryCode) || 'AR';
        const initialData = getDefaultSetupData(countryCode);
        
        const { data: newProgress, error: createError } = await supabase
          .from('business_setup_progress')
          .insert([{
            business_id: currentBusiness.id,
            current_step: 'S00',
            setup_data: initialData as Json,
          }])
          .select()
          .single();

        if (createError) throw createError;
        
        if (newProgress) {
          setProgress({
            ...newProgress,
            setup_data: (newProgress.setup_data || {}) as Partial<SetupData>,
            pmo_status: (newProgress.pmo_status || {
              identity: false,
              model: false,
              sales: false,
              menu: false,
              costs: false,
              competition: false,
            }) as SetupProgress['pmo_status'],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching setup progress:', error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id, currentBusiness?.country]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = async (
    step: string,
    data: Partial<SetupData>,
    precisionDelta?: number
  ) => {
    if (!progress || !currentBusiness?.id) return;

    setSaving(true);
    try {
      const newData = { ...progress.setup_data, ...data };
      const pmoResult = validatePMO(newData);
      
      const newPrecision = precisionDelta 
        ? Math.min(100, progress.precision_score + precisionDelta)
        : progress.precision_score;

      const { error } = await supabase
        .from('business_setup_progress')
        .update({
          current_step: step,
          setup_data: newData as Json,
          pmo_status: {
            identity: !!newData.address && !!newData.city && !!newData.countryCode,
            model: !!newData.primaryType && !!newData.serviceModel,
            sales: !!newData.monthlyRevenueMin && !!newData.avgTicketMin,
            menu: (newData.menuItems?.length || 0) >= 8,
            costs: !!newData.foodCostPercentMin,
            competition: (newData.competitors?.length || 0) >= 5,
          } as Json,
          precision_score: newPrecision,
        })
        .eq('id', progress.id);

      if (error) throw error;

      setProgress(prev => prev ? {
        ...prev,
        current_step: step,
        setup_data: newData,
        precision_score: newPrecision,
      } : null);

    } catch (error) {
      console.error('Error updating setup progress:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el progreso',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const completeSetup = async () => {
    if (!progress || !currentBusiness?.id) return false;

    const pmoResult = validatePMO(progress.setup_data);
    if (!pmoResult.valid) {
      toast({
        title: 'Faltan datos',
        description: `Para continuar necesitás: ${pmoResult.missing.join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }

    setSaving(true);
    try {
      // Update setup progress
      const { error: progressError } = await supabase
        .from('business_setup_progress')
        .update({
          current_step: 'S20',
          completed_at: new Date().toISOString(),
        })
        .eq('id', progress.id);

      if (progressError) throw progressError;

      // Update business with setup data
      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          service_model: progress.setup_data.serviceModel,
          channel_mix: progress.setup_data.channelMix,
          monthly_revenue_range: {
            min: progress.setup_data.monthlyRevenueMin,
            max: progress.setup_data.monthlyRevenueMax,
          },
          avg_ticket_range: {
            min: progress.setup_data.avgTicketMin,
            max: progress.setup_data.avgTicketMax,
          },
          daily_transactions_range: {
            min: progress.setup_data.dailyTransactionsMin,
            max: progress.setup_data.dailyTransactionsMax,
          },
          food_cost_range: {
            min: progress.setup_data.foodCostPercentMin,
            max: progress.setup_data.foodCostPercentMax,
          },
          active_dayparts: progress.setup_data.activeDayparts,
          delivery_platforms: progress.setup_data.deliveryPlatforms,
          competitive_radius_km: progress.setup_data.competitiveRadius,
          setup_completed: true,
          precision_score: progress.precision_score,
        })
        .eq('id', currentBusiness.id);

      if (businessError) throw businessError;

      toast({
        title: '¡Setup completado!',
        description: 'Tu dashboard está listo con datos reales.',
      });

      return true;
    } catch (error) {
      console.error('Error completing setup:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar el setup',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    progress,
    loading,
    saving,
    updateProgress,
    completeSetup,
    refresh: fetchProgress,
  };
};
