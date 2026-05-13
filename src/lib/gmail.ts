import "server-only";
import { google, type gmail_v1 } from "googleapis";
import { auth } from "@/auth";
import {
  FOLDERS,
  type Folder,
  type MessageDetail,
  type MessageSummary,
} from "./gmail-types";
import {
  isMockMode,
  mockGetMessage,
  mockListMessages,
  mockModify,
} from "./gmail-mock";

export { FOLDERS };
export type { Folder, MessageDetail, MessageSummary };

async function getClient(): Promise<gmail_v1.Gmail> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("UNAUTHENTICATED");
  }
  if (session.error === "RefreshAccessTokenError") {
    throw new Error("UNAUTHENTICATED");
  }
  const oauth = new google.auth.OAuth2();
  oauth.setCredentials({ access_token: session.accessToken });
  return google.gmail({ version: "v1", auth: oauth });
}

function header(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseFrom(raw: string) {
  // "Name <addr@example.com>" or "addr@example.com"
  const match = raw.match(/^(.*?)\s*<(.+?)>\s*$/);
  if (match) return { name: match[1].replace(/"/g, "").trim() || match[2], email: match[2] };
  return { name: raw.trim(), email: raw.trim() };
}

function summarize(msg: gmail_v1.Schema$Message): MessageSummary {
  const headers = msg.payload?.headers ?? [];
  const fromRaw = header(headers, "From");
  const { name, email } = parseFrom(fromRaw);
  const labels = msg.labelIds ?? [];
  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? "",
    from: email,
    fromName: name,
    subject: header(headers, "Subject") || "(no subject)",
    snippet: msg.snippet ?? "",
    date: header(headers, "Date"),
    unread: labels.includes("UNREAD"),
    starred: labels.includes("STARRED"),
  };
}

function decodeBody(data: string | null | undefined): string | null {
  if (!data) return null;
  try {
    return Buffer.from(data, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}

function extractBodies(payload: gmail_v1.Schema$MessagePart | undefined) {
  let html: string | null = null;
  let text: string | null = null;
  function walk(part: gmail_v1.Schema$MessagePart | undefined) {
    if (!part) return;
    const mime = part.mimeType ?? "";
    if (mime === "text/html" && !html) {
      html = decodeBody(part.body?.data);
    } else if (mime === "text/plain" && !text) {
      text = decodeBody(part.body?.data);
    }
    part.parts?.forEach(walk);
  }
  walk(payload);
  return { html, text };
}

export async function listMessages(folder: Folder["id"], max = 25): Promise<MessageSummary[]> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 400));
    return mockListMessages(folder);
  }
  const gmail = await getClient();
  const labelIds = [folder];
  const list = await gmail.users.messages.list({
    userId: "me",
    labelIds,
    maxResults: max,
  });
  const ids = list.data.messages ?? [];
  if (ids.length === 0) return [];
  const details = await Promise.all(
    ids.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      }),
    ),
  );
  return details.map((d) => summarize(d.data));
}

export async function getMessage(id: string): Promise<MessageDetail> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 300));
    const m = mockGetMessage(id);
    if (!m) throw new Error("NOT_FOUND");
    return m;
  }
  const gmail = await getClient();
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });
  const summary = summarize(res.data);
  const { html, text } = extractBodies(res.data.payload);
  const to = header(res.data.payload?.headers, "To");
  return { ...summary, to, bodyHtml: html, bodyText: text };
}

export type ModifyAction =
  | "archive"
  | "star"
  | "unstar"
  | "mark-read"
  | "mark-unread"
  | "trash"
  | "delete"
  | "snooze"
  | "assign"
  | "trello";

export type ModifyPayload = {
  snoozeUntil?: string;
  assignee?: string | null;
};

export async function modifyMessage(
  id: string,
  action: ModifyAction,
  payload?: ModifyPayload,
) {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 150));
    mockModify(id, action, payload);
    return;
  }
  const gmail = await getClient();
  if (action === "trash" || action === "delete") {
    await gmail.users.messages.trash({ userId: "me", id });
    return;
  }
  const addLabelIds: string[] = [];
  const removeLabelIds: string[] = [];
  if (action === "archive") removeLabelIds.push("INBOX");
  if (action === "star") addLabelIds.push("STARRED");
  if (action === "unstar") removeLabelIds.push("STARRED");
  if (action === "mark-read") removeLabelIds.push("UNREAD");
  if (action === "mark-unread") addLabelIds.push("UNREAD");
  if (action === "snooze") {
    // Gmail's first-class snooze API isn't public; emulate with a custom label + archive.
    // The label keeps a record of "JoyMail/Snoozed/<until>" so we can surface it later.
    removeLabelIds.push("INBOX");
    // TODO(server): create/find a JoyMail/Snoozed label and add it here.
  }
  if (action === "assign") {
    // Same pattern: a JoyMail/Assigned/<name> label.
    // TODO(server): ensure the label exists, then add it.
  }
  if (action === "trello") {
    // No Gmail-side change; Trello card creation is a separate side-effect.
    return;
  }
  if (addLabelIds.length === 0 && removeLabelIds.length === 0) return;
  await gmail.users.messages.modify({
    userId: "me",
    id,
    requestBody: { addLabelIds, removeLabelIds },
  });
}
