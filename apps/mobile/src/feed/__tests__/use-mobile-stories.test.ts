import { renderHook, waitFor } from "@testing-library/react-native";
import { useMobileStories } from "../use-mobile-stories";
import { getFeedApi } from "@/core/composition-root";

jest.mock("@/core/composition-root", () => ({
  getFeedApi: jest.fn(),
}));

const mockGetFeedUseCases = getFeedApi as jest.MockedFunction<
  typeof getFeedApi
>;

describe("useMobileStories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial state", () => {
    it("returns empty items initially", () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockResolvedValue([]),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      expect(result.current.items).toEqual([]);
    });

    it("starts with loading true", () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockResolvedValue([]),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      expect(result.current.loading).toBe(true);
    });

    it("starts with no error", () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockResolvedValue([]),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      expect(result.current.error).toBeNull();
    });
  });

  describe("Loading stories", () => {
    it("loads stories successfully", async () => {
      const mockStories = [
        { id: "1", username: "user1", avatar: "avatar1.jpg" },
        { id: "2", username: "user2", avatar: "avatar2.jpg" },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockResolvedValue(mockStories),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.items).toHaveLength(2);
    });

    it("sets error on failure", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest
          .fn()
          .mockRejectedValue(new Error("Failed to load")),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.error).toBe("Failed to load");
      });

      expect(result.current.items).toEqual([]);
    });

    it("handles non-Error exceptions", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockRejectedValue("Unknown error"),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.error).toBe("加载失败");
      });
    });
  });

  describe("reload function", () => {
    it("reloads stories successfully", async () => {
      const mockStories = [
        { id: "1", username: "user1", avatar: "avatar1.jpg" },
      ];
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockResolvedValue(mockStories),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });

      result.current.reload();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("reloads and handles errors", async () => {
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: jest.fn().mockRejectedValue(new Error("Reload failed")),
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe("limit parameter", () => {
    it("uses default limit of 12", async () => {
      const mockGetSuggestions = jest.fn().mockResolvedValue([]);
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: mockGetSuggestions,
      } as any);

      renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(12);
      });
    });

    it("uses custom limit when provided", async () => {
      const mockGetSuggestions = jest.fn().mockResolvedValue([]);
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: mockGetSuggestions,
      } as any);

      renderHook(() => useMobileStories(24));

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(24);
      });
    });

    it("respects limit changes", async () => {
      const mockGetSuggestions = jest.fn().mockResolvedValue([]);
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: mockGetSuggestions,
      } as any);

      const { rerender } = renderHook(
        ({ limit }: { limit: number }) => useMobileStories(limit),
        {
          initialProps: { limit: 10 },
        },
      );

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(10);
      });

      rerender({ limit: 20 });

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledWith(20);
      });
    });
  });

  describe("Effect behavior", () => {
    it("loads on mount", async () => {
      const mockGetSuggestions = jest.fn().mockResolvedValue([]);
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: mockGetSuggestions,
      } as any);

      renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
      });
    });

    it("does not reload when already loaded", async () => {
      const mockStories = [
        { id: "1", username: "user1", avatar: "avatar1.jpg" },
      ];
      const mockGetSuggestions = jest.fn().mockResolvedValue(mockStories);
      mockGetFeedUseCases.mockReturnValue({
        getSuggestions: mockGetSuggestions,
      } as any);

      const { result } = renderHook(() => useMobileStories());

      await waitFor(() => {
        expect(result.current.items).toHaveLength(1);
      });

      expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
    });
  });
});
