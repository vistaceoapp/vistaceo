/**
 * Content Audit Hook
 * 
 * Provides audit functionality for any content before display.
 * Integrates with the Zero-Failure audit pipeline.
 */

import { useState, useCallback } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import {
  auditContent,
  ContentCandidate,
  ContentType,
  AuditResult,
  BusinessContext,
  ExistingItem,
  checkRateLimit,
  RateLimitResult,
} from '@/lib/user-lifecycle/audit-pipeline';

interface UseContentAuditOptions {
  contentType: ContentType;
  autoFetchExisting?: boolean;
}

interface AuditState {
  isAuditing: boolean;
  lastResult: AuditResult | null;
  rateLimitResult: RateLimitResult | null;
  error: string | null;
}

export function useContentAudit({ contentType, autoFetchExisting = true }: UseContentAuditOptions) {
  const { currentBusiness } = useBusiness();
  const [state, setState] = useState<AuditState>({
    isAuditing: false,
    lastResult: null,
    rateLimitResult: null,
    error: null,
  });

  const fetchExistingItems = useCallback(async (): Promise<ExistingItem[]> => {
    if (!currentBusiness?.id) return [];

    try {
      // Fetch based on content type
      let items: ExistingItem[] = [];

      if (contentType === 'opportunity') {
        const { data } = await supabase
          .from('opportunities')
          .select('id, title, description, concept_hash, intent_signature, created_at')
          .eq('business_id', currentBusiness.id)
          .is('dismissed_at', null)
          .order('created_at', { ascending: false })
          .limit(100);

        items = (data || []).map(item => ({
          id: item.id,
          type: 'opportunity' as ContentType,
          title: item.title,
          description: item.description || '',
          conceptHash: item.concept_hash || undefined,
          intentSignature: item.intent_signature || undefined,
          createdAt: new Date(item.created_at),
        }));
      } else if (contentType === 'mission') {
        const { data } = await supabase
          .from('daily_actions')
          .select('id, title, description, created_at')
          .eq('business_id', currentBusiness.id)
          .in('status', ['pending', 'snoozed'])
          .order('created_at', { ascending: false })
          .limit(50);

        items = (data || []).map(item => ({
          id: item.id,
          type: 'mission' as ContentType,
          title: item.title,
          description: item.description || '',
          createdAt: new Date(item.created_at || new Date()),
        }));
      } else if (contentType === 'insight') {
        const { data } = await supabase
          .from('learning_items')
          .select('id, title, content, created_at')
          .eq('business_id', currentBusiness.id)
          .order('created_at', { ascending: false })
          .limit(100);

        items = (data || []).map(item => ({
          id: item.id,
          type: 'insight' as ContentType,
          title: item.title,
          description: item.content || '',
          createdAt: new Date(item.created_at),
        }));
      }

      return items;
    } catch (error) {
      console.error('[ContentAudit] Error fetching existing items:', error);
      return [];
    }
  }, [currentBusiness?.id, contentType]);

  const buildBusinessContext = useCallback((): BusinessContext | null => {
    if (!currentBusiness) return null;

    return {
      id: currentBusiness.id,
      name: currentBusiness.name,
      category: currentBusiness.category || undefined,
      sector: undefined, // Could be derived from category
      country: currentBusiness.country || undefined,
      focusArea: undefined, // Could come from focus_config
    };
  }, [currentBusiness]);

  const audit = useCallback(async (
    content: Omit<ContentCandidate, 'type' | 'businessId'>
  ): Promise<AuditResult | null> => {
    const businessContext = buildBusinessContext();
    if (!businessContext) {
      setState(prev => ({ ...prev, error: 'No business context available' }));
      return null;
    }

    setState(prev => ({ ...prev, isAuditing: true, error: null }));

    try {
      // Fetch existing items for deduplication
      const existingItems = autoFetchExisting ? await fetchExistingItems() : [];

      // Check rate limits
      const dailyLimit = checkRateLimit(contentType, existingItems, 'daily');
      const weeklyLimit = checkRateLimit(contentType, existingItems, 'weekly');

      const rateLimitResult = !dailyLimit.allowed ? dailyLimit : 
                             !weeklyLimit.allowed ? weeklyLimit : 
                             dailyLimit;

      // Build full content candidate
      const fullContent: ContentCandidate = {
        ...content,
        type: contentType,
        businessId: businessContext.id,
      };

      // Run audit
      const result = await auditContent(fullContent, businessContext, existingItems);

      setState({
        isAuditing: false,
        lastResult: result,
        rateLimitResult,
        error: null,
      });

      // Log audit result for observability
      console.log(`[ContentAudit] ${contentType} audit:`, {
        passed: result.passed,
        averageScore: result.averageScore,
        issues: result.issues.length,
        rateLimited: !rateLimitResult.allowed,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Audit failed';
      setState(prev => ({
        ...prev,
        isAuditing: false,
        error: errorMessage,
      }));
      console.error('[ContentAudit] Error:', error);
      return null;
    }
  }, [buildBusinessContext, fetchExistingItems, autoFetchExisting, contentType]);

  const canPublish = useCallback((): boolean => {
    if (!state.lastResult) return false;
    if (!state.rateLimitResult?.allowed) return false;
    return state.lastResult.passed;
  }, [state.lastResult, state.rateLimitResult]);

  return {
    audit,
    canPublish,
    isAuditing: state.isAuditing,
    lastResult: state.lastResult,
    rateLimitResult: state.rateLimitResult,
    error: state.error,
    fetchExistingItems,
  };
}

// Helper to batch audit multiple items
export async function batchAuditContent(
  items: Omit<ContentCandidate, 'businessId'>[],
  businessContext: BusinessContext,
  existingItems: ExistingItem[]
): Promise<Array<{ content: ContentCandidate; result: AuditResult }>> {
  const results: Array<{ content: ContentCandidate; result: AuditResult }> = [];

  for (const item of items) {
    const fullContent: ContentCandidate = {
      ...item,
      businessId: businessContext.id,
    };

    const result = await auditContent(fullContent, businessContext, existingItems);
    results.push({ content: fullContent, result });

    // Add to existing items for subsequent deduplication
    if (result.passed) {
      existingItems.push({
        id: `pending_${Date.now()}_${Math.random()}`,
        type: item.type,
        title: item.title,
        description: item.description,
        createdAt: new Date(),
      });
    }
  }

  return results;
}

// Filter to only passing items
export function filterPassingContent<T extends { title: string; description: string }>(
  items: T[],
  auditResults: Array<{ content: ContentCandidate; result: AuditResult }>
): T[] {
  const passingTitles = new Set(
    auditResults
      .filter(r => r.result.passed)
      .map(r => r.content.title)
  );

  return items.filter(item => passingTitles.has(item.title));
}
