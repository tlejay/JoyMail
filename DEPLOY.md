# JoyMail — Setup & Deploy Guide

ขั้นตอนเรียงตามลำดับ ทำตามนี้ตั้งแต่ env เปล่าจนถึง iPad ใช้งานจริง

---

## 1) Local setup

```bash
cd "94 JoyMail"
pnpm install
cp .env.example .env.local
```

### 1.1 สร้าง AUTH_SECRET

```bash
pnpm exec auth secret
```

คำสั่งนี้จะเขียน `AUTH_SECRET=...` ลง `.env.local` ให้อัตโนมัติ ถ้าไม่ — copy ค่าที่มันพิมพ์ออกมาไปใส่เอง

### 1.2 ตั้งค่า Google OAuth (Cloud Console)

1. ไปที่ <https://console.cloud.google.com/>
2. สร้าง project ใหม่ ชื่อ "JoyMail" (หรือใช้ project เดิม)
3. **APIs & Services → Library** → ค้นหา "Gmail API" → **Enable**
4. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `JoyMail`
   - User support email + Developer email: ของ Tle
   - Scopes: เพิ่ม `gmail.readonly` และ `gmail.modify`
   - Test users: เพิ่ม email Tle (`jakapong@digitalmedia.co.th`)
5. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `JoyMail Web`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (สำหรับ dev)
     - `https://joymail.vercel.app/api/auth/callback/google` (สำหรับ prod — ใส่หลัง deploy แล้วได้ domain จริง)
6. Copy **Client ID** กับ **Client secret** มาใส่ใน `.env.local`:

```env
AUTH_GOOGLE_ID=xxxxxxxxxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxx
```

### 1.3 รัน dev server

```bash
pnpm dev
```

เปิด <http://localhost:3000> → กด Sign in → เลือก account → ยืนยันสิทธิ์ Gmail → กลับมาที่ Inbox

---

## 2) Deploy to Vercel

### 2.1 Link project

```bash
pnpm dlx vercel@latest link
```

ตอบคำถาม:
- Set up "94 JoyMail"? → **Y**
- Which scope? → personal / team ที่ใช้กับ madebytle.com
- Link to existing project? → **N** (สร้างใหม่)
- Project name? → `joymail` (หรือชื่ออื่น)
- In which directory is your code located? → `./`

### 2.2 ใส่ env vars บน Vercel

```bash
pnpm dlx vercel@latest env add AUTH_SECRET production
pnpm dlx vercel@latest env add AUTH_GOOGLE_ID production
pnpm dlx vercel@latest env add AUTH_GOOGLE_SECRET production
```

แต่ละคำสั่งจะถามค่า — paste ค่าเดียวกับใน `.env.local`

หรือทำผ่าน Vercel Dashboard: Project → Settings → Environment Variables

> เพิ่ม `AUTH_URL=https://<your-domain>.vercel.app` ด้วย (NextAuth v5 ใช้ตรวจ callback URL ใน production)

### 2.3 Deploy production

```bash
pnpm dlx vercel@latest deploy --prod
```

จะได้ URL เช่น `https://joymail.vercel.app` — copy ไปเพิ่มใน Google Cloud Console → OAuth client → Authorized redirect URIs (ขั้น 1.2 ข้อ 5)

> Next.js 16 ไม่ต้อง config function timeout เอง — Vercel default 300s + Fluid Compute เพียงพอสำหรับ Gmail API calls

---

## 3) iPad PWA install

1. เปิด Safari บน iPad → URL Vercel ที่ deploy ไว้
2. Sign in ด้วย Google account เดียวกับที่ตั้งใน Test users
3. กด Share (□↑) → **Add to Home Screen**
4. ตั้งชื่อ "JoyMail" → Add
5. เปิดจากไอคอนหน้า home → จะเป็น standalone landscape เต็มจอ ไม่มี Safari UI

### Pair DualSense

1. กดปุ่ม **PS + Create** ค้างที่จอย → ไฟกระพริบสีฟ้า
2. iPad: Settings → Bluetooth → เลือก "DualSense Wireless Controller"
3. กลับมาที่ JoyMail → ทดสอบ D-Pad / Cross / L1+R1

---

## Troubleshooting

**`redirect_uri_mismatch`** — URL ใน Google Console ไม่ตรงกับที่ NextAuth ส่งไป เช็คให้ตรงเป๊ะ (รวม `http://` vs `https://`, port, trailing slash)

**Sign in สำเร็จแต่ inbox ว่าง** — เช็ค Gmail API enabled แล้ว + scopes อนุญาตครบ + ดู logs ที่ Vercel → Functions

**Controller ไม่ทำงาน** — Safari บน iPad รองรับ Gamepad API ตั้งแต่ iPadOS 13+; ลองกดปุ่มอะไรก็ได้ที่จอย 1 ครั้งก่อน เพราะ browser activate gamepad หลัง user gesture

**Token หมดอายุ** — `src/auth.ts` มี refresh token rotation แล้ว ถ้ายัง error → sign out แล้ว sign in ใหม่
