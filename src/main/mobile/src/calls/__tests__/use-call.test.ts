import { useCall } from "../use-call";

const mockUseRtcCall = jest.fn();

jest.mock("@/core/rtc", () => ({
  useCall: (...args: unknown[]) => mockUseRtcCall(...args),
}));

jest.mock("@/core/store/hooks", () => ({
  useSocketStore: jest.fn(),
}));

jest.mock("@/core/call/callManagerLoader", () => ({
  getCallManager: jest.fn(),
}));

describe("useCall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial render", () => {
    it("should call useRtcCall with socket and getCallManager", () => {
      const mockSocket = { connected: true, on: jest.fn(), off: jest.fn() };
      const mockGetCallManager = jest.fn();

      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockReturnValue(mockSocket);
      (
        require("@/core/call/callManagerLoader").getCallManager as jest.Mock
      ).mockReturnValue(mockGetCallManager);

      useCall();

      expect(mockUseRtcCall).toHaveBeenCalledWith({
        getCallManager: expect.any(Function),
        socket: mockSocket,
      });
    });

    it("should pass socket from store to useRtcCall", () => {
      const mockSocket = { id: "socket-123", connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockReturnValue(mockSocket);
      (
        require("@/core/call/callManagerLoader").getCallManager as jest.Mock
      ).mockReturnValue(jest.fn());

      useCall();

      const callArgs = mockUseRtcCall.mock.calls[0][0];
      expect(callArgs.socket).toBe(mockSocket);
    });

    it("should pass getCallManager function to useRtcCall", () => {
      const mockGetCallManager = jest.fn();
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockReturnValue(null);
      (
        require("@/core/call/callManagerLoader").getCallManager as jest.Mock
      ).mockReturnValue(mockGetCallManager);

      useCall();

      const callArgs = mockUseRtcCall.mock.calls[0][0];
      expect(callArgs.getCallManager()).toBe(mockGetCallManager);
    });

    it("should handle null socket from store", () => {
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockReturnValue(null);
      (
        require("@/core/call/callManagerLoader").getCallManager as jest.Mock
      ).mockReturnValue(jest.fn());

      useCall();

      const callArgs = mockUseRtcCall.mock.calls[0][0];
      expect(callArgs.socket).toBeNull();
    });
  });

  describe("Return value", () => {
    it("should return the result from useRtcCall", () => {
      const expectedResult = { startCall: jest.fn(), endCall: jest.fn() };
      mockUseRtcCall.mockReturnValue(expectedResult);
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockReturnValue(null);
      (
        require("@/core/call/callManagerLoader").getCallManager as jest.Mock
      ).mockReturnValue(jest.fn());

      const result = useCall();

      expect(result).toBe(expectedResult);
    });
  });
});
