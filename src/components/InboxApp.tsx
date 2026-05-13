"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { GamepadProvider, useGamepad, useGamepadAction } from "@/lib/gamepad/GamepadProvider";
import { useFocusList } from "@/lib/gamepad/useFocusList";
import {
  FOLDERS,
  snoozeDate,
  type Folder,
  type MessageDetail,
  type MessageSummary,
  type SnoozeChoice,
} from "@/lib/gmail-types";
import type { Modifiers } from "@/lib/gamepad/buttons";
import { signOutAction } from "@/app/actions";
import { PSButton } from "./PSButton";
import { HelpOverlay } from "./HelpOverlay";
import { OnboardingTip } from "./OnboardingTip";
import { SnoozeMenu } from "./ActionOverlays";

type View = "list" | "read";
type Toast = { id: number; tone: "info" | "error" | "success"; text: string };
type Overlay = "snooze-pick" | null;

const LAST_SNOOZE_KEY = "joymail.lastSnooze.v1";
const DEFAULT_SNOOZE: SnoozeChoice = "tomorrow";

export function InboxApp({ userName, userEmail }: { userName: string; userEmail: string }) {
  return (
    <GamepadProvider>
      <InboxAppInner userName={userName} userEmail={userEmail} />
    </GamepadProvider>
  );
}

