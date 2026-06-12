import { useState, useMemo, useCallback } from "react";
import { useSubscription } from "@/hooks/use-subscription";

const PRO_REGEN_LIMIT = 1;
const REGEN_KEY_PREFIX = "mission_regen_count_";

export function getMissionRegenCount(missionId: string): number {
  try {
    return parseInt(localStorage.getItem(REGEN_KEY_PREFIX + missionId) || "0", 10);
  } catch { return 0; }
}

export function incMissionRegenCount(missionId: string): number {
  const next = getMissionRegenCount(missionId) + 1;
  try { localStorage.setItem(REGEN_KEY_PREFIX + missionId, String(next)); } catch {}
  return next;
}

export type RegenGateMode = "closed" | "confirm" | "free" | "exhausted";

export function useMissionRegenerateGate(missionId: string, onActuallyRegenerate: () => void) {
  const { isPro, isLoading } = useSubscription();
  const [mode, setMode] = useState<RegenGateMode>("closed");
  const used = useMemo(() => getMissionRegenCount(missionId), [missionId, mode]);
  const proExhausted = isPro && used >= PRO_REGEN_LIMIT;

  const requestRegenerate = useCallback(() => {
    if (isLoading) return;
    if (!isPro) { setMode("free"); return; }
    if (proExhausted) { setMode("exhausted"); return; }
    setMode("confirm");
  }, [isPro, isLoading, proExhausted]);

  const confirmRegenerate = useCallback(() => {
    setMode("closed");
    incMissionRegenCount(missionId);
    onActuallyRegenerate();
  }, [missionId, onActuallyRegenerate]);

  return {
    isPro,
    used,
    proExhausted,
    mode,
    setMode,
    requestRegenerate,
    confirmRegenerate,
  };
}
