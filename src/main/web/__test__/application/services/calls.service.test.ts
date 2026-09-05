import { describe, it, expect, vi, beforeEach } from "vitest";
import { CallsService } from "@/calls/calls.service";
import { bindAppStore } from "@/layout/store-access";

const mockStore = {
  getState: vi.fn(() => ({
    calls: {
      calls: [],
      callHistory: [],
      activeCall: null,
      incomingCall: null,
    },
  })),
  dispatch: vi.fn(),
};

describe("CallsService", () => {
  let callsService: CallsService;

  beforeEach(() => {
    vi.clearAllMocks();
    bindAppStore(mockStore);
    callsService = new CallsService();
  });

  describe("startCall", () => {
    it("should create and return a new call", async () => {
      const call = await callsService.startCall("contact-1", "voice");

      expect(call).toBeDefined();
      expect(call.contactId).toBe("contact-1");
      expect(call.type).toBe("voice");
      expect(call.status).toBe("outgoing");
    });

    it("should dispatch addCall and setActiveCall actions", async () => {
      await callsService.startCall("contact-1", "video");

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("endCall", () => {
    it("should be callable when call missing", () => {
      expect(() => callsService.endCall("missing", 10)).not.toThrow();
    });
  });

  describe("answerCall", () => {
    it("should be callable when call missing", () => {
      expect(() => callsService.answerCall("missing")).not.toThrow();
    });
  });

  describe("declineCall", () => {
    it("should be callable when call missing", () => {
      expect(() => callsService.declineCall("missing")).not.toThrow();
    });
  });

  describe("getCallById", () => {
    it("should return null when missing", () => {
      expect(callsService.getCallById("missing")).toBeNull();
    });
  });

  describe("getCallsForContact", () => {
    it("should return empty array", () => {
      expect(callsService.getCallsForContact("contact-1")).toEqual([]);
    });
  });

  describe("getMissedCalls", () => {
    it("should return empty array", () => {
      expect(callsService.getMissedCalls()).toEqual([]);
    });
  });

  describe("getRecentCalls", () => {
    it("should return empty array", () => {
      expect(callsService.getRecentCalls()).toEqual([]);
    });
  });

  describe("getCallStats", () => {
    it("should return zeroed stats", () => {
      expect(callsService.getCallStats()).toEqual({
        total: 0,
        missed: 0,
        answered: 0,
        totalDuration: 0,
        averageDuration: 0,
      });
    });
  });
});
