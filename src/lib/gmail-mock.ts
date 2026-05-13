import type { Folder, MessageDetail, MessageSummary } from "./gmail-types";

const NOW = Date.now();
const minsAgo = (m: number) => new Date(NOW - m * 60_000).toUTCString();
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toUTCString();
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toUTCString();

// Tle works at Sony Interactive Entertainment (PlayStation) — Tokyo-based hybrid role.
const INBOX: MessageSummary[] = [
  {
    id: "m1",
    threadId: "t1",
    from: "hiroshi.tanaka@sony.com",
    fromName: "Hiroshi Tanaka (PlayStation Studios JP)",
    subject: "Re: Black Myth: Wukong — APAC launch coordination",
    snippet:
      "Tle-san, marketing collateral พร้อมแล้ว ส่งให้ทีม Singapore เช็คก่อน 18 พ.ค. ด้วยนะครับ ตอนนี้รอ legal sign-off จาก SF",
    date: minsAgo(25),
    unread: true,
    starred: true,
  },
  {
    id: "m2",
    threadId: "t2",
    from: "marketing-emea@sie.sony.com",
    fromName: "Sarah Whitmore (Marketing EMEA)",
    subject: "DualSense Edge — Q3 campaign creative review (deck attached)",
    snippet:
      "Hi team — please review the v3 deck before tomorrow's call. Hero shots are now updated with Astro Bot 2 footage. Need sign-off on the Thai market localisation by EoD Thursday.",
    date: minsAgo(58),
    unread: true,
    starred: false,
  },
  {
    id: "m3",
    threadId: "t3",
    from: "psn-incidents@sie.sony.com",
    fromName: "PSN Reliability",
    subject: "[P1] PSN sign-in latency spike — postmortem draft",
    snippet:
      "Incident #2026-0089: 6-min elevated latency on /auth at 02:14 UTC. Root cause: stale cert rotation. Postmortem doc attached — please sign off by Friday.",
    date: hoursAgo(2),
    unread: true,
    starred: false,
  },
  {
    id: "m4",
    threadId: "t4",
    from: "ryan.cooper@insomniacgames.com",
    fromName: "Ryan Cooper (Insomniac Games)",
    subject: "Marvel's Spider-Man 3 — milestone delivery (build 0.87.2)",
    snippet:
      "Build is up on the publisher portal. Highlights: new traversal animation, NYC weather system pass 2, 14 P1 bugs closed. QA sign-off form attached.",
    date: hoursAgo(3),
    unread: true,
    starred: true,
  },
  {
    id: "m5",
    threadId: "t5",
    from: "compliance@sie.sony.com",
    fromName: "Naoko Ishii (Compliance & Privacy)",
    subject: "GDPR audit checklist — due Friday 17 May",
    snippet:
      "Reminder: subprocessor list and DPA renewals are due this Friday. JoyMail/Slack/Notion integrations need re-attestation. Form link in the body.",
    date: hoursAgo(5),
    unread: false,
    starred: false,
  },
  {
    id: "m6",
    threadId: "t6",
    from: "hr-jp@sie.sony.com",
    fromName: "Akiko Mori (HR Japan)",
    subject: "Q2 performance review — self-assessment open",
    snippet:
      "Self-assessment form is now open in Workday. Please submit by 31 พ.ค. Reviewers will receive notifications on 1 มิ.ย.",
    date: hoursAgo(7),
    unread: false,
    starred: false,
  },
  {
    id: "m7",
    threadId: "t7",
    from: "exec-comms@sie.sony.com",
    fromName: "Hideaki Nishino (SIE)",
    subject: "All-hands recap + Q4 priorities for PlayStation Network",
    snippet:
      "Thanks to everyone who joined yesterday's town hall. Key takeaways: PS+ growth, indie portfolio, and a 6-week sprint on PSN reliability. Slide deck and Q&A doc inside.",
    date: hoursAgo(11),
    unread: false,
    starred: false,
  },
  {
    id: "m8",
    threadId: "t8",
    from: "noreply@github.com",
    fromName: "GitHub (sie-platform)",
    subject: "[sie-platform/trophy-service] PR #482 ready for your review",
    snippet:
      "yuki-kawamoto requested your review on PR #482: 'Trophy unlock event v2 — gRPC migration'. 14 files changed, +812 / -533. CI green.",
    date: hoursAgo(14),
    unread: false,
    starred: false,
  },
  {
    id: "m9",
    threadId: "t9",
    from: "factory-ops@foxconn.com.tw",
    fromName: "Chen Wei (Foxconn Manufacturing)",
    subject: "Console line C-7 schedule update — week 21",
    snippet:
      "Adjusted production schedule attached. C-7 line maintenance pushed to Sunday night. PS5 Slim build target +4,200 units vs plan.",
    date: hoursAgo(18),
    unread: false,
    starred: false,
  },
  {
    id: "m10",
    threadId: "t10",
    from: "kelly.j@gameinformer.com",
    fromName: "Kelly Johnson (Game Informer)",
    subject: "Interview request — Astro Bot 2 design feature",
    snippet:
      "Hi! We'd love a 45-min sit-down with the Astro Bot 2 design lead for our July cover. Flexible on dates between 27 May – 7 June. Let me know what works.",
    date: daysAgo(1),
    unread: false,
    starred: false,
  },
  {
    id: "m11",
    threadId: "t11",
    from: "facilities-jp@sony.com",
    fromName: "Facilities Tokyo",
    subject: "Office move 20 พ.ค. — your new desk assignment (12F-A23)",
    snippet:
      "Your new desk is 12F-A23 in the PlayStation Studios wing. Movers will handle monitors; please pack personal items in the supplied box before Friday EOD.",
    date: daysAgo(2),
    unread: false,
    starred: false,
  },
  {
    id: "m12",
    threadId: "t12",
    from: "events@tgs.jp",
    fromName: "Tokyo Game Show 2026",
    subject: "TGS 2026 booth design — final approval needed",
    snippet:
      "Final renderings for the PlayStation booth (Hall 4, booth area 4-N01) are attached. Sign-off required by 22 พ.ค. for fabrication slot.",
    date: daysAgo(3),
    unread: false,
    starred: true,
  },
];

