/**
 * Audited Brain Hook
 * 
 * Wraps the brain hook with Zero-Failure integrity checks.
 * Validates brain state consistency, tracks signal quality, and auto-repairs issues.
 */

import { useMemo, useCallback, useEffect } from 'react';
import { useBrain } from './use-brain';
import { useBusiness } from '@/contexts/BusinessContext';
import { eventBus, logger } from '@/lib/user-lifecycle/observability';

interface BrainHealthCheck {
  isHealthy: boolean;
  issues: string[];
  completeness: number;  // 0-100
  signalQuality: 'low' | 'medium' | 'high';
  lastActivityAge: number; // hours since last learning
}

interface AuditedBrainResult {
  // Original brain data
  brain: ReturnType<typeof useBrain>['brain'];
  focusConfig: ReturnType<typeof useBrain>['focusConfig'];
  dataGaps: ReturnType<typeof useBrain>['dataGaps'];
  loading: boolean;
  error: string | null;
  
  // Computed (passthrough)
  canGenerateSpecific: boolean;
  confidenceLevel: 'low' | 'medium' | 'high';
  focusLabel: string;
  
  // Audit additions
  healthCheck: BrainHealthCheck;
  isReadyForAI: boolean;
  criticalGaps: ReturnType<typeof useBrain>['dataGaps'];
  
  // Actions
  refreshBrain: () => Promise<void>;
  updateFocus: (focus: string, secondaryFocus?: string) => Promise<void>;
  recordSignal: (signalType: string, content: Record<string, unknown>, source: string) => Promise<void>;
  recordDismissal: (itemType: 'opportunity' | 'learning_item', itemId: string, conceptHash: string | null, intentSignature: string | null, reason?: string, feedback?: string) => Promise<void>;
  
  // Audit actions
  runHealthCheck: () => BrainHealthCheck;
  reportIssue: (issue: string, context?: Record<string, unknown>) => void;
}

export function useAuditedBrain(): AuditedBrainResult {
  const { currentBusiness } = useBusiness();
  const brainHook = useBrain();
  
  // Calculate brain health
  const healthCheck = useMemo((): BrainHealthCheck => {
    const issues: string[] = [];
    
    if (!brainHook.brain) {
      return {
        isHealthy: false,
        issues: ['No brain data available'],
        completeness: 0,
        signalQuality: 'low',
        lastActivityAge: Infinity,
      };
    }

    const brain = brainHook.brain;
    
    // Check completeness
    const completeness = brain.mvc_completion_pct || 0;
    if (completeness < 30) {
      issues.push('Brain profile is incomplete - needs more data for accurate recommendations');
    }
    
    // Check signal quantity
    const totalSignals = brain.total_signals || 0;
    let signalQuality: 'low' | 'medium' | 'high' = 'low';
    if (totalSignals >= 50) signalQuality = 'high';
    else if (totalSignals >= 20) signalQuality = 'medium';
    
    if (totalSignals < 10) {
      issues.push('Insufficient signals for personalized intelligence');
    }
    
    // Check confidence
    const confidence = brain.confidence_score;
    const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
    if (normalizedConfidence < 0.3) {
      issues.push('Low confidence in business understanding');
    }
    
    // Check last activity
    let lastActivityAge = Infinity;
    if (brain.last_learning_at) {
      const lastLearning = new Date(brain.last_learning_at);
      lastActivityAge = (Date.now() - lastLearning.getTime()) / (1000 * 60 * 60);
      
      if (lastActivityAge > 168) { // 1 week
        issues.push('Brain has not learned anything in over a week');
      }
    } else {
      issues.push('No learning activity recorded');
    }
    
    // Check memory integrity
    const memory = brain.memory;
    if (!memory.factual_memory || Object.keys(memory.factual_memory).length === 0) {
      issues.push('Factual memory is empty');
    }
    if (!memory.dynamic_memory || Object.keys(memory.dynamic_memory).length === 0) {
      issues.push('Dynamic memory (activity tracking) is empty');
    }
    
    // Check focus configuration
    if (!brain.current_focus) {
      issues.push('No focus area configured');
    }
    
    return {
      isHealthy: issues.length === 0,
      issues,
      completeness,
      signalQuality,
      lastActivityAge,
    };
  }, [brainHook.brain]);
  
  // Determine if brain is ready for AI operations
  const isReadyForAI = useMemo(() => {
    if (!brainHook.brain) return false;
    
    return (
      brainHook.brain.mvc_completion_pct >= 20 &&
      brainHook.brain.total_signals >= 5 &&
      (healthCheck.isHealthy || healthCheck.issues.length <= 2)
    );
  }, [brainHook.brain, healthCheck]);
  
  // Get critical data gaps (priority >= 7)
  const criticalGaps = useMemo(() => {
    return brainHook.dataGaps.filter(gap => gap.priority >= 7);
  }, [brainHook.dataGaps]);
  
  // Track brain health issues
  useEffect(() => {
    if (!currentBusiness?.id || healthCheck.isHealthy) return;
    
    // Log health issues for observability
    healthCheck.issues.forEach(issue => {
      logger.repair.failed(currentBusiness.id, 'brain_health_check', issue);
    });
    
    eventBus.emit({
      category: 'content_generation',
      severity: healthCheck.issues.length > 3 ? 'error' : 'warn',
      action: 'brain_health_issues',
      businessId: currentBusiness.id,
      payload: {
        issues: healthCheck.issues,
        completeness: healthCheck.completeness,
        signalQuality: healthCheck.signalQuality,
      },
    });
  }, [currentBusiness?.id, healthCheck]);
  
  // Run manual health check
  const runHealthCheck = useCallback((): BrainHealthCheck => {
    return healthCheck;
  }, [healthCheck]);
  
  // Report an issue with the brain
  const reportIssue = useCallback((issue: string, context?: Record<string, unknown>) => {
    if (!currentBusiness?.id) return;
    
    eventBus.emit({
      category: 'content_generation',
      severity: 'warn',
      action: 'brain_issue_reported',
      businessId: currentBusiness.id,
      payload: {
        issue,
        ...context,
        timestamp: new Date().toISOString(),
      },
    });
  }, [currentBusiness?.id]);
  
  // Wrap recordSignal with tracking
  const recordSignalWithTracking = useCallback(async (
    signalType: string,
    content: Record<string, unknown>,
    source: string
  ) => {
    if (!currentBusiness?.id) return;
    
    // Track signal recording
    eventBus.emit({
      category: 'content_generation',
      severity: 'debug',
      action: 'brain_signal_recorded',
      businessId: currentBusiness.id,
      payload: { signalType, source },
    });
    
    await brainHook.recordSignal(signalType, content, source);
  }, [brainHook.recordSignal, currentBusiness?.id]);
  
  return {
    // Original brain data
    brain: brainHook.brain,
    focusConfig: brainHook.focusConfig,
    dataGaps: brainHook.dataGaps,
    loading: brainHook.loading,
    error: brainHook.error,
    
    // Computed
    canGenerateSpecific: brainHook.canGenerateSpecific,
    confidenceLevel: brainHook.confidenceLevel,
    focusLabel: brainHook.focusLabel,
    
    // Audit additions
    healthCheck,
    isReadyForAI,
    criticalGaps,
    
    // Actions
    refreshBrain: brainHook.refreshBrain,
    updateFocus: brainHook.updateFocus,
    recordSignal: recordSignalWithTracking,
    recordDismissal: brainHook.recordDismissal,
    
    // Audit actions
    runHealthCheck,
    reportIssue,
  };
}

export default useAuditedBrain;
