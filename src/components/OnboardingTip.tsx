"use client";

import { useEffect, useState } from "react";
import { PSButton } from "./PSButton";

const STORAGE_KEY = "joymail.onboarding.dismissed.v1";

export function OnboardingTip({ onOpenHelp }: { onOpenHelp: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-neutral-900 text-white rounded-xl shadow-xl px-5 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="text-sm flex items-center gap-2">
        ครั้งแรกกด <PSButton button="touchpad" size="sm" /> ดูวิธีใช้
      </div>
      <button
        type="button"
        onClick={() => {
          dismiss();
          onOpenHelp();
        }}
        className="text-xs bg-white text-neutral-900 px-3 py-1.5 rounded-md hover:bg-[#FFE5D0] transition-colors font-medium"
      >
        เปิดคู่มือเลย
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="text-xs text-neutral-400 hover:text-white transition-colors"
      >
        ไม่ตอนนี้
      </button>
    </div>
  );
}
