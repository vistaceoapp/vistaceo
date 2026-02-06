/**
 * Audited Predictions Hook
 * 
 * Wraps the predictions hook with Zero-Failure audit pipeline.
 * Filters predictions that don't meet quality thresholds and tracks usage.
 */

import { useMemo, useCallback } from 'react';
import { usePredictions } from './use-predictions';
import { useBusiness } from '@/contexts/BusinessContext';
import { generateConceptHash, GLOBAL_BLOCKED_PHRASES } from '@/lib/user-lifecycle/audit-pipeline';
import { eventBus } from '@/lib/user-lifecycle/observability';
import type { Prediction } from '@/lib/predictions/types';

interface AuditedPrediction extends Prediction {
  auditScore: number;
}

interface AuditThresholds {
  minAverageScore: number;
  minConfidence: number;
  minRelevance: number;
}

const DEFAULT_THRESHOLDS: AuditThresholds = {
  minAverageScore: 60,
  minConfidence: 0.4,
  minRelevance: 55,
};

// Simple scoring function for predictions
function scorePrediction(prediction: Prediction): number {
  let score = 50;
  
  // Confidence bonus
  score += prediction.confidence * 30;
  
  // Probability bonus
  score += prediction.probability * 20;
  
  // Evidence bonus
  if (prediction.evidence?.evidence_strength === 'high') score += 15;
  else if (prediction.evidence?.evidence_strength === 'medium') score += 10;
  
  // Check for blocked phrases
  const text = `${prediction.title} ${prediction.summary || ''}`.toLowerCase();
  const hasBlocked = GLOBAL_BLOCKED_PHRASES.some(phrase => text.includes(phrase.toLowerCase()));
  if (hasBlocked) score -= 30;
  
  return Math.max(0, Math.min(100, score));
}

export function useAuditedPredictions(thresholds: Partial<AuditThresholds> = {}) {
  const { currentBusiness } = useBusiness();
  const predictionsHook = usePredictions();
  
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  // Audit and filter predictions
  const { auditedPredictions, stats } = useMemo(() => {
    if (!currentBusiness || !predictionsHook.predictions.length) {
      return { 
        auditedPredictions: [] as AuditedPrediction[], 
        stats: { total: 0, passed: 0, filtered: 0, duplicates: 0 } 
      };
    }

    const audited: AuditedPrediction[] = [];
    const seenHashes = new Set<string>();
    let filtered = 0;
    let duplicates = 0;

    for (const prediction of predictionsHook.predictions) {
      // Generate concept hash for deduplication
      const conceptHash = generateConceptHash(prediction.title, prediction.summary || '');
      
      // Check for duplicates
      if (seenHashes.has(conceptHash)) {
        duplicates++;
        continue;
      }
      
      // Score content
      const auditScore = scorePrediction(prediction);

      // Check thresholds
      const passesAudit = 
        auditScore >= finalThresholds.minAverageScore &&
        prediction.confidence >= finalThresholds.minConfidence;

      if (passesAudit) {
        seenHashes.add(conceptHash);
        audited.push({
          ...prediction,
          auditScore,
        });
      } else {
        filtered++;
        
        // Log filtered prediction for observability
        eventBus.emit({
          category: 'content_generation',
          severity: 'debug',
          action: 'prediction_filtered',
          businessId: currentBusiness.id,
          payload: {
            predictionId: prediction.id,
            title: prediction.title,
            auditScore,
            confidence: prediction.confidence,
          },
        });
      }
    }

    // Sort by combination of audit score and probability
    audited.sort((a, b) => {
      const aScore = a.auditScore * 0.4 + a.probability * 100 * 0.6;
      const bScore = b.auditScore * 0.4 + b.probability * 100 * 0.6;
      return bScore - aScore;
    });

    return {
      auditedPredictions: audited,
      stats: {
        total: predictionsHook.predictions.length,
        passed: audited.length,
        filtered,
        duplicates,
      },
    };
  }, [predictionsHook.predictions, currentBusiness, finalThresholds]);

  // Track when predictions are viewed
  const trackPredictionView = useCallback((predictionId: string) => {
    if (!currentBusiness) return;
    
    eventBus.emit({
      category: 'content_generation',
      severity: 'info',
      action: 'prediction_viewed',
      businessId: currentBusiness.id,
      payload: { predictionId },
    });
  }, [currentBusiness]);

  // Track when prediction is converted to mission
  const trackPredictionConversion = useCallback((predictionId: string, missionId: string) => {
    if (!currentBusiness) return;
    
    eventBus.emit({
      category: 'content_generation',
      severity: 'info',
      action: 'prediction_converted',
      businessId: currentBusiness.id,
      payload: { predictionId, missionId },
    });
  }, [currentBusiness]);

  // Get high-confidence predictions (Level A or B only)
  const highConfidencePredictions = useMemo(() => {
    return auditedPredictions.filter(p => 
      p.publication_level === 'A' || p.publication_level === 'B'
    );
  }, [auditedPredictions]);

  // Get breakpoints (critical predictions)
  const breakpoints = useMemo(() => {
    return auditedPredictions.filter(p => p.is_breakpoint);
  }, [auditedPredictions]);

  return {
    // Audited data
    predictions: auditedPredictions,
    highConfidencePredictions,
    breakpoints,
    auditStats: stats,
    
    // Original hook data
    calibrations: predictionsHook.calibrations,
    uiModel: predictionsHook.uiModel,
    loading: predictionsHook.loading,
    error: predictionsHook.error,
    
    // Actions (passthrough)
    refreshPredictions: predictionsHook.refreshPredictions,
    generateNewPredictions: predictionsHook.generateNewPredictions,
    dismissPrediction: predictionsHook.dismissPrediction,
    convertToMission: predictionsHook.convertToMission,
    answerCalibration: predictionsHook.answerCalibration,
    filterByHorizon: predictionsHook.filterByHorizon,
    filterByDomain: predictionsHook.filterByDomain,
    
    // Tracking
    trackPredictionView,
    trackPredictionConversion,
  };
}

export default useAuditedPredictions;
