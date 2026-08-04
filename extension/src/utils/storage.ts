export const storage = {
  get: <T>(key: string): Promise<T | null> =>
    new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key] ?? null);
      });
    }),

  set: (key: string, value: unknown): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    }),

  remove: (key: string): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.remove(key, resolve);
    }),

  clear: (): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    }),
};
