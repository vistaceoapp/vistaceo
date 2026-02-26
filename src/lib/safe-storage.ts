type StorageKind = "local" | "session";

const localFallback = new Map<string, string>();
const sessionFallback = new Map<string, string>();

export interface SafeStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  getJSON: <T>(key: string, fallback: T) => T;
  setJSON: (key: string, value: unknown) => void;
}

function getNativeStorage(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function createSafeStorage(kind: StorageKind, fallback: Map<string, string>): SafeStorage {
  const getItem = (key: string): string | null => {
    try {
      const nativeStorage = getNativeStorage(kind);
      if (nativeStorage) {
        const value = nativeStorage.getItem(key);
        if (value !== null) fallback.set(key, value);
        return value;
      }
    } catch {
      // Ignore and fallback to memory
    }

    return fallback.get(key) ?? null;
  };

  const setItem = (key: string, value: string) => {
    fallback.set(key, value);

    try {
      getNativeStorage(kind)?.setItem(key, value);
    } catch {
      // Keep memory fallback only
    }
  };

  const removeItem = (key: string) => {
    fallback.delete(key);

    try {
      getNativeStorage(kind)?.removeItem(key);
    } catch {
      // Keep memory fallback only
    }
  };

  const clear = () => {
    fallback.clear();

    try {
      getNativeStorage(kind)?.clear();
    } catch {
      // Keep memory fallback only
    }
  };

  const getJSON = <T,>(key: string, fallbackValue: T): T => {
    const raw = getItem(key);
    if (!raw) return fallbackValue;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallbackValue;
    }
  };

  const setJSON = (key: string, value: unknown) => {
    try {
      setItem(key, JSON.stringify(value));
    } catch {
      // Ignore invalid serialization
    }
  };

  return { getItem, setItem, removeItem, clear, getJSON, setJSON };
}

export const safeLocalStorage = createSafeStorage("local", localFallback);
export const safeSessionStorage = createSafeStorage("session", sessionFallback);
