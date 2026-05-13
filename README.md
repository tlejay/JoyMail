# JoyMail

> A weekend experiment in driving an email inbox with a **PS5 DualSense™ controller**, served as a **PWA** designed to run on an **iPad**.

<p align="center">
  <img src="public/icon-512.png" alt="JoyMail icon" width="120" />
</p>

> [!IMPORTANT]
> **This is a concept demo, not a real product.**
> It exists to explore *how* a controller could feel as an email client on a couch / desk-toy setup, not to replace any mail app you actually use. Most features are sketched in the lightest possible way — just enough to demonstrate the interaction, not the business logic.

---

## Live demo

🌐 **https://joymail-dosx.vercel.app**

The deployed build runs in **mock mode** — no Gmail authentication required. It ships with a synthetic inbox of ~12 emails styled as if you worked on the PlayStation team (PSN reliability postmortems, Insomniac milestone deliveries, DualSense Edge marketing decks, etc.), so the controller mappings have realistic content to act on.

## The idea

What if "reaching inbox zero" felt like clearing a level in a game?

You sit on the sofa with an iPad mounted in landscape, hold a DualSense in your hands, and **the entire inbox is operable from the controller**. Every primary action lives on a single press — no need to open an email to delete, archive, snooze, or hand it off.

The whole thing is intentionally minimal: white background, Noto Sans Thai, an orange brand accent, PlayStation CI button glyphs (✕ ◯ ▢ △) in their canonical colors, and that's it.

## Controller mapping (the heart of the experiment)

All five primary actions happen **in the inbox list** — you do not open the message first.

| Button | Action |
|---|---|
| △ Triangle | Open & read the focused email |
| ✕ Cross | **Delete** (no confirm — meant to feel fast) |
| ▢ Square | **Archive** |
| ◯ Circle | **Snooze** with the *last-used* duration |
| **L2 + ◯** | **Snooze** with a picker (Later today / Tonight / Tomorrow / Weekend / Next week) |
| **L2 + ▢** | **Add to Trello** (concept — no real Trello integration) |

Plus the navigation utilities:

| Button | Action |
|---|---|
| D-Pad ↑↓ / Left stick | Move focus between emails |
| L1 / R1 | Switch folder (Inbox → Starred → Sent) |
| Options | Account menu |
| Touchpad | Open the in-app help overlay |

**Haptic feedback** is fired on success / error using `vibrationActuator.playEffect("dual-rumble", …)`, with `prefers-reduced-motion` respected.

**Keyboard fallback** (for desk development) uses a *letter-of-name* mapping: `X` → ✕, `O` → ◯, `S` → ▢, `T` → △. `Shift` held = L2 modifier.

## What's only a sketch (deliberately)

These were never meant to be "real" — they exist so the controller has something interesting to do.

| Feature | What's there | What a real version would need |
|---|---|---|
| **Gmail OAuth** | Wired with `next-auth` + Google provider + `gmail.readonly`/`gmail.modify` scopes, but bypassed in the deployed mock build | OAuth consent flow, refresh-token rotation under real load, error states |
| **Snooze** | UI + state only — picks a duration, removes from list, stores `lastSnooze` in `localStorage`. No actual snooze service. | Backend job to surface the email again at the chosen time; Gmail has no public snooze API, so a custom label + scheduler is the realistic path |
| **Assign to a teammate** | Hardcoded one-name list ("Benz") with menu UI and an `assignee` field on the message | Real team directory, shared assignment view, notifications |
| **Add to Trello** | Just flips a flag on the message and shows a chip | Trello OAuth + board/list selection + card creation with the email body in the description |
| **Folders** | Static list (Inbox / Starred / Sent) | Real label tree, custom queries, search |
| **Body rendering** | Renders Gmail's HTML through `dangerouslySetInnerHTML` | A proper sanitizer (DOMPurify or similar), CSP, image proxying |

In other words: the **interactions** are the point. Anything underneath them is a placeholder.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with TypeScript
- **Tailwind CSS 4**
- **NextAuth.js v5** beta — Google provider, Gmail scopes, refresh-token rotation
- **googleapis** SDK — strictly server-side (`lib/gmail.ts` imports `server-only`)
- **Gamepad API** with `requestAnimationFrame` polling, pub/sub listeners, and analog-trigger modifiers
- **pnpm**
- Deployed on **Vercel** (Fluid Compute, Node 24 LTS)

## Project layout

```
src/
├── auth.ts                          NextAuth config (Google + Gmail scopes + refresh)
├── app/
│   ├── actions.ts                   Server actions (sign out)
│   ├── api/
│   │   ├── auth/[...nextauth]/      NextAuth handlers
│   │   └── messages/                List + per-message GET / PATCH
│   ├── manifest.ts                  PWA manifest (landscape, standalone)
│   ├── layout.tsx                   Apple PWA meta + Noto Sans Thai
│   ├── page.tsx                     Server gate → InboxApp or /sign-in
│   └── sign-in/page.tsx             Google OAuth entry
├── components/
│   ├── InboxApp.tsx                 Main client app (list + read views, overlays)
│   ├── PSButton.tsx                 PlayStation CI button glyphs
│   ├── HelpOverlay.tsx              In-app cheat sheet
│   ├── ActionOverlays.tsx           Snooze / Assign / Delete-confirm modals
│   └── OnboardingTip.tsx            First-run "press Touchpad" hint
└── lib/
    ├── gamepad/
    │   ├── buttons.ts               PS5 → action mapping + keyboard fallback
    │   ├── GamepadProvider.tsx      RAF polling, modifier tracking, haptic API
    │   └── useFocusList.ts          Up/down focus management
    ├── gmail.ts                     Server-only Gmail client
    ├── gmail-mock.ts                Mock inbox dataset + handlers (used when MOCK_GMAIL=1)
    └── gmail-types.ts               Shared client/server types + snooze helpers
```

## Running locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

### Option A: mock mode (recommended first)

```env
# .env.local
MOCK_GMAIL=1
AUTH_SECRET=anything-non-empty
```

The app skips Google authentication entirely and serves the synthetic Sony PlayStation inbox so you can play with every button mapping immediately. Mock state lives in process memory — restart the dev server to reset.

### Option B: with a real Gmail account

1. Generate an `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
2. Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/):
   - Enable the **Gmail API**
   - OAuth consent screen → External → add yourself as a test user
   - Credentials → OAuth client ID → Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Fill in `.env.local`:
   ```env
   AUTH_SECRET=...
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   # leave MOCK_GMAIL unset (or remove it)
   ```
4. `pnpm dev` → http://localhost:3000 → sign in with the test account.

See [`DEPLOY.md`](./DEPLOY.md) for the Vercel + iPad PWA install walkthrough.

## On the iPad

1. Open the deployed URL in Safari
2. Share → **Add to Home Screen**
3. Launch from the home-screen icon → fullscreen landscape
4. Pair a DualSense via Bluetooth (iPadOS 13+ supports it natively — hold the PS + Create button until the light bar pulses, then add it in *Settings → Bluetooth*)
5. Tap any button on the controller once so Safari activates the Gamepad API

## Status & licence

This repo is a personal sketch. It is published publicly so the *idea* is shareable, not because the code is ready for anyone else's inbox. There is no licence file yet — feel free to read, fork, and adapt the *concept*; please don't ship the code as-is.

---

> Built as a vibe-coding session with **Claude Code** — see [`CLAUDE.md`](./CLAUDE.md) for collaboration notes and conventions.
