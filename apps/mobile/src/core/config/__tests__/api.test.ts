describe("api configuration", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("API_BASE_URL", () => {
    it("should return localhost URL when EXPO_PUBLIC_API_URL is not set", () => {
      delete process.env.EXPO_PUBLIC_API_URL;
      const { API_BASE_URL } = require("../../config/api");
      expect(API_BASE_URL).toBe("http://localhost:3001");
    });

    it("should use EXPO_PUBLIC_API_URL when set", () => {
      process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
      const { API_BASE_URL } = require("../../config/api");
      expect(API_BASE_URL).toBe("https://api.example.com");
    });

    it("should remove trailing slash from EXPO_PUBLIC_API_URL", () => {
      process.env.EXPO_PUBLIC_API_URL = "https://api.example.com/";
      const { API_BASE_URL } = require("../../config/api");
      expect(API_BASE_URL).toBe("https://api.example.com");
    });
  });

  describe("API_V1", () => {
    it("should be API_BASE_URL with /api/v1 suffix", () => {
      process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
      const { API_V1 } = require("../../config/api");
      expect(API_V1).toBe("https://api.example.com/api/v1");
    });

    it("should append /api/v1 to localhost base URL", () => {
      delete process.env.EXPO_PUBLIC_API_URL;
      const { API_V1 } = require("../../config/api");
      expect(API_V1).toBe("http://localhost:3001/api/v1");
    });

    it("should not have double slashes when base URL has no trailing slash", () => {
      process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
      const { API_V1 } = require("../../config/api");
      expect(API_V1).toBe("https://api.example.com/api/v1");
    });
  });
});
