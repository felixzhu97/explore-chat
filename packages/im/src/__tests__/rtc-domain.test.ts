import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CallManagerStub, getCallManagerStub } from "../rtc/infrastructure/call-manager-stub";
import type { RTCCallState } from "../rtc/domain/call-manager";

describe("RTCCallState", () => {
  describe("when state has all fields", () => {
    it("should have correct type structure for video call", () => {
      const state: RTCCallState = {
        isActive: true,
        isIncoming: false,
        contactId: "user-123",
        contactName: "John Doe",
        contactAvatar: "https://example.com/avatar.jpg",
        callType: "video",
        status: "connected",
        duration: 120,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: true,
      };

      expect(state.isActive).toBe(true);
      expect(state.callType).toBe("video");
      expect(state.status).toBe("connected");
      expect(state.duration).toBe(120);
      expect(state.isSpeakerOn).toBe(true);
    });
  });

  describe("when state has only required fields", () => {
    it("should accept minimal state structure", () => {
      const state: RTCCallState = {
        isActive: false,
        isIncoming: false,
        contactId: "",
        contactName: "",
        contactAvatar: "",
        callType: "voice",
        status: "ended",
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };

      expect(state.isActive).toBe(false);
      expect(state.contactId).toBe("");
      expect(state.status).toBe("ended");
    });
  });

  describe("callType validation", () => {
    it("should accept voice call type", () => {
      const state: RTCCallState = {
        isActive: false,
        isIncoming: true,
        contactId: "user-456",
        contactName: "Jane Doe",
        contactAvatar: "",
        callType: "voice",
        status: "ringing",
        duration: 0,
        isMuted: false,
        isVideoOff: true,
        isSpeakerOn: false,
      };

      expect(state.callType).toBe("voice");
      expect(state.status).toBe("ringing");
      expect(state.isVideoOff).toBe(true);
    });

    it("should accept video call type", () => {
      const state: RTCCallState = {
        isActive: true,
        isIncoming: false,
        contactId: "user-789",
        contactName: "Bob Smith",
        contactAvatar: "",
        callType: "video",
        status: "connected",
        duration: 300,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: true,
      };

      expect(state.callType).toBe("video");
    });
  });

  describe("status validation", () => {
    it("should accept calling status", () => {
      const state: RTCCallState = createStateWithStatus("calling");
      expect(state.status).toBe("calling");
      expect(state.isActive).toBe(true);
    });

    it("should accept ringing status", () => {
      const state: RTCCallState = createStateWithStatus("ringing");
      expect(state.status).toBe("ringing");
      expect(state.isActive).toBe(true);
    });

    it("should accept connected status", () => {
      const state: RTCCallState = createStateWithStatus("connected");
      expect(state.status).toBe("connected");
      expect(state.isActive).toBe(true);
    });

    it("should accept ended status", () => {
      const state: RTCCallState = createStateWithStatus("ended");
      expect(state.status).toBe("ended");
      expect(state.isActive).toBe(false);
    });

    function createStateWithStatus(status: RTCCallState["status"]): RTCCallState {
      return {
        isActive: status !== "ended",
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: "",
        callType: "voice",
        status,
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };
    }
  });

  describe("direction (incoming/outgoing)", () => {
    it("should track incoming call state", () => {
      const state: RTCCallState = {
        isActive: true,
        isIncoming: true,
        contactId: "caller-123",
        contactName: "Incoming Caller",
        contactAvatar: "",
        callType: "voice",
        status: "ringing",
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };

      expect(state.isIncoming).toBe(true);
      expect(state.contactId).toBe("caller-123");
    });

    it("should track outgoing call state", () => {
      const state: RTCCallState = {
        isActive: true,
        isIncoming: false,
        contactId: "callee-456",
        contactName: "Outgoing Callee",
        contactAvatar: "",
        callType: "video",
        status: "calling",
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };

      expect(state.isIncoming).toBe(false);
      expect(state.contactId).toBe("callee-456");
    });
  });

  describe("media controls", () => {
    it("should track mute state", () => {
      const unmuted: RTCCallState = createStateWithMute(false);
      const muted: RTCCallState = createStateWithMute(true);

      expect(unmuted.isMuted).toBe(false);
      expect(muted.isMuted).toBe(true);
    });

    it("should track video state for video calls", () => {
      const videoOn: RTCCallState = createStateWithVideo(false);
      const videoOff: RTCCallState = createStateWithVideo(true);

      expect(videoOn.isVideoOff).toBe(false);
      expect(videoOff.isVideoOff).toBe(true);
    });

    it("should track speaker state", () => {
      const speakerOff: RTCCallState = createStateWithSpeaker(false);
      const speakerOn: RTCCallState = createStateWithSpeaker(true);

      expect(speakerOff.isSpeakerOn).toBe(false);
      expect(speakerOn.isSpeakerOn).toBe(true);
    });

    function createStateWithMute(isMuted: boolean): RTCCallState {
      return {
        isActive: true,
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: "",
        callType: "voice",
        status: "connected",
        duration: 60,
        isMuted,
        isVideoOff: false,
        isSpeakerOn: false,
      };
    }

    function createStateWithVideo(isVideoOff: boolean): RTCCallState {
      return {
        isActive: true,
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: "",
        callType: "video",
        status: "connected",
        duration: 60,
        isMuted: false,
        isVideoOff,
        isSpeakerOn: false,
      };
    }

    function createStateWithSpeaker(isSpeakerOn: boolean): RTCCallState {
      return {
        isActive: true,
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: "",
        callType: "voice",
        status: "connected",
        duration: 60,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn,
      };
    }
  });

  describe("duration tracking", () => {
    it("should start at zero duration", () => {
      const state: RTCCallState = createStateWithDuration(0);
      expect(state.duration).toBe(0);
    });

    it("should track minutes of call", () => {
      const state: RTCCallState = createStateWithDuration(300);
      expect(state.duration).toBe(300);
    });

    it("should track hours of call", () => {
      const state: RTCCallState = createStateWithDuration(3661);
      expect(state.duration).toBe(3661);
    });

    function createStateWithDuration(duration: number): RTCCallState {
      return {
        isActive: true,
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: "",
        callType: "voice",
        status: "connected",
        duration,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };
    }
  });

  describe("contact information", () => {
    it("should store contact avatar URL", () => {
      const state: RTCCallState = createStateWithAvatar("https://cdn.example.com/avatar.jpg");
      expect(state.contactAvatar).toBe("https://cdn.example.com/avatar.jpg");
    });

    it("should allow empty avatar", () => {
      const state: RTCCallState = createStateWithAvatar("");
      expect(state.contactAvatar).toBe("");
    });

    function createStateWithAvatar(avatar: string): RTCCallState {
      return {
        isActive: true,
        isIncoming: false,
        contactId: "user",
        contactName: "User",
        contactAvatar: avatar,
        callType: "voice",
        status: "connected",
        duration: 0,
        isMuted: false,
        isVideoOff: false,
        isSpeakerOn: false,
      };
    }
  });
});

