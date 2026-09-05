import { describe, it, expect, vi, beforeEach } from "vitest";
import { HapticFeedback } from "@/src/shared/utils/haptic-feedback";

describe("HapticFeedback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("vibrate", () => {
    it("should call navigator.vibrate with single number", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.vibrate(100);

      expect(mockVibrate).toHaveBeenCalledWith(100);
    });

    it("should call navigator.vibrate with array pattern", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.vibrate([100, 50, 100]);

      expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
    });

    it("should handle undefined vibrate gracefully", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.vibrate();
      expect(mockVibrate).toHaveBeenCalled();
    });
  });

  describe("light", () => {
    it("should vibrate for 50ms", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.light();

      expect(mockVibrate).toHaveBeenCalledWith(50);
    });
  });

  describe("medium", () => {
    it("should vibrate for 100ms", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.medium();

      expect(mockVibrate).toHaveBeenCalledWith(100);
    });
  });

  describe("heavy", () => {
    it("should vibrate with heavy pattern [100, 50, 100]", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.heavy();

      expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
    });
  });

  describe("success", () => {
    it("should vibrate with success pattern [50, 50, 50]", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.success();

      expect(mockVibrate).toHaveBeenCalledWith([50, 50, 50]);
    });
  });

  describe("error", () => {
    it("should vibrate with error pattern [100, 100, 100, 100, 100]", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.error();

      expect(mockVibrate).toHaveBeenCalledWith([100, 100, 100, 100, 100]);
    });
  });

  describe("selection", () => {
    it("should vibrate for 25ms", () => {
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });

      HapticFeedback.selection();

      expect(mockVibrate).toHaveBeenCalledWith(25);
    });
  });
});
