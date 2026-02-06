/**
 * Audited Opportunities Hook
 * 
 * Fetches and filters opportunities through the audit pipeline.
 * Only returns opportunities that pass quality gates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusiness } from '@/contexts/BusinessContext';
import { useBrain } from '@/hooks/use-brain';
import {
  auditContent,
  ContentCandidate,
  AuditResult,
  AUDIT_THRESHOLDS,
  BusinessContext,
  ExistingItem,
} from '@/lib/user-lifecycle/audit-pipeline';
import { logger } from '@/lib/user-lifecycle/observability';

// ============================================
// TYPES
// ============================================

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  evidence: unknown;
  impact_score: number;
  effort_score: number;
  is_converted: boolean;
  created_at: string;
  concept_hash?: string;
  intent_signature?: string;
  quality_gate_score?: number;
  quality_gate_details?: unknown;
}

interface AuditedOpportunity extends Opportunity {
  auditResult: AuditResult;
  passesAudit: boolean;
}

interface UseAuditedOpportunitiesResult {
  opportunities: AuditedOpportunity[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    passed: number;
    filtered: number;
    averageScore: number;
  };
  refresh: () => Promise<void>;
  dismissOpportunity: (id: string, reason?: string) => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useAuditedOpportunities(): UseAuditedOpportunitiesResult {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  
  const [rawOpportunities, setRawOpportunities] = useState<Opportunity[]>([]);
  const [auditedOpportunities, setAuditedOpportunities] = useState<AuditedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build business context for audit
  const businessContext: BusinessContext | undefined = useMemo(() => {
    if (!currentBusiness) return undefined;
    
    return {
      id: currentBusiness.id,
      name: currentBusiness.name,
      category: currentBusiness.category || undefined,
      country: currentBusiness.country || undefined,
      sector: brain?.primary_business_type,
      focusArea: brain?.current_focus,
    };
  }, [currentBusiness, brain]);

  // Fetch and audit opportunities
  const fetchAndAudit = useCallback(async () => {
    if (!currentBusiness || !businessContext) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch raw opportunities
      const { data, error: fetchError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .is('dismissed_at', null)
        .eq('is_converted', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const opportunities = data || [];
      setRawOpportunities(opportunities);

      // Fetch existing items for deduplication
      const { data: existingData } = await supabase
        .from('opportunities')
        .select('id, title, description, concept_hash, intent_signature, created_at')
        .eq('business_id', currentBusiness.id)
        .not('dismissed_at', 'is', null);

      const existingItems: ExistingItem[] = (existingData || []).map(item => ({
        id: item.id,
        type: 'opportunity' as const,
        title: item.title,
        description: item.description || '',
        conceptHash: item.concept_hash || undefined,
        intentSignature: item.intent_signature || undefined,
        createdAt: new Date(item.created_at),
      }));

      // Audit each opportunity
      const auditedPromises = opportunities.map(async (opp) => {
        const candidate: ContentCandidate = {
          type: 'opportunity',
          businessId: currentBusiness.id,
          title: opp.title,
          description: opp.description || '',
          source: opp.source || undefined,
          basedOn: opp.evidence ? [{ type: 'data', summary: 'Evidence from analysis' }] : undefined,
          variables: opp.evidence as Record<string, unknown> || undefined,
        };

        const result = await auditContent(candidate, businessContext, existingItems);
        const threshold = AUDIT_THRESHOLDS.opportunity;
        const passesAudit = result.averageScore >= threshold.minAverageScore &&
                           result.scores.relevance >= threshold.minRelevance;

        return {
          ...opp,
          auditResult: result,
          passesAudit,
        };
      });

      const audited = await Promise.all(auditedPromises);

      // Sort by audit score (highest first)
      audited.sort((a, b) => b.auditResult.averageScore - a.auditResult.averageScore);

      setAuditedOpportunities(audited);

      // Log audit results
      const passed = audited.filter(o => o.passesAudit).length;
      logger.audit.contentAudited(
        currentBusiness.id,
        'opportunity',
        passed > 0,
        {
          total: audited.length,
          passed,
          filtered: audited.length - passed,
          averageScore: audited.length > 0 
            ? audited.reduce((sum, o) => sum + o.auditResult.averageScore, 0) / audited.length 
            : 0,
        }
      );

    } catch (err) {
      console.error('[AuditedOpportunities] Error:', err);
      setError('Error al cargar oportunidades');
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, businessContext]);

  // Dismiss opportunity with tracking
  const dismissOpportunity = useCallback(async (id: string, reason?: string) => {
    if (!currentBusiness) return;

    try {
      // Find the opportunity
      const opp = auditedOpportunities.find(o => o.id === id);
      
      // Update in database
      const { error } = await supabase
        .from('opportunities')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Record rejected concept for future filtering
      if (opp) {
        await supabase.from('rejected_concepts').insert({
          business_id: currentBusiness.id,
          concept_hash: opp.concept_hash || `hash_${id}`,
          intent_signature: opp.intent_signature,
          source_type: 'opportunity',
          source_id: id,
          reason: reason || 'dismissed',
          user_feedback: reason,
        });

        // Record brain signal
        await supabase.functions.invoke('brain-record-signal', {
          body: {
            businessId: currentBusiness.id,
            signalType: 'radar_item_dismissed',
            content: {
              opportunityId: id,
              opportunityTitle: opp.title,
              reason,
              auditScore: opp.auditResult.averageScore,
            },
            source: 'radar',
          },
        });
      }

      // Log event
      logger.content.rejected(
        currentBusiness.id,
        'opportunity',
        reason || 'user_dismissed',
        { auditScore: opp?.auditResult.averageScore }
      );

      // Refresh list
      await fetchAndAudit();

    } catch (err) {
      console.error('[AuditedOpportunities] Dismiss error:', err);
      throw err;
    }
  }, [currentBusiness, auditedOpportunities, fetchAndAudit]);

  // Initial fetch
  useEffect(() => {
    fetchAndAudit();
  }, [fetchAndAudit]);

  // Calculate stats
  const stats = useMemo(() => {
    const passed = auditedOpportunities.filter(o => o.passesAudit);
    const filtered = auditedOpportunities.filter(o => !o.passesAudit);
    const totalScore = auditedOpportunities.reduce((sum, o) => sum + o.auditResult.averageScore, 0);

    return {
      total: auditedOpportunities.length,
      passed: passed.length,
      filtered: filtered.length,
      averageScore: auditedOpportunities.length > 0 
        ? Math.round(totalScore / auditedOpportunities.length) 
        : 0,
    };
  }, [auditedOpportunities]);

  return {
    opportunities: auditedOpportunities.filter(o => o.passesAudit), // Only return passing
    loading,
    error,
    stats,
    refresh: fetchAndAudit,
    dismissOpportunity,
  };
}

/**
 * Hook to get all opportunities including filtered ones (for admin/debug)
 */
export function useAllOpportunitiesWithAudit() {
  const result = useAuditedOpportunities();
  
  return {
    ...result,
    allOpportunities: result.opportunities,
  };
}
