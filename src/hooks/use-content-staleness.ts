import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Detecta si un artefacto IA (oportunidad, misión, tendencia) quedó obsoleto
 * porque el negocio fue modificado significativamente DESPUÉS de generar el contenido.
 *
 * Heurística (lado-cliente, sin gastar IA):
 *   - Sólo se considera "stale" si business.updated_at > artifactCreatedAt + 24h margen
 *   - Y si la diferencia entre ambos timestamps supera los 7 días (cambio "muy posterior")
 *   - El usuario puede descartar el banner localmente (localStorage por artifactId)
 */
export function useContentStaleness(
  businessId: string | undefined,
  artifactId: string | undefined,
  artifactCreatedAt: string | undefined,
) {
  const [isStale, setIsStale] = useState(false);
  const [businessUpdatedAt, setBusinessUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId || !artifactId || !artifactCreatedAt) return;

    const dismissedKey = `stale-dismissed:${artifactId}`;
    if (typeof window !== "undefined" && localStorage.getItem(dismissedKey)) {
      return;
    }

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("updated_at")
        .eq("id", businessId)
        .maybeSingle();
      if (cancelled || !data?.updated_at) return;

      const createdMs = new Date(artifactCreatedAt).getTime();
      const updatedMs = new Date(data.updated_at).getTime();
      const diffDays = (updatedMs - createdMs) / (1000 * 60 * 60 * 24);

      setBusinessUpdatedAt(data.updated_at);
      // Sólo banner si el negocio se editó >7 días DESPUÉS de crearse el artefacto
      if (diffDays > 7) setIsStale(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [businessId, artifactId, artifactCreatedAt]);

  const dismiss = () => {
    if (artifactId && typeof window !== "undefined") {
      localStorage.setItem(`stale-dismissed:${artifactId}`, "1");
    }
    setIsStale(false);
  };

  return { isStale, businessUpdatedAt, dismiss };
}
