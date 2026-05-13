"use client";

import { useCallback, useEffect } from "react";
import { useGamepadAction } from "@/lib/gamepad/GamepadProvider";
import { PSButton, type PSButtonKey } from "./PSButton";

type Row = {
  buttons: PSButtonKey[];
  combo?: PSButtonKey[];
  action: string;
  detail?: string;
};

const LIST_PRIMARY: Row[] = [
  { buttons: ["triangle"], action: "เปิดอ่าน", detail: "เปิดอ่านเนื้อหาเต็ม" },
  { buttons: ["cross"], action: "Delete", detail: "ลบทันที (ไม่ต้อง confirm)" },
  { buttons: ["square"], action: "Archive", detail: "ย้ายออกจาก Inbox" },
  { buttons: ["circle"], action: "Snooze (last)", detail: "ใช้ตัวเลือก snooze ครั้งล่าสุดอัตโนมัติ" },
];

const LIST_COMBO: Row[] = [
  {
    combo: ["l2", "circle"],
    buttons: [],
    action: "Snooze (เลือกเอง)",
    detail: "เปิดเมนูเลือก Later today / Tonight / Tomorrow / Weekend / Next week",
  },
  {
    combo: ["l2", "square"],
    buttons: [],
    action: "Add to Trello",
    detail: "สร้าง Trello card จากอีเมลนี้",
  },
];

const READ_ROWS: Row[] = [
  { buttons: ["circle"], action: "กลับ Inbox" },
  { buttons: ["l1", "r1"], action: "สลับโฟลเดอร์" },
];

const NAV_ROWS: Row[] = [
  { buttons: ["dpad-vertical"], action: "เลื่อนรายการอีเมล", detail: "หรือใช้ Left stick" },
  { buttons: ["l1", "r1"], action: "สลับโฟลเดอร์", detail: "Inbox → Starred → Sent" },
  { buttons: ["options"], action: "เมนู account", detail: "สลับ account / ออกจากระบบ" },
  { buttons: ["touchpad"], action: "เปิดวิธีใช้นี้" },
];

const KEYBOARD_ROWS: { key: string; action: string }[] = [
  { key: "↑ ↓ ← →", action: "D-Pad" },
  { key: "Enter / X", action: "✕ Cross" },
  { key: "Esc / O", action: "◯ Circle" },
  { key: "S", action: "▢ Square" },
  { key: "T", action: "△ Triangle" },
  { key: "Shift (hold)", action: "L2 modifier" },
  { key: "Q / Tab / E", action: "L1 / R1" },
  { key: "? / H", action: "Touchpad (Help)" },
];

export function HelpOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useGamepadAction(
    useCallback(
      (action) => {
        if (action === "circle" || action === "help") onClose();
      },
      [onClose],
    ),
    open,
  );

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto">
        <div className="px-8 py-6 border-b border-neutral-100 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[#FF6B00] font-semibold mb-1">
              How to use
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">JoyMail — Quick Reference</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Pair DualSense กับ iPad ผ่าน Bluetooth แล้วใช้ปุ่มได้ทันที — Action ทั้งหมดอยู่ในรายการ Inbox ไม่ต้องเปิดอ่านก่อน
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            ปิด <PSButton button="touchpad" size="sm" />
          </button>
        </div>

        {/* Inbox primary — 4 single-press actions */}
        <div className="px-8 py-6 bg-gradient-to-b from-[#FFF6EF] to-white">
          <div className="text-xs uppercase tracking-[0.18em] text-[#FF6B00] font-semibold mb-4">
            ในรายการ Inbox — กดที่อีเมลที่ focus อยู่
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {LIST_PRIMARY.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                  {r.buttons.map((b, j) => (
                    <PSButton key={j} button={b} size="lg" />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-neutral-900">{r.action}</div>
                  {r.detail && (
                    <div className="text-xs text-neutral-500 mt-0.5">{r.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Combo actions */}
        <div className="px-8 py-6 bg-neutral-50 border-y border-neutral-100">
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-500 font-semibold mb-4">
            Combo (กดค้าง L2 แล้วกดปุ่มอื่น)
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {LIST_COMBO.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                  {r.combo?.map((b, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <PSButton button={b} size="md" />
                      {j < (r.combo?.length ?? 0) - 1 && <span className="text-neutral-400 font-bold">+</span>}
                    </span>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-900">{r.action}</div>
                  {r.detail && (
                    <div className="text-xs text-neutral-500 mt-0.5">{r.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 divide-x divide-neutral-100">
          <Section title="Navigation (ใช้ได้ทุกหน้า)" rows={NAV_ROWS} />
          <Section title="ในหน้าอ่าน" rows={READ_ROWS} />
        </div>

        <div className="px-8 py-5 bg-neutral-50 border-t border-neutral-100">
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-400 font-semibold mb-3">
            Keyboard fallback (ตอน dev บนคอม)
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
            {KEYBOARD_ROWS.map((r) => (
              <div key={r.key} className="flex items-baseline justify-between gap-3">
                <kbd className="inline-block px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700 text-xs font-mono">
                  {r.key}
                </kbd>
                <span className="text-neutral-500 text-xs flex-1 text-right">{r.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-2">
            ปิดด้วย <PSButton button="touchpad" size="sm" /> หรือ <PSButton button="circle" size="sm" />
          </span>
          <span className="text-neutral-400">PWA · Modern Minimal · DualSense</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="px-8 py-6">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-400 font-semibold mb-4">
        {title}
      </div>
      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
              {r.buttons.map((b, j) => (
                <PSButton key={j} button={b} size="md" />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-neutral-800">{r.action}</div>
              {r.detail && (
                <div className="text-xs text-neutral-400 mt-0.5">{r.detail}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
