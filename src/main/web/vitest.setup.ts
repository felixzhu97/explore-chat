import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// hoisting is enabled for vitest, so this will be hoisted
vi.mock("@/shared/locales/en", () => ({}));
vi.mock("@/shared/locales/zh", () => ({}));
vi.mock("@/shared/i18n", () => ({
  default: {
    t: (key: string) => key,
    language: "zh",
    use: vi.fn(),
  },
  LANG_STORAGE_KEY: "chat_web_lang",
  setStoredLocale: vi.fn(),
  getLocale: vi.fn(),
  useTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    return React.createElement("img", { src, alt, ...rest });
  },
}));

// Mock IntersectionObserver with proper shape
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {}
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
(
  global as unknown as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock localStorage with proper implementation
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// Mock indexedDB
if (!globalThis.indexedDB) {
  const indexedDBMock = {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  };
  Object.defineProperty(globalThis, "indexedDB", { value: indexedDBMock });
}
