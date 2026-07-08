// use-stuck-setup-detector — detecta setups atascados (precisión 0%,
// paso inicial, sin actividad > N minutos) y expone acciones de recuperación:
//   • offerReset()  → dispara admin-reset-setup (si el usuario tiene rol admin)
//   • markNotRepresentative() → registra incidente + señal para revisión
//
// No cambia UI existente; los pages/componentes pueden mostrar un CTA cuando
// `isStuck === true` para ofrecer una salida real ("Esto no me representa,
// empezar de nuevo") en vez de dejar al usuario en un loop de 0%.

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Options {
  businessId?: string | null;
  currentStep?: string | null;
  precisionScore?: number | null;
  /** timestamp ISO de última interacción — si no se pasa se usa el mount time */
  lastInteractionAt?: string | null;
  /** minutos sin avance para considerar "atascado". Default 5. */
  stuckAfterMinutes?: number;
  /** pasos considerados "iniciales" donde 0% es sospechoso */
  earlyStepPrefixes?: string[];
}

export function useStuckSetupDetector({
  businessId,
  currentStep,
  precisionScore,
  lastInteractionAt,
  stuckAfterMinutes = 5,
  earlyStepPrefixes = ["S00", "S01", "type", "sector", "business", "1", "2"],
}: Options) {
  const [isStuck, setIsStuck] = useState(false);
  const reportedRef = useRef(false);
  const mountedAt = useRef(Date.now());

  const inEarlyStep = useMemo(() => {
    const s = (currentStep || "").toString();
    return earlyStepPrefixes.some((p) => s.startsWith(p));
  }, [currentStep, earlyStepPrefixes]);

  const zeroPrecision = (precisionScore ?? 0) <= 0;

  useEffect(() => {
    if (!businessId || !zeroPrecision || !inEarlyStep) {
      setIsStuck(false);
      reportedRef.current = false;
      return;
    }

    const baseline = lastInteractionAt
      ? new Date(lastInteractionAt).getTime()
      : mountedAt.current;

    const check = () => {
      const elapsedMin = (Date.now() - baseline) / 60_000;
      if (elapsedMin >= stuckAfterMinutes) {
        setIsStuck(true);
        if (!reportedRef.current) {
          reportedRef.current = true;
          supabase.functions
            .invoke("report-incident", {
              body: {
                source: "app",
                category: "setup",
                severity: "high",
                title: `Setup atascado 0% precisión en ${currentStep}`,
                where_path:
                  typeof window !== "undefined" ? window.location.pathname : null,
                detected_by: "use-stuck-setup-detector",
                context: {
                  businessId,
                  currentStep,
                  precisionScore,
                  stuckAfterMinutes,
                },
                fingerprint: `stuck_setup:${businessId}:${currentStep}`,
              },
            })
            .catch(() => undefined);
        }
      }
    };

    check();
    const t = window.setInterval(check, 30_000);
    return () => window.clearInterval(t);
  }, [
    businessId,
    zeroPrecision,
    inEarlyStep,
    currentStep,
    precisionScore,
    lastInteractionAt,
    stuckAfterMinutes,
  ]);

  const offerReset = async () => {
    if (!businessId) return { ok: false, error: "no_business" };
    try {
      const { data, error } = await supabase.functions.invoke("admin-reset-setup", {
        body: { businessId, reason: "user_not_representative" },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: String((e as Error)?.message ?? e) };
    }
  };

  const markNotRepresentative = async (note?: string) => {
    if (!businessId) return { ok: false };
    try {
      await supabase.functions.invoke("report-incident", {
        body: {
          source: "app",
          category: "setup",
          severity: "high",
          title: "Usuario marcó setup como no representativo",
          detected_by: "use-stuck-setup-detector",
          context: { businessId, currentStep, note: (note ?? "").slice(0, 500) },
          fingerprint: `not_representative:${businessId}:${currentStep}`,
        },
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  return { isStuck, offerReset, markNotRepresentative };
}
