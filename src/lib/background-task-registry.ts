/**
 * Registro de tareas en segundo plano (resumible).
 *
 * Problema que resuelve: si el usuario dispara una generación de IA (radar,
 * I+D, misiones, predicciones) y sale de la pantalla, al volver la app no sabía
 * que el trabajo seguía corriendo en el servidor y arrancaba TODO desde cero.
 *
 * Este registro deja una marca liviana en localStorage con TTL. Al volver a la
 * pantalla, el módulo puede "reengancharse": muestra el estado cargando y
 * espera el resultado en vez de relanzar el trabajo.
 */

const PREFIX = 'vc:bgtask:';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

interface TaskMark {
  ts: number;
  ttl: number;
}

const key = (taskKey: string) => `${PREFIX}${taskKey}`;

export function beginBackgroundTask(taskKey: string, ttlMs: number = DEFAULT_TTL_MS): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(taskKey), JSON.stringify({ ts: Date.now(), ttl: ttlMs } satisfies TaskMark));
  } catch { /* modo privado / cuota: best effort */ }
}

export function endBackgroundTask(taskKey: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key(taskKey)); } catch { /* noop */ }
}

/** true si la tarea sigue vigente (no expiró su TTL). Limpia marcas vencidas. */
export function isBackgroundTaskRunning(taskKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(key(taskKey));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as TaskMark;
    if (!parsed?.ts) return false;
    const ttl = typeof parsed.ttl === 'number' ? parsed.ttl : DEFAULT_TTL_MS;
    if (Date.now() - parsed.ts > ttl) {
      endBackgroundTask(taskKey);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Milisegundos transcurridos desde que arrancó la tarea (0 si no existe). */
export function backgroundTaskAge(taskKey: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(key(taskKey));
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as TaskMark;
    return parsed?.ts ? Date.now() - parsed.ts : 0;
  } catch { return 0; }
}
