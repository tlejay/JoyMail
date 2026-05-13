# JoyMail — CLAUDE.md

> Codename เดิม: "Gmail for DualSense"

PWA สำหรับอ่าน Gmail บน iPad โดยควบคุมด้วยจอย PS5 (DualSense)

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4**
- **NextAuth.js v5** (Google provider — Gmail readonly + modify scopes)
- **googleapis** SDK (server-side only)
- **Gamepad API** + keyboard fallback
- **pnpm**

## Folder Layout

```
src/
├── auth.ts                          NextAuth config (Google + Gmail scopes + refresh)
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      NextAuth handlers
│   │   └── messages/                List + per-message GET/PATCH
│   ├── manifest.ts                  PWA manifest (landscape, standalone)
│   ├── layout.tsx                   Apple PWA meta + Noto Sans Thai
│   ├── page.tsx                     Server gate → InboxApp or /sign-in
│   └── sign-in/page.tsx             Google OAuth entry
├── components/
│   └── InboxApp.tsx                 Main client app (list/read views)
└── lib/
    ├── gamepad/
    │   ├── buttons.ts               PS5 mapping + keyboard fallback
    │   ├── GamepadProvider.tsx      RAF polling + pub/sub
    │   └── useFocusList.ts          Up/down/confirm focus helper
    ├── gmail.ts                     Server-only Gmail client (server-only import)
    └── gmail-types.ts               Shared client/server types (no googleapis)
```

> **Important**: keep `googleapis` out of any client component. `lib/gmail.ts` has `import "server-only"`. Use `lib/gmail-types.ts` for shared types.

## Controller Mapping (PS5 → action)

**5 ปุ่มหลัก (read view):**

| Button | Action | Notes |
|---|---|---|
| ▢ Square | **Delete** | มี confirm dialog |
| D-Pad ← | **Archive** | ย้ายออกจาก Inbox |
| D-Pad ↓ | **Snooze** | Combo: Later today / Tonight / Tomorrow / Weekend / Next week |
| △ Triangle | **Assign to Benz** | Team member assignment |
| ✕ Cross (in read) | **Add to Trello** | Create Trello card |

**ปุ่มเสริม:**

| Button | Action |
|---|---|
| D-Pad ↑↓ / Left stick Y | เลื่อน focus ในรายการ |
| ✕ Cross (in list) | เปิดอ่าน |
| ◯ Circle | กลับ Inbox |
| D-Pad → | Star / Unstar |
| L1 / R1 | สลับโฟลเดอร์ (Inbox → Starred → Sent) |
| Options | เมนู account (sign out / สลับ account) |
| Touchpad | เปิด Help overlay |

**Keyboard fallback** (สำหรับ dev): `↑↓←→` D-Pad · `Enter`/`Space` ✕ · `Esc` ◯ · `D` ▢ · `A` △ · `Q`/`E`/`Tab` L1/R1 · `?`/`H` Touchpad

## Mock Mode

ใส่ `MOCK_GMAIL=1` ใน `.env.local` — bypass Google OAuth ทั้งหมด ใช้ mock data 10 ฉบับ
จาก `src/lib/gmail-mock.ts` (อีเมลจาก May, Ton, Aek, Vercel, Neon ฯลฯ) เพื่อเดโม่ UI ก่อนตั้ง OAuth จริง

State ของ mock เป็น in-memory — restart dev server เพื่อ reset

## Setup

```bash
pnpm install
cp .env.example .env.local
# 1. pnpm exec auth secret → AUTH_SECRET
# 2. Google Cloud Console → enable Gmail API → OAuth client (Web)
#    Authorized redirect: http://localhost:3000/api/auth/callback/google
pnpm dev
```

## iPad PWA Install

1. Deploy → Vercel (`vercel deploy --prod`)
2. เปิด URL ใน Safari บน iPad
3. Share → Add to Home Screen
4. เปิดจากไอคอนหน้า home → fullscreen landscape
5. Bluetooth pair DualSense กับ iPad (iPadOS 13+)

## Conventions

- สื่อสารกับ Tle เป็น **ภาษาไทย**, โค้ดและคอมเมนต์เป็น **อังกฤษ**
- ใช้ `AskUserQuestion` tool เสมอเมื่อต้องให้ Tle เลือก option
- **อย่า import googleapis ใน client component** — typecheck/build จะพังแบบเงียบ ๆ
- Focus state ต้อง**ชัดเจน** (ขอบ + พื้นหลังส้มอ่อน) เพราะไม่มี hover
- ห้ามใช้สี gradient / dark mode ใน POC นี้ — เน้น Modern Minimal สีขาว + accent #FF6B00
