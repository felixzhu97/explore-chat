import { describe, it, expect } from "vitest";
import {
  mapCall,
  answerCall,
  endCallRecord,
  markCallMissed,
} from "../call.model";

const baseCall = {
  id: "call-1",
  contactId: "contact-1",
  contactName: "John Doe",
  contactAvatar: "https://example.com/avatar.jpg",
  type: "voice" as const,
  status: "outgoing" as const,
  startTime: "2024-01-15T10:30:00Z",
};

describe("mapCall", () => {
  it("should_returnCallData_when_requiredFieldsProvided", () => {
    const call = mapCall(baseCall);

    expect(call.id).toBe("call-1");
    expect(call.contactId).toBe("contact-1");
    expect(call.type).toBe("voice");
    expect(call.status).toBe("outgoing");
  });

  it("should_includeOptionalFields_when_provided", () => {
    const call = mapCall({
      ...baseCall,
      endTime: "2024-01-15T10:45:00Z",
      duration: 900,
      isGroup: true,
      participants: ["user-1", "user-2"],
    });

    expect(call.endTime).toBe("2024-01-15T10:45:00Z");
    expect(call.duration).toBe(900);
    expect(call.isGroup).toBe(true);
    expect(call.participants).toEqual(["user-1", "user-2"]);
  });
});

describe("answerCall", () => {
  it("should_setStatusAnswered_when_callIsIncoming", () => {
    const incoming = mapCall({ ...baseCall, status: "incoming" });
    const answered = answerCall(incoming);

    expect(answered.status).toBe("answered");
    expect(answered.id).toBe(incoming.id);
  });
});

describe("endCallRecord", () => {
  it("should_setEndedStatusAndDuration_when_callEnds", () => {
    const active = mapCall({ ...baseCall, status: "answered" });
    const ended = endCallRecord(active, "2024-01-15T10:45:00Z", 900);

    expect(ended.status).toBe("ended");
    expect(ended.endTime).toBe("2024-01-15T10:45:00Z");
    expect(ended.duration).toBe(900);
  });
});

describe("markCallMissed", () => {
  it("should_setStatusMissed_when_callNotAnswered", () => {
    const incoming = mapCall({ ...baseCall, status: "incoming" });
    const missed = markCallMissed(incoming);

    expect(missed.status).toBe("missed");
  });
});
