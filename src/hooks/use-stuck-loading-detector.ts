// Hook genérico: detecta cuando una pantalla está "tildada" cargando
// más de N segundos y reporta el incidente al Centro de Salud Operativa
// (ops_incidents) para que aparezca en /admin/salud y, si corresponde,
// active el auto-healing. Además expone `isStuck` para que la UI ofrezca
// una salida (reintentar / volver) en lugar de dejar al usuario mirando
// esqueletos para siempre.

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Options {
  /** Activo mientras se está cargando algo. */
  loading: boolean;
  /** Etiqueta corta usada en el incidente (ej: "mission_plan", "chat_reply"). */
  scope: string;
  /** Ruta lógica donde está el usuario (ej: "/app/missions/:id"). */
  wherePath?: string;
  /** Identificadores extra (mission id, business id, etc.). */
  context?: Record<string, unknown>;
  /** Segundos hasta marcar como "tildado". Default 25s. */
  stuckAfterSeconds?: number;
  /** Severidad del incidente. Default "high". */
  severity?: "critical" | "high" | "medium" | "low";
}

export function useStuckLoadingDetector({
  loading,
  scope,
  wherePath,
  context,
  stuckAfterSeconds = 25,
  severity = "high",
}: Options) {
  const [isStuck, setIsStuck] = useState(false);
  const reportedRef = useRef(false);

  // Reset cuando termina la carga
  useEffect(() => {
    if (!loading) {
      setIsStuck(false);
      reportedRef.current = false;
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsStuck(true);
      if (reportedRef.current) return;
      reportedRef.current = true;
      try {
        await supabase.functions.invoke("report-incident", {
          body: {
            source: "app",
            category: "ux",
            severity,
            title: `Pantalla tildada cargando (${scope}) > ${stuckAfterSeconds}s`,
            where_path: wherePath ?? (typeof window !== "undefined" ? window.location.pathname : null),
            detected_by: "use-stuck-loading-detector",
            context: { scope, ...context },
            fingerprint: `stuck_loading:${scope}:${wherePath ?? ""}`,
          },
        });
      } catch {
        /* sensor silencioso — nunca rompemos la UI por reportar */
      }
    }, stuckAfterSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [loading, scope, wherePath, severity, stuckAfterSeconds, JSON.stringify(context ?? {})]);

  return { isStuck };
}
