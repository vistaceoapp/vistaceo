import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrain } from "@/hooks/use-brain";
import { 
  auditContent, 
  generateConceptHash, 
  generateIntentSignature,
  AUDIT_THRESHOLDS,
  type ExistingItem 
} from "@/lib/user-lifecycle/audit-pipeline";
import { emitEvent } from "@/lib/user-lifecycle/observability";

interface LearningItem {
  id: string;
  title: string;
  content: string | null;
  item_type: string;
  source: string | null;
  action_steps: unknown;
  is_read: boolean;
  is_saved: boolean;
  created_at: string;
}

interface AuditedLearningItem extends LearningItem {
  auditScore: number;
  auditPassed: boolean;
  conceptHash: string;
  intentSignature: string;
}

interface UseAuditedLearningResult {
  items: AuditedLearningItem[];
  rawCount: number;
  filteredCount: number;
  blockedCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Zero-Failure hook for learning/I+D items
 * Fetches, audits, deduplicates and filters research items
 */
export function useAuditedLearning(): UseAuditedLearningResult {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const [items, setItems] = useState<AuditedLearningItem[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAndAudit = useCallback(async () => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rawItems = data || [];
      setRawCount(rawItems.length);

      // Build business context for auditing
      const businessContext = {
        id: currentBusiness.id,
        name: currentBusiness.name,
        category: brain?.primary_business_type || currentBusiness.category || undefined,
        country: currentBusiness.country || undefined,
        focusArea: brain?.current_focus || "ventas",
      };

      // Build existing items for deduplication
      const existingItems: ExistingItem[] = rawItems.map(i => ({
        id: i.id,
        type: 'insight' as const,
        title: i.title,
        description: i.content || "",
        conceptHash: generateConceptHash(i.title, i.content || ""),
        intentSignature: generateIntentSignature(i.title, i.content || "", i.item_type || undefined),
        createdAt: new Date(i.created_at),
      }));

      // Audit each item
      const auditedItems: AuditedLearningItem[] = [];
      const seenHashes = new Set<string>();
      const seenSignatures = new Set<string>();

      for (const item of rawItems) {
        // Generate deduplication hashes
        const conceptHash = generateConceptHash(item.title, item.content || "");
        const intentSignature = generateIntentSignature(
          item.title,
          item.content || "",
          item.item_type || undefined
        );

        // Check for duplicates
        if (seenHashes.has(conceptHash) || seenSignatures.has(intentSignature)) {
          emitEvent({
            type: "content_blocked",
            contentType: "learning",
            contentId: item.id,
            reason: "duplicate_detected",
            details: { conceptHash, intentSignature },
          });
          continue;
        }

        seenHashes.add(conceptHash);
        seenSignatures.add(intentSignature);

        // Run audit pipeline
        const auditResult = await auditContent(
          {
            type: "insight",
            businessId: currentBusiness.id,
            title: item.title,
            description: item.content || "",
            source: item.source || "research",
            metadata: {
              actionSteps: item.action_steps,
              isSaved: item.is_saved,
            },
          },
          businessContext,
          existingItems.filter(e => e.id !== item.id)
        );

        const threshold = AUDIT_THRESHOLDS.insight;
        const passed = auditResult.averageScore >= threshold.minAverageScore &&
                       auditResult.scores.relevance >= threshold.minRelevance;

        if (passed) {
          auditedItems.push({
            ...item,
            auditScore: auditResult.averageScore,
            auditPassed: true,
            conceptHash,
            intentSignature,
          });
        } else {
          emitEvent({
            type: "content_blocked",
            contentType: "learning",
            contentId: item.id,
            reason: "failed_quality_gate",
            details: auditResult,
          });
        }
      }

      setItems(auditedItems);

      emitEvent({
        type: "audit_complete",
        contentType: "learning",
        stats: {
          raw: rawItems.length,
          passed: auditedItems.length,
          blocked: rawItems.length - auditedItems.length,
        },
      });
    } catch (error) {
      console.error("Error fetching audited learning:", error);
      emitEvent({
        type: "audit_error",
        contentType: "learning",
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, brain]);

  useEffect(() => {
    fetchAndAudit();
  }, [fetchAndAudit]);

  return {
    items,
    rawCount,
    filteredCount: items.length,
    blockedCount: rawCount - items.length,
    loading,
    refetch: fetchAndAudit,
  };
}
