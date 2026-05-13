import { NextResponse } from "next/server";
import { getMessage, modifyMessage } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const message = await getMessage(id);
    return NextResponse.json({ message });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as {
    action?: string;
    snoozeUntil?: string;
    assignee?: string | null;
  };
  const action = body.action;
  const allowed = [
    "archive",
    "star",
    "unstar",
    "mark-read",
    "mark-unread",
    "trash",
    "delete",
    "snooze",
    "assign",
    "trello",
  ] as const;
  if (!action || !allowed.includes(action as (typeof allowed)[number])) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  try {
    await modifyMessage(id, action as (typeof allowed)[number], {
      snoozeUntil: body.snoozeUntil,
      assignee: body.assignee,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
