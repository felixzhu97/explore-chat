import { getStorage } from "@/core/storage/storage";

/**
 * Custom storage for redux-persist that uses the app's storage adapter.
 * getItem returns the raw string for the key; setItem stores the string (adapter JSON.stringifies).
 */
export function createPersistStorage() {
  const adapter = getStorage();
  return {
    getItem: (key: string): Promise<string | null> => {
      const v = adapter.load(key, null as unknown as string);
      return Promise.resolve(
        v == null ? null : typeof v === "string" ? v : JSON.stringify(v),
      );
    },
    setItem: (key: string, value: string): Promise<void> => {
      adapter.save(key, value);
      return Promise.resolve();
    },
    removeItem: (key: string): Promise<void> => {
      adapter.remove(key);
      return Promise.resolve();
    },
  };
}