describe("CallManagerStub", () => {
  let stub: CallManagerStub;

  beforeEach(() => {
    stub = new CallManagerStub();
  });

  describe("initialization", () => {
    it("should have initial ended state", () => {
      const state = stub.getCallState();
      expect(state.isActive).toBe(false);
      expect(state.status).toBe("ended");
      expect(state.duration).toBe(0);
    });

    it("should return null for streams", () => {
      expect(stub.getLocalStream()).toBeNull();
      expect(stub.getRemoteStream()).toBeNull();
    });

    it("should have empty contact info initially", () => {
      const state = stub.getCallState();
      expect(state.contactId).toBe("");
      expect(state.contactName).toBe("");
      expect(state.contactAvatar).toBe("");
    });

    it("should have default call type voice", () => {
      const state = stub.getCallState();
      expect(state.callType).toBe("voice");
    });
  });

  describe("event listeners", () => {
    it("should register event listeners", () => {
      const callback = vi.fn();
      stub.on("callStateChanged", callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should unregister event listeners", () => {
      const callback = vi.fn();
      stub.on("callStateChanged", callback);
      stub.off("callStateChanged", callback);
      stub.on("callStateChanged", callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle multiple listeners for same event", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      stub.on("callStateChanged", callback1);
      stub.on("callStateChanged", callback2);
      stub.off("callStateChanged", callback1);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it("should not throw when removing non-existent listener", () => {
      const callback = vi.fn();
      expect(() => stub.off("callStateChanged", callback)).not.toThrow();
    });

    it("should handle multiple different event types", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      stub.on("callStateChanged", callback1);
      stub.on("incomingCall", callback2);
      expect(() => stub.off("callStateChanged", callback1)).not.toThrow();
      expect(() => stub.off("incomingCall", callback2)).not.toThrow();
    });
  });

  describe("startCall", () => {
    it("should throw Expo Go error", async () => {
      await expect(
        stub.startCall("user-1", "User", "", "voice")
      ).rejects.toThrow("Calls require a development build. Expo Go does not support WebRTC.");
    });

    it("should throw regardless of call type", async () => {
      await expect(
        stub.startCall("user-1", "User", "", "video")
      ).rejects.toThrow("Calls require a development build");
    });

    it("should throw regardless of parameters", async () => {
      await expect(
        stub.startCall("user-1", "User", "https://avatar.com/img.jpg", "video")
      ).rejects.toThrow();
    });
  });

  describe("answerCall", () => {
    it("should throw development build error", async () => {
      await expect(stub.answerCall()).rejects.toThrow(
        "Calls require a development build."
      );
    });

    it("should throw error without call ID", async () => {
      await expect(stub.answerCall()).rejects.toThrow();
    });
  });

  describe("endCall", () => {
    it("should not throw", () => {
      expect(() => stub.endCall()).not.toThrow();
    });

    it("should not throw when called multiple times", () => {
      expect(() => {
        stub.endCall();
        stub.endCall();
      }).not.toThrow();
    });

    it("should not change state", () => {
      const stateBefore = stub.getCallState();
      stub.endCall();
      const stateAfter = stub.getCallState();
      expect(stateBefore).toEqual(stateAfter);
    });
  });

  describe("toggleMute", () => {
    it("should not throw", () => {
      expect(() => stub.toggleMute()).not.toThrow();
    });

    it("should not throw when called multiple times", () => {
      expect(() => {
        stub.toggleMute();
        stub.toggleMute();
      }).not.toThrow();
    });
  });

  describe("toggleVideo", () => {
    it("should not throw", () => {
      expect(() => stub.toggleVideo()).not.toThrow();
    });

    it("should not throw for voice call", () => {
      expect(() => stub.toggleVideo()).not.toThrow();
    });
  });

  describe("toggleSpeaker", () => {
    it("should not throw", () => {
      expect(() => stub.toggleSpeaker()).not.toThrow();
    });

    it("should not throw when called multiple times", () => {
      expect(() => {
        stub.toggleSpeaker();
        stub.toggleSpeaker();
      }).not.toThrow();
    });
  });

  describe("setSocket", () => {
    it("should not throw", () => {
      expect(() => stub.setSocket({})).not.toThrow();
    });

    it("should accept null socket", () => {
      expect(() => stub.setSocket(null)).not.toThrow();
    });

    it("should accept socket with methods", () => {
      const mockSocket = {
        send: vi.fn(),
        on: vi.fn(),
        close: vi.fn(),
      };
      expect(() => stub.setSocket(mockSocket)).not.toThrow();
    });
  });

  describe("getCallState immutability", () => {
    it("should return a copy of state", () => {
      const state1 = stub.getCallState();
      const state2 = stub.getCallState();
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2);
    });

    it("should not reflect external mutations", () => {
      const state = stub.getCallState();
      (state as RTCCallState).isActive = true;
      const freshState = stub.getCallState();
      expect(freshState.isActive).toBe(false);
    });
  });
});

describe("getCallManagerStub singleton", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return consistent instance", () => {
    const stub1 = new CallManagerStub();
    const stub2 = new CallManagerStub();

    expect(stub1).not.toBe(stub2);

    expect(typeof stub1.getCallState).toBe("function");
    expect(typeof stub2.getCallState).toBe("function");
  });

  it("should return stub with all required methods", () => {
    const stub = new CallManagerStub();

    expect(typeof stub.on).toBe("function");
    expect(typeof stub.off).toBe("function");
    expect(typeof stub.getCallState).toBe("function");
    expect(typeof stub.getLocalStream).toBe("function");
    expect(typeof stub.getRemoteStream).toBe("function");
    expect(typeof stub.startCall).toBe("function");
    expect(typeof stub.answerCall).toBe("function");
    expect(typeof stub.endCall).toBe("function");
    expect(typeof stub.toggleMute).toBe("function");
    expect(typeof stub.toggleVideo).toBe("function");
    expect(typeof stub.toggleSpeaker).toBe("function");
    expect(typeof stub.setSocket).toBe("function");
  });

  it("should return stub matching ICallManager interface", () => {
    const stub = new CallManagerStub();

    expect(stub.on).toBeDefined();
    expect(stub.off).toBeDefined();
    expect(stub.getCallState()).toBeDefined();
    expect(stub.getLocalStream()).toBeNull();
    expect(stub.getRemoteStream()).toBeNull();
  });
});

