import { NextResponse } from "next/server";
import { listMessages, FOLDERS } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const folderParam = url.searchParams.get("folder") ?? "INBOX";
  const folder = FOLDERS.find((f) => f.id === folderParam);
  if (!folder) return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  try {
    const messages = await listMessages(folder.id);
    return NextResponse.json({ messages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg === "UNAUTHENTICATED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
