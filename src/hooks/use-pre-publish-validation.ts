/**
 * Pre-Publish Validation Hook
 * 
 * Validates any content before it's shown to users.
 * Integrates with audit pipeline, rate limiting, and deduplication.
 */

import { useCallback, useRef } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useContentAudit, batchAuditContent, filterPassingContent } from './use-content-audit';
import { 
  ContentCandidate, 
  ContentType, 
  AuditResult,
  BusinessContext,
} from '@/lib/user-lifecycle/audit-pipeline';
import { logger } from '@/lib/user-lifecycle/observability';

interface PrePublishOptions {
  contentType: ContentType;
  maxItems?: number;
  requireMinScore?: number;
  enforceRateLimits?: boolean;
}

interface PrePublishResult<T> {
  approved: T[];
  rejected: Array<{ item: T; reason: string; scores: Record<string, number> }>;
  rateLimited: boolean;
  totalProcessed: number;
}

export function usePrePublishValidation<T extends { title: string; description: string }>({
  contentType,
  maxItems = 5,
  requireMinScore = 65,
  enforceRateLimits = true,
}: PrePublishOptions) {
  const { currentBusiness } = useBusiness();
  const { fetchExistingItems, rateLimitResult } = useContentAudit({ 
    contentType, 
    autoFetchExisting: true 
  });
  
  const processingRef = useRef(false);

  const validate = useCallback(async (
    items: T[],
    toContentCandidate: (item: T) => Omit<ContentCandidate, 'type' | 'businessId'>
  ): Promise<PrePublishResult<T>> => {
    if (processingRef.current) {
      console.warn('[PrePublish] Already processing, skipping');
      return {
        approved: [],
        rejected: [],
        rateLimited: false,
        totalProcessed: 0,
      };
    }

    if (!currentBusiness) {
      return {
        approved: [],
        rejected: [],
        rateLimited: false,
        totalProcessed: 0,
      };
    }

    processingRef.current = true;

    try {
      // Check rate limits first
      if (enforceRateLimits && rateLimitResult && !rateLimitResult.allowed) {
        logger.audit.rateLimitHit(
          currentBusiness.id,
          contentType,
          rateLimitResult.limit,
          rateLimitResult.currentCount
        );

        return {
          approved: [],
          rejected: items.map(item => ({
            item,
            reason: rateLimitResult.reason || 'Rate limit exceeded',
            scores: {},
          })),
          rateLimited: true,
          totalProcessed: items.length,
        };
      }

      // Fetch existing items for deduplication
      const existingItems = await fetchExistingItems();

      // Build business context
      const businessContext: BusinessContext = {
        id: currentBusiness.id,
        name: currentBusiness.name,
        category: currentBusiness.category || undefined,
        country: currentBusiness.country || undefined,
      };

      // Convert items to candidates
      const candidates = items.slice(0, maxItems * 2).map(item => ({
        ...toContentCandidate(item),
        type: contentType,
      }));

      // Batch audit
      const auditResults = await batchAuditContent(
        candidates,
        businessContext,
        existingItems
      );

      // Separate approved and rejected
      const approved: T[] = [];
      const rejected: Array<{ item: T; reason: string; scores: Record<string, number> }> = [];

      for (let i = 0; i < Math.min(items.length, auditResults.length); i++) {
        const item = items[i];
        const result = auditResults[i]?.result;

        if (!result) continue;

        if (result.passed && result.averageScore >= requireMinScore) {
          if (approved.length < maxItems) {
            approved.push(item);
            
            logger.content.generated(
              currentBusiness.id,
              contentType,
              1,
              'pre_publish_validation'
            );
          }
        } else {
          const reason = result.issues.length > 0 
            ? result.issues.map(i => i.message).join('; ')
            : `Score below threshold: ${result.averageScore.toFixed(0)}`;

          const scoresRecord: Record<string, number> = {
            relevance: result.scores.relevance,
            personalization: result.scores.personalization,
            novelty: result.scores.novelty,
            coherence: result.scores.coherence,
            actionability: result.scores.actionability,
          };

          rejected.push({
            item,
            reason,
            scores: scoresRecord,
          });

          logger.content.rejected(
            currentBusiness.id,
            contentType,
            reason,
            scoresRecord
          );
        }
      }

      return {
        approved,
        rejected,
        rateLimited: false,
        totalProcessed: items.length,
      };
    } finally {
      processingRef.current = false;
    }
  }, [currentBusiness, contentType, maxItems, requireMinScore, enforceRateLimits, fetchExistingItems, rateLimitResult]);

  return { validate };
}

// ============================================
// SPECIFIC VALIDATORS
// ============================================

export function useOpportunityValidator() {
  return usePrePublishValidation<{
    title: string;
    description: string;
    source?: string;
    evidence?: Array<{ type: string; summary: string }>;
    impact_score?: number;
    effort_score?: number;
  }>({
    contentType: 'opportunity',
    maxItems: 3,
    requireMinScore: 65,
    enforceRateLimits: true,
  });
}

export function useMissionValidator() {
  return usePrePublishValidation<{
    title: string;
    description: string;
    steps?: Array<{ title: string; description?: string }>;
    category?: string;
    priority?: string;
  }>({
    contentType: 'mission',
    maxItems: 2,
    requireMinScore: 70,
    enforceRateLimits: true,
  });
}

export function useInsightValidator() {
  return usePrePublishValidation<{
    title: string;
    description: string;
    category?: string;
    actionSuggestion?: string;
  }>({
    contentType: 'insight',
    maxItems: 5,
    requireMinScore: 60,
    enforceRateLimits: true,
  });
}
