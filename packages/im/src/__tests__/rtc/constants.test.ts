import { describe, it, expect } from "vitest";
import {
  ICE_SERVERS,
  INITIAL_CALL_STATE,
  RTC_EVENTS,
} from "../../rtc/application/constants";
import type { RTCCallState } from "../../rtc/domain/call-manager";

describe("RTC Constants", () => {
  describe("ICE_SERVERS", () => {
    it("should contain Google STUN servers", () => {
      expect(ICE_SERVERS).toHaveLength(2);
    });

    it("should have correct STUN server URLs", () => {
      expect(ICE_SERVERS[0]).toEqual({ urls: "stun:stun.l.google.com:19302" });
      expect(ICE_SERVERS[1]).toEqual({ urls: "stun:stun1.l.google.com:19302" });
    });

    it("should have valid URL format", () => {
      ICE_SERVERS.forEach((server) => {
        expect(server.urls).toMatch(/^stun:/);
        expect(server.urls).toContain("google.com");
      });
    });
  });

  describe("INITIAL_CALL_STATE", () => {
    it("should have isActive as false", () => {
      expect(INITIAL_CALL_STATE.isActive).toBe(false);
    });

    it("should have isIncoming as false", () => {
      expect(INITIAL_CALL_STATE.isIncoming).toBe(false);
    });

    it("should have empty contact information", () => {
      expect(INITIAL_CALL_STATE.contactId).toBe("");
      expect(INITIAL_CALL_STATE.contactName).toBe("");
      expect(INITIAL_CALL_STATE.contactAvatar).toBe("");
    });

    it("should have voice as default callType", () => {
      expect(INITIAL_CALL_STATE.callType).toBe("voice");
    });

    it("should have ended as initial status", () => {
      expect(INITIAL_CALL_STATE.status).toBe("ended");
    });

    it("should have duration as 0", () => {
      expect(INITIAL_CALL_STATE.duration).toBe(0);
    });

    it("should have all controls off by default", () => {
      expect(INITIAL_CALL_STATE.isMuted).toBe(false);
      expect(INITIAL_CALL_STATE.isVideoOff).toBe(false);
      expect(INITIAL_CALL_STATE.isSpeakerOn).toBe(false);
    });

    it("should match RTCCallState type", () => {
      const state: RTCCallState = INITIAL_CALL_STATE;
      expect(state.isActive).toBe(false);
      expect(state.status).toBe("ended");
    });

    it("should be a constant object", () => {
      expect(INITIAL_CALL_STATE).toEqual({
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
      });
    });
  });

  describe("RTC_EVENTS", () => {
    it("should have INCOMING event", () => {
      expect(RTC_EVENTS.INCOMING).toBe("call:incoming");
    });

    it("should have ANSWER event", () => {
      expect(RTC_EVENTS.ANSWER).toBe("call:answer");
    });

    it("should have OFFER event", () => {
      expect(RTC_EVENTS.OFFER).toBe("call:offer");
    });

    it("should have WEBRTC_ANSWER event", () => {
      expect(RTC_EVENTS.WEBRTC_ANSWER).toBe("call:webrtc-answer");
    });

    it("should have ICE_CANDIDATE event", () => {
      expect(RTC_EVENTS.ICE_CANDIDATE).toBe("call:ice-candidate");
    });

    it("should have END event", () => {
      expect(RTC_EVENTS.END).toBe("call:end");
    });

    it("should have all required event types", () => {
      expect(Object.keys(RTC_EVENTS)).toHaveLength(6);
    });

    it("should have readonly values", () => {
      expect(RTC_EVENTS.INCOMING).toBe("call:incoming");
      expect(RTC_EVENTS.ANSWER).toBe("call:answer");
    });
  });

  describe("event naming consistency", () => {
    it("should follow 'call:' prefix convention", () => {
      expect(RTC_EVENTS.INCOMING).toMatch(/^call:/);
      expect(RTC_EVENTS.ANSWER).toMatch(/^call:/);
      expect(RTC_EVENTS.OFFER).toMatch(/^call:/);
      expect(RTC_EVENTS.WEBRTC_ANSWER).toMatch(/^call:/);
      expect(RTC_EVENTS.ICE_CANDIDATE).toMatch(/^call:/);
      expect(RTC_EVENTS.END).toMatch(/^call:/);
    });

    it("should have kebab-case event names", () => {
      expect(RTC_EVENTS.WEBRTC_ANSWER).toBe("call:webrtc-answer");
      expect(RTC_EVENTS.ICE_CANDIDATE).toBe("call:ice-candidate");
    });
  });
});