const STARRED: MessageSummary[] = INBOX.filter((m) => m.starred);
const SENT: MessageSummary[] = [
  {
    id: "s1",
    threadId: "ts1",
    from: "tle@sony.com",
    fromName: "Tle",
    subject: "Re: Black Myth: Wukong — APAC launch coordination",
    snippet:
      "ทาง Singapore team confirm รับเอกสารแล้วครับ Hiroshi-san ขอ schedule align call บ่ายวันพรุ่งนี้ JP time 14:00 ได้ไหมครับ?",
    date: minsAgo(15),
    unread: false,
    starred: false,
  },
  {
    id: "s2",
    threadId: "ts2",
    from: "tle@sony.com",
    fromName: "Tle",
    subject: "Re: Marvel's Spider-Man 3 milestone delivery",
    snippet:
      "Awesome work Ryan! Pulling the build now. Will route the QA sign-off to Yuki by tomorrow JST. One quick question on the weather LOD…",
    date: hoursAgo(1),
    unread: false,
    starred: false,
  },
];

const FOLDER_MAP: Record<Folder["id"], MessageSummary[]> = {
  INBOX,
  STARRED,
  SENT,
};

const BODIES: Record<string, { html: string | null; text: string }> = {
  m1: {
    html: null,
    text: `Tle-san,

ทีม Game Science ส่งไฟล์ launch collateral version ล่าสุดมาแล้ว (link Drive ด้านล่าง)
เนื้อหา highlight ที่ต้องสนใจ:

1. Hero key art — ปรับ contrast ตาม feedback Singapore
2. Launch trailer (TH/CN dub) — กำลัง mix อยู่ ส่งภายในศุกร์นี้
3. Pre-order pricing TH market — รอ legal sign-off จาก SF (ตาม region 1)

ขอให้ Tle-san เช็คตรง APAC localisation ก่อน 18 พ.ค. หลังจาก Singapore approve แล้ว
ผมจะส่งเข้า approval queue ของ Hideaki-san ทันที

Drive link: drive.sony.internal/wukong-launch-apac-v4
DCS ticket: DCS-8821

ขอบคุณครับ
Hiroshi`,
  },
  m2: {
    html: `<p>Hi team,</p>
<p>Please find the v3 of the <strong>DualSense Edge Q3 campaign deck</strong> attached. Key updates:</p>
<ul>
<li>Hero shots refreshed with <em>Astro Bot 2</em> footage (signed off by the studio)</li>
<li>New "Built for pros, designed for everyone" tagline — A/B test results inside</li>
<li>Media spend allocation now includes <em>Twitch</em> + <em>YouTube Shorts</em> (split 60/40)</li>
</ul>
<p>What we need from each region:</p>
<ol>
<li><strong>Thai market</strong> (Tle): localisation sign-off by EoD Thursday</li>
<li><strong>JP</strong>: Astro spot voiceover lock</li>
<li><strong>EU</strong>: legal review on the "pros" copy line</li>
</ol>
<p>Call tomorrow 09:00 BST / 17:00 JST. Decks in the body of the calendar invite.</p>
<p>Best,<br/>Sarah</p>`,
    text: "see html",
  },
  m3: {
    html: null,
    text: `Incident #2026-0089 — Postmortem draft

Severity: P1
Duration: 6 min 22 s
Affected: PSN sign-in (global)
Detected by: synthetic monitor "psn-auth-edge-sin"

Timeline (UTC):
02:14 — latency p99 jumps from 220ms → 1.8s
02:15 — pager fires for on-call: yuki-kawamoto
02:18 — cert rotation script identified as root cause
02:20 — rollback executed
02:20 — latency normal

Root cause:
Cert rotation cron in psn-auth-edge fleet failed to pre-warm the new TLS context before deactivating the previous one. Connections drained too aggressively.

Action items:
1. Add pre-warm step to rotation script (assigned: @yuki)
2. Increase rotation overlap window 60s → 300s (assigned: @lee)
3. Synthetic check on cert validity per region (assigned: @tle)

Please review & sign-off by Fri 17 May 17:00 JST.

— PSN Reliability`,
  },
  m4: {
    html: null,
    text: `Hey,

Build 0.87.2 is up on the publisher portal:
https://publisher.sie.sony.internal/builds/sm3-0.87.2

Highlights:
- New web-swing traversal animation set (motion: 22 anims, 3 idle add-ons)
- NYC weather system pass 2 — finally got the rain occlusion to play nice with the new GI bake
- 14 P1 bugs closed (full list in JIRA, label "sm3-0.87")
- Performance: 60fps mode steady at 4.2ms GPU on PS5, fidelity mode 8.1ms (within budget)

Known issues for next sprint:
- Wet asphalt reflections flicker on certain camera angles (Insomniac fix in progress)
- Subway loading transition crash (~1 in 300 sessions) — repro steps in JIRA SM3-9281

Please route to QA sign-off — Yuki has been driving the milestone reviews.

Also: any chance we can chat about the weather LOD next week? Want to make sure we're aligned before Slice X freeze.

Cheers,
Ryan`,
  },
  m5: {
    html: null,
    text: `Subject: GDPR audit — checklist due Friday 17 May

Hi all,

Quarterly GDPR audit cycle is here. For PlayStation EMEA + UK operations, please complete:

1. Subprocessor list refresh — confirm all third-party tools handling EU personal data
2. DPA (Data Processing Agreement) renewal status for tools onboarded in Q1
3. Re-attestation for the following tools (used by your team):
   • JoyMail (Gmail integration)
   • Slack Enterprise Grid
   • Notion (PlayStation workspace)
   • Figma (Studios)

Form link: compliance.sie.sony.internal/gdpr-q2-2026/attest
Due: Friday 17 May 17:00 CET

If any tool is no longer in use, please mark it as "deprecated" rather than skipping.

For questions, reply to this thread or ping #compliance-help on Slack.

Thanks,
Naoko Ishii
Compliance & Privacy, SIE`,
  },
  m6: {
    html: null,
    text: `Hi Tle,

The Q2 self-assessment form is now open in Workday.

Timeline:
- Self-assessment due: 31 พ.ค. (Friday)
- Peer feedback collection: 1 – 7 มิ.ย.
- Manager review: 8 – 14 มิ.ย.
- 1:1 calibration meetings: week of 16 มิ.ย.

The format is the same as Q1: 4 sections (goals, growth, collaboration, leadership), each 200 words max.

Drafts auto-save every 60s. You can revisit and edit anytime before the deadline.

If you'd like a peer-feedback nominee list helper, ping me — I can generate suggestions from your recent project collaborators.

Cheers,
Akiko
HR, SIE Japan`,
  },
  m7: {
    html: null,
    text: `Hi team,

Thanks to the 2,400+ folks who joined yesterday's town hall — record attendance!

Three things stood out for the next quarter:

1. PS+ momentum
Q1 net adds came in 12% above plan. The new mid-tier (Plus Extra) is driving most of the uplift in APAC. Big thanks to the membership team.

2. Indie portfolio
We're doubling down on the indie publishing program. Expect 14 new titles signed in Q4 — Hermen will share the slate next week.

3. PSN reliability sprint
For the next 6 weeks all platform teams will prioritise reliability work over new features. We'll re-baseline OKRs accordingly. Sumeet will reach out to engineering leads with specifics.

Q&A doc with all unanswered questions: corp.sony.com/town-hall-may-26/qa

Recording is up internally (15 min replay): corp.sony.com/town-hall-may-26/replay

Onwards,
Hideaki
SIE Executive Comms`,
  },
  m8: {
    html: null,
    text: `yuki-kawamoto requested your review on:

Pull Request #482 — Trophy unlock event v2 — gRPC migration
Repo: sie-platform/trophy-service
Branch: feat/trophy-v2-grpc → main

Stats:
+812 / -533
14 files changed

CI status: ✓ all checks passed (build, unit, integration, contract)

Description (excerpt):
This PR migrates the trophy-unlock event publishing path from the legacy
REST endpoint to the new gRPC streaming service. Backward compatibility
is maintained via a dual-write shim for the first 30 days.

Please review and approve or request changes by Friday.

— GitHub`,
  },
  m9: {
    html: null,
    text: `Hi Tle-san,

Adjusted production schedule for week 21 attached. Key changes:

- Line C-7 (PS5 Slim main board): preventive maintenance pushed from Wed → Sun overnight
- Net effect: +4,200 units vs original plan
- Burn-in test rack 3 will be offline 22:00 – 06:00 JST Sunday (1 shift)

Inventory positions:
- DRAM (Samsung): on plan
- NAND (Kioxia): -3% vs plan (Kioxia driving recovery)
- Custom APU (TSMC N5): on plan

Quality so far this week:
- Final yield: 99.31% (target 99.20%)
- RMA rate trailing 30d: 0.18% (target <0.30%)

Let me know if you need a deeper dive on any of these.

Best,
Chen Wei
Foxconn Manufacturing Liaison`,
  },
  m10: {
    html: null,
    text: `Hi Tle,

I'm Kelly from Game Informer — we're putting together a cover feature on Astro Bot 2 for our July issue and would love a 45-minute interview with the design lead (we heard great things from your GDC panel).

Possible angles we'd cover:
- Iterative design across the franchise
- Player feedback loops & community involvement
- Designing for the DualSense haptics
- What's next for Team Asobi

Flexible on dates between 27 May – 7 June. Can be remote or in-person if I'm in Tokyo. We'd publish with the studio's blessing on all imagery.

Happy to send a sample question list ahead of time.

Looking forward,
Kelly Johnson
Senior Editor, Game Informer
+1-555-0142`,
  },
};

