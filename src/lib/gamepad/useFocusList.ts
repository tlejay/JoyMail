"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGamepadAction } from "./GamepadProvider";
import type { GamepadAction, Modifiers } from "./buttons";

type Options = {
  itemCount: number;
  enabled?: boolean;
  onAction?: (action: GamepadAction, modifiers: Modifiers, index: number) => void;
};

export function useFocusList({ itemCount, enabled = true, onAction }: Options) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= itemCount) setIndex(Math.max(0, itemCount - 1));
  }, [index, itemCount]);

  useGamepadAction(
    useCallback(
      (action, mods) => {
        if (action === "down") {
          setIndex((i) => Math.min(itemCount - 1, i + 1));
        } else if (action === "up") {
          setIndex((i) => Math.max(0, i - 1));
        } else {
          onAction?.(action, mods, index);
        }
      },
      [itemCount, onAction, index],
    ),
    enabled,
  );

  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>(
      `[data-focus-index="${index}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [index]);

  return { index, setIndex, containerRef };
}
