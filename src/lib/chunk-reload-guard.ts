/**
 * Chunk-reload guard
 * ------------------
 * Causa raíz: cuando publicamos una versión nueva, el HTML viejo cacheado
 * referencia archivos JS con hashes que ya no existen. Los `import()` dinámicos
 * fallan con "Failed to fetch dynamically imported module" y caen al ErrorBoundary.
 *
 * Solución: detectar el error a nivel global y recargar UNA sola vez (flag en
 * sessionStorage para evitar loops). El recargo trae el index.html nuevo con los
 * hashes correctos y el usuario sigue sin enterarse.
 */

const RELOAD_FLAG = '__vista_chunk_reloaded';

function isChunkLoadError(input: unknown): boolean {
  const msg =
    typeof input === 'string'
      ? input
      : input && typeof input === 'object' && 'message' in input
        ? String((input as { message?: unknown }).message ?? '')
        : '';
  if (!msg) return false;
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    /Loading chunk [\w-]+ failed/i.test(msg)
  );
}

function reloadOnce() {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return; // ya reintentamos
    sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    // sessionStorage bloqueado: igual recargamos pero podría loopear; aceptable.
  }
  // pequeño delay para no competir con el ciclo de error de React
  setTimeout(() => window.location.reload(), 50);
}

export function installChunkReloadGuard() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (e) => {
    if (isChunkLoadError(e.error) || isChunkLoadError(e.message)) {
      reloadOnce();
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    if (isChunkLoadError(e.reason)) reloadOnce();
  });

  // Limpiar el flag cuando una navegación termina bien
  window.addEventListener('load', () => {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      /* noop */
    }
  });
}

export const __testables = { isChunkLoadError };
