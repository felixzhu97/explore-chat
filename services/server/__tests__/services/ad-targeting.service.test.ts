import { describe, it, expect } from "vitest";
import {
  AdTargetingService,
  AdUserProfile,
} from "@/ads/application/ad-targeting.service";

describe("AdTargetingService", () => {
  let service: AdTargetingService;

  beforeEach(() => {
    service = new AdTargetingService();
  });

  describe("isGroupMatched", () => {
    it("should return true when targeting is null", () => {
      const result = service.isGroupMatched(
        { targeting: null },
        { id: "user-1" },
      );
      expect(result).toBe(true);
    });

    it("should return true when targeting is undefined", () => {
      const result = service.isGroupMatched(
        { targeting: undefined },
        { id: "user-1" },
      );
      expect(result).toBe(true);
    });

    it("should return true when targeting object has no constraints", () => {
      const result = service.isGroupMatched(
        { targeting: {} },
        { id: "user-1" },
      );
      expect(result).toBe(true);
    });

    describe("country targeting", () => {
      it("should return true when user country matches", () => {
        const result = service.isGroupMatched(
          { targeting: { countries: ["US", "CN"] } },
          { id: "user-1", country: "US" },
        );
        expect(result).toBe(true);
      });

      it("should return false when user country does not match", () => {
        const result = service.isGroupMatched(
          { targeting: { countries: ["US", "CN"] } },
          { id: "user-1", country: "DE" },
        );
        expect(result).toBe(false);
      });

      it("should return false when user has no country", () => {
        const result = service.isGroupMatched(
          { targeting: { countries: ["US", "CN"] } },
          { id: "user-1" },
        );
        expect(result).toBe(false);
      });

      it("should return true for empty countries array", () => {
        const result = service.isGroupMatched(
          { targeting: { countries: [] } },
          { id: "user-1", country: "DE" },
        );
        expect(result).toBe(true);
      });
    });

    describe("region targeting", () => {
      it("should return true when user region matches", () => {
        const result = service.isGroupMatched(
          { targeting: { regions: ["California", "New York"] } },
          { id: "user-1", region: "California" },
        );
        expect(result).toBe(true);
      });

      it("should return false when user region does not match", () => {
        const result = service.isGroupMatched(
          { targeting: { regions: ["California", "New York"] } },
          { id: "user-1", region: "Texas" },
        );
        expect(result).toBe(false);
      });

      it("should return false when user has no region", () => {
        const result = service.isGroupMatched(
          { targeting: { regions: ["California"] } },
          { id: "user-1" },
        );
        expect(result).toBe(false);
      });
    });

    describe("language targeting", () => {
      it("should return true when user language matches", () => {
        const result = service.isGroupMatched(
          { targeting: { languages: ["en", "zh"] } },
          { id: "user-1", language: "en" },
        );
        expect(result).toBe(true);
      });

      it("should return false when user language does not match", () => {
        const result = service.isGroupMatched(
          { targeting: { languages: ["en", "zh"] } },
          { id: "user-1", language: "fr" },
        );
        expect(result).toBe(false);
      });

      it("should return false when user has no language", () => {
        const result = service.isGroupMatched(
          { targeting: { languages: ["en"] } },
          { id: "user-1" },
        );
        expect(result).toBe(false);
      });
    });

    describe("interests targeting", () => {
      it("should return true when user has matching interest", () => {
        const result = service.isGroupMatched(
          { targeting: { interests: ["sports", "tech"] } },
          { id: "user-1", interests: ["sports", "music"] },
        );
        expect(result).toBe(true);
      });

      it("should return false when user has no matching interests", () => {
        const result = service.isGroupMatched(
          { targeting: { interests: ["sports", "tech"] } },
          { id: "user-1", interests: ["movies", "cooking"] },
        );
        expect(result).toBe(false);
      });

      it("should return true when user has no interests but targeting requires none", () => {
        const result = service.isGroupMatched(
          { targeting: { interests: ["sports"] } },
          { id: "user-1", interests: [] },
        );
        expect(result).toBe(false);
      });

      it("should return true when user interests is null", () => {
        const result = service.isGroupMatched(
          { targeting: { interests: ["sports"] } },
          { id: "user-1", interests: null },
        );
        expect(result).toBe(false);
      });

      it("should return true for empty interests array in targeting", () => {
        const result = service.isGroupMatched(
          { targeting: { interests: [] } },
          { id: "user-1", interests: ["sports"] },
        );
        expect(result).toBe(true);
      });
    });

    describe("multiple targeting criteria", () => {
      it("should return true when all criteria match", () => {
        const result = service.isGroupMatched(
          {
            targeting: {
              countries: ["US"],
              regions: ["California"],
              languages: ["en"],
              interests: ["tech"],
            },
          },
          {
            id: "user-1",
            country: "US",
            region: "California",
            language: "en",
            interests: ["tech", "sports"],
          },
        );
        expect(result).toBe(true);
      });

      it("should return false if any criterion does not match", () => {
        const result = service.isGroupMatched(
          {
            targeting: {
              countries: ["US"],
              regions: ["California"],
            },
          },
          {
            id: "user-1",
            country: "US",
            region: "Texas",
          },
        );
        expect(result).toBe(false);
      });
    });
  });
});
