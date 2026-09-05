import { describe, it, expect, vi, beforeEach } from "vitest";
import { CallsService } from "@/calls/calls.service";
import { store } from "@/layout/store";

vi.mock("@/layout/store", () => ({
  store: {
    getState: vi.fn(() => ({
      calls: {
        calls: [],
        callHistory: [],
        activeCall: null,
        incomingCall: null,
      },
    })),
    dispatch: vi.fn(),
  },
}));

describe("CallsService", () => {
  let callsService: CallsService;

  beforeEach(() => {
    vi.clearAllMocks();
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

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe("endCall", () => {
    it("should end a call with duration", async () => {
      const call = await callsService.startCall("contact-1", "voice");

      callsService.endCall(call.id, 120);

      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe("answerCall", () => {
    it("should answer an incoming call", async () => {
      const call = await callsService.startCall("contact-1", "voice");

      callsService.answerCall(call.id);

      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe("declineCall", () => {
    it("should decline an incoming call", async () => {
      const call = await callsService.startCall("contact-1", "voice");

      callsService.declineCall(call.id);

      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe("getCallById", () => {
    it("should return null when call not found", () => {
      const call = callsService.getCallById("non-existent");
      expect(call).toBeNull();
    });
  });

  describe("getCallsForContact", () => {
    it("should return calls for contact", () => {
      const calls = callsService.getCallsForContact("contact-1");
      expect(Array.isArray(calls)).toBe(true);
    });
  });

  describe("getMissedCalls", () => {
    it("should return missed calls", () => {
      const missedCalls = callsService.getMissedCalls();
      expect(Array.isArray(missedCalls)).toBe(true);
    });
  });

  describe("getRecentCalls", () => {
    it("should return recent calls with limit", () => {
      const recentCalls = callsService.getRecentCalls(10);
      expect(Array.isArray(recentCalls)).toBe(true);
    });

    it("should use default limit of 50", () => {
      const recentCalls = callsService.getRecentCalls();
      expect(Array.isArray(recentCalls)).toBe(true);
    });
  });

  describe("getCallStats", () => {
    it("should return call statistics", () => {
      const stats = callsService.getCallStats();

      expect(stats).toHaveProperty("total");
      expect(stats).toHaveProperty("missed");
      expect(stats).toHaveProperty("answered");
      expect(stats).toHaveProperty("totalDuration");
      expect(stats).toHaveProperty("averageDuration");
    });

    it("should calculate correct average duration", () => {
      const stats = callsService.getCallStats();

      if (stats.answered > 0) {
        expect(stats.averageDuration).toBe(
          stats.totalDuration / stats.answered,
        );
      } else {
        expect(stats.averageDuration).toBe(0);
      }
    });
  });
});
