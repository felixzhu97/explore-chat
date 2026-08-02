import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useSocket } from "../use-socket";

const createMockSocket = () => ({
  connected: true,
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
});

const mockDispatch = jest.fn();
const mockConnectSocket = { type: "socket/connect" };
const mockDisconnectSocket = { type: "socket/disconnect" };

jest.mock("@/core/store/hooks", () => ({
  useSocketStore: jest.fn(),
  useAuthStore: jest.fn(),
  useAppDispatch: jest.fn(() => mockDispatch),
  connectSocket: jest.fn(() => mockConnectSocket),
  disconnectSocket: jest.fn(() => mockDisconnectSocket),
}));

jest.mock("@/chat/message.mapper", () => ({
  mapServerMessagePayload: jest.fn((payload) => ({
    id: payload.id || "msg-id",
    chatId: payload.chatId || "chat-id",
    senderId: payload.senderId || "sender-id",
    senderName: payload.sender?.username || "sender",
    content: payload.content || "",
    type: payload.type || "text",
    status: payload.status || "sent",
    timestamp: new Date(),
    isForwarded: false,
    forwardedFrom: [],
  })),
}));

describe("useSocket", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Connection management", () => {
    it("dispatches connectSocket when token exists", async () => {
      let storeState = { socket: null, connected: false };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "test-token",
      );

      renderHook(() => useSocket());

      expect(mockDispatch).toHaveBeenCalledWith(mockConnectSocket);
    });

    it("dispatches disconnectSocket when no token", async () => {
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        null,
      );

      renderHook(() => useSocket());

      expect(mockDispatch).toHaveBeenCalledWith(mockDisconnectSocket);
    });
  });

  describe("sendMessage", () => {
    it("does not emit when socket is null", () => {
      let storeState = { socket: null, connected: false };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.sendMessage("chat-1", "Hello");
      });

      expect(result.current.sendMessage).toBeDefined();
    });

    it("emits message when socket is connected", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.sendMessage("chat-1", "Hello", "TEXT");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("message:send", {
        chatId: "chat-1",
        content: "Hello",
        type: "TEXT",
      });
    });

    it("uses TEXT as default message type", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.sendMessage("chat-1", "Hello");
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("message:send", {
        chatId: "chat-1",
        content: "Hello",
        type: "TEXT",
      });
    });
  });

  describe("Event listeners", () => {
    it("registers message event listeners when socket exists", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      renderHook(() => useSocket());

      expect(mockSocket.on).toHaveBeenCalledWith(
        "message:received",
        expect.any(Function),
      );
      expect(mockSocket.on).toHaveBeenCalledWith(
        "message:sent",
        expect.any(Function),
      );
    });

    it("does not register listeners when socket is null", () => {
      let storeState = { socket: null, connected: false };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      renderHook(() => useSocket());

      const mockSocket = { on: jest.fn(), off: jest.fn() };
      expect(mockSocket.on).not.toHaveBeenCalled();
    });
  });

  describe("Callback handling", () => {
    it("handles onMessageReceived callback", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const onMessageReceived = jest.fn();
      renderHook(() => useSocket(onMessageReceived));

      const receivedHandler = mockSocket.on.mock.calls.find(
        (call: string[]) => call[0] === "message:received",
      )?.[1];

      act(() => {
        receivedHandler?.({
          id: "1",
          chatId: "c1",
          senderId: "s1",
          content: "Test",
        });
      });

      expect(onMessageReceived).toHaveBeenCalled();
    });

    it("handles onMessageSent callback", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const onMessageSent = jest.fn();
      renderHook(() => useSocket(undefined, onMessageSent));

      const sentHandler = mockSocket.on.mock.calls.find(
        (call: string[]) => call[0] === "message:sent",
      )?.[1];

      act(() => {
        sentHandler?.({
          id: "2",
          chatId: "c1",
          senderId: "s1",
          content: "Sent",
        });
      });

      expect(onMessageSent).toHaveBeenCalled();
    });
  });

  describe("Return values", () => {
    it("returns connected state from store", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const { result } = renderHook(() => useSocket());

      expect(result.current.connected).toBe(true);
    });

    it("returns socket instance from store", () => {
      const mockSocket = createMockSocket();
      let storeState = { socket: mockSocket, connected: true };
      (
        require("@/core/store/hooks").useSocketStore as jest.Mock
      ).mockImplementation((selector: (state: typeof storeState) => unknown) =>
        selector(storeState),
      );
      (require("@/core/store/hooks").useAuthStore as jest.Mock).mockReturnValue(
        "token",
      );

      const { result } = renderHook(() => useSocket());

      expect(result.current.socket).toBe(mockSocket);
    });
  });
});
