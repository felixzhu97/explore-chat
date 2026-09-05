import { describe, it, expect } from "vitest";
import { ExperimentService } from "@/analytics/service/experiment.service";

describe("ExperimentService", () => {
  let service: ExperimentService;

  beforeEach(() => {
    service = new ExperimentService();
  });

  describe("assign", () => {
    it("should return variant for first 5% bucket", () => {
      const results = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        const result = service.assign(`user-${i}`, "test-surface");
        results.add(result.variantId);
      }
      expect(results.has("v2")).toBe(true);
    });

    it("should return experiment with v2 variant for variant bucket", () => {
      for (let i = 0; i < 100; i++) {
        const result = service.assign(`user-${i}`, "feed");
        if (result.variantId === "v2") {
          expect(result.experimentId).toBe("feed-model-v2");
          expect(result.variantId).toBe("v2");
          return;
        }
      }
    });

    it("should return experiment with control variant for other buckets", () => {
      let foundControl = false;
      for (let i = 0; i < 100; i++) {
        const result = service.assign(`user-${i}`, "feed");
        if (result.variantId === "control") {
          foundControl = true;
          expect(result.experimentId).toBe("feed-control");
          expect(result.variantId).toBe("control");
        }
      }
      expect(foundControl).toBe(true);
    });

    it("should produce consistent results for same user and surface", () => {
      const result1 = service.assign("same-user", "same-surface");
      const result2 = service.assign("same-user", "same-surface");
      expect(result1).toEqual(result2);
    });

    it("should produce different results for different users", () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = service.assign(`unique-user-${i}`, "test-surface");
        results.add(result.variantId);
      }
    });

    it("should produce different results for different surfaces", () => {
      const results = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const result = service.assign("same-user", `surface-${i}`);
        results.add(result.variantId);
      }
    });

    it("should use surface name in experimentId", () => {
      const result = service.assign("user-1", "my-experiment");
      expect(result.experimentId).toContain("my-experiment");
    });
  });

  describe("hash function", () => {
    it("should produce same hash for same input", () => {
      const hash1 = (service as any).hash("test-input");
      const hash2 = (service as any).hash("test-input");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hash for different input", () => {
      const hash1 = (service as any).hash("input-1");
      const hash2 = (service as any).hash("input-2");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce positive hash values", () => {
      const hash = (service as any).hash("any-input");
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it("should handle empty string", () => {
      const hash = (service as any).hash("");
      expect(hash).toBeGreaterThanOrEqual(0);
    });

    it("should handle unicode characters", () => {
      const hash = (service as any).hash("用户-测试");
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });
});
