import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useLongPress } from "@/shared/use-long-press";

describe("useLongPress Hook", () => {
  const defaultOnLongPress = vi.fn();
  const defaultOnPress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial state", () => {
    it("should have isLongPressing as false initially", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 500,
        }),
      );

      expect(result.current.isLongPressing).toBe(false);
    });

    it("should return correct event handlers", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 500,
        }),
      );

      expect(result.current.onMouseDown).toBeDefined();
      expect(result.current.onTouchStart).toBeDefined();
      expect(result.current.onMouseUp).toBeDefined();
      expect(result.current.onMouseLeave).toBeDefined();
      expect(result.current.onTouchEnd).toBeDefined();
    });
  });

  describe("onLongPress callback", () => {
    it("should call onLongPress after delay on mouse down", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 500,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      expect(defaultOnLongPress).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);

      expect(defaultOnLongPress).toHaveBeenCalledTimes(1);
    });

    it("should call onLongPress after delay on touch start", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 500,
        }),
      );

      result.current.onTouchStart({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.TouchEvent);

      expect(defaultOnLongPress).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);

      expect(defaultOnLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("onPress callback", () => {
    it("should call onPress when released before delay", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          onPress: defaultOnPress,
          delay: 500,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      // Release before delay completes
      vi.advanceTimersByTime(200);
      result.current.onMouseUp({
        target: {},
      } as unknown as React.MouseEvent);

      expect(defaultOnPress).toHaveBeenCalledTimes(1);
      expect(defaultOnLongPress).not.toHaveBeenCalled();
    });

    it("should not call onPress when onPress is not provided", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 500,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      // Release before delay completes
      vi.advanceTimersByTime(200);
      result.current.onMouseUp({
        target: {},
      } as unknown as React.MouseEvent);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe("onMouseLeave", () => {
    it("should not trigger callbacks on mouse leave", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          onPress: defaultOnPress,
          delay: 500,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      // Leave before delay completes
      result.current.onMouseLeave(
        {
          target: {},
        } as unknown as React.MouseEvent,
        false,
      );

      expect(defaultOnPress).not.toHaveBeenCalled();
      expect(defaultOnLongPress).not.toHaveBeenCalled();
    });
  });

  describe("delay configuration", () => {
    it("should respect custom delay", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          delay: 1000,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      // Advance only 500ms
      vi.advanceTimersByTime(500);

      expect(defaultOnLongPress).not.toHaveBeenCalled();

      // Advance remaining 500ms
      vi.advanceTimersByTime(500);

      expect(defaultOnLongPress).toHaveBeenCalledTimes(1);
    });

    it("should use 500ms as default delay", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
        }),
      );

      result.current.onMouseDown({
        target: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      } as unknown as React.MouseEvent);

      // Advance 400ms
      vi.advanceTimersByTime(400);

      expect(defaultOnLongPress).not.toHaveBeenCalled();

      // Advance remaining 100ms
      vi.advanceTimersByTime(100);

      expect(defaultOnLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("touch event handling", () => {
    it("should add touchend listener when shouldPreventDefault is true", () => {
      const addEventListener = vi.fn();

      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          shouldPreventDefault: true,
          delay: 500,
        }),
      );

      result.current.onTouchStart({
        target: {
          addEventListener,
          removeEventListener: vi.fn(),
        },
      } as unknown as React.TouchEvent);

      expect(addEventListener).toHaveBeenCalledWith(
        "touchend",
        expect.any(Function),
        { passive: false },
      );
    });
  });

  describe("event handler references", () => {
    it("should expose onPress and onLongPress callbacks", () => {
      const { result } = renderHook(() =>
        useLongPress({
          onLongPress: defaultOnLongPress,
          onPress: defaultOnPress,
          delay: 500,
        }),
      );

      expect(result.current.onPress).toBe(defaultOnPress);
      expect(result.current.onLongPress).toBe(defaultOnLongPress);
    });
  });
});
