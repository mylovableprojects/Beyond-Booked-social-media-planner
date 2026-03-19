import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--navy)" }}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: "var(--accent)", fontFamily: "var(--font-syne)" }}
          >
            PR
          </span>
          <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Party Rental Toolkit
          </span>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 pb-20">
        <div className="animate-fade-up">
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Start your free trial
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            One free run — no credit card, no commitment. See exactly what your posts will look like.
          </p>
        </div>

        <form
          action="/api/auth/signup"
          method="post"
          className="mt-8 space-y-4 rounded-2xl p-7 animate-fade-up animate-fade-up-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {/* First + Last name — side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                First name
              </span>
              <input
                type="text"
                name="first_name"
                required
                autoComplete="given-name"
                className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                placeholder="Jane"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                Last name
              </span>
              <input
                type="text"
                name="last_name"
                required
                autoComplete="family-name"
                className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                placeholder="Smith"
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
              Business name
            </span>
            <input
              type="text"
              name="business_name"
              required
              autoComplete="organization"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              placeholder="Windy City Jump Rentals"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              placeholder="you@yourbusiness.com"
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
              autoComplete="new-password"
              className="w-full rounded-xl border px-4 py-3 text-sm text-white outline-none transition-colors placeholder:opacity-30"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
              placeholder="Min. 8 characters"
            />
          </label>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", fontFamily: "var(--font-syne)" }}
          >
            Create account &amp; start free trial →
          </button>
        </form>

        <p className="mt-5 text-center text-sm animate-fade-up animate-fade-up-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  );
}
