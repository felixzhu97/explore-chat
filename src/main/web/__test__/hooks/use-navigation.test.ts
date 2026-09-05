import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useNavigation } from "@/layout/use-navigation";

describe("useNavigation Hook", () => {
  describe("initial state", () => {
    it("should return currentPage as chat for root path", () => {
      const { result } = renderHook(() => useNavigation());

      expect(result.current.currentPage).toBe("chat");
    });

    it("should return navigateToPage function", () => {
      const { result } = renderHook(() => useNavigation());

      expect(typeof result.current.navigateToPage).toBe("function");
    });

    it("should return handleProfileClick function", () => {
      const { result } = renderHook(() => useNavigation());

      expect(typeof result.current.handleProfileClick).toBe("function");
    });

    it("should return all navigation handlers", () => {
      const { result } = renderHook(() => useNavigation());

      expect(typeof result.current.handleStatusClick).toBe("function");
      expect(typeof result.current.handleCallsClick).toBe("function");
      expect(typeof result.current.handleStarredClick).toBe("function");
      expect(typeof result.current.handleSettingsClick).toBe("function");
      expect(typeof result.current.handleSearchPageClick).toBe("function");
      expect(typeof result.current.handleReelsClick).toBe("function");
      expect(typeof result.current.handleExploreClick).toBe("function");
      expect(typeof result.current.handleBackToChat).toBe("function");
    });
  });

  describe("navigateToPage", () => {
    it("should have navigateToPage that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.navigateToPage("profile")).not.toThrow();
    });
  });

  describe("handleProfileClick", () => {
    it("should have handleProfileClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleProfileClick()).not.toThrow();
    });
  });

  describe("handleStatusClick", () => {
    it("should have handleStatusClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleStatusClick()).not.toThrow();
    });
  });

  describe("handleCallsClick", () => {
    it("should have handleCallsClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleCallsClick()).not.toThrow();
    });
  });

  describe("handleStarredClick", () => {
    it("should have handleStarredClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleStarredClick()).not.toThrow();
    });
  });

  describe("handleSettingsClick", () => {
    it("should have handleSettingsClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleSettingsClick()).not.toThrow();
    });
  });

  describe("handleSearchPageClick", () => {
    it("should have handleSearchPageClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleSearchPageClick()).not.toThrow();
    });
  });

  describe("handleReelsClick", () => {
    it("should have handleReelsClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleReelsClick()).not.toThrow();
    });
  });

  describe("handleExploreClick", () => {
    it("should have handleExploreClick that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleExploreClick()).not.toThrow();
    });
  });

  describe("handleBackToChat", () => {
    it("should have handleBackToChat that is callable", () => {
      const { result } = renderHook(() => useNavigation());

      expect(() => result.current.handleBackToChat()).not.toThrow();
    });
  });
});
