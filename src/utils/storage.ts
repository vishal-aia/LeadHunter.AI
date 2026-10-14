// Safe storage utility that prevents DOMException / SecurityError crashes
// in sandboxed iframes, private browsing mode, or strict privacy browser environments.

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        return val;
      }
    } catch (e) {
      // LocalStorage access restricted (e.g. cross-origin iframe / private browsing)
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // In-memory fallback
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // In-memory fallback
    }
    delete memoryStore[key];
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {}
    Object.keys(memoryStore).forEach((k) => delete memoryStore[k]);
  },
};
