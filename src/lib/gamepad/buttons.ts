// PS5 DualSense standard gamepad mapping (Chromium / WebKit)
export const PS5 = {
  CROSS: 0,
  CIRCLE: 1,
  SQUARE: 2,
  TRIANGLE: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  CREATE: 8,
  OPTIONS: 9,
  L3: 10,
  R3: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  PS: 16,
  TOUCHPAD: 17,
} as const;

// Raw button names emitted from gamepad / keyboard.
// L2 and R2 are modifiers — they don't emit on their own; their held state is
// passed alongside whatever button is pressed.
export type GamepadAction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "cross"
  | "circle"
  | "square"
  | "triangle"
  | "l1"
  | "r1"
  | "options"
  | "help";

export type Modifiers = {
  l2: boolean;
  r2: boolean;
};

export const BUTTON_TO_ACTION: Record<number, GamepadAction> = {
  [PS5.DPAD_UP]: "up",
  [PS5.DPAD_DOWN]: "down",
  [PS5.DPAD_LEFT]: "left",
  [PS5.DPAD_RIGHT]: "right",
  [PS5.CROSS]: "cross",
  [PS5.CIRCLE]: "circle",
  [PS5.SQUARE]: "square",
  [PS5.TRIANGLE]: "triangle",
  [PS5.L1]: "l1",
  [PS5.R1]: "r1",
  [PS5.OPTIONS]: "options",
  [PS5.TOUCHPAD]: "help",
};

// Keyboard fallback. Letter-of-name mapping (X=cross / O=circle / S=square / T=triangle)
// plus the conventional Enter / Esc duals for cross/circle.
// Modifiers: hold Shift → L2, hold Ctrl/Cmd → R2.
export const KEY_TO_ACTION: Record<string, GamepadAction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "cross",
  " ": "cross",
  x: "cross",
  X: "cross",
  Escape: "circle",
  Backspace: "circle",
  o: "circle",
  O: "circle",
  s: "square",
  S: "square",
  t: "triangle",
  T: "triangle",
  q: "l1",
  Q: "l1",
  e: "r1",
  E: "r1",
  Tab: "r1",
  "`": "options",
  "?": "help",
  h: "help",
  H: "help",
};
