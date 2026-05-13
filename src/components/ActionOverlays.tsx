"use client";

import { useCallback, useEffect, useState } from "react";
import { useGamepadAction } from "@/lib/gamepad/GamepadProvider";
import { SNOOZE_OPTIONS, snoozeDate, type SnoozeChoice } from "@/lib/gmail-types";
import { PSButton } from "./PSButton";

type BaseProps = {
  onClose: () => void;
};

// (DeleteConfirm kept for historical reasons but no longer wired — delete is now instant.)
export function DeleteConfirm({
  subject,
  onConfirm,
  onClose,
}: BaseProps & { subject: string; onConfirm: () => void }) {
  useGamepadAction(
    useCallback(
      (action) => {
        if (action === "circle") onClose();
        else if (action === "cross") onConfirm();
      },
      [onClose, onConfirm],
    ),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="text-xs uppercase tracking-[0.18em] text-red-500 font-semibold mb-2">
            Delete
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
            ลบอีเมลนี้?
          </h3>
          <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{subject}</p>
        </div>
        <div className="px-6 py-4 bg-neutral-50 flex items-center justify-between gap-4">
          <span className="text-xs text-neutral-500 flex items-center gap-2">
            <PSButton button="circle" size="sm" /> ยกเลิก
          </span>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <PSButton button="cross" size="sm" />
            ลบ
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

export function SnoozeMenu({
  onChoose,
  onClose,
}: BaseProps & { onChoose: (choice: SnoozeChoice) => void }) {
  const [index, setIndex] = useState(0);
  const now = new Date();

  useGamepadAction(
    useCallback(
      (action) => {
        if (action === "circle") onClose();
        else if (action === "up") setIndex((i) => (i - 1 + SNOOZE_OPTIONS.length) % SNOOZE_OPTIONS.length);
        else if (action === "down") setIndex((i) => (i + 1) % SNOOZE_OPTIONS.length);
        else if (action === "cross") onChoose(SNOOZE_OPTIONS[index].id);
      },
      [onClose, onChoose, index],
    ),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="text-xs uppercase tracking-[0.18em] text-[#FF6B00] font-semibold mb-2">
            Snooze
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
            ซ่อนไว้ก่อน ค่อยกลับมาดูเมื่อ…
          </h3>
        </div>
        <ul>
          {SNOOZE_OPTIONS.map((opt, i) => {
            const active = i === index;
            const when = snoozeDate(opt.id, now);
            return (
              <li
                key={opt.id}
                onMouseEnter={() => setIndex(i)}
                onClick={() => onChoose(opt.id)}
                className={[
                  "px-6 py-3 flex items-baseline justify-between gap-4 cursor-pointer border-l-4 transition-colors",
                  active
                    ? "bg-[#FFF6EF] border-[#FF6B00]"
                    : "border-transparent hover:bg-neutral-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-sm",
                    active ? "font-semibold text-neutral-900" : "text-neutral-700",
                  ].join(" ")}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-neutral-400">{opt.describe(now)}</span>
                <span className="hidden">{when.toISOString()}</span>
              </li>
            );
          })}
        </ul>
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-2">
            <PSButton button="dpad-vertical" size="sm" /> เลื่อน
          </span>
          <span className="flex items-center gap-2">
            <PSButton button="cross" size="sm" /> เลือก
            <PSButton button="circle" size="sm" /> ปิด
          </span>
        </div>
      </div>
    </Backdrop>
  );
}

const TEAM = [{ id: "benz", name: "Benz" }];

export function AssignMenu({
  current,
  onChoose,
  onClose,
}: BaseProps & { current: string | null | undefined; onChoose: (assignee: string | null) => void }) {
  const items = [...TEAM, { id: "unassign", name: "เอาออก (Unassign)" }];
  const [index, setIndex] = useState(0);

  useGamepadAction(
    useCallback(
      (action) => {
        if (action === "circle") onClose();
        else if (action === "up") setIndex((i) => (i - 1 + items.length) % items.length);
        else if (action === "down") setIndex((i) => (i + 1) % items.length);
        else if (action === "cross") {
          const pick = items[index];
          onChoose(pick.id === "unassign" ? null : pick.name);
        }
      },
      [onClose, onChoose, index, items],
    ),
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-100">
          <div className="text-xs uppercase tracking-[0.18em] text-emerald-600 font-semibold mb-2">
            Assign
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
            มอบหมายให้ใคร?
          </h3>
          {current && (
            <p className="text-sm text-neutral-500 mt-2">
              ตอนนี้: <span className="text-neutral-800 font-medium">{current}</span>
            </p>
          )}
        </div>
        <ul>
          {items.map((it, i) => {
            const active = i === index;
            const isCurrent = current && it.name === current;
            return (
              <li
                key={it.id}
                onMouseEnter={() => setIndex(i)}
                onClick={() => onChoose(it.id === "unassign" ? null : it.name)}
                className={[
                  "px-6 py-3 flex items-center justify-between gap-4 cursor-pointer border-l-4 transition-colors",
                  active
                    ? "bg-[#FFF6EF] border-[#FF6B00]"
                    : "border-transparent hover:bg-neutral-50",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  {it.id !== "unassign" && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center">
                      {it.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className={[
                      "text-sm",
                      active ? "font-semibold text-neutral-900" : "text-neutral-700",
                    ].join(" ")}
                  >
                    {it.name}
                  </span>
                </div>
                {isCurrent && <span className="text-emerald-600 text-sm">✓</span>}
              </li>
            );
          })}
        </ul>
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-2">
            <PSButton button="dpad-vertical" size="sm" /> เลื่อน
          </span>
          <span className="flex items-center gap-2">
            <PSButton button="cross" size="sm" /> เลือก
            <PSButton button="circle" size="sm" /> ปิด
          </span>
        </div>
      </div>
    </Backdrop>
  );
}

function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 bg-black/40 z-40 flex items-center justify-center p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
