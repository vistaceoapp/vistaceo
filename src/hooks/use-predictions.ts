import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrain } from '@/hooks/use-brain';
import type { 
  Prediction, 
  CalibrationEvent, 
  PredictionUIModel,
  HorizonRing,
  PredictionDomain,
  HORIZON_RINGS,
  PREDICTION_DOMAINS 
} from '@/lib/predictions/types';

interface UsePredictionsReturn {
  predictions: Prediction[];
  calibrations: CalibrationEvent[];
  uiModel: PredictionUIModel | null;
  loading: boolean;
  error: Error | null;
  refreshPredictions: () => Promise<void>;
  generateNewPredictions: () => Promise<void>;
  dismissPrediction: (predictionId: string) => Promise<void>;
  convertToMission: (predictionId: string) => Promise<string | null>;
  answerCalibration: (calibrationId: string, answer: unknown) => Promise<void>;
  filterByHorizon: (horizon: HorizonRing | 'all') => Prediction[];
  filterByDomain: (domain: PredictionDomain | 'all') => Prediction[];
}

export const usePredictions = (): UsePredictionsReturn => {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [calibrations, setCalibrations] = useState<CalibrationEvent[]>([]);
  const [uiModel, setUiModel] = useState<PredictionUIModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch existing predictions
  const fetchPredictions = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      
      const [predictionsRes, calibrationsRes] = await Promise.all([
        supabase
          .from('predictions')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .eq('status', 'active')
          .order('probability', { ascending: false })
          .limit(50),
        supabase
          .from('prediction_calibrations')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .eq('status', 'pending')
          .order('priority', { ascending: true })
          .limit(5),
      ]);

      if (predictionsRes.error) throw predictionsRes.error;
      if (calibrationsRes.error) throw calibrationsRes.error;

      const parsedPredictions = (predictionsRes.data || []).map(p => ({
        ...p,
        uncertainty_band: p.uncertainty_band as unknown as Prediction['uncertainty_band'],
        time_window: p.time_window as unknown as Prediction['time_window'],
        estimated_impact: p.estimated_impact as unknown as Prediction['estimated_impact'],
        evidence: p.evidence as unknown as Prediction['evidence'],
        causal_chain: p.causal_chain as unknown as Prediction['causal_chain'],
        recommended_actions: p.recommended_actions as unknown as Prediction['recommended_actions'],
        available_actions: p.available_actions as unknown as Prediction['available_actions'],
        visual_payload: p.visual_payload as unknown as Prediction['visual_payload'],
      })) as Prediction[];

      const parsedCalibrations = (calibrationsRes.data || []).map(c => ({
        ...c,
        improves: c.improves as CalibrationEvent['improves'],
        input: {
          type: c.input_type,
          question: c.question,
          unit: c.unit,
          options: c.options,
          min: c.min_value,
          max: c.max_value,
          default: c.default_value,
        },
      })) as unknown as CalibrationEvent[];

      setPredictions(parsedPredictions);
      setCalibrations(parsedCalibrations);

      // Build UI model from predictions
      buildUIModel(parsedPredictions);
      
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id]);

  // Build UI model for visualization
  const buildUIModel = (preds: Prediction[]) => {
    const model: PredictionUIModel = {
      sphere_state: {
        clarity: preds.length > 0 ? preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length : 0.5,
        pulse_state: preds.some(p => p.is_breakpoint) ? 'urgent' : preds.length > 5 ? 'active' : 'calm',
        halo_reliability: preds.length > 0 ? preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length : 0.5,
        fog_level: preds.length > 0 ? 1 - (preds.reduce((acc, p) => acc + p.confidence, 0) / preds.length) : 0.5,
      },
      rings: (['H0', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'] as HorizonRing[]).map(ring => {
        const ringPreds = preds.filter(p => p.horizon_ring === ring);
        return {
          ring_id: ring,
          ring_confidence: ringPreds.length > 0 ? ringPreds.reduce((acc, p) => acc + p.confidence, 0) / ringPreds.length : 0,
          ring_density: ringPreds.length,
          ring_label: ring,
          event_objects: ringPreds,
        };
      }),
      constellations: Object.fromEntries(
        (['cashflow', 'demand', 'operations', 'customer', 'competition', 'risk', 'strategy', 'pricing', 'inventory', 'sales', 'marketing', 'team', 'tech'] as PredictionDomain[]).map(domain => {
          const domainPreds = preds.filter(p => p.domain === domain);
          return [domain, {
            active: domainPreds.length > 0,
            count: domainPreds.length,
            avg_probability: domainPreds.length > 0 ? domainPreds.reduce((acc, p) => acc + p.probability, 0) / domainPreds.length : 0,
          }];
        })
      ) as PredictionUIModel['constellations'],
      bubble_map: preds.map(p => ({
        prediction_id: p.id,
        x: p.probability,
        y: p.visual_payload?.bubble?.y_impact || 50,
        size: p.visual_payload?.bubble?.size || 10,
        color: p.is_breakpoint ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
      })),
      timeline: preds.map(p => ({
        prediction_id: p.id,
        domain: p.domain,
        start: p.time_window?.start || new Date().toISOString(),
        end: p.time_window?.end || new Date().toISOString(),
        action_window_start: p.time_window?.action_window?.start,
        action_window_end: p.time_window?.action_window?.end,
      })),
      quality_dashboard: {
        accuracy_event_rate: 0.75, // placeholder
        mean_absolute_error_by_horizon: {
          H0: 0.1, H1: 0.15, H2: 0.2, H3: 0.25, H4: 0.35, H5: 0.45, H6: 0.55, H7: 0.65,
        },
        calibration_buckets: { '10%': 0.12, '30%': 0.28, '50%': 0.51, '70%': 0.68, '90%': 0.88 },
        coverage_by_domain: Object.fromEntries(
          (['cashflow', 'demand', 'operations', 'customer', 'competition', 'risk', 'strategy', 'pricing', 'inventory', 'sales', 'marketing', 'team', 'tech'] as PredictionDomain[]).map(d => [d, preds.filter(p => p.domain === d).length / Math.max(preds.length, 1)])
        ) as Record<PredictionDomain, number>,
        sharpness: 0.7,
        drift_status: 'stable',
      },
    };
    setUiModel(model);
  };

  // Generate new predictions via edge function
  const generateNewPredictions = useCallback(async () => {
    if (!currentBusiness?.id) return;

    try {
      setLoading(true);
      
      const { data, error: fnError } = await supabase.functions.invoke('generate-predictions', {
        body: {
          business_id: currentBusiness.id,
          horizons: ['H0', 'H1', 'H2', 'H3'],
          domains: ['cashflow', 'demand', 'operations', 'customer', 'sales'],
        },
      });

      if (fnError) throw fnError;

      // Refresh after generation
      await fetchPredictions();
      
    } catch (err) {
      console.error('Error generating predictions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?.id, fetchPredictions]);

  // Dismiss a prediction
  const dismissPrediction = useCallback(async (predictionId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('predictions')
        .update({ 
          status: 'dismissed', 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', predictionId);

      if (updateError) throw updateError;

      setPredictions(prev => prev.filter(p => p.id !== predictionId));
    } catch (err) {
      console.error('Error dismissing prediction:', err);
      throw err;
    }
  }, []);

  // Convert prediction to mission
  const convertToMission = useCallback(async (predictionId: string): Promise<string | null> => {
    const prediction = predictions.find(p => p.id === predictionId);
    if (!prediction || !currentBusiness?.id) return null;

    try {
      const missionData = prediction.available_actions?.convert_to_mission;
      if (!missionData) {
        throw new Error('Esta predicción no tiene plan de misión disponible');
      }

      // Create mission via existing system
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          business_id: currentBusiness.id,
          title: missionData.mission_title,
          description: missionData.objective,
          status: 'active',
          source: 'prediction',
          source_id: predictionId,
          steps: missionData.steps.map((step, i) => ({
            id: `step_${i}`,
            title: step,
            completed: false,
          })),
        })
        .select()
        .single();

      if (missionError) throw missionError;

      // Update prediction status
      await supabase
        .from('predictions')
        .update({ 
          status: 'converted', 
          converted_to_mission_id: mission.id 
        })
        .eq('id', predictionId);

      setPredictions(prev => prev.filter(p => p.id !== predictionId));

      return mission.id;
    } catch (err) {
      console.error('Error converting to mission:', err);
      throw err;
    }
  }, [predictions, currentBusiness?.id]);

  // Answer calibration event
  const answerCalibration = useCallback(async (calibrationId: string, answer: unknown) => {
    try {
      const { error: updateError } = await supabase
        .from('prediction_calibrations')
        .update({
          answer: JSON.parse(JSON.stringify(answer)),
          answered_at: new Date().toISOString(),
          status: 'answered',
        })
        .eq('id', calibrationId);

      if (updateError) throw updateError;

      setCalibrations(prev => prev.filter(c => c.id !== calibrationId));

      // Trigger prediction refresh after calibration
      await generateNewPredictions();
    } catch (err) {
      console.error('Error answering calibration:', err);
      throw err;
    }
  }, [generateNewPredictions]);

  // Filter helpers
  const filterByHorizon = useCallback((horizon: HorizonRing | 'all') => {
    if (horizon === 'all') return predictions;
    return predictions.filter(p => p.horizon_ring === horizon);
  }, [predictions]);

  const filterByDomain = useCallback((domain: PredictionDomain | 'all') => {
    if (domain === 'all') return predictions;
    return predictions.filter(p => p.domain === domain);
  }, [predictions]);

  // Initial fetch
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return {
    predictions,
    calibrations,
    uiModel,
    loading,
    error,
    refreshPredictions: fetchPredictions,
    generateNewPredictions,
    dismissPrediction,
    convertToMission,
    answerCalibration,
    filterByHorizon,
    filterByDomain,
  };
};

export default usePredictions;