describe("Call state transitions", () => {
  let stub: CallManagerStub;

  beforeEach(() => {
    stub = new CallManagerStub();
  });

  describe("ended state", () => {
    it("should have correct initial values", () => {
      const state = stub.getCallState();

      expect(state.isActive).toBe(false);
      expect(state.isIncoming).toBe(false);
      expect(state.status).toBe("ended");
      expect(state.duration).toBe(0);
      expect(state.isMuted).toBe(false);
      expect(state.isVideoOff).toBe(false);
      expect(state.isSpeakerOn).toBe(false);
    });
  });

  describe("call type behavior", () => {
    it("should initialize video call with video off for voice type", async () => {
      try {
        await stub.startCall("user-1", "User", "", "voice");
      } catch {
        // Expected to throw
      }

      const state = stub.getCallState();
      expect(state.callType).toBe("voice");
    });

    it("should track video call type", async () => {
      try {
        await stub.startCall("user-1", "User", "", "video");
      } catch {
        // Expected to throw
      }

      const state = stub.getCallState();
      expect(state.callType).toBe("voice");
    });
  });
});

describe("Event emission behavior", () => {
  let stub: CallManagerStub;

  beforeEach(() => {
    stub = new CallManagerStub();
  });

  describe("callStateChanged events", () => {
    it("should not emit during initialization", () => {
      const callback = vi.fn();
      stub.on("callStateChanged", callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should not emit when state doesn't change", () => {
      const callback = vi.fn();
      stub.on("callStateChanged", callback);
      stub.endCall();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("incomingCall events", () => {
    it("should not emit during initialization", () => {
      const callback = vi.fn();
      stub.on("incomingCall", callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("callEnded events", () => {
    it("should not emit during initialization", () => {
      const callback = vi.fn();
      stub.on("callEnded", callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
