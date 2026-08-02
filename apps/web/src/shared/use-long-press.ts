"use client";

import type React from "react";

import { useCallback, useRef, useState } from "react";

interface UseLongPressOptions {
  onLongPress: (...args: any[]) => void;
  onPress?: (...args: any[]) => void;
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress({
  onLongPress,
  onPress,
  delay = 500,
  shouldPreventDefault = true,
}: UseLongPressOptions) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }

      timeout.current = setTimeout(() => {
        onLongPress();
        setIsLongPressing(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault],
  );

  const clear = useCallback(
    (
      event?: React.MouseEvent | React.TouchEvent,
      shouldTriggerClick = true,
    ) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !isLongPressing && onPress) {
        onPress();
      }

      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }

      setIsLongPressing(false);
    },
    [shouldPreventDefault, onPress, isLongPressing],
  );

  const preventDefault = (event: Event) => {
    const touchEvent = event as unknown as TouchEvent;
    // 只处理触摸事件
    if (!touchEvent || !("touches" in touchEvent)) return;
    if (
      touchEvent.touches &&
      touchEvent.touches.length < 2 &&
      event.preventDefault
    ) {
      event.preventDefault();
    }
  };

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    isLongPressing,
    // 暴露原始回调，便于需要手动触发的场景
    onPress,
    onLongPress,
  };
}
