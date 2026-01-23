import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrain } from '@/hooks/use-brain';
import { PulseBlueprint, DEFAULT_BLUEPRINT } from '@/lib/pulseBlueprints';

export const usePulseBlueprint = () => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const [blueprint, setBlueprint] = useState<PulseBlueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBlueprint = async () => {
      if (!brain?.primary_business_type) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('pulse_blueprints')
          .select('*')
          .eq('business_type', brain.primary_business_type)
          .eq('is_active', true)
          .single();

        if (fetchError) {
          // Try without exact match - use default
          console.log('No specific blueprint found, using default');
          setBlueprint(null);
        } else {
          setBlueprint(data as PulseBlueprint);
        }
      } catch (err) {
        console.error('Error fetching pulse blueprint:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprint();
  }, [brain?.primary_business_type]);

  // Return merged blueprint with defaults
  const effectiveBlueprint = blueprint ? blueprint : {
    ...DEFAULT_BLUEPRINT,
    business_type: brain?.primary_business_type || 'generic',
    sector: 'generic',
  } as PulseBlueprint;

  return {
    blueprint: effectiveBlueprint,
    loading,
    error,
    hasSpecificBlueprint: !!blueprint,
  };
};

export default usePulseBlueprint;
