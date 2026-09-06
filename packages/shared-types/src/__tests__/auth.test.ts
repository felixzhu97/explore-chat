import { describe, it, expect } from "vitest";
import type { AuthTokens } from "../auth";

describe("AuthTokens", () => {
  it("should create tokens with access token, refresh token, and expiry", () => {
    const tokens: AuthTokens = {
      accessToken: "access-token",
      refreshToken: "refresh-token-123",
      expiresIn: 3600,
    };

    expect(tokens.accessToken).toBe("access-token");
    expect(tokens.refreshToken).toBe("refresh-token-123");
    expect(tokens.expiresIn).toBe(3600);
  });

  it("should allow optional refresh token", () => {
    const tokens: AuthTokens = {
      accessToken: "access-token",
      expiresIn: 1800,
    };

    expect(tokens.refreshToken).toBeUndefined();
  });
});
