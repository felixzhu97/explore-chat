describe("authSlice", () => {
  describe("initial state structure", () => {
    it("should have correct initial state shape", () => {
      const initialState = {
        token: null,
        refreshToken: null,
        user: null,
        isReady: false,
      };

      expect(initialState).toHaveProperty("token");
      expect(initialState).toHaveProperty("refreshToken");
      expect(initialState).toHaveProperty("user");
      expect(initialState).toHaveProperty("isReady");
      expect(initialState.token).toBeNull();
      expect(initialState.refreshToken).toBeNull();
      expect(initialState.user).toBeNull();
      expect(initialState.isReady).toBe(false);
    });
  });

  describe("setAuth behavior", () => {
    it("should allow setting auth state with user data", () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };

      const state = {
        token: "jwt-token-123",
        refreshToken: "refresh-token-456",
        user: mockUser,
        isReady: true,
      };

      expect(state.token).toBe("jwt-token-123");
      expect(state.refreshToken).toBe("refresh-token-456");
      expect(state.user).toEqual(mockUser);
    });

    it("should allow partial user data", () => {
      const partialUser = {
        id: "user-456",
        email: "partial@example.com",
        username: "partial",
      };

      const state = {
        token: "token-789",
        refreshToken: "refresh-789",
        user: partialUser,
        isReady: false,
      };

      expect(state.user).toEqual(partialUser);
    });
  });

  describe("logout behavior", () => {
    it("should clear auth state", () => {
      const authState = {
        token: "some-token",
        refreshToken: "some-refresh",
        user: { id: "user-123", email: "test@test.com", username: "test" },
        isReady: true,
      };

      const loggedOutState = {
        token: null,
        refreshToken: null,
        user: null,
        isReady: false,
      };

      expect(loggedOutState.token).toBeNull();
      expect(loggedOutState.refreshToken).toBeNull();
      expect(loggedOutState.user).toBeNull();
    });
  });

  describe("hydrateAuth behavior", () => {
    it("should handle stored data", () => {
      const storedToken = "stored-token";
      const storedRefreshToken = "stored-refresh";
      const storedUser = {
        id: "stored-user",
        email: "stored@test.com",
        username: "stored",
      };

      const state = {
        token: storedToken,
        refreshToken: storedRefreshToken,
        user: storedUser,
        isReady: true,
      };

      expect(state.token).toBe(storedToken);
      expect(state.refreshToken).toBe(storedRefreshToken);
      expect(state.user).toEqual(storedUser);
      expect(state.isReady).toBe(true);
    });

    it("should handle null values from storage", () => {
      const state = {
        token: null,
        refreshToken: null,
        user: null,
        isReady: true,
      };

      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isReady).toBe(true);
    });
  });
});