function InboxAppInner({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [folderIndex, setFolderIndex] = useState(0);
  const folder = FOLDERS[folderIndex];
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [openMessage, setOpenMessage] = useState<MessageDetail | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);
  const [lastSnooze, setLastSnooze] = useState<SnoozeChoice>(DEFAULT_SNOOZE);
  const { connected, rumble } = useGamepad();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LAST_SNOOZE_KEY);
    if (stored) setLastSnooze(stored as SnoozeChoice);
  }, []);

  const anyOverlayOpen = helpOpen || accountMenuOpen || overlay !== null;

  const pushToast = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const refresh = useCallback(
    async (folderId: Folder["id"]) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages?folder=${folderId}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        if (!res.ok) {
          pushToast("error", "โหลดอีเมลไม่สำเร็จ");
          setMessages([]);
          return;
        }
        const data = await res.json();
        setMessages(data.messages ?? []);
      } catch {
        pushToast("error", "เชื่อมต่อไม่ได้");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [pushToast],
  );

  useEffect(() => {
    refresh(folder.id);
  }, [folder.id, refresh]);

  const openMessageById = useCallback(
    async (id: string) => {
      setLoadingMessage(true);
      setView("read");
      rumble("confirm");
      try {
        const res = await fetch(`/api/messages/${id}`, { cache: "no-store" });
        if (res.status === 401) {
          window.location.href = "/sign-in";
          return;
        }
        if (!res.ok) {
          pushToast("error", "เปิดอีเมลไม่สำเร็จ");
          setView("list");
          return;
        }
        const data = await res.json();
        setOpenMessage(data.message);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, unread: false } : m)),
        );
        fetch(`/api/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark-read" }),
        }).catch(() => {});
      } finally {
        setLoadingMessage(false);
      }
    },
    [rumble, pushToast],
  );

  const closeMessage = useCallback(() => {
    setView("list");
    setOpenMessage(null);
    rumble("tick");
  }, [rumble]);

  const switchFolder = useCallback(
    (delta: number) => {
      const next = (folderIndex + delta + FOLDERS.length) % FOLDERS.length;
      setFolderIndex(next);
      rumble("tick");
    },
    [folderIndex, rumble],
  );

  // Optimistic message-level action. Removes from list immediately for archive/delete/snooze.
  const actOnMessage = useCallback(
    async (
      messageId: string,
      action: "delete" | "archive" | "snooze" | "trello",
      extra?: { snoozeUntil?: string; choice?: SnoozeChoice; label?: string },
    ) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      // Optimistic update
      if (action === "delete" || action === "archive" || action === "snooze") {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else if (action === "trello") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, trelloUrl: `https://trello.com/c/mock-${messageId}` }
              : m,
          ),
        );
      }
      try {
        const res = await fetch(`/api/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            snoozeUntil: extra?.snoozeUntil,
          }),
        });
        if (!res.ok) {
          rumble("error");
          pushToast("error", `${extra?.label ?? action} ไม่สำเร็จ`);
          refresh(folder.id);
          return;
        }
        rumble("success");
        const subject = msg.subject.length > 30 ? msg.subject.slice(0, 30) + "…" : msg.subject;
        if (action === "delete") pushToast("success", `ลบแล้ว: ${subject}`);
        else if (action === "archive") pushToast("success", `Archived: ${subject}`);
        else if (action === "snooze") pushToast("success", `Snoozed → ${extra?.label ?? ""}`);
        else if (action === "trello") pushToast("success", `+ Trello: ${subject}`);
        if (extra?.choice) {
          setLastSnooze(extra.choice);
          window.localStorage.setItem(LAST_SNOOZE_KEY, extra.choice);
        }
      } catch {
        rumble("error");
        pushToast("error", "เชื่อมต่อไม่ได้");
        refresh(folder.id);
      }
    },
    [messages, refresh, folder.id, rumble, pushToast],
  );

  // Run a snooze with the last-used choice (or default).
  const snoozeLast = useCallback(
    (messageId: string) => {
      const choice = lastSnooze;
      const until = snoozeDate(choice).toISOString();
      const label = labelForSnooze(choice);
      actOnMessage(messageId, "snooze", { snoozeUntil: until, choice, label: `${label} (last)` });
    },
    [lastSnooze, actOnMessage],
  );

  // Global top-level button handler (folder switching, help, account menu).
  useGamepadAction(
    useCallback(
      (action) => {
        if (anyOverlayOpen) return;
        if (action === "l1") switchFolder(-1);
        else if (action === "r1") switchFolder(1);
        else if (action === "options") setAccountMenuOpen((v) => !v);
        else if (action === "help") setHelpOpen(true);
        else if (view === "read") {
          // In read view: only navigation. ◯ = back.
          if (action === "circle") closeMessage();
        }
      },
      [anyOverlayOpen, switchFolder, view, closeMessage],
    ),
  );

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-white">
      <Sidebar folderIndex={folderIndex} unreadCount={unreadCount} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header
          userName={userName}
          userEmail={userEmail}
          folder={folder}
          connected={connected}
          view={view}
          lastSnooze={lastSnooze}
          onOpenAccount={() => setAccountMenuOpen(true)}
        />
        {view === "list" ? (
          <MessageList
            messages={messages}
            loading={loading}
            disabled={anyOverlayOpen}
            lastSnooze={lastSnooze}
            onOpen={openMessageById}
            onDelete={(id) => actOnMessage(id, "delete")}
            onArchive={(id) => actOnMessage(id, "archive")}
            onSnoozeLast={snoozeLast}
            onSnoozePick={(id) => {
              setSnoozeTarget(id);
              setOverlay("snooze-pick");
            }}
            onTrello={(id) => actOnMessage(id, "trello")}
          />
        ) : (
          <MessageRead message={openMessage} loading={loadingMessage} />
        )}
        <Footer view={view} lastSnooze={lastSnooze} />
        <ToastStack toasts={toasts} />
        {accountMenuOpen && (
          <AccountMenu
            userName={userName}
            userEmail={userEmail}
            onClose={() => setAccountMenuOpen(false)}
          />
        )}
        {overlay === "snooze-pick" && snoozeTarget && (
          <SnoozeMenu
            onClose={() => {
              setOverlay(null);
              setSnoozeTarget(null);
            }}
            onChoose={(choice) => {
              const until = snoozeDate(choice).toISOString();
              const label = labelForSnooze(choice);
              const tgt = snoozeTarget;
              setOverlay(null);
              setSnoozeTarget(null);
              if (tgt) actOnMessage(tgt, "snooze", { snoozeUntil: until, choice, label });
            }}
          />
        )}
        <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
        {!anyOverlayOpen && <OnboardingTip onOpenHelp={() => setHelpOpen(true)} />}
      </main>
    </div>
  );
}

function labelForSnooze(c: SnoozeChoice): string {
  switch (c) {
    case "later-today":
      return "Later today";
    case "tonight":
      return "Tonight";
    case "tomorrow":
      return "Tomorrow";
    case "this-weekend":
      return "This weekend";
    case "next-week":
      return "Next week";
  }
}

function Sidebar({ folderIndex, unreadCount }: { folderIndex: number; unreadCount: number }) {
  return (
    <aside className="w-60 border-r border-neutral-200 p-6 flex flex-col gap-1">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-400 mb-4">
        Folders
      </div>
      {FOLDERS.map((f, i) => {
        const active = i === folderIndex;
        const showBadge = active && f.id === "INBOX" && unreadCount > 0;
        return (
          <div
            key={f.id}
            className={[
              "px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
              active
                ? "bg-[#FFF1E6] text-[#FF6B00] font-medium"
                : "text-neutral-600",
            ].join(" ")}
          >
            <span>{f.label}</span>
            {showBadge && (
              <span className="text-[11px] font-semibold bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        );
      })}
      <div className="mt-auto text-[11px] text-neutral-400 leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5">
          <PSButton button="l1" size="sm" />
          <PSButton button="r1" size="sm" />
          <span>สลับโฟลเดอร์</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PSButton button="options" size="sm" />
          <span>เมนู account</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PSButton button="touchpad" size="sm" />
          <span>วิธีใช้</span>
        </div>
      </div>
    </aside>
  );
}

function Header({
  userName,
  userEmail,
  folder,
  connected,
  view,
  lastSnooze,
  onOpenAccount,
}: {
  userName: string;
  userEmail: string;
  folder: Folder;
  connected: boolean;
  view: View;
  lastSnooze: SnoozeChoice;
  onOpenAccount: () => void;
}) {
  return (
    <div className="h-16 px-8 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold tracking-tight">{folder.label}</h1>
        {view === "read" && (
          <span className="text-xs text-neutral-400">— Reading</span>
        )}
        {view === "list" && (
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            · <PSButton button="circle" size="sm" /> snooze → {labelForSnooze(lastSnooze)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <span
          className={[
            "inline-flex items-center gap-1.5",
            connected ? "text-emerald-600" : "text-neutral-400",
          ].join(" ")}
        >
          <span
            className={[
              "w-1.5 h-1.5 rounded-full",
              connected ? "bg-emerald-500" : "bg-neutral-300",
            ].join(" ")}
          />
          {connected ? "Controller connected" : "Waiting for controller"}
        </span>
        <button
          type="button"
          onClick={onOpenAccount}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
          title={userEmail}
        >
          {userName}
        </button>
      </div>
    </div>
  );
}

type ListHandlers = {
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onSnoozeLast: (id: string) => void;
  onSnoozePick: (id: string) => void;
  onTrello: (id: string) => void;
};

function MessageList({
  messages,
  loading,
  disabled,
  lastSnooze,
  onOpen,
  onDelete,
  onArchive,
  onSnoozeLast,
  onSnoozePick,
  onTrello,
}: ListHandlers & {
  messages: MessageSummary[];
  loading: boolean;
  disabled: boolean;
  lastSnooze: SnoozeChoice;
}) {
  const handleAction = useCallback(
    (action: string, mods: Modifiers, idx: number) => {
      const m = messages[idx];
      if (!m) return;
      if (action === "triangle") onOpen(m.id);
      else if (action === "cross") onDelete(m.id);
      else if (action === "square") {
        if (mods.l2) onTrello(m.id);
        else onArchive(m.id);
      } else if (action === "circle") {
        if (mods.l2) onSnoozePick(m.id);
        else onSnoozeLast(m.id);
      }
    },
    [messages, onOpen, onDelete, onArchive, onSnoozeLast, onSnoozePick, onTrello],
  );

  const { index, containerRef } = useFocusList({
    itemCount: messages.length,
    enabled: !loading && !disabled && messages.length > 0,
    onAction: handleAction,
  });

  if (loading) return <MessageListSkeleton />;
  if (messages.length === 0) return <EmptyState />;

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <ul className="divide-y divide-neutral-100">
        {messages.map((m, i) => (
          <li
            key={m.id}
            data-focus-index={i}
            className={[
              "px-8 py-4 transition-colors border-l-4 cursor-pointer relative group",
              i === index
                ? "bg-[#FFF6EF] border-[#FF6B00]"
                : "border-transparent hover:bg-neutral-50",
            ].join(" ")}
            onClick={() => onOpen(m.id)}
          >
            <div className="flex items-baseline gap-4">
              <div
                className={[
                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                  m.unread ? "bg-[#FF6B00]" : "bg-transparent",
                ].join(" ")}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span
                    className={[
                      "truncate",
                      m.unread ? "font-semibold text-neutral-900" : "text-neutral-700",
                    ].join(" ")}
                  >
                    {m.fromName}
                  </span>
                  <span className="text-xs text-neutral-400 flex-shrink-0">
                    {formatDate(m.date)}
                  </span>
                </div>
                <div
                  className={[
                    "truncate mt-0.5",
                    m.unread ? "text-neutral-900" : "text-neutral-600",
                  ].join(" ")}
                >
                  {m.subject}
                </div>
                <div className="truncate text-sm text-neutral-400 mt-0.5">
                  {m.snippet}
                </div>
                {(m.assignee || m.trelloUrl) && (
                  <div className="flex items-center gap-2 mt-1.5">
                    {m.assignee && <Chip tone="emerald">→ {m.assignee}</Chip>}
                    {m.trelloUrl && <Chip tone="blue">Trello</Chip>}
                  </div>
                )}
              </div>
              {m.starred && (
                <span className="text-[#FF6B00] text-sm" aria-label="starred">
                  ★
                </span>
              )}
            </div>
            {i === index && (
              <div className="mt-3 ml-6 flex items-center gap-3 text-[11px] text-neutral-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <PSButton button="triangle" size="sm" />
                  เปิดอ่าน
                </span>
                <span className="text-neutral-300">·</span>
                <span className="flex items-center gap-1">
                  <PSButton button="cross" size="sm" />
                  Delete
                </span>
                <span className="flex items-center gap-1">
                  <PSButton button="square" size="sm" />
                  Archive
                </span>
                <span className="flex items-center gap-1">
                  <PSButton button="circle" size="sm" />
                  Snooze ({labelForSnooze(lastSnooze)})
                </span>
                <span className="text-neutral-300">·</span>
                <span className="flex items-center gap-1">
                  <PSButton button="l2" size="sm" />+<PSButton button="circle" size="sm" />
                  pick
                </span>
                <span className="flex items-center gap-1">
                  <PSButton button="l2" size="sm" />+<PSButton button="square" size="sm" />
                  Trello
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ tone, children }: { tone: "emerald" | "blue"; children: React.ReactNode }) {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${map[tone]}`}>
      {children}
    </span>
  );
}

