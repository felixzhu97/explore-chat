import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCall } from "@/calls/use-call";

describe("useCall Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have call not active initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isActive).toBe(false);
    });

    it("should have idle status initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.status).toBe("idle");
    });

    it("should have default call type as voice", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.callType).toBe("voice");
    });

    it("should have zero duration initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.duration).toBe(0);
    });

    it("should not be muted initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isMuted).toBe(false);
    });

    it("should not be video off initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isVideoOff).toBe(false);
    });

    it("should not be speaker on initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isSpeakerOn).toBe(false);
    });

    it("should not be recording initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isRecording).toBe(false);
    });

    it("should not be screen sharing initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isScreenSharing).toBe(false);
    });

    it("should not be minimized initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isMinimized).toBe(false);
    });

    it("should not have beauty mode on initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.beautyMode).toBe(false);
    });

    it("should have default filter as none", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.currentFilter).toBe("none");
    });

    it("should have null local stream initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.localStream).toBeNull();
    });

    it("should have null remote stream initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.remoteStream).toBeNull();
    });

    it("should have null screen share error initially", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.screenShareError).toBeNull();
    });
  });

  describe("startCall", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: vi.fn(),
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("should activate call with connecting status", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "voice");
      });

      expect(result.current.callState.isActive).toBe(true);
      expect(result.current.callState.status).toBe("connecting");
      expect(result.current.callState.contactId).toBe("contact-1");
      expect(result.current.callState.contactName).toBe("John Doe");
    });

    it("should set video off for voice call", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "voice");
      });

      expect(result.current.callState.isVideoOff).toBe(true);
    });

    it("should not set video off for video call", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "video");
      });

      expect(result.current.callState.isVideoOff).toBe(false);
    });

    it("should set call type correctly", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "video");
      });

      expect(result.current.callState.callType).toBe("video");
    });
  });

  describe("simulateIncomingCall", () => {
    it("should set call as active with ringing status", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.simulateIncomingCall(
          "contact-1",
          "John Doe",
          "",
          "voice",
        );
      });

      expect(result.current.callState.isActive).toBe(true);
      expect(result.current.callState.status).toBe("ringing");
    });
  });

  describe("answerCall", () => {
    it("should change status to connected", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.simulateIncomingCall(
          "contact-1",
          "John Doe",
          "",
          "voice",
        );
      });

      act(() => {
        result.current.answerCall();
      });

      expect(result.current.callState.status).toBe("connected");
    });
  });

  describe("endCall", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: vi.fn(),
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("should deactivate call and reset state", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "voice");
      });

      act(() => {
        result.current.endCall();
      });

      expect(result.current.callState.isActive).toBe(false);
      expect(result.current.callState.status).toBe("idle");
      expect(result.current.callState.contactId).toBe("");
    });
  });

  describe("toggleMute", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: vi.fn(),
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("should toggle mute state", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "voice");
      });

      expect(result.current.callState.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.callState.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.callState.isMuted).toBe(false);
    });
  });

  describe("toggleVideo", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: {
          getUserMedia: vi.fn().mockResolvedValue({
            getTracks: vi.fn(),
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it("should toggle video state", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startCall("contact-1", "John Doe", "", "video");
      });

      expect(result.current.callState.isVideoOff).toBe(false);

      act(() => {
        result.current.toggleVideo();
      });

      expect(result.current.callState.isVideoOff).toBe(true);

      act(() => {
        result.current.toggleVideo();
      });

      expect(result.current.callState.isVideoOff).toBe(false);
    });
  });

  describe("toggleSpeaker", () => {
    it("should toggle speaker state", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.isSpeakerOn).toBe(false);

      act(() => {
        result.current.toggleSpeaker();
      });

      expect(result.current.callState.isSpeakerOn).toBe(true);

      act(() => {
        result.current.toggleSpeaker();
      });

      expect(result.current.callState.isSpeakerOn).toBe(false);
    });
  });

  describe("toggleBeautyMode", () => {
    it("should toggle beauty mode", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.callState.beautyMode).toBe(false);

      act(() => {
        result.current.toggleBeautyMode();
      });

      expect(result.current.callState.beautyMode).toBe(true);
    });
  });

  describe("applyFilter", () => {
    it("should set current filter", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.applyFilter("blur");
      });

      expect(result.current.callState.currentFilter).toBe("blur");
    });
  });

  describe("startScreenShare", () => {
    it("should be callable", async () => {
      const { result } = renderHook(() => useCall());

      await expect(result.current.startScreenShare()).resolves.not.toThrow();
    });
  });

  describe("stopScreenShare", () => {
    it("should stop screen sharing", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.stopScreenShare();
      });

      expect(result.current.callState.isScreenSharing).toBe(false);
    });
  });

  describe("startRecording", () => {
    it("should start call recording", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startRecording();
      });

      expect(result.current.callState.isRecording).toBe(true);
    });
  });

  describe("stopRecording", () => {
    it("should stop call recording", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.callState.isRecording).toBe(false);
    });
  });

  describe("minimizeCall", () => {
    it("should minimize call", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.minimizeCall();
      });

      expect(result.current.callState.isMinimized).toBe(true);
    });
  });

  describe("maximizeCall", () => {
    it("should maximize call", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.minimizeCall();
      });

      act(() => {
        result.current.maximizeCall();
      });

      expect(result.current.callState.isMinimized).toBe(false);
    });
  });

  describe("formatDuration", () => {
    it("should format seconds to mm:ss", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.formatDuration(0)).toBe("00:00");
      expect(result.current.formatDuration(59)).toBe("00:59");
      expect(result.current.formatDuration(60)).toBe("01:00");
      expect(result.current.formatDuration(125)).toBe("02:05");
    });

    it("should format hours correctly", () => {
      const { result } = renderHook(() => useCall());

      expect(result.current.formatDuration(3661)).toBe("01:01:01");
      expect(result.current.formatDuration(7200)).toBe("02:00:00");
    });
  });

  describe("isScreenShareSupported", () => {
    it("should return boolean", () => {
      const { result } = renderHook(() => useCall());

      expect(typeof result.current.isScreenShareSupported()).toBe("boolean");
    });
  });

  describe("clearScreenShareError", () => {
    it("should clear screen share error", () => {
      const { result } = renderHook(() => useCall());

      act(() => {
        result.current.clearScreenShareError();
      });

      expect(result.current.screenShareError).toBeNull();
    });
  });

  describe("switchCamera", () => {
    it("should be callable", () => {
      const { result } = renderHook(() => useCall());

      expect(() => result.current.switchCamera()).not.toThrow();
    });
  });

  describe("switchVideoLayout", () => {
    it("should be callable", () => {
      const { result } = renderHook(() => useCall());

      expect(() => result.current.switchVideoLayout()).not.toThrow();
    });
  });

  describe("showControls", () => {
    it("should be callable", () => {
      const { result } = renderHook(() => useCall());

      expect(() => result.current.showControls()).not.toThrow();
    });
  });
});
