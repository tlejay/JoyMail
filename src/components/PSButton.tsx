// PlayStation CI button glyphs — Cross / Circle / Square / Triangle in their
// official colors, plus shoulder/d-pad/options pills that share the same visual rhythm.
import type { ReactNode } from "react";

export type PSButtonKey =
  | "cross"
  | "circle"
  | "square"
  | "triangle"
  | "l1"
  | "r1"
  | "l2"
  | "r2"
  | "options"
  | "create"
  | "touchpad"
  | "dpad-up"
  | "dpad-down"
  | "dpad-left"
  | "dpad-right"
  | "dpad-vertical"
  | "dpad-horizontal";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<Size, { box: string; text: string; icon: string }> = {
  sm: { box: "h-6 min-w-6 px-1", text: "text-[11px]", icon: "text-[13px]" },
  md: { box: "h-7 min-w-7 px-1.5", text: "text-xs", icon: "text-base" },
  lg: { box: "h-10 min-w-10 px-2", text: "text-sm", icon: "text-xl" },
};

// PlayStation CI colors
const PS_COLOR = {
  cross: "text-[#2D7BFF]", // blue
  circle: "text-[#FF4747]", // red
  square: "text-[#E84BB8]", // pink
  triangle: "text-[#00BF8F]", // green
};

function GlyphCircle({ children, size }: { children: ReactNode; size: Size }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full bg-white border border-neutral-300 font-semibold shadow-sm",
        SIZE_MAP[size].box,
        SIZE_MAP[size].icon,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Pill({ children, size }: { children: ReactNode; size: Size }) {
  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-md bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200",
        SIZE_MAP[size].box,
        SIZE_MAP[size].text,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function PSButton({ button, size = "md" }: { button: PSButtonKey; size?: Size }) {
  switch (button) {
    case "cross":
      return (
        <GlyphCircle size={size}>
          <span className={PS_COLOR.cross}>✕</span>
        </GlyphCircle>
      );
    case "circle":
      return (
        <GlyphCircle size={size}>
          <span className={PS_COLOR.circle}>◯</span>
        </GlyphCircle>
      );
    case "square":
      return (
        <GlyphCircle size={size}>
          <span className={PS_COLOR.square}>▢</span>
        </GlyphCircle>
      );
    case "triangle":
      return (
        <GlyphCircle size={size}>
          <span className={PS_COLOR.triangle}>△</span>
        </GlyphCircle>
      );
    case "l1":
      return <Pill size={size}>L1</Pill>;
    case "r1":
      return <Pill size={size}>R1</Pill>;
    case "l2":
      return <Pill size={size}>L2</Pill>;
    case "r2":
      return <Pill size={size}>R2</Pill>;
    case "options":
      return <Pill size={size}>Options</Pill>;
    case "create":
      return <Pill size={size}>Create</Pill>;
    case "touchpad":
      return <Pill size={size}>Touchpad</Pill>;
    case "dpad-up":
      return <Pill size={size}>↑</Pill>;
    case "dpad-down":
      return <Pill size={size}>↓</Pill>;
    case "dpad-left":
      return <Pill size={size}>←</Pill>;
    case "dpad-right":
      return <Pill size={size}>→</Pill>;
    case "dpad-vertical":
      return <Pill size={size}>↑↓</Pill>;
    case "dpad-horizontal":
      return <Pill size={size}>←→</Pill>;
  }
}

export function PSButtonGroup({
  buttons,
  size = "md",
}: {
  buttons: PSButtonKey[];
  size?: Size;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {buttons.map((b, i) => (
        <PSButton key={`${b}-${i}`} button={b} size={size} />
      ))}
    </span>
  );
}
