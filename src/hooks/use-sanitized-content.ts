import { useMemo } from 'react';
import {
  sanitizeAIOutput,
  sanitizeStructuredList,
  containsForbidden,
  isLeakedLabel,
  type SanitizeMode,
} from '@/lib/aiOutputSanitizer';

/**
 * useSanitizedContent — hook único para texto generado por IA.
 * Aplica sanitizeAIOutput con el modo correcto, memoiza, y bloquea
 * cualquier output que contenga Red List tokens.
 *
 * Devuelve '' si el contenido no es seguro para mostrar. La UI debe
 * usar un fallback contextual o no renderizar.
 */
export function useSanitizedContent(
  raw: string | null | undefined,
  mode: SanitizeMode = 'prose'
): string {
  return useMemo(() => sanitizeAIOutput(raw, { mode }), [raw, mode]);
}

/**
 * useSanitizedList — versión para arrays estructurados (pasos, tips, checklist).
 * Filtra items vacíos, fantasma o con contenido prohibido.
 */
export function useSanitizedList(
  items: (string | null | undefined)[] | null | undefined
): string[] {
  return useMemo(() => {
    if (!items) return [];
    return sanitizeStructuredList(items.filter((s): s is string => typeof s === 'string'));
  }, [items]);
}

/** Helpers reexportados para checks fuera de componentes. */
export { containsForbidden, isLeakedLabel };
