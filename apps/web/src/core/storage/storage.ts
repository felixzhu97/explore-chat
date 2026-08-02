export class AppStorage {
  private static readonly PREFIX = "instagram_";
  private static db: IDBDatabase | null = null;
  private static dbName = "InstagramDB";
  private static dbVersion = 1;

  static async initDB(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("contacts")) {
          db.createObjectStore("contacts", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("messages")) {
          db.createObjectStore("messages", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("calls")) {
          db.createObjectStore("calls", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };
    });
  }

  save(key: string, data: unknown): void {
    if (typeof window === "undefined") return;
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(AppStorage.PREFIX + key, serializedData);
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  load<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(AppStorage.PREFIX + key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(AppStorage.PREFIX + key);
    } catch (error) {
      console.error("Failed to remove from localStorage:", error);
    }
  }

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(AppStorage.PREFIX),
      );
      keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }

  async saveToIndexedDB(storeName: string, data: unknown): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (!AppStorage.db) await AppStorage.initDB();

    return new Promise((resolve, reject) => {
      const transaction = AppStorage.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadFromIndexedDB<T>(
    storeName: string,
    key: string,
  ): Promise<T | null> {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (!AppStorage.db) await AppStorage.initDB();

    return new Promise((resolve, reject) => {
      const transaction = AppStorage.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async removeFromIndexedDB(storeName: string, key: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (!AppStorage.db) await AppStorage.initDB();

    return new Promise((resolve, reject) => {
      const transaction = AppStorage.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  getStorageUsage(): { localStorage: number; indexedDB: number } {
    if (typeof window === "undefined") {
      return { localStorage: 0, indexedDB: 0 };
    }
    let localStorageSize = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith(AppStorage.PREFIX)) {
          localStorageSize += localStorage[key].length;
        }
      }
    } catch (error) {
      console.error("Failed to calculate localStorage usage:", error);
    }

    return {
      localStorage: localStorageSize,
      indexedDB: 0,
    };
  }

  exportData(): string {
    if (typeof window === "undefined") {
      return JSON.stringify({}, null, 2);
    }
    const data: Record<string, unknown> = {};

    try {
      for (const key in localStorage) {
        if (key.startsWith(AppStorage.PREFIX)) {
          const cleanKey = key.replace(AppStorage.PREFIX, "");
          data[cleanKey] = JSON.parse(localStorage[key]);
        }
      }
    } catch (error) {
      console.error("Failed to export data:", error);
    }

    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);

      for (const key in data) {
        this.save(key, data[key]);
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  async backup(): Promise<Blob> {
    if (typeof window === "undefined") {
      return new Blob([JSON.stringify({}, null, 2)], {
        type: "application/json",
      });
    }
    const data = this.exportData();
    return new Blob([data], { type: "application/json" });
  }

  async restore(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      return this.importData(text);
    } catch (error) {
      console.error("Failed to restore data:", error);
      return false;
    }
  }
}

if (typeof window !== "undefined") {
  AppStorage.initDB().catch(console.error);
}

let storageInstance: AppStorage | null = null;

export const getStorage = (): AppStorage => {
  if (!storageInstance) {
    storageInstance = new AppStorage();
  }
  return storageInstance;
};
