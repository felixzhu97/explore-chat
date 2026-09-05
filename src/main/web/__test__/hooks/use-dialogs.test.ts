import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDialogs } from "@/layout/use-dialogs";

describe("useDialogs Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Initial State", () => {
    it("should have all dialogs closed initially", () => {
      const { result } = renderHook(() => useDialogs());

      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should return all callback functions initially", () => {
      const { result } = renderHook(() => useDialogs());

      expect(typeof result.current.handleCreateGroupClick).toBe("function");
      expect(typeof result.current.handleAddFriendClick).toBe("function");
      expect(typeof result.current.handleAdvancedSearchClick).toBe("function");
      expect(typeof result.current.closeCreateGroupDialog).toBe("function");
      expect(typeof result.current.closeAddFriendDialog).toBe("function");
      expect(typeof result.current.closeAdvancedSearchDialog).toBe("function");
    });
  });

  describe("Create Group Dialog", () => {
    it("should open create group dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
    });

    it("should close create group dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(true);

      act(() => {
        result.current.closeCreateGroupDialog();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
    });

    it("should toggle create group dialog open and closed", () => {
      const { result } = renderHook(() => useDialogs());

      expect(result.current.showCreateGroupDialog).toBe(false);

      act(() => {
        result.current.handleCreateGroupClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(true);

      act(() => {
        result.current.closeCreateGroupDialog();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
    });

    it("should not affect other dialogs when opening", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should not affect other dialogs when closing", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
        result.current.handleAddFriendClick();
      });

      act(() => {
        result.current.closeCreateGroupDialog();
      });

      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(true);
    });
  });

  describe("Add Friend Dialog", () => {
    it("should open add friend dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAddFriendClick();
      });

      expect(result.current.showAddFriendDialog).toBe(true);
    });

    it("should close add friend dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAddFriendClick();
      });
      expect(result.current.showAddFriendDialog).toBe(true);

      act(() => {
        result.current.closeAddFriendDialog();
      });
      expect(result.current.showAddFriendDialog).toBe(false);
    });

    it("should toggle add friend dialog open and closed", () => {
      const { result } = renderHook(() => useDialogs());

      expect(result.current.showAddFriendDialog).toBe(false);

      act(() => {
        result.current.handleAddFriendClick();
      });
      expect(result.current.showAddFriendDialog).toBe(true);

      act(() => {
        result.current.closeAddFriendDialog();
      });
      expect(result.current.showAddFriendDialog).toBe(false);
    });

    it("should not affect other dialogs when opening", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAddFriendClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });
  });

  describe("Advanced Search Dialog", () => {
    it("should open advanced search dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAdvancedSearchClick();
      });

      expect(result.current.showAdvancedSearchDialog).toBe(true);
    });

    it("should close advanced search dialog", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAdvancedSearchClick();
      });
      expect(result.current.showAdvancedSearchDialog).toBe(true);

      act(() => {
        result.current.closeAdvancedSearchDialog();
      });
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should toggle advanced search dialog open and closed", () => {
      const { result } = renderHook(() => useDialogs());

      expect(result.current.showAdvancedSearchDialog).toBe(false);

      act(() => {
        result.current.handleAdvancedSearchClick();
      });
      expect(result.current.showAdvancedSearchDialog).toBe(true);

      act(() => {
        result.current.closeAdvancedSearchDialog();
      });
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should not affect other dialogs when opening", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleAdvancedSearchClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(true);
    });
  });

  describe("Multiple Dialogs", () => {
    it("should open multiple dialogs simultaneously", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
        result.current.handleAddFriendClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should open all three dialogs simultaneously", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
        result.current.handleAddFriendClick();
        result.current.handleAdvancedSearchClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(true);
    });

    it("should manage independent dialog states", () => {
      const { result } = renderHook(() => useDialogs());

      // Open first dialog
      act(() => {
        result.current.handleCreateGroupClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);

      // Open second dialog
      act(() => {
        result.current.handleAddFriendClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(false);

      // Close first dialog
      act(() => {
        result.current.closeCreateGroupDialog();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(false);

      // Open third dialog
      act(() => {
        result.current.handleAdvancedSearchClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(true);

      // Close all remaining dialogs
      act(() => {
        result.current.closeAddFriendDialog();
        result.current.closeAdvancedSearchDialog();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should close specific dialog without affecting others", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
        result.current.handleAddFriendClick();
        result.current.handleAdvancedSearchClick();
      });

      act(() => {
        result.current.closeAddFriendDialog();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(true);
    });
  });

  describe("Rapid State Changes", () => {
    it("should handle rapid open/close toggles", () => {
      const { result } = renderHook(() => useDialogs());

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.handleCreateGroupClick();
        });
        expect(result.current.showCreateGroupDialog).toBe(true);

        act(() => {
          result.current.closeCreateGroupDialog();
        });
        expect(result.current.showCreateGroupDialog).toBe(false);
      }
    });

    it("should handle multiple toggles in sequence", () => {
      const { result } = renderHook(() => useDialogs());

      const actions = [
        {
          open: "handleCreateGroupClick",
          close: "closeCreateGroupDialog",
          state: "showCreateGroupDialog",
        },
        {
          open: "handleAddFriendClick",
          close: "closeAddFriendDialog",
          state: "showAddFriendDialog",
        },
        {
          open: "handleAdvancedSearchClick",
          close: "closeAdvancedSearchDialog",
          state: "showAdvancedSearchDialog",
        },
      ];

      actions.forEach((action) => {
        act(() => {
          (result.current as any)[action.open]();
        });
        expect((result.current as any)[action.state]).toBe(true);

        act(() => {
          (result.current as any)[action.close]();
        });
        expect((result.current as any)[action.state]).toBe(false);
      });
    });
  });

  describe("Callback Stability", () => {
    it("should return stable handleCreateGroupClick callback", () => {
      const { result } = renderHook(() => useDialogs());

      const firstCallback = result.current.handleCreateGroupClick;

      // Trigger state changes
      act(() => {
        result.current.handleCreateGroupClick();
      });
      act(() => {
        result.current.closeCreateGroupDialog();
      });
      act(() => {
        result.current.handleAddFriendClick();
      });

      expect(result.current.handleCreateGroupClick).toBe(firstCallback);
    });

    it("should return stable handleAddFriendClick callback", () => {
      const { result } = renderHook(() => useDialogs());

      const firstCallback = result.current.handleAddFriendClick;

      act(() => {
        result.current.handleAddFriendClick();
      });
      act(() => {
        result.current.closeAddFriendDialog();
      });
      act(() => {
        result.current.handleCreateGroupClick();
      });

      expect(result.current.handleAddFriendClick).toBe(firstCallback);
    });

    it("should return stable handleAdvancedSearchClick callback", () => {
      const { result } = renderHook(() => useDialogs());

      const firstCallback = result.current.handleAdvancedSearchClick;

      act(() => {
        result.current.handleAdvancedSearchClick();
      });
      act(() => {
        result.current.closeAdvancedSearchDialog();
      });
      act(() => {
        result.current.handleCreateGroupClick();
      });

      expect(result.current.handleAdvancedSearchClick).toBe(firstCallback);
    });

    it("should return stable close callbacks", () => {
      const { result } = renderHook(() => useDialogs());

      const firstCloseCreateGroup = result.current.closeCreateGroupDialog;
      const firstCloseAddFriend = result.current.closeAddFriendDialog;
      const firstCloseAdvancedSearch = result.current.closeAdvancedSearchDialog;

      act(() => {
        result.current.handleCreateGroupClick();
        result.current.handleAddFriendClick();
        result.current.handleAdvancedSearchClick();
      });

      expect(result.current.closeCreateGroupDialog).toBe(firstCloseCreateGroup);
      expect(result.current.closeAddFriendDialog).toBe(firstCloseAddFriend);
      expect(result.current.closeAdvancedSearchDialog).toBe(
        firstCloseAdvancedSearch,
      );
    });
  });

  describe("Hook Isolation", () => {
    it("should maintain separate state for multiple instances", () => {
      const { result: result1 } = renderHook(() => useDialogs());
      const { result: result2 } = renderHook(() => useDialogs());

      act(() => {
        result1.current.handleCreateGroupClick();
      });

      expect(result1.current.showCreateGroupDialog).toBe(true);
      expect(result2.current.showCreateGroupDialog).toBe(false);

      act(() => {
        result2.current.handleAddFriendClick();
      });

      expect(result1.current.showCreateGroupDialog).toBe(true);
      expect(result2.current.showAddFriendDialog).toBe(true);
    });

    it("should have independent callback functions for each instance", () => {
      const { result: result1 } = renderHook(() => useDialogs());
      const { result: result2 } = renderHook(() => useDialogs());

      // Each instance should have its own callbacks
      act(() => {
        result1.current.handleCreateGroupClick();
        result2.current.handleAddFriendClick();
      });

      expect(result1.current.showCreateGroupDialog).toBe(true);
      expect(result1.current.showAddFriendDialog).toBe(false);
      expect(result2.current.showCreateGroupDialog).toBe(false);
      expect(result2.current.showAddFriendDialog).toBe(true);
    });
  });

  describe("Integration Scenarios", () => {
    it("should support complete dialog workflow", () => {
      const { result } = renderHook(() => useDialogs());

      // Start with all closed
      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);

      // Open create group dialog
      act(() => {
        result.current.handleCreateGroupClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(true);

      // Close and open add friend dialog
      act(() => {
        result.current.closeCreateGroupDialog();
        result.current.handleAddFriendClick();
      });
      expect(result.current.showCreateGroupDialog).toBe(false);
      expect(result.current.showAddFriendDialog).toBe(true);

      // Open advanced search while add friend is open
      act(() => {
        result.current.handleAdvancedSearchClick();
      });
      expect(result.current.showAddFriendDialog).toBe(true);
      expect(result.current.showAdvancedSearchDialog).toBe(true);

      // Close all
      act(() => {
        result.current.closeAddFriendDialog();
        result.current.closeAdvancedSearchDialog();
      });
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(false);
    });

    it("should handle interleaved dialog operations", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.handleCreateGroupClick();
      });

      act(() => {
        result.current.handleAddFriendClick();
        result.current.closeCreateGroupDialog();
      });

      act(() => {
        result.current.closeAddFriendDialog();
        result.current.handleAdvancedSearchClick();
      });

      act(() => {
        result.current.handleCreateGroupClick();
      });

      expect(result.current.showCreateGroupDialog).toBe(true);
      expect(result.current.showAddFriendDialog).toBe(false);
      expect(result.current.showAdvancedSearchDialog).toBe(true);
    });
  });
});