function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-hidden">
      <ul className="divide-y divide-neutral-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="px-8 py-4 border-l-4 border-transparent">
            <div className="flex items-baseline gap-4">
              <div className="w-2 h-2 rounded-full mt-2 bg-neutral-100 flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="h-3.5 bg-neutral-100 rounded animate-pulse" style={{ width: `${30 + (i % 4) * 12}%` }} />
                  <div className="h-3 w-12 bg-neutral-100 rounded animate-pulse" />
                </div>
                <div className="h-3.5 bg-neutral-100 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 10}%` }} />
                <div className="h-3 bg-neutral-100 rounded animate-pulse" style={{ width: `${50 + (i % 5) * 8}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-neutral-400">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF1E6] flex items-center justify-center text-2xl">
        📭
      </div>
      <div className="text-sm">ไม่มีอีเมลในโฟลเดอร์นี้</div>
      <div className="text-xs flex items-center gap-1.5">
        <span>กด</span>
        <PSButton button="l1" size="sm" />
        <span>/</span>
        <PSButton button="r1" size="sm" />
        <span>เพื่อเปลี่ยนโฟลเดอร์</span>
      </div>
    </div>
  );
}

function MessageRead({
  message,
  loading,
}: {
  message: MessageDetail | null;
  loading: boolean;
}) {
  if (loading || !message) return <MessageReadSkeleton />;

  return (
    <div className="flex-1 overflow-y-auto">
      <article className="max-w-3xl mx-auto px-10 py-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <h2 className="text-2xl font-semibold tracking-tight leading-tight">
            {message.subject}
          </h2>
          {message.starred && (
            <span className="text-[#FF6B00] text-xl mt-1" aria-label="starred">
              ★
            </span>
          )}
        </div>
        <div className="text-sm text-neutral-500 mb-6 space-y-1">
          <div>
            <span className="text-neutral-400">From: </span>
            <span className="text-neutral-700">{message.fromName}</span>
            <span className="text-neutral-400"> &lt;{message.from}&gt;</span>
          </div>
          {message.to && (
            <div>
              <span className="text-neutral-400">To: </span>
              <span className="text-neutral-700">{message.to}</span>
            </div>
          )}
          <div className="text-neutral-400">{formatDate(message.date)}</div>
        </div>
        {(message.assignee || message.trelloUrl) && (
          <div className="flex items-center gap-2 mb-6">
            {message.assignee && (
              <Chip tone="emerald">มอบให้ {message.assignee}</Chip>
            )}
            {message.trelloUrl && <Chip tone="blue">เพิ่มใน Trello แล้ว</Chip>}
          </div>
        )}
        <MessageBody html={message.bodyHtml} text={message.bodyText} />
      </article>
    </div>
  );
}

function MessageReadSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      <article className="max-w-3xl mx-auto px-10 py-10 space-y-6">
        <div className="h-7 bg-neutral-100 rounded animate-pulse w-2/3" />
        <div className="space-y-2">
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/3" />
          <div className="h-3 bg-neutral-100 rounded animate-pulse w-1/4" />
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-neutral-100 rounded animate-pulse"
              style={{ width: `${70 + (i % 4) * 8}%` }}
            />
          ))}
        </div>
      </article>
    </div>
  );
}

function MessageBody({ html, text }: { html: string | null; text: string | null }) {
  if (html) {
    return (
      <div
        className="prose prose-sm max-w-none text-neutral-800 leading-relaxed [&_a]:text-[#FF6B00]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return (
    <pre className="whitespace-pre-wrap font-sans text-[15px] text-neutral-800 leading-relaxed">
      {text ?? ""}
    </pre>
  );
}

function Footer({ view, lastSnooze }: { view: View; lastSnooze: SnoozeChoice }) {
  if (view === "list") {
    return (
      <div className="h-12 px-6 border-t border-neutral-200 flex items-center gap-4 text-xs text-neutral-500 flex-shrink-0 overflow-x-auto whitespace-nowrap">
        <Hint icon={<PSButton button="triangle" size="sm" />} label="เปิดอ่าน" />
        <Hint icon={<PSButton button="cross" size="sm" />} label="Delete" />
        <Hint icon={<PSButton button="square" size="sm" />} label="Archive" />
        <Hint icon={<PSButton button="circle" size="sm" />} label={`Snooze (${labelForSnooze(lastSnooze)})`} />
        <div className="text-neutral-300">|</div>
        <Hint
          icon={
            <>
              <PSButton button="l2" size="sm" />+<PSButton button="circle" size="sm" />
            </>
          }
          label="Snooze pick"
        />
        <Hint
          icon={
            <>
              <PSButton button="l2" size="sm" />+<PSButton button="square" size="sm" />
            </>
          }
          label="Trello"
        />
        <div className="text-neutral-300">|</div>
        <Hint
          icon={
            <>
              <PSButton button="l1" size="sm" />
              <PSButton button="r1" size="sm" />
            </>
          }
          label="โฟลเดอร์"
        />
        <Hint icon={<PSButton button="touchpad" size="sm" />} label="วิธีใช้" />
      </div>
    );
  }
  return (
    <div className="h-12 px-6 border-t border-neutral-200 flex items-center gap-5 text-xs text-neutral-500 flex-shrink-0">
      <Hint icon={<PSButton button="circle" size="sm" />} label="กลับ Inbox" />
      <Hint
        icon={
          <>
            <PSButton button="l1" size="sm" />
            <PSButton button="r1" size="sm" />
          </>
        }
        label="โฟลเดอร์"
      />
      <Hint icon={<PSButton button="touchpad" size="sm" />} label="วิธีใช้" />
    </div>
  );
}

function Hint({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="flex items-center gap-0.5">{icon}</span>
      {label}
    </span>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "px-4 py-2 rounded-lg text-sm shadow-md border max-w-md",
            t.tone === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : t.tone === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-neutral-50 border-neutral-200 text-neutral-700",
          ].join(" ")}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

function AccountMenu({
  userName,
  userEmail,
  onClose,
}: {
  userName: string;
  userEmail: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useGamepadAction(
    useCallback(
      (action) => {
        if (action === "circle" || action === "options") onClose();
      },
      [onClose],
    ),
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [onClose]);

  return (
    <div className="absolute inset-0 bg-black/20 z-30 flex items-start justify-end p-8">
      <div
        ref={ref}
        className="w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Signed in as
          </div>
          <div className="text-sm font-medium text-neutral-900 truncate">{userName}</div>
          <div className="text-xs text-neutral-500 truncate">{userEmail}</div>
        </div>
        <form
          action={() => {
            startTransition(async () => {
              await signOutAction();
            });
          }}
        >
          <button
            type="submit"
            disabled={pending}
            className="w-full text-left px-5 py-3 text-sm text-neutral-700 hover:bg-[#FFF1E6] hover:text-[#FF6B00] transition-colors disabled:opacity-50"
          >
            {pending ? "กำลังออก…" : "สลับ account / ออกจากระบบ"}
          </button>
        </form>
        <div className="px-5 py-3 text-[11px] text-neutral-400 border-t border-neutral-100 leading-relaxed flex items-center gap-1.5">
          ปิดด้วย <PSButton button="circle" size="sm" /> หรือ <PSButton button="options" size="sm" />
        </div>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  const now = new Date();
  const diffMins = (now.getTime() - d.getTime()) / 60000;
  if (diffMins < 60) return `${Math.max(1, Math.round(diffMins))} นาทีที่แล้ว`;
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
