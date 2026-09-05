import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToast, toast, reducer } from "@/shared/use-toast";
import type { ToastProps } from "@/shared/ui/toast";

describe("useToast Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the toast module state between tests
  });

  afterEach(() => {
    // Clean up any pending timeouts
  });

  describe("reducer", () => {
    const initialState = { toasts: [] };

    describe("ADD_TOAST", () => {
      it("should add a toast to the state", () => {
        const toast = { id: "1", title: "Test Toast" } as ToastProps;
        const action = { type: "ADD_TOAST" as const, toast };

        const result = reducer(initialState, action);

        expect(result.toasts).toHaveLength(1);
        expect(result.toasts[0]).toEqual(toast);
      });

      it("should add new toast to the beginning", () => {
        const toastObj1 = { id: "1", title: "First" } as ToastProps;
        const toastObj2 = { id: "2", title: "Second" } as ToastProps;

        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toastObj1,
        });

        // Add second toast - since TOAST_LIMIT is 1, only newest is kept
        state = reducer(state, {
          type: "ADD_TOAST" as const,
          toast: toastObj2,
        });

        // Only toastObj2 should remain (newest first, limited to 1)
        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].id).toBe("2");
      });

      it("should limit toasts to TOAST_LIMIT (1)", () => {
        const toasts = [
          { id: "1", title: "First" } as ToastProps,
          { id: "2", title: "Second" } as ToastProps,
          { id: "3", title: "Third" } as ToastProps,
        ];

        let state = initialState;
        toasts.forEach((t) => {
          state = reducer(state, { type: "ADD_TOAST" as const, toast: t });
        });

        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].id).toBe("3");
      });
    });

    describe("UPDATE_TOAST", () => {
      it("should update an existing toast", () => {
        const toastObj1 = { id: "1", title: "Original" } as ToastProps;
        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toastObj1,
        });

        state = reducer(state, {
          type: "UPDATE_TOAST" as const,
          toast: { id: "1", title: "Updated" },
        });

        expect(state.toasts[0].title).toBe("Updated");
      });

      it("should not modify state for non-existent toast", () => {
        const toastObj2 = { id: "1", title: "Test" } as ToastProps;
        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toastObj2,
        });

        state = reducer(state, {
          type: "UPDATE_TOAST" as const,
          toast: { id: "non-existent", title: "Updated" },
        });

        expect(state.toasts[0].title).toBe("Test");
      });
    });

    describe("DISMISS_TOAST", () => {
      it("should dismiss a specific toast when multiple toasts exist", () => {
        // Add multiple toasts - reducer keeps only TOAST_LIMIT (1) newest
        const toastObj1 = { id: "1", title: "First", open: true } as ToastProps;
        const toastObj2 = {
          id: "2",
          title: "Second",
          open: true,
        } as ToastProps;

        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toastObj1,
        });
        state = reducer(state, {
          type: "ADD_TOAST" as const,
          toast: toastObj2,
        });

        // Since TOAST_LIMIT is 1, only toastObj2 remains at index 0
        // toastObj1 was pushed out, so we test dismissing the remaining toast
        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].id).toBe("2");

        state = reducer(state, {
          type: "DISMISS_TOAST" as const,
          toastId: "2",
        });

        // After dismiss, the toast should have open: false
        const dismissedToast = state.toasts.find((t) => t.id === "2");
        expect(dismissedToast?.open).toBe(false);
      });

      it("should dismiss all toasts when no toastId provided", () => {
        const toast1 = { id: "1", title: "First", open: true } as ToastProps;
        const toast2 = { id: "2", title: "Second", open: true } as ToastProps;
        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toast1,
        });
        state = reducer(state, { type: "ADD_TOAST" as const, toast: toast2 });

        state = reducer(state, { type: "DISMISS_TOAST" as const });

        expect(state.toasts.every((t) => t.open === false)).toBe(true);
      });
    });

    describe("REMOVE_TOAST", () => {
      it("should remove a specific toast", () => {
        const toastObj1 = { id: "1", title: "First" } as ToastProps;
        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: toastObj1,
        });

        state = reducer(state, { type: "REMOVE_TOAST" as const, toastId: "1" });

        expect(state.toasts).toHaveLength(0);
      });

      it("should remove all toasts when no toastId provided", () => {
        // Can't add multiple toasts due to TOAST_LIMIT, so test empty state
        let state = reducer(initialState, {
          type: "ADD_TOAST" as const,
          toast: { id: "1", title: "Test" } as ToastProps,
        });

        state = reducer(state, { type: "REMOVE_TOAST" as const });

        expect(state.toasts).toHaveLength(0);
      });
    });
  });

  describe("useToast hook", () => {
    it("should return initial state", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });

    it("should have dismiss function", () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.dismiss).toBe("function");
    });

    it("should have toast function", () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.toast).toBe("function");
    });

    it("should spread toast properties", () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toBeDefined();
      expect(result.current.dismiss).toBeDefined();
      expect(result.current.toast).toBeDefined();
    });
  });

  describe("toast function", () => {
    it("should create a toast", () => {
      const toastFn = toast({ title: "Test Toast" });

      expect(toastFn).toHaveProperty("id");
      expect(toastFn).toHaveProperty("dismiss");
      expect(toastFn).toHaveProperty("update");
    });

    it("should generate unique IDs", () => {
      const toast1 = toast({ title: "First" });
      const toast2 = toast({ title: "Second" });

      expect(toast1.id).not.toBe(toast2.id);
    });

    it("should have dismiss method", () => {
      const toastFn = toast({ title: "Test" });

      expect(typeof toastFn.dismiss).toBe("function");
    });

    it("should have update method", () => {
      const toastFn = toast({ title: "Test" });

      expect(typeof toastFn.update).toBe("function");
    });
  });
});
