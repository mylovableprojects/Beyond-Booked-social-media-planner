import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--navy)" }}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white"
            style={{ background: "var(--accent)", fontFamily: "var(--font-syne)", fontSize: "0.65rem", letterSpacing: "0.02em" }}
          >
            BB
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
            <span style={{ fontFamily: "var(--font-syne)", fontSize: "0.95rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1 }}>
              Beyond Booked
            </span>
            <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, lineHeight: 1 }}>
              The Party Rental Content Engine
            </span>
          </div>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-20">
        <div className="animate-fade-up">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Log in to your account to continue.
          </p>
        </div>

        <form
          action="/api/auth/login"
          method="post"
          className="mt-8 space-y-4 rounded-2xl p-7 animate-fade-up animate-fade-up-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30 focus:border-white/30"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
              Password
            </span>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30 focus:border-white/30"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Log in
          </button>
        </form>

        <p className="mt-5 text-center text-sm animate-fade-up animate-fade-up-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          No account?{" "}
          <Link href="/signup" className="font-medium text-white hover:underline">
            Sign up free
          </Link>
        </p>
      </main>
    </div>
  );
}
