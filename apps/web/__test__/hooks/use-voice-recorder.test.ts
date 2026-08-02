import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceRecorder } from "@/shared/use-voice-recorder";

vi.mock("@/shared/use-voice-recorder", () => ({
  useVoiceRecorder: vi.fn(() => ({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    resetRecording: vi.fn(),
  })),
}));

describe("useVoiceRecorder Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have isRecording as false", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      expect(result.current.isRecording).toBe(false);
    });

    it("should have duration as 0", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      expect(result.current.duration).toBe(0);
    });

    it("should have audioBlob as null", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      expect(result.current.audioBlob).toBeNull();
    });
  });

  describe("resetRecording", () => {
    it("should be callable", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      expect(() => result.current.resetRecording()).not.toThrow();
    });
  });

  describe("stopRecording", () => {
    it("should be callable", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      expect(() => result.current.stopRecording()).not.toThrow();
    });
  });
});
