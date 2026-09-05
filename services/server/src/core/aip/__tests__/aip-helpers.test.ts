import { describe, it, expect } from "vitest";
import {
  encodePageToken,
  decodePageToken,
  clampPageSize,
  offsetFromPageToken,
  nextOffsetPageToken,
  cursorFromPageToken,
} from "../page-token";
import { rpcCodeFromHttpStatus, buildRpcStatus } from "../rpc-status";

describe("page-token", () => {
  it("should round-trip offset tokens", () => {
    const token = encodePageToken({ kind: "offset", offset: 40 });
    expect(decodePageToken(token)).toEqual({ kind: "offset", offset: 40 });
  });

  it("should clamp page_size", () => {
    expect(clampPageSize(undefined)).toBe(20);
    expect(clampPageSize(0)).toBe(20);
    expect(clampPageSize(500)).toBe(100);
  });

  it("should compute offset and next token", () => {
    const token = encodePageToken({ kind: "offset", offset: 20 });
    expect(offsetFromPageToken(token, 20)).toBe(20);
    expect(nextOffsetPageToken(20, 20, true)).toBe(
      encodePageToken({ kind: "offset", offset: 40 }),
    );
    expect(nextOffsetPageToken(20, 20, false)).toBeUndefined();
  });

  it("should extract cursor tokens", () => {
    const token = encodePageToken({ kind: "cursor", cursor: "c1" });
    expect(cursorFromPageToken(token)).toBe("c1");
  });
});

describe("rpc-status", () => {
  it("should map HTTP status to RpcCode", () => {
    expect(rpcCodeFromHttpStatus(404)).toBe("NOT_FOUND");
    expect(rpcCodeFromHttpStatus(403)).toBe("PERMISSION_DENIED");
    expect(rpcCodeFromHttpStatus(400)).toBe("INVALID_ARGUMENT");
    expect(rpcCodeFromHttpStatus(401)).toBe("UNAUTHENTICATED");
  });

  it("should build AIP-193 Status JSON", () => {
    expect(buildRpcStatus(404, "User not found")).toEqual({
      code: "NOT_FOUND",
      message: "User not found",
    });
  });
});