function fallbackBody(m: MessageSummary): { html: string | null; text: string } {
  return {
    html: null,
    text: `${m.snippet}\n\n(เนื้อหาตัวอย่างสำหรับ mock mode — ในการใช้งานจริงจะเป็นเนื้อหา Gmail ทั้งฉบับ)`,
  };
}

export const MOCK_USER = {
  name: "Tle (PlayStation Studios)",
  email: "tle@sony.com",
};

export function mockListMessages(folder: Folder["id"]): MessageSummary[] {
  return FOLDER_MAP[folder] ?? [];
}

export function mockGetMessage(id: string): MessageDetail | null {
  const all = [...INBOX, ...SENT];
  const summary = all.find((m) => m.id === id);
  if (!summary) return null;
  const body = BODIES[id] ?? fallbackBody(summary);
  return {
    ...summary,
    unread: false,
    to: MOCK_USER.email,
    bodyHtml: body.html,
    bodyText: body.text,
  };
}

type ModifyAction =
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

export function mockModify(
  id: string,
  action: ModifyAction,
  payload?: { snoozeUntil?: string; assignee?: string | null },
) {
  const all = [...INBOX, ...SENT];
  const m = all.find((x) => x.id === id);
  if (!m) return;
  if (action === "star") m.starred = true;
  else if (action === "unstar") m.starred = false;
  else if (action === "mark-read") m.unread = false;
  else if (action === "mark-unread") m.unread = true;
  else if (action === "archive" || action === "trash" || action === "delete" || action === "snooze") {
    if (action === "snooze" && payload?.snoozeUntil) {
      m.snoozedUntil = payload.snoozeUntil;
    }
    const i = INBOX.findIndex((x) => x.id === id);
    if (i >= 0) INBOX.splice(i, 1);
  } else if (action === "assign") {
    m.assignee = payload?.assignee ?? null;
  } else if (action === "trello") {
    m.trelloUrl = `https://trello.com/c/mock-${id}`;
  }
}

export function isMockMode(): boolean {
  return process.env.MOCK_GMAIL === "1";
}
