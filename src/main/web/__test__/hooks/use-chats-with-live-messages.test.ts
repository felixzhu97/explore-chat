import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useChatsWithLiveMessages } from "@/chat/hooks/use-chats-with-live-messages";

vi.mock("@chat/im", () => ({
  useChatsWithLiveMessages: vi.fn(() => ({
    chats: [],
    loading: false,
    error: null,
    refreshChats: vi.fn(),
  })),
}));

vi.mock("@/chat/services/chats.service", () => ({
  getChatsService: vi.fn(() => ({
    getChats: vi.fn().mockResolvedValue([]),
    getChatById: vi.fn().mockResolvedValue(null),
  })),
}));

vi.mock("@/chat/websocket", () => ({
  getWebSocketAdapter: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

describe("useChatsWithLiveMessages Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return chats array", () => {
      const { result } = renderHook(() =>
        useChatsWithLiveMessages(null, undefined),
      );

      expect(result.current).toHaveProperty("chats");
      expect(Array.isArray(result.current.chats)).toBe(true);
    });

    it("should have loading state", () => {
      const { result } = renderHook(() =>
        useChatsWithLiveMessages(null, undefined),
      );

      expect(result.current).toHaveProperty("loading");
      expect(typeof result.current.loading).toBe("boolean");
    });

    it("should have error state", () => {
      const { result } = renderHook(() =>
        useChatsWithLiveMessages(null, undefined),
      );

      expect(result.current).toHaveProperty("error");
    });
  });
});
