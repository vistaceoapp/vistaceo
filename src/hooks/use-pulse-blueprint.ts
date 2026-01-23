import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrain } from '@/hooks/use-brain';
import { PulseBlueprint, DEFAULT_BLUEPRINT } from '@/lib/pulseBlueprints';

// Mapping from business type codes to blueprint keys
const TYPE_TO_BLUEPRINT: Record<string, string[]> = {
  // Cafeterías
  'A1_T016_CAFE_ESPECIALIDAD': ['cafeteria_pasteleria', 'restaurant_general'],
  'A1_T006_CAFETERIA': ['cafeteria_pasteleria', 'restaurant_general'],
  // Restaurantes
  'A1_T001_RESTAURANTE': ['restaurant_general'],
  'A1_T003_ALTA_COCINA': ['alta_cocina', 'restaurant_general'],
  'A1_T002_BODEGON': ['bodegon_cantina', 'restaurant_general'],
  'A1_T004_PARRILLA': ['parrilla_asador', 'restaurant_general'],
  // Fast food
  'A1_T007_FAST_FOOD': ['fast_food', 'restaurant_general'],
  'A1_T008_FAST_CASUAL': ['fast_casual', 'restaurant_general'],
  'A1_T009_PIZZERIA': ['pizzeria', 'restaurant_general'],
  // Bares
  'A1_T010_BAR': ['bar_cocteleria', 'restaurant_general'],
  'A1_T011_PUB': ['bar_cocteleria', 'restaurant_general'],
  'A1_T012_CERVECERIA': ['cerveceria_tap_room', 'bar_cocteleria'],
  // Dulces
  'A1_T013_HELADERIA': ['heladeria', 'restaurant_general'],
  'A1_T014_PASTELERIA': ['cafeteria_pasteleria', 'panaderia'],
  'A1_T015_PANADERIA': ['panaderia', 'restaurant_general'],
  // Dark kitchen
  'A1_T017_DARK_KITCHEN': ['dark_kitchen_virtual', 'restaurant_general'],
  'A1_T018_FOOD_TRUCK': ['food_truck_ambulante', 'fast_food'],
};

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
        // Get possible blueprint keys for this business type
        const possibleKeys = TYPE_TO_BLUEPRINT[brain.primary_business_type] || [];
        
        // First try exact match
        let { data, error: fetchError } = await supabase
          .from('pulse_blueprints')
          .select('*')
          .eq('business_type', brain.primary_business_type)
          .eq('is_active', true)
          .single();

        // If no exact match, try mapped keys
        if (fetchError || !data) {
          for (const key of possibleKeys) {
            const { data: fallbackData } = await supabase
              .from('pulse_blueprints')
              .select('*')
              .eq('business_type', key)
              .eq('is_active', true)
              .single();
            
            if (fallbackData) {
              data = fallbackData;
              break;
            }
          }
        }

        // If still no match, try sector-based fallback
        if (!data && currentBusiness?.category) {
          const { data: sectorData } = await supabase
            .from('pulse_blueprints')
            .select('*')
            .eq('sector', 'gastro')
            .eq('is_active', true)
            .limit(1)
            .single();
          
          data = sectorData;
        }

        if (data) {
          setBlueprint(data as PulseBlueprint);
        } else {
          console.log('No specific blueprint found, using default');
          setBlueprint(null);
        }
      } catch (err) {
        console.error('Error fetching pulse blueprint:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprint();
  }, [brain?.primary_business_type, currentBusiness?.category]);

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
