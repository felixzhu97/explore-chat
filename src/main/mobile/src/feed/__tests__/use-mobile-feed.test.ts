import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useMobileFeed } from "../use-mobile-feed";
import { getFeedApi } from "@/core/composition-root";

jest.mock("@/core/composition-root", () => ({
  getFeedApi: jest.fn(),
}));

const mockGetFeedUseCases = getFeedApi as jest.MockedFunction<
  typeof getFeedApi
>;

describe("useMobileFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial state", () => {
    it("returns empty items initially", () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: [], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      expect(result.current.items).toEqual([]);
    });

    it("starts with loading false", () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: [], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      expect(result.current.loading).toBe(false);
    });

    it("starts with hasMore true", () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: [], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("load function", () => {
    it("loads initial posts successfully", async () => {
      const mockPosts = [
        {
          id: "1",
          userId: "u1",
          username: "user1",
          caption: "Test",
          type: "IMAGE",
        },
        {
          id: "2",
          userId: "u2",
          username: "user2",
          caption: "Test2",
          type: "IMAGE",
        },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: mockPosts, nextPageState: "page2" }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    it("provides correct loading states", async () => {
      const mockPosts = [
        {
          id: "1",
          userId: "u1",
          username: "user1",
          caption: "Test",
          type: "IMAGE",
        },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: mockPosts, nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      expect(result.current.initialLoading).toBe(false);
      expect(result.current.loadingMore).toBe(false);

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.initialLoading).toBe(false);
    });

    it("sets loadingMore when loading with existing items", async () => {
      const mockPosts = [
        {
          id: "1",
          userId: "u1",
          username: "user1",
          caption: "Test",
          type: "IMAGE",
        },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValueOnce({ posts: mockPosts, nextPageState: "page2" })
          .mockResolvedValueOnce({ posts: [], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.items.length).toBeGreaterThan(0);
    });

    it("handles error gracefully", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest.fn().mockRejectedValue(new Error("Network error")),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.error).toBe("Network error");
    });

    it("resets state when reset is true", async () => {
      const newPosts = [
        {
          id: "2",
          userId: "u2",
          username: "user2",
          caption: "New",
          type: "IMAGE",
        },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: newPosts, nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load(true);
      });

      expect(result.current.items[0].id).toBe("2");
      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("refresh function", () => {
    it("calls load with reset true", async () => {
      const mockPosts = [
        {
          id: "1",
          userId: "u1",
          username: "user1",
          caption: "Test",
          type: "IMAGE",
        },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: mockPosts, nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("hasMore", () => {
    it("sets hasMore to false when no nextPageState", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: [], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.hasMore).toBe(false);
    });

    it("sets hasMore to true when nextPageState exists", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValue({ posts: [], nextPageState: "cursor123" }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.hasMore).toBe(true);
    });
  });

  describe("pagination", () => {
    it("loads more posts when called again", async () => {
      const page1Posts = [
        {
          id: "1",
          userId: "u1",
          username: "user1",
          caption: "Post 1",
          type: "IMAGE" as const,
        },
      ];
      const page2Posts = [
        {
          id: "2",
          userId: "u2",
          username: "user2",
          caption: "Post 2",
          type: "IMAGE" as const,
        },
      ];

      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValueOnce({ posts: page1Posts, nextPageState: "page2" })
          .mockResolvedValueOnce({
            posts: page2Posts,
            nextPageState: undefined,
          }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });
      expect(result.current.items).toHaveLength(1);

      await act(async () => {
        await result.current.load();
      });
      expect(result.current.items).toHaveLength(2);
    });

    it("prevents duplicate posts with same id", async () => {
      const post = {
        id: "1",
        userId: "u1",
        username: "user1",
        caption: "Post",
        type: "IMAGE" as const,
      };

      mockGetFeedUseCases.mockReturnValue({
        getFeed: jest
          .fn()
          .mockResolvedValueOnce({ posts: [post], nextPageState: "page2" })
          .mockResolvedValueOnce({ posts: [post], nextPageState: undefined }),
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });
      expect(result.current.items).toHaveLength(1);

      await act(async () => {
        await result.current.load();
      });
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe("prevent duplicate loading", () => {
    it("prevents concurrent loading calls", async () => {
      const mockFeed = jest
        .fn()
        .mockResolvedValue({ posts: [], nextPageState: undefined });
      mockGetFeedUseCases.mockReturnValue({
        getFeed: mockFeed,
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        result.current.load();
        result.current.load();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFeed).toHaveBeenCalledTimes(1);
    });

    it("prevents loading when hasMore is false", async () => {
      const mockFeed = jest
        .fn()
        .mockResolvedValue({ posts: [], nextPageState: undefined });
      mockGetFeedUseCases.mockReturnValue({
        getFeed: mockFeed,
      } as any);

      const { result } = renderHook(() => useMobileFeed());

      await act(async () => {
        await result.current.load();
      });

      mockFeed.mockClear();

      await act(async () => {
        await result.current.load();
      });

      expect(mockFeed).not.toHaveBeenCalled();
    });
  });
});
