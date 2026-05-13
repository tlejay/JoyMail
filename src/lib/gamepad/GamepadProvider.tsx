"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BUTTON_TO_ACTION,
  KEY_TO_ACTION,
  PS5,
  type GamepadAction,
  type Modifiers,
} from "./buttons";

type Listener = (action: GamepadAction, modifiers: Modifiers) => void;

export type HapticPattern = "tick" | "confirm" | "success" | "error";

type GamepadContextValue = {
  connected: boolean;
  subscribe: (listener: Listener) => () => void;
  rumble: (pattern: HapticPattern) => void;
};

const GamepadContext = createContext<GamepadContextValue | null>(null);

const STICK_DEADZONE = 0.5;
const TRIGGER_HOLD_THRESHOLD = 0.3;
const INITIAL_REPEAT_DELAY_MS = 350;
const REPEAT_INTERVAL_MS = 110;

const HAPTIC_PRESETS: Record<HapticPattern, { duration: number; strong: number; weak: number }> = {
  tick: { duration: 30, strong: 0, weak: 0.35 },
  confirm: { duration: 60, strong: 0.45, weak: 0.6 },
  success: { duration: 110, strong: 0.55, weak: 0.5 },
  error: { duration: 180, strong: 0.8, weak: 0.3 },
};

type RumbleActuator = {
  playEffect: (
    type: string,
    params: { duration: number; strongMagnitude: number; weakMagnitude: number },
  ) => Promise<unknown>;
};

function getActuator(pad: Gamepad): RumbleActuator | null {
  const candidate =
    (pad as unknown as { vibrationActuator?: RumbleActuator }).vibrationActuator ?? null;
  if (candidate && typeof candidate.playEffect === "function") return candidate;
  return null;
}

export function GamepadProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const prevButtonsRef = useRef<boolean[]>([]);
  const modifiersRef = useRef<Modifiers>({ l2: false, r2: false });
  const stickStateRef = useRef<{
    direction: "up" | "down" | "left" | "right" | null;
    startedAt: number;
    lastFiredAt: number;
  }>({ direction: null, startedAt: 0, lastFiredAt: 0 });
  const rafRef = useRef<number | null>(null);
  const activePadIndexRef = useRef<number | null>(null);

  const emit = useCallback((action: GamepadAction) => {
    const mods = { ...modifiersRef.current };
    listenersRef.current.forEach((l) => l(action, mods));
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const rumble = useCallback((pattern: HapticPattern) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const pads = navigator.getGamepads?.() ?? [];
    const idx = activePadIndexRef.current;
    const pad = idx !== null ? pads[idx] : pads.find((p) => p !== null);
    if (!pad) return;
    const actuator = getActuator(pad);
    if (!actuator) return;
    const preset = HAPTIC_PRESETS[pattern];
    void actuator
      .playEffect("dual-rumble", {
        duration: preset.duration,
        strongMagnitude: preset.strong,
        weakMagnitude: preset.weak,
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onConnect(e: GamepadEvent) {
      activePadIndexRef.current = e.gamepad.index;
      setConnected(true);
    }
    function onDisconnect() {
      const pads = navigator.getGamepads?.() ?? [];
      const next = pads.findIndex((p) => p !== null);
      activePadIndexRef.current = next === -1 ? null : next;
      setConnected(next !== -1);
    }
    window.addEventListener("gamepadconnected", onConnect);
    window.addEventListener("gamepaddisconnected", onDisconnect);
    return () => {
      window.removeEventListener("gamepadconnected", onConnect);
      window.removeEventListener("gamepaddisconnected", onDisconnect);
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const action = KEY_TO_ACTION[e.key];
      if (!action) return;
      e.preventDefault();
      const mods: Modifiers = {
        l2: e.shiftKey,
        r2: e.ctrlKey || e.metaKey,
      };
      const prev = { ...modifiersRef.current };
      modifiersRef.current = mods;
      const stash = { ...mods };
      // Use the captured modifier state for this emit only.
      listenersRef.current.forEach((l) => l(action, stash));
      modifiersRef.current = prev;
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function poll() {
      const pads = navigator.getGamepads?.() ?? [];
      const idx = activePadIndexRef.current;
      const pad = idx !== null ? pads[idx] ?? pads.find((p) => p !== null) ?? null : pads.find((p) => p !== null) ?? null;
      if (pad) {
        if (activePadIndexRef.current === null) activePadIndexRef.current = pad.index;

        // Update L2/R2 modifier state (analog trigger — held when value > threshold)
        modifiersRef.current = {
          l2: (pad.buttons[PS5.L2]?.value ?? 0) > TRIGGER_HOLD_THRESHOLD,
          r2: (pad.buttons[PS5.R2]?.value ?? 0) > TRIGGER_HOLD_THRESHOLD,
        };

        const prev = prevButtonsRef.current;
        pad.buttons.forEach((btn, i) => {
          const pressed = btn.pressed;
          const wasPressed = prev[i] ?? false;
          if (pressed && !wasPressed) {
            const action = BUTTON_TO_ACTION[i];
            if (action) emit(action);
          }
          prev[i] = pressed;
        });

        const x = pad.axes[0] ?? 0;
        const y = pad.axes[1] ?? 0;
        let dir: "up" | "down" | "left" | "right" | null = null;
        if (Math.abs(y) > Math.abs(x)) {
          if (y < -STICK_DEADZONE) dir = "up";
          else if (y > STICK_DEADZONE) dir = "down";
        } else {
          if (x < -STICK_DEADZONE) dir = "left";
          else if (x > STICK_DEADZONE) dir = "right";
        }
        const state = stickStateRef.current;
        const now = performance.now();
        if (dir !== state.direction) {
          state.direction = dir;
          state.startedAt = now;
          state.lastFiredAt = 0;
          if (dir) emit(dir);
        } else if (dir) {
          const heldFor = now - state.startedAt;
          const sinceLast = now - state.lastFiredAt;
          if (
            (state.lastFiredAt === 0 && heldFor >= INITIAL_REPEAT_DELAY_MS) ||
            (state.lastFiredAt > 0 && sinceLast >= REPEAT_INTERVAL_MS)
          ) {
            state.lastFiredAt = now;
            emit(dir);
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    }
    rafRef.current = requestAnimationFrame(poll);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [emit]);

  const value = useMemo<GamepadContextValue>(
    () => ({ connected, subscribe, rumble }),
    [connected, subscribe, rumble],
  );

  return (
    <GamepadContext.Provider value={value}>{children}</GamepadContext.Provider>
  );
}

export function useGamepad() {
  const ctx = useContext(GamepadContext);
  if (!ctx) throw new Error("useGamepad must be used inside GamepadProvider");
  return ctx;
}

export function useGamepadAction(
  handler: (action: GamepadAction, modifiers: Modifiers) => void,
  enabled = true,
) {
  const { subscribe } = useGamepad();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    return subscribe((action, mods) => handlerRef.current(action, mods));
  }, [subscribe, enabled]);
}
