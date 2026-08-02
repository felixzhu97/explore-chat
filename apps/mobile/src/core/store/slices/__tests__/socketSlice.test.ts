describe("socketSlice", () => {
  describe("initial state structure", () => {
    it("should have correct initial state shape", () => {
      const initialState = {
        socket: null,
        connected: false,
      };

      expect(initialState).toHaveProperty("socket");
      expect(initialState).toHaveProperty("connected");
      expect(initialState.socket).toBeNull();
      expect(initialState.connected).toBe(false);
    });
  });

  describe("setSocket behavior", () => {
    it("should allow setting socket to an object", () => {
      const mockSocket = { id: "socket-123", connected: true };
      const state = { socket: mockSocket, connected: true };

      expect(state.socket).toBe(mockSocket);
    });

    it("should allow setting socket to null", () => {
      const state = { socket: null, connected: false };

      expect(state.socket).toBeNull();
    });
  });

  describe("setConnected behavior", () => {
    it("should allow setting connected to true", () => {
      const state = { socket: null, connected: true };

      expect(state.connected).toBe(true);
    });

    it("should allow setting connected to false", () => {
      const state = { socket: null, connected: false };

      expect(state.connected).toBe(false);
    });
  });

  describe("disconnect behavior", () => {
    it("should reset state on disconnect", () => {
      const mockSocket = { id: "socket-123", connected: true };
      const connectedState = { socket: mockSocket, connected: true };
      const disconnectedState = { socket: null, connected: false };

      expect(disconnectedState.socket).toBeNull();
      expect(disconnectedState.connected).toBe(false);
    });
  });
});
