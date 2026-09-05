type AppStore = {
  getState: () => unknown;
  dispatch: (action: unknown) => unknown;
};

let appStore: AppStore | null = null;

export function bindAppStore(store: AppStore): void {
  appStore = store;
}

export function getAppStore(): AppStore {
  if (!appStore) {
    throw new Error("App store is not bound yet");
  }
  return appStore;
}
