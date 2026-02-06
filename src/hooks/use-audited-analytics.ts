/**
 * Audited Analytics Hook
 * 
 * Provides validated analytics data with Zero-Failure guarantees.
 * Ensures no synthetic/fake data is ever displayed - only real metrics.
 */

import { useMemo, useCallback } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuditedBrain } from './use-audited-brain';
import { eventBus } from '@/lib/user-lifecycle/observability';

interface HealthDimension {
  key: string;
  label: string;
  value: number | null;  // null = no real data
  trend: 'up' | 'down' | 'stable' | null;
  isReal: boolean;
}

interface AnalyticsValidation {
  hasRealData: boolean;
  dataFreshness: 'fresh' | 'stale' | 'none';
  missingDimensions: string[];
  lastUpdate: string | null;
}

const DIMENSION_LABELS: Record<string, string> = {
  equipo: 'Equipo',
  crecimiento: 'Crecimiento',
  trafico: 'Tráfico',
  finanzas: 'Finanzas',
  eficiencia: 'Eficiencia',
  reputacion: 'Reputación',
  rentabilidad: 'Rentabilidad',
};

export function useAuditedAnalytics() {
  const { currentBusiness } = useBusiness();
  const { brain, healthCheck } = useAuditedBrain();
  
  // Extract and validate health dimensions from brain
  const { dimensions, validation } = useMemo(() => {
    const dims: HealthDimension[] = [];
    const missing: string[] = [];
    let hasAnyReal = false;
    let lastUpdate: string | null = null;
    
    if (!brain?.memory?.dynamic_memory) {
      return {
        dimensions: Object.keys(DIMENSION_LABELS).map(key => ({
          key,
          label: DIMENSION_LABELS[key],
          value: null,
          trend: null,
          isReal: false,
        })),
        validation: {
          hasRealData: false,
          dataFreshness: 'none' as const,
          missingDimensions: Object.keys(DIMENSION_LABELS),
          lastUpdate: null,
        },
      };
    }

    const dynamicMemory = brain.memory.dynamic_memory as Record<string, unknown>;
    const healthData = dynamicMemory.health_scores as Record<string, unknown> | undefined;
    const trends = dynamicMemory.trends as Record<string, string> | undefined;
    
    for (const [key, label] of Object.entries(DIMENSION_LABELS)) {
      let value: number | null = null;
      let trend: 'up' | 'down' | 'stable' | null = null;
      let isReal = false;
      
      if (healthData && typeof healthData[key] === 'number') {
        value = healthData[key] as number;
        isReal = true;
        hasAnyReal = true;
      } else {
        missing.push(key);
      }
      
      if (trends && trends[key]) {
        trend = trends[key] as 'up' | 'down' | 'stable';
      }
      
      dims.push({ key, label, value, trend, isReal });
    }
    
    // Check freshness
    const lastLearning = brain.last_learning_at;
    if (lastLearning) {
      lastUpdate = lastLearning;
      const age = Date.now() - new Date(lastLearning).getTime();
      const ageHours = age / (1000 * 60 * 60);
      
      const freshness: 'fresh' | 'stale' | 'none' = 
        ageHours < 24 ? 'fresh' :
        ageHours < 168 ? 'stale' : 'none';
      
      return {
        dimensions: dims,
        validation: {
          hasRealData: hasAnyReal,
          dataFreshness: freshness,
          missingDimensions: missing,
          lastUpdate,
        },
      };
    }
    
    return {
      dimensions: dims,
      validation: {
        hasRealData: hasAnyReal,
        dataFreshness: 'none' as const,
        missingDimensions: missing,
        lastUpdate: null,
      },
    };
  }, [brain]);
  
  // Calculate overall health score (only from real data)
  const overallHealth = useMemo(() => {
    const realDimensions = dimensions.filter(d => d.isReal && d.value !== null);
    
    if (realDimensions.length === 0) return null;
    
    const sum = realDimensions.reduce((acc, d) => acc + (d.value || 0), 0);
    return Math.round(sum / realDimensions.length);
  }, [dimensions]);
  
  // Get actionable insights based on dimensions
  const actionableInsights = useMemo(() => {
    const insights: Array<{ dimension: string; message: string; priority: 'high' | 'medium' | 'low' }> = [];
    
    for (const dim of dimensions) {
      if (!dim.isReal || dim.value === null) continue;
      
      if (dim.value < 40) {
        insights.push({
          dimension: dim.key,
          message: `${dim.label} necesita atención urgente`,
          priority: 'high',
        });
      } else if (dim.value < 60 && dim.trend === 'down') {
        insights.push({
          dimension: dim.key,
          message: `${dim.label} está en tendencia negativa`,
          priority: 'medium',
        });
      } else if (dim.value >= 80 && dim.trend === 'up') {
        insights.push({
          dimension: dim.key,
          message: `${dim.label} muestra excelente desempeño`,
          priority: 'low',
        });
      }
    }
    
    return insights.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }, [dimensions]);
  
  // Track analytics view
  const trackAnalyticsView = useCallback((section: string) => {
    if (!currentBusiness?.id) return;
    
    eventBus.emit({
      category: 'content_generation',
      severity: 'info',
      action: 'analytics_viewed',
      businessId: currentBusiness.id,
      payload: { section },
    });
  }, [currentBusiness?.id]);
  
  // Check if specific analytics section has real data
  const hasRealDataFor = useCallback((dimensionKey: string): boolean => {
    const dim = dimensions.find(d => d.key === dimensionKey);
    return dim?.isReal === true;
  }, [dimensions]);
  
  return {
    // Validated dimensions
    dimensions,
    overallHealth,
    
    // Validation info
    validation,
    hasRealData: validation.hasRealData,
    
    // Insights
    actionableInsights,
    
    // Brain health passthrough
    brainHealth: healthCheck,
    brainCompleteness: healthCheck.completeness,
    
    // Utilities
    hasRealDataFor,
    trackAnalyticsView,
  };
}

export default useAuditedAnalytics;
