jest.mock("axios", () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { headers: { common: {} } },
  })),
}));

import {
  setApiToken,
  setUnauthorizedHandler,
  createApiClient,
  apiClient,
} from "@/core/api-client";

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setApiToken", () => {
    it("should set token", () => {
      expect(() => setApiToken("test-token-123")).not.toThrow();
    });

    it("should accept null to clear token", () => {
      setApiToken("some-token");
      expect(() => setApiToken(null)).not.toThrow();
    });
  });

  describe("setUnauthorizedHandler", () => {
    it("should set unauthorized handler", () => {
      const handler = jest.fn();
      expect(() => setUnauthorizedHandler(handler)).not.toThrow();
    });

    it("should accept null to clear handler", () => {
      expect(() => setUnauthorizedHandler(null)).not.toThrow();
    });
  });

  describe("createApiClient", () => {
    it("should create axios client", () => {
      const client = createApiClient();
      expect(client).toBeDefined();
    });
  });

  describe("apiClient", () => {
    it("should export apiClient singleton", () => {
      expect(apiClient).toBeDefined();
    });
  });
});
