/**
 * Safe JSON serialization and localStorage utility that prevents:
 * 1. TypeError: JSON.stringify cannot serialize cyclic structures
 * 2. Corrupt or unparseable stored data breaking app boot
 */

export function safeStringify<T>(obj: T): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (_key, value) => {
      // Avoid circular object references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return undefined; // Drop cyclic reference
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    console.warn('safeStringify encountered non-serializable object:', error);
    try {
      // Secondary fallback: shallow copy of plain object/array
      if (Array.isArray(obj)) {
        return JSON.stringify((obj as unknown as any[]).map((item) => ({ ...item })));
      }
      return JSON.stringify({ ...obj });
    } catch {
      return '';
    }
  }
}

export function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (error) {
    console.warn('safeJsonParse fallback used due to parse failure:', error);
    return fallback;
  }
}

export function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse<T>(item, fallback);
  } catch {
    return fallback;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    const serialized = safeStringify(value);
    if (serialized) {
      localStorage.setItem(key, serialized);
    }
  } catch (err) {
    console.warn(`Failed to set localStorage key "${key}":`, err);
  }
}
