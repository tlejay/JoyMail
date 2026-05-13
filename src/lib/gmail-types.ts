export type Folder = {
  id: "INBOX" | "STARRED" | "SENT";
  label: string;
  query?: string;
};

export const FOLDERS: Folder[] = [
  { id: "INBOX", label: "Inbox" },
  { id: "STARRED", label: "Starred" },
  { id: "SENT", label: "Sent" },
];

export type MessageSummary = {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  starred: boolean;
  assignee?: string | null;
  trelloUrl?: string | null;
  snoozedUntil?: string | null;
};

export type MessageDetail = MessageSummary & {
  to: string;
  bodyHtml: string | null;
  bodyText: string | null;
};

export type SnoozeChoice =
  | "later-today"
  | "tonight"
  | "tomorrow"
  | "this-weekend"
  | "next-week";

export const SNOOZE_OPTIONS: { id: SnoozeChoice; label: string; describe: (now: Date) => string }[] = [
  {
    id: "later-today",
    label: "Later today",
    describe: (now) => describeAt(addHours(now, 3)),
  },
  {
    id: "tonight",
    label: "Tonight",
    describe: (now) => describeAt(atToday(now, 18, 0)),
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    describe: (now) => describeAt(atDay(now, 1, 8, 0)),
  },
  {
    id: "this-weekend",
    label: "This weekend",
    describe: (now) => describeAt(nextDayOfWeek(now, 6, 8, 0)),
  },
  {
    id: "next-week",
    label: "Next week",
    describe: (now) => describeAt(nextDayOfWeek(now, 1, 8, 0)),
  },
];

export function snoozeDate(choice: SnoozeChoice, now: Date = new Date()): Date {
  switch (choice) {
    case "later-today":
      return addHours(now, 3);
    case "tonight":
      return atToday(now, 18, 0);
    case "tomorrow":
      return atDay(now, 1, 8, 0);
    case "this-weekend":
      return nextDayOfWeek(now, 6, 8, 0);
    case "next-week":
      return nextDayOfWeek(now, 1, 8, 0);
  }
}

function addHours(d: Date, h: number) {
  return new Date(d.getTime() + h * 3_600_000);
}
function atToday(d: Date, h: number, m: number) {
  const x = new Date(d);
  x.setHours(h, m, 0, 0);
  return x;
}
function atDay(d: Date, deltaDays: number, h: number, m: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + deltaDays);
  x.setHours(h, m, 0, 0);
  return x;
}
function nextDayOfWeek(d: Date, dow: number, h: number, m: number) {
  // dow: 0 Sun .. 6 Sat
  const x = new Date(d);
  const diff = (dow - x.getDay() + 7) % 7 || 7;
  x.setDate(x.getDate() + diff);
  x.setHours(h, m, 0, 0);
  return x;
}
function describeAt(d: Date): string {
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `วันนี้ ${d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
