import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSearch } from "@/search/use-search";
import type { Contact } from "@/shared/types";

describe("useSearch Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have empty search query initially", () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.searchQuery).toBe("");
    });

    it("should have search suggestions hidden initially", () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.showSearchSuggestions).toBe(false);
    });

    it("should have empty recent searches initially", () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.recentSearches).toEqual([]);
    });

    it("should have search input ref", () => {
      const { result } = renderHook(() => useSearch());
      expect(result.current.searchInputRef).toBeDefined();
    });
  });

  describe("handleSearchChange", () => {
    it("should update search query", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleSearchChange("test query");
      });

      expect(result.current.searchQuery).toBe("test query");
    });

    it("should clear search query", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleSearchChange("test");
      });
      expect(result.current.searchQuery).toBe("test");

      act(() => {
        result.current.handleSearchChange("");
      });
      expect(result.current.searchQuery).toBe("");
    });

    it("should handle special characters", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleSearchChange("test @#$%");
      });

      expect(result.current.searchQuery).toBe("test @#$%");
    });
  });

  describe("handleSearchFocus", () => {
    it("should show search suggestions on focus", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleSearchFocus();
      });

      expect(result.current.showSearchSuggestions).toBe(true);
    });
  });

  describe("handleSearchBlur", () => {
    it("should hide search suggestions after blur", () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useSearch());

      // First show suggestions
      act(() => {
        result.current.handleSearchFocus();
      });
      expect(result.current.showSearchSuggestions).toBe(true);

      // Then blur
      act(() => {
        result.current.handleSearchBlur();
      });

      // Advance timer
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(result.current.showSearchSuggestions).toBe(false);
      vi.useRealTimers();
    });
  });

  describe("handleGlobalSearch", () => {
    it("should add query to recent searches", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleGlobalSearch("search term");
      });

      expect(result.current.recentSearches).toContain("search term");
    });

    it("should not add empty query to recent searches", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleGlobalSearch("   ");
      });

      expect(result.current.recentSearches).toEqual([]);
    });

    it("should limit recent searches to 10 items", () => {
      const { result } = renderHook(() => useSearch());

      // Add 15 searches
      for (let i = 0; i < 15; i++) {
        act(() => {
          result.current.handleGlobalSearch(`search ${i}`);
        });
      }

      expect(result.current.recentSearches.length).toBeLessThanOrEqual(10);
    });

    it("should move existing search to top", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleGlobalSearch("search 1");
        result.current.handleGlobalSearch("search 2");
        result.current.handleGlobalSearch("search 1"); // Add again
      });

      expect(result.current.recentSearches[0]).toBe("search 1");
    });
  });

  describe("handleRemoveRecentSearch", () => {
    it("should remove specific search from recent searches", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleGlobalSearch("search 1");
        result.current.handleGlobalSearch("search 2");
      });
      expect(result.current.recentSearches).toContain("search 1");

      act(() => {
        result.current.handleRemoveRecentSearch("search 1");
      });

      expect(result.current.recentSearches).not.toContain("search 1");
      expect(result.current.recentSearches).toContain("search 2");
    });

    it("should handle removing non-existent search", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.handleGlobalSearch("search 1");
      });

      act(() => {
        result.current.handleRemoveRecentSearch("non-existent");
      });

      expect(result.current.recentSearches).toEqual(["search 1"]);
    });
  });

  describe("handleSearchSuggestion", () => {
    const mockContacts: Contact[] = [
      { id: "1", name: "Alice", avatar: "", lastMessage: "", timestamp: "" },
      { id: "2", name: "Bob", avatar: "", lastMessage: "", timestamp: "" },
    ];

    it("should select contact and hide suggestions", () => {
      const { result } = renderHook(() => useSearch());
      const onContactSelect = vi.fn();

      act(() => {
        result.current.handleSearchFocus();
        result.current.handleSearchSuggestion(
          { type: "contact", id: "1" },
          mockContacts,
          onContactSelect,
        );
      });

      expect(onContactSelect).toHaveBeenCalledWith(mockContacts[0]);
      expect(result.current.showSearchSuggestions).toBe(false);
    });

    it("should not call onContactSelect for non-contact suggestion", () => {
      const { result } = renderHook(() => useSearch());
      const onContactSelect = vi.fn();

      act(() => {
        result.current.handleSearchSuggestion(
          { type: "recent" },
          mockContacts,
          onContactSelect,
        );
      });

      expect(onContactSelect).not.toHaveBeenCalled();
    });

    it("should handle non-existent contact", () => {
      const { result } = renderHook(() => useSearch());
      const onContactSelect = vi.fn();

      act(() => {
        result.current.handleSearchSuggestion(
          { type: "contact", id: "non-existent" },
          mockContacts,
          onContactSelect,
        );
      });

      expect(onContactSelect).not.toHaveBeenCalled();
    });
  });

  describe("filterContacts", () => {
    const mockContacts: Contact[] = [
      { id: "1", name: "Alice", avatar: "", lastMessage: "", timestamp: "" },
      { id: "2", name: "Bob", avatar: "", lastMessage: "", timestamp: "" },
      { id: "3", name: "Alicia", avatar: "", lastMessage: "", timestamp: "" },
    ];

    it("should filter contacts by name (case insensitive)", () => {
      const { result } = renderHook(() => useSearch());

      const filtered = result.current.filterContacts(mockContacts, "ali");

      expect(filtered.length).toBe(2);
      expect(filtered.map((c) => c.name)).toContain("Alice");
      expect(filtered.map((c) => c.name)).toContain("Alicia");
    });

    it("should return empty array for no matches", () => {
      const { result } = renderHook(() => useSearch());

      const filtered = result.current.filterContacts(mockContacts, "xyz");

      expect(filtered).toEqual([]);
    });

    it("should return all contacts for empty query", () => {
      const { result } = renderHook(() => useSearch());

      const filtered = result.current.filterContacts(mockContacts, "");

      expect(filtered).toEqual(mockContacts);
    });

    it("should handle case sensitivity", () => {
      const { result } = renderHook(() => useSearch());

      const filtered = result.current.filterContacts(mockContacts, "ALICE");

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe("Alice");
    });
  });

  describe("callback stability", () => {
    it("should return stable callbacks", () => {
      const { result } = renderHook(() => useSearch());

      const firstHandleSearchChange = result.current.handleSearchChange;
      const firstHandleSearchFocus = result.current.handleSearchFocus;
      const firstFilterContacts = result.current.filterContacts;

      // Trigger a state change
      act(() => {
        result.current.handleSearchChange("test");
      });

      expect(result.current.handleSearchChange).toBe(firstHandleSearchChange);
      expect(result.current.handleSearchFocus).toBe(firstHandleSearchFocus);
      expect(result.current.filterContacts).toBe(firstFilterContacts);
    });
  });
});
