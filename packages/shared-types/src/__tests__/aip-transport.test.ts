import { describe, it, expect } from "vitest";
import type { RpcStatus, ListQuery, ListResponse } from "../transport";

describe("AIP transport types", () => {
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

  describe("ListQuery and ListResponse", () => {
    it("should use page_size and page_token for list requests", () => {
      const query: ListQuery = { page_size: 20, page_token: "abc" };
      expect(query.page_size).toBe(20);
      expect(query.page_token).toBe("abc");
    });

    it("should return plural collection and next_page_token", () => {
      const response: ListResponse<"users", { id: string }> = {
        users: [{ id: "u1" }],
        next_page_token: "tok-2",
      };

      expect(response.users).toHaveLength(1);
      expect(response.next_page_token).toBe("tok-2");
    });
  });
});
