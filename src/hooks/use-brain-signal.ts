import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";

/**
 * Hook universal para que cada módulo alimente el Brain del negocio.
 *
 * - `useRecordBrainView(signalType, content)`: dispara UNA sola vez por
 *   montaje + business al entrar a la vista (signal pasivo "se vio X").
 *   Debounce de 60s por (business+signalType) en memoria para no saturar.
 *
 * - `useRecordBrainAction()`: devuelve una función que graba un signal
 *   activo (click, calibración, aplicar, descartar, etc.). Fire-and-forget,
 *   nunca rompe la UI.
 *
 * Ambos usan la edge function canónica `brain-record-signal`.
 */

const recentSent = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;

function shouldSend(key: string): boolean {
  const last = recentSent.get(key) ?? 0;
  const now = Date.now();
  if (now - last < DEDUPE_WINDOW_MS) return false;
  recentSent.set(key, now);
  return true;
}

export function useRecordBrainView(
  signalType: string,
  content: Record<string, unknown> = {},
  options: { enabled?: boolean; importance?: number } = {},
) {
  const { currentBusiness } = useBusiness();
  const sentRef = useRef(false);
  const enabled = options.enabled !== false;

  useEffect(() => {
    if (!enabled) return;
    if (sentRef.current) return;
    const bizId = currentBusiness?.id;
    if (!bizId) return;
    const key = `${bizId}:${signalType}`;
    if (!shouldSend(key)) {
      sentRef.current = true;
      return;
    }
    sentRef.current = true;

    supabase.functions
      .invoke("brain-record-signal", {
        body: {
          businessId: bizId,
          signalType,
          source: "ui_view",
          content,
          confidence: "low",
          importance: options.importance ?? 2,
        },
      })
      .catch(() => {
        // Silencioso: nunca rompemos UX por telemetría.
      });
  }, [enabled, currentBusiness?.id, signalType]);
}

export function useRecordBrainAction() {
  const { currentBusiness } = useBusiness();

  return useCallback(
    (
      signalType: string,
      content: Record<string, unknown> = {},
      options: { importance?: number; confidence?: "low" | "medium" | "high"; source?: string } = {},
    ) => {
      const bizId = currentBusiness?.id;
      if (!bizId) return;
      supabase.functions
        .invoke("brain-record-signal", {
          body: {
            businessId: bizId,
            signalType,
            source: options.source ?? "ui_action",
            content,
            confidence: options.confidence ?? "medium",
            importance: options.importance ?? 5,
          },
        })
        .catch(() => {
          // Silencioso.
        });
    },
    [currentBusiness?.id],
  );
}
