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

interface Mission {
  id: string;
  title: string;
  description: string | null;
  area: string | null;
  steps: unknown;
  current_step: number;
  status: string;
  impact_score: number;
  effort_score: number;
  created_at: string;
}

interface AuditedMission extends Mission {
  auditScore: number;
  auditPassed: boolean;
  conceptHash: string;
  intentSignature: string;
}

interface UseAuditedMissionsResult {
  missions: AuditedMission[];
  rawCount: number;
  filteredCount: number;
  blockedCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Zero-Failure hook for missions
 * Fetches, audits, deduplicates and filters missions
 */
export function useAuditedMissions(): UseAuditedMissionsResult {
  const { currentBusiness } = useBusiness();
  const { brain } = useBrain();
  const [missions, setMissions] = useState<AuditedMission[]>([]);
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
        .from("missions")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .in("status", ["active", "paused"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rawMissions = data || [];
      setRawCount(rawMissions.length);

      // Build business context for auditing
      const businessContext = {
        id: currentBusiness.id,
        name: currentBusiness.name,
        category: brain?.primary_business_type || currentBusiness.category || undefined,
        country: currentBusiness.country || undefined,
        focusArea: brain?.current_focus || "ventas",
      };

      // Build existing items for deduplication
      const existingItems: ExistingItem[] = rawMissions.map(m => ({
        id: m.id,
        type: 'mission' as const,
        title: m.title,
        description: m.description || "",
        conceptHash: generateConceptHash(m.title, m.description || ""),
        intentSignature: generateIntentSignature(m.title, m.description || "", m.area || undefined),
        createdAt: new Date(m.created_at),
      }));

      // Audit each mission
      const auditedMissions: AuditedMission[] = [];
      const seenHashes = new Set<string>();
      const seenSignatures = new Set<string>();

      for (const mission of rawMissions) {
        // Generate deduplication hashes
        const conceptHash = generateConceptHash(mission.title, mission.description || "");
        const intentSignature = generateIntentSignature(
          mission.title,
          mission.description || "",
          mission.area || undefined
        );

        // Check for duplicates (skip clones)
        if (seenHashes.has(conceptHash) || seenSignatures.has(intentSignature)) {
          emitEvent({
            type: "content_blocked",
            contentType: "mission",
            contentId: mission.id,
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
            type: "mission",
            businessId: currentBusiness.id,
            title: mission.title,
            description: mission.description || "",
            source: mission.area || "general",
            metadata: {
              impactScore: mission.impact_score,
              effortScore: mission.effort_score,
              steps: mission.steps,
            },
          },
          businessContext,
          existingItems.filter(e => e.id !== mission.id)
        );

        const threshold = AUDIT_THRESHOLDS.mission;
        const passed = auditResult.averageScore >= threshold.minAverageScore &&
                       auditResult.scores.relevance >= threshold.minRelevance;

        if (passed) {
          auditedMissions.push({
            ...mission,
            auditScore: auditResult.averageScore,
            auditPassed: true,
            conceptHash,
            intentSignature,
          });
        } else {
          emitEvent({
            type: "content_blocked",
            contentType: "mission",
            contentId: mission.id,
            reason: "failed_quality_gate",
            details: auditResult,
          });
        }
      }

      setMissions(auditedMissions);

      emitEvent({
        type: "audit_complete",
        contentType: "mission",
        stats: {
          raw: rawMissions.length,
          passed: auditedMissions.length,
          blocked: rawMissions.length - auditedMissions.length,
        },
      });
    } catch (error) {
      console.error("Error fetching audited missions:", error);
      emitEvent({
        type: "audit_error",
        contentType: "mission",
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
    missions,
    rawCount,
    filteredCount: missions.length,
    blockedCount: rawCount - missions.length,
    loading,
    refetch: fetchAndAudit,
  };
}
