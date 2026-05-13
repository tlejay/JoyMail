import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-12">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            JoyMail
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            อ่านอีเมลด้วยจอย PS5
          </h1>
          <p className="text-neutral-500">
            เชื่อมต่อ Gmail ของคุณเพื่อเริ่มต้น ครั้งแรกเท่านั้น
            หลังจากนั้นใช้จอยคอนโทรลเลอร์ได้เลย
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#FF6B00] px-6 py-4 text-white font-medium shadow-sm hover:bg-[#e85f00] transition-colors"
          >
            เข้าสู่ระบบด้วย Google
          </button>
        </form>
      </div>
    </main>
  );
}
