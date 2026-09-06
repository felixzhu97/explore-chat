import { describe, it, expect } from "vitest";
import type { RpcStatus } from "../transport";

describe("RpcStatus", () => {
  it("should represent AIP-193 Status JSON", () => {
    const status: RpcStatus = {
      code: "NOT_FOUND",
      message: "User not found",
      details: [{ "@type": "google.rpc.ErrorInfo", reason: "USER_MISSING" }],
    };

    expect(status.code).toBe("NOT_FOUND");
    expect(status.message).toBe("User not found");
    expect(status.details?.[0]?.["@type"]).toBe("google.rpc.ErrorInfo");
  });
});
